import type { ReactNode } from 'react';

/** A numbered form section, mirroring the numbered blocks on the paper onboarding sheet. */
export function FormSection({
  number,
  title,
  description,
  children,
}: {
  number: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="grid gap-6 border-t border-line pt-8 md:grid-cols-[14rem_1fr] md:gap-10">
      <div>
        <p className="label-mono">{number}</p>
        <h2 className="mt-1 text-lg font-semibold">{title}</h2>
        {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
      </div>
      <div className="flex flex-col gap-5">{children}</div>
    </section>
  );
}
