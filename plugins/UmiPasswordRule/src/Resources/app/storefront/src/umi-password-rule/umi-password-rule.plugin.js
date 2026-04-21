import { createPasswordRulesConfig } from './password-rules.config';
import { validatePasswordRules } from './password-rules.validator';

const Plugin = window.PluginBaseClass;
const LIVE_MESSAGE_ID_SUFFIX = 'umi-password-rule-live-message';
const VISIBILITY_TOGGLE_LABEL_SELECTOR = '[data-umi-password-toggle-label]';

const escapeHtml = (value) => String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

export default class UmiPasswordRulePlugin extends Plugin {
    init() {
        this._form = this.el.closest('form');
        this._submitButton = this._form ? this._form.querySelector('[type="submit"]') : null;
        this._liveMessageElement = this._createLiveMessageElement();
        this._toggleLabels = this._collectToggleLabels();

        this._messageTemplates = this._collectMessageTemplates();
        this._rules = createPasswordRulesConfig();

        this._initializeVisibilityToggles();
        this._registerEvents();
        this._validate();
    }

    _collectToggleLabels() {
        return {
            show: this.el.dataset.passwordToggleShowLabel || 'Show password',
            hide: this.el.dataset.passwordToggleHideLabel || 'Hide password',
        };
    }

    _collectMessageTemplates() {
        return {
            minLengthSingular: this.el.dataset.passwordMessageMinLengthSingular,
            minLengthPlural: this.el.dataset.passwordMessageMinLengthPlural,
            uppercaseSingular: this.el.dataset.passwordMessageUppercaseSingular,
            uppercasePlural: this.el.dataset.passwordMessageUppercasePlural,
            lowercaseSingular: this.el.dataset.passwordMessageLowercaseSingular,
            lowercasePlural: this.el.dataset.passwordMessageLowercasePlural,
            numberSingular: this.el.dataset.passwordMessageNumberSingular,
            numberPlural: this.el.dataset.passwordMessageNumberPlural,
            specialCharacterSingular: this.el.dataset.passwordMessageSpecialCharacterSingular,
            specialCharacterPlural: this.el.dataset.passwordMessageSpecialCharacterPlural,
            hintMinLengthSingular: this.el.dataset.passwordHintMinLengthSingular,
            hintMinLengthPlural: this.el.dataset.passwordHintMinLengthPlural,
            hintUppercaseSingular: this.el.dataset.passwordHintUppercaseSingular,
            hintUppercasePlural: this.el.dataset.passwordHintUppercasePlural,
            hintLowercaseSingular: this.el.dataset.passwordHintLowercaseSingular,
            hintLowercasePlural: this.el.dataset.passwordHintLowercasePlural,
            hintNumberSingular: this.el.dataset.passwordHintNumberSingular,
            hintNumberPlural: this.el.dataset.passwordHintNumberPlural,
            hintSpecialCharacterSingular: this.el.dataset.passwordHintSpecialCharacterSingular,
            hintSpecialCharacterPlural: this.el.dataset.passwordHintSpecialCharacterPlural,
        };
    }

    _registerEvents() {
        this.el.addEventListener('input', () => this._validate());
        this.el.addEventListener('blur', () => this._validate());
    }

    _initializeVisibilityToggles() {
        const confirmationInput = this._form ? this._form.querySelector('#personalPasswordConfirmation') : null;

        this._attachVisibilityToggle(this.el);
        this._attachVisibilityToggle(confirmationInput);
    }

    _attachVisibilityToggle(inputElement) {
        if (!inputElement || inputElement.dataset.umiPasswordVisibilityToggleAttached === 'true') {
            return;
        }

        const wrapperElement = inputElement.parentElement;

        if (!wrapperElement) {
            return;
        }

        wrapperElement.classList.add('umi-password-rule__input-wrapper');
        inputElement.classList.add('umi-password-rule__input');

        const toggleButton = document.createElement('button');
        toggleButton.type = 'button';
        toggleButton.classList.add('umi-password-rule__toggle-button');
        toggleButton.setAttribute('aria-pressed', 'false');
        toggleButton.setAttribute('data-umi-password-toggle-button', 'true');
        toggleButton.innerHTML = `
            <span class="umi-password-rule__toggle-icon" aria-hidden="true">👁</span>
            <span class="sr-only" data-umi-password-toggle-label>${escapeHtml(this._toggleLabels.show)}</span>
        `;

        toggleButton.addEventListener('click', () => {
            const isVisible = inputElement.type === 'text';

            inputElement.type = isVisible ? 'password' : 'text';
            toggleButton.setAttribute('aria-pressed', String(!isVisible));

            const labelElement = toggleButton.querySelector(VISIBILITY_TOGGLE_LABEL_SELECTOR);
            const labelText = isVisible ? this._toggleLabels.show : this._toggleLabels.hide;

            if (labelElement) {
                labelElement.textContent = labelText;
            }
        });

        wrapperElement.appendChild(toggleButton);
        inputElement.dataset.umiPasswordVisibilityToggleAttached = 'true';
    }

    _createLiveMessageElement() {
        const existingElement = this.el.parentElement?.querySelector('[data-umi-password-live-message]');

        if (existingElement) {
            if (!existingElement.id) {
                existingElement.id = `${this.el.id || this.el.name || LIVE_MESSAGE_ID_SUFFIX}-${LIVE_MESSAGE_ID_SUFFIX}`;
            }
            existingElement.setAttribute('aria-live', 'polite');
            existingElement.setAttribute('aria-atomic', 'true');
            existingElement.hidden = true;
            return existingElement;
        }

        const messageElement = document.createElement('div');
        messageElement.id = `${this.el.id || this.el.name || LIVE_MESSAGE_ID_SUFFIX}-${LIVE_MESSAGE_ID_SUFFIX}`;
        messageElement.setAttribute('data-umi-password-live-message', 'true');
        messageElement.setAttribute('aria-live', 'polite');
        messageElement.setAttribute('aria-atomic', 'true');
        messageElement.classList.add('form-text', 'text-danger', 'umi-password-rule__messages');
        messageElement.hidden = true;

        this.el.insertAdjacentElement('afterend', messageElement);

        return messageElement;
    }

    _getValidationState() {
        return validatePasswordRules(this.el.value || '', this._rules, this._messageTemplates);
    }

    _validate() {
        const validationState = this._getValidationState();

        this.el.setCustomValidity('');
        this._renderLiveMessage(validationState.failedRules.map((rule) => rule.errorMessage));
        this._toggleSubmitButton(validationState.isValid);
    }

    _renderLiveMessage(messages) {
        if (!this._liveMessageElement) {
            return;
        }

        if (!messages.length) {
            this._liveMessageElement.innerHTML = '';
            this._liveMessageElement.hidden = true;
            this.el.removeAttribute('aria-describedby');
            return;
        }

        this._liveMessageElement.hidden = false;
        this.el.setAttribute('aria-describedby', this._liveMessageElement.id);
        this._liveMessageElement.innerHTML = `
            <ul class="umi-password-rule__message-list">
                ${messages
        .map((message) => `<li class="umi-password-rule__message-item">${escapeHtml(message)}</li>`)
        .join('')}
            </ul>
        `;
    }

    _toggleSubmitButton(isValid) {
        if (!this._submitButton) {
            return;
        }

        this._submitButton.disabled = !isValid;
        this._submitButton.setAttribute('aria-disabled', String(!isValid));
    }
}
