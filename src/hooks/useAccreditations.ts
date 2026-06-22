import { useQuery } from 'react-query';
import { getAccreditations } from '../services/accreditationService';

export function useAccreditations() {
  return useQuery({
    queryKey: ['accreditations'],
    queryFn: getAccreditations,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
