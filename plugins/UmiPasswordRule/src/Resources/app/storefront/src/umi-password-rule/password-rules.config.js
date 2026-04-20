const DEFAULT_RULE_VALUES = {
    minLength: 10,
    uppercase: 1,
    lowercase: 1,
    numbers: 1,
    specialCharacters: 1,
};

const toFiniteNumber = (rawValue, fallbackValue) => {
    const parsed = Number.parseInt(rawValue, 10);

    if (!Number.isFinite(parsed) || parsed < 0) {
        return fallbackValue;
    }

    return parsed;
};

const countMatches = (value, expression) => {
    const matches = value.match(expression);
    return matches ? matches.length : 0;
};

const replaceCountToken = (template, count) =>
    String(template || '').replace(/\{\{\s*count\s*\}\}/g, String(count));

const buildPluralizedMessage = (templates, count, fallbackSingular, fallbackPlural) => {
    const singularTemplate = templates.singular || fallbackSingular;
    const pluralTemplate = templates.plural || fallbackPlural;

    return count === 1
        ? replaceCountToken(singularTemplate, count)
        : replaceCountToken(pluralTemplate, count);
};

export const createPasswordRulesConfig = (options = {}) => {
    const values = {
        minLength: toFiniteNumber(options.minLength, DEFAULT_RULE_VALUES.minLength),
        uppercase: toFiniteNumber(options.uppercase, DEFAULT_RULE_VALUES.uppercase),
        lowercase: toFiniteNumber(options.lowercase, DEFAULT_RULE_VALUES.lowercase),
        numbers: toFiniteNumber(options.numbers, DEFAULT_RULE_VALUES.numbers),
        specialCharacters: toFiniteNumber(options.specialCharacters, DEFAULT_RULE_VALUES.specialCharacters),
    };

    return [
        {
            key: 'minLength',
            value: values.minLength,
            isCountRule: true,
            test: (password, rule) => password.length >= rule.value,
            buildErrorMessage: (rule, templates = {}) =>
                buildPluralizedMessage(
                    {
                        singular: templates.minLengthSingular,
                        plural: templates.minLengthPlural,
                    },
                    rule.value,
                    'The password must be at least {{count}} character long.',
                    'The password must be at least {{count}} characters long.'
                ),
            buildHint: (rule, templates = {}) =>
                buildPluralizedMessage(
                    {
                        singular: templates.hintMinLengthSingular,
                        plural: templates.hintMinLengthPlural,
                    },
                    rule.value,
                    'Minimum {{count}} character',
                    'Minimum {{count}} characters'
                ),
        },
        {
            key: 'uppercase',
            value: values.uppercase,
            isCountRule: true,
            test: (password, rule) => countMatches(password, /[A-Z]/g) >= rule.value,
            buildErrorMessage: (rule, templates = {}) =>
                buildPluralizedMessage(
                    {
                        singular: templates.uppercaseSingular,
                        plural: templates.uppercasePlural,
                    },
                    rule.value,
                    'The password must contain at least {{count}} uppercase letter.',
                    'The password must contain at least {{count}} uppercase letters.'
                ),
            buildHint: (rule, templates = {}) =>
                buildPluralizedMessage(
                    {
                        singular: templates.hintUppercaseSingular,
                        plural: templates.hintUppercasePlural,
                    },
                    rule.value,
                    '{{count}} uppercase letter',
                    '{{count}} uppercase letters'
                ),
        },
        {
            key: 'lowercase',
            value: values.lowercase,
            isCountRule: true,
            test: (password, rule) => countMatches(password, /[a-z]/g) >= rule.value,
            buildErrorMessage: (rule, templates = {}) =>
                buildPluralizedMessage(
                    {
                        singular: templates.lowercaseSingular,
                        plural: templates.lowercasePlural,
                    },
                    rule.value,
                    'The password must contain at least {{count}} lowercase letter.',
                    'The password must contain at least {{count}} lowercase letters.'
                ),
            buildHint: (rule, templates = {}) =>
                buildPluralizedMessage(
                    {
                        singular: templates.hintLowercaseSingular,
                        plural: templates.hintLowercasePlural,
                    },
                    rule.value,
                    '{{count}} lowercase letter',
                    '{{count}} lowercase letters'
                ),
        },
        {
            key: 'numbers',
            value: values.numbers,
            isCountRule: true,
            test: (password, rule) => countMatches(password, /[0-9]/g) >= rule.value,
            buildErrorMessage: (rule, templates = {}) =>
                buildPluralizedMessage(
                    {
                        singular: templates.numberSingular,
                        plural: templates.numberPlural,
                    },
                    rule.value,
                    'The password must contain at least {{count}} number.',
                    'The password must contain at least {{count}} numbers.'
                ),
            buildHint: (rule, templates = {}) =>
                buildPluralizedMessage(
                    {
                        singular: templates.hintNumberSingular,
                        plural: templates.hintNumberPlural,
                    },
                    rule.value,
                    '{{count}} number',
                    '{{count}} numbers'
                ),
        },
        {
            key: 'specialCharacters',
            value: values.specialCharacters,
            isCountRule: true,
            test: (password, rule) => countMatches(password, /[^A-Za-z0-9]/g) >= rule.value,
            buildErrorMessage: (rule, templates = {}) =>
                buildPluralizedMessage(
                    {
                        singular: templates.specialCharacterSingular,
                        plural: templates.specialCharacterPlural,
                    },
                    rule.value,
                    'The password must contain at least {{count}} special character.',
                    'The password must contain at least {{count}} special characters.'
                ),
            buildHint: (rule, templates = {}) =>
                buildPluralizedMessage(
                    {
                        singular: templates.hintSpecialCharacterSingular,
                        plural: templates.hintSpecialCharacterPlural,
                    },
                    rule.value,
                    '{{count}} special character',
                    '{{count}} special characters'
                ),
        },
    ];
};
