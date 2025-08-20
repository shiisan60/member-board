/**
 * @jest-environment node
 */
import { POST } from '@/app/api/auth/register/route'
import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}))

// Mock bcrypt
jest.mock('bcryptjs')

describe('/api/auth/register', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should register a new user successfully', async () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      name: 'Test User',
      password: 'hashedPassword',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(null)
    ;(prisma.user.create as jest.Mock).mockResolvedValue(mockUser)
    ;(bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword')

    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.message).toBe('登録が完了しました。')
    expect(data.user).toEqual({
      id: '123',
      email: 'test@example.com',
      name: 'Test User',
    })
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        email: 'test@example.com',
        password: 'hashedPassword',
        name: 'Test User',
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    })
  })

  it('should return error if email already exists', async () => {
    ;(prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: '123',
      email: 'existing@example.com',
    })

    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: 'existing@example.com',
        password: 'password123',
        name: 'Test User',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('このメールアドレスは既に登録されています')
    expect(prisma.user.create).not.toHaveBeenCalled()
  })

  it('should return error if email or password is missing', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('メールアドレスとパスワードは必須です')
  })

  it('should return error if password is too short', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'short',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('パスワードは8文字以上にしてください')
  })

  it('should use email prefix as name if name is not provided', async () => {
    ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(null)
    ;(prisma.user.create as jest.Mock).mockResolvedValue({
      id: '123',
      email: 'test@example.com',
      name: 'test',
      password: 'hashedPassword',
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    ;(bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword')

    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        email: 'test@example.com',
        password: 'hashedPassword',
        name: 'test',
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    })
  })

  it('should handle database errors gracefully', async () => {
    ;(prisma.user.findUnique as jest.Mock).mockRejectedValue(new Error('Database error'))

    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('登録処理中にエラーが発生しました')
  })
})