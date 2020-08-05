const router = require('express').Router();
const { asyncHandler } = require('../../util/util');

const {
  signUp,
  signIn,
  getUserProfile,
  updateFavorite,
  createTrack,
  deleteTrack,
} = require('../controllers/user_controller');

router.route('/user/profile')
  .get(asyncHandler(getUserProfile));

router.route('/user/signup')
  .post(asyncHandler(signUp));

router.route('/user/signin')
  .post(asyncHandler(signIn));

router.route('/user/favorite')
  .post(asyncHandler(updateFavorite));

router.route('/user/track')
  .post(asyncHandler(createTrack));

router.route('/user/track')
  .delete(asyncHandler(deleteTrack));

module.exports = router;
