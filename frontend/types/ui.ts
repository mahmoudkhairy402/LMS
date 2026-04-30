import type { UserRole } from "./auth";

export type NavLink = {
  href: string;
  label: string;
  icon?: React.ElementType;
};

export type NavLinksByRole = Record<UserRole, NavLink[]>;

export interface UiState {
  isGlobalLoading: boolean;
  isSidebarOpen: boolean;
}
