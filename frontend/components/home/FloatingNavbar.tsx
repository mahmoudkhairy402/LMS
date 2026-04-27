"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, LogOut, Menu, Settings, X } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logoutUser } from "@/store/thunks/authThunks";

type Role = "admin" | "instructor" | "student";

function isInDashboard() {
  const pathname = usePathname();
  return pathname.includes("/dashboard");
}

const navLinksByRole: Record<Role, { href: string; label: string }[]> = {
  admin: [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/dashboard/users", label: "Users" },
    { href: "/dashboard/courses", label: "Courses" },
    { href: "/dashboard/instructors", label: "Instructors" },
  ],
  instructor: [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/dashboard/students", label: "My Students" },
    { href: "/dashboard/myCources ", label: "My Courses" },
    { href: "/courses", label: "Courses" },
    { href: "/students", label: "Students" },
  ],
  student: [
    { href: "/dashboard/enrollments", label: "My Courses" },
    { href: "/courses", label: "explore Courses" },
    { href: "/instructors", label: "Instructors" },
  ],
};

const guestLinks = [
  { href: "/instructors", label: "Instructors" },
  { href: "/courses", label: "Courses" },
];

export default function FloatingNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const router = useRouter();


  const navLinks =
    user?.role && user.role in navLinksByRole
      ? navLinksByRole[user.role as Role]
      : guestLinks;

  const handleLogout = async () => {
    setIsUserMenuOpen(false);
    setIsMenuOpen(false);
    await dispatch(logoutUser());
    router.replace("/login");
  };



  return (
    <>
      {!isInDashboard() && (
        <motion.nav
          initial={{ y: -16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.45 }}
          className="sticky top-4 z-30 mb-10"
        >
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between rounded-full border-2 border-border/80 bg-surface/85 px-4 py-3 shadow-(--shadow-soft) backdrop-blur-md md:px-6">
            <Link href="/" className="inline-flex items-center gap-2 text-lg font-black tracking-wide">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary-500 bg-primary-500/20 text-primary-300">
                E
              </span>
              <span className="text-foreground">EduPath</span>
            </Link>

            <div className="hidden items-center gap-2 md:flex">
              {navLinks.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="rounded-full border border-transparent px-4 py-2 text-sm font-semibold text-muted-foreground transition hover:border-border hover:bg-surface-raised hover:text-foreground"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="hidden md:block">
              {user ? (
                <div className="relative inline-flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">{user.name}</span>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 border-2 border-border px-2 py-1 text-left transition hover:border-primary-500/70"
                    onClick={() => setIsUserMenuOpen((prev) => !prev)}
                    aria-label="Open user menu"
                  >
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="h-10 w-10 border-2 border-primary-500/70 object-cover"
                      />
                    ) : (
                      <div className="inline-flex h-10 w-10 items-center justify-center border-2 border-primary-500/70 bg-primary-500/20 font-bold text-primary-200">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </button>

                  <AnimatePresence>
                    {isUserMenuOpen ? (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.18 }}
                        className="absolute right-0 top-full mt-3 w-56 border-2 border-border bg-surface p-2 shadow-(--shadow-soft)"
                      >
                        <Link
                          href="/profile"
                          className="flex items-center gap-3 border border-transparent px-3 py-2 text-sm font-semibold text-foreground transition hover:border-border hover:bg-surface-raised"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Settings className="h-4 w-4" />
                          Profile Settings
                        </Link>

                        <button
                          type="button"
                          className="flex w-full items-center gap-3 border border-transparent px-3 py-2 text-sm font-semibold text-foreground transition hover:border-border hover:bg-surface-raised"
                          onClick={handleLogout}
                        >
                          <LogOut className="h-4 w-4" />
                          Log out
                        </button>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2">
                  <Link
                    href="/login"
                    className="rounded-full border-2 border-border px-4 py-2 text-sm font-bold text-foreground transition hover:border-primary-500/70"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="rounded-full border-2 border-primary-500 bg-primary-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-primary-600"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>

            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground md:hidden"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              aria-label="Toggle navigation menu"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="mt-3 rounded-3xl border-2 border-border bg-surface/95 p-4 shadow-(--shadow-soft) backdrop-blur-md md:hidden"
              >
                <div className="mb-4 flex flex-col gap-2">
                  {navLinks.map((item) => (
                    <a
                      key={item.label}
                      href={item.href}
                      className="rounded-2xl border border-border px-3 py-2 text-sm font-semibold text-foreground"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.label}
                    </a>
                  ))}
                </div>

                {user ? (
                  <div className="flex flex-col gap-2 border border-border p-3">
                    <div className="flex items-center gap-3">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="h-10 w-10 border-2 border-primary-500/70 object-cover"
                        />
                      ) : (
                        <div className="inline-flex h-10 w-10 items-center justify-center border-2 border-primary-500/70 bg-primary-500/20 font-bold text-primary-200">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-foreground">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href="/profile"
                        className="flex-1 border-2 border-border px-3 py-2 text-center text-xs font-bold uppercase tracking-wide text-foreground transition hover:border-primary-500/70"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Profile Settings
                      </Link>
                      <button
                        type="button"
                        className="flex-1 border-2 border-primary-500 bg-primary-500 px-3 py-2 text-xs font-bold uppercase tracking-wide text-white transition hover:bg-primary-600"
                        onClick={handleLogout}
                      >
                        Log out
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Link
                      href="/login"
                      className="flex-1 rounded-full border-2 border-border px-4 py-2 text-center text-sm font-bold text-foreground"
                    >
                      Login
                    </Link>
                    <Link
                      href="/register"
                      className="flex-1 rounded-full border-2 border-primary-500 bg-primary-500 px-4 py-2 text-center text-sm font-bold text-white"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.nav>
      )}
    </>
  );
}
