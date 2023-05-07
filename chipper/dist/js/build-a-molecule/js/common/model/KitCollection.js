// Copyright 2020-2021, University of Colorado Boulder

/**
 * Represents a main running model for the 1st two tabs. Contains a collection of kits and boxes. Kits are responsible
 * for their buckets and atoms.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Denzell Barnett (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Property from '../../../../axon/js/Property.js';
import merge from '../../../../phet-core/js/merge.js';
import buildAMolecule from '../../buildAMolecule.js';
import BAMQueryParameters from '../BAMQueryParameters.js';
let currentId = 0;
class KitCollection {
  /**
   * @param {Object} [options]
   */
  constructor(options) {
    options = merge({
      enableCues: false // Determines if the arrow cues should be shown
    }, options);

    // @public {number}
    this.id = currentId++;

    // @public {Array.<Kit>}
    this.kits = [];

    // @public {Array.<CollectionBox>}
    this.collectionBoxes = [];

    // @private {boolean} Only show a blinking highlight once
    this.hasBlinkedOnce = false;

    // @public {Property.<boolean>} - this will remain false if we have no collection boxes
    this.allCollectionBoxesFilledProperty = new BooleanProperty(false);

    // @public {Property.<Kit|null>}
    this.currentKitProperty = new Property(null);

    // Swap the current kit and update the visibility of the cue nodes in the collection boxes
    this.currentKitProperty.lazyLink((newKit, oldKit) => {
      if (oldKit) {
        oldKit.activeProperty.value = false;
      }
      if (newKit) {
        newKit.activeProperty.value = true;

        // Determine the visibility of the arrow cues when switching to new kit
        this.collectionBoxes.forEach(box => {
          box.cueVisibilityProperty.reset();
          newKit.molecules.forEach(molecule => {
            // Only handle visibility for the first collection
            if (molecule && options.enableCues === true && box.willAllowMoleculeDrop(molecule)) {
              box.cueVisibilityProperty.value = true;
            }
          });
        });
      }
    });
  }

  /**
   * Add a kit to this kit collection. Here is where we add listeners to the added kit
   * @param {Kit} kit
   * @param {Object} [options]
   *
   * @public
   */
  addKit(kit, options) {
    this.kits.push(kit);
    const dropListener = atom => {
      // don't drop an atom from the kit to the collection box directly
      if (kit.isAtomInPlay(atom)) {
        const molecule = kit.getMolecule(atom);

        // check to see if we are trying to drop it in a collection box.
        const numBoxes = this.collectionBoxes.length;
        for (let i = 0; i < numBoxes; i++) {
          const box = this.collectionBoxes[i];

          // permissive, so that if the box bounds and molecule bounds intersect, we call it a 'hit'
          if (box.dropBoundsProperty.value.intersectsBounds(molecule.positionBounds)) {
            // if our box takes this type of molecule
            if (box.willAllowMoleculeDrop(molecule)) {
              kit.moleculePutInCollectionBox(molecule, box);
              break;
            }
          }
        }
      }
    };

    // Add dropped listeners for each atom in this kit
    kit.atoms.forEach(atom => {
      atom.droppedByUserEmitter.addListener(dropListener);
    });

    // Cycle through molecules in the play area and check if the arrow cue needs to be updated
    kit.addedMoleculeEmitter.addListener(() => {
      this.collectionBoxes.forEach(box => {
        kit.molecules.forEach(molecule => {
          // Added molecules should trigger an arrow cue if it can be dropped in a collection box
          if (box.willAllowMoleculeDrop(molecule) && options && options.triggerCue) {
            box.cueVisibilityProperty.value = true;

            // Trigger box blinking only if it has not blinked already
            if (!this.hasBlinkedOnce) {
              box.acceptedMoleculeCreationEmitter.emit(molecule);
              this.hasBlinkedOnce = true;
            }
          }
        });

        // All boxes should not show an arrow cue if the box is full
        if (box.isFull()) {
          box.cueVisibilityProperty.value = false;
        }
      });
    });

    // When a molecule is removed we need to check all of the molecules remaining to determine if they could
    // possibly go in one of the collection oxes.
    kit.removedMoleculeEmitter.addListener(molecule => {
      this.collectionBoxes.forEach(box => {
        // Hide arrow cues for the removed molecule. This works independently from other molecules that are present
        // in the kit play area.
        if (box.willAllowMoleculeDrop(molecule) && molecule && options && options.triggerCue) {
          box.cueVisibilityProperty.value = false;
        }

        // Cycle through all the remaining molecules and trigger the arrow cue if the molecule exists in the
        // kit play area.
        kit.molecules.forEach(remainingMolecule => {
          if (box.willAllowMoleculeDrop(remainingMolecule) && molecule && options && options.triggerCue) {
            box.cueVisibilityProperty.value = box.willAllowMoleculeDrop(remainingMolecule) && remainingMolecule && options && options.triggerCue;
          }

          // Last sanity check to make sure a full box doesn't have an arrow cue shown.
          if (box.isFull()) {
            box.cueVisibilityProperty.value = false;
          }
        });
      });
    });
  }

  /**
   * Add a collection box
   * @param {CollectionBox} box
   * @public
   */
  addCollectionBox(box) {
    this.collectionBoxes.push(box);

    // listen to when our collection boxes change, so that we can identify when all of our collection boxes are filled
    box.quantityProperty.lazyLink(() => {
      const allFull = _.every(this.collectionBoxes, collectionBox => {
        return collectionBox.isFull();
      });

      // Used for debugging.
      if (BAMQueryParameters.easyMode) {
        this.allCollectionBoxesFilledProperty.value = true;
      } else {
        this.allCollectionBoxesFilledProperty.value = this.collectionBoxes.length && allFull;
      }
    });
  }

  /**
   * Reset this kitCollection
   * @public
   */
  reset() {
    this.collectionBoxes.forEach(box => {
      box.reset();
    });
    this.kits.forEach(kit => {
      kit.reset();
    });
    this.hasBlinkedOnce = false;
    this.allCollectionBoxesFilledProperty.reset();
  }

  /**
   * Reset only the kits and boxes
   * @public
   */
  resetKitsAndBoxes() {
    this.kits.forEach(kit => {
      kit.reset();
    });
    this.collectionBoxes.forEach(box => {
      box.reset();
    });
  }
}
buildAMolecule.register('KitCollection', KitCollection);
export default KitCollection;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJQcm9wZXJ0eSIsIm1lcmdlIiwiYnVpbGRBTW9sZWN1bGUiLCJCQU1RdWVyeVBhcmFtZXRlcnMiLCJjdXJyZW50SWQiLCJLaXRDb2xsZWN0aW9uIiwiY29uc3RydWN0b3IiLCJvcHRpb25zIiwiZW5hYmxlQ3VlcyIsImlkIiwia2l0cyIsImNvbGxlY3Rpb25Cb3hlcyIsImhhc0JsaW5rZWRPbmNlIiwiYWxsQ29sbGVjdGlvbkJveGVzRmlsbGVkUHJvcGVydHkiLCJjdXJyZW50S2l0UHJvcGVydHkiLCJsYXp5TGluayIsIm5ld0tpdCIsIm9sZEtpdCIsImFjdGl2ZVByb3BlcnR5IiwidmFsdWUiLCJmb3JFYWNoIiwiYm94IiwiY3VlVmlzaWJpbGl0eVByb3BlcnR5IiwicmVzZXQiLCJtb2xlY3VsZXMiLCJtb2xlY3VsZSIsIndpbGxBbGxvd01vbGVjdWxlRHJvcCIsImFkZEtpdCIsImtpdCIsInB1c2giLCJkcm9wTGlzdGVuZXIiLCJhdG9tIiwiaXNBdG9tSW5QbGF5IiwiZ2V0TW9sZWN1bGUiLCJudW1Cb3hlcyIsImxlbmd0aCIsImkiLCJkcm9wQm91bmRzUHJvcGVydHkiLCJpbnRlcnNlY3RzQm91bmRzIiwicG9zaXRpb25Cb3VuZHMiLCJtb2xlY3VsZVB1dEluQ29sbGVjdGlvbkJveCIsImF0b21zIiwiZHJvcHBlZEJ5VXNlckVtaXR0ZXIiLCJhZGRMaXN0ZW5lciIsImFkZGVkTW9sZWN1bGVFbWl0dGVyIiwidHJpZ2dlckN1ZSIsImFjY2VwdGVkTW9sZWN1bGVDcmVhdGlvbkVtaXR0ZXIiLCJlbWl0IiwiaXNGdWxsIiwicmVtb3ZlZE1vbGVjdWxlRW1pdHRlciIsInJlbWFpbmluZ01vbGVjdWxlIiwiYWRkQ29sbGVjdGlvbkJveCIsInF1YW50aXR5UHJvcGVydHkiLCJhbGxGdWxsIiwiXyIsImV2ZXJ5IiwiY29sbGVjdGlvbkJveCIsImVhc3lNb2RlIiwicmVzZXRLaXRzQW5kQm94ZXMiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIktpdENvbGxlY3Rpb24uanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjAtMjAyMSwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogUmVwcmVzZW50cyBhIG1haW4gcnVubmluZyBtb2RlbCBmb3IgdGhlIDFzdCB0d28gdGFicy4gQ29udGFpbnMgYSBjb2xsZWN0aW9uIG9mIGtpdHMgYW5kIGJveGVzLiBLaXRzIGFyZSByZXNwb25zaWJsZVxyXG4gKiBmb3IgdGhlaXIgYnVja2V0cyBhbmQgYXRvbXMuXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cclxuICogQGF1dGhvciBEZW56ZWxsIEJhcm5ldHQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IEJvb2xlYW5Qcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0Jvb2xlYW5Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCBidWlsZEFNb2xlY3VsZSBmcm9tICcuLi8uLi9idWlsZEFNb2xlY3VsZS5qcyc7XHJcbmltcG9ydCBCQU1RdWVyeVBhcmFtZXRlcnMgZnJvbSAnLi4vQkFNUXVlcnlQYXJhbWV0ZXJzLmpzJztcclxuXHJcbmxldCBjdXJyZW50SWQgPSAwO1xyXG5cclxuY2xhc3MgS2l0Q29sbGVjdGlvbiB7XHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBvcHRpb25zICkge1xyXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XHJcbiAgICAgIGVuYWJsZUN1ZXM6IGZhbHNlIC8vIERldGVybWluZXMgaWYgdGhlIGFycm93IGN1ZXMgc2hvdWxkIGJlIHNob3duXHJcbiAgICB9LCBvcHRpb25zICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7bnVtYmVyfVxyXG4gICAgdGhpcy5pZCA9IGN1cnJlbnRJZCsrO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge0FycmF5LjxLaXQ+fVxyXG4gICAgdGhpcy5raXRzID0gW107XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7QXJyYXkuPENvbGxlY3Rpb25Cb3g+fVxyXG4gICAgdGhpcy5jb2xsZWN0aW9uQm94ZXMgPSBbXTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7Ym9vbGVhbn0gT25seSBzaG93IGEgYmxpbmtpbmcgaGlnaGxpZ2h0IG9uY2VcclxuICAgIHRoaXMuaGFzQmxpbmtlZE9uY2UgPSBmYWxzZTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtQcm9wZXJ0eS48Ym9vbGVhbj59IC0gdGhpcyB3aWxsIHJlbWFpbiBmYWxzZSBpZiB3ZSBoYXZlIG5vIGNvbGxlY3Rpb24gYm94ZXNcclxuICAgIHRoaXMuYWxsQ29sbGVjdGlvbkJveGVzRmlsbGVkUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCBmYWxzZSApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1Byb3BlcnR5LjxLaXR8bnVsbD59XHJcbiAgICB0aGlzLmN1cnJlbnRLaXRQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggbnVsbCApO1xyXG5cclxuICAgIC8vIFN3YXAgdGhlIGN1cnJlbnQga2l0IGFuZCB1cGRhdGUgdGhlIHZpc2liaWxpdHkgb2YgdGhlIGN1ZSBub2RlcyBpbiB0aGUgY29sbGVjdGlvbiBib3hlc1xyXG4gICAgdGhpcy5jdXJyZW50S2l0UHJvcGVydHkubGF6eUxpbmsoICggbmV3S2l0LCBvbGRLaXQgKSA9PiB7XHJcbiAgICAgIGlmICggb2xkS2l0ICkge1xyXG4gICAgICAgIG9sZEtpdC5hY3RpdmVQcm9wZXJ0eS52YWx1ZSA9IGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICggbmV3S2l0ICkge1xyXG4gICAgICAgIG5ld0tpdC5hY3RpdmVQcm9wZXJ0eS52YWx1ZSA9IHRydWU7XHJcblxyXG4gICAgICAgIC8vIERldGVybWluZSB0aGUgdmlzaWJpbGl0eSBvZiB0aGUgYXJyb3cgY3VlcyB3aGVuIHN3aXRjaGluZyB0byBuZXcga2l0XHJcbiAgICAgICAgdGhpcy5jb2xsZWN0aW9uQm94ZXMuZm9yRWFjaCggYm94ID0+IHtcclxuICAgICAgICAgIGJveC5jdWVWaXNpYmlsaXR5UHJvcGVydHkucmVzZXQoKTtcclxuICAgICAgICAgIG5ld0tpdC5tb2xlY3VsZXMuZm9yRWFjaCggbW9sZWN1bGUgPT4ge1xyXG5cclxuICAgICAgICAgICAgLy8gT25seSBoYW5kbGUgdmlzaWJpbGl0eSBmb3IgdGhlIGZpcnN0IGNvbGxlY3Rpb25cclxuICAgICAgICAgICAgaWYgKCBtb2xlY3VsZSAmJiBvcHRpb25zLmVuYWJsZUN1ZXMgPT09IHRydWUgJiYgYm94LndpbGxBbGxvd01vbGVjdWxlRHJvcCggbW9sZWN1bGUgKSApIHtcclxuICAgICAgICAgICAgICBib3guY3VlVmlzaWJpbGl0eVByb3BlcnR5LnZhbHVlID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSApO1xyXG4gICAgICAgIH0gKTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFkZCBhIGtpdCB0byB0aGlzIGtpdCBjb2xsZWN0aW9uLiBIZXJlIGlzIHdoZXJlIHdlIGFkZCBsaXN0ZW5lcnMgdG8gdGhlIGFkZGVkIGtpdFxyXG4gICAqIEBwYXJhbSB7S2l0fSBraXRcclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICpcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgYWRkS2l0KCBraXQsIG9wdGlvbnMgKSB7XHJcbiAgICB0aGlzLmtpdHMucHVzaCgga2l0ICk7XHJcbiAgICBjb25zdCBkcm9wTGlzdGVuZXIgPSBhdG9tID0+IHtcclxuXHJcbiAgICAgIC8vIGRvbid0IGRyb3AgYW4gYXRvbSBmcm9tIHRoZSBraXQgdG8gdGhlIGNvbGxlY3Rpb24gYm94IGRpcmVjdGx5XHJcbiAgICAgIGlmICgga2l0LmlzQXRvbUluUGxheSggYXRvbSApICkge1xyXG4gICAgICAgIGNvbnN0IG1vbGVjdWxlID0ga2l0LmdldE1vbGVjdWxlKCBhdG9tICk7XHJcblxyXG4gICAgICAgIC8vIGNoZWNrIHRvIHNlZSBpZiB3ZSBhcmUgdHJ5aW5nIHRvIGRyb3AgaXQgaW4gYSBjb2xsZWN0aW9uIGJveC5cclxuICAgICAgICBjb25zdCBudW1Cb3hlcyA9IHRoaXMuY29sbGVjdGlvbkJveGVzLmxlbmd0aDtcclxuICAgICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBudW1Cb3hlczsgaSsrICkge1xyXG4gICAgICAgICAgY29uc3QgYm94ID0gdGhpcy5jb2xsZWN0aW9uQm94ZXNbIGkgXTtcclxuXHJcbiAgICAgICAgICAvLyBwZXJtaXNzaXZlLCBzbyB0aGF0IGlmIHRoZSBib3ggYm91bmRzIGFuZCBtb2xlY3VsZSBib3VuZHMgaW50ZXJzZWN0LCB3ZSBjYWxsIGl0IGEgJ2hpdCdcclxuICAgICAgICAgIGlmICggYm94LmRyb3BCb3VuZHNQcm9wZXJ0eS52YWx1ZS5pbnRlcnNlY3RzQm91bmRzKCBtb2xlY3VsZS5wb3NpdGlvbkJvdW5kcyApICkge1xyXG5cclxuICAgICAgICAgICAgLy8gaWYgb3VyIGJveCB0YWtlcyB0aGlzIHR5cGUgb2YgbW9sZWN1bGVcclxuICAgICAgICAgICAgaWYgKCBib3gud2lsbEFsbG93TW9sZWN1bGVEcm9wKCBtb2xlY3VsZSApICkge1xyXG4gICAgICAgICAgICAgIGtpdC5tb2xlY3VsZVB1dEluQ29sbGVjdGlvbkJveCggbW9sZWN1bGUsIGJveCApO1xyXG4gICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIC8vIEFkZCBkcm9wcGVkIGxpc3RlbmVycyBmb3IgZWFjaCBhdG9tIGluIHRoaXMga2l0XHJcbiAgICBraXQuYXRvbXMuZm9yRWFjaCggYXRvbSA9PiB7XHJcbiAgICAgIGF0b20uZHJvcHBlZEJ5VXNlckVtaXR0ZXIuYWRkTGlzdGVuZXIoIGRyb3BMaXN0ZW5lciApO1xyXG4gICAgfSApO1xyXG5cclxuXHJcbiAgICAvLyBDeWNsZSB0aHJvdWdoIG1vbGVjdWxlcyBpbiB0aGUgcGxheSBhcmVhIGFuZCBjaGVjayBpZiB0aGUgYXJyb3cgY3VlIG5lZWRzIHRvIGJlIHVwZGF0ZWRcclxuICAgIGtpdC5hZGRlZE1vbGVjdWxlRW1pdHRlci5hZGRMaXN0ZW5lciggKCkgPT4ge1xyXG4gICAgICB0aGlzLmNvbGxlY3Rpb25Cb3hlcy5mb3JFYWNoKCBib3ggPT4ge1xyXG4gICAgICAgIGtpdC5tb2xlY3VsZXMuZm9yRWFjaCggbW9sZWN1bGUgPT4ge1xyXG5cclxuICAgICAgICAgIC8vIEFkZGVkIG1vbGVjdWxlcyBzaG91bGQgdHJpZ2dlciBhbiBhcnJvdyBjdWUgaWYgaXQgY2FuIGJlIGRyb3BwZWQgaW4gYSBjb2xsZWN0aW9uIGJveFxyXG4gICAgICAgICAgaWYgKCBib3gud2lsbEFsbG93TW9sZWN1bGVEcm9wKCBtb2xlY3VsZSApICYmICggb3B0aW9ucyAmJiBvcHRpb25zLnRyaWdnZXJDdWUgKSApIHtcclxuICAgICAgICAgICAgYm94LmN1ZVZpc2liaWxpdHlQcm9wZXJ0eS52YWx1ZSA9IHRydWU7XHJcblxyXG4gICAgICAgICAgICAvLyBUcmlnZ2VyIGJveCBibGlua2luZyBvbmx5IGlmIGl0IGhhcyBub3QgYmxpbmtlZCBhbHJlYWR5XHJcbiAgICAgICAgICAgIGlmICggIXRoaXMuaGFzQmxpbmtlZE9uY2UgKSB7XHJcbiAgICAgICAgICAgICAgYm94LmFjY2VwdGVkTW9sZWN1bGVDcmVhdGlvbkVtaXR0ZXIuZW1pdCggbW9sZWN1bGUgKTtcclxuICAgICAgICAgICAgICB0aGlzLmhhc0JsaW5rZWRPbmNlID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gKTtcclxuXHJcbiAgICAgICAgLy8gQWxsIGJveGVzIHNob3VsZCBub3Qgc2hvdyBhbiBhcnJvdyBjdWUgaWYgdGhlIGJveCBpcyBmdWxsXHJcbiAgICAgICAgaWYgKCBib3guaXNGdWxsKCkgKSB7XHJcbiAgICAgICAgICBib3guY3VlVmlzaWJpbGl0eVByb3BlcnR5LnZhbHVlID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICB9ICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gV2hlbiBhIG1vbGVjdWxlIGlzIHJlbW92ZWQgd2UgbmVlZCB0byBjaGVjayBhbGwgb2YgdGhlIG1vbGVjdWxlcyByZW1haW5pbmcgdG8gZGV0ZXJtaW5lIGlmIHRoZXkgY291bGRcclxuICAgIC8vIHBvc3NpYmx5IGdvIGluIG9uZSBvZiB0aGUgY29sbGVjdGlvbiBveGVzLlxyXG4gICAga2l0LnJlbW92ZWRNb2xlY3VsZUVtaXR0ZXIuYWRkTGlzdGVuZXIoIG1vbGVjdWxlID0+IHtcclxuICAgICAgdGhpcy5jb2xsZWN0aW9uQm94ZXMuZm9yRWFjaCggYm94ID0+IHtcclxuXHJcbiAgICAgICAgLy8gSGlkZSBhcnJvdyBjdWVzIGZvciB0aGUgcmVtb3ZlZCBtb2xlY3VsZS4gVGhpcyB3b3JrcyBpbmRlcGVuZGVudGx5IGZyb20gb3RoZXIgbW9sZWN1bGVzIHRoYXQgYXJlIHByZXNlbnRcclxuICAgICAgICAvLyBpbiB0aGUga2l0IHBsYXkgYXJlYS5cclxuICAgICAgICBpZiAoIGJveC53aWxsQWxsb3dNb2xlY3VsZURyb3AoIG1vbGVjdWxlICkgJiYgbW9sZWN1bGUgJiYgKCBvcHRpb25zICYmIG9wdGlvbnMudHJpZ2dlckN1ZSApICkge1xyXG4gICAgICAgICAgYm94LmN1ZVZpc2liaWxpdHlQcm9wZXJ0eS52YWx1ZSA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gQ3ljbGUgdGhyb3VnaCBhbGwgdGhlIHJlbWFpbmluZyBtb2xlY3VsZXMgYW5kIHRyaWdnZXIgdGhlIGFycm93IGN1ZSBpZiB0aGUgbW9sZWN1bGUgZXhpc3RzIGluIHRoZVxyXG4gICAgICAgIC8vIGtpdCBwbGF5IGFyZWEuXHJcbiAgICAgICAga2l0Lm1vbGVjdWxlcy5mb3JFYWNoKCByZW1haW5pbmdNb2xlY3VsZSA9PiB7XHJcbiAgICAgICAgICBpZiAoIGJveC53aWxsQWxsb3dNb2xlY3VsZURyb3AoIHJlbWFpbmluZ01vbGVjdWxlICkgJiYgbW9sZWN1bGUgJiYgKCBvcHRpb25zICYmIG9wdGlvbnMudHJpZ2dlckN1ZSApICkge1xyXG4gICAgICAgICAgICBib3guY3VlVmlzaWJpbGl0eVByb3BlcnR5LnZhbHVlID0gYm94LndpbGxBbGxvd01vbGVjdWxlRHJvcCggcmVtYWluaW5nTW9sZWN1bGUgKSAmJiByZW1haW5pbmdNb2xlY3VsZSAmJiAoIG9wdGlvbnMgJiYgb3B0aW9ucy50cmlnZ2VyQ3VlICk7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgLy8gTGFzdCBzYW5pdHkgY2hlY2sgdG8gbWFrZSBzdXJlIGEgZnVsbCBib3ggZG9lc24ndCBoYXZlIGFuIGFycm93IGN1ZSBzaG93bi5cclxuICAgICAgICAgIGlmICggYm94LmlzRnVsbCgpICkge1xyXG4gICAgICAgICAgICBib3guY3VlVmlzaWJpbGl0eVByb3BlcnR5LnZhbHVlID0gZmFsc2U7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSApO1xyXG4gICAgICB9ICk7XHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBZGQgYSBjb2xsZWN0aW9uIGJveFxyXG4gICAqIEBwYXJhbSB7Q29sbGVjdGlvbkJveH0gYm94XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGFkZENvbGxlY3Rpb25Cb3goIGJveCApIHtcclxuICAgIHRoaXMuY29sbGVjdGlvbkJveGVzLnB1c2goIGJveCApO1xyXG5cclxuICAgIC8vIGxpc3RlbiB0byB3aGVuIG91ciBjb2xsZWN0aW9uIGJveGVzIGNoYW5nZSwgc28gdGhhdCB3ZSBjYW4gaWRlbnRpZnkgd2hlbiBhbGwgb2Ygb3VyIGNvbGxlY3Rpb24gYm94ZXMgYXJlIGZpbGxlZFxyXG4gICAgYm94LnF1YW50aXR5UHJvcGVydHkubGF6eUxpbmsoICgpID0+IHtcclxuICAgICAgY29uc3QgYWxsRnVsbCA9IF8uZXZlcnkoIHRoaXMuY29sbGVjdGlvbkJveGVzLCBjb2xsZWN0aW9uQm94ID0+IHtcclxuICAgICAgICByZXR1cm4gY29sbGVjdGlvbkJveC5pc0Z1bGwoKTtcclxuICAgICAgfSApO1xyXG5cclxuICAgICAgLy8gVXNlZCBmb3IgZGVidWdnaW5nLlxyXG4gICAgICBpZiAoIEJBTVF1ZXJ5UGFyYW1ldGVycy5lYXN5TW9kZSApIHtcclxuICAgICAgICB0aGlzLmFsbENvbGxlY3Rpb25Cb3hlc0ZpbGxlZFByb3BlcnR5LnZhbHVlID0gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICB0aGlzLmFsbENvbGxlY3Rpb25Cb3hlc0ZpbGxlZFByb3BlcnR5LnZhbHVlID0gdGhpcy5jb2xsZWN0aW9uQm94ZXMubGVuZ3RoICYmIGFsbEZ1bGw7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlc2V0IHRoaXMga2l0Q29sbGVjdGlvblxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICByZXNldCgpIHtcclxuICAgIHRoaXMuY29sbGVjdGlvbkJveGVzLmZvckVhY2goIGJveCA9PiB7IGJveC5yZXNldCgpOyB9ICk7XHJcbiAgICB0aGlzLmtpdHMuZm9yRWFjaCgga2l0ID0+IHsga2l0LnJlc2V0KCk7IH0gKTtcclxuICAgIHRoaXMuaGFzQmxpbmtlZE9uY2UgPSBmYWxzZTtcclxuICAgIHRoaXMuYWxsQ29sbGVjdGlvbkJveGVzRmlsbGVkUHJvcGVydHkucmVzZXQoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlc2V0IG9ubHkgdGhlIGtpdHMgYW5kIGJveGVzXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHJlc2V0S2l0c0FuZEJveGVzKCkge1xyXG4gICAgdGhpcy5raXRzLmZvckVhY2goIGtpdCA9PiB7XHJcbiAgICAgIGtpdC5yZXNldCgpO1xyXG4gICAgfSApO1xyXG4gICAgdGhpcy5jb2xsZWN0aW9uQm94ZXMuZm9yRWFjaCggYm94ID0+IHtcclxuICAgICAgYm94LnJlc2V0KCk7XHJcbiAgICB9ICk7XHJcbiAgfVxyXG59XHJcblxyXG5idWlsZEFNb2xlY3VsZS5yZWdpc3RlciggJ0tpdENvbGxlY3Rpb24nLCBLaXRDb2xsZWN0aW9uICk7XHJcbmV4cG9ydCBkZWZhdWx0IEtpdENvbGxlY3Rpb247Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxlQUFlLE1BQU0sd0NBQXdDO0FBQ3BFLE9BQU9DLFFBQVEsTUFBTSxpQ0FBaUM7QUFDdEQsT0FBT0MsS0FBSyxNQUFNLG1DQUFtQztBQUNyRCxPQUFPQyxjQUFjLE1BQU0seUJBQXlCO0FBQ3BELE9BQU9DLGtCQUFrQixNQUFNLDBCQUEwQjtBQUV6RCxJQUFJQyxTQUFTLEdBQUcsQ0FBQztBQUVqQixNQUFNQyxhQUFhLENBQUM7RUFDbEI7QUFDRjtBQUNBO0VBQ0VDLFdBQVdBLENBQUVDLE9BQU8sRUFBRztJQUNyQkEsT0FBTyxHQUFHTixLQUFLLENBQUU7TUFDZk8sVUFBVSxFQUFFLEtBQUssQ0FBQztJQUNwQixDQUFDLEVBQUVELE9BQVEsQ0FBQzs7SUFFWjtJQUNBLElBQUksQ0FBQ0UsRUFBRSxHQUFHTCxTQUFTLEVBQUU7O0lBRXJCO0lBQ0EsSUFBSSxDQUFDTSxJQUFJLEdBQUcsRUFBRTs7SUFFZDtJQUNBLElBQUksQ0FBQ0MsZUFBZSxHQUFHLEVBQUU7O0lBRXpCO0lBQ0EsSUFBSSxDQUFDQyxj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