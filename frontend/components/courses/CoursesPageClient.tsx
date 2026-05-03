"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import type { Course } from "@/types/course";
import type { Instructor } from "@/types/user";
import type { PaginatedMeta } from "@/types/api";
import CourseCard from "@/components/home/CourseCard";
import {Pagination} from "@/components/ui/Pagination";

type CoursesPageClientProps = {
  courses: Course[];
  instructors: Instructor[];
  meta: PaginatedMeta;
};

export default function CoursesPageClient({
  courses,
  instructors,
  meta,
}: CoursesPageClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");

  const handleFilterChange = (key: string, value: string) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    if (value) {
      current.set(key, value);
    } else {
      current.delete(key);
    }
    current.set("page", "1"); // Reset to first page on filter change
    const search = current.toString();
    const query = search ? `?${search}` : "";
    router.push(`${pathname}${query}`);
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleFilterChange("search", searchTerm);
  };

  const clearSearch = () => {
    setSearchTerm("");
    handleFilterChange("search", "");
  };

  const onPageChange = (page: number) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    current.set("page", String(page));
    const search = current.toString();
    const query = search ? `?${search}` : "";
    router.push(`${pathname}${query}`);
  };

  const filterOptions = {
    category: [
      "Web Development",
      "Data Science",
      "Mobile Development",
      "Cybersecurity",
      "Cloud Computing",
    ],
    level: ["Beginner", "Intermediate", "Advanced", "Expert"],
  };

  return (
    <div>
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-black tracking-tighter text-foreground md:text-5xl">
          Explore Our Courses
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-lg text-muted-foreground">
          Find the perfect course to boost your skills. Search, filter, and start
          learning today.
        </p>
      </header>

      {/* Filters and Search */}
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <form onSubmit={handleSearch} className="relative md:col-span-2 lg:col-span-1">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search courses..."
            className="w-full border-2 border-border bg-surface py-3 pl-10 pr-10 text-white placeholder-neutral-500 transition focus:border-primary-500 focus:outline-none"
          />
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-500" />
          {searchTerm && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </form>
        {/* Category Filter */}
        <select
          value={searchParams.get("category") || ""}
          onChange={(e) => handleFilterChange("category", e.target.value)}
          className="w-full border-2 border-border bg-surface px-4 py-3 text-white transition focus:border-primary-500 focus:outline-none"
        >
          <option value="">All Categories</option>
          {filterOptions.category.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        {/* Level Filter */}
        <select
          value={searchParams.get("level") || ""}
          onChange={(e) => handleFilterChange("level", e.target.value)}
          className="w-full border-2 border-border bg-surface px-4 py-3 text-white transition focus:border-primary-500 focus:outline-none"
        >
          <option value="">All Levels</option>
          {filterOptions.level.map((lvl) => (
            <option key={lvl} value={lvl}>
              {lvl}
            </option>
          ))}
        </select>
        {/* Instructor Filter */}
        <select
          value={searchParams.get("instructor") || ""}
          onChange={(e) => handleFilterChange("instructor", e.target.value)}
          className="w-full border-2 border-border bg-surface px-4 py-3 text-white transition focus:border-primary-500 focus:outline-none"
        >
          <option value="">All Instructors</option>
          {instructors.map((inst:Instructor) => (
            <option key={inst?._id} value={inst?._id}>
              {inst.name}
            </option>
          ))}
        </select>
      </div>

      {/* Courses Grid */}
      {courses.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {courses.map((course) => (
            <CourseCard key={course._id} course={course} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-surface py-20 text-center">
          <h3 className="text-2xl font-bold tracking-tight text-foreground">
            No Courses Found
          </h3>
          <p className="mt-2 text-muted-foreground">
            Try adjusting your search or filters.
          </p>
        </div>
      )}

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="mt-12">
          <Pagination
            currentPage={meta.page}
            totalPages={meta.totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
}
