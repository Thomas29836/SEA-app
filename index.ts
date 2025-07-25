import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey",
  "Content-Type": "application/json",
};

function monthsUntil(deadline: string | null): number {
  if (!deadline) return 12; // par défaut 12 mois
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

    // Trier par priorité (1 -> 5)
    const sorted = pockets
      .filter((p: any) => p.goal && p.saved < p.goal)
      .sort((a: any, b: any) => (a.priority || 3) - (b.priority || 3));

    const allocation: any[] = [];

    for (const p of sorted) {
      const months = monthsUntil(p.deadline);
      const needed = Math.max(0, (p.goal - p.saved) / months);

      const allocated = Math.min(remainingBudget, needed);
      allocation.push({
        id: p.id,
        name: p.name,
        monthly: Math.round(allocated * 100) / 100,
      });

      remainingBudget -= allocated;
    }

    // Si du budget reste → distribuer équitablement aux autres (facultatif)
    if (remainingBudget > 0) {
      const remainingPockets = allocation.filter(a => a.monthly < 1);
      if (remainingPockets.length > 0) {
        const extra = remainingBudget / remainingPockets.length;
        for (const a of remainingPockets) {
          a.monthly += Math.round(extra * 100) / 100;
        }
      }
    }

    return new Response(
      JSON.stringify({
        allocation,
        message: "Répartition intelligente effectuée avec succès",
      }),
      { headers }
    );
  } catch (err) {
    console.error("Erreur ai-distribution:", err);
    return new Response(
      JSON.stringify({ error: "Erreur interne" }),
      { status: 500, headers }
    );
  }
});
