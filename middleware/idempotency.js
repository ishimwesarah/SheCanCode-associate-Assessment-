import store from "../store.js";

export const idempotencyMiddleware = (req, res, next) => {
  const key = req.headers["idempotency-key"];
  if (!key) {
    return res.status(400).json({ error: "Missing Idempotency-Key header" });
  }

  if (store.has(key)) {
    const record = store.get(key);

    // If still processing → wait
    if (record.status === "processing") {
      record.waiters.push(res);
      return;
    }

    // Fraud/Error check: same key but different body
    if (JSON.stringify(record.requestBody) !== JSON.stringify(req.body)) {
      return res.status(422).json({
        error: "Idempotency key already used for a different request body."
      });
    }

    // Same key + same body → return cached response
    res.setHeader("X-Cache-Hit", "true");
    return res.status(record.response.status).json(record.response.body);
  }

  // First time → mark as processing
  store.set(key, { status: "processing", waiters: [], requestBody: req.body });
  req.idempotencyKey = key;
  next();
};
