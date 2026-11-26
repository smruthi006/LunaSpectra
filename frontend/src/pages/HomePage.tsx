import { Link } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  BookOpen,
  Compass,
  Database,
  Layers,
  Sun,
  Telescope,
} from 'lucide-react';
import { useDatasetSummaryQuery, useHealthQuery } from '../api/queries';
import { Alert } from '../components/common/Alert';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { PageHeader } from '../components/common/PageHeader';
import { SectionHeader } from '../components/common/SectionHeader';

export function HomePage() {
  const health = useHealthQuery();
  const summary = useDatasetSummaryQuery();

  const doi = summary.data?.doi ?? health.data?.dataset_doi ?? '10.17632/6mmd96j5bg.1';
  const obsCount = summary.data?.observation_count ?? health.data?.observation_count;
  const specCount = summary.data?.spectrum_count ?? health.data?.spectrum_count;

  return (
    <div className="space-y-6">
      <PageHeader
        title="LunaSpectra"
        description="Explore the Moon through data — Intelligent analysis and transparent visualization of genuine Chandrayaan-2 CLASS lunar X-ray fluorescence observations."
        badge={
          <div className="flex flex-wrap gap-2">
            <Badge tone="emerald">Genuine Mission Data (data_origin: mission)</Badge>
            <Badge tone="cyan">DOI: {doi}</Badge>
          </div>
        }
        actions={
          <>
            <Link to="/dashboard">
              <Button variant="primary">
                <Activity className="h-4 w-4" aria-hidden="true" />
                Open Dashboard
              </Button>
            </Link>
            <Link to="/observations">
              <Button variant="secondary">
                <Telescope className="h-4 w-4" aria-hidden="true" />
                Browse Observations
              </Button>
            </Link>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="space-y-3 lg:col-span-2">
          <SectionHeader
            title="Current Observation Scope"
            subtitle="Verified real dataset ingested via the Phase 1 FastAPI & SQLite backend"
          />
          <p className="text-sm leading-relaxed text-lunar-muted">
            LunaSpectra currently serves the public{' '}
            <strong className="text-lunar-text">CLASS_CHANDRAYAAN2</strong> (Version 1, CC BY 4.0)
            dataset contributed by Shyama Narendranath (ISRO), covering{' '}
            <strong className="text-lunar-text">two lunar observation dates</strong>:{' '}
            <span className="font-mono text-lunar-cyan">2019-11-18</span> and{' '}
            <span className="font-mono text-lunar-cyan">2020-05-29</span>.
          </p>
          <div className="grid gap-3 pt-1 sm:grid-cols-3">
            <div className="rounded-md border border-lunar-border bg-lunar-panel/60 p-3">
              <p className="text-[11px] uppercase tracking-wider text-lunar-muted">Observations</p>
              <p className="mt-1 font-mono text-xl font-semibold text-lunar-text">
                {obsCount ?? '2 (verified)'}
              </p>
            </div>
            <div className="rounded-md border border-lunar-border bg-lunar-panel/60 p-3">
              <p className="text-[11px] uppercase tracking-wider text-lunar-muted">
                Linked Spectra
              </p>
              <p className="mt-1 font-mono text-xl font-semibold text-lunar-text">
                {specCount ?? '8 (verified)'}
              </p>
            </div>
            <div className="rounded-md border border-lunar-border bg-lunar-panel/60 p-3">
              <p className="text-[11px] uppercase tracking-wider text-lunar-muted">
                Lunar Coverage
              </p>
              <p className="mt-1 text-sm font-semibold text-lunar-amber">
                2 discrete dates (no coordinates)
              </p>
            </div>
          </div>
          <Alert tone="warning" title="Scientific Scope & Limitations">
            This release does not claim global lunar coverage, does not discover new minerals, and
            does not plot observations on a lunar map because latitude, longitude, and footprint
            geometry are absent in DOI <code>10.17632/6mmd96j5bg.1</code>.
          </Alert>
        </Card>

        <Card className="space-y-3">
          <SectionHeader
            title="Quick Navigation"
            subtitle="Explore available and planned modules"
          />
          <ul className="space-y-2 text-sm">
            <li>
              <Link
                to="/dashboard"
                className="flex items-center justify-between rounded-md border border-lunar-border bg-lunar-panel/50 px-3 py-2 text-lunar-text hover:bg-lunar-panel"
              >
                <span className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-lunar-cyan" aria-hidden="true" />
                  Dataset Dashboard
                </span>
                <ArrowRight className="h-4 w-4 text-lunar-muted" aria-hidden="true" />
              </Link>
            </li>
            <li>
              <Link
                to="/observations"
                className="flex items-center justify-between rounded-md border border-lunar-border bg-lunar-panel/50 px-3 py-2 text-lunar-text hover:bg-lunar-panel"
              >
                <span className="flex items-center gap-2">
                  <Telescope className="h-4 w-4 text-lunar-cyan" aria-hidden="true" />
                  Observation Catalog &amp; Spectra
                </span>
                <ArrowRight className="h-4 w-4 text-lunar-muted" aria-hidden="true" />
              </Link>
            </li>
            <li>
              <Link
                to="/compare"
                className="flex items-center justify-between rounded-md border border-lunar-border bg-lunar-panel/50 px-3 py-2 text-lunar-text hover:bg-lunar-panel"
              >
                <span className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-lunar-cyan" aria-hidden="true" />
                  Compare Observations
                </span>
                <ArrowRight className="h-4 w-4 text-lunar-muted" aria-hidden="true" />
              </Link>
            </li>
            <li>
              <Link
                to="/methodology"
                className="flex items-center justify-between rounded-md border border-lunar-border bg-lunar-panel/50 px-3 py-2 text-lunar-text hover:bg-lunar-panel"
              >
                <span className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-lunar-cyan" aria-hidden="true" />
                  Methodology &amp; Constraints
                </span>
                <ArrowRight className="h-4 w-4 text-lunar-muted" aria-hidden="true" />
              </Link>
            </li>
            <li>
              <Link
                to="/explorer"
                className="flex items-center justify-between rounded-md border border-lunar-border bg-lunar-panel/50 px-3 py-2 text-lunar-muted hover:bg-lunar-panel hover:text-lunar-text"
              >
                <span className="flex items-center gap-2">
                  <Compass className="h-4 w-4 text-lunar-amber" aria-hidden="true" />
                  Lunar Explorer (Awaiting PRADAN Coords)
                </span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </li>
          </ul>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="space-y-3">
          <div className="flex items-center gap-2">
            <Telescope className="h-4 w-4 text-lunar-cyan" aria-hidden="true" />
            <h2 className="text-base font-semibold text-lunar-text">
              CLASS — Chandrayaan-2 Large Area Soft X-ray Spectrometer
            </h2>
          </div>
          <p className="text-sm leading-relaxed text-lunar-muted">
            CLASS records characteristic fluorescent X-rays emitted by major rock-forming elements
            (such as O, Na, Mg, Al, Si, Ca, and Fe) on the lunar surface when excited by incoming
            solar X-rays. In this dataset, CLASS provides 1024-channel FITS/ASCII source and
            background spectra, modelled X-ray line fluxes, and derived weight-percent abundances.
          </p>
        </Card>

        <Card className="space-y-3">
          <div className="flex items-center gap-2">
            <Sun className="h-4 w-4 text-lunar-amber" aria-hidden="true" />
            <h2 className="text-base font-semibold text-lunar-text">XSM — Solar X-ray Monitor</h2>
          </div>
          <p className="text-sm leading-relaxed text-lunar-muted">
            XSM measures the incident solar X-ray spectrum needed to interpret lunar fluorescence
            quantitatively. The active dataset includes genuine XSM solar spectral data (
            <span className="font-mono text-lunar-text">
              CH2_XSM_20191118_90853504_90853624.pha
            </span>
            ) and a Chianti isothermal solar model linked to the 18 November 2019 observation.
          </p>
        </Card>
      </div>

      <Card className="space-y-3">
        <SectionHeader
          title="Feature Availability Matrix"
          subtitle="Clear distinction between live Phase 1–2 capabilities and future PRADAN / ML phases"
        />
        <div className="grid gap-4 md:grid-cols-3 text-xs">
          <div className="rounded-md border border-lunar-emerald/35 bg-lunar-emerald/5 p-4 space-y-1.5">
            <Badge tone="emerald">Available Now</Badge>
            <p className="font-semibold text-lunar-text pt-1">Real-Data Inspection &amp; Spectra</p>
            <p className="text-lunar-muted">
              Live FastAPI metrics, paginated observation catalog, source/background/XSM spectrum
              charts, modelled line fluxes, and verified abundances with asymmetric uncertainties.
            </p>
          </div>
          <div className="rounded-md border border-lunar-amber/35 bg-lunar-amber/5 p-4 space-y-1.5">
            <Badge tone="amber">Waiting for PRADAN Products</Badge>
            <p className="font-semibold text-lunar-text pt-1">Interactive 2D Lunar Map</p>
            <p className="text-lunar-muted">
              Geospatial footprint and coordinate plotting will unlock once geolocated PDS4 bundles
              from ISSDC/PRADAN are verified and ingested.
            </p>
          </div>
          <div className="rounded-md border border-lunar-border bg-lunar-panel/50 p-4 space-y-1.5">
            <Badge tone="neutral">Waiting for Larger Dataset</Badge>
            <p className="font-semibold text-lunar-text pt-1">
              Unsupervised Clustering &amp; Anomaly Detection
            </p>
            <p className="text-lunar-muted">
              K-Means, DBSCAN, and Isolation Forest are intentionally deferred because 2
              observations cannot support statistically meaningful clustering.
            </p>
          </div>
        </div>
        <div className="pt-1">
          <Link
            to="/sources"
            className="inline-flex items-center gap-1.5 text-xs text-lunar-cyan hover:underline"
          >
            <Database className="h-3.5 w-3.5" aria-hidden="true" />
            View full dataset attribution, license, and PRADAN roadmap
          </Link>
        </div>
      </Card>
    </div>
  );
}
