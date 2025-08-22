"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

// Componente para manejar el foco visible
export function FocusVisible({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

// Componente para manejar animaciones con motion-reduce
export function MotionSafe({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "motion-reduce:transition-none motion-reduce:animate-none",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

// Componente para manejar estados de hover mejorados
export function HoverCard({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "transition-all duration-200 ease-in-out hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] motion-reduce:transition-none motion-reduce:hover:scale-100 motion-reduce:active:scale-100",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

// Componente para manejar estados de focus mejorados
export function FocusCard({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "transition-all duration-200 ease-in-out focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none",
        className
      )}
      tabIndex={0}
      {...props}
    >
      {children}
    </div>
  )
}

// Hook para manejar el foco con teclado
export function useKeyboardFocus() {
  const [isFocused, setIsFocused] = React.useState(false)

  const handleKeyDown = React.useCallback((event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      // Trigger click or action
    }
  }, [])

  const focusProps = {
    onFocus: () => setIsFocused(true),
    onBlur: () => setIsFocused(false),
    onKeyDown: handleKeyDown,
    tabIndex: 0,
  }

  return { isFocused, focusProps }
}

// Componente para manejar skip links (accesibilidad)
export function SkipLink({
  href,
  children,
  className,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      href={href}
      className={cn(
        "absolute -top-10 left-6 z-50 bg-primary text-primary-foreground px-4 py-2 rounded-md focus:top-6 transition-all duration-200",
        className
      )}
      {...props}
    >
      {children}
    </a>
  )
}

// Componente para manejar loading states accesibles
export function LoadingSpinner({
  size = "default",
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  size?: "sm" | "default" | "lg"
}) {
  const sizeClasses = {
    sm: "h-4 w-4",
    default: "h-8 w-8",
    lg: "h-12 w-12",
  }

  return (
    <div
      role="status"
      aria-label="Cargando"
      className={cn(
        "animate-spin rounded-full border-2 border-muted border-t-primary",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      <span className="sr-only">Cargando...</span>
    </div>
  )
}



