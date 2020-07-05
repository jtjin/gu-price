const router = require('express').Router();
const path = require('path');
const { wrapAsync } = require('../../util/util');

const { getProducts } = require('../controllers/index_controller');

// router.get('/products/:number', (req, res) => {
//    res.sendFile(path.join(__dirname, '../../public/product.html'));
// })

/* GET home page. */
router.get('/', (req, res, next) => {
  try {
    res.status(200).render('index');
  } catch (error) {
    next(error);
  }
});

// /* GET product page. */
// router.get('/products/:number', (req, res, next) => {
//   console.log('here')
//   res.status(200).render('product');
// });

// router.get('/:category', (req, res, next) => {
//   console.log('only category')
//   console.log(req.params.category)
//   res.status(200).render('index2');
// });

// router.get('/:category/:type', (req, res, next) => {
//   try {
//     const category = req.params.category
//     const type = req.params.type
//     switch(category) {
//       case "products" :
//         res.status(200).render('product');
//         break
//       case "men" :
//       case "women" :
//       case "kids" :
//         res.status(200).render('index2');
//         break
//       default :
//         res.status(200).render('index');
//     }
//   } catch (error) {
//     next(error)
//   }
// });

router.route('/:category')
  .get(wrapAsync(getProducts));

router.route('/:category/:type')
  .get(wrapAsync(getProducts));

module.exports = router;
