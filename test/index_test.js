const { assert, requester } = require('./set_up');

describe('index', async () => {
  it('home page', async () => {
    const res = await requester
      .get('/');

    assert.equal(res.status, 200);
    assert.include(res.text, '查看商品');
  });

  it('profile page', async () => {
    const res = await requester
      .get('/profile');

    assert.equal(res.status, 200);
    assert.include(res.text, '收藏清單');
  });

  it('compare page', async () => {
    const res = await requester
      .get('/compare');

    assert.equal(res.status, 200);
    assert.include(res.text, '比較結果');
  });

  it('category page with correct category', async () => {
    const res = await requester
      .get('/men');

    assert.equal(res.status, 200);
    assert.include(res.text, '上衣');
  });

  it('category page with wrong category', async () => {
    const res = await requester
      .get('/mmm');

    assert.equal(res.status, 404);
    assert.include(res.text, '找不到頁面');
  });

  it('type page with correct category & type', async () => {
    // men
    const res1 = await requester
      .get('/men/pants');

    assert.equal(res1.status, 200);

    // women
    const res2 = await requester
      .get('/women/shirts');

    assert.equal(res2.status, 200);

    // kids
    const res3 = await requester
      .get('/kids/coat');

    assert.equal(res3.status, 200);
  });

  it('type page with wrong category', async () => {
    const res = await requester
      .get('/mmm/shirts');

    assert.equal(res.status, 404);
    assert.include(res.text, '找不到頁面');
  });

  it('type page with wrong type', async () => {
    const res = await requester
      .get('/women/sss');

    assert.equal(res.status, 200);
    assert.include(res.text, '我們無法找到符合');
  });

  it('product page with correct number', async () => {
    const res = await requester
      .get('/products/1111');

    assert.equal(res.status, 200);
    assert.include(res.text, '商品介紹');
  });

  it('product page with wrong number or not integer', async () => {
    const res1 = await requester
      .get('/products/0');

    assert.equal(res1.status, 200);
    assert.include(res1.text, '我們無法找到符合');

    const res2 = await requester
      .get('/products/aaa');

    assert.equal(res2.status, 200);
    assert.include(res2.text, '我們無法找到符合');
  });

  it('search page which can find products', async () => {
    const res = await requester
      .get('/search/searchkey');

    assert.equal(res.status, 200);
  });

  it('search page which can not find products', async () => {
    const res = await requester
      .get('/search/nodatakey');

    assert.equal(res.status, 200);
    assert.include(res.text, '我們無法找到符合');
  });

  it('not found page', async () => {
    const res = await requester
      .get('/not/found/page');

    assert.equal(res.status, 404);
    assert.include(res.text, '找不到頁面');
  });
});
