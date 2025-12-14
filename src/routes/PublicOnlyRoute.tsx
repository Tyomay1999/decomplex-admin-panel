import * as React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { selectIsAuthenticated } from "@/features/auth/selectors";

type Props = { children: React.ReactElement };

export const PublicOnlyRoute: React.FC<Props> = ({ children }) => {
  const isAuthed = useSelector((s: RootState) => selectIsAuthenticated(s));

  if (isAuthed) return <Navigate to="/" replace />;

  return children;
};
