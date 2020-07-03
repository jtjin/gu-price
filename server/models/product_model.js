const { query } = require('../../util/mysqlcon');

const getProducts = async (pageSize, paging = 0, requirement = {}) => {
  const condition = { sql: '', binding: [] };
  if (requirement.category) {
    condition.sql = 'WHERE category = ?';
    condition.binding = [requirement.category];
  } else if (requirement.keyword != null) {
    condition.sql = 'WHERE title LIKE ?';
    condition.binding = [`%${requirement.keyword}%`];
  } else if (requirement.number != null) {
    condition.sql = 'WHERE number = ?';
    condition.binding = [requirement.number];
  }

  const limit = {
    sql: 'LIMIT ?, ?',
    binding: [pageSize * paging, pageSize],
  };

  const productQuery = `SELECT * FROM product ${condition.sql} ORDER BY id ${limit.sql}`;
  const productBindings = condition.binding.concat(limit.binding);
  const products = await query(productQuery, productBindings);

  const productCountQuery = `SELECT COUNT(*) as count FROM product ${condition.sql}`;
  const productCountBindings = condition.binding;

  const productCounts = await query(productCountQuery, productCountBindings);
  const productCount = productCounts[0].count;

  return { products, productCount };
};

const getProductsPrices = async (productIds) => {
  const queryStr = 'SELECT * FROM date_price WHERE product_id IN (?)';
  const bindings = [productIds];
  return await query(queryStr, bindings);
};

module.exports = {
  getProducts,
  getProductsPrices,
};
