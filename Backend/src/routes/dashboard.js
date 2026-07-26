import { Router } from "express";
import { supabase } from "../supabaseClient.js";

export const dashboardRouter = Router();

dashboardRouter.get("/", async (req, res) => {
  const { data: products, error: pErr } = await supabase.from("products").select("*").eq("archived", false);
  if (pErr) return res.status(500).json({ message: pErr.message });

  const { data: orders, error: oErr } = await supabase.from("purchase_orders").select("*");
  if (oErr) return res.status(500).json({ message: oErr.message });

  const lowStock = products.filter((p) => p.stock <= p.minimum);
  const pendingApprovals = orders.filter((o) => o.approval_status === "Pending");
  const openOrders = orders.filter((o) => o.delivery_status !== "Delivered");
  const inboundValue = openOrders.reduce((sum, o) => sum + Number(o.total), 0);

  res.json({
    lowStockCount: lowStock.length,
    pendingApprovalsCount: pendingApprovals.length,
    openOrdersCount: openOrders.length,
    inboundValue,
    lowStockItems: lowStock.slice(0, 10),
    recentOrders: orders.slice(0, 10),
  });
});
