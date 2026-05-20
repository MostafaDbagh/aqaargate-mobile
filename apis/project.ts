import { Axios } from '@/lib/api';

export type ProjectImage = {
  publicId?: string;
  url: string;
  filename?: string;
  uploadedAt?: string;
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
  unitTypes?: ProjectUnitType[];
  coverImage?: string;
  gallery?: ProjectImage[];
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
};
