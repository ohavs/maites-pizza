"use client"

import { motion, AnimatePresence, useTransform, useMotionValue } from "framer-motion"
import { ChevronLeft } from "lucide-react"
import { pizzas } from "@/lib/data"
import { useState, useEffect, useRef } from "react"
import Image from "next/image"

interface HomeDashboardProps {
  onNavigate: (view: string, id?: number) => void
}

export function HomeDashboard({ onNavigate }: HomeDashboardProps) {
  const [displayPizzas, setDisplayPizzas] = useState<typeof pizzas>([])
  const [activeIndex, setActiveIndex] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Global rotation based on scroll position - acts like rolling wheels
  const scrollX = useMotionValue(0)
  const rotate = useTransform(scrollX, (v) => v / 1.5)

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    scrollX.set(e.currentTarget.scrollLeft)
  }

  useEffect(() => {
    // Create a long array for pseudo-infinite scroll feel
    const shuffled = [...pizzas].sort(() => 0.5 - Math.random())
    setDisplayPizzas([...shuffled, ...shuffled, ...shuffled])
  }, [])

  // Setup intersection observer to detect the center item for text updates
  useEffect(() => {
    if (!scrollRef.current || displayPizzas.length === 0) return

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
          setActiveIndex(Number(entry.target.getAttribute('data-index')))
        }
      })
    }, { 
      root: scrollRef.current,
      threshold: 0.6 
    })

    const children = scrollRef.current.children
    for (let i = 0; i < children.length; i++) {
      observer.observe(children[i])
    }

    // Scroll to the middle set on mount
    const middleChild = children[Math.floor(displayPizzas.length / 2)] as HTMLElement
    if (middleChild) {
      scrollRef.current.scrollTo({ left: middleChild.offsetLeft, behavior: "instant" })
      // Initialize rotation to match initial scroll
      scrollX.set(middleChild.offsetLeft)
    }

    return () => observer.disconnect()
  }, [displayPizzas, scrollX])

  if (!displayPizzas.length) return null

  const activePizza = displayPizzas[activeIndex]

  return (
    <div className="flex-1 flex flex-col overflow-hidden pb-20 min-h-0">
      {/* Hero Banner - Build Your Own */}
      <div className="px-4 pt-4 mb-4 shrink-0">
        <motion.div
          onClick={() => onNavigate("builder")}
          whileTap={{ scale: 0.98 }}
          className="relative overflow-hidden rounded-[24px] bg-[#1a1a1a] shadow-xl cursor-pointer"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-transparent z-10" />
          
          <div className="absolute -right-10 -bottom-10 w-48 h-48 opacity-40 z-0">
            <Image
              src="/images/pizza-base.png"
              alt="Build your pizza"
              fill
              className="object-contain drop-shadow-2xl"
            />
          </div>

          <div className="relative z-20 p-5 sm:p-6 text-white min-h-[140px] flex flex-col justify-between">
            <div>
              <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold tracking-wider mb-1.5">
                חדש
              </span>
              <h2 className="text-2xl font-black leading-tight text-white/90">
                פיצה בהרכבה אישית
              </h2>
            </div>
            
            <div className="flex items-center gap-1.5 mt-2 text-orange-400 font-medium text-sm">
              <span>התחל להרכיב</span>
              <ChevronLeft className="w-4 h-4" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Rolling Carousel */}
      <div className="flex-1 flex flex-col shrink min-h-0 overflow-hidden">
        <div className="flex items-center justify-between mb-4 px-4">
          <h2 className="text-xl font-bold text-foreground">מומלצות בשבילך</h2>
          <button
            onClick={() => onNavigate("menu")}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            לתפריט המלא
          </button>
        </div>

        {/* Text Area (Crossfades) */}
        <div className="h-20 flex flex-col items-center justify-center px-4 z-20 pointer-events-none">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="text-center"
            >
              <h3 className="text-2xl font-black text-foreground leading-tight">
                {activePizza?.name}
              </h3>
              <p className="text-xl font-bold text-primary mt-1">
                ₪{activePizza?.price.toFixed(2)}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Scrollable Pizza Track */}
        <div 
          ref={scrollRef}
          onScroll={handleScroll}
          className="relative flex-1 flex overflow-x-auto overflow-y-hidden snap-x snap-mandatory scrollbar-hide py-4 items-center"
          style={{ scrollBehavior: 'smooth' }}
        >
          {displayPizzas.map((pizza, idx) => (
            <div 
              key={`${pizza.id}-${idx}`}
              data-index={idx}
              className="snap-center w-full shrink-0 flex items-center justify-center px-8"
              style={{ scrollSnapStop: 'always' }}
              onClick={() => {
                if (idx === activeIndex) onNavigate("pizza-details", pizza.id)
                else {
                   const child = scrollRef.current?.children[idx] as HTMLElement
                   if (child) scrollRef.current?.scrollTo({ left: child.offsetLeft, behavior: 'smooth' })
                }
              }}
            >
              <motion.div
                style={{ rotate }} // Wheel rolling effect based on native scroll
                className="relative w-56 h-56 cursor-pointer"
              >
                <Image
                  src={pizza.image || "/placeholder.svg"}
                  alt={pizza.name}
                  fill
                  className="object-contain"
                  priority={idx >= displayPizzas.length / 2 - 1 && idx <= displayPizzas.length / 2 + 1}
                />
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
