/**
 * Payment Creation API - POST /api/payment/create
 * Create payment with Shopier
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPaymentManager, getOrderManager } from '@/lib/managers';
import { PaymentProvider, Currency } from '@/lib/models';
import type { PaymentRequest, PaymentItem } from '@/lib/models';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

export async function POST(req: NextRequest) {
  try {
    const body: { orderId: string } = await req.json();

    if (!body.orderId) {
      return NextResponse.json(
        { success: false, error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Get order
    const orderManager = getOrderManager();
    const order = await orderManager.getById(body.orderId);

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Prepare payment items
    const items: PaymentItem[] = order.items.map(item => ({
      id: item.productId,
      name: item.productName,
      category: '',
      price: item.unitPrice,
      quantity: item.quantity
    }));

    // Prepare payment request
    const paymentRequest: PaymentRequest = {
      orderId: order.id,
      amount: order.grandTotal,
      currency: Currency.TRY,
      customer: order.customer,
      items,
      billingAddress: order.billingAddress,
      shippingAddress: order.shippingAddress,
      description: `Sipariş #${order.orderNumber}`,
      returnUrl: `${BASE_URL}/api/payment/return?orderId=${order.id}`,
      cancelUrl: `${BASE_URL}/checkout?orderId=${order.id}&status=cancelled`,
      metadata: {
        orderNumber: order.orderNumber,
        createdAt: new Date().toISOString()
      }
    };

    // Create payment
    const paymentManager = getPaymentManager();
    
    if (!paymentManager.isConfigured()) {
      return NextResponse.json(
        { success: false, error: 'Payment provider not configured' },
        { status: 500 }
      );
    }

    const result = await paymentManager.createPayment(
      paymentRequest,
      PaymentProvider.SHOPIER
    );

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Payment creation failed'
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        paymentUrl: result.paymentUrl,
        paymentForm: result.paymentForm,
        transactionId: result.transactionId
      },
      message: 'Payment created successfully'
    });

  } catch (error) {
    console.error('Payment creation error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Payment creation failed'
      },
      { status: 500 }
    );
  }
}
