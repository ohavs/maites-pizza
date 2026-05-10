"use client"

import { motion } from "framer-motion"
import { Search } from "lucide-react"
import { PizzaCard } from "./pizza-card"

const categories = [
    { id: "all", label: "הכל" },
    { id: "meat", label: "בשרי" },
    { id: "vegetarian", label: "צמחוני" },
    { id: "vegan", label: "טבעוני" },
    { id: "spicy", label: "חריף" },
]

const searchResults = [
    {
        id: 1,
        name: "מרגריטה",
        price: 14.99,
        rating: 4.8,
        image: "/images/margherita.jpg",
    },
    {
        id: 2,
        name: "פפרוני",
        price: 16.99,
        rating: 4.9,
        image: "/images/pepperoni.jpg",
    },
    {
        id: 3,
        name: "ירקות",
        price: 15.99,
        rating: 4.7,
        image: "/images/veggie.jpg",
    },
    {
        id: 4,
        name: "מיוחדת כמהין",
        price: 22.99,
        rating: 4.9,
        image: "/images/special.jpg",
    },
]

interface SearchViewProps {
    onNavigate: (view: string) => void
}

export function SearchView({ onNavigate }: SearchViewProps) {
    return (
        <div className="flex-1 overflow-y-auto px-6 pb-32 pt-6">
            <h1 className="mb-6 text-2xl font-bold text-foreground">חיפוש</h1>

            {/* Search Input */}
            <div className="mb-6 flex items-center gap-3 rounded-[20px] bg-card px-5 py-4 shadow-lg">
                <Search className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
                <input
                    type="text"
                    placeholder="מה בא לך לאכול היום?"
                    className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                    autoFocus
                />
            </div>

            {/* Categories */}
            <div className="mb-8 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {categories.map((category, index) => (
                    <motion.button
                        key={category.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-medium transition-colors ${index === 0
                                ? "bg-primary text-primary-foreground"
                                : "bg-card text-foreground hover:bg-muted"
                            }`}
                    >
                        {category.label}
                    </motion.button>
                ))}
            </div>

            {/* Results */}
            <div className="grid grid-cols-2 gap-4">
                {searchResults.map((pizza, index) => (
                    <motion.div
                        key={pizza.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + index * 0.1 }}
                    >
                        <PizzaCard {...pizza} onClick={() => onNavigate("builder")} />
                    </motion.div>
                ))}
            </div>
        </div>
    )
}
