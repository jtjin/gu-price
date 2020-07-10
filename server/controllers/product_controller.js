const _ = require('lodash');
const Product = require('../models/product_model');
const data = require('../data/data.json');

const pageSize = 8;

const getProducts = async (req, res) => {
  const { category } = req.params;
  const paging = parseInt(req.query.paging) || 0;

  async function findProduct(category) {
    switch (category) {
      case 'men': case 'women': case 'kids':
        const { type } = req.query;
        return await Product.getProducts(4, paging, { category, type });
      case 'search': {
        const { keyword } = req.query;
        if (keyword) {
          return await Product.getProducts(pageSize, paging, { keyword });
        }
        break;
      }
      case 'details': {
        const number = parseInt(req.query.number);
        if (Number.isInteger(number)) {
          return await Product.getProducts(pageSize, paging, { number });
        }
      }
      case 'imageSearch': {
        return await Product.getProductsImageUrls();
      }
    }
    return Promise.resolve({});
  }
  const { products, productCount } = await findProduct(category);
  if (!products) {
    res.status(400).send({ error: 'Wrong Request' });
    return;
  }

  if (products.length == 0) {
    if (category === 'details') {
      res.status(200).json({ data: null });
    } else {
      res.status(200).json({ data: [] });
    }
    return;
  }

  if (category == 'imageSearch') {
    res.status(200).json(products);
    return;
  }

  let productsWithDetail = await getProductsWithDetail(products);

  if (category == 'details') {
    productsWithDetail = productsWithDetail[0];
  }

  const result = (productCount > (paging + 1) * pageSize) ? {
    data: productsWithDetail,
    next_paging: paging + 1,
  } : {
    data: productsWithDetail,
  };

  res.status(200).json(result);
};

const getProductsWithDetail = async (products) => {
  const productIds = products.map((p) => p.id);
  const prices = await Product.getProductsPrices(productIds);
  const pricesMap = _.groupBy(prices, (p) => p.product_id);

  return products.map((p) => {
    p.type = data[p.category][0][p.type];
    const productPrices = pricesMap[p.id];

    if (!productPrices) { return p; }

    p.date = productPrices.flatMap((p) => [p.date]);
    p.price = productPrices.flatMap((p) => [p.price]);
    p.highest_price = Math.max(...p.price);
    p.lowest_price = Math.min(...p.price);
    p.current_price = p.price[p.price.length - 1];
    p.images = JSON.parse(p.images);

    return p;
  });
};

module.exports = {
  getProducts,
};
