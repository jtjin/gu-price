require('dotenv').config();

const { API_VERSION } = process.env;
const sinon = require('sinon');
const { assert, requester } = require('./set_up');
const { products, users } = require('./fake_data');
const { query } = require('../util/mysqlcon');

const expectedExpireTime = process.env.TOKEN_EXPIRE;
const fbTokenSignInFirstTime = 'fbTokenFirstLogin';
const fbTokenSignInAgain = 'fbTokenLoginAgain';
const fbProfileSignInFirstTime = {
  id: 1111,
  name: 'fake fb user',
  email: 'fakefbuser@gmail.com',
};
const fbProfileSignInAgain = {
  id: 3333,
  name: users[3].name,
  email: users[3].email,
};
const googleTokenSignInFirstTime = 'googleTokenFirstLogin';
const googleTokenSignInAgain = 'googleTokenLoginAgain';
const googleProfileSignInFirstTime = {
  name: 'fake google user',
  email: 'fakegoogleuser@gmail.com',
  picture: 'https://lh5.googleusercontent.com/2222/photo.jpg',
};
const googleProfileSignInAgain = {
  name: users[4].name,
  email: users[4].email,
  picture: users[4].picture,
};
let stub1;
let stub2;
let stub3;

describe('user', () => {
  before(() => {
    const userModel = require('../server/models/user_model');
    const util = require('../util/util');
    const fakeGetFacebookProfile = (token) => {
      if (!token) {
        return Promise.resolve();
      }
      if (token === fbTokenSignInFirstTime) {
        return Promise.resolve(fbProfileSignInFirstTime);
      } if (token === fbTokenSignInAgain) {
        return Promise.resolve(fbProfileSignInAgain);
      }
      return Promise.reject({ error: { code: 190 } });
    };
    const fakeGetGoogleProfile = (token) => {
      if (!token) {
        return Promise.resolve();
      }
      if (token === googleTokenSignInFirstTime) {
        return Promise.resolve(googleProfileSignInFirstTime);
      } if (token === googleTokenSignInAgain) {
        return Promise.resolve(googleProfileSignInAgain);
      }
      return Promise.reject({ error: { code: 190 } });
    };
    const fakeSend = () => Promise.resolve({ status: 1 });
    stub1 = sinon.stub(userModel, 'getFacebookProfile').callsFake(fakeGetFacebookProfile);
    stub2 = sinon.stub(userModel, 'getGoogleProfile').callsFake(fakeGetGoogleProfile);
    stub3 = sinon.stub(util, 'send').callsFake(fakeSend);
  });

  /**
    * Sign Up
    */

  it('sign up', async () => {
    const user = {
      name: 'jtjin',
      email: 'jtjin@gmail.com',
      password: 'password',
      provider: 'native',
    };

    const res = await requester
      .post(`/api/${API_VERSION}/user/signup`)
      .send(user);

    const { data } = res.body;

    const userExpect = {
      id: data.user.id,
      provider: 'native',
      name: user.name,
      email: user.email,
      picture: 'https://gu-price.s3.ap-east-1.amazonaws.com/user.png',
    };

    assert.deepEqual(data.user, userExpect);
    assert.equal(data.access_token.length, 64);
    assert.equal(data.access_expired, expectedExpireTime);
    assert.closeTo(new Date(data.login_at).getTime(), Date.now(), 1000);
  });

  it('sign up without name or email or password', async () => {
    const user1 = {
      email: 'jtjin@gmail.com',
      password: 'password',
      provider: 'native',
    };

    const res1 = await requester
      .post(`/api/${API_VERSION}/user/signup`)
      .send(user1);

    assert.equal(res1.statusCode, 400);

    const user2 = {
      name: 'jtjin',
      password: 'password',
      provider: 'native',
    };

    const res2 = await requester
      .post(`/api/${API_VERSION}/user/signup`)
      .send(user2);

    assert.equal(res2.statusCode, 400);

    const user3 = {
      name: 'jtjin',
      email: 'jtjin@gmail.com',
      provider: 'native',
    };

    const res3 = await requester
      .post(`/api/${API_VERSION}/user/signup`)
      .send(user3);

    assert.equal(res3.statusCode, 400);
  });

  it('sign up with existed email', async () => {
    const user = {
      name: users[0].name,
      email: users[0].email,
      password: 'password',
      provider: 'native',
    };

    const res = await requester
      .post(`/api/${API_VERSION}/user/signup`)
      .send(user);

    assert.equal(res.body.error, 'Email 已被註冊');
  });

  it('sign up with malicious email', async () => {
    const user = {
      name: users[0].name,
      email: '<script>alert(1)</script>',
      password: 'password',
      provider: 'native',
    };

    const res = await requester
      .post(`/api/${API_VERSION}/user/signup`)
      .send(user);

    assert.equal(res.body.error, '請輸入正確的 Email 格式');
  });

  /**
    * Native Sign In
    */

  it('native sign in with correct password', async () => {
    const user1 = users[0];
    const user = {
      provider: user1.provider,
      email: user1.email,
      password: user1.password,
    };

    const res = await requester
      .post(`/api/${API_VERSION}/user/signin`)
      .send(user);

    const { data } = res.body;
    const userExpect = {
      id: data.user.id,
      provider: user1.provider,
      name: user1.name,
      email: user1.email,
      picture: null,
    };

    assert.deepEqual(data.user, userExpect);
    assert.equal(data.access_token.length, 64);
    assert.equal(data.access_expired, expectedExpireTime);

    // make sure DB is changed, too
    const loginTime = await query(
      'SELECT login_at FROM user WHERE email = ?',
      [user.email],
    );

    assert.closeTo(new Date(data.login_at).getTime(), Date.now(), 1000);
    assert.closeTo(new Date(loginTime[0].login_at).getTime(), Date.now(), 1000);
  });

  it('native sign in without provider', async () => {
    const user1 = users[0];
    const user = {
      email: user1.email,
      password: user1.password,
    };

    const res = await requester
      .post(`/api/${API_VERSION}/user/signin`)
      .send(user);

    assert.equal(res.body.error, '錯誤的要求');
  });

  it('native sign in without email or password', async () => {
    const user1 = users[0];
    const userNoEmail = {
      provider: user1.provider,
      password: user1.password,
    };

    const res1 = await requester
      .post(`/api/${API_VERSION}/user/signin`)
      .send(userNoEmail);

    assert.equal(res1.status, 400);
    assert.equal(res1.body.error, '請輸入 Email、密碼');

    const userNoPassword = {
      provider: user1.provider,
      email: user1.email,
    };

    const res2 = await requester
      .post(`/api/${API_VERSION}/user/signin`)
      .send(userNoPassword);

    assert.equal(res2.status, 400);
    assert.equal(res2.body.error, '請輸入 Email、密碼');
  });

  it('native sign in with wrong email', async () => {
    const user1 = users[0];
    const user = {
      provider: user1.provider,
      email: 'wrongEmail@gmail.com',
      password: user1.password,
    };

    const res = await requester
      .post(`/api/${API_VERSION}/user/signin`)
      .send(user);

    assert.equal(res.status, 403);
    assert.equal(res.body.error, 'Email 不存在，請註冊帳號');
  });

  it('native sign in with wrong password', async () => {
    const user1 = users[0];
    const user = {
      provider: user1.provider,
      email: user1.email,
      password: 'wrong password',
    };

    const res = await requester
      .post(`/api/${API_VERSION}/user/signin`)
      .send(user);

    assert.equal(res.status, 403);
    assert.equal(res.body.error, '密碼錯誤');
  });

  it('native sign in with malicious password', async () => {
    const user1 = users[0];
    const user = {
      provider: user1.provider,
      email: user1.email,
      password: '" OR 1=1; -- ',
    };

    const res = await requester
      .post(`/api/${API_VERSION}/user/signin`)
      .send(user);

    assert.equal(res.status, 403);
    assert.equal(res.body.error, '密碼錯誤');
  });

  it('native sign in with unconfirmed email', async () => {
    const user1 = users[1];
    const user = {
      provider: user1.provider,
      email: user1.email,
      password: user1.password,
    };

    const res = await requester
      .post(`/api/${API_VERSION}/user/signin`)
      .send(user);

    assert.equal(res.status, 403);
    assert.equal(res.body.error, '請先完成 Email 認證');
  });

  /**
    * Facebook Sign In
    */

  it('facebook sign in first time with correct token', async () => {
    const user = {
      provider: 'facebook',
      access_token: fbTokenSignInFirstTime,
    };

    const res = await requester
      .post(`/api/${API_VERSION}/user/signin`)
      .send(user);

    const { data } = res.body;

    const expectedUser = {
      id: data.user.id,
      provider: user.provider,
      name: fbProfileSignInFirstTime.name,
      email: fbProfileSignInFirstTime.email,
      picture: `https://graph.facebook.com/${fbProfileSignInFirstTime.id}/picture?type=large`,
    };

    assert.deepEqual(data.user, expectedUser);

    assert.equal(data.access_token, fbTokenSignInFirstTime);
    assert.equal(data.access_expired, expectedExpireTime);
    assert.closeTo(new Date(data.login_at).getTime(), Date.now(), 1000);
  });

  it('facebook sign in again with correct token', async () => {
    const user = {
      provider: 'facebook',
      access_token: fbTokenSignInAgain,
    };

    const res = await requester
      .post(`/api/${API_VERSION}/user/signin`)
      .send(user);

    const { data } = res.body;

    const expectedUser = {
      id: data.user.id,
      provider: user.provider,
      name: fbProfileSignInAgain.name,
      email: fbProfileSignInAgain.email,
      picture: `https://graph.facebook.com/${fbProfileSignInAgain.id}/picture?type=large`,
    };

    assert.deepEqual(data.user, expectedUser);

    assert.equal(data.access_token, fbTokenSignInAgain);
    assert.equal(data.access_expired, expectedExpireTime);

    // make sure DB is changed, too
    const loginTime = await query(
      'SELECT login_at FROM user WHERE provider = ? AND access_token = ?',
      [user.provider, user.access_token],
    );

    assert.closeTo(new Date(data.login_at).getTime(), Date.now(), 1000);
    assert.closeTo(new Date(loginTime[0].login_at).getTime(), Date.now(), 1000);
  });

  it('facebook sign in without access_token', async () => {
    const user = {
      provider: 'facebook',
    };

    const res = await requester
      .post(`/api/${API_VERSION}/user/signin`)
      .send(user);

    assert.equal(res.status, 400);
    assert.equal(res.body.error, '無法取得 Facebook 存取權杖');
  });

  it('facebook sign in wrong access_token', async () => {
    const user = {
      provider: 'facebook',
      access_token: 'wrong_token',
    };

    const res = await requester
      .post(`/api/${API_VERSION}/user/signin`)
      .send(user);

    assert.equal(res.body.error.error.code, 190);
  });

  /**
    * Google Sign In
    */

  it('google sign in first time with correct token', async () => {
    const user = {
      provider: 'google',
      access_token: googleTokenSignInFirstTime,
    };

    const res = await requester
      .post(`/api/${API_VERSION}/user/signin`)
      .send(user);

    const { data } = res.body;

    const expectedUser = {
      id: data.user.id,
      provider: user.provider,
      name: googleProfileSignInFirstTime.name,
      email: googleProfileSignInFirstTime.email,
      picture: googleProfileSignInFirstTime.picture,
    };

    assert.deepEqual(data.user, expectedUser);

    assert.equal(data.access_token, googleTokenSignInFirstTime);
    assert.equal(data.access_expired, expectedExpireTime);
    assert.closeTo(new Date(data.login_at).getTime(), Date.now(), 1000);
  });

  it('google sign in again with correct token', async () => {
    const user = {
      provider: 'google',
      access_token: googleTokenSignInAgain,
    };

    const res = await requester
      .post(`/api/${API_VERSION}/user/signin`)
      .send(user);

    const { data } = res.body;

    const expectedUser = {
      id: data.user.id,
      provider: user.provider,
      name: googleProfileSignInAgain.name,
      email: googleProfileSignInAgain.email,
      picture: googleProfileSignInAgain.picture,
    };

    assert.deepEqual(data.user, expectedUser);

    assert.equal(data.access_token, googleTokenSignInAgain);
    assert.equal(data.access_expired, expectedExpireTime);

    // make sure DB is changed, too
    const loginTime = await query(
      'SELECT login_at FROM user WHERE provider = ? AND access_token = ?',
      [user.provider, user.access_token],
    );

    assert.closeTo(new Date(data.login_at).getTime(), Date.now(), 1000);
    assert.closeTo(new Date(loginTime[0].login_at).getTime(), Date.now(), 1000);
  });

  it('google sign in without access_token', async () => {
    const user = {
      provider: 'google',
    };

    const res = await requester
      .post(`/api/${API_VERSION}/user/signin`)
      .send(user);

    assert.equal(res.status, 400);
    assert.equal(res.body.error, '無法取得 Google 存取權杖');
  });

  it('google sign in wrong access_token', async () => {
    const user = {
      provider: 'google',
      access_token: 'wrong_token',
    };

    const res = await requester
      .post(`/api/${API_VERSION}/user/signin`)
      .send(user);

    assert.equal(res.body.error.error.code, 190);
  });

  /**
    * User Favorite
    */

  it('update favorite with correct token', async () => {
    const user1 = users[0];
    const user = {
      provider: user1.provider,
      email: user1.email,
      password: user1.password,
    };

    const res1 = await requester
      .post(`/api/${API_VERSION}/user/signin`)
      .send(user);

    const accessToken = res1.body.data.access_token;
    const updateFavorite = {
      favorite: products[0].number,
    };
    const res2 = await requester
      .post(`/api/${API_VERSION}/user/favorite`)
      .send(updateFavorite)
      .set('Authorization', `Bearer ${accessToken}`);

    assert.equal(res2.status, 200);
  });

  it('update favorite without access_token', async () => {
    const updateFavorite = {
      favorite: products[0].number,
    };

    const res = await requester
      .post(`/api/${API_VERSION}/user/favorite`)
      .send(updateFavorite);

    assert.equal(res.status, 400);
    assert.equal(res.body.error, '授權失敗');
  });

  it('update favorite in wrong access_token', async () => {
    const accessToken = 'wrong_token';
    const updateFavorite = {
      favorite: products[0].number,
    };

    const res = await requester
      .post(`/api/${API_VERSION}/user/favorite`)
      .send(updateFavorite)
      .set('Authorization', `Bearer ${accessToken}`);

    assert.equal(res.status, 500);
    assert.equal(res.body.error, '資料讀取失敗');
  });
  /**
    * User Track
    */
  it('create track', async () => {
    const user1 = users[0];
    const user = {
      provider: user1.provider,
      email: user1.email,
      password: user1.password,
    };

    const res1 = await requester
      .post(`/api/${API_VERSION}/user/signin`)
      .send(user);

    const { number } = products[0];

    const res2 = await requester
      .get(`/api/${API_VERSION}/products/details?number=${number}`);

    const createTrack = {
      name: res2.body.data.name,
      number: res2.body.data.number,
      mainImage: res2.body.data.main_image,
      currentPrice: res2.body.data.current_price,
      price: 500,
      email: res1.body.data.user.email,
      userId: res1.body.data.user.id,
    };

    const res3 = await requester
      .post(`/api/${API_VERSION}/user/track`)
      .send(createTrack);

    assert.equal(res3.status, 200);
  });

  it('update track', async () => {
    const user = {
      provider: 'google',
      access_token: googleTokenSignInAgain,
    };

    const res1 = await requester
      .post(`/api/${API_VERSION}/user/signin`)
      .send(user);

    const { number } = products[0];

    const res2 = await requester
      .get(`/api/${API_VERSION}/products/details?number=${number}`);

    const createTrack = {
      name: res2.body.data.name,
      number: res2.body.data.number,
      mainImage: res2.body.data.main_image,
      currentPrice: res2.body.data.current_price,
      price: 500,
      email: res1.body.data.user.email,
      userId: res1.body.data.user.id,
    };

    const res3 = await requester
      .post(`/api/${API_VERSION}/user/track`)
      .send(createTrack);

    assert.equal(res3.status, 200);
  });

  it('delete track', async () => {
    const user1 = users[0];
    const user = {
      provider: user1.provider,
      email: user1.email,
      password: user1.password,
    };

    const res1 = await requester
      .post(`/api/${API_VERSION}/user/signin`)
      .send(user);

    const deleteTrack = {
      number: products[1].number,
      userId: res1.body.data.user.id,
    };

    const res2 = await requester
      .delete(`/api/${API_VERSION}/user/track`)
      .send(deleteTrack);

    assert.equal(res2.status, 200);
  });

  /**
    * Get User Profile
    */
  it('get profile with valid access_token (First time)', async () => {
    const user = {
      provider: 'facebook',
      access_token: fbTokenSignInFirstTime,
    };

    const res1 = await requester
      .post(`/api/${API_VERSION}/user/signin`)
      .send(user);

    const user1 = res1.body.data.user;

    const accessToken = res1.body.data.access_token;

    const res2 = await requester
      .get(`/api/${API_VERSION}/user/profile`)
      .set('Authorization', `Bearer ${accessToken}`);

    const user2 = res2.body.data;
    const expectedUser = {
      id: user1.id,
      provider: user1.provider,
      name: fbProfileSignInFirstTime.name,
      email: fbProfileSignInFirstTime.email,
      picture: `https://graph.facebook.com/${fbProfileSignInFirstTime.id}/picture?type=large`,
      access_expired: parseInt(expectedExpireTime),
      login_at: user2.login_at,
      favorite: null,
      tracks: {},
    };

    assert.deepEqual(user2, expectedUser);
  });

  it('get profile with valid access_token (Again)', async () => {
    const user = {
      provider: 'facebook',
      access_token: fbTokenSignInAgain,
    };

    const res1 = await requester
      .post(`/api/${API_VERSION}/user/signin`)
      .send(user);

    const user1 = res1.body.data.user;

    const accessToken = res1.body.data.access_token;

    const res2 = await requester
      .get(`/api/${API_VERSION}/user/profile`)
      .set('Authorization', `Bearer ${accessToken}`);

    const user2 = res2.body.data;
    const expectedUser = {
      id: user1.id,
      provider: user1.provider,
      name: fbProfileSignInAgain.name,
      email: fbProfileSignInAgain.email,
      picture: `https://graph.facebook.com/${user1.id}/picture?type=large`,
      access_expired: parseInt(expectedExpireTime),
      login_at: user2.login_at,
      favorite: '4444',
      tracks: {
        2222: 200,
        1111: 500,
      },
    };

    assert.deepEqual(user2, expectedUser);
  });

  it('get profile without access_token', async () => {
    const res = await requester
      .get(`/api/${API_VERSION}/user/profile`);

    assert.equal(res.status, 400);
    assert.equal(res.body.error, '授權失敗');
  });

  it('get profile with invalid access_token', async () => {
    const res = await requester
      .get(`/api/${API_VERSION}/user/profile`)
      .set('Authorization', 'Bearer wrong_token');

    assert.equal(res.status, 403);
    assert.equal(res.body.error, '無效的存取權杖');
  });

  after(() => {
    stub1.restore();
    stub2.restore();
    stub3.restore();
  });
});
