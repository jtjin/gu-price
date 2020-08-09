require('dotenv').config();
const validator = require('validator');
const crypto = require('crypto');
const User = require('../models/user_model');
const Util = require('../../util/util');

const port = process.env.PORT;
const expire = process.env.TOKEN_EXPIRE;

const signUp = async (req, res) => {
  let { name } = req.body;
  const { email, password, provider } = req.body;

  if (!name || !email || !password) {
    res.status(400).send({ error: '請輸入用戶名稱、Email、密碼' });
    return;
  }

  if (!validator.isEmail(email)) {
    res.status(400).send({ error: '請輸入正確的 Email 格式' });
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
    res.status(500).send({ error: '資料讀取失敗' });
    return;
  }

  const emailResult = await sendConfirmEmail(req.protocol, req.hostname, result.user.email);
  if (!emailResult.status) {
    res.status(500).send({ error: 'Email 認證失敗' });
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

const sendConfirmEmail = async (protocol, hostname, email) => {
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
    from: 'GU-Price <gu.price.search@gmail.com>',
    subject: 'Email 認證信',
    to: email,
    html: `請點擊以下連結確認您的 Email : <a href="${url}">${url}</a>`,
  };

  const result = await Util.send(mail);
  return result;
};

const nativeSignIn = async (email, password, provider) => {
  if (!email || !password) {
    return { error: '請輸入 Email、密碼', status: 400 };
  }

  try {
    return await User.nativeSignIn(email, password, provider, expire);
  } catch (error) {
    return { error };
  }
};

const facebookSignIn = async (accessToken) => {
  if (!accessToken) {
    return { error: '無法取得 Facebook 存取權杖', status: 400 };
  }

  try {
    const profile = await User.getFacebookProfile(accessToken);
    const { id, name, email } = profile;

    if (!id || !name || !email) {
      return { error: '您的 Facebook 存取權杖無法取得個人資料' };
    }

    return await User.facebookSignIn(id, name, email, accessToken, expire);
  } catch (error) {
    return { error };
  }
};

const googleSignIn = async (accessToken) => {
  if (!accessToken) {
    return { error: '無法取得 Google 存取權杖', status: 400 };
  }

  try {
    const profile = await User.getGoogleProfile(accessToken);
    const { name, email, picture } = profile;

    if (!name || !email) {
      return { error: '您的 Google 存取權杖無法取得個人資料' };
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
      result = { error: '錯誤的要求' };
  }

  if (result.error) {
    const statusCode = result.status ? result.status : 403;
    res.status(statusCode).send({ error: result.error });
    return;
  }

  const { accessToken, loginAt, user } = result;
  if (!user) {
    res.status(500).send({ error: '資料讀取失敗' });
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
    res.status(400).send({ error: '授權失敗' });
    return;
  }
  const profile = await User.getUserProfile(accessToken);
  if (profile.error) {
    res.status(403).send({ error: profile.error });
  } else {
    res.status(200).send(profile);
  }
};

const updateFavorite = async (req, res) => {
  let accessToken = req.get('Authorization');
  if (accessToken) {
    accessToken = accessToken.replace('Bearer ', '');
  } else {
    res.status(400).send({ error: '授權失敗' });
    return;
  }
  const { favorite } = req.body;
  const result = await User.updateFavorite(favorite, accessToken);
  if (result.error || result.changedRows == 0) {
    res.status(500).send({ error: '資料讀取失敗' });
  } else {
    res.status(200).send({ changedRows: result.changedRows });
  }
};

const createTrack = async (req, res) => {
  const { body } = req;
  const track = {
    number: body.number,
    price: body.price,
    email: body.email,
    confirmed: false,
    user_id: body.userId,
  };
  const trackId = await User.createTrack(track);
  if (!trackId) {
    res.status(500).send({ error: '資料讀取失敗' });
    return;
  }

  const emailResult = await sendTrackEmail(body.name, body.mainImage, body.currentPrice, body.price, body.email);
  if (!emailResult.status) {
    res.status(500).send({ error: '信箱認證失敗' });
    return;
  }
  res.status(200).send({ trackId });
};

const sendTrackEmail = async (name, mainImage, currentPrice, price, email) => {
  const mail = {
    from: 'GU-Price <gu.price.search@gmail.com>',
    subject: `GU-Price 價格追蹤- ${name}`,
    to: email,
    html: `
            <p>Hi! ${email.split('@')[0]}</p>
            <h2>您已在 GU-Price 追蹤「${name}」商品的價格</h2>
            <img src="${mainImage}" height="150">
            <p>當前的價格為 ${currentPrice} 元，若商品價格低於您設定的 ${price} 元以下，我們將會發通知信給您。</p>
          `,
  };

  const result = await Util.send(mail);
  return result;
};

const deleteTrack = async (req, res) => {
  const result = await User.deleteTrack(req.body.number, req.body.userId);
  if (!result) {
    res.status(500).send({ error: '資料讀取失敗' });
    return;
  }
  res.status(200).send({ result });
};

module.exports = {
  signUp,
  signIn,
  getUserProfile,
  updateFavorite,
  createTrack,
  deleteTrack,
};
