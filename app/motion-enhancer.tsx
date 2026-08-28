"use client";

import { useEffect } from "react";

export default function MotionEnhancer() {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("motion-ready");
    const revealItems = document.querySelectorAll(".section-heading,.route-card,.empty-panel,.resource,.path li,.return-panel");
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    revealItems.forEach((item, index) => {
      (item as HTMLElement).style.setProperty("--reveal-delay", `${Math.min(index % 4, 3) * 70}ms`);
      observer.observe(item);
    });

    const onPointer = (event: PointerEvent) => {
      root.style.setProperty("--pointer-x", `${event.clientX}px`);
      root.style.setProperty("--pointer-y", `${event.clientY}px`);
    };
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      root.style.setProperty("--scroll-progress", `${max > 0 ? scrollY / max : 0}`);
    };
    addEventListener("pointermove", onPointer, { passive: true });
    addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      observer.disconnect();
      removeEventListener("pointermove", onPointer);
      removeEventListener("scroll", onScroll);
      root.classList.remove("motion-ready");
    };
  }, []);

  return <><div className="scroll-progress" aria-hidden="true"/><div className="cursor-light" aria-hidden="true"/></>;
}
