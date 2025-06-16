import { useQuery, useMutation, useQueryClient } from 'react-query';
import { getHealthArticles, getHealthArticlesByCategory, getHealthArticlesByType, getHealthArticleBySlug, createHealthArticle, updateHealthArticle, deleteHealthArticle } from '../services';
import { HealthArticle } from '../lib/supabase';
import { CACHE_KEYS } from '../services';

export function useHealthArticles() {
  return useQuery(CACHE_KEYS.HEALTH_ARTICLES, getHealthArticles);
}

export function useHealthArticlesByCategory(category: string) {
  return useQuery(
    ['health-articles', 'category', category], 
    () => getHealthArticlesByCategory(category),
    {
      enabled: !!category,
    }
  );
}

export function useHealthArticlesByType(type: string) {
  return useQuery(
    ['health-articles', 'type', type], 
    () => getHealthArticlesByType(type),
    {
      enabled: !!type,
    }
  );
}

export function useHealthArticleDetail(slug: string) {
  return useQuery(
    CACHE_KEYS.HEALTH_ARTICLE_DETAIL(slug), 
    () => getHealthArticleBySlug(slug),
    {
      enabled: !!slug,
    }
  );
}

export function useCreateHealthArticle() {
  const queryClient = useQueryClient();
  
  return useMutation(
    (article: Omit<HealthArticle, 'id' | 'created_at'>) => createHealthArticle(article),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(CACHE_KEYS.HEALTH_ARTICLES);
      },
    }
  );
}

export function useUpdateHealthArticle() {
  const queryClient = useQueryClient();
  
  return useMutation(
    ({ id, updates }: { id: number; updates: Partial<HealthArticle> }) => updateHealthArticle(id, updates),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(CACHE_KEYS.HEALTH_ARTICLES);
        
        // If we have the slug, invalidate the detail query as well
        if (variables.updates.slug) {
          queryClient.invalidateQueries(CACHE_KEYS.HEALTH_ARTICLE_DETAIL(variables.updates.slug));
        }
      },
    }
  );
}

export function useDeleteHealthArticle() {
  const queryClient = useQueryClient();
  
  return useMutation(
    (id: number) => deleteHealthArticle(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(CACHE_KEYS.HEALTH_ARTICLES);
      },
    }
  );
}
