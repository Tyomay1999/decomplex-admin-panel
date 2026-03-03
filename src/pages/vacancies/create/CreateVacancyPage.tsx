import { FC, useMemo, useCallback } from "react";
import { Button, Card, Form, Grid, Input, Select, Space, Typography, Row, Col } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCreateVacancyMutation } from "@/services/vacanciesApi";
import type { JobType, VacancyDto } from "@/services/vacanciesApi";
import type { VacanciesNavState } from "../types";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

type Option<T extends string> = { label: string; value: T };

const baseJobTypeOptions: Option<JobType>[] = [
  { label: "Full time", value: "full_time" },
  { label: "Part time", value: "part_time" },
  { label: "Remote", value: "remote" },
  { label: "Hybrid", value: "hybrid" },
];

type FormValues = {
  title: string;
  description: string;
  location?: string;
  jobType: JobType;
};

type CreateVacancyPayload = {
  title: string;
  description: string;
  location?: string;
  jobType: JobType;
};

const trimOrUndef = (v: string | undefined): string | undefined => {
  if (typeof v !== "string") return undefined;
  const s = v.trim();
  return s.length > 0 ? s : undefined;
};

const getBackTo = (state: unknown): string => {
  const s = state as VacanciesNavState | null;
  const from = typeof s?.from === "string" ? s.from.trim() : "";
  return from.length > 0 ? from : "/vacancies";
};

export const CreateVacancyPage: FC = () => {
  const [form] = Form.useForm<FormValues>();

  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation("common");

  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const isLarge = Boolean(screens.lg);

  const backTo = useMemo(() => getBackTo(location.state), [location.state]);

  const [createVacancy, { isLoading }] = useCreateVacancyMutation();

  const jobTypeOptions = useMemo(
    () =>
      baseJobTypeOptions.map((o) => ({
        value: o.value,
        label: t(`vacancies.jobType.${o.value}`, { defaultValue: o.label }),
      })),
    [t, i18n.language],
  );

  const handleBack = useCallback((): void => {
    navigate(backTo);
  }, [navigate, backTo]);

  const onFinish = useCallback(
    async (values: FormValues): Promise<void> => {
      try {
        const payload: CreateVacancyPayload = {
          title: values.title.trim(),
          description: values.description.trim(),
          location: trimOrUndef(values.location),
          jobType: values.jobType,
        };

        const vacancy: VacancyDto = await createVacancy(payload).unwrap();

        const id = typeof vacancy.id === "string" ? vacancy.id.trim() : "";
        if (id.length === 0) return;

        navigate(`/vacancies/${id}`, {
          state: { from: backTo } as VacanciesNavState,
        });
      } catch {
        return;
      }
    },
    [createVacancy, navigate, backTo],
  );

  return (
    <div className="createVacancyPage" data-testid="vacancy-create-page">
      <Space orientation="vertical" size={14} style={{ width: "100%" }}>
        <div className="createVacancyHeader">
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
              {t("vacancies.create", { defaultValue: "Create vacancy" })}
            </Title>
            <Button onClick={handleBack}>{t("common.back", { defaultValue: "Back" })}</Button>
          </div>

          {!isMobile ? (
            <Text type="secondary">
              {t("vacancies.createHint", {
                defaultValue: "Fill in the details and publish the vacancy.",
              })}
            </Text>
          ) : null}

          <div className="createVacancyHeaderRight"></div>
        </div>

        <Card className="createVacancyCard" styles={{ body: { padding: isMobile ? 14 : 18 } }}>
          <Form<FormValues>
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{ jobType: "full_time" as JobType }}
            requiredMark
            data-testid="vacancy-create-form"
          >
            <Row gutter={isLarge ? 20 : 14}>
              <Col xs={24} lg={10}>
                <Space orientation="vertical" size={12} style={{ width: "100%" }}>
                  <Form.Item
                    name="title"
                    label={t("vacancies.fields.title", { defaultValue: "Title" })}
                    rules={[
                      {
                        required: true,
                        message: t("vacancies.validation.title", {
                          defaultValue: "Title is required",
                        }),
                      },
                    ]}
                  >
                    <Input
                      size="large"
                      placeholder={t("vacancies.placeholders.title", {
                        defaultValue: "e.g. Senior Frontend Engineer",
                      })}
                      data-testid="vacancy-title"
                    />
                  </Form.Item>

                  <Form.Item
                    name="location"
                    label={t("vacancies.fields.location", { defaultValue: "Location" })}
                  >
                    <Input
                      size="large"
                      placeholder={t("vacancies.placeholders.location", {
                        defaultValue: "e.g. Yerevan",
                      })}
                      data-testid="vacancy-location"
                    />
                  </Form.Item>

                  <Form.Item
                    name="jobType"
                    label={t("vacancies.fields.jobType", { defaultValue: "Job type" })}
                    rules={[
                      {
                        required: true,
                        message: t("vacancies.validation.jobType", {
                          defaultValue: "Job type is required",
                        }),
                      },
                    ]}
                  >
                    <Select<JobType>
                      size="large"
                      options={jobTypeOptions}
                      placeholder={t("vacancies.placeholders.jobType", {
                        defaultValue: "Select job type",
                      })}
                    />
                  </Form.Item>
                </Space>
              </Col>

              <Col xs={24} lg={14}>
                <Form.Item
                  name="description"
                  label={t("vacancies.fields.description", { defaultValue: "Description" })}
                  rules={[
                    {
                      required: true,
                      message: t("vacancies.validation.description", {
                        defaultValue: "Description is required",
                      }),
                    },
                  ]}
                >
                  <Input.TextArea
                    placeholder={t("vacancies.placeholders.description", {
                      defaultValue: "Responsibilities, requirements, benefits, and hiring process.",
                    })}
                    autoSize={{ minRows: isLarge ? 14 : 8, maxRows: isLarge ? 18 : 12 }}
                    data-testid="vacancy-description"
                  />
                </Form.Item>
              </Col>
            </Row>

            <div className="createVacancyFooter">
              <Button
                type="primary"
                htmlType="submit"
                loading={isLoading}
                block={isMobile}
                size="large"
                data-testid="vacancy-create-submit"
              >
                {t("common.create", { defaultValue: "Create" })}
              </Button>
            </div>
          </Form>
        </Card>
      </Space>
    </div>
  );
};
