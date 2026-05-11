"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronRight, Plus, Circle, Trash2, ShoppingCart } from "lucide-react"
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
  const [selectedCategory, setSelectedCategory] = useState("sauce")
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
    setSelectedToppings((prev) => {
      const exists = prev.find(t => t.id === toppingId)
      if (exists) {
        return prev.filter(t => t.id !== toppingId)
      }
      return [...prev, { id: toppingId, coverage: "whole" }]
    })
    // When adding a new topping, expand it for configuration; when removing, collapse.
    setExpandedToppingId((curr) => {
      const wasSelected = selectedToppings.some(t => t.id === toppingId)
      if (wasSelected) return curr === toppingId ? null : curr
      return toppingId
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
      image: "/images/margherita.webp"
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

        <div className="absolute top-[-60px] inset-x-0 mx-auto w-[125vw] max-w-[500px] aspect-square">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute inset-0"
          >
            <Image
              src="/images/margherita.webp"
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
              if (!toppingData) return null

              const positions = generateToppingPositions({
                toppingId: selected.id,
                coverage: selected.coverage,
                containerSize: STAGE_CONTAINER_PX,
                toppingSize: TOPPING_RENDER_PX,
              })

              return (
                <motion.div
                  key={`${selected.id}-${selected.coverage}`}
                  initial={{ scale: 1, opacity: 1 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 pointer-events-none"
                  style={{ zIndex: index + 1 }}
                >
                  {positions.map((pos, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{
                        scale: [0, 1.2, 1],
                        opacity: 1,
                      }}
                      transition={{
                        delay: i * 0.02,
                        duration: 0.3,
                        ease: "easeOut"
                      }}
                      className="absolute"
                      style={{
                        left: `${pos.x}%`,
                        top: `${pos.y}%`,
                        width: "32px", // Restored size
                        height: "32px",
                        transform: `translate(-50%, -50%) rotate(${pos.rotation}deg) scale(${pos.scale})`,
                      }}
                    >
                      {toppingData?.image ? (
                        <Image
                          src={toppingData.image}
                          alt={toppingData.name}
                          width={32}
                          height={32}
                          className="object-contain drop-shadow-md"
                        />
                      ) : (
                        <div
                          className="w-3 h-3 rounded-full mx-auto mt-2"
                          style={{
                            backgroundColor: toppingData?.color,
                            boxShadow: "0 1px 2px rgba(0,0,0,0.3)"
                          }}
                        />
                      )}
                    </motion.div>
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
          <div className="grid grid-cols-2 gap-3 mb-8">
            {currentToppings.map((topping: any) => {
              const selected = selectedToppings.find(t => t.id === topping.id)
              const isSelected = !!selected
              const isExpanded = isSelected && expandedToppingId === topping.id

              const handleCapsuleClick = () => {
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
                  onClick={handleCapsuleClick}
                  whileTap={{ scale: 0.97 }}
                  layout
                  className={`relative flex flex-col items-center border transition-all cursor-pointer overflow-hidden ${
                    isExpanded
                      ? "rounded-[2rem] bg-card border-orange-500/40 shadow-md min-h-[110px] py-3 px-3 justify-between gap-2"
                      : isSelected
                        ? "rounded-full bg-orange-500/10 border-orange-500/50 min-h-[60px] p-2 justify-center"
                        : "rounded-full bg-transparent border-border/30 hover:bg-black/5 min-h-[60px] p-2 justify-center"
                  }`}
                >
                  <motion.div layout className="text-center w-full shrink-0">
                    <span className={`font-bold block leading-tight transition-all ${
                      isExpanded ? "text-xs text-orange-600" : isSelected ? "text-base text-orange-700" : "text-base text-foreground"
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
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 }}
                      className="flex items-center gap-1.5 relative z-10"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={(e) => updateCoverage(topping.id, "right", e)}
                        className={`p-2 rounded-full transition-all ${selected.coverage === 'right' ? 'bg-orange-500 text-white shadow-md' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
                        title="צד ימין"
                      >
                        <div className="w-4 h-4 rounded-full border-[2.5px] border-current relative overflow-hidden">
                          <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-current opacity-80"></div>
                        </div>
                      </button>
                      <button
                        onClick={(e) => updateCoverage(topping.id, "whole", e)}
                        className={`p-2 rounded-full transition-all ${selected.coverage === 'whole' ? 'bg-orange-500 text-white shadow-md' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
                        title="כל הפיצה"
                      >
                        <Circle className="w-4 h-4 fill-current border-[2.5px] border-current rounded-full" />
                      </button>
                      <button
                        onClick={(e) => updateCoverage(topping.id, "left", e)}
                        className={`p-2 rounded-full transition-all ${selected.coverage === 'left' ? 'bg-orange-500 text-white shadow-md' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
                        title="צד שמאל"
                      >
                        <div className="w-4 h-4 rounded-full border-[2.5px] border-current relative overflow-hidden">
                          <div className="absolute left-0 top-0 bottom-0 w-1/2 bg-current opacity-80"></div>
                        </div>
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); removeTopping(topping.id) }}
                        className="p-2 rounded-full transition-all text-red-500 hover:bg-red-50 ml-1"
                        title="הסר תוספת"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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
