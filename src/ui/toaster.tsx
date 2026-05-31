"use client";

import { useEffect, useState } from "react";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

/** Hello uses `data-theme` on <html>; ExBrain uses `class="dark"` / `class="light"`. */
function getToastTheme(): "light" | "dark" {
  if (typeof document === "undefined") return "light";
  const el = document.documentElement;
  const dt = el.getAttribute("data-theme");
  if (dt === "dark" || dt === "light") return dt;
  if (el.classList.contains("dark")) return "dark";
  return "light";
}

export function Toaster({ ...props }: ToasterProps) {
  const [theme, setTheme] = useState<"light" | "dark" | "system">(
    () => getToastTheme(),
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setTheme(getToastTheme());
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "class"],
    });
    return () => observer.disconnect();
  }, []);

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          // Shape + shadow shared by ALL toast types.
          // bg/text/border are NOT set here — setting them here overrides
          // Sonner's per-type colour logic and makes success/error/warning
          // toasts all render as plain neutral cards (the original bug).
          toast: "group toast group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          // ── Neutral default (plain `toast()` with no type) ────────────
          // Gets the app background so it blends with the theme; no
          // coloured border since there's no semantic signal to convey.
          default:
            "group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border",
          // ── Semantic variants ─────────────────────────────────────────
          // Mirror the SkillToast.tsx design-system treatment so that both
          // toast.custom(<SkillToast />) and the built-in toast.success() /
          // toast.error() / toast.warning() / toast.info() share the same
          // visual language (tinted bg + 3px left-accent border).
          success:
            "group-[.toaster]:bg-ds-success/10 group-[.toaster]:text-foreground group-[.toaster]:border-ds-success/40 group-[.toaster]:border-l-[3px] group-[.toaster]:border-l-ds-success",
          error:
            "group-[.toaster]:bg-ds-danger/10 group-[.toaster]:text-foreground group-[.toaster]:border-ds-danger/40 group-[.toaster]:border-l-[3px] group-[.toaster]:border-l-ds-danger",
          warning:
            "group-[.toaster]:bg-ds-warning/10 group-[.toaster]:text-foreground group-[.toaster]:border-ds-warning/40 group-[.toaster]:border-l-[3px] group-[.toaster]:border-l-ds-warning",
          info:
            "group-[.toaster]:bg-brand/10 group-[.toaster]:text-foreground group-[.toaster]:border-brand/40 group-[.toaster]:border-l-[3px] group-[.toaster]:border-l-brand",
        },
      }}
      {...props}
    />
  );
}
