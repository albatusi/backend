import { PrismaClient } from "@prisma/client";

// ✅ Evita crear múltiples instancias de Prisma en entornos de desarrollo.
const prisma = global.prisma || new PrismaClient({
    log: ["query"], // Opcional: Para ver los logs de las consultas SQL
});

if (process.env.NODE_ENV !== 'production') {
    global.prisma = prisma;
}

export default prisma;
