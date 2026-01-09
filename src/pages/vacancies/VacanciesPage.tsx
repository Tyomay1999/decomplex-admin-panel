import * as React from "react";
import {
    Button,
    Card,
    Descriptions,
    Empty,
    Flex,
    Grid,
    Input,
    Select,
    Space,
    Table,
    Tag,
    Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import type { RootState } from "@/store";
import { useGetVacanciesQuery } from "@/services/vacanciesApi";
import type { VacancyDto, VacancyStatus, JobType } from "@/services/vacanciesApi";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

type Option<T extends string> = { label: string; value: T };

const formatJobType = (t: (k: string, opts?: { defaultValue: string }) => string, v: JobType): string => {
    return t(`vacancies.jobType.${v}`, { defaultValue: v });
};

const formatStatus = (t: (k: string, opts?: { defaultValue: string }) => string, v: VacancyStatus): string => {
    return t(`vacancies.status.${v}`, { defaultValue: v });
};

export const VacanciesPage: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation("common");

    console.log(t)
    const screens = useBreakpoint();
    const isMobile = !screens.md;

    const [q, setQ] = React.useState<string>("");
    const [status, setStatus] = React.useState<VacancyStatus | undefined>(undefined);
    const [jobType, setJobType] = React.useState<JobType | undefined>(undefined);

    const userCompanyId = useSelector((s: RootState) => s.auth.user?.company?.id);
    const authStatus = useSelector((s: RootState) => s.auth.status);

    const [cursor, setCursor] = React.useState<string | null>(null);
    const [items, setItems] = React.useState<VacancyDto[]>([]);

    const shouldSkip = authStatus !== "authenticated" || !userCompanyId;

    const { data, isFetching, isError } = useGetVacanciesQuery(
        {
            companyId: userCompanyId,
            q: q.trim() ? q.trim() : undefined,
            status,
            jobType,
            limit: 20,
            cursor,
        },
        { skip: shouldSkip },
    );

    React.useEffect(() => {
        if (!data) return;
        if (cursor === null) setItems(data.vacancies);
        else setItems((prev) => [...prev, ...data.vacancies]);
    }, [data, cursor]);

    const statusOptions = React.useMemo<Option<VacancyStatus>[]>(
        () => [
            { label: t("vacancies.status.active", { defaultValue: "Active" }), value: "active" },
            { label: t("vacancies.status.archived", { defaultValue: "Archived" }), value: "archived" },
        ],
        [t],
    );

    const jobTypeOptions = React.useMemo<Option<JobType>[]>(
        () => [
            { label: t("vacancies.jobType.full_time", { defaultValue: "Full time" }), value: "full_time" },
            { label: t("vacancies.jobType.part_time", { defaultValue: "Part time" }), value: "part_time" },
            { label: t("vacancies.jobType.remote", { defaultValue: "Remote" }), value: "remote" },
            { label: t("vacancies.jobType.hybrid", { defaultValue: "Hybrid" }), value: "hybrid" },
        ],
        [t],
    );

    if (authStatus === "idle" || authStatus === "checking") {
        return <div style={{ padding: 8 }}>{t("auth.checking", { defaultValue: "Checking session…" })}</div>;
    }

    if (!userCompanyId) {
        return (
            <div style={{ padding: 8 }}>
                {t("vacancies.noCompany", { defaultValue: "Company is not attached to this user." })}
            </div>
        );
    }

    const onApply = (): void => {
        setCursor(null);
    };

    const onLoadMore = (): void => {
        if (data?.nextCursor) setCursor(data.nextCursor);
    };

    const columns: ColumnsType<VacancyDto> = [
        {
            title: t("vacancies.table.title", { defaultValue: "Title" }),
            dataIndex: "title",
            key: "title",
            render: (v: string) => <Text strong>{v}</Text>,
        },
        {
            title: t("vacancies.table.location", { defaultValue: "Location" }),
            dataIndex: "location",
            key: "location",
            responsive: ["lg"],
            render: (v: string | null | undefined) => v ?? "—",
        },
        {
            title: t("vacancies.table.status", { defaultValue: "Status" }),
            dataIndex: "status",
            key: "status",
            render: (v: VacancyStatus) => <Tag>{formatStatus(t, v)}</Tag>,
        },
        {
            title: t("vacancies.table.jobType", { defaultValue: "Job type" }),
            dataIndex: "jobType",
            key: "jobType",
            responsive: ["lg"],
            render: (v: JobType) => <Tag>{formatJobType(t, v)}</Tag>,
        },
        {
            title: t("vacancies.table.applications", { defaultValue: "Applications" }),
            key: "applicationsCount",
            align: "center",
            width: 140,
            render: (_, row) => row.applicationsCount ?? 0,
        },
        {
            title: t("vacancies.table.actions", { defaultValue: "Actions" }),
            key: "actions",
            width: 260,
            render: (_, row) => (
                <Space>
                    <Button onClick={() => navigate(`/vacancies/${row.id}`)}>
                        {t("common.view", { defaultValue: "View" })}
                    </Button>
                    <Button onClick={() => navigate(`/vacancies/${row.id}/applications`)}>
                        {t("vacancies.applications", { defaultValue: "Applications" })}
                    </Button>
                </Space>
            ),
        },
    ];

    const Filters = (
        <Card styles={{ body: { padding: isMobile ? 12 : 16 } }} style={{ marginBottom: 12 }}>
            <Flex vertical={isMobile} gap={12} align={isMobile ? "stretch" : "center"} wrap>
                <Input
                    placeholder={t("common.search", { defaultValue: "Search" })}
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    allowClear
                    style={{ width: isMobile ? "100%" : 260 }}
                />

                <Select<VacancyStatus>
                    allowClear
                    placeholder={t("vacancies.filters.status", { defaultValue: "Status" })}
                    value={status}
                    onChange={(v) => setStatus(v)}
                    options={statusOptions}
                    style={{ width: isMobile ? "100%" : 200 }}
                />

                <Select<JobType>
                    allowClear
                    placeholder={t("vacancies.filters.jobType", { defaultValue: "Job type" })}
                    value={jobType}
                    onChange={(v) => setJobType(v)}
                    options={jobTypeOptions}
                    style={{ width: isMobile ? "100%" : 220 }}
                />

                <Flex gap={10} vertical={isMobile}>
                    <Button type="primary" onClick={onApply} loading={isFetching} block={isMobile}>
                        {t("common.apply", { defaultValue: "Apply" })}
                    </Button>
                    <Button onClick={() => navigate("/vacancies/new")} block={isMobile}>
                        {t("vacancies.create", { defaultValue: "Create vacancy" })}
                    </Button>
                </Flex>
            </Flex>
        </Card>
    );

    const EmptyState = (
        <Card styles={{ body: { padding: isMobile ? 12 : 16 } }}>
            <Empty
                description={
                    isError
                        ? t("common.error", { defaultValue: "Something went wrong." })
                        : t("vacancies.empty", { defaultValue: "No vacancies found." })
                }
            />
        </Card>
    );

    const MobileList = (
        <Space direction="vertical" size={10} style={{ width: "100%" }}>
            {items.length === 0 ? (
                EmptyState
            ) : (
                items.map((v) => (
                    <Card
                        key={v.id}
                        styles={{ body: { padding: 12 } }}
                        title={<Text strong>{v.title}</Text>}
                        extra={<Tag>{formatStatus(t, v.status)}</Tag>}
                    >
                        <Descriptions size="small" column={1}>
                            <Descriptions.Item label={t("vacancies.table.location", { defaultValue: "Location" })}>
                                {v.location ?? "—"}
                            </Descriptions.Item>
                            <Descriptions.Item label={t("vacancies.table.jobType", { defaultValue: "Job type" })}>
                                <Tag>{formatJobType(t, v.jobType)}</Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label={t("vacancies.table.applications", { defaultValue: "Applications" })}>
                                {v.applicationsCount ?? 0}
                            </Descriptions.Item>
                        </Descriptions>

                        <Flex gap={10} style={{ marginTop: 10 }}>
                            <Button block onClick={() => navigate(`/vacancies/${v.id}`)}>
                                {t("common.view", { defaultValue: "View" })}
                            </Button>
                            <Button block onClick={() => navigate(`/vacancies/${v.id}/applications`)}>
                                {t("vacancies.applications", { defaultValue: "Applications" })}
                            </Button>
                        </Flex>
                    </Card>
                ))
            )}

            <Flex justify="flex-end" style={{ marginTop: 2 }}>
                <Button onClick={onLoadMore} disabled={!data?.nextCursor} loading={isFetching} block={isMobile}>
                    {t("common.loadMore", { defaultValue: "Load more" })}
                </Button>
            </Flex>
        </Space>
    );

    const DesktopTable = (
        <Card styles={{ body: { padding: 0 } }}>
            {items.length === 0 ? (
                <div style={{ padding: 16 }}>{EmptyState}</div>
            ) : (
                <Table
                    rowKey="id"
                    columns={columns}
                    dataSource={items}
                    loading={isFetching && items.length === 0}
                    pagination={false}
                />
            )}
        </Card>
    );

    return (
        <div>
            <div style={{ marginBottom: 12 }}>
                <Title level={4} style={{ margin: 0 }}>
                    {t("nav.vacancies", { defaultValue: "Vacancies" })}
                </Title>
            </div>

            {Filters}

            {isMobile ? MobileList : DesktopTable}

            {!isMobile ? (
                <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end" }}>
                    <Button onClick={onLoadMore} disabled={!data?.nextCursor} loading={isFetching}>
                        {t("common.loadMore", { defaultValue: "Load more" })}
                    </Button>
                </div>
            ) : null}
        </div>
    );
};