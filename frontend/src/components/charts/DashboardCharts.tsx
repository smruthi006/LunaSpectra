import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card } from '../common/Card';
import { SectionHeader } from '../common/SectionHeader';
import type { DatasetSummary, ElementSummary, ObservationSummary } from '../../types/api';

interface DashboardChartsProps {
  summary: DatasetSummary;
  elements: ElementSummary[];
  observations: ObservationSummary[];
}

const TOOLTIP_STYLE = {
  backgroundColor: '#0f1626',
  border: '1px solid #25314d',
  borderRadius: '8px',
  color: '#f1f5f9',
  fontSize: '12px',
};

export function DashboardCharts({ summary, elements, observations }: DashboardChartsProps) {
  const measurementTypeData = [
    {
      category: 'Observations',
      count: summary.observation_count,
    },
    {
      category: 'Total Spectra',
      count: summary.spectrum_count,
    },
    {
      category: 'Background Spectra',
      count: summary.background_spectrum_count,
    },
    {
      category: 'Solar / XSM Spectra',
      count: summary.solar_spectrum_count,
    },
    {
      category: 'Calibration Spectra',
      count: summary.calibration_spectrum_count,
    },
    {
      category: 'Line-Flux Records',
      count: summary.line_flux_record_count,
    },
    {
      category: 'Abundance Records',
      count: summary.abundance_record_count,
    },
  ];

  const elementChartData = elements.map((el) => ({
    element: el.element,
    lineFluxRecords: el.line_flux_record_count,
    abundanceRecords: el.abundance_record_count,
  }));

  const observationComparisonData = observations.map((obs) => ({
    observation: obs.observation_id,
    spectra: obs.spectrum_count,
    lineFluxes: obs.line_flux_count,
    abundances: obs.abundance_count,
  }));

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <SectionHeader
          title="Records by Measurement Type"
          subtitle="Direct counts reported by /api/v1/dataset/summary"
        />
        <div
          className="h-72 w-full"
          role="img"
          aria-label="Bar chart of records by measurement type"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={measurementTypeData}
              margin={{ top: 10, right: 16, left: 0, bottom: 32 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#25314d" />
              <XAxis
                dataKey="category"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                interval={0}
                angle={-20}
                textAnchor="end"
              />
              <YAxis allowDecimals={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <RechartsTooltip contentStyle={TOOLTIP_STYLE} />
              <Bar dataKey="count" name="Record count" fill="#22d3ee" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <SectionHeader
          title="Line-Flux & Abundance Records by Element"
          subtitle="Direct counts reported by /api/v1/elements (photons/cm2/s & wt%)"
        />
        <div
          className="h-72 w-full"
          role="img"
          aria-label="Bar chart of line-flux and abundance record counts by element"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={elementChartData} margin={{ top: 10, right: 16, left: 0, bottom: 16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#25314d" />
              <XAxis dataKey="element" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <RechartsTooltip contentStyle={TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar
                dataKey="lineFluxRecords"
                name="Line-flux records"
                fill="#6366f1"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="abundanceRecords"
                name="Abundance records"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="lg:col-span-2">
        <SectionHeader
          title="Observation Content Comparison"
          subtitle="Spectra, modelled line fluxes, and verified abundances available per lunar observation"
        />
        <div
          className="h-72 w-full"
          role="img"
          aria-label="Grouped bar chart comparing available spectra, line fluxes, and abundances per observation"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={observationComparisonData}
              margin={{ top: 10, right: 16, left: 0, bottom: 12 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#25314d" />
              <XAxis dataKey="observation" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <RechartsTooltip contentStyle={TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="spectra" name="Linked spectra" fill="#22d3ee" radius={[4, 4, 0, 0]} />
              <Bar
                dataKey="lineFluxes"
                name="Line-flux records"
                fill="#6366f1"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="abundances"
                name="Verified abundance records"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
