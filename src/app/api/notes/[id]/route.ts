import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { withTenant, AuthenticatedRequest } from '@/lib/middleware'

const prisma = new PrismaClient()

// GET /api/notes/[id] - Retrieve a specific note
export const GET = withTenant(async (req: AuthenticatedRequest, { params }: { params: { id: string } }) => {
  try {
    const note = await prisma.note.findFirst({
      where: {
        id: params.id,
        tenantId: req.user!.tenantId // Ensure tenant isolation
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

    if (!note) {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ note })
  } catch (error) {
    console.error('Error fetching note:', error)
    return NextResponse.json(
      { error: 'Failed to fetch note' },
      { status: 500 }
    )
  }
})

// PUT /api/notes/[id] - Update a note
export const PUT = withTenant(async (req: AuthenticatedRequest, { params }: { params: { id: string } }) => {
  try {
    const { title, content } = await req.json()

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      )
    }

    // Check if note exists and belongs to the tenant
    const existingNote = await prisma.note.findFirst({
      where: {
        id: params.id,
        tenantId: req.user!.tenantId
      }
    })

    if (!existingNote) {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404 }
      )
    }

    const note = await prisma.note.update({
      where: { id: params.id },
      data: {
        title,
        content,
        updatedAt: new Date()
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

    return NextResponse.json({ note })
  } catch (error) {
    console.error('Error updating note:', error)
    return NextResponse.json(
      { error: 'Failed to update note' },
      { status: 500 }
    )
  }
})

// DELETE /api/notes/[id] - Delete a note
export const DELETE = withTenant(async (req: AuthenticatedRequest, { params }: { params: { id: string } }) => {
  try {
    // Check if note exists and belongs to the tenant
    const existingNote = await prisma.note.findFirst({
      where: {
        id: params.id,
        tenantId: req.user!.tenantId
      }
    })

    if (!existingNote) {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404 }
      )
    }

    await prisma.note.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Note deleted successfully' })
  } catch (error) {
    console.error('Error deleting note:', error)
    return NextResponse.json(
      { error: 'Failed to delete note' },
      { status: 500 }
    )
  }
})
