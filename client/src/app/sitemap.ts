import { MetadataRoute } from 'next';
import { serverApi } from '@/lib/api-server';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://gatauvanhoc.online';

  // 1. Fetch data for dynamic routes
  let courses: any[] = [];
  let lessons: any[] = [];
  let blogs: any[] = [];

  try {
    const [coursesRes, lessonsRes, blogsRes] = await Promise.all([
      serverApi.getCourses(),
      serverApi.getLessons({ limit: 100 }), // Get up to 100 lessons
      serverApi.getBlogs({ limit: 100 }), // Get up to 100 blogs
    ]);
    courses = coursesRes || [];
    lessons = lessonsRes?.data || [];
    blogs = blogsRes?.data || [];
  } catch (error) {
    console.error('Failed to fetch sitemap data:', error);
  }

  // 2. Static routes
  const staticRoutes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/courses`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/lessons`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blogs`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
  ];

  // 3. Map dynamic routes
  const courseRoutes = courses.map((course) => ({
    url: `${baseUrl}/courses/${course.slug}`,
    lastModified: new Date(course.updatedAt || course.createdAt || new Date()),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  const lessonRoutes = lessons.map((lesson) => ({
    url: `${baseUrl}/lessons/${lesson.id}`,
    lastModified: new Date(lesson.updatedAt || lesson.createdAt || new Date()),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  const blogRoutes = blogs.map((blog) => ({
    url: `${baseUrl}/blogs/${blog.id}`,
    lastModified: new Date(blog.updatedAt || blog.createdAt || new Date()),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...courseRoutes, ...lessonRoutes, ...blogRoutes];
}
