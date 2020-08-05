const { query } = require('../../util/mysqlcon');

const getProducts = async (pageSize, paging = 0, requirement = {}) => {
  const condition = { sql: '', binding: [] };
  if (requirement.category && requirement.type) {
    condition.sql = 'WHERE category = ? AND type = ?';
    condition.binding = [requirement.category, requirement.type];
  } else if (requirement.keyword != null) {
    condition.sql = 'WHERE name LIKE ?';
    condition.binding = [`%${requirement.keyword}%`];
  } else if (requirement.number != null) {
    condition.sql = 'WHERE number = ?';
    condition.binding = [requirement.number];
  } else {
    condition.sql = 'WHERE category = ?';
    condition.binding = [requirement.category];
  }

  const limit = {
    sql: 'LIMIT ?, ?',
    binding: [pageSize * paging, pageSize],
  };

  const productQuery = `SELECT * FROM product ${condition.sql} AND update_at >= DATE_SUB(CURDATE(), INTERVAL 1 DAY) ORDER BY id DESC ${limit.sql}`;
  const productBindings = condition.binding.concat(limit.binding);
  const products = await query(productQuery, productBindings);

  const productCountQuery = `SELECT COUNT(*) as count FROM product ${condition.sql} AND update_at >= DATE_SUB(CURDATE(), INTERVAL 1 DAY)`;
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
