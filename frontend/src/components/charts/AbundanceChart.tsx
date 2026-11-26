import {
  Bar,
  BarChart,
  CartesianGrid,
  ErrorBar,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Alert } from '../common/Alert';
import { Card } from '../common/Card';
import { EmptyState } from '../common/EmptyState';
import { ScientificValue } from '../common/ScientificValue';
import { SectionHeader } from '../common/SectionHeader';
import type { Abundance } from '../../types/api';

interface AbundanceChartProps {
  abundances: Abundance[];
  notes?: string[];
}

interface AbundancePlotDatum {
  element: string;
  abundance: number;
  errorRange: [number, number];
  unit: string;
  upper: number | null;
  lower: number | null;
}

export function AbundanceChart({ abundances, notes = [] }: AbundanceChartProps) {
  const validRows = abundances.filter(
    (a): a is Abundance & { abundance: number } => a.abundance !== null,
  );

  if (validRows.length === 0) {
    return (
      <Card className="space-y-3">
        <SectionHeader
          title="Elemental Abundances (wt%)"
          subtitle="Derived weight-percent abundances from source dataset"
        />
        <EmptyState
          title="No Verified Elemental Abundance Records"
          description="No unambiguous abundance records are stored for this observation."
        />
        {notes.map((note, idx) => (
          <Alert key={idx} tone="warning" title="Source Abundance Limitation">
            {note}
          </Alert>
        ))}
      </Card>
    );
  }

  const plotData: AbundancePlotDatum[] = validRows.map((a) => {
    const low = a.uncertainty_lower ?? a.uncertainty ?? 0;
    const high = a.uncertainty_upper ?? a.uncertainty ?? 0;
    return {
      element: a.element,
      abundance: a.abundance,
      errorRange: [low, high],
      unit: a.unit,
      upper: a.uncertainty_upper,
      lower: a.uncertainty_lower,
    };
  });

  return (
    <Card className="space-y-4">
      <SectionHeader
        title="Derived Elemental Abundances (wt%)"
        subtitle="Verified values and asymmetric uncertainties preserved directly from source files (no absent elements fabricated)"
      />

      <div
        className="h-72 w-full"
        role="img"
        aria-label="Bar chart of verified elemental abundances in weight percent with asymmetric error bars"
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={plotData} margin={{ top: 16, right: 20, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#25314d" />
            <XAxis dataKey="element" tick={{ fill: '#f1f5f9', fontSize: 12 }} />
            <YAxis
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              label={{ value: 'wt%', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
            />
            <RechartsTooltip
              contentStyle={{
                backgroundColor: '#0f1626',
                border: '1px solid #25314d',
                borderRadius: '8px',
                color: '#f1f5f9',
                fontSize: '12px',
              }}
              formatter={(
                value: unknown,
                _name: unknown,
                item: { payload?: AbundancePlotDatum },
              ) => {
                const payload = item?.payload;
                if (!payload) return [String(value), 'Abundance'];
                const up = payload.upper ?? 'n/a';
                const lo = payload.lower ?? 'n/a';
                return [`${String(value)} ${payload.unit} (+${up} / -${lo})`, 'Abundance'];
              }}
            />
            <Bar dataKey="abundance" name="Abundance (wt%)" fill="#10b981" radius={[4, 4, 0, 0]}>
              <ErrorBar dataKey="errorRange" width={6} strokeWidth={1.5} stroke="#f1f5f9" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {validRows.map((row) => (
          <div
            key={row.id}
            className="rounded-md border border-lunar-border bg-lunar-panel/60 p-3 text-xs"
          >
            <p className="font-semibold text-lunar-text">{row.element}</p>
            <div className="mt-1">
              <ScientificValue
                value={row.abundance}
                unit={row.unit}
                uncertainty={row.uncertainty}
                uncertaintyUpper={row.uncertainty_upper}
                uncertaintyLower={row.uncertainty_lower}
              />
            </div>
          </div>
        ))}
      </div>

      {notes.map((note, idx) => (
        <Alert key={idx} tone="info">
          {note}
        </Alert>
      ))}
    </Card>
  );
}
