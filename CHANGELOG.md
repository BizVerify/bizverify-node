# Changelog

## 0.1.0 (2026-03-23)

- Initial release
- Full coverage of BizVerify public API (auth, verification, search, entities, account, billing, checker)
- Typed error hierarchy mapping all API error codes
- Job polling with exponential backoff (`verifyAndWait`)
- Auto-pagination for search results (`findAll`)
- Dual ESM + CJS builds
- Zero runtime dependencies (Node 18+ built-in fetch)
