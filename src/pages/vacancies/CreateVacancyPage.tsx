import * as React from "react";
import { Button, Card, Form, Grid, Input, Select, Typography, message } from "antd";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCreateVacancyMutation } from "@/services/vacanciesApi";
import type { JobType, VacancyDto } from "@/services/vacanciesApi";

const { Title } = Typography;
const { useBreakpoint } = Grid;

type Option<T extends string> = { label: string; value: T };

const jobTypeOptions: Option<JobType>[] = [
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

export const CreateVacancyPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation("common");
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const [createVacancy, { isLoading }] = useCreateVacancyMutation();

  const onFinish = async (values: FormValues): Promise<void> => {
    try {
      const vacancy = (await createVacancy({
        title: values.title.trim(),
        description: values.description.trim(),
        location: values.location?.trim() ? values.location.trim() : undefined,
        jobType: values.jobType,
      }).unwrap()) as VacancyDto;

      message.success(t("vacancies.createSuccess", { defaultValue: "Vacancy created" }));
      navigate(`/vacancies/${vacancy.id}`);
    } catch {
      message.error(t("vacancies.createFailed", { defaultValue: "Failed to create vacancy" }));
    }
  };

  return (
      <div style={{ maxWidth: 820 }}>
        <Title level={4} style={{ marginTop: 0 }}>
          {t("vacancies.create", { defaultValue: "Create vacancy" })}
        </Title>

        <Card styles={{ body: { padding: isMobile ? 12 : 16 } }}>
          <Form<FormValues> layout="vertical" onFinish={onFinish}>
            <Form.Item
                name="title"
                label={t("vacancies.fields.title", { defaultValue: "Title" })}
                rules={[{ required: true, message: t("vacancies.validation.title", { defaultValue: "Title is required" }) }]}
            >
              <Input />
            </Form.Item>

            <Form.Item name="location" label={t("vacancies.fields.location", { defaultValue: "Location" })}>
              <Input />
            </Form.Item>

            <Form.Item
                name="jobType"
                label={t("vacancies.fields.jobType", { defaultValue: "Job type" })}
                rules={[{ required: true, message: t("vacancies.validation.jobType", { defaultValue: "Job type is required" }) }]}
            >
              <Select options={jobTypeOptions.map((o) => ({ ...o, label: t(`vacancies.jobType.${o.value}`, { defaultValue: o.label }) }))} />
            </Form.Item>

            <Form.Item
                name="description"
                label={t("vacancies.fields.description", { defaultValue: "Description" })}
                rules={[{ required: true, message: t("vacancies.validation.description", { defaultValue: "Description is required" }) }]}
            >
              <Input.TextArea rows={isMobile ? 7 : 8} />
            </Form.Item>

            <Button type="primary" htmlType="submit" loading={isLoading} block={isMobile}>
              {t("common.create", { defaultValue: "Create" })}
            </Button>
          </Form>
        </Card>
      </div>
  );
};