<?php

namespace Drupal\block_content;

use Drupal\Core\Entity\BundleEntityFormBase;
use Drupal\Core\Entity\EntityInterface;
use Drupal\Core\Entity\EntityTypeInterface;
use Drupal\Core\Form\FormStateInterface;
use Drupal\language\Entity\ContentLanguageSettings;

/**
 * The block content type entity form.
 *
 * @internal
 */
class BlockContentTypeForm extends BundleEntityFormBase {

  /**
   * {@inheritdoc}
   */
  public function form(array $form, FormStateInterface $form_state) {
    $form = parent::form($form, $form_state);

    /** @var \Drupal\block_content\BlockContentTypeInterface $block_type */
    $block_type = $this->entity;

    if ($this->operation == 'add') {
      $form['#title'] = $this->t('Add block type');
    }
    else {
      $form['#title'] = $this->t('Edit %label block type', ['%label' => $block_type->label()]);
    }

    $form['label'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Label'),
      '#maxlength' => 255,
      '#default_value' => $block_type->label(),
      '#description' => $this->t("The human-readable name for this block type, displayed on the <em>Block types</em> page."),
      '#required' => TRUE,
    ];
    $form['id'] = [
      '#type' => 'machine_name',
      '#default_value' => $block_type->id(),
      '#machine_name' => [
        'exists' => '\Drupal\block_content\Entity\BlockContentType::load',
      ],
      '#description' => $this->t("Unique machine-readable name: lowercase letters, numbers, and underscores only."),
      '#maxlength' => EntityTypeInterface::BUNDLE_MAX_LENGTH,
    ];

    $form['description'] = [
      '#type' => 'textarea',
      '#default_value' => $block_type->getDescription(),
      '#description' => $this->t('Displays on the <em>Block types</em> page.'),
      '#title' => $this->t('Description'),
    ];

    $form['revision'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Create new revision'),
      '#default_value' => $block_type->shouldCreateNewRevision(),
      '#description' => $this->t('Create a new revision by default for this block type.'),
    ];

    if ($this->moduleHandler->moduleExists('language')) {
      $form['language'] = [
        '#type' => 'details',
        '#title' => $this->t('Language settings'),
        '#group' => 'additional_settings',
      ];

      $language_configuration = ContentLanguageSettings::loadByEntityTypeBundle('block_content', $block_type->id());
      $form['language']['language_configuration'] = [
        '#type' => 'language_configuration',
        '#entity_information' => [
          'entity_type' => 'block_content',
          'bundle' => $block_type->id(),
        ],
        '#default_value' => $language_configuration,
      ];

      $form['#submit'][] = 'language_configuration_element_submit';
    }

    $form['actions'] = ['#type' => 'actions'];
    $form['actions']['submit'] = [
      '#type' => 'submit',
      '#value' => $this->t('Save'),
    ];

    return $this->protectBundleIdElement($form);
  }

  /**
   * {@inheritdoc}
   */
  protected function copyFormValuesToEntity(EntityInterface $entity, array $form, FormStateInterface $form_state) {
    // An empty description violates config schema.
    if (trim($form_state->getValue('description', '')) === '') {
      $form_state->unsetValue('description');
    }
    parent::copyFormValuesToEntity($entity, $form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function save(array $form, FormStateInterface $form_state) {
    $block_type = $this->entity;
    $status = $block_type->save();

    $edit_link = $this->entity->toLink($this->t('Edit'), 'edit-form')->toString();
    $logger = $this->logger('block_content');
    if ($status == SAVED_UPDATED) {
      $this->messenger()->addStatus($this->t('Block type %label has been updated.', ['%label' => $block_type->label()]));
      $logger->notice('Block type %label has been updated.', ['%label' => $block_type->label(), 'link' => $edit_link]);
    }
    else {
      block_content_add_body_field($block_type->id());
      $this->messenger()->addStatus($this->t('Block type %label has been added.', ['%label' => $block_type->label()]));
      $logger->notice('Block type %label has been added.', ['%label' => $block_type->label(), 'link' => $edit_link]);
    }

    $form_state->setRedirectUrl($this->entity->toUrl('collection'));
  }

}
