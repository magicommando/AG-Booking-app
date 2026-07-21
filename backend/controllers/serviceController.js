const Service = require('../models/Service');

exports.addService = async (req, res) => {
  try {
    const service = await Service.create(req.body);
    res.json({ message: 'Service added', service });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getServices = async (req, res) => {
  try {
    const services = await Service.find({});
    res.json(services);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
