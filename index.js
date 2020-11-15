const dotenv = require('dotenv');
const app = require('./src/app');
const pool = require('./src/pool');

dotenv.config();
const PORT = parseInt(process.env.APP_PORT);

pool
  .connect({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
  })
  .then(() => {
    app().listen(PORT, () => {
      console.log(`Listening on port ${PORT}`);
    });
  })
  .catch((err) => console.error(err));
