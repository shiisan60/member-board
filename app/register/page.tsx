"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getSession } from "next-auth/react"
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Box,
  Link,
  CircularProgress,
  InputAdornment,
  IconButton
} from "@mui/material"
import { Visibility, VisibilityOff } from "@mui/icons-material"
import NextLink from "next/link"
import PasswordStrengthIndicator from "@/components/PasswordStrengthIndicator"
import { checkPasswordStrength, validateEmail } from "@/lib/validators"

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    // Check if user is already logged in
    getSession().then((session) => {
      if (session) {
        router.push("/")
      }
    })
  }, [router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    })
    
    // Clear general error
    if (error) setError("")
    
    // Real-time validation
    const newFieldErrors = { ...fieldErrors };
    
    switch (name) {
      case 'email':
        if (value && !validateEmail(value)) {
          newFieldErrors.email = '有効なメールアドレスを入力してください';
        } else {
          delete newFieldErrors.email;
        }
        break;
      case 'name':
        if (value && (value.length < 2 || value.length > 50)) {
          newFieldErrors.name = '名前は2文字以上50文字以下で入力してください';
        } else {
          delete newFieldErrors.name;
        }
        break;
      case 'password':
        const strength = checkPasswordStrength(value);
        if (value && !strength.isValid) {
          newFieldErrors.password = 'パスワードの要件を満たしてください';
        } else {
          delete newFieldErrors.password;
        }
        // Confirm password validation
        if (formData.confirmPassword && value !== formData.confirmPassword) {
          newFieldErrors.confirmPassword = 'パスワードが一致しません';
        } else if (formData.confirmPassword && value === formData.confirmPassword) {
          delete newFieldErrors.confirmPassword;
        }
        break;
      case 'confirmPassword':
        if (value && value !== formData.password) {
          newFieldErrors.confirmPassword = 'パスワードが一致しません';
        } else {
          delete newFieldErrors.confirmPassword;
        }
        break;
    }
    
    setFieldErrors(newFieldErrors);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccessMessage("")

    // Validation
    const errors: Record<string, string> = {};
    
    if (!validateEmail(formData.email)) {
      errors.email = '有効なメールアドレスを入力してください';
    }
    
    if (formData.name && (formData.name.length < 2 || formData.name.length > 50)) {
      errors.name = '名前は2文字以上50文字以下で入力してください';
    }
    
    const passwordStrength = checkPasswordStrength(formData.password);
    if (!passwordStrength.isValid) {
      errors.password = 'パスワードの要件を満たしてください';
    }
    
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'パスワードが一致しません';
    }
    
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError('入力内容を確認してください');
      return;
    }

    setLoading(true)

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "登録に失敗しました")
      }

      setSuccessMessage(data.message)
      if (data.warning) {
        setError(data.warning);
      }
      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      })
      setFieldErrors({})
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
          }}
        >
          <Typography component="h1" variant="h4" sx={{ mb: 3 }}>
            新規登録
          </Typography>

          {successMessage && (
            <Alert severity="success" sx={{ width: "100%", mb: 2 }}>
              {successMessage}
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ width: "100%", mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: "100%" }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="name"
              label="名前"
              name="name"
              autoComplete="name"
              autoFocus
              value={formData.name}
              onChange={handleChange}
              disabled={loading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="メールアドレス"
              name="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              error={!!fieldErrors.email}
              helperText={fieldErrors.email}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="パスワード"
              type={showPassword ? "text" : "password"}
              id="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              error={!!fieldErrors.password}
              helperText={fieldErrors.password}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <PasswordStrengthIndicator 
              password={formData.password}
              showDetails={true}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="パスワード（確認）"
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              autoComplete="new-password"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={loading}
              error={!!fieldErrors.confirmPassword}
              helperText={fieldErrors.confirmPassword}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle confirm password visibility"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {loading ? "登録中..." : "登録"}
            </Button>
            <Box sx={{ textAlign: "center" }}>
              <Link component={NextLink} href="/login" variant="body2">
                既にアカウントをお持ちの方はこちら
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  )
}