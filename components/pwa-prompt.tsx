"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Download } from "lucide-react"

export function PWAPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    // Register Service Worker
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js").catch((err) => {
          console.error("Service Worker registration failed:", err)
        })
      })
    }

    // Listen for install prompt
    const handler = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
      // Small delay before showing prompt so it doesn't interrupt immediate first render
      setTimeout(() => setShowPrompt(true), 1500)
    }

    window.addEventListener("beforeinstallprompt", handler)

    return () => {
      window.removeEventListener("beforeinstallprompt", handler)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === "accepted") {
      setDeferredPrompt(null)
      setShowPrompt(false)
    }
  }

  if (!showPrompt) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.95 }}
        className="fixed bottom-24 left-4 right-4 z-50 bg-background/95 backdrop-blur-xl border border-border/50 rounded-3xl p-5 shadow-[0_10px_40px_rgba(0,0,0,0.1)]"
      >
        <button 
          onClick={() => setShowPrompt(false)}
          className="absolute top-3 right-3 p-1.5 text-muted-foreground hover:text-foreground transition-colors bg-muted/50 rounded-full"
        >
          <X className="w-4 h-4" />
        </button>
        
        <div className="flex items-center gap-4 mb-4 mt-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 shrink-0">
            <span className="text-2xl">🍕</span>
          </div>
          <div>
            <h3 className="font-bold text-foreground leading-none mb-1.5">התקן את Maites</h3>
            <p className="text-sm text-muted-foreground leading-tight">
              הוסף את האפליקציה למסך הבית להזמנה מהירה וקלה יותר!
            </p>
          </div>
        </div>

        <button
          onClick={handleInstall}
          className="w-full h-12 bg-primary text-primary-foreground rounded-full font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform"
        >
          <Download className="w-5 h-5" />
          התקן אפליקציה
        </button>
      </motion.div>
    </AnimatePresence>
  )
}
