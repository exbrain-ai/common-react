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
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
}
