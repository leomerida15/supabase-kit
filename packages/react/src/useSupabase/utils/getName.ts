import { DatabaseTemp } from '../query';

export interface GetSupaQUeryNameProps<D extends DatabaseTemp = any> {
    table: keyof D['public']['Tables'];
    queryKey: string[];
}

export const GetSupaQueryName = <D extends DatabaseTemp = any>({
    table,
    queryKey,
}: GetSupaQUeryNameProps<D>) => {
    return [table, ...queryKey].join('_');
};
