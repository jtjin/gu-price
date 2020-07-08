const router = require('express').Router();
const { wrapAsync } = require('../../util/util');

const {
  signUp,
  signIn,
  getUserProfile,
  createTrack,
} = require('../controllers/user_controller');

router.route('/user/signup')
  .post(wrapAsync(signUp));

router.route('/user/signin')
  .post(wrapAsync(signIn));

router.route('/user/profile')
  .get(wrapAsync(getUserProfile));

router.route('/user/track')
  .post(wrapAsync(createTrack));

module.exports = router;
