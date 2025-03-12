
import { User, UserRole } from "@/types/auth";
import { useLoginAction } from "./actions/useLoginAction";
import { useRegisterAction } from "./actions/useRegisterAction";
import { useLogoutAction } from "./actions/useLogoutAction";
import { useProfileAction } from "./actions/useProfileAction";

/**
 * Combined hook that provides all authentication actions in one place
 */
export const useAuthActions = (user: User | null, setUser: (user: User | null) => void) => {
  const { login, isLoading: loginLoading } = useLoginAction(user, setUser);
  const { register } = useRegisterAction(user, setUser);
  const { logout, isLoading: logoutLoading } = useLogoutAction(user, setUser);
  const { updateUserProfile, isLoading: profileLoading } = useProfileAction(user, setUser);

  // Combine loading states - note we no longer include registerLoading as it's no longer exposed
  const isLoading = loginLoading || logoutLoading || profileLoading;

  return {
    login,
    register,
    logout,
    updateUserProfile,
    isLoading
  };
};
