/**
 * Traceability data for each product, indexed by seed order (0–19).
 * Use getTraceabilityForProduct() to look up by actual DB id.
 */

export interface TraceabilityInfo {
  lot: string;
  fabrication_date: string;
  dlc: string;
  storage: string;
  supplier: string;
  supplier_location: string;
  facility: string;
  facility_address: string;
  temperature_chain: string;
}

const data: TraceabilityInfo[] = [
  // === 0: Poulet rôti & riz basmati ===
  {
    lot: "LOT-2026-0217-A01",
    fabrication_date: "15.02.2026",
    dlc: "20.02.2026",
    storage: "Conserver entre 0°C et 4°C. Consommer dans les 24h après ouverture.",
    supplier: "Volailles de la Broye SA",
    supplier_location: "Payerne, Vaud, Suisse",
    facility: "SafeBox Kitchen — Atelier sans allergènes",
    facility_address: "Rue de l'Industrie 12, 1020 Renens, Suisse",
    temperature_chain: "Chaîne du froid maintenue de 2°C à 4°C de la production à la distribution.",
  },
  // === 1: Bowl quinoa & légumes ===
  {
    lot: "LOT-2026-0217-A02",
    fabrication_date: "16.02.2026",
    dlc: "21.02.2026",
    storage: "Conserver entre 0°C et 4°C. Consommer dans les 24h après ouverture.",
    supplier: "Coopérative Bio Romandie",
    supplier_location: "Moudon, Vaud, Suisse",
    facility: "SafeBox Kitchen — Atelier sans allergènes",
    facility_address: "Rue de l'Industrie 12, 1020 Renens, Suisse",
    temperature_chain: "Chaîne du froid maintenue de 2°C à 4°C de la production à la distribution.",
  },
  // === 2: Saumon grillé & purée ===
  {
    lot: "LOT-2026-0217-A03",
    fabrication_date: "15.02.2026",
    dlc: "19.02.2026",
    storage: "Conserver entre 0°C et 4°C. Ne pas recongeler. Consommer rapidement après ouverture.",
    supplier: "Pistor AG — Poissons & Fruits de mer",
    supplier_location: "Rotkreuz, Zoug, Suisse",
    facility: "SafeBox Kitchen — Atelier sans allergènes",
    facility_address: "Rue de l'Industrie 12, 1020 Renens, Suisse",
    temperature_chain: "Transport réfrigéré 0–2°C. Stockage 2–4°C en distributeur.",
  },
  // === 3: Curry thaï au tofu ===
  {
    lot: "LOT-2026-0217-A04",
    fabrication_date: "16.02.2026",
    dlc: "21.02.2026",
    storage: "Conserver entre 0°C et 4°C. Consommer dans les 24h après ouverture.",
    supplier: "Tofu Vaud Artisanal",
    supplier_location: "Lausanne, Vaud, Suisse",
    facility: "SafeBox Kitchen — Atelier sans allergènes",
    facility_address: "Rue de l'Industrie 12, 1020 Renens, Suisse",
    temperature_chain: "Chaîne du froid maintenue de 2°C à 4°C de la production à la distribution.",
  },
  // === 4: Risotto aux champignons ===
  {
    lot: "LOT-2026-0217-A05",
    fabrication_date: "16.02.2026",
    dlc: "22.02.2026",
    storage: "Conserver entre 0°C et 4°C. Consommer dans les 24h après ouverture.",
    supplier: "Champignons du Jorat",
    supplier_location: "Jorat-Mézières, Vaud, Suisse",
    facility: "SafeBox Kitchen — Atelier sans allergènes",
    facility_address: "Rue de l'Industrie 12, 1020 Renens, Suisse",
    temperature_chain: "Chaîne du froid maintenue de 2°C à 4°C de la production à la distribution.",
  },
  // === 5: Bœuf bourguignon ===
  {
    lot: "LOT-2026-0217-A06",
    fabrication_date: "15.02.2026",
    dlc: "20.02.2026",
    storage: "Conserver entre 0°C et 4°C. Consommer dans les 24h après ouverture.",
    supplier: "Boucherie Bellon — Viande suisse de pâturage",
    supplier_location: "Epalinges, Vaud, Suisse",
    facility: "SafeBox Kitchen — Atelier sans allergènes",
    facility_address: "Rue de l'Industrie 12, 1020 Renens, Suisse",
    temperature_chain: "Chaîne du froid maintenue de 2°C à 4°C de la production à la distribution.",
  },
  // === 6: Wrap poulet-avocat ===
  {
    lot: "LOT-2026-0217-A07",
    fabrication_date: "17.02.2026",
    dlc: "19.02.2026",
    storage: "Conserver entre 0°C et 4°C. Consommer le jour même de préférence.",
    supplier: "Volailles de la Broye SA",
    supplier_location: "Payerne, Vaud, Suisse",
    facility: "SafeBox Kitchen — Atelier sans allergènes",
    facility_address: "Rue de l'Industrie 12, 1020 Renens, Suisse",
    temperature_chain: "Chaîne du froid maintenue de 2°C à 4°C de la production à la distribution.",
  },
  // === 7: Poke bowl saumon ===
  {
    lot: "LOT-2026-0217-A08",
    fabrication_date: "16.02.2026",
    dlc: "19.02.2026",
    storage: "Conserver entre 0°C et 4°C. Ne pas recongeler. Consommer rapidement après ouverture.",
    supplier: "Pistor AG — Poissons & Fruits de mer",
    supplier_location: "Rotkreuz, Zoug, Suisse",
    facility: "SafeBox Kitchen — Atelier sans allergènes",
    facility_address: "Rue de l'Industrie 12, 1020 Renens, Suisse",
    temperature_chain: "Transport réfrigéré 0–2°C. Stockage 2–4°C en distributeur.",
  },
  // === 8: Energy balls cacao-coco ===
  {
    lot: "LOT-2026-0210-B01",
    fabrication_date: "10.02.2026",
    dlc: "10.05.2026",
    storage: "Conserver au sec, à l'abri de la chaleur. Température ambiante (max 25°C).",
    supplier: "Felchlin AG — Cacao & Chocolat suisse",
    supplier_location: "Ibach, Schwyz, Suisse",
    facility: "SafeBox Confiserie — Atelier sans allergènes",
    facility_address: "Rue de l'Industrie 12, 1020 Renens, Suisse",
    temperature_chain: "Stockage à température ambiante contrôlée (18–22°C).",
  },
  // === 9: Chips de légumes ===
  {
    lot: "LOT-2026-0212-B02",
    fabrication_date: "12.02.2026",
    dlc: "12.06.2026",
    storage: "Conserver au sec, à l'abri de la lumière. Refermer après ouverture.",
    supplier: "Ferme des Racines — Légumes suisses",
    supplier_location: "Yverdon-les-Bains, Vaud, Suisse",
    facility: "SafeBox Confiserie — Atelier sans allergènes",
    facility_address: "Rue de l'Industrie 12, 1020 Renens, Suisse",
    temperature_chain: "Stockage à température ambiante contrôlée (18–22°C).",
  },
  // === 10: Barre protéinée vanille ===
  {
    lot: "LOT-2026-0208-B03",
    fabrication_date: "08.02.2026",
    dlc: "08.08.2026",
    storage: "Conserver au sec, à l'abri de la chaleur. Température ambiante (max 25°C).",
    supplier: "Pistor AG — Ingrédients naturels",
    supplier_location: "Rotkreuz, Zoug, Suisse",
    facility: "SafeBox Confiserie — Atelier sans allergènes",
    facility_address: "Rue de l'Industrie 12, 1020 Renens, Suisse",
    temperature_chain: "Stockage à température ambiante contrôlée (18–22°C).",
  },
  // === 11: Crackers sarrasin & romarin ===
  {
    lot: "LOT-2026-0214-B04",
    fabrication_date: "14.02.2026",
    dlc: "14.07.2026",
    storage: "Conserver au sec dans un endroit frais. Refermer le sachet après ouverture.",
    supplier: "Biofarm AG — Céréales biologiques",
    supplier_location: "Kleindietwil, Berne, Suisse",
    facility: "SafeBox Confiserie — Atelier sans allergènes",
    facility_address: "Rue de l'Industrie 12, 1020 Renens, Suisse",
    temperature_chain: "Stockage à température ambiante contrôlée (18–22°C).",
  },
  // === 12: Fruits secs & graines ===
  {
    lot: "LOT-2026-0211-B05",
    fabrication_date: "11.02.2026",
    dlc: "11.08.2026",
    storage: "Conserver au sec, à l'abri de la lumière. Température ambiante (max 25°C).",
    supplier: "NaturGrain Sélection",
    supplier_location: "Bern, Suisse",
    facility: "SafeBox Confiserie — Atelier sans allergènes",
    facility_address: "Rue de l'Industrie 12, 1020 Renens, Suisse",
    temperature_chain: "Stockage à température ambiante contrôlée (18–22°C).",
  },
  // === 13: Muffin chocolat sans gluten ===
  {
    lot: "LOT-2026-0215-B06",
    fabrication_date: "15.02.2026",
    dlc: "22.02.2026",
    storage: "Conserver entre 0°C et 4°C. Consommer dans les 48h après ouverture.",
    supplier: "Cacao Felchlin — Chocolat suisse artisanal",
    supplier_location: "Schwyz, Suisse",
    facility: "SafeBox Pâtisserie — Atelier sans allergènes",
    facility_address: "Rue de l'Industrie 12, 1020 Renens, Suisse",
    temperature_chain: "Chaîne du froid maintenue de 4°C à 8°C.",
  },
  // === 14: Smoothie vert détox ===
  {
    lot: "LOT-2026-0217-C01",
    fabrication_date: "17.02.2026",
    dlc: "19.02.2026",
    storage: "Conserver entre 0°C et 4°C. Consommer immédiatement après ouverture. Bien agiter.",
    supplier: "Maraîcher Bio du Gros-de-Vaud",
    supplier_location: "Échallens, Vaud, Suisse",
    facility: "SafeBox Pressoir — Atelier sans allergènes",
    facility_address: "Rue de l'Industrie 12, 1020 Renens, Suisse",
    temperature_chain: "Pressé à froid, maintenu entre 2°C et 4°C en continu.",
  },
  // === 15: Jus d'orange pressé ===
  {
    lot: "LOT-2026-0216-C02",
    fabrication_date: "16.02.2026",
    dlc: "23.02.2026",
    storage: "Conserver entre 0°C et 4°C. Consommer rapidement après ouverture.",
    supplier: "Naranjales de Valencia SL",
    supplier_location: "Valence, Espagne",
    facility: "SafeBox Pressoir — Atelier sans allergènes",
    facility_address: "Rue de l'Industrie 12, 1020 Renens, Suisse",
    temperature_chain: "Pressé à froid, maintenu entre 2°C et 4°C en continu.",
  },
  // === 16: Lait d'avoine barista ===
  {
    lot: "LOT-2026-0201-C03",
    fabrication_date: "01.02.2026",
    dlc: "01.05.2026",
    storage: "Conserver à température ambiante avant ouverture. Réfrigérer après ouverture et consommer sous 5 jours.",
    supplier: "Biofarm AG — Céréales biologiques",
    supplier_location: "Kleindietwil, Berne, Suisse",
    facility: "SafeBox Boissons — Atelier sans allergènes",
    facility_address: "Rue de l'Industrie 12, 1020 Renens, Suisse",
    temperature_chain: "Produit UHT. Stockage température ambiante avant ouverture.",
  },
  // === 17: Kombucha gingembre-citron ===
  {
    lot: "LOT-2026-0210-C04",
    fabrication_date: "10.02.2026",
    dlc: "10.04.2026",
    storage: "Conserver entre 0°C et 6°C. Produit vivant, éviter les chocs thermiques.",
    supplier: "Transgourmet Suisse SA — Thés & Infusions",
    supplier_location: "Lausanne, Vaud, Suisse",
    facility: "SafeBox Fermentation — Atelier sans allergènes",
    facility_address: "Rue de l'Industrie 12, 1020 Renens, Suisse",
    temperature_chain: "Fermentation contrôlée à 22°C, stockage réfrigéré 4–6°C.",
  },
  // === 18: Eau minérale Henniez ===
  {
    lot: "LOT-2026-0101-C05",
    fabrication_date: "01.01.2026",
    dlc: "01.01.2028",
    storage: "Conserver à l'abri de la lumière et de la chaleur. Température ambiante.",
    supplier: "Sources Minérales Henniez SA",
    supplier_location: "Henniez, Vaud, Suisse",
    facility: "Sources Minérales Henniez SA",
    facility_address: "Route de la Gare 1, 1525 Henniez, Suisse",
    temperature_chain: "Embouteillée à la source. Aucune chaîne du froid requise.",
  },
  // === 19: Thé glacé pêche ===
  {
    lot: "LOT-2026-0214-C06",
    fabrication_date: "14.02.2026",
    dlc: "14.05.2026",
    storage: "Conserver entre 0°C et 6°C. Consommer rapidement après ouverture.",
    supplier: "Transgourmet Suisse SA — Thés & Infusions",
    supplier_location: "Lausanne, Vaud, Suisse",
    facility: "SafeBox Boissons — Atelier sans allergènes",
    facility_address: "Rue de l'Industrie 12, 1020 Renens, Suisse",
    temperature_chain: "Infusé à chaud, refroidi rapidement, stocké entre 2°C et 4°C.",
  },
];

/**
 * Look up traceability by product ID.
 * Products are ordered by ID in the DB, so we find the index by rank.
 */
export function getTraceabilityForProduct(
  productId: number,
  allProductIds: number[],
): TraceabilityInfo | undefined {
  const sorted = [...allProductIds].sort((a, b) => a - b);
  const index = sorted.indexOf(productId);
  return index >= 0 ? data[index] : undefined;
}
