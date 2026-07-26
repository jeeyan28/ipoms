import { Router } from "express";
import { supabase } from "../supabaseClient.js";

export const auditTrailRouter = Router();

export async function logAudit(action, reference, actor = "Admin") {
  await supabase.from("audit_trail").insert({ action, reference, actor });
}

// GET /api/audit-trail
auditTrailRouter.get("/", async (req, res) => {
  const { data, error } = await supabase
    .from("audit_trail")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) return res.status(500).json({ message: error.message });
  res.json(data);
});
