import React from 'react';
import { type VariantProps } from 'class-variance-authority';
import { Slot } from '@radix-ui/react-slot';
// only-export-components: badgeVariants se importa del archivo .ts separado
// para no mezclar exports de componentes y constantes en el mismo módulo (Fast Refresh)
import { badgeVariants } from './badge-variants';

export { badgeVariants } from './badge-variants';

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'span';

  return (
    <Comp
      data-slot="badge"
      className={badgeVariants({ variant, className })}
      {...props}
    />
  );
}

export { Badge };
