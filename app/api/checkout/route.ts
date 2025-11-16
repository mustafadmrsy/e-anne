/**
 * Checkout API - POST /api/checkout
 * Create order from cart
 */

import { NextRequest, NextResponse } from 'next/server';
import { getOrderManager, getCartManager } from '@/lib/managers';
import type { CreateOrderPayload } from '@/lib/models';

export async function POST(req: NextRequest) {
  try {
    const body: CreateOrderPayload = await req.json();
    
    console.log('Checkout request body:', JSON.stringify(body, null, 2));

    // Validate required fields
    if (!body.cartId) {
      console.error('Validation failed: Cart ID missing');
      return NextResponse.json(
        { success: false, error: 'Cart ID is required' },
        { status: 400 }
      );
    }

    if (!body.customer?.email || !body.customer?.firstName || !body.customer?.lastName) {
      console.error('Validation failed: Customer info incomplete', body.customer);
      return NextResponse.json(
        { success: false, error: 'Customer information is required' },
        { status: 400 }
      );
    }

    if (!body.billingAddress?.street || !body.billingAddress?.city) {
      console.error('Validation failed: Billing address incomplete', body.billingAddress);
      return NextResponse.json(
        { success: false, error: 'Billing address is required' },
        { status: 400 }
      );
    }

    if (!body.shippingAddress?.street || !body.shippingAddress?.city) {
      console.error('Validation failed: Shipping address incomplete', body.shippingAddress);
      return NextResponse.json(
        { success: false, error: 'Shipping address is required' },
        { status: 400 }
      );
    }

    if (!body.paymentMethod) {
      console.error('Validation failed: Payment method missing');
      return NextResponse.json(
        { success: false, error: 'Payment method is required' },
        { status: 400 }
      );
    }

    // Verify cart exists and has items
    const cartManager = getCartManager();
    let cart = await cartManager.getById(body.cartId);

    // Handle legacy cart (not in Firestore yet)
    if (!cart && body.cartId.startsWith('legacy-')) {
      console.log('Legacy cart detected, creating new cart in Firestore');
      
      // Create a new cart from the order data
      // We'll validate items exist during order creation
      cart = {
        id: body.cartId,
        userId: null,
        sessionId: null,
        items: [], // Will be populated from request
        bundles: [],
        subtotal: 0,
        discountTotal: 0,
        taxTotal: 0,
        shippingTotal: 0,
        grandTotal: 0,
        status: 'active',
        lastActivityAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      } as any;
    }

    if (!cart) {
      console.error('Cart not found:', body.cartId);
      return NextResponse.json(
        { success: false, error: 'Cart not found' },
        { status: 404 }
      );
    }

    // For legacy carts, we skip the items check since they're client-side only
    if (!body.cartId.startsWith('legacy-') && cart.items.length === 0 && cart.bundles.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Cart is empty' },
        { status: 400 }
      );
    }

    // Get client IP
    const forwardedFor = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    const clientIp = forwardedFor?.split(',')[0] || realIp || '127.0.0.1';

    // Create order
    const orderManager = getOrderManager();
    const order = await orderManager.createOrder({
      ...body,
      customer: {
        ...body.customer,
        ipAddress: clientIp
      }
    }, cart); // Pass the cart object directly for legacy carts

    return NextResponse.json({
      success: true,
      data: {
        order,
        orderId: order.id,
        orderNumber: order.orderNumber
      },
      message: 'Order created successfully'
    });

  } catch (error) {
    console.error('Checkout error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Checkout failed'
      },
      { status: 500 }
    );
  }
}
