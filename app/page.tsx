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
import { MenuGrid } from "@/components/menu-grid"
import { PizzaDetailsView } from "@/components/pizza-details-view"
import { pizzas } from "@/lib/data"
import { CartItem } from "@/lib/types"

export default function PizzaCraftApp() {
  const [activeTab, setActiveTab] = useState("home")
  const [currentView, setCurrentView] = useState<"home" | "builder" | "menu" | "pizza-details">("home")
  const [selectedPizzaId, setSelectedPizzaId] = useState<number | null>(null)
  const [cartItems, setCartItems] = useState<CartItem[]>([])

  // State for editing cart item
  const [editingItemId, setEditingItemId] = useState<string | null>(null)

  const handleNavigate = (view: string, id?: number) => {
    if (view === "builder") {
      setEditingItemId(null) // Reset editing state when opening fresh builder
      setCurrentView("builder")
    } else if (view === "menu") {
      setCurrentView("menu")
    } else if (view === "pizza-details" && id) {
      setSelectedPizzaId(id)
      setCurrentView("pizza-details")
    } else {
      setCurrentView("home")
    }
  }

  const handleAddToCart = (item: CartItem) => {
    setCartItems(prev => [...prev, item])
    // Stay on current view, just update cart count (handled by Items array length in BottomNav)

    // If we were editing, changing view closes editor mode effectively, 
    // but usually user might want to go back to cart? 
    // For now, staying on builder or navigating back is handled by builder's onBack/AddToCart
    // Let's reset edit state just in case
    setEditingItemId(null)
  }

  const handleUpdateCartItem = (updatedItem: CartItem) => {
    setCartItems(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item))
    setEditingItemId(null)
    setActiveTab("cart") // Go back to cart after editing
    setCurrentView("home") // Ensure we are in "tabs" mode
  }

  const handleEditCartItem = (item: CartItem) => {
    if (item.customToppings) {
      setEditingItemId(item.id)
      setCurrentView("builder") // Switch to builder view
    }
  }

  const selectedPizza = pizzas.find(p => p.id === selectedPizzaId)

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
                setCurrentView("home") // Or back to where we came from?
                if (editingItemId) setActiveTab("cart") // Go back to cart if canceled edit
              }}
              onAddToCart={handleAddToCart}
              onUpdateCartItem={handleUpdateCartItem}
              initialToppings={editingItem?.customToppings}
              editingItem={editingItem}
            />
          </motion.div>
        ) : currentView === "menu" ? (
          <motion.div
            key="menu"
            initial={{ opacity: 0, scale: 0.95, x: 0 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="flex flex-1 flex-col h-full min-h-0"
          >
            <MenuGrid
              onBack={() => setCurrentView("home")}
              onNavigate={handleNavigate}
            />
          </motion.div>
        ) : currentView === "pizza-details" && selectedPizza ? (
          <motion.div
            key="pizza-details"
            initial={{ opacity: 0, scale: 0.95, x: 0 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="flex flex-1 flex-col h-full min-h-0"
          >
            <PizzaDetailsView
              pizza={selectedPizza}
              onBack={() => setCurrentView("home")}
              onAddToCart={handleAddToCart}
              onNavigate={handleNavigate}
            />
          </motion.div>
        ) : (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="flex flex-1 flex-col h-full min-h-0"
          >
            {activeTab === "home" && (
              <>
                <Header />
                <HomeDashboard onNavigate={handleNavigate} />
              </>
            )}
            {activeTab === "menu" && (
              <MenuGrid
                onBack={() => setActiveTab("home")}
                onNavigate={handleNavigate}
              />
            )}
            {activeTab === "search" && <SearchView onNavigate={handleNavigate} />}
            {activeTab === "cart" && <CartView items={cartItems} onEditItem={handleEditCartItem} />}
            {activeTab === "profile" && <ProfileView />}
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNavigation
        activeTab={activeTab}
        cartCount={cartItems.length}
        onTabChange={(tab) => {
          setActiveTab(tab)
          if (tab === "home") {
            setCurrentView("home")
            setEditingItemId(null)
          } else if (tab === "menu") {
            setCurrentView("home") // Stay in tab view
            // Menu handled by activeTab
          } else {
            setCurrentView("home") // This actually means "show the tab content", since "home" view renders tabs based on activeTab
            setEditingItemId(null)
          }
        }}
      />
    </main>
  )
}
