const Service = require('../models/Service');

// Add service (gunsmith only)
exports.addService = async (req, res) => {
  try {
    const service = await Service.create({
      ...req.body,
      gunsmithId: req.user.userId
    });
    res.json({ message: 'Service added', service });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get services for a gunsmith (public or auth, depending on your routes)
exports.getGunsmithServices = async (req, res) => {
  try {
    const { gunsmithId } = req.params;
    const services = await Service.find({ gunsmithId });
    res.json(services);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
