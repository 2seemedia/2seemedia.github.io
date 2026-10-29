# 2SEE admin staging acceptance

Status: ready for owner review; production changes require explicit approval.

Validated on the deployed `2see-admin-staging` Worker:

- Actual password login as the shared 2SEE account.
- Loading the existing website content and all 56 works.
- Draft text edit appears in the English iframe preview; reverting the edit restores the text. Arabic preview renders the Arabic headline.
- Selecting text in the visual editor opens its editing controls.
- Publishing a hidden test work and a PNG cover through the dashboard succeeds on `admin/content-staging`.
- Commit `809ecea0d5c879542a4b644384c59a9247dd7377` contains JS content, JSON content and the uploaded PNG together.
- The new PNG is served correctly by the authenticated Worker without redeploying its bundled assets.
- Removing the test work and republishing succeeds (commit `57c084a25a507bc0b0460202de5495d780941b90`).
- Final cleanup restores the exact original Git tree `0f7c5a6ad10d8b217aa91b326737b63b66b918c4`, including removal of the test image.
- The public `main` branch stays at `aaa376f901e8a6296f70f8c89670972a8e0ebad4` throughout.

34 automated tests pass, including signed session verification, expiry and password rotation, mandatory login throttling, CSRF checks, atomic media publishing, stale-draft conflicts and preventing editor controls from modifying untouched content. Wrangler deployment dry-run passed for the password-login implementation.

Production remains unapproved. The staged Worker targets only `admin/content-staging`; its source is `admin/secure-control-panel`. No production publish, PR merge or public-site source change was performed. Browser checks were performed at desktop size; a real mobile-device review is still recommended before public approval.

Operational notes: ADMIN_PASSWORD and GITHUB_TOKEN are owner-managed Cloudflare Secrets. The GitHub token was configured with a 30-day expiration. The shared account cannot attribute actions separately to each founder. Backups can be exported from the dashboard; rollback uses reviewed Git commits.
