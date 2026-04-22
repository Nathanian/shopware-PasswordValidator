<?php declare(strict_types=1);

namespace UmiPasswordRule\Subscriber;

use Shopware\Core\Framework\Validation\BuildValidationEvent;
use Shopware\Core\System\SystemConfig\SystemConfigService;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\Validator\Constraints\Length;
use Symfony\Component\Validator\Constraints\NotBlank;
use Symfony\Component\Validator\Constraints\Regex;

class MySubscriber implements EventSubscriberInterface
{
    public function __construct(
        private readonly SystemConfigService $systemConfigService
    ) {
    }

    public static function getSubscribedEvents(): array
    {
        return [
            'framework.validation.customer.create' => 'onBuildValidation',
        ];
    }

    public function onBuildValidation(BuildValidationEvent $event): void
    {
        $definition = $event->getDefinition();

        $minLength = $this->getConfigInt('UmiPasswordRule.config.minLength', 10);
        $uppercase = $this->getConfigInt('UmiPasswordRule.config.uppercase', 1);
        $lowercase = $this->getConfigInt('UmiPasswordRule.config.lowercase', 1);
        $numbers = $this->getConfigInt('UmiPasswordRule.config.numbers', 1);
        $specialCharacters = $this->getConfigInt('UmiPasswordRule.config.specialCharacters', 1);

        $definition->add(
            'password',
            new NotBlank([
                'message' => 'umiPasswordRule.password.notBlank',
            ]),
            new Length([
                'min' => $minLength,
                'minMessage' => 'umiPasswordRule.password.tooShort',
            ]),
            new Regex([
                'pattern' => sprintf('/(?:.*[A-Z]){%d,}/', max(1, $uppercase)),
                'message' => 'umiPasswordRule.password.missingUppercase',
            ]),
            new Regex([
                'pattern' => sprintf('/(?:.*[a-z]){%d,}/', max(1, $lowercase)),
                'message' => 'umiPasswordRule.password.missingLowercase',
            ]),
            new Regex([
                'pattern' => sprintf('/(?:.*[0-9]){%d,}/', max(1, $numbers)),
                'message' => 'umiPasswordRule.password.missingNumber',
            ]),
            new Regex([
                'pattern' => sprintf('/(?:.*[^a-zA-Z0-9]){%d,}/', max(1, $specialCharacters)),
                'message' => 'umiPasswordRule.password.missingSpecialCharacter',
            ])
        );
    }

    private function getConfigInt(string $key, int $fallback): int
    {
        $value = $this->systemConfigService->get($key);

        if (!is_numeric($value)) {
            return $fallback;
        }

        $value = (int) $value;

        return $value >= 0 ? $value : $fallback;
    }
}