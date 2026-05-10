"use client"

import { motion } from "framer-motion"
import { PizzaCard } from "./pizza-card"

export function FavoritesView({ onNavigate }: { onNavigate: (view: string) => void }) {
    const favorites = [
        {
            id: 1,
            name: "פיצה פולנטה",
            price: 18.99,
            rating: 4.8,
            image: "/images/corn.webp",
        },
        {
            id: 2,
            name: "פיצה נפוליטנית",
            price: 16.99,
            rating: 4.9,
            image: "/images/basil.webp",
        },
    ]

    return (
        <div className="flex-1 overflow-y-auto px-6 pb-32 pt-6">
            <h1 className="mb-6 text-2xl font-bold text-foreground">מועדפים</h1>

            <div className="grid grid-cols-2 gap-4">
                {favorites.map((pizza, index) => (
                    <motion.div
                        key={pizza.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <PizzaCard {...pizza} onClick={() => onNavigate("builder")} />
                    </motion.div>
                ))}
            </div>
        </div>
    )
}
