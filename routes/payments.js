const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const EventLog = require('../models/EventLog');
const { generateHash } = require('../utils/hash');
const { registerHashOnChain } = require('../utils/blockchain');

router.post('/', async (req, res) => {
  const { amount, description, createdBy } = req.body;
  const payment = await Payment.create({ amount, description, createdBy });
  res.json(payment);
});

router.get('/', async (req, res) => {
  const payments = await Payment.find().sort({ createdAt: -1 });
  res.json(payments);
});

router.put('/:id/status', async (req, res) => {
  const { status, user } = req.body;
  
  const payment = await Payment.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  );
  
  const eventData = {
    paymentId: payment._id,
    action: status === 'approved' ? 'APPROVED_PAYMENT' : 'REJECTED_PAYMENT',
    user,
    timestamp: new Date().toISOString(),
    amount: payment.amount,
    description: payment.description
  };
  
  const hash = generateHash(eventData);
  
  const event = await EventLog.create({ ...eventData, hash });
  
  try {
    const txHash = await registerHashOnChain(hash);
    await EventLog.findByIdAndUpdate(event._id, { txHash });
  } catch (error) {
    console.error(error.message);
  }
  
  res.json({ payment, event });
});

router.get('/verify/:eventId', async (req, res) => {
  const event = await EventLog.findById(req.params.eventId);
  const payment = await Payment.findById(event.paymentId);
  
  const reconstructedData = {
    paymentId: payment._id,
    action: event.action,
    user: event.user,
    timestamp: event.timestamp.toISOString(),
    amount: payment.amount,
    description: payment.description
  };
  
  const currentHash = generateHash(reconstructedData);
  const isValid = currentHash === event.hash;
  
  res.json({
    isValid,
    originalHash: event.hash,
    currentHash,
    event,
    payment
  });
});

module.exports = router;
