export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export type Role = "CUSTOMER" | "ADMIN";

export type User = {
  id: string;
  email: string;
  fullName?: string | null;
  phone?: string | null;
  birthday?: string | null;
  gender?: string | null;
  avatar?: string | null;
  role: Role;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  createdAt?: string;
};

export type Lesson = {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  content?: string | null;
  imageUrl?: string | null;
  videoUrl?: string | null;
  isActive: boolean;
  categoryId: string;
  category?: Category;
  grade?: number | null;
  createdAt: string;
};

export type AssignmentType = "ESSAY" | "QUIZ";

export type QuestionType = "MULTIPLE_CHOICE" | "SHORT_ANSWER" | "ESSAY";

export type QuestionOption = {
  id: string;
  text: string;
  isCorrect: boolean;
};

export type Question = {
  id: string;
  text: string;
  type: QuestionType;
  points: number;
  order: number;
  options: QuestionOption[];
};

export type Course = {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  content?: string | null;
  price: number;
  imageUrl?: string | null;
  isActive: boolean;
  isEnrolled?: boolean;
  createdAt: string;
};

export type EnrollmentStatus = "PENDING" | "PAID" | "CANCELLED";

export type Enrollment = {
  id: string;
  userId: string;
  courseId: string;
  status: EnrollmentStatus;
  amount: number;
  createdAt: string;
};

export type Assignment = {
  id: string;
  title: string;
  description?: string | null;
  content: string;
  type: AssignmentType;
  points: number;
  dueDate?: string | null;
  duration?: number | null;
  lessonId?: string | null;
  lesson?: Lesson;
  courseId?: string | null;
  course?: Course;
  questions?: Question[];
};

export type SubmissionAnswer = {
  id: string;
  questionId: string;
  answerText?: string | null;
  optionId?: string | null;
  isCorrect?: boolean | null;
};

export type SubmissionStatus = "PENDING" | "GRADED" | "SUBMITTED";

export type Submission = {
  id: string;
  assignmentId: string;
  assignment?: Assignment;
  userId: string;
  user?: User;
  content?: string | null;
  status: SubmissionStatus;
  score?: number | null;
  teacherComment?: string | null;
  attemptNumber: number;
  answers?: SubmissionAnswer[];
  createdAt: string;
  updatedAt: string;
};

export type FavoriteLesson = {
  id: string;
  userId: string;
  lessonId: string;
  lesson: Lesson;
  createdAt: string;
};

