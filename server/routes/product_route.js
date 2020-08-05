const router = require('express').Router();
const { asyncHandler } = require('../../util/util');

const {
  getProducts,
  imageSearch,
} = require('../controllers/product_controller');

router.route('/products/:category')
  .get(asyncHandler(getProducts));

router.route('/imageSearch')
  .post(asyncHandler(imageSearch));

module.exports = router;
