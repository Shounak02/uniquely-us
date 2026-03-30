const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

console.log("Keys on prisma:", Object.keys(prisma).filter(k => !k.startsWith("_")));
console.log("Is communityPost accessible?", !!prisma.communityPost);
console.log("Is user accessible?", !!prisma.user);
process.exit(0);
