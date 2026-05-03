import Link from "next/link";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import StripeCheckoutForm from "@/components/enrollment/StripeCheckoutForm";
import { checkCourseEnrollment, fetchCourseMetadataById } from "@/lib/apiService";

export default async function CourseEnrollPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const { id } = params;

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value ?? "";

  if (!accessToken) {
    redirect(`/login?redirect=/courses/${id}/enroll`);
  }

  const enrollmentState = await checkCourseEnrollment(id, accessToken);
  if (enrollmentState.canViewFullCourse) {
    redirect(`/courses/${id}`);
  }

  const course = await fetchCourseMetadataById(id);
  if (!course) {
    notFound();
  }

  if (!course.price || course.price <= 0) {
    redirect(`/courses/${id}`);
  }

  return (
    <main className="min-h-screen bg-background px-6 py-8 text-foreground md:px-8">
      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="border-2 border-border bg-surface/90 p-6 shadow-(--shadow-soft)">
          <Link
            href={`/courses/${id}`}
            className="inline-flex items-center gap-2 border-2 border-border px-4 py-2 text-sm font-bold uppercase tracking-wide text-foreground transition hover:border-primary-500/70"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to course
          </Link>

          <p className="mt-6 text-xs font-black uppercase tracking-[0.28em] text-primary-200">
            Secure checkout
          </p>
          <h1 className="mt-3 text-3xl font-black uppercase tracking-wide text-foreground">
            {course.title}
          </h1>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            Complete your payment to unlock full curriculum access, lessons, and progress tracking.
          </p>

          <div className="mt-8 border-2 border-border bg-surface-raised p-5">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 text-emerald-300" />
              <div>
                <p className="text-sm font-black uppercase tracking-[0.18em] text-foreground">
                  Payment security
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Card details are handled by Stripe. Your card data does not pass through our servers.
                </p>
              </div>
            </div>
          </div>
        </section>

        <aside className="border-2 border-border bg-surface/90 p-6 shadow-(--shadow-soft)">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-primary-200">
            Checkout
          </p>
          <div className="mt-4">
            <StripeCheckoutForm
              courseId={id}
              courseTitle={course.title}
              coursePrice={course.price}
              accessToken={accessToken}
            />
          </div>
        </aside>
      </div>
    </main>
  );
}
