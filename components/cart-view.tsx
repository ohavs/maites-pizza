"use client"

import { useState, useEffect, useRef } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Trash2, ShoppingBag, Pencil } from "lucide-react"

import { CartItem } from "@/lib/types"
import { PizzaVisualizer } from "./pizza-visualizer"

interface CartViewProps {
    items?: CartItem[]
    onEditItem?: (item: CartItem) => void
    onRemoveItem?: (id: string) => void
}

export function CartView({ items = [], onEditItem, onRemoveItem }: CartViewProps) {
    const total = items.reduce((acc, item) => acc + (item.price * item.quantity), 0)
    const [confirmingId, setConfirmingId] = useState<string | null>(null)
    const confirmingItem = confirmingId ? items.find(i => i.id === confirmingId) : null
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => { scrollRef.current?.scrollTo(0, 0) }, [])

    return (
        <div className="flex-1 flex flex-col overflow-hidden bg-background">
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto pb-[260px] pt-6"
            >
                <h1 className="mb-4 px-4 text-2xl font-bold text-foreground">ההזמנה שלי</h1>

                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 text-center mt-20">
                        <div className="mb-4 rounded-full bg-muted p-6">
                            <ShoppingBag className="h-10 w-10 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-medium text-foreground">הסל שלך ריק</h3>
                        <p className="mt-2 text-sm text-muted-foreground">הוסיפו כמה פיצות טעימות כדי להתחיל</p>
                    </div>
                ) : (
                    <div className="space-y-3 px-4">
                        <AnimatePresence initial={false}>
                            {items.map((item, index) => (
                                <motion.div
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: 80, transition: { duration: 0.2 } }}
                                    transition={{ delay: index * 0.06, type: "spring", stiffness: 300, damping: 28 }}
                                    className="rounded-[26px] bg-card border border-border/15 shadow-[0_3px_18px_rgba(0,0,0,0.07)] overflow-hidden"
                                >
                                    <div className="flex items-center">
                                        {/* Pizza — RIGHT in RTL, fills left edge of card */}
                                        <div
                                            className="relative h-[155px] w-[155px] shrink-0"
                                            style={{ filter: "drop-shadow(0 8px 20px rgba(0,0,0,0.18))" }}
                                        >
                                            {item.customToppings ? (
                                                <PizzaVisualizer selectedToppings={item.customToppings} size={155} />
                                            ) : (
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="w-full h-full object-contain"
                                                />
                                            )}
                                        </div>

                                        {/* Info — LEFT in RTL */}
                                        <div className="flex-1 flex flex-col gap-2 px-4 py-4 min-w-0">
                                            <h3 className="text-[16px] font-bold text-foreground leading-tight line-clamp-2">
                                                {item.name}
                                            </h3>
                                            <div className="flex items-center gap-2.5">
                                                <span className="text-[14px] font-bold text-primary tabular-nums">
                                                    ₪{(item.price * item.quantity).toFixed(2)}
                                                </span>
                                                <motion.button
                                                    onClick={() => setConfirmingId(item.id)}
                                                    whileTap={{ scale: 0.88 }}
                                                    className="flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                                                    title="הסר"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </motion.button>
                                                {item.customToppings && onEditItem && (
                                                    <motion.button
                                                        onClick={() => onEditItem(item)}
                                                        whileTap={{ scale: 0.88 }}
                                                        className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                                                        title="ערוך פיצה"
                                                    >
                                                        <Pencil className="h-3.5 w-3.5" />
                                                    </motion.button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Checkout Bar — fixed above bottom nav */}
            {items.length > 0 && (
                <div className="fixed bottom-32 left-6 right-6 z-40">
                    <div className="rounded-[30px] bg-white/90 backdrop-blur-xl border border-white/20 p-4 shadow-2xl">
                        <div className="mb-3 flex items-center justify-between px-2">
                            <span className="text-muted-foreground text-sm">סה"כ לתשלום</span>
                            <span className="text-xl font-bold text-foreground tabular-nums">₪{total.toFixed(2)}</span>
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

            {/* Remove-confirmation modal */}
            <AnimatePresence>
                {confirmingItem && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 backdrop-blur-sm px-6"
                        onClick={() => setConfirmingId(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.92, opacity: 0, y: 12 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.92, opacity: 0, y: 12 }}
                            transition={{ type: "spring", stiffness: 380, damping: 28 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-[340px] rounded-[28px] bg-card border border-white/40 p-6 shadow-2xl"
                        >
                            <div className="flex flex-col items-center text-center">
                                <div className="mb-4 rounded-full bg-red-50 p-3.5">
                                    <Trash2 className="h-6 w-6 text-red-500" />
                                </div>
                                <h3 className="text-lg font-bold text-foreground mb-1.5">להסיר את הפיצה?</h3>
                                <p className="text-sm text-muted-foreground mb-5">
                                    הפיצה תוסר מההזמנה שלך
                                </p>
                                <div className="flex gap-2 w-full">
                                    <motion.button
                                        onClick={() => setConfirmingId(null)}
                                        whileTap={{ scale: 0.97 }}
                                        className="flex-1 h-11 rounded-full bg-muted text-foreground font-semibold"
                                    >
                                        ביטול
                                    </motion.button>
                                    <motion.button
                                        onClick={() => {
                                            if (onRemoveItem) onRemoveItem(confirmingItem.id)
                                            setConfirmingId(null)
                                        }}
                                        whileTap={{ scale: 0.97 }}
                                        className="flex-1 h-11 rounded-full bg-red-500 text-white font-semibold shadow-lg shadow-red-500/20"
                                    >
                                        הסר
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
