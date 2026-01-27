import { Roles } from "../roles";
import { Injectable } from "@nestjs/common";
import {
  AbilityBuilder,
  PureAbility,
  AbilityClass,
  ExtractSubjectType,
} from "@casl/ability";

export enum Action {
  Manage = "manage", // Wildcard for any action
  Create = "create",
  Read = "read",
  Update = "update",
  Delete = "delete",
}

/**
 * Subject types - add your entities here
 * This is a base set, extend as needed in your application
 */
export type Subjects = "post" | "user" | "comment" | "media" | "feed" | "all";

/**
 * The application's ability type
 */
export type AppAbility = PureAbility<[Action, Subjects]>;
export const AppAbility = PureAbility as AbilityClass<AppAbility>;

/**
 * User interface for ability creation
 */
export interface CaslUser {
  id: string;
  role?: string;
  permissions?: string[];
}

@Injectable()
export class CaslAbilityFactory {
  private roles = Roles;

  createForUser(user: CaslUser): AppAbility {
    const { can, build } = new AbilityBuilder<AppAbility>(AppAbility);

    const roleName = user.role || "user";
    // Get permissions from role definition
    // We cast to any because we know the structure but TS might imply specific keys
    const rolePermissions =
      (this.roles as Record<string, string[]>)[roleName] || [];

    // Combine with user-specific permissions
    const allPermissions = [...rolePermissions, ...(user.permissions || [])];

    // Apply all permissions
    for (const permission of allPermissions) {
      const [action, subject] = permission.split(":") as [Action, Subjects];

      // Handle wildcard action
      if (action) {
        if (subject) {
          can(action, subject);
        }
      }
    }

    return build({
      detectSubjectType: (item: Record<string, any>) =>
        (item as any).__caslSubjectType__ ||
        ((typeof item === "object" && item !== null
          ? (item as any).constructor?.name.toLowerCase()
          : item) as ExtractSubjectType<Subjects>),
    });
  }
}
