import { Sequelize } from "sequelize";
import { logger } from "../logger.js";

export const sequelize = new Sequelize(
  process.env.DATABASE_URL ?? "postgresql://mcadmin:password@localhost:5432/mcpanel",
  {
    dialect: "postgres",
    logging: (msg) => logger.debug(msg),
    pool: {
      max: 10,
      min: 2,
      acquire: 30000,
      idle: 10000,
    },
    define: {
      underscored: true, // snake_case en la BD, camelCase en JS
      timestamps: true,
    },
  }
);
