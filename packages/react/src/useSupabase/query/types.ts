export type DatabaseTemp = {
    public: {
        Tables: Record<string, { Row: Record<string, any> }>;
        Views: Record<string, { Row: Record<string, any> }>;
    };
};

// Tipos de filtro para configuraciones avanzadas
export type OrWhere = string[];
export type EqWhere<T> = Partial<
    Record<T extends Array<any> ? keyof T[0] : keyof T, string | number | boolean>
>;
export type InWhere<T> = Partial<
    Record<T extends Array<any> ? keyof T[0] : keyof T, (string | number)[]>
>;
export type FilterWhere<T> = Record<
    T extends Array<any> ? keyof T[0] : keyof T,
    [operator: `${'' | 'not.'}${FilterOperator}`, value: string]
>;

export type gtWhere<T> = Partial<Record<T extends Array<any> ? keyof T[0] : keyof T, T[keyof T]>>;
export type isWhere<T> = Partial<Record<T extends Array<any> ? keyof T[0] : keyof T, T[keyof T]>>;
export type matchWhere<T> = Partial<T>;
export type likeWhere<T> = [T extends Array<any> ? keyof T[0] : keyof T, string];
export type containsWhere<T> = Partial<
    Record<T extends Array<any> ? keyof T[0] : keyof T, string[]>
>;

export type rangeWhere<T> = Partial<Record<T extends Array<any> ? keyof T[0] : keyof T, string>>;

export type overlapsWhere<T> = Partial<
    Record<T extends Array<any> ? keyof T[0] : keyof T, string | string[]>
>;

export type textSearchWhereConfig = {
    text: string;
    options?: { config?: string; type?: 'plain' | 'phrase' | 'websearch' };
};

export type textSearchWhere<T> = Partial<
    Record<T extends Array<any> ? keyof T[0] : keyof T, textSearchWhereConfig>
>;

export type orderWhere<T> = Partial<
    Record<
        T extends Array<any> ? keyof T[0] : keyof T,
        {
            ascending?: boolean;
            nullsFirst?: boolean;
            foreignTable?: string;
            referencedTable?: string;
        }
    >
>;

export type baseRangeWhere = {
    from: number;
    to: number;
    options: { foreignTable?: string; referencedTable?: string };
};

export type FilterOperator =
    | 'eq'
    | 'neq'
    | 'gt'
    | 'gte'
    | 'lt'
    | 'lte'
    | 'like'
    | 'ilike'
    | 'is'
    | 'in'
    | 'cs'
    | 'cd'
    | 'sl'
    | 'sr'
    | 'nxl'
    | 'nxr'
    | 'adj'
    | 'ov'
    | 'fts'
    | 'plfts'
    | 'phfts'
    | 'wfts';

type PublicSchema<D extends DatabaseTemp> = D[Extract<keyof D, 'public'>] & any;

export type PublicSchemaKeys<D extends DatabaseTemp> =
    | keyof (PublicSchema<D>['Tables'] & PublicSchema<D>['Views'])
    | { schema: keyof D };

export type TableName<
    D extends DatabaseTemp,
    P extends PublicSchemaKeys<D>,
    T extends P extends { schema: keyof D }
        ? keyof (D['public']['Tables'] & D['public']['Views'])
        : never = never,
> = T;

export type Tables<
    D extends DatabaseTemp,
    P extends PublicSchemaKeys<D>,
    T extends TableName<D, P>,
> = (D['public']['Tables'] & D['public']['Views'])[T] extends {
    Row: infer R;
}
    ? R
    : never;

// Resultado del query
export type SupabaseQueryResult<T> = {
    payload: T;
    count: number;
};

export type Where<V> = {
    eq?: EqWhere<V>;
    neq?: EqWhere<V>;
    gt?: gtWhere<V>;
    gte?: gtWhere<V>;
    lt?: gtWhere<V>;
    lte?: gtWhere<V>;
    is?: isWhere<V>;
    in?: InWhere<V>;
    or?: OrWhere;
    filter?: FilterWhere<V>;
    match?: matchWhere<V>;
    like?: likeWhere<V>;
    ilike?: likeWhere<V>;
    contains?: containsWhere<V>;
    containedBy?: containsWhere<V>;
    rangeGt?: rangeWhere<V>;
    rangeGte?: rangeWhere<V>;
    rangeLt?: rangeWhere<V>;
    rangeLte?: rangeWhere<V>;
    rangeAdjacent?: rangeWhere<V>;
    overlaps?: overlapsWhere<V>;
    textSearch?: textSearchWhere<V>;
    not?: FilterWhere<V>;
};

export type WhereKeys = keyof Where<any>;

export type WhereBasicKeys = keyof Omit<
    Where<any>,
    'or' | 'filter' | 'match' | 'textSearch' | 'not'
>;
