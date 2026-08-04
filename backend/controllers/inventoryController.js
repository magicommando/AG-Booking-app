const Inventory = require('../models/Inventory');
const AILog = require('../models/AILog');
const User = require('../models/User');

function toInventoryPayload(body = {}) {
  const payload = {};

  if (body.productName !== undefined || body.name !== undefined) {
    payload.productName = body.productName ?? body.name;
  }

  if (body.category !== undefined) payload.category = body.category;
  if (body.location !== undefined) payload.location = body.location;
  if (body.notes !== undefined) payload.notes = body.notes;
  if (body.brand !== undefined) payload.brand = body.brand;

  if (body.partNumber !== undefined || body.sku !== undefined) {
    payload.partNumber = body.partNumber ?? body.sku;
  }

  if (body.vendor !== undefined || body.supplier !== undefined) {
    payload.vendor = body.vendor ?? body.supplier;
  }

  if (body.price !== undefined || body.cost !== undefined) {
    payload.price = body.price ?? body.cost;
  }

  if (body.quantity !== undefined) {
    payload.quantity = Number(body.quantity);
    payload.lowStockAlert = Number(body.quantity) <= 2;
  }

  return payload;
}

function toInventoryResponse(item) {
  return {
    _id: item._id,
    gunsmithId: item.gunsmithId,
    name: item.productName,
    productName: item.productName,
    category: item.category || '',
    quantity: item.quantity,
    location: item.location || '',
    notes: item.notes || '',
    sku: item.partNumber || '',
    partNumber: item.partNumber || '',
    supplier: item.vendor || '',
    vendor: item.vendor || '',
    cost: item.price,
    price: item.price,
    lowStockAlert: item.lowStockAlert,
    partOrders: Array.isArray(item.partOrders)
      ? item.partOrders
          .slice()
          .sort((a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime())
          .map((order) => ({
            _id: order._id,
            quantity: order.quantity,
            supplier: order.supplier || '',
            notes: order.notes || '',
            status: order.status,
            signedByUserId: order.signedByUserId,
            signedByName: order.signedByName,
            placedAt: order.placedAt
          }))
      : [],
    createdAt: item.createdAt,
    updatedAt: item.updatedAt
  };
}

function canAccessInventory(reqUser, item) {
  if (!reqUser || !item) return false;
  if (reqUser.role === 'admin' || reqUser.role === 'gunsmith') return true;
  return false;
}

// Add item (gunsmith/admin shared inventory)
exports.addItem = async (req, res) => {
  try {
    const payload = toInventoryPayload(req.body);

    if (!payload.productName || !String(payload.productName).trim()) {
      return res.status(400).json({ message: 'name is required' });
    }

    const item = await Inventory.create({
      ...payload,
      gunsmithId: req.user.userId
    });

    res.json({ message: 'Item added', item: toInventoryResponse(item) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getInventory = async (req, res) => {
  try {
    const isStaff = req.user?.role === 'admin' || req.user?.role === 'gunsmith';
    const filter = isStaff ? {} : { gunsmithId: req.user.userId };
    const items = await Inventory.find(filter).sort({ createdAt: -1 });
    res.json(items.map(toInventoryResponse));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getInventoryItem = async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    if (!canAccessInventory(req.user, item)) {
      return res.status(403).json({ message: 'Forbidden: not your inventory item' });
    }

    res.json(toInventoryResponse(item));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update item (shared inventory for admins, own items for gunsmiths + low-stock AI log)
exports.updateItem = async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    if (!canAccessInventory(req.user, item)) {
      return res.status(403).json({ message: 'Forbidden: not your inventory item' });
    }

    const updates = toInventoryPayload(req.body);

    if (typeof updates.quantity === 'number') {
      updates.lowStockAlert = updates.quantity <= 2;

      if (updates.lowStockAlert) {
        await AILog.create({
          userId: req.user.userId,
          firearmId: null,
          inputText: `Inventory low: ${updates.productName || item.productName}`,
          aiResponse: `Recommended reorder for ${updates.productName || item.productName}. Current quantity: ${updates.quantity}.`
        });
      }
    }

    const updatedItem = await Inventory.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json({ message: 'Item updated', item: toInventoryResponse(updatedItem) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete item (shared inventory for admins, own items for gunsmiths)
exports.deleteItem = async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    if (!canAccessInventory(req.user, item)) {
      return res.status(403).json({ message: 'Forbidden: not your inventory item' });
    }

    await Inventory.findByIdAndDelete(req.params.id);
    res.json({ message: 'Item deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Place a parts order for an inventory item (shared inventory for admins, own items for gunsmiths)
exports.placeOrder = async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    if (!canAccessInventory(req.user, item)) {
      return res.status(403).json({ message: 'Forbidden: not your inventory item' });
    }

    const quantity = Number(req.body.quantity);
    if (!Number.isFinite(quantity) || quantity <= 0) {
      return res.status(400).json({ message: 'quantity must be a number greater than 0' });
    }

    const signer = await User.findById(req.user.userId).select('firstName lastName email');
    const signedByName = signer
      ? `${signer.firstName || ''} ${signer.lastName || ''}`.trim() || signer.email || 'Unknown gunsmith'
      : 'Unknown gunsmith';

    item.partOrders.push({
      quantity,
      supplier: req.body.supplier || item.vendor || '',
      notes: req.body.notes || '',
      status: 'placed',
      signedByUserId: req.user.userId,
      signedByName,
      placedAt: new Date()
    });

    await item.save();

    const latestOrder = item.partOrders[item.partOrders.length - 1];
    res.json({
      message: 'Parts order placed',
      order: {
        _id: latestOrder._id,
        quantity: latestOrder.quantity,
        supplier: latestOrder.supplier || '',
        notes: latestOrder.notes || '',
        status: latestOrder.status,
        signedByUserId: latestOrder.signedByUserId,
        signedByName: latestOrder.signedByName,
        placedAt: latestOrder.placedAt
      },
      item: toInventoryResponse(item)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
