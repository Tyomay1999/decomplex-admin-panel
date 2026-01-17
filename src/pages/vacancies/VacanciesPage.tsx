import { FC, useCallback, useEffect, useMemo, useRef } from "react";
import { Button, Grid, Input, Space, Typography } from "antd";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import type { JobType, VacancyStatus } from "@/services/vacanciesApi";
import type { VacanciesNavState } from "./types";
import { useVacanciesList } from "./hooks";
import { VacancyFilters } from "./components/VacancyFilters";
import { VacancyTable } from "./components/VacancyTable";
import { VacancyMobileList } from "./components/VacancyMobileList";

const { Title } = Typography;
const { useBreakpoint } = Grid;

type Option<T extends string> = { label: string; value: T };

const isVacancyStatus = (v: string): v is VacancyStatus => v === "active" || v === "archived";

const isJobType = (v: string): v is JobType =>
  v === "full_time" || v === "part_time" || v === "remote" || v === "hybrid";

export const VacanciesPage: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation("common");

  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const [searchParams, setSearchParams] = useSearchParams();

  const h = useVacanciesList();

  const statusOptions = useMemo<Option<VacancyStatus>[]>(
    () => [
      { label: t("vacancies.status.active", { defaultValue: "Active" }), value: "active" },
      { label: t("vacancies.status.archived", { defaultValue: "Archived" }), value: "archived" },
    ],
    [t],
  );

  const jobTypeOptions = useMemo<Option<JobType>[]>(
    () => [
      {
        label: t("vacancies.jobType.full_time", { defaultValue: "Full time" }),
        value: "full_time",
      },
      {
        label: t("vacancies.jobType.part_time", { defaultValue: "Part time" }),
        value: "part_time",
      },
      { label: t("vacancies.jobType.remote", { defaultValue: "Remote" }), value: "remote" },
      { label: t("vacancies.jobType.hybrid", { defaultValue: "Hybrid" }), value: "hybrid" },
    ],
    [t],
  );

  const from = useMemo(
    (): string => `${location.pathname}${location.search}`,
    [location.pathname, location.search],
  );

  const goView = useCallback(
    (id: string): void => {
      const state: VacanciesNavState = { from };
      navigate(`/vacancies/${id}`, { state });
    },
    [navigate, from],
  );

  const goApplications = useCallback(
    (id: string): void => {
      const state: VacanciesNavState = { from };
      navigate(`/vacancies/${id}/applications`, { state });
    },
    [navigate, from],
  );

  const didInitFromUrl = useRef(false);

  useEffect(() => {
    if (didInitFromUrl.current) return;
    didInitFromUrl.current = true;

    const q = searchParams.get("q") ?? "";
    const statusRaw = searchParams.get("status");
    const jobTypeRaw = searchParams.get("jobType");

    const nextStatus =
      typeof statusRaw === "string" && isVacancyStatus(statusRaw) ? statusRaw : undefined;
    const nextJobType =
      typeof jobTypeRaw === "string" && isJobType(jobTypeRaw) ? jobTypeRaw : undefined;

    h.setQ(q);
    h.setStatus(nextStatus);
    h.setJobType(nextJobType);
  }, [searchParams, h]);

  useEffect(() => {
    const p = new URLSearchParams(searchParams);

    const q = h.q.trim();
    if (q.length > 0) p.set("q", q);
    else p.delete("q");

    if (h.status) p.set("status", h.status);
    else p.delete("status");

    if (h.jobType) p.set("jobType", h.jobType);
    else p.delete("jobType");

    setSearchParams(p, { replace: true });
  }, [h.q, h.status, h.jobType, setSearchParams]);

  if (h.authStatus === "idle" || h.authStatus === "checking") {
    return (
      <div style={{ padding: 8 }}>{t("auth.checking", { defaultValue: "Checking session…" })}</div>
    );
  }

  if (!h.userCompanyId) {
    return (
      <div style={{ padding: 8 }}>
        {t("vacancies.noCompany", { defaultValue: "Company is not attached to this user." })}
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          marginBottom: 12,
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          alignItems: "center",
        }}
      >
        <Title level={4} style={{ margin: 0 }}>
          {t("nav.vacancies", { defaultValue: "Vacancies" })}
        </Title>

        <Button type="primary" onClick={() => navigate("/vacancies/new")}>
          {t("vacancies.create", { defaultValue: "Create vacancy" })}
        </Button>
      </div>

      {isMobile ? (
        <VacancyFilters
          isMobile
          q={h.q}
          status={h.status}
          jobType={h.jobType}
          statusOptions={statusOptions}
          jobTypeOptions={jobTypeOptions}
          onChangeQ={h.setQ}
          onChangeStatus={h.setStatus}
          onChangeJobType={h.setJobType}
          onApply={h.applyFilters}
        />
      ) : (
        <Space style={{ width: "100%", marginBottom: 12 }} align="center">
          <Input
            spellCheck={false}
            placeholder={t("common.search", { defaultValue: "Search" })}
            value={h.q}
            onChange={(e) => h.setQ(e.target.value)}
            allowClear
            style={{ maxWidth: 420 }}
          />
        </Space>
      )}

      {isMobile ? (
        <VacancyMobileList
          items={h.items}
          isFetching={h.isFetching}
          isError={h.isError}
          hasMore={h.hasMore}
          onView={goView}
          onApplications={goApplications}
          onLoadMore={h.loadMore}
        />
      ) : (
        <>
          <VacancyTable
            items={h.items}
            isFetching={h.isFetching}
            onView={goView}
            onApplications={goApplications}
            statusOptions={statusOptions}
            jobTypeOptions={jobTypeOptions}
            status={h.status}
            jobType={h.jobType}
            onChangeStatus={(v) => {
              h.setStatus(v);
              h.applyFilters();
            }}
            onChangeJobType={(v) => {
              h.setJobType(v);
              h.applyFilters();
            }}
          />

          <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end" }}>
            <Button onClick={h.loadMore} disabled={!h.hasMore} loading={h.isFetching}>
              {t("common.loadMore", { defaultValue: "Load more" })}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
