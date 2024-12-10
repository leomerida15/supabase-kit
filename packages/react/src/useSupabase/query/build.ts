import { PostgrestFilterBuilder } from '@supabase/postgrest-js';
import { GenericSchema } from '@supabase/supabase-js/dist/module/lib/types';
import {
    baseRangeWhere,
    DatabaseTemp,
    textSearchWhereConfig,
    Where,
    WhereBasicKeys,
} from './types';
import { SupabaseQueryConfig } from './types.query';

type ConfigObj<D extends DatabaseTemp> = Omit<SupabaseQueryConfig<D>, 'table' | 'column' | 'count'>;

const objMatchBuild = {
    match: (Query: PostgrestFilterBuilder<any, any, any>, match: Where<any>['match'] = {}) => {
        return Query.match(match as any);
    },
    or: (Query: PostgrestFilterBuilder<any, any, any>, ors: Where<any>['or'] = []) => {
        for (const or of ors) Query = Query.or(or);

        return Query;
    },

    filter: (Query: PostgrestFilterBuilder<any, any, any>, filter: Where<any>['filter'] = {}) => {
        for (const [k, v] of Object.entries<[any, any]>(filter)) {
            Query.filter(k, ...v);
        }
        return Query;
    },

    not: (
        Query: PostgrestFilterBuilder<any, any, any>,
        textSearch: Where<any>['textSearch'] = {},
    ) => {
        for (const k of Object.keys(textSearch)) {
            const { text, options }: textSearchWhereConfig =
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                textSearch[k as keyof typeof textSearch]!;
            Query = Query.textSearch(k, text, options);
        }
        return Query;
    },

    limit: (Query: PostgrestFilterBuilder<any, any, any>, limit: number) => {
        return Query.limit(limit);
    },

    single: (Query: PostgrestFilterBuilder<any, any, any>) => {
        return (Query = Query.single() as typeof Query);
    },

    maybeSingle: (Query: PostgrestFilterBuilder<any, any, any>) => {
        return Query.maybeSingle() as typeof Query;
    },

    csv: (Query: PostgrestFilterBuilder<any, any, any>) => {
        return Query.csv() as typeof Query;
    },

    explain: (
        Query: PostgrestFilterBuilder<any, any, any>,
        explain: {
            analyze?: boolean;
            verbose?: boolean;
            settings?: boolean;
            buffers?: boolean;
            wal?: boolean;
            format?: 'json' | 'text';
        } = {},
    ) => {
        return Query.explain(explain) as typeof Query;
    },

    order: (Query: PostgrestFilterBuilder<any, any, any>, order: Record<string, any>) => {
        for (const [k, v] of Object.entries<{
            ascending?: boolean;
            nullsFirst?: boolean;
            foreignTable?: string;
            referencedTable?: string;
        }>(order)) {
            Query = Query.order(k, v);
        }
        return Query;
    },

    range: (
        Query: PostgrestFilterBuilder<any, any, any>,
        ranges: baseRangeWhere | baseRangeWhere[],
    ) => {
        const onRange = (range: baseRangeWhere) => {
            return Query.range(range.from, range.to, range.options);
        };

        if (!Array.isArray(ranges)) return onRange(ranges);

        for (const range of ranges) Query = onRange(range);

        return Query;
    },
};

/**
 * Enhances a Supabase query with various filtering, ordering, and formatting options.
 *
 * @template D - The database schema type.
 * @template SchemaName - The schema name within the database.
 * @template Schema - The specific schema definition.
 *
 * @param {ConfigObj<D>} param0 - Configuration object containing filtering and other options.
 * @param {PostgrestFilterBuilder<Schema, any, any>} Query - The initial Postgrest query builder object.
 *
 * @returns {PostgrestFilterBuilder<Schema, any, any>} - The enhanced Postgrest query builder object with applied configurations.
 */
export const QueryBuilder = <
    D extends DatabaseTemp,
    SchemaName extends string & keyof D = 'public' extends keyof D ? 'public' : string & keyof D,
    Schema extends GenericSchema = D[SchemaName] extends GenericSchema ? D[SchemaName] : any,
>(
    { where = {}, ...options }: ConfigObj<D>,
    Query: PostgrestFilterBuilder<Schema, any, any>,
) => {
    const base = {
        ...where,
        ...options,
    };

    const where_keys: WhereBasicKeys[] = [
        'eq',
        'neq',
        'in',
        'is',
        'lt',
        'lte',
        'gt',
        'gte',
        'like',
        'ilike',
        'contains',
        'containedBy',
        'rangeGt',
        'rangeGte',
        'rangeLt',
        'rangeLte',
        'rangeAdjacent',
        'contains',
        'containedBy',
        'rangeGt',
        'rangeGte',
        'rangeLt',
        'rangeLte',
        'rangeAdjacent',
        'overlaps',
    ];

    for (const [kp, vQ] of Object.entries(base)) {
        const k = kp as keyof typeof base;

        const method = objMatchBuild[k as keyof typeof objMatchBuild];

        if (method) {
            Query = method(Query, vQ as any);

            continue;
        }

        if (!where_keys.includes(k as WhereBasicKeys)) continue;

        for (const [K, v] of Object.entries(vQ as Pick<Where<any>, WhereBasicKeys>)) {
            Query = (Query as any)[k](K, v);
        }
    }

    return Query;
};
