"use client";

import { useState } from "react";
import type { User } from "@/types/user";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useAppSelector } from "@/store/hooks";

type Props = {
  children: React.ReactNode;
};

export default function DashboardClientLayout({ children }: Props) {
  const user = useAppSelector((state) => state.auth.user) || {};
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar
        user={user}
        isOpen={isSidebarOpen}
        isCollapsed={isSidebarCollapsed}
        setIsOpen={setIsSidebarOpen}
        setIsCollapsed={setIsSidebarCollapsed}
      />
      <div
        className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? "md:ml-20" : "md:ml-64"
          }`}
      >
        <Header
          user={user}
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        <main className="p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
