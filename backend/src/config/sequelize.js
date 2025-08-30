import { Sequelize } from 'sequelize';
import config from './config.js';

console.log('DB_HOST:', config.DB.host);
console.log('DB_NAME:', config.DB.database);
console.log('DB_USER:', config.DB.user);
console.log('DB_PASSWORD:', config.DB.password);

const sequelize = new Sequelize(config.DB.database, config.DB.user, config.DB.password, {
  host: config.DB.host,
  dialect: 'mssql',
  dialectOptions: {
    options: {
      encrypt: true,
    },
  },
});

export default sequelize;
