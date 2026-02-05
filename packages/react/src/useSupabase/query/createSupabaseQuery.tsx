import { PostgrestError, SupabaseClient } from '@supabase/supabase-js';
import { GenericSchema } from '@supabase/supabase-js/dist/module/lib/types';
import { useInfiniteQuery, useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import { GetSupaQueryName } from '../utils/getName';
import { QueryBuilder } from './build';
import { DatabaseTemp, SupabaseQueryResult, TableRow, ViewRow } from './types';
import { SupabaseInfoniteQueryConfig } from './types.infonite';
import { SupabaseQueryConfig } from './types.query';

// Sobrecargas de la función useSupaQuery
export const createSupabaseQuery = <D extends DatabaseTemp,  SchemaName extends string & keyof D = 'public' extends keyof D
    ? 'public'
    : string & keyof D,
  Schema extends GenericSchema = D[SchemaName] extends GenericSchema
    ? D[SchemaName]
    : any>(client: SupabaseClient<D, SchemaName, Schema>) => {
    function useSupaQuery<
        T extends keyof D[S]['Tables'] | keyof D[S]['Views'],
        S extends keyof D = 'public',
    >(
        config: SupabaseQueryConfig<D, S> & { table: T; single: true },
    ): UseQueryResult<SupabaseQueryResult<TableRow<D[S], T>>, PostgrestError>;

    function useSupaQuery<
        T extends keyof D[S]['Tables'] | keyof D[S]['Views'],
        S extends keyof D = 'public',
    >(
        config: SupabaseQueryConfig<D, S> & { table: T; single?: false },
    ): UseQueryResult<SupabaseQueryResult<TableRow<D[S], T>[]>, PostgrestError>;

    function useSupaQuery<
        S extends keyof D, // S primero
        T extends keyof D[S]['Tables'] | keyof D[S]['Views'],
    >({
        table,
        schema = 'public' as S,
        column = '*',
        count,
        head,
        options = {},
        single,
        enabled,
        ...configObj
    }: SupabaseQueryConfig<D, S> & { table: T }) {
        type V = typeof single extends true
            ? TableRow<D[S], T> | ViewRow<D[S], T>
            : TableRow<D[S], T>[] | ViewRow<D[S], T>[];

        const fetchData = async (signal: AbortSignal): Promise<SupabaseQueryResult<V>> => {
            let localClient = !schema
                ? client
                : (client.schema(schema as string & S) as unknown as typeof client);
            const QueryBase = localClient.from(table as string).select(column, { count, head });

            const QueryFn = QueryBuilder<D, S>(configObj, QueryBase);

            const { data, error, count: rowCount } = await QueryFn.abortSignal(signal);

            if (error) throw error;

            const payload = head
                ? (single ? (null as V) : ([] as V))
                : single
                  ? ((data ?? {}) as V)
                  : ((data ?? []) as V);

            return {
                count: rowCount ?? 0,
                payload,
            };
        };

        const { queryKey = [], ...optionsHooks } = options;

        const initQueryKey = GetSupaQueryName<D>({ table, queryKey });

        return useQuery<SupabaseQueryResult<V>, PostgrestError>({
            queryKey: [
                initQueryKey,
                configObj.where,
                configObj.limit,
                single,
                count,
                head,
                table,
                column,
                count,
                options,
                single,
                enabled,
            ],
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
    const useSupaInfiniteQuery = <
        S extends keyof D, // S primero
        T extends keyof D[S]['Tables'] & keyof D[S]['Views'] & string,
    >({
        table,
        schema = 'public',
        column = '*',
        options,
        enabled,
        count = 'exact',
        head,
        ...configObj
    }: SupabaseInfoniteQueryConfig<D> & { table: T }) => {
        type V = TableRow<D[S], T>[];

        const fetchData = async (signal: AbortSignal): Promise<SupabaseQueryResult<V>> => {
            let localClient = !schema
                ? client
                : (client.schema(schema) as unknown as typeof client);
            const QueryBase = localClient.from(table as string).select(column, { count, head });
            const QueryFn = QueryBuilder<D, S>(configObj as any, QueryBase);

            const { data, error, count: rowCount } = await QueryFn.abortSignal(signal);

            if (error) throw error;

            return {
                count: rowCount ?? 0,
                payload: head ? [] : (data ?? []),
            };
        };

        const { initialData: InitProp, queryKey = [], ...optionsHook } = options;

        const initQueryKey = GetSupaQueryName<D>({ table, queryKey: ['infinite', ...queryKey] });

        return useInfiniteQuery<SupabaseQueryResult<V>, PostgrestError>({
            queryKey: [initQueryKey, configObj.where, configObj.limit, head],
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
