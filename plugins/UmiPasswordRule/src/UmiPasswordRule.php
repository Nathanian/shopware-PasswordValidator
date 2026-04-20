<?php declare(strict_types=1);

namespace UmiPasswordRule;

use Shopware\Core\Framework\Plugin;
use Shopware\Core\Framework\Plugin\Context\ActivateContext;
use Shopware\Core\Framework\Plugin\Context\DeactivateContext;
use Shopware\Core\Framework\Plugin\Context\InstallContext;
use Shopware\Core\Framework\Plugin\Context\UninstallContext;
use Shopware\Core\Framework\Plugin\Context\UpdateContext;

class UmiPasswordRule extends Plugin
{
    public function install(InstallContext $installContext): void
    {
        // Intentionally no-op: plugin wiring is handled via DI and storefront assets.
    }

    public function uninstall(UninstallContext $uninstallContext): void
    {
        parent::uninstall($uninstallContext);

        if ($uninstallContext->keepUserData()) {
            return;
        }

        // Intentionally no-op: no persisted plugin-owned data requires cleanup.
    }

    public function activate(ActivateContext $activateContext): void
    {
        // Intentionally no-op: activation is purely configuration and template extension based.
    }

    public function deactivate(DeactivateContext $deactivateContext): void
    {
        // Intentionally no-op: deactivation requires no additional teardown.
    }

    public function update(UpdateContext $updateContext): void
    {
        // Intentionally no-op: no migration or runtime update steps are needed currently.
    }

    public function postInstall(InstallContext $installContext): void
    {
        // Intentionally no-op: nothing to execute after installation.
    }

    public function postUpdate(UpdateContext $updateContext): void
    {
        // Intentionally no-op: nothing to execute after update.
    }
}
