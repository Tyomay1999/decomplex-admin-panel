import { describe, it, expect } from "vitest";

import en from "@/locales/en/common.json";
import ru from "@/locales/ru/common.json";
import hy from "@/locales/hy/common.json";

type JsonValue = string | number | boolean | JsonObject | JsonValue[];
type JsonObject = { [key: string]: JsonValue };

const locales: Record<string, JsonObject> = { en, ru, hy };

const collectLeafStrings = (obj: JsonObject): string[] => {
  const result: string[] = [];

  const walk = (value: JsonValue): void => {
    if (typeof value === "string") {
      result.push(value);
      return;
    }

    if (Array.isArray(value)) {
      value.forEach(walk);
      return;
    }

    if (typeof value === "object" && value !== null) {
      Object.values(value).forEach(walk);
    }
  };

  walk(obj);
  return result;
};

const collectKeys = (obj: JsonObject): string[] => {
  const keys: string[] = [];

  const walk = (value: JsonValue, path: string): void => {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
      keys.push(path);
      return;
    }

    for (const [k, v] of Object.entries(value)) {
      walk(v, path ? `${path}.${k}` : k);
    }
  };

  walk(obj, "");
  return keys.sort();
};

describe("i18n common.json parity", () => {
  it("all locales have identical key structure", () => {
    const [base, ...rest] = Object.values(locales);
    const baseKeys = collectKeys(base);

    for (const locale of rest) {
      expect(collectKeys(locale)).toEqual(baseKeys);
    }
  });

  it("all leaf string values are non-empty", () => {
    for (const locale of Object.values(locales)) {
      const values = collectLeafStrings(locale);
      for (const value of values) {
        expect(value.trim().length).toBeGreaterThan(0);
      }
    }
  });
});
