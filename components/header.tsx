"use client"

import { motion } from "framer-motion"

export function Header() {
  return (
    <motion.div
      className="flex items-center justify-center px-6 pt-10 pb-4"
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <h1 className="text-6xl font-black tracking-widest font-bisten uppercase mt-4 mb-2" style={{ color: '#fb5315' }}>
        Maites
      </h1>
    </motion.div>
  )
}
