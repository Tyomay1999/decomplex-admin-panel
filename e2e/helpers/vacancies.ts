type UnknownObj = Record<string, unknown>;

function isObj(v: unknown): v is UnknownObj {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function readString(v: unknown): string | null {
  return typeof v === "string" && v.trim().length > 0 ? v.trim() : null;
}

export function readCreatedVacancyId(raw: unknown): string {
  if (!isObj(raw)) {
    throw new Error(`Create vacancy response is not an object: ${String(raw)}`);
  }

  const data = raw["data"];

  if (!isObj(data)) {
    throw new Error(`Create vacancy response has no data object: ${JSON.stringify(raw)}`);
  }

  const directId = readString(data["id"]);
  if (directId) return directId;

  const vacancy = data["vacancy"];
  if (isObj(vacancy)) {
    const wrappedId = readString(vacancy["id"]);
    if (wrappedId) return wrappedId;
  }

  throw new Error(`Create vacancy response has no id: ${JSON.stringify(raw)}`);
}
