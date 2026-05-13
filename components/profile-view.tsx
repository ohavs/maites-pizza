"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { User, Phone, MapPin, Clock, ChevronDown, CheckCircle2, Shield, FileText, Lock, Info, Trash2, AlertTriangle } from "lucide-react"

const CUSTOMER_KEY = "maites-customer"
const CART_KEY = "maites-cart"

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
        aria-expanded={open}
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
            <div className="px-5 pb-5 pt-1 border-t border-border/10 text-[13px] text-muted-foreground leading-relaxed space-y-3">
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
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [deleted, setDeleted] = useState(false)

  const handleDelete = () => {
    try {
      localStorage.removeItem(CUSTOMER_KEY)
      localStorage.removeItem(CART_KEY)
    } catch {}
    setName("")
    setPhone("")
    setConfirmingDelete(false)
    setDeleted(true)
    setTimeout(() => setDeleted(false), 3000)
  }

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
              aria-label="שם מלא"
            />
            <input
              type="tel"
              placeholder="מספר טלפון"
              value={phone}
              onChange={e => setPhone(e.target.value.replace(/[^\d]/g, ""))}
              className="w-full h-12 rounded-2xl bg-muted px-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 text-base"
              inputMode="tel"
              autoComplete="tel"
              aria-label="מספר טלפון"
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
                aria-label="חייג ל־050-650-0855"
              >
                050-650-0855
              </a>
            </div>
          </div>
        </motion.div>

        {/* Image disclaimer banner */}
        <motion.div
          custom={2}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="rounded-[20px] bg-orange-50 border border-orange-200/60 px-5 py-3 flex items-start gap-3"
        >
          <Info className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
          <p className="text-[13px] text-orange-900/80 leading-relaxed">
            תמונות המוצרים והפיצות באפליקציה הינן <strong>להמחשה בלבד</strong> וייתכנו שינויים בין התמונה למוצר בפועל.
          </p>
        </motion.div>

        {/* Data management */}
        <motion.div
          custom={3}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="rounded-[24px] bg-card border border-border/15 shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-5 space-y-3"
        >
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center text-red-500 shrink-0">
              <Trash2 className="w-4 h-4" />
            </div>
            <h2 className="font-bold text-foreground">ניהול הנתונים שלי</h2>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            לחיצה על הכפתור תמחק את הפרטים האישיים והסל ששמורים במכשיר זה. הזמנות שכבר בוצעו יישמרו במערכת לצרכי חוק (חשבונאות ומס) — למחיקתן מהמערכת ניתן לפנות בטלפון{" "}
            <a href="tel:0506500855" className="text-primary font-bold" dir="ltr">050-650-0855</a>.
          </p>
          <motion.button
            onClick={() => setConfirmingDelete(true)}
            whileTap={{ scale: 0.97 }}
            className="w-full h-11 rounded-full font-bold text-sm flex items-center justify-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 transition-colors border border-red-200/60"
          >
            <Trash2 className="w-4 h-4" /> מחק את הפרטים שלי
          </motion.button>
          <AnimatePresence>
            {deleted && (
              <motion.p
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-xs text-green-600 font-semibold text-center flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> הפרטים נמחקו מהמכשיר
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Info sections */}
        <motion.div
          custom={4}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="space-y-2"
        >
          <ExpandableSection title="הצהרת נגישות" icon={<Shield className="w-4 h-4" />}>
            <p>
              מסעדת Maites פיצה (להלן: "העסק") רואה חשיבות עליונה במתן שירות שוויוני ונגיש לכלל לקוחותיה, לרבות אנשים עם מוגבלות, וזאת בהתאם להוראות <strong>חוק שוויון זכויות לאנשים עם מוגבלות, התשנ"ח–1998</strong> ולתקנות שהותקנו מכוחו.
            </p>
            <div>
              <p className="font-bold text-foreground/80 mb-1">תקן ההנגשה</p>
              <p>
                האפליקציה הונגשה בהתאם לדרישות <strong>תקן ישראלי 5568</strong> (המבוסס על הנחיות WCAG 2.0 ברמה AA) של מכון התקנים הישראלי, ככל הניתן.
              </p>
            </div>
            <div>
              <p className="font-bold text-foreground/80 mb-1">אמצעי נגישות באפליקציה</p>
              <ul className="list-disc ps-5 space-y-1">
                <li>מבנה סמנטי תקין לתמיכה בקוראי מסך</li>
                <li>ניווט מקלדת באמצעות מקש Tab</li>
                <li>חלופות טקסטואליות (alt) לתמונות משמעותיות</li>
                <li>ניגודיות צבעים תקנית</li>
                <li>גופנים ברורים וקריאים</li>
                <li>תוויות (label) לכלל שדות הקלט</li>
              </ul>
            </div>
            <div>
              <p className="font-bold text-foreground/80 mb-1">מגבלות נגישות ידועות</p>
              <p>
                ייתכנו דפים או רכיבים שטרם הונגשו במלואם. אנו פועלים באופן שוטף לשיפור הנגישות באפליקציה ולתיקון ליקויים.
              </p>
            </div>
            <div>
              <p className="font-bold text-foreground/80 mb-1">פרטי רכז הנגישות</p>
              <p>
                לכל פנייה, הצעה או דיווח על ליקוי נגישות ניתן לפנות אל רכז הנגישות של העסק:
              </p>
              <p className="mt-1">
                טלפון:{" "}
                <a href="tel:0506500855" className="text-primary font-bold" dir="ltr">050-650-0855</a>
              </p>
              <p>
                מענה לפניות יינתן בתוך זמן סביר, ולא יאוחר מ־45 ימי עבודה ממועד הפנייה.
              </p>
            </div>
            <p className="text-xs opacity-70 pt-2 border-t border-border/10">
              תאריך עדכון אחרון: מאי 2026
            </p>
          </ExpandableSection>

          <ExpandableSection title="מדיניות פרטיות" icon={<Lock className="w-4 h-4" />}>
            <p>
              העסק מכבד את פרטיות המשתמשים באפליקציה ופועל בהתאם להוראות <strong>חוק הגנת הפרטיות, התשמ"א–1981</strong>, התקנות שהותקנו מכוחו, וכל דין רלוונטי.
            </p>
            <div>
              <p className="font-bold text-foreground/80 mb-1">איזה מידע נאסף?</p>
              <ul className="list-disc ps-5 space-y-1">
                <li>פרטים שנמסרו במעמד הזמנה: שם מלא ומספר טלפון</li>
                <li>פרטי ההזמנה (פריטים, סכום, אופן תשלום)</li>
                <li>נתונים טכניים בסיסיים הנדרשים לתפקוד האפליקציה</li>
              </ul>
            </div>
            <div>
              <p className="font-bold text-foreground/80 mb-1">מטרות השימוש במידע</p>
              <ul className="list-disc ps-5 space-y-1">
                <li>עיבוד ההזמנה ויצירת קשר בקשר אליה</li>
                <li>ניהול תפעולי של העסק</li>
                <li>עמידה בחובות חוקיות (לרבות חוק הגנת הצרכן)</li>
              </ul>
            </div>
            <div>
              <p className="font-bold text-foreground/80 mb-1">מסירת מידע לצדדים שלישיים</p>
              <p>
                העסק <strong>אינו מעביר</strong> מידע אישי לצדדים שלישיים למטרות שיווקיות. מידע עשוי להיות מועבר רק במקרים הבאים: חובה חוקית, צו שיפוטי, או הגנה על זכויות העסק.
              </p>
            </div>
            <div>
              <p className="font-bold text-foreground/80 mb-1">שמירת המידע ואבטחתו</p>
              <p>
                המידע נשמר בשרתי Firebase (Google) באירופה. העסק נוקט באמצעי אבטחה סבירים להגנה על המידע, אולם אינו יכול להבטיח חסינות מוחלטת מפני פריצות או גישה בלתי מורשית.
              </p>
            </div>
            <div>
              <p className="font-bold text-foreground/80 mb-1">תקופת שמירת המידע</p>
              <p>
                פרטי הזמנות נשמרים במערכת לתקופה של <strong>7 שנים</strong> ממועד ביצוע ההזמנה, וזאת לצורך עמידה בחובות שמירת תיעוד לפי תקנות מס הכנסה ופקודת מס ערך מוסף. בתום תקופה זו, המידע יימחק או יעבור אנונימיזציה.
              </p>
            </div>
            <div>
              <p className="font-bold text-foreground/80 mb-1">אחסון מקומי במכשיר</p>
              <p>
                לצורך נוחות המשתמש, פרטי הסל וההזמנה האחרונה נשמרים באחסון המקומי של הדפדפן (localStorage) במכשירכם בלבד. ניתן לנקות זאת בכל עת מהגדרות הדפדפן.
              </p>
            </div>
            <div>
              <p className="font-bold text-foreground/80 mb-1">זכויות המשתמש</p>
              <p>
                בהתאם לחוק, עומדת לך הזכות לעיין במידע אודותיך, לבקש את תיקונו או את מחיקתו. ניתן למחוק את הפרטים שנשמרים על המכשיר באמצעות כפתור "מחק את הפרטים שלי" שבמעלה עמוד זה. למחיקת מידע השמור במערכת ניתן לפנות בטלפון{" "}
                <a href="tel:0506500855" className="text-primary font-bold" dir="ltr">050-650-0855</a>.
              </p>
            </div>
            <div>
              <p className="font-bold text-foreground/80 mb-1">פרטי בעל המאגר</p>
              <p>Maites Pizza</p>
              <p>בית שאן</p>
              <p>
                טלפון:{" "}
                <a href="tel:0506500855" className="text-primary font-bold" dir="ltr">050-650-0855</a>
              </p>
            </div>
            <p className="text-xs opacity-70 pt-2 border-t border-border/10">
              תאריך עדכון אחרון: מאי 2026
            </p>
          </ExpandableSection>

          <ExpandableSection title="תנאי שימוש" icon={<FileText className="w-4 h-4" />}>
            <p>
              השימוש באפליקציית Maites פיצה (להלן: "האפליקציה") מהווה הסכמה מלאה ובלתי חוזרת לכלל התנאים המפורטים להלן. אם אינך מסכים לתנאים — אנא הימנע משימוש באפליקציה.
            </p>
            <div>
              <p className="font-bold text-foreground/80 mb-1">השירות</p>
              <p>
                האפליקציה משמשת להזמנת פיצות ומוצרי מזון לאיסוף עצמי בלבד מהסניף בבית שאן. השירות זמין בשעות הפעילות בלבד.
              </p>
            </div>
            <div>
              <p className="font-bold text-foreground/80 mb-1">מחירים ותשלום</p>
              <ul className="list-disc ps-5 space-y-1">
                <li>כל המחירים נקובים בשקלים חדשים (₪) וכוללים מע"מ.</li>
                <li>אופני התשלום: מזומן בעת האיסוף או באמצעות Bit.</li>
                <li>העסק שומר לעצמו את הזכות לעדכן מחירים מעת לעת.</li>
              </ul>
            </div>
            <div>
              <p className="font-bold text-foreground/80 mb-1">תמונות המוצרים</p>
              <p>
                <strong>תמונות המוצרים והפיצות באפליקציה הינן להמחשה בלבד.</strong> ייתכנו הבדלים בין התמונות לבין המוצר שיסופק בפועל (במראה, בכמות הציפויים, בצורה ובגודל).
              </p>
            </div>
            <div>
              <p className="font-bold text-foreground/80 mb-1">ביטול עסקה</p>
              <p>
                בהתאם ל<strong>חוק הגנת הצרכן, התשמ"א–1981</strong>, ובשל היות המוצר מזון מבושל המוכן לפי הזמנה אישית — לא ניתן לבטל הזמנה לאחר תחילת הכנתה. ניתן לבטל הזמנה לפני שהחלה הכנתה באמצעות פנייה טלפונית לעסק.
              </p>
            </div>
            <div>
              <p className="font-bold text-foreground/80 mb-1">אלרגנים ורגישויות</p>
              <p>
                מטבח העסק מכין מגוון מוצרים העשויים להכיל אלרגנים (גלוטן, חלב, אגוזים, סויה ועוד). על אף הקפדה על הפרדה, ייתכן זיהום צולב. לקוחות עם רגישויות מתבקשים <strong>ליידע את העסק טלפונית לפני ההזמנה</strong>.
              </p>
            </div>
            <div>
              <p className="font-bold text-foreground/80 mb-1">קניין רוחני</p>
              <p>
                כל הזכויות באפליקציה, לרבות עיצוב, קוד, תמונות, סימני מסחר ותכנים — שמורות לעסק. אין להעתיק, לשכפל או לעשות שימוש מסחרי בתכנים ללא אישור מראש ובכתב.
              </p>
            </div>
            <div>
              <p className="font-bold text-foreground/80 mb-1">הגבלת אחריות</p>
              <p>
                העסק אינו אחראי לכל נזק עקיף או תוצאתי שייגרם משימוש באפליקציה או מתקלה טכנית. אחריות העסק מוגבלת לגובה הסכום ששולם בפועל בגין ההזמנה הספציפית.
              </p>
            </div>
            <div>
              <p className="font-bold text-foreground/80 mb-1">דין וסמכות שיפוט</p>
              <p>
                על תנאי שימוש אלו יחולו דיני מדינת ישראל בלבד. סמכות השיפוט הבלעדית בכל מחלוקת תהיה לבתי המשפט המוסמכים במחוז הצפון.
              </p>
            </div>
            <div>
              <p className="font-bold text-foreground/80 mb-1">שינויים בתנאים</p>
              <p>
                העסק רשאי לעדכן את תנאי השימוש מעת לעת. נוסח התנאים המעודכן יפורסם באפליקציה ויחייב מרגע פרסומו.
              </p>
            </div>
            <p className="text-xs opacity-70 pt-2 border-t border-border/10">
              תאריך עדכון אחרון: מאי 2026
            </p>
          </ExpandableSection>
        </motion.div>
      </div>

      {/* Delete-confirmation modal */}
      <AnimatePresence>
        {confirmingDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 backdrop-blur-sm px-6"
            onClick={() => setConfirmingDelete(false)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 12 }}
              transition={{ type: "spring", stiffness: 380, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[340px] rounded-[28px] bg-card border border-white/40 p-6 shadow-2xl"
            >
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 rounded-full bg-red-50 p-3.5">
                  <AlertTriangle className="h-6 w-6 text-red-500" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-1.5">למחוק את הפרטים?</h3>
                <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
                  הפעולה תמחק את השם, הטלפון והסל ששמורים על המכשיר. הפעולה אינה ניתנת לביטול.
                </p>
                <div className="flex gap-2 w-full">
                  <motion.button
                    onClick={() => setConfirmingDelete(false)}
                    whileTap={{ scale: 0.97 }}
                    className="flex-1 h-11 rounded-full bg-muted text-foreground font-semibold"
                  >
                    ביטול
                  </motion.button>
                  <motion.button
                    onClick={handleDelete}
                    whileTap={{ scale: 0.97 }}
                    className="flex-1 h-11 rounded-full bg-red-500 text-white font-semibold shadow-lg shadow-red-500/20"
                  >
                    מחק
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
