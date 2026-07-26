import { Router } from "express";
import { supabase } from "../supabaseClient.js";
import { logAudit } from "./auditTrail.js";

export const approvalsRouter = Router();

// GET /api/approvals - purchase orders currently pending approval
approvalsRouter.get("/", async (req, res) => {
  const { data, error } = await supabase
    .from("purchase_orders")
    .select("*")
    .in("approval_status", ["Pending", "Draft"])
    .order("created_at", { ascending: false });
  if (error) return res.status(500).json({ message: error.message });
  res.json(data);
});

// POST /api/approvals  { purchaseOrderId, decision, department, comment }
approvalsRouter.post("/", async (req, res) => {
  const { purchaseOrderId, decision, department, comment } = req.body;

  const { data: approval, error } = await supabase
    .from("approvals")
    .insert({ purchase_order_id: purchaseOrderId, department, decision, comment })
    .select()
    .single();
  if (error) return res.status(500).json({ message: error.message });

  const newStatus = decision === "Approved" ? "Approved" : decision === "Rejected" ? "Rejected" : "Pending";
  const { data: po } = await supabase
    .from("purchase_orders")
    .update({ approval_status: newStatus, updated_at: new Date().toISOString() })
    .eq("id", purchaseOrderId)
    .select()
    .single();

  await logAudit(`Purchase order ${newStatus.toLowerCase()}`, po?.po_number || purchaseOrderId);

  res.status(201).json({ approval, purchaseOrder: po });
});

// POST /api/approvals/bulk  { purchaseOrderIds: [] }  - submit drafts for approval
approvalsRouter.post("/bulk", async (req, res) => {
  const { purchaseOrderIds = [] } = req.body;
  if (!purchaseOrderIds.length) return res.status(400).json({ message: "No purchase orders selected." });

  const { error } = await supabase
    .from("purchase_orders")
    .update({ approval_status: "Pending", updated_at: new Date().toISOString() })
    .in("id", purchaseOrderIds);
  if (error) return res.status(500).json({ message: error.message });

  await logAudit("Bulk approval submission", `${purchaseOrderIds.length} purchase orders submitted.`);
  res.json({ submitted: purchaseOrderIds.length });
});
