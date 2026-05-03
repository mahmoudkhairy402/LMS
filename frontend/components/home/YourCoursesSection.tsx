"use client"

import type { Enrollment } from "@/types/course";
import { useAppSelector } from "@/store/hooks";
import { GraduationCap, Sparkles } from "lucide-react";
import EnrollmentCard from "@/components/home/EnrollmentCard"
import Link from "next/link";

type Props = {
  enrollments: Enrollment[];
};

export default function YourCoursesSection({ enrollments }: Props) {
  console.log("🚀 ~ YourCoursesSection ~ enrollments:", enrollments)
  const { user } = useAppSelector((state) => state.auth);

  return (
    <>
      {user && (
        <section className="mt-20 scroll-mt-28" id="your-courses">
          <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 border-2 border-primary-500/40 bg-primary-500/10 px-4 py-2 text-xs font-black uppercase tracking-[0.28em] text-primary-200">
                <Sparkles className="h-3.5 w-3.5" />
                Your Enrollments
              </div>
              <h2 className="max-w-2xl text-3xl font-black uppercase tracking-wide text-foreground md:text-4xl">
                Enrolled Courses Preview
              </h2>
            </div>
          </div>

          {!user ? (
            <div className="border-2 border-border bg-surface p-8 text-center shadow-(--shadow-soft)">
              <p className="text-lg font-semibold text-foreground">
                Login first to preview your enrollments.
              </p>
              <div className="mt-6">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center border-2 border-primary-500 bg-primary-500 px-5 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-primary-600"
                >
                  Login
                </Link>
              </div>
            </div>
          ) : enrollments.length === 0 ? (
            <div className="border-2 border-border bg-surface p-8 text-center shadow-(--shadow-soft)">
              <GraduationCap className="mx-auto h-10 w-10 text-primary-300" />
              <p className="mt-4 text-lg font-semibold uppercase tracking-wide text-foreground">
                No enrollments found.
              </p>
              <div className="mt-6">
                <Link
                  href="/courses"
                  className="inline-flex items-center justify-center border-2 border-primary-500 bg-primary-500 px-5 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-primary-600"
                >
                  Enroll Now
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-5">
              {enrollments.map((enrollment) => (
                <EnrollmentCard key={enrollment._id} enrollment={enrollment} />
              ))}
            </div>
          )}
        </section>
      )}
    </>
  );
}