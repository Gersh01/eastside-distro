import type { HTMLInputTypeAttribute, ReactNode } from 'react';
import { cx } from '@/lib/cx';
import type { Option } from '@/lib/options';

// Uncontrolled inputs: values are read from FormData by Server Actions. After a failed submit
// the action echoes `values` back, and passing them as default values restores the form
// (React resets uncontrolled forms after an action completes).

type FieldProps = {
  name: string;
  label: string;
  error?: string[];
  hint?: string;
  required?: boolean;
  className?: string;
};

const controlClass = (invalid: boolean) =>
  cx(
    'w-full rounded-xl border bg-white px-3.5 py-2.5 text-base text-ink shadow-xs transition-colors',
    'placeholder:text-muted/70 focus:outline-none focus:ring-2 focus:ring-lime-strong',
    invalid ? 'border-danger' : 'border-line hover:border-ink/30 focus:border-ink',
  );

const ids = (name: string) => ({
  id: `field-${name}`,
  hintId: `field-${name}-hint`,
  errorId: `field-${name}-error`,
});

const describedBy = (name: string, hint?: string, error?: string[]) =>
  [hint ? ids(name).hintId : null, error?.length ? ids(name).errorId : null]
    .filter(Boolean)
    .join(' ') || undefined;

function Label({
  htmlFor,
  required,
  children,
}: {
  htmlFor: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="text-sm font-medium">
      {children}
      {required ? (
        <span aria-hidden className="text-muted">
          {' '}
          *
        </span>
      ) : null}
    </label>
  );
}

export function FieldError({ id, error }: { id: string; error?: string[] }) {
  if (!error?.length) return null;
  return (
    <p id={id} className="text-sm text-danger">
      {error[0]}
    </p>
  );
}

function Hint({ id, hint }: { id: string; hint?: string }) {
  return hint ? (
    <p id={id} className="text-xs text-muted">
      {hint}
    </p>
  ) : null;
}

export function TextField({
  name,
  label,
  error,
  hint,
  required,
  className,
  type = 'text',
  defaultValue,
  autoComplete,
  inputMode,
  maxLength,
}: FieldProps & {
  type?: HTMLInputTypeAttribute;
  defaultValue?: string;
  autoComplete?: string;
  inputMode?: 'text' | 'tel' | 'email' | 'numeric';
  maxLength?: number;
}) {
  const { id, hintId, errorId } = ids(name);
  return (
    <div className={cx('flex flex-col gap-1.5', className)}>
      <Label htmlFor={id} required={required}>
        {label}
      </Label>
      <input
        id={id}
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        autoComplete={autoComplete}
        inputMode={inputMode}
        maxLength={maxLength}
        aria-invalid={error?.length ? true : undefined}
        aria-describedby={describedBy(name, hint, error)}
        className={controlClass(Boolean(error?.length))}
      />
      <Hint id={hintId} hint={hint} />
      <FieldError id={errorId} error={error} />
    </div>
  );
}

export function TextArea({
  name,
  label,
  error,
  hint,
  required,
  className,
  defaultValue,
  rows = 4,
  maxLength,
}: FieldProps & { defaultValue?: string; rows?: number; maxLength?: number }) {
  const { id, hintId, errorId } = ids(name);
  return (
    <div className={cx('flex flex-col gap-1.5', className)}>
      <Label htmlFor={id} required={required}>
        {label}
      </Label>
      <textarea
        id={id}
        name={name}
        rows={rows}
        defaultValue={defaultValue}
        required={required}
        maxLength={maxLength}
        aria-invalid={error?.length ? true : undefined}
        aria-describedby={describedBy(name, hint, error)}
        className={controlClass(Boolean(error?.length))}
      />
      <Hint id={hintId} hint={hint} />
      <FieldError id={errorId} error={error} />
    </div>
  );
}

