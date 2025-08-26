import { Sequelize } from 'sequelize';
import config from './config.js';

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
