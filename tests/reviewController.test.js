const { postReview } = require('../controllers/reviewController');
const Review = require('../models/Review');
const Pengajuan = require('../models/Pengajuan');

jest.mock('../models/Review');
jest.mock('../models/Pengajuan');

describe('reviewController.postReview', () => {
  it('should save review and update submission status', async () => {
    const req = {
      params: { id: '10' },
      user: { id: 2 },
      body: { decision: 'setuju', comment: 'OK', score: 0.9 }
    };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    Pengajuan.findByPk.mockResolvedValue({ id: 10, status: 'submitted', save: jest.fn() });
    Review.create.mockResolvedValue({ id: 1, submission_id: 10 });

    await postReview(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ pesan: 'Review tersimpan.' }));
  });
});
