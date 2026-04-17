import UmiPasswordRulePlugin from './umi-password-rule/umi-password-rule.plugin';

const PluginManager = window.PluginManager;
PluginManager.register('UmiPasswordRulePlugin', UmiPasswordRulePlugin, '[name="password"]');
