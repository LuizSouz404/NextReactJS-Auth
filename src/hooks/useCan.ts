import { useContext } from "react"
import { AuthContext } from "../contexts/AuthContext"
import { validateUserPermissions } from "../utils/validateUserPermissions";

type UseCAnParams = {
  permissions?: string[];
  roles?: string[];
}

export function useCan({ permissions = [], roles = [] }:UseCAnParams) {
  const {user, isAuthenticated} = useContext(AuthContext);

  if(!isAuthenticated) {
    return false;
  }

  const userHasValidPermissions = validateUserPermissions({user, permissions, roles});

  return userHasValidPermissions;
}
