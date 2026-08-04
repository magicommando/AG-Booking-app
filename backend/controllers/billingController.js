const Billing = require('../models/Billing');
const WorkOrder = require('../models/WorkOrder');

function serializeInvoice(invoice) {
  if (!invoice) return null;

  if (typeof invoice.toObject === 'function') {
    return {
      ...invoice.toObject(),
      invoiceNumber: invoice.invoiceNumber || 'INV-0000'
    };
  }

  return {
    ...invoice,
    invoiceNumber: invoice.invoiceNumber || 'INV-0000'
  };
}

async function buildInvoiceNumber() {
  const count = (await Billing.countDocuments()) || 0;
  return `INV-${String(count + 1).padStart(4, '0')}`;
}

exports.createInvoice = async (req, res) => {
  try {
    const { workOrderId, clientId, gunsmithId, customerName, items = [], notes } = req.body;

    const subtotal = (items || []).reduce((sum, item) => sum + Number(item.lineTotal || item.qty * item.unitPrice || 0), 0);
    const tax = 0;
    const total = subtotal + tax;

    const invoice = await Billing.create({
      invoiceNumber: await buildInvoiceNumber(),
      workOrderId,
      clientId,
      gunsmithId: gunsmithId || req.user?.userId,
      customerName,
      items: (items || []).map((item) => ({
        ...item,
        lineTotal: Number(item.lineTotal || item.qty * item.unitPrice || 0)
      })),
      subtotal,
      tax,
      total,
      notes,
      status: 'draft'
    });

    if (workOrderId) {
      try {
        const existingWorkOrder = await WorkOrder.findById(workOrderId);
        if (existingWorkOrder) {
          const laborHours = (items || []).filter((item) => item.type === 'labor').reduce((sum, item) => sum + Number(item.qty || 0), 0);
          await WorkOrder.findByIdAndUpdate(workOrderId, {
            $set: {
              invoice: {
                ...(existingWorkOrder.invoice || {}),
                total,
                laborTime: laborHours
              }
            }
          }, { new: true });
        }
      } catch (workOrderError) {
        // Keep invoice creation successful even if the work order linkage is unavailable.
        console.warn('Invoice work order update skipped:', workOrderError.message);
      }
    }

    res.status(201).json({ message: 'Invoice created', invoice: serializeInvoice(invoice) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateInvoice = async (req, res) => {
  try {
    const invoice = await Billing.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    res.json({ message: 'Invoice updated', invoice: serializeInvoice(invoice) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getInvoices = async (req, res) => {
  try {
    const query = req.user?.role === 'client' ? { clientId: req.user.userId } : {};
    const invoices = await Billing.find(query).sort({ createdAt: -1 });
    res.json(invoices.map(serializeInvoice));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.payInvoice = async (req, res) => {
  try {
    const { paymentMethod, receiptNumber, note, paidBy } = req.body;
    const invoice = await Billing.findById(req.params.id);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

    invoice.status = 'paid';
    invoice.paidAt = new Date();
    invoice.paymentMethod = paymentMethod || invoice.paymentMethod;
    invoice.receipt = { receiptNumber, note, paidBy };
    await invoice.save();

    res.json({ message: 'Invoice paid', invoice: serializeInvoice(invoice) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.stripeWebhook = async (req, res) => {
  try {
    const event = req.body || {};
    if (event.type === 'checkout.session.completed') {
      const invoiceId = event.data?.object?.client_reference_id;
      if (invoiceId) {
        await Billing.findByIdAndUpdate(invoiceId, { status: 'paid', paidAt: new Date() });
      }
    }
    res.json({ received: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.refundInvoice = async (req, res) => {
  try {
    const invoice = await Billing.findById(req.params.id);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    invoice.status = 'refunded';
    await invoice.save();
    res.json({ message: 'Invoice refunded', invoice: serializeInvoice(invoice) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addPart = async (req, res) => {
  try {
    const invoice = await Billing.findById(req.params.id);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

    const line = {
      type: 'part',
      description: req.body.description || 'Part',
      qty: Number(req.body.qty || 1),
      unitPrice: Number(req.body.unitPrice || 0),
      lineTotal: Number(req.body.lineTotal || (Number(req.body.qty || 1) * Number(req.body.unitPrice || 0)))
    };

    invoice.items.push(line);
    invoice.subtotal = invoice.items.reduce((sum, item) => sum + Number(item.lineTotal || 0), 0);
    invoice.total = invoice.subtotal + invoice.tax;
    await invoice.save();

    res.json({ message: 'Part added', invoice: serializeInvoice(invoice) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addLabor = async (req, res) => {
  try {
    const invoice = await Billing.findById(req.params.id);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

    const line = {
      type: 'labor',
      description: req.body.description || 'Labor',
      qty: Number(req.body.qty || 1),
      unitPrice: Number(req.body.unitPrice || 0),
      lineTotal: Number(req.body.lineTotal || (Number(req.body.qty || 1) * Number(req.body.unitPrice || 0)))
    };

    invoice.items.push(line);
    invoice.subtotal = invoice.items.reduce((sum, item) => sum + Number(item.lineTotal || 0), 0);
    invoice.total = invoice.subtotal + invoice.tax;
    await invoice.save();

    res.json({ message: 'Labor added', invoice: serializeInvoice(invoice) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
