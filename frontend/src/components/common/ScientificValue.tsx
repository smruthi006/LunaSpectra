import { formatScientificNumber } from '../../utils/formatters';

interface ScientificValueProps {
  value: number | null | undefined;
  unit?: string | null;
  uncertainty?: number | null;
  uncertaintyUpper?: number | null;
  uncertaintyLower?: number | null;
  decimals?: number;
}

export function ScientificValue({
  value,
  unit,
  uncertainty,
  uncertaintyUpper,
  uncertaintyLower,
  decimals = 3,
}: ScientificValueProps) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return <span className="font-mono text-xs italic text-lunar-subtle">Not available (null)</span>;
  }

  const formattedVal = formatScientificNumber(value, decimals);
  const hasAsymmetric =
    uncertaintyUpper !== null &&
    uncertaintyUpper !== undefined &&
    uncertaintyLower !== null &&
    uncertaintyLower !== undefined &&
    uncertaintyUpper !== uncertaintyLower;

  return (
    <span className="inline-flex flex-wrap items-baseline gap-1 font-mono text-xs text-lunar-text">
      <span className="font-medium">{formattedVal}</span>
      {hasAsymmetric ? (
        <span className="text-lunar-muted">
          (+{formatScientificNumber(uncertaintyUpper, decimals)} / -
          {formatScientificNumber(uncertaintyLower, decimals)})
        </span>
      ) : uncertainty !== null && uncertainty !== undefined ? (
        <span className="text-lunar-muted">
          &plusmn; {formatScientificNumber(uncertainty, decimals)}
        </span>
      ) : uncertaintyUpper !== null &&
        uncertaintyUpper !== undefined &&
        uncertaintyLower !== null &&
        uncertaintyLower !== undefined ? (
        <span className="text-lunar-muted">
          &plusmn; {formatScientificNumber(uncertaintyUpper, decimals)}
        </span>
      ) : null}
      {unit ? <span className="text-lunar-cyan">{unit}</span> : null}
    </span>
  );
}
