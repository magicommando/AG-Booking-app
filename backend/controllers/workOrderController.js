const WorkOrder = require('../models/WorkOrder');
const Appointment = require('../models/Appointment');
const Message = require('../models/Message');
const Billing = require('../models/Billing');
const { storeFileInGridFs } = require('../config/gridfs');

function formatUserName(user) {
  if (!user) return 'Client';
  return `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.fullName || user.name || user.email || 'Client';
}

function buildCompletionMessage(appointment) {
  const clientName = formatUserName(appointment.clientId);
  const firearmMake = appointment.firearmId?.manufacturer || appointment.firearmId?.make || 'Firearm';
  const firearmModel = appointment.firearmId?.model || '';
  const serviceName = appointment.serviceId?.name || appointment.serviceType || 'your service';
  const appointmentDate = appointment.date ? new Date(appointment.date).toLocaleDateString() : 'your appointment date';
  const firearmName = `${firearmMake} ${firearmModel}`.trim();

  return `Hello ${clientName}, your ${firearmName} service (${serviceName}) from ${appointmentDate} has been completed. Please review the work order details and let us know if you have any questions.`;
}

function withWorkOrderRelations(query) {
  return query
    .populate({
      path: 'appointmentId',
      populate: [
        { path: 'firearmId' },
        { path: 'serviceId' },
        { path: 'clientId', select: 'firstName lastName fullName name email' }
      ]
    })
    .populate({ path: 'gunsmithId', select: 'firstName lastName fullName name email' });
}

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
    const { appointmentId } = req.body;

    const appointment = await Appointment.findById(appointmentId)
      .populate('clientId', 'firstName lastName fullName name email')
      .populate('firearmId')
      .populate('serviceId');
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const isOwner = appointment.gunsmithId && String(appointment.gunsmithId) === String(req.user.userId);
    const isAdminOrGunsmith = req.user.role === 'gunsmith' || req.user.role === 'admin';

    if (!isOwner && !isAdminOrGunsmith) {
      return res.status(403).json({ message: 'Forbidden: appointment is not assigned to you' });
    }

    if (appointment.status !== 'approved') {
      return res.status(400).json({ message: 'Only approved appointments can create a work order' });
    }

    const existing = await WorkOrder.findOne({ appointmentId });
    if (existing) {
      const existingWorkOrder = await withWorkOrderRelations(WorkOrder.findById(existing._id));
      return res.status(409).json({ message: 'A work order already exists for this appointment', workOrder: existingWorkOrder });
    }

    const clientName = formatUserName(appointment.clientId);
    const notificationMessage = buildCompletionMessage(appointment);

    const created = await WorkOrder.create({
      appointmentId,
      gunsmithId: req.user.userId,
      clientId: appointment.clientId?._id || appointment.clientId,
      clientName,
      acceptedAt: new Date(),
      partsNeeded: req.body.partsNeeded,
      estimatedTime: req.body.estimatedTime,
      progress: req.body.progress,
      notes: req.body.notes,
      invoice: req.body.invoice,
      completionNotification: {
        email: false,
        sms: false,
        message: notificationMessage
      }
    });

    const workOrder = await withWorkOrderRelations(WorkOrder.findById(created._id));
    res.json({ message: 'Work order created', workOrder });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all work orders for signed-in gunsmith
exports.getWorkOrders = async (req, res) => {
  try {
    const workOrders = await withWorkOrderRelations(
      WorkOrder.find({ gunsmithId: req.user.userId }).sort({ createdAt: -1 })
    );

    res.json(workOrders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get one work order by its id (gunsmith owner only)
exports.getWorkOrderById = async (req, res) => {
  try {
    const workOrder = await withWorkOrderRelations(WorkOrder.findById(req.params.id));
    if (!workOrder) return res.status(404).json({ message: 'Work order not found' });

    if (String(workOrder.gunsmithId?._id || workOrder.gunsmithId) !== String(req.user.userId)) {
      return res.status(403).json({ message: 'Forbidden: not your work order' });
    }

    res.json(workOrder);
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

    const storageResult = await storeFileInGridFs(req.file, {
      userId: req.user?.userId,
      mediaType: 'image'
    });
    workOrder.photoUrl = storageResult.url;
    await workOrder.save();

    res.json({ message: 'Work order photo uploaded', photoUrl: storageResult.url, mediaUrl: storageResult.url, workOrder });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.getWorkOrder = async (req, res) => {
  try {
    const workOrder = await withWorkOrderRelations(
      WorkOrder.findOne({ appointmentId: req.params.appointmentId })
    );

    if (!workOrder) return res.status(404).json({ message: 'Work order not found' });

    if (String(workOrder.gunsmithId?._id || workOrder.gunsmithId) !== String(req.user.userId)) {
      return res.status(403).json({ message: 'Forbidden: not your work order' });
    }

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

    const updatePayload = {
      ...(req.body.partsNeeded !== undefined ? { partsNeeded: req.body.partsNeeded } : {}),
      ...(req.body.estimatedTime !== undefined ? { estimatedTime: req.body.estimatedTime } : {}),
      ...(req.body.progress !== undefined ? { progress: req.body.progress } : {}),
      ...(req.body.notes !== undefined ? { notes: req.body.notes } : {}),
      ...(req.body.invoice !== undefined ? { invoice: req.body.invoice } : {}),
      ...(req.body.completionNotification !== undefined ? { completionNotification: req.body.completionNotification } : {})
    };

    const updated = await withWorkOrderRelations(
      WorkOrder.findByIdAndUpdate(req.params.id, updatePayload, { new: true })
    );
    res.json({ message: 'Work order updated', workOrder: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.completeWorkOrder = async (req, res) => {
  try {
    const workOrder = await WorkOrder.findById(req.params.id);
    if (!workOrder) return res.status(404).json({ message: 'Work order not found' });

    if (workOrder.gunsmithId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Forbidden: not your work order' });
    }

    const appointment = await Appointment.findById(workOrder.appointmentId)
      .populate('clientId', 'firstName lastName fullName name email')
      .populate('firearmId')
      .populate('serviceId');

    const requestedChannels = req.body?.notification || req.body?.completionNotification || {};
    const emailRequested = Boolean(requestedChannels.email);
    const smsRequested = Boolean(requestedChannels.sms);
    const customMessage = typeof requestedChannels.message === 'string' && requestedChannels.message.trim()
      ? requestedChannels.message.trim()
      : null;
    const generatedMessage = customMessage || buildCompletionMessage(appointment);

    workOrder.progress = 'completed';
    workOrder.estimatedTime = laborHours;
    workOrder.partsNeeded = Array.isArray(req.body?.partsNeeded) ? req.body.partsNeeded : workOrder.partsNeeded;
    workOrder.notes = typeof req.body?.notes === 'string' ? req.body.notes : workOrder.notes;
    workOrder.invoice = {
      ...(workOrder.invoice || {}),
      laborTime: laborHours,
      partsCost,
      total
    };
    workOrder.completionNotification = {
      email: emailRequested,
      sms: smsRequested,
      message: generatedMessage
    };
    await workOrder.save();

    const laborHours = Number(req.body?.laborTime ?? workOrder.invoice?.laborTime ?? workOrder.estimatedTime ?? 0);
    const partsCost = Number(req.body?.partsCost ?? workOrder.invoice?.partsCost ?? 0);
    const total = Number(req.body?.total ?? workOrder.invoice?.total ?? (laborHours * 100 + partsCost));

    const existingInvoice = await Billing.findOne({ workOrderId: workOrder._id });
    if (!existingInvoice) {
      const invoiceNumber = `INV-${String((await Billing.countDocuments()) + 1).padStart(4, '0')}`;
      await Billing.create({
        invoiceNumber,
        workOrderId: workOrder._id,
        clientId: workOrder.clientId,
        gunsmithId: workOrder.gunsmithId,
        customerName: workOrder.clientName || appointment?.clientId?.fullName || appointment?.clientId?.name || 'Client',
        items: [
          {
            type: 'labor',
            description: 'Labor',
            qty: laborHours || 1,
            unitPrice: 100,
            lineTotal: laborHours * 100
          },
          ...(partsCost > 0 ? [{
            type: 'part',
            description: 'Parts',
            qty: 1,
            unitPrice: partsCost,
            lineTotal: partsCost
          }] : [])
        ],
        subtotal: laborHours * 100 + partsCost,
        tax: 0,
        total,
        status: 'draft'
      });
    }

    if (appointment?.clientId && (emailRequested || smsRequested)) {
      await Message.create({
        sender: req.user.userId,
        recipient: appointment.clientId._id || appointment.clientId,
        appointmentId: appointment._id,
        content: generatedMessage,
        attachments: []
      });
    }

    const updated = await withWorkOrderRelations(WorkOrder.findById(req.params.id));
    res.json({
      message: 'Work order marked as completed',
      workOrder: updated,
      notification: {
        emailRequested,
        smsRequested,
        message: generatedMessage
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
