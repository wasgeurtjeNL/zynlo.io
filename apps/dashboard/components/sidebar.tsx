'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Inbox, 
  MessageSquare, 
  Users, 
  Settings, 
  ChevronDown,
  ChevronRight,
  Hash,
  Star,
  Archive,
  Trash2,
  AlertCircle,
  LogOut,
  User,
  CheckSquare
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth, useUser, useTicketCounts, useTaskStats } from '@zynlo/supabase'
import { useRouter } from 'next/navigation'

const navigation = [
  {
    name: 'Inbox',
    href: '/inbox',
    icon: Inbox,
    children: [
      { name: 'Nieuw', href: '/inbox/nieuw' },
      { name: 'Open', href: '/inbox/open' },
      { name: 'In afwachting', href: '/inbox/afwachting' },
      { name: 'Opgelost', href: '/inbox/opgelost' },
      { name: 'Gesloten', href: '/inbox/gesloten' },
      { name: 'Spam', href: '/inbox/spam', icon: AlertCircle },
    ]
  },
  {
    name: 'Tickets',
    href: '/tickets',
    icon: MessageSquare,
    children: [
      { name: 'Alle tickets', href: '/tickets' },
      { name: 'Mijn tickets', href: '/tickets/mijn' },
      { name: 'Niet toegewezen', href: '/tickets/niet-toegewezen' },
      { name: 'Favorieten', href: '/tickets/favorieten', icon: Star },
      { name: 'Archief', href: '/tickets/archief', icon: Archive },
      { name: 'Prullenbak', href: '/tickets/prullenbak', icon: Trash2 },
    ]
  },
  {
    name: 'Taken',
    href: '/taken',
    icon: CheckSquare,
    children: [
      { name: 'Alle taken', href: '/taken' },
      { name: 'Mijn taken', href: '/taken/mijn' },
      { name: 'Team taken', href: '/taken/team' },
      { name: 'Voltooid', href: '/taken/voltooid' },
    ]
  },
  {
    name: 'Klanten',
    href: '/klanten',
    icon: Users,
  },
  {
    name: 'Instellingen',
    href: '/settings',
    icon: Settings,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [expandedItems, setExpandedItems] = useState<string[]>(['Inbox', 'Tickets', 'Taken'])
  const { user } = useUser()
  const { signOut } = useAuth()
  const { data: counts } = useTicketCounts()
  const { data: taskStats } = useTaskStats(user?.id || '')

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev =>
      prev.includes(itemName)
        ? prev.filter(item => item !== itemName)
        : [...prev, itemName]
    )
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  const getCountForPath = (path: string) => {
    if (!counts && !taskStats) return 0
    
    switch (path) {
      case '/inbox/nieuw':
        return counts?.new || 0
      case '/inbox/open':
        return counts?.open || 0
      case '/inbox/afwachting':
        return counts?.pending || 0
      case '/inbox/opgelost':
        return counts?.resolved || 0
      case '/inbox/gesloten':
        return counts?.closed || 0
      case '/inbox/spam':
        return counts?.spam || 0
      case '/tickets':
        return counts?.total || 0
      case '/tickets/mijn':
        return counts?.assigned_to_me || 0
      case '/tickets/niet-toegewezen':
        return counts?.unassigned || 0
      case '/tickets/favorieten':
        return counts?.favorites || 0
      // Task counts
      case '/taken':
        return taskStats?.total_tasks || 0
      case '/taken/mijn':
        return taskStats?.my_tasks || 0
      case '/taken/team':
        return taskStats?.total_tasks ? (taskStats.total_tasks - taskStats.my_tasks) : 0
      case '/taken/voltooid':
        return 0 // Could be added to taskStats if needed
      default:
        return 0
    }
  }

  return (
    <div className="flex h-full w-64 flex-col bg-gray-900">
      {/* Logo */}
      <div className="flex h-16 items-center px-6">
        <h1 className="text-base font-semibold text-white" style={{ fontSize: '1rem', lineHeight: '1.5rem' }}>Zynlo Helpdesk</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isExpanded = expandedItems.includes(item.name)
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')

          return (
            <div key={item.name}>
              <button
                onClick={() => {
                  if (item.children) {
                    toggleExpanded(item.name)
                  } else {
                    router.push(item.href)
                  }
                }}
                className={cn(
                  'group flex w-full items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                )}
              >
                <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                <span className="flex-1 text-left">{item.name}</span>
                {item.children && (
                  <span className="ml-auto">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </span>
                )}
              </button>

              {item.children && isExpanded && (
                <div className="mt-1 space-y-1">
                  {item.children.map((child) => {
                    const childIsActive = pathname === child.href
                    const count = getCountForPath(child.href)

                    return (
                      <Link
                        key={child.name}
                        href={child.href}
                        className={cn(
                          'group flex items-center rounded-md py-2 pl-11 pr-3 text-sm transition-colors',
                          childIsActive
                            ? 'bg-gray-800 text-white'
                            : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                        )}
                      >
                        {child.icon ? (
                          <child.icon className="mr-3 h-4 w-4" />
                        ) : (
                          <Hash className="mr-3 h-4 w-4" />
                        )}
                        <span className="flex-1">{child.name}</span>
                        {count > 0 && (
                          <span className="ml-auto rounded-full bg-gray-700 px-2 py-0.5 text-xs text-gray-300">
                            {count}
                          </span>
                        )}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* User menu */}
      <div className="border-t border-gray-800 p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-700 text-sm font-medium text-white">
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-white">
              {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
            </p>
            <p className="text-xs text-gray-400">{user?.email}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="ml-auto rounded p-1 text-gray-400 hover:bg-gray-800 hover:text-white"
            title="Uitloggen"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
} 