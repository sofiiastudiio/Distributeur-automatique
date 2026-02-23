import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  if (cookieStore.get("admin_auth")?.value !== "true") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const format = request.nextUrl.searchParams.get("format") || "json";
  const type = request.nextUrl.searchParams.get("type") || "sessions";

  // ── Excel export: full workbook with all data ──
  if (format === "xlsx") {
    return buildXlsxExport(type);
  }

  if (type === "sessions") {
    const sessions = await prisma.session.findMany({
      include: { participant: true, purchases: { include: { product: true } } },
      orderBy: { id: "desc" },
    });

    if (format === "csv") {
      const header = "session_id,participant_name,age_range,gender,budget,spent,items,duration_s,realism,would_use,comment\n";
      const rows = sessions.map((s) => {
        const duration = s.session_end
          ? Math.round((new Date(s.session_end).getTime() - new Date(s.session_start).getTime()) / 1000)
          : "";
        return [
          s.id, s.participant.name || "", s.participant.age_range, s.participant.gender,
          s.budget_set, s.total_spent, s.items_purchased, duration,
          s.feedback_realism || "", s.feedback_would_use || "",
          `"${(s.feedback_comment || "").replace(/"/g, '""')}"`,
        ].join(",");
      }).join("\n");

      return new NextResponse(header + rows, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename=sessions-${Date.now()}.csv`,
        },
      });
    }

    return NextResponse.json(sessions);
  }

  if (type === "events") {
    const events = await prisma.event.findMany({ orderBy: { timestamp: "asc" } });
    if (format === "csv") {
      const header = "id,session_id,event_type,product_id,category,metadata,timestamp\n";
      const rows = events.map((e) =>
        [e.id, e.session_id, e.event_type, e.product_id || "", e.category || "",
          `"${(e.metadata || "").replace(/"/g, '""')}"`, e.timestamp.toISOString()].join(",")
      ).join("\n");
      return new NextResponse(header + rows, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename=events-${Date.now()}.csv`,
        },
      });
    }
    return NextResponse.json(events);
  }

  if (type === "purchases") {
    const purchases = await prisma.purchase.findMany({
      include: { product: true },
      orderBy: { created_at: "asc" },
    });
    if (format === "csv") {
      const header = "id,session_id,product_name,quantity,unit_price,total_price,created_at\n";
      const rows = purchases.map((p) =>
        [p.id, p.session_id, `"${p.product.name}"`, p.quantity, p.unit_price, p.total_price, p.created_at.toISOString()].join(",")
      ).join("\n");
      return new NextResponse(header + rows, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename=purchases-${Date.now()}.csv`,
        },
      });
    }
    return NextResponse.json(purchases);
  }

  return NextResponse.json({ error: "Invalid type" }, { status: 400 });
}

