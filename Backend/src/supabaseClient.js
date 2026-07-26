import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.warn(
    "[ipoms-api] SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are not set. " +
      "Copy .env.example to .env and fill them in."
  );
}

// Service role key bypasses RLS entirely - fine here since this key
// only ever lives on the server, never in the frontend.
export const supabase = createClient(url, key, {
  auth: { persistSession: false },
});
