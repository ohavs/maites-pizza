"use client"

import { Bell } from "lucide-react"
import { motion } from "framer-motion"
import Image from "next/image"

export function Header() {
  return (
    <div className="flex items-center justify-center px-6 pt-10 pb-4">
      <h1 className="text-5xl font-black text-foreground tracking-widest font-bisten uppercase mt-4 mb-2">
        MAITES
      </h1>
    </div>
  )
}
