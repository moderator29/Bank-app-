"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { ChevronRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

// Announcement content — edit this array to update the banner. Keep it to a
// short list of legitimate-feeling account updates. Order controls slide order.
const announcements = [
  {
    id: "a1",
    badge: "New",
    message:
      "Your investment plan is approaching maturity. Review your settlement details then an amount of $25,000.",
  },
  {
    id: "a2",
    badge: "Update",
    message:
      "Your account is currently under final portfolio review. Settlement details will be available once processing is complete.",
  },
];

// Where a tap on the banner takes the user.
const BANNER_HREF = "/notifications";

const AUTO_SLIDE_MS = 6000;
const SWIPE_THRESHOLD = 56; // px of horizontal drag before a slide commits

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 36 : -36,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({
    x: direction > 0 ? -36 : 36,
    opacity: 0,
  }),
};

export function AnnouncementBanner() {
  const router = useRouter();
  const count = announcements.length;
  const [[index, direction], setSlide] = useState<[number, number]>([0, 0]);
  const [paused, setPaused] = useState(false);
  const pointerDownX = useRef<number | null>(null);

  const paginate = useCallback(
    (dir: number) => {
      setSlide(([current]) => [(current + dir + count) % count, dir]);
    },
    [count]
  );

  const goTo = useCallback((target: number) => {
    setSlide(([current]) => [target, target > current ? 1 : -1]);
  }, []);

  // Auto-advance every AUTO_SLIDE_MS, pausing on hover / touch interaction.
  useEffect(() => {
    if (paused || count < 2) return;
    const timer = setTimeout(() => paginate(1), AUTO_SLIDE_MS);
    return () => clearTimeout(timer);
  }, [index, paused, paginate, count]);

  const handleDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    setPaused(false);
    if (Math.abs(info.offset.x) > SWIPE_THRESHOLD) {
      paginate(info.offset.x < 0 ? 1 : -1);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    // Distinguish a genuine tap from the click that fires after a swipe by
    // measuring how far the pointer travelled — synchronous and independent
    // of Framer's drag lifecycle (which resolves a frame later).
    const startX = pointerDownX.current;
    pointerDownX.current = null;
    if (startX !== null && Math.abs(e.clientX - startX) > SWIPE_THRESHOLD) return;
    router.push(BANNER_HREF);
  };

  const active = announcements[index];
  const isNew = active.badge.toLowerCase() === "new";

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onPointerDown={(e) => (pointerDownX.current = e.clientX)}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          router.push(BANNER_HREF);
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`Announcement: ${active.message}. Open notifications.`}
      className={cn(
        "glass-emerald group relative flex cursor-pointer items-center gap-3 overflow-hidden",
        "rounded-[26px] px-4 py-3.5 text-white shadow-float-lg sm:gap-4 sm:px-5 sm:py-4",
        "outline-none transition-shadow duration-300 hover:shadow-float-lg",
        "focus-visible:ring-2 focus-visible:ring-white/70"
      )}
    >
      {/* Swipeable content: badge + message + dots slide together */}
      <motion.div
        key="drag-layer"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.16}
        onDragStart={() => setPaused(true)}
        onDragEnd={handleDragEnd}
        className="relative z-10 flex min-w-0 flex-1 cursor-grab touch-pan-y items-center gap-3 active:cursor-grabbing sm:gap-4"
      >
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.div
            key={active.id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
            className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4"
          >
            {/* Premium badge — differs for "New" vs "Update" */}
            <span
              className={cn(
                "flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide shadow-sm",
                isNew
                  ? "bg-white text-brand-700"
                  : "border border-white/30 bg-white/15 text-white backdrop-blur-sm"
              )}
            >
              {isNew && <Sparkles className="h-3 w-3" />}
              {active.badge}
            </span>

            <p className="min-w-0 flex-1 text-[13px] font-medium leading-snug text-white/95 sm:text-sm">
              {active.message}
            </p>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Pagination dots */}
      <div className="relative z-10 flex shrink-0 items-center gap-1.5">
        {announcements.map((a, i) => (
          <button
            key={a.id}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goTo(i);
            }}
            aria-label={`Show announcement ${i + 1}`}
            aria-current={i === index}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              i === index ? "w-5 bg-white" : "w-1.5 bg-white/40 hover:bg-white/70"
            )}
          />
        ))}
      </div>

      {/* Right chevron — signals the banner is tappable */}
      <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15 text-white transition-transform duration-300 group-hover:translate-x-0.5">
        <ChevronRight className="h-4 w-4" />
      </span>
    </motion.section>
  );
}
