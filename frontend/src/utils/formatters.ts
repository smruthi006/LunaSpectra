export function formatScientificNumber(value: number | null | undefined, decimals = 3): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return 'Not available (null)';
  }
  if (value === 0) {
    return '0';
  }
  const abs = Math.abs(value);
  if (abs < 0.001 || abs >= 10000) {
    return value.toExponential(2);
  }
  return Number(value.toFixed(decimals)).toString();
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function formatSpectrumTypeLabel(spectrumType: string): string {
  switch (spectrumType) {
    case 'source':
      return 'Lunar Source XRF Spectrum (CLASS)';
    case 'background':
      return 'Background Spectrum (CLASS)';
    case 'solar_xsm':
      return 'Solar X-Ray Spectrum (XSM)';
    case 'solar_model':
      return 'Solar Spectral Model (Chianti)';
    case 'calibration_preflight':
      return 'Pre-flight Calibration (Fe-55)';
    case 'calibration_postflight':
      return 'Post-flight Calibration (Fe-55)';
    default:
      return spectrumType;
  }
}

export interface SafeDifferenceResult {
  comparable: boolean;
  delta: number | null;
  percentDifference: number | null;
  reason?: string;
}

export function computeSafeDifference(
  valueA: number | null | undefined,
  unitA: string | null | undefined,
  valueB: number | null | undefined,
  unitB: string | null | undefined,
): SafeDifferenceResult {
  if (valueA === null || valueA === undefined || valueB === null || valueB === undefined) {
    return {
      comparable: false,
      delta: null,
      percentDifference: null,
      reason: 'Missing (null) value in one or both observations',
    };
  }
  if (!unitA || !unitB || unitA !== unitB) {
    return {
      comparable: false,
      delta: null,
      percentDifference: null,
      reason: 'Units missing or incompatible',
    };
  }
  const delta = valueB - valueA;
  const percentDifference = valueA !== 0 ? (delta / valueA) * 100 : null;
  return {
    comparable: true,
    delta,
    percentDifference,
  };
}
