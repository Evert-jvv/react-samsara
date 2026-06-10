# Maintainer Notes

## Vendored SamsaraJS

This package vendors `samsarajs@0.2.4` from `dmvaldman/samsara`.

Vendored files live under `vendor/samsara`:

- `vendor/samsara/package.json` records the upstream package name, version, repository, and MIT license metadata.
- `vendor/samsara/samsara/` contains the upstream source files.
- `vendor/samsara/dist/samsara.js` is the browser bundle loaded by this wrapper.
- `vendor/samsara/dist/samsara.css` is the upstream stylesheet distributed by this wrapper.
- `vendor/samsara/dist/samsara.min.js` is preserved from upstream, but it is not copied into this package's build output.
- `vendor/samsara/LICENSE`, `vendor/samsara/README.md`, and `vendor/samsara/CHANGELOG.md` preserve upstream attribution and history in the repository.

Do not edit vendored files casually. If the vendored upstream changes, update the whole `vendor/samsara` snapshot together, then update this file, `NOTICE.md`, and any tests that assert the vendored version or file layout.

## Build Output

`npm run build` runs:

```sh
node scripts/clean-dist.mjs && tsc -p tsconfig.build.json && node scripts/copy-vendor.mjs
```

The TypeScript build emits the React wrapper into `dist`. After that, `scripts/copy-vendor.mjs` copies the vendored browser assets:

- `vendor/samsara/dist/samsara.js` to `dist/vendor/samsara.js`
- `vendor/samsara/dist/samsara.css` to `dist/vendor/samsara.css`
- `vendor/samsara/dist/samsara.css` to `dist/samsara.css`
- `vendor/samsara/dist/samsara.css` to `dist/styles.css`

`src/load-samsara.ts` resolves the local source bundle while running from `src`, and resolves `./vendor/samsara.js` from the built package.

## Licensing And Attribution

The wrapper is MIT licensed through `LICENSE`. The vendored upstream is also MIT licensed.

Keep attribution in these places:

- `NOTICE.md` names `samsarajs@0.2.4`, links to `https://github.com/dmvaldman/samsara`, and includes the upstream copyright.
- `vendor/samsara/LICENSE` preserves the upstream license text in the repository.
- `package.json` includes `NOTICE.md`, `LICENSE`, `README.md`, and `dist` in the published file list, so package consumers receive the wrapper license, notice, README, and copied runtime assets.

Do not remove or rewrite upstream copyright and license text when refreshing the vendored snapshot.

## Package Independence Verification

The package must work without installing `samsarajs` from npm. Verify that independence before release:

1. Run `./scripts/build.sh`.
2. Confirm `dist/vendor/samsara.js`, `dist/vendor/samsara.css`, `dist/samsara.css`, and `dist/styles.css` exist.
3. Run `npm pack --dry-run` and confirm the tarball file list includes `dist/vendor/samsara.js`, the CSS files, `LICENSE`, `NOTICE.md`, and `README.md`.
4. Confirm `package.json` does not list `samsarajs` in `dependencies`, `devDependencies`, or `peerDependencies`.
5. In a clean consumer project, install the packed tarball plus the React peer dependencies, import `react-samsarajs`, and verify the package import does not require a separate `samsarajs` installation.

