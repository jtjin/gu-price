require('dotenv').config();
const validator = require('validator');
const User = require('../models/user_model');

const expire = process.env.TOKEN_EXPIRE;

const facebookSignIn = async (accessToken) => {
  if (!accessToken) {
    return { error: 'Request Error: access token is required.', status: 400 };
  }

  try {
    const profile = await User.getFacebookProfile(accessToken);
    const { id, name, email } = profile;

    if (!id || !name || !email) {
      return { error: 'Permissions Error: facebook access token can not get user id, name or email' };
    }

    return await User.facebookSignIn(id, name, email, accessToken, expire);
  } catch (error) {
    return { error };
  }
};

const googleSignIn = async (accessToken) => {
  if (!accessToken) {
    return { error: 'Request Error: access token is required.', status: 400 };
  }

  try {
    const profile = await User.getGoogleProfile(accessToken);
    const { name, email, picture } = profile;

    if (!name || !email) {
      return { error: 'Permissions Error: facebook access token can not get user name or email' };
    }

    return await User.googleSignIn(name, email, picture, accessToken, expire);
  } catch (error) {
    return { error };
  }
};

const signIn = async (req, res) => {
  const data = req.body;

  let result;
  switch (data.provider) {
    case 'facebook':
      result = await facebookSignIn(data.access_token);
      break;
    case 'google':
      result = await googleSignIn(data.access_token);
      break;
    default:
      result = { error: 'Wrong Request' };
  }

  if (result.error) {
    const status_code = result.status ? result.status : 403;
    res.status(status_code).send({ error: result.error });
    return;
  }

  const { accessToken, loginAt, user } = result;
  if (!user) {
    res.status(500).send({ error: 'Database Query Error' });
    return;
  }

  res.status(200).send({
    data: {
      access_token: accessToken,
      access_expired: expire,
      login_at: loginAt,
      user: {
        id: user.id,
        provider: user.provider,
        name: user.name,
        email: user.email,
        picture: user.picture,
      },
    },
  });
};

const getUserProfile = async (req, res) => {
  let accessToken = req.get('Authorization');
  if (accessToken) {
    accessToken = accessToken.replace('Bearer ', '');
  } else {
    res.status(400).send({ error: 'Wrong Request: authorization is required.' });
    return;
  }
  const profile = await User.getUserProfile(accessToken);
  if (profile.error) {
    res.status(403).send({ error: profile.error });
  } else {
    res.status(200).send(profile);
  }
};

const createTrack = async (req, res) => {
  const { body } = req;
  const track = {
    number: body.number,
    price: body.price,
    email: body.email,
  };
  const trackId = await User.createTrack(track);
  res.status(200).send({ trackId });
};

module.exports = {
  signIn,
  getUserProfile,
  createTrack,
};
