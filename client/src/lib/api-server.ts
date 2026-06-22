import { type Lesson, type Course, type Blog, type Banner, type Category, type Paginated } from "./api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

const toQueryString = (params: Record<string, string | number | boolean | undefined>) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
};

// Reusable fetch function for server components
async function serverFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  
  // Set a 15-second timeout for server-side fetches to avoid blocking Vercel builds
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  const defaultOptions: RequestInit = {
    next: { revalidate: 60 },
    signal: controller.signal,
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);
    clearTimeout(timeoutId);

    if (response.status === 204) {
      return undefined as T;
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}, status: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

export const serverApi = {
  getLessons(params: Record<string, string | number | boolean | undefined> = {}) {
    return serverFetch<Paginated<Lesson>>(`/api/lessons${toQueryString(params)}`);
  },

  getLesson(id: string) {
    return serverFetch<Lesson>(`/api/lessons/${id}`);
  },

  getCategories() {
    return serverFetch<Category[]>("/api/categories");
  },

  getCourses() {
    return serverFetch<Course[]>("/api/courses");
  },

  getCourse(idOrSlug: string) {
    return serverFetch<Course>(`/api/courses/${idOrSlug}`);
  },

  getBlogs(params: Record<string, string | number | boolean | undefined> = {}) {
    return serverFetch<Paginated<Blog>>(`/api/blogs${toQueryString(params)}`);
  },

  getBlog(id: string) {
    return serverFetch<Blog>(`/api/blogs/${id}`);
  },

  getBanners() {
    return serverFetch<Banner[]>("/api/banners");
  }
};
