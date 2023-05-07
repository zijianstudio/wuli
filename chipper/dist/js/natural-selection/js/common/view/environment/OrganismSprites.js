// Copyright 2020-2022, University of Colorado Boulder

/**
 * OrganismSprites displays all Organism model elements (bunnies, wolves, shrubs) that appear in the environment.
 * It uses scenery's high-performance Sprites feature, which uses renderer:'webgl', with a fallback of 'canvas'.
 *
 * Understanding this implementation requires an understanding of the scenery Sprites API. In a nutshell:
 * Sprites has an array of Sprite and an array of SpriteInstance. The array of Sprite is the complete unique set
 * of images used to render all SpriteInstances. Each SpriteInstance has a reference to a Sprite (which determines
 * what it looks like) and a Matrix3 (which determines how it's transformed). After updating the array of SpriteInstance
 * (as bunnies and wolves are created and die) and adjusting each Matrix3 (as bunnies and wolves move around),
 * calling invalidatePaint() redraws the Sprites.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import optionize from '../../../../../phet-core/js/optionize.js';
import { PressListener, Sprite, SpriteListenable, Sprites } from '../../../../../scenery/js/imports.js';
import bunnyWhiteFurStraightEarsShortTeeth_png from '../../../../images/bunnyWhiteFurStraightEarsShortTeeth_png.js';
import wolf_png from '../../../../images/wolf_png.js';
import naturalSelection from '../../../naturalSelection.js';
import NaturalSelectionQueryParameters from '../../NaturalSelectionQueryParameters.js';
import BunnySelectionRectangleSprite from './BunnySelectionRectangleSprite.js';
import BunnySelectionRectangleSpriteInstance from './BunnySelectionRectangleSpriteInstance.js';
import BunnySpriteInstance from './BunnySpriteInstance.js';
import OrganismSpriteImage from './OrganismSpriteImage.js';
import ShrubSpriteInstance from './ShrubSpriteInstance.js';
import WolfSpriteInstance from './WolfSpriteInstance.js';
import ShrubSprites from './ShrubSprites.js';
export default class OrganismSprites extends Sprites {
  // reference to the sprite instance for the selected bunny, null if no selection

  // the selection rectangle, recreated for each selected bunny

  // Sprites for all bunny phenotypes

  constructor(bunnyCollection, bunnyImageMap, wolfCollection, food, isPlayingProperty, canvasBounds, providedOptions) {
    const options = optionize()({
      // SpritesOptions
      canvasBounds: canvasBounds,
      hitTestSprites: true,
      cursor: 'pointer',
      phetioDocumentation: 'bunnies, wolves, and shrubs that appear in the environment',
      phetioVisiblePropertyInstrumented: false,
      phetioInputEnabledPropertyInstrumented: true
    }, providedOptions);

    // Sprites for all categories of shrubs
    const shrubSprites = new ShrubSprites();

    // The sprite that is used for all wolves
    const wolfSprite = new Sprite(new OrganismSpriteImage(wolf_png));

    // Sprite for the bunny selection rectangle, sized to fit the largest bunny image
    const selectionRectangleSprite = new BunnySelectionRectangleSprite(bunnyWhiteFurStraightEarsShortTeeth_png);

    // the complete set of sprites
    options.sprites = [wolfSprite, selectionRectangleSprite];
    options.sprites.push(...bunnyImageMap.getSprites());
    options.sprites.push(...shrubSprites.getSprites());

    // {ShrubSpriteInstance[]} sprite instances for shrubs
    const shrubSpriteInstances = _.map(food.shrubs, shrub => new ShrubSpriteInstance(shrub, food.isToughProperty.value, shrubSprites.getNextTenderSprite(), shrubSprites.getNextToughSprite()));
    const spriteInstances = [...shrubSpriteInstances];

    // all sprite instances to be rendered, must be modified in place because super has a reference
    options.spriteInstances = spriteInstances;
    super(options);
    this.selectedBunnySpriteInstance = null;
    this.selectionRectangleSpriteInstance = null;

    // references to constructor arguments and local variables needed by methods
    this.bunnyCollection = bunnyCollection;
    this.bunnyImageMap = bunnyImageMap;
    this.wolfCollection = wolfCollection;
    this.isPlayingProperty = isPlayingProperty;
    this.selectionRectangleSprite = selectionRectangleSprite;
    this.shrubSpriteInstances = shrubSpriteInstances;
    this.spriteInstances = spriteInstances;

    // Create a sprite instance for each bunny in the initial population.
    bunnyCollection.liveBunnies.forEach(bunny => this.createBunnySpriteInstance(bunny));

    // Create a sprite instance for each bunny this is created. removeItemAddedListener is not necessary.
    bunnyCollection.liveBunnies.addItemAddedListener(bunny => this.createBunnySpriteInstance(bunny));

    // Create a sprite instance for each wolf that is created. removeListener is not necessary.
    wolfCollection.wolfCreatedEmitter.addListener(wolf => this.createWolfSpriteInstance(wolf, wolfSprite));

    // Show sprites for tender vs tough food. unlink is not necessary.
    food.isToughProperty.link(isTough => this.setToughFood(isTough));

    // Show sprites for limited vs plentiful food. unlink is not necessary.
    food.isLimitedProperty.link(isLimited => this.setLimitedFood(isLimited));

    // Put a selection rectangle around the selected bunny. unlink is not necessary.
    bunnyCollection.selectedBunnyProperty.link(bunny => this.setSelectedBunny(bunny));

    // PressListener for selecting a bunny. removeInputListener is not necessary.
    this.addInputListener(new BunnyPressListener(this.bunnyCollection, options.tandem.createTandem('bunnyPressListener')));

    // If inputEnabled is disabled, clear any bunny selection. unlink is not needed.
    this.inputEnabledProperty.link(inputEnabled => {
      if (!inputEnabled) {
        this.bunnyCollection.selectedBunnyProperty.value = null;
      }
    });
    this.update();
  }

  /**
   * Puts the sprite instances in the correct order (back-to-front), and then repaints.
   * If your change does not involve z position (rendering order), skip sort by calling invalidatePaint directly.
   */
  update() {
    // Sort sprite instances in back-to-front rendering order.
    this.sort();

    // Repaint.
    this.invalidatePaint();
  }

  /**
   * Creates a sprite instance for a bunny, and the scaffolding to remove it when the bunny dies or is disposed.
   */
  createBunnySpriteInstance(bunny) {
    assert && assert(bunny.isAlive, 'expected a live bunny');

    // Create a SpriteInstance for the bunny.
    const bunnySpriteInstance = new BunnySpriteInstance(bunny, this.bunnyImageMap.getSprite(bunny));
    this.spriteInstances.push(bunnySpriteInstance);
    if (!this.isPlayingProperty.value) {
      this.update();
    }

    // If the bunny dies or is disposed, remove it from the view.
    const bunnyDiedOrDisposedListener = () => {
      // If this was the selected bunny, clear the selection.
      if (this.bunnyCollection.selectedBunnyProperty.value === bunny) {
        this.clearSelectedBunny();
      }

      // Dispose of the associated sprite instance
      const bunnySpriteInstanceIndex = this.spriteInstances.indexOf(bunnySpriteInstance);
      assert && assert(bunnySpriteInstanceIndex !== -1, 'bunnySpriteInstance missing from spriteInstances');
      this.spriteInstances.splice(bunnySpriteInstanceIndex, 1);
      if (!this.isPlayingProperty.value) {
        this.invalidatePaint();
      }
      bunnySpriteInstance.dispose();

      // Remove this listener
      bunny.diedEmitter.removeListener(bunnyDiedOrDisposedListener);
      bunny.disposedEmitter.removeListener(bunnyDiedOrDisposedListener);
    };
    bunny.diedEmitter.addListener(bunnyDiedOrDisposedListener); // removeListener is performed by callback
    bunny.disposedEmitter.addListener(bunnyDiedOrDisposedListener); // removeListener is performed by callback

    // PhET-iO state engine may restore bunnyCollection.selectedBunnyProperty before firing
    // bunnyCollection.liveBunnies.addItemAddedListener, the callback that creates BunnySpriteInstances.
    // If that happens, then createBunnySpriteInstance is responsible for calling setSelectedBunny.
    // See https://github.com/phetsims/natural-selection/issues/138
    if (phet.joist.sim.isSettingPhetioStateProperty.value && this.bunnyCollection.selectedBunnyProperty.value === bunny) {
      this.setSelectedBunny(bunny);
    }
  }

  /**
   * Creates a sprite instance for a bunny, and the scaffolding to remove it when the wolf is disposed.
   */
  createWolfSpriteInstance(wolf, wolfSprite) {
    // Create a SpriteInstance for the wolf.
    const wolfSpriteInstance = new WolfSpriteInstance(wolf, wolfSprite);
    this.spriteInstances.push(wolfSpriteInstance);
    if (!this.isPlayingProperty.value) {
      this.update();
    }

    // When the wolf is disposed, remove it from the view.
    const wolfDisposedListener = () => {
      // Dispose of the associated sprite instance
      const wolfSpriteInstanceIndex = this.spriteInstances.indexOf(wolfSpriteInstance);
      assert && assert(wolfSpriteInstanceIndex !== -1, 'wolfSpriteInstanceIndex missing from spriteInstances');
      this.spriteInstances.splice(wolfSpriteInstanceIndex, 1);
      if (!this.isPlayingProperty.value) {
        this.invalidatePaint();
      }
      wolfSpriteInstance.dispose();

      // Remove this listener
      wolf.disposedEmitter.removeListener(wolfDisposedListener);
    };
    wolf.disposedEmitter.addListener(wolfDisposedListener); // removeListener is performed by callback
  }

  /**
   * Sets food to be tough or tender.
   * @param isTough - true=tough, false=tender
   */
  setToughFood(isTough) {
    this.shrubSpriteInstances.forEach(shrubSpriteInstance => {
      shrubSpriteInstance.setTough(isTough);
    });

    // There was no change to spriteInstances, so no need to call update, invalidatePaint suffices.
    this.invalidatePaint();
  }

  /**
   * Sets food to be limited or plentiful.
   * @param isLimited - true=limited, false=plentiful
   */
  setLimitedFood(isLimited) {
    // Start by removing all shrubs.
    this.shrubSpriteInstances.forEach(shrubSpriteInstance => {
      const index = this.spriteInstances.indexOf(shrubSpriteInstance);
      if (index !== -1) {
        this.spriteInstances.splice(index, 1);
      }
    });
    if (isLimited) {
      // Food is limited, show some of the shrubs.
      for (let i = 0; i < NaturalSelectionQueryParameters.shrubsRange.min; i++) {
        this.spriteInstances.push(this.shrubSpriteInstances[i]);
      }
    } else {
      // Food is abundant, show all shrubs.
      this.shrubSpriteInstances.forEach(shrubSpriteInstance => {
        this.spriteInstances.push(shrubSpriteInstance);
      });
    }
    this.update();
  }

  /**
   * Configures a sprite instance and the selection rectangle to correspond to a selected bunny.
   */
  setSelectedBunny(bunny) {
    // Clear any previous selection.
    this.clearSelectedBunny();

    // This view only displays live bunnies, and selectedBunnyProperty may contain a dead bunny, for display in the
    // Pedigree graph.  So only if there's a live bunny selected...
    if (bunny && bunny.isAlive) {
      // Get the BunnySpriteInstance that is associated with the selected bunny.
      const selectedBunnyIndex = this.getBunnySpriteInstanceIndex(bunny);
      if (phet.joist.sim.isSettingPhetioStateProperty.value && selectedBunnyIndex === -1) {

        // PhET-iO state engine may restore bunnyCollection.selectedBunnyProperty before firing
        // bunnyCollection.liveBunnies.addItemAddedListener, the callback that creates BunnySpriteInstances.
        // If that happens, then rely on createBunnySpriteInstance to call setSelectedBunny.
        // See https://github.com/phetsims/natural-selection/issues/138
      } else {
        assert && assert(selectedBunnyIndex !== -1, 'sprite instance not found for selected bunny');
        this.selectedBunnySpriteInstance = this.spriteInstances[selectedBunnyIndex];
        assert && assert(this.selectedBunnySpriteInstance instanceof BunnySpriteInstance, 'invalid selectedBunnySpriteInstance');

        // Create the selection rectangle and put it immediately behind the selected bunny.
        this.selectionRectangleSpriteInstance = new BunnySelectionRectangleSpriteInstance(bunny, this.selectionRectangleSprite);
        this.spriteInstances.splice(selectedBunnyIndex, 0, this.selectionRectangleSpriteInstance);
        if (!this.isPlayingProperty.value) {
          this.update();
        }
      }
    }
  }

  /**
   * Gets the index of the BunnySpriteInstance that is associated with a specific bunny.
   * Returns -1 if not found.
   */
  getBunnySpriteInstanceIndex(bunny) {
    // Performance: For a maximum population, this brute-force approach takes < 1ms on a 2019 MacBook Pro.
    let selectedBunnyIndex = -1;
    for (let i = 0; i < this.spriteInstances.length && selectedBunnyIndex === -1; i++) {
      const spriteInstance = this.spriteInstances[i];
      if (spriteInstance instanceof BunnySpriteInstance && spriteInstance.organism === bunny) {
        selectedBunnyIndex = i;
      }
    }
    return selectedBunnyIndex;
  }

  /**
   * Clears the sprites for the bunny selection, if there is one.
   */
  clearSelectedBunny() {
    if (this.selectedBunnySpriteInstance) {
      // clear the selected bunny
      this.selectedBunnySpriteInstance = null;

      // clear the selection rectangle
      const selectionRectangleSpriteInstance = this.selectionRectangleSpriteInstance;
      assert && assert(selectionRectangleSpriteInstance, 'expected selectionRectangleSpriteInstance to be set');
      const selectionRectangleIndex = this.spriteInstances.indexOf(selectionRectangleSpriteInstance);
      assert && assert(selectionRectangleIndex !== -1, 'selectionRectangleSpriteInstance is missing from spriteInstances');
      this.spriteInstances.splice(selectionRectangleIndex, 1);
      if (!this.isPlayingProperty.value) {
        this.invalidatePaint();
      }
      selectionRectangleSpriteInstance.dispose();
      this.selectionRectangleSpriteInstance = null;
    }
    assert && assert(this.selectedBunnySpriteInstance === null, 'selectedBunnySpriteInstance should be null');
    assert && assert(this.selectionRectangleSpriteInstance === null, 'selectionRectangleSpriteInstance should be null');
  }

  /**
   * Sorts the sprite instances in back-to-front rendering order. Instances are first sorted by z coordinate of their
   * associated organism, from back to front, where +z is away from the camera. If there is a selected bunny and
   * the sim is paused, the bunny and its selection rectangle are moved to the front.
   */
  sort() {
    // Sort by descending z coordinate. Sorting is done in place, because super has a reference to this.spriteInstances.
    // Performance: For a maximum population, this takes < 1ms on a 2019 MacBook Pro.
    this.spriteInstances.sort((spriteInstance1, spriteInstance2) => {
      const z1 = spriteInstance1.organism.positionProperty.value.z;
      const z2 = spriteInstance2.organism.positionProperty.value.z;
      return Math.sign(z2 - z1);
    });

    // If a selected bunny is visible and the sim is paused, move the bunny and selection rectangle to the front.
    if (this.selectedBunnySpriteInstance && !this.isPlayingProperty.value) {
      assert && assert(this.bunnyCollection.selectedBunnyProperty.value, 'selectedBunnySpriteInstance should not exist when there is no selected bunny');
      assert && assert(this.selectionRectangleSpriteInstance, 'expected selectionRectangleSpriteInstance to be set');

      // Remove the selected bunny
      const selectedBunnyIndex = this.spriteInstances.indexOf(this.selectedBunnySpriteInstance);
      assert && assert(selectedBunnyIndex !== -1, 'selectedBunnySpriteInstance missing from spriteInstances');
      this.spriteInstances.splice(selectedBunnyIndex, 1);

      // Remove the selection rectangle
      const selectionRectangleIndex = this.spriteInstances.indexOf(this.selectionRectangleSpriteInstance);
      assert && assert(selectionRectangleIndex !== -1, 'selectionRectangleSpriteInstance missing from spriteInstances');
      this.spriteInstances.splice(selectionRectangleIndex, 1);

      // Append the selected bunny and the selection rectangle to the front.
      this.spriteInstances.push(this.selectionRectangleSpriteInstance); // rectangle behind bunny
      this.spriteInstances.push(this.selectedBunnySpriteInstance);
      this.invalidatePaint();
    }
  }
}

