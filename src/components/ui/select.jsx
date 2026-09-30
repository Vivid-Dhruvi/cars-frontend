"use client";

import * as React from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const SelectContext = React.createContext(null);

export function Select({
  value,
  onValueChange,
  children,
  defaultValue,
  disabled = false,
  className
}) {
  const [open, setOpen] = React.useState(false);
  const [selectedValue, setSelectedValue] = React.useState(defaultValue || value);
  const triggerRef = React.useRef(null);
  const contentRef = React.useRef(null);

  const currentValue = value !== undefined ? value : selectedValue;

  const handleSelect = React.useCallback(
    (val) => {
      if (value === undefined) setSelectedValue(val);
      if (onValueChange) onValueChange(val);
      setOpen(false);
      triggerRef.current?.focus();
    },
    [value, onValueChange]
  );

  // Close when clicking outside or pressing Escape
  React.useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(event.target) &&
        contentRef.current &&
        !contentRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <SelectContext.Provider
      value={{
        open,
        setOpen,
        value: currentValue,
        handleSelect,
        triggerRef,
        contentRef,
        disabled,
      }}
    >
      <div className={cn("relative inline-block text-left", className)}>
        {children}
      </div>
    </SelectContext.Provider>
  );
}

export const SelectTrigger = React.forwardRef(
  ({ className, children, ...props }, ref) => {
    const { open, setOpen, triggerRef, disabled } = React.useContext(SelectContext);

    return (
      <button
        ref={(node) => {
          triggerRef.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        type="button"
        role="combobox"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => !disabled && setOpen(!open)}
        className={cn(
          "flex h-8 items-center justify-between gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:bg-slate-50 hover:border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#022a5b] focus:border-[#022a5b] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer select-none",
          open && "ring-2 ring-[#022a5b] border-[#022a5b] bg-slate-50",
          className
        )}
        {...props}
      >
        {children}
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 text-slate-400 transition-transform duration-200 shrink-0",
            open && "rotate-180 text-slate-700"
          )}
        />
      </button>
    );
  }
);
SelectTrigger.displayName = "SelectTrigger";

export function SelectValue({ placeholder, className }) {
  const { value } = React.useContext(SelectContext);
  return (
    <span className={cn("truncate font-bold text-slate-800", className)}>
      {value !== undefined && value !== null && value !== ""
        ? value
        : (placeholder || "")}
    </span>
  );
}

export const SelectContent = React.forwardRef(
  ({ className, children, side = "top", align = "end", ...props }, ref) => {
    const { open, contentRef } = React.useContext(SelectContext);

    if (!open) return null;

    const sideClasses =
      side === "top"
        ? "bottom-full mb-1.5 origin-bottom"
        : "top-full mt-1.5 origin-top";

    const alignClasses =
      align === "end"
        ? "right-0"
        : align === "center"
        ? "left-1/2 -translate-x-1/2"
        : "left-0";

    return (
      <div
        ref={(node) => {
          contentRef.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        role="listbox"
        className={cn(
          "absolute z-50 min-w-[4.5rem] overflow-hidden rounded-xl border border-slate-200/90 bg-white p-1 text-slate-800 shadow-xl shadow-slate-900/10 ring-1 ring-black/5 animate-in fade-in-50 zoom-in-95",
          sideClasses,
          alignClasses,
          className
        )}
        {...props}
      >
        <div className="flex flex-col gap-0.5">{children}</div>
      </div>
    );
  }
);
SelectContent.displayName = "SelectContent";

export const SelectItem = React.forwardRef(
  ({ className, children, value, ...props }, ref) => {
    const { value: selectedValue, handleSelect } = React.useContext(SelectContext);
    const isSelected = String(selectedValue) === String(value);

    return (
      <div
        ref={ref}
        role="option"
        aria-selected={isSelected}
        onClick={() => handleSelect(value)}
        className={cn(
          "relative flex cursor-pointer select-none items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-semibold outline-hidden transition-colors hover:bg-slate-100 hover:text-slate-900",
          isSelected
            ? "bg-slate-50 text-[#022a5b] font-bold"
            : "text-slate-700",
          className
        )}
        {...props}
      >
        <span>{children}</span>
        {isSelected && (
          <Check className="h-3.5 w-3.5 text-[#022a5b] stroke-[2.5] ml-2 shrink-0" />
        )}
      </div>
    );
  }
);
SelectItem.displayName = "SelectItem";
