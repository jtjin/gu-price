const router = require('express').Router();
const { asyncHandler, upload } = require('../../util/util');

const {
  getProducts,
  getTypes,
  imageSearch,
  confirmEmail,
} = require('../controllers/index_controller');

const uploadImageSearch = upload.single('imageSearch');

router.get('/', (req, res, next) => {
  try {
    res.status(200).render('index');
  } catch (error) {
    next(error);
  }
});

router.get('/profile', (req, res, next) => {
  try {
    res.status(200).render('profile');
  } catch (error) {
    next(error);
  }
});

router.get('/compare', (req, res, next) => {
  try {
    res.status(200).render('compare');
  } catch (error) {
    next(error);
  }
});

router.route('/confirmation/:token')
  .get(asyncHandler(confirmEmail));

router.route('/:category')
  .get(asyncHandler(getTypes));

router.route('/:category/:type')
  .get(asyncHandler(getProducts));

// router.route('/imageSearch')
//   .post(uploadImageSearch, asyncHandler(imageSearch));

module.exports = router;
