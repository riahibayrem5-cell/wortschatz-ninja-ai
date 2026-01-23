import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface AdminAuthState {
  isAdmin: boolean;
  isLoading: boolean;
  userId: string | null;
  email: string | null;
}

export const useAdminAuth = () => {
  const [state, setState] = useState<AdminAuthState>({
    isAdmin: false,
    isLoading: true,
    userId: null,
    email: null,
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          setState({ isAdmin: false, isLoading: false, userId: null, email: null });
          return;
        }

        // Server-side role verification - query user_roles table
        const { data: roleData, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .eq('role', 'admin')
          .maybeSingle();

        if (error) {
          console.error('Error checking admin status:', error);
          setState({ 
            isAdmin: false, 
            isLoading: false, 
            userId: session.user.id,
            email: session.user.email || null 
          });
          return;
        }

        setState({
          isAdmin: !!roleData,
          isLoading: false,
          userId: session.user.id,
          email: session.user.email || null,
        });
      } catch (error) {
        console.error('Admin auth check failed:', error);
        setState({ isAdmin: false, isLoading: false, userId: null, email: null });
      }
    };

    checkAdminStatus();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkAdminStatus();
    });

    return () => subscription.unsubscribe();
  }, []);

  const requireAdmin = () => {
    if (!state.isLoading && !state.isAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this area.",
        variant: "destructive",
      });
      navigate('/dashboard');
      return false;
    }
    return state.isAdmin;
  };

  return { ...state, requireAdmin };
};
