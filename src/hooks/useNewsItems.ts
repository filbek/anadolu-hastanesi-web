import { useQuery } from 'react-query';
import { getNewsItems, getNewsItemBySlug } from '../services/newsService';

export function useNewsItems() {
  return useQuery({
    queryKey: ['newsItems'],
    queryFn: getNewsItems,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useNewsItemBySlug(slug: string) {
  return useQuery({
    queryKey: ['newsItem', slug],
    queryFn: () => getNewsItemBySlug(slug),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: !!slug,
  });
}
