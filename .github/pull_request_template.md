## Summary

<!-- Briefly describe what this pull request changes and why. -->

Related issue: `#<issue-number>`

## Type of Change

- [ ] Feature (`feat`)
- [ ] Bug fix (`fix`)
- [ ] Documentation (`docs`)
- [ ] Tests (`test`)
- [ ] Refactor / chore (`refactor` / `chore`)

## Scientific and Data Integrity Checklist

- [ ] No raw Chandrayaan-2 mission files (`data/raw/`), large processed datasets, or model binaries are committed.
- [ ] Synthetic data (if touched) remains visibly and technically separated (`data_origin = "synthetic"`) from mission observations.
- [ ] No unsupported scientific claims, invented metrics, or mineral-discovery assertions were introduced.
- [ ] Coordinates, units, null semantics (`null` = unmeasured/unavailable, not `0`), and uncertainties are preserved accurately.

## Engineering Checklist

- [ ] Branch targets `develop` (or `main` only for an approved milestone release).
- [ ] Commit messages follow Conventional Commits (`type(scope): description`).
- [ ] Relevant documentation under `docs/` or `README.md` has been updated.
- [ ] No `.env` files, API keys, tokens, or credentials are included.
- [ ] Planned checks/tests were run locally (note `N/A — documentation phase` if no executable code exists yet).
