const router = require('express').Router();
const { wrapAsync } = require('../../util/util');
const {
  getProducts, updateFavorite, getProductsName, imageSearch,
} = require('../controllers/product_controller');

router.route('/tagCloud')
  .get(wrapAsync(getProductsName));

router.route('/products/:category')
  .get(wrapAsync(getProducts));

router.route('/favorite')
  .post(wrapAsync(updateFavorite));

router.route('/imageSearch')
  .post(wrapAsync(imageSearch));

module.exports = router;
