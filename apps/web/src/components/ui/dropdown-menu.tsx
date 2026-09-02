"use client";

import { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface DropdownMenuProps {
  trigger?: ReactNode;
  children: ReactNode;
  align?: "left" | "right";
}

export function DropdownMenu({ trigger, children, align = "right" }: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  return (
    <div className="relative inline-block text-left" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700"
        aria-label="Open menu"
      >
        {trigger ?? <MoreHorizontal className="h-4 w-4" />}
      </button>
      {open && (
        <div
          className={cn(
            "absolute z-20 mt-1 w-40 overflow-hidden rounded-md border border-slate-200 bg-white py-1 shadow-md",
            align === "right" ? "right-0" : "left-0"
          )}
          onClick={() => setOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
}

const itemClassName = (danger: boolean | undefined, className: string | undefined) =>
  cn(
    "flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-slate-50",
    danger ? "text-red-600 hover:bg-red-50" : "text-slate-700",
    className
  );

type DropdownMenuItemProps =
  | ({ href: string; danger?: boolean } & AnchorHTMLAttributes<HTMLAnchorElement>)
  | ({ href?: undefined; danger?: boolean } & ButtonHTMLAttributes<HTMLButtonElement>);

export function DropdownMenuItem({ className, danger, ...props }: DropdownMenuItemProps) {
  if (props.href !== undefined) {
    const { href, ...rest } = props as { href: string } & AnchorHTMLAttributes<HTMLAnchorElement>;
    return <Link href={href} className={itemClassName(danger, className)} {...rest} />;
  }

  return (
    <button
      type="button"
      className={itemClassName(danger, className)}
      {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}
    />
  );
}
