import { Axios } from '@/lib/api';

export type Category = {
  name: string;
  displayName: string;
  count: number;
  slug: string;
  nameOriginal?: string;
};

type CategoriesResponse = {
  success: boolean;
  data: { categories: Category[]; total?: number };
};

export const categoryAPI = {
  getCategoryStats: async (): Promise<Category[]> => {
    const { data } = await Axios.get<CategoriesResponse>('/categories');
    return data?.data?.categories ?? [];
  },
};
