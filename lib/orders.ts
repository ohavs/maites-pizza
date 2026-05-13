"use client"

import {
  collection, doc, addDoc, updateDoc, setDoc,
  onSnapshot, query, orderBy, runTransaction
} from "firebase/firestore"
import { db } from "./firebase"
import { Order, CartItem } from "./types"

export const TERMS_VERSION = "2026-05"

export async function createOrder(
  data: Pick<Order, "customer" | "items" | "total" | "paymentMethod">
): Promise<{ id: string; orderNumber: number }> {
  const counterRef = doc(db, "meta", "orderCounter")
  const ordersRef = collection(db, "orders")

  let orderNumber = 1001
  let orderId = ""

  await runTransaction(db, async (tx) => {
    const counterSnap = await tx.get(counterRef)
    orderNumber = (counterSnap.data()?.value ?? 1000) + 1
    tx.set(counterRef, { value: orderNumber }, { merge: true })

    const newRef = doc(ordersRef)
    orderId = newRef.id
    tx.set(newRef, {
      ...data,
      orderNumber,
      paymentStatus: "pending",
      status: "new",
      createdAt: Date.now(),
      acceptedTermsVersion: TERMS_VERSION,
    })
  })

  return { id: orderId, orderNumber }
}

export async function updateOrderStatus(orderId: string, status: Order["status"]) {
  await updateDoc(doc(db, "orders", orderId), { status })
}

export async function updatePaymentStatus(orderId: string, paymentStatus: Order["paymentStatus"]) {
  await updateDoc(doc(db, "orders", orderId), { paymentStatus })
}

export function subscribeToOrders(
  callback: (orders: Order[]) => void
): () => void {
  const q = query(collection(db, "orders"), orderBy("createdAt", "desc"))
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() }) as Order))
  })
}
