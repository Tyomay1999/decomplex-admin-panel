import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import enCommon from "../locales/en/common.json";
import ruCommon from "../locales/ru/common.json";
import hyCommon from "../locales/hy/common.json";

export const SUPPORTED_LANGS = ["en", "ru", "hy"] as const;
export type Lang = (typeof SUPPORTED_LANGS)[number];

export const DEFAULT_LANG: Lang = "en";

export const toSupportedLang = (value: string): Lang => {
  const normalized = value.toLowerCase();

  if (normalized.startsWith("ru")) return "ru";
  if (normalized.startsWith("hy")) return "hy";
  return "en";
};

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: DEFAULT_LANG,
    supportedLngs: [...SUPPORTED_LANGS],
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    resources: {
      en: { common: enCommon },
      ru: { common: ruCommon },
      hy: { common: hyCommon },
    },
    defaultNS: "common",
    ns: ["common"],
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },
  });

export default i18n;
