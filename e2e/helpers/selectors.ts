export const sel = {
  html: "html",
  appRoot: ".app-root",

  routeLoader: '[data-testid="route-loader"]',

  loginPage: '[data-testid="login-page"]',
  loginLangSelect: '[data-testid="login-lang-select"]',
  loginThemeBtn: '[data-testid="login-theme-btn"]',
  loginEmail: '[data-testid="login-email"]',
  loginPassword: '[data-testid="login-password"]',
  loginSubmit: '[data-testid="login-submit"]',
  loginLang: '[data-testid="login-lang-select"]',
  loginThemeToggle: '[data-testid="login-theme-btn"]',

  topbar: '[data-testid="topbar"]',
  topbarUserTrigger: '[data-testid="topbar-user-trigger"]',

  topbarThemeSubmenu: '[data-testid="topbar-theme-submenu"]',
  topbarThemeDark: '[data-testid="topbar-theme-dark"]',
  topbarThemeLight: '[data-testid="topbar-theme-light"]',

  topbarLangSubmenu: '[data-testid="topbar-language-submenu"]',
  topbarLangEn: '[data-testid="topbar-lang-en"]',
  topbarLangRu: '[data-testid="topbar-lang-ru"]',
  topbarLangHy: '[data-testid="topbar-lang-hy"]',

  vacanciesPage: '[data-testid="vacancies-page"]',
  vacanciesCreateOpen: '[data-testid="vacancies-create-open"]',

  vacancyCreatePage: '[data-testid="vacancy-create-page"]',
  vacancyCreateForm: '[data-testid="vacancy-create-form"]',
  vacancyTitle: '[data-testid="vacancy-title"]',
  vacancyLocation: '[data-testid="vacancy-location"]',
  vacancyDescription: '[data-testid="vacancy-description"]',
  vacancyCreateSubmit: '[data-testid="vacancy-create-submit"]',

  vacancyDetailsLoading: '[data-testid="vacancy-details-loading"]',
  vacancyDetailsNotFound: '[data-testid="vacancy-details-not-found"]',

  vacancyDetailsPage: '[data-testid="vacancy-details-page"]',
  vacancyApplicationsPage: '[data-testid="vacancy-applications-page"]',

  usersPage: '[data-testid="users-page"]',
  userEmail: '[data-testid="user-email"]',
  userPassword: '[data-testid="user-password"]',
  userCreateSubmit: '[data-testid="user-create-submit"]',
} as const;
