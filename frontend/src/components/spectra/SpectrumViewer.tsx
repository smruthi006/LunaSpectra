import { useEffect, useMemo, useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Alert } from '../common/Alert';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { EmptyState } from '../common/EmptyState';
import { SectionHeader } from '../common/SectionHeader';
import { Tabs } from '../common/Tabs';
import { formatSpectrumTypeLabel } from '../../utils/formatters';
import type { SourceProduct, Spectrum } from '../../types/api';

interface SpectrumViewerProps {
  spectra: Spectrum[];
  sourceProducts: SourceProduct[];
  exposure: number | null;
}

interface SpectrumPoint {
  x: number;
  y: number;
  err: number | null;
}

export function SpectrumViewer({ spectra, sourceProducts, exposure }: SpectrumViewerProps) {
  const [selectedId, setSelectedId] = useState<string>(spectra[0]?.id ?? '');
  const [downsampleMax, setDownsampleMax] = useState<number>(512);
  const [xMinInput, setXMinInput] = useState<string>('');
  const [xMaxInput, setXMaxInput] = useState<string>('');

  useEffect(() => {
    if (spectra.length > 0 && !spectra.some((s) => s.id === selectedId)) {
      setSelectedId(spectra[0]?.id ?? '');
    }
  }, [spectra, selectedId]);

  const activeSpectrum = spectra.find((s) => s.id === selectedId) ?? spectra[0];

  const sourceProduct = useMemo(
    () => sourceProducts.find((sp) => sp.id === activeSpectrum?.source_product_id),
    [sourceProducts, activeSpectrum],
  );

  const tabItems = spectra.map((s) => ({
    id: s.id,
    label: formatSpectrumTypeLabel(s.spectrum_type),
    count: s.point_count,
  }));

  const chartData = useMemo<SpectrumPoint[]>(() => {
    if (!activeSpectrum) return [];
    const xs = activeSpectrum.energy_or_channel;
    const ys = activeSpectrum.measured_value;
    const errs = activeSpectrum.uncertainty;
    const minVal = xMinInput.trim() === '' ? -Infinity : Number(xMinInput);
    const maxVal = xMaxInput.trim() === '' ? Infinity : Number(xMaxInput);

    const filtered: SpectrumPoint[] = [];
    for (let i = 0; i < xs.length; i++) {
      const x = xs[i];
      const y = ys[i];
      if (x === undefined || y === undefined) continue;
      if (x >= minVal && x <= maxVal) {
        filtered.push({
          x,
          y,
          err: errs?.[i] ?? null,
        });
      }
    }

    if (downsampleMax > 0 && filtered.length > downsampleMax) {
      const step = (filtered.length - 1) / (downsampleMax - 1);
      const sampled: SpectrumPoint[] = [];
      for (let i = 0; i < downsampleMax; i++) {
        const idx = Math.round(i * step);
        const pt = filtered[idx];
        if (pt) sampled.push(pt);
      }
      return sampled;
    }
    return filtered;
  }, [activeSpectrum, downsampleMax, xMinInput, xMaxInput]);

  if (spectra.length === 0 || !activeSpectrum) {
    return (
      <Card>
        <SectionHeader title="Spectral Measurements" />
        <EmptyState
          title="No Spectral Arrays Available"
          description="No spectrum records were returned for this observation."
        />
      </Card>
    );
  }

  const xLabel = activeSpectrum.energy_unit
    ? `Axis (${activeSpectrum.energy_unit})`
    : 'Energy (unit unspecified in source header)';
  const yLabel = activeSpectrum.value_unit;
  const isUnverifiedEnergy = activeSpectrum.energy_unit === null;
  const isChannelAxis = activeSpectrum.energy_unit === 'channel';

  return (
    <Card className="space-y-4">
      <SectionHeader
        title="Spectral Data Explorer"
        subtitle="Each spectrum renders on its own native axis and unit without mixing incompatible units"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="cyan">{activeSpectrum.point_count} source points</Badge>
            <Badge tone="neutral">Unit: {activeSpectrum.value_unit}</Badge>
          </div>
        }
      />

      <Tabs
        items={tabItems}
        activeId={activeSpectrum.id}
        onChange={(id) => {
          setSelectedId(id);
          setXMinInput('');
          setXMaxInput('');
        }}
        ariaLabel="Spectrum type selector"
      />

      {isChannelAxis ? (
        <Alert tone="info">
          This spectrum is indexed by detector <strong>CHANNEL</strong> (0-based). Dataset READMEs
          note an approximate CLASS linear relation of <code>0.0135 keV × CHANNEL</code>, shown here
          strictly in native source channel units unless calibrated energy arrays exist.
        </Alert>
      ) : null}

      {isUnverifiedEnergy ? (
        <Alert tone="warning">
          The source README for this Chianti model spectrum specifies ENERGY vs PHOTONS/S without an
          explicit energy unit string in the file header. Values are displayed verbatim.
        </Alert>
      ) : null}

      <div className="flex flex-wrap items-end justify-between gap-3 rounded-md border border-lunar-border bg-lunar-panel/50 p-3 text-xs">
        <div className="space-y-1">
          <p className="text-lunar-muted">
            Source file:{' '}
            <span className="font-mono text-lunar-text">
              {sourceProduct?.original_filename ?? activeSpectrum.source_product_id}
            </span>
          </p>
          <p className="text-lunar-muted">
            Observation exposure:{' '}
            <span className="font-mono text-lunar-text">
              {exposure !== null ? `${exposure} s` : 'Not available (null)'}
            </span>{' '}
            &middot; Rendering <span className="font-mono text-lunar-cyan">{chartData.length}</span>{' '}
            of <span className="font-mono">{activeSpectrum.point_count}</span> points
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-2">
          <label className="flex flex-col gap-1 text-[11px] text-lunar-muted">
            <span>X min</span>
            <input
              type="number"
              value={xMinInput}
              onChange={(e) => setXMinInput(e.target.value)}
              placeholder="Auto"
              className="w-24 rounded border border-lunar-border bg-lunar-bg px-2 py-1 font-mono text-xs text-lunar-text"
            />
          </label>
          <label className="flex flex-col gap-1 text-[11px] text-lunar-muted">
            <span>X max</span>
            <input
              type="number"
              value={xMaxInput}
              onChange={(e) => setXMaxInput(e.target.value)}
              placeholder="Auto"
              className="w-24 rounded border border-lunar-border bg-lunar-bg px-2 py-1 font-mono text-xs text-lunar-text"
            />
          </label>
          <label className="flex flex-col gap-1 text-[11px] text-lunar-muted">
            <span>Render sample</span>
            <select
              value={downsampleMax}
              onChange={(e) => setDownsampleMax(Number(e.target.value))}
              className="rounded border border-lunar-border bg-lunar-bg px-2 py-1 text-xs text-lunar-text"
            >
              <option value={256}>256 pts</option>
              <option value={512}>512 pts</option>
              <option value={1024}>1024 pts</option>
              <option value={0}>All points</option>
            </select>
          </label>
          {(xMinInput !== '' || xMaxInput !== '') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setXMinInput('');
                setXMaxInput('');
              }}
            >
              Reset zoom
            </Button>
          )}
        </div>
      </div>

      <div
        className="h-80 w-full"
        role="img"
        aria-label={`${formatSpectrumTypeLabel(activeSpectrum.spectrum_type)} chart`}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 12, right: 20, left: 10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#25314d" />
            <XAxis
              dataKey="x"
              type="number"
              domain={['dataMin', 'dataMax']}
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              label={{ value: xLabel, position: 'insideBottom', offset: -10, fill: '#94a3b8' }}
            />
            <YAxis
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              label={{ value: yLabel, angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
            />
            <RechartsTooltip
              contentStyle={{
                backgroundColor: '#0f1626',
                border: '1px solid #25314d',
                borderRadius: '8px',
                color: '#f1f5f9',
                fontSize: '12px',
              }}
              formatter={(value: unknown) => [`${String(value)} ${yLabel}`, 'Measured value']}
              labelFormatter={(label: unknown) => `${xLabel}: ${String(label)}`}
            />
            <Line
              type="monotone"
              dataKey="y"
              stroke="#22d3ee"
              strokeWidth={1.75}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
