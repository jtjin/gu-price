const { query } = require('../../util/mysqlcon');

const getProducts = async (requirement = {}) => {
  const condition = { sql: '', binding: [] };
  let productCountQuery;

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
    productCountQuery = `SELECT COUNT(*) AS count FROM product ${condition.sql}`;
  } else {
    condition.sql = 'WHERE category = ? ORDER BY type';
    condition.binding = [requirement.category];
    productCountQuery = `SELECT DISTINCT(type) FROM product ${condition.sql}`;
  }

  const productCountBindings = condition.binding;
  const productCounts = await query(productCountQuery, productCountBindings);

  if (requirement.type) {
    const productCount = productCounts[0].count;
    return { productCount };
  }
  const productCount = productCounts.flatMap((p) => [p.type]);
  return { productCount };
};

const updateUser = async (email) => {
  try {
    await query('START TRANSACTION');

    const users = await query('SELECT * FROM user WHERE email = ? AND provider = ?', [email, 'native']);
    const user = users[0];

    if (!user) {
      await query('COMMIT');
      return { error: '帳號不存在，請註冊' };
    }

    if (user.confirmed) {
      await query('COMMIT');
      return { error: '帳號已啟用，請登入' };
    }

    const queryStr = 'UPDATE user SET confirmed = ? WHERE id = ?';
    await query(queryStr, [true, user.id]);
    await query('COMMIT');

    return { user };
  } catch (error) {
    await query('ROLLBACK');
    return { error };
  }
};

module.exports = {
  getProducts,
  updateUser,
};
