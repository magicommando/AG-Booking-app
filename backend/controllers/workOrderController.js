const WorkOrder = require('../models/WorkOrder');

exports.createWorkOrder = async (req, res) => {
  try {
    const workOrder = await WorkOrder.create(req.body);
    res.json({ message: 'Work order created', workOrder });
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

exports.updateWorkOrder = async (req, res) => {
  try {
    const workOrder = await WorkOrder.findOneAndUpdate(
      { appointmentId: req.params.appointmentId },
      req.body,
      { new: true }
    );
    res.json({ message: 'Work order updated', workOrder });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
