const { createInvoice } = require('../controllers/billingController');

jest.mock('../models/Billing', () => ({
  find: jest.fn(),
  findById: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  countDocuments: jest.fn()
}));

const Billing = require('../models/Billing');

describe('billing controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates an invoice with a generated invoice number', async () => {
    const req = {
      body: {
        workOrderId: 'work-123',
        clientId: 'client-123',
        gunsmithId: 'gunsmith-123',
        items: [{ type: 'part', description: 'Recoil spring', qty: 1, unitPrice: 24.5 }]
      },
      user: { userId: 'gunsmith-123', role: 'gunsmith' }
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    Billing.create.mockResolvedValue({
      _id: 'invoice-1',
      invoiceNumber: 'INV-0001',
      status: 'draft'
    });

    await createInvoice(req, res);

    expect(Billing.create).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ invoice: expect.objectContaining({ invoiceNumber: 'INV-0001' }) }));
  });
});
