const { query } = require('../../util/mysqlcon');

const getProducts = async (requirement = {}) => {
  const condition = { sql: '', binding: [] };

  if (requirement.type) {
    if (requirement.category == 'products') {
      condition.sql = 'WHERE number = ?';
      condition.binding = [requirement.type];
    } else if (requirement.category == 'search') {
      condition.sql = 'WHERE name LIKE ?';
      condition.binding = [`%${requirement.type}%`];
    } else {
      condition.sql = 'WHERE category = ? AND type = ?';
      condition.binding = [requirement.category, requirement.type];
    }
  } else {
    condition.sql = 'WHERE category = ?';
    condition.binding = [requirement.category];
  }

  const productCountQuery = `SELECT COUNT(DISTINCT number) as count FROM product ${condition.sql}`;
  const productCountBindings = condition.binding;
  const productCounts = await query(productCountQuery, productCountBindings);
  const productCount = productCounts[0].count;
  return { productCount };
};

module.exports = {
  getProducts,
};
