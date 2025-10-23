import bcrypt from "bcryptjs";
import sequelize from "../config/database.js";
import Role from "../models/Role.js";
import User from "../models/User.js";

(async () => {
  try {
    console.log("Sincronizando base de datos...");
    await sequelize.sync({ force: true });

    console.log("Creando roles iniciales...");
    const [adminRole, asesorRole] = await Promise.all([
      Role.create({ nombre: "Administrador" }),
      Role.create({ nombre: "Asesor" }),
    ]);

    console.log("Creando usuario administrador...");
    const hashedPassword = await bcrypt.hash("Admin123!", 10);
    await User.create({
      nombre: "Administrador",
      email: "admin@banco.com",
      password: hashedPassword,
      roleId: adminRole.id,
    });

    console.log(" Base de datos inicializada correctamente");
    process.exit(0);
  } catch (error) {
    console.error(" Error inicializando base de datos:", error.message);
    process.exit(1);
  }
})();
