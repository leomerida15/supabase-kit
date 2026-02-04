# get start

> Hooks by management data from supabase and fetch data by react.

## install

```bash
  npm i @supabase-kit/react
```

```bash
  bun add @supabase-kit/react
```

```bash
  pnpm add @supabase-kit/react
```

```bash
  yarn add @supabase-kit/react
```

## create tools

```typescript
import { createSupabaseTools } from '@supabase-kit/react';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/supabase/types'
const supabaseUrl = '';

const supabaseKey = '';

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

export const {
    // query parsser object to client
    QueryBuilder,
    // hooks
    useSupabase,
    useSupaQuery,
    useSupaSession,
    useSupaRealtime,
    useSupaSubscription,
    useSupaInfiniteQuery,
} = createSupabaseTools(supabase);
```

### useSupabase: return supabase client

```typescript
'use client';
import React from 'react';
import { useSupabase } from '@/createSupabaseTools';

export const Example = () => {
    const supabase = useSupabase();

    return <div>{urls.panel.root}</div>;
};
```

### useSupaQuery: query by fetch data

- table — The name of the table to query.

- column — Columns to select from the table.

- count — Count type for the query.

- options — Additional options for the query hook from @tanstack/react-query.

- single — Flag indicating if a single row should be returned.

- enabled — Flag to enable/disable the query execution.

- where — condition by where how in, is, eq, neq, filter, etc.

```typescript
'use client';
import { useSupabase } from '@/createSupabaseTools';

export const Example = () => {
    const book = useSupaQuery({
        table: 'book',
        where: {
            eq: { id: 1 },
        }
    });

    return <div>{JSON.stringify(book.data)}</div>;
};
```

### useSupaRealtime: query by fetch data in realtime

- table — The table to listen to.

- where — A filter to apply to the subscription.

- channel — The channel to subscribe to.

```typescript
'use client';
import { useSupaRealtime } from '@/createSupabaseTools';

export const Example = () => {
    const book = useSupaRealtime({
        table: 'book',
        where: {
            key: 'id',
            operator: 'in',
            value: [1, 2, 5],
        },
    });

    return <div>{JSON.stringify(book.data)}</div>;
};
```

### useSupaSubscription: query by fetch data in realtime with customn

- table — The name of the table to subscribe to.

- schema — The database schema to use.

- event — Event type to listen for (e.g., INSERT, UPDATE, DELETE).

- where — Filter object to specify conditions for events.

- type — Type of event to listen for.

- channel — Channel name for the subscription.

- callback — Callback function to handle subscription payloads.

```typescript
'use client';
import { useState } from 'react';
import { useSupaSubscription } from '@/createSupabaseTools';

export const Example = () => {
    const [subscription, setSubscription] = useState({});

    useSupaSubscription({
        event: '*',
        table: 'book',
        schema: 'public',
        channel: 'general',
        type: 'postgres_changes',
        callback(payload) {
            console.log(payload);
            setSubscription(payload);
        },
        where: {
            key: 'id',
            operator: 'in',
            value: [1, 2, 5],
        },
    });

    return <div>{JSON.stringify(subscription)}</div>;
};
```
