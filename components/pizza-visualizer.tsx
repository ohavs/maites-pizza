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
    // Match the topping-to-pizza ratio used in the builder (32px topping / 500px stage).
    const toppingSize = size * (32 / 500)

    // Base image follows the selected sauce, same logic as PizzaBuilder.
    const selectedSauceId = selectedToppings.find(t =>
        toppings.sauce.some(s => s.id === t.id)
    )?.id
    const baseImage = selectedSauceId === "white" ? "/images/bian.webp" : "/images/margherita.webp"

    return (
        <div className="relative w-full h-full">
            <div className="absolute inset-0">
                <Image
                    src={baseImage}
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
                // Skip sauces (no image) — they change the base, not paint dots.
                if (!toppingData?.image) return null

                const positions = generateToppingPositions({
                    toppingId: selected.id,
                    coverage: selected.coverage,
                    containerSize: size,
                    toppingSize,
                    base: selectedSauceId === "white" ? "bian" : "margherita",
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
                                <Image
                                    src={toppingData.image}
                                    alt={toppingData.name}
                                    width={toppingSize}
                                    height={toppingSize}
                                    className="object-contain drop-shadow-sm"
                                />
                            </div>
                        ))}
                    </div>
                )
            })}
        </div>
    )
}
