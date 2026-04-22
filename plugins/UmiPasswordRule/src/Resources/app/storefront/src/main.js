import UmiPasswordRulePlugin from './umi-password-rule/umi-password-rule.plugin';

const PluginManager = window.PluginManager;

PluginManager.register(
    'UmiPasswordRulePlugin',
    UmiPasswordRulePlugin,
    '[data-umi-register-password], [data-umi-password-rules="true"]'
);