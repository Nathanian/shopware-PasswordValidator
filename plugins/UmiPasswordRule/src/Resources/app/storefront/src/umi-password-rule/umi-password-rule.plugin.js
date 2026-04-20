const Plugin = window.PluginBaseClass;

export default class UmiPasswordRulePlugin extends Plugin {
    init() {
        this._form = this.el.closest('form');
        this._submitButton = this._form ? this._form.querySelector('[type="submit"]') : null;
        this._liveMessageElement = this._createLiveMessageElement();

        this._messages = {
            tooShort:
                this.el.dataset.passwordMessageTooShort ||
                'The password is too short (minimum 10 characters).',
            missingUppercase:
                this.el.dataset.passwordMessageMissingUppercase ||
                'The password must contain at least one uppercase letter.',
            missingLowercase:
                this.el.dataset.passwordMessageMissingLowercase ||
                'The password must contain at least one lowercase letter.',
            missingNumber:
                this.el.dataset.passwordMessageMissingNumber ||
                'The password must contain at least one number.',
            missingSpecialCharacter:
                this.el.dataset.passwordMessageMissingSpecialCharacter ||
                'The password must contain at least one special character.',
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
        messageElement.classList.add('form-text', 'text-danger', 'umi-password-rule__messages');

        this.el.insertAdjacentElement('afterend', messageElement);

        return messageElement;
    }

    _getMissingMessages() {
        const value = this.el.value || '';
        const missingMessages = [];

        if (value.length < 10) {
            missingMessages.push(this._messages.tooShort);
        }

        if (!/[A-Z]/.test(value)) {
            missingMessages.push(this._messages.missingUppercase);
        }

        if (!/[a-z]/.test(value)) {
            missingMessages.push(this._messages.missingLowercase);
        }

        if (!/[0-9]/.test(value)) {
            missingMessages.push(this._messages.missingNumber);
        }

        if (!/[^A-Za-z0-9]/.test(value)) {
            missingMessages.push(this._messages.missingSpecialCharacter);
        }

        return missingMessages;
    }

    _getValidationState() {
        const missingMessages = this._getMissingMessages();

        return {
            isValid: missingMessages.length === 0,
            messages: missingMessages,
        };
    }

    _validate() {
        const validationState = this._getValidationState();
        const combinedMessage = validationState.messages.join('\n');

        this.el.setCustomValidity(combinedMessage);
        this._renderLiveMessage(validationState.messages);
        this._toggleSubmitButton(validationState.isValid);
    }

    _renderLiveMessage(messages) {
        if (!this._liveMessageElement) {
            return;
        }

        if (!messages.length) {
            this._liveMessageElement.textContent = '';
            this._liveMessageElement.innerHTML = '';
            return;
        }

        this._liveMessageElement.innerHTML = messages
            .map((message) => `<div class="umi-password-rule__message-item">${message}</div>`)
            .join('');
    }

    _toggleSubmitButton(isValid) {
        if (!this._submitButton) {
            return;
        }

        this._submitButton.disabled = !isValid;
        this._submitButton.setAttribute('aria-disabled', String(!isValid));
    }
}
