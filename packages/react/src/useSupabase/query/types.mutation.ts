import { PostgrestError, SupabaseClient } from '@supabase/supabase-js';
import { useInfiniteQuery } from '@tanstack/react-query';
import { DatabaseTemp, SupabaseQueryResult, Where } from './types';

// Configuración del hook
export interface SupabaseMutationConfig<
    D extends DatabaseTemp,
    K extends keyof (D['public']['Tables'] & D['public']['Views']) = keyof (D['public']['Tables'] &
        D['public']['Views']) &
        Parameters<SupabaseClient<D>['from']>['0'],
    V = (D['public']['Tables'] & D['public']['Views'])[K] extends {
        Row: infer R;
    }
        ? R[]
        : never[],
> {
    table: K;
    column?: string;
    where?: Where<V>;
    options: Omit<
        Parameters<typeof useInfiniteQuery<SupabaseQueryResult<V>, PostgrestError>>[0],
        'queryKey' | 'queryFn'
    >;
    limit?: number;
    count?: 'exact' | 'planned' | 'estimated';
    enabled?: boolean;
}
