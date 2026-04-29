"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@/types/user";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useAppSelector } from "@/store/hooks";
import Loading from "@/app/loading";
import { toast } from "sonner";

type Props = {
  children: React.ReactNode;
};

export default function DashboardClientLayout({ children }: Props) {
  const { user, status } = useAppSelector((state) => state.auth);
  const router = useRouter();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (status === "failed") {
      toast.error("Please login to access the dashboard.");
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading" || status === "idle" || !user) {
    return <Loading />;
  }

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
