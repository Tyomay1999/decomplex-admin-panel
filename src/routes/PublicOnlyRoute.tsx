import { FC, ReactElement } from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectIsAuthenticated } from "@/features/auth/selectors";

type Props = { children: ReactElement };

export const PublicOnlyRoute: FC<Props> = ({ children }) => {
  const isAuthed = useSelector(selectIsAuthenticated);

  if (isAuthed) return <Navigate to="/" replace />;

  return children;
};
