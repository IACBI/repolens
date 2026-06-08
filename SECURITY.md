# Security Policy

RepoLens is designed to run locally and avoid external services by default.

## Supported Versions

Security updates target the current `main` branch until formal release branches exist.

## Reporting a Vulnerability

Do not publish sensitive vulnerability details in a public issue. After the GitHub repository is created, use GitHub private vulnerability reporting if enabled. If private reporting is not available, open a minimal public issue that states a security report is available without disclosing exploit details.

## Security Expectations

- RepoLens should not send repository contents to external services by default.
- Future network providers must be explicit opt-in.
- Changes that read files, parse docs, or handle paths should avoid data loss and unsafe filesystem behavior.
