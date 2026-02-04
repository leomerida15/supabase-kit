import { PostgrestError } from '@supabase/supabase-js';
import { UseQueryOptions } from '@tanstack/react-query';
import {
    baseRangeWhere,
    DatabaseTemp,
    orderWhere,
    SupabaseQueryResult,
    TableRow,
    ViewRow,
    Where,
} from './types';

/**
 * Configuration options for the `useSupaQuery` hook.
 *
 * @template D - The database schema type.
 * @template SchemaKey - The key of the schema to query. Defaults to `'public'`.
 * @template K - The key of the table to query within the selected schema. Defaults to `keyof (D[SchemaKey]['Tables'] & D[SchemaKey]['Views'])`.
 * @template S - Whether to return a single row or an array of rows. Defaults to `false`.
 * @template V - The type of the value to filter by. Defaults to `keyof R` where `R` is the type of the row returned by the table.
 */
export interface SupabaseQueryConfig<
    D extends DatabaseTemp,
    SchemaKey extends keyof D = 'public',
    K extends keyof D[SchemaKey]['Tables'] | keyof D[SchemaKey]['Views'] =
        | keyof D[SchemaKey]['Tables']
        | keyof D[SchemaKey]['Views'],
    S extends boolean = false | true,
    V = S extends true
        ? TableRow<D[SchemaKey], K> & ViewRow<D[SchemaKey], K>
        : Array<TableRow<D[SchemaKey], K> & ViewRow<D[SchemaKey], K>>,
> {
    /**
     * The schema to query. Defaults to 'public'.
     */
    schema?: SchemaKey;

    /**
     * The table to query within the specified schema.
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
        analyze?: boolean;
        verbose?: boolean;
        settings?: boolean;
        buffers?: boolean;
        wal?: boolean;
        format?: 'json' | 'text';
    };

    /**
     * Additional options for the hook.
     */
    options?: Omit<
        UseQueryOptions<SupabaseQueryResult<V>, PostgrestError>,
        'queryKey' | 'queryFn'
    > & {
        queryKey?: string[];
    };
}
