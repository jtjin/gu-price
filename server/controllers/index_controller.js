const Index = require('../models/index_model');

const getProducts = async (req, res) => {
  const { category, type } = req.params;

  async function findProduct(category, type) {
    switch (category) {
      case 'men': case 'women': case 'kids': case 'products': case 'search':
        return await Index.getProducts({ category, type });
    }
    return Promise.resolve({});
  }
  const { productCount } = await findProduct(category, type);
  if (!productCount || productCount <= 0) {
    res.status(404).render('error');
  } else {
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
        res.status(200).render('category');
    }
  }
};

module.exports = {
  getProducts,
};
