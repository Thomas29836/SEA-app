import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey",
  "Content-Type": "application/json",
};

function monthsUntil(deadline: string | null): number {
  if (!deadline) return 12;
  const target = new Date(deadline);
  const today = new Date();
  let months = (target.getFullYear() - today.getFullYear()) * 12 +
               (target.getMonth() - today.getMonth());
  if (target.getDate() > today.getDate()) {
    months += 1;
  }
  return months <= 0 ? 1 : months;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers });
  }

  try {
    const { monthly_budget, pockets } = await req.json();
    if (!monthly_budget || !Array.isArray(pockets)) {
      return new Response(JSON.stringify({ error: "Invalid input" }), {
        status: 400,
        headers,
      });
    }

    let remainingBudget = monthly_budget;
    let issues: string[] = [];

    const sorted = pockets
      .filter((p: any) => p.goal && p.saved < p.goal)
      .sort((a: any, b: any) => (a.priority || 3) - (b.priority || 3));

    const allocation: any[] = [];

    for (const p of sorted) {
      const months = monthsUntil(p.deadline);
      const needed = Math.max(0, (p.goal - p.saved) / months);

      if (needed <= 0) {
        allocation.push({ id: p.id, name: p.name, monthly: 0 });
        continue;
      }

      const allocated = Math.min(remainingBudget, needed);
      allocation.push({
        id: p.id,
        name: p.name,
        monthly: Math.round(allocated * 100) / 100,
      });

      if (allocated < needed) {
        const missing = needed - allocated;
        const extraMonths = Math.ceil((p.goal - p.saved) / Math.max(allocated, 1));

        issues.push(
          `⚠️ ${p.name} : il manque ${missing.toFixed(2)}€/mois. ` +
          `En gardant ce rythme, il te faudra environ ${extraMonths} mois pour atteindre ton objectif.`
        );
      }

      remainingBudget -= allocated;
    }

    if (issues.length === 0) {
      issues.push("✅ Tous les objectifs peuvent être atteints ce mois-ci.");
    }

    return new Response(
      JSON.stringify({
        allocation,
        message: issues.join(" "),
      }),
      { headers }
    );
  } catch (err) {
    console.error("🔥 Erreur ai-distribution locale :", err);
    return new Response(
      JSON.stringify({ error: "Erreur interne", details: String(err) }),
      { status: 500, headers }
    );
  }
});
