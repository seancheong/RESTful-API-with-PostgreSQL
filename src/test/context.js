const { randomBytes } = require('crypto');
const { default: migrate } = require('node-pg-migrate');
const pool = require('../pool');

const DEFAULT_OPTS = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
};

class Context {
  constructor(roleName) {
    this.roleName = roleName;
  }

  static async build() {
    // randomly generating a role name to connect to postgres as
    // always make sure that roleName is started with a letter
    const roleName = 'a' + randomBytes(4).toString('hex');

    // connect to postgres as usual
    await pool.connect(DEFAULT_OPTS);

    // create a new role
    await pool.query(`
    CREATE ROLE ${roleName} WITH LOGIN PASSWORD '${roleName}';
  `);

    // create a schema with the same name
    await pool.query(`
    CREATE SCHEMA ${roleName} AUTHORIZATION ${roleName};
  `);

    // disconnect entirely from postgres
    await pool.close();

    // run migrations in the new schema
    await migrate({
      schema: roleName,
      direction: 'up',
      log: () => {},
      noLock: true, // because we might have multiple migration running at the same time
      dir: 'migrations',
      databaseUrl: {
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT),
        database: process.env.DB_NAME,
        user: roleName,
        password: roleName
      }
    });

    // connect to postgres as the newly created role
    await pool.connect({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      database: process.env.DB_NAME,
      user: roleName,
      password: roleName
    });

    return new Context(roleName);
  }

  async close() {
    // disconnect from postgres
    await pool.close();

    // reconnect as root user
    await pool.connect(DEFAULT_OPTS);

    // delete the role and schema created earlier
    await pool.query(`DROP SCHEMA ${this.roleName} CASCADE;`);
    await pool.query(`DROP role ${this.roleName};`);

    // disconnect
    await pool.close();
  }
}

module.exports = Context;
