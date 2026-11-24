# Contributing to LunaSpectra

Thank you for contributing to **LunaSpectra** (*LunaSpectra: Intelligent Analysis and Interactive Mapping of Lunar Elemental Composition Using Chandrayaan-2 Data*). This project is developed as a 2-credit, third-year Computer Science and Engineering mini-project by a four-student team.

Please read [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md), [docs/TEAM_WORKFLOW.md](docs/TEAM_WORKFLOW.md), and [docs/TESTING_STRATEGY.md](docs/TESTING_STRATEGY.md) before opening a pull request.

## Core Contribution Principles

1. **Scientific Honesty First:** Do not overstate machine-learning outputs, claim mineral discoveries, fabricate metrics, or blur the boundary between synthetic test data and Chandrayaan-2 mission observations.
2. **Never Commit Mission Archives or Secrets:** Raw Chandrayaan-2 products (`data/raw/`), large intermediate/processed artifacts (`data/interim/`, `data/processed/`), model binaries (`models/`), `.env` files, and credentials must never be committed.
3. **Contract-First Collaboration:** Schema, endpoint, and feature-table changes must be reviewed across frontend, backend, data, and ML owners before parallel implementation begins.
4. **Documentation Parity:** Every code or schema change must include corresponding updates to `docs/` where relevant.

## Branching Model

- `main`: Protected milestone and release branch. Direct pushes are prohibited.
- `develop`: Shared integration branch. Direct pushes are discouraged; merge via reviewed pull requests.
- Initial parallel foundation branches (planned):
  - `feature/data-pipeline`
  - `feature/ml-analysis`
  - `feature/frontend-map`
  - `feature/backend-api`
- Issue-linked branches (preferred after foundation):
  - `feature/<issue-number>-short-topic` (e.g., `feature/42-observation-endpoint`)
  - `fix/<issue-number>-short-topic` (e.g., `fix/57-footprint-longitude`)
  - `docs/<issue-number>-short-topic` (e.g., `docs/18-dataset-guide`)
  - `test/<issue-number>-short-topic` (e.g., `test/63-api-contract`)

See [docs/TEAM_WORKFLOW.md](docs/TEAM_WORKFLOW.md) for the complete Git workflow and merge rules.

## Commit Message Convention

LunaSpectra uses **Conventional Commits**:

```text
<type>(<scope>): <imperative summary>
```

Allowed types include `feat`, `fix`, `docs`, `test`, `refactor`, `chore`, `build`, and `ci`.

Examples:

- `feat(frontend): add lunar layer selector`
- `feat(api): add observation detail endpoint`
- `feat(data): parse footprint metadata`
- `feat(ml): add robust anomaly baseline`
- `fix(map): normalize longitude convention`
- `docs(readme): clarify dataset limitations`
- `test(api): add observation schema tests`
- `chore(repo): configure pull request template`

## Pull Request Process

1. Branch from `develop` (or sync your feature branch with `develop` before opening a PR).
2. Keep pull requests small and focused on a single issue or coherent task.
3. Complete the checklist in [pull_request_template.md](.github/pull_request_template.md).
4. Request review from **at least one teammate** (and cross-stack owners when touching API/database contracts).
5. Ensure planned automated checks (linting, type checks, tests) pass once the codebase is initialized.
6. Confirm no raw mission data, synthetic/real data mix-ups, or secrets are included.

## Reporting Bugs or Suggesting Enhancements

Use the structured issue templates in [.github/ISSUE_TEMPLATE/](.github/ISSUE_TEMPLATE/config.yml):

- **Bug Report** for defects, coordinate/projection mismatches, or unexpected behavior.
- **Feature Request** for scoped MVP tasks or evaluated enhancements.
- **Documentation** for clarifications, scientific caveats, or reference updates.
