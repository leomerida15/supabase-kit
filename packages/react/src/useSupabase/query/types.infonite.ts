import { PostgrestError } from '@supabase/supabase-js';
import { useInfiniteQuery } from '@tanstack/react-query';
import { DatabaseTemp, SupabaseQueryResult, TableRow, ViewRow, Where } from './types';

// Configuración del hook
export interface SupabaseInfoniteQueryConfig<
    D extends DatabaseTemp,
    SchemaKey extends keyof D = 'public',
    K extends keyof D[SchemaKey]['Tables'] | keyof D[SchemaKey]['Views'] =
        | keyof D[SchemaKey]['Tables']
        | keyof D[SchemaKey]['Views'],
    V = (TableRow<D[SchemaKey], K> & ViewRow<D[SchemaKey], K>)[],
> {
    table: K;
    /**
     * The schema to query. Defaults to 'public'.
     */
    schema?: SchemaKey;
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
    /**
     * When true, the select returns only the count (no rows). Useful for counting without loading data.
     */
    head?: boolean;
    enabled?: boolean;
}

// Resultado del query
