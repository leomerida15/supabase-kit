import { REALTIME_POSTGRES_CHANGES_LISTEN_EVENT, SupabaseClient } from '@supabase/supabase-js';
import { QueryKey, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
import { createSupabaseQuery, DatabaseTemp } from '../query';
import { PayloadRealtime, SupaSubscriptionProps } from './types';

export const createSupabaseSubscription = <D extends DatabaseTemp>(
    client: SupabaseClient<D>,
    useQuery: ReturnType<typeof createSupabaseQuery<D>>['useSupaQuery'],
) => {
    /**
     * Custom hook to create a Supabase subscription with specified configurations.
     *
     * @template D - Database schema type.
     *
     * @param {Object} config - Configuration object for the subscription.
     * @param {string} config.table - The name of the table to subscribe to.
     * @param {string} [config.schema='public'] - The database schema to use.
     * @param {string} [config.event='*'] - Event type to listen for (e.g., INSERT, UPDATE, DELETE).
     * @param {Object} [config.where] - Filter object to specify conditions for events.
     * @param {string} [config.type='postgres_changes'] - Type of event to listen for.
     * @param {string} [config.channel='general'] - Channel name for the subscription.
     * @param {Function} [config.callback=(payload) => console.log(payload)] - Callback function to handle subscription payloads.
     *
     * @returns {void}
     *
     * This hook sets up a Supabase subscription based on the provided configuration.
     * It automatically unsubscribes when the component is unmounted or the dependencies change.
     */
    const useSupaSubscription = ({
        table,
        schema = 'public',
        event = '*',
        where,
        type = 'postgres_changes',
        channel = 'general',
        callback = (payload) => console.log(payload),
    }: SupaSubscriptionProps<D>) => {
        const filter = useMemo(() => {
            if (!where) return '';
            const base = `${where?.key as any}=${where?.operator}`;

            if (where?.operator === 'in') return `${base}.(${where?.value.toString()})`;

            return `${base}.${where?.value}`;
        }, [where]);

        const configQuery = useMemo(() => {
            if (!filter)
                return {
                    event,
                    schema,
                    table,
                };

            return {
                event,
                schema,
                table,
                filter,
            };
        }, [event, schema, table, filter]);

        useEffect(() => {
            const subscription = client
                .channel(channel)
                .on(type as any, configQuery, callback)
                .subscribe();

            return () => {
                subscription.unsubscribe();
            };
        }, [callback, configQuery, type, channel]);
    };

    /**
     * Use a subscription to listen to a table in real time.
     * @param {Object} props - Options for the subscription.
     * @param {string} props.table - The table to listen to.
     * @param {Object} props.where - A filter to apply to the subscription.
     * @param {string} [props.channel=general] - The channel to subscribe to.
     * @returns {UseQueryResult} The result of the subscription.
     */
    const useSupaRealtime = <T extends keyof D['public']['Tables'] & string>({
        table,
        where,
        channel = 'general',
    }: Omit<SupaSubscriptionProps<D>, 'callback' | 'type' | 'event'> & {
        table: T;
    }) => {
        const queryClient = useQueryClient();

        const queryConfig = useMemo(
            () => (where ? { [where.operator]: { [where.key]: where.value } } : {}),
            [where],
        );

        const QueryKey = [
            [table, 'subscription'].join('_'),
            queryConfig,
            null, // limit
            null, // single
            'estimated', // count
        ] as unknown as QueryKey;

        const query = useQuery({
            table,
            where: queryConfig,
            options: {
                queryKey: ['subscription'],
            },
            count: 'estimated',
        });

        useSupaSubscription({
            table,
            schema: 'public',
            event: '*',
            where,
            type: 'postgres_changes',
            channel,
            callback: (payload: PayloadRealtime<D, typeof table>) => {
                const eventMatch = {
                    [REALTIME_POSTGRES_CHANGES_LISTEN_EVENT.DELETE]: () => {
                        queryClient.setQueryData(QueryKey, (oldData: any) => {
                            const payload = oldData.payload.filter(
                                (d: any) => d.id !== payload.old.id,
                            );

                            const count = payload.length;

                            return {
                                count,
                                payload,
                            };
                        });
                    },
                    [REALTIME_POSTGRES_CHANGES_LISTEN_EVENT.INSERT]: () => {
                        queryClient.setQueryData(QueryKey, (oldData: any) => {
                            const newPayload = [...oldData.payload, payload.new];

                            const count = newPayload.length;

                            return {
                                count,
                                payload: newPayload,
                            };
                        });
                    },
                    [REALTIME_POSTGRES_CHANGES_LISTEN_EVENT.UPDATE]: () => {
                        queryClient.setQueryData(QueryKey, (oldData: any) => {
                            const payload = oldData.payload.map((d: any) => {
                                if (d.id === payload.old.id) return payload.new;

                                return d;
                            });

                            const count = payload.length;

                            return {
                                count,
                                payload,
                            };
                        });
                    },
                };

                eventMatch[payload.eventType]();
            },
        });

        return query;
    };

    return {
        useSupaSubscription,
        useSupaRealtime,
    };
};
