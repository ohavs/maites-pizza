"use client"

import { motion } from "framer-motion"
import { ChevronRight } from "lucide-react"
import Image from "next/image"
import { pizzas } from "@/lib/data"

interface MenuGridProps {
    onBack: () => void
    onNavigate: (view: string, id?: number) => void
}

export function MenuGrid({ onBack, onNavigate }: MenuGridProps) {
    return (
        <div className="flex-1 flex flex-col bg-background pb-32 min-h-0 h-full w-full">
            <div className="flex items-center gap-4 px-6 py-4 border-b border-border/40 shrink-0">
                <motion.button
                    onClick={onBack}
                    whileTap={{ scale: 0.9 }}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-card shadow-sm border border-border/50"
                >
                    <ChevronRight className="h-5 w-5 text-foreground" strokeWidth={1.5} />
                </motion.button>
                <h1 className="text-xl font-bold text-foreground">התפריט שלנו</h1>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-6">
                <div className="flex flex-col gap-4">
                    {pizzas.map((pizza, index) => (
                        <motion.div
                            key={pizza.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => onNavigate("pizza-details", pizza.id)}
                            className="flex items-center gap-4 bg-card rounded-2xl p-3 shadow-sm border border-border/50 cursor-pointer hover:bg-muted/50 transition-colors"
                        >
                            {/* Image on right (RTL layout) */}
                            <div className="relative h-20 w-20 shrink-0 rounded-xl overflow-hidden bg-muted/20">
                                <Image
                                    src={pizza.image || "/placeholder.svg"}
                                    alt={pizza.name}
                                    fill
                                    className="object-contain p-1 drop-shadow-md"
                                />
                            </div>
                            
                            {/* Info in middle */}
                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                                <h3 className="font-bold text-foreground text-lg truncate leading-tight">
                                    {pizza.name}
                                </h3>
                                <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-snug">
                                    {pizza.ingredients.join(', ')}
                                </p>
                            </div>
                            
                            {/* Price on Left */}
                            <div className="shrink-0 pl-2">
                                <span className="font-bold text-primary text-lg">
                                    ₪{pizza.price.toFixed(2)}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    )
}
