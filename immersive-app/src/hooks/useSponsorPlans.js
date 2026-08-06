import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function useSponsorPlans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function loadPlans() {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.rpc(
  "get_sponsor_plans_with_availability"
);

      if (!mounted) return;

      if (error) {
        console.error(error);
        setError(error);
        setPlans([]);
      } else {
        setPlans(data || []);
      }

      setLoading(false);
    }

    loadPlans();

    return () => {
      mounted = false;
    };
  }, []);

  return {
    plans,
    loading,
    error,
  };
}
