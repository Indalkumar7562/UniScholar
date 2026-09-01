const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userName: { type: String, default: 'Admin' },
    role: { type: String, default: 'admin' },
    action: { type: String, required: true },
    targetType: { type: String, default: 'General' },
    targetId: { type: String, default: '' },
    previousStatus: { type: String, default: '' },
    newStatus: { type: String, default: '' },
    remarks: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AuditLog', auditLogSchema);
