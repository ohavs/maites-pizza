"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  LayoutDashboard, 
  Pizza, 
  Settings, 
  BellRing, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Edit, 
  Trash2,
  LogOut
} from "lucide-react"

// Mock Orders
const initialOrders = [
  { id: "1042", customer: "דניאל", items: "1x פיצה פולנטה, 2x קולה", total: 45.99, status: "new", time: "10:42" },
  { id: "1043", customer: "רוני", items: "2x פיצה נפוליטנית", total: 33.98, status: "preparing", time: "10:35" },
  { id: "1044", customer: "יעל", items: "1x פיצה בהרכבה אישית", total: 22.50, status: "ready", time: "10:15" },
]

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"orders" | "menu">("orders")
  const [orders, setOrders] = useState(initialOrders)

  const moveOrder = (id: string, newStatus: string) => {
    setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o))
  }

  return (
    <div className="flex h-screen bg-gray-100" dir="rtl">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg flex flex-col">
        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white font-bold text-xl">
            M
          </div>
          <div>
            <h1 className="font-bold text-gray-800">MAITES Admin</h1>
            <p className="text-xs text-gray-500">פאנל ניהול</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setActiveTab("orders")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'orders' ? 'bg-orange-50 text-orange-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <LayoutDashboard className="w-5 h-5" />
            לוח הזמנות חי
          </button>
          
          <button 
            onClick={() => setActiveTab("menu")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'menu' ? 'bg-orange-50 text-orange-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <Pizza className="w-5 h-5" />
            ניהול תפריט
          </button>

          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-gray-600 hover:bg-gray-50">
            <Settings className="w-5 h-5" />
            הגדרות מערכת
          </button>
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-red-600 hover:bg-red-50">
            <LogOut className="w-5 h-5" />
            התנתק
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-8">
          <h2 className="text-xl font-bold text-gray-800">
            {activeTab === 'orders' ? 'לוח הזמנות (Live Screen)' : 'ניהול תפריט הפיצות'}
          </h2>
          <div className="flex items-center gap-4">
            <div className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              מערכת מחוברת
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          <AnimatePresence mode="wait">
            {activeTab === "orders" ? (
              <motion.div 
                key="orders"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-3 gap-6 h-full"
              >
                {/* New Orders */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col">
                  <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-blue-50/50 rounded-t-2xl">
                    <h3 className="font-bold text-blue-800 flex items-center gap-2">
                      <BellRing className="w-5 h-5" />
                      הזמנות חדשות
                    </h3>
                    <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded-full">
                      {orders.filter(o => o.status === 'new').length}
                    </span>
                  </div>
                  <div className="p-4 space-y-4 flex-1 overflow-y-auto">
                    {orders.filter(o => o.status === 'new').map(order => (
                      <div key={order.id} className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-bold text-lg">#{order.id}</span>
                          <span className="text-sm text-gray-500">{order.time}</span>
                        </div>
                        <p className="font-medium text-gray-800 mb-1">{order.customer}</p>
                        <p className="text-sm text-gray-600 mb-4">{order.items}</p>
                        <button 
                          onClick={() => moveOrder(order.id, 'preparing')}
                          className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                        >
                          התחל להכין
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Preparing */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col">
                  <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-orange-50/50 rounded-t-2xl">
                    <h3 className="font-bold text-orange-800 flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      בהכנה (בתנור)
                    </h3>
                    <span className="bg-orange-100 text-orange-800 text-xs font-bold px-2 py-1 rounded-full">
                      {orders.filter(o => o.status === 'preparing').length}
                    </span>
                  </div>
                  <div className="p-4 space-y-4 flex-1 overflow-y-auto">
                    {orders.filter(o => o.status === 'preparing').map(order => (
                      <div key={order.id} className="bg-white border border-orange-200 p-4 rounded-xl shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-bold text-lg">#{order.id}</span>
                          <span className="text-sm text-gray-500">{order.time}</span>
                        </div>
                        <p className="font-medium text-gray-800 mb-1">{order.customer}</p>
                        <p className="text-sm text-gray-600 mb-4">{order.items}</p>
                        <button 
                          onClick={() => moveOrder(order.id, 'ready')}
                          className="w-full py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors"
                        >
                          סמן כמוכן!
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ready */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col">
                  <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-green-50/50 rounded-t-2xl">
                    <h3 className="font-bold text-green-800 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5" />
                      מוכן לאיסוף
                    </h3>
                    <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded-full">
                      {orders.filter(o => o.status === 'ready').length}
                    </span>
                  </div>
                  <div className="p-4 space-y-4 flex-1 overflow-y-auto">
                    {orders.filter(o => o.status === 'ready').map(order => (
                      <div key={order.id} className="bg-white border border-green-200 p-4 rounded-xl shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-bold text-lg">#{order.id}</span>
                          <span className="text-sm text-gray-500">{order.time}</span>
                        </div>
                        <p className="font-medium text-gray-800 mb-1">{order.customer}</p>
                        <p className="text-sm text-gray-600 mb-4">{order.items}</p>
                        <button 
                          onClick={() => moveOrder(order.id, 'completed')}
                          className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                        >
                          נאסף / נמסר
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

              </motion.div>
            ) : (
              <motion.div 
                key="menu"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="flex justify-end mb-6">
                  <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors shadow-lg shadow-orange-500/20">
                    <Plus className="w-5 h-5" />
                    הוסף פיצה חדשה
                  </button>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  <table className="w-full text-right">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-medium">
                      <tr>
                        <th className="p-4">תמונה</th>
                        <th className="p-4">שם הפיצה</th>
                        <th className="p-4">מחיר</th>
                        <th className="p-4">סטטוס</th>
                        <th className="p-4 text-left">פעולות</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {[
                        { name: "פיצה פולנטה", price: "₪18.99", img: "/images/corn.webp" },
                        { name: "פיצה נפוליטנית", price: "₪16.99", img: "/images/basil.webp" }
                      ].map((item, i) => (
                        <tr key={i} className="hover:bg-gray-50 transition-colors">
                          <td className="p-4">
                            <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden relative">
                              <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
                            </div>
                          </td>
                          <td className="p-4 font-bold text-gray-800">{item.name}</td>
                          <td className="p-4 text-gray-600">{item.price}</td>
                          <td className="p-4">
                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">פעיל</span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center justify-end gap-2">
                              <button className="p-2 text-gray-500 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors">
                                <Edit className="w-5 h-5" />
                              </button>
                              <button className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
