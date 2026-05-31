import React from 'react';
import { IonBadge } from '@ionic/react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from '@radix-ui/react-slot';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        // Usa las variables de color de Ionic
        default: 'border-transparent bg-[var(--ion-color-primary)] text-[var(--ion-color-primary-contrast)] hover:opacity-80',
        secondary: 'border-transparent bg-[var(--ion-color-primary)] text-[var(--ion-color-primary-contrast)] hover:opacity-80',
        tertiary: 'border-transparent bg-[var(--ion-color-tertiary)] text-[var(--ion-color-tertiary-contrast)] hover:opacity-80',
        success: 'border-transparent bg-[var(--ion-color-success)] text-[var(--ion-color-success-contrast)] hover:opacity-80',
        warning: 'border-transparent bg-[var(--ion-color-warning)] text-[var(--ion-color-warning-contrast)] hover:opacity-80',
        destructive: 'border-transparent bg-[var(--ion-color-danger)] text-[var(--ion-color-danger-contrast)] hover:opacity-80',
        
        // Variantes de utilidad comunes en Ionic
        light: 'border-transparent bg-[var(--ion-color-light)] text-[var(--ion-color-light-contrast)]',
        medium: 'border-transparent bg-[var(--ion-color-medium)] text-[var(--ion-color-medium-contrast)]',
        dark: 'border-transparent bg-[var(--ion-color-dark)] text-[var(--ion-color-dark-contrast)]',
        
        outline: 'border-[var(--ion-color-medium)] text-[var(--ion-color-step-700)] bg-transparent',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);




function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={badgeVariants({ variant, className })}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
