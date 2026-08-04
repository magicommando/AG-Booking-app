const inventoryController = require('../controllers/inventoryController');
const Inventory = require('../models/Inventory');

jest.mock('../models/Inventory', () => ({
  find: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  create: jest.fn(),
  delete: jest.fn()
}));

jest.mock('../models/AILog', () => ({
  create: jest.fn()
}));

describe('inventoryController.getInventory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns shared inventory for admin users instead of filtering by their own gunsmith id', async () => {
    const inventoryItems = [
      {
        _id: 'item-1',
        gunsmithId: 'other-gunsmith',
        productName: 'Test Part',
        quantity: 5,
        lowStockAlert: false,
        partOrders: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    Inventory.find.mockReturnValue({
      sort: jest.fn().mockResolvedValue(inventoryItems)
    });

    const req = {
      user: { userId: 'admin-1', role: 'admin' }
    };
    const res = {
      statusCode: null,
      body: null,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(payload) {
        this.body = payload;
      }
    };

    await inventoryController.getInventory(req, res);

    expect(Inventory.find).toHaveBeenCalledWith({});
    expect(Array.isArray(res.body)).toBe(true);
  });
});
