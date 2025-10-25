import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

admin.initializeApp();
const db = admin.firestore();

// Order fan-out: users/{uid}/orders/{orderId} -> sellers/{sellerId}/orders/{orderId}
export const onUserOrderCreate = functions.firestore
  .document('users/{uid}/orders/{orderId}')
  .onCreate(async (snap: FirebaseFirestore.DocumentSnapshot, context: functions.EventContext) => {
    const order = snap.data() as any;
    const buyerId = context.params.uid as string;
    const orderId = context.params.orderId as string;

    if (!order || !Array.isArray(order.items)) {
      await logError('order_missing_items', { buyerId, orderId, order });
      return;
    }

    // Grupla: sellerId -> items
    const bySeller = new Map<string, any[]>();
    for (const item of order.items) {
      if (!item || !item.sellerId || !item.productId || !item.quantity) continue;
      const arr = bySeller.get(item.sellerId) || [];
      arr.push(item);
      bySeller.set(item.sellerId, arr);
    }

    const batch = db.batch();

    // Her satıcı için satıcı siparişi oluştur/güncelle
    for (const [sellerId, items] of bySeller.entries()) {
      const sellerOrderRef = db.doc(`sellers/${sellerId}/orders/${orderId}`);
      const sellerOrder = {
        buyerId,
        orderId,
        items,
        amount: order.amount ?? calcAmount(items),
        status: order.status ?? 'pending',
        createdAt: order.createdAt ?? admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };
      batch.set(sellerOrderRef, sellerOrder, { merge: true });
    }

    // Stok düşme işlemleri: transaction ile negatif olmamasını sağla
    try {
      await db.runTransaction(async (tx) => {
        for (const item of order.items) {
          if (!item || !item.sellerId || !item.productId || !item.quantity) continue;
          const prodRef = db.doc(`sellers/${item.sellerId}/products/${item.productId}`);
          const prodSnap = await tx.get(prodRef);
          if (!prodSnap.exists) continue;
          const stock = (prodSnap.get('stock') as number) ?? 0;
          const newStock = stock - Number(item.quantity || 0);
          if (newStock < 0) {
            // Negatifse 0'a sabitle ve outOfStock işaretle
            tx.update(prodRef, {
              stock: 0,
              status: 'inactive',
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
          } else {
            tx.update(prodRef, {
              stock: newStock,
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
          }
        }
      });
    } catch (e) {
      await logError('stock_decrement_failed', { buyerId, orderId, message: (e as Error).message });
    }

    // Batch yaz
    try {
      await batch.commit();
    } catch (e) {
      await logError('seller_order_fanout_failed', { buyerId, orderId, message: (e as Error).message });
    }

    return;
  });

function calcAmount(items: any[]): number {
  return items.reduce((sum, it) => sum + Number(it.price || 0) * Number(it.quantity || 0), 0);
}

async function logError(code: string, data: any) {
  try {
    await db.collection('logs').add({
      level: 'error',
      code,
      data,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  } catch (e) {
    // swallow
  }
}
