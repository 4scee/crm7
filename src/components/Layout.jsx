import Sidebar from './Sidebar';
import SearchBar from './SearchBar';

export default function Layout({ title, subtitle, actions, children }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between gap-6 px-8 py-5 border-b border-ink-950/10 bg-white">
          <div>
            <h1 className="font-display text-2xl font-semibold text-ink-950">{title}</h1>
            {subtitle && <p className="text-sm text-ink-500 mt-0.5">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-3">
            <SearchBar />
            {actions}
          </div>
        </header>
        <main className="flex-1 overflow-auto p-8 bg-parchment-100">{children}</main>
      </div>
    </div>
  );
}
