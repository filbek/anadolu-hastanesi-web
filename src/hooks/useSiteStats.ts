import { useQuery } from 'react-query';
import { getSiteStats } from '../services/siteStatService';

export function useSiteStats() {
  return useQuery({
    queryKey: ['siteStats'],
    queryFn: getSiteStats,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
