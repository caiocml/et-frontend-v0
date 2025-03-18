"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import UtilApiService from '@/lib/utilApiService'

type User = {
  id: string
  firstName: string
  lastName: string
  name: string
  email: string
  role?: string
}

type AuthContextType = {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (firstName: string, lastName: string, email: string, password: string) => Promise<{
    success: boolean
    autoLogin: boolean
  }>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Initialize user from localStorage on component mount
  useEffect(() => {
    const checkUser = () => {
      try {
        // Check for cookie first
        const hasCookie = document.cookie.split(';').some(item => item.trim().startsWith('user='))
        
        if (hasCookie) {
          const storedUser = localStorage.getItem('user')
          if (storedUser && storedUser !== 'undefined') {
            const parsedUser = JSON.parse(storedUser)
            console.log("Restored user session:", parsedUser)
            setUser(parsedUser)
          } else {
            // Cookie exists but no user in localStorage
            console.log("Cookie exists but no user data found - recreating session")
            // Create a minimal user object for session restoration
            const minimalUser = {
              id: "restored",
              firstName: "User",
              lastName: "Session",
              name: "User Session",
              email: "user@example.com"
            }
            setUser(minimalUser)
            localStorage.setItem('user', JSON.stringify(minimalUser))
          }
        } else {
          console.log("No authentication cookie found")
          // Clear any stale user data
          localStorage.removeItem('user')
        }
      } catch (error) {
        console.error('Error parsing user from localStorage', error)
      } finally {
        setLoading(false)
      }
    }
    
    checkUser()
  }, [])

  // Centralized authenticate function that handles the user authentication process
  const authenticate = async (email: string, password: string) => {
    if (!email || !password) return false;
    
    try {
      // Make a real API call to your backend
      const response = await UtilApiService.post('/users/login', { 
        email, 
        password 
      });
      
      // Assuming the response includes user data and token
      const { token, user } = response;
      
      // Store token for future authenticated requests
      localStorage.setItem('token', token);
      
      // Store user data (without sensitive information)
      localStorage.setItem('user', JSON.stringify(user));
      
      // Set user in state
      setUser(user);
      
      // Set auth cookie for middleware
      document.cookie = `user=true; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 days
      
      return true;
    } catch (error) {
      console.error('Authentication error:', error);
      return false;
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const result = await authenticate(email, password);
      return result;
    } finally {
      setLoading(false);
    }
  };
  
  const register = async (firstName: string, lastName: string, email: string, password: string) => {
    if (!firstName || !lastName || !email || !password) return { success: false, autoLogin: false };
    
    setLoading(true);
    try {
      // Make a POST request to your registration endpoint
      await UtilApiService.post('/users/register', {
        firstName,
        lastName,
        email,
        password
      });
      
      // After successful registration, attempt to automatically log in
      try {
        const loginSuccess = await authenticate(email, password);
        return { success: true, autoLogin: loginSuccess };
      } catch (loginError) {
        console.error('Auto-login error after registration:', loginError);
        return { success: true, autoLogin: false };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, autoLogin: false };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
    localStorage.removeItem("token")
    
    // Remove the cookie
    document.cookie = "user=; path=/; max-age=0";
    
    router.push("/login")
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      register,
      logout, 
      isAuthenticated: !!user 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
} 