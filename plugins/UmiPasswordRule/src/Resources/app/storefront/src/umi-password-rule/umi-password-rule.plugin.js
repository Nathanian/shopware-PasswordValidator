import { createPasswordRulesConfig } from './password-rules.config';
import { validatePasswordRules } from './password-rules.validator';

const Plugin = window.PluginBaseClass;
const LIVE_MESSAGE_ID_SUFFIX = 'umi-password-rule-live-message';

const EYE_OPEN_ICON = `
<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"></path>
    <circle cx="12" cy="12" r="3"></circle>
</svg>
`;

const EYE_CLOSED_ICON = `
<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
    <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19C5 19 1 12 1 12a21.66 21.66 0 0 1 5.06-5.94"></path>
    <path d="M9.9 4.24A10.94 10.94 0 0 1 12 5c7 0 11 7 11 7a21.8 21.8 0 0 1-3.17 4.19"></path>
    <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"></path>
    <path d="M1 1l22 22"></path>
</svg>
`;

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
        this._confirmationInput = this._form ? this._form.querySelector('#personalPasswordConfirmation') : null;
        this._toggleLabels = this._collectToggleLabels();
        this._messageTemplates = this._collectMessageTemplates();
        this._rules = createPasswordRulesConfig(this.el);

        this._hasFocus = false;

        this._initializeVisibilityToggles();
        this._liveMessageElement = this._createLiveMessageElement();

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
        this.el.addEventListener('blur', () => this._handleBlur());
        this.el.addEventListener('focus', () => this._handleFocus());

        if (this._confirmationInput) {
            this._confirmationInput.addEventListener('focus', () => this._handleFocus());
            this._confirmationInput.addEventListener('blur', () => this._handleBlur());
        }
    }

    _handleFocus() {
        this._hasFocus = true;
        this._validate();
    }

    _handleBlur() {
        window.setTimeout(() => {
            const activeElement = document.activeElement;
            const passwordHasFocus = activeElement === this.el;
            const confirmationHasFocus = this._confirmationInput && activeElement === this._confirmationInput;

            this._hasFocus = Boolean(passwordHasFocus || confirmationHasFocus);
            this._validate();
        }, 0);
    }

    _initializeVisibilityToggles() {
        if (!this._form) {
            this._attachVisibilityToggle(this.el);
            return;
        }

        this._attachVisibilityToggle(this.el);
        this._attachVisibilityToggle(this._confirmationInput);
    }

    _attachVisibilityToggle(inputElement) {
        if (!inputElement || inputElement.dataset.umiPasswordVisibilityToggleAttached === 'true') {
            return;
        }

        let wrapperElement = inputElement.parentElement;

        if (!wrapperElement || !wrapperElement.classList.contains('umi-password-rule__input-wrapper')) {
            wrapperElement = document.createElement('div');
            wrapperElement.className = 'umi-password-rule__input-wrapper';

            inputElement.parentNode.insertBefore(wrapperElement, inputElement);
            wrapperElement.appendChild(inputElement);
        }

        inputElement.classList.add('umi-password-rule__input');

        const existingToggle = wrapperElement.querySelector('[data-umi-password-toggle-button="true"]');
        if (existingToggle) {
            inputElement.dataset.umiPasswordVisibilityToggleAttached = 'true';
            return;
        }

        const toggleButton = document.createElement('button');
        toggleButton.type = 'button';
        toggleButton.className = 'umi-password-rule__toggle-button';
        toggleButton.setAttribute('data-umi-password-toggle-button', 'true');
        toggleButton.setAttribute('aria-pressed', 'false');
        toggleButton.setAttribute('aria-label', this._toggleLabels.show);

        const iconElement = document.createElement('span');
        iconElement.className = 'umi-password-rule__toggle-icon';
        iconElement.setAttribute('aria-hidden', 'true');
        iconElement.innerHTML = EYE_OPEN_ICON;

        const updateState = () => {
            const isVisible = inputElement.type === 'text';
            toggleButton.setAttribute('aria-pressed', String(isVisible));
            toggleButton.setAttribute('aria-label', isVisible ? this._toggleLabels.hide : this._toggleLabels.show);
            iconElement.innerHTML = isVisible ? EYE_CLOSED_ICON : EYE_OPEN_ICON;
        };

        toggleButton.addEventListener('mousedown', (event) => {
            event.preventDefault();
        });

        toggleButton.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();

            inputElement.type = inputElement.type === 'password' ? 'text' : 'password';
            updateState();
            inputElement.focus();
        });

        toggleButton.appendChild(iconElement);
        wrapperElement.appendChild(toggleButton);
        inputElement.dataset.umiPasswordVisibilityToggleAttached = 'true';

        updateState();
    }

    _createLiveMessageElement() {
        const existingElement = this._form
            ? this._form.querySelector('[data-umi-password-live-message]')
            : null;

        if (existingElement) {
            if (!existingElement.id) {
                existingElement.id = `${this.el.id || this.el.name || 'password'}-${LIVE_MESSAGE_ID_SUFFIX}`;
            }

            existingElement.setAttribute('aria-live', 'polite');
            existingElement.setAttribute('aria-atomic', 'true');
            existingElement.hidden = true;

            return existingElement;
        }

        const messageElement = document.createElement('div');
        messageElement.id = `${this.el.id || this.el.name || 'password'}-${LIVE_MESSAGE_ID_SUFFIX}`;
        messageElement.setAttribute('data-umi-password-live-message', 'true');
        messageElement.setAttribute('aria-live', 'polite');
        messageElement.setAttribute('aria-atomic', 'true');
        messageElement.classList.add('umi-password-rule__messages');
        messageElement.hidden = true;

        const passwordGroup = this.el.closest('.form-group');
        const rowElement = passwordGroup ? passwordGroup.closest('.row') : null;
        const anchor = rowElement || passwordGroup || this.el;

        anchor.insertAdjacentElement('afterend', messageElement);

        return messageElement;
    }

    _getValidationState() {
        return validatePasswordRules(this.el.value || '', this._rules, this._messageTemplates);
    }

    _validate() {
        const validationState = this._getValidationState();

        this.el.setCustomValidity('');
        this._renderLiveMessage(validationState);
        this._toggleSubmitButton(validationState.isValid);
    }

    _shouldShowLiveMessage() {
        const hasPasswordValue = Boolean((this.el.value || '').length);
        return this._hasFocus || hasPasswordValue;
    }

    _renderLiveMessage(validationState) {
        if (!this._liveMessageElement) {
            return;
        }

        if (!this._shouldShowLiveMessage()) {
            this._liveMessageElement.innerHTML = '';
            this._liveMessageElement.hidden = true;
            this.el.removeAttribute('aria-describedby');
            return;
        }

        const itemsHtml = validationState.results
            .map((rule) => {
                const text = rule.hint || rule.errorMessage;
                const stateClass = rule.passed
                    ? 'umi-password-rule__message-item--valid'
                    : 'umi-password-rule__message-item--invalid';
                const icon = rule.passed ? '✓' : '•';

                return `
                    <li class="umi-password-rule__message-item ${stateClass}">
                        <span class="umi-password-rule__message-icon" aria-hidden="true">${icon}</span>
                        <span class="umi-password-rule__message-text">${escapeHtml(text)}</span>
                    </li>
                `;
            })
            .join('');

        this._liveMessageElement.hidden = false;
        this.el.setAttribute('aria-describedby', this._liveMessageElement.id);
        this._liveMessageElement.innerHTML = `
            <ul class="umi-password-rule__message-list">
                ${itemsHtml}
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