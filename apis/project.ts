import { Axios } from '@/lib/api';
import type { Listing } from '@/lib/api';

export type ProjectImage = {
  publicId?: string;
  url: string;
  filename?: string;
  uploadedAt?: string;
};

export type ProjectTimelineUpdate = {
  _id?: string;
  date?: string;
  title?: string;
  title_ar?: string;
  description?: string;
  description_ar?: string;
  images?: ProjectImage[];
  progressPercentage?: number;
};

export type ProjectDeveloper = {
  name?: string;
  name_ar?: string;
  logo?: string;
  description?: string;
  description_ar?: string;
  website?: string;
};

export type ProjectUnitType = {
  _id?: string;
  name?: string;
  name_ar?: string;
  bedrooms?: number;
  bathrooms?: number;
  sizeFrom?: number;
  sizeTo?: number;
  sizeUnit?: 'sqm' | 'sqft';
  priceFrom?: number;
  priceTo?: number;
  totalUnits?: number;
  availableUnits?: number;
  floorPlan?: string;
};

export type ProjectAmenity = {
  _id?: string;
  key?: string;
  label?: string;
  label_ar?: string;
};

export type ProjectPaymentMilestone = {
  _id?: string;
  percentage?: number;
  label?: string;
  label_ar?: string;
  dueAt?: string;
  dueAt_ar?: string;
};

export type ProjectPaymentPlan = {
  _id?: string;
  name?: string;
  name_ar?: string;
  milestones?: ProjectPaymentMilestone[];
};

export type ProjectNearbyPlace = {
  _id?: string;
  category?: string;
  name?: string;
  name_ar?: string;
  distance?: number;
  distanceUnit?: string;
};

export type Project = {
  _id: string;
  slug?: string;
  slug_ar?: string;
  name: string;
  name_ar?: string;
  description?: string;
  description_ar?: string;
  shortDescription?: string;
  shortDescription_ar?: string;
  status: 'off-plan' | 'ready';
  projectType?: 'residential' | 'commercial' | 'mixed-use';
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  isFeatured?: boolean;
  developer?: ProjectDeveloper;
  country?: string;
  city?: string;
  neighborhood?: string;
  neighborhood_ar?: string;
  address?: string;
  address_ar?: string;
  coordinates?: { lat?: number; lng?: number };
  startingPrice?: number;
  endingPrice?: number;
  currency?: 'USD' | 'SYP' | 'TRY' | 'EUR';
  launchDate?: string;
  handoverDate?: string;
  completionDate?: string;
  overallProgress?: number;
  totalUnits?: number;
  availableUnits?: number;
  isAvailable?: boolean;
  unitTypes?: ProjectUnitType[];
  paymentPlans?: ProjectPaymentPlan[];
  constructionTimeline?: ProjectTimelineUpdate[];
  amenities?: ProjectAmenity[];
  nearbyPlaces?: ProjectNearbyPlace[];
  coverImage?: string;
  gallery?: ProjectImage[];
  masterPlan?: string;
  brochure?: string;
  videoUrl?: string;
  contactPhone?: string;
  contactEmail?: string;
  contactWhatsapp?: string;
  viewCount?: number;
  createdAt?: string;
};

export type ProjectsPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

export type ProjectsListResponse = {
  success?: boolean;
  data: Project[];
  pagination: ProjectsPagination;
};

export type ProjectsQuery = {
  page?: number;
  limit?: number;
  status?: 'off-plan' | 'ready';
  city?: string;
  developer?: string;
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

export const projectAPI = {
  getProjects: async (params: ProjectsQuery = {}): Promise<ProjectsListResponse> => {
    const { data } = await Axios.get<ProjectsListResponse>('/projects', { params });
    return data;
  },

  getProjectBySlugOrId: async (identifier: string): Promise<Project | null> => {
    const { data } = await Axios.get(`/projects/slug/${encodeURIComponent(identifier)}`);
    return (data?.data ?? data) as Project | null;
  },

  // Real estate listings linked to this project (approved, unsold units).
  // Requires the project's Mongo _id, not its slug.
  getProjectListings: async (
    projectId: string,
    params: { page?: number; limit?: number } = {}
  ): Promise<Listing[]> => {
    const { data } = await Axios.get(`/projects/${projectId}/listings`, { params });
    if (Array.isArray(data)) return data as Listing[];
    return (data?.data ?? []) as Listing[];
  },
};
