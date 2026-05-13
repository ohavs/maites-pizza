export type Coverage = "whole" | "left" | "right" | "top" | "bottom"

export interface Topping {
    id: string
    name: string
    price: number
    color: string
    image?: string
}

export interface SelectedTopping {
    id: string
    coverage: Coverage
}

export interface CartItem {
    id: string
    name: string
    toppings: string[]
    customToppings?: SelectedTopping[]
    price: number
    quantity: number
    image: string
}

export interface Order {
    id?: string
    orderNumber: number
    customer: {
        name: string
        phone: string
    }
    items: CartItem[]
    total: number
    paymentMethod: "cash" | "bit"
    paymentStatus: "pending" | "paid"
    status: "new" | "preparing" | "ready" | "completed"
    createdAt: number
    acceptedTermsVersion: string
}
