import { prisma } from './src/lib/prisma';
import * as fs from 'fs';

async function analyze() {
  const products = await prisma.product.findMany({
    select: { name: true, category: { select: { name: true } } }
  });
  
  let output = `Total products: ${products.length}\n`;
  const grouped = products.reduce((acc, p) => {
    if (!acc[p.category.name]) acc[p.category.name] = [];
    acc[p.category.name].push(p.name);
    return acc;
  }, {} as Record<string, string[]>);

  for (const [catName, names] of Object.entries(grouped)) {
    output += `\n=== ${catName} ===\n`;
    output += names.join('\n') + '\n';
  }
  
  fs.writeFileSync('products-list.txt', output, 'utf-8');
}

analyze()
  .then(() => console.log('Wrote products-list.txt'))
  .catch(console.error)
  .finally(() => prisma.$disconnect());
