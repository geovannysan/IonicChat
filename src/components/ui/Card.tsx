import React from 'react';
import { IonCard, IonCardContent, IonCardHeader, IonCardTitle } from '@ionic/react';

const Card = React.forwardRef<
  HTMLIonCardElement,
  React.HTMLAttributes<HTMLIonCardElement>
>(({ className, ...props }, ref) => (
  <IonCard
    ref={ref}
    className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className || ''}`}
    {...props}
  />
));
Card.displayName = 'Card';

const CardHeader = React.forwardRef<
  HTMLIonCardHeaderElement,
  React.HTMLAttributes<HTMLIonCardHeaderElement>
>(({ className, ...props }, ref) => (
  <IonCardHeader
    ref={ref}
    className={`flex flex-col space-y-1.5 p-6 ${className || ''}`}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<
  HTMLIonCardTitleElement,
  React.HTMLAttributes<HTMLIonCardTitleElement>
>(({ className, ...props }, ref) => (
  <IonCardTitle
    ref={ref}
    className={`text-2xl font-semibold leading-none tracking-tight ${className || ''}`}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={`text-sm text-muted-foreground ${className || ''}`}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<
  HTMLIonCardContentElement,
  React.HTMLAttributes<HTMLIonCardContentElement>
>(({ className, ...props }, ref) => (
  <IonCardContent
    ref={ref}
    className={`p-6 pt-0 ${className || ''}`}
    {...props}
  />
));
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={`flex items-center p-6 pt-0 ${className || ''}`}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
