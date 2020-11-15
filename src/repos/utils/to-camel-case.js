module.exports = rows => {
  return rows.map(row => {
    const replaced = {};

    for (let key in row) {
      // convert snake case to camel case
      const camelCase = key.replace(/([-_][a-z])/gi, ($1) => {
        return $1.toUpperCase().replace('_', '');
      });
      replaced[camelCase] = row[key];
    }

    return replaced;
  });
};
