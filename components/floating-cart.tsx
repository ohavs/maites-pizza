"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ShoppingBag } from "lucide-react"

interface FloatingCartProps {
    count: number
    onClick: () => void
}

export function FloatingCart({ count, onClick }: FloatingCartProps) {
    const [isAnimating, setIsAnimating] = useState(false)

    useEffect(() => {
        if (count > 0) {
            setIsAnimating(true)
            const timer = setTimeout(() => setIsAnimating(false), 300)
            return () => clearTimeout(timer)
        }
    }, [count])

    if (count === 0) return null

    return (
        <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={onClick}
            className="fixed top-6 left-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg"
        >
            <ShoppingBag className="h-6 w-6" strokeWidth={1.5} />

            {/* Badge */}
            <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-bold text-primary shadow-sm border border-border">
                <AnimatePresence mode="wait">
                    <motion.span
                        key={count}
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.5, opacity: 0 }}
                    >
                        {count}
                    </motion.span>
                </AnimatePresence>
            </div>

            {/* Ripple/Pulse Effect on Add */}
            {isAnimating && (
                <span className="absolute inset-0 rounded-full bg-white/30 animate-ping" />
            )}
        </motion.button>
    )
}
