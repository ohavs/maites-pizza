"use client"

import { motion } from "framer-motion"
import { Trash2, Minus, Plus, ShoppingBag, Pencil } from "lucide-react"

import { CartItem } from "@/lib/types"
import { PizzaVisualizer } from "./pizza-visualizer"

interface CartViewProps {
    items?: CartItem[]
    onEditItem?: (item: CartItem) => void
}

export function CartView({ items = [], onEditItem }: CartViewProps) {
    const total = items.reduce((acc, item) => acc + (item.price * item.quantity), 0)

    return (
        <div className="flex-1 flex flex-col overflow-hidden bg-background">
            <div className="flex-1 overflow-y-auto px-6 pb-40 pt-6">
                <h1 className="mb-6 text-2xl font-bold text-foreground">ההזמנה שלי</h1>

                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 text-center mt-20">
                        <div className="mb-4 rounded-full bg-muted p-6">
                            <ShoppingBag className="h-10 w-10 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-medium text-foreground">הסל שלך ריק</h3>
                        <p className="mt-2 text-sm text-muted-foreground">הוסיפו כמה פיצות טעימות כדי להתחיל</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {items.map((item, index) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-start gap-4 rounded-[24px] bg-card p-4 shadow-sm"
                            >
                                <div className="relative h-20 w-20 overflow-hidden rounded-2xl bg-muted shrink-0">
                                    {item.customToppings ? (
                                        <PizzaVisualizer selectedToppings={item.customToppings} size={80} />
                                    ) : (
                                        <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                                    )}
                                </div>

                                <div className="flex-1">
                                    <div className="flex justify-between">
                                        <h3 className="font-bold text-foreground">{item.name}</h3>
                                        <p className="font-bold text-primary">₪{item.price.toFixed(2)}</p>
                                    </div>

                                    {item.toppings.length > 0 && (
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            {item.toppings.join(", ")}
                                        </p>
                                    )}

                                    <div className="mt-3 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <button className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-foreground hover:bg-muted/80">
                                                <Minus className="h-3 w-3" />
                                            </button>
                                            <span className="text-sm font-semibold w-4 text-center">{item.quantity}</span>
                                            <button className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-foreground hover:bg-muted/80">
                                                <Plus className="h-3 w-3" />
                                            </button>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {item.customToppings && onEditItem && (
                                                <button
                                                    onClick={() => onEditItem(item)}
                                                    className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                                                    title="ערוך פיצה"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </button>
                                            )}
                                            <button className="flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Checkout Bar - Elevated to avoid nav overlap */}
            {items.length > 0 && (
                <div className="absolute bottom-28 left-6 right-6 z-40">
                    <div className="rounded-[30px] bg-white/90 backdrop-blur-xl border border-white/20 p-4 shadow-2xl">
                        <div className="mb-3 flex items-center justify-between px-2">
                            <span className="text-muted-foreground text-sm">סה"כ לתשלום</span>
                            <span className="text-xl font-bold text-foreground">₪{total.toFixed(2)}</span>
                        </div>
                        <motion.button
                            whileTap={{ scale: 0.98 }}
                            className="w-full rounded-[20px] bg-gradient-to-r from-primary to-orange-400 py-3 text-center shadow-lg shadow-orange-500/20"
                        >
                            <span className="text-lg font-bold text-primary-foreground">
                                מעבר לתשלום
                            </span>
                        </motion.button>
                    </div>
                </div>
            )}
        </div>
    )
}
