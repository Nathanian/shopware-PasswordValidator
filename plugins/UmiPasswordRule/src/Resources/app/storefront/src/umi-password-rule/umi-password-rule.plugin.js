import { createPasswordRulesConfig } from './password-rules.config';
import { validatePasswordRules } from './password-rules.validator';

const Plugin = window.PluginBaseClass;
const LIVE_MESSAGE_ID_SUFFIX = 'umi-password-rule-live-message';
const SUMMARY_ID_SUFFIX = 'umi-password-rule-summary';

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
        this._summaryElement = this._createSummaryElement();

        this._messageTemplates = this._collectMessageTemplates();
        this._rules = createPasswordRulesConfig();

        this._renderSummary();
        this._registerEvents();
        this._validate();
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

    _createSummaryElement() {
        const existingElement = this.el.parentElement?.querySelector('[data-umi-password-summary]');

        if (existingElement) {
            if (!existingElement.id) {
                existingElement.id = `${this.el.id || this.el.name || SUMMARY_ID_SUFFIX}-${SUMMARY_ID_SUFFIX}`;
            }

            return existingElement;
        }

        const summaryElement = document.createElement('div');
        summaryElement.id = `${this.el.id || this.el.name || SUMMARY_ID_SUFFIX}-${SUMMARY_ID_SUFFIX}`;
        summaryElement.setAttribute('data-umi-password-summary', 'true');
        summaryElement.classList.add('form-text', 'umi-password-rule__summary');

        this.el.insertAdjacentElement('afterend', summaryElement);

        return summaryElement;
    }

    _getValidationState() {
        return validatePasswordRules(this.el.value || '', this._rules, this._messageTemplates);
    }

    _renderSummary() {
        if (!this._summaryElement) {
            return;
        }

        const summaryValidation = validatePasswordRules('', this._rules, this._messageTemplates);
        const summaryItems = summaryValidation.results
            .map((result) => result.hint)
            .filter((hint) => Boolean(hint));

        if (!summaryItems.length) {
            this._summaryElement.innerHTML = '';
            this._summaryElement.hidden = true;
            return;
        }

        this._summaryElement.hidden = false;
        this._summaryElement.innerHTML = `<ul class="umi-password-rule__summary-list">${summaryItems
            .map((item) => `<li class="umi-password-rule__summary-item">${escapeHtml(item)}</li>`)
            .join('')}</ul>`;
    }

    _validate() {
        const validationState = this._getValidationState();
        const combinedMessage = validationState.failedRules
            .map((rule) => rule.errorMessage)
            .join('\n');

        this.el.setCustomValidity(combinedMessage);
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
