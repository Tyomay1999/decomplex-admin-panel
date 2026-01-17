import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { SidebarTitles } from "../types";

type Args = {
  collapsed: boolean;
  isMobile: boolean;
};

export const useMainLayoutTitles = ({ collapsed, isMobile }: Args): SidebarTitles => {
  const { t } = useTranslation("common");

  return useMemo(() => {
    const sidebarTitle = collapsed
      ? t("app.brandShort", { defaultValue: "D" })
      : t("app.brandFull", { defaultValue: "Decomplex Admin" });

    const headerTitle = isMobile
      ? t("app.brandFull", { defaultValue: "Decomplex" })
      : t("app.title", { defaultValue: "Decomplex Admin Panel" });

    return { sidebarTitle, headerTitle };
  }, [t, collapsed, isMobile]);
};
