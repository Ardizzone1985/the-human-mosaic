import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function useSponsors(placement) {
  const [sponsor, setSponsor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadSponsor() {
      if (!placement) {
        if (mounted) {
          setSponsor(null);
          setLoading(false);
        }

        return;
      }

      setLoading(true);

      const now = new Date().toISOString();

const { data, error } = await supabase
  .from("sponsor_campaigns")
  .select("*")
  .eq("placement", placement)
  .eq("status", "active")
  .lte("starts_at", now)
  .gt("ends_at", now)
  .maybeSingle();

      if (!mounted) {
        return;
      }

      if (error) {
        console.error(
          "Sponsor load error:",
          error
        );

        setSponsor(null);
      } else {
        setSponsor(data || null);
      }

      setLoading(false);
    }

    loadSponsor();

    return () => {
      mounted = false;
    };
  }, [placement]);

  return {
    sponsor,
    loading,
  };
}
