export interface TabItem {
  id: string;
  label: string;
  count?: number;
}

interface TabsProps {
  items: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
  ariaLabel: string;
}

export function Tabs({ items, activeId, onChange, ariaLabel }: TabsProps) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className="flex flex-wrap gap-2 border-b border-lunar-border pb-2"
    >
      {items.map((item) => {
        const selected = item.id === activeId;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(item.id)}
            className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              selected
                ? 'bg-lunar-accent text-white'
                : 'bg-lunar-panel text-lunar-muted hover:bg-lunar-panelHover hover:text-lunar-text'
            }`}
          >
            <span>{item.label}</span>
            {item.count !== undefined ? (
              <span className="rounded-full bg-black/25 px-1.5 py-0.5 font-mono text-[11px]">
                {item.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
