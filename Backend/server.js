import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { suppliersRouter } from "./src/routes/suppliers.js";
import { inventoryRouter } from "./src/routes/inventory.js";
import { purchaseOrdersRouter } from "./src/routes/purchaseOrders.js";
import { deliveriesRouter } from "./src/routes/deliveries.js";
import { approvalsRouter } from "./src/routes/approvals.js";
import { auditTrailRouter } from "./src/routes/auditTrail.js";
import { dashboardRouter } from "./src/routes/dashboard.js";

dotenv.config();

const app = express();
app.use(cors()); // wide open on purpose - no auth/security layer requested
app.use(express.json());

app.get("/", (req, res) => res.json({ ok: true, service: "ipoms-api" }));

app.use("/api/suppliers", suppliersRouter);
app.use("/api/inventory", inventoryRouter);
app.use("/api/purchase-orders", purchaseOrdersRouter);
app.use("/api/deliveries", deliveriesRouter);
app.use("/api/approvals", approvalsRouter);
app.use("/api/audit-trail", auditTrailRouter);
app.use("/api/dashboard", dashboardRouter);

const PORT = process.env.PORT || 4002;
if (process.env.VERCEL !== "1") {
  app.listen(PORT, () => console.log(`ipoms-api listening on http://localhost:${PORT}`));
}

export default app;
