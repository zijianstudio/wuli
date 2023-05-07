// Copyright 2020-2022, University of Colorado Boulder

/**
 * Main screenview for Build a Molecule. It features kits shown at the bottom and a centeralized play area for
 * building molecules.
 *
 * @author Denzell Barnett (PhET Interactive Simulations)
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Property from '../../../../axon/js/Property.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import ThreeUtils from '../../../../mobius/js/ThreeUtils.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import { DragListener } from '../../../../scenery/js/imports.js';
import buildAMolecule from '../../buildAMolecule.js';
import BAMConstants from '../BAMConstants.js';
import AtomNode from './AtomNode.js';
import KitCollectionNode from './KitCollectionNode.js';
import KitPlayAreaNode from './KitPlayAreaNode.js';
import MoleculeControlsHBox from './MoleculeControlsHBox.js';
import RefillButton from './RefillButton.js';
import Molecule3DDialog from './view3d/Molecule3DDialog.js';
import WarningDialog from './WarningDialog.js';
class BAMScreenView extends ScreenView {
  /**
   * @param {BAMModel} bamModel
   */
  constructor(bamModel) {
    super();
    // @public {Object.<atomId:number, AtomNode>}
    this.atomNodeMap = {}; // maps Atom2 ID => AtomNode

    // @public {Object.<kitCollectionId:number, KitCollectionNode}
    this.kitCollectionMap = {};

    // @private {Object.<kitID:number,function>}
    this.addedEmitterListeners = {};

    // @private {Object.<kitID:number,function>}
    this.removedEmitterListeners = {};

    // @public {BAMModel} Initialize and add the kit collection
    this.bamModel = bamModel;
    this.addCollection(bamModel.currentCollectionProperty.value, false);

    // @public {Bounds2} Bounds used to limit where molecules can reside in the play area.
    this.atomDragBounds = new Bounds2(-1575, -850, 1575, 950);
    this.mappedKitCollectionBounds = this.kitCollectionMap[this.bamModel.currentCollectionProperty.value.id].bounds.dilatedX(60);

    // @public {Molecule3DDialog| WarningDialog } Used for representing 3D molecules.
    // Only create a dialog if webgl is enabled. See https://github.com/phetsims/build-a-molecule/issues/105
    this.dialog = ThreeUtils.isWebGLEnabled() ? new Molecule3DDialog(bamModel.dialogMolecule) : new WarningDialog();

    // @public {function} Reference to callback that displays dialog for 3d node representation
    this.showDialogCallback = this.showDialog.bind(this);

    // KitPlayAreaNode for the main BAMScreenView listens to the kitPlayArea of each kit in the model to fill or remove
    // its content.
    const kits = [];

    // @public {KitPlayAreaNode} Create a play area to house the molecules.
    this.kitPlayAreaNode = new KitPlayAreaNode(kits);
    bamModel.currentCollectionProperty.link((newCollection, oldCollection) => {
      if (oldCollection) {
        // Check if a KitCollectionNode exists and remove it.
        this.children.forEach(child => {
          if (child instanceof KitCollectionNode) {
            this.removeChild(child);
          }
        });
      }

      // Add a new collection
      if (newCollection) {
        this.addChild(this.kitCollectionMap[newCollection.id]);
      }

      // Set the current kit of the KitPlayAreaNode
      this.kitPlayAreaNode.currentKit = newCollection.currentKitProperty.value;
    });
    bamModel.addedCollectionEmitter.addListener(this.addCollection.bind(this));
    this.addChild(this.kitPlayAreaNode);

    // Create a button to refill the kit
    const refillListener = () => {
      this.interruptSubtreeInput();
      this.kitPlayAreaNode.resetPlayAreaKit();
      this.kitPlayAreaNode.currentKit.buckets.forEach(bucket => {
        bucket.setToFullState();
      });
      bamModel.currentCollectionProperty.value.collectionBoxes.forEach(box => {
        box.cueVisibilityProperty.value = false;
      });
      this.updateRefillButton();
    };

    // Create a kit panel to house the kit carousel
    const kitPanel = this.kitCollectionMap[bamModel.currentCollectionProperty.value.id].kitPanel;

    // @private {RefillButton} Create a button to refill the kit buckets with atoms
    this.refillButton = new RefillButton(refillListener, {
      left: kitPanel.left,
      bottom: kitPanel.top - 7,
      scale: 0.85
    });
    this.refillButton.touchArea = this.refillButton.selfBounds.union(this.refillButton.childBounds).dilated(10);

    // @public {function} Refill button is enabled if atoms exists outside of the bucket
    this.updateRefillButton = () => {
      this.refillButton.enabled = !this.bamModel.currentCollectionProperty.value.currentKitProperty.value.allBucketsFilled();
    };

    // @public {ResetAllButton} Create a reset all button. Position of button is adjusted on "Larger" Screen.
    this.resetAllButton = new ResetAllButton({
      listener: () => {
        this.interruptSubtreeInput();

        // When clicked, empty collection boxes
        bamModel.currentCollectionProperty.value.collectionBoxes.forEach(box => {
          box.reset();
        });
        bamModel.currentCollectionProperty.value.kits.forEach(kit => {
          kit.reset();
        });
        bamModel.reset();
        kitPanel.reset();
        if (this.dialog instanceof Molecule3DDialog) {
          this.dialog.isPlayingProperty.reset();
          this.dialog.viewStyleProperty.reset();
        }
        this.updateRefillButton();

        // If the nextCollectionButton is present on screen hide it.
        if (_.includes(this.children, this.nextCollectionButton)) {
          this.nextCollectionButton.visible = false;
        }
      },
      right: this.layoutBounds.right - BAMConstants.VIEW_PADDING / 2,
      bottom: kitPanel.bottom + BAMConstants.VIEW_PADDING / 4
    });
    this.resetAllButton.touchArea = this.resetAllButton.bounds.dilated(7);
    this.addChild(this.resetAllButton);
    this.resetAllButton.moveToBack();
    this.addChild(this.refillButton);

    /**
     * Handles adding molecules and molecule metadata to kit play area.
     * @param {Molecule} molecule
     * @param {Kit} kit
     */
    const addedMoleculeListener = (molecule, kit) => {
      if (molecule.atoms.length > 1) {
        // Only create this if there are multiple atoms
        const moleculeControlsHBox = new MoleculeControlsHBox(kit, molecule, this.showDialogCallback);
        this.kitPlayAreaNode.metadataLayer.addChild(moleculeControlsHBox);
        this.kitPlayAreaNode.metadataMap[molecule.moleculeId] = moleculeControlsHBox;
        this.kitPlayAreaNode.addMoleculeBondNodes(molecule);
      }
    };

    /**
     * Handles removing molecules and molecule metadata to kit play area.
     * @param {Molecule} molecule
     */
    const removedMoleculeListener = molecule => {
      const moleculeControlsHBox = this.kitPlayAreaNode.metadataMap[molecule.moleculeId];
      if (moleculeControlsHBox) {
        this.kitPlayAreaNode.metadataLayer.removeChild(moleculeControlsHBox);
        moleculeControlsHBox.dispose();
        delete this.kitPlayAreaNode.metadataMap[molecule.moleculeId];
        this.kitPlayAreaNode.removeMoleculeBondNodes(molecule);
      }
    };

    /**
     * Handles adding atoms to play area and updates the refill button accordingly
     * @param {Atom2} atom
     */
    const addAtomNodeToPlayArea = atom => {
      this.addAtomNodeToPlayArea(atom);
      this.updateRefillButton();
    };

    /**
     * Handles adding atoms to play area and updates the refill button accordingly
     * @param {Atom2} atom
     */
    const removeAtomNodeFromPlayArea = atom => {
      this.onAtomRemovedFromPlayArea(atom);
      this.updateRefillButton();
    };

    // When a collection is changed, update the listeners for the kits and KitPlayAreaNode.
    bamModel.currentCollectionProperty.link((collection, previousCollection) => {
      this.kitPlayAreaNode.atomLayer.children.forEach(otherAtomNode => {
        if (otherAtomNode) {
          otherAtomNode.interruptSubtreeInput();
          otherAtomNode.atom.userControlledProperty.value = false;
        }
      });
      if (previousCollection) {
        previousCollection.kits.forEach(kit => {
          // Reset the kit before managing its listeners
          kit.reset();

          // Removed previous listeners related to metadataLayer creation and deletion.
          kit.addedMoleculeEmitter.removeListener(this.addedEmitterListeners[kit.id]);
          kit.removedMoleculeEmitter.removeListener(this.removedEmitterListeners[kit.id]);
          delete this.addedEmitterListeners[kit.id];
          delete this.removedEmitterListeners[kit.id];

          // Remove listeners for adding/removing atoms to play area
          kit.atomsInPlayArea.removeItemAddedListener(addAtomNodeToPlayArea);
          kit.atomsInPlayArea.removeItemRemovedListener(removeAtomNodeFromPlayArea);
        });
      }

      // KitPlayAreaNode kits should be updated to the kits in the new collection.
      this.kitPlayAreaNode.kitsProperty.value = collection.kits;
      collection.kits.forEach(kit => {
        // Handle metadataLayer creation and destruction.
        const addedEmitterListener = molecule => {
          addedMoleculeListener(molecule, kit);
        };
        kit.addedMoleculeEmitter.addListener(addedEmitterListener);
        this.addedEmitterListeners[kit.id] = addedEmitterListener;

        // Handle deleting metadataLayer
        const removedEmitterListener = molecule => {
          removedMoleculeListener(molecule, kit);
        };
        kit.removedMoleculeEmitter.addListener(removedEmitterListener);
        this.removedEmitterListeners[kit.id] = removedEmitterListener;

        // Reset our kitPlayAreaNode for the new collection
        this.kitPlayAreaNode.resetPlayAreaKit();
        this.kitPlayAreaNode.currentKit = collection.currentKitProperty.value;
        this.kitPlayAreaNode.moveToFront();

        // Used for tracking kits in KitPlayAreaNode
        kits.push(kit);

        // Each kit gets listeners for managing its play area.
        kit.atomsInPlayArea.addItemAddedListener(addAtomNodeToPlayArea);
        kit.atomsInPlayArea.addItemRemovedListener(removeAtomNodeFromPlayArea);

        // KitPlayAreaNode should update their kits
        collection.currentKitProperty.link(kit => {
          this.kitPlayAreaNode.currentKit = kit;
          this.updateRefillButton();
        });
        this.updateRefillButton();
      });
    });

    // @private {function} listener for 'click outside to dismiss'
    this.clickToDismissListener = {
      down: () => {
        bamModel.currentCollectionProperty.value.currentKitProperty.value.selectedAtomProperty.value = null;
      }
    };
    phet.joist.display.addInputListener(this.clickToDismissListener);
    kitPanel.kitCarousel.pageNumberProperty.link(() => {
      this.interruptSubtreeInput();
    });
  }

  /**
   * @param {number} dt
   *
   * @public
   */
  step(dt) {
    if (this.dialog && ThreeUtils.isWebGLEnabled()) {
      this.dialog.step(dt);
    }

    // Update the visibility of the cues in each collection box
    let hasTargetMolecule = false;
    this.bamModel.currentCollectionProperty.value.collectionBoxes.forEach(box => {
      this.kitPlayAreaNode.currentKit.molecules.forEach(molecule => {
        hasTargetMolecule = molecule ? box.willAllowMoleculeDrop(molecule) : hasTargetMolecule || false;
      });
    });
  }

  /**
   * Responsible for showing 3d representation of molecule.
   * @param {CompleteMolecule} completeMolecule
   *
   * @private
   */
  showDialog(completeMolecule) {
    // Bail if we don't have a dialog, due to a lack of webgl support. See https://github.com/phetsims/build-a-molecule/issues/105
    if (this.dialog) {
      if (ThreeUtils.isWebGLEnabled()) {
        this.dialog.completeMoleculeProperty.value = completeMolecule;
      }
      this.dialog.show();
    }
  }

  /**
   * Add a collection to the kitCollectionNode
   * @param {KitCollection} collection
   * @param {boolean} isCollectingView
   *
   * @private
   * @returns {KitCollectionNode}
   */
  addCollection(collection, isCollectingView) {
    const kitCollectionNode = new KitCollectionNode(collection, this, isCollectingView);
    this.kitCollectionMap[collection.id] = kitCollectionNode;

    // supposedly: return this so we can manipulate it in an override....?
    return kitCollectionNode;
  }

  /**
   * Fill the play area with an atom and map the atom to an atomNode
   * @param {Atom2} atom
   *
   * @private
   * @returns {AtomNode}
   */
  addAtomNodeToPlayAreaNode(atom) {
    const atomNode = new AtomNode(atom);
    this.kitPlayAreaNode.atomLayer.addChild(atomNode);
    this.kitPlayAreaNode.atomNodeMap[atom.id] = atomNode;
    return atomNode;
  }

  /**
   * Add an atom to the play area in the model. Handled via a drag listener.
   * @param {Atom2} atom
   *
   * @private
   * @returns {AtomNode}
   */
  addAtomNodeToPlayArea(atom) {
    const currentKit = this.bamModel.currentCollectionProperty.value.currentKitProperty.value;
    const atomNode = this.addAtomNodeToPlayAreaNode(atom);
    let lastPosition;

    // Track the length of a drag in model units
    let dragLength = 0;
    const atomListener = new DragListener({
      transform: BAMConstants.MODEL_VIEW_TRANSFORM,
      targetNode: atomNode,
      allowTouchSnag: false,
      dragBoundsProperty: new Property(this.atomDragBounds),
      positionProperty: atom.positionProperty,
      start: () => {
        // Interrupt drag events on other atom nodes
        this.kitPlayAreaNode.atomLayer.children.forEach(otherAtomNode => {
          if (otherAtomNode && atomNode !== otherAtomNode) {
            otherAtomNode.interruptSubtreeInput();
            otherAtomNode.atom.userControlledProperty.value = false;
          }
        });
        dragLength = 0;
        atom.destinationProperty.value = atom.positionProperty.value;

        // Get atom position before drag
        lastPosition = atom.positionProperty.value;

        // If a molecule is animating interrupt the animation process.
        atom.userControlledProperty.value = true;
        const molecule = currentKit.getMolecule(atom);
        if (molecule) {
          molecule.atoms.forEach(moleculeAtom => {
            if (moleculeAtom) {
              this.kitPlayAreaNode.atomNodeMap[moleculeAtom.id].moveToFront();
              moleculeAtom.destinationProperty.value = moleculeAtom.positionProperty.value;
            }
          });
        }

        // Update the current kit in the play area node.
        this.kitPlayAreaNode.currentKit = currentKit;
      },
      drag: (event, listener) => {
        dragLength += listener.modelDelta.getMagnitude();

        // Get delta from start of drag
        const delta = atom.positionProperty.value.minus(lastPosition);
        atom.destinationProperty.value = atom.positionProperty.value;

        // Set the last position to the newly dragged position.
        lastPosition = atom.positionProperty.value;

        // Handles molecules with multiple atoms
        const molecule = currentKit.getMolecule(atom);
        if (molecule) {
          molecule.atoms.forEach(moleculeAtom => {
            if (moleculeAtom !== atom) {
              moleculeAtom.translatePositionAndDestination(delta);
            }
          });
          atomNode.moveToFront();
        } else {
          atomNode.moveToFront();
        }
      },
      end: () => {
        // Threshold for how much we can drag before considering an atom selected
        if (dragLength < BAMConstants.DRAG_LENGTH_THRESHOLD && currentKit.getMolecule(atom).bonds.length !== 0) {
          currentKit.selectedAtomProperty.value = atom;
        }

        // Consider an atom released and mark its position
        atom.userControlledProperty.value = false;

        // Keep track of view elements used later in the callback
        const mappedAtomNode = this.kitPlayAreaNode.atomNodeMap[atom.id];

        // Responsible for dropping molecules in play area or kit area
        const droppedInKitArea = mappedAtomNode && mappedAtomNode.bounds.intersectsBounds(this.mappedKitCollectionBounds);

        // Responsible for bonding molecules in play area or breaking molecule bonds and returning to kit.
        // We don't want to do this while the molecule is animating.
        currentKit.atomDropped(atom, droppedInKitArea);

        // Make sure to update the update button after moving atoms
        this.updateRefillButton();
      }
    });
    atomNode.dragListener = atomListener;
    atomNode.addInputListener(atomListener);
  }

  /**
   * Removes atom elements from view.
   *
   * @param {Atom2} atom
   * @private
   */
  onAtomRemovedFromPlayArea(atom) {
    // Remove mapped atom node from the view and dispose it.
    const atomNode = this.kitPlayAreaNode.atomNodeMap[atom.id];
    atomNode.dragListener.dispose();
    atomNode.dispose();
    delete this.kitPlayAreaNode.atomNodeMap[atom.id];
  }
}
buildAMolecule.register('BAMScreenView', BAMScreenView);
export default BAMScreenView;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm9wZXJ0eSIsIkJvdW5kczIiLCJTY3JlZW5WaWV3IiwiVGhyZWVVdGlscyIsIlJlc2V0QWxsQnV0dG9uIiwiRHJhZ0xpc3RlbmVyIiwiYnVpbGRBTW9sZWN1bGUiLCJCQU1Db25zdGFudHMiLCJBdG9tTm9kZSIsIktpdENvbGxlY3Rpb25Ob2RlIiwiS2l0UGxheUFyZWFOb2RlIiwiTW9sZWN1bGVDb250cm9sc0hCb3giLCJSZWZpbGxCdXR0b24iLCJNb2xlY3VsZTNERGlhbG9nIiwiV2FybmluZ0RpYWxvZyIsIkJBTVNjcmVlblZpZXciLCJjb25zdHJ1Y3RvciIsImJhbU1vZGVsIiwiYXRvbU5vZGVNYXAiLCJraXRDb2xsZWN0aW9uTWFwIiwiYWRkZWRFbWl0dGVyTGlzdGVuZXJzIiwicmVtb3ZlZEVtaXR0ZXJMaXN0ZW5lcnMiLCJhZGRDb2xsZWN0aW9uIiwiY3VycmVudENvbGxlY3Rpb25Qcm9wZXJ0eSIsInZhbHVlIiwiYXRvbURyYWdCb3VuZHMiLCJtYXBwZWRLaXRDb2xsZWN0aW9uQm91bmRzIiwiaWQiLCJib3VuZHMiLCJkaWxhdGVkWCIsImRpYWxvZyIsImlzV2ViR0xFbmFibGVkIiwiZGlhbG9nTW9sZWN1bGUiLCJzaG93RGlhbG9nQ2FsbGJhY2siLCJzaG93RGlhbG9nIiwiYmluZCIsImtpdHMiLCJraXRQbGF5QXJlYU5vZGUiLCJsaW5rIiwibmV3Q29sbGVjdGlvbiIsIm9sZENvbGxlY3Rpb24iLCJjaGlsZHJlbiIsImZvckVhY2giLCJjaGlsZCIsInJlbW92ZUNoaWxkIiwiYWRkQ2hpbGQiLCJjdXJyZW50S2l0IiwiY3VycmVudEtpdFByb3BlcnR5IiwiYWRkZWRDb2xsZWN0aW9uRW1pdHRlciIsImFkZExpc3RlbmVyIiwicmVmaWxsTGlzdGVuZXIiLCJpbnRlcnJ1cHRTdWJ0cmVlSW5wdXQiLCJyZXNldFBsYXlBcmVhS2l0IiwiYnVja2V0cyIsImJ1Y2tldCIsInNldFRvRnVsbFN0YXRlIiwiY29sbGVjdGlvbkJveGVzIiwiYm94IiwiY3VlVmlzaWJpbGl0eVByb3BlcnR5IiwidXBkYXRlUmVmaWxsQnV0dG9uIiwia2l0UGFuZWwiLCJyZWZpbGxCdXR0b24iLCJsZWZ0IiwiYm90dG9tIiwidG9wIiwic2NhbGUiLCJ0b3VjaEFyZWEiLCJzZWxmQm91bmRzIiwidW5pb24iLCJjaGlsZEJvdW5kcyIsImRpbGF0ZWQiLCJlbmFibGVkIiwiYWxsQnVja2V0c0ZpbGxlZCIsInJlc2V0QWxsQnV0dG9uIiwibGlzdGVuZXIiLCJyZXNldCIsImtpdCIsImlzUGxheWluZ1Byb3BlcnR5Iiwidmlld1N0eWxlUHJvcGVydHkiLCJfIiwiaW5jbHVkZXMiLCJuZXh0Q29sbGVjdGlvbkJ1dHRvbiIsInZpc2libGUiLCJyaWdodCIsImxheW91dEJvdW5kcyIsIlZJRVdfUEFERElORyIsIm1vdmVUb0JhY2siLCJhZGRlZE1vbGVjdWxlTGlzdGVuZXIiLCJtb2xlY3VsZSIsImF0b21zIiwibGVuZ3RoIiwibW9sZWN1bGVDb250cm9sc0hCb3giLCJtZXRhZGF0YUxheWVyIiwibWV0YWRhdGFNYXAiLCJtb2xlY3VsZUlkIiwiYWRkTW9sZWN1bGVCb25kTm9kZXMiLCJyZW1vdmVkTW9sZWN1bGVMaXN0ZW5lciIsImRpc3Bvc2UiLCJyZW1vdmVNb2xlY3VsZUJvbmROb2RlcyIsImFkZEF0b21Ob2RlVG9QbGF5QXJlYSIsImF0b20iLCJyZW1vdmVBdG9tTm9kZUZyb21QbGF5QXJlYSIsIm9uQXRvbVJlbW92ZWRGcm9tUGxheUFyZWEiLCJjb2xsZWN0aW9uIiwicHJldmlvdXNDb2xsZWN0aW9uIiwiYXRvbUxheWVyIiwib3RoZXJBdG9tTm9kZSIsInVzZXJDb250cm9sbGVkUHJvcGVydHkiLCJhZGRlZE1vbGVjdWxlRW1pdHRlciIsInJlbW92ZUxpc3RlbmVyIiwicmVtb3ZlZE1vbGVjdWxlRW1pdHRlciIsImF0b21zSW5QbGF5QXJlYSIsInJlbW92ZUl0ZW1BZGRlZExpc3RlbmVyIiwicmVtb3ZlSXRlbVJlbW92ZWRMaXN0ZW5lciIsImtpdHNQcm9wZXJ0eSIsImFkZGVkRW1pdHRlckxpc3RlbmVyIiwicmVtb3ZlZEVtaXR0ZXJMaXN0ZW5lciIsIm1vdmVUb0Zyb250IiwicHVzaCIsImFkZEl0ZW1BZGRlZExpc3RlbmVyIiwiYWRkSXRlbVJlbW92ZWRMaXN0ZW5lciIsImNsaWNrVG9EaXNtaXNzTGlzdGVuZXIiLCJkb3duIiwic2VsZWN0ZWRBdG9tUHJvcGVydHkiLCJwaGV0Iiwiam9pc3QiLCJkaXNwbGF5IiwiYWRkSW5wdXRMaXN0ZW5lciIsImtpdENhcm91c2VsIiwicGFnZU51bWJlclByb3BlcnR5Iiwic3RlcCIsImR0IiwiaGFzVGFyZ2V0TW9sZWN1bGUiLCJtb2xlY3VsZXMiLCJ3aWxsQWxsb3dNb2xlY3VsZURyb3AiLCJjb21wbGV0ZU1vbGVjdWxlIiwiY29tcGxldGVNb2xlY3VsZVByb3BlcnR5Iiwic2hvdyIsImlzQ29sbGVjdGluZ1ZpZXciLCJraXRDb2xsZWN0aW9uTm9kZSIsImFkZEF0b21Ob2RlVG9QbGF5QXJlYU5vZGUiLCJhdG9tTm9kZSIsImxhc3RQb3NpdGlvbiIsImRyYWdMZW5ndGgiLCJhdG9tTGlzdGVuZXIiLCJ0cmFuc2Zvcm0iLCJNT0RFTF9WSUVXX1RSQU5TRk9STSIsInRhcmdldE5vZGUiLCJhbGxvd1RvdWNoU25hZyIsImRyYWdCb3VuZHNQcm9wZXJ0eSIsInBvc2l0aW9uUHJvcGVydHkiLCJzdGFydCIsImRlc3RpbmF0aW9uUHJvcGVydHkiLCJnZXRNb2xlY3VsZSIsIm1vbGVjdWxlQXRvbSIsImRyYWciLCJldmVudCIsIm1vZGVsRGVsdGEiLCJnZXRNYWduaXR1ZGUiLCJkZWx0YSIsIm1pbnVzIiwidHJhbnNsYXRlUG9zaXRpb25BbmREZXN0aW5hdGlvbiIsImVuZCIsIkRSQUdfTEVOR1RIX1RIUkVTSE9MRCIsImJvbmRzIiwibWFwcGVkQXRvbU5vZGUiLCJkcm9wcGVkSW5LaXRBcmVhIiwiaW50ZXJzZWN0c0JvdW5kcyIsImF0b21Ecm9wcGVkIiwiZHJhZ0xpc3RlbmVyIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJCQU1TY3JlZW5WaWV3LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIwLTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIE1haW4gc2NyZWVudmlldyBmb3IgQnVpbGQgYSBNb2xlY3VsZS4gSXQgZmVhdHVyZXMga2l0cyBzaG93biBhdCB0aGUgYm90dG9tIGFuZCBhIGNlbnRlcmFsaXplZCBwbGF5IGFyZWEgZm9yXHJcbiAqIGJ1aWxkaW5nIG1vbGVjdWxlcy5cclxuICpcclxuICogQGF1dGhvciBEZW56ZWxsIEJhcm5ldHQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqIEBhdXRob3IgSm9uYXRoYW4gT2xzb24gPGpvbmF0aGFuLm9sc29uQGNvbG9yYWRvLmVkdT5cclxuICovXHJcblxyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBCb3VuZHMyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9Cb3VuZHMyLmpzJztcclxuaW1wb3J0IFNjcmVlblZpZXcgZnJvbSAnLi4vLi4vLi4vLi4vam9pc3QvanMvU2NyZWVuVmlldy5qcyc7XHJcbmltcG9ydCBUaHJlZVV0aWxzIGZyb20gJy4uLy4uLy4uLy4uL21vYml1cy9qcy9UaHJlZVV0aWxzLmpzJztcclxuaW1wb3J0IFJlc2V0QWxsQnV0dG9uIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9idXR0b25zL1Jlc2V0QWxsQnV0dG9uLmpzJztcclxuaW1wb3J0IHsgRHJhZ0xpc3RlbmVyIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IGJ1aWxkQU1vbGVjdWxlIGZyb20gJy4uLy4uL2J1aWxkQU1vbGVjdWxlLmpzJztcclxuaW1wb3J0IEJBTUNvbnN0YW50cyBmcm9tICcuLi9CQU1Db25zdGFudHMuanMnO1xyXG5pbXBvcnQgQXRvbU5vZGUgZnJvbSAnLi9BdG9tTm9kZS5qcyc7XHJcbmltcG9ydCBLaXRDb2xsZWN0aW9uTm9kZSBmcm9tICcuL0tpdENvbGxlY3Rpb25Ob2RlLmpzJztcclxuaW1wb3J0IEtpdFBsYXlBcmVhTm9kZSBmcm9tICcuL0tpdFBsYXlBcmVhTm9kZS5qcyc7XHJcbmltcG9ydCBNb2xlY3VsZUNvbnRyb2xzSEJveCBmcm9tICcuL01vbGVjdWxlQ29udHJvbHNIQm94LmpzJztcclxuaW1wb3J0IFJlZmlsbEJ1dHRvbiBmcm9tICcuL1JlZmlsbEJ1dHRvbi5qcyc7XHJcbmltcG9ydCBNb2xlY3VsZTNERGlhbG9nIGZyb20gJy4vdmlldzNkL01vbGVjdWxlM0REaWFsb2cuanMnO1xyXG5pbXBvcnQgV2FybmluZ0RpYWxvZyBmcm9tICcuL1dhcm5pbmdEaWFsb2cuanMnO1xyXG5cclxuY2xhc3MgQkFNU2NyZWVuVmlldyBleHRlbmRzIFNjcmVlblZpZXcge1xyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7QkFNTW9kZWx9IGJhbU1vZGVsXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIGJhbU1vZGVsICkge1xyXG4gICAgc3VwZXIoKTtcclxuICAgIC8vIEBwdWJsaWMge09iamVjdC48YXRvbUlkOm51bWJlciwgQXRvbU5vZGU+fVxyXG4gICAgdGhpcy5hdG9tTm9kZU1hcCA9IHt9OyAvLyBtYXBzIEF0b20yIElEID0+IEF0b21Ob2RlXHJcblxyXG4gICAgLy8gQHB1YmxpYyB7T2JqZWN0LjxraXRDb2xsZWN0aW9uSWQ6bnVtYmVyLCBLaXRDb2xsZWN0aW9uTm9kZX1cclxuICAgIHRoaXMua2l0Q29sbGVjdGlvbk1hcCA9IHt9O1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtPYmplY3QuPGtpdElEOm51bWJlcixmdW5jdGlvbj59XHJcbiAgICB0aGlzLmFkZGVkRW1pdHRlckxpc3RlbmVycyA9IHt9O1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtPYmplY3QuPGtpdElEOm51bWJlcixmdW5jdGlvbj59XHJcbiAgICB0aGlzLnJlbW92ZWRFbWl0dGVyTGlzdGVuZXJzID0ge307XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7QkFNTW9kZWx9IEluaXRpYWxpemUgYW5kIGFkZCB0aGUga2l0IGNvbGxlY3Rpb25cclxuICAgIHRoaXMuYmFtTW9kZWwgPSBiYW1Nb2RlbDtcclxuICAgIHRoaXMuYWRkQ29sbGVjdGlvbiggYmFtTW9kZWwuY3VycmVudENvbGxlY3Rpb25Qcm9wZXJ0eS52YWx1ZSwgZmFsc2UgKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtCb3VuZHMyfSBCb3VuZHMgdXNlZCB0byBsaW1pdCB3aGVyZSBtb2xlY3VsZXMgY2FuIHJlc2lkZSBpbiB0aGUgcGxheSBhcmVhLlxyXG4gICAgdGhpcy5hdG9tRHJhZ0JvdW5kcyA9IG5ldyBCb3VuZHMyKCAtMTU3NSwgLTg1MCwgMTU3NSwgOTUwICk7XHJcbiAgICB0aGlzLm1hcHBlZEtpdENvbGxlY3Rpb25Cb3VuZHMgPSB0aGlzLmtpdENvbGxlY3Rpb25NYXBbIHRoaXMuYmFtTW9kZWwuY3VycmVudENvbGxlY3Rpb25Qcm9wZXJ0eS52YWx1ZS5pZCBdLmJvdW5kcy5kaWxhdGVkWCggNjAgKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtNb2xlY3VsZTNERGlhbG9nfCBXYXJuaW5nRGlhbG9nIH0gVXNlZCBmb3IgcmVwcmVzZW50aW5nIDNEIG1vbGVjdWxlcy5cclxuICAgIC8vIE9ubHkgY3JlYXRlIGEgZGlhbG9nIGlmIHdlYmdsIGlzIGVuYWJsZWQuIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvYnVpbGQtYS1tb2xlY3VsZS9pc3N1ZXMvMTA1XHJcbiAgICB0aGlzLmRpYWxvZyA9IFRocmVlVXRpbHMuaXNXZWJHTEVuYWJsZWQoKSA/IG5ldyBNb2xlY3VsZTNERGlhbG9nKCBiYW1Nb2RlbC5kaWFsb2dNb2xlY3VsZSApIDogbmV3IFdhcm5pbmdEaWFsb2coKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtmdW5jdGlvbn0gUmVmZXJlbmNlIHRvIGNhbGxiYWNrIHRoYXQgZGlzcGxheXMgZGlhbG9nIGZvciAzZCBub2RlIHJlcHJlc2VudGF0aW9uXHJcbiAgICB0aGlzLnNob3dEaWFsb2dDYWxsYmFjayA9IHRoaXMuc2hvd0RpYWxvZy5iaW5kKCB0aGlzICk7XHJcblxyXG4gICAgLy8gS2l0UGxheUFyZWFOb2RlIGZvciB0aGUgbWFpbiBCQU1TY3JlZW5WaWV3IGxpc3RlbnMgdG8gdGhlIGtpdFBsYXlBcmVhIG9mIGVhY2gga2l0IGluIHRoZSBtb2RlbCB0byBmaWxsIG9yIHJlbW92ZVxyXG4gICAgLy8gaXRzIGNvbnRlbnQuXHJcbiAgICBjb25zdCBraXRzID0gW107XHJcblxyXG4gICAgLy8gQHB1YmxpYyB7S2l0UGxheUFyZWFOb2RlfSBDcmVhdGUgYSBwbGF5IGFyZWEgdG8gaG91c2UgdGhlIG1vbGVjdWxlcy5cclxuICAgIHRoaXMua2l0UGxheUFyZWFOb2RlID0gbmV3IEtpdFBsYXlBcmVhTm9kZSgga2l0cyApO1xyXG4gICAgYmFtTW9kZWwuY3VycmVudENvbGxlY3Rpb25Qcm9wZXJ0eS5saW5rKCAoIG5ld0NvbGxlY3Rpb24sIG9sZENvbGxlY3Rpb24gKSA9PiB7XHJcbiAgICAgIGlmICggb2xkQ29sbGVjdGlvbiApIHtcclxuXHJcbiAgICAgICAgLy8gQ2hlY2sgaWYgYSBLaXRDb2xsZWN0aW9uTm9kZSBleGlzdHMgYW5kIHJlbW92ZSBpdC5cclxuICAgICAgICB0aGlzLmNoaWxkcmVuLmZvckVhY2goIGNoaWxkID0+IHtcclxuICAgICAgICAgIGlmICggY2hpbGQgaW5zdGFuY2VvZiBLaXRDb2xsZWN0aW9uTm9kZSApIHtcclxuICAgICAgICAgICAgdGhpcy5yZW1vdmVDaGlsZCggY2hpbGQgKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9ICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIEFkZCBhIG5ldyBjb2xsZWN0aW9uXHJcbiAgICAgIGlmICggbmV3Q29sbGVjdGlvbiApIHtcclxuICAgICAgICB0aGlzLmFkZENoaWxkKCB0aGlzLmtpdENvbGxlY3Rpb25NYXBbIG5ld0NvbGxlY3Rpb24uaWQgXSApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBTZXQgdGhlIGN1cnJlbnQga2l0IG9mIHRoZSBLaXRQbGF5QXJlYU5vZGVcclxuICAgICAgdGhpcy5raXRQbGF5QXJlYU5vZGUuY3VycmVudEtpdCA9IG5ld0NvbGxlY3Rpb24uY3VycmVudEtpdFByb3BlcnR5LnZhbHVlO1xyXG4gICAgfSApO1xyXG4gICAgYmFtTW9kZWwuYWRkZWRDb2xsZWN0aW9uRW1pdHRlci5hZGRMaXN0ZW5lciggdGhpcy5hZGRDb2xsZWN0aW9uLmJpbmQoIHRoaXMgKSApO1xyXG5cclxuICAgIHRoaXMuYWRkQ2hpbGQoIHRoaXMua2l0UGxheUFyZWFOb2RlICk7XHJcblxyXG4gICAgLy8gQ3JlYXRlIGEgYnV0dG9uIHRvIHJlZmlsbCB0aGUga2l0XHJcbiAgICBjb25zdCByZWZpbGxMaXN0ZW5lciA9ICgpID0+IHtcclxuICAgICAgdGhpcy5pbnRlcnJ1cHRTdWJ0cmVlSW5wdXQoKTtcclxuICAgICAgdGhpcy5raXRQbGF5QXJlYU5vZGUucmVzZXRQbGF5QXJlYUtpdCgpO1xyXG4gICAgICB0aGlzLmtpdFBsYXlBcmVhTm9kZS5jdXJyZW50S2l0LmJ1Y2tldHMuZm9yRWFjaCggYnVja2V0ID0+IHtcclxuICAgICAgICBidWNrZXQuc2V0VG9GdWxsU3RhdGUoKTtcclxuICAgICAgfSApO1xyXG4gICAgICBiYW1Nb2RlbC5jdXJyZW50Q29sbGVjdGlvblByb3BlcnR5LnZhbHVlLmNvbGxlY3Rpb25Cb3hlcy5mb3JFYWNoKCBib3ggPT4ge1xyXG4gICAgICAgIGJveC5jdWVWaXNpYmlsaXR5UHJvcGVydHkudmFsdWUgPSBmYWxzZTtcclxuICAgICAgfSApO1xyXG4gICAgICB0aGlzLnVwZGF0ZVJlZmlsbEJ1dHRvbigpO1xyXG4gICAgfTtcclxuXHJcbiAgICAvLyBDcmVhdGUgYSBraXQgcGFuZWwgdG8gaG91c2UgdGhlIGtpdCBjYXJvdXNlbFxyXG4gICAgY29uc3Qga2l0UGFuZWwgPSB0aGlzLmtpdENvbGxlY3Rpb25NYXBbIGJhbU1vZGVsLmN1cnJlbnRDb2xsZWN0aW9uUHJvcGVydHkudmFsdWUuaWQgXS5raXRQYW5lbDtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7UmVmaWxsQnV0dG9ufSBDcmVhdGUgYSBidXR0b24gdG8gcmVmaWxsIHRoZSBraXQgYnVja2V0cyB3aXRoIGF0b21zXHJcbiAgICB0aGlzLnJlZmlsbEJ1dHRvbiA9IG5ldyBSZWZpbGxCdXR0b24oXHJcbiAgICAgIHJlZmlsbExpc3RlbmVyLCB7XHJcbiAgICAgICAgbGVmdDoga2l0UGFuZWwubGVmdCxcclxuICAgICAgICBib3R0b206IGtpdFBhbmVsLnRvcCAtIDcsXHJcbiAgICAgICAgc2NhbGU6IDAuODVcclxuICAgICAgfSApO1xyXG4gICAgdGhpcy5yZWZpbGxCdXR0b24udG91Y2hBcmVhID0gdGhpcy5yZWZpbGxCdXR0b24uc2VsZkJvdW5kcy51bmlvbiggdGhpcy5yZWZpbGxCdXR0b24uY2hpbGRCb3VuZHMgKS5kaWxhdGVkKCAxMCApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMge2Z1bmN0aW9ufSBSZWZpbGwgYnV0dG9uIGlzIGVuYWJsZWQgaWYgYXRvbXMgZXhpc3RzIG91dHNpZGUgb2YgdGhlIGJ1Y2tldFxyXG4gICAgdGhpcy51cGRhdGVSZWZpbGxCdXR0b24gPSAoKSA9PiB7XHJcbiAgICAgIHRoaXMucmVmaWxsQnV0dG9uLmVuYWJsZWQgPSAhdGhpcy5iYW1Nb2RlbC5jdXJyZW50Q29sbGVjdGlvblByb3BlcnR5LnZhbHVlLmN1cnJlbnRLaXRQcm9wZXJ0eS52YWx1ZS5hbGxCdWNrZXRzRmlsbGVkKCk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1Jlc2V0QWxsQnV0dG9ufSBDcmVhdGUgYSByZXNldCBhbGwgYnV0dG9uLiBQb3NpdGlvbiBvZiBidXR0b24gaXMgYWRqdXN0ZWQgb24gXCJMYXJnZXJcIiBTY3JlZW4uXHJcbiAgICB0aGlzLnJlc2V0QWxsQnV0dG9uID0gbmV3IFJlc2V0QWxsQnV0dG9uKCB7XHJcbiAgICAgIGxpc3RlbmVyOiAoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5pbnRlcnJ1cHRTdWJ0cmVlSW5wdXQoKTtcclxuXHJcbiAgICAgICAgLy8gV2hlbiBjbGlja2VkLCBlbXB0eSBjb2xsZWN0aW9uIGJveGVzXHJcbiAgICAgICAgYmFtTW9kZWwuY3VycmVudENvbGxlY3Rpb25Qcm9wZXJ0eS52YWx1ZS5jb2xsZWN0aW9uQm94ZXMuZm9yRWFjaCggYm94ID0+IHtcclxuICAgICAgICAgIGJveC5yZXNldCgpO1xyXG4gICAgICAgIH0gKTtcclxuICAgICAgICBiYW1Nb2RlbC5jdXJyZW50Q29sbGVjdGlvblByb3BlcnR5LnZhbHVlLmtpdHMuZm9yRWFjaCgga2l0ID0+IHtcclxuICAgICAgICAgIGtpdC5yZXNldCgpO1xyXG4gICAgICAgIH0gKTtcclxuICAgICAgICBiYW1Nb2RlbC5yZXNldCgpO1xyXG4gICAgICAgIGtpdFBhbmVsLnJlc2V0KCk7XHJcbiAgICAgICAgaWYgKCB0aGlzLmRpYWxvZyBpbnN0YW5jZW9mIE1vbGVjdWxlM0REaWFsb2cgKSB7XHJcbiAgICAgICAgICB0aGlzLmRpYWxvZy5pc1BsYXlpbmdQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgICAgICAgdGhpcy5kaWFsb2cudmlld1N0eWxlUHJvcGVydHkucmVzZXQoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy51cGRhdGVSZWZpbGxCdXR0b24oKTtcclxuXHJcbiAgICAgICAgLy8gSWYgdGhlIG5leHRDb2xsZWN0aW9uQnV0dG9uIGlzIHByZXNlbnQgb24gc2NyZWVuIGhpZGUgaXQuXHJcbiAgICAgICAgaWYgKCBfLmluY2x1ZGVzKCB0aGlzLmNoaWxkcmVuLCB0aGlzLm5leHRDb2xsZWN0aW9uQnV0dG9uICkgKSB7XHJcbiAgICAgICAgICB0aGlzLm5leHRDb2xsZWN0aW9uQnV0dG9uLnZpc2libGUgPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHJpZ2h0OiB0aGlzLmxheW91dEJvdW5kcy5yaWdodCAtIEJBTUNvbnN0YW50cy5WSUVXX1BBRERJTkcgLyAyLFxyXG4gICAgICBib3R0b206IGtpdFBhbmVsLmJvdHRvbSArIEJBTUNvbnN0YW50cy5WSUVXX1BBRERJTkcgLyA0XHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5yZXNldEFsbEJ1dHRvbi50b3VjaEFyZWEgPSB0aGlzLnJlc2V0QWxsQnV0dG9uLmJvdW5kcy5kaWxhdGVkKCA3ICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCB0aGlzLnJlc2V0QWxsQnV0dG9uICk7XHJcbiAgICB0aGlzLnJlc2V0QWxsQnV0dG9uLm1vdmVUb0JhY2soKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHRoaXMucmVmaWxsQnV0dG9uICk7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBIYW5kbGVzIGFkZGluZyBtb2xlY3VsZXMgYW5kIG1vbGVjdWxlIG1ldGFkYXRhIHRvIGtpdCBwbGF5IGFyZWEuXHJcbiAgICAgKiBAcGFyYW0ge01vbGVjdWxlfSBtb2xlY3VsZVxyXG4gICAgICogQHBhcmFtIHtLaXR9IGtpdFxyXG4gICAgICovXHJcbiAgICBjb25zdCBhZGRlZE1vbGVjdWxlTGlzdGVuZXIgPSAoIG1vbGVjdWxlLCBraXQgKSA9PiB7XHJcbiAgICAgIGlmICggbW9sZWN1bGUuYXRvbXMubGVuZ3RoID4gMSApIHtcclxuXHJcbiAgICAgICAgLy8gT25seSBjcmVhdGUgdGhpcyBpZiB0aGVyZSBhcmUgbXVsdGlwbGUgYXRvbXNcclxuICAgICAgICBjb25zdCBtb2xlY3VsZUNvbnRyb2xzSEJveCA9IG5ldyBNb2xlY3VsZUNvbnRyb2xzSEJveCgga2l0LCBtb2xlY3VsZSwgdGhpcy5zaG93RGlhbG9nQ2FsbGJhY2sgKTtcclxuICAgICAgICB0aGlzLmtpdFBsYXlBcmVhTm9kZS5tZXRhZGF0YUxheWVyLmFkZENoaWxkKCBtb2xlY3VsZUNvbnRyb2xzSEJveCApO1xyXG4gICAgICAgIHRoaXMua2l0UGxheUFyZWFOb2RlLm1ldGFkYXRhTWFwWyBtb2xlY3VsZS5tb2xlY3VsZUlkIF0gPSBtb2xlY3VsZUNvbnRyb2xzSEJveDtcclxuICAgICAgICB0aGlzLmtpdFBsYXlBcmVhTm9kZS5hZGRNb2xlY3VsZUJvbmROb2RlcyggbW9sZWN1bGUgKTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEhhbmRsZXMgcmVtb3ZpbmcgbW9sZWN1bGVzIGFuZCBtb2xlY3VsZSBtZXRhZGF0YSB0byBraXQgcGxheSBhcmVhLlxyXG4gICAgICogQHBhcmFtIHtNb2xlY3VsZX0gbW9sZWN1bGVcclxuICAgICAqL1xyXG4gICAgY29uc3QgcmVtb3ZlZE1vbGVjdWxlTGlzdGVuZXIgPSBtb2xlY3VsZSA9PiB7XHJcbiAgICAgIGNvbnN0IG1vbGVjdWxlQ29udHJvbHNIQm94ID0gdGhpcy5raXRQbGF5QXJlYU5vZGUubWV0YWRhdGFNYXBbIG1vbGVjdWxlLm1vbGVjdWxlSWQgXTtcclxuICAgICAgaWYgKCBtb2xlY3VsZUNvbnRyb2xzSEJveCApIHtcclxuICAgICAgICB0aGlzLmtpdFBsYXlBcmVhTm9kZS5tZXRhZGF0YUxheWVyLnJlbW92ZUNoaWxkKCBtb2xlY3VsZUNvbnRyb2xzSEJveCApO1xyXG4gICAgICAgIG1vbGVjdWxlQ29udHJvbHNIQm94LmRpc3Bvc2UoKTtcclxuICAgICAgICBkZWxldGUgdGhpcy5raXRQbGF5QXJlYU5vZGUubWV0YWRhdGFNYXBbIG1vbGVjdWxlLm1vbGVjdWxlSWQgXTtcclxuICAgICAgICB0aGlzLmtpdFBsYXlBcmVhTm9kZS5yZW1vdmVNb2xlY3VsZUJvbmROb2RlcyggbW9sZWN1bGUgKTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEhhbmRsZXMgYWRkaW5nIGF0b21zIHRvIHBsYXkgYXJlYSBhbmQgdXBkYXRlcyB0aGUgcmVmaWxsIGJ1dHRvbiBhY2NvcmRpbmdseVxyXG4gICAgICogQHBhcmFtIHtBdG9tMn0gYXRvbVxyXG4gICAgICovXHJcbiAgICBjb25zdCBhZGRBdG9tTm9kZVRvUGxheUFyZWEgPSBhdG9tID0+IHtcclxuICAgICAgdGhpcy5hZGRBdG9tTm9kZVRvUGxheUFyZWEoIGF0b20gKTtcclxuICAgICAgdGhpcy51cGRhdGVSZWZpbGxCdXR0b24oKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBIYW5kbGVzIGFkZGluZyBhdG9tcyB0byBwbGF5IGFyZWEgYW5kIHVwZGF0ZXMgdGhlIHJlZmlsbCBidXR0b24gYWNjb3JkaW5nbHlcclxuICAgICAqIEBwYXJhbSB7QXRvbTJ9IGF0b21cclxuICAgICAqL1xyXG4gICAgY29uc3QgcmVtb3ZlQXRvbU5vZGVGcm9tUGxheUFyZWEgPSBhdG9tID0+IHtcclxuICAgICAgdGhpcy5vbkF0b21SZW1vdmVkRnJvbVBsYXlBcmVhKCBhdG9tICk7XHJcbiAgICAgIHRoaXMudXBkYXRlUmVmaWxsQnV0dG9uKCk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8vIFdoZW4gYSBjb2xsZWN0aW9uIGlzIGNoYW5nZWQsIHVwZGF0ZSB0aGUgbGlzdGVuZXJzIGZvciB0aGUga2l0cyBhbmQgS2l0UGxheUFyZWFOb2RlLlxyXG4gICAgYmFtTW9kZWwuY3VycmVudENvbGxlY3Rpb25Qcm9wZXJ0eS5saW5rKCAoIGNvbGxlY3Rpb24sIHByZXZpb3VzQ29sbGVjdGlvbiApID0+IHtcclxuICAgICAgdGhpcy5raXRQbGF5QXJlYU5vZGUuYXRvbUxheWVyLmNoaWxkcmVuLmZvckVhY2goIG90aGVyQXRvbU5vZGUgPT4ge1xyXG4gICAgICAgIGlmICggb3RoZXJBdG9tTm9kZSApIHtcclxuICAgICAgICAgIG90aGVyQXRvbU5vZGUuaW50ZXJydXB0U3VidHJlZUlucHV0KCk7XHJcbiAgICAgICAgICBvdGhlckF0b21Ob2RlLmF0b20udXNlckNvbnRyb2xsZWRQcm9wZXJ0eS52YWx1ZSA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgfSApO1xyXG4gICAgICBpZiAoIHByZXZpb3VzQ29sbGVjdGlvbiApIHtcclxuICAgICAgICBwcmV2aW91c0NvbGxlY3Rpb24ua2l0cy5mb3JFYWNoKCBraXQgPT4ge1xyXG5cclxuICAgICAgICAgIC8vIFJlc2V0IHRoZSBraXQgYmVmb3JlIG1hbmFnaW5nIGl0cyBsaXN0ZW5lcnNcclxuICAgICAgICAgIGtpdC5yZXNldCgpO1xyXG5cclxuICAgICAgICAgIC8vIFJlbW92ZWQgcHJldmlvdXMgbGlzdGVuZXJzIHJlbGF0ZWQgdG8gbWV0YWRhdGFMYXllciBjcmVhdGlvbiBhbmQgZGVsZXRpb24uXHJcbiAgICAgICAgICBraXQuYWRkZWRNb2xlY3VsZUVtaXR0ZXIucmVtb3ZlTGlzdGVuZXIoIHRoaXMuYWRkZWRFbWl0dGVyTGlzdGVuZXJzWyBraXQuaWQgXSApO1xyXG4gICAgICAgICAga2l0LnJlbW92ZWRNb2xlY3VsZUVtaXR0ZXIucmVtb3ZlTGlzdGVuZXIoIHRoaXMucmVtb3ZlZEVtaXR0ZXJMaXN0ZW5lcnNbIGtpdC5pZCBdICk7XHJcbiAgICAgICAgICBkZWxldGUgdGhpcy5hZGRlZEVtaXR0ZXJMaXN0ZW5lcnNbIGtpdC5pZCBdO1xyXG4gICAgICAgICAgZGVsZXRlIHRoaXMucmVtb3ZlZEVtaXR0ZXJMaXN0ZW5lcnNbIGtpdC5pZCBdO1xyXG5cclxuICAgICAgICAgIC8vIFJlbW92ZSBsaXN0ZW5lcnMgZm9yIGFkZGluZy9yZW1vdmluZyBhdG9tcyB0byBwbGF5IGFyZWFcclxuICAgICAgICAgIGtpdC5hdG9tc0luUGxheUFyZWEucmVtb3ZlSXRlbUFkZGVkTGlzdGVuZXIoIGFkZEF0b21Ob2RlVG9QbGF5QXJlYSApO1xyXG4gICAgICAgICAga2l0LmF0b21zSW5QbGF5QXJlYS5yZW1vdmVJdGVtUmVtb3ZlZExpc3RlbmVyKCByZW1vdmVBdG9tTm9kZUZyb21QbGF5QXJlYSApO1xyXG4gICAgICAgIH0gKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gS2l0UGxheUFyZWFOb2RlIGtpdHMgc2hvdWxkIGJlIHVwZGF0ZWQgdG8gdGhlIGtpdHMgaW4gdGhlIG5ldyBjb2xsZWN0aW9uLlxyXG4gICAgICB0aGlzLmtpdFBsYXlBcmVhTm9kZS5raXRzUHJvcGVydHkudmFsdWUgPSBjb2xsZWN0aW9uLmtpdHM7XHJcbiAgICAgIGNvbGxlY3Rpb24ua2l0cy5mb3JFYWNoKCBraXQgPT4ge1xyXG5cclxuICAgICAgICAvLyBIYW5kbGUgbWV0YWRhdGFMYXllciBjcmVhdGlvbiBhbmQgZGVzdHJ1Y3Rpb24uXHJcbiAgICAgICAgY29uc3QgYWRkZWRFbWl0dGVyTGlzdGVuZXIgPSBtb2xlY3VsZSA9PiB7XHJcbiAgICAgICAgICBhZGRlZE1vbGVjdWxlTGlzdGVuZXIoIG1vbGVjdWxlLCBraXQgKTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIGtpdC5hZGRlZE1vbGVjdWxlRW1pdHRlci5hZGRMaXN0ZW5lciggYWRkZWRFbWl0dGVyTGlzdGVuZXIgKTtcclxuICAgICAgICB0aGlzLmFkZGVkRW1pdHRlckxpc3RlbmVyc1sga2l0LmlkIF0gPSBhZGRlZEVtaXR0ZXJMaXN0ZW5lcjtcclxuXHJcbiAgICAgICAgLy8gSGFuZGxlIGRlbGV0aW5nIG1ldGFkYXRhTGF5ZXJcclxuICAgICAgICBjb25zdCByZW1vdmVkRW1pdHRlckxpc3RlbmVyID0gbW9sZWN1bGUgPT4ge1xyXG4gICAgICAgICAgcmVtb3ZlZE1vbGVjdWxlTGlzdGVuZXIoIG1vbGVjdWxlLCBraXQgKTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIGtpdC5yZW1vdmVkTW9sZWN1bGVFbWl0dGVyLmFkZExpc3RlbmVyKCByZW1vdmVkRW1pdHRlckxpc3RlbmVyICk7XHJcbiAgICAgICAgdGhpcy5yZW1vdmVkRW1pdHRlckxpc3RlbmVyc1sga2l0LmlkIF0gPSByZW1vdmVkRW1pdHRlckxpc3RlbmVyO1xyXG5cclxuICAgICAgICAvLyBSZXNldCBvdXIga2l0UGxheUFyZWFOb2RlIGZvciB0aGUgbmV3IGNvbGxlY3Rpb25cclxuICAgICAgICB0aGlzLmtpdFBsYXlBcmVhTm9kZS5yZXNldFBsYXlBcmVhS2l0KCk7XHJcbiAgICAgICAgdGhpcy5raXRQbGF5QXJlYU5vZGUuY3VycmVudEtpdCA9IGNvbGxlY3Rpb24uY3VycmVudEtpdFByb3BlcnR5LnZhbHVlO1xyXG4gICAgICAgIHRoaXMua2l0UGxheUFyZWFOb2RlLm1vdmVUb0Zyb250KCk7XHJcblxyXG4gICAgICAgIC8vIFVzZWQgZm9yIHRyYWNraW5nIGtpdHMgaW4gS2l0UGxheUFyZWFOb2RlXHJcbiAgICAgICAga2l0cy5wdXNoKCBraXQgKTtcclxuXHJcbiAgICAgICAgLy8gRWFjaCBraXQgZ2V0cyBsaXN0ZW5lcnMgZm9yIG1hbmFnaW5nIGl0cyBwbGF5IGFyZWEuXHJcbiAgICAgICAga2l0LmF0b21zSW5QbGF5QXJlYS5hZGRJdGVtQWRkZWRMaXN0ZW5lciggYWRkQXRvbU5vZGVUb1BsYXlBcmVhICk7XHJcbiAgICAgICAga2l0LmF0b21zSW5QbGF5QXJlYS5hZGRJdGVtUmVtb3ZlZExpc3RlbmVyKCByZW1vdmVBdG9tTm9kZUZyb21QbGF5QXJlYSApO1xyXG5cclxuICAgICAgICAvLyBLaXRQbGF5QXJlYU5vZGUgc2hvdWxkIHVwZGF0ZSB0aGVpciBraXRzXHJcbiAgICAgICAgY29sbGVjdGlvbi5jdXJyZW50S2l0UHJvcGVydHkubGluaygga2l0ID0+IHtcclxuICAgICAgICAgIHRoaXMua2l0UGxheUFyZWFOb2RlLmN1cnJlbnRLaXQgPSBraXQ7XHJcbiAgICAgICAgICB0aGlzLnVwZGF0ZVJlZmlsbEJ1dHRvbigpO1xyXG4gICAgICAgIH0gKTtcclxuICAgICAgICB0aGlzLnVwZGF0ZVJlZmlsbEJ1dHRvbigpO1xyXG4gICAgICB9ICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge2Z1bmN0aW9ufSBsaXN0ZW5lciBmb3IgJ2NsaWNrIG91dHNpZGUgdG8gZGlzbWlzcydcclxuICAgIHRoaXMuY2xpY2tUb0Rpc21pc3NMaXN0ZW5lciA9IHtcclxuICAgICAgZG93bjogKCkgPT4ge1xyXG4gICAgICAgIGJhbU1vZGVsLmN1cnJlbnRDb2xsZWN0aW9uUHJvcGVydHkudmFsdWUuY3VycmVudEtpdFByb3BlcnR5LnZhbHVlLnNlbGVjdGVkQXRvbVByb3BlcnR5LnZhbHVlID0gbnVsbDtcclxuICAgICAgfVxyXG4gICAgfTtcclxuICAgIHBoZXQuam9pc3QuZGlzcGxheS5hZGRJbnB1dExpc3RlbmVyKCB0aGlzLmNsaWNrVG9EaXNtaXNzTGlzdGVuZXIgKTtcclxuXHJcbiAgICBraXRQYW5lbC5raXRDYXJvdXNlbC5wYWdlTnVtYmVyUHJvcGVydHkubGluayggKCkgPT4ge1xyXG4gICAgICB0aGlzLmludGVycnVwdFN1YnRyZWVJbnB1dCgpO1xyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IGR0XHJcbiAgICpcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgc3RlcCggZHQgKSB7XHJcbiAgICBpZiAoIHRoaXMuZGlhbG9nICYmIFRocmVlVXRpbHMuaXNXZWJHTEVuYWJsZWQoKSApIHtcclxuICAgICAgdGhpcy5kaWFsb2cuc3RlcCggZHQgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBVcGRhdGUgdGhlIHZpc2liaWxpdHkgb2YgdGhlIGN1ZXMgaW4gZWFjaCBjb2xsZWN0aW9uIGJveFxyXG4gICAgbGV0IGhhc1RhcmdldE1vbGVjdWxlID0gZmFsc2U7XHJcbiAgICB0aGlzLmJhbU1vZGVsLmN1cnJlbnRDb2xsZWN0aW9uUHJvcGVydHkudmFsdWUuY29sbGVjdGlvbkJveGVzLmZvckVhY2goIGJveCA9PiB7XHJcbiAgICAgIHRoaXMua2l0UGxheUFyZWFOb2RlLmN1cnJlbnRLaXQubW9sZWN1bGVzLmZvckVhY2goIG1vbGVjdWxlID0+IHtcclxuICAgICAgICBoYXNUYXJnZXRNb2xlY3VsZSA9IG1vbGVjdWxlID8gYm94LndpbGxBbGxvd01vbGVjdWxlRHJvcCggbW9sZWN1bGUgKSA6IGhhc1RhcmdldE1vbGVjdWxlIHx8IGZhbHNlO1xyXG4gICAgICB9ICk7XHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXNwb25zaWJsZSBmb3Igc2hvd2luZyAzZCByZXByZXNlbnRhdGlvbiBvZiBtb2xlY3VsZS5cclxuICAgKiBAcGFyYW0ge0NvbXBsZXRlTW9sZWN1bGV9IGNvbXBsZXRlTW9sZWN1bGVcclxuICAgKlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgc2hvd0RpYWxvZyggY29tcGxldGVNb2xlY3VsZSApIHtcclxuXHJcbiAgICAvLyBCYWlsIGlmIHdlIGRvbid0IGhhdmUgYSBkaWFsb2csIGR1ZSB0byBhIGxhY2sgb2Ygd2ViZ2wgc3VwcG9ydC4gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9idWlsZC1hLW1vbGVjdWxlL2lzc3Vlcy8xMDVcclxuICAgIGlmICggdGhpcy5kaWFsb2cgKSB7XHJcbiAgICAgIGlmICggVGhyZWVVdGlscy5pc1dlYkdMRW5hYmxlZCgpICkge1xyXG4gICAgICAgIHRoaXMuZGlhbG9nLmNvbXBsZXRlTW9sZWN1bGVQcm9wZXJ0eS52YWx1ZSA9IGNvbXBsZXRlTW9sZWN1bGU7XHJcbiAgICAgIH1cclxuICAgICAgdGhpcy5kaWFsb2cuc2hvdygpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQWRkIGEgY29sbGVjdGlvbiB0byB0aGUga2l0Q29sbGVjdGlvbk5vZGVcclxuICAgKiBAcGFyYW0ge0tpdENvbGxlY3Rpb259IGNvbGxlY3Rpb25cclxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IGlzQ29sbGVjdGluZ1ZpZXdcclxuICAgKlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICogQHJldHVybnMge0tpdENvbGxlY3Rpb25Ob2RlfVxyXG4gICAqL1xyXG4gIGFkZENvbGxlY3Rpb24oIGNvbGxlY3Rpb24sIGlzQ29sbGVjdGluZ1ZpZXcgKSB7XHJcbiAgICBjb25zdCBraXRDb2xsZWN0aW9uTm9kZSA9IG5ldyBLaXRDb2xsZWN0aW9uTm9kZSggY29sbGVjdGlvbiwgdGhpcywgaXNDb2xsZWN0aW5nVmlldyApO1xyXG4gICAgdGhpcy5raXRDb2xsZWN0aW9uTWFwWyBjb2xsZWN0aW9uLmlkIF0gPSBraXRDb2xsZWN0aW9uTm9kZTtcclxuXHJcbiAgICAvLyBzdXBwb3NlZGx5OiByZXR1cm4gdGhpcyBzbyB3ZSBjYW4gbWFuaXB1bGF0ZSBpdCBpbiBhbiBvdmVycmlkZS4uLi4/XHJcbiAgICByZXR1cm4ga2l0Q29sbGVjdGlvbk5vZGU7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBGaWxsIHRoZSBwbGF5IGFyZWEgd2l0aCBhbiBhdG9tIGFuZCBtYXAgdGhlIGF0b20gdG8gYW4gYXRvbU5vZGVcclxuICAgKiBAcGFyYW0ge0F0b20yfSBhdG9tXHJcbiAgICpcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqIEByZXR1cm5zIHtBdG9tTm9kZX1cclxuICAgKi9cclxuICBhZGRBdG9tTm9kZVRvUGxheUFyZWFOb2RlKCBhdG9tICkge1xyXG4gICAgY29uc3QgYXRvbU5vZGUgPSBuZXcgQXRvbU5vZGUoIGF0b20gKTtcclxuICAgIHRoaXMua2l0UGxheUFyZWFOb2RlLmF0b21MYXllci5hZGRDaGlsZCggYXRvbU5vZGUgKTtcclxuICAgIHRoaXMua2l0UGxheUFyZWFOb2RlLmF0b21Ob2RlTWFwWyBhdG9tLmlkIF0gPSBhdG9tTm9kZTtcclxuICAgIHJldHVybiBhdG9tTm9kZTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFkZCBhbiBhdG9tIHRvIHRoZSBwbGF5IGFyZWEgaW4gdGhlIG1vZGVsLiBIYW5kbGVkIHZpYSBhIGRyYWcgbGlzdGVuZXIuXHJcbiAgICogQHBhcmFtIHtBdG9tMn0gYXRvbVxyXG4gICAqXHJcbiAgICogQHByaXZhdGVcclxuICAgKiBAcmV0dXJucyB7QXRvbU5vZGV9XHJcbiAgICovXHJcbiAgYWRkQXRvbU5vZGVUb1BsYXlBcmVhKCBhdG9tICkge1xyXG4gICAgY29uc3QgY3VycmVudEtpdCA9IHRoaXMuYmFtTW9kZWwuY3VycmVudENvbGxlY3Rpb25Qcm9wZXJ0eS52YWx1ZS5jdXJyZW50S2l0UHJvcGVydHkudmFsdWU7XHJcbiAgICBjb25zdCBhdG9tTm9kZSA9IHRoaXMuYWRkQXRvbU5vZGVUb1BsYXlBcmVhTm9kZSggYXRvbSApO1xyXG4gICAgbGV0IGxhc3RQb3NpdGlvbjtcclxuXHJcbiAgICAvLyBUcmFjayB0aGUgbGVuZ3RoIG9mIGEgZHJhZyBpbiBtb2RlbCB1bml0c1xyXG4gICAgbGV0IGRyYWdMZW5ndGggPSAwO1xyXG4gICAgY29uc3QgYXRvbUxpc3RlbmVyID0gbmV3IERyYWdMaXN0ZW5lcigge1xyXG4gICAgICB0cmFuc2Zvcm06IEJBTUNvbnN0YW50cy5NT0RFTF9WSUVXX1RSQU5TRk9STSxcclxuICAgICAgdGFyZ2V0Tm9kZTogYXRvbU5vZGUsXHJcbiAgICAgIGFsbG93VG91Y2hTbmFnOiBmYWxzZSxcclxuICAgICAgZHJhZ0JvdW5kc1Byb3BlcnR5OiBuZXcgUHJvcGVydHkoIHRoaXMuYXRvbURyYWdCb3VuZHMgKSxcclxuICAgICAgcG9zaXRpb25Qcm9wZXJ0eTogYXRvbS5wb3NpdGlvblByb3BlcnR5LFxyXG4gICAgICBzdGFydDogKCkgPT4ge1xyXG5cclxuICAgICAgICAvLyBJbnRlcnJ1cHQgZHJhZyBldmVudHMgb24gb3RoZXIgYXRvbSBub2Rlc1xyXG4gICAgICAgIHRoaXMua2l0UGxheUFyZWFOb2RlLmF0b21MYXllci5jaGlsZHJlbi5mb3JFYWNoKCBvdGhlckF0b21Ob2RlID0+IHtcclxuICAgICAgICAgIGlmICggb3RoZXJBdG9tTm9kZSAmJiBhdG9tTm9kZSAhPT0gb3RoZXJBdG9tTm9kZSApIHtcclxuICAgICAgICAgICAgb3RoZXJBdG9tTm9kZS5pbnRlcnJ1cHRTdWJ0cmVlSW5wdXQoKTtcclxuICAgICAgICAgICAgb3RoZXJBdG9tTm9kZS5hdG9tLnVzZXJDb250cm9sbGVkUHJvcGVydHkudmFsdWUgPSBmYWxzZTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9ICk7XHJcbiAgICAgICAgZHJhZ0xlbmd0aCA9IDA7XHJcbiAgICAgICAgYXRvbS5kZXN0aW5hdGlvblByb3BlcnR5LnZhbHVlID0gYXRvbS5wb3NpdGlvblByb3BlcnR5LnZhbHVlO1xyXG5cclxuICAgICAgICAvLyBHZXQgYXRvbSBwb3NpdGlvbiBiZWZvcmUgZHJhZ1xyXG4gICAgICAgIGxhc3RQb3NpdGlvbiA9IGF0b20ucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZTtcclxuXHJcbiAgICAgICAgLy8gSWYgYSBtb2xlY3VsZSBpcyBhbmltYXRpbmcgaW50ZXJydXB0IHRoZSBhbmltYXRpb24gcHJvY2Vzcy5cclxuICAgICAgICBhdG9tLnVzZXJDb250cm9sbGVkUHJvcGVydHkudmFsdWUgPSB0cnVlO1xyXG4gICAgICAgIGNvbnN0IG1vbGVjdWxlID0gY3VycmVudEtpdC5nZXRNb2xlY3VsZSggYXRvbSApO1xyXG4gICAgICAgIGlmICggbW9sZWN1bGUgKSB7XHJcbiAgICAgICAgICBtb2xlY3VsZS5hdG9tcy5mb3JFYWNoKCBtb2xlY3VsZUF0b20gPT4ge1xyXG4gICAgICAgICAgICBpZiAoIG1vbGVjdWxlQXRvbSApIHtcclxuICAgICAgICAgICAgICB0aGlzLmtpdFBsYXlBcmVhTm9kZS5hdG9tTm9kZU1hcFsgbW9sZWN1bGVBdG9tLmlkIF0ubW92ZVRvRnJvbnQoKTtcclxuICAgICAgICAgICAgICBtb2xlY3VsZUF0b20uZGVzdGluYXRpb25Qcm9wZXJ0eS52YWx1ZSA9IG1vbGVjdWxlQXRvbS5wb3NpdGlvblByb3BlcnR5LnZhbHVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9ICk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBVcGRhdGUgdGhlIGN1cnJlbnQga2l0IGluIHRoZSBwbGF5IGFyZWEgbm9kZS5cclxuICAgICAgICB0aGlzLmtpdFBsYXlBcmVhTm9kZS5jdXJyZW50S2l0ID0gY3VycmVudEtpdDtcclxuICAgICAgfSxcclxuICAgICAgZHJhZzogKCBldmVudCwgbGlzdGVuZXIgKSA9PiB7XHJcbiAgICAgICAgZHJhZ0xlbmd0aCArPSBsaXN0ZW5lci5tb2RlbERlbHRhLmdldE1hZ25pdHVkZSgpO1xyXG5cclxuICAgICAgICAvLyBHZXQgZGVsdGEgZnJvbSBzdGFydCBvZiBkcmFnXHJcbiAgICAgICAgY29uc3QgZGVsdGEgPSBhdG9tLnBvc2l0aW9uUHJvcGVydHkudmFsdWUubWludXMoIGxhc3RQb3NpdGlvbiApO1xyXG4gICAgICAgIGF0b20uZGVzdGluYXRpb25Qcm9wZXJ0eS52YWx1ZSA9IGF0b20ucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZTtcclxuXHJcbiAgICAgICAgLy8gU2V0IHRoZSBsYXN0IHBvc2l0aW9uIHRvIHRoZSBuZXdseSBkcmFnZ2VkIHBvc2l0aW9uLlxyXG4gICAgICAgIGxhc3RQb3NpdGlvbiA9IGF0b20ucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZTtcclxuXHJcbiAgICAgICAgLy8gSGFuZGxlcyBtb2xlY3VsZXMgd2l0aCBtdWx0aXBsZSBhdG9tc1xyXG4gICAgICAgIGNvbnN0IG1vbGVjdWxlID0gY3VycmVudEtpdC5nZXRNb2xlY3VsZSggYXRvbSApO1xyXG4gICAgICAgIGlmICggbW9sZWN1bGUgKSB7XHJcbiAgICAgICAgICBtb2xlY3VsZS5hdG9tcy5mb3JFYWNoKCBtb2xlY3VsZUF0b20gPT4ge1xyXG4gICAgICAgICAgICBpZiAoIG1vbGVjdWxlQXRvbSAhPT0gYXRvbSApIHtcclxuICAgICAgICAgICAgICBtb2xlY3VsZUF0b20udHJhbnNsYXRlUG9zaXRpb25BbmREZXN0aW5hdGlvbiggZGVsdGEgKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSApO1xyXG4gICAgICAgICAgYXRvbU5vZGUubW92ZVRvRnJvbnQoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICBhdG9tTm9kZS5tb3ZlVG9Gcm9udCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAgZW5kOiAoKSA9PiB7XHJcblxyXG4gICAgICAgIC8vIFRocmVzaG9sZCBmb3IgaG93IG11Y2ggd2UgY2FuIGRyYWcgYmVmb3JlIGNvbnNpZGVyaW5nIGFuIGF0b20gc2VsZWN0ZWRcclxuICAgICAgICBpZiAoIGRyYWdMZW5ndGggPCBCQU1Db25zdGFudHMuRFJBR19MRU5HVEhfVEhSRVNIT0xEICYmICggY3VycmVudEtpdC5nZXRNb2xlY3VsZSggYXRvbSApLmJvbmRzLmxlbmd0aCAhPT0gMCApICkge1xyXG4gICAgICAgICAgY3VycmVudEtpdC5zZWxlY3RlZEF0b21Qcm9wZXJ0eS52YWx1ZSA9IGF0b207XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBDb25zaWRlciBhbiBhdG9tIHJlbGVhc2VkIGFuZCBtYXJrIGl0cyBwb3NpdGlvblxyXG4gICAgICAgIGF0b20udXNlckNvbnRyb2xsZWRQcm9wZXJ0eS52YWx1ZSA9IGZhbHNlO1xyXG5cclxuICAgICAgICAvLyBLZWVwIHRyYWNrIG9mIHZpZXcgZWxlbWVudHMgdXNlZCBsYXRlciBpbiB0aGUgY2FsbGJhY2tcclxuICAgICAgICBjb25zdCBtYXBwZWRBdG9tTm9kZSA9IHRoaXMua2l0UGxheUFyZWFOb2RlLmF0b21Ob2RlTWFwWyBhdG9tLmlkIF07XHJcblxyXG4gICAgICAgIC8vIFJlc3BvbnNpYmxlIGZvciBkcm9wcGluZyBtb2xlY3VsZXMgaW4gcGxheSBhcmVhIG9yIGtpdCBhcmVhXHJcbiAgICAgICAgY29uc3QgZHJvcHBlZEluS2l0QXJlYSA9IG1hcHBlZEF0b21Ob2RlICYmIG1hcHBlZEF0b21Ob2RlLmJvdW5kcy5pbnRlcnNlY3RzQm91bmRzKCB0aGlzLm1hcHBlZEtpdENvbGxlY3Rpb25Cb3VuZHMgKTtcclxuXHJcbiAgICAgICAgLy8gUmVzcG9uc2libGUgZm9yIGJvbmRpbmcgbW9sZWN1bGVzIGluIHBsYXkgYXJlYSBvciBicmVha2luZyBtb2xlY3VsZSBib25kcyBhbmQgcmV0dXJuaW5nIHRvIGtpdC5cclxuICAgICAgICAvLyBXZSBkb24ndCB3YW50IHRvIGRvIHRoaXMgd2hpbGUgdGhlIG1vbGVjdWxlIGlzIGFuaW1hdGluZy5cclxuICAgICAgICBjdXJyZW50S2l0LmF0b21Ecm9wcGVkKCBhdG9tLCBkcm9wcGVkSW5LaXRBcmVhICk7XHJcblxyXG5cclxuICAgICAgICAvLyBNYWtlIHN1cmUgdG8gdXBkYXRlIHRoZSB1cGRhdGUgYnV0dG9uIGFmdGVyIG1vdmluZyBhdG9tc1xyXG4gICAgICAgIHRoaXMudXBkYXRlUmVmaWxsQnV0dG9uKCk7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuICAgIGF0b21Ob2RlLmRyYWdMaXN0ZW5lciA9IGF0b21MaXN0ZW5lcjtcclxuICAgIGF0b21Ob2RlLmFkZElucHV0TGlzdGVuZXIoIGF0b21MaXN0ZW5lciApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmVtb3ZlcyBhdG9tIGVsZW1lbnRzIGZyb20gdmlldy5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7QXRvbTJ9IGF0b21cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIG9uQXRvbVJlbW92ZWRGcm9tUGxheUFyZWEoIGF0b20gKSB7XHJcbiAgICAvLyBSZW1vdmUgbWFwcGVkIGF0b20gbm9kZSBmcm9tIHRoZSB2aWV3IGFuZCBkaXNwb3NlIGl0LlxyXG4gICAgY29uc3QgYXRvbU5vZGUgPSB0aGlzLmtpdFBsYXlBcmVhTm9kZS5hdG9tTm9kZU1hcFsgYXRvbS5pZCBdO1xyXG4gICAgYXRvbU5vZGUuZHJhZ0xpc3RlbmVyLmRpc3Bvc2UoKTtcclxuICAgIGF0b21Ob2RlLmRpc3Bvc2UoKTtcclxuICAgIGRlbGV0ZSB0aGlzLmtpdFBsYXlBcmVhTm9kZS5hdG9tTm9kZU1hcFsgYXRvbS5pZCBdO1xyXG4gIH1cclxufVxyXG5cclxuYnVpbGRBTW9sZWN1bGUucmVnaXN0ZXIoICdCQU1TY3JlZW5WaWV3JywgQkFNU2NyZWVuVmlldyApO1xyXG5leHBvcnQgZGVmYXVsdCBCQU1TY3JlZW5WaWV3OyJdLCJtYXBwaW5n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