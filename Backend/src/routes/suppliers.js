import { Router } from "express";
import { supabase } from "../supabaseClient.js";
import { logAudit } from "./auditTrail.js";

export const suppliersRouter = Router();

suppliersRouter.get("/", async (req, res) => {
  const { data, error } = await supabase
    .from("suppliers")
    .select("*")
    .eq("archived", false)
    .order("created_at", { ascending: false });
  if (error) return res.status(500).json({ message: error.message });
  res.json(data);
});

suppliersRouter.post("/", async (req, res) => {
  const { name, category, leadTime, referencePrice, terms, phone, email, rating } = req.body;
  const { data, error } = await supabase
    .from("suppliers")
    .insert({
      name,
      category,
      lead_time: leadTime,
      reference_price: Number(referencePrice) || 0,
      terms,
      phone,
      email,
      rating: Number(rating) || 0,
    })
    .select()
    .single();
  if (error) return res.status(500).json({ message: error.message });
  await logAudit("Supplier added", name);
  res.status(201).json(data);
});

suppliersRouter.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, category, leadTime, referencePrice, terms, phone, email, rating } = req.body;
  const { data, error } = await supabase
    .from("suppliers")
    .update({
      name,
      category,
      lead_time: leadTime,
      reference_price: Number(referencePrice) || 0,
      terms,
      phone,
      email,
      rating: Number(rating) || 0,
    })
    .eq("id", id)
    .select()
    .single();
  if (error) return res.status(500).json({ message: error.message });
  res.json(data);
});

// archive instead of hard delete
suppliersRouter.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase.from("suppliers").update({ archived: true }).eq("id", id).select().single();
  if (error) return res.status(500).json({ message: error.message });
  await logAudit("Supplier archived", data?.name || id);
  res.status(204).end();
});
