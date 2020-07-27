const router = require('express').Router();
const { wrapAsync } = require('../../util/util');

const {
  signUp,
  signIn,
  getUserProfile,
  createTrack,
  deleteTrack,
} = require('../controllers/user_controller');

router.route('/user/signup')
  .post(wrapAsync(signUp));

router.route('/user/signin')
  .post(wrapAsync(signIn));

router.route('/user/profile')
  .get(wrapAsync(getUserProfile));

router.route('/user/track')
  .post(wrapAsync(createTrack));

router.route('/user/track')
  .delete(wrapAsync(deleteTrack));

module.exports = router;