async function buildXlsxExport(type: string): Promise<NextResponse> {
  const wb = XLSX.utils.book_new();

  if (type === "sessions" || type === "all") {
    const sessions = await prisma.session.findMany({
      include: { participant: true, purchases: { include: { product: true } } },
      orderBy: { id: "desc" },
    });

    // Sheet 1 — Sessions
    const sessionRows = sessions.map((s) => ({
      "ID Session": s.id,
      "Nom": s.participant.name || "",
      "Tranche d'âge": s.participant.age_range,
      "Genre": s.participant.gender,
      "Allergies": s.participant.allergies,
      "Distributeur": s.distributor_id,
      "Budget (CHF)": s.budget_set,
      "Dépensé (CHF)": s.total_spent,
      "Articles achetés": s.items_purchased,
      "Durée (s)": s.session_end
        ? Math.round((new Date(s.session_end).getTime() - new Date(s.session_start).getTime()) / 1000)
        : "",
      "Début": new Date(s.session_start).toLocaleString("fr-CH"),
      "Fin": s.session_end ? new Date(s.session_end).toLocaleString("fr-CH") : "",
      "Complétée": s.completed ? "Oui" : "Non",
      "Réalisme (1-5)": s.feedback_realism ?? "",
      "Utiliserait SafeBox": s.feedback_would_use ?? "",
      "Commentaire": s.feedback_comment ?? "",
    }));
    const wsS = XLSX.utils.json_to_sheet(sessionRows);
    wsS["!cols"] = [
      { wch: 10 }, { wch: 18 }, { wch: 12 }, { wch: 14 }, { wch: 30 },
      { wch: 14 }, { wch: 12 }, { wch: 12 }, { wch: 16 }, { wch: 10 },
      { wch: 18 }, { wch: 18 }, { wch: 10 }, { wch: 14 }, { wch: 18 }, { wch: 40 },
    ];
    XLSX.utils.book_append_sheet(wb, wsS, "Sessions");

    // Sheet 2 — Achats par session
    const purchaseRows = sessions.flatMap((s) =>
      s.purchases.map((p) => ({
        "ID Session": s.id,
        "Participant": s.participant.age_range + " / " + s.participant.gender,
        "Produit": p.product.name,
        "Catégorie": p.product.category,
        "Quantité": p.quantity,
        "Prix unitaire (CHF)": p.unit_price,
        "Total (CHF)": p.total_price,
        "Date": new Date(p.created_at).toLocaleString("fr-CH"),
      }))
    );
    const wsP = XLSX.utils.json_to_sheet(purchaseRows);
    wsP["!cols"] = [
      { wch: 10 }, { wch: 20 }, { wch: 30 }, { wch: 12 },
      { wch: 10 }, { wch: 16 }, { wch: 12 }, { wch: 18 },
    ];
    XLSX.utils.book_append_sheet(wb, wsP, "Achats");

    // Sheet 3 — Résumé statistiques
    const completed = sessions.filter((s) => s.completed);
    const totalSessions = completed.length;
    const avgSpend = totalSessions > 0
      ? completed.reduce((a, s) => a + s.total_spent, 0) / totalSessions : 0;
    const avgBudget = totalSessions > 0
      ? completed.reduce((a, s) => a + s.budget_set, 0) / totalSessions : 0;

    // Product counts
    const productCounts: Record<string, number> = {};
    for (const s of completed) {
      for (const p of s.purchases) {
        productCounts[p.product.name] = (productCounts[p.product.name] || 0) + p.quantity;
      }
    }

    const statsRows = [
      { "Indicateur": "Sessions complétées", "Valeur": totalSessions },
      { "Indicateur": "Dépense moyenne (CHF)", "Valeur": Math.round(avgSpend * 100) / 100 },
      { "Indicateur": "Budget moyen (CHF)", "Valeur": Math.round(avgBudget * 100) / 100 },
      { "Indicateur": "Utilisation budget (%)", "Valeur": avgBudget > 0 ? Math.round((avgSpend / avgBudget) * 1000) / 10 : 0 },
      { "Indicateur": "---", "Valeur": "" },
      ...Object.entries(productCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([name, count]) => ({ "Indicateur": `Ventes: ${name}`, "Valeur": count })),
    ];
    const wsSt = XLSX.utils.json_to_sheet(statsRows);
    wsSt["!cols"] = [{ wch: 40 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, wsSt, "Statistiques");

    // Sheet 4 — Feedback
    const feedbackRows = completed
      .filter((s) => s.feedback_realism != null)
      .map((s) => ({
        "ID Session": s.id,
        "Réalisme (1-5)": s.feedback_realism,
        "Utiliserait SafeBox": s.feedback_would_use ?? "",
        "Commentaire": s.feedback_comment ?? "",
      }));
    const wsF = XLSX.utils.json_to_sheet(feedbackRows);
    wsF["!cols"] = [{ wch: 10 }, { wch: 14 }, { wch: 18 }, { wch: 50 }];
    XLSX.utils.book_append_sheet(wb, wsF, "Feedback");
  }

  if (type === "events") {
    const events = await prisma.event.findMany({ orderBy: { timestamp: "asc" } });
    const rows = events.map((e) => ({
      "ID": e.id,
      "Session": e.session_id,
      "Type": e.event_type,
      "Produit ID": e.product_id ?? "",
      "Catégorie": e.category ?? "",
      "Métadonnées": e.metadata ?? "",
      "Timestamp": new Date(e.timestamp).toLocaleString("fr-CH"),
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    ws["!cols"] = [{ wch: 8 }, { wch: 10 }, { wch: 22 }, { wch: 10 }, { wch: 12 }, { wch: 40 }, { wch: 18 }];
    XLSX.utils.book_append_sheet(wb, ws, "Événements");
  }

  if (type === "purchases") {
    const purchases = await prisma.purchase.findMany({
      include: { product: true },
      orderBy: { created_at: "asc" },
    });
    const rows = purchases.map((p) => ({
      "ID": p.id,
      "Session": p.session_id,
      "Produit": p.product.name,
      "Catégorie": p.product.category,
      "Quantité": p.quantity,
      "Prix unitaire (CHF)": p.unit_price,
      "Total (CHF)": p.total_price,
      "Date": new Date(p.created_at).toLocaleString("fr-CH"),
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    ws["!cols"] = [{ wch: 8 }, { wch: 10 }, { wch: 30 }, { wch: 12 }, { wch: 10 }, { wch: 16 }, { wch: 12 }, { wch: 18 }];
    XLSX.utils.book_append_sheet(wb, ws, "Achats");
  }

  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  const filename = `safebox-${type}-${new Date().toISOString().slice(0, 10)}.xlsx`;

  return new NextResponse(buf, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
