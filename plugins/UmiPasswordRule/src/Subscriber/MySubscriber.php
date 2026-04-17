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
                'message' => 'Bitte gib ein Passwort ein.',
            ]),
            new Length([
                'min' => 10,
                'minMessage' => 'Das Passwort muss mindestens 10 Zeichen lang sein.',
            ]),
            new Regex([
                'pattern' => '/[A-Z]/',
                'message' => 'Das Passwort muss mindestens einen Großbuchstaben enthalten.',
            ]),
            new Regex([
                'pattern' => '/[a-z]/',
                'message' => 'Das Passwort muss mindestens einen Kleinbuchstaben enthalten.',
            ]),
            new Regex([
                'pattern' => '/[0-9]/',
                'message' => 'Das Passwort muss mindestens eine Zahl enthalten.',
            ]),
            new Regex([
                'pattern' => '/[^a-zA-Z0-9]/',
                'message' => 'Das Passwort muss mindestens ein Sonderzeichen enthalten.',
            ])
        );
    }
}