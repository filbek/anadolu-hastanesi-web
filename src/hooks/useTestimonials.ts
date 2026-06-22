import { useQuery } from 'react-query';
import { getTestimonials } from '../services/testimonialService';

export function useTestimonials() {
  return useQuery({
    queryKey: ['testimonials'],
    queryFn: getTestimonials,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
