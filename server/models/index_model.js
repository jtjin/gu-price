const { query } = require('../../util/mysqlcon');

const getProducts = async (requirement = {}) => {
  const condition = { sql: '', binding: [] };
  let productsQuery;

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
    productsQuery = `SELECT COUNT(DISTINCT number) AS count FROM product ${condition.sql}`;
  } else {
    condition.sql = 'WHERE category = ?';
    condition.binding = [requirement.category];
    productsQuery = `SELECT DISTINCT (type) FROM product ${condition.sql}`;
  }

  const productsBindings = condition.binding;
  const products = await query(productsQuery, productsBindings);

  if (requirement.type) {
    const product = products[0].count;
    return { product };
  }
  const product = products.flatMap((p) => [p.type]);
  return { product };
};

module.exports = {
  getProducts,
};
