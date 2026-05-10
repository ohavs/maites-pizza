"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ChevronRight, ChevronLeft, ShoppingCart, Plus } from "lucide-react"
import Image from "next/image"
import { CartItem } from "@/lib/types"
import { pizzas } from "@/lib/data"

interface PizzaDetailsViewProps {
    pizza: {
        id: number
        name: string
        description: string
        price: number
        rating: number
        image: string
        ingredients: string[]
        calories: number
    }
    onBack: () => void
    onAddToCart: (item: CartItem) => void
    onNavigate?: (view: string, id?: number) => void
}

export function PizzaDetailsView({ pizza, onBack, onAddToCart, onNavigate }: PizzaDetailsViewProps) {
    const [quantity, setQuantity] = useState(1)

    const currentIndex = pizzas.findIndex(p => p.id === pizza.id)
    const nextPizza = pizzas[(currentIndex + 1) % pizzas.length]
    const prevPizza = pizzas[(currentIndex - 1 + pizzas.length) % pizzas.length]

    const handleAdd = () => {
        const newItem: CartItem = {
            id: Math.random().toString(36).substr(2, 9),
            name: pizza.name,
            toppings: [], // Pre-configured pizzas don't show individual topping list in cart usually, or we can list ingredients
            price: pizza.price,
            quantity: quantity,
            image: pizza.image
        }
        onAddToCart(newItem)
    }

    return (
        <div className="flex flex-1 flex-col bg-background h-full overflow-hidden">
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto scrollbar-hide">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 absolute top-0 left-0 right-0 z-20">
                    <motion.button
                        onClick={onBack}
                        whileTap={{ scale: 0.9 }}
                        className="flex h-12 w-12 items-center justify-center rounded-full bg-white/80 backdrop-blur-md shadow-lg"
                    >
                        <ChevronRight className="h-6 w-6 text-foreground" strokeWidth={1.5} />
                    </motion.button>
                </div>

                {/* Hero Image */}
                <div className="relative h-[40vh] w-full">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="absolute inset-0 flex items-center justify-center p-4"
                    >
                        <motion.div 
                            className="relative w-full h-full max-w-[360px]"
                            drag="x"
                            dragConstraints={{ left: 0, right: 0 }}
                            onDragEnd={(e, { offset, velocity }) => {
                                const swipe = offset.x;
                                if (swipe < -50) {
                                    onNavigate && onNavigate("pizza-details", nextPizza.id);
                                } else if (swipe > 50) {
                                    onNavigate && onNavigate("pizza-details", prevPizza.id);
                                }
                            }}
                        >
                            <Image
                                src={pizza.image}
                                alt={pizza.name}
                                fill
                                className="object-contain"
                                priority
                            />
                        </motion.div>
                    </motion.div>

                    {/* Navigation Arrows */}
                    {onNavigate && (
                        <>
                            <button
                                onClick={() => onNavigate("pizza-details", nextPizza.id)}
                                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 text-foreground/70 hover:text-foreground transition-colors z-20"
                            >
                                <ChevronLeft className="w-8 h-8" strokeWidth={1.5} />
                            </button>
                            <button
                                onClick={() => onNavigate("pizza-details", prevPizza.id)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-foreground/70 hover:text-foreground transition-colors z-20"
                            >
                                <ChevronRight className="w-8 h-8" strokeWidth={1.5} />
                            </button>
                        </>
                    )}
                </div>
                {/* Content */}
                <div className="relative -mt-10 rounded-t-[40px] bg-background px-6 pt-10 pb-6 border-t border-border/20">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-foreground">{pizza.name}</h1>
                        </div>
                        <div className="text-2xl font-bold text-primary">
                            ₪{pizza.price}
                        </div>
                    </div>

                    <div className="mb-6">
                        <p className="text-muted-foreground leading-relaxed text-lg">
                            {pizza.description}
                        </p>
                    </div>

                    <div className="mb-8">
                        <h3 className="font-bold text-lg mb-2">מרכיבים</h3>
                        <div className="grid grid-cols-2 gap-y-3 gap-x-4 mt-2">
                            {pizza.ingredients.map((ing) => (
                                <div key={ing} className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                                    <span className="text-sm font-medium text-foreground/80">{ing}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    {/* Bottom spacing */}
                    <div className="h-40"></div>
                </div>
            </div>

            {/* Fixed Footer Actions */}
            <div className="fixed bottom-[120px] left-0 right-0 px-6 z-50 pointer-events-none flex justify-center">
                <motion.button
                    onClick={handleAdd}
                    whileTap={{ scale: 0.9 }}
                    className="w-full max-w-[280px] h-14 bg-orange-500/80 backdrop-blur-md text-white border border-white/20 rounded-full shadow-xl flex items-center justify-center gap-3 font-bold text-lg pointer-events-auto"
                >
                    <motion.div
                        whileHover={{ x: -5 }}
                        whileTap={{ x: 15, rotate: -10 }}
                        transition={{ type: "spring", stiffness: 300, damping: 10 }}
                    >
                        <ShoppingCart className="w-5 h-5" />
                    </motion.div>
                    הוספה לסל
                </motion.button>
            </div>
        </div>
    )
}
