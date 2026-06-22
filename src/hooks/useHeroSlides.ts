import { useQuery } from 'react-query';
import { getHeroSlides } from '../services/heroSlideService';

export function useHeroSlides() {
  return useQuery({
    queryKey: ['heroSlides'],
    queryFn: getHeroSlides,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
