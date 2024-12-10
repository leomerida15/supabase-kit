import { PostgrestError, SupabaseClient } from '@supabase/supabase-js';
import { useInfiniteQuery, useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import { useMemo } from 'react';
import { GetSupaQueryName } from '../utils/getName';
import { QueryBuilder } from './build';
import { DatabaseTemp, SupabaseQueryResult } from './types';
import { SupabaseInfoniteQueryConfig } from './types.infonite';
import { SupabaseQueryConfig } from './types.query';

// Sobrecargas de la función useSupaQuery
export const createSupabaseQuery = <D extends DatabaseTemp>(client: SupabaseClient<D>) => {
    function useSupaQuery<T extends keyof D['public']['Tables'] & string>(
        config: SupabaseQueryConfig<D> & { table: T; single: true },
    ): UseQueryResult<SupabaseQueryResult<D['public']['Tables'][T]['Row']>, PostgrestError>;

    function useSupaQuery<T extends keyof D['public']['Tables'] & string>(
        config: SupabaseQueryConfig<D> & { table: T; single?: false },
    ): UseQueryResult<SupabaseQueryResult<D['public']['Tables'][T]['Row'][]>, PostgrestError>;

    function useSupaQuery<T extends keyof D['public']['Tables'] & string>({
        table,
        column = '*',
        count,
        options = {},
        single,
        enabled,
        ...configObj
    }: SupabaseQueryConfig<D> & { table: T }) {
        type V = typeof single extends true
            ? D['public']['Tables'][T]['Row']
            : D['public']['Tables'][T]['Row'][];

        const fetchData = async (signal: AbortSignal): Promise<SupabaseQueryResult<V>> => {
            const QueryBase = client.from(table).select(column, { count });

            const QueryFn = QueryBuilder<D>(configObj, QueryBase);

            const { data, error, count: rowCount } = await QueryFn.abortSignal(signal);

            if (error) throw error;

            return {
                count: rowCount ?? 0,
                payload: single ? ((data ?? {}) as V) : ((data ?? []) as V),
            };
        };

        const initialData = useMemo(() => {
            if (single) return { payload: {} as V, count: 0 } as SupabaseQueryResult<V>;
            return { payload: [] as V, count: 0 } as SupabaseQueryResult<V>;
        }, [single]);

        const { queryKey = [], ...optionsHooks } = options;

        const initQueryKey = GetSupaQueryName<D>({ table, queryKey });

        return useQuery<SupabaseQueryResult<V>, PostgrestError>({
            queryKey: [initQueryKey, configObj.where, configObj.limit, single, count],
            initialData,
            queryFn: ({ signal }) => fetchData(signal),
            enabled,
            ...(optionsHooks as Omit<
                UseQueryOptions<SupabaseQueryResult<V>, PostgrestError>,
                'queryKey' | 'queryFn'
            >),
        });
    }

    /**
     * React Query hook for fetching data from a Supabase table with infinite scroll.
     *
     * @param {string} table - The table to fetch data from.
     * @param {string} [column='*'] - The column(s) to fetch. Defaults to '*'.
     * @param {Object} [options={}] - Options for the hook. See {@link https://react-query.tanstack.com/docs/api#useinfinitequery}
     * @param {boolean} [enabled=true] - Whether the hook is enabled.
     * @param {'exact'|'planned'|'estimated'} [count='exact'] - The type of count to fetch. See {@link https://supabase.io/docs/reference/postgrest/count}
     * @param {Object} [configObj={}] - Additional configuration options for the query. See {@link https://supabase.io/docs/reference/postgrest/filters}
     * @returns {UseInfiniteQueryResult<SupabaseQueryResult<V>, PostgrestError>} - The result of the query.
     */
    const useSupaInfiniteQuery = <T extends keyof D['public']['Tables'] & string>({
        table,
        column = '*',
        options,
        enabled,
        count = 'exact',
        ...configObj
    }: SupabaseInfoniteQueryConfig<D> & { table: T }) => {
        type V = D['public']['Tables'][T]['Row'][];

        const fetchData = async (signal: AbortSignal): Promise<SupabaseQueryResult<V>> => {
            const QueryBase = client.from(table).select(column, { count });

            const QueryFn = QueryBuilder<D>(configObj as any, QueryBase);

            const { data, error, count: rowCount } = await QueryFn.abortSignal(signal);

            if (error) throw error;

            return {
                count: rowCount ?? 0,
                payload: data ?? [],
            };
        };

        const { initialData: InitProp, queryKey = [], ...optionsHook } = options;

        const initQueryKey = GetSupaQueryName<D>({ table, queryKey: ['infinite', ...queryKey] });

        return useInfiniteQuery<SupabaseQueryResult<V>, PostgrestError>({
            queryKey: [initQueryKey, configObj.where, configObj.limit],
            queryFn: ({ signal }) => fetchData(signal),
            enabled,
            ...(optionsHook as any),
        });
    };

    return {
        useSupaInfiniteQuery,
        useSupaQuery,
        QueryBuilder,
    };
};
