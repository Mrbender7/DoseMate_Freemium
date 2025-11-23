import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:-translate-x-full hover:before:translate-x-full before:transition-transform before:duration-700 after:absolute after:inset-0 after:bg-gradient-to-b after:from-white/5 after:via-transparent after:to-black/5 after:pointer-events-none",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-button",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-button",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-button",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        elevated: "bg-gradient-to-b from-primary via-primary/95 to-primary/85 text-primary-foreground shadow-[inset_0_2px_0_rgba(255,255,255,0.3),inset_0_-1px_0_rgba(0,0,0,0.2),0_6px_12px_rgba(0,0,0,0.2),0_3px_6px_rgba(0,0,0,0.15),0_1px_3px_rgba(0,0,0,0.1)] border border-primary/20 hover:shadow-[inset_0_2px_0_rgba(255,255,255,0.3),inset_0_-1px_0_rgba(0,0,0,0.2),0_8px_16px_rgba(0,0,0,0.25),0_4px_8px_rgba(0,0,0,0.2)] hover:-translate-y-1 hover:scale-105 active:translate-y-0 active:scale-100 active:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),inset_0_2px_4px_rgba(0,0,0,0.3),0_2px_4px_rgba(0,0,0,0.1)]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
