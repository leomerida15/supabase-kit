import { useCallback, useEffect, useMemo } from 'react';
import { REALTIME_POSTGRES_CHANGES_LISTEN_EVENT, SupabaseClient } from '@supabase/supabase-js';
import { QueryKey, useQueryClient } from '@tanstack/react-query';
import { createSupabaseQuery, DatabaseTemp } from '../query';
import { PayloadRealtime, SupaSubscriptionProps } from './types';

export const createSupabaseSubscription = <D extends DatabaseTemp>(
  client: SupabaseClient<D>,
  useQuery: ReturnType<typeof createSupabaseQuery<D>>['useSupaQuery']
) => {
  /**
   * Custom hook to create a Supabase subscription with specified configurations.
   *
   * @template D - Database schema type.
   * @template SchemaKey - Database schema type.
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
  const useSupaSubscription = <SchemaKey extends keyof D>({
    table,
    schema,
    event = '*',
    where,
    type = 'postgres_changes',
    channel = 'general',
    callback = (payload) => console.log(payload),
  }: SupaSubscriptionProps<D, SchemaKey>) => {
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

    // Wrap callback to add detailed logging
    const wrappedCallback = useCallback(
      (payload: any) => {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🔥 REALTIME EVENT RECEIVED FROM BACKEND');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📊 Event Type:', payload.eventType);
        console.log('📋 Table:', payload.table);
        console.log('🏷️  Schema:', payload.schema);
        console.log('⏰ Timestamp:', new Date(payload.commit_timestamp).toLocaleString());

        if (payload.eventType === 'INSERT') {
          console.log('✅ INSERT - New Record:');
          console.log('  → New Data:', payload.new);
        } else if (payload.eventType === 'UPDATE') {
          console.log('🔄 UPDATE - Record Modified:');
          console.log('  → Old Data:', payload.old);
          console.log('  → New Data:', payload.new);
        } else if (payload.eventType === 'DELETE') {
          console.log('❌ DELETE - Record Removed:');
          console.log('  → Old Data:', payload.old);
        }

        console.log('📦 Full Payload:', payload);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        // Call the original callback
        callback(payload);
      },
      [callback]
    );

    useEffect(() => {
      console.log('🔧 Setting up Supabase subscription:', {
        channel,
        type,
        table,
        schema,
        filter,
        configQuery,
      });

      const subscription = client
        .channel(channel)
        .on(type as any, configQuery, wrappedCallback)
        .subscribe((status) => {
          console.log('📡 Subscription status:', status);
          if (status === 'SUBSCRIBED') {
            console.log('✅ Successfully subscribed to channel:', channel);
            console.log('👂 Listening for events on table:', table);
            console.log('🔍 Filter:', filter || 'No filter (all records)');
          } else if (status === 'CHANNEL_ERROR') {
            console.error('❌ Subscription error on channel:', channel);
          } else if (status === 'TIMED_OUT') {
            console.error('⏱️  Subscription timed out on channel:', channel);
          } else if (status === 'CLOSED') {
            console.warn('🔒 Channel closed:', channel);
          }
        });

      return () => {
        console.log('🔌 Unsubscribing from channel:', channel);
        subscription.unsubscribe();
      };
    }, [wrappedCallback, configQuery, type, channel, table, schema, filter]);
  };

  /**
   * Use a subscription to listen to a table in real time.
   * @param {Object} props - Options for the subscription.
   * @param {string} props.table - The table to listen to.
   * @param {Object} props.where - A filter to apply to the subscription.
   * @param {string} [props.channel=general] - The channel to subscribe to.
   * @returns {UseQueryResult} The result of the subscription.
   */
  const useSupaRealtime = <
    SchemaKey extends string & keyof D,
    T extends keyof D[SchemaKey]['Tables'] & string,
  >({
    table,
    where,
    channel = 'general',
    schema = 'public' as SchemaKey,
  }: Omit<SupaSubscriptionProps<D, SchemaKey>, 'callback' | 'type' | 'event'> & {
    table: T;
  }) => {
    const queryClient = useQueryClient();

    const queryConfig = useMemo(
      () => (where ? { [where.operator]: { [where.key]: where.value } } : {}),
      [where]
    );

    console.log('🔍 useSupaRealtime queryConfig:', queryConfig);
    console.log('🔍 useSupaRealtime where:', where);

    // Build QueryKey to match the one used by useQuery internally
    // This MUST match the queryKey structure in createSupabaseQuery.tsx lines 70-83
    const QueryKey = useMemo(() => {
      const initQueryKey = [table, 'subscription'].join('_');
      return [
        initQueryKey,
        queryConfig, // configObj.where
        undefined, // configObj.limit
        undefined, // single
        'estimated', // count
        table, // table
        '*', // column
        'estimated', // count (duplicated in original)
        { queryKey: ['subscription'] }, // options
        undefined, // single (duplicated)
        undefined, // enabled
      ] as unknown as QueryKey;
    }, [table, queryConfig]);

    console.log('🔍 useSupaRealtime QueryKey:', QueryKey);

    const query = useQuery({
      table,
      schema,
      where: queryConfig,
      options: {
        queryKey: ['subscription'],
      },
      count: 'estimated',
    });

    console.log('🔍 useSupaRealtime query result:', query.data);

    const handleRealtimeEvent = useCallback(
      (payload: PayloadRealtime<D, typeof table>) => {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🔥 REALTIME EVENT IN handleRealtimeEvent');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📊 Event Type:', payload.eventType);
        console.log('📦 Payload:', payload);
        console.log('🔑 Current QueryKey:', QueryKey);

        // Get current cache data BEFORE update
        const currentCacheData = queryClient.getQueryData(QueryKey);
        console.log('💾 Current Cache Data BEFORE update:', currentCacheData);

        const eventMatch = {
          [REALTIME_POSTGRES_CHANGES_LISTEN_EVENT.DELETE]: () => {
            console.log('🗑️ Processing DELETE event');
            queryClient.setQueryData(QueryKey, (oldData: any) => {
              console.log('  → oldData in DELETE:', oldData);
              if (!oldData) {
                console.log('  ⚠️ No oldData, returning null');
                return oldData;
              }

              const newPayload = Array.isArray(oldData.payload)
                ? oldData.payload.filter((d: any) => d.id !== payload.old.id)
                : [];

              const count = newPayload.length;
              const result = { count, payload: newPayload };
              console.log('  ✅ DELETE result:', result);
              return result;
            });
          },
          [REALTIME_POSTGRES_CHANGES_LISTEN_EVENT.INSERT]: () => {
            console.log('➕ Processing INSERT event');
            queryClient.setQueryData(QueryKey, (oldData: any) => {
              console.log('  → oldData in INSERT:', oldData);
              if (!oldData) {
                const result = { count: 1, payload: [payload.new] };
                console.log('  ✅ INSERT result (no oldData):', result);
                return result;
              }

              const newPayload = Array.isArray(oldData.payload)
                ? [...oldData.payload, payload.new]
                : [payload.new];

              const count = newPayload.length;
              const result = { count, payload: newPayload };
              console.log('  ✅ INSERT result:', result);
              return result;
            });
          },
          [REALTIME_POSTGRES_CHANGES_LISTEN_EVENT.UPDATE]: () => {
            console.log('🔄 Processing UPDATE event');
            console.log('  → payload.old:', payload.old);
            console.log('  → payload.new:', payload.new);
            console.log('  → payload.new.state:', (payload.new as any).state);
            console.log(
              '  → payload.new.state is Array?',
              Array.isArray((payload.new as any).state)
            );
            console.log('  → payload.new.state length:', (payload.new as any).state?.length);

            queryClient.setQueryData(QueryKey, (oldData: any) => {
              console.log('  → oldData in UPDATE:', oldData);
              console.log('  → oldData.payload type:', typeof oldData?.payload);
              console.log('  → oldData.payload length:', oldData?.payload?.length);

              if (!oldData) {
                console.log('  ⚠️ No oldData, returning null');
                return oldData;
              }

              const newPayload = Array.isArray(oldData.payload)
                ? oldData.payload.map((d: any) => {
                    if (d.id === payload.old.id) {
                      console.log('  🎯 Found matching record, updating:', d.id);
                      console.log('  🎯 Old record:', d);
                      console.log('  🎯 New record:', payload.new);
                      return payload.new;
                    }
                    return d;
                  })
                : [];

              const count = newPayload.length;
              const result = { count, payload: newPayload };
              console.log('  ✅ UPDATE result:', result);
              console.log('  ✅ Updated record state:', result.payload?.[0]?.state);
              return result;
            });
          },
        };

        const handler = eventMatch[payload.eventType];
        if (handler) {
          console.log('✅ Handler found, executing...');
          handler();

          // Get cache data AFTER update
          const newCacheData = queryClient.getQueryData(QueryKey);
          console.log('💾 Cache Data AFTER update:', newCacheData);
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        } else {
          console.log('❌ No handler found for event type:', payload.eventType);
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        }
      },
      [queryClient, QueryKey]
    );

    useSupaSubscription({
      table,
      schema,
      event: '*',
      where,
      type: 'postgres_changes',
      channel,
      callback: handleRealtimeEvent,
    });

    return query;
  };

  return {
    useSupaSubscription,
    useSupaRealtime,
  };
};
