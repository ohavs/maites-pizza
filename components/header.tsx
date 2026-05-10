"use client"

import { Bell } from "lucide-react"
import { motion } from "framer-motion"
import Image from "next/image"

export function Header() {
  return (
    <div className="flex items-center justify-between px-6 pt-8 pb-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <span className="text-xl">🍕</span>
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">מייטס</h1>
          <span className="text-xs text-muted-foreground">הטעם האיטלקי האמיתי</span>
        </div>
      </div>

    </div>
  )
}
