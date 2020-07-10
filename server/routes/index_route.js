const router = require('express').Router();
const { wrapAsync, uploadS3 } = require('../../util/util');
const { getProducts, imageSearch } = require('../controllers/index_controller');

const uploadImageSearch = uploadS3.single('imageSearch');

router.get('/', (req, res, next) => {
  try {
    res.status(200).render('index');
  } catch (error) {
    next(error);
  }
});

router.route('/:category')
  .get(wrapAsync(getProducts));

router.route('/:category/:type')
  .get(wrapAsync(getProducts));

router.route('/imageSearch')
  .post(uploadImageSearch, wrapAsync(imageSearch));

module.exports = router;
