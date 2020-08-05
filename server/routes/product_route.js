const router = require('express').Router();
const { asyncHandler } = require('../../util/util');

const {
  getProducts,
  updateFavorite,
  imageSearch,
} = require('../controllers/product_controller');

router.route('/products/:category')
  .get(asyncHandler(getProducts));

router.route('/favorite')
  .post(asyncHandler(updateFavorite));

router.route('/imageSearch')
  .post(asyncHandler(imageSearch));

module.exports = router;
