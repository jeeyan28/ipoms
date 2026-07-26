import { Router } from "express";
import { supabase } from "../supabaseClient.js";
import { logAudit } from "./auditTrail.js";

export const purchaseOrdersRouter = Router();

const nextPoNumber = async () => {
  const { count } = await supabase.from("purchase_orders").select("*", { count: "exact", head: true });
  const year = new Date().getFullYear();
  return `PO-${year}-${1000 + (count || 0) + 1}`;
};

// GET /api/purchase-orders
purchaseOrdersRouter.get("/", async (req, res) => {
  const { data, error } = await supabase
    .from("purchase_orders")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return res.status(500).json({ message: error.message });
  res.json(data);
});

// POST /api/purchase-orders  { productId, itemName, supplierId, supplierName, quantity, unitPrice, notes }
purchaseOrdersRouter.post("/", async (req, res) => {
  const { productId, itemName, supplierId, supplierName, quantity, unitPrice, notes } = req.body;
  const qty = Number(quantity) || 0;
  const price = Number(unitPrice) || 0;
  const poNumber = await nextPoNumber();

  const { data, error } = await supabase
    .from("purchase_orders")
    .insert({
      po_number: poNumber,
      product_id: productId || null,
      item_name: itemName,
      supplier_id: supplierId || null,
      supplier_name: supplierName,
      quantity: qty,
      unit_price: price,
      total: qty * price,
      notes,
    })
    .select()
    .single();
  if (error) return res.status(500).json({ message: error.message });
  await logAudit("Purchase order created", poNumber);
  res.status(201).json(data);
});

// PUT /api/purchase-orders/:id  { approvalStatus?, deliveryStatus?, quantity?, supplierName?, notes?, receivedQuantity? }
// This is also the integration point: when deliveryStatus flips to "Delivered",
// the linked product's stock in the shared `products` table is increased.
purchaseOrdersRouter.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { approvalStatus, deliveryStatus, quantity, supplierName, notes, receivedQuantity } = req.body;

  const { data: existing, error: findErr } = await supabase
    .from("purchase_orders")
    .select("*")
    .eq("id", id)
    .single();
  if (findErr) return res.status(404).json({ message: "Purchase order not found." });

  const update = { updated_at: new Date().toISOString() };
  if (approvalStatus) update.approval_status = approvalStatus;
  if (deliveryStatus) update.delivery_status = deliveryStatus;
  if (quantity !== undefined) {
    update.quantity = Number(quantity);
    update.total = Number(quantity) * existing.unit_price;
  }
  if (supplierName) update.supplier_name = supplierName;
  if (notes !== undefined) update.notes = notes;

  const { data, error } = await supabase.from("purchase_orders").update(update).eq("id", id).select().single();
  if (error) return res.status(500).json({ message: error.message });

  if (approvalStatus && approvalStatus !== existing.approval_status) {
    await logAudit(`Purchase order ${approvalStatus.toLowerCase()}`, data.po_number);
  }

  if (deliveryStatus && deliveryStatus !== existing.delivery_status) {
    await logAudit("Delivery status updated", `${data.po_number} · ${deliveryStatus}`);

    // restock shared inventory once a delivery is marked as Delivered
    if (deliveryStatus === "Delivered" && existing.product_id) {
      const restockQty = Number(receivedQuantity) || data.quantity;
      const { data: product } = await supabase.from("products").select("stock").eq("id", existing.product_id).single();
      if (product) {
        await supabase
          .from("products")
          .update({ stock: product.stock + restockQty, updated_at: new Date().toISOString() })
          .eq("id", existing.product_id);
        await logAudit("Inventory restocked from delivery", `${data.po_number} · +${restockQty}`);
      }
    }
  }

  res.json(data);
});
