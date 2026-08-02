const Appointment = require('../models/Appointment');
const ScheduleDay = require('../models/ScheduleDay');

const DEFAULT_SLOTS = [
  '09:00', '09:30',
  '10:00', '10:30',
  '11:00', '11:30',
  '12:00', '12:30',
  '13:00', '13:30',
  '14:00', '14:30',
  '15:00', '15:30',
  '16:00', '16:30'
];

function parseDayBounds(day) {
  const start = new Date(`${day}T00:00:00.000Z`);
  const end = new Date(`${day}T23:59:59.999Z`);
  return { start, end };
}

function toHHmm(dateValue) {
  const d = new Date(dateValue);
  if (Number.isNaN(d.getTime())) return null;
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

exports.getScheduleForDay = async (req, res) => {
  try {
    const { gunsmithId, day } = req.params;
    const { start, end } = parseDayBounds(day);

    const appointments = await Appointment.find({
      gunsmithId,
      date: { $gte: start, $lte: end },
      status: { $nin: ['denied', 'cancelled'] }
    }).select('date status');

    const bookedSet = new Set(
      appointments
        .map((appt) => toHHmm(appt.date))
        .filter(Boolean)
    );

    const override = await ScheduleDay.findOne({ gunsmithId, day });
    const blockedSet = new Set(override?.unavailableTimes || []);

    const slots = DEFAULT_SLOTS.map((time) => {
      const booked = bookedSet.has(time);
      const blocked = blockedSet.has(time);

      return {
        time,
        available: !booked && !blocked,
        booked,
        blocked
      };
    });

    res.json(slots);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.saveScheduleForDay = async (req, res) => {
  try {
    const { gunsmithId, day } = req.params;

    if (req.user.role !== 'gunsmith' || String(req.user.userId) !== String(gunsmithId)) {
      return res.status(403).json({ message: 'Forbidden: cannot modify another gunsmith schedule' });
    }

    const slots = Array.isArray(req.body) ? req.body : req.body?.slots;
    if (!Array.isArray(slots)) {
      return res.status(400).json({ message: 'slots array is required' });
    }

    const unavailableTimes = slots
      .filter((slot) => slot && slot.time && slot.available === false)
      .map((slot) => slot.time);

    const schedule = await ScheduleDay.findOneAndUpdate(
      { gunsmithId, day },
      { unavailableTimes },
      { new: true, upsert: true }
    );

    res.json({
      message: 'Schedule updated',
      schedule
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
