import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://cqpujmwfiqbwdsmuwkmb.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxcHVqbXdmaXFid2RzbXV3a21iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyOTMzODAsImV4cCI6MjA4OTg2OTM4MH0.lW9zvuBYYvrCvUoVApTCh0-ITuXwescPv3qJg1lNDDY";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
