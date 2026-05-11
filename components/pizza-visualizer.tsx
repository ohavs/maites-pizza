"use client"

import Image from "next/image"
import { SelectedTopping, Topping } from "@/lib/types"
import { toppings } from "@/lib/pizza-data"
import { generateToppingPositions } from "@/lib/pizza-geometry"

interface PizzaVisualizerProps {
    selectedToppings: SelectedTopping[]
    size?: number
}

export function PizzaVisualizer({ selectedToppings, size = 80 }: PizzaVisualizerProps) {
    // Keep the topping render-size proportional to the preview, so density looks consistent.
    const toppingSize = Math.max(size * 0.14, 8)

    return (
        <div className="relative w-full h-full">
            <div className="absolute inset-0">
                <Image
                    src="/images/margherita.webp"
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

                const positions = generateToppingPositions({
                    toppingId: selected.id,
                    coverage: selected.coverage,
                    containerSize: size,
                    toppingSize,
                })

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
