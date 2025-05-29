import { cn } from '@/lib/utils';

export function Heading1({
  children,
  className,
  ...props
}: { children: React.ReactNode } & React.ComponentProps<'h1'>) {
  return (
    <h1
      className={cn(
        'scroll-m-20 font-semibold text-4xl tracking-tight lg:text-5xl text-primary-950',
        className,
      )}
      {...props}
    >
      {children}
    </h1>
  );
}

export function Heading2({
  children,
  className,
  ...props
}: { children: React.ReactNode } & React.ComponentProps<'h2'>) {
  return (
    <h2
      className={cn(
        'scroll-m-20 font-semibold text-3xl tracking-tight first:mt-0 text-primary-950',
        className,
      )}
      {...props}
    >
      {children}
    </h2>
  );
}

export function Heading3({
  children,
  className,
  ...props
}: { children: React.ReactNode } & React.ComponentProps<'h3'>) {
  return (
    <h3
      className={cn(
        'scroll-m-20 font-semibold text-2xl tracking-tight text-primary-950',
        className,
      )}
      {...props}
    >
      {children}
    </h3>
  );
}

export function Heading4({
  children,
  className,
  ...props
}: { children: React.ReactNode } & React.ComponentProps<'h4'>) {
  return (
    <h4
      className={cn(
        'scroll-m-20 font-semibold text-xl tracking-tight text-primary-950',
        className,
      )}
      {...props}
    >
      {children}
    </h4>
  );
}

export function Text({
  children,
  className,
  ...props
}: { children: React.ReactNode } & React.ComponentProps<'p'>) {
  return (
    <p className={cn('leading-7 text-primary-950', className)} {...props}>
      {children}
    </p>
  );
}

export function SmallText({
  children,
  className,
  ...props
}: { children: React.ReactNode } & React.ComponentProps<'small'>) {
  return (
    <small
      className={cn(
        'text-sm font-medium leading-none text-primary-950',
        className,
      )}
      {...props}
    >
      {children}
    </small>
  );
}

export function LeadText({
  children,
  className,
  ...props
}: { children: React.ReactNode } & React.ComponentProps<'p'>) {
  return (
    <p
      className={cn('leading-7 text-primary-950 text-xl', className)}
      {...props}
    >
      {children}
    </p>
  );
}
