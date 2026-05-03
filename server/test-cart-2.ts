import { prisma } from './src/lib/prisma';
import { cartService } from './src/services/cart.service';

async function test() {
  try {
    const cart = await cartService.getCart('00000000-0000-0000-0000-000000000000');
    console.log('Success, cart items:', cart.items.length);
  } catch(e) {
    console.error('Error in getCart:', e);
  } finally {
    await prisma.$disconnect();
  }
}

test();
