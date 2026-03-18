import { sequelize } from "./db.js";
import "./schema.js"; // Importar para registrar los modelos
import { logger } from "../logger.js";

async function runMigrations() {
  logger.info("Sincronizando modelos con la base de datos...");
  await sequelize.sync({ alter: true });
  logger.info("Base de datos sincronizada correctamente.");
  process.exit(0);
}

runMigrations().catch((err) => {
  logger.error("Error en migraciones:", err);
  process.exit(1);
});
