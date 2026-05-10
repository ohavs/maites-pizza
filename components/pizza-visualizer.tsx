"use client"

import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { SelectedTopping, Coverage, Topping } from "@/lib/types"
import { toppings } from "@/lib/pizza-data"

interface PizzaVisualizerProps {
    selectedToppings: SelectedTopping[]
    size?: number
}

export function PizzaVisualizer({ selectedToppings, size = 80 }: PizzaVisualizerProps) {

    const getToppingPositions = (toppingId: string, index: number, coverage: Coverage) => {
        const positions = []

        // Simple seeded random to keep positions stable
        const seededRandom = (seed: number) => {
            const x = Math.sin(seed) * 10000
            return x - Math.floor(x)
        }

        // Generate stable seed from toppingId only
        const baseSeed = toppingId.split('').reduce((a, c) => a + c.charCodeAt(0), 0)

        // Higher base count for better "full" look.
        const baseCount = toppingId === 'basil' ? 8 : (15 + Math.floor(seededRandom(baseSeed) * 5))

        // Adjust count based on coverage to maintain density
        const count = coverage === 'whole' ? baseCount : Math.ceil(baseCount / 2)

        for (let i = 0; i < count; i++) {
            const itemSeed = baseSeed + i * 15 + (coverage.length * 10)
            const rRandom = seededRandom(itemSeed)
            const thetaRandom = seededRandom(itemSeed + 1)

            // Distribution
            // Radius: Limit to ~35%  to ensure toppings stay strictly on the pizza face
            const r = Math.sqrt(rRandom) * 35

            // Angle based on coverage with safety buffer for the split line
            const splitBuffer = 0.3 // ~17 degrees safety zone near the middle
            let minAngle = 0
            let maxAngle = Math.PI * 2

            if (coverage === 'left') {
                minAngle = Math.PI / 2 + splitBuffer
                maxAngle = 3 * Math.PI / 2 - splitBuffer
            } else if (coverage === 'right') {
                minAngle = -Math.PI / 2 + splitBuffer
                maxAngle = Math.PI / 2 - splitBuffer
            }

            const theta = minAngle + thetaRandom * (maxAngle - minAngle)

            const x = 50 + r * Math.cos(theta)
            const y = 50 + r * Math.sin(theta)

            const rotationRandom = seededRandom(itemSeed + 2)
            const scaleRandom = seededRandom(itemSeed + 3)

            positions.push({
                x,
                y,
                rotation: rotationRandom * 360,
                scale: 0.8 + scaleRandom * 0.4
            })
        }
        return positions
    }

    // Calculate scaling factor based on base size (assuming original calc was for ~280px or percentages)
    // The positioning logic uses percentages (50 + ...), so it scales automatically with the container width/height!
    // We just need to scale the topping ITEM size relative to the container.
    // In PizzaBuilder (200px container), topping is 28px (~14%).
    // So topping size = size * 0.14
    const toppingSize = Math.max(size * 0.14, 8)

    return (
        <div className="relative w-full h-full">
            <div className="absolute inset-0">
                <Image
                    src="/images/pizza-base.png"
                    alt="Pizza base"
                    fill
                    className="object-contain drop-shadow-sm rounded-full"
                />
            </div>

            {selectedToppings.map((selected, index) => {
                let toppingData: Topping | null = null
                for (const category of Object.values(toppings)) {
                    // @ts-ignore
                    const found = category.find((t) => t.id === selected.id)
                    if (found) {
                        toppingData = found
                        break
                    }
                }
                if (!toppingData) return null

                const positions = getToppingPositions(selected.id, index, selected.coverage)

                return (
                    <div
                        key={`${selected.id}-${selected.coverage}`}
                        className="absolute inset-0 pointer-events-none"
                        style={{ zIndex: index + 1 }}
                    >
                        {positions.map((pos, i) => (
                            <div
                                key={i}
                                className="absolute"
                                style={{
                                    left: `${pos.x}%`,
                                    top: `${pos.y}%`,
                                    width: `${toppingSize}px`,
                                    height: `${toppingSize}px`,
                                    transform: `translate(-50%, -50%) rotate(${pos.rotation}deg) scale(${pos.scale})`,
                                }}
                            >
                                {toppingData?.image ? (
                                    <Image
                                        src={toppingData.image}
                                        alt={toppingData.name}
                                        width={toppingSize}
                                        height={toppingSize}
                                        className="object-contain drop-shadow-sm"
                                    />
                                ) : (
                                    <div
                                        className="rounded-full mx-auto mt-2"
                                        style={{
                                            width: toppingSize * 0.4,
                                            height: toppingSize * 0.4,
                                            backgroundColor: toppingData?.color,
                                            boxShadow: "0 1px 1px rgba(0,0,0,0.2)"
                                        }}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                )
            })}
        </div>
    )
}
