export type ApiSuccessResponse<T> = {
  success: boolean;
  data: T;
};

export type Role = "admin" | "company_manager" | "recruiter" | "user";

export type CompanyDto = {
  id: string;
  name: string;
  defaultLocale?: string;
  status?: "active" | "inactive";
};

export type UserDto = {
  id: string;
  email: string;
  name?: string | null;
  role: Role;
  company?: CompanyDto | null;
};

export type UserType = "company";

export type CurrentUserDto = {
  id: string;
  email: string;
  role: Exclude<Role, "user">;
  language: string;
  position: string | null;
  companyId: string;
  userType: UserType;
};

export type CurrentSessionDto = {
  userType: UserType;
  user: CurrentUserDto;
  company: CompanyDto;
};

export type LoginPayload = {
  email: string;
  password: string;
  language: string;
  rememberUser: boolean;
};

export type LoginResponseData = {
  accessToken: string;
  refreshToken?: string;
  user: UserDto;
  fingerprintHash?: string;
};
