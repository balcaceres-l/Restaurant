// db/seed.ts
import { db } from "./index";
import { user } from "./schema";
import { eq } from "drizzle-orm";

const API_URL = "http://localhost:3000/api/auth";

const seedUsers = async () => {
  console.log("Iniciando el seeding de usuarios...");

  const users = [
    { name: "Admin General", email: "admin@techflavor.com", password: "password123", role: "Administrador" },
    { name: "Cajero Principal", email: "cajero@techflavor.com", password: "password123", role: "Cajero" },
    { name: "Jefe de Cocina", email: "cocina@techflavor.com", password: "password123", role: "Cocina" },
  ];

  for (const u of users) {
    try {
      const { role, ...payload } = u;

      const res = await fetch(`${API_URL}/sign-up/email`, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "Origin": "http://localhost:3000",
            "User-Agent": "TechFlavor-Seed-Script"
        },
        body: JSON.stringify(payload), 
      });

      const data = await res.json();

      if (res.ok) {
        await db.update(user).set({ role: u.role }).where(eq(user.email, u.email));
        console.log(`Usuario creado y rol '${u.role}' asignado exitosamente: ${u.email}`);
      } else {
        console.log(`Nota para ${u.email}:`, data.message || "Ya existe o hubo un error.");
      }
    } catch (error) {
      console.error(`Error de conexión al intentar crear ${u.email}. ¿Está encendido el servidor?`);
    }
  }
  
  console.log("🏁 Seeding finalizado.");
  process.exit(0); 
};

seedUsers();