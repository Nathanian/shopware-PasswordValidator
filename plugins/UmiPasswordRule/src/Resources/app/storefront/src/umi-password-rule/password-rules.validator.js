const isRuleEnabled = (rule) => {
    if (!rule || typeof rule !== 'object') {
        return false;
    }

    if (rule.enabled === false) {
        return false;
    }

    if (rule.isCountRule && (!Number.isFinite(rule.value) || rule.value <= 0)) {
        return false;
    }

    if (typeof rule.test !== 'function') {
        return false;
    }

    return true;
};

export const validatePasswordRules = (password, rules = [], templates = {}) => {
    const safePassword = typeof password === 'string' ? password : '';
    const safeRules = Array.isArray(rules) ? rules : [];

    const results = [];

    safeRules.forEach((rule) => {
        if (!isRuleEnabled(rule)) {
            return;
        }

        const key = rule.key || `rule-${results.length}`;
        let passed = false;

        try {
            passed = Boolean(rule.test(safePassword, rule));
        } catch (error) {
            passed = false;
        }

        const fallbackError = 'Password requirement not met.';
        const fallbackHint = '';

        const errorMessage = typeof rule.buildErrorMessage === 'function'
            ? rule.buildErrorMessage(rule, templates)
            : fallbackError;

        const hint = typeof rule.buildHint === 'function'
            ? rule.buildHint(rule, templates)
            : fallbackHint;

        results.push({
            key,
            value: rule.value,
            passed,
            errorMessage: errorMessage || fallbackError,
            hint: hint || '',
        });
    });

    const failedRules = results.filter((result) => !result.passed);
    const passedRules = results.filter((result) => result.passed);

    return {
        isValid: failedRules.length === 0,
        results,
        failedRules,
        passedRules,
        activeRules: results.map((result) => result.key),
    };
};