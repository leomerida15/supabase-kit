import { SupabaseClient } from '@supabase/supabase-js';
import { ReactNode } from 'react';

export type InitSupabaseContextState = SupabaseClient<any> | undefined;

export interface SupabaseClientProvierProps extends SupabaseClient<any> {
    children: ReactNode;
}
