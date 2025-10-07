import React, { forwardRef } from "react";
import { cn } from "@/utils/cn";

const Card = forwardRef(({ 
  children, 
  className,
  hoverable = false,
  onClick,
  ...props 
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "bg-surface rounded-lg shadow-card p-4 transition-shadow duration-200",
hoverable && "hover:shadow-card-hover cursor-pointer",
        onClick && "cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = "Card";

export default Card;