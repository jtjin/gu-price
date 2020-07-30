const { query } = require('../../util/mysqlcon');

const getProducts = async (requirement = {}) => {
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
  }

  const productCountQuery = `SELECT COUNT(*) AS count FROM product ${condition.sql} AND update_at >= DATE_SUB(CURDATE(), INTERVAL 1 DAY)`;
  const productCountBindings = condition.binding;
  const productCounts = await query(productCountQuery, productCountBindings);
  const productCount = productCounts[0].count;

  return { productCount };
};

const getTypes = async (category) => {
  const types = await query('SELECT DISTINCT(type) FROM product WHERE category = ? AND update_at >= DATE_SUB(CURDATE(), INTERVAL 1 DAY)', [category]);
  const type = types.flatMap((p) => [p.type]);
  return { type };
};

const updateUser = async (email) => {
  try {
    const users = await query('SELECT * FROM user WHERE email = ? AND provider = ?', [email, 'native']);
    const user = users[0];

    if (!user) {
      return { error: '帳號不存在，請註冊' };
    }

    if (user.confirmed) {
      return { error: '帳號已啟用，請登入' };
    }

    const queryStr = 'UPDATE user SET confirmed = ? WHERE id = ?';
    await query(queryStr, [true, user.id]);

    return { user };
  } catch (error) {
    return { error };
  }
};

module.exports = {
  getProducts,
  getTypes,
  updateUser,
};
