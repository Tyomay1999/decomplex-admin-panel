import * as React from "react";
import { FC, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Button,
  Form,
  Input,
  Modal,
  Space,
  Table,
  Typography,
  message,
  Select,
  Popconfirm,
} from "antd";
import {
  useArchiveVacancyMutation,
  useCreateVacancyMutation,
  useGetVacanciesQuery,
} from "@/features/vacancies/vacanciesApi";
import type { ColumnsType } from "antd/es/table";
import type { VacancyDto } from "@/features/vacancies/types";

const { Title } = Typography;

type CreateFormValues = {
  title: string;
  location?: string;
  description?: string;
  jobType: string;
  salaryFrom?: number;
  salaryTo?: number;
};

export const VacanciesPage: FC = () => {
  const { t } = useTranslation("common");
  const [form] = Form.useForm<CreateFormValues>();
  const [open, setOpen] = useState(false);

  const { data, isLoading, isFetching } = useGetVacanciesQuery();
  const [archiveVacancy, { isLoading: isArchiving }] = useArchiveVacancyMutation();

  const [createVacancy, { isLoading: isCreating }] = useCreateVacancyMutation();

  const rows = data ?? [];

  const onCreate = async () => {
    try {
      const values = await form.validateFields();

      await createVacancy({
        title: values.title.trim(),
        location: values.location?.trim() || undefined,
        description: values.description?.trim() || undefined,
        jobType: values.jobType,
        salaryFrom: values.salaryFrom ?? undefined,
        salaryTo: values.salaryTo ?? undefined,
      }).unwrap();

      message.success(t("vacancies.messages.created", "Vacancy created"));
      form.resetFields();
      setOpen(false);
    } catch {
      // handled by UI
    }
  };

  const columns: ColumnsType<VacancyDto> = [
    { title: t("vacancies.table.title", "Title"), dataIndex: "title", key: "title" },

    { title: t("vacancies.table.location", "Location"), dataIndex: "location", key: "location" },

    { title: t("vacancies.table.jobType", "Job type"), dataIndex: "jobType", key: "jobType" },

    {
      title: t("vacancies.table.salary", "Salary"),
      key: "salary",
      render: (_, r) => {
        const from = r.salaryFrom ?? null;
        const to = r.salaryTo ?? null;
        if (from == null && to == null) return "—";
        if (from != null && to != null) return `${from} – ${to}`;
        return from != null ? `from ${from}` : `to ${to}`;
      },
    },

    {
      title: t("vacancies.table.status", "Status"),
      dataIndex: "status",
      key: "status",
    },
    {
      title: t("vacancies.table.actions", "Actions"),
      key: "actions",
      render: (_, r) => (
        <Space>
          <Popconfirm
            title={t("vacancies.archive.confirmTitle", "Archive vacancy?")}
            description={t(
              "vacancies.archive.confirmDesc",
              "This will move vacancy to archived status.",
            )}
            okText={t("vacancies.archive.ok", "Archive")}
            cancelText={t("vacancies.archive.cancel", "Cancel")}
            onConfirm={async () => {
              try {
                await archiveVacancy(r.id).unwrap();
                message.success(t("vacancies.messages.archived", "Archived"));
              } catch {
                message.error(t("vacancies.messages.actionError", "Action failed"));
              }
            }}
          >
            <Button size="small" danger loading={isArchiving}>
              {t("vacancies.archive.button", "Archive")}
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Space style={{ width: "100%", justifyContent: "space-between" }}>
        <Title level={4} style={{ margin: 0 }}>
          {t("vacancies.title", "Vacancies")}
        </Title>

        <Button type="primary" onClick={() => setOpen(true)}>
          {t("vacancies.create", "Create vacancy")}
        </Button>
      </Space>

      <div style={{ marginTop: 16 }}>
        <Table<VacancyDto>
          rowKey="id"
          loading={isLoading || isFetching}
          columns={columns}
          dataSource={rows}
          pagination={{ pageSize: 10 }}
        />
      </div>

      <Modal
        title={t("vacancies.create", "Create vacancy")}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={onCreate}
        okButtonProps={{ loading: isCreating }}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label={t("vacancies.form.title", "Title")}
            name="title"
            rules={[
              { required: true, message: t("vacancies.validation.titleRequired", "Enter title") },
            ]}
          >
            <Input
              placeholder={t("vacancies.form.titlePlaceholder", "e.g. Senior Frontend Engineer")}
            />
          </Form.Item>
          <Form.Item
            label={t("vacancies.form.jobType", "Job type")}
            name="jobType"
            rules={[
              {
                required: true,
                message: t("vacancies.validation.jobTypeRequired", "Select job type"),
              },
            ]}
          >
            <Select
              placeholder={t("vacancies.form.jobTypePlaceholder", "Select job type")}
              options={[
                { value: "remote", label: t("vacancies.jobType.remote", "Remote") },
                { value: "full_time", label: t("vacancies.jobType.full_time", "Full-time") },
                { value: "hybrid", label: t("vacancies.jobType.hybrid", "Hybrid") },
                { value: "office", label: t("vacancies.jobType.office", "Office") },
              ]}
            />
          </Form.Item>

          <Space style={{ width: "100%" }} size={12}>
            <Form.Item
              style={{ flex: 1 }}
              label={t("vacancies.form.salaryFrom", "Salary from")}
              name="salaryFrom"
            >
              <Input type="number" placeholder="0" />
            </Form.Item>

            <Form.Item
              style={{ flex: 1 }}
              label={t("vacancies.form.salaryTo", "Salary to")}
              name="salaryTo"
            >
              <Input type="number" placeholder="0" />
            </Form.Item>
          </Space>

          <Form.Item label={t("vacancies.form.location", "Location")} name="location">
            <Input placeholder={t("vacancies.form.locationPlaceholder", "e.g. Yerevan / Remote")} />
          </Form.Item>

          <Form.Item label={t("vacancies.form.description", "Description")} name="description">
            <Input.TextArea
              rows={4}
              placeholder={t("vacancies.form.descriptionPlaceholder", "Short description")}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