export type Blog = {
  id: string;
  title: string;
  excerpt?: string | null;
  content: string;
  imageUrl?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Banner = {
  id: string;
  title: string;
  subtitle?: string | null;
  imageUrl: string;
  linkUrl?: string | null;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export interface StudentRFM {
  id: string;
  fullName: string;
  email: string;
  rScore: number;
  fScore: number;
  mScore: number;
  segment: string;
  avgGrade: number;
  totalSubmissions: number;
  daysSinceLastSubmission: number;
}

export interface StudentSegmentationResponse {
  segmentSummary: Array<{
    segment: string;
    count: number;
    percentage: number;
    avgGrade: number;
    totalRevenue?: number; // Keep for compatibility or remove
  }>;
  students: Paginated<StudentRFM>;
  customers: Paginated<StudentRFM>; // For compatibility during migration
}

export type CustomerSegmentationResponse = StudentSegmentationResponse;
export type CustomerRFM = StudentRFM;
export type SegmentSummary = any;


export type Paginated<T> = {
  data: T[];
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
  }
}

export const tokenStore = {
  get() {
    if (typeof window === "undefined") {
      return null;
    }

    return window.localStorage.getItem("auth_token");
  },

  set(token: string) {
    window.localStorage.setItem("auth_token", token);
  },

  clear() {
    window.localStorage.removeItem("auth_token");
  }
};

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

async function apiRequest<T>(path: string, options: RequestOptions = {}) {
  const headers = new Headers(options.headers);
  const token = tokenStore.get();

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let body: BodyInit | undefined;

  if (options.body !== undefined) {
    headers.set("Content-Type", "application/json");
    body = JSON.stringify(options.body);
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
      body
    });
  } catch {
    throw new ApiError(
      `Cannot connect to API server at ${API_BASE_URL}. Please start the backend.`,
      0
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const data = await response.json().catch(async () => {
    const text = await response.text().catch(() => null);
    return text ? { message: text } : null;
  });

  if (!response.ok) {
    if (response.status === 401) {
      tokenStore.clear();
      if (typeof window !== 'undefined') {
         window.dispatchEvent(new Event('auth-unauthorized'));
      }
    }
    throw new ApiError(data?.message || `Request failed with status ${response.status}`, response.status);
  }

  return data as T;
}

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

export const api = {
  login(body: { email: string; password: string }) {
    return apiRequest<{ user: User; token: string }>("/auth/login", {
      method: "POST",
      body
    });
  },

  register(body: {
    email: string;
    password: string;
    fullName?: string;
    phone?: string;
  }) {
    return apiRequest<{ user: User; token: string }>("/auth/register", {
      method: "POST",
      body
    });
  },

  registerWithGoogle(body: { googleToken: string }) {
    return apiRequest<{ user: User; token: string }>("/auth/register/google", {
      method: "POST",
      body
    });
  },

  forgotPassword(email: string) {
    return apiRequest("/auth/forgot-password", {
      method: "POST",
      body: { email }
    });
  },

  resetPassword(body: any) {
    return apiRequest("/auth/reset-password", {
      method: "POST",
      body
    });
  },

  getCategories() {
    return apiRequest<Category[]>("/api/categories");
  },

  createCategory(body: any) {
    return apiRequest<Category>("/api/categories", {
      method: "POST",
      body
    });
  },

  updateCategory(id: string, body: any) {
    return apiRequest<Category>(`/api/categories/${id}`, {
      method: "PUT",
      body
    });
  },

  deleteCategory(id: string) {
    return apiRequest(`/api/categories/${id}`, {
      method: "DELETE"
    });
  },

  getLessons(params: Record<string, string | number | boolean | undefined> = {}) {
    return apiRequest<Paginated<Lesson>>(`/api/lessons${toQueryString(params)}`);
  },

  getLesson(id: string) {
    return apiRequest<Lesson>(`/api/lessons/${id}`);
  },

  createLesson(body: any) {
    return apiRequest<Lesson>("/api/lessons", {
      method: "POST",
      body
    });
  },

  updateLesson(id: string, body: any) {
    return apiRequest<Lesson>(`/api/lessons/${id}`, {
      method: "PUT",
      body
    });
  },

  deleteLesson(id: string) {
    return apiRequest(`/api/lessons/${id}`, {
      method: "DELETE"
    });
  },

  // Courses
  getCourses() {
    return apiRequest<Course[]>("/api/courses");
  },

  getCourse(idOrSlug: string) {
    return apiRequest<Course>(`/api/courses/${idOrSlug}`);
  },

  getMyCourses() {
    return apiRequest<Course[]>("/api/user/courses");
  },

  getCourseAssignments(courseId: string) {
    return apiRequest<Assignment[]>(`/api/courses/${courseId}/assignments`);
  },

  enrollInCourse(courseId: string) {
    return apiRequest(`/api/courses/${courseId}/enroll`, {
      method: "POST",
      body: {}
    });
  },

  // Admin Courses
  getAdminCourses() {
    return apiRequest<Course[]>("/api/admin/courses");
  },

  getAdminCourse(id: string) {
    return apiRequest<Course>(`/api/admin/courses/${id}`);
  },

  createAdminCourse(body: any) {
    return apiRequest<Course>("/api/admin/courses", {
      method: "POST",
      body
    });
  },

  updateAdminCourse(id: string, body: any) {
    return apiRequest<Course>(`/api/admin/courses/${id}`, {
      method: "PUT",
      body
    });
  },

  deleteAdminCourse(id: string) {
    return apiRequest(`/api/admin/courses/${id}`, {
      method: "DELETE"
    });
  },

  getAdminCourseAssignments(courseId: string) {
    return apiRequest<Assignment[]>(`/api/admin/courses/${courseId}/assignments`);
  },

  getAdminEnrollments() {
    return apiRequest<any[]>("/api/admin/enrollments");
  },

  updateEnrollmentStatus(id: string, status: string) {
    return apiRequest(`/api/admin/enrollments/${id}`, {
      method: "PUT",
      body: { status }
    });
  },

  createAdminCourseAssignment(courseId: string, body: any) {
    return apiRequest<Assignment>(`/api/admin/courses/${courseId}/assignments`, {
      method: "POST",
      body
    });
  },

  // Assignments
  getAssignments() {
    return apiRequest<Assignment[]>("/api/assignments");
  },

  getAdminLessonAssignments(lessonId: string) {
    return apiRequest<Assignment[]>(`/api/admin/lessons/${lessonId}/assignments`);
  },

  createAdminAssignment(lessonId: string, body: any) {
    return apiRequest<Assignment>(`/api/admin/lessons/${lessonId}/assignments`, {
      method: "POST",
      body
    });
  },

  deleteAdminAssignment(id: string) {
    return apiRequest(`/api/admin/assignments/${id}`, {
      method: "DELETE"
    });
  },

  getMySubmissions() {
    return apiRequest<Submission[]>("/api/user/submissions");
  },

  submitAssignment(assignmentId: string, content?: string, answers?: any[]) {
    return apiRequest<Submission>("/api/user/submissions", {
      method: "POST",
      body: { assignmentId, content, answers }
    });
  },

  getFavoriteLessons() {
    return apiRequest<FavoriteLesson[]>("/api/user/favorite-lessons");
  },

  removeFromFavoriteLessons(lessonId: string) {
    return apiRequest(`/api/user/favorite-lessons/${lessonId}`, {
      method: "DELETE"
    });
  },

  getBlogs(params: Record<string, string | number | boolean | undefined> = {}) {
    return apiRequest<Paginated<Blog>>(`/api/blogs${toQueryString(params)}`);
  },

  getBlog(id: string) {
    return apiRequest<Blog>(`/api/blogs/${id}`);
  },

  createBlog(body: any) {
    return apiRequest<Blog>("/api/blogs", {
      method: "POST",
      body
    });
  },

  updateBlog(id: string, body: any) {
    return apiRequest<Blog>(`/api/blogs/${id}`, {
      method: "PUT",
      body
    });
  },

  deleteBlog(id: string) {
    return apiRequest(`/api/blogs/${id}`, {
      method: "DELETE"
    });
  },

  getBanners() {
    return apiRequest<Banner[]>("/api/banners");
  },

  getAdminBanners() {
    return apiRequest<Banner[]>("/api/banners/admin-all");
  },

  createBanner(body: any) {
    return apiRequest<Banner>("/api/banners", {
      method: "POST",
      body
    });
  },

  updateBanner(id: string, body: any) {
    return apiRequest<Banner>(`/api/banners/${id}`, {
      method: "PUT",
      body
    });
  },

  deleteBanner(id: string) {
    return apiRequest(`/api/banners/${id}`, {
      method: "DELETE"
    });
  },

  getAdminDashboard() {
    return apiRequest<any>("/api/admin/dashboard");
  },

  getAdminSubmissions(params: Record<string, string | number | undefined> = {}) {
    return apiRequest<Paginated<Submission>>(`/api/admin/submissions${toQueryString(params)}`);
  },

  gradeSubmission(submissionId: string, score: number, teacherComment: string) {
    return apiRequest<Submission>(`/api/admin/submissions/${submissionId}`, {
      method: "PUT",
      body: { score, teacherComment }
    });
  },

  getStudentClassification() {
    return apiRequest<any>("/api/admin/analytics/students");
  },

  getCustomerSegmentation(params: Record<string, string | number | undefined> = {}) {
    return apiRequest<StudentSegmentationResponse>(`/api/admin/analytics/students${toQueryString(params)}`);
  },

  getProfile() {
    return apiRequest<User>("/api/user/profile");
  },

  updateProfile(body: any) {
    return apiRequest<User>("/api/user/profile", {
      method: "PUT",
      body
    });
  },

  changePassword(body: any) {
    return apiRequest("/api/user/change-password", {
      method: "PUT",
      body
    });
  }
};

export const formatPrice = (value: string | number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0
  }).format(Number(value));
