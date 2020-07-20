require('dotenv').config();
const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const vision = require('@google-cloud/vision');
const Product = require('../models/product_model');
const data = require('../data/data.json');

const productSearchClient = new vision.ProductSearchClient({
  keyFilename: './mykey.json',
});
const imageAnnotatorClient = new vision.ImageAnnotatorClient({
  keyFilename: './mykey.json',
});

let jieba;
switch (process.env.SYSTEM) {
  case 'windows':
    jieba = require('@node-rs/jieba');
    jieba.loadDict(fs.readFileSync(`${__dirname}/../data/dict.txt`));
    break;
  default:
    jieba = require('nodejieba');
    jieba.load({ userDict: `${__dirname}/../data/dict.txt` });
}

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
        break;
      }
    }
    return Promise.resolve({});
  }
  const { products, productCount } = await findProduct(category);
  if (!products) {
    res.status(400).send({ error: '錯誤的要求' });
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

const updateFavorite = async (req, res) => {
  const { favorite } = req.body;
  const { id } = req.body;

  const { result } = await Product.updateFavorite(favorite, id);
  if (result.changedRows == 0) {
    res.status(500).send({ error: '資料庫存取失敗' });
  } else {
    res.status(200).send({ changedRows: result.changedRows });
  }
};

const getProductsName = async (req, res) => {
  let productsName = await Product.getProductsName();
  if (productsName.length == 0) {
    res.status(500).json({ error: '資料庫存取失敗' });
  } else {
    let result;
    productsName = productsName.flatMap((p) => p.name);
    switch (process.env.SYSTEM) {
      case 'windows':
        productsName = productsName.flatMap((name) => jieba.cut(name, false));
        result = jieba.extract(productsName.join(' '), 10000);
        break;
      default:
        productsName = productsName.flatMap((name) => jieba.cut(name, false));
        result = jieba.extract(productsName.join(' '), 10000);
        result = result.flatMap((p) => p.word);
    }
    productsName = productsName.filter((x) => new Set(result).has(x));
    res.status(200).json(productsName.join(' '));
  }
};

const imageSearch = async (req, res) => {
  const object = req.body.object.split(',');
  const filePath = path.join(__dirname, `../..${req.body.url}`);
  let result = [];
  for (let i = 0; i < object.length; i += 1) {
    similarProducts = await getSimilarProducts(filePath, object[i].toLowerCase());
    if (similarProducts.error) {
      fs.unlinkSync(filePath); // Delete picture
      res.status(400).send({ error: similarProducts.error });
      return;
    }
    result = [...result, ...similarProducts];
  }
  fs.unlinkSync(filePath); // Delete picture
  res.status(200).json(result);
};

const getSimilarProducts = async (filePath, object) => {
  const projectId = 'gu-price';
  const location = 'asia-east1';
  const productSetId = object;
  const productCategory = 'apparel-v2';
  const content = fs.readFileSync(filePath, 'base64');
  const filter = '';
  const productSetPath = productSearchClient.productSetPath(
    projectId,
    location,
    productSetId,
  );
  const request = {
    // image: { source: { imageUri: filePath } },
    image: { content },
    features: [{ type: 'PRODUCT_SEARCH', maxResults: '10' }],
    imageContext: {
      productSearchParams: {
        productSet: productSetPath,
        productCategories: [productCategory],
        filter,
      },
    },
  };
  const [response] = await imageAnnotatorClient.batchAnnotateImages({
    requests: [request],
  });
  if (response.responses[0].error) {
    return { error: response.responses[0].error };
  }
  const { productGroupedResults } = response.responses[0].productSearchResults;
  const results = productGroupedResults.flatMap((object) => object.results);
  const similarProducts = [];
  results.flatMap((result) => {
    if (result.score >= 0.75) {
      name = result.product.name.split('/').pop(-1);
      imageUrl = `https://storage.googleapis.com/jtjin-gu-price/${object}/${name}.jpg`;
      number = result.product.displayName;
      similarProducts.push({ imageUrl, number });
    }
  });
  if (results.length > 0 && similarProducts.length == 0) {
    name = results[0].product.name.split('/').pop(-1);
    imageUrl = `https://storage.googleapis.com/jtjin-gu-price/${object}/${name}.jpg`;
    number = results[0].product.displayName;
    similarProducts.push({ imageUrl, number });
  }
  return similarProducts;
};

module.exports = {
  getProducts,
  updateFavorite,
  getProductsName,
  imageSearch,
};
