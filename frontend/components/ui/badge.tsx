import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-blue-600 text-white shadow hover:bg-blue-700',
        secondary: 'border-transparent bg-neutral-100 text-neutral-900 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-50',
        destructive: 'border-transparent bg-red-500 text-white shadow hover:bg-red-600',
        outline: 'text-neutral-950 dark:text-neutral-50 border-neutral-200 dark:border-neutral-800',
        success: 'border-transparent bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20',
        warning: 'border-transparent bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/20',
        info: 'border-transparent bg-sky-500/15 text-sky-700 dark:text-sky-400 border border-sky-500/20',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
