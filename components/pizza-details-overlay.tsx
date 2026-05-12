"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence, useMotionValue, animate as fmAnimate, useTransform } from "framer-motion"
import { X, ShoppingCart, ChevronLeft, ChevronRight, CheckCircle } from "lucide-react"
import Image from "next/image"
import { CartItem } from "@/lib/types"
import { pizzas } from "@/lib/data"

interface PizzaDetailsOverlayProps {
    pizzaId: number
    onClose: () => void
    onAddToCart: (item: CartItem) => void
}

const SWIPE_OFFSET = 180
const PIZZA_DISPLAY_SIZE = 280

export function PizzaDetailsOverlay({ pizzaId, onClose, onAddToCart }: PizzaDetailsOverlayProps) {
    const [activeIndex, setActiveIndex] = useState(() => {
        const idx = pizzas.findIndex(p => p.id === pizzaId)
        return idx >= 0 ? idx : 0
    })

    const dragX = useMotionValue(0)
    const isDragging = useRef(false)
    const currentAnim = useRef<ReturnType<typeof fmAnimate> | null>(null)
    const pendingDir = useRef<number | null>(null)
    const queuedDir = useRef<number | null>(null)
    const activeIndexRef = useRef(activeIndex)
    activeIndexRef.current = activeIndex
    const [justAdded, setJustAdded] = useState(false)
    const justAddedTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

    const count = pizzas.length
    const getIndex = (i: number) => ((i % count) + count) % count
    const activePizza = pizzas[activeIndex]

    const commitPending = () => {
        if (currentAnim.current) {
            currentAnim.current.stop()
            currentAnim.current = null
        }
        if (pendingDir.current !== null) {
            const dir = pendingDir.current
            pendingDir.current = null
            const newIdx = getIndex(activeIndexRef.current + dir)
            setActiveIndex(newIdx)
            activeIndexRef.current = newIdx
        }
        queuedDir.current = null
        dragX.set(0)
    }

    const startAnimation = (dir: number) => {
        pendingDir.current = dir
        const targetX = -dir * SWIPE_OFFSET
        currentAnim.current = fmAnimate(dragX, targetX, {
            type: "tween", duration: 0.35, ease: [0.25, 1, 0.5, 1],
            onComplete: () => {
                const d = pendingDir.current
                pendingDir.current = null
                currentAnim.current = null
                if (d !== null) {
                    const newIdx = getIndex(activeIndexRef.current + d)
                    setActiveIndex(newIdx)
                    activeIndexRef.current = newIdx
                }
                dragX.set(0)
                if (queuedDir.current !== null) {
                    const next = queuedDir.current
                    queuedDir.current = null
                    startAnimation(next)
                }
            }
        })
    }

    const goTo = (dir: number) => {
        if (currentAnim.current) {
            queuedDir.current = dir
            return
        }
        startAnimation(dir)
    }

    const handleDragEnd = (_: any, info: { offset: { x: number }; velocity: { x: number } }) => {
        if (info.offset.x < -50 || info.velocity.x < -500) {
            goTo(1)
        } else if (info.offset.x > 50 || info.velocity.x > 500) {
            goTo(-1)
        } else {
            fmAnimate(dragX, 0, { type: "tween", duration: 0.25, ease: "easeOut" })
        }
    }

    const handleAdd = () => {
        const newItem: CartItem = {
            id: Math.random().toString(36).substr(2, 9),
            name: activePizza.name,
            toppings: [],
            price: activePizza.price,
            quantity: 1,
            image: activePizza.image,
        }
        onAddToCart(newItem)
        if (justAddedTimer.current) clearTimeout(justAddedTimer.current)
        setJustAdded(true)
        justAddedTimer.current = setTimeout(() => setJustAdded(false), 1400)
    }

    const slots = [-2, -1, 0, 1, 2]

    return (
        <motion.div
            className="fixed inset-0 z-[100] flex flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
        >
            {/* Semi-transparent backdrop */}
            <motion.div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            />

            {/* Close button */}
            <motion.button
                onClick={onClose}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ delay: 0.15 }}
                whileTap={{ scale: 0.9 }}
                className="absolute top-6 right-6 z-[110] flex h-11 w-11 items-center justify-center rounded-full bg-white/20 backdrop-blur-xl border border-white/30 text-white shadow-lg"
            >
                <X className="h-5 w-5" strokeWidth={2} />
            </motion.button>

            {/* Pizza Carousel Area — top half */}
            <div className="relative flex-1 flex items-center justify-center z-[101] overflow-hidden">
                <motion.div
                    className="absolute inset-0 flex items-center justify-center cursor-grab active:cursor-grabbing"
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.3}
                    style={{ x: dragX }}
                    onDragStart={() => {
                        commitPending()
                        isDragging.current = true
                    }}
                    onDragEnd={(e, info) => {
                        handleDragEnd(e, info)
                        requestAnimationFrame(() => { isDragging.current = false })
                    }}
                >
                    {slots.map((slot) => {
                        const pizzaIndex = getIndex(activeIndex + slot)
                        const pizza = pizzas[pizzaIndex]
                        return (
                            <OverlaySlotPizza
                                key={`overlay-slot-${slot}`}
                                pizza={pizza}
                                slot={slot}
                                dragX={dragX}
                            />
                        )
                    })}
                </motion.div>

                {/* Dot indicators */}
                <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-[105]">
                    {pizzas.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => { commitPending(); setActiveIndex(i); dragX.set(0) }}
                            className={`rounded-full transition-all duration-300 ${i === activeIndex
                                ? "w-6 h-2 bg-orange-400"
                                : "w-2 h-2 bg-white/40"
                                }`}
                        />
                    ))}
                </div>
            </div>

            {/* Bottom Glass Panel */}
            <motion.div
                className="relative z-[102] mx-4 mb-4 rounded-[32px] overflow-hidden"
                initial={{ y: 120, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 120, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.1 }}
            >
                {/* Glass background */}
                <div className="absolute inset-0 bg-white/70 backdrop-blur-2xl border border-white/50 rounded-[32px]" />

                {/* Content */}
                <div className="relative z-10 px-6 pt-6 pb-5">
                    {/* Pizza Info — animated on change */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeIndex}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={{ duration: 0.2 }}
                        >
                            {/* Name & Price */}
                            <div className="flex justify-between items-start mb-3">
                                <h2 className="text-2xl font-black text-[#1A1A1A] leading-tight">{activePizza.name}</h2>
                                <span className="text-2xl font-black text-orange-500 shrink-0 mr-3">₪{activePizza.price.toFixed(2)}</span>
                            </div>

                            {/* Description */}
                            <p className="text-sm text-[#1A1A1A]/60 leading-relaxed mb-1">
                                {activePizza.description}
                            </p>
                            <p className="text-[10px] text-[#1A1A1A]/40 mb-4">* התמונה להמחשה בלבד</p>

                            {/* Ingredients */}
                            <div className="mb-2">
                                <h3 className="font-bold text-sm text-[#1A1A1A]/80 mb-2">מרכיבים</h3>
                                <div className="flex flex-wrap gap-2">
                                    {activePizza.ingredients.map((ing) => (
                                        <span
                                            key={ing}
                                            className="inline-flex items-center px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/15 text-xs font-semibold text-orange-700"
                                        >
                                            {ing}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Add to Cart Button */}
                    <motion.button
                        onClick={handleAdd}
                        whileTap={{ scale: 0.96 }}
                        animate={{
                            backgroundColor: justAdded ? "rgba(34, 197, 94, 0.92)" : "rgba(249, 115, 22, 0.85)",
                        }}
                        transition={{ duration: 0.25 }}
                        className="w-full mt-4 h-14 backdrop-blur-md text-white border border-white/25 rounded-full shadow-xl flex items-center px-5 overflow-hidden"
                    >
                        <AnimatePresence mode="wait" initial={false}>
                            {justAdded ? (
                                <motion.div
                                    key="added"
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    transition={{ duration: 0.2 }}
                                    className="flex items-center justify-center gap-2 w-full"
                                >
                                    <CheckCircle className="w-5 h-5" />
                                    <span className="font-bold text-lg">נוסף לסל!</span>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="default"
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    transition={{ duration: 0.2 }}
                                    className="flex items-center justify-between w-full"
                                >
                                    <motion.div
                                        whileTap={{ x: 15, rotate: -10 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 10 }}
                                    >
                                        <ShoppingCart className="w-5 h-5" />
                                    </motion.div>
                                    <span className="font-bold text-lg">הוספה לסל</span>
                                    <span className="bg-white/20 rounded-full px-3 py-1 text-sm font-bold tabular-nums">
                                        ₪{activePizza.price.toFixed(2)}
                                    </span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.button>
                </div>
            </motion.div>
        </motion.div>
    )
}


function OverlaySlotPizza({ pizza, slot, dragX }: {
    pizza: (typeof pizzas)[0]
    slot: number
    dragX: ReturnType<typeof useMotionValue<number>>
}) {
    const baseX = slot * SWIPE_OFFSET

    const opacity = useTransform(dragX, (drag) => {
        const dist = Math.abs(baseX + drag)
        return Math.max(0.2, 1 - (dist / SWIPE_OFFSET) * 0.8)
    })

    const scale = useTransform(dragX, (drag) => {
        const dist = Math.abs(baseX + drag)
        return Math.max(0.6, 1 - (dist / SWIPE_OFFSET) * 0.35)
    })

    const rotate = useTransform(dragX, (drag) => {
        return ((baseX + drag) / SWIPE_OFFSET) * 120
    })

    const visibility = useTransform(dragX, (drag) => {
        const dist = Math.abs(baseX + drag)
        return dist > SWIPE_OFFSET * 1.8 ? "hidden" : "visible"
    })

    return (
        <motion.div
            className="absolute"
            style={{
                x: baseX,
                width: PIZZA_DISPLAY_SIZE,
                height: PIZZA_DISPLAY_SIZE,
                opacity,
                scale,
                rotate,
                visibility,
            }}
        >
            <Image
                src={pizza?.image || "/placeholder.svg"}
                alt={pizza?.name}
                fill
                className="object-contain pointer-events-none drop-shadow-2xl"
                draggable={false}
                priority
            />
        </motion.div>
    )
}
