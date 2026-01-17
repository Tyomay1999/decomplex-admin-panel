import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import type { RouteKey } from "../types";

const routeKeyByPath = (pathname: string): RouteKey => {
  const clean = pathname.split("?")[0]?.split("#")[0] ?? "/";
  if (clean === "/" || clean === "") return "dashboard";

  const first = clean.startsWith("/") ? clean.slice(1) : clean;
  const seg = first.split("/")[0] ?? "dashboard";

  if (seg === "vacancies" || seg === "users" || seg === "events" || seg === "profile") {
    return seg;
  }

  return "dashboard";
};

export const useRouteKey = (): RouteKey => {
  const location = useLocation();

  return useMemo(() => routeKeyByPath(location.pathname), [location.pathname]);
};
