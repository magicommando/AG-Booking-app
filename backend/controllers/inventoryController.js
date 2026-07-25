const Inventory = require('../models/Inventory');
const AILog = require('../models/AILog');

// Add item (gunsmith only)
exports.addItem = async (req, res) => {
  try {
    const item = await Inventory.create({
      ...req.body,
      gunsmithId: req.user.userId
    });
    res.json({ message: 'Item added', item });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getInventory = async (req, res) => {
  try {

    
    const items = await Inventory.find({ gunsmithId: req.params.gunsmithId });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update item (gunsmith only, own items + low-stock AI log)
exports.updateItem = async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    if (item.gunsmithId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Forbidden: not your inventory item' });
    }

    const updates = { ...req.body };

    if (typeof updates.quantity === 'number') {
      updates.lowStockAlert = updates.quantity <= 2;

      if (updates.lowStockAlert) {
        await AILog.create({
          userId: req.user.userId,
          firearmId: null,
          inputText: `Inventory low: ${item.productName}`,
          aiResponse: `Recommended reorder for ${item.productName}. Current quantity: ${updates.quantity}.`
        });
      }
    }

    const updatedItem = await Inventory.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json({ message: 'Item updated', item: updatedItem });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete item (gunsmith only, own items)
exports.deleteItem = async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    if (item.gunsmithId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Forbidden: not your inventory item' });
    }

    await Inventory.findByIdAndDelete(req.params.id);
    res.json({ message: 'Item deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
