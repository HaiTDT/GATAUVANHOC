import { prisma } from './src/lib/prisma';
import { cartService } from './src/services/cart.service';

async function test() {
  const user = await prisma.user.findFirst();
  if (!user) {
    console.log('No user in database');
    return;
  }
  
  try {
    const cart = await cartService.getCart(user.id);
    console.log('Success, cart items:', cart.items.length);
  } catch(e) {
    console.error('Error in getCart:', e);
  } finally {
    await prisma.$disconnect();
  }
}

test();
