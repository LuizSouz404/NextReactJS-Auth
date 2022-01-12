import { useContext } from "react"
import { AuthContext } from "../contexts/AuthContext"

type UseCAnParams = {
  permissions?: string[];
  roles?: string[];
}

export function useCan({ permissions = [], roles = [] }:UseCAnParams) {
  const {user, isAuthenticated} = useContext(AuthContext);

  if(!isAuthenticated) {
    return false;
  }

  if(permissions.length> 0) {
    const hasAllPermissions = permissions.every(permission => {
      return user.permissions.includes(permission);
    });

    if(!hasAllPermissions) {
      return false;
    }
  }

  if(roles.length> 0) {
    const hasAllRoles = roles.some(role => {
      return user.roles.includes(role);
    });

    if(!hasAllRoles) {
      return false;
    }
  }

  return true;
}