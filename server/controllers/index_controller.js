require('dotenv').config();
const crypto = require('crypto');
const vision = require('@google-cloud/vision');
const Index = require('../models/index_model');

const client = new vision.ImageAnnotatorClient({
  keyFilename: './mykey.json',
});

const getProducts = async (req, res) => {
  const { category, type } = req.params;

  async function findProduct(category, type) {
    switch (category) {
      case 'men': case 'women': case 'kids': case 'products': case 'search':
        return await Index.getProducts({ category, type });
      default:
        res.status(404).render('error', { title: '找不到頁面 | GU 搜尋 | GU 比價', status: '404', message: '找不到頁面' });
    }
    return Promise.resolve({});
  }
  const { product } = await findProduct(category, type);
  if (product != 0) {
    switch (category) {
      case 'products':
        res.status(200).render('product');
        break;
      case 'search':
        res.status(200).render('search');
        break;
      default:
        if (type) {
          res.status(200).render('type');
          return;
        }
        res.status(200).render('category', { product });
    }
  } else {
    res.status(200).render('search', { msg: `我們無法找到符合 " ${type} " 的任何項目。` });
  }
};

const imageSearch = async (req, res) => {
  if (req.file) {
    let object = await localizeObjects(req.file.location);
    // Catch "Top"、"Pants" object only
    object = ['Top', 'Pants'].filter((obj) => new Set(object).has(obj));
    if (object.length > 1) {
      // too many objects
      res.status(200).render('imageSearch', { imageUrl: req.file.location, msg: '圖片中包含的商品種類過多，請縮小範圍。' });
    } else if (object.length == 0) {
      // no object found
      res.status(200).render('imageSearch', { imageUrl: req.file.location, msg: '找不到圖片中包含的商品種類，請再嘗試一次。' });
    } else {
      res.status(200).render('imageSearch', { imageUrl: req.file.location, object: object[0].toLowerCase() });
    }
  } else {
    res.status(200).render('imageSearch', { msg: '請確認您上傳的檔案格式。' });
  }
};

const localizeObjects = async (uri) => {
  const [result] = await client.objectLocalization(uri);
  const objects = result.localizedObjectAnnotations;
  return objects.flatMap((object) => object.name);
};

const confirmEmail = async (req, res) => {
  const mykey = crypto.createDecipheriv('aes-128-cbc', process.env.CRYPTO_KEY, process.env.CRYPTO_IV);
  let email = mykey.update(req.params.token, 'hex', 'utf8');
  email += mykey.final('utf8');
  const result = await Index.updateUser(email);
  if (result.error) {
    res.status(200).render('confirm', { image: '/static/imgs/unconfirm.png', confirmMsg: result.error });
    return;
  }

  res.status(200).render('confirm', { image: '/static/imgs/confirm.png', confirmMsg: `您的信箱 ${email} 已成功啟用` });
};

module.exports = {
  getProducts,
  imageSearch,
  confirmEmail,
};
