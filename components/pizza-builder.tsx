"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronRight, Plus, Trash2, ShoppingCart } from "lucide-react"
import Image from "next/image"
import { CartItem, Coverage, SelectedTopping, Topping } from "@/lib/types"
import { toppings, toppingCategories } from "@/lib/pizza-data"
import { generateToppingPositions } from "@/lib/pizza-geometry"

function CoverageIcon({ coverage }: { coverage: Coverage }) {
  if (coverage === "whole") {
    return <div className="w-3 h-3 rounded-full bg-orange-500 shrink-0" aria-label="כל הפיצה" />
  }
  return (
    <div className="w-3 h-3 rounded-full border-[1.5px] border-orange-500 relative overflow-hidden shrink-0" aria-label={coverage === "right" ? "צד ימין" : "צד שמאל"}>
      <div className={`absolute ${coverage === "right" ? "right-0" : "left-0"} top-0 bottom-0 w-1/2 bg-orange-500`} />
    </div>
  )
}


interface PizzaBuilderProps {
  onBack: () => void
  onAddToCart?: (item: CartItem) => void
  onUpdateCartItem?: (item: CartItem) => void
  initialToppings?: SelectedTopping[]
  editingItem?: CartItem | null
}

export function PizzaBuilder({ onBack, onAddToCart, onUpdateCartItem, initialToppings, editingItem }: PizzaBuilderProps) {
  const [selectedCategory, setSelectedCategory] = useState("veggies")
  const [selectedToppings, setSelectedToppings] = useState<SelectedTopping[]>(initialToppings || [])
  const [expandedToppingId, setExpandedToppingId] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(editingItem?.quantity || 1)

  const basePrice = 12.99
  const toppingsPrice = selectedToppings.reduce((total, selected) => {
    // Find topping in any category
    let topping: Topping | undefined
    for (const category of Object.values(toppings)) {
      const found = category.find((t) => t.id === selected.id)
      if (found) {
        topping = found
        break
      }
    }
    if (topping) return total + topping.price
    return total
  }, 0)

  const totalPrice = (basePrice + toppingsPrice) * quantity

  const toggleTopping = (toppingId: string) => {
    const isSauce = toppings.sauce.some(s => s.id === toppingId)
    const sauceIds = toppings.sauce.map(s => s.id)
    setSelectedToppings((prev) => {
      const exists = prev.find(t => t.id === toppingId)
      if (exists) {
        return prev.filter(t => t.id !== toppingId)
      }
      // Sauce is single-select: remove any other sauce before adding the new one.
      const base = isSauce ? prev.filter(t => !sauceIds.includes(t.id)) : prev
      return [...base, { id: toppingId, coverage: "whole" }]
    })
    // When adding a new topping, expand it for configuration; when removing, collapse.
    setExpandedToppingId((curr) => {
      const wasSelected = selectedToppings.some(t => t.id === toppingId)
      if (wasSelected) return curr === toppingId ? null : curr
      // Sauces aren't configurable per-side, so don't expand them.
      return isSauce ? null : toppingId
    })
  }

  const removeTopping = (toppingId: string) => {
    setSelectedToppings(prev => prev.filter(t => t.id !== toppingId))
    setExpandedToppingId(curr => (curr === toppingId ? null : curr))
  }

  const updateCoverage = (toppingId: string, coverage: Coverage, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedToppings(prev => prev.map(t => t.id === toppingId ? { ...t, coverage } : t))
  }

  const handleAdd = () => {
    // Shared logic for creating the item object
    const newItem: CartItem = {
      id: editingItem ? editingItem.id : Math.random().toString(36).substr(2, 9),
      name: "פיצה בהרכבה אישית",
      toppings: selectedToppings.map(t => {
        // Find name from toppings object
        for (const category of Object.values(toppings)) {
          // @ts-ignore
          const found = category.find((ft) => ft.id === t.id)
          if (found) return found.name
        }
        return t.id
      }),
      customToppings: selectedToppings,
      price: basePrice + toppingsPrice, // Unit price
      quantity: quantity,
      image: baseImage
    }

    if (editingItem && onUpdateCartItem) {
      onUpdateCartItem(newItem)
    } else if (onAddToCart) {
      onAddToCart(newItem)
    }
  }

  const currentToppings = toppings[selectedCategory as keyof typeof toppings]

  // The pizza stage container is max-width 500px (`w-[125vw] max-w-[500px]`), aspect-square.
  // Toppings are rendered at 32px. These values feed the geometry helper so toppings stay on the sauce.
  const STAGE_CONTAINER_PX = 500
  const TOPPING_RENDER_PX = 32

  // Base pizza image follows the selected sauce. `white` (cream) → bian.webp,
  // `marinara` (tomato) or no sauce → margherita.webp.
  const selectedSauceId = selectedToppings.find(t =>
    toppings.sauce.some(s => s.id === t.id)
  )?.id
  const baseImage = selectedSauceId === "white" ? "/images/bian.webp" : "/images/margherita.webp"

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-background h-full relative">
      {/* Header - Fixed & Compact */}
      <div className="flex items-center justify-between px-6 py-2 z-20 shrink-0 absolute top-0 w-full">
        <motion.button
          onClick={onBack}
          whileTap={{ scale: 0.9 }}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-card shadow-lg"
        >
          <ChevronRight className="h-5 w-5 text-foreground" strokeWidth={1.5} />
        </motion.button>
        <h1 className="text-lg font-bold text-foreground drop-shadow-md">הרכבת מגש</h1>
        <div className="w-10" />
      </div>

      {/* Pizza Stage */}
      <div className="relative flex-none h-[380px] flex items-center justify-center overflow-visible shrink-0 z-0">
        {/* Selected toppings legend — pinned to the right edge of the screen */}
        <div className="absolute right-2 top-12 z-20 flex flex-col gap-1.5 max-h-[280px] overflow-y-auto scrollbar-hide pointer-events-none">
          <AnimatePresence>
            {selectedToppings.map((selected) => {
              let toppingData: Topping | null = null
              for (const category of Object.values(toppings)) {
                // @ts-ignore
                const found = category.find((t) => t.id === selected.id)
                if (found) { toppingData = found; break }
              }
              if (!toppingData) return null
              return (
                <motion.div
                  key={selected.id}
                  layout
                  initial={{ opacity: 0, x: 20, scale: 0.8 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 20, scale: 0.8 }}
                  transition={{ type: "spring", stiffness: 400, damping: 28 }}
                  className="flex items-center gap-1.5 pointer-events-none"
                >
                  <CoverageIcon coverage={selected.coverage} />
                  <span className="text-[11px] font-semibold text-foreground whitespace-nowrap">
                    {toppingData.name}
                  </span>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>

        <div className="absolute top-[-60px] w-[125vw] max-w-[500px] aspect-square" style={{ left: '50%', transform: 'translateX(-50%)' }}>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute inset-0"
          >
            <Image
              src={baseImage}
              alt="Pizza base"
              fill
              className="object-contain rounded-full"
              priority
            />
          </motion.div>

          <AnimatePresence mode="popLayout">
            {selectedToppings.map((selected, index) => {
              let toppingData: Topping | null = null
              for (const category of Object.values(toppings)) {
                // @ts-ignore
                const found = category.find((t) => t.id === selected.id)
                if (found) {
                  toppingData = found
                  break
                }
              }
              // Skip items without an image (sauces) — they change the base pizza,
              // not paint dots on top of it.
              if (!toppingData?.image) return null

              const positions = generateToppingPositions({
                toppingId: selected.id,
                coverage: selected.coverage,
                containerSize: STAGE_CONTAINER_PX,
                toppingSize: TOPPING_RENDER_PX,
                base: selectedSauceId === "white" ? "bian" : "margherita",
              })

              return (
                <motion.div
                  key={`${selected.id}-${selected.coverage}`}
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 pointer-events-none"
                  style={{ zIndex: index + 1 }}
                >
                  {positions.map((pos, i) => (
                    // Outer wrapper holds the static positioning transform
                    // (left/top + translate(-50%) for centering + rotation + per-instance scale).
                    // Framer-motion would otherwise clobber `style.transform` with its own
                    // animation matrix, shifting toppings ~16px right of their target point.
                    <div
                      key={i}
                      className="absolute"
                      style={{
                        left: `${pos.x}%`,
                        top: `${pos.y}%`,
                        width: "32px",
                        height: "32px",
                        transform: `translate(-50%, -50%) rotate(${pos.rotation}deg) scale(${pos.scale})`,
                      }}
                    >
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{
                          delay: i * 0.02,
                          duration: 0.3,
                          ease: "easeOut",
                        }}
                        className="w-full h-full"
                      >
                        <Image
                          src={toppingData.image}
                          alt={toppingData.name}
                          width={32}
                          height={32}
                          className="object-contain drop-shadow-md"
                        />
                      </motion.div>
                    </div>
                  ))}
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Scrollable Content Area - Controls Panel */}
      <div className="flex-1 flex flex-col overflow-y-auto scrollbar-hide -mt-10 z-10 relative">
        <div className="flex-1 rounded-t-[30px] bg-background px-6 pt-4 pb-6 min-h-full border-t border-border/20 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
          {/* Category Tabs */}
          <div className="mb-4 flex gap-4 overflow-x-auto pb-0 scrollbar-hide border-b border-border/40">
            {toppingCategories.map((category) => (
              <motion.button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 whitespace-nowrap px-2 py-3 text-sm font-medium transition-colors relative ${selectedCategory === category.id
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                <span>{category.icon}</span>
                <span>{category.name}</span>
                {selectedCategory === category.id && (
                  <motion.div 
                    layoutId="categoryIndicator" 
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" 
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.button>
            ))}
          </div>

          {/* Toppings Grid (2 per row) */}
          <div className="grid grid-cols-2 gap-3 mb-8 items-start">
            {currentToppings.map((topping: any) => {
              const selected = selectedToppings.find(t => t.id === topping.id)
              const isSelected = !!selected
              const isExpanded = isSelected && expandedToppingId === topping.id

              const handleCardClick = () => {
                if (!isSelected) {
                  toggleTopping(topping.id)
                } else if (isExpanded) {
                  setExpandedToppingId(null)
                } else {
                  setExpandedToppingId(topping.id)
                }
              }

              return (
                <motion.div
                  key={topping.id}
                  onClick={handleCardClick}
                  whileTap={{ scale: 0.97 }}
                  layout
                  className={`relative flex flex-col items-center border cursor-pointer rounded-2xl transition-colors ${
                    isExpanded
                      ? "bg-card border-orange-400/50 shadow-md pt-3 pb-3 px-2 gap-2"
                      : isSelected
                        ? "bg-orange-500/[0.08] border-orange-400/40 shadow-sm pt-3 pb-2 px-2 gap-1.5"
                        : "bg-card/60 border-border/20 shadow-sm hover:bg-card/80 hover:border-border/40 pt-3 pb-2 px-2 gap-1.5"
                  }`}
                >
                  {/* Topping image or colour swatch — hidden when expanded to make room for buttons */}
                  {!isExpanded && (
                    <div className="shrink-0">
                      {topping.image ? (
                        <Image
                          src={topping.image}
                          alt={topping.name}
                          width={40}
                          height={40}
                          className={`object-contain drop-shadow-sm transition-opacity ${isSelected ? "opacity-95" : "opacity-65"}`}
                        />
                      ) : (
                        <div
                          className="w-9 h-9 rounded-full border-2 border-white/40 shadow-inner"
                          style={{ background: topping.color }}
                        />
                      )}
                    </div>
                  )}

                  <motion.div layout className="text-center w-full shrink-0">
                    <span className={`font-semibold block leading-tight transition-colors ${
                      isExpanded ? "text-xs text-orange-600" : isSelected ? "text-sm text-orange-700" : "text-sm text-foreground"
                    }`}>
                      {topping.name}
                    </span>
                    {!isSelected && (
                      <span className="text-[10px] text-muted-foreground mt-0.5 block">
                        {topping.price > 0 ? `+₪${topping.price.toFixed(2)}` : "חינם"}
                      </span>
                    )}
                  </motion.div>

                  {isExpanded && selected && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.08 }}
                      className="flex items-center gap-1.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {(["right", "whole", "left"] as Coverage[]).map((cov) => (
                        <motion.button
                          key={cov}
                          onClick={(e) => updateCoverage(topping.id, cov, e)}
                          whileTap={{ scale: 0.85 }}
                          title={cov === "right" ? "צד ימין" : cov === "whole" ? "כל הפיצה" : "צד שמאל"}
                          className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
                            selected.coverage === cov
                              ? "bg-orange-500/15 ring-1 ring-orange-500/50"
                              : "hover:bg-black/5"
                          }`}
                        >
                          <CoverageIcon coverage={cov} />
                        </motion.button>
                      ))}
                      <motion.button
                        onClick={(e) => { e.stopPropagation(); removeTopping(topping.id) }}
                        whileTap={{ scale: 0.9 }}
                        className="flex items-center justify-center w-8 h-8 rounded-full text-red-500/70 hover:bg-red-50 hover:text-red-600 transition-all"
                        title="הסר תוספת"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </motion.button>
                    </motion.div>
                  )}
                </motion.div>
              )
            })}
          </div>

          {/* Bottom spacing for sticky footer */}
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
