const { assert, requester } = require('./set_up');

function getTodayDate() {
  const fullDate = new Date();
  const yyyy = fullDate.getFullYear();
  const MM = (fullDate.getMonth() + 1) >= 10 ? (fullDate.getMonth() + 1) : (`0${fullDate.getMonth() + 1}`);
  const dd = fullDate.getDate() < 10 ? (`0${fullDate.getDate()}`) : fullDate.getDate();
  const today = `${yyyy}-${MM}-${dd}`;
  return today;
}

describe('products', async () => {
  it('select products with category', async () => {
    // men
    const res1 = await requester
      .get('/api/1.0/products/men');

    const data1 = res1.body.data;
    assert.equal(data1.length, 8);
    assert.equal(data1[0].category, 'men');

    // men page 1
    const res2 = await requester
      .get('/api/1.0/products/men?paging=1');

    const data2 = res2.body.data;
    assert.equal(data2.length, 4);
    assert.equal(data2[0].category, 'men');

    // women
    const res3 = await requester
      .get('/api/1.0/products/women');

    const data3 = res3.body.data;
    assert.equal(data3.length, 2);
    assert.equal(data3[0].category, 'women');

    // kids
    const res4 = await requester
      .get('/api/1.0/products/kids');

    const data4 = res4.body.data;
    assert.equal(data4.length, 3);
    assert.equal(data4[0].category, 'kids');
  });

  it('select products with search key', async () => {
    const res = await requester
      .get('/api/1.0/products/search?keyword=searchkey');

    const { data } = res.body;

    assert.equal(data.length, 5);
    assert.equal(data[0].id, 10);
    assert.equal(data[0].name, 'test searchkey product10');
  });

  it('select products with search key which have no data', async () => {
    const res = await requester
      .get('/api/1.0/products/search?keyword=nodatakey');

    const { data } = res.body;

    assert.equal(data.length, 0);
  });

  it('select product detail', async () => {
    const res = await requester
      .get('/api/1.0/products/details?number=1111');

    const { data } = res.body;

    const expect = {
      id: 1,
      category: 'men',
      chinese_list: '上衣',
      type: 'tp1',
      chinese_type: '襯衫',
      name: 'product1',
      number: 1111,
      about: 'Product 1',
      texture: 'tt1',
      main_image: 'https://im.uniqlo.com/images/tw/gu/pc/goods/1111/item/main.jpg',
      images: [
        'https://im.uniqlo.com/images/tw/gu/pc/goods/1111/item/0.jpg',
        'https://im.uniqlo.com/images/tw/gu/pc/goods/1111/item/1.jpg',
      ],
      update_at: getTodayDate(),
      date: [
        '2020-08-01',
        '2020-08-02',
        '2020-08-03',
      ],
      price: [
        1000,
        900,
        900,
      ],
      highest_price: 1000,
      lowest_price: 900,
      current_price: 900,
    };

    assert.deepStrictEqual(data, expect);
  });

  it('select product detail with number which can not find data', async () => {
    const res = await requester
      .get('/api/1.0/products/details?number=0');

    assert.equal(res.status, 200);

    const { body } = res;
    assert.deepEqual(body, { data: null });
  });

  it('select product detail with number which is not integer', async () => {
    const res = await requester
      .get('/api/1.0/products/details?number=aaa');

    assert.equal(res.status, 400);

    const { error } = res.body;
    assert.equal(error, '錯誤的要求');
  });

  it('select products with wrong parameter', async () => {
    const res = await requester
      .get('/api/1.0/products/wrong_parameter');

    assert.equal(res.status, 400);
    assert.deepEqual(JSON.parse(res.text), { error: '錯誤的要求' });
  });
});
