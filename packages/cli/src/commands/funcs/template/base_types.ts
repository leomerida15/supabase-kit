export const base_types = `

import type { MergeDeep } from 'type-fest'
import type { Database as DatabaseGenerated } from './database-generated.local.type'
export type { Json } from './database-generated.local.type'

// Override the type for a specific column in a view:
export type Database = MergeDeep<
  DatabaseGenerated,
  {
    public: {
      Views: {
        movies_view: {
          Row: {
            // id is a primary key in public.movies, so it must be 'not null'
            id: number
          }
        }
      }
    }
  }
>
`;
