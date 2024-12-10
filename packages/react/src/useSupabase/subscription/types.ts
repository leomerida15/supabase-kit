import {
    REALTIME_LISTEN_TYPES,
    REALTIME_POSTGRES_CHANGES_LISTEN_EVENT,
    SupabaseClient,
} from '@supabase/supabase-js';
import { DatabaseTemp } from '../query';

/**
 * Props for the `useSupaSubscription` hook.
 *
 * @template D - The database schema type.
 * @template T - The event type to listen for. Defaults to '*'.
 * @template K - The key of the table to subscribe to. Defaults to `keyof (D['public']['Tables'] &
 *     D['public']['Views'])`.
 * @template V - The type of the value to filter by. Defaults to `keyof R` where `R` is the type of the
 *     row returned by the table.
 */
export interface SupaSubscriptionProps<
    D extends DatabaseTemp,
    T extends `${REALTIME_POSTGRES_CHANGES_LISTEN_EVENT}` = '*',
    K extends keyof (D['public']['Tables'] & D['public']['Views']) = keyof (D['public']['Tables'] &
        D['public']['Views']),
    V = (D['public']['Tables'] & D['public']['Views'])[K]['Row'],
> {
    /**
     * The table to subscribe to.
     */
    table: K;

    /**
     * The schema to use. Defaults to 'public'.
     */
    schema?: string;

    /**
     * The type of event to listen for. Defaults to 'postgres_changes'.
     */
    type?: `${REALTIME_LISTEN_TYPES}`;

    /**
     * The event to listen for. Defaults to '*'.
     */
    event?: T;

    /**
     * The channel to subscribe to. Defaults to 'general'.
     */
    channel?: string;

    /**
     * The filter to apply to the subscription. If specified, the subscription will only receive events
     * that match the filter.
     */
    where?: {
        /**
         * The key to filter by.
         */
        key: keyof V;

        /**
         * The operator to use for the filter.
         */
        operator: 'eq' | 'neq' | 'lt' | 'lte' | 'gt' | 'gte' | 'in';

        /**
         * The value to filter by.
         */
        value: string | number | boolean | Array<string> | Array<number>;
    };

    /**
     * The callback to call when the subscription receives an event.
     */
    callback?: Parameters<ReturnType<SupabaseClient<D>['channel']>['on']>[2];
}

/**
 * Payload type for the `on` callback of the subscription.
 *
 * @template D - The database schema type.
 * @template K - The key of the table to subscribe to.
 * @template V - The value type of the table.
 */
export interface PayloadRealtime<
    D extends DatabaseTemp,
    K extends keyof (D['public']['Tables'] & D['public']['Views']) = keyof (D['public']['Tables'] &
        D['public']['Views']) &
        Parameters<SupabaseClient<D>['from']>['0'],
    V = (D['public']['Tables'] & D['public']['Views'])[K] extends {
        Row: infer R;
    }
        ? R extends Array<any>
            ? keyof R[0]
            : keyof R
        : string,
> {
    /**
     * The schema the event occurred in.
     */
    schema: string;

    /**
     * The table the event occurred in.
     */
    table: string;

    /**
     * The timestamp of the event.
     */
    commit_timestamp: string;

    /**
     * The type of event.
     */
    eventType:
        | REALTIME_POSTGRES_CHANGES_LISTEN_EVENT.DELETE
        | REALTIME_POSTGRES_CHANGES_LISTEN_EVENT.INSERT
        | REALTIME_POSTGRES_CHANGES_LISTEN_EVENT.UPDATE;

    /**
     * The new row (for INSERT and UPDATE events).
     */
    new: Partial<V>;

    /**
     * The old row (for DELETE and UPDATE events).
     */
    old: Old;

    /**
     * Any errors that occurred during the event.
     */
    errors: any;
}

/**
 * Payload type for the old row.
 */
export interface Old {
    /**
     * The id of the old row.
     */
    id: number;
}
