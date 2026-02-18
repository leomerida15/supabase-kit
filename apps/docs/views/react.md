# @supabase-kit/react

Hooks para gestionar datos de Supabase y fetching con React (React Query).

**Peer dependencies:** `@supabase/supabase-js`, `@tanstack/react-query`

## Install

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

## Create tools

Crea el cliente Supabase y exporta los tools (QueryBuilder + hooks) desde un módulo compartido (por ejemplo `lib/supabase.ts` o `createSupabaseTools.ts`):

```typescript
import { createSupabaseTools } from '@supabase-kit/react';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/supabase/types';

const supabaseUrl = '';
const supabaseKey = '';

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

export const {
  QueryBuilder,
  useSupabase,
  useSupaQuery,
  useSupaSession,
  useSupaRealtime,
  useSupaSubscription,
  useSupaInfiniteQuery,
} = createSupabaseTools(supabase);
```

### useSupabase

Devuelve el cliente Supabase.

```typescript
'use client';
import { useSupabase } from '@/lib/supabase';

export const Example = () => {
  const supabase = useSupabase();
  return <div>...</div>;
};
```

### useSupaQuery

Fetch de datos con React Query.

- **table** — Nombre de la tabla.
- **column** — Columnas a seleccionar.
- **count** — Tipo de count.
- **options** — Opciones del hook de @tanstack/react-query.
- **single** — Si debe devolver una sola fila.
- **enabled** — Habilitar o deshabilitar la query.
- **where** — Condiciones: `eq`, `in`, `is`, `neq`, `filter`, etc.

**Rendimiento:** Si la config (sobre todo `where`, `limit`) depende de state o props, usa `useMemo` para mantener la referencia estable y evitar refetches innecesarios:

```typescript
const config = useMemo(
  () => ({ table: 'book', where: { eq: { status } }, limit: 10 }),
  [status]
);
const book = useSupaQuery(config);
```

```typescript
'use client';
import { useSupaQuery } from '@/lib/supabase';

export const Example = () => {
  const book = useSupaQuery({
    table: 'book',
    where: { eq: { id: 1 } },
  });
  return <div>{JSON.stringify(book.data)}</div>;
};
```

### useSupaSession

Devuelve la sesión de usuario actual (React Query). Útil para mostrar usuario logueado o proteger rutas.

```typescript
'use client';
import { useSupaSession } from '@/lib/supabase';

export const UserBadge = () => {
  const { data: session, isLoading } = useSupaSession();
  if (isLoading) return <span>...</span>;
  if (!session?.data?.session?.user) return null;
  return <span>{session.data.session.user.email}</span>;
};
```

### useSupaRealtime

Datos en tiempo real (subscription por tabla/filtro).

- **table** — Tabla a escuchar.
- **where** — Filtro de la suscripción.
- **channel** — Canal opcional.

```typescript
'use client';
import { useSupaRealtime } from '@/lib/supabase';

export const Example = () => {
  const book = useSupaRealtime({
    table: 'book',
    where: { key: 'id', operator: 'in', value: [1, 2, 5] },
  });
  return <div>{JSON.stringify(book.data)}</div>;
};
```

### useSupaSubscription

Suscripción en tiempo real con opciones avanzadas.

- **table** — Tabla.
- **schema** — Schema de la base de datos.
- **event** — Evento (INSERT, UPDATE, DELETE, etc.).
- **where** — Filtro.
- **type** — Tipo de evento.
- **channel** — Nombre del canal.
- **callback** — Función que recibe el payload.

```typescript
'use client';
import { useState } from 'react';
import { useSupaSubscription } from '@/lib/supabase';

export const Example = () => {
  const [subscription, setSubscription] = useState({});

  useSupaSubscription({
    event: '*',
    table: 'book',
    schema: 'public',
    channel: 'general',
    type: 'postgres_changes',
    callback(payload) {
      setSubscription(payload);
    },
    where: { key: 'id', operator: 'in', value: [1, 2, 5] },
  });

  return <div>{JSON.stringify(subscription)}</div>;
};
```

### useSupaInfiniteQuery

