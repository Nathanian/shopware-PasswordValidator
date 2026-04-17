const Plugin = window.PluginBaseClass;

export default class UmiPasswordRulePlugin extends Plugin {
    init() {
        this._form = this.el.closest('form');
        this._submitButton = this._form ? this._form.querySelector('[type="submit"]') : null;
        this._liveMessageElement = this._createLiveMessageElement();

        this._messages = {
            tooShort:
                this.el.dataset.passwordMessageTooShort ||
                'Das Passwort ist zu kurz (mindestens 10 Zeichen).',
            missingUppercase:
                this.el.dataset.passwordMessageMissingUppercase ||
                'Das Passwort muss mindestens einen Großbuchstaben enthalten.',
            missingLowercase:
                this.el.dataset.passwordMessageMissingLowercase ||
                'Das Passwort muss mindestens einen Kleinbuchstaben enthalten.',
            missingNumber:
                this.el.dataset.passwordMessageMissingNumber ||
                'Das Passwort muss mindestens eine Zahl enthalten.',
            missingSpecialCharacter:
                this.el.dataset.passwordMessageMissingSpecialCharacter ||
                'Das Passwort muss mindestens ein Sonderzeichen enthalten.',
        };

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

    _createLiveMessageElement() {
        const existingElement = this.el.parentElement?.querySelector('[data-umi-password-live-message]');

        if (existingElement) {
            return existingElement;
        }

        const messageElement = document.createElement('div');
        messageElement.setAttribute('data-umi-password-live-message', 'true');
        messageElement.classList.add('form-text', 'text-danger');

        this.el.insertAdjacentElement('afterend', messageElement);

        return messageElement;
    }

    _getValidationState() {
        const value = this.el.value || '';

        if (value.length < 10) {
            return { isValid: false, message: this._messages.tooShort };
        }

        if (!/[A-Z]/.test(value)) {
            return { isValid: false, message: this._messages.missingUppercase };
        }

        if (!/[a-z]/.test(value)) {
            return { isValid: false, message: this._messages.missingLowercase };
        }

        if (!/[0-9]/.test(value)) {
            return { isValid: false, message: this._messages.missingNumber };
        }

        if (!/[^A-Za-z0-9]/.test(value)) {
            return { isValid: false, message: this._messages.missingSpecialCharacter };
        }

        return { isValid: true, message: '' };
    }

    _validate() {
        const validationState = this._getValidationState();

        this.el.setCustomValidity(validationState.message);
        this._renderLiveMessage(validationState.message);
        this._toggleSubmitButton(validationState.isValid);
    }

    _renderLiveMessage(message) {
        if (!this._liveMessageElement) {
            return;
        }

        this._liveMessageElement.textContent = message;
    }

    _toggleSubmitButton(isValid) {
        if (!this._submitButton) {
            return;
        }

        this._submitButton.disabled = !isValid;
        this._submitButton.setAttribute('aria-disabled', String(!isValid));
    }
}
