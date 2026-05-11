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
    centerX: 49.5,
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

    // Half-pizza buffer (angular gap near vertical split line, in radians).
    const splitBuffer = 0.18

    const positions: ToppingPosition[] = []

    // Tiny per-instance jitter, in % of container, so it doesn't look like a perfect math pattern.
    const jitterMag = Math.min(placementRadius * 0.06, 0.9)

    for (let i = 0; i < count; i++) {
        // Sunflower: uniform area distribution.
        const t = (i + 0.5) / count
        const r = Math.sqrt(t) * placementRadius
        const sunflowerAngle = i * GOLDEN_ANGLE + seed * 0.017

        let theta: number
        if (coverage === "whole") {
            theta = sunflowerAngle
        } else {
            // Map sunflowerAngle (any real) deterministically into the desired half-disc arc.
            const norm = ((sunflowerAngle % Math.PI) + Math.PI) % Math.PI // [0, PI)
            const arc = Math.PI - 2 * splitBuffer
            if (coverage === "right") {
                // Right side: cos(theta) > 0  ⇒ theta in (-PI/2, PI/2)
                theta = -Math.PI / 2 + splitBuffer + norm * (arc / Math.PI)
            } else {
                // Left side: cos(theta) < 0  ⇒ theta in (PI/2, 3PI/2)
                theta = Math.PI / 2 + splitBuffer + norm * (arc / Math.PI)
            }
        }

        const jx = (seededRandom(seed + i * 3.71) - 0.5) * jitterMag
        const jy = (seededRandom(seed + i * 7.13) - 0.5) * jitterMag

        let x = PIZZA.centerX + r * Math.cos(theta) + jx
        let y = PIZZA.centerY + r * Math.sin(theta) + jy

        // Clamp inside the sauce circle as a final safety net (e.g. jitter pushed near the edge).
        const dx = x - PIZZA.centerX
        const dy = y - PIZZA.centerY
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist > placementRadius) {
            const k = placementRadius / dist
            x = PIZZA.centerX + dx * k
            y = PIZZA.centerY + dy * k
        }

        // For half coverage, also enforce the split line on the X-axis as a hard guarantee.
        if (coverage === "right") {
            const minX = PIZZA.centerX + 0.5
            if (x < minX) x = minX
        } else if (coverage === "left") {
            const maxX = PIZZA.centerX - 0.5
            if (x > maxX) x = maxX
        }

        const rotation = seededRandom(seed + i * 11.7) * 360
        const scale = 0.85 + seededRandom(seed + i * 13.3) * 0.3

        positions.push({ x, y, rotation, scale })
    }

    return positions
}
