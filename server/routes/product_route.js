const router = require('express').Router();
const { wrapAsync } = require('../../util/util');
const { getProducts, updateFavorite, getProductsName } = require('../controllers/product_controller');

router.route('/tagCloud')
  .get(wrapAsync(getProductsName));

router.route('/products/:category')
  .get(wrapAsync(getProducts));

router.route('/favorite')
  .post(wrapAsync(updateFavorite));

module.exports = router;
