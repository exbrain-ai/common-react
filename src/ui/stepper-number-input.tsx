import * as React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

import { cn } from "../utils/cn";

/** Hide unreliable native spinner UI; ↑/↓ on the `<input>` still works in typical browsers. */
const SPINNER_HIDE =
  "[-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none";

export type StepperNumberInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "size"> & {
  min?: number;
  max?: number;
};

/**
 * Numeric field without native spinner chrome (often illegible / glitched on dark UIs).
 * Uses `type="number"` so keyboard ↑/↓ still steps; adds chevron buttons for mouse/touch users.
 */
const StepperNumberInput = React.forwardRef<HTMLInputElement, StepperNumberInputProps>(
  (
    { className, min = 0, max, step = 1, disabled, readOnly, value, defaultValue, onChange, id, ...inputProps },
    ref,
  ) => {
    const innerRef = React.useRef<HTMLInputElement>(null);

    React.useImperativeHandle(ref, () => innerRef.current as HTMLInputElement);

    function parseCurrent(): number {
      const raw = value ?? defaultValue ?? innerRef.current?.value ?? "";
      const n = Number.parseInt(String(raw), 10);
      if (!Number.isFinite(n)) return typeof min === "number" ? min : 0;
      return Math.trunc(n);
    }

    function emit(nextRaw: number) {
      if (!onChange) return;
      let next = nextRaw;
      if (typeof min === "number" && next < min) next = min;
      if (typeof max === "number" && Number.isFinite(max) && next > max) next = max;
      const str = String(next);
      onChange({
        target: { value: str },
        currentTarget: { value: str },
      } as React.ChangeEvent<HTMLInputElement>);
    }

    const stepNum = typeof step === "number" ? step : 1;

    function bump(direction: 1 | -1) {
      if (disabled || readOnly) return;
      emit(parseCurrent() + direction * stepNum);
    }

    const atMin = typeof min === "number" && parseCurrent() <= min;
    const atMax = typeof max === "number" && Number.isFinite(max) && parseCurrent() >= max;

    const steppersDisabled = Boolean(disabled || readOnly);

    return (
      <div
        className={cn(
          "flex h-10 w-full min-w-0 overflow-hidden rounded-[length:var(--radius-input)] border border-input bg-transparent shadow-sm transition-colors dark:bg-[var(--input-bg,transparent)]",
          "focus-within:outline-none focus-within:ring-1 focus-within:ring-ring",
          disabled ? "cursor-not-allowed opacity-50" : null,
          className,
        )}
      >
        <input
          {...inputProps}
          id={id}
          ref={innerRef}
          type="number"
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          readOnly={readOnly}
          value={value}
          defaultValue={defaultValue}
          onChange={onChange}
          className={cn(
            SPINNER_HIDE,
            "h-10 min-w-0 flex-1 border-0 bg-transparent px-2 py-1 text-center text-base font-semibold tabular-nums tracking-tight text-foreground outline-none placeholder:text-muted-foreground",
            "disabled:cursor-not-allowed disabled:opacity-70",
          )}
        />
        <div
          className="flex h-10 w-[26px] shrink-0 flex-col divide-y divide-input border-l border-input"
          role="presentation"
        >
          <button
            type="button"
            tabIndex={-1}
            disabled={steppersDisabled || atMax}
            aria-label="Increase quantity"
            className={cn(
              "flex flex-1 items-center justify-center bg-muted/40 text-muted-foreground transition-colors",
              !(steppersDisabled || atMax) && "cursor-pointer hover:bg-muted hover:text-foreground active:bg-muted",
              (steppersDisabled || atMax) && "opacity-40",
            )}
            onClick={() => bump(1)}
          >
            <ChevronUp className="pointer-events-none size-3.5" strokeWidth={2.25} />
          </button>
          <button
            type="button"
            tabIndex={-1}
            disabled={steppersDisabled || atMin}
            aria-label="Decrease quantity"
            className={cn(
              "flex flex-1 items-center justify-center bg-muted/40 text-muted-foreground transition-colors",
              !(steppersDisabled || atMin) && "cursor-pointer hover:bg-muted hover:text-foreground active:bg-muted",
              (steppersDisabled || atMin) && "opacity-40",
            )}
            onClick={() => bump(-1)}
          >
            <ChevronDown className="pointer-events-none size-3.5" strokeWidth={2.25} />
          </button>
        </div>
      </div>
    );
  },
);
StepperNumberInput.displayName = "StepperNumberInput";

export { StepperNumberInput };
