import type { Coverage } from "./types"

/**
 * Pizza geometry, derived from a fresh pixel-level analysis of the two base
 * images. Each base has its own disc center, outer radius, and sauce radius
 * (where the crust starts), measured by:
 *  - Using the image's alpha channel to extract the pizza disc
 *  - Computing the bounding-box center & min(width/2, height/2) as the radius
 *  - Sampling a radial brightness profile to locate the sauce→crust transition
 *
 * All values are PERCENTAGES of the SQUARE container that holds the pizza
 * (object-contain, aspect-square). The image is wider than tall, so it's
 * letterboxed top/bottom; the math below accounts for that.
 *
 *   margherita.webp  center=(49.25%, 49.81%)  outerR=23.3%  sauceR=16.3%
 *   bian.webp        center=(49.83%, 49.88%)  outerR=26.3%  sauceR=18.4%
 *
 * bian (cream base) is visibly larger than margherita; using one number for
 * both would either leave a band of empty sauce on bian or push toppings onto
 * the crust on margherita, so the helper takes the base id and picks the
 * right constants.
 */
export type PizzaBase = "margherita" | "bian"

export const PIZZA_BASES: Record<PizzaBase, {
    centerX: number
    centerY: number
    outerRadius: number
    sauceRadius: number
}> = {
    margherita: { centerX: 49.25, centerY: 49.81, outerRadius: 23.3, sauceRadius: 16.3 },
    bian:       { centerX: 49.83, centerY: 49.88, outerRadius: 26.3, sauceRadius: 18.4 },
}

// Back-compat default export — older call sites get margherita geometry.
export const PIZZA = PIZZA_BASES.margherita

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
    /** Which pizza base — picks the matching disc geometry. Defaults to margherita. */
    base?: PizzaBase
    /** Optional override for whole-pizza count. */
    baseCount?: number
}

/**
 * Place toppings on the pizza disc.
 *
 * Algorithm: rejection-sampled Vogel sunflower.
 *  1) Walk a golden-angle sunflower across the FULL disc — this is the most
 *     well-known low-discrepancy 2D pattern; adjacent points never share a
 *     visual cluster.
 *  2) For half coverage (left/right), only KEEP candidates that fall on the
 *     requested side of the center line (with a small `splitGap` no-go strip
 *     to prevent points from straddling the middle).
 *  3) Apply a small seeded jitter so it doesn't look like a perfect spiral.
 *
 * Why rejection sampling and not "map full-disc x onto one side":
 * the previous version computed x for the full disc then folded it via
 * `dx = sign * (gap + |dx_full| * scale)`. Folding squashed two halves into
 * one, leaving a cluster near the middle and an empty rim — exactly the
 * "left looks like middle" perception we kept fighting. Rejection keeps the
 * sunflower's natural even spread on whatever half survives.
 */
export function generateToppingPositions(input: ToppingLayoutInput): ToppingPosition[] {
    const { toppingId, coverage, containerSize, toppingSize, baseCount, base = "margherita" } = input
    const geom = PIZZA_BASES[base]

    // Keep the topping center at least half the topping's rendered width from
    // the sauce boundary so the image edge stays within the sauce zone.
    const toppingEdgePct = (toppingSize / 2 / Math.max(containerSize, 1)) * 100
    const placementRadius = Math.max(geom.sauceRadius - toppingEdgePct, 3)

    const seed = hashString(toppingId)
    const defaultCount = toppingId === "basil" ? 7 : 14 + (seed % 5)
    const wholeCount = baseCount ?? defaultCount

    const targetCount = coverage === "whole"
        ? wholeCount
        : Math.max(Math.ceil(wholeCount * 0.60), 5)

    // Narrow no-go strip at the vertical centre line so half-side toppings
    // never appear to straddle the divide.
    const splitGap = 1.5
    const jitterMag = Math.min(placementRadius * 0.07, 1.2)

    // For half-coverage we generate a full-disc sunflower with 2× candidates,
    // then keep every point that lands on the chosen side (no early exit).
    // This guarantees survivors are drawn from the whole radial range —
    // stopping early would bias toward the inner disc and leave the rim bare.
    const candidateCount = coverage === "whole" ? targetCount : targetCount * 2

    const positions: ToppingPosition[] = []
    for (let i = 0; i < candidateCount; i++) {
        // For whole coverage stop as soon as we have enough.
        if (coverage === "whole" && positions.length >= targetCount) break

        const t = (i + 0.5) / candidateCount
        const r = Math.sqrt(t) * placementRadius
        const sunflowerAngle = i * GOLDEN_ANGLE + seed * 0.017
        const dx = r * Math.cos(sunflowerAngle)
        const dy = r * Math.sin(sunflowerAngle)

        if (coverage !== "whole") {
            const sign = coverage === "right" ? 1 : -1
            if (sign * dx < splitGap) continue
        }

        const jx = (seededRandom(seed + i * 3.71) - 0.5) * jitterMag
        const jy = (seededRandom(seed + i * 7.13) - 0.5) * jitterMag

        let x = geom.centerX + dx + jx
        let y = geom.centerY + dy + jy

        // Clamp inside the sauce circle in case jitter nudges a point over.
        const cdx = x - geom.centerX
        const cdy = y - geom.centerY
        const dist = Math.sqrt(cdx * cdx + cdy * cdy)
        if (dist > placementRadius) {
            const k = placementRadius / dist
            x = geom.centerX + cdx * k
            y = geom.centerY + cdy * k
        }

        const rotation = seededRandom(seed + i * 11.7) * 360
        const scale = 0.85 + seededRandom(seed + i * 13.3) * 0.3

        positions.push({ x, y, rotation, scale })
    }

    return positions
}
