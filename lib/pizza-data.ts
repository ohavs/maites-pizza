export const toppingCategories = [
    { id: "veggies", name: "ירקות", icon: "🥬" },
    { id: "cheese", name: "גבינות", icon: "🧀" },
    { id: "sauce", name: "רוטב ובסיס", icon: "🍅" },
]

export const toppings = {
    cheese: [
        { id: "mozzarella", name: "מוצרלה", price: 1.5, color: "#FFF8DC", image: "/images/mozzarella.png" },
        { id: "parmesan", name: "פרמזן", price: 2.0, color: "#FFFACD", image: "/images/parmesan.png" },
        { id: "cheddar", name: "צ'דר", price: 1.5, color: "#FFD700" },
        { id: "goat", name: "גבינת עיזים", price: 2.5, color: "#FFFAF0" },
    ],
    veggies: [
        { id: "mushrooms", name: "פטריות", price: 1.0, color: "#D2B48C", image: "/images/mushroom.png" },
        { id: "olives", name: "זיתים", price: 1.0, color: "#2F4F4F", image: "/images/black olives.png" },
        { id: "peppers", name: "פלפלים", price: 1.0, color: "#32CD32", image: "/images/green pepper.png" },
        { id: "onions", name: "בצל", price: 0.75, color: "#DDA0DD", image: "/images/purple onions.png" },
        { id: "basil", name: "בזיליקום", price: 1.5, color: "#228B22", image: "/images/basil.png" },
        { id: "tomatoes", name: "עגבניות", price: 1.0, color: "#FF6347", image: "/images/tomatos.png" },
    ],
    sauce: [
        { id: "marinara", name: "מרינרה", price: 0, color: "#DC143C" },
        { id: "white", name: "שום שמנת", price: 0.5, color: "#FFFAF0" },
        { id: "bbq", name: "ברביקיו", price: 0.5, color: "#8B0000" },
        { id: "pesto", name: "פסטו", price: 1.0, color: "#556B2F" },
    ],
}
