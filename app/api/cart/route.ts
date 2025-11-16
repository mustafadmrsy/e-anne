/**
 * Cart API - GET /api/cart
 * Get or create cart for user/session
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCartManager } from '@/lib/managers';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
  try {
    const cartManager = getCartManager();
    
    // Get user ID from auth (implement your auth logic)
    const userId = req.headers.get('x-user-id'); // or from session
    
    // Get or create session ID
    const cookieStore = await cookies();
    let sessionId = cookieStore.get('session_id')?.value;
    
    if (!sessionId && !userId) {
      sessionId = `session_${Date.now()}_${Math.random()}`;
    }

    // Get or create cart
    const cart = await cartManager.getOrCreateCart(
      userId || undefined,
      sessionId
    );

    // Get cart summary
    const summary = cartManager.getCartSummary(cart);

    const response = NextResponse.json({
      success: true,
      data: {
        cart,
        summary
      }
    });

    // Set session cookie if new
    if (sessionId && !cookieStore.get('session_id')) {
      response.cookies.set('session_id', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30 // 30 days
      });
    }

    return response;

  } catch (error) {
    console.error('Get cart error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get cart'
      },
      { status: 500 }
    );
  }
}
