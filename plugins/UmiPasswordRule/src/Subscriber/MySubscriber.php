<?php declare(strict_types=1);

namespace UmiPasswordRule\Subscriber;

use Shopware\Core\Framework\Validation\BuildValidationEvent;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\Validator\Constraints\Length;
use Symfony\Component\Validator\Constraints\NotBlank;
use Symfony\Component\Validator\Constraints\Regex;

class MySubscriber implements EventSubscriberInterface
{
    public static function getSubscribedEvents(): array
    {
        return [
            'framework.validation.customer.create' => 'onBuildValidation',
        ];
    }

    public function onBuildValidation(BuildValidationEvent $event): void
    {
        $definition = $event->getDefinition();

        $definition->add('password',
            new NotBlank([
                'message' => 'umiPasswordRule.password.notBlank',
            ]),
            new Length([
                'min' => 10,
                'minMessage' => 'umiPasswordRule.password.tooShort',
            ]),
            new Regex([
                'pattern' => '/[A-Z]/',
                'message' => 'umiPasswordRule.password.missingUppercase',
            ]),
            new Regex([
                'pattern' => '/[a-z]/',
                'message' => 'umiPasswordRule.password.missingLowercase',
            ]),
            new Regex([
                'pattern' => '/[0-9]/',
                'message' => 'umiPasswordRule.password.missingNumber',
            ]),
            new Regex([
                'pattern' => '/[^a-zA-Z0-9]/',
                'message' => 'umiPasswordRule.password.missingSpecialCharacter',
            ])
        );
    }
}