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

    // Margin so the topping art sits fully inside the sauce zone. We subtract
    // the topping's full pixel width (as a % of the actual container) so the
    // image edge never crosses onto the crust, even on the narrowest phones.
    const toppingHalfWidthPct = (toppingSize / 2 / Math.max(containerSize, 1)) * 100
    const toppingMarginPct = toppingHalfWidthPct * 2
    const placementRadius = Math.max(geom.sauceRadius - toppingMarginPct, 3)

    const seed = hashString(toppingId)
    const defaultCount = toppingId === "basil" ? 9 : 16 + (seed % 4)
    const wholeCount = baseCount ?? defaultCount
    // Half-coverage keeps a bit more than 50% so the chosen side reads as
    // properly filled (visually, half the disc with half the points feels
    // sparse next to a full "whole" pizza in someone else's order).
    const targetCount = coverage === "whole"
        ? wholeCount
        : Math.max(Math.ceil(wholeCount * 0.55), 6)

    // No-go strip around the vertical center line for half-coverage. Without
    // it, points with cos(θ) ≈ 0 hover on the middle and "left" reads as
    // "central". 2% of container ≈ 10px on a 487px stage — visible but small.
    const splitGap = 2.0
    const jitterMag = Math.min(placementRadius * 0.06, 0.9)

    // For half-coverage, generate ~2x sunflower candidates so roughly half
    // land on the chosen side. The factor accounts for the splitGap losses too.
    const candidateCount = coverage === "whole" ? targetCount : targetCount * 2

    const positions: ToppingPosition[] = []
    let i = 0
    const maxIter = candidateCount * 4
    while (positions.length < targetCount && i < maxIter) {
        // t spans 0..1 across the candidate window so the sunflower reaches
        // the full placement radius. Past 1 the t would go outside the disc.
        const t = (i + 0.5) / candidateCount
        if (t > 1) { i++; continue }
        const r = Math.sqrt(t) * placementRadius
        const sunflowerAngle = i * GOLDEN_ANGLE + seed * 0.017
        const dx = r * Math.cos(sunflowerAngle)
        const dy = r * Math.sin(sunflowerAngle)
        i++

        if (coverage !== "whole") {
            const sign = coverage === "right" ? 1 : -1
            if (sign * dx < splitGap) continue
        }

        const jx = (seededRandom(seed + i * 3.71) - 0.5) * jitterMag
        const jy = (seededRandom(seed + i * 7.13) - 0.5) * jitterMag

        let x = geom.centerX + dx + jx
        let y = geom.centerY + dy + jy

        // Hard clamp inside the sauce circle — jitter or splitGap rounding
        // could otherwise nudge a point one pixel past the edge.
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
