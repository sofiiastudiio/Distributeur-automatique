import { prisma } from "@/lib/prisma";
import { getTraceabilityForProduct } from "@/data/traceability";
import { notFound } from "next/navigation";

export default async function ProductTracePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const productId = Number(id);
  if (isNaN(productId)) notFound();

  const raw = await prisma.product.findUnique({ where: { id: productId } });
  if (!raw) notFound();

  const allProducts = await prisma.product.findMany({ select: { id: true }, orderBy: { id: "asc" } });
  const allIds = allProducts.map((p) => p.id);

  const product = {
    ...raw,
    nutritional_info: JSON.parse(raw.nutritional_info) as {
      energy_kcal: number; proteins: number; carbs: number; fats: number; fiber: number; salt: number; per: string;
    },
    certifications: JSON.parse(raw.certifications) as string[],
    allergen_free: JSON.parse(raw.allergen_free) as string[],
  };

  const trace = getTraceabilityForProduct(productId, allIds);
  const ni = product.nutritional_info;

  const allergenInfo: Record<string, { label: string; emoji: string }> = {
    gluten: { label: "Gluten", emoji: "🌾" },
    crustaces: { label: "Crustacés", emoji: "🦐" },
    oeufs: { label: "Oeufs", emoji: "🥚" },
    poisson: { label: "Poisson", emoji: "🐟" },
    arachides: { label: "Arachides", emoji: "🥜" },
    soja: { label: "Soja", emoji: "🫘" },
    lait: { label: "Lait", emoji: "🥛" },
    "fruits-a-coque": { label: "Fruits à coque", emoji: "🌰" },
    celeri: { label: "Céleri", emoji: "🥬" },
    moutarde: { label: "Moutarde", emoji: "🟡" },
    sesame: { label: "Sésame", emoji: "🫓" },
    sulfites: { label: "Sulfites", emoji: "🧪" },
    lupin: { label: "Lupin", emoji: "🌸" },
    mollusques: { label: "Mollusques", emoji: "🐚" },
  };

  /* ── Shared section title component ── */
  const SectionTitle = ({ children, color = "teal" }: { children: React.ReactNode; color?: "teal" | "emerald" }) => (
    <h2 className={`mb-5 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.35em] ${color === "emerald" ? "text-emerald-600" : "text-teal-600"}`}>
      <div className={`h-px w-6 ${color === "emerald" ? "bg-emerald-300" : "bg-teal-300"}`} />
      {children}
    </h2>
  );

  return (
    <div className="min-h-dvh bg-[#FAFAF9]">
      {/* Top accent bar */}
      <div className="h-1.5 bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-400" />

      {/* Header — full width on desktop */}
      <div className="px-6 pt-10 pb-6">
        <div className="mx-auto max-w-md lg:max-w-5xl">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-emerald-500">
              <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-teal-600">
              SafeBox &mdash; Fiche produit
            </p>
          </div>
        </div>
      </div>

      {/* Main content — single column mobile, multi-column desktop */}
      <div className="mx-auto max-w-md px-6 lg:max-w-5xl">

        {/* ═══ PRODUCT HEADER ═══ */}
        <div className="lg:flex lg:items-end lg:justify-between lg:gap-8">
          <div className="lg:flex-1">
            <h1 className="text-[2.5rem] font-extralight leading-[1.1] tracking-tight text-stone-900 lg:text-5xl">
              {product.name}
            </h1>
            <p className="mt-4 text-sm font-light leading-relaxed text-stone-500 lg:text-base lg:max-w-xl">
              {product.description}
            </p>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-3 lg:mt-0 lg:shrink-0">
            <span className="rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 px-4 py-1.5 text-sm font-bold text-white">
              CHF {product.price.toFixed(2)}
            </span>
            {product.is_vegan && (
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-emerald-600 ring-1 ring-emerald-200">Végan</span>
            )}
            {product.is_vegetarian && !product.is_vegan && (
              <span className="rounded-full bg-green-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-green-600 ring-1 ring-green-200">Végétarien</span>
            )}
            {product.certifications.map((c) => (
              <span key={c} className="rounded-full bg-teal-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-teal-600 ring-1 ring-teal-200/60">{c}</span>
            ))}
          </div>
        </div>

        <div className="my-10 h-px bg-gradient-to-r from-transparent via-teal-200 to-transparent" />

        {/* ═══ INGREDIENTS — Hero, full width ═══ */}
        <section>
          <SectionTitle>Ingrédients</SectionTitle>
          <p className="text-[1.35rem] font-extralight leading-[1.7] text-stone-800 lg:text-2xl lg:max-w-3xl">
            {product.ingredients}
          </p>
        </section>

        <div className="my-10 h-px bg-gradient-to-r from-transparent via-teal-200 to-transparent" />

        {/* ═══ 2-COLUMN GRID: Allergens + Nutrition ═══ */}
        <div className="lg:grid lg:grid-cols-2 lg:gap-12">
          {/* Allergens */}
          <section>
            <SectionTitle color="emerald">Garanti sans</SectionTitle>
            <div className="grid grid-cols-3 gap-2 lg:grid-cols-4">
              {product.allergen_free.map((a) => (
                <div key={a} className="flex items-center gap-2 rounded-lg bg-emerald-50/70 px-3 py-2.5 ring-1 ring-emerald-100">
                  <span className="text-sm">{allergenInfo[a]?.emoji || "✓"}</span>
                  <p className="text-[11px] font-medium text-emerald-800">{allergenInfo[a]?.label || a}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Nutrition */}
          <section className="mt-10 lg:mt-0">
            <SectionTitle>
              Valeurs nutritionnelles
              <span className="font-normal text-stone-300">par {ni.per}</span>
            </SectionTitle>
            <div className="space-y-0">
              {[
                ["Énergie", `${ni.energy_kcal} kcal`, "from-amber-400 to-orange-400"],
                ["Protéines", `${ni.proteins} g`, "from-red-400 to-rose-400"],
                ["Glucides", `${ni.carbs} g`, "from-amber-300 to-yellow-400"],
                ["Lipides", `${ni.fats} g`, "from-orange-300 to-amber-400"],
                ["Fibres", `${ni.fiber} g`, "from-emerald-400 to-green-400"],
                ["Sel", `${ni.salt} g`, "from-slate-300 to-stone-400"],
              ].map(([label, value, gradient]) => (
                <div key={label} className="flex items-center justify-between border-b border-stone-100 py-3">
                  <div className="flex items-center gap-3">
                    <div className={`h-2 w-2 rounded-full bg-gradient-to-r ${gradient}`} />
                    <span className="text-xs font-light text-stone-500">{label}</span>
                  </div>
                  <span className="text-xs font-medium text-stone-800">{value}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="my-10 h-px bg-gradient-to-r from-transparent via-teal-200 to-transparent" />

        {/* ═══ 2-COLUMN GRID: Origin + Traceability ═══ */}
        <div className="lg:grid lg:grid-cols-2 lg:gap-12">
          {/* Origin */}
          <section>
            <SectionTitle>Origine</SectionTitle>
            <p className="text-sm font-light leading-relaxed text-stone-600">{product.origin_info}</p>
          </section>

          {/* Traceability timeline */}
          {trace && (
            <section className="mt-10 lg:mt-0">
              <SectionTitle>Traçabilité</SectionTitle>
              <div className="space-y-6">
                {[
                  { label: "Fournisseur", main: trace.supplier, sub: trace.supplier_location },
                  { label: "Fabrication", main: trace.facility, sub: trace.facility_address },
                  { label: "Chaîne de température", main: trace.temperature_chain, sub: null },
                ].map((step, i) => (
                  <div key={i} className="flex gap-5">
                    <div className="flex flex-col items-center">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 text-[10px] font-bold text-white">
                        {i + 1}
                      </div>
                      {i < 2 && <div className="mt-1 h-full w-px bg-gradient-to-b from-teal-300 to-transparent" />}
                    </div>
                    <div className="pb-1">
                      <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-teal-500">{step.label}</p>
                      <p className="mt-1 text-sm font-light text-stone-800">{step.main}</p>
                      {step.sub && <p className="mt-0.5 text-xs text-stone-400">{step.sub}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Lot details — full width card */}
        {trace && (
          <>
            <div className="my-10 h-px bg-gradient-to-r from-transparent via-teal-200 to-transparent" />
            <div className="grid grid-cols-2 gap-4 rounded-xl bg-teal-50/60 p-5 ring-1 ring-teal-100 lg:grid-cols-4">
              {[
                ["N° de lot", trace.lot, "text-teal-700"],
                ["Fabrication", trace.fabrication_date, "text-stone-700"],
                ["DLC", trace.dlc, "text-amber-600"],
                ["Conservation", trace.storage, "text-stone-700"],
              ].map(([label, value, color]) => (
                <div key={label}>
                  <p className="text-[9px] font-medium uppercase tracking-[0.3em] text-teal-500">{label}</p>
                  <p className={`mt-1 font-mono text-[11px] font-medium ${color}`}>{value}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Footer */}
        <div className="pb-12 pt-16 text-center">
          <div className="inline-flex items-center gap-2">
            <div className="h-px w-8 bg-gradient-to-r from-transparent to-teal-300" />
            <p className="text-[10px] font-semibold tracking-[0.2em] text-teal-400">
              SAFEBOX
            </p>
            <div className="h-px w-8 bg-gradient-to-l from-transparent to-teal-300" />
          </div>
          <p className="mt-1 text-[9px] tracking-[0.15em] text-stone-300">
            SANS ALLERGÈNES &mdash; 100% SUISSE
          </p>
        </div>
      </div>
    </div>
  );
}
