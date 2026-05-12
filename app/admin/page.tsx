"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard, BellRing, Clock, CheckCircle2,
  PhoneCall, Banknote, Smartphone, CreditCard, Loader2,
  CheckCheck
} from "lucide-react"
import { subscribeToOrders, updateOrderStatus, updatePaymentStatus } from "@/lib/orders"
import { Order } from "@/lib/types"

function useElapsed(createdAt: number) {
  const [elapsed, setElapsed] = useState(() => Math.floor((Date.now() - createdAt) / 60000))
  useEffect(() => {
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - createdAt) / 60000)), 30000)
    return () => clearInterval(id)
  }, [createdAt])
  return elapsed
}

function ElapsedBadge({ createdAt }: { createdAt: number }) {
  const mins = useElapsed(createdAt)
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
      mins >= 20 ? "bg-red-100 text-red-700" :
      mins >= 10 ? "bg-yellow-100 text-yellow-700" :
      "bg-gray-100 text-gray-600"
    }`}>
      {mins === 0 ? "עכשיו" : `${mins} דק'`}
    </span>
  )
}

function OrderCard({ order, onStatusChange, onPaymentToggle }: {
  order: Order
  onStatusChange: (id: string, status: Order["status"]) => void
  onPaymentToggle: (id: string, current: Order["paymentStatus"]) => void
}) {
  const NEXT: Record<Order["status"], { label: string; next: Order["status"] } | null> = {
    new:       { label: "התחל הכנה",    next: "preparing" },
    preparing: { label: "מוכן לאיסוף!", next: "ready" },
    ready:     { label: "נאסף ✓",       next: "completed" },
    completed: null,
  }
  const action = NEXT[order.status]

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
      className={`rounded-2xl border p-4 space-y-3 bg-white ${
        order.status === "new" ? "border-blue-200" :
        order.status === "preparing" ? "border-orange-200" :
        "border-green-200"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-black text-xl text-gray-800">#{order.orderNumber}</span>
          <ElapsedBadge createdAt={order.createdAt} />
        </div>
        <button
          onClick={() => onPaymentToggle(order.id!, order.paymentStatus)}
          className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full transition-colors ${
            order.paymentStatus === "paid"
              ? "bg-green-100 text-green-700 hover:bg-green-200"
              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
          }`}
        >
          {order.paymentStatus === "paid"
            ? <><CheckCheck className="w-3 h-3" /> שולם</>
            : <><CreditCard className="w-3 h-3" /> טרם שולם</>
          }
        </button>
      </div>

      {/* Customer */}
      <div className="flex items-center justify-between">
        <div>
          <p className="font-bold text-gray-800 text-sm">{order.customer.name}</p>
          <a href={`tel:${order.customer.phone}`}
             className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 mt-0.5">
            <PhoneCall className="w-3 h-3" />
            {order.customer.phone}
          </a>
        </div>
        <span className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
          order.paymentMethod === "bit" ? "bg-blue-50 text-blue-600" : "bg-gray-50 text-gray-600"
        }`}>
          {order.paymentMethod === "bit"
            ? <><Smartphone className="w-3.5 h-3.5" /> Bit</>
            : <><Banknote className="w-3.5 h-3.5" /> מזומן</>
          }
        </span>
      </div>

      {/* Items */}
      <div className="space-y-1 border-t border-gray-100 pt-2">
        {order.items.map((item, i) => (
          <div key={i} className="flex justify-between text-xs">
            <span className="text-gray-700">
              {item.quantity > 1 && <span className="font-bold ml-1">{item.quantity}×</span>}
              {item.name}
            </span>
            <span className="font-medium text-gray-600 tabular-nums">₪{(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
        <div className="flex justify-between text-sm font-black text-gray-800 pt-1 border-t border-gray-100">
          <span>סה"כ</span>
          <span className="text-orange-600 tabular-nums">₪{order.total.toFixed(2)}</span>
        </div>
      </div>

      {/* Action */}
      {action && (
        <button
          onClick={() => onStatusChange(order.id!, action.next)}
          className={`w-full py-2 rounded-xl font-bold text-sm text-white transition-colors ${
            order.status === "new"       ? "bg-blue-600 hover:bg-blue-700" :
            order.status === "preparing" ? "bg-orange-500 hover:bg-orange-600" :
            "bg-green-600 hover:bg-green-700"
          }`}
        >
          {action.label}
        </button>
      )}
    </motion.div>
  )
}

const COLS: { status: Order["status"]; label: string; icon: React.ReactNode; headerCls: string; badgeCls: string }[] = [
  { status: "new",       label: "הזמנות חדשות",  icon: <BellRing className="w-4 h-4" />,     headerCls: "bg-blue-50 text-blue-800",   badgeCls: "bg-blue-100 text-blue-800" },
  { status: "preparing", label: "בהכנה",          icon: <Clock className="w-4 h-4" />,        headerCls: "bg-orange-50 text-orange-800", badgeCls: "bg-orange-100 text-orange-800" },
  { status: "ready",     label: "מוכן לאיסוף",   icon: <CheckCircle2 className="w-4 h-4" />, headerCls: "bg-green-50 text-green-800",  badgeCls: "bg-green-100 text-green-800" },
]

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([])
  const [connected, setConnected] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = subscribeToOrders((data) => {
      setOrders(data)
      setConnected(true)
      setLoading(false)
    })
    return unsub
  }, [])

  const handleStatusChange = useCallback(async (id: string, status: Order["status"]) => {
    await updateOrderStatus(id, status)
  }, [])

  const handlePaymentToggle = useCallback(async (id: string, current: Order["paymentStatus"]) => {
    await updatePaymentStatus(id, current === "paid" ? "pending" : "paid")
  }, [])

  const activeOrders = orders.filter(o => o.status !== "completed")
  const todayRevenue = orders
    .filter(o => o.paymentStatus === "paid" && o.createdAt > Date.now() - 86400000)
    .reduce((s, o) => s + o.total, 0)

  return (
    <div className="flex h-screen bg-gray-100" dir="rtl">
      {/* Sidebar */}
      <div className="w-56 bg-white shadow-lg flex flex-col shrink-0">
        <div className="p-5 border-b border-gray-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white font-black text-xl">M</div>
          <div>
            <h1 className="font-black text-gray-800 text-sm">MAITES Admin</h1>
            <p className="text-xs text-gray-500">פאנל ניהול</p>
          </div>
        </div>

        <nav className="flex-1 p-4">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-orange-50 text-orange-600 font-medium text-sm">
            <LayoutDashboard className="w-4 h-4" />
            לוח הזמנות
          </div>
        </nav>

        {/* Stats */}
        <div className="p-4 border-t border-gray-100 space-y-3">
          <div className="bg-orange-50 rounded-xl p-3">
            <p className="text-xs text-gray-500 mb-0.5">הזמנות פעילות</p>
            <p className="text-2xl font-black text-orange-600">{activeOrders.length}</p>
          </div>
          <div className="bg-green-50 rounded-xl p-3">
            <p className="text-xs text-gray-500 mb-0.5">הכנסות היום</p>
            <p className="text-xl font-black text-green-600 tabular-nums">₪{todayRevenue.toFixed(0)}</p>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <header className="h-14 bg-white shadow-sm flex items-center justify-between px-6 shrink-0">
          <h2 className="text-lg font-bold text-gray-800">לוח הזמנות חי</h2>
          <div className={`flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full ${
            connected ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
          }`}>
            {connected
              ? <><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse inline-block" /> מחובר בזמן אמת</>
              : <><Loader2 className="w-3 h-3 animate-spin" /> מתחבר...</>
            }
          </div>
        </header>

        <main className="flex-1 overflow-hidden p-4">
          {loading ? (
            <div className="flex items-center justify-center h-full gap-3 text-gray-400">
              <Loader2 className="w-7 h-7 animate-spin" />
              <span>טוען הזמנות...</span>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4 h-full">
              {COLS.map(col => {
                const colOrders = orders.filter(o => o.status === col.status)
                return (
                  <div key={col.status} className="bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
                    <div className={`px-4 py-3 flex items-center justify-between ${col.headerCls} rounded-t-2xl`}>
                      <h3 className="font-bold flex items-center gap-2 text-sm">
                        {col.icon}{col.label}
                      </h3>
                      <span className={`text-xs font-black px-2 py-0.5 rounded-full ${col.badgeCls}`}>
                        {colOrders.length}
                      </span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-3 space-y-3">
                      <AnimatePresence>
                        {colOrders.length === 0
                          ? <p className="text-center text-gray-400 text-sm mt-10">אין הזמנות</p>
                          : colOrders.map(order => (
                              <OrderCard
                                key={order.id}
                                order={order}
                                onStatusChange={handleStatusChange}
                                onPaymentToggle={handlePaymentToggle}
                              />
                            ))
                        }
                      </AnimatePresence>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
