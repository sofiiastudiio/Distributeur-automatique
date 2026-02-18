export const AGE_RANGES = [
  "18-24",
  "25-34",
  "35-44",
  "45-54",
  "55-64",
  "65+",
] as const;

export const GENDER_OPTIONS = [
  { value: "femme", label: "Femme" },
  { value: "homme", label: "Homme" },
  { value: "non-binaire", label: "Non-binaire" },
  { value: "prefere-ne-pas-dire", label: "Préfère ne pas dire" },
] as const;

export const ALLERGENS = [
  { id: "gluten", label: "Gluten", icon: "🌾", color: "#D97706" },
  { id: "crustaces", label: "Crustacés", icon: "🦐", color: "#DC2626" },
  { id: "oeufs", label: "Œufs", icon: "🥚", color: "#F59E0B" },
  { id: "poisson", label: "Poisson", icon: "🐟", color: "#2563EB" },
  { id: "arachides", label: "Arachides", icon: "🥜", color: "#92400E" },
  { id: "soja", label: "Soja", icon: "🫘", color: "#65A30D" },
  { id: "lait", label: "Lait", icon: "🥛", color: "#F3F4F6" },
  { id: "fruits-a-coque", label: "Fruits à coque", icon: "🌰", color: "#78350F" },
  { id: "celeri", label: "Céleri", icon: "🥬", color: "#16A34A" },
  { id: "moutarde", label: "Moutarde", icon: "🟡", color: "#CA8A04" },
  { id: "sesame", label: "Sésame", icon: "⚪", color: "#D4D4D8" },
  { id: "sulfites", label: "Sulfites", icon: "🧪", color: "#7C3AED" },
  { id: "lupin", label: "Lupin", icon: "🌸", color: "#DB2777" },
  { id: "mollusques", label: "Mollusques", icon: "🐚", color: "#0891B2" },
] as const;

export const DIETARY_PREFERENCES = [
  { value: "vegetarien", label: "Végétarien" },
  { value: "vegan", label: "Végan" },
  { value: "sans-lactose", label: "Sans lactose" },
  { value: "sans-gluten", label: "Sans gluten" },
  { value: "halal", label: "Halal" },
  { value: "casher", label: "Casher" },
  { value: "bio", label: "Bio" },
  { value: "aucune", label: "Aucune préférence" },
] as const;

export const VENDING_FREQUENCY = [
  { value: "quotidien", label: "Tous les jours" },
  { value: "plusieurs-fois-semaine", label: "Plusieurs fois par semaine" },
  { value: "une-fois-semaine", label: "Une fois par semaine" },
  { value: "quelques-fois-mois", label: "Quelques fois par mois" },
  { value: "rarement", label: "Rarement" },
  { value: "jamais", label: "Jamais" },
] as const;

export const WOULD_SEEK_OPTIONS = [
  { value: "oui", label: "Oui, absolument" },
  { value: "probablement", label: "Probablement" },
  { value: "peut-etre", label: "Peut-être" },
  { value: "probablement-pas", label: "Probablement pas" },
  { value: "non", label: "Non" },
] as const;

export const CATEGORY_LABELS: Record<string, string> = {
  meal: "Plats préparés",
  snack: "Snacks",
  drink: "Boissons",
};

export const DENOMINATIONS = {
  coins: [
    { value: 0.5, label: "0.50" },
    { value: 1, label: "1" },
    { value: 2, label: "2" },
    { value: 5, label: "5" },
  ],
  bills: [
    { value: 10, label: "10" },
    { value: 20, label: "20" },
    { value: 50, label: "50" },
  ],
} as const;

export const AUTO_RESET_SECONDS = 10;
