import { db } from "./index";
import { user, category, product, restaurantTable } from "./schema";
import { eq } from "drizzle-orm";

const API_URL = "http://localhost:3000/api/auth";

const USERS = [
  { name: "Admin General", email: "admin@techflavor.com", password: "password123", role: "Administrador" },
  { name: "Cajero Principal", email: "cajero@techflavor.com", password: "password123", role: "Cajero" },
  { name: "Jefe de Cocina", email: "cocina@techflavor.com", password: "password123", role: "Cocina" },
];

const CATALOG: {
  category: string;
  description: string;
  products: { name: string; description: string; price: string }[];
}[] = [
    {
      category: "Pizzas",
      description: "Nuestras pizzas artesanales horneadas en horno de leña.",
      products: [
        { name: "Pizza Margarita", description: "Salsa de tomate, mozzarella fresca y albahaca.", price: "8.50" },
        { name: "Pizza Pepperoni", description: "Mozzarella y abundante pepperoni.", price: "9.75" },
        { name: "Pizza Cuatro Quesos", description: "Mozzarella, gorgonzola, parmesano y provolone.", price: "10.50" },
        { name: "Pizza Hawaiana", description: "Jamón, piña y mozzarella.", price: "9.25" },
        { name: "Pizza Vegetariana", description: "Pimiento, champiñón, cebolla morada y aceitunas.", price: "9.50" },
      ],
    },
    {
      category: "Entradas",
      description: "Para empezar con buen sabor.",
      products: [
        { name: "Pan de Ajo", description: "Pan artesanal con mantequilla de ajo y perejil.", price: "3.50" },
        { name: "Palitos de Mozzarella", description: "Empanizados y crujientes, con salsa marinara.", price: "4.75" },
        { name: "Bruschetta", description: "Tomate, ajo y albahaca sobre pan tostado.", price: "4.25" },
      ],
    },
    {
      category: "Pastas",
      description: "Pastas frescas con salsas caseras.",
      products: [
        { name: "Spaghetti Boloñesa", description: "Salsa de carne lentamente cocida.", price: "8.00" },
        { name: "Fettuccine Alfredo", description: "Cremosa salsa de parmesano.", price: "8.50" },
        { name: "Lasaña de la Casa", description: "Capas de pasta, carne y bechamel gratinada.", price: "9.50" },
      ],
    },
    {
      category: "Bebidas",
      description: "Refrescos, jugos naturales y más.",
      products: [
        { name: "Coca-Cola 355ml", description: "Lata fría.", price: "1.50" },
        { name: "Limonada Natural", description: "Recién exprimida con hierbabuena.", price: "2.25" },
        { name: "Agua Mineral", description: "Botella 500ml.", price: "1.25" },
        { name: "Cerveza Artesanal", description: "Lager local 330ml.", price: "3.00" },
      ],
    },
    {
      category: "Postres",
      description: "El final perfecto.",
      products: [
        { name: "Tiramisú", description: "Clásico italiano con café y mascarpone.", price: "4.50" },
        { name: "Brownie con Helado", description: "Brownie tibio y helado de vainilla.", price: "4.75" },
      ],
    },
  ];

const TABLES = [
  { number: 1, capacity: 2 },
  { number: 2, capacity: 2 },
  { number: 3, capacity: 4 },
  { number: 4, capacity: 4 },
  { number: 5, capacity: 6 },
  { number: 6, capacity: 8 },
];

const seedUsers = async () => {
  console.log("Sembrando usuarios...");
  for (const u of USERS) {
    try {
      const { role, ...payload } = u;
      const res = await fetch(`${API_URL}/sign-up/email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Origin": "http://localhost:3000",
          "User-Agent": "TechFlavor-Seed-Script",
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        await db.update(user).set({ role: u.role }).where(eq(user.email, u.email));
        console.log(`  Usuario '${u.email}' creado con rol '${u.role}'.`);
      } else {
        console.log(`  ${u.email}: ${data.message || "ya existe."}`);
      }
    } catch {
      console.error(`  Error de conexión con ${u.email}. ¿Está encendido el servidor?`);
    }
  }
};

const seedCatalog = async () => {
  console.log("Sembrando categorías y productos...");
  const existing = await db.select().from(category);
  const existingByName = new Map(existing.map((c) => [c.name, c.id]));

  for (const group of CATALOG) {
    let categoryId = existingByName.get(group.category);

    if (!categoryId) {
      categoryId = crypto.randomUUID();
      await db.insert(category).values({
        id: categoryId,
        name: group.category,
        description: group.description,
        isActive: true,
        updatedAt: new Date(),
      });
      console.log(`  Categoría '${group.category}' creada.`);
    } else {
      console.log(`  Categoría '${group.category}' ya existe.`);
    }

    const existingProducts = await db.select().from(product).where(eq(product.categoryId, categoryId));
    const existingProductNames = new Set(existingProducts.map((p) => p.name));

    for (const p of group.products) {
      if (existingProductNames.has(p.name)) continue;
      await db.insert(product).values({
        id: crypto.randomUUID(),
        name: p.name,
        description: p.description,
        price: p.price,
        categoryId,
        isActive: true,
        updatedAt: new Date(),
      });
    }
    console.log(`    ${group.products.length} productos asegurados en '${group.category}'.`);
  }
};

const seedTables = async () => {
  console.log("Sembrando mesas...");
  const existing = await db.select().from(restaurantTable);
  const existingNumbers = new Set(existing.map((t) => t.number));

  for (const t of TABLES) {
    if (existingNumbers.has(t.number)) continue;
    await db.insert(restaurantTable).values({
      id: crypto.randomUUID(),
      number: t.number,
      capacity: t.capacity,
      status: "Libre",
      isActive: true,
      updatedAt: new Date(),
    });
  }
  console.log(`  ${TABLES.length} mesas aseguradas.`);
};

const seed = async () => {
  console.log("Iniciando seeding de TechFlavor...");
  await seedUsers();
  await seedCatalog();
  await seedTables();
  console.log("Seeding finalizado.");
  process.exit(0);
};

seed();
