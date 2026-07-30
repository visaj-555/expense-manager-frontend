/**
 * Builds axios/query params and omits empty values.
 * Especially important for booleans: never send `isArchived=false`
 * as a query string, because NestJS enableImplicitConversion can
 * turn the string "false" into boolean true.
 */
export function cleanParams<T extends Record<string, unknown>>(params?: T): Partial<T> | undefined {
  if (!params) return undefined

  const cleaned: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue
    if (value === false) continue
    cleaned[key] = value
  }

  return cleaned as Partial<T>
}
