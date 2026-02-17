import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  if (cookieStore.get("admin_auth")?.value !== "true") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const format = request.nextUrl.searchParams.get("format") || "json";
  const type = request.nextUrl.searchParams.get("type") || "sessions";

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
