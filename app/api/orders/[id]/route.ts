/**
 * Get Order by ID API - GET /api/orders/[id]
 * Get order details
 */

import { NextRequest, NextResponse } from 'next/server';
import { getOrderManager } from '@/lib/managers';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Order ID is required' },
        { status: 400 }
      );
    }

    const orderManager = getOrderManager();
    const order = await orderManager.getById(id);

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Optional: Check if user owns this order
    const userId = req.headers.get('x-user-id');
    if (userId && order.customer.userId !== userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { order }
    });

  } catch (error) {
    console.error('Get order error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get order'
      },
      { status: 500 }
    );
  }
}
