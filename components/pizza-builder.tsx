"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronRight, Plus, Circle } from "lucide-react"
import Image from "next/image"
import { CartItem, Coverage, SelectedTopping, Topping } from "@/lib/types"
import { toppings, toppingCategories } from "@/lib/pizza-data"

interface PizzaBuilderProps {
  onBack: () => void
  onAddToCart?: (item: CartItem) => void
  onUpdateCartItem?: (item: CartItem) => void
  initialToppings?: SelectedTopping[]
  editingItem?: CartItem | null
}

export function PizzaBuilder({ onBack, onAddToCart, onUpdateCartItem, initialToppings, editingItem }: PizzaBuilderProps) {
  const [selectedCategory, setSelectedCategory] = useState("cheese")
  const [selectedToppings, setSelectedToppings] = useState<SelectedTopping[]>(initialToppings || [])
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
      } else {
        return [...prev, { id: toppingId, coverage: "whole" }]
      }
    })
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
      image: "/images/pizza-base.png"
    }

    if (editingItem && onUpdateCartItem) {
      onUpdateCartItem(newItem)
    } else if (onAddToCart) {
      onAddToCart(newItem)
    }
  }

  const currentToppings = toppings[selectedCategory as keyof typeof toppings]

  const getToppingPositions = (toppingId: string, index: number, coverage: Coverage) => {
    const positions = []

    // Simple seeded random to keep positions stable
    const seededRandom = (seed: number) => {
      const x = Math.sin(seed) * 10000
      return x - Math.floor(x)
    }

    // Generate stable seed from toppingId only
    const baseSeed = toppingId.split('').reduce((a, c) => a + c.charCodeAt(0), 0)

    // Higher base count for better "full" look.
    const baseCount = toppingId === 'basil' ? 8 : (15 + Math.floor(seededRandom(baseSeed) * 5))

    // Adjust count based on coverage to maintain density
    const count = coverage === 'whole' ? baseCount : Math.ceil(baseCount / 2)

    for (let i = 0; i < count; i++) {
      const itemSeed = baseSeed + i * 15 + (coverage.length * 10)
      const rRandom = seededRandom(itemSeed)
      const thetaRandom = seededRandom(itemSeed + 1)

      // Distribution
      // Radius: Limit to ~35%  to ensure toppings stay strictly on the pizza face
      // reducing from previous 42% which caused overflow on transparent edges
      const r = Math.sqrt(rRandom) * 35

      // Angle based on coverage with safety buffer for the split line
      const splitBuffer = 0.3 // ~17 degrees safety zone near the middle
      let minAngle = 0
      let maxAngle = Math.PI * 2

      if (coverage === 'left') {
        minAngle = Math.PI / 2 + splitBuffer
        maxAngle = 3 * Math.PI / 2 - splitBuffer
      } else if (coverage === 'right') {
        minAngle = -Math.PI / 2 + splitBuffer
        maxAngle = Math.PI / 2 - splitBuffer
      }

      const theta = minAngle + thetaRandom * (maxAngle - minAngle)

      const x = 50 + r * Math.cos(theta)
      const y = 50 + r * Math.sin(theta)

      const rotationRandom = seededRandom(itemSeed + 2)
      const scaleRandom = seededRandom(itemSeed + 3)

      positions.push({
        x,
        y,
        rotation: rotationRandom * 360,
        scale: 0.8 + scaleRandom * 0.4
      })
    }
    return positions
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-background h-full">
      {/* Header - Fixed & Compact */}
      <div className="flex items-center justify-between px-6 py-2 z-10 shrink-0">
        <motion.button
          onClick={onBack}
          whileTap={{ scale: 0.9 }}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-card shadow-lg"
        >
          <ChevronRight className="h-5 w-5 text-foreground" strokeWidth={1.5} />
        </motion.button>
        <h1 className="text-lg font-bold text-foreground">הרכבת מגש</h1>
        <div className="w-10" />
      </div>

      {/* Pizza Stage - Fixed & Compact */}
      <div className="relative flex-none h-[200px] flex items-center justify-center px-6 overflow-hidden shrink-0 z-0">
        <div className="relative w-full max-w-[200px] aspect-square">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute inset-0"
          >
            <Image
              src="/images/pizza-base.png"
              alt="Pizza base"
              fill
              className="object-contain drop-shadow-2xl rounded-full"
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

              const positions = getToppingPositions(selected.id, index, selected.coverage)

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
                        width: "28px", // Slightly smaller toppings for smaller pizza
                        height: "28px",
                        transform: `translate(-50%, -50%) rotate(${pos.rotation}deg) scale(${pos.scale})`,
                      }}
                    >
                      {toppingData?.image ? (
                        <Image
                          src={toppingData.image}
                          alt={toppingData.name}
                          width={28}
                          height={28}
                          className="object-contain drop-shadow-md"
                        />
                      ) : (
                        <div
                          className="w-3 h-3 rounded-full mx-auto mt-2" // Smaller dots fallback
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
      <div className="flex-1 flex flex-col overflow-y-auto scrollbar-hide -mt-4 z-10 relative">
        <div className="flex-1 rounded-t-[30px] bg-card px-6 pt-4 pb-6 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] min-h-full">
          {/* Category Tabs */}
          <div className="mb-3 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {toppingCategories.map((category) => (
              <motion.button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${selectedCategory === category.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
                  }`}
              >
                <span>{category.icon}</span>
                <span>{category.name}</span>
              </motion.button>
            ))}
          </div>

          {/* Toppings Grid (Vertical list now to accommodate controls) */}
          <div className="flex flex-col gap-2 mb-8">
            {currentToppings.map((topping: any) => {
              const selected = selectedToppings.find(t => t.id === topping.id)
              const isSelected = !!selected

              return (
                <div key={topping.id} className="relative">
                  <motion.div
                    onClick={() => toggleTopping(topping.id)}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full flex items-center justify-between rounded-[20px] pl-2 pr-4 py-3 transition-all cursor-pointer ${isSelected
                      ? "bg-primary/5 border-primary border"
                      : "bg-muted text-foreground border border-transparent"
                      }`}
                  >
                    {/* Right Side Info (RTL) */}
                    <div className="flex items-center gap-3">
                      <div
                        className="h-9 w-9 rounded-full border-2 border-white/30 flex items-center justify-center text-xs shadow-sm shrink-0"
                        style={{ backgroundColor: topping.color }}
                      ></div>
                      <div className="text-right">
                        <span className="font-bold text-sm block text-foreground leading-tight">{topping.name}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {topping.price > 0 ? `+₪${topping.price.toFixed(2)}` : "חינם"}
                        </span>
                      </div>
                    </div>

                    {/* Left Side Controls or Add Button */}
                    {isSelected && selected ? (
                      <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={(e) => updateCoverage(topping.id, "right", e)}
                          className={`p-1.5 rounded-lg border transition-all ${selected.coverage === 'right' ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-muted-foreground border-border'}`}
                          title="צד ימין"
                        >
                          <div className="w-3.5 h-3.5 rounded-full border border-current relative overflow-hidden">
                            <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-current opacity-60"></div>
                          </div>
                        </button>
                        <button
                          onClick={(e) => updateCoverage(topping.id, "whole", e)}
                          className={`p-1.5 rounded-lg border transition-all ${selected.coverage === 'whole' ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-muted-foreground border-border'}`}
                          title="כל הפיצה"
                        >
                          <Circle className="w-3.5 h-3.5 fill-current" />
                        </button>
                        <button
                          onClick={(e) => updateCoverage(topping.id, "left", e)}
                          className={`p-1.5 rounded-lg border transition-all ${selected.coverage === 'left' ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-muted-foreground border-border'}`}
                          title="צד שמאל"
                        >
                          <div className="w-3.5 h-3.5 rounded-full border border-current relative overflow-hidden">
                            <div className="absolute left-0 top-0 bottom-0 w-1/2 bg-current opacity-60"></div>
                          </div>
                        </button>
                      </div>
                    ) : (
                      <div className="h-8 w-8 flex items-center justify-center rounded-full bg-background border shadow-sm">
                        <Plus className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </motion.div>
                </div>
              )
            })}
          </div>

          {/* In-Flow Footer Area (At the bottom of toppings) */}
          <div className="pb-40 pt-4">
            <div className="flex items-center gap-4 max-w-md mx-auto">
              {/* Counter removed */}

              <motion.button
                onClick={handleAdd}
                whileTap={{ scale: 0.98 }}
                className="flex-1 h-14 bg-gradient-to-r from-primary to-orange-400 text-primary-foreground rounded-2xl font-bold shadow-lg flex items-center justify-between px-6 text-lg"
              >
                <div className="flex items-center gap-2">
                  <span>{editingItem ? 'עדכון מגש' : 'הוספה לסל'}</span>
                  {quantity > 1 && <span className="text-sm opacity-80 bg-black/10 px-2 py-0.5 rounded-full">x{quantity}</span>}
                </div>
                <span>₪{totalPrice.toFixed(2)}</span>
              </motion.button>

              {/* Separate small counter if needed or just integrate into logic? 
                   User said "remove the counter" because text was overlapping. 
                   But how does user select quantity? 
                   "Remove the counter... because there is not enough width".
                   Maybe I should just leave quantity at 1 or put usage elsewhere?
                   User said "get rid of the counter". I will assume they mean the UI element.
                   I will keep `quantity` state at 1, or maybe add a small quantity indicator inside button if needed, 
                   but strictly removing the big counter block. 
               */}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
