export function fill<T>(value: T, length: number): T[] {
  return Array.from({ length }, () => value);
}

export function fillString(
  value: string,
  length: number,
  seperator: string = ""
) {
  return fill(value, length).join(seperator);
}
