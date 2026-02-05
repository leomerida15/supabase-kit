import { PostgrestFilterBuilder } from '@supabase/postgrest-js';
import {
    baseRangeWhere,
    DatabaseTemp,
    textSearchWhereConfig,
    Where,
    WhereBasicKeys,
} from './types';
import { SupabaseQueryConfig } from './types.query';

type ConfigObj<D extends DatabaseTemp, S extends keyof D> = Omit<
    SupabaseQueryConfig<D, S>,
    'table' | 'column' | 'count'
>;

const objMatchBuild = {
    match: (Query: PostgrestFilterBuilder<any, any, any, any>, match: Where<any>['match'] = {}) => {
        return Query.match(match as any);
    },
    or: (Query: PostgrestFilterBuilder<any, any, any, any>, ors: Where<any>['or'] = []) => {
        for (const or of ors) Query = Query.or(or);

        return Query;
    },

    filter: (Query: PostgrestFilterBuilder<any, any, any, any>, filter: Where<any>['filter'] = {}) => {
        for (const [k, v] of Object.entries<[any, any]>(filter)) {
            Query = Query.filter(k, ...v);
        }
        return Query;
    },

    not: (Query: PostgrestFilterBuilder<any, any, any, any>, notFilter: Where<any>['not'] = {}) => {
        for (const [column, [operator, value]] of Object.entries(notFilter)) {
            Query = Query.not(column, operator, value);
        }
        return Query;
    },

    textSearch: (
        Query: PostgrestFilterBuilder<any, any, any, any>,
        textSearchConfig: Where<any>['textSearch'] = {},
    ) => {
        for (const k of Object.keys(textSearchConfig)) {
            const { text, options }: textSearchWhereConfig =
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                textSearchConfig[k as keyof typeof textSearchConfig]!;
            Query = Query.textSearch(k, text, options);
        }
        return Query;
    },

    limit: (Query: PostgrestFilterBuilder<any, any, any, any>, limit: number) => {
        return Query.limit(limit);
    },

    single: (Query: PostgrestFilterBuilder<any, any, any, any>) => {
        return (Query = Query.single() as typeof Query);
    },

    maybeSingle: (Query: PostgrestFilterBuilder<any, any, any, any>) => {
        return Query.maybeSingle() as typeof Query;
    },

    csv: (Query: PostgrestFilterBuilder<any, any, any, any>) => {
        return Query.csv() as typeof Query;
    },

    explain: (
        Query: PostgrestFilterBuilder<any, any, any, any>,
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

    order: (Query: PostgrestFilterBuilder<any, any, any, any>, order: Record<string, any>) => {
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
        Query: PostgrestFilterBuilder<any, any, any, any>,
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

const WHERE_KEYS = new Set<WhereBasicKeys>([
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
    'overlaps',
]);

/**
 * Enhances a Supabase query with various filtering, ordering, and formatting options.
 *
 * @template D - The database schema type.
 * @template S - The schema key within the database.
 *
 * @param {ConfigObj<D, S>} param0 - Configuration object containing filtering and other options.
 * @param {PostgrestFilterBuilder<any, any, any, any>} Query - The initial Postgrest query builder object.
 *
 * @returns {PostgrestFilterBuilder<any, any, any, any>} - The enhanced Postgrest query builder object with applied configurations.
 */
export const QueryBuilder = <
    D extends DatabaseTemp,
    S extends keyof D,
>(
    { where = {}, ...options }: ConfigObj<D, S>,
    Query: PostgrestFilterBuilder<any, any, any, any>,
) => {
    const apply = (k: string, vQ: unknown) => {
        const method = objMatchBuild[k as keyof typeof objMatchBuild];
        if (method) {
            Query = method(Query, vQ as any);
            return;
        }
        if (!WHERE_KEYS.has(k as WhereBasicKeys)) return;
        for (const [K, v] of Object.entries(vQ as Pick<Where<any>, WhereBasicKeys>)) {
            Query = (Query as any)[k](K, v);
        }
    };

    for (const k of Object.keys(where)) {
        const vQ = k in options ? (options as Record<string, unknown>)[k] : (where as Record<string, unknown>)[k];
        apply(k, vQ);
    }
    for (const k of Object.keys(options)) {
        if (k in where) continue;
        apply(k, (options as Record<string, unknown>)[k]);
    }

    return Query;
};
