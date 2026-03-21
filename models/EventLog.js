const mongoose = require('mongoose');

const eventLogSchema = new mongoose.Schema({
  paymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment'
  },
  action: {
    type: String,
    required: true
  },
  user: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  hash: {
    type: String,
    required: true
  },
  txHash: {
    type: String,
    default: null
  }
});

module.exports = mongoose.model('EventLog', eventLogSchema);
