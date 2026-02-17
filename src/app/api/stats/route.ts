import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const [sessions, events, products, participants] = await Promise.all([
    prisma.session.findMany({
      include: {
        participant: true,
        purchases: { include: { product: true } },
      },
      orderBy: { session_start: "desc" },
    }),
    prisma.event.findMany({ orderBy: { timestamp: "desc" } }),
    prisma.product.findMany({ orderBy: { id: "asc" } }),
    prisma.participant.findMany({ orderBy: { id: "desc" } }),
  ]);

  const totalSessions = sessions.length;
  const completedSessions = sessions.filter((s) => s.purchases.length > 0);

  // Spending
  const totalRevenue = sessions.reduce((s, sess) => s + sess.total_spent, 0);
  const avgSpend = completedSessions.length > 0
    ? completedSessions.reduce((s, sess) => s + sess.total_spent, 0) / completedSessions.length
    : 0;
  const avgBudget = totalSessions > 0
    ? sessions.reduce((s, sess) => s + sess.budget_set, 0) / totalSessions
    : 0;
  const budgetUtilization = avgBudget > 0 ? (avgSpend / avgBudget) * 100 : 0;

  // Product popularity
  const productCounts: Record<string, { name: string; count: number; revenue: number; category: string }> = {};
  for (const sess of sessions) {
    for (const p of sess.purchases) {
      const name = p.product.name;
      if (!productCounts[name]) productCounts[name] = { name, count: 0, revenue: 0, category: p.product.category };
      productCounts[name].count += p.quantity;
      productCounts[name].revenue += p.total_price;
    }
  }
  const productPopularity = Object.values(productCounts).sort((a, b) => b.count - a.count);
  const mostPopular = productPopularity[0]?.name || "N/A";

  // Category revenue
  const categoryRevenue: Record<string, number> = {};
  const categoryCount: Record<string, number> = {};
  for (const sess of sessions) {
    for (const p of sess.purchases) {
      const cat = p.product.category;
      categoryRevenue[cat] = (categoryRevenue[cat] || 0) + p.total_price;
      categoryCount[cat] = (categoryCount[cat] || 0) + p.quantity;
    }
  }

  // Session durations
  const durations = sessions
    .filter((s) => s.session_end)
    .map((s) => (new Date(s.session_end!).getTime() - new Date(s.session_start).getTime()) / 1000);
  const avgDuration = durations.length > 0
    ? durations.reduce((a, b) => a + b, 0) / durations.length
    : 0;

  // Budget vs spend distribution
  const spendingDistribution = sessions.map((s) => ({
    name: s.participant?.name || `Session ${s.id}`,
    budget: s.budget_set,
    spent: s.total_spent,
    items: s.items_purchased,
  }));

  // Event analytics — keypad actions
  const keypadEvents = events.filter((e) =>
    e.metadata && (
      e.event_type === "category_switch" ||
      e.event_type === "product_view" ||
      e.event_type === "purchase_confirm" ||
      e.event_type === "hesitation" ||
      e.event_type === "cart_abandon"
    )
  );

  const invalidCodes = keypadEvents.filter((e) => {
    try {
      const m = JSON.parse(e.metadata || "{}");
      return m.action === "invalid_code";
    } catch { return false; }
  }).length;

  const cancellations = keypadEvents.filter((e) => e.event_type === "cart_abandon").length;
  const totalPurchases = events.filter((e) => e.event_type === "purchase_confirm").length;

  // Demographics
  const ageDistribution: Record<string, number> = {};
  const genderDistribution: Record<string, number> = {};
  const allergyDistribution: Record<string, number> = {};
  for (const p of participants) {
    ageDistribution[p.age_range] = (ageDistribution[p.age_range] || 0) + 1;
    genderDistribution[p.gender] = (genderDistribution[p.gender] || 0) + 1;
    const allergies = JSON.parse(p.allergies) as string[];
    for (const a of allergies) {
      allergyDistribution[a] = (allergyDistribution[a] || 0) + 1;
    }
  }

  // Recent sessions (last 20)
  const recentSessions = sessions.slice(0, 20).map((s) => ({
    id: s.id,
    participant: s.participant?.name || "Anonyme",
    budget: s.budget_set,
    spent: s.total_spent,
    items: s.items_purchased,
    date: s.session_start,
    products: s.purchases.map((p) => ({
      name: p.product.name,
      quantity: p.quantity,
      price: p.total_price,
    })),
  }));

  return NextResponse.json({
    overview: {
      totalSessions,
      totalPurchases,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      avgSpend: Math.round(avgSpend * 100) / 100,
      avgBudget: Math.round(avgBudget * 100) / 100,
      budgetUtilization: Math.round(budgetUtilization * 10) / 10,
      mostPopular,
      avgDuration: Math.round(avgDuration),
      invalidCodes,
      cancellations,
      totalParticipants: participants.length,
    },
    productPopularity,
    categoryRevenue: Object.entries(categoryRevenue).map(([name, value]) => ({
      name: name === "meal" ? "Plats" : name === "snack" ? "Snacks" : "Boissons",
      value: Math.round(value * 100) / 100,
      count: categoryCount[name] || 0,
    })),
    spendingDistribution,
    demographics: {
      age: Object.entries(ageDistribution).map(([name, value]) => ({ name, value })),
      gender: Object.entries(genderDistribution).map(([name, value]) => ({ name, value })),
      allergies: Object.entries(allergyDistribution).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value),
    },
    recentSessions,
  });
}
