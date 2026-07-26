import { Router } from "express";
import { supabase } from "../supabaseClient.js";
import { logAudit } from "./auditTrail.js";

export const inventoryRouter = Router();

// GET /api/inventory - products joined with supplier name
inventoryRouter.get("/", async (req, res) => {
  const { data, error } = await supabase
    .from("products")
    .select("*, suppliers(name)")
    .eq("archived", false)
    .order("created_at", { ascending: false });
  if (error) return res.status(500).json({ message: error.message });

  const shaped = data.map((p) => ({
    id: p.id,
    item: p.name,
    category: p.category,
    onHand: p.stock,
    minimum: p.minimum,
    reorder: p.reorder_point,
    unitPrice: p.price,
    value: p.stock * p.price,
    supplier: p.suppliers?.name || null,
    supplierId: p.supplier_id,
    lowStock: p.stock <= p.minimum,
  }));
  res.json(shaped);
});

// POST /api/inventory - add a new stock item
inventoryRouter.post("/", async (req, res) => {
  const { item, category, onHand, minimum, reorder, unitPrice, supplierId } = req.body;
  const { data, error } = await supabase
    .from("products")
    .insert({
      name: item,
      category,
      stock: Number(onHand) || 0,
      minimum: Number(minimum) || 0,
      reorder_point: Number(reorder) || 0,
      price: Number(unitPrice) || 0,
      supplier_id: supplierId || null,
    })
    .select()
    .single();
  if (error) return res.status(500).json({ message: error.message });
  await logAudit("Inventory item added", item);
  res.status(201).json(data);
});

// PUT /api/inventory/:id - adjust stock / thresholds
inventoryRouter.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { item, category, onHand, minimum, reorder, unitPrice, supplierId } = req.body;
  const { data, error } = await supabase
    .from("products")
    .update({
      name: item,
      category,
      stock: Number(onHand),
      minimum: Number(minimum),
      reorder_point: Number(reorder),
      price: Number(unitPrice),
      supplier_id: supplierId || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();
  if (error) return res.status(500).json({ message: error.message });
  res.json(data);
});
