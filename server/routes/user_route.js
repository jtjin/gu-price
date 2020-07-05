const router = require('express').Router();
const { wrapAsync } = require('../../util/util');

const {
  signIn,
  getUserProfile,
} = require('../controllers/user_controller');

router.route('/user/signin')
  .post(wrapAsync(signIn));

router.route('/user/profile')
  .get(wrapAsync(getUserProfile));

module.exports = router;
