"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Header } from "@/components/header"
import { HomeDashboard } from "@/components/home-dashboard"
import { PizzaBuilder } from "@/components/pizza-builder"
import { BottomNavigation } from "@/components/bottom-navigation"
import { SearchView } from "@/components/search-view"
import { CartView } from "@/components/cart-view"
import { ProfileView } from "@/components/profile-view"
import { PizzaDetailsOverlay } from "@/components/pizza-details-overlay"
import { IntroAnimation } from "@/components/intro-animation"
import { pizzas } from "@/lib/data"
import { CartItem } from "@/lib/types"

export default function PizzaCraftApp() {
  const [activeTab, setActiveTab] = useState("home")
  const [currentView, setCurrentView] = useState<"home" | "builder">("home")
  const [selectedPizzaId, setSelectedPizzaId] = useState<number | null>(null)
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [hasPlayedIntro, setHasPlayedIntro] = useState(false)

  // State for editing cart item
  const [editingItemId, setEditingItemId] = useState<string | null>(null)

  const handleNavigate = (view: string, id?: number) => {
    if (view === "builder") {
      setEditingItemId(null)
      setCurrentView("builder")
    } else if (view === "menu") {
      // Menu now opens the overlay at the first pizza
      setSelectedPizzaId(pizzas[0].id)
    } else if (view === "pizza-details" && id) {
      // Open as overlay — don't change currentView
      setSelectedPizzaId(id)
    } else {
      setCurrentView("home")
    }
  }

  const handleClosePizzaOverlay = () => {
    setSelectedPizzaId(null)
  }

  const handleAddToCart = (item: CartItem) => {
    setCartItems(prev => [...prev, item])
    setEditingItemId(null)
  }

  const handleUpdateCartItem = (updatedItem: CartItem) => {
    setCartItems(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item))
    setEditingItemId(null)
    setActiveTab("cart")
    setCurrentView("home")
  }

  const handleEditCartItem = (item: CartItem) => {
    if (item.customToppings) {
      setEditingItemId(item.id)
      setCurrentView("builder")
    }
  }

  const handleRemoveCartItem = (id: string) => {
    setCartItems(prev => prev.filter(i => i.id !== id))
  }

  // Find the item being edited to pass its initial state
  const editingItem = editingItemId ? cartItems.find(i => i.id === editingItemId) : null

  return (
    <main className="relative flex h-[100dvh] flex-col bg-background overflow-hidden">
      <AnimatePresence mode="wait">
        {currentView === "builder" ? (
          <motion.div
            key="builder"
            initial={{ opacity: 0, scale: 0.95, x: 0 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="flex flex-1 flex-col h-full"
          >
            <PizzaBuilder
              onBack={() => {
                setEditingItemId(null)
                setCurrentView("home")
                if (editingItemId) setActiveTab("cart")
              }}
              onAddToCart={handleAddToCart}
              onUpdateCartItem={handleUpdateCartItem}
              initialToppings={editingItem?.customToppings}
              editingItem={editingItem}
            />
          </motion.div>
        ) : (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="flex flex-1 flex-col h-full min-h-0 overflow-hidden"
          >
            {activeTab === "home" && (
              <>
                <Header />
                <HomeDashboard onNavigate={handleNavigate} />
              </>
            )}
            {activeTab === "search" && <SearchView onNavigate={handleNavigate} />}
            {activeTab === "cart" && <CartView items={cartItems} onEditItem={handleEditCartItem} onRemoveItem={handleRemoveCartItem} />}
            {activeTab === "profile" && <ProfileView />}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pizza Details Overlay — renders on TOP of everything */}
      <AnimatePresence>
        {selectedPizzaId !== null && (
          <PizzaDetailsOverlay
            key="pizza-overlay"
            pizzaId={selectedPizzaId}
            onClose={handleClosePizzaOverlay}
            onAddToCart={(item) => {
              handleAddToCart(item)
            }}
          />
        )}
      </AnimatePresence>

      {/* Intro Animation — full-screen overlay shown once on first load.
          Sits above everything else (z-200) so the rest of the app can mount
          underneath and play its own staggered entrance as this fades out. */}
      <AnimatePresence>
        {!hasPlayedIntro && (
          <IntroAnimation key="intro" onComplete={() => setHasPlayedIntro(true)} />
        )}
      </AnimatePresence>

      <BottomNavigation
        activeTab={activeTab}
        cartCount={cartItems.length}
        onTabChange={(tab) => {
          if (tab === "menu") {
            // Menu tab opens the overlay at the first pizza
            setSelectedPizzaId(pizzas[0].id)
            return
          }
          setActiveTab(tab)
          if (tab === "home") {
            setCurrentView("home")
            setEditingItemId(null)
          } else {
            setCurrentView("home")
            setEditingItemId(null)
          }
        }}
      />
    </main>
  )
}
