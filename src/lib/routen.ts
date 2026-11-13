export function slugAusId(id: string): string {
  return id.replace(":", "~");
}

export function idAusSlug(slug: string): string {
  try {
    return decodeURIComponent(slug).replace("~", ":");
  } catch {
    return "";
  }
}
