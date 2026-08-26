import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium transition-colors focus:outline-none',
  {
    variants: {
      variant: {
        default:
          'bg-blue-600/10 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300 border border-blue-500/20',
        secondary:
          'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700',
        destructive:
          'bg-rose-500/10 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300 border border-rose-500/20',
        outline:
          'text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-800 bg-transparent',
        success:
          'bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 border border-emerald-500/20',
        emerald:
          'bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 border border-emerald-500/20',
        warning:
          'bg-amber-500/10 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300 border border-amber-500/20',
        info:
          'bg-sky-500/10 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300 border border-sky-500/20',
        purple:
          'bg-purple-500/10 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300 border border-purple-500/20',
        indigo:
          'bg-indigo-500/10 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300 border border-indigo-500/20',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
  pulse?: boolean;
}

function Badge({ className, variant, dot, pulse, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && (
        <span
          className={cn(
            'h-1.5 w-1.5 rounded-full shrink-0',
            variant === 'success' && 'bg-emerald-500',
            variant === 'warning' && 'bg-amber-500',
            variant === 'destructive' && 'bg-rose-500',
            variant === 'purple' && 'bg-purple-500',
            variant === 'info' && 'bg-sky-500',
            (!variant || variant === 'default') && 'bg-blue-500',
            variant === 'secondary' && 'bg-neutral-400',
            pulse && 'animate-pulse',
          )}
        />
      )}
      {children}
    </div>
  );
}

export { Badge, badgeVariants };
