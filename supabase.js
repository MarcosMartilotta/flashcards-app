import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://svzjdxqrrqubyhssjwwf.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2empkeHFycnF1Ynloc3Nqd3dmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1NzAyNDUsImV4cCI6MjA3OTE0NjI0NX0.LoS392VqeFGKOefvnAoKcBhzAeED2fXITxE_MQGRFCM";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
