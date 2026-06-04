import { Axios } from '@/lib/api';
import type { ListingPagination } from '@/lib/api';

export type BlogAuthor = {
  name?: string;
  name_ar?: string;
  email?: string;
  avatar?: string;
};

// Mirrors aqaarGateBE2 blog.model.js. Bilingual fields fall back EN<->AR.
export type Blog = {
  _id: string;
  title?: string;
  title_ar?: string;
  slug?: string;
  slug_ar?: string;
  excerpt?: string;
  excerpt_ar?: string;
  content?: string; // HTML/Markdown (only present on the single-blog endpoint)
  content_ar?: string;
  imageSrc?: string;
  tags?: string[];
  tags_ar?: string[];
  categories?: string[];
  categories_ar?: string[];
  author?: BlogAuthor;
  featured?: boolean;
  viewCount?: number;
  publishedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type BlogListParams = {
  page?: number;
  limit?: number;
  search?: string;
  featured?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

export type BlogListResult = {
  data: Blog[];
  pagination: ListingPagination;
};

export const blogAPI = {
  // GET /api/blog — published blogs, paginated (content excluded server-side).
  list: async (params: BlogListParams = {}): Promise<BlogListResult> => {
    const { data } = await Axios.get('/blog', { params });
    const blogs: Blog[] = Array.isArray(data)
      ? data
      : Array.isArray(data?.data)
        ? data.data
        : [];
    const limit = Number(params.limit ?? 10);
    const page = Number(params.page ?? 1);
    const total = Number(data?.pagination?.total ?? blogs.length);
    const totalPages = Number(
      data?.pagination?.totalPages ?? Math.max(1, Math.ceil(total / limit))
    );
    return {
      data: blogs,
      pagination: {
        page: Number(data?.pagination?.page ?? page),
        limit: Number(data?.pagination?.limit ?? limit),
        total,
        totalPages,
        hasNextPage: data?.pagination?.hasNextPage ?? page < totalPages,
        hasPrevPage: data?.pagination?.hasPrevPage ?? page > 1,
      },
    };
  },

  // GET /api/blog/:id — accepts a Mongo id, English slug, or Arabic slug.
  getById: async (idOrSlug: string): Promise<Blog> => {
    const { data } = await Axios.get(`/blog/${idOrSlug}`);
    return (data?.data ?? data) as Blog;
  },
};

/** Locale-aware blog field with EN<->AR fallback (matches the web policy). */
export function localizeBlogText(
  blog: Blog | undefined,
  field: 'title' | 'excerpt' | 'content',
  isAr: boolean
): string {
  if (!blog) return '';
  const ar = blog[`${field}_ar` as keyof Blog] as string | undefined;
  const en = blog[field] as string | undefined;
  if (isAr) return (ar && ar.trim()) || en || '';
  return (en && en.trim()) || ar || '';
}

/** Locale-aware tag/category labels with EN<->AR fallback. */
export function localizeBlogTags(blog: Blog | undefined, isAr: boolean): string[] {
  if (!blog) return [];
  const ar = blog.tags_ar?.length ? blog.tags_ar : undefined;
  const en = blog.tags?.length ? blog.tags : undefined;
  return (isAr ? ar ?? en : en ?? ar) ?? [];
}

/** Locale-aware slug for navigation; falls back to the Mongo id. */
export function blogRouteId(blog: Blog, isAr: boolean): string {
  if (isAr) return blog.slug_ar || blog.slug || blog._id;
  return blog.slug || blog.slug_ar || blog._id;
}
