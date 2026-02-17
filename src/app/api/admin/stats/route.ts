import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const cookieStore = await cookies();
  if (cookieStore.get("admin_auth")?.value !== "true") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sessions = await prisma.session.findMany({
    where: { completed: true },
    include: {
      participant: true,
      purchases: { include: { product: true } },
    },
  });

  const totalSessions = sessions.length;
  const avgSpend = totalSessions > 0
    ? sessions.reduce((s, sess) => s + sess.total_spent, 0) / totalSessions
    : 0;
  const avgBudget = totalSessions > 0
    ? sessions.reduce((s, sess) => s + sess.budget_set, 0) / totalSessions
    : 0;
  const budgetUtilization = avgBudget > 0 ? (avgSpend / avgBudget) * 100 : 0;

  // Most popular product
  const productCounts: Record<string, { name: string; count: number }> = {};
  for (const sess of sessions) {
    for (const p of sess.purchases) {
      const name = p.product.name;
      if (!productCounts[name]) productCounts[name] = { name, count: 0 };
      productCounts[name].count += p.quantity;
    }
  }
  const mostPopular = Object.values(productCounts).sort((a, b) => b.count - a.count)[0]?.name || "N/A";

  // Avg session duration
  const durations = sessions
    .filter((s) => s.session_end)
    .map((s) => new Date(s.session_end!).getTime() - new Date(s.session_start).getTime());
  const avgDuration = durations.length > 0
    ? durations.reduce((a, b) => a + b, 0) / durations.length / 1000
    : 0;

  // Spending distribution
  const spendingDistribution = sessions.map((s) => ({
    spent: s.total_spent,
    budget: s.budget_set,
  }));

  // Product popularity
  const productPopularity = Object.values(productCounts)
    .sort((a, b) => b.count - a.count);

  // Category revenue
  const categoryRevenue: Record<string, number> = {};
  for (const sess of sessions) {
    for (const p of sess.purchases) {
      const cat = p.product.category;
      categoryRevenue[cat] = (categoryRevenue[cat] || 0) + p.total_price;
    }
  }

  // Feedback
  const feedbackRealism = sessions
    .filter((s) => s.feedback_realism != null)
    .map((s) => s.feedback_realism!);
  const avgRealism = feedbackRealism.length > 0
    ? feedbackRealism.reduce((a, b) => a + b, 0) / feedbackRealism.length
    : 0;

  const wouldUseCounts: Record<string, number> = {};
  sessions.forEach((s) => {
    if (s.feedback_would_use) {
      wouldUseCounts[s.feedback_would_use] = (wouldUseCounts[s.feedback_would_use] || 0) + 1;
    }
  });

  return NextResponse.json({
    totalSessions,
    avgSpend: Math.round(avgSpend * 100) / 100,
    avgBudget: Math.round(avgBudget * 100) / 100,
    budgetUtilization: Math.round(budgetUtilization * 10) / 10,
    mostPopular,
    avgDuration: Math.round(avgDuration),
    spendingDistribution,
    productPopularity,
    categoryRevenue: Object.entries(categoryRevenue).map(([name, value]) => ({
      name,
      value: Math.round(value * 100) / 100,
    })),
    avgRealism: Math.round(avgRealism * 10) / 10,
    wouldUseCounts,
  });
}
