const baseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL?.trim().replace(/\/$/, "") ||
  "http://localhost:5000";

import type { User } from "@/types/user";

export async function getCurrentUser(accessToken: string): Promise<User | null> {
  try {
    const response = await fetch(`${baseUrl}/auth/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("Failed to fetch current user:", response.statusText);
      return null;
    }

    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error("An error occurred while fetching the current user:", error);
    return null;
  }
}
