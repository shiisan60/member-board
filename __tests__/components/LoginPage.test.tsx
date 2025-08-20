import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import LoginPage from '@/app/login/page'

jest.mock('next-auth/react')
jest.mock('next/navigation')

describe('LoginPage Component', () => {
  const mockPush = jest.fn()
  const mockSignIn = signIn as jest.MockedFunction<typeof signIn>
  const mockGetSession = getSession as jest.MockedFunction<typeof getSession>

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    })
    mockGetSession.mockResolvedValue(null)
  })

  it('should render login form correctly', () => {
    render(<LoginPage />)
    
    expect(screen.getByText('ログイン')).toBeInTheDocument()
    expect(screen.getByLabelText('メールアドレス')).toBeInTheDocument()
    expect(screen.getByLabelText('パスワード')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'ログイン' })).toBeInTheDocument()
    expect(screen.getByText('アカウントをお持ちでない方はこちら')).toBeInTheDocument()
  })

  it('should redirect if already logged in', async () => {
    mockGetSession.mockResolvedValue({
      user: { email: 'test@example.com' },
      expires: '2024-12-31',
    })

    render(<LoginPage />)

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/')
    })
  })

  it('should handle successful login', async () => {
    const user = userEvent.setup()
    mockSignIn.mockResolvedValue({ ok: true, error: null })

    render(<LoginPage />)

    const emailInput = screen.getByLabelText('メールアドレス')
    const passwordInput = screen.getByLabelText('パスワード')
    const submitButton = screen.getByRole('button', { name: 'ログイン' })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('credentials', {
        email: 'test@example.com',
        password: 'password123',
        redirect: false,
      })
      expect(mockPush).toHaveBeenCalledWith('/')
    })
  })

  it('should display error on failed login', async () => {
    const user = userEvent.setup()
    mockSignIn.mockResolvedValue({
      ok: false,
      error: 'Invalid credentials',
      status: 401,
      url: null,
    })

    render(<LoginPage />)

    const emailInput = screen.getByLabelText('メールアドレス')
    const passwordInput = screen.getByLabelText('パスワード')
    const submitButton = screen.getByRole('button', { name: 'ログイン' })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'wrongpassword')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('メールアドレスまたはパスワードが正しくありません')).toBeInTheDocument()
    })
  })

  it('should show loading state during login', async () => {
    const user = userEvent.setup()
    mockSignIn.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

    render(<LoginPage />)

    const emailInput = screen.getByLabelText('メールアドレス')
    const passwordInput = screen.getByLabelText('パスワード')
    const submitButton = screen.getByRole('button', { name: 'ログイン' })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)

    expect(screen.getByText('ログイン中...')).toBeInTheDocument()
    expect(submitButton).toBeDisabled()
  })

  it('should validate required fields', async () => {
    const user = userEvent.setup()
    render(<LoginPage />)

    const submitButton = screen.getByRole('button', { name: 'ログイン' })
    
    // Try to submit empty form
    fireEvent.submit(submitButton.closest('form')!)

    // Check for HTML5 validation
    const emailInput = screen.getByLabelText('メールアドレス') as HTMLInputElement
    const passwordInput = screen.getByLabelText('パスワード') as HTMLInputElement
    
    expect(emailInput.validity.valueMissing).toBe(true)
    expect(passwordInput.validity.valueMissing).toBe(true)
  })
})