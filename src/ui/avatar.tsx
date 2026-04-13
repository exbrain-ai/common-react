"use client";

import * as React from "react";
import { cn } from "../utils/cn";

// Custom Avatar implementation that always renders the <img> element in the DOM
// (unlike Radix Avatar which conditionally renders based on image load status).
// This ensures `getByAltText` queries work in JSDOM test environments.

interface AvatarContextValue {
  imageLoaded: boolean;
  setImageLoaded: (v: boolean) => void;
}

const AvatarContext = React.createContext<AvatarContextValue>({
  imageLoaded: false,
  setImageLoaded: () => {},
});

const Avatar = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, children, ...props }, ref) => {
  const [imageLoaded, setImageLoaded] = React.useState(false);
  return (
    <AvatarContext.Provider value={{ imageLoaded, setImageLoaded }}>
      <span
        ref={ref}
        className={cn(
          "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
          className
        )}
        {...props}
      >
        {children}
      </span>
    </AvatarContext.Provider>
  );
});
Avatar.displayName = "Avatar";

const AvatarImage = React.forwardRef<
  HTMLImageElement,
  React.ImgHTMLAttributes<HTMLImageElement>
>(({ className, alt, onLoad, onError, ...props }, ref) => {
  const { setImageLoaded } = React.useContext(AvatarContext);
  return (
    /* Raw <img> keeps a stable DOM for tests; this library is not Next.js-specific. */
    <img
      ref={ref}
      alt={alt}
      className={cn("aspect-square h-full w-full", className)}
      onLoad={(e) => {
        setImageLoaded(true);
        onLoad?.(e);
      }}
      onError={(e) => {
        setImageLoaded(false);
        onError?.(e);
      }}
      {...props}
    />
  );
});
AvatarImage.displayName = "AvatarImage";

const AvatarFallback = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => {
  const { imageLoaded } = React.useContext(AvatarContext);
  if (imageLoaded) return null;
  return (
    <span
      ref={ref}
      className={cn(
        "flex h-full w-full items-center justify-center rounded-full bg-muted text-sm font-medium",
        className
      )}
      {...props}
    />
  );
});
AvatarFallback.displayName = "AvatarFallback";

export { Avatar, AvatarImage, AvatarFallback };
