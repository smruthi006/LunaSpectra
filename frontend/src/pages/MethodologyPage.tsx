import { BookOpen, CheckCircle2, Clock, ShieldCheck } from 'lucide-react';
import { Alert } from '../components/common/Alert';
import { Badge } from '../components/common/Badge';
import { Card } from '../components/common/Card';
import { PageHeader } from '../components/common/PageHeader';
import { SectionHeader } from '../components/common/SectionHeader';

const REPO_BASE = 'https://github.com/smruthi006/LunaSpectra/blob/develop';

export function MethodologyPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Analysis & Methodology"
        description="Transparent engineering and scientific methodology implemented in Phase 1, along with explicit explanations of deferred ML and mapping components."
        badge={<Badge tone="cyan">Reproducible Pipeline</Badge>}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-3">
          <SectionHeader
            title="1. Acquisition, Checksums & Format Inventory"
            subtitle="Implemented in backend/scripts/acquire_class_data.py & inspect_class_data.py"
          />
          <ul className="space-y-2 text-xs leading-relaxed text-lunar-muted">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-lunar-emerald" />
              <span>
                <strong className="text-lunar-text">Public API Acquisition:</strong> Files are
                retrieved from Mendeley Data public API for <code>DOI: 10.17632/6mmd96j5bg.1</code>{' '}
                into git-ignored <code>data/raw/class_mendeley_v1/</code> without modifying raw
                files.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-lunar-emerald" />
              <span>
                <strong className="text-lunar-text">SHA-256 Verification:</strong> Every downloaded
                archive and extracted file is hashed with SHA-256 and recorded in{' '}
                <code>file_inventory.json</code> and <code>source_products</code>.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-lunar-emerald" />
              <span>
                <strong className="text-lunar-text">Format Inventory:</strong> Recursively inspects
                FITS, PHA FITS, OGIP ASCII tables, XSPEC flux tables, abundance snippets, and
                READMEs (23 files verified).
              </span>
            </li>
          </ul>
        </Card>

        <Card className="space-y-3">
          <SectionHeader
            title="2. FITS/PHA Parsing & Source/Background Separation"
            subtitle="Implemented in backend/app/adapters/class_mendeley.py"
          />
          <ul className="space-y-2 text-xs leading-relaxed text-lunar-muted">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-lunar-emerald" />
              <span>
                <strong className="text-lunar-text">Astropy Binary Parsing:</strong> Reads OGIP{' '}
                <code>SPECTRUM</code> BINTABLE HDUs from CLASS <code>.fits</code> and XSM{' '}
                <code>.pha</code> files, preserving <code>CHANNEL</code>, <code>COUNTS</code>,{' '}
                <code>STAT_ERR</code>, <code>EXPOSURE</code>, and time keywords.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-lunar-emerald" />
              <span>
                <strong className="text-lunar-text">Explicit Spectrum Types:</strong> Separately
                tags <code>source</code>, <code>background</code>, <code>solar_xsm</code>,{' '}
                <code>solar_model</code>, <code>calibration_preflight</code>, and{' '}
                <code>calibration_postflight</code> without double-counting ASCII duplicates.
              </span>
            </li>
          </ul>
        </Card>

        <Card className="space-y-3">
          <SectionHeader
            title="3. Line-Flux & Abundance Extraction"
            subtitle="Preserving units, asymmetric uncertainties, and ambiguity guards"
          />
          <ul className="space-y-2 text-xs leading-relaxed text-lunar-muted">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-lunar-emerald" />
              <span>
                <strong className="text-lunar-text">Line Fluxes:</strong> Unpivots{' '}
                <code>flux_18nov_spec2.txt</code> (5 records) and <code>flux_29may.txt</code> (21
                records across 3 rows), preserving <code>photons/cm2/s</code>, symmetric{' '}
                <code>uncertainty</code>, and <code>Ca-Ka</code> / <code>Ca-Kb</code> line labels.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-lunar-emerald" />
              <span>
                <strong className="text-lunar-text">Abundances &amp; Withheld Ambiguity:</strong>{' '}
                Extracts 4 verified <code>wt%</code> abundances (<code>Mg, Al, Si, Ca</code>) from{' '}
                <code>290520/R1_abundance.txt</code> with asymmetric upper/lower uncertainties.{' '}
                <code>181120/R2_abundance.txt</code> is flagged and withheld because 5 header
                elements conflict with 4 array values.
              </span>
            </li>
          </ul>
        </Card>

        <Card className="space-y-3">
          <SectionHeader
            title="4. Null Semantics, Units & Provenance"
            subtitle="Strict scientific integrity invariants"
          />
          <ul className="space-y-2 text-xs leading-relaxed text-lunar-muted">
            <li className="flex items-start gap-2">
              <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-lunar-cyan" />
              <span>
                <strong className="text-lunar-text">Null Distinct from Zero:</strong> Absent
                coordinates, footprints, and FITS <code>STARTIME=0</code> sentinels remain{' '}
                <code>null</code> in Parquet, SQLite, and JSON responses.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-lunar-cyan" />
              <span>
                <strong className="text-lunar-text">Unit Preservation:</strong> Incompatible units (
                <code>count</code>, <code>photons/cm2/s</code>, <code>photons/s</code>,{' '}
                <code>wt%</code>) are never overlaid on a single chart axis or subtracted across
                observations.
              </span>
            </li>
          </ul>
        </Card>
      </div>

      <Card className="space-y-4">
        <SectionHeader
          title="Why Machine Learning & Lunar Mapping Are Deferred"
          subtitle="Scientific justification for Phase 1–2 scope boundaries"
        />
        <div className="grid gap-4 md:grid-cols-2 text-xs">
          <Alert tone="warning" title="Why Unsupervised ML Is Deferred">
            <span className="inline-flex items-start gap-2">
              <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>
                Running K-Means, DBSCAN, or Isolation Forest on 2 observations (only 1 with verified
                abundances) would produce statistically meaningless clusters. Planned ML baselines
                require a larger verified geolocated dataset.
              </span>
            </span>
          </Alert>
          <Alert tone="warning" title="Why 2D Lunar Mapping Is Unavailable">
            <span>
              The active Mendeley v1 dataset contains no latitude, longitude, or footprint geometry
              fields. Plotting synthetic coordinates would misrepresent orbital measurements.
            </span>
          </Alert>
        </div>
      </Card>

      <Card className="space-y-3">
        <SectionHeader
          title="Repository Technical Documentation"
          subtitle="Reference documents maintained in the LunaSpectra repository"
        />
        <div className="flex flex-wrap gap-3 text-xs">
          {[
            ['REAL_DATA_INVENTORY.md', `${REPO_BASE}/docs/REAL_DATA_INVENTORY.md`],
            ['REAL_DATA_FIELD_MAPPING.md', `${REPO_BASE}/docs/REAL_DATA_FIELD_MAPPING.md`],
            ['DATA_PIPELINE.md', `${REPO_BASE}/docs/DATA_PIPELINE.md`],
            ['ML_METHODOLOGY.md', `${REPO_BASE}/docs/ML_METHODOLOGY.md`],
            ['ETHICS_AND_LIMITATIONS.md', `${REPO_BASE}/docs/ETHICS_AND_LIMITATIONS.md`],
          ].map(([label, href]) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md border border-lunar-border bg-lunar-panel px-3 py-1.5 font-mono text-lunar-cyan hover:bg-lunar-panelHover"
            >
              <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
              {label}
            </a>
          ))}
        </div>
      </Card>
    </div>
  );
}
