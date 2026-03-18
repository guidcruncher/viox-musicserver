export function rfcToIso8601(input?: string): string {
  if (!input) {
    return ""
  }

  // Let JavaScript do the heavy lifting — it fully supports RFC 5322/2822
  const date = new Date(input)

  if (isNaN(date.getTime())) {
    return ""
  }

  return date.toISOString()
}
