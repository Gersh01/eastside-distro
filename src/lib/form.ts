/** Raw submitted values, echoed back on error so the form can re-populate itself. */
export type FormValues = Record<string, string | string[]>;
export type FieldErrors = Record<string, string[] | undefined>;

/** Return type of every form Server Action (used with React's useActionState). */
export type FormState =
  | { status: 'idle' }
  | { status: 'success'; message: string }
  | { status: 'error'; message: string; fieldErrors: FieldErrors; values: FormValues };

export const IDLE_FORM_STATE: FormState = { status: 'idle' };

/** Hidden field that humans never fill in and many bots do. */
export const HONEYPOT_FIELD = 'website';

/** FormData -> plain object. Fields in `arrayFields` (checkbox groups) always become arrays. */
export function formDataToValues(
  formData: FormData,
  arrayFields: readonly string[] = [],
): FormValues {
  const values: FormValues = {};
  for (const field of arrayFields) values[field] = [];
  for (const [key, value] of formData.entries()) {
    if (key.startsWith('$ACTION') || typeof value !== 'string') continue;
    const current = values[key];
    if (Array.isArray(current)) current.push(value);
    else values[key] = value;
  }
  return values;
}
