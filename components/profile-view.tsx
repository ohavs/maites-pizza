"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { User, Phone, MapPin, Clock, ChevronDown, CheckCircle2, Shield, FileText } from "lucide-react"

const CUSTOMER_KEY = "maites-customer"

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, type: "spring", stiffness: 300, damping: 28 },
  }),
}

function ExpandableSection({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-[24px] bg-card border border-border/15 shadow-[0_2px_12px_rgba(0,0,0,0.06)] overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-5 py-4 gap-3"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
            {icon}
          </div>
          <span className="font-bold text-foreground text-sm">{title}</span>
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-1 border-t border-border/10 text-sm text-muted-foreground leading-relaxed space-y-2">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function ProfileView() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    scrollRef.current?.scrollTo(0, 0)
    try {
      const stored = localStorage.getItem(CUSTOMER_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        setName(parsed.name ?? "")
        setPhone(parsed.phone ?? "")
      }
    } catch {}
  }, [])

  const handleSave = () => {
    try {
      localStorage.setItem(CUSTOMER_KEY, JSON.stringify({ name: name.trim(), phone: phone.trim() }))
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {}
  }

  const canSave = name.trim().length >= 2 && phone.trim().length >= 9

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto pb-32 pt-6">
      <h1 className="mb-6 px-5 text-2xl font-bold text-foreground">הגדרות ומידע</h1>

      <div className="px-4 space-y-4">
        {/* My Details */}
        <motion.div
          custom={0}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="rounded-[24px] bg-card border border-border/15 shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-5 space-y-4"
        >
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <User className="w-4 h-4" />
            </div>
            <h2 className="font-bold text-foreground">הפרטים שלי</h2>
          </div>
          <p className="text-xs text-muted-foreground -mt-2">הפרטים ימולאו אוטומטית בסיום הזמנה</p>
          <div className="space-y-2.5">
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
          <motion.button
            onClick={handleSave}
            disabled={!canSave}
            whileTap={canSave ? { scale: 0.97 } : {}}
            className={`w-full h-12 rounded-full font-bold text-sm flex items-center justify-center gap-2 transition-all ${
              canSave
                ? "bg-gradient-to-r from-primary to-orange-400 text-white shadow-md shadow-orange-500/20"
                : "bg-muted text-muted-foreground"
            }`}
          >
            <AnimatePresence mode="wait">
              {saved ? (
                <motion.span
                  key="saved"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" /> נשמר!
                </motion.span>
              ) : (
                <motion.span
                  key="save"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  שמור פרטים
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </motion.div>

        {/* Business Info */}
        <motion.div
          custom={1}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="rounded-[24px] bg-card border border-border/15 shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-5 space-y-3"
        >
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <h2 className="font-bold text-foreground">פרטי העסק</h2>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
              <span className="text-sm text-foreground">בית שאן</span>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
              <span className="text-sm text-foreground">ג'–ה' | 17:00–20:00</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
              <a
                href="tel:0506500855"
                className="text-sm font-bold text-primary hover:text-orange-600 transition-colors"
                dir="ltr"
              >
                050-650-0855
              </a>
            </div>
          </div>
        </motion.div>

        {/* Info sections */}
        <motion.div
          custom={2}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="space-y-2"
        >
          <ExpandableSection title="הצהרת נגישות" icon={<Shield className="w-4 h-4" />}>
            <p>
              מסעדת Maites פועלת לאפשר שירות נגיש לכלל לקוחותיה, לרבות אנשים עם מוגבלויות.
            </p>
            <p>
              אתר זה מותאם לשימוש עם קוראי מסך ומיועד לעמוד בדרישות תקן WCAG 2.1 ברמה AA.
            </p>
            <p>
              נתקלתם בבעיית נגישות? נשמח לשמוע —{" "}
              <a href="tel:0506500855" className="text-primary font-medium">050-650-0855</a>
            </p>
            <p className="text-xs opacity-70">עודכן: מאי 2026</p>
          </ExpandableSection>

          <ExpandableSection title="תנאי שימוש ופרטיות" icon={<FileText className="w-4 h-4" />}>
            <p>
              השימוש באפליקציה מהווה הסכמה לתנאי השימוש שלנו.
            </p>
            <p>
              <strong>מידע אישי:</strong> הפרטים שתמסרו (שם, טלפון) ישמשו אך ורק לצורך עיבוד הזמנתכם ולא יועברו לצד שלישי.
            </p>
            <p>
              <strong>עוגיות:</strong> האפליקציה שומרת נתונים מקומיים (localStorage) בלבד לנוחות השימוש.
            </p>
            <p>
              לפרטים נוספים ניתן לפנות אלינו בטלפון{" "}
              <a href="tel:0506500855" className="text-primary font-medium">050-650-0855</a>
            </p>
          </ExpandableSection>
        </motion.div>
      </div>
    </div>
  )
}
