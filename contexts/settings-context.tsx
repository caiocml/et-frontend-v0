"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"

export interface UserSettings {
  avatar: string
  fullName: string
  email: string
  phone: string
  timezone: string
  language: string
  currency: string
  dateFormat: string
  fontSize: number
  theme: "light" | "dark" | "system"
  layout: "default" | "compact" | "expanded"
  notifications: {
    email: boolean
    push: boolean
    sms: boolean
    accountActivity: boolean
    newFeatures: boolean
    marketing: boolean
    frequency: "real-time" | "daily" | "weekly"
    quietHoursStart: string
    quietHoursEnd: string
  }
  privacy: {
    analyticsSharing: boolean
    personalizedAds: boolean
    visibility: "public" | "private"
    dataRetention: "6-months" | "1-year" | "2-years" | "indefinite"
  }
}

// This function creates default settings based on a user
const createDefaultSettings = (user: any): UserSettings => {
  return {
    avatar: user?.avatar || "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/38184074.jpg-M4vCjTSSWVw5RwWvvmrxXBcNVU8MBU.jpeg",
    fullName: user?.name || "User",
    email: user?.email || "user@example.com",
    phone: user?.phone || "+1 (555) 123-4567",
    timezone: "utc-8",
    language: "en",
    currency: "usd",
    dateFormat: "mm-dd-yyyy",
    fontSize: 16,
    theme: "system",
    layout: "default",
    notifications: {
      email: true,
      push: true,
      sms: false,
      accountActivity: true,
      newFeatures: true,
      marketing: false,
      frequency: "real-time",
      quietHoursStart: "22:00",
      quietHoursEnd: "08:00",
    },
    privacy: {
      analyticsSharing: true,
      personalizedAds: false,
      visibility: "private",
      dataRetention: "1-year",
    },
  }
}

type SettingsContextType = {
  settings: UserSettings
  updateSettings: (settings: Partial<UserSettings>) => void
  updateNotificationSettings: (settings: Partial<UserSettings["notifications"]>) => void
  updatePrivacySettings: (settings: Partial<UserSettings["privacy"]>) => void
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  
  const [settings, setSettings] = useState<UserSettings>(() => {
    // Try to load settings from localStorage during initialization
    if (typeof window !== "undefined") {
      const savedSettings = localStorage.getItem("userSettings")
      if (savedSettings) {
        return JSON.parse(savedSettings)
      }
    }
    // Use user information for default settings
    return createDefaultSettings(user)
  })
  
  // Update settings when user changes
  useEffect(() => {
    if (user) {
      setSettings(prev => ({
        ...prev,
        fullName: user.name || `${user.firstName} ${user.lastName}`,
        email: user.email,
        // Only update if these are empty or default values
        avatar: prev.avatar.includes('vercel-storage') ? user.avatar || prev.avatar : prev.avatar
      }))
    }
  }, [user])

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("userSettings", JSON.stringify(settings))
  }, [settings])

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }))
  }

  const updateNotificationSettings = (notificationSettings: Partial<UserSettings["notifications"]>) => {
    setSettings((prev) => ({
      ...prev,
      notifications: { ...prev.notifications, ...notificationSettings },
    }))
  }

  const updatePrivacySettings = (privacySettings: Partial<UserSettings["privacy"]>) => {
    setSettings((prev) => ({
      ...prev,
      privacy: { ...prev.privacy, ...privacySettings },
    }))
  }

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        updateNotificationSettings,
        updatePrivacySettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider")
  }
  return context
}

