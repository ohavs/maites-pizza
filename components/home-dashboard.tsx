"use client"

import { motion } from "framer-motion"
import { Search, SlidersHorizontal } from "lucide-react"
import { PizzaCard } from "./pizza-card"
import { pizzas } from "@/lib/data"

interface HomeDashboardProps {
  onNavigate: (view: string, id?: number) => void
}

import { useState, useEffect } from "react"
// ... imports

export function HomeDashboard({ onNavigate }: HomeDashboardProps) {
  const [displayPizzas, setDisplayPizzas] = useState(pizzas.slice(0, 3))
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    // Randomize on client mount
    const shuffled = [...pizzas].sort(() => 0.5 - Math.random())
    setDisplayPizzas(shuffled.slice(0, 3))
  }, [])

  return (
    <div className="flex-1 overflow-y-auto px-6 pb-32 pt-6">

      {/* Our Pizzas Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">הפיצות שלנו</h2>
          <button
            onClick={() => onNavigate("menu")}
            className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            ראה הכל
          </button>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-2 gap-3">
          {displayPizzas.map((pizza, index) => {
            const isWide = index === 0 // Dynamic bento logic for 3 items: first is wide
            return (
              <motion.div
                key={pizza.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.1 }}
                className={isWide ? "col-span-2" : "col-span-1"}
              >
                <PizzaCard
                  {...pizza}
                  isLarge={false}
                  aspectRatio={isWide ? "landscape" : "square"} // Use 'square' for smaller tiles
                  compact
                  onClick={() => onNavigate("pizza-details", pizza.id)}
                />
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* Build Your Own Card */}
      <motion.button
        onClick={() => onNavigate("builder")}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full overflow-hidden rounded-[30px] bg-gradient-to-br from-primary to-orange-400 p-5 shadow-xl text-right mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-primary-foreground/80">
              יצירה אישית
            </p>
            <h2 className="mt-1 text-xl font-bold text-primary-foreground">
              בנו את שלכם
            </h2>
            <p className="mt-1 text-xs text-primary-foreground/80">
              בחרו תוספות וצרו קסם
            </p>
          </div>
          <div className="relative h-20 w-20">
            <motion.div
              animate={{
                rotate: [0, 10, -10, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <img
                src="/images/pizza-base.png"
                alt="Build your pizza"
                className="h-full w-full object-contain drop-shadow-2xl"
              />
            </motion.div>
          </div>
        </div>
      </motion.button>
    </div>
  )
}
