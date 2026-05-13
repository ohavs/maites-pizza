"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, CheckCircle2, Loader2, Banknote, Smartphone, ChevronLeft, Check } from "lucide-react"
import { CartItem } from "@/lib/types"
import { createOrder } from "@/lib/orders"

interface CheckoutOverlayProps {
  items: CartItem[]
  total: number
  onClose: () => void
  onOrderComplete: (orderNumber: number) => void
}

type PaymentMethod = "cash" | "bit"
type Step = "form" | "submitting" | "success"

const paymentOptions: { id: PaymentMethod; label: string; sub: string; icon: React.ReactNode }[] = [
  { id: "cash", label: "מזומן", sub: "תשלום בקבלה", icon: <Banknote className="w-5 h-5" /> },
  { id: "bit", label: "Bit", sub: "אפליקציית ביט", icon: <Smartphone className="w-5 h-5" /> },
]

export function CheckoutOverlay({ items, total, onClose, onOrderComplete }: CheckoutOverlayProps) {
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")

  useEffect(() => {
    try {
      const stored = localStorage.getItem("maites-customer")
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed.name) setName(parsed.name)
        if (parsed.phone) setPhone(parsed.phone)
      }
    } catch {}
  }, [])
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash")
  const [step, setStep] = useState<Step>("form")
  const [orderNumber, setOrderNumber] = useState(0)
  const [error, setError] = useState("")
  const [acceptedTerms, setAcceptedTerms] = useState(false)

  const canSubmit = name.trim().length >= 2 && phone.trim().length >= 9 && acceptedTerms

  const handleSubmit = async () => {
    if (!canSubmit) return
    setError("")
    setStep("submitting")
    try {
      const { orderNumber: num } = await createOrder({
        customer: { name: name.trim(), phone: phone.trim() },
        items,
        total,
        paymentMethod,
      })
      setOrderNumber(num)
      setStep("success")
      setTimeout(() => onOrderComplete(num), 3000)
    } catch (e) {
      setError("שגיאה בשליחת ההזמנה, נסה שוב")
      setStep("form")
    }
  }

  return (
    <motion.div
      className="fixed inset-0 z-[200] flex flex-col justify-end"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={step === "form" ? onClose : undefined}
      />

      {/* Sheet */}
      <motion.div
        className="relative z-10 bg-background rounded-t-[32px] shadow-2xl flex flex-col max-h-[92dvh]"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 320, damping: 32 }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        <AnimatePresence mode="wait">
          {step === "success" ? (
            /* ── Success ── */
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center gap-4 px-8 py-12"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.1 }}
                className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center"
              >
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </motion.div>
              <h2 className="text-2xl font-black text-foreground text-center">ההזמנה התקבלה!</h2>
              <div className="text-4xl font-black text-primary">#{orderNumber}</div>
              <p className="text-sm text-muted-foreground text-center">
                {paymentMethod === "bit"
                  ? "אנא שלם דרך Bit לפני האיסוף"
                  : "תשלום במזומן בקבלת ההזמנה"}
              </p>
              <p className="text-xs text-muted-foreground/60 text-center mt-2">הדף ייסגר בעוד רגע...</p>
            </motion.div>

          ) : (
            /* ── Form ── */
            <motion.div
              key="form"
              initial={{ opacity: 1 }}
              className="flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 shrink-0 border-b border-border/20">
                <h2 className="text-xl font-black text-foreground">סיום הזמנה</h2>
                <motion.button
                  onClick={onClose}
                  whileTap={{ scale: 0.9 }}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-muted"
                >
                  <X className="w-4 h-4 text-foreground" />
                </motion.button>
              </div>

              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

                {/* Order summary */}
                <div>
                  <h3 className="text-sm font-bold text-muted-foreground mb-3">סיכום הזמנה</h3>
                  <div className="space-y-2">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between">
                        <span className="text-sm text-foreground font-medium">
                          {item.quantity > 1 && <span className="text-primary font-bold ml-1">{item.quantity}×</span>}
                          {item.name}
                        </span>
                        <span className="text-sm font-bold text-foreground tabular-nums">
                          ₪{(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/30">
                    <span className="font-bold text-foreground">סה"כ</span>
                    <span className="text-lg font-black text-primary tabular-nums">₪{total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Customer details */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-muted-foreground">פרטים</h3>
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="שם מלא"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full h-12 rounded-2xl bg-muted px-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 text-base"
                      autoComplete="name"
                    />
                    <input
                      type="tel"
                      placeholder="מספר טלפון"
                      value={phone}
                      onChange={e => setPhone(e.target.value.replace(/[^\d]/g, ""))}
                      className="w-full h-12 rounded-2xl bg-muted px-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 text-base"
                      inputMode="tel"
                      autoComplete="tel"
                    />
                  </div>
                </div>

                {/* Payment method */}
                <div>
                  <h3 className="text-sm font-bold text-muted-foreground mb-3">אמצעי תשלום</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {paymentOptions.map(opt => (
                      <motion.button
                        key={opt.id}
                        onClick={() => setPaymentMethod(opt.id)}
                        whileTap={{ scale: 0.97 }}
                        className={`flex flex-col items-center gap-1.5 p-4 rounded-2xl border-2 transition-colors ${
                          paymentMethod === opt.id
                            ? "border-primary bg-primary/8 text-primary"
                            : "border-border/30 bg-card text-foreground"
                        }`}
                      >
                        {opt.icon}
                        <span className="font-bold text-sm">{opt.label}</span>
                        <span className="text-[10px] text-muted-foreground">{opt.sub}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Terms consent */}
                <button
                  type="button"
                  onClick={() => setAcceptedTerms(v => !v)}
                  className="flex items-start gap-3 w-full text-right group"
                  aria-checked={acceptedTerms}
                  role="checkbox"
                >
                  <motion.div
                    animate={{
                      backgroundColor: acceptedTerms ? "rgb(249 115 22)" : "rgba(0,0,0,0)",
                      borderColor: acceptedTerms ? "rgb(249 115 22)" : "rgb(209 213 219)",
                    }}
                    transition={{ duration: 0.15 }}
                    className="mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0"
                  >
                    <AnimatePresence>
                      {acceptedTerms && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{ duration: 0.15 }}
                        >
                          <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                  <span className="text-xs text-muted-foreground leading-relaxed pt-0.5">
                    קראתי ואני מסכים/ה ל<span className="text-primary font-bold">תנאי השימוש</span> ול<span className="text-primary font-bold">מדיניות הפרטיות</span>
                  </span>
                </button>

                {error && (
                  <p className="text-sm text-red-500 text-center">{error}</p>
                )}
              </div>

              {/* Submit button */}
              <div className="px-6 py-5 shrink-0 border-t border-border/10">
                <motion.button
                  onClick={handleSubmit}
                  disabled={!canSubmit || step === "submitting"}
                  whileTap={canSubmit ? { scale: 0.97 } : {}}
                  className={`w-full h-14 rounded-full font-bold text-lg flex items-center justify-center gap-3 transition-all ${
                    canSubmit
                      ? "bg-gradient-to-r from-primary to-orange-400 text-white shadow-lg shadow-orange-500/25"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step === "submitting" ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span>שלח הזמנה</span>
                      <ChevronLeft className="w-5 h-5" />
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}