export function SelectField({
  name,
  label,
  error,
  hint,
  required,
  className,
  options,
  defaultValue,
  placeholder = 'Select…',
  autoComplete,
}: FieldProps & {
  options: readonly Option[];
  defaultValue?: string;
  placeholder?: string;
  autoComplete?: string;
}) {
  const { id, hintId, errorId } = ids(name);
  return (
    <div className={cx('flex flex-col gap-1.5', className)}>
      <Label htmlFor={id} required={required}>
        {label}
      </Label>
      <select
        // React applies a select's defaultValue only on mount; remount when it changes so the
        // automatic form reset after a failed submit restores the submitted choice.
        key={defaultValue ?? ''}
        id={id}
        name={name}
        defaultValue={defaultValue ?? ''}
        required={required}
        autoComplete={autoComplete}
        aria-invalid={error?.length ? true : undefined}
        aria-describedby={describedBy(name, hint, error)}
        className={controlClass(Boolean(error?.length))}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <Hint id={hintId} hint={hint} />
      <FieldError id={errorId} error={error} />
    </div>
  );
}

/** Checkbox ("check all that apply") or radio group, laid out like the paper form. */
export function ChoiceGroup({
  type,
  name,
  legend,
  options,
  defaultValue = [],
  error,
  required,
  hint,
  children,
}: {
  type: 'checkbox' | 'radio';
  name: string;
  legend: string;
  options: readonly Option[];
  defaultValue?: string | string[];
  error?: string[];
  required?: boolean;
  hint?: string;
  /** Extra content rendered under the options, e.g. an "Other" text field. */
  children?: ReactNode;
}) {
  const { hintId, errorId } = ids(name);
  const selected = Array.isArray(defaultValue) ? defaultValue : [defaultValue];
  return (
    <fieldset
      aria-describedby={describedBy(name, hint, error)}
      aria-invalid={error?.length ? true : undefined}
      className="flex flex-col gap-3"
    >
      <legend className="mb-1 text-sm font-medium">
        {legend}
        {required ? (
          <span aria-hidden className="text-muted">
            {' '}
            *
          </span>
        ) : null}
      </legend>
      <Hint id={hintId} hint={hint} />
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((option) => (
          <label
            key={option.value}
            className="flex cursor-pointer items-center gap-3 rounded-xl border border-line px-3.5 py-2.5 text-sm transition-colors hover:border-ink/30 has-checked:border-ink has-checked:bg-sand"
          >
            <input
              type={type}
              name={name}
              value={option.value}
              defaultChecked={selected.includes(option.value)}
              className="size-4 accent-ink"
            />
            {option.label}
          </label>
        ))}
      </div>
      {children}
      <FieldError id={errorId} error={error} />
    </fieldset>
  );
}

export function Checkbox({
  name,
  label,
  error,
  required,
  defaultChecked,
}: {
  name: string;
  label: ReactNode;
  error?: string[];
  required?: boolean;
  defaultChecked?: boolean;
}) {
  const { id, errorId } = ids(name);
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="flex cursor-pointer items-start gap-3 text-sm">
        <input
          id={id}
          name={name}
          type="checkbox"
          required={required}
          defaultChecked={defaultChecked}
          aria-invalid={error?.length ? true : undefined}
          aria-describedby={error?.length ? errorId : undefined}
          className="mt-0.5 size-4 shrink-0 accent-ink"
        />
        <span>{label}</span>
      </label>
      <FieldError id={errorId} error={error} />
    </div>
  );
}

/** Off-screen trap field for bots; see HONEYPOT_FIELD in src/lib/form.ts. */
export function Honeypot({ name }: { name: string }) {
  return (
    <div aria-hidden className="absolute -left-[10000px] h-px w-px overflow-hidden">
      <label htmlFor={`field-${name}`}>Leave this field empty</label>
      <input id={`field-${name}`} name={name} type="text" tabIndex={-1} autoComplete="off" />
    </div>
  );
}
