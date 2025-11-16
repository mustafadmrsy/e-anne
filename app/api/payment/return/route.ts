/**
 * Payment Return/Callback API - GET/POST /api/payment/return
 * Handle Shopier return and webhook
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPaymentManager, getOrderManager } from '@/lib/managers';
import { PaymentStatus } from '@/lib/models';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

/**
 * GET - Return URL handler
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId');
    const status = searchParams.get('status');
    const paymentId = searchParams.get('payment_id');

    if (!orderId) {
      return NextResponse.redirect(
        `${BASE_URL}/cart?error=missing_order_id`,
        { status: 302 }
      );
    }

    // Get payment and order
    const paymentManager = getPaymentManager();
    const orderManager = getOrderManager();

    const payment = await paymentManager.getPaymentByOrderId(orderId);
    const order = await orderManager.getById(orderId);

    if (!order) {
      return NextResponse.redirect(
        `${BASE_URL}/cart?error=order_not_found`,
        { status: 302 }
      );
    }

    // Handle success
    if (status === 'success' && paymentId) {
      if (payment) {
        await paymentManager.update(payment.id, {
          status: PaymentStatus.COMPLETED,
          transactionId: paymentId,
          paidAt: new Date()
        });
      }

      await orderManager.updatePaymentStatus(
        orderId,
        PaymentStatus.COMPLETED,
        paymentId
      );

      return NextResponse.redirect(
        `${BASE_URL}/order/success?orderNumber=${order.orderNumber}`,
        { status: 302 }
      );
    }

    // Handle failure
    if (payment) {
      await paymentManager.update(payment.id, {
        status: PaymentStatus.FAILED
      });
    }

    await orderManager.updatePaymentStatus(orderId, PaymentStatus.FAILED);

    return NextResponse.redirect(
      `${BASE_URL}/checkout?orderId=${orderId}&error=payment_failed`,
      { status: 302 }
    );

  } catch (error) {
    console.error('Payment return error:', error);
    return NextResponse.redirect(
      `${BASE_URL}/cart?error=server_error`,
      { status: 302 }
    );
  }
}

/**
 * POST - Webhook handler
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const webhookData: any = {};

    formData.forEach((value, key) => {
      webhookData[key] = value;
    });

    const orderId = webhookData.platform_order_id;
    const status = webhookData.status;
    const paymentId = webhookData.payment_id;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Missing order ID' },
        { status: 400 }
      );
    }

    // Verify payment
    const paymentManager = getPaymentManager();
    const orderManager = getOrderManager();

    const isValid = await paymentManager.verifyPayment(orderId, webhookData);

    if (!isValid) {
      console.error('Payment verification failed:', webhookData);
      return NextResponse.json(
        { success: false, error: 'Invalid payment' },
        { status: 400 }
      );
    }

    // Update order status
    const paymentStatus = status === 'success' 
      ? PaymentStatus.COMPLETED 
      : PaymentStatus.FAILED;

    await orderManager.updatePaymentStatus(
      orderId,
      paymentStatus,
      paymentId
    );

    return NextResponse.json({
      success: true,
      message: 'Payment webhook processed'
    });

  } catch (error) {
    console.error('Payment webhook error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Webhook processing failed'
      },
      { status: 500 }
    );
  }
}
