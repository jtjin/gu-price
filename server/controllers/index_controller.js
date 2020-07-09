const Index = require('../models/index_model');

const getProducts = async (req, res) => {
  const { category, type } = req.params;

  async function findProduct(category, type) {
    switch (category) {
      case 'men': case 'women': case 'kids': case 'products': case 'search':
        return await Index.getProducts({ category, type });
      default:
        res.status(404).render('error', { title: 'Not Found | GU 搜尋 | GU 比價', status: '404', message: 'Not Found' });
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

module.exports = {
  getProducts,
};
