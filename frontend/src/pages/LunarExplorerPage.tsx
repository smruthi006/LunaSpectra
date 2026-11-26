import { ArrowRight, Compass, MapPinOff } from 'lucide-react';
import { useMapAvailabilityQuery } from '../api/queries';
import { Alert } from '../components/common/Alert';
import { Badge } from '../components/common/Badge';
import { Card } from '../components/common/Card';
import { ErrorState } from '../components/common/ErrorState';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { PageHeader } from '../components/common/PageHeader';
import { SectionHeader } from '../components/common/SectionHeader';

const WORKFLOW_STEPS = [
  {
    step: '1. PRADAN PDS4 Acquisition',
    status: 'Planned (Phase 2+)',
    detail: 'Obtain geolocated Chandrayaan-2 CLASS PDS4 bundles with XML geometry labels.',
  },
  {
    step: '2. Coordinate & Footprint Validation',
    status: 'Planned (Phase 2+)',
    detail:
      'Verify planetocentric latitude [-90, 90], normalize longitude [-180, 180], validate polygons.',
  },
  {
    step: '3. GeoJSON /api/v1/map/observations',
    status: 'Planned (Phase 3+)',
    detail: 'Serve verified FeatureCollection payloads only when coordinate_record_count > 0.',
  },
  {
    step: '4. Leaflet 2D Lunar Map',
    status: 'Boundary Ready',
    detail: 'Render discrete measured footprints and points over LROC/USGS basemap tiles.',
  },
] as const;

export function LunarExplorerPage() {
  const mapAvail = useMapAvailabilityQuery();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lunar Explorer"
        description="Geospatial 2D lunar map boundary driven strictly by /api/v1/map/availability."
        badge={
          mapAvail.data ? (
            <Badge tone={mapAvail.data.available ? 'emerald' : 'amber'}>
              {mapAvail.data.available ? 'Coordinates Verified' : 'Map Unavailable'}
            </Badge>
          ) : null
        }
      />

      {mapAvail.isLoading ? (
        <LoadingSkeleton rows={4} label="Checking verified coordinate availability" />
      ) : mapAvail.error ? (
        <ErrorState error={mapAvail.error} onRetry={() => void mapAvail.refetch()} />
      ) : mapAvail.data && !mapAvail.data.available ? (
        <div className="space-y-6">
          <Card className="border-lunar-amber/40 bg-lunar-surface p-6 space-y-4">
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-lunar-amber/45 bg-lunar-amber/15 text-lunar-amber">
                <MapPinOff className="h-6 w-6" aria-hidden="true" />
              </div>
              <div className="space-y-1.5">
                <h2 className="text-lg font-semibold text-lunar-text">
                  Interactive Lunar Map Unavailable for Active Dataset
                </h2>
                <p className="text-sm text-lunar-muted">{mapAvail.data.reason}</p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 text-xs">
              <div className="rounded-md border border-lunar-border bg-lunar-panel/60 p-3">
                <p className="text-lunar-muted">available</p>
                <p className="mt-1 font-mono text-base font-semibold text-lunar-amber">false</p>
              </div>
              <div className="rounded-md border border-lunar-border bg-lunar-panel/60 p-3">
                <p className="text-lunar-muted">coordinate_record_count</p>
                <p className="mt-1 font-mono text-base font-semibold text-lunar-text">
                  {mapAvail.data.coordinate_record_count}
                </p>
              </div>
              <div className="rounded-md border border-lunar-border bg-lunar-panel/60 p-3">
                <p className="text-lunar-muted">footprint_record_count</p>
                <p className="mt-1 font-mono text-base font-semibold text-lunar-text">
                  {mapAvail.data.footprint_record_count}
                </p>
              </div>
            </div>

            <Alert tone="info" title="Why No Markers Are Rendered">
              The active Mendeley Data v1 dataset (<code>DOI: 10.17632/6mmd96j5bg.1</code>) contains
              spectral, line-flux, and abundance tables without latitude, longitude, or footprint
              polygon corners. LunaSpectra refuses to fabricate coordinates or plot synthetic
              markers. Official geolocated ISSDC/PRADAN PDS4 products will enable this view in a
              subsequent phase.
            </Alert>
          </Card>

          <Card className="space-y-4">
            <SectionHeader
              title="Planned Geolocated Mapping Workflow"
              subtitle="Architectural pipeline required before activating Leaflet footprint rendering (schematic diagram — not lunar measurements)"
            />
            <div className="grid gap-3 md:grid-cols-4">
              {WORKFLOW_STEPS.map((item, idx) => (
                <div
                  key={item.step}
                  className="relative flex flex-col justify-between rounded-lg border border-lunar-border bg-lunar-panel/50 p-4 text-xs"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <Badge tone={idx === 3 ? 'cyan' : 'neutral'}>{item.status}</Badge>
                      {idx < WORKFLOW_STEPS.length - 1 ? (
                        <ArrowRight
                          className="hidden h-4 w-4 text-lunar-subtle md:block"
                          aria-hidden="true"
                        />
                      ) : null}
                    </div>
                    <p className="font-semibold text-lunar-text">{item.step}</p>
                    <p className="leading-relaxed text-lunar-muted">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      ) : (
        <Card className="space-y-3">
          <div className="flex items-center gap-2 text-lunar-emerald">
            <Compass className="h-5 w-5" aria-hidden="true" />
            <h2 className="text-base font-semibold">Geospatial Coordinates Detected</h2>
          </div>
          <p className="text-sm text-lunar-muted">
            Verified coordinate records: {mapAvail.data?.coordinate_record_count}. Leaflet map
            container boundary is ready to mount once GeoJSON endpoints are enabled.
          </p>
        </Card>
      )}
    </div>
  );
}
