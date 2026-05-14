import express from "express";
import store from "../store.js";

const router = express.Router();

router.post("/process-payment", async (req, res) => {
  const key = req.idempotencyKey;
  const payload = req.body;

  // Simulate payment delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  const response = {
    status: 201,
    body: { message: `Charged ${payload.amount} ${payload.currency}` }
  };

  // Save result
  const record = store.get(key);
  record.status = "done";
  record.response = response;

  // Respond to waiting clients
  record.waiters.forEach(waiter => {
    waiter.setHeader("X-Cache-Hit", "true");
    waiter.status(response.status).json(response.body);
  });

  return res.status(response.status).json(response.body);
});

export default router;
