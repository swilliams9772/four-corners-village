/**
 * Motion — easings + durations.
 *
 * Curve names describe feel:
 *   silk        — gentlest, used for theme transitions and ambient orbs
 *   velvet      — primary UI default, smooth but with weight
 *   ceremonial  — slow ramp, used for hero reveals and lunar transitions
 *   sharp       — quick + decisive, used for taps and toggles
 *   spring      — overshoots slightly, used for celebratory micro-interactions
 *
 * Durations follow a clear ladder so a designer can "feel" them without
 * memorizing numbers.
 */
export const easing = {
  silk: "cubic-bezier(0.22, 0.61, 0.36, 1)",
  velvet: "cubic-bezier(0.4, 0, 0.2, 1)",
  ceremonial: "cubic-bezier(0.65, 0, 0.35, 1)",
  sharp: "cubic-bezier(0.4, 0, 0.6, 1)",
  spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
  // For framer-motion / RN Reanimated, the same as cubic arrays:
  silkArr: [0.22, 0.61, 0.36, 1] as const,
  velvetArr: [0.4, 0, 0.2, 1] as const,
  ceremonialArr: [0.65, 0, 0.35, 1] as const,
  sharpArr: [0.4, 0, 0.6, 1] as const,
  springArr: [0.34, 1.56, 0.64, 1] as const,
};

export const duration = {
  instant: 80,
  quick: 160,
  gentle: 280,
  normal: 420,
  slow: 600,
  ceremony: 900,
  ritual: 1400,
  invocation: 2400,
} as const;

export const motion = {
  easing,
  duration,
  // Pre-made transition strings for CSS use
  transitions: {
    color: `color ${duration.gentle}ms ${easing.velvet}, background-color ${duration.gentle}ms ${easing.velvet}, border-color ${duration.gentle}ms ${easing.velvet}`,
    transform: `transform ${duration.normal}ms ${easing.velvet}`,
    opacity: `opacity ${duration.gentle}ms ${easing.silk}`,
    all: `all ${duration.gentle}ms ${easing.velvet}`,
    ceremony: `all ${duration.ceremony}ms ${easing.ceremonial}`,
  },
} as const;

export type Easing = keyof typeof easing;
export type Duration = keyof typeof duration;
