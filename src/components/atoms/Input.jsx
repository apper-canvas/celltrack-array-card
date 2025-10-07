import { forwardRef } from "react";
import { cn } from "@/utils/cn";

const Input = forwardRef(({ 
  className,
  type = "text",
  error,
  ...props 
}, ref) => {
  return (
    <input
      type={type}
      ref={ref}
      className={cn(
        "w-full px-3 py-2 border rounded bg-white text-secondary transition-colors duration-150",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
        error ? "border-error" : "border-gray-300",
        "disabled:bg-gray-100 disabled:cursor-not-allowed",
        className
      )}
      {...props}
    />
  );
});

Input.displayName = "Input";

export default Input;