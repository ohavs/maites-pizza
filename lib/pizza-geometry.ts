import type { Coverage } from "./types"

/**
 * Pizza geometry, derived from analyzing /public/images/margherita.webp (2400x1339).
 * Center of mass at ~(49.24%, 49.80%) of the image; outer crust radius ~23.45% of image width.
 * Color sampling shows the sauce/cheese area ends and the crust starts at ~75% of the outer radius.
 *
 * Coordinates are expressed as PERCENTAGES of the SQUARE container that holds the pizza image
 * (object-contain, aspect-square). Because the image is wider than tall, when contained in a
 * square it is letterboxed top/bottom, but the pizza in the image happens to sit at almost the
 * exact horizontal/vertical center, so we can treat (~50, ~50) as the disc center safely.
 */
export const PIZZA = {
    centerX: 47.5,   // shifted left: the stage container overflows right on RTL screens
    centerY: 50.0,
    outerRadius: 23.0,
    sauceRadius: 17.0,
} as const

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5))

const seededRandom = (seed: number) => {
    const x = Math.sin(seed) * 10000
    return x - Math.floor(x)
}

const hashString = (s: string) => {
    let h = 0
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
    return Math.abs(h)
}

export interface ToppingPosition {
    x: number
    y: number
    rotation: number
    scale: number
}

export interface ToppingLayoutInput {
    toppingId: string
    coverage: Coverage
    /** Container width in pixels (square). Used to compute topping radius as % of container. */
    containerSize: number
    /** Topping image rendered size in pixels. */
    toppingSize: number
    /** Optional override for how many toppings to place (whole pizza). Defaults to a stable count per id. */
    baseCount?: number
}

/**
 * Generate evenly distributed topping positions within the pizza's sauce zone, using a
 * sunflower (Vogel) pattern with a tiny seeded jitter so it looks organic but never random/messy.
 *
 * - Stays strictly inside the pizza (does NOT spill onto crust or transparent canvas).
 * - For "left"/"right" coverage, restricts placement to that half with a small gap near the split line.
 * - Stable across renders (deterministic given toppingId + coverage + sizes).
 */
export function generateToppingPositions(input: ToppingLayoutInput): ToppingPosition[] {
    const { toppingId, coverage, containerSize, toppingSize, baseCount } = input

    // Margin so the topping image (which has its own padding) sits fully inside the sauce.
    // Use ~40% of the rendered topping size as the inset (the visible art is smaller than the bbox).
    const toppingMarginPct = (toppingSize * 0.4 / Math.max(containerSize, 1)) * 100
    const placementRadius = Math.max(PIZZA.sauceRadius - toppingMarginPct, 3)

    const seed = hashString(toppingId)
    const defaultCount = toppingId === "basil" ? 9 : 16 + (seed % 4)
    const wholeCount = baseCount ?? defaultCount
    const count = coverage === "whole" ? wholeCount : Math.max(Math.ceil(wholeCount / 2), 4)

    // Minimum distance (in % of container) from the vertical split line for half-coverage.
    // Without this, points with cos(θ) ≈ 0 cluster at the middle of the pizza and "left" looks central.
    const splitGap = 1.8

    const positions: ToppingPosition[] = []

    // Tiny per-instance jitter, in % of container, so it doesn't look like a perfect math pattern.
    const jitterMag = Math.min(placementRadius * 0.06, 0.9)

    for (let i = 0; i < count; i++) {
        // Sunflower: uniform area distribution within a disc of radius `placementRadius`.
        const t = (i + 0.5) / count
        const r = Math.sqrt(t) * placementRadius
        const sunflowerAngle = i * GOLDEN_ANGLE + seed * 0.017

        let dx = r * Math.cos(sunflowerAngle)
        let dy = r * Math.sin(sunflowerAngle)

        if (coverage !== "whole") {
            // Map the full-disc x to one side of the pizza with a hard minimum offset from the
            // split line. |dx| ∈ [0, R] → [splitGap, R], preserving relative density across the half.
            const sign = coverage === "right" ? 1 : -1
            const usableWidth = Math.max(placementRadius - splitGap, 1)
            dx = sign * (splitGap + Math.abs(dx) * (usableWidth / placementRadius))
        }

        const jx = (seededRandom(seed + i * 3.71) - 0.5) * jitterMag
        const jy = (seededRandom(seed + i * 7.13) - 0.5) * jitterMag

        let x = PIZZA.centerX + dx + jx
        let y = PIZZA.centerY + dy + jy

        // Clamp inside the sauce circle as a final safety net.
        const cdx = x - PIZZA.centerX
        const cdy = y - PIZZA.centerY
        const dist = Math.sqrt(cdx * cdx + cdy * cdy)
        if (dist > placementRadius) {
            const k = placementRadius / dist
            x = PIZZA.centerX + cdx * k
            y = PIZZA.centerY + cdy * k
        }

        // Hard guarantee on side for half coverage (in case jitter pushed across the line).
        if (coverage === "right") {
            const minX = PIZZA.centerX + splitGap
            if (x < minX) x = minX
        } else if (coverage === "left") {
            const maxX = PIZZA.centerX - splitGap
            if (x > maxX) x = maxX
        }

        const rotation = seededRandom(seed + i * 11.7) * 360
        const scale = 0.85 + seededRandom(seed + i * 13.3) * 0.3

        positions.push({ x, y, rotation, scale })
    }

    return positions
}
