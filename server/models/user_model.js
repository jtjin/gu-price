require('dotenv').config();
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const got = require('got');
const { query } = require('../../util/mysqlcon.js');

const salt = parseInt(process.env.BCRYPT_SALT);

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

const getUserProfile = async (accessToken) => {
  const results = await query('SELECT * FROM user WHERE access_token = ?', [accessToken]);
  if (results.length === 0) {
    return { error: 'Invalid Access Token' };
  }
  return {
    data: {
      id: results[0].id,
      provider: results[0].provider,
      name: results[0].name,
      email: results[0].email,
      picture: results[0].picture,
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
    throw ('Permissions Error: facebook access token is wrong');
  }
};

module.exports = {
  facebookSignIn,
  getUserProfile,
  getFacebookProfile,
};
