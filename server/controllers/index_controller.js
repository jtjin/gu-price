require('dotenv').config();
const crypto = require('crypto');
const _ = require('lodash');
const vision = require('@google-cloud/vision');
const fs = require('fs');
const path = require('path');
const Index = require('../models/index_model');

const client = new vision.ImageAnnotatorClient({
  keyFilename: './mykey.json',
});

const getProducts = async (req, res) => {
  const { category, type } = req.params;

  async function findProduct(category, type) {
    switch (category) {
      case 'men': case 'women': case 'kids':
        return await Index.getProducts({ category, type });
      case 'products':
        const number = type;
        return await Index.getProducts({ number });
      case 'search':
        const keyword = type;
        return await Index.getProducts({ keyword });
    }
    return Promise.resolve({});
  }
  const { productCount } = await findProduct(category, type);
  if (productCount === 0) {
    res.status(200).render('search', { msg: `我們無法找到符合 " ${type} " 的任何項目。` });
  } else if (!productCount) {
    res.status(404).render('error', { title: '找不到頁面 | GU 搜尋 | GU 比價', status: '404', message: '找不到頁面' });
  } else {
    switch (category) {
      case 'men': case 'women': case 'kids':
        res.status(200).render('type');
        break;
      case 'products':
        res.status(200).render('product');
        break;
      case 'search':
        res.status(200).render('search');
        break;
    }
  }
};

const getTypes = async (req, res) => {
  const { category } = req.params;
  const types = await Index.getTypes(category);
  if (types.length === 0) {
    res.status(404).render('error', { title: '找不到頁面 | GU 搜尋 | GU 比價', status: '404', message: '找不到頁面' });
  } else {
    const typesMap = _.groupBy(types, (type) => type.chinese_list);
    const lists = Object.keys(typesMap).sort();
    res.status(200).render('category', { lists, typesMap: JSON.stringify(typesMap) });
  }
};

const imageSearch = async (req, res) => {
  if (req.file) {
    const fileName = path.join(__dirname, `../../static/pictures/${req.file.filename}`);
    const request = {
      image: { content: fs.readFileSync(fileName) },
    };
    let object = await localizeObjects(request);
    // Catch "Top","Outerwear","Shorts","Pants","Skirt", "Dress", "Clothing" object only
    object = ['Top', 'Outerwear', 'Shorts', 'Pants', 'Skirt', 'Dress', 'Clothing'].filter((obj) => new Set(object).has(obj));
    if (object.length == 0) {
      fs.unlinkSync(fileName);
      res.status(200).render('imageSearch', { msg: '找不到圖片中包含的商品種類，請再嘗試一次。' });
    } else {
      res.status(200).render('imageSearch', { imageUrl: `/static/pictures/${req.file.filename}`, object });
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
  getTypes,
  imageSearch,
  confirmEmail,
};
