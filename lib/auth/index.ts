import { AuthenticationError } from "./auth";

export {
  AuthenticationError,
  getCurrentUser,
  getUserTenantContext,
  requireCurrentUser,
  requireUserTenantContext,
} from "./auth";

export {
  isSuperAdmin,
  isCompanyAdmin,
  isCompanyUser,
  requireRole,
  requireSuperAdmin,
  requireCompanyAdmin,
  requireCompanyContext,
  requireCompanyAccess,
  requireCompanyManagementAccess,
} from "./authorization";
