/**
 * Tarot major arcana deck (subset). Real deck would include all 78
 * cards plus reversals; this is a clean starter set for the oracle.
 */
export type OracleCard = {
  name: string;
  number: number;
  upright: string[];
  reversed: string[];
  element?: "fire" | "water" | "air" | "earth";
};

export const MAJOR_ARCANA: OracleCard[] = [
  { name: "The Fool", number: 0, upright: ["new beginnings", "innocence", "spontaneity"], reversed: ["recklessness", "fear of change"] },
  { name: "The Magician", number: 1, upright: ["manifestation", "willpower", "skill"], reversed: ["scattered focus", "trickery"] },
  { name: "The High Priestess", number: 2, upright: ["intuition", "the subconscious", "inner voice"], reversed: ["secrets", "withdrawal"] },
  { name: "The Empress", number: 3, upright: ["femininity", "abundance", "nurturing"], reversed: ["dependence", "creative block"] },
  { name: "The Emperor", number: 4, upright: ["authority", "structure", "stability"], reversed: ["domination", "rigidity"] },
  { name: "The Hierophant", number: 5, upright: ["tradition", "spiritual wisdom", "conformity"], reversed: ["rebellion", "unconventional path"] },
  { name: "The Lovers", number: 6, upright: ["love", "harmony", "alignment"], reversed: ["disharmony", "imbalance"] },
  { name: "The Chariot", number: 7, upright: ["determination", "control", "victory"], reversed: ["lack of direction", "scattered energy"] },
  { name: "Strength", number: 8, upright: ["inner strength", "courage", "compassion"], reversed: ["self-doubt", "raw emotion"] },
  { name: "The Hermit", number: 9, upright: ["solitude", "introspection", "guidance"], reversed: ["isolation", "loneliness"] },
  { name: "Wheel of Fortune", number: 10, upright: ["destiny", "cycles", "turning point"], reversed: ["bad luck", "resistance"] },
  { name: "Justice", number: 11, upright: ["fairness", "truth", "cause and effect"], reversed: ["dishonesty", "unaccountability"] },
  { name: "The Hanged Man", number: 12, upright: ["surrender", "new perspective"], reversed: ["delay", "resistance"] },
  { name: "Death", number: 13, upright: ["endings", "transformation", "transition"], reversed: ["resistance to change"] },
  { name: "Temperance", number: 14, upright: ["balance", "moderation", "patience"], reversed: ["imbalance", "excess"] },
  { name: "The Devil", number: 15, upright: ["shadow self", "attachment", "addiction"], reversed: ["release", "reclaiming power"] },
  { name: "The Tower", number: 16, upright: ["sudden change", "upheaval", "revelation"], reversed: ["fear of change", "averted disaster"] },
  { name: "The Star", number: 17, upright: ["hope", "faith", "renewal"], reversed: ["despair", "lack of faith"] },
  { name: "The Moon", number: 18, upright: ["intuition", "the unconscious", "dreams"], reversed: ["confusion lifting", "release of fear"] },
  { name: "The Sun", number: 19, upright: ["joy", "vitality", "success"], reversed: ["temporary clouds", "delayed success"] },
  { name: "Judgement", number: 20, upright: ["awakening", "reckoning", "rebirth"], reversed: ["self-doubt", "ignoring the call"] },
  { name: "The World", number: 21, upright: ["completion", "wholeness", "integration"], reversed: ["incompletion", "shortcut taken"] },
];

export type DrawnCard = {
  card: OracleCard;
  reversed: boolean;
  position: "past" | "present" | "future";
};

export function draw(count: 1 | 3 = 3): DrawnCard[] {
  const positions: DrawnCard["position"][] = ["past", "present", "future"];
  const shuffled = [...MAJOR_ARCANA].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map((card, i) => ({
    card,
    reversed: Math.random() < 0.3,
    position: count === 3 ? positions[i] : "present",
  }));
}
