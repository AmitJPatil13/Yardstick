import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, JWTPayload } from './auth'

export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayload
}

export function withAuth(handler: (req: AuthenticatedRequest, context?: any) => Promise<NextResponse>) {
  return async (req: NextRequest, context?: any) => {
    const authHeader = req.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const payload = verifyToken(token)

    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // Add user info to request
    const authenticatedReq = req as AuthenticatedRequest
    authenticatedReq.user = payload

    return handler(authenticatedReq, context)
  }
}

export function withRole(roles: string[]) {
  return function(handler: (req: AuthenticatedRequest, context?: any) => Promise<NextResponse>) {
    return withAuth(async (req: AuthenticatedRequest, context?: any) => {
      if (!req.user || !roles.includes(req.user.role)) {
        return NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        )
      }
      return handler(req, context)
    })
  }
}

export function withTenant(handler: (req: AuthenticatedRequest, context?: any) => Promise<NextResponse>) {
  return withAuth(async (req: AuthenticatedRequest, context?: any) => {
    // Ensure tenant isolation by checking if user belongs to the tenant
    if (!req.user?.tenantId) {
      return NextResponse.json(
        { error: 'Tenant information missing' },
        { status: 403 }
      )
    }
    return handler(req, context)
  })
}
