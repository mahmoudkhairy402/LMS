"use client";

import Link from "next/link";
import { Menu, ChevronDown, LogOut, Settings } from "lucide-react";
import { useAppDispatch } from "@/store/hooks";
import { logoutUser } from "@/store/thunks/authThunks";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { User } from "@/types/user";

type Props = {
  user: User;
  toggleSidebar: () => void;
};

export default function Header({ user, toggleSidebar }: Props) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleLogout = async () => {
    setIsUserMenuOpen(false);
    await dispatch(logoutUser());
    router.replace("/login");
  };

  return (
    <header className="sticky top-0 z-20 border-b-2 border-border bg-surface/80 px-4 py-3 backdrop-blur-md md:px-8">
      <div className="flex items-center justify-between">
        <button
          onClick={toggleSidebar}
          className="text-muted-foreground hover:text-foreground md:hidden"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-6 w-6" />
        </button>
        <div className="hidden md:block" /> {/* Spacer */}

        <div className="relative inline-flex items-center gap-3">
          <span className="text-sm font-semibold text-muted-foreground">{user?.name}</span>
          <button
            type="button"
            className="inline-flex items-center gap-2"
            onClick={() => setIsUserMenuOpen((prev) => !prev)}
            aria-label="Open user menu"
          >
            {user?.avatar ? (
              <img
                src={user?.avatar}
                alt={user?.name}
                className="h-10 w-10 rounded-full border-2 border-primary-500/70 object-cover"
              />
            ) : (
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary-500/70 bg-primary-500/20 font-bold text-primary-200">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            )}
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </button>

          <AnimatePresence>
            {isUserMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
                className="absolute right-0 top-full mt-3 w-56 rounded-md border-2 border-border bg-surface p-2 shadow-lg"
              >
                <Link
                  href="/profile"
                  className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold text-foreground transition hover:bg-surface-raised"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  <Settings className="h-4 w-4" />
                  Profile Settings
                </Link>

                <button
                  type="button"
                  className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold text-foreground transition hover:bg-surface-raised"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  Log out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
