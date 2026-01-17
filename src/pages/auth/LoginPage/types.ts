export type LoginFormValues = {
  email: string;
  password: string;
  remember?: boolean;
};

export type LocationState = {
  from?: {
    pathname: string;
  };
};
