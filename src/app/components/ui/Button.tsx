"use client";

import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  children: React.ReactNode;
}

const buttonVariants = {
  primary: {
    base: "bg-[hsl(118,100%,70%)] text-black hover:bg-[hsl(118,80%,60%)] focus:ring-[hsl(118,100%,70%)]",
    disabled: "disabled:bg-[hsl(118,100%,70%)]/50 disabled:text-black/50",
  },
  secondary: {
    base: "bg-white/10 text-white hover:bg-white/20 focus:ring-white/30",
    disabled: "disabled:bg-white/5 disabled:text-white/30",
  },
  outline: {
    base: "border-2 border-[hsl(118,100%,70%)] text-[hsl(118,100%,70%)] hover:bg-[hsl(118,100%,70%)] hover:text-black focus:ring-[hsl(118,100%,70%)]",
    disabled:
      "disabled:border-[hsl(118,100%,70%)]/30 disabled:text-[hsl(118,100%,70%)]/30",
  },
  ghost: {
    base: "text-white hover:bg-white/10 focus:ring-white/20",
    disabled: "disabled:text-white/30",
  },
  destructive: {
    base: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    disabled: "disabled:bg-red-600/50 disabled:text-white/50",
  },
};

const buttonSizes = {
  sm: "px-3 py-2 text-sm",
  md: "px-4 py-3 text-base",
  lg: "px-6 py-4 text-lg",
};

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  isLoading = false,
  loadingText,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled,
  className = "",
  children,
  ...props
}) => {
  const variantStyles = buttonVariants[variant];
  const sizeStyles = buttonSizes[size];

  const isDisabled = disabled || isLoading;

  const baseClasses = [
    "inline-flex items-center justify-center",
    "rounded-md font-semibold",
    "transition-all duration-200 ease-in-out",
    "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[hsl(125,100%,5%)]",
    "active:transform active:scale-[0.98]",
    "disabled:cursor-not-allowed disabled:transform-none",
    sizeStyles,
    variantStyles.base,
    variantStyles.disabled,
    fullWidth ? "w-full" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={baseClasses} disabled={isDisabled} {...props}>
      {isLoading && (
        <div className="mr-2 flex items-center">
          <img
            src="/images/bench2.svg"
            color="white"
            alt="Loading"
            className="h-10 w-10 animate-bounce"
            style={{ filter: "invert(1)" }}
          />
        </div>
      )}

      {/* {!isLoading && leftIcon && (
        <span className="mr-2 flex items-center">{leftIcon}</span>
      )} */}

      <span className="flex items-center">
        {isLoading && loadingText ? loadingText : children}
      </span>

      {/* {!isLoading && rightIcon && (
        <span className="ml-2 flex items-center">{rightIcon}</span>
      )} */}
      {isLoading && (
        <div className="ml-2 flex items-center">
          <img
            src="/images/bench2.svg"
            color="white"
            alt="Loading"
            className="h-10 w-10 animate-bounce"
            style={{ filter: "invert(1)" }}
          />
        </div>
      )}
    </button>
  );
};
