import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-xs font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 disabled:pointer-events-none disabled:opacity-50 cursor-pointer active:scale-[0.98]',
  {
    variants: {
      variant: {
        default:
          'bg-blue-600 text-white shadow-sm shadow-blue-500/25 hover:bg-blue-500 hover:shadow-md hover:shadow-blue-500/30 border border-blue-500/30',
        destructive:
          'bg-rose-600 text-white shadow-sm shadow-rose-500/25 hover:bg-rose-500 hover:shadow-md hover:shadow-rose-500/30 border border-rose-500/30',
        outline:
          'border border-neutral-200/80 bg-white/80 text-neutral-800 shadow-sm hover:bg-neutral-100/80 hover:text-neutral-900 hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900/80 dark:text-neutral-200 dark:hover:bg-neutral-800 dark:hover:text-white dark:hover:border-neutral-700',
        secondary:
          'bg-neutral-100 text-neutral-800 shadow-sm hover:bg-neutral-200/80 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700/80',
        ghost:
          'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800/80 dark:hover:text-neutral-100',
        link: 'text-blue-600 dark:text-blue-400 underline-offset-4 hover:underline p-0 h-auto',
        gradient:
          'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm shadow-indigo-500/25 hover:from-blue-500 hover:to-indigo-500 hover:shadow-md hover:shadow-indigo-500/30 border border-indigo-400/20',
        emerald:
          'bg-emerald-600 text-white shadow-sm shadow-emerald-500/25 hover:bg-emerald-500 hover:shadow-md hover:shadow-emerald-500/30 border border-emerald-500/30',
        purple:
          'bg-purple-600 text-white shadow-sm shadow-purple-500/25 hover:bg-purple-500 hover:shadow-md hover:shadow-purple-500/30 border border-purple-500/30',
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
