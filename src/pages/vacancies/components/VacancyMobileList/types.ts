import type { VacancyDto } from "@/services";

export type VacancyMobileListProps = {
  items: VacancyDto[];
  isFetching: boolean;
  isError: boolean;
  hasMore: boolean;

  onView: (id: string) => void;
  onApplications: (id: string) => void;
  onLoadMore: () => void;
};
