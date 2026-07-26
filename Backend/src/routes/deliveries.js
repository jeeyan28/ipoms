import { Router } from "express";
import { supabase } from "../supabaseClient.js";
import { logAudit } from "./auditTrail.js";

export const deliveriesRouter = Router();

// GET /api/deliveries - purchase orders shaped as delivery tracking cards
deliveriesRouter.get("/", async (req, res) => {
  const { data, error } = await supabase
    .from("purchase_orders")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) return res.status(500).json({ message: error.message });
  res.json(data);
});

// PUT /api/deliveries/:purchaseOrderId  { status, receivedQuantity, discrepancyNotes }
// Thin wrapper around purchase_orders.delivery_status so the Deliveries
// page can update tracking without touching approvals.
deliveriesRouter.put("/:purchaseOrderId", async (req, res) => {
  const { purchaseOrderId } = req.params;
  const { status, receivedQuantity, discrepancyNotes } = req.body;

  const { data: existing, error: findErr } = await supabase
    .from("purchase_orders")
    .select("*")
    .eq("id", purchaseOrderId)
    .single();
  if (findErr) return res.status(404).json({ message: "Purchase order not found." });

  const update = { updated_at: new Date().toISOString() };
  if (status) update.delivery_status = status;
  const { data, error } = await supabase.from("purchase_orders").update(update).eq("id", purchaseOrderId).select().single();
  if (error) return res.status(500).json({ message: error.message });

  await supabase.from("deliveries").insert({
    purchase_order_id: purchaseOrderId,
    status: status || existing.delivery_status,
    received_quantity: receivedQuantity ?? null,
    discrepancy_notes: discrepancyNotes ?? null,
  });

  if (status && status !== existing.delivery_status) {
    await logAudit("Delivery status updated", `${existing.po_number} · ${status}`);
  }
  if (discrepancyNotes) {
    await logAudit("Delivery delayed", existing.po_number);
  }

  if (status === "Delivered" && existing.product_id) {
    const restockQty = Number(receivedQuantity) || existing.quantity;
    const { data: product } = await supabase.from("products").select("stock").eq("id", existing.product_id).single();
    if (product) {
      await supabase
        .from("products")
        .update({ stock: product.stock + restockQty, updated_at: new Date().toISOString() })
        .eq("id", existing.product_id);
      await logAudit("Inventory restocked from delivery", `${existing.po_number} · +${restockQty}`);
    }
  }

  res.json(data);
});
