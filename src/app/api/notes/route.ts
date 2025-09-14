import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { withTenant, AuthenticatedRequest } from '@/lib/middleware'

const prisma = new PrismaClient()

// GET /api/notes - List all notes for the current tenant
export const GET = withTenant(async (req: AuthenticatedRequest) => {
  try {
    const notes = await prisma.note.findMany({
      where: {
        tenantId: req.user!.tenantId
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ notes })
  } catch (error) {
    console.error('Error fetching notes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notes' },
      { status: 500 }
    )
  }
})

// POST /api/notes - Create a new note
export const POST = withTenant(async (req: AuthenticatedRequest) => {
  try {
    const { title, content } = await req.json()

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      )
    }

    // Check subscription limits
    const tenant = await prisma.tenant.findUnique({
      where: { id: req.user!.tenantId },
      include: {
        notes: true
      }
    })

    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      )
    }

    // Enforce FREE plan limit of 3 notes
    if (tenant.plan === 'FREE' && tenant.notes.length >= 3) {
      return NextResponse.json(
        { 
          error: 'Note limit reached. Upgrade to Pro for unlimited notes.',
          code: 'LIMIT_REACHED'
        },
        { status: 403 }
      )
    }

    const note = await prisma.note.create({
      data: {
        title,
        content,
        tenantId: req.user!.tenantId,
        authorId: req.user!.userId
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({ note }, { status: 201 })
  } catch (error) {
    console.error('Error creating note:', error)
    return NextResponse.json(
      { error: 'Failed to create note' },
      { status: 500 }
    )
  }
})
