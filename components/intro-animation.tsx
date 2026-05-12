"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

interface IntroAnimationProps {
    onComplete: () => void
}

// One row of letters typed with a per-char stagger, then a small spring "punch"
// on the whole word once typing finishes. Cursor blinks while typing and is
// dropped on flourish so the word reads as the final brand mark.
const LETTERS = "MAITES".split("")
const TYPE_DELAY_PER_CHAR = 0.09
const TYPE_DURATION_MS = (LETTERS.length * TYPE_DELAY_PER_CHAR + 0.22) * 1000
const HOLD_BEFORE_EXIT_MS = 650

export function IntroAnimation({ onComplete }: IntroAnimationProps) {
    const [typingDone, setTypingDone] = useState(false)

    useEffect(() => {
        const t1 = window.setTimeout(() => setTypingDone(true), TYPE_DURATION_MS)
        const t2 = window.setTimeout(onComplete, TYPE_DURATION_MS + HOLD_BEFORE_EXIT_MS)
        return () => {
            window.clearTimeout(t1)
            window.clearTimeout(t2)
        }
    }, [onComplete])

    return (
        <motion.div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-background"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.45, ease: "easeOut" } }}
        >
            <motion.div
                className="flex items-baseline"
                animate={typingDone ? { scale: [1, 1.12, 1] } : {}}
                transition={typingDone ? { duration: 0.55, ease: [0.34, 1.56, 0.64, 1] } : {}}
            >
                {LETTERS.map((letter, i) => (
                    <motion.span
                        key={i}
                        className="text-7xl font-black tracking-widest font-bisten uppercase"
                        style={{ color: "#fb5315" }}
                        initial={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        transition={{
                            delay: i * TYPE_DELAY_PER_CHAR,
                            duration: 0.22,
                            ease: "easeOut",
                        }}
                    >
                        {letter}
                    </motion.span>
                ))}
                {!typingDone && (
                    <motion.span
                        className="inline-block w-[3px] bg-orange-500 ms-2"
                        style={{ height: "0.95em" }}
                        initial={{ opacity: 1 }}
                        animate={{ opacity: [1, 0, 1] }}
                        transition={{ duration: 0.55, repeat: Infinity, ease: "linear" }}
                    />
                )}
            </motion.div>
        </motion.div>
    )
}
