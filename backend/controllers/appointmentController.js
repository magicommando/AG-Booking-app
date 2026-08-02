const Appointment = require('../models/Appointment');

exports.createAppointment = async (req, res) => {
  try {
    const {
      firearmId,
      gunsmithId,
      serviceId,
      service,
      serviceType,
      date,
      time,
      appointmentDate,
      notes
    } = req.body;

    const resolvedDate = appointmentDate || (date && time ? `${date}T${time}` : date);

    if (!resolvedDate) {
      return res.status(400).json({ message: 'date or appointmentDate is required' });
    }

    const appointment = await Appointment.create({
      clientId: req.user.userId,
      firearmId,
      gunsmithId,
      serviceId,
      serviceType: serviceType || service,
      date: new Date(resolvedDate),
      notes
    });

    res.json({ message: 'Appointment created', appointment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get client appointments (client: self only, gunsmith or admin may access)
exports.getClientAppointments = async (req, res) => {
  try {
    const { clientId } = req.params;

    if (req.user.role === 'client' && String(req.user.userId) !== String(clientId)) {
      return res.status(403).json({ message: 'Forbidden: cannot view another client’s appointments' });
    }

    const appointments = await Appointment.find({ clientId })
      .populate('firearmId')
      .populate('serviceId')
      .populate('gunsmithId');

    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get gunsmith appointments (gunsmith: self only)
exports.getGunsmithAppointments = async (req, res) => {
  try {
    const { gunsmithId } = req.params;

    if (req.user.role === 'gunsmith' && String(req.user.userId) !== String(gunsmithId)) {
      return res.status(403).json({ message: 'Forbidden: cannot view another gunsmith’s appointments' });
    }

    const appointments = await Appointment.find({
      $or: [
        { gunsmithId },
        { gunsmithId: null, status: 'pending' }
      ]
    })
      .populate('firearmId')
      .populate('serviceId')
      .populate('clientId');

    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findById(id)
      .populate('firearmId')
      .populate('serviceId')
      .populate('clientId')
      .populate('gunsmithId');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const isClientOwner = String(appointment.clientId?._id || appointment.clientId) === String(req.user.userId);
    const isGunsmithOwner = appointment.gunsmithId && String(appointment.gunsmithId?._id || appointment.gunsmithId) === String(req.user.userId);

    if (req.user.role === 'client' && !isClientOwner) {
      return res.status(403).json({ message: 'Forbidden: not your appointment' });
    }

    const isUnassignedPending = !appointment.gunsmithId && appointment.status === 'pending';

    if (req.user.role === 'gunsmith' && !isGunsmithOwner && !isUnassignedPending) {
      return res.status(403).json({ message: 'Forbidden: not your appointment' });
    }

    res.json(appointment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateAppointmentByClient = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    if (String(appointment.clientId) !== String(req.user.userId)) {
      return res.status(403).json({ message: 'Forbidden: not your appointment' });
    }

    if (appointment.status === 'completed' || appointment.status === 'cancelled') {
      return res.status(400).json({ message: 'This appointment can no longer be updated' });
    }

    const {
      firearmId,
      serviceId,
      service,
      serviceType,
      date,
      time,
      appointmentDate,
      notes
    } = req.body;

    const resolvedDate = appointmentDate || (date && time ? `${date}T${time}` : date);

    if (resolvedDate) {
      appointment.date = new Date(resolvedDate);
    }

    if (firearmId) appointment.firearmId = firearmId;
    if (serviceId) appointment.serviceId = serviceId;
    if (serviceType || service) appointment.serviceType = serviceType || service;
    if (notes !== undefined) appointment.notes = notes;

    await appointment.save();

    res.json({ message: 'Appointment updated', appointment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    if (String(appointment.clientId) !== String(req.user.userId)) {
      return res.status(403).json({ message: 'Forbidden: not your appointment' });
    }

    appointment.status = 'cancelled';
    await appointment.save();

    res.json({ message: 'Appointment cancelled', appointment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update appointment status (gunsmith only, own appointments)
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    if (!appointment.gunsmithId || appointment.gunsmithId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Forbidden: not your appointment' });
    }

    appointment.status = req.body.status;
    await appointment.save();

    res.json({ message: 'Appointment status updated', appointment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateAppointmentByAdmin = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    const canClaim = !appointment.gunsmithId && appointment.status === 'pending';
    const isOwner = appointment.gunsmithId && appointment.gunsmithId.toString() === req.user.userId;

    if (!canClaim && !isOwner) {
      return res.status(403).json({ message: 'Forbidden: not your appointment' });
    }

    if (canClaim) {
      appointment.gunsmithId = req.user.userId;
    }

    const {
      status,
      date,
      time,
      appointmentDate,
      notes
    } = req.body;

    const resolvedDate = appointmentDate || (date && time ? `${date}T${time}` : date);

    if (status) {
      appointment.status = status;
    }

    if (resolvedDate) {
      appointment.date = new Date(resolvedDate);
    }

    if (notes !== undefined) {
      appointment.notes = notes;
    }

    await appointment.save();

    res.json({ message: 'Appointment updated', appointment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addAppointmentNotes = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { notes: req.body.notes },
      { new: true }
    );
    res.json({ message: 'Notes added', appointment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
