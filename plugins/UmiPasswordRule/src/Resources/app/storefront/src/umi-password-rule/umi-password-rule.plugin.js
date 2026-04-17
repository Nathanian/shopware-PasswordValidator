const Plugin = window.PluginBaseClass;

export default class UmiPasswordRulePlugin extends Plugin {
    init() {
        this._registerEvents();
        this._validate();
    }

    _registerEvents() {
        this.el.addEventListener('input', () => {
            this._validate();
        });

        this.el.addEventListener('blur', () => {
            this._validate();
        });
    }

    _validate() {
        const value = this.el.value || '';

        const isValid =
            value.length >= 10 &&
            /[a-z]/.test(value) &&
            /[A-Z]/.test(value) &&
            /[0-9]/.test(value) &&
            /[^A-Za-z0-9]/.test(value);

        if (!isValid) {
            this.el.setCustomValidity(
                'Das Passwort muss mindestens 10 Zeichen sowie Großbuchstaben, Kleinbuchstaben, Zahl und Sonderzeichen enthalten.'
            );
        } else {
            this.el.setCustomValidity('');
        }

        this.el.reportValidity();
    }
}
