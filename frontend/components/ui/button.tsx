import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-xs font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 disabled:pointer-events-none disabled:opacity-50 cursor-pointer active:scale-[0.98]',
  {
    variants: {
      variant: {
        default:
          'bg-neutral-900 text-white shadow-sm hover:bg-neutral-800 border border-neutral-900',
        destructive:
          'bg-rose-600 text-white shadow-sm hover:bg-rose-500 border border-rose-600',
        outline:
          'border border-neutral-200 bg-white text-neutral-800 shadow-sm hover:bg-neutral-50 hover:text-neutral-900 hover:border-neutral-300',
        secondary:
          'bg-neutral-100 text-neutral-800 shadow-sm hover:bg-neutral-200/80',
        ghost:
          'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900',
        link: 'text-neutral-900 underline-offset-4 hover:underline p-0 h-auto font-medium',
        gradient:
          'bg-neutral-900 text-white shadow-sm hover:bg-neutral-800 border border-neutral-900',
        emerald:
          'bg-neutral-900 text-white shadow-sm hover:bg-neutral-800 border border-neutral-900',
        purple:
          'bg-neutral-900 text-white shadow-sm hover:bg-neutral-800 border border-neutral-900',
      },
      size: {
        default: 'h-8.5 px-3.5 py-1.5 gap-1.5',
        sm: 'h-7 rounded-md px-2.5 text-[11px] gap-1',
        lg: 'h-10 rounded-xl px-5 text-sm gap-2',
        icon: 'h-8.5 w-8.5 p-0',
        'icon-sm': 'h-7 w-7 p-0 rounded-md',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5 shrink-0" />}
        {children}
      </button>
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
