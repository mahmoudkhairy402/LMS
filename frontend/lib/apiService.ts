import type { Course, Enrollment } from "@/types/course";
import type { Instructor } from "@/types/user";
import type { PaginatedMeta } from "@/types/api";

// --- Base Configuration ---
const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.trim().replace(/\/$/, "") ||
  "http://localhost:5000";

// --- API Service Functions ---


export async function fetchPublicCourses(
  searchParams?: Record<string, string | number | undefined>,
): Promise<{ courses: Course[]; meta: PaginatedMeta }> {
  const fallback = { courses: [], meta: { page: 1, limit: 10, total: 0, totalPages: 1 } };
  try {
    const query = new URLSearchParams();
    if (searchParams) {
      Object.entries(searchParams).forEach(([key, value]) => {
        if (value) {
          query.set(key, String(value));
        }
      });
    }

    const response = await fetch(`${BASE_URL}/api/courses?${query.toString()}`, {
      cache: "no-store", // Always fetch fresh data for course lists
    });

    if (!response.ok) {
      console.error(`Failed to fetch courses: ${response.statusText}`);
      return fallback;
    }

    const data = await response.json();
    return {
      courses: data.courses || [],
      meta: data.meta || fallback.meta,
    };
  } catch (error) {
    console.error("Error in fetchPublicCourses:", error);
    return fallback;
  }
}


export async function fetchInstructors(
  search?: string,
): Promise<{ instructors: Instructor[] }> {
  const fallback = { instructors: [] };
  try {
    const query = new URLSearchParams();
    if (search) {
      query.set("search", search);
    }

    const response = await fetch(
      `${BASE_URL}/api/users/instructors?${query.toString()}`,
      {
        next: { revalidate: 3600 }, // Revalidate every hour
      },
    );

    if (!response.ok) {
      console.error(`Failed to fetch instructors: ${response.statusText}`);
      return fallback;
    }

    const data = await response.json();
    return {
      instructors: data.instructors || [],
    };
  } catch (error) {
    console.error("Error in fetchInstructors:", error);
    return fallback;
  }
}

export async function checkCourseEnrollment(
  courseId: string,
  accessToken: string,
): Promise<{ isEnrolled: boolean; canViewFullCourse: boolean }> {
  if (!accessToken) {
    return { isEnrolled: false, canViewFullCourse: false };
  }

  try {
    const response = await fetch(`${BASE_URL}/api/courses/${courseId}/enrollment/check`, {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      if (response.status !== 401 && response.status !== 403) {
        console.error(`Failed to check course enrollment: ${response.statusText}`);
      }

      return { isEnrolled: false, canViewFullCourse: false };
    }

    const data = await response.json();
    return {
      isEnrolled: Boolean(data.isEnrolled),
      canViewFullCourse: Boolean(data.canViewFullCourse),
    };
  } catch (error) {
    console.error("Error in checkCourseEnrollment:", error);
    return { isEnrolled: false, canViewFullCourse: false };
  }
}


export async function fetchMyEnrollments(
  accessToken: string,
): Promise<{ enrollments: Enrollment[] }> {
  if (!accessToken) return { enrollments: [] };

  try {
    const response = await fetch(`${BASE_URL}/api/courses/enrollments/mine`, {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      // Don't log 401 as an error, it's an expected state for guests
      if (response.status !== 401) {
        console.error(`Failed to fetch enrollments: ${response.statusText}`);
      }
      return { enrollments: [] };
    }

    const data = await response.json();
    return { enrollments: data.enrollments || [] };
  } catch (error) {
    console.error("Error in fetchMyEnrollments:", error);
    return { enrollments: [] };
  }
}

export async function fetchCourseMetadataById(id: string): Promise<Course | null> {
  if (!id) return null;

  try {
    const response = await fetch(`${BASE_URL}/api/courses/${id}/meta`, {
      next: { revalidate: 600 },
    });

    if (!response.ok) {
      console.error(`Failed to fetch course metadata ${id}: ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    return data.course || null;
  } catch (error) {
    console.error(`Error in fetchCourseMetadataById for ${id}:`, error);
    return null;
  }
}

/**
 * Fetches a single course by its ID or slug.
 * @param id - The ID or slug of the course.
 * @returns A promise that resolves to the course object or null if not found.
 */
export async function fetchCourseById(
  id: string,
  accessToken?: string,
): Promise<Course | null> {
  if (!id) return null;

  try {
    const response = await fetch(`${BASE_URL}/api/courses/${id}`, {
      next: { revalidate: 600 }, // Revalidate every 10 minutes
      headers: accessToken
        ? {
            Authorization: `Bearer ${accessToken}`,
          }
        : undefined,
    });

    if (!response.ok) {
      console.error(`Failed to fetch course ${id}: ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    return data.course || null;
  } catch (error) {
    console.error(`Error in fetchCourseById for ${id}:`, error);
    return null;
  }
}

type CreatePaymentIntentResponse = {
  success: boolean;
  clientSecret?: string;
  paymentIntentId?: string;
  paymentId?: string;
  enrolled?: boolean;
  message?: string;
};

type ConfirmPaymentResponse = {
  success: boolean;
  enrollmentId?: string;
  message?: string;
};

type PaymentStatusResponse = {
  success: boolean;
  status?: string;
  payment?: unknown;
  enrollment?: unknown;
};

export async function createPaymentIntent(
  courseId: string,
  accessToken: string,
): Promise<CreatePaymentIntentResponse> {
  try {
    const response = await fetch(`${BASE_URL}/api/payments/create-intent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ courseId }),
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data?.message || "Failed to create payment intent",
      };
    }

    return data;
  } catch (error) {
    console.error("Error in createPaymentIntent:", error);
    return { success: false, message: "Network error while creating payment" };
  }
}

export async function confirmPayment(
  paymentIntentId: string,
  accessToken: string,
): Promise<ConfirmPaymentResponse> {
  try {
    const response = await fetch(`${BASE_URL}/api/payments/confirm`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ paymentIntentId }),
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data?.message || "Failed to confirm payment",
      };
    }

    return data;
  } catch (error) {
    console.error("Error in confirmPayment:", error);
    return { success: false, message: "Network error while confirming payment" };
  }
}

export async function getPaymentStatus(
  paymentIntentId: string,
  accessToken: string,
): Promise<PaymentStatusResponse> {
  try {
    const response = await fetch(
      `${BASE_URL}/api/payments/get-status/${paymentIntentId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store",
      },
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        status: data?.status,
      };
    }

    return data;
  } catch (error) {
    console.error("Error in getPaymentStatus:", error);
    return { success: false };
  }
}
