import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "../utils/cn";

interface SpinnerProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: number;
}

export function Spinner({ className, size = 20, ...props }: SpinnerProps) {
  return (
    <span
      role="progressbar"
      aria-label="Loading"
      className={cn("inline-flex items-center justify-center", className)}
      {...props}
    >
      <Loader2
        style={{ width: size, height: size }}
        className="animate-spin text-current"
      />
    </span>
  );
}
