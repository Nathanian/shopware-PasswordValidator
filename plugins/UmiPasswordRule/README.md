# UmiPasswordRule Deployment Notes

## Storefront asset policy

This plugin **does not commit built storefront `dist/` artifacts**.

- Source assets are maintained in `src/Resources/app/storefront/src/...`.
- Build artifacts under `src/Resources/app/storefront/dist/...` are generated during deployment (CI/CD or release process).
- Any storefront source change must be followed by a fresh storefront build before going live.

## Install / update commands

From your Shopware project root:

```bash
composer require umi-password-rule/umi-password-rule
```

For updates:

```bash
composer update umi-password-rule/umi-password-rule
```

## Storefront build command

Build storefront assets after plugin changes:

```bash
bin/console theme:compile
```

If your deployment process uses the Shopware storefront build tooling directly, run your standard production storefront build pipeline instead.

## Cache clear / warmup

After install/update and storefront compilation:

```bash
bin/console cache:clear
bin/console cache:warmup
```

## Shopware 6 plugin refresh/install/activate sequence

Use this sequence when deploying a new version:

```bash
bin/console plugin:refresh
bin/console plugin:install --activate UmiPasswordRule
```

If already installed, update and ensure activation:

```bash
bin/console plugin:update UmiPasswordRule
bin/console plugin:activate UmiPasswordRule
```

## Rollback and versioning note

- Follow semantic versioning for releases (`MAJOR.MINOR.PATCH`).
- Use patch versions for backward-compatible fixes, minor versions for new backward-compatible features, and major versions for breaking changes.
- To roll back, deploy the previous tagged plugin version, run `plugin:update UmiPasswordRule`, then rebuild storefront assets and clear/warm caches.
