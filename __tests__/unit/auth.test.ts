import { hashPassword } from '@/lib/auth'
import bcrypt from 'bcryptjs'

describe('Authentication Functions', () => {
  describe('hashPassword', () => {
    it('should hash a password correctly', async () => {
      const password = 'testPassword123'
      const hashedPassword = await hashPassword(password)
      
      expect(hashedPassword).toBeDefined()
      expect(hashedPassword).not.toBe(password)
      expect(hashedPassword.length).toBeGreaterThan(password.length)
    })

    it('should create different hashes for the same password', async () => {
      const password = 'testPassword123'
      const hash1 = await hashPassword(password)
      const hash2 = await hashPassword(password)
      
      expect(hash1).not.toBe(hash2)
    })

    it('should create verifiable hashes', async () => {
      const password = 'testPassword123'
      const hashedPassword = await hashPassword(password)
      
      const isValid = await bcrypt.compare(password, hashedPassword)
      expect(isValid).toBe(true)
      
      const isInvalid = await bcrypt.compare('wrongPassword', hashedPassword)
      expect(isInvalid).toBe(false)
    })
  })
})