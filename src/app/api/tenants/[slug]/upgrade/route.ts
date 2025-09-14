import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { withRole, AuthenticatedRequest } from '@/lib/middleware'

const prisma = new PrismaClient()

// POST /api/tenants/[slug]/upgrade - Upgrade tenant subscription (Admin only)
export const POST = withRole(['ADMIN'])(async (req: AuthenticatedRequest, { params }: { params: { slug: string } }) => {
  try {
    // Verify that the admin belongs to the tenant they're trying to upgrade
    if (req.user!.tenantSlug !== params.slug) {
      return NextResponse.json(
        { error: 'You can only upgrade your own tenant' },
        { status: 403 }
      )
    }

    const tenant = await prisma.tenant.findUnique({
      where: { slug: params.slug }
    })

    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      )
    }

    if (tenant.plan === 'PRO') {
      return NextResponse.json(
        { error: 'Tenant is already on Pro plan' },
        { status: 400 }
      )
    }

    const updatedTenant = await prisma.tenant.update({
      where: { slug: params.slug },
      data: { plan: 'PRO' }
    })

    return NextResponse.json({
      message: 'Tenant upgraded to Pro successfully',
      tenant: {
        id: updatedTenant.id,
        name: updatedTenant.name,
        slug: updatedTenant.slug,
        plan: updatedTenant.plan
      }
    })
  } catch (error) {
    console.error('Error upgrading tenant:', error)
    return NextResponse.json(
      { error: 'Failed to upgrade tenant' },
      { status: 500 }
    )
  }
})
