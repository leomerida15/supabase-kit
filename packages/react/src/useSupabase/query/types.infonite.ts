import { PostgrestError, SupabaseClient } from '@supabase/supabase-js';
import { useInfiniteQuery } from '@tanstack/react-query';
import { DatabaseTemp, SupabaseQueryResult, Where } from './types';

// Configuración del hook
export interface SupabaseInfoniteQueryConfig<
    D extends DatabaseTemp,
    K extends keyof (D['public']['Tables'] & D['public']['Views']) = keyof (D['public']['Tables'] &
        D['public']['Views']) &
        Parameters<SupabaseClient<D>['from']>['0'],
    V = (D['public']['Tables'] & D['public']['Views'])[K]['Row'][],
> {
    table: K;
    column?: string;
    where?: Where<V>;
    options: Omit<
        Parameters<typeof useInfiniteQuery<SupabaseQueryResult<V>, PostgrestError>>[0],
        'queryKey' | 'queryFn'
    > & {
        /**
         * The key to use for the query. Defaults to `[table, column, where, order, range, csv, explain]`.
         */
        queryKey?: string[];
    };
    limit?: number;
    count?: 'exact' | 'planned' | 'estimated';
    enabled?: boolean;
}

// Resultado del query
