require('dotenv').config();
const validator = require('validator');
const crypto = require('crypto');
const User = require('../models/user_model');
const { send } = require('../../util/util.js');

const port = process.env.PORT;
const expire = process.env.TOKEN_EXPIRE;

const signUp = async (req, res) => {
  let { name } = req.body;
  const { email, password, provider } = req.body;

  if (!name || !email || !password) {
    res.status(400).send({ error: 'Request Error: name, email and password are required.' });
    return;
  }

  if (!validator.isEmail(email)) {
    res.status(400).send({ error: 'Request Error: Invalid email format' });
    return;
  }

  name = validator.escape(name); // replace <, >, &, ', " and / with HTML entities.

  const result = await User.signUp(name, email, password, provider, expire);
  if (result.error) {
    res.status(403).send({ error: result.error });
    return;
  }

  const { accessToken, loginAt, user } = result;
  if (!user) {
    res.status(500).send({ error: 'Database Query Error' });
    return;
  }

  const emailResult = await sendEmail(req.protocol, req.hostname, result.user.email);
  if (!emailResult.status) {
    res.status(500).send({ error: 'Nodemailer Error' });
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

const sendEmail = async (protocol, hostname, email) => {
  const mykey = crypto.createCipheriv('aes-128-cbc', process.env.CRYPTO_KEY, process.env.CRYPTO_IV);
  let emailToken = mykey.update(email, 'utf8', 'hex');
  emailToken += mykey.final('hex');
  let url;
  if (protocol == 'http') {
    url = `${protocol}://${hostname}:${port}/confirmation/${emailToken}/`;
  } else {
    url = `${protocol}://${hostname}/confirmation/${emailToken}/`;
  }

  const mail = {
    from: 'GU-price <B10031029@gapps.ntust.edu.tw>',
    subject: 'Confirm Email',
    to: email,
    html: `Please click this link to confirm your email: <a href="${url}">${url}</a>`,
  };

  const result = await send(mail);
  return result;
};

const nativeSignIn = async (email, password, provider) => {
  if (!email || !password) {
    return { error: 'Request Error: email and password are required.', status: 400 };
  }

  try {
    return await User.nativeSignIn(email, password, provider, expire);
  } catch (error) {
    return { error };
  }
};

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
    case 'native':
      result = await nativeSignIn(data.email, data.password, data.provider);
      break;
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
    const statusCode = result.status ? result.status : 403;
    res.status(statusCode).send({ error: result.error });
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
  signUp,
  signIn,
  getUserProfile,
  createTrack,
};
