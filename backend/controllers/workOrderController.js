const WorkOrder = require('../models/WorkOrder');

exports.autoFillWorkOrder = async (req, res) => {
  try {
    const { appointmentId, aiData } = req.body;

    const workOrder = await WorkOrder.findOneAndUpdate(
      { appointmentId },
      {
        partsNeeded: aiData.parts,
        estimatedTime: aiData.laborTime,
        notes: aiData.diagnostics.join(", "),
        invoice: {
          laborTime: aiData.laborTime,
          partsCost: aiData.parts.length * 20, // placeholder
          total: aiData.parts.length * 20 + aiData.laborTime * 50
        }
      },
      { new: true }
    );

    res.json({
      message: "Work order auto-filled using AI",
      workOrder
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create work order (gunsmith only, for their appointment)
exports.createWorkOrder = async (req, res) => {
  try {
    const workOrder = await WorkOrder.create({
      ...req.body,
      gunsmithId: req.user.userId
    });
    res.json({ message: 'Work order created', workOrder });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// upload photo for a work order (gunsmith only, own work orders)
exports.uploadPhoto = async (req, res) => {
  try {
    const workOrder = await WorkOrder.findById(req.params.id);
    if (!workOrder) return res.status(404).json({ message: 'Work order not found' });

    if (workOrder.gunsmithId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Forbidden: not your work order' });
    }

    workOrder.photoUrl = `/uploads/${req.file.filename}`;
    await workOrder.save();

    res.json({ message: 'Work order photo uploaded', workOrder });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.getWorkOrder = async (req, res) => {
  try {
    const workOrder = await WorkOrder.findOne({ appointmentId: req.params.appointmentId });
    res.json(workOrder);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update work order (gunsmith only, own work orders)
exports.updateWorkOrder = async (req, res) => {
  try {
    const workOrder = await WorkOrder.findById(req.params.id);
    if (!workOrder) return res.status(404).json({ message: 'Work order not found' });

    if (workOrder.gunsmithId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Forbidden: not your work order' });
    }

    const updated = await WorkOrder.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ message: 'Work order updated', workOrder: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
