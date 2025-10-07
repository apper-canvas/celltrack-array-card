import { forwardRef } from "react";
import { cn } from "@/utils/cn";

const Button = forwardRef(({ 
  children, 
  className, 
  variant = "primary", 
  size = "md",
  disabled = false,
  ...props 
}, ref) => {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-primary text-white hover:bg-blue-700 focus:ring-primary hover:shadow-lg hover:scale-[1.02]",
    secondary: "border border-gray-300 text-secondary bg-white hover:bg-gray-50 focus:ring-gray-500",
    danger: "bg-error text-white hover:bg-red-600 focus:ring-error hover:shadow-lg",
    success: "bg-success text-white hover:bg-green-600 focus:ring-success hover:shadow-lg",
    ghost: "text-secondary hover:bg-gray-100 focus:ring-gray-500"
  };
  
  const sizes = {
    sm: "px-3 py-1.5 text-sm rounded",
    md: "px-4 py-2 text-body rounded-md",
    lg: "px-6 py-3 text-lg rounded-lg"
  };
  
  return (
    <button
      ref={ref}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = "Button";

export default Button;