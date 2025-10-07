import { forwardRef } from "react";
import { cn } from "@/utils/cn";

const Badge = forwardRef(({ 
  children, 
  className, 
  variant = "default",
  ...props 
}, ref) => {
  const variants = {
    default: "bg-gray-100 text-gray-700",
    success: "bg-green-100 text-green-700 font-semibold",
    warning: "bg-yellow-100 text-yellow-700 font-semibold",
    error: "bg-red-100 text-red-700 font-semibold",
    info: "bg-blue-100 text-blue-700",
    primary: "bg-primary text-white"
  };
  
  return (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-small font-medium transition-colors",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
});

Badge.displayName = "Badge";

export default Badge;