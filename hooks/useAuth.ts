import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (isMounted.current) {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (isMounted.current) {
          setUser(session?.user ?? null);
          setLoading(false);
        }
      }
    );

    return () => {
      isMounted.current = false;
      subscription.unsubscribe();
    };
  }, []);

  return {
    user,
    loading,
    signOut: () => supabase.auth.signOut(),
  };
}