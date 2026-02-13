import clsx from "clsx";
import * as React from "react";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
};

export function Button({ className, variant = "primary", size = "default", ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center rounded-xl text-sm font-medium transition",
        variant === "primary" && "bg-black text-white hover:opacity-90",
        variant === "ghost" && "bg-transparent text-black hover:bg-black/5",
        size === "default" && "px-4 py-2",
        size === "sm" && "px-3 py-1.5 text-xs",
        size === "lg" && "px-6 py-3",
        size === "icon" && "size-8 p-0",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
      {...props}
    />
  );
}
