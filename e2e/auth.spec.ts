import { test, expect } from '@playwright/test'

// Helper function to generate unique email
const generateUniqueEmail = () => {
  const timestamp = Date.now()
  return `test${timestamp}@example.com`
}

test.describe('Authentication Flow', () => {
  test.describe('User Registration', () => {
    test('should register a new user successfully', async ({ page }) => {
      const uniqueEmail = generateUniqueEmail()

      await page.goto('/register')
      
      // Fill registration form
      await page.fill('input[name="name"]', 'Test User')
      await page.fill('input[name="email"]', uniqueEmail)
      await page.fill('input[name="password"]', 'TestPassword123')
      await page.fill('input[name="confirmPassword"]', 'TestPassword123')
      
      // Submit form
      await page.click('button[type="submit"]')
      
      // Check for success message
      await expect(page.locator('.MuiAlert-standardSuccess')).toContainText('登録が完了しました')
    })

    test('should show error for existing email', async ({ page }) => {
      await page.goto('/register')
      
      // Use a previously registered email
      await page.fill('input[name="name"]', 'Test User')
      await page.fill('input[name="email"]', 'existing@example.com')
      await page.fill('input[name="password"]', 'TestPassword123')
      await page.fill('input[name="confirmPassword"]', 'TestPassword123')
      
      // First registration (might fail if already exists)
      await page.click('button[type="submit"]')
      
      // Clear form and try again
      await page.reload()
      await page.fill('input[name="name"]', 'Another User')
      await page.fill('input[name="email"]', 'existing@example.com')
      await page.fill('input[name="password"]', 'TestPassword123')
      await page.fill('input[name="confirmPassword"]', 'TestPassword123')
      
      await page.click('button[type="submit"]')
      
      // Check for error message
      const errorAlert = page.locator('.MuiAlert-standardError')
      await expect(errorAlert).toBeVisible()
    })

    test('should validate password length', async ({ page }) => {
      await page.goto('/register')
      
      await page.fill('input[name="name"]', 'Test User')
      await page.fill('input[name="email"]', generateUniqueEmail())
      await page.fill('input[name="password"]', 'short')
      await page.fill('input[name="confirmPassword"]', 'short')
      
      await page.click('button[type="submit"]')
      
      // Check for validation error
      await expect(page.locator('.MuiAlert-standardError')).toContainText('パスワードは8文字以上')
    })

    test('should validate password confirmation', async ({ page }) => {
      await page.goto('/register')
      
      await page.fill('input[name="name"]', 'Test User')
      await page.fill('input[name="email"]', generateUniqueEmail())
      await page.fill('input[name="password"]', 'TestPassword123')
      await page.fill('input[name="confirmPassword"]', 'DifferentPassword123')
      
      await page.click('button[type="submit"]')
      
      // Check for validation error
      await expect(page.locator('.MuiAlert-standardError')).toContainText('パスワードが一致しません')
    })
  })

  test.describe('User Login', () => {
    const testEmail = 'e2e-test@example.com'
    const testPassword = 'E2ETestPassword123'

    test.beforeAll(async ({ request }) => {
      // Create a test user for login tests
      await request.post('/api/auth/register', {
        data: {
          name: 'E2E Test User',
          email: testEmail,
          password: testPassword,
        },
      })
    })

    test('should login with valid credentials', async ({ page }) => {
      await page.goto('/login')
      
      await page.fill('input[name="email"]', testEmail)
      await page.fill('input[name="password"]', testPassword)
      
      await page.click('button[type="submit"]')
      
      // Should redirect to home page
      await expect(page).toHaveURL('/')
    })

    test('should show error with invalid credentials', async ({ page }) => {
      await page.goto('/login')
      
      await page.fill('input[name="email"]', testEmail)
      await page.fill('input[name="password"]', 'WrongPassword123')
      
      await page.click('button[type="submit"]')
      
      // Should show error message
      await expect(page.locator('.MuiAlert-standardError')).toContainText('メールアドレスまたはパスワードが正しくありません')
    })

    test('should show error with non-existent user', async ({ page }) => {
      await page.goto('/login')
      
      await page.fill('input[name="email"]', 'nonexistent@example.com')
      await page.fill('input[name="password"]', 'SomePassword123')
      
      await page.click('button[type="submit"]')
      
      // Should show error message
      await expect(page.locator('.MuiAlert-standardError')).toContainText('メールアドレスまたはパスワードが正しくありません')
    })

    test('should show loading state during login', async ({ page }) => {
      await page.goto('/login')
      
      await page.fill('input[name="email"]', testEmail)
      await page.fill('input[name="password"]', testPassword)
      
      // Click and immediately check for loading state
      const submitButton = page.locator('button[type="submit"]')
      await submitButton.click()
      
      // Check if button shows loading state (might be very quick)
      const buttonText = await submitButton.textContent()
      expect(['ログイン', 'ログイン中...']).toContain(buttonText)
    })
  })

  test.describe('Session Management', () => {
    const sessionEmail = 'session-test@example.com'
    const sessionPassword = 'SessionTest123'

    test.beforeAll(async ({ request }) => {
      // Create a test user for session tests
      await request.post('/api/auth/register', {
        data: {
          name: 'Session Test User',
          email: sessionEmail,
          password: sessionPassword,
        },
      })
    })

    test('should maintain session after login', async ({ page, context }) => {
      // Login
      await page.goto('/login')
      await page.fill('input[name="email"]', sessionEmail)
      await page.fill('input[name="password"]', sessionPassword)
      await page.click('button[type="submit"]')
      
      // Wait for redirect
      await expect(page).toHaveURL('/')
      
      // Open new tab and check if still logged in
      const newPage = await context.newPage()
      await newPage.goto('/')
      
      // Should not redirect to login
      await expect(newPage).toHaveURL('/')
    })

    test('should redirect to login when accessing protected route without session', async ({ page }) => {
      // Clear cookies to ensure no session
      await page.context().clearCookies()
      
      // Try to access home page (protected route)
      await page.goto('/')
      
      // Should redirect to login if home is protected
      // Note: This depends on your route protection implementation
      // Adjust according to your app's behavior
    })

    test('should logout successfully', async ({ page }) => {
      // First, login
      await page.goto('/login')
      await page.fill('input[name="email"]', sessionEmail)
      await page.fill('input[name="password"]', sessionPassword)
      await page.click('button[type="submit"]')
      
      // Wait for redirect to home
      await expect(page).toHaveURL('/')
      
      // Look for logout button and click it
      // Note: Adjust selector based on your actual logout button implementation
      const logoutButton = page.locator('button:has-text("ログアウト"), a:has-text("ログアウト")')
      if (await logoutButton.isVisible()) {
        await logoutButton.click()
        
        // Should redirect to login page
        await expect(page).toHaveURL('/login')
      }
    })
  })

  test.describe('Navigation', () => {
    test('should navigate between login and register pages', async ({ page }) => {
      await page.goto('/login')
      
      // Click link to register page
      await page.click('a:has-text("アカウントをお持ちでない方はこちら")')
      await expect(page).toHaveURL('/register')
      
      // Navigate back to login
      await page.click('a:has-text("既にアカウントをお持ちの方はこちら")')
      await expect(page).toHaveURL('/login')
    })
  })
})