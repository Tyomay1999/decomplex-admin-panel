import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { VacanciesNavState } from "../types";

export const useVacancyBack = (): (() => void) => {
  const navigate = useNavigate();
  const location = useLocation();

  return useCallback((): void => {
    const state = location.state as VacanciesNavState | null;
    const from = state?.from;

    if (typeof from === "string" && from.trim().length > 0) {
      navigate(from, { replace: true });
      return;
    }

    navigate(-1);
  }, [location.state, navigate]);
};
