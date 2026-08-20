// Shared error classes used across server and client code.
// This file must NOT use "use server" so it can be imported by client-side code and server actions.

export class RoleError extends Error {
  constructor(message = "Role error") {
    super(message);
    this.name = "RoleError";
  }
}

export class UserRoleError extends Error {
  constructor(message = "UserRole error") {
    super(message);
    this.name = "UserRoleError";
  }
}
