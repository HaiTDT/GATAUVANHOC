import { prisma } from './src/lib/prisma';

async function analyze() {
  const products = await prisma.product.findMany({
    select: { name: true, category: { select: { name: true, slug: true } } }
  });

  console.log(`Total products: ${products.length}`);
  
  // Group by category to see what's inside
  const grouped = products.reduce((acc, p) => {
    if (!acc[p.category.slug]) acc[p.category.slug] = [];
    acc[p.category.slug].push(p.name);
    return acc;
  }, {} as Record<string, string[]>);

  for (const [slug, names] of Object.entries(grouped)) {
    console.log(`\n=== Category: ${slug} (${names.length} products) ===`);
    console.log(names.slice(0, 10).join('\n'));
    if (names.length > 10) console.log(`...and ${names.length - 10} more`);
  }
}

analyze()
  .then(() => console.log('\nAnalysis done'))
  .catch(console.error)
  .finally(() => prisma.$disconnect());