Listado paginado infinito (scroll infinito). Expone `data.pages`, `fetchNextPage`, `hasNextPage`, `isFetchingNextPage`.

```typescript
'use client';
import { useSupaInfiniteQuery } from '@/lib/supabase';

export const InfiniteBookList = () => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useSupaInfiniteQuery({
    table: 'book',
    limit: 20,
  });

  const books = data?.pages?.flatMap((p) => p.payload ?? []) ?? [];

  return (
    <div>
      {books.map((b) => <div key={b.id}>{b.title}</div>)}
      {hasNextPage && (
        <button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
          {isFetchingNextPage ? 'Cargando...' : 'Más'}
        </button>
      )}
    </div>
  );
};
```

---

## Casos de uso

### 1. Listado con filtros

Tabla de libros filtrable por estado o búsqueda. La config de la query se memoiza para no refetchear en cada render.

```typescript
'use client';
import { useMemo, useState } from 'react';
import { useSupaQuery } from '@/lib/supabase';

export const BookList = () => {
  const [status, setStatus] = useState<string>('published');
  const [search, setSearch] = useState('');

  const config = useMemo(
    () => ({
      table: 'book' as const,
      where: { eq: { status }, filter: search ? { column: 'title', operator: 'ilike', value: `%${search}%` } : undefined },
      limit: 20,
    }),
    [status, search]
  );

  const { data, isLoading } = useSupaQuery(config);
  const books = data?.payload ?? [];

  return (
    <div>
      <select value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="draft">Borrador</option>
        <option value="published">Publicado</option>
      </select>
      <input placeholder="Buscar título" value={search} onChange={(e) => setSearch(e.target.value)} />
      {isLoading ? <p>Cargando...</p> : books.map((b) => <div key={b.id}>{b.title}</div>)}
    </div>
  );
};
```

### 2. Listado infinito

Scroll infinito sobre una tabla. Usa `useSupaInfiniteQuery` y `fetchNextPage` al llegar al final de la lista.

```typescript
'use client';
import { useCallback } from 'react';
import { useSupaInfiniteQuery } from '@/lib/supabase';

export const InfiniteList = () => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useSupaInfiniteQuery({
    table: 'post',
    limit: 15,
    where: { eq: { published: true } },
  });

  const posts = data?.pages?.flatMap((p) => p.payload ?? []) ?? [];

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div>
      {posts.map((p) => (
        <article key={p.id}>{p.title}</article>
      ))}
      {hasNextPage && (
        <button onClick={loadMore} disabled={isFetchingNextPage}>
          {isFetchingNextPage ? 'Cargando...' : 'Cargar más'}
        </button>
      )}
    </div>
  );
};
```

### 3. Dashboard en tiempo real

Lista que se actualiza sola cuando hay INSERT/UPDATE/DELETE en la tabla. Usa `useSupaRealtime` para suscribirte a la tabla (o `useSupaSubscription` si necesitas control fino del canal/eventos).

```typescript
'use client';
import { useSupaRealtime } from '@/lib/supabase';

export const RealtimeOrders = () => {
  const { data, isLoading } = useSupaRealtime({
    table: 'order',
    where: { key: 'status', operator: 'eq', value: 'pending' },
  });

  const orders = data ?? [];

  return (
    <div>
      <h2>Pedidos pendientes (en vivo)</h2>
      {isLoading ? <p>Cargando...</p> : orders.map((o) => <div key={o.id}>{o.id} — {o.created_at}</div>)}
    </div>
  );
};
```

### 4. Sesión y UI condicional

Mostrar contenido distinto si el usuario está logueado o no. Usa `useSupaSession` (ver hook arriba).

```typescript
'use client';
import { useSupaSession } from '@/lib/supabase';

export const Nav = () => {
  const { data: session, isLoading } = useSupaSession();
  const user = session?.data?.session?.user;

  if (isLoading) return <nav>Cargando...</nav>;
  if (!user) return <nav><a href="/login">Iniciar sesión</a></nav>;
  return <nav>Hola, {user.email} | <a href="/logout">Salir</a></nav>;
};
```
