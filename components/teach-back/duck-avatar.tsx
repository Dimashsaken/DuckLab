"use client"

import { Bird } from "lucide-react"
import { motion } from "framer-motion"

export function DuckAvatar({ speaking = false }: { speaking?: boolean }) {
  return (
    <motion.div
      animate={speaking ? { y: [0, -3, 0] } : {}}
      transition={speaking ? { repeat: Infinity, duration: 0.6 } : {}}
      className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20"
    >
      <Bird className="h-5 w-5 text-primary" />
    </motion.div>
  )
}
