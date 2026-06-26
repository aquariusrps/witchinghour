import Masthead from '@/app/components/Masthead'
import Sidebar from '@/app/components/Sidebar'

// CSS for the 880px breakpoint — Tailwind's built-in breakpoints (sm/md/lg) don't hit 880px exactly
const GRID_CSS = `
  .pg-grid {
    display: grid;
    grid-template-columns: 1fr;
    flex: 1;
    min-height: 0;
  }
  .pg-sidebar { display: none; }
  @media (min-width: 880px) {
    .pg-grid { grid-template-columns: 220px 1fr; }
    .pg-sidebar { display: block; }
  }
`

type Props = {
  children: React.ReactNode
  displayName?: string | null
  avatarUrl?: string | null
  isAdmin?: boolean
}

export default function PageLayout({ children, displayName, avatarUrl, isAdmin = false }: Props) {
  return (
    <>
      <style>{GRID_CSS}</style>
      <Masthead displayName={displayName} avatarUrl={avatarUrl} />
      <div className="pg-grid">
        <aside className="pg-sidebar">
          <Sidebar isAdmin={isAdmin} />
        </aside>
        <main style={{ minWidth: 0 }}>
          {children}
        </main>
      </div>
    </>
  )
}
