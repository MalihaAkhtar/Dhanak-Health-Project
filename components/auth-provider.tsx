"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"

// ----------------- TYPES -----------------
interface User {
  _id: string
  name: string
  email: string
  phone?: string
  address?: string
  specialization?: string
  profileImage?: string
  // Do NOT include password in frontend
}


interface AuthContextType {
  user: User | null
  setUser: (user: User | null) => void
  login: (email: string, password: string) => Promise<boolean>
  signup: (name: string, email: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}


// ----------------- CONTEXT -----------------
const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const BACKEND_URL = "http://localhost:5000"

  // ----------------- LOAD USER FROM LOCALSTORAGE -----------------
  useEffect(() => {
    const storedUser = localStorage.getItem("dhanak_user")
    if (storedUser) setUser(JSON.parse(storedUser))
    setIsLoading(false)
  }, [])

  // ----------------- LOGIN -----------------
 const login = async (email: string, password: string): Promise<boolean> => {
  try {
    const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })

    if (!res.ok) {
      const errData = await res.json()
      console.error("Login failed:", errData.error)
      return false
    }

    const data: User = await res.json()
    setUser(data)
    localStorage.setItem("dhanak_user", JSON.stringify(data))
    router.push("/dashboard")
    return true
  } catch (err) {
    console.error("Login error:", err)
    return false
  }
}

const signup = async (name: string, email: string, password: string): Promise<boolean> => {
  try {
    const res = await fetch(`${BACKEND_URL}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    })

    if (!res.ok) {
      const errData = await res.json()
      console.error("Signup failed:", errData.error)
      return false
    }

    const data: User = await res.json()
    setUser(data)
    localStorage.setItem("dhanak_user", JSON.stringify(data))
    router.push("/dashboard")
    return true
  } catch (err) {
    console.error("Signup error:", err)
    return false
  }
}


  // ----------------- LOGOUT -----------------
  const logout = () => {
    setUser(null)
    localStorage.removeItem("dhanak_user")
    router.push("/login")
  }

  return (
    <AuthContext.Provider value={{ user, setUser, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

// ----------------- USE AUTH HOOK -----------------
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
