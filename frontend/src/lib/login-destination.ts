export function loginDestination(value: unknown): string {
  return typeof value === "string" && /^\/(checkout|dashboard|profile|orders)([?#][^\\\\]*)?$/.test(value) ? value : "/";
}

