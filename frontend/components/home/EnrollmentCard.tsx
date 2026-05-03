"use client";

import Link from "next/link";
import Image from "next/image";
import { Clock, BarChart, CheckCircle } from "lucide-react";
import type { Enrollment } from "@/types/course";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

type Props = {
  enrollment: Enrollment;
};

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remaining = Math.round(minutes % 60);
  if (hours > 0 && remaining > 0) return `${hours}h ${remaining}m`;
  if (hours > 0) return `${hours}h`;
  return `${remaining}m`;
}

export default function EnrollmentCard({ enrollment }: Props) {
  console.log("🚀 ~ EnrollmentCard ~ enrollment:", enrollment)
  const {
    _id,
    course,
    status,
    progressPercent,
    completedAt,
    enrolledAt,
  
  } = enrollment;

  if (!course) return null;

 
  const isCompleted = status === "completed";

  return (
    <Link
      href={`/dashboard/enrollments/${_id}`}
      className="group flex w-full max-w-sm flex-col overflow-hidden rounded-lg border-2 border-border bg-surface shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary-500/20"
    >
      {/* Thumbnail */}
      <div className="relative h-48 w-full">
        <Image
          src={course.thumbnail || "/placeholder.png"}
          alt={course.title}
          fill
          className="object-cover"
        />
        <Badge
          variant={isCompleted ? "success" : "default"}
          className="absolute right-3 top-3"
        >
          {isCompleted ? "Completed" : "In Progress"}
        </Badge>
        {course?.category && (
          <Badge
            variant="secondary"
            className="absolute left-3 top-3"
          >
            {course.category}
          </Badge>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="mb-2 flex-grow text-lg font-bold tracking-tight text-foreground group-hover:text-primary-500">
          {course.title}
        </h3>

        <div className="mb-4 flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            <span>{formatDuration(course?.totalDurationMinutes)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <BarChart className="h-4 w-4" />
            <span>{course.level}</span>
          </div>
        </div>

        {/* Progress */}
        <div className="mt-auto">
          <div className="mb-2 flex items-center justify-between text-sm font-medium text-muted-foreground">
            <span>Progress</span>
            <span className="font-bold text-primary-500">{progressPercent}%</span>
          </div>
          <Progress value={progressPercent} className="h-2" />

          {isCompleted && completedAt && (
            <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-green-500">
              <CheckCircle className="h-5 w-5" />
              <span>
                Completed on {new Date(completedAt).toLocaleDateString()}
              </span>
            </div>
          )}

          {!isCompleted && (
            <p className="mt-3 text-xs text-muted-foreground">
              Enrolled {new Date(enrolledAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}