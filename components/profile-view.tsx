"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Settings, Clock, CreditCard, Heart, MapPin, ChevronLeft } from "lucide-react"

export function ProfileView() {
    const scrollRef = useRef<HTMLDivElement>(null)
    useEffect(() => { scrollRef.current?.scrollTo(0, 0) }, [])
    const menuItems = [
        { icon: Clock, label: "היסטוריית הזמנות" },
        { icon: MapPin, label: "כתובות שמורות" },
        { icon: CreditCard, label: "אמצעי תשלום" },
        { icon: Heart, label: "מועדפים" },
        { icon: Settings, label: "הגדרות" },
    ]

    return (
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 pb-32 pt-6">
            <h1 className="mb-6 text-2xl font-bold text-foreground">הפרופיל שלי</h1>

            {/* Profile Header */}
            <div className="mb-8 flex items-center gap-4 rounded-[30px] bg-card p-4 shadow-sm">
                <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-primary">
                    <img src="/images/avatar.jpg" alt="Profile" className="h-full w-full object-cover" />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-foreground">ישראל ישראלי</h2>
                    <p className="text-sm text-muted-foreground">israel@example.com</p>
                </div>
            </div>

            {/* Menu Items */}
            <div className="space-y-2">
                {menuItems.map((item, index) => {
                    const Icon = item.icon
                    return (
                        <motion.button
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex w-full items-center justify-between rounded-[20px] bg-card p-4 transition-colors hover:bg-muted/50"
                        >
                            <div className="flex items-center gap-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                    <Icon className="h-5 w-5 text-primary" strokeWidth={1.5} />
                                </div>
                                <span className="font-medium text-foreground">{item.label}</span>
                            </div>
                            <ChevronLeft className="h-5 w-5 text-muted-foreground opacity-50" />
                        </motion.button>
                    )
                })}
            </div>

            <div className="mt-8">
                <button className="w-full rounded-[20px] border border-red-200 bg-red-50 p-4 font-medium text-red-500 transition-colors hover:bg-red-100">
                    התנתק
                </button>
            </div>
        </div>
    )
}
