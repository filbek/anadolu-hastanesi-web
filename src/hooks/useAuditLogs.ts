import { useQuery } from 'react-query';
import { getAuditLogs } from '../services/auditLogService';

export function useAuditLogs(limit: number = 50) {
  return useQuery({
    queryKey: ['auditLogs', limit],
    queryFn: () => getAuditLogs(limit),
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
  });
}
