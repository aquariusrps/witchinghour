'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

type Props = {
  isAdmin?: boolean
}

type SidebarLink = { href: string; label: string; badge?: boolean }

const SIDEBAR_LINKS: SidebarLink[] = [
  { href: '/dashboard',      label: 'Home'           },
  { href: '/whispers',       label: 'Whispers',  badge: true },
  { href: '/my-characters',  label: 'My Characters'  },
  { href: '/apothecary',     label: 'The Apothecary' },
  { href: '/bookmarks',      label: 'Bookmarks'      },
  { href: '/profile',        label: 'Edit Profile'   },
  { href: '/settings',       label: 'Settings'       },
]

const ADMIN_LINK: SidebarLink = { href: '/admin', label: 'Admin Panel' }

export default function Sidebar({ isAdmin = false }: Props) {
  const pathname = usePathname()

  const links = isAdmin ? [...SIDEBAR_LINKS, ADMIN_LINK] : SIDEBAR_LINKS

  return (
    <nav
      style={{
        backgroundColor: 'var(--claret)',
        borderRight: '1px solid var(--ember-dim)',
        height: '100%',
        paddingTop: '1.5rem',
        paddingBottom: '1.5rem',
      }}
    >
      <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {links.map(({ href, label, badge }) => {
          const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <li key={href}>
              <Link
                href={href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.5rem 1.25rem 0.5rem 1rem',
                  fontFamily: 'Cinzel, serif',
                  fontSize: '0.65rem',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: isActive ? 'var(--gold)' : 'var(--mist)',
                  textDecoration: 'none',
                  borderLeft: isActive ? '2px solid var(--gold)' : '2px solid transparent',
                  backgroundColor: isActive ? 'var(--raised)' : 'transparent',
                  transition: 'color 0.15s ease, background-color 0.15s ease',
                }}
              >
                {label}
                {/* Badge slot — empty for now, wired in a future task */}
                {badge && (
                  <span
                    style={{
                      display: 'inline-block',
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      backgroundColor: 'transparent',
                      border: '1px solid var(--ember-dim)',
                      flexShrink: 0,
                    }}
                    aria-hidden="true"
                  />
                )}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
