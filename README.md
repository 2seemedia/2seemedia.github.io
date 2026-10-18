# 2SEE Media public website

Public address: https://2seemedia.github.io

The existing private owner dashboard remains the content editor. This repository publishes an independent, static copy of its anonymous public content. Visitors load all site images, fonts and portfolio data from GitHub Pages. Instagram/YouTube/Vimeo previews still use their original providers.

## Automatic updates

`Sync 2SEE public website` checks for changes about every five minutes. GitHub schedules are best effort and can be delayed. A complete snapshot is validated before committing; an export error leaves the existing published website intact. Manual **Run workflow** also requests synchronization.

GitHub can disable scheduled workflows in a public repository after 60 days without repository activity. If automatic updates stop, re-enable this workflow in the Actions tab and run it once. Every changed website snapshot is committed, retaining a recoverable version history.

The existing Pages publishing source stays on `main` at `/`. After each bot commit, the workflow explicitly requests a Pages build because pushes made with `GITHUB_TOKEN` do not trigger a build by themselves. No personal access token is stored or required.

## Develop

The portfolio component and shared presentation code are under `source/app/` and `source/lib/`. Run `npm install` then `npm run build` to regenerate the checked-in `client/` bundle. The homepage is copied from the currently published CMS so owner changes are retained exactly. Only public GET endpoints are read; drafts, hidden works, credentials and owner-only APIs are never exported.

Run `npm run snapshot` then `npm run verify` to prepare and check a fresh public version. Failure during synchronization never publishes a partial copy.
