"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { Star } from "lucide-react"

interface PizzaCardProps {
  name: string
  price: number
  rating: number
  image: string
  isLarge?: boolean
  aspectRatio?: "standard" | "landscape" | "square"
  compact?: boolean
  onClick?: () => void
}

export function PizzaCard({ name, price, rating, image, isLarge = false, aspectRatio = "standard", compact = false, onClick }: PizzaCardProps) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`relative overflow-hidden rounded-[30px] bg-card shadow-xl w-full 
        ${isLarge ? "min-h-[280px] p-6 text-left" :
          aspectRatio === "landscape" ? "min-h-[140px] p-4 text-left" : // Increased min-h for wide card
            aspectRatio === "square" ? "min-h-[170px] p-4 flex flex-col justify-end items-center text-center" :
              "min-h-[200px] p-6 text-left"
        }`}
    >
      {/* Pizza image - Contained inside */}
      <div
        className={`absolute z-10 ${isLarge
          ? "right-2 top-2 h-56 w-56"
          : aspectRatio === "landscape"
            ? "-right-2 top-1/2 -translate-y-1/2 h-44 w-44" // Larger for Landscape
            : aspectRatio === "square"
              ? "left-1/2 -translate-x-1/2 -top-2 h-36 w-36" // Overflow top for square
              : "right-0 top-0 h-44 w-44"
          }`}
      >
        <motion.div
          className="w-full h-full"
        >
          <Image
            src={image || "/placeholder.svg"}
            alt={name}
            width={isLarge ? 160 : 160} // Increased res for landscape too
            height={isLarge ? 160 : 160}
            className="h-full w-full object-contain drop-shadow-lg"
          />
        </motion.div>
      </div>

      {/* Content */}
      <div className={`relative z-0 flex w-full flex-col ${aspectRatio === 'landscape' ? 'justify-center items-start pr-48' : 'justify-end'}`}>
        {/* Increased padding-right for larger landscape image */}

        {/* Rating removed as requested */}

        <h3 className={`font-bold text-foreground leading-tight ${isLarge ? "text-2xl" : compact ? "text-base" : "text-lg"}`}>
          {name}
        </h3>

        {aspectRatio === 'landscape' && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2 text-right dir-rtl">
            {/* Description for wide card? Optional */}
          </p>
        )}

        <p className={`font-bold text-primary ${compact ? "mt-1 text-base" : "mt-1 text-xl"}`}>
          ₪{price.toFixed(2)}
        </p>
      </div>
    </motion.button >
  )
}
