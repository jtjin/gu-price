require('dotenv').config();
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const got = require('got');
const { query } = require('../../util/mysqlcon.js');

const salt = parseInt(process.env.BCRYPT_SALT);

const signUp = async (name, email, password, provider, expire) => {
  try {
    await query('START TRANSACTION');

    const emails = await query('SELECT email FROM user WHERE email = ? AND provider = ? FOR UPDATE', [email, provider]);
    if (emails.length > 0) {
      await query('COMMIT');
      return { error: 'Email 已被註冊' };
    }

    const loginAt = new Date();
    const sha = crypto.createHash('sha256');
    sha.update(email + password + loginAt);
    const accessToken = sha.digest('hex');

    const user = {
      provider: 'native',
      email,
      password: bcrypt.hashSync(password, salt),
      name,
      picture: 'https://jtjin-gu-price.s3.us-east-2.amazonaws.com/user.png',
      access_token: accessToken,
      access_expired: expire,
      login_at: loginAt,
      confirmed: false,
    };
    const queryStr = 'INSERT INTO user SET ?';

    const result = await query(queryStr, user);
    user.id = result.insertId;

    await query('COMMIT');
    return { accessToken, loginAt, user };
  } catch (error) {
    await query('ROLLBACK');
    return { error };
  }
};

const nativeSignIn = async (email, password, provider, expire) => {
  try {
    await query('START TRANSACTION');

    const users = await query('SELECT * FROM user WHERE email = ? AND provider = ?', [email, provider]);
    const user = users[0];

    if (!user) {
      await query('COMMIT');
      return { error: 'Email 不存在，請註冊帳號' };
    }

    if (!user.confirmed) {
      await query('COMMIT');
      return { error: '請先完成 Email 認證' };
    }

    if (!bcrypt.compareSync(password, user.password)) {
      await query('COMMIT');
      return { error: '密碼錯誤' };
    }

    const loginAt = new Date();
    const sha = crypto.createHash('sha256');
    sha.update(email + password + loginAt);
    const accessToken = sha.digest('hex');

    const queryStr = 'UPDATE user SET access_token = ?, access_expired = ?, login_at = ? WHERE id = ?';
    await query(queryStr, [accessToken, expire, loginAt, user.id]);

    await query('COMMIT');

    return { accessToken, loginAt, user };
  } catch (error) {
    await query('ROLLBACK');
    return { error };
  }
};

const facebookSignIn = async (id, name, email, accessToken, expire) => {
  try {
    await query('START TRANSACTION');

    const loginAt = new Date();
    const user = {
      provider: 'facebook',
      email,
      name,
      picture: `https://graph.facebook.com/${id}/picture?type=large`,
      access_token: accessToken,
      access_expired: expire,
      login_at: loginAt,
      confirmed: true,
    };

    const users = await query('SELECT id FROM user WHERE email = ? AND provider = \'facebook\' FOR UPDATE', [email]);
    let userId;
    if (users.length === 0) { // Insert new user
      const queryStr = 'INSERT INTO user SET ?';
      const result = await query(queryStr, user);
      userId = result.insertId;
    } else { // Update existed user
      userId = users[0].id;
      const queryStr = 'UPDATE user SET access_token = ?, access_expired = ?, login_at = ?  WHERE id = ?';
      await query(queryStr, [accessToken, expire, loginAt, userId]);
    }
    user.id = userId;

    await query('COMMIT');

    return { accessToken, loginAt, user };
  } catch (error) {
    await query('ROLLBACK');
    return { error };
  }
};

const googleSignIn = async (name, email, picture, accessToken, expire) => {
  try {
    await query('START TRANSACTION');

    const loginAt = new Date();
    const user = {
      provider: 'google',
      email,
      name,
      picture,
      access_token: accessToken,
      access_expired: expire,
      login_at: loginAt,
      confirmed: true,
    };

    const users = await query('SELECT id FROM user WHERE email = ? AND provider = \'google\' FOR UPDATE', [email]);
    let userId;
    if (users.length === 0) { // Insert new user
      const queryStr = 'INSERT INTO user SET ?';
      const result = await query(queryStr, user);
      userId = result.insertId;
    } else { // Update existed user
      userId = users[0].id;
      const queryStr = 'UPDATE user SET access_token = ?, access_expired = ?, login_at = ?  WHERE id = ?';
      await query(queryStr, [accessToken, expire, loginAt, userId]);
    }
    user.id = userId;

    await query('COMMIT');

    return { accessToken, loginAt, user };
  } catch (error) {
    await query('ROLLBACK');
    return { error };
  }
};

const getUserProfile = async (accessToken) => {
  const results = await query('SELECT * FROM user WHERE access_token = ?', [accessToken]);
  if (results.length === 0) {
    return { error: '無效的存取權杖' };
  }
  return {
    data: {
      id: results[0].id,
      provider: results[0].provider,
      name: results[0].name,
      email: results[0].email,
      picture: results[0].picture,
      access_expired: results[0].access_expired,
      login_at: results[0].login_at,
      favorite: results[0].favorite,
    },
  };
};

const getFacebookProfile = async function (accessToken) {
  try {
    const res = await got(`https://graph.facebook.com/me?fields=id,name,email&access_token=${accessToken}`, {
      responseType: 'json',
    });
    return res.body;
  } catch (e) {
    console.log(e);
    throw ('Facebook 存取權杖錯誤');
  }
};

const getGoogleProfile = async function (accessToken) {
  try {
    const res = await got(`https://oauth2.googleapis.com/tokeninfo?id_token=${accessToken}`, {
      responseType: 'json',
    });
    return res.body;
  } catch (e) {
    console.log(e);
    throw ('Google 存取權杖錯誤');
  }
};

const createTrack = async (track) => {
  try {
    await query('START TRANSACTION');
    const result = await query('INSERT INTO track SET ?', track);
    await query('COMMIT');
    return result.insertId;
  } catch (error) {
    await query('ROLLBACK');
    return { error };
  }
};

module.exports = {
  signUp,
  nativeSignIn,
  facebookSignIn,
  googleSignIn,
  getUserProfile,
  getFacebookProfile,
  getGoogleProfile,
  createTrack,
};
