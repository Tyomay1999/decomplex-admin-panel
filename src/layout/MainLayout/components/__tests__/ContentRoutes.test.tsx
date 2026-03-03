import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ContentRoutes } from "../ContentRoutes";

vi.mock("@/pages/profile", () => ({
  ProfilePage: () => <div>ProfilePage</div>,
}));

vi.mock("@/pages/users", () => ({
  UsersPage: () => <div>UsersPage</div>,
}));

vi.mock("@/pages/vacancies", () => ({
  VacanciesPage: () => <div>VacanciesPage</div>,
  CreateVacancyPage: () => <div>CreateVacancyPage</div>,
  VacancyDetailsPage: () => <div>VacancyDetailsPage</div>,
  VacancyApplicationsPage: () => <div>VacancyApplicationsPage</div>,
}));

describe("ContentRoutes", () => {
  it("The index route renders the Vacancies Page", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <ContentRoutes />
      </MemoryRouter>,
    );

    expect(screen.getByText("VacanciesPage")).toBeInTheDocument();
  });

  it("/users renders the Users Page", () => {
    render(
      <MemoryRouter initialEntries={["/users"]}>
        <ContentRoutes />
      </MemoryRouter>,
    );

    expect(screen.getByText("UsersPage")).toBeInTheDocument();
  });

  it("/profile renders Profile Page", () => {
    render(
      <MemoryRouter initialEntries={["/profile"]}>
        <ContentRoutes />
      </MemoryRouter>,
    );

    expect(screen.getByText("ProfilePage")).toBeInTheDocument();
  });

  it("/vacancies/new renders Create Vacancy Page", () => {
    render(
      <MemoryRouter initialEntries={["/vacancies/new"]}>
        <ContentRoutes />
      </MemoryRouter>,
    );

    expect(screen.getByText("CreateVacancyPage")).toBeInTheDocument();
  });

  it("/vacancies/:id renders Vacancy Details Page", () => {
    render(
      <MemoryRouter initialEntries={["/vacancies/123"]}>
        <ContentRoutes />
      </MemoryRouter>,
    );

    expect(screen.getByText("VacancyDetailsPage")).toBeInTheDocument();
  });

  it("/vacancies/:in/applications renders the Vacancy Applications Page", () => {
    render(
      <MemoryRouter initialEntries={["/vacancies/123/applications"]}>
        <ContentRoutes />
      </MemoryRouter>,
    );

    expect(screen.getByText("VacancyApplicationsPage")).toBeInTheDocument();
  });
});
