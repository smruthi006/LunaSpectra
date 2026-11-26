import { useState, type ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Activity,
  BookOpen,
  Compass,
  Database,
  ExternalLink,
  GitCompare,
  Home,
  Menu,
  Moon,
  Telescope,
  X,
} from 'lucide-react';
import { getBackendDocsUrl } from '../../api/endpoints';
import { Alert } from '../common/Alert';
import { BackendStatusIndicator } from '../status/BackendStatusIndicator';

interface AppShellProps {
  children: ReactNode;
}

const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/dashboard', label: 'Dashboard', icon: Activity, end: false },
  { to: '/observations', label: 'Observations', icon: Telescope, end: false },
  { to: '/compare', label: 'Compare', icon: GitCompare, end: false },
  { to: '/explorer', label: 'Lunar Explorer', icon: Compass, end: false },
  { to: '/methodology', label: 'Methodology', icon: BookOpen, end: false },
  { to: '/sources', label: 'Data Sources', icon: Database, end: false },
] as const;

export function AppShell({ children }: AppShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const apiDocsUrl = getBackendDocsUrl();

  const renderNavLinks = (onNavigate?: () => void) => (
    <nav aria-label="Primary navigation" className="space-y-1">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-lunar-accent text-white'
                  : 'text-lunar-muted hover:bg-lunar-panel hover:text-lunar-text'
              }`
            }
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{item.label}</span>
          </NavLink>
        );
      })}
      <a
        href={apiDocsUrl}
        target="_blank"
        rel="noreferrer"
        onClick={onNavigate}
        className="flex items-center justify-between gap-2 rounded-md px-3 py-2 text-sm font-medium text-lunar-muted transition-colors hover:bg-lunar-panel hover:text-lunar-text"
      >
        <span className="flex items-center gap-3">
          <ExternalLink className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>API Documentation</span>
        </span>
      </a>
    </nav>
  );

  return (
    <div className="min-h-screen bg-lunar-bg text-lunar-text">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-lunar-accent focus:px-3 focus:py-2 focus:text-sm focus:text-white"
      >
        Skip to main content
      </a>

      <div className="flex min-h-screen">
        {/* Desktop persistent sidebar */}
        <aside className="hidden w-64 shrink-0 flex-col border-r border-lunar-border bg-lunar-surface lg:flex">
          <div className="flex items-center gap-3 border-b border-lunar-border px-5 py-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-lunar-accent/40 bg-lunar-accent/15 text-lunar-cyan">
              <Moon className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-tight text-lunar-text">LunaSpectra</p>
              <p className="text-[11px] text-lunar-muted">Chandrayaan-2 CLASS</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-4">{renderNavLinks()}</div>

          <div className="border-t border-lunar-border p-4 text-[11px] leading-relaxed text-lunar-subtle">
            <p className="font-medium text-lunar-muted">Mission Data Scope</p>
            <p className="mt-1">
              Genuine CLASS X-ray observations (18 Nov 2019 &amp; 29 May 2020). No synthetic
              records.
            </p>
          </div>
        </aside>

        {/* Mobile drawer */}
        {mobileMenuOpen ? (
          <div
            className="fixed inset-0 z-40 flex lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
          >
            <div
              className="fixed inset-0 bg-black/70"
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden="true"
            />
            <div className="relative z-10 flex w-72 max-w-[85vw] flex-col border-r border-lunar-border bg-lunar-surface p-4">
              <div className="mb-4 flex items-center justify-between border-b border-lunar-border pb-3">
                <span className="flex items-center gap-2 font-semibold text-lunar-text">
                  <Moon className="h-4 w-4 text-lunar-cyan" aria-hidden="true" />
                  LunaSpectra
                </span>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close navigation menu"
                  className="rounded-md p-1.5 text-lunar-muted hover:bg-lunar-panel hover:text-lunar-text"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
              {renderNavLinks(() => setMobileMenuOpen(false))}
            </div>
          </div>
        ) : null}

        {/* Main column */}
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-lunar-border bg-lunar-surface/95 backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(true)}
                  aria-label="Open navigation menu"
                  aria-expanded={mobileMenuOpen}
                  className="rounded-md border border-lunar-border bg-lunar-panel p-2 text-lunar-text hover:bg-lunar-panelHover lg:hidden"
                >
                  <Menu className="h-4 w-4" aria-hidden="true" />
                </button>
                <span className="text-sm font-medium text-lunar-muted lg:hidden">
                  LunaSpectra Explorer
                </span>
                <span className="hidden text-xs font-medium uppercase tracking-wider text-lunar-subtle lg:inline">
                  Planetary X-Ray Fluorescence Data Portal
                </span>
              </div>
              <BackendStatusIndicator />
            </div>

            <div className="border-t border-lunar-border/70 bg-lunar-bg/70 px-4 py-2 sm:px-6">
              <Alert tone="info" className="border-lunar-border/80 bg-lunar-panel/60 py-2">
                Current release: genuine Chandrayaan-2 CLASS data from two observation dates.
                Geospatial mapping requires additional verified PRADAN products.
              </Alert>
            </div>
          </header>

          <main id="main-content" className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl space-y-6">{children}</div>
          </main>

          <footer className="border-t border-lunar-border bg-lunar-surface px-4 py-5 text-xs text-lunar-muted sm:px-6">
            <div className="mx-auto flex max-w-7xl flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <p>
                We acknowledge the use of data from the Chandrayaan-II, second lunar mission of the
                Indian Space Research Organisation (ISRO), archived at the Indian Space Science Data
                Centre (ISSDC).
              </p>
              <p className="shrink-0 font-mono text-[11px] text-lunar-subtle">
                CLASS_CHANDRAYAAN2 &middot; DOI: 10.17632/6mmd96j5bg.1 (CC BY 4.0) &middot; Code:
                MIT
              </p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
