"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ChevronRight, Clock, Flame, Star, Minus, Plus } from "lucide-react"
import Image from "next/image"
import { CartItem } from "@/lib/types"

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
}

export function PizzaDetailsView({ pizza, onBack, onAddToCart }: PizzaDetailsViewProps) {
    const [quantity, setQuantity] = useState(1)

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
            <div className="flex-1 overflow-y-auto scrollbar-hide pb-40">
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
                <div className="relative h-[40vh] w-full bg-muted/20">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="absolute inset-0 flex items-center justify-center p-8"
                    >
                        <div className="relative w-full h-full max-w-[300px] mx-auto aspect-square">
                            <Image
                                src={pizza.image}
                                alt={pizza.name}
                                fill
                                className="object-contain drop-shadow-2xl"
                                priority
                            />
                        </div>
                    </motion.div>
                </div>

                {/* Content */}
                <div className="relative -mt-10 rounded-t-[40px] bg-card px-6 pt-10 pb-6 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] min-h-[50vh]">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-foreground">{pizza.name}</h1>
                            <div className="flex items-center gap-2 mt-1">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                <span className="font-bold">{pizza.rating}</span>
                                <span className="text-muted-foreground text-sm">(128 ביקורות)</span>
                            </div>
                        </div>
                        <div className="text-2xl font-bold text-primary">
                            ₪{pizza.price}
                        </div>
                    </div>

                    <div className="flex gap-4 mb-6">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-100 text-orange-600 text-sm font-medium">
                            <Flame className="w-4 h-4" />
                            {pizza.calories} קלוריות
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 text-blue-600 text-sm font-medium">
                            <Clock className="w-4 h-4" />
                            20-25 דק'
                        </div>
                    </div>

                    <div className="mb-6">
                        <h3 className="font-bold text-lg mb-2">תיאור</h3>
                        <p className="text-muted-foreground leading-relaxed">
                            {pizza.description}
                        </p>
                    </div>

                    <div className="mb-8">
                        <h3 className="font-bold text-lg mb-2">מרכיבים</h3>
                        <div className="flex flex-wrap gap-2">
                            {pizza.ingredients.map((ing) => (
                                <span key={ing} className="px-3 py-1 rounded-xl bg-muted text-sm font-medium text-foreground">
                                    {ing}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="absolute bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-white/20 px-6 pb-28 pt-4 z-30">
                <div className="flex items-center gap-4 max-w-md mx-auto">
                    <motion.button
                        onClick={handleAdd}
                        whileTap={{ scale: 0.98 }}
                        className="flex-1 h-14 bg-gradient-to-r from-primary to-orange-400 text-primary-foreground rounded-2xl font-bold shadow-lg flex items-center justify-between px-6 text-lg"
                    >
                        <div className="flex items-center gap-2">
                            <span>הוספה לסל</span>
                            {quantity > 1 && <span className="text-sm opacity-80 bg-black/10 px-2 py-0.5 rounded-full">x{quantity}</span>}
                        </div>
                        <span>₪{(pizza.price * quantity).toFixed(2)}</span>
                    </motion.button>
                </div>
            </div>

        </div>
    )
}
