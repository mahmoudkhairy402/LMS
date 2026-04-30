"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  UserCheck,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import type { User } from "@/types/user";


import { cn } from "@/lib/utils";
import { NavLinksByRole } from "@/types/ui";

type Role = "admin" | "instructor" | "student";

const navLinksByRole: NavLinksByRole = {
  admin: [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/users", label: "Users", icon: Users },
  ],
  instructor: [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/my-courses", label: "My Courses", icon: BookOpen },
    { href: "/dashboard/my-students", label: "My Students", icon: GraduationCap },
  ],
  student: [
    { href: "/dashboard/enrollments", label: "My Enrollments", icon: GraduationCap },
    { href: "/courses", label: "Explore Courses", icon: BookOpen },
  ],
};

type Props = {
  user: User;
  isOpen: boolean;
  isCollapsed: boolean;
  setIsOpen: (isOpen: boolean) => void;
  setIsCollapsed: (isCollapsed: boolean) => void;
};

export default function Sidebar({
  user,
  isOpen,
  isCollapsed,
  setIsOpen,
  setIsCollapsed,
}: Props) {
  const pathname = usePathname();
  const navLinks = navLinksByRole[user?.role as Role] || [];

  const NavLink = ({ href, label, icon: Icon }: { href: string; label: string; icon?: React.ElementType }) => (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-muted-foreground transition-all hover:bg-primary-500/10 hover:text-primary-500",
        {
          "bg-primary-500/10 text-primary-500": pathname === href,
          "justify-center": isCollapsed,
        }
      )}
      onClick={() => setIsOpen(false)}
    >
      {Icon && <Icon className="h-5 w-5" />}
      <span className={cn({ "hidden": isCollapsed })}>{label}</span>
    </Link>
  );

  return (
    <>
      {/* Overlay for mobile */}
      <div
        className={cn(
          "fixed inset-0 z-30 bg-black/50 md:hidden",
          { "hidden": !isOpen }
        )}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 flex h-full flex-col border-r-2 border-border bg-surface p-4 transition-all duration-300",
          "md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
          isCollapsed ? "w-20" : "w-64"
        )}
      >
        <div className={cn("mb-8 flex items-center", isCollapsed ? "justify-center" : "justify-between")}>
          {!isCollapsed && (
            <Link href="/" className="inline-flex items-center gap-2 text-lg font-black tracking-wide">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary-500 bg-primary-500/20 text-primary-300">
                E
              </span>
              <span className="text-foreground">EduPath</span>
            </Link>
          )}
          <button
            onClick={() => setIsOpen(false)}
            className="text-muted-foreground hover:text-foreground md:hidden"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="flex-1 space-y-2">
          {navLinks.map((link) => (
            <NavLink key={link.href} {...link} />
          ))}
        </nav>

        <div className="mt-auto">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden w-full items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-surface-raised hover:text-foreground md:flex"
          >
            {isCollapsed ? <ChevronRight className="h-6 w-6" /> : <ChevronLeft className="h-6 w-6" />}
          </button>
        </div>
      </aside>
    </>
  );
}
