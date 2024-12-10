import { PostgrestError } from '@supabase/supabase-js';
import { UseQueryOptions } from '@tanstack/react-query';
import { baseRangeWhere, DatabaseTemp, orderWhere, SupabaseQueryResult, Where } from './types';

/**
 * Configuration options for the `useSupaQuery` hook.
 *
 * @template D - The database schema type.
 * @template K - The key of the table to query. Defaults to `keyof (D['public']['Tables'] &
 *     D['public']['Views'])`.
 * @template S - Whether to return a single row or an array of rows. Defaults to `false`.
 * @template V - The type of the value to filter by. Defaults to `keyof R` where `R` is the type of the
 *     row returned by the table.
 */
export interface SupabaseQueryConfig<
    D extends DatabaseTemp,
    K extends keyof D['public']['Tables'] = keyof D['public']['Tables'],
    S extends boolean = false | true,
    V = S extends true
        ? (D['public']['Tables'] & D['public']['Views'])[K]['Row']
        : Array<(D['public']['Tables'] & D['public']['Views'])[K]['Row']>,
> {
    /**
     * The table to query.
     */
    table: K;

    /**
     * The column(s) to select from the table. Defaults to '*'.
     */
    column?: string;

    /**
     * The filter to apply to the query.
     */
    where?: Where<V>;

    /**
     * Whether to return a single row or an array of rows. Defaults to `false`.
     */
    single?: S;

    /**
     * Whether to return a single row or an array of rows. Defaults to `false`.
     */
    maybeSingle?: S;

    /**
     * The number of rows to return. Defaults to `undefined`.
     */
    limit?: number;

    /**
     * The type of count to fetch. Defaults to `'exact'`.
     */
    count?: 'exact' | 'planned' | 'estimated';

    /**
     * Whether the hook is enabled. Defaults to `true`.
     */
    enabled?: boolean;

    /**
     * The order to apply to the query.
     */
    order?: orderWhere<V>;

    /**
     * The range to apply to the query.
     */
    range?: baseRangeWhere | baseRangeWhere[];

    /**
     * Whether to return the result as a CSV string. Defaults to `false`.
     */
    csv?: boolean;

    /**
     * Options for the `explain` method.
     */
    explain?: {
        /**
         * Whether to include the query plan in the result. Defaults to `false`.
         */
        analyze?: boolean;

        /**
         * Whether to include the query plan in the result in a verbose format. Defaults to `false`.
         */
        verbose?: boolean;

        /**
         * Whether to include the query plan in the result in a verbose format. Defaults to `false`.
         */
        settings?: boolean;

        /**
         * Whether to include the query plan in the result in a verbose format. Defaults to `false`.
         */
        buffers?: boolean;

        /**
         * Whether to include the query plan in the result in a verbose format. Defaults to `false`.
         */
        wal?: boolean;

        /**
         * The format of the query plan in the result. Defaults to `'json'`.
         */
        format?: 'json' | 'text';
    };

    /**
     * Additional options for the hook.
     * @param {UseQueryOptions<SupabaseQueryResult<V>, PostgrestError>}
     */
    options?: Omit<
        UseQueryOptions<SupabaseQueryResult<V>, PostgrestError>,
        'queryKey' | 'queryFn' | 'initialData'
    > & {
        /**
         * The key to use for the query. Defaults to `[table, column, where, order, range, csv, explain]`.
         */
        queryKey?: string[];
    };
}

export type V<
    D extends DatabaseTemp,
    Single extends boolean,
    Table extends keyof (D['public']['Tables'] & D['public']['Views']),
> = Single extends true
    ? (D['public']['Tables'] & D['public']['Views'])[Table]['Row']
    : Array<(D['public']['Tables'] & D['public']['Views'])[Table]['Row']>;
