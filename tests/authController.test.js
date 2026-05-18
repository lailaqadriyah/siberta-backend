const authController = require('../controllers/authController');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

jest.mock('../models/User');
jest.mock('bcryptjs');

describe('authController.login', () => {
  it('should return 401 for wrong password', async () => {
    const req = { body: { username: 'u', password: 'p' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    User.findOne.mockResolvedValue({ id: 1, username: 'u', password: 'hashed', nama: 'User', role: 'mahasiswa' });
    bcrypt.compare.mockResolvedValue(false);

    await authController.login(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalled();
  });
});
