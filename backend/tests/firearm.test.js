const firearmController = require('../controllers/firearmController');
const validate = require('../middleware/validateMiddleware');
const { firearmSchemas } = require('../validation/validationSchemas');
const Firearm = require('../models/Firearm');

jest.mock('../models/Firearm', () => ({
  create: jest.fn()
}));

describe('firearmController.addFirearm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('accepts the frontend firearm payload without legacy validation fields', () => {
    const req = {
      body: {
        make: 'Smith & Wesson',
        model: 'M&P',
        serial: 'ABC123',
        type: 'Pistol',
        caliber: '9mm'
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
    const next = jest.fn();

    validate(firearmSchemas.create)(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.statusCode).toBeNull();
  });

  it('maps the client form payload into the stored firearm document', async () => {
    const createdFirearm = {
      _id: 'firearm-1',
      manufacturer: 'Smith & Wesson',
      model: 'M&P',
      serial: 'ABC123',
      type: 'pistol',
      caliber: '9mm'
    };

    Firearm.create.mockResolvedValue(createdFirearm);

    const req = {
      body: {
        make: 'Smith & Wesson',
        model: 'M&P',
        serial: 'ABC123',
        type: 'pistol',
        caliber: '9mm'
      },
      user: { userId: 'user-1' }
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

    await firearmController.addFirearm(req, res);

    expect(Firearm.create).toHaveBeenCalledWith(expect.objectContaining({
      userId: 'user-1',
      manufacturer: 'Smith & Wesson',
      model: 'M&P',
      serial: 'ABC123',
      type: 'pistol',
      caliber: '9mm'
    }));
    expect(res.body.message).toBe('Firearm added');
  });
});
