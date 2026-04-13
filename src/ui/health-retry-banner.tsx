"use client";

import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "./alert";
import { Button } from "./button";
import { Spinner } from "./spinner";
import { cn } from "../utils/cn";

export interface HealthRetryBannerProps {
  /** Primary message (e.g. dependency unavailable). */
  message: string;
  retryLabel: string;
  retryingLabel: string;
  onRetry: () => void;
  retryLoading: boolean;
  className?: string;
}

/**
 * Warning alert with retry — uses shared shadcn Alert + Button. Pass translated strings from the app.
 */
export function HealthRetryBanner({
  message,
  retryLabel,
  retryingLabel,
  onRetry,
  retryLoading,
  className,
}: HealthRetryBannerProps) {
  return (
    <Alert variant="warning" className={cn(className)}>
      <AlertTriangle className="h-4 w-4" aria-hidden />
      <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <AlertDescription className="mt-0">{message}</AlertDescription>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRetry}
          disabled={retryLoading}
          className="w-full shrink-0 sm:w-auto"
        >
          {retryLoading ? (
            <>
              <Spinner size={16} className="me-2" />
              {retryingLabel}
            </>
          ) : (
            retryLabel
          )}
        </Button>
      </div>
    </Alert>
  );
}
