# Shopware Password Validator Showcase

A configurable password validation plugin for Shopware 6 storefront registration and customer account workflows.

This plugin extends the default Shopware customer password validation system with configurable security rules, live frontend validation, dynamic password hints, and improved usability features.

The goal of the project was to create a production-ready password validation solution that combines backend security enforcement with a modern real-time user experience.

## Features

* Configurable password policies
* Minimum password length validation
* Uppercase/lowercase validation
* Number validation
* Special-character validation
* Live frontend password validation
* Dynamic password hint system
* Real-time validation feedback
* Password visibility toggle
* Shopware admin configuration support
* Multi-language support (German/English)
* Responsive storefront integration

## Technical Highlights

* Shopware 6 plugin architecture
* Symfony event subscriber integration
* Shopware validation pipeline extension
* Twig storefront template overrides
* Dynamic JavaScript validation system
* SCSS storefront styling
* Config-driven validation logic
* Translation/snippet system integration
* Backend/frontend synchronization
* Production-oriented storefront architecture

## Architecture Overview

The plugin extends the Shopware validation workflow through a Symfony event subscriber:

* Custom validation rules are injected into Shopware's customer registration validation process
* Password requirements are configurable through the Shopware admin panel
* Frontend JavaScript dynamically validates user input in real time
* Twig storefront extensions inject validation hints and UI improvements
* SCSS styling integrates the validation system seamlessly into the Shopware storefront

## Validation Rules

The plugin supports configurable validation requirements such as:

* Minimum password length
* Required uppercase letters
* Required lowercase letters
* Required numbers
* Required special characters

All validation rules are configurable through the Shopware administration panel.

## Frontend UX Features

The storefront integration includes:

* Live validation updates while typing
* Dynamic hint visibility
* Valid/invalid state indicators
* Password visibility toggle
* Responsive password-field layouts
* Multi-language validation messages

## Tech Stack

* PHP
* Shopware 6
* Symfony
* Twig
* JavaScript
* SCSS
* Composer

## Example Technologies Used

* Symfony Event Subscribers
* Shopware Validation Events
* Storefront Plugin System
* Dynamic DOM-based Validation
* Config-driven Frontend Rendering
* Translation/Snippet System

## Public Showcase Notes

This repository is a sanitized public showcase version of a production-oriented Shopware plugin.

The repository focuses on the technical implementation and architecture while excluding environment-specific deployment details.

## Installation

Install inside a Shopware 6 project:

```bash
composer require umi-password-rule/umi-password-rule
```

Refresh and activate the plugin:

```bash
bin/console plugin:refresh
bin/console plugin:install --activate UmiPasswordRule
```

Compile storefront assets:

```bash
bin/console theme:compile
```

## Screenshots

<img width="928" height="272" alt="Test" src="https://github.com/user-attachments/assets/78e57ec1-cc37-4bef-bc0e-dec3b751f298" />
<img width="1599" height="796" alt="Main" src="https://github.com/user-attachments/assets/1258597d-7ef2-4f38-a049-1c13cf434ec8" />
<img width="731" height="298" alt="Fail" src="https://github.com/user-attachments/assets/2da59672-5353-4b32-aed0-9b394f7f32d2" />

## Author

Jan Herold
Application Developer / Android, Web & Shopware Development
