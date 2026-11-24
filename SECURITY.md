# Security Policy

## Scope

**LunaSpectra** is currently in the **documentation and repository-foundation phase**. No backend API, database, or frontend application is deployed yet. This policy defines the security hygiene expected throughout development and future milestones.

## Supported Versions

| Version / Branch | Status | Security Updates |
| --- | --- | --- |
| `main` | Planning / Foundation | Active documentation & config hygiene |
| `develop` | Planned Integration | Active once implementation begins |

## Sensitive Data and Secrets Hygiene

Contributors must follow these non-negotiable rules:

1. **Never commit credentials or secrets:** Do not place API keys, ISSDC/PRADAN account credentials, tokens, database passwords, or private keys in source code, notebooks, commit messages, or issues.
2. **Use `.env.example` safely:** Only non-sensitive placeholder configuration values belong in [.env.example](.env.example). Local `.env` files are excluded via [.gitignore](.gitignore).
3. **Never commit raw mission archives:** Downloaded Chandrayaan-2 products belong strictly in the ignored `data/raw/` directory (see [docs/DATASET_GUIDE.md](docs/DATASET_GUIDE.md)).
4. **Input validation (planned):** Future FastAPI endpoints will validate all query/path inputs with Pydantic and enforce parameterized SQLAlchemy queries.

## Reporting a Vulnerability

If you discover a potential security issue, accidental credential exposure, or unsafe dependency in this repository:

1. **Do not** open a public GitHub issue containing sensitive details or leaked tokens.
2. Contact the repository maintainer directly at `[Security Contact Email Placeholder]` or notify `[Faculty Guide Name Placeholder]`.
3. Include a concise description of the issue, affected file/component, and steps to reproduce.
4. Rotate any exposed credential immediately if a secret was inadvertently committed.
