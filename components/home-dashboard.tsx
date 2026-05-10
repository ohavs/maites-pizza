"use client"

import { motion, useMotionValue, animate as fmAnimate, useTransform, type AnimationPlaybackControls } from "framer-motion"
import { ChevronLeft } from "lucide-react"
import { pizzas } from "@/lib/data"
import { useState, useRef } from "react"
import Image from "next/image"

interface HomeDashboardProps {
  onNavigate: (view: string, id?: number) => void
}

const SIDE_OFFSET = 155
const PIZZA_SIZE = 300

export function HomeDashboard({ onNavigate }: HomeDashboardProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const dragX = useMotionValue(0)
  const isDragging = useRef(false)
  const currentAnim = useRef<AnimationPlaybackControls | null>(null)
  const queuedDir = useRef<number | null>(null)
  const pendingDir = useRef<number | null>(null)
  const activeIndexRef = useRef(0)
  activeIndexRef.current = activeIndex

  const count = pizzas.length
  const getIndex = (i: number) => ((i % count) + count) % count
  const activePizza = pizzas[activeIndex]

  // Force-finish any in-flight animation and commit its state change
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
    const targetX = -dir * SIDE_OFFSET
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
        // Process queued swipe
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

  // Render 5 slots so wrap-around is seamless (buffer slots off-screen)
  const slots = [-2, -1, 0, 1, 2]

  return (
    <div className="flex-1 flex flex-col overflow-hidden pb-[100px] min-h-0 touch-pan-y overscroll-none">
      {/* Hero Banner - Build Your Own */}
      <div className="px-4 pt-4 mb-2 shrink-0">
        <motion.div
          onClick={() => onNavigate("builder")}
          whileTap={{ scale: 0.98 }}
          className="relative overflow-hidden rounded-[24px] bg-[#1a1a1a] shadow-xl cursor-pointer"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-transparent z-10" />
          <div className="absolute -right-16 -bottom-16 w-64 h-64 opacity-50 z-0">
            <Image src="/images/margherita.webp" alt="Build your pizza" fill className="object-contain drop-shadow-2xl" />
          </div>
          <div className="relative z-20 p-5 sm:p-6 text-white min-h-[120px] flex flex-col justify-between">
            <div>
              <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold tracking-wider mb-1.5">חדש</span>
              <h2 className="text-2xl font-black leading-tight text-white/90">פיצה בהרכבה אישית</h2>
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-orange-400 font-medium text-sm">
              <span>התחל להרכיב</span>
              <ChevronLeft className="w-4 h-4" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Carousel Section */}
      <div className="flex-1 flex flex-col shrink min-h-0 overflow-hidden relative">
        <div className="flex items-center justify-between px-4 shrink-0 z-20 relative">
          <h2 className="text-xl font-bold text-foreground">מומלצות בשבילך</h2>
          <button onClick={() => onNavigate("menu")} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            לתפריט המלא
          </button>
        </div>

        {/* Text Area */}
        <div className="h-16 flex flex-col items-center justify-center px-4 z-20 pointer-events-none shrink-0 relative mt-2">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="text-center"
          >
            <h3 className="text-2xl font-black text-foreground leading-tight">{activePizza?.name}</h3>
            <p className="text-xl font-bold text-primary mt-0.5">₪{activePizza?.price.toFixed(2)}</p>
          </motion.div>
        </div>

        {/* Carousel Track — parent moves with drag, children are at fixed slot offsets */}
        <div className="relative flex-1 flex items-center justify-center z-10 overflow-hidden w-full touch-pan-y">
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
                <SlotPizza
                  key={`slot-${slot}`}
                  pizza={pizza}
                  slot={slot}
                  dragX={dragX}
                  onClick={() => {
                    if (isDragging.current) return
                    if (slot === 0) onNavigate("pizza-details", pizza.id)
                    else if (slot === -1) goTo(-1)
                    else if (slot === 1) goTo(1)
                  }}
                />
              )
            })}
          </motion.div>

          {/* Dot indicators */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-30">
            {pizzas.map((_, i) => (
              <button
                key={i}
                onClick={() => { setActiveIndex(i); dragX.set(0) }}
                className={`rounded-full transition-all duration-300 ${i === activeIndex ? "w-6 h-2 bg-orange-500" : "w-2 h-2 bg-foreground/20"}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function SlotPizza({ pizza, slot, dragX, onClick }: {
  pizza: (typeof pizzas)[0]
  slot: number
  dragX: ReturnType<typeof useMotionValue<number>>
  onClick: () => void
}) {
  const baseX = slot * SIDE_OFFSET

  const opacity = useTransform(dragX, (drag) => {
    const dist = Math.abs(baseX + drag)
    return Math.max(0.25, 1 - (dist / SIDE_OFFSET) * 0.75)
  })

  const scale = useTransform(dragX, (drag) => {
    const dist = Math.abs(baseX + drag)
    return Math.max(0.7, 1 - (dist / SIDE_OFFSET) * 0.3)
  })

  // Rotate 180° as pizza travels one full SIDE_OFFSET distance
  const rotate = useTransform(dragX, (drag) => {
    return ((baseX + drag) / SIDE_OFFSET) * 180
  })

  // Hide buffer slots that are far off-screen
  const visibility = useTransform(dragX, (drag) => {
    const dist = Math.abs(baseX + drag)
    return dist > SIDE_OFFSET * 1.8 ? "hidden" : "visible"
  })

  return (
    <motion.div
      onClick={onClick}
      className="absolute"
      style={{ x: baseX, width: PIZZA_SIZE, height: PIZZA_SIZE, opacity, scale, rotate, visibility }}
    >
      <Image
        src={pizza?.image || "/placeholder.svg"}
        alt={pizza?.name}
        fill
        className="object-contain pointer-events-none"
        draggable={false}
        priority
      />
    </motion.div>
  )
}
