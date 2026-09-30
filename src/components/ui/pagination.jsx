import * as React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

const Pagination = ({ className, ...props }) => (
  <nav
    role="navigation"
    aria-label="pagination"
    className={cn("mx-auto flex w-full justify-center", className)}
    {...props}
  />
);
Pagination.displayName = "Pagination";

const PaginationContent = React.forwardRef(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn("flex flex-wrap items-center gap-1 sm:gap-1.5", className)}
    {...props}
  />
));
PaginationContent.displayName = "PaginationContent";

const PaginationItem = React.forwardRef(({ className, ...props }, ref) => (
  <li ref={ref} className={cn("", className)} {...props} />
));
PaginationItem.displayName = "PaginationItem";

const PaginationLink = ({
  className,
  isActive,
  size = "icon",
  ...props
}) => (
  <button
    type="button"
    aria-current={isActive ? "page" : undefined}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-xs font-bold ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#022a5b] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer h-8 sm:h-9 min-w-8 sm:min-w-9 px-2 sm:px-3 border",
      isActive
        ? "bg-[#022a5b] text-white border-[#022a5b] shadow-xs hover:bg-[#022a5b]/90"
        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-slate-900",
      className
    )}
    {...props}
  />
);
PaginationLink.displayName = "PaginationLink";

const PaginationPrevious = ({
  className,
  disabled,
  ...props
}) => (
  <button
    type="button"
    aria-label="Go to previous page"
    disabled={disabled}
    className={cn(
      "inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-xl text-xs font-bold ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#022a5b] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40 cursor-pointer h-8 sm:h-9 px-2.5 sm:px-3 border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-2xs",
      className
    )}
    {...props}
  >
    <ChevronLeft className="h-4 w-4" />
    <span className="hidden sm:inline">Previous</span>
  </button>
);
PaginationPrevious.displayName = "PaginationPrevious";

const PaginationNext = ({
  className,
  disabled,
  ...props
}) => (
  <button
    type="button"
    aria-label="Go to next page"
    disabled={disabled}
    className={cn(
      "inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-xl text-xs font-bold ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#022a5b] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40 cursor-pointer h-8 sm:h-9 px-2.5 sm:px-3 border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-2xs",
      className
    )}
    {...props}
  >
    <span className="hidden sm:inline">Next</span>
    <ChevronRight className="h-4 w-4" />
  </button>
);
PaginationNext.displayName = "PaginationNext";

const PaginationEllipsis = ({
  className,
  ...props
}) => (
  <span
    aria-hidden
    className={cn("flex h-8 sm:h-9 w-8 sm:w-9 items-center justify-center text-slate-400", className)}
    {...props}
  >
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">More pages</span>
  </span>
);
PaginationEllipsis.displayName = "PaginationEllipsis";

export {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
};
