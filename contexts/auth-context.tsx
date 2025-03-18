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
  register: (firstName: string, lastName: string, email: string, password: string) => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      const storedUser = localStorage.getItem("user")
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser))
        } catch (e) {
          localStorage.removeItem("user")
        }
      }
      setLoading(false)
    }
    
    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    if (!email || !password) return false;
    
    try {
      setLoading(true);
      
      // TEMPORARY: For testing when backend is not available
      if (process.env.NODE_ENV === 'development') {
        console.log("Using mock login data for development");
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay
        
        const mockUser = {
          id: "1",
          firstName: email.split('@')[0],
          lastName: "User",
          name: email.split('@')[0] + " User",
          email,
          role: "user"
        };
        
        setUser(mockUser);
        localStorage.setItem('user', JSON.stringify(mockUser));
        localStorage.setItem('token', 'mock-token-for-development');
        document.cookie = `user=true; path=/; max-age=${60 * 60 * 24 * 7}`;
        
        return true;
      }
      
      // Regular API call (will fail with ERR_NETWORK until backend is fixed)
      const response = await UtilApiService.post('/users/login', { 
        email, 
        password 
      });
      
      // Assuming the response includes a token and user data
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
      console.error('Login error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  const register = async (firstName: string, lastName: string, email: string, password: string) => {
    if (!firstName || !lastName || !email || !password) return false;
    
    try {
      setLoading(true);
      
      // Make a POST request to your registration endpoint
      await UtilApiService.post('/auth/register', {
        firstName,
        lastName,
        email,
        password
      });
      
      // Registration successful
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
    
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

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
} 