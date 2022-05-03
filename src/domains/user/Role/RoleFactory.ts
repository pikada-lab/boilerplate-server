import { Role } from "./Role";

export const RoleFactory = (role: any) => {
  return new Role().restore(role);
};