import { useQuery } from 'react-query';
import { getActiveContractedInstitutions } from '../services/contractedInstitutionService';

export function useContractedInstitutions() {
  return useQuery(['contracted-institutions', 'active'], getActiveContractedInstitutions, {
    staleTime: 1000 * 60 * 2,
  });
}
