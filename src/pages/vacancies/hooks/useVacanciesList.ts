import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { useGetVacanciesQuery } from "@/services/vacanciesApi";
import type { JobType, VacancyDto, VacancyStatus } from "@/services/vacanciesApi";
import { useDebouncedValue } from "./useDebouncedValue";

type AuthStatus = "idle" | "checking" | "authenticated" | "anonymous";

const normalizeQuery = (value: string): string | undefined => {
  const v = value.trim();
  return v.length > 0 ? v : undefined;
};

const normalizeCursor = (value: string | null): string | undefined => {
  if (typeof value !== "string") return undefined;
  const v = value.trim();
  return v.length > 0 ? v : undefined;
};

export const useVacanciesList = () => {
  const authStatus = useSelector((s: RootState) => s.auth.status as AuthStatus);
  const userCompanyId = useSelector((s: RootState) => s.auth.user?.company?.id);

  const [q, setQ] = useState<string>("");
  const qDebounced = useDebouncedValue(q, 400);

  const [status, setStatus] = useState<VacancyStatus | undefined>(undefined);
  const [jobType, setJobType] = useState<JobType | undefined>(undefined);

  const [cursor, setCursor] = useState<string | null>(null);
  const [items, setItems] = useState<VacancyDto[]>([]);

  const shouldSkip = authStatus !== "authenticated" || !userCompanyId;

  const queryArgs = useMemo(
    () => ({
      companyId: userCompanyId ?? "",
      q: normalizeQuery(qDebounced),
      status,
      jobType,
      limit: 20,
      cursor: normalizeCursor(cursor),
    }),
    [userCompanyId, qDebounced, status, jobType, cursor],
  );

  const { data, isFetching, isError } = useGetVacanciesQuery(queryArgs, {
    skip: shouldSkip,
    refetchOnMountOrArgChange: true,
  });

  useEffect(() => {
    if (!data) return;

    if (cursor === null) {
      setItems(data.vacancies);
      return;
    }

    setItems((prev) => [...prev, ...data.vacancies]);
  }, [data, cursor]);

  const didMount = useRef(false);
  useEffect(() => {
    if (shouldSkip) return;

    if (!didMount.current) {
      didMount.current = true;
      return;
    }

    setCursor(null);
  }, [qDebounced, status, jobType, shouldSkip]);

  const applyFilters = useCallback((): void => {
    setCursor(null);
  }, []);

  const loadMore = useCallback((): void => {
    if (isFetching) return;

    const next = data?.nextCursor ?? null;
    if (typeof next === "string" && next.trim().length > 0) {
      setCursor(next);
    }
  }, [data?.nextCursor, isFetching]);

  return {
    authStatus,
    userCompanyId,

    q,
    status,
    jobType,

    setQ,
    setStatus,
    setJobType,

    items,
    isFetching,
    isError,
    hasMore: Boolean(data?.nextCursor),

    applyFilters,
    loadMore,
  };
};
