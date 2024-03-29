<?php

namespace Drupal\Tests\editor\Kernel;

use Drupal\editor\Entity\Editor;
use Drupal\filter\Entity\FilterFormat;
use Drupal\KernelTests\Core\Config\ConfigEntityValidationTestBase;

/**
 * Tests validation of editor entities.
 *
 * @group editor
 */
class EditorValidationTest extends ConfigEntityValidationTestBase {

  /**
   * {@inheritdoc}
   */
  protected static $modules = ['editor', 'editor_test', 'filter'];

  /**
   * {@inheritdoc}
   */
  protected function setUp(): void {
    parent::setUp();

    $format = FilterFormat::create([
      'format' => 'test',
      'name' => 'Test',
    ]);
    $format->save();

    $this->entity = Editor::create([
      'format' => $format->id(),
      'editor' => 'unicorn',
    ]);
    $this->entity->save();
  }

  /**
   * Tests that validation fails if config dependencies are invalid.
   */
  public function testInvalidDependencies(): void {
    // Remove the config dependencies from the editor entity.
    $dependencies = $this->entity->getDependencies();
    $dependencies['config'] = [];
    $this->entity->set('dependencies', $dependencies);

    $this->assertValidationErrors(['' => 'This text editor requires a text format.']);

    // Things look sort-of like `filter.format.*` should fail validation
    // because they don't exist.
    $dependencies['config'] = [
      'filter.format',
      'filter.format.',
    ];
    $this->entity->set('dependencies', $dependencies);
    $this->assertValidationErrors([
      '' => 'This text editor requires a text format.',
      'dependencies.config.0' => "The 'filter.format' config does not exist.",
      'dependencies.config.1' => "The 'filter.format.' config does not exist.",
    ]);
  }

  /**
   * Tests validating an editor with an unknown plugin ID.
   */
  public function testInvalidPluginId(): void {
    $this->entity->setEditor('non_existent');
    $this->assertValidationErrors(['editor' => "The 'non_existent' plugin does not exist."]);
  }

  /**
   * {@inheritdoc}
   */
  public function testLabelValidation(): void {
    // @todo Remove this override in https://www.drupal.org/i/3231354. The label of Editor entities is dynamically computed: it's retrieved from the associated FilterFormat entity. That issue will change this.
    // @see \Drupal\editor\Entity\Editor::label()
    $this->markTestSkipped();
  }

  /**
   * {@inheritdoc}
   */
  public function testRequiredPropertyValuesMissing(?array $additional_expected_validation_errors_when_missing = NULL): void {
    parent::testRequiredPropertyValuesMissing([
      'dependencies' => [
        // @see ::testInvalidDependencies()
        // @see \Drupal\Core\Config\Plugin\Validation\Constraint\RequiredConfigDependenciesConstraintValidator
        '' => 'This text editor requires a text format.',
      ],
    ]);
  }

  /**
   * {@inheritdoc}
   */
  public function testRequiredPropertyKeysMissing(?array $additional_expected_validation_errors_when_missing = NULL): void {
    parent::testRequiredPropertyKeysMissing([
      'dependencies' => [
        // @see ::testInvalidDependencies()
        // @see \Drupal\Core\Config\Plugin\Validation\Constraint\RequiredConfigDependenciesConstraintValidator
        '' => 'This text editor requires a text format.',
      ],
    ]);
  }

}