/**
 * PressListener for selecting a bunny. Add trait SpriteListenable, so we have access to the pressed SpriteInstance.
 */
class BunnyPressListener extends SpriteListenable(PressListener) {
  constructor(bunnyCollection, tandem) {
    super({
      press: () => {
        if (this.spriteInstance instanceof BunnySpriteInstance) {
          bunnyCollection.selectedBunnyProperty.value = this.spriteInstance.bunny;
        }
      },
      tandem: tandem
    });
  }
}
naturalSelection.register('OrganismSprites', OrganismSprites);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJvcHRpb25pemUiLCJQcmVzc0xpc3RlbmVyIiwiU3ByaXRlIiwiU3ByaXRlTGlzdGVuYWJsZSIsIlNwcml0ZXMiLCJidW5ueVdoaXRlRnVyU3RyYWlnaHRFYXJzU2hvcnRUZWV0aF9wbmciLCJ3b2xmX3BuZyIsIm5hdHVyYWxTZWxlY3Rpb24iLCJOYXR1cmFsU2VsZWN0aW9uUXVlcnlQYXJhbWV0ZXJzIiwiQnVubnlTZWxlY3Rpb25SZWN0YW5nbGVTcHJpdGUiLCJCdW5ueVNlbGVjdGlvblJlY3RhbmdsZVNwcml0ZUluc3RhbmNlIiwiQnVubnlTcHJpdGVJbnN0YW5jZSIsIk9yZ2FuaXNtU3ByaXRlSW1hZ2UiLCJTaHJ1YlNwcml0ZUluc3RhbmNlIiwiV29sZlNwcml0ZUluc3RhbmNlIiwiU2hydWJTcHJpdGVzIiwiT3JnYW5pc21TcHJpdGVzIiwiY29uc3RydWN0b3IiLCJidW5ueUNvbGxlY3Rpb24iLCJidW5ueUltYWdlTWFwIiwid29sZkNvbGxlY3Rpb24iLCJmb29kIiwiaXNQbGF5aW5nUHJvcGVydHkiLCJjYW52YXNCb3VuZHMiLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwiaGl0VGVzdFNwcml0ZXMiLCJjdXJzb3IiLCJwaGV0aW9Eb2N1bWVudGF0aW9uIiwicGhldGlvVmlzaWJsZVByb3BlcnR5SW5zdHJ1bWVudGVkIiwicGhldGlvSW5wdXRFbmFibGVkUHJvcGVydHlJbnN0cnVtZW50ZWQiLCJzaHJ1YlNwcml0ZXMiLCJ3b2xmU3ByaXRlIiwic2VsZWN0aW9uUmVjdGFuZ2xlU3ByaXRlIiwic3ByaXRlcyIsInB1c2giLCJnZXRTcHJpdGVzIiwic2hydWJTcHJpdGVJbnN0YW5jZXMiLCJfIiwibWFwIiwic2hydWJzIiwic2hydWIiLCJpc1RvdWdoUHJvcGVydHkiLCJ2YWx1ZSIsImdldE5leHRUZW5kZXJTcHJpdGUiLCJnZXROZXh0VG91Z2hTcHJpdGUiLCJzcHJpdGVJbnN0YW5jZXMiLCJzZWxlY3RlZEJ1bm55U3ByaXRlSW5zdGFuY2UiLCJzZWxlY3Rpb25SZWN0YW5nbGVTcHJpdGVJbnN0YW5jZSIsImxpdmVCdW5uaWVzIiwiZm9yRWFjaCIsImJ1bm55IiwiY3JlYXRlQnVubnlTcHJpdGVJbnN0YW5jZSIsImFkZEl0ZW1BZGRlZExpc3RlbmVyIiwid29sZkNyZWF0ZWRFbWl0dGVyIiwiYWRkTGlzdGVuZXIiLCJ3b2xmIiwiY3JlYXRlV29sZlNwcml0ZUluc3RhbmNlIiwibGluayIsImlzVG91Z2giLCJzZXRUb3VnaEZvb2QiLCJpc0xpbWl0ZWRQcm9wZXJ0eSIsImlzTGltaXRlZCIsInNldExpbWl0ZWRGb29kIiwic2VsZWN0ZWRCdW5ueVByb3BlcnR5Iiwic2V0U2VsZWN0ZWRCdW5ueSIsImFkZElucHV0TGlzdGVuZXIiLCJCdW5ueVByZXNzTGlzdGVuZXIiLCJ0YW5kZW0iLCJjcmVhdGVUYW5kZW0iLCJpbnB1dEVuYWJsZWRQcm9wZXJ0eSIsImlucHV0RW5hYmxlZCIsInVwZGF0ZSIsInNvcnQiLCJpbnZhbGlkYXRlUGFpbnQiLCJhc3NlcnQiLCJpc0FsaXZlIiwiYnVubnlTcHJpdGVJbnN0YW5jZSIsImdldFNwcml0ZSIsImJ1bm55RGllZE9yRGlzcG9zZWRMaXN0ZW5lciIsImNsZWFyU2VsZWN0ZWRCdW5ueSIsImJ1bm55U3ByaXRlSW5zdGFuY2VJbmRleCIsImluZGV4T2YiLCJzcGxpY2UiLCJkaXNwb3NlIiwiZGllZEVtaXR0ZXIiLCJyZW1vdmVMaXN0ZW5lciIsImRpc3Bvc2VkRW1pdHRlciIsInBoZXQiLCJqb2lzdCIsInNpbSIsImlzU2V0dGluZ1BoZXRpb1N0YXRlUHJvcGVydHkiLCJ3b2xmU3ByaXRlSW5zdGFuY2UiLCJ3b2xmRGlzcG9zZWRMaXN0ZW5lciIsIndvbGZTcHJpdGVJbnN0YW5jZUluZGV4Iiwic2hydWJTcHJpdGVJbnN0YW5jZSIsInNldFRvdWdoIiwiaW5kZXgiLCJpIiwic2hydWJzUmFuZ2UiLCJtaW4iLCJzZWxlY3RlZEJ1bm55SW5kZXgiLCJnZXRCdW5ueVNwcml0ZUluc3RhbmNlSW5kZXgiLCJsZW5ndGgiLCJzcHJpdGVJbnN0YW5jZSIsIm9yZ2FuaXNtIiwic2VsZWN0aW9uUmVjdGFuZ2xlSW5kZXgiLCJzcHJpdGVJbnN0YW5jZTEiLCJzcHJpdGVJbnN0YW5jZTIiLCJ6MSIsInBvc2l0aW9uUHJvcGVydHkiLCJ6IiwiejIiLCJNYXRoIiwic2lnbiIsInByZXNzIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJPcmdhbmlzbVNwcml0ZXMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjAtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogT3JnYW5pc21TcHJpdGVzIGRpc3BsYXlzIGFsbCBPcmdhbmlzbSBtb2RlbCBlbGVtZW50cyAoYnVubmllcywgd29sdmVzLCBzaHJ1YnMpIHRoYXQgYXBwZWFyIGluIHRoZSBlbnZpcm9ubWVudC5cclxuICogSXQgdXNlcyBzY2VuZXJ5J3MgaGlnaC1wZXJmb3JtYW5jZSBTcHJpdGVzIGZlYXR1cmUsIHdoaWNoIHVzZXMgcmVuZGVyZXI6J3dlYmdsJywgd2l0aCBhIGZhbGxiYWNrIG9mICdjYW52YXMnLlxyXG4gKlxyXG4gKiBVbmRlcnN0YW5kaW5nIHRoaXMgaW1wbGVtZW50YXRpb24gcmVxdWlyZXMgYW4gdW5kZXJzdGFuZGluZyBvZiB0aGUgc2NlbmVyeSBTcHJpdGVzIEFQSS4gSW4gYSBudXRzaGVsbDpcclxuICogU3ByaXRlcyBoYXMgYW4gYXJyYXkgb2YgU3ByaXRlIGFuZCBhbiBhcnJheSBvZiBTcHJpdGVJbnN0YW5jZS4gVGhlIGFycmF5IG9mIFNwcml0ZSBpcyB0aGUgY29tcGxldGUgdW5pcXVlIHNldFxyXG4gKiBvZiBpbWFnZXMgdXNlZCB0byByZW5kZXIgYWxsIFNwcml0ZUluc3RhbmNlcy4gRWFjaCBTcHJpdGVJbnN0YW5jZSBoYXMgYSByZWZlcmVuY2UgdG8gYSBTcHJpdGUgKHdoaWNoIGRldGVybWluZXNcclxuICogd2hhdCBpdCBsb29rcyBsaWtlKSBhbmQgYSBNYXRyaXgzICh3aGljaCBkZXRlcm1pbmVzIGhvdyBpdCdzIHRyYW5zZm9ybWVkKS4gQWZ0ZXIgdXBkYXRpbmcgdGhlIGFycmF5IG9mIFNwcml0ZUluc3RhbmNlXHJcbiAqIChhcyBidW5uaWVzIGFuZCB3b2x2ZXMgYXJlIGNyZWF0ZWQgYW5kIGRpZSkgYW5kIGFkanVzdGluZyBlYWNoIE1hdHJpeDMgKGFzIGJ1bm5pZXMgYW5kIHdvbHZlcyBtb3ZlIGFyb3VuZCksXHJcbiAqIGNhbGxpbmcgaW52YWxpZGF0ZVBhaW50KCkgcmVkcmF3cyB0aGUgU3ByaXRlcy5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgVFJlYWRPbmx5UHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vLi4vYXhvbi9qcy9UUmVhZE9ubHlQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBCb3VuZHMyIGZyb20gJy4uLy4uLy4uLy4uLy4uL2RvdC9qcy9Cb3VuZHMyLmpzJztcclxuaW1wb3J0IG9wdGlvbml6ZSwgeyBFbXB0eVNlbGZPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCBQaWNrUmVxdWlyZWQgZnJvbSAnLi4vLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1BpY2tSZXF1aXJlZC5qcyc7XHJcbmltcG9ydCB7IFByZXNzTGlzdGVuZXIsIFNwcml0ZSwgU3ByaXRlTGlzdGVuYWJsZSwgU3ByaXRlcywgU3ByaXRlc09wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uLy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xyXG5pbXBvcnQgYnVubnlXaGl0ZUZ1clN0cmFpZ2h0RWFyc1Nob3J0VGVldGhfcG5nIGZyb20gJy4uLy4uLy4uLy4uL2ltYWdlcy9idW5ueVdoaXRlRnVyU3RyYWlnaHRFYXJzU2hvcnRUZWV0aF9wbmcuanMnO1xyXG5pbXBvcnQgd29sZl9wbmcgZnJvbSAnLi4vLi4vLi4vLi4vaW1hZ2VzL3dvbGZfcG5nLmpzJztcclxuaW1wb3J0IG5hdHVyYWxTZWxlY3Rpb24gZnJvbSAnLi4vLi4vLi4vbmF0dXJhbFNlbGVjdGlvbi5qcyc7XHJcbmltcG9ydCBCdW5ueSBmcm9tICcuLi8uLi9tb2RlbC9CdW5ueS5qcyc7XHJcbmltcG9ydCBCdW5ueUNvbGxlY3Rpb24gZnJvbSAnLi4vLi4vbW9kZWwvQnVubnlDb2xsZWN0aW9uLmpzJztcclxuaW1wb3J0IEZvb2QgZnJvbSAnLi4vLi4vbW9kZWwvRm9vZC5qcyc7XHJcbmltcG9ydCBXb2xmIGZyb20gJy4uLy4uL21vZGVsL1dvbGYuanMnO1xyXG5pbXBvcnQgV29sZkNvbGxlY3Rpb24gZnJvbSAnLi4vLi4vbW9kZWwvV29sZkNvbGxlY3Rpb24uanMnO1xyXG5pbXBvcnQgTmF0dXJhbFNlbGVjdGlvblF1ZXJ5UGFyYW1ldGVycyBmcm9tICcuLi8uLi9OYXR1cmFsU2VsZWN0aW9uUXVlcnlQYXJhbWV0ZXJzLmpzJztcclxuaW1wb3J0IEJ1bm55SW1hZ2VNYXAgZnJvbSAnLi4vQnVubnlJbWFnZU1hcC5qcyc7XHJcbmltcG9ydCBCdW5ueVNlbGVjdGlvblJlY3RhbmdsZVNwcml0ZSBmcm9tICcuL0J1bm55U2VsZWN0aW9uUmVjdGFuZ2xlU3ByaXRlLmpzJztcclxuaW1wb3J0IEJ1bm55U2VsZWN0aW9uUmVjdGFuZ2xlU3ByaXRlSW5zdGFuY2UgZnJvbSAnLi9CdW5ueVNlbGVjdGlvblJlY3RhbmdsZVNwcml0ZUluc3RhbmNlLmpzJztcclxuaW1wb3J0IEJ1bm55U3ByaXRlSW5zdGFuY2UgZnJvbSAnLi9CdW5ueVNwcml0ZUluc3RhbmNlLmpzJztcclxuaW1wb3J0IE9yZ2FuaXNtU3ByaXRlSW1hZ2UgZnJvbSAnLi9PcmdhbmlzbVNwcml0ZUltYWdlLmpzJztcclxuaW1wb3J0IFNocnViU3ByaXRlSW5zdGFuY2UgZnJvbSAnLi9TaHJ1YlNwcml0ZUluc3RhbmNlLmpzJztcclxuaW1wb3J0IFdvbGZTcHJpdGVJbnN0YW5jZSBmcm9tICcuL1dvbGZTcHJpdGVJbnN0YW5jZS5qcyc7XHJcbmltcG9ydCBPcmdhbmlzbVNwcml0ZUluc3RhbmNlIGZyb20gJy4vT3JnYW5pc21TcHJpdGVJbnN0YW5jZS5qcyc7XHJcbmltcG9ydCBTaHJ1YlNwcml0ZXMgZnJvbSAnLi9TaHJ1YlNwcml0ZXMuanMnO1xyXG5cclxudHlwZSBTZWxmT3B0aW9ucyA9IEVtcHR5U2VsZk9wdGlvbnM7XHJcblxyXG50eXBlIE9yZ2FuaXNtU3ByaXRlc09wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIFBpY2tSZXF1aXJlZDxTcHJpdGVzT3B0aW9ucywgJ3RhbmRlbSc+O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgT3JnYW5pc21TcHJpdGVzIGV4dGVuZHMgU3ByaXRlcyB7XHJcblxyXG4gIC8vIHJlZmVyZW5jZSB0byB0aGUgc3ByaXRlIGluc3RhbmNlIGZvciB0aGUgc2VsZWN0ZWQgYnVubnksIG51bGwgaWYgbm8gc2VsZWN0aW9uXHJcbiAgcHJpdmF0ZSBzZWxlY3RlZEJ1bm55U3ByaXRlSW5zdGFuY2U6IEJ1bm55U3ByaXRlSW5zdGFuY2UgfCBudWxsO1xyXG5cclxuICAvLyB0aGUgc2VsZWN0aW9uIHJlY3RhbmdsZSwgcmVjcmVhdGVkIGZvciBlYWNoIHNlbGVjdGVkIGJ1bm55XHJcbiAgcHJpdmF0ZSBzZWxlY3Rpb25SZWN0YW5nbGVTcHJpdGVJbnN0YW5jZTogQnVubnlTZWxlY3Rpb25SZWN0YW5nbGVTcHJpdGVJbnN0YW5jZSB8IG51bGw7XHJcblxyXG4gIHByaXZhdGUgcmVhZG9ubHkgYnVubnlDb2xsZWN0aW9uOiBCdW5ueUNvbGxlY3Rpb247XHJcbiAgcHJpdmF0ZSByZWFkb25seSBidW5ueUltYWdlTWFwOiBCdW5ueUltYWdlTWFwOyAvLyBTcHJpdGVzIGZvciBhbGwgYnVubnkgcGhlbm90eXBlc1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgd29sZkNvbGxlY3Rpb246IFdvbGZDb2xsZWN0aW9uO1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgaXNQbGF5aW5nUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PGJvb2xlYW4+O1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgc2VsZWN0aW9uUmVjdGFuZ2xlU3ByaXRlOiBCdW5ueVNlbGVjdGlvblJlY3RhbmdsZVNwcml0ZTtcclxuICBwcml2YXRlIHJlYWRvbmx5IHNocnViU3ByaXRlSW5zdGFuY2VzOiBTaHJ1YlNwcml0ZUluc3RhbmNlW107XHJcbiAgcHJpdmF0ZSByZWFkb25seSBzcHJpdGVJbnN0YW5jZXM6IE9yZ2FuaXNtU3ByaXRlSW5zdGFuY2VbXTtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBidW5ueUNvbGxlY3Rpb246IEJ1bm55Q29sbGVjdGlvbiwgYnVubnlJbWFnZU1hcDogQnVubnlJbWFnZU1hcCwgd29sZkNvbGxlY3Rpb246IFdvbGZDb2xsZWN0aW9uLFxyXG4gICAgICAgICAgICAgICAgICAgICAgZm9vZDogRm9vZCwgaXNQbGF5aW5nUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PGJvb2xlYW4+LCBjYW52YXNCb3VuZHM6IEJvdW5kczIsXHJcbiAgICAgICAgICAgICAgICAgICAgICBwcm92aWRlZE9wdGlvbnM6IE9yZ2FuaXNtU3ByaXRlc09wdGlvbnMgKSB7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxPcmdhbmlzbVNwcml0ZXNPcHRpb25zLCBTZWxmT3B0aW9ucywgU3ByaXRlc09wdGlvbnM+KCkoIHtcclxuXHJcbiAgICAgIC8vIFNwcml0ZXNPcHRpb25zXHJcbiAgICAgIGNhbnZhc0JvdW5kczogY2FudmFzQm91bmRzLFxyXG4gICAgICBoaXRUZXN0U3ByaXRlczogdHJ1ZSxcclxuICAgICAgY3Vyc29yOiAncG9pbnRlcicsXHJcbiAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICdidW5uaWVzLCB3b2x2ZXMsIGFuZCBzaHJ1YnMgdGhhdCBhcHBlYXIgaW4gdGhlIGVudmlyb25tZW50JyxcclxuICAgICAgcGhldGlvVmlzaWJsZVByb3BlcnR5SW5zdHJ1bWVudGVkOiBmYWxzZSxcclxuICAgICAgcGhldGlvSW5wdXRFbmFibGVkUHJvcGVydHlJbnN0cnVtZW50ZWQ6IHRydWVcclxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIC8vIFNwcml0ZXMgZm9yIGFsbCBjYXRlZ29yaWVzIG9mIHNocnVic1xyXG4gICAgY29uc3Qgc2hydWJTcHJpdGVzID0gbmV3IFNocnViU3ByaXRlcygpO1xyXG5cclxuICAgIC8vIFRoZSBzcHJpdGUgdGhhdCBpcyB1c2VkIGZvciBhbGwgd29sdmVzXHJcbiAgICBjb25zdCB3b2xmU3ByaXRlID0gbmV3IFNwcml0ZSggbmV3IE9yZ2FuaXNtU3ByaXRlSW1hZ2UoIHdvbGZfcG5nICkgKTtcclxuXHJcbiAgICAvLyBTcHJpdGUgZm9yIHRoZSBidW5ueSBzZWxlY3Rpb24gcmVjdGFuZ2xlLCBzaXplZCB0byBmaXQgdGhlIGxhcmdlc3QgYnVubnkgaW1hZ2VcclxuICAgIGNvbnN0IHNlbGVjdGlvblJlY3RhbmdsZVNwcml0ZSA9IG5ldyBCdW5ueVNlbGVjdGlvblJlY3RhbmdsZVNwcml0ZSggYnVubnlXaGl0ZUZ1clN0cmFpZ2h0RWFyc1Nob3J0VGVldGhfcG5nICk7XHJcblxyXG4gICAgLy8gdGhlIGNvbXBsZXRlIHNldCBvZiBzcHJpdGVzXHJcbiAgICBvcHRpb25zLnNwcml0ZXMgPSBbIHdvbGZTcHJpdGUsIHNlbGVjdGlvblJlY3RhbmdsZVNwcml0ZSBdO1xyXG4gICAgb3B0aW9ucy5zcHJpdGVzLnB1c2goIC4uLmJ1bm55SW1hZ2VNYXAuZ2V0U3ByaXRlcygpICk7XHJcbiAgICBvcHRpb25zLnNwcml0ZXMucHVzaCggLi4uc2hydWJTcHJpdGVzLmdldFNwcml0ZXMoKSApO1xyXG5cclxuICAgIC8vIHtTaHJ1YlNwcml0ZUluc3RhbmNlW119IHNwcml0ZSBpbnN0YW5jZXMgZm9yIHNocnVic1xyXG4gICAgY29uc3Qgc2hydWJTcHJpdGVJbnN0YW5jZXMgPSBfLm1hcCggZm9vZC5zaHJ1YnMsIHNocnViID0+XHJcbiAgICAgIG5ldyBTaHJ1YlNwcml0ZUluc3RhbmNlKCBzaHJ1YiwgZm9vZC5pc1RvdWdoUHJvcGVydHkudmFsdWUsXHJcbiAgICAgICAgc2hydWJTcHJpdGVzLmdldE5leHRUZW5kZXJTcHJpdGUoKSwgc2hydWJTcHJpdGVzLmdldE5leHRUb3VnaFNwcml0ZSgpIClcclxuICAgICk7XHJcblxyXG4gICAgY29uc3Qgc3ByaXRlSW5zdGFuY2VzOiBPcmdhbmlzbVNwcml0ZUluc3RhbmNlW10gPSBbIC4uLnNocnViU3ByaXRlSW5zdGFuY2VzIF07XHJcblxyXG4gICAgLy8gYWxsIHNwcml0ZSBpbnN0YW5jZXMgdG8gYmUgcmVuZGVyZWQsIG11c3QgYmUgbW9kaWZpZWQgaW4gcGxhY2UgYmVjYXVzZSBzdXBlciBoYXMgYSByZWZlcmVuY2VcclxuICAgIG9wdGlvbnMuc3ByaXRlSW5zdGFuY2VzID0gc3ByaXRlSW5zdGFuY2VzO1xyXG5cclxuICAgIHN1cGVyKCBvcHRpb25zICk7XHJcblxyXG4gICAgdGhpcy5zZWxlY3RlZEJ1bm55U3ByaXRlSW5zdGFuY2UgPSBudWxsO1xyXG4gICAgdGhpcy5zZWxlY3Rpb25SZWN0YW5nbGVTcHJpdGVJbnN0YW5jZSA9IG51bGw7XHJcblxyXG4gICAgLy8gcmVmZXJlbmNlcyB0byBjb25zdHJ1Y3RvciBhcmd1bWVudHMgYW5kIGxvY2FsIHZhcmlhYmxlcyBuZWVkZWQgYnkgbWV0aG9kc1xyXG4gICAgdGhpcy5idW5ueUNvbGxlY3Rpb24gPSBidW5ueUNvbGxlY3Rpb247XHJcbiAgICB0aGlzLmJ1bm55SW1hZ2VNYXAgPSBidW5ueUltYWdlTWFwO1xyXG4gICAgdGhpcy53b2xmQ29sbGVjdGlvbiA9IHdvbGZDb2xsZWN0aW9uO1xyXG4gICAgdGhpcy5pc1BsYXlpbmdQcm9wZXJ0eSA9IGlzUGxheWluZ1Byb3BlcnR5O1xyXG4gICAgdGhpcy5zZWxlY3Rpb25SZWN0YW5nbGVTcHJpdGUgPSBzZWxlY3Rpb25SZWN0YW5nbGVTcHJpdGU7XHJcbiAgICB0aGlzLnNocnViU3ByaXRlSW5zdGFuY2VzID0gc2hydWJTcHJpdGVJbnN0YW5jZXM7XHJcbiAgICB0aGlzLnNwcml0ZUluc3RhbmNlcyA9IHNwcml0ZUluc3RhbmNlcztcclxuXHJcbiAgICAvLyBDcmVhdGUgYSBzcHJpdGUgaW5zdGFuY2UgZm9yIGVhY2ggYnVubnkgaW4gdGhlIGluaXRpYWwgcG9wdWxhdGlvbi5cclxuICAgIGJ1bm55Q29sbGVjdGlvbi5saXZlQnVubmllcy5mb3JFYWNoKCAoIGJ1bm55OiBCdW5ueSApID0+IHRoaXMuY3JlYXRlQnVubnlTcHJpdGVJbnN0YW5jZSggYnVubnkgKSApO1xyXG5cclxuICAgIC8vIENyZWF0ZSBhIHNwcml0ZSBpbnN0YW5jZSBmb3IgZWFjaCBidW5ueSB0aGlzIGlzIGNyZWF0ZWQuIHJlbW92ZUl0ZW1BZGRlZExpc3RlbmVyIGlzIG5vdCBuZWNlc3NhcnkuXHJcbiAgICBidW5ueUNvbGxlY3Rpb24ubGl2ZUJ1bm5pZXMuYWRkSXRlbUFkZGVkTGlzdGVuZXIoICggYnVubnk6IEJ1bm55ICkgPT4gdGhpcy5jcmVhdGVCdW5ueVNwcml0ZUluc3RhbmNlKCBidW5ueSApICk7XHJcblxyXG4gICAgLy8gQ3JlYXRlIGEgc3ByaXRlIGluc3RhbmNlIGZvciBlYWNoIHdvbGYgdGhhdCBpcyBjcmVhdGVkLiByZW1vdmVMaXN0ZW5lciBpcyBub3QgbmVjZXNzYXJ5LlxyXG4gICAgd29sZkNvbGxlY3Rpb24ud29sZkNyZWF0ZWRFbWl0dGVyLmFkZExpc3RlbmVyKCB3b2xmID0+IHRoaXMuY3JlYXRlV29sZlNwcml0ZUluc3RhbmNlKCB3b2xmLCB3b2xmU3ByaXRlICkgKTtcclxuXHJcbiAgICAvLyBTaG93IHNwcml0ZXMgZm9yIHRlbmRlciB2cyB0b3VnaCBmb29kLiB1bmxpbmsgaXMgbm90IG5lY2Vzc2FyeS5cclxuICAgIGZvb2QuaXNUb3VnaFByb3BlcnR5LmxpbmsoIGlzVG91Z2ggPT4gdGhpcy5zZXRUb3VnaEZvb2QoIGlzVG91Z2ggKSApO1xyXG5cclxuICAgIC8vIFNob3cgc3ByaXRlcyBmb3IgbGltaXRlZCB2cyBwbGVudGlmdWwgZm9vZC4gdW5saW5rIGlzIG5vdCBuZWNlc3NhcnkuXHJcbiAgICBmb29kLmlzTGltaXRlZFByb3BlcnR5LmxpbmsoIGlzTGltaXRlZCA9PiB0aGlzLnNldExpbWl0ZWRGb29kKCBpc0xpbWl0ZWQgKSApO1xyXG5cclxuICAgIC8vIFB1dCBhIHNlbGVjdGlvbiByZWN0YW5nbGUgYXJvdW5kIHRoZSBzZWxlY3RlZCBidW5ueS4gdW5saW5rIGlzIG5vdCBuZWNlc3NhcnkuXHJcbiAgICBidW5ueUNvbGxlY3Rpb24uc2VsZWN0ZWRCdW5ueVByb3BlcnR5LmxpbmsoIGJ1bm55ID0+IHRoaXMuc2V0U2VsZWN0ZWRCdW5ueSggYnVubnkgKSApO1xyXG5cclxuICAgIC8vIFByZXNzTGlzdGVuZXIgZm9yIHNlbGVjdGluZyBhIGJ1bm55LiByZW1vdmVJbnB1dExpc3RlbmVyIGlzIG5vdCBuZWNlc3NhcnkuXHJcbiAgICB0aGlzLmFkZElucHV0TGlzdGVuZXIoIG5ldyBCdW5ueVByZXNzTGlzdGVuZXIoIHRoaXMuYnVubnlDb2xsZWN0aW9uLCBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdidW5ueVByZXNzTGlzdGVuZXInICkgKSApO1xyXG5cclxuICAgIC8vIElmIGlucHV0RW5hYmxlZCBpcyBkaXNhYmxlZCwgY2xlYXIgYW55IGJ1bm55IHNlbGVjdGlvbi4gdW5saW5rIGlzIG5vdCBuZWVkZWQuXHJcbiAgICB0aGlzLmlucHV0RW5hYmxlZFByb3BlcnR5LmxpbmsoIGlucHV0RW5hYmxlZCA9PiB7XHJcbiAgICAgIGlmICggIWlucHV0RW5hYmxlZCApIHtcclxuICAgICAgICB0aGlzLmJ1bm55Q29sbGVjdGlvbi5zZWxlY3RlZEJ1bm55UHJvcGVydHkudmFsdWUgPSBudWxsO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy51cGRhdGUoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFB1dHMgdGhlIHNwcml0ZSBpbnN0YW5jZXMgaW4gdGhlIGNvcnJlY3Qgb3JkZXIgKGJhY2stdG8tZnJvbnQpLCBhbmQgdGhlbiByZXBhaW50cy5cclxuICAgKiBJZiB5b3VyIGNoYW5nZSBkb2VzIG5vdCBpbnZvbHZlIHogcG9zaXRpb24gKHJlbmRlcmluZyBvcmRlciksIHNraXAgc29ydCBieSBjYWxsaW5nIGludmFsaWRhdGVQYWludCBkaXJlY3RseS5cclxuICAgKi9cclxuICBwdWJsaWMgdXBkYXRlKCk6IHZvaWQge1xyXG5cclxuICAgIC8vIFNvcnQgc3ByaXRlIGluc3RhbmNlcyBpbiBiYWNrLXRvLWZyb250IHJlbmRlcmluZyBvcmRlci5cclxuICAgIHRoaXMuc29ydCgpO1xyXG5cclxuICAgIC8vIFJlcGFpbnQuXHJcbiAgICB0aGlzLmludmFsaWRhdGVQYWludCgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ3JlYXRlcyBhIHNwcml0ZSBpbnN0YW5jZSBmb3IgYSBidW5ueSwgYW5kIHRoZSBzY2FmZm9sZGluZyB0byByZW1vdmUgaXQgd2hlbiB0aGUgYnVubnkgZGllcyBvciBpcyBkaXNwb3NlZC5cclxuICAgKi9cclxuICBwcml2YXRlIGNyZWF0ZUJ1bm55U3ByaXRlSW5zdGFuY2UoIGJ1bm55OiBCdW5ueSApOiB2b2lkIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGJ1bm55LmlzQWxpdmUsICdleHBlY3RlZCBhIGxpdmUgYnVubnknICk7XHJcblxyXG4gICAgLy8gQ3JlYXRlIGEgU3ByaXRlSW5zdGFuY2UgZm9yIHRoZSBidW5ueS5cclxuICAgIGNvbnN0IGJ1bm55U3ByaXRlSW5zdGFuY2UgPSBuZXcgQnVubnlTcHJpdGVJbnN0YW5jZSggYnVubnksIHRoaXMuYnVubnlJbWFnZU1hcC5nZXRTcHJpdGUoIGJ1bm55ICkgKTtcclxuICAgIHRoaXMuc3ByaXRlSW5zdGFuY2VzLnB1c2goIGJ1bm55U3ByaXRlSW5zdGFuY2UgKTtcclxuICAgIGlmICggIXRoaXMuaXNQbGF5aW5nUHJvcGVydHkudmFsdWUgKSB7XHJcbiAgICAgIHRoaXMudXBkYXRlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gSWYgdGhlIGJ1bm55IGRpZXMgb3IgaXMgZGlzcG9zZWQsIHJlbW92ZSBpdCBmcm9tIHRoZSB2aWV3LlxyXG4gICAgY29uc3QgYnVubnlEaWVkT3JEaXNwb3NlZExpc3RlbmVyID0gKCkgPT4ge1xyXG5cclxuICAgICAgLy8gSWYgdGhpcyB3YXMgdGhlIHNlbGVjdGVkIGJ1bm55LCBjbGVhciB0aGUgc2VsZWN0aW9uLlxyXG4gICAgICBpZiAoIHRoaXMuYnVubnlDb2xsZWN0aW9uLnNlbGVjdGVkQnVubnlQcm9wZXJ0eS52YWx1ZSA9PT0gYnVubnkgKSB7XHJcbiAgICAgICAgdGhpcy5jbGVhclNlbGVjdGVkQnVubnkoKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gRGlzcG9zZSBvZiB0aGUgYXNzb2NpYXRlZCBzcHJpdGUgaW5zdGFuY2VcclxuICAgICAgY29uc3QgYnVubnlTcHJpdGVJbnN0YW5jZUluZGV4ID0gdGhpcy5zcHJpdGVJbnN0YW5jZXMuaW5kZXhPZiggYnVubnlTcHJpdGVJbnN0YW5jZSApO1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBidW5ueVNwcml0ZUluc3RhbmNlSW5kZXggIT09IC0xLCAnYnVubnlTcHJpdGVJbnN0YW5jZSBtaXNzaW5nIGZyb20gc3ByaXRlSW5zdGFuY2VzJyApO1xyXG4gICAgICB0aGlzLnNwcml0ZUluc3RhbmNlcy5zcGxpY2UoIGJ1bm55U3ByaXRlSW5zdGFuY2VJbmRleCwgMSApO1xyXG4gICAgICBpZiAoICF0aGlzLmlzUGxheWluZ1Byb3BlcnR5LnZhbHVlICkge1xyXG4gICAgICAgIHRoaXMuaW52YWxpZGF0ZVBhaW50KCk7XHJcbiAgICAgIH1cclxuICAgICAgYnVubnlTcHJpdGVJbnN0YW5jZS5kaXNwb3NlKCk7XHJcblxyXG4gICAgICAvLyBSZW1vdmUgdGhpcyBsaXN0ZW5lclxyXG4gICAgICBidW5ueS5kaWVkRW1pdHRlci5yZW1vdmVMaXN0ZW5lciggYnVubnlEaWVkT3JEaXNwb3NlZExpc3RlbmVyICk7XHJcbiAgICAgIGJ1bm55LmRpc3Bvc2VkRW1pdHRlci5yZW1vdmVMaXN0ZW5lciggYnVubnlEaWVkT3JEaXNwb3NlZExpc3RlbmVyICk7XHJcbiAgICB9O1xyXG4gICAgYnVubnkuZGllZEVtaXR0ZXIuYWRkTGlzdGVuZXIoIGJ1bm55RGllZE9yRGlzcG9zZWRMaXN0ZW5lciApOyAvLyByZW1vdmVMaXN0ZW5lciBpcyBwZXJmb3JtZWQgYnkgY2FsbGJhY2tcclxuICAgIGJ1bm55LmRpc3Bvc2VkRW1pdHRlci5hZGRMaXN0ZW5lciggYnVubnlEaWVkT3JEaXNwb3NlZExpc3RlbmVyICk7IC8vIHJlbW92ZUxpc3RlbmVyIGlzIHBlcmZvcm1lZCBieSBjYWxsYmFja1xyXG5cclxuICAgIC8vIFBoRVQtaU8gc3RhdGUgZW5naW5lIG1heSByZXN0b3JlIGJ1bm55Q29sbGVjdGlvbi5zZWxlY3RlZEJ1bm55UHJvcGVydHkgYmVmb3JlIGZpcmluZ1xyXG4gICAgLy8gYnVubnlDb2xsZWN0aW9uLmxpdmVCdW5uaWVzLmFkZEl0ZW1BZGRlZExpc3RlbmVyLCB0aGUgY2FsbGJhY2sgdGhhdCBjcmVhdGVzIEJ1bm55U3ByaXRlSW5zdGFuY2VzLlxyXG4gICAgLy8gSWYgdGhhdCBoYXBwZW5zLCB0aGVuIGNyZWF0ZUJ1bm55U3ByaXRlSW5zdGFuY2UgaXMgcmVzcG9uc2libGUgZm9yIGNhbGxpbmcgc2V0U2VsZWN0ZWRCdW5ueS5cclxuICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvbmF0dXJhbC1zZWxlY3Rpb24vaXNzdWVzLzEzOFxyXG4gICAgaWYgKCBwaGV0LmpvaXN0LnNpbS5pc1NldHRpbmdQaGV0aW9TdGF0ZVByb3BlcnR5LnZhbHVlICYmIHRoaXMuYnVubnlDb2xsZWN0aW9uLnNlbGVjdGVkQnVubnlQcm9wZXJ0eS52YWx1ZSA9PT0gYnVubnkgKSB7XHJcbiAgICAgIHRoaXMuc2V0U2VsZWN0ZWRCdW5ueSggYnVubnkgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgYSBzcHJpdGUgaW5zdGFuY2UgZm9yIGEgYnVubnksIGFuZCB0aGUgc2NhZmZvbGRpbmcgdG8gcmVtb3ZlIGl0IHdoZW4gdGhlIHdvbGYgaXMgZGlzcG9zZWQuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBjcmVhdGVXb2xmU3ByaXRlSW5zdGFuY2UoIHdvbGY6IFdvbGYsIHdvbGZTcHJpdGU6IFNwcml0ZSApOiB2b2lkIHtcclxuXHJcbiAgICAvLyBDcmVhdGUgYSBTcHJpdGVJbnN0YW5jZSBmb3IgdGhlIHdvbGYuXHJcbiAgICBjb25zdCB3b2xmU3ByaXRlSW5zdGFuY2UgPSBuZXcgV29sZlNwcml0ZUluc3RhbmNlKCB3b2xmLCB3b2xmU3ByaXRlICk7XHJcbiAgICB0aGlzLnNwcml0ZUluc3RhbmNlcy5wdXNoKCB3b2xmU3ByaXRlSW5zdGFuY2UgKTtcclxuICAgIGlmICggIXRoaXMuaXNQbGF5aW5nUHJvcGVydHkudmFsdWUgKSB7XHJcbiAgICAgIHRoaXMudXBkYXRlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gV2hlbiB0aGUgd29sZiBpcyBkaXNwb3NlZCwgcmVtb3ZlIGl0IGZyb20gdGhlIHZpZXcuXHJcbiAgICBjb25zdCB3b2xmRGlzcG9zZWRMaXN0ZW5lciA9ICgpID0+IHtcclxuXHJcbiAgICAgIC8vIERpc3Bvc2Ugb2YgdGhlIGFzc29jaWF0ZWQgc3ByaXRlIGluc3RhbmNlXHJcbiAgICAgIGNvbnN0IHdvbGZTcHJpdGVJbnN0YW5jZUluZGV4ID0gdGhpcy5zcHJpdGVJbnN0YW5jZXMuaW5kZXhPZiggd29sZlNwcml0ZUluc3RhbmNlICk7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHdvbGZTcHJpdGVJbnN0YW5jZUluZGV4ICE9PSAtMSwgJ3dvbGZTcHJpdGVJbnN0YW5jZUluZGV4IG1pc3NpbmcgZnJvbSBzcHJpdGVJbnN0YW5jZXMnICk7XHJcbiAgICAgIHRoaXMuc3ByaXRlSW5zdGFuY2VzLnNwbGljZSggd29sZlNwcml0ZUluc3RhbmNlSW5kZXgsIDEgKTtcclxuICAgICAgaWYgKCAhdGhpcy5pc1BsYXlpbmdQcm9wZXJ0eS52YWx1ZSApIHtcclxuICAgICAgICB0aGlzLmludmFsaWRhdGVQYWludCgpO1xyXG4gICAgICB9XHJcbiAgICAgIHdvbGZTcHJpdGVJbnN0YW5jZS5kaXNwb3NlKCk7XHJcblxyXG4gICAgICAvLyBSZW1vdmUgdGhpcyBsaXN0ZW5lclxyXG4gICAgICB3b2xmLmRpc3Bvc2VkRW1pdHRlci5yZW1vdmVMaXN0ZW5lciggd29sZkRpc3Bvc2VkTGlzdGVuZXIgKTtcclxuICAgIH07XHJcbiAgICB3b2xmLmRpc3Bvc2VkRW1pdHRlci5hZGRMaXN0ZW5lciggd29sZkRpc3Bvc2VkTGlzdGVuZXIgKTsgLy8gcmVtb3ZlTGlzdGVuZXIgaXMgcGVyZm9ybWVkIGJ5IGNhbGxiYWNrXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIGZvb2QgdG8gYmUgdG91Z2ggb3IgdGVuZGVyLlxyXG4gICAqIEBwYXJhbSBpc1RvdWdoIC0gdHJ1ZT10b3VnaCwgZmFsc2U9dGVuZGVyXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBzZXRUb3VnaEZvb2QoIGlzVG91Z2g6IGJvb2xlYW4gKTogdm9pZCB7XHJcbiAgICB0aGlzLnNocnViU3ByaXRlSW5zdGFuY2VzLmZvckVhY2goIHNocnViU3ByaXRlSW5zdGFuY2UgPT4ge1xyXG4gICAgICBzaHJ1YlNwcml0ZUluc3RhbmNlLnNldFRvdWdoKCBpc1RvdWdoICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gVGhlcmUgd2FzIG5vIGNoYW5nZSB0byBzcHJpdGVJbnN0YW5jZXMsIHNvIG5vIG5lZWQgdG8gY2FsbCB1cGRhdGUsIGludmFsaWRhdGVQYWludCBzdWZmaWNlcy5cclxuICAgIHRoaXMuaW52YWxpZGF0ZVBhaW50KCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIGZvb2QgdG8gYmUgbGltaXRlZCBvciBwbGVudGlmdWwuXHJcbiAgICogQHBhcmFtIGlzTGltaXRlZCAtIHRydWU9bGltaXRlZCwgZmFsc2U9cGxlbnRpZnVsXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBzZXRMaW1pdGVkRm9vZCggaXNMaW1pdGVkOiBib29sZWFuICk6IHZvaWQge1xyXG5cclxuICAgIC8vIFN0YXJ0IGJ5IHJlbW92aW5nIGFsbCBzaHJ1YnMuXHJcbiAgICB0aGlzLnNocnViU3ByaXRlSW5zdGFuY2VzLmZvckVhY2goIHNocnViU3ByaXRlSW5zdGFuY2UgPT4ge1xyXG4gICAgICBjb25zdCBpbmRleCA9IHRoaXMuc3ByaXRlSW5zdGFuY2VzLmluZGV4T2YoIHNocnViU3ByaXRlSW5zdGFuY2UgKTtcclxuICAgICAgaWYgKCBpbmRleCAhPT0gLTEgKSB7XHJcbiAgICAgICAgdGhpcy5zcHJpdGVJbnN0YW5jZXMuc3BsaWNlKCBpbmRleCwgMSApO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgaWYgKCBpc0xpbWl0ZWQgKSB7XHJcblxyXG4gICAgICAvLyBGb29kIGlzIGxpbWl0ZWQsIHNob3cgc29tZSBvZiB0aGUgc2hydWJzLlxyXG4gICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBOYXR1cmFsU2VsZWN0aW9uUXVlcnlQYXJhbWV0ZXJzLnNocnVic1JhbmdlLm1pbjsgaSsrICkge1xyXG4gICAgICAgIHRoaXMuc3ByaXRlSW5zdGFuY2VzLnB1c2goIHRoaXMuc2hydWJTcHJpdGVJbnN0YW5jZXNbIGkgXSApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuXHJcbiAgICAgIC8vIEZvb2QgaXMgYWJ1bmRhbnQsIHNob3cgYWxsIHNocnVicy5cclxuICAgICAgdGhpcy5zaHJ1YlNwcml0ZUluc3RhbmNlcy5mb3JFYWNoKCBzaHJ1YlNwcml0ZUluc3RhbmNlID0+IHtcclxuICAgICAgICB0aGlzLnNwcml0ZUluc3RhbmNlcy5wdXNoKCBzaHJ1YlNwcml0ZUluc3RhbmNlICk7XHJcbiAgICAgIH0gKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnVwZGF0ZSgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ29uZmlndXJlcyBhIHNwcml0ZSBpbnN0YW5jZSBhbmQgdGhlIHNlbGVjdGlvbiByZWN0YW5nbGUgdG8gY29ycmVzcG9uZCB0byBhIHNlbGVjdGVkIGJ1bm55LlxyXG4gICAqL1xyXG4gIHByaXZhdGUgc2V0U2VsZWN0ZWRCdW5ueSggYnVubnk6IEJ1bm55IHwgbnVsbCApOiB2b2lkIHtcclxuXHJcbiAgICAvLyBDbGVhciBhbnkgcHJldmlvdXMgc2VsZWN0aW9uLlxyXG4gICAgdGhpcy5jbGVhclNlbGVjdGVkQnVubnkoKTtcclxuXHJcbiAgICAvLyBUaGlzIHZpZXcgb25seSBkaXNwbGF5cyBsaXZlIGJ1bm5pZXMsIGFuZCBzZWxlY3RlZEJ1bm55UHJvcGVydHkgbWF5IGNvbnRhaW4gYSBkZWFkIGJ1bm55LCBmb3IgZGlzcGxheSBpbiB0aGVcclxuICAgIC8vIFBlZGlncmVlIGdyYXBoLiAgU28gb25seSBpZiB0aGVyZSdzIGEgbGl2ZSBidW5ueSBzZWxlY3RlZC4uLlxyXG4gICAgaWYgKCBidW5ueSAmJiBidW5ueS5pc0FsaXZlICkge1xyXG5cclxuICAgICAgLy8gR2V0IHRoZSBCdW5ueVNwcml0ZUluc3RhbmNlIHRoYXQgaXMgYXNzb2NpYXRlZCB3aXRoIHRoZSBzZWxlY3RlZCBidW5ueS5cclxuICAgICAgY29uc3Qgc2VsZWN0ZWRCdW5ueUluZGV4ID0gdGhpcy5nZXRCdW5ueVNwcml0ZUluc3RhbmNlSW5kZXgoIGJ1bm55ICk7XHJcblxyXG4gICAgICBpZiAoIHBoZXQuam9pc3Quc2ltLmlzU2V0dGluZ1BoZXRpb1N0YXRlUHJvcGVydHkudmFsdWUgJiYgc2VsZWN0ZWRCdW5ueUluZGV4ID09PSAtMSApIHtcclxuXHJcbiAgICAgICAgLy8gUGhFVC1pTyBzdGF0ZSBlbmdpbmUgbWF5IHJlc3RvcmUgYnVubnlDb2xsZWN0aW9uLnNlbGVjdGVkQnVubnlQcm9wZXJ0eSBiZWZvcmUgZmlyaW5nXHJcbiAgICAgICAgLy8gYnVubnlDb2xsZWN0aW9uLmxpdmVCdW5uaWVzLmFkZEl0ZW1BZGRlZExpc3RlbmVyLCB0aGUgY2FsbGJhY2sgdGhhdCBjcmVhdGVzIEJ1bm55U3ByaXRlSW5zdGFuY2VzLlxyXG4gICAgICAgIC8vIElmIHRoYXQgaGFwcGVucywgdGhlbiByZWx5IG9uIGNyZWF0ZUJ1bm55U3ByaXRlSW5zdGFuY2UgdG8gY2FsbCBzZXRTZWxlY3RlZEJ1bm55LlxyXG4gICAgICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvbmF0dXJhbC1zZWxlY3Rpb24vaXNzdWVzLzEzOFxyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG5cclxuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBzZWxlY3RlZEJ1bm55SW5kZXggIT09IC0xLCAnc3ByaXRlIGluc3RhbmNlIG5vdCBmb3VuZCBmb3Igc2VsZWN0ZWQgYnVubnknICk7XHJcbiAgICAgICAgdGhpcy5zZWxlY3RlZEJ1bm55U3ByaXRlSW5zdGFuY2UgPSB0aGlzLnNwcml0ZUluc3RhbmNlc1sgc2VsZWN0ZWRCdW5ueUluZGV4IF0gYXMgQnVubnlTcHJpdGVJbnN0YW5jZTtcclxuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLnNlbGVjdGVkQnVubnlTcHJpdGVJbnN0YW5jZSBpbnN0YW5jZW9mIEJ1bm55U3ByaXRlSW5zdGFuY2UsICdpbnZhbGlkIHNlbGVjdGVkQnVubnlTcHJpdGVJbnN0YW5jZScgKTtcclxuXHJcbiAgICAgICAgLy8gQ3JlYXRlIHRoZSBzZWxlY3Rpb24gcmVjdGFuZ2xlIGFuZCBwdXQgaXQgaW1tZWRpYXRlbHkgYmVoaW5kIHRoZSBzZWxlY3RlZCBidW5ueS5cclxuICAgICAgICB0aGlzLnNlbGVjdGlvblJlY3RhbmdsZVNwcml0ZUluc3RhbmNlID0gbmV3IEJ1bm55U2VsZWN0aW9uUmVjdGFuZ2xlU3ByaXRlSW5zdGFuY2UoIGJ1bm55LCB0aGlzLnNlbGVjdGlvblJlY3RhbmdsZVNwcml0ZSApO1xyXG4gICAgICAgIHRoaXMuc3ByaXRlSW5zdGFuY2VzLnNwbGljZSggc2VsZWN0ZWRCdW5ueUluZGV4LCAwLCB0aGlzLnNlbGVjdGlvblJlY3RhbmdsZVNwcml0ZUluc3RhbmNlICk7XHJcbiAgICAgICAgaWYgKCAhdGhpcy5pc1BsYXlpbmdQcm9wZXJ0eS52YWx1ZSApIHtcclxuICAgICAgICAgIHRoaXMudXBkYXRlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBHZXRzIHRoZSBpbmRleCBvZiB0aGUgQnVubnlTcHJpdGVJbnN0YW5jZSB0aGF0IGlzIGFzc29jaWF0ZWQgd2l0aCBhIHNwZWNpZmljIGJ1bm55LlxyXG4gICAqIFJldHVybnMgLTEgaWYgbm90IGZvdW5kLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgZ2V0QnVubnlTcHJpdGVJbnN0YW5jZUluZGV4KCBidW5ueTogQnVubnkgKTogbnVtYmVyIHtcclxuXHJcbiAgICAvLyBQZXJmb3JtYW5jZTogRm9yIGEgbWF4aW11bSBwb3B1bGF0aW9uLCB0aGlzIGJydXRlLWZvcmNlIGFwcHJvYWNoIHRha2VzIDwgMW1zIG9uIGEgMjAxOSBNYWNCb29rIFByby5cclxuICAgIGxldCBzZWxlY3RlZEJ1bm55SW5kZXggPSAtMTtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IHRoaXMuc3ByaXRlSW5zdGFuY2VzLmxlbmd0aCAmJiBzZWxlY3RlZEJ1bm55SW5kZXggPT09IC0xOyBpKysgKSB7XHJcbiAgICAgIGNvbnN0IHNwcml0ZUluc3RhbmNlID0gdGhpcy5zcHJpdGVJbnN0YW5jZXNbIGkgXTtcclxuICAgICAgaWYgKCBzcHJpdGVJbnN0YW5jZSBpbnN0YW5jZW9mIEJ1bm55U3ByaXRlSW5zdGFuY2UgJiYgc3ByaXRlSW5zdGFuY2Uub3JnYW5pc20gPT09IGJ1bm55ICkge1xyXG4gICAgICAgIHNlbGVjdGVkQnVubnlJbmRleCA9IGk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBzZWxlY3RlZEJ1bm55SW5kZXg7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDbGVhcnMgdGhlIHNwcml0ZXMgZm9yIHRoZSBidW5ueSBzZWxlY3Rpb24sIGlmIHRoZXJlIGlzIG9uZS5cclxuICAgKi9cclxuICBwcml2YXRlIGNsZWFyU2VsZWN0ZWRCdW5ueSgpOiB2b2lkIHtcclxuXHJcbiAgICBpZiAoIHRoaXMuc2VsZWN0ZWRCdW5ueVNwcml0ZUluc3RhbmNlICkge1xyXG5cclxuICAgICAgLy8gY2xlYXIgdGhlIHNlbGVjdGVkIGJ1bm55XHJcbiAgICAgIHRoaXMuc2VsZWN0ZWRCdW5ueVNwcml0ZUluc3RhbmNlID0gbnVsbDtcclxuXHJcbiAgICAgIC8vIGNsZWFyIHRoZSBzZWxlY3Rpb24gcmVjdGFuZ2xlXHJcbiAgICAgIGNvbnN0IHNlbGVjdGlvblJlY3RhbmdsZVNwcml0ZUluc3RhbmNlID0gdGhpcy5zZWxlY3Rpb25SZWN0YW5nbGVTcHJpdGVJbnN0YW5jZSE7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHNlbGVjdGlvblJlY3RhbmdsZVNwcml0ZUluc3RhbmNlLCAnZXhwZWN0ZWQgc2VsZWN0aW9uUmVjdGFuZ2xlU3ByaXRlSW5zdGFuY2UgdG8gYmUgc2V0JyApO1xyXG4gICAgICBjb25zdCBzZWxlY3Rpb25SZWN0YW5nbGVJbmRleCA9IHRoaXMuc3ByaXRlSW5zdGFuY2VzLmluZGV4T2YoIHNlbGVjdGlvblJlY3RhbmdsZVNwcml0ZUluc3RhbmNlICk7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHNlbGVjdGlvblJlY3RhbmdsZUluZGV4ICE9PSAtMSwgJ3NlbGVjdGlvblJlY3RhbmdsZVNwcml0ZUluc3RhbmNlIGlzIG1pc3NpbmcgZnJvbSBzcHJpdGVJbnN0YW5jZXMnICk7XHJcbiAgICAgIHRoaXMuc3ByaXRlSW5zdGFuY2VzLnNwbGljZSggc2VsZWN0aW9uUmVjdGFuZ2xlSW5kZXgsIDEgKTtcclxuICAgICAgaWYgKCAhdGhpcy5pc1BsYXlpbmdQcm9wZXJ0eS52YWx1ZSApIHtcclxuICAgICAgICB0aGlzLmludmFsaWRhdGVQYWludCgpO1xyXG4gICAgICB9XHJcbiAgICAgIHNlbGVjdGlvblJlY3RhbmdsZVNwcml0ZUluc3RhbmNlLmRpc3Bvc2UoKTtcclxuICAgICAgdGhpcy5zZWxlY3Rpb25SZWN0YW5nbGVTcHJpdGVJbnN0YW5jZSA9IG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5zZWxlY3RlZEJ1bm55U3ByaXRlSW5zdGFuY2UgPT09IG51bGwsICdzZWxlY3RlZEJ1bm55U3ByaXRlSW5zdGFuY2Ugc2hvdWxkIGJlIG51bGwnICk7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLnNlbGVjdGlvblJlY3RhbmdsZVNwcml0ZUluc3RhbmNlID09PSBudWxsLCAnc2VsZWN0aW9uUmVjdGFuZ2xlU3ByaXRlSW5zdGFuY2Ugc2hvdWxkIGJlIG51bGwnICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTb3J0cyB0aGUgc3ByaXRlIGluc3RhbmNlcyBpbiBiYWNrLXRvLWZyb250IHJlbmRlcmluZyBvcmRlci4gSW5zdGFuY2VzIGFyZSBmaXJzdCBzb3J0ZWQgYnkgeiBjb29yZGluYXRlIG9mIHRoZWlyXHJcbiAgICogYXNzb2NpYXRlZCBvcmdhbmlzbSwgZnJvbSBiYWNrIHRvIGZyb250LCB3aGVyZSAreiBpcyBhd2F5IGZyb20gdGhlIGNhbWVyYS4gSWYgdGhlcmUgaXMgYSBzZWxlY3RlZCBidW5ueSBhbmRcclxuICAgKiB0aGUgc2ltIGlzIHBhdXNlZCwgdGhlIGJ1bm55IGFuZCBpdHMgc2VsZWN0aW9uIHJlY3RhbmdsZSBhcmUgbW92ZWQgdG8gdGhlIGZyb250LlxyXG4gICAqL1xyXG4gIHByaXZhdGUgc29ydCgpOiB2b2lkIHtcclxuXHJcbiAgICAvLyBTb3J0IGJ5IGRlc2NlbmRpbmcgeiBjb29yZGluYXRlLiBTb3J0aW5nIGlzIGRvbmUgaW4gcGxhY2UsIGJlY2F1c2Ugc3VwZXIgaGFzIGEgcmVmZXJlbmNlIHRvIHRoaXMuc3ByaXRlSW5zdGFuY2VzLlxyXG4gICAgLy8gUGVyZm9ybWFuY2U6IEZvciBhIG1heGltdW0gcG9wdWxhdGlvbiwgdGhpcyB0YWtlcyA8IDFtcyBvbiBhIDIwMTkgTWFjQm9vayBQcm8uXHJcbiAgICB0aGlzLnNwcml0ZUluc3RhbmNlcy5zb3J0KCAoIHNwcml0ZUluc3RhbmNlMSwgc3ByaXRlSW5zdGFuY2UyICkgPT4ge1xyXG4gICAgICBjb25zdCB6MSA9IHNwcml0ZUluc3RhbmNlMS5vcmdhbmlzbS5wb3NpdGlvblByb3BlcnR5LnZhbHVlLno7XHJcbiAgICAgIGNvbnN0IHoyID0gc3ByaXRlSW5zdGFuY2UyLm9yZ2FuaXNtLnBvc2l0aW9uUHJvcGVydHkudmFsdWUuejtcclxuICAgICAgcmV0dXJuIE1hdGguc2lnbiggejIgLSB6MSApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIElmIGEgc2VsZWN0ZWQgYnVubnkgaXMgdmlzaWJsZSBhbmQgdGhlIHNpbSBpcyBwYXVzZWQsIG1vdmUgdGhlIGJ1bm55IGFuZCBzZWxlY3Rpb24gcmVjdGFuZ2xlIHRvIHRoZSBmcm9udC5cclxuICAgIGlmICggdGhpcy5zZWxlY3RlZEJ1bm55U3ByaXRlSW5zdGFuY2UgJiYgIXRoaXMuaXNQbGF5aW5nUHJvcGVydHkudmFsdWUgKSB7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMuYnVubnlDb2xsZWN0aW9uLnNlbGVjdGVkQnVubnlQcm9wZXJ0eS52YWx1ZSxcclxuICAgICAgICAnc2VsZWN0ZWRCdW5ueVNwcml0ZUluc3RhbmNlIHNob3VsZCBub3QgZXhpc3Qgd2hlbiB0aGVyZSBpcyBubyBzZWxlY3RlZCBidW5ueScgKTtcclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggdGhpcy5zZWxlY3Rpb25SZWN0YW5nbGVTcHJpdGVJbnN0YW5jZSwgJ2V4cGVjdGVkIHNlbGVjdGlvblJlY3RhbmdsZVNwcml0ZUluc3RhbmNlIHRvIGJlIHNldCcgKTtcclxuXHJcbiAgICAgIC8vIFJlbW92ZSB0aGUgc2VsZWN0ZWQgYnVubnlcclxuICAgICAgY29uc3Qgc2VsZWN0ZWRCdW5ueUluZGV4ID0gdGhpcy5zcHJpdGVJbnN0YW5jZXMuaW5kZXhPZiggdGhpcy5zZWxlY3RlZEJ1bm55U3ByaXRlSW5zdGFuY2UgKTtcclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggc2VsZWN0ZWRCdW5ueUluZGV4ICE9PSAtMSwgJ3NlbGVjdGVkQnVubnlTcHJpdGVJbnN0YW5jZSBtaXNzaW5nIGZyb20gc3ByaXRlSW5zdGFuY2VzJyApO1xyXG4gICAgICB0aGlzLnNwcml0ZUluc3RhbmNlcy5zcGxpY2UoIHNlbGVjdGVkQnVubnlJbmRleCwgMSApO1xyXG5cclxuICAgICAgLy8gUmVtb3ZlIHRoZSBzZWxlY3Rpb24gcmVjdGFuZ2xlXHJcbiAgICAgIGNvbnN0IHNlbGVjdGlvblJlY3RhbmdsZUluZGV4ID0gdGhpcy5zcHJpdGVJbnN0YW5jZXMuaW5kZXhPZiggdGhpcy5zZWxlY3Rpb25SZWN0YW5nbGVTcHJpdGVJbnN0YW5jZSEgKTtcclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggc2VsZWN0aW9uUmVjdGFuZ2xlSW5kZXggIT09IC0xLCAnc2VsZWN0aW9uUmVjdGFuZ2xlU3ByaXRlSW5zdGFuY2UgbWlzc2luZyBmcm9tIHNwcml0ZUluc3RhbmNlcycgKTtcclxuICAgICAgdGhpcy5zcHJpdGVJbnN0YW5jZXMuc3BsaWNlKCBzZWxlY3Rpb25SZWN0YW5nbGVJbmRleCwgMSApO1xyXG5cclxuICAgICAgLy8gQXBwZW5kIHRoZSBzZWxlY3RlZCBidW5ueSBhbmQgdGhlIHNlbGVjdGlvbiByZWN0YW5nbGUgdG8gdGhlIGZyb250LlxyXG4gICAgICB0aGlzLnNwcml0ZUluc3RhbmNlcy5wdXNoKCB0aGlzLnNlbGVjdGlvblJlY3RhbmdsZVNwcml0ZUluc3RhbmNlISApOyAvLyByZWN0YW5nbGUgYmVoaW5kIGJ1bm55XHJcbiAgICAgIHRoaXMuc3ByaXRlSW5zdGFuY2VzLnB1c2goIHRoaXMuc2VsZWN0ZWRCdW5ueVNwcml0ZUluc3RhbmNlICk7XHJcblxyXG4gICAgICB0aGlzLmludmFsaWRhdGVQYWludCgpO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIFByZXNzTGlzdGVuZXIgZm9yIHNlbGVjdGluZyBhIGJ1bm55LiBBZGQgdHJhaXQgU3ByaXRlTGlzdGVuYWJsZSwgc28gd2UgaGF2ZSBhY2Nlc3MgdG8gdGhlIHByZXNzZWQgU3ByaXRlSW5zdGFuY2UuXHJcbiAqL1xyXG5jbGFzcyBCdW5ueVByZXNzTGlzdGVuZXIgZXh0ZW5kcyBTcHJpdGVMaXN0ZW5hYmxlKCBQcmVzc0xpc3RlbmVyICkge1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIGJ1bm55Q29sbGVjdGlvbjogQnVubnlDb2xsZWN0aW9uLCB0YW5kZW06IFRhbmRlbSApIHtcclxuICAgIHN1cGVyKCB7XHJcbiAgICAgIHByZXNzOiAoKSA9PiB7XHJcbiAgICAgICAgaWYgKCB0aGlzLnNwcml0ZUluc3RhbmNlIGluc3RhbmNlb2YgQnVubnlTcHJpdGVJbnN0YW5jZSApIHtcclxuICAgICAgICAgIGJ1bm55Q29sbGVjdGlvbi5zZWxlY3RlZEJ1bm55UHJvcGVydHkudmFsdWUgPSB0aGlzLnNwcml0ZUluc3RhbmNlLmJ1bm55O1xyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAgdGFuZGVtOiB0YW5kZW1cclxuICAgIH0gKTtcclxuICB9XHJcbn1cclxuXHJcbm5hdHVyYWxTZWxlY3Rpb24ucmVnaXN0ZXIoICdPcmdhbmlzbVNwcml0ZXMnLCBPcmdhbmlzbVNwcml0ZXMgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUlBLE9BQU9BLFNBQVMsTUFBNEIsMENBQTBDO0FBRXRG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