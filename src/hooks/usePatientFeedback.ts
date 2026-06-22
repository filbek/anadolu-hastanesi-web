import { useQuery } from 'react-query';
import { getPatientFeedback } from '../services/patientFeedbackService';

export function usePatientFeedback() {
  return useQuery({
    queryKey: ['patientFeedback'],
    queryFn: getPatientFeedback,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: true,
  });
}
