const Appointment = require('../models/Appointment');

exports.createAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.create(req.body);
    res.json({ message: 'Appointment created', appointment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getClientAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ clientId: req.params.clientId })
      .populate('firearmId')
      .populate('serviceId')
      .populate('gunsmithId');
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getGunsmithAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ gunsmithId: req.params.gunsmithId })
      .populate('firearmId')
      .populate('serviceId')
      .populate('clientId');
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateAppointmentStatus = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.json({ message: 'Status updated', appointment });
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
