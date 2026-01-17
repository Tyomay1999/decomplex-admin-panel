import { FC, ReactElement, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/store";
import { setAnonymous, setChecking, setCredentials } from "@/features/auth/authSlice";
import { getAccessTokenFromCookie } from "@/services/authHelpers";
import { useLazyCurrentQuery, useLazyMeQuery } from "@/services";
import type { CurrentSessionDto, UserDto } from "@/features/auth/types";

type Props = { children: ReactElement };

export const AuthBootstrap: FC<Props> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();
  const status = useSelector((s: RootState) => s.auth.status);

  const [triggerMe] = useLazyMeQuery();
  const [triggerCurrent] = useLazyCurrentQuery();

  useEffect(() => {
    if (status !== "idle" && status !== "checking") return;

    const token = getAccessTokenFromCookie();
    if (!token) {
      dispatch(setAnonymous());
      return;
    }

    dispatch(setChecking());

    let active = true;

    const run = async (): Promise<void> => {
      try {
        const user: UserDto = await triggerMe().unwrap();

        if (!active) return;

        if (!user?.id) {
          dispatch(setAnonymous());
          return;
        }

        let session: CurrentSessionDto | null = null;

        try {
          session = await triggerCurrent().unwrap();
        } catch {
          session = null;
        }

        if (!active) return;

        dispatch(
          setCredentials({
            accessToken: token,
            user,
            session,
          }),
        );
      } catch {
        if (!active) return;
        dispatch(setAnonymous());
      }
    };

    void run();

    return () => {
      active = false;
    };
  }, [status, dispatch, triggerMe, triggerCurrent]);

  return children;
};
