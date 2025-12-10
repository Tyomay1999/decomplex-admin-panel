import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import enCommon from "../locales/en/common.json";
import ruCommon from "../locales/ru/common.json";
import hyCommon from "../locales/hy/common.json";

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    supportedLngs: ["en", "ru", "hy"],
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    resources: {
      en: {
        common: enCommon,
      },
      ru: {
        common: ruCommon,
      },
      hy: {
        common: hyCommon,
      },
    },
    defaultNS: "common",
    ns: ["common"],
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },
  });

export default i18n;
