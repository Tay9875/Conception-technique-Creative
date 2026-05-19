import { ZodError } from 'zod';

export const zodToFieldErrors = (err: ZodError) => {
  const fieldErrors: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path[0] ? String(issue.path[0]) : 'form';
    if (!fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return fieldErrors;
};
