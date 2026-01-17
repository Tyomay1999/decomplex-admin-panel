import { useMemo } from "react";
import { Grid } from "antd";
import type { LayoutMode } from "../types";

const { useBreakpoint } = Grid;

export const useLayoutMode = (): LayoutMode => {
  const screens = useBreakpoint();

  return useMemo(
    () => ({
      isMobile: !screens.md,
      isTablet: Boolean(screens.md && !screens.lg),
    }),
    [screens.md, screens.lg],
  );
};
