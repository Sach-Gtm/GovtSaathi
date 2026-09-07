"use client";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Reveals its children with a rise-and-fade the first time they scroll into
 * view. Server-safe wrapper — children can be server-rendered.
 */
export function Reveal({
  children,
  delay = 0,
  className,
  as: Tag = "div"
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  as?: any;
}) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag ref={ref as any} className={cn("reveal", shown && "reveal-in", className)} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </Tag>
  );
}
