"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { TeleoLogoWithText } from "@/components/teleo-logo"
import { Button } from "@/components/ui/button"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { User, LogOut, Users, Shield } from "lucide-react"

interface UserInfo {
  id: string
  email: string
  name: string
  role: string
}

export function NavBar() {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCurrentUser()
  }, [])

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      }
    } catch (error) {
      console.error('Failed to fetch user:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  // Don't show navbar on login page
  if (pathname === '/login') {
    return null
  }

  return (
    <header className="border-b bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <TeleoLogoWithText />
            <div className="flex gap-6">
              <a 
                href="/" 
                className={`hover:text-blue-600 transition-colors ${pathname === '/' ? 'text-blue-600 font-semibold' : ''}`}
              >
                Dashboard
              </a>
              <a 
                href="/sam-opportunities" 
                className={`hover:text-blue-600 transition-colors ${pathname === '/sam-opportunities' ? 'text-blue-600 font-semibold' : ''}`}
              >
                SAM.gov
              </a>
              <a 
                href="/opportunities" 
                className={`hover:text-blue-600 transition-colors ${pathname === '/opportunities' ? 'text-blue-600 font-semibold' : ''}`}
              >
                Opportunities
              </a>
              <a 
                href="/vendors" 
                className={`hover:text-blue-600 transition-colors ${pathname === '/vendors' ? 'text-blue-600 font-semibold' : ''}`}
              >
                Subcontractors
              </a>
              <a 
                href="/contact-log" 
                className={`hover:text-blue-600 transition-colors ${pathname === '/contact-log' ? 'text-blue-600 font-semibold' : ''}`}
              >
                Contact Log
              </a>
              <a 
                href="/contracts" 
                className={`hover:text-blue-600 transition-colors ${pathname === '/contracts' ? 'text-blue-600 font-semibold' : ''}`}
              >
                Contracts
              </a>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
                      {user.role === 'ADMIN' ? (
                        <Shield className="h-3 w-3 text-blue-600" />
                      ) : (
                        <User className="h-3 w-3 text-blue-600" />
                      )}
                    </div>
                    <span>{user.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div>
                      <p className="font-semibold">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                      <p className="text-xs text-blue-600 mt-1">{user.role}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {user.role === 'ADMIN' && (
                    <>
                      <DropdownMenuItem onClick={() => router.push('/admin/users')}>
                        <Users className="mr-2 h-4 w-4" />
                        Manage Users
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              !loading && (
                <Button 
                  size="sm" 
                  onClick={() => router.push('/login')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Sign In
                </Button>
              )
            )}
          </div>
        </nav>
      </div>
    </header>
  )
}