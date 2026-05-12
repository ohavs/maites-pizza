"use client"

import { motion } from "framer-motion"

const LETTERS = "MAITES".split("")
const PER_CHAR_DELAY = 0.07

export function Header() {
  return (
    <div className="flex items-center justify-center px-6 pt-10 pb-4">
      {/* dir="ltr" forces left-to-right letter order — without it the
          page's dir="rtl" reverses the typed letters into "SETIAM". */}
      <h1
        dir="ltr"
        className="text-6xl font-black tracking-widest font-bisten uppercase mt-4 mb-2"
        style={{ color: '#fb5315' }}
      >
        {LETTERS.map((letter, i) => (
          <motion.span
            key={i}
            className="inline-block"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: i * PER_CHAR_DELAY,
              duration: 0.22,
              ease: "easeOut",
            }}
          >
            {letter}
          </motion.span>
        ))}
      </h1>
    </div>
  )
}
