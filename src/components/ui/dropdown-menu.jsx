import * as React from "react"
import { Popover as PopoverPrimitive } from "@base-ui/react/popover"
import { cn } from "cn"

function DropdownMenu({ ...props }) {
  return <PopoverPrimitive.Root data-slot="dropdown-menu" {...props} />
}

function DropdownMenuTrigger({ className, ...props }) {
  return (
    <PopoverPrimitive.Trigger
      data-slot="dropdown-menu-trigger"
      className={cn("cursor-pointer outline-none", className)}
      {...props}
    />
  )
}

function DropdownMenuContent({
  className,
  side = "bottom",
  sideOffset = 6,
  align = "end",
  alignOffset = 0,
  ...props
}) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        className="isolate z-50"
      >
        <PopoverPrimitive.Popup
          data-slot="dropdown-menu-content"
          className={cn(
            "z-50 min-w-[200px] overflow-hidden rounded-xl bg-white p-1 text-slate-900 shadow-xl border border-slate-200/90 duration-100 data-[open]:animate-in data-[open]:fade-in-0 data-[open]:zoom-in-95 data-[closed]:animate-out data-[closed]:fade-out-0 data-[closed]:zoom-out-95 dark:bg-slate-900 dark:text-slate-100 dark:border-slate-800",
            className
          )}
          {...props}
        />
      </PopoverPrimitive.Positioner>
    </PopoverPrimitive.Portal>
  )
}

function DropdownMenuItem({ className, destructive, onClick, children, ...props }) {
  return (
    <PopoverPrimitive.Close
      data-slot="dropdown-menu-item"
      onClick={onClick}
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 outline-none transition-colors hover:bg-slate-100 hover:text-slate-900 focus:bg-slate-100 focus:text-slate-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white dark:focus:bg-slate-800",
        destructive && "text-red-600 hover:bg-red-50 hover:text-red-700 focus:bg-red-50 focus:text-red-700 dark:text-red-400 dark:hover:bg-red-950/40 dark:hover:text-red-300",
        className
      )}
      {...props}
    >
      {children}
    </PopoverPrimitive.Close>
  )
}

function DropdownMenuLabel({ className, ...props }) {
  return (
    <div
      data-slot="dropdown-menu-label"
      className={cn("px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400", className)}
      {...props}
    />
  )
}

function DropdownMenuSeparator({ className, ...props }) {
  return (
    <div
      data-slot="dropdown-menu-separator"
      className={cn("-mx-1 my-1 h-px bg-slate-100 dark:bg-slate-800", className)}
      {...props}
    />
  )
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
}
