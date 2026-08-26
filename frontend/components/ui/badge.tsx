import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium transition-colors focus:outline-none',
  {
    variants: {
      variant: {
        default:
          'bg-neutral-100 text-neutral-800 border border-neutral-200',
        secondary:
          'bg-neutral-50 text-neutral-600 border border-neutral-200',
        destructive:
          'bg-rose-50 text-rose-700 border border-rose-200',
        outline:
          'text-neutral-700 border border-neutral-200 bg-transparent',
        success:
          'bg-neutral-100 text-neutral-800 border border-neutral-200',
        emerald:
          'bg-neutral-100 text-neutral-800 border border-neutral-200',
        warning:
          'bg-amber-50 text-amber-800 border border-amber-200',
        info:
          'bg-neutral-100 text-neutral-800 border border-neutral-200',
        purple:
          'bg-neutral-100 text-neutral-800 border border-neutral-200',
        indigo:
          'bg-neutral-100 text-neutral-800 border border-neutral-200',
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
            (variant === 'success' || variant === 'emerald') && 'bg-emerald-600',
            variant === 'warning' && 'bg-amber-500',
            variant === 'destructive' && 'bg-rose-500',
            (!variant || variant === 'default' || variant === 'secondary' || variant === 'outline' || variant === 'info' || variant === 'purple' || variant === 'indigo') && 'bg-neutral-600',
            pulse && 'animate-pulse',
          )}
        />
      )}
      {children}
    </div>
  );
}

export { Badge, badgeVariants };
