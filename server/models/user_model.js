require('dotenv').config();
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const got = require('got');
const { query } = require('../../util/mysqlcon.js');

const salt = parseInt(process.env.BCRYPT_SALT);

const signUp = async (name, email, password, provider, expire) => {
  try {
    const emails = await query('SELECT email FROM user WHERE email = ? AND provider = ?', [email, provider]);
    if (emails.length > 0) {
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
      picture: 'https://gu-price.s3.ap-east-1.amazonaws.com/user.png',
      access_token: accessToken,
      access_expired: expire,
      login_at: loginAt,
      confirmed: false,
    };
    const queryStr = 'INSERT INTO user SET ?';

    const result = await query(queryStr, user);
    user.id = result.insertId;

    return { accessToken, loginAt, user };
  } catch (error) {
    return { error };
  }
};

const nativeSignIn = async (email, password, provider, expire) => {
  try {
    const users = await query('SELECT * FROM user WHERE email = ? AND provider = ?', [email, provider]);
    const user = users[0];

    if (!user) {
      return { error: 'Email 不存在，請註冊帳號' };
    }

    if (!user.confirmed) {
      return { error: '請先完成 Email 認證' };
    }

    if (!bcrypt.compareSync(password, user.password)) {
      return { error: '密碼錯誤' };
    }

    const loginAt = new Date();
    const sha = crypto.createHash('sha256');
    sha.update(email + password + loginAt);
    const accessToken = sha.digest('hex');

    const queryStr = 'UPDATE user SET access_token = ?, access_expired = ?, login_at = ? WHERE id = ?';
    await query(queryStr, [accessToken, expire, loginAt, user.id]);

    return { accessToken, loginAt, user };
  } catch (error) {
    return { error };
  }
};

const facebookSignIn = async (id, name, email, accessToken, expire) => {
  try {
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

    const users = await query('SELECT id FROM user WHERE email = ? AND provider = ?', [email, 'facebook']);
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

    return { accessToken, loginAt, user };
  } catch (error) {
    return { error };
  }
};

const googleSignIn = async (name, email, picture, accessToken, expire) => {
  try {
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

    const users = await query('SELECT id FROM user WHERE email = ? AND provider = ?', [email, 'google']);
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

    return { accessToken, loginAt, user };
  } catch (error) {
    return { error };
  }
};

const getUserProfile = async (accessToken) => {
  const results = await query('SELECT * FROM user WHERE access_token = ?', [accessToken]);
  if (results.length === 0) {
    return { error: '無效的存取權杖' };
  }
  const tracks = await query('SELECT number, price FROM track WHERE user_id = ? AND confirmed = ?', [results[0].id, false]);
  const trackHashMap = {};
  if (tracks.length !== 0) {
    for (let i = 0; i < tracks.length; i += 1) {
      trackHashMap[tracks[i].number] = tracks[i].price;
    }
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
      tracks: trackHashMap,
    },
  };
};

const getFacebookProfile = async (accessToken) => {
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

const getGoogleProfile = async (accessToken) => {
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

const updateFavorite = async (favorite, accessToken) => {
  try {
    const users = await query('SELECT id FROM user WHERE access_token = ?', [accessToken]);
    if (users.length === 0) {
      return { error: '存取權杖無效' };
    }
    const result = await query('UPDATE user SET favorite = ? WHERE id = ?', [favorite, users[0].id]);
    return { changedRows: result.changedRows };
  } catch (error) {
    return { error };
  }
};

const createTrack = async (track) => {
  try {
    const duplicatedTrack = await query('SELECT id FROM track WHERE number = ? AND user_id = ? AND confirmed = ?', [track.number, track.user_id, false]);
    let trackId;
    if (duplicatedTrack.length === 0) { // Insert new track
      const queryStr = 'INSERT INTO track SET ?';
      const result = await query(queryStr, track);
      trackId = result.insertId;
    } else { // Update existed track
      trackId = duplicatedTrack[0].id;
      const queryStr = 'UPDATE track SET price = ? WHERE id = ?';
      await query(queryStr, [track.price, trackId]);
    }
    return trackId;
  } catch (error) {
    return { error };
  }
};

const deleteTrack = async (number, userId) => {
  try {
    const result = await query('DELETE FROM track WHERE number = ? AND user_id = ?', [number, userId]);
    return result.affectedRows;
  } catch (error) {
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
  updateFavorite,
  createTrack,
  deleteTrack,
};
