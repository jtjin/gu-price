const _ = require('lodash');
const Product = require('../models/product_model');
const pageSize = 6;

const getProducts = async (req, res) => {
   const category = req.params.category;
   const paging = parseInt(req.query.paging) || 0;

   async function findProduct(category) {
       switch (category) {
           case 'all':
               return await Product.getProducts(pageSize, paging);
           case 'men': case 'women': case 'accessories':
               return await Product.getProducts(pageSize, paging, {category});
           case 'search': {
               const keyword = req.query.keyword;
               if (keyword) {
                   return await Product.getProducts(pageSize, paging, {keyword});
               }
               break;
           }
           case 'hot': {
               return await Product.getProducts(null, null, {category});
           }
           case 'details': {
               const number = parseInt(req.query.number);
               if (Number.isInteger(number)) {
                   return await Product.getProducts(pageSize, paging, {number});
               }
           }
       }
       return Promise.resolve({});
   }
   const {products, productCount} = await findProduct(category);
   if (!products) {
       res.status(400).send({error:'Wrong Request'});
       return;
   }

   if (products.length == 0) {
       if (category === 'details') {
           res.status(200).json({data: null});
       } else {
           res.status(200).json({data: []});
       }
       return;
   }

   let productsWithDetail = await getProductsWithDetail(products);

   if (category == 'details') {
       productsWithDetail = productsWithDetail[0];
   }

   const result = (productCount > (paging + 1) * pageSize) ? {
       data: productsWithDetail,
       next_paging: paging + 1
   } : {
       data: productsWithDetail,
   };

   res.status(200).json(result);
};

const getProductsWithDetail = async (products) => {
   const productIds = products.map(p => p.id);
   const prices = await Product.getProductsPrices(productIds)
   const pricesMap = _.groupBy(prices, p => p.product_id);

   return products.map((p) => {
      const productPrices = pricesMap[p.id]
      if (!productPrices) { return p }

      p.price = productPrices.map(p => ({
         data: p.date,
         price: p.price
      }))

      p.images = JSON.parse(p.images)

      return p
   })
};

module.exports = {
   getProducts,
};
