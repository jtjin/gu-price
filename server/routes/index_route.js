const router = require('express').Router();
const { wrapAsync } = require('../../util/util');
const { getProducts } = require('../controllers/index_controller');

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

module.exports = router;
