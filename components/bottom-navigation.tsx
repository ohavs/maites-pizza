"use client"

import { motion } from "framer-motion"
import { Home, ShoppingBag, User, UtensilsCrossed } from "lucide-react"

const navItems = [
  { id: "home", icon: Home, label: "בית" },
  { id: "menu", icon: UtensilsCrossed, label: "תפריט" },
  { id: "cart", icon: ShoppingBag, label: "סל" },
  { id: "profile", icon: User, label: "פרופיל" },
]

interface BottomNavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
  cartCount?: number
}

export function BottomNavigation({
  activeTab,
  onTabChange,
  cartCount = 0
}: BottomNavigationProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-6 pb-6 pointer-events-none">
      {/* Navigation Dock */}
      <motion.nav
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="relative overflow-hidden rounded-[30px] bg-white/80 backdrop-blur-xl border border-white/20 shadow-xl pointer-events-auto"
      >
        <div className="flex items-center justify-around px-2 py-4">
          {navItems.map((item) => {
            const isActive = activeTab === item.id
            const Icon = item.icon

            return (
              <motion.button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                whileTap={{ scale: 0.9 }}
                className="relative flex h-12 w-12 items-center justify-center"
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 rounded-full bg-primary"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}

                {/* Cart Badge */}
                {item.id === "cart" && cartCount > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white z-20 border-2 border-white"
                  >
                    {cartCount}
                  </motion.div>
                )}

                <Icon
                  className={`relative z-10 h-5 w-5 transition-colors ${isActive ? "text-primary-foreground" : "text-muted-foreground"
                    }`}
                  strokeWidth={isActive ? 2 : 1.5}
                />
                <span className="sr-only">{item.label}</span>
              </motion.button>
            )
          })}
        </div>
      </motion.nav>
    </div>
  )
}
