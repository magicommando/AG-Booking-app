const Appointment = require('../models/Appointment');

exports.createAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.create(req.body);
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

    const appointments = await Appointment.find({ gunsmithId })
      .populate('firearmId')
      .populate('serviceId')
      .populate('clientId');

    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update appointment status (gunsmith only, own appointments)
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    if (appointment.gunsmithId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Forbidden: not your appointment' });
    }

    appointment.status = req.body.status;
    await appointment.save();

    res.json({ message: 'Appointment status updated', appointment });
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
