const router = require('express').Router();
const { wrapAsync } = require('../../util/util');

const {
  getProducts,
  updateFavorite,
  imageSearch,
} = require('../controllers/product_controller');

router.route('/products/:category')
  .get(wrapAsync(getProducts));

router.route('/favorite')
  .post(wrapAsync(updateFavorite));

router.route('/imageSearch')
  .post(wrapAsync(imageSearch));

module.exports = router;
