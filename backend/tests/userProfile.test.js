const userController = require('../controllers/userController');
const User = require('../models/User');

jest.mock('../models/User', () => ({
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn()
}));

describe('userController.updateUser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('persists laborRate for gunsmith profiles', async () => {
    const updatedUser = {
      _id: 'user-1',
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.com',
      phone: '555-1234',
      location: 'Austin',
      billingAddress: '123 Main St',
      preferredContactMethod: 'email',
      laborRate: 95
    };

    User.findByIdAndUpdate.mockReturnValue({
      select: jest.fn().mockResolvedValue(updatedUser)
    });

    const req = {
      params: { id: 'user-1' },
      user: { userId: 'user-1' },
      body: {
        fullName: 'Jane Doe',
        email: 'jane@example.com',
        phone: '555-1234',
        location: 'Austin',
        billingAddress: '123 Main St',
        preferredContactMethod: 'email',
        laborRate: 95
      }
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

    await userController.updateUser(req, res);

    expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({ laborRate: 95 }),
      { new: true }
    );
    expect(res.body.message).toBe('User updated');
  });
});
