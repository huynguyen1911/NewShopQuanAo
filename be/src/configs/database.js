const { Sequelize } = require("sequelize");
const mysql = require("mysql2/promise");

const sequelize = new Sequelize(
  process.env.DATABASE_NAME,
  process.env.DATABASE_USERNAME,
  process.env.DATABASE_PASSWORD,
  {
    host: process.env.DATABASE_HOST,
    dialect: "mysql",
    logging: false,
    dialectOptions: {
      charset: "utf8mb4",
    },
    define: {
      charset: "utf8mb4",
      collate: "utf8mb4_unicode_ci",
    },
  }
);

module.exports = {
  sequelize,
  connect: async () => {
    try {
      const connection = await mysql.createConnection({
        host: process.env.DATABASE_HOST,
        user: process.env.DATABASE_USERNAME,
        password: process.env.DATABASE_PASSWORD,
        charset: "utf8mb4",
      });

      await connection.query(
        "CREATE DATABASE IF NOT EXISTS `clothes-web-shop` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
      );

      await connection.end();

      await sequelize.authenticate();
      console.log("Connection has been established successfully.");
      await sequelize.sync();
    } catch (error) {
      console.error("Unable to connect to the database:", error);
    }
  },
};
