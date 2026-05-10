"use client"

import { motion } from "framer-motion"
import { ChevronRight } from "lucide-react"
import { PizzaCard } from "@/components/pizza-card"
import { pizzas } from "@/lib/data"

interface MenuGridProps {
    onBack: () => void
    onNavigate: (view: string, id?: number) => void
}

export function MenuGrid({ onBack, onNavigate }: MenuGridProps) {
    // Deterministic random layout generator
    // Validates that we never leave a gap (orphan small blocks are converted to wide)
    const cardLayouts = (() => {
        const layouts: ("landscape" | "square")[] = []
        let isRowStart = true

        pizzas.forEach((_, index) => {
            if (!isRowStart) {
                // We are the second item in a row of squares
                layouts.push("square")
                isRowStart = true // Next item starts a new row
            } else {
                // We are at the start of a row. Decide: Wide or Square?
                // Pseudo-random based on index to be stable across renders
                // Pattern: Varied mix. 
                // (index * 7 + 3) % 10: 
                // 0: 3 (>6? No) -> Square
                // 1: 0 (No) -> Square
                // ...
                const seed = (index * 7 + 3) % 10
                // 40% chance of Wide Row (Seed 7, 8, 9, 0?) -> Let's try threshold 6
                const isWide = seed > 5

                // ALSO: Check if this is the LAST item. If so, it MUST be Wide to fill the row (unless we want a half-empty row).
                // Let's force full width for the very last item if it's at row start.
                const isLast = index === pizzas.length - 1

                if (isWide || isLast) {
                    layouts.push("landscape")
                    // isRowStart remains true for next item
                } else {
                    layouts.push("square")
                    isRowStart = false // Next item must complete this row
                }
            }
        })

        // If we ended with expecting a pair (isRowStart === false), it means the loop finished.
        // But the check `isLast` above handles the "Last item at Row Start" case.
        // What if we had a "Square" decision at index N-1, and N does not exist?
        // The loop runs for N items.
        // Item N-1 (Last): 
        // If isRowStart was true: We decided Wide or Square. If we decided Square, isRowStart flips to false.
        // But wait, if we decided Square, we need a partner. But there IS no next item.
        // So the `isLast` check protects us: If `isLast` is true, we force Wide.
        // So we never start a 'Small' pair on the last item. Correct.

        return layouts
    })()

    return (
        <div className="flex-1 flex flex-col bg-background pb-32">
            <div className="flex items-center gap-4 px-6 py-4">
                <motion.button
                    onClick={onBack}
                    whileTap={{ scale: 0.9 }}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-card shadow-lg"
                >
                    <ChevronRight className="h-6 w-6 text-foreground" strokeWidth={1.5} />
                </motion.button>
                <h1 className="text-xl font-bold text-foreground">התפריט שלנו</h1>
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-20">
                <div className="grid grid-cols-2 gap-3">
                    {pizzas.map((pizza, index) => {
                        const layout = cardLayouts[index]
                        const isWide = layout === "landscape"

                        return (
                            <motion.div
                                key={pizza.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={isWide ? "col-span-2" : "col-span-1"}
                            >
                                <PizzaCard
                                    {...pizza}
                                    aspectRatio={layout}
                                    compact
                                    onClick={() => onNavigate("pizza-details", pizza.id)}
                                />
                            </motion.div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
