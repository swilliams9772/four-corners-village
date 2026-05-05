/**
 * Cross-platform UI primitives.
 *
 * The actual rendered components diverge between web (HTMLElement + Tailwind)
 * and native (RN View + NativeWind), but their *visual logic* — variant maps,
 * lunar engine, color resolution — lives here so the two surfaces can't drift.
 */

export * from "./lunar";
export * from "./elemental";
export * from "./variants";
