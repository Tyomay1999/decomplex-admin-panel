import { FC } from "react";
import { Routes, Route } from "react-router-dom";
import { ProfilePage } from "@/pages/profile";
import { UsersPage } from "@/pages/users";
// import { EventsPage, DashboardPage } from "@/pages/common";
import {
  VacanciesPage,
  CreateVacancyPage,
  VacancyDetailsPage,
  VacancyApplicationsPage,
} from "@/pages/vacancies";

export const ContentRoutes: FC = () => {
  return (
    <Routes>
      {/*<Route index element={<DashboardPage />} />*/}
      <Route index element={<VacanciesPage />} />
      {/*<Route path="events" element={<EventsPage />} />*/}
      <Route path="vacancies" element={<VacanciesPage />} />
      <Route path="vacancies/new" element={<CreateVacancyPage />} />
      <Route path="vacancies/:id" element={<VacancyDetailsPage />} />
      <Route path="vacancies/:id/applications" element={<VacancyApplicationsPage />} />
      <Route path="users" element={<UsersPage />} />
      <Route path="profile" element={<ProfilePage />} />
    </Routes>
  );
};
