// Copyright 2020-2022, University of Colorado Boulder

/**
 * Represents a generic collection box node which is decorated by additional header nodes (probably text describing what can be put in, what is in it,
 * etc.)
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 * @author Denzell Barnett (PhET Interactive Simulations)
 */

import stepTimer from '../../../../axon/js/stepTimer.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import { Color, Node, Rectangle, VBox } from '../../../../scenery/js/imports.js';
import buildAMolecule from '../../buildAMolecule.js';
import BAMConstants from '../BAMConstants.js';
import MoleculeList from '../model/MoleculeList.js';
import BAMIconFactory from './BAMIconFactory.js';
import ShowMolecule3DButtonNode from './view3d/ShowMolecule3DButtonNode.js';

// constants
const BLACK_BOX_PADDING = 7;

// {Object.<moleculeId:number, Node>} Used to map molecules to their respective thumbnails
const moleculeIdThumbnailMap = {};
class CollectionBoxNode extends VBox {
  /**
   * @param {CollectionBox} box
   * @param {function} toModelBounds - Used to update position of the collection box
   * @param {function} showDialogCallback
   * @param {Object} [options]
   */
  constructor(box, toModelBounds, showDialogCallback, options) {
    super({
      spacing: 2
    });

    // @private {CollectionBox}
    this.box = box;

    // @private {function}
    this.toModelBounds = toModelBounds;

    // @private {Node}
    this.boxNode = new Node();

    // @private {Array.<Node>}
    this.moleculeNodes = [];

    // @private {function|null} NOT zero, since that could be a valid timeout ID for stepTimer.setTimeout!
    this.blinkTimeout = null;

    // @private {Object.<moleculeId:number,Node>} stores nodes for each molecule
    this.moleculeNodeMap = {};

    // @private {Rectangle}
    this.blackBox = new Rectangle(0, 0, 160, 50, {
      fill: Color.BLACK,
      lineWidth: 4
    });

    // Arrange button position for to trigger 3D representation
    const show3dButton = new ShowMolecule3DButtonNode(box.moleculeType, showDialogCallback);
    show3dButton.touchArea = show3dButton.bounds.dilated(10);
    show3dButton.right = this.blackBox.right - BLACK_BOX_PADDING;
    show3dButton.centerY = this.blackBox.centerY;

    // @private {number}
    this.button3dWidth = show3dButton.width;
    box.quantityProperty.link(quantity => {
      show3dButton.visible = quantity > 0;
    });
    this.blackBox.addChild(show3dButton);
    this.boxNode.addChild(this.blackBox);

    // @private {ArrowNode}Cue that tells the user where to drop the molecule.
    this.cueNode = new ArrowNode(10, 0, 34, 0, {
      fill: 'blue',
      stroke: 'black',
      right: this.blackBox.left - 5,
      centerY: this.blackBox.centerY,
      tailWidth: 8,
      headWidth: 14,
      pickable: false
    });

    // Cues exists for the duration of sim lifetime.
    box.cueVisibilityProperty.link(visible => {
      this.cueNode.visible = visible;
    });

    // The black box's bounds are expanded to keep the black box symmetrical with the panel. The arrow node is
    // positioned to the right side of the centered black box.
    this.blackBox.localBounds = this.blackBox.localBounds.withMaxX(this.blackBox.localBounds.right + this.blackBox.left - this.cueNode.left);
    this.boxNode.addChild(this.cueNode);

    // @private {Node} Layer to house molecules
    this.moleculeLayer = new Node({});
    this.boxNode.addChild(this.moleculeLayer);

    // Toggle the box's cues
    this.updateBoxGraphics();

    // Add listeners for the Collection Box that exist for the sim lifetime.
    box.addedMoleculeEmitter.addListener(this.addMolecule.bind(this));
    box.removedMoleculeEmitter.addListener(this.removeMolecule.bind(this));
    box.acceptedMoleculeCreationEmitter.addListener(this.blink.bind(this));
    this.addChild(this.boxNode);
    this.mutate(options);
  }

  /**
   * Allows us to set the model position of the collection boxes according to how they are laid out
   *
   * @public
   */
  updatePosition() {
    this.box.dropBoundsProperty.set(this.toModelBounds(this.blackBox));
  }

  /**
   * Add molecule to map and molecule layer. Update the layer and graphics.
   * @param {Molecule} molecule
   *
   * @public
   */
  addMolecule(molecule) {
    this.cancelBlinksInProgress();
    this.updateBoxGraphics();
    const completeMolecule = MoleculeList.getMasterInstance().findMatchingCompleteMolecule(molecule);
    const pseudo3DNode = CollectionBoxNode.lookupThumbnail(completeMolecule, moleculeIdThumbnailMap);
    this.moleculeLayer.addChild(pseudo3DNode);
    this.moleculeNodes.push(pseudo3DNode);
    this.moleculeNodeMap[molecule.moleculeId] = pseudo3DNode;
    this.updateMoleculeLayout();
  }

  /**
   * Remove molecule to map and molecule layer. Update the layer and graphics.
   * @param {Molecule} molecule
   *
   * @private
   */
  removeMolecule(molecule) {
    this.cancelBlinksInProgress();
    this.updateBoxGraphics();
    const lastMoleculeNode = this.moleculeNodeMap[molecule.moleculeId];
    this.moleculeLayer.removeChild(lastMoleculeNode);
    _.remove(this.moleculeNodes, item => {
      return lastMoleculeNode === item ? lastMoleculeNode : null;
    });
    this.moleculeNodeMap[molecule.moleculeId].detach();
    delete this.moleculeNodeMap[molecule.moleculeId];
    this.updateMoleculeLayout();
  }

  /**
   * Update the molecules that are within the box
   *
   * @private
   */
  updateMoleculeLayout() {
    // position molecule nodes
    this.layOutMoleculeList(this.moleculeNodes);

    // center in the black box
    if (this.box.quantityProperty.value > 0) {
      // Molecule centering is adjusted for MultipleCollectionBoxNodes.
      this.centerMoleculesInBlackBox(this.box.capacity > 1);
    }
  }

  /**
   * Layout of molecules. Spaced horizontally with moleculePadding, and vertically centered
   * @param {Array.<Rectangle>} moleculeNodes List of molecules to lay out
   *
   * @private
   */
  layOutMoleculeList(moleculeNodes) {
    const maxHeight = _.max(moleculeNodes.map(node => node.height));
    let x = 0;
    moleculeNodes.forEach(moleculeNode => {
      moleculeNode.setTranslation(x, (maxHeight - moleculeNode.height) / 2);
      x += moleculeNode.width;
    });
  }

  /**
   * Return the molecule area. Excluding the area in the black box where the 3D button needs to go.
   *
   * @private
   * @returns {Bounds2}
   */
  getMoleculeAreaInBlackBox() {
    const bounds = this.blackBox.bounds;

    // leave room for 3d button on right hand side
    return bounds.withMaxX(bounds.maxX - BLACK_BOX_PADDING - this.button3dWidth);
  }

  /**
   * Center the molecules, while considering if the black box can fit multiple molecules
   * @param {boolean} isMultipleCollectionBox
   *
   * @private
   */
  centerMoleculesInBlackBox(isMultipleCollectionBox) {
    const moleculeArea = this.getMoleculeAreaInBlackBox();

    // for now, we scale the molecules up and down depending on their size
    isMultipleCollectionBox ? this.moleculeLayer.setScaleMagnitude(1.23) : this.moleculeLayer.setScaleMagnitude(1);
    const xScale = (moleculeArea.width - 5) / this.moleculeLayer.width;
    const yScale = (moleculeArea.height - 5) / this.moleculeLayer.height;
    this.moleculeLayer.setScaleMagnitude(Math.min(xScale, yScale));

    // Shift the molecule center for MultipleCollectionBoxNodes
    const shiftX = isMultipleCollectionBox ? 15 : 0;
    this.moleculeLayer.center = moleculeArea.center.minus(moleculeArea.leftTop.plusXY(shiftX, 0));
  }

  /**
   * Update the stroke around the collection box.
   *
   * @private
   */
  updateBoxGraphics() {
    if (this.box.isFull()) {
      this.blackBox.stroke = BAMConstants.MOLECULE_COLLECTION_BOX_HIGHLIGHT;
      this.box.cueVisibilityProperty.value = false;
    } else {
      this.blackBox.stroke = BAMConstants.MOLECULE_COLLECTION_BACKGROUND;
    }
  }

  /**
   * Sets up a blinking box to register that a molecule was created that can go into a box
   *
   * @private
   */
  blink() {
    const blinkLengthInSeconds = 1.3;

    // our delay between states
    const blinkDelayInMs = 100;

    // properties that we will use over time in our blinker
    let on = false; // on/off state
    let counts = Math.floor(blinkLengthInSeconds * 1000 / blinkDelayInMs); // decrements to zero to stop the blinker

    this.cancelBlinksInProgress();
    const tick = () => {
      // precautionarily set this to null so we never cancel a timeout that has occurred
      this.blinkTimeout = null;

      // decrement and check
      counts--;
      assert && assert(counts >= 0);
      if (counts === 0) {
        // set up our normal graphics (border/background)
        this.updateBoxGraphics();

        // setTimeout not re-set
      } else {
        // toggle state
        on = !on;

        // draw graphics
        if (on) {
          this.blackBox.stroke = BAMConstants.MOLECULE_COLLECTION_BOX_BORDER_BLINK;
        } else {
          this.blackBox.stroke = BAMConstants.MOLECULE_COLLECTION_BACKGROUND;
        }

        // set the blinkTimeout so it can be canceled
        this.blinkTimeout = stepTimer.setTimeout(tick, blinkDelayInMs);
      }
    };
    this.blinkTimeout = stepTimer.setTimeout(tick, blinkDelayInMs);
  }

  /**
   * Interrupt the blinking
   *
   * @private
   */
  cancelBlinksInProgress() {
    // stop any previous blinking from happening. don't want double-blinking
    if (this.blinkTimeout !== null) {
      stepTimer.clearTimeout(this.blinkTimeout);
      this.blinkTimeout = null;
    }
  }

  /**
   * Search for a thumbnail that represents the completed molecule. Thumbnail is drawn using canvas.
   * @param {CompleteMolecule} completeMolecule
   * @param {Object.<moleculeId:number, Node>} moleculeMap
   *
   * @private
   * @returns {Node}
   */
  static lookupThumbnail(completeMolecule, moleculeMap) {
    const dimensionLength = 50;
    if (!moleculeMap[completeMolecule.moleculeId]) {
      moleculeMap[completeMolecule.moleculeId] = BAMIconFactory.createIconImage(completeMolecule, dimensionLength, dimensionLength, 1, true);
    }
    // wrap the returned image in an extra node so we can transform them independently, and that takes up the proper amount of space
    return new Rectangle(0, 0, dimensionLength, dimensionLength, {
      children: [moleculeMap[completeMolecule.moleculeId]]
    });
  }
}
buildAMolecule.register('CollectionBoxNode', CollectionBoxNode);
export default CollectionBoxNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJzdGVwVGltZXIiLCJBcnJvd05vZGUiLCJDb2xvciIsIk5vZGUiLCJSZWN0YW5nbGUiLCJWQm94IiwiYnVpbGRBTW9sZWN1bGUiLCJCQU1Db25zdGFudHMiLCJNb2xlY3VsZUxpc3QiLCJCQU1JY29uRmFjdG9yeSIsIlNob3dNb2xlY3VsZTNEQnV0dG9uTm9kZSIsIkJMQUNLX0JPWF9QQURESU5HIiwibW9sZWN1bGVJZFRodW1ibmFpbE1hcCIsIkNvbGxlY3Rpb25Cb3hOb2RlIiwiY29uc3RydWN0b3IiLCJib3giLCJ0b01vZGVsQm91bmRzIiwic2hvd0RpYWxvZ0NhbGxiYWNrIiwib3B0aW9ucyIsInNwYWNpbmciLCJib3hOb2RlIiwibW9sZWN1bGVOb2RlcyIsImJsaW5rVGltZW91dCIsIm1vbGVjdWxlTm9kZU1hcCIsImJsYWNrQm94IiwiZmlsbCIsIkJMQUNLIiwibGluZVdpZHRoIiwic2hvdzNkQnV0dG9uIiwibW9sZWN1bGVUeXBlIiwidG91Y2hBcmVhIiwiYm91bmRzIiwiZGlsYXRlZCIsInJpZ2h0IiwiY2VudGVyWSIsImJ1dHRvbjNkV2lkdGgiLCJ3aWR0aCIsInF1YW50aXR5UHJvcGVydHkiLCJsaW5rIiwicXVhbnRpdHkiLCJ2aXNpYmxlIiwiYWRkQ2hpbGQiLCJjdWVOb2RlIiwic3Ryb2tlIiwibGVmdCIsInRhaWxXaWR0aCIsImhlYWRXaWR0aCIsInBpY2thYmxlIiwiY3VlVmlzaWJpbGl0eVByb3BlcnR5IiwibG9jYWxCb3VuZHMiLCJ3aXRoTWF4WCIsIm1vbGVjdWxlTGF5ZXIiLCJ1cGRhdGVCb3hHcmFwaGljcyIsImFkZGVkTW9sZWN1bGVFbWl0dGVyIiwiYWRkTGlzdGVuZXIiLCJhZGRNb2xlY3VsZSIsImJpbmQiLCJyZW1vdmVkTW9sZWN1bGVFbWl0dGVyIiwicmVtb3ZlTW9sZWN1bGUiLCJhY2NlcHRlZE1vbGVjdWxlQ3JlYXRpb25FbWl0dGVyIiwiYmxpbmsiLCJtdXRhdGUiLCJ1cGRhdGVQb3NpdGlvbiIsImRyb3BCb3VuZHNQcm9wZXJ0eSIsInNldCIsIm1vbGVjdWxlIiwiY2FuY2VsQmxpbmtzSW5Qcm9ncmVzcyIsImNvbXBsZXRlTW9sZWN1bGUiLCJnZXRNYXN0ZXJJbnN0YW5jZSIsImZpbmRNYXRjaGluZ0NvbXBsZXRlTW9sZWN1bGUiLCJwc2V1ZG8zRE5vZGUiLCJsb29rdXBUaHVtYm5haWwiLCJwdXNoIiwibW9sZWN1bGVJZCIsInVwZGF0ZU1vbGVjdWxlTGF5b3V0IiwibGFzdE1vbGVjdWxlTm9kZSIsInJlbW92ZUNoaWxkIiwiXyIsInJlbW92ZSIsIml0ZW0iLCJkZXRhY2giLCJsYXlPdXRNb2xlY3VsZUxpc3QiLCJ2YWx1ZSIsImNlbnRlck1vbGVjdWxlc0luQmxhY2tCb3giLCJjYXBhY2l0eSIsIm1heEhlaWdodCIsIm1heCIsIm1hcCIsIm5vZGUiLCJoZWlnaHQiLCJ4IiwiZm9yRWFjaCIsIm1vbGVjdWxlTm9kZSIsInNldFRyYW5zbGF0aW9uIiwiZ2V0TW9sZWN1bGVBcmVhSW5CbGFja0JveCIsIm1heFgiLCJpc011bHRpcGxlQ29sbGVjdGlvbkJveCIsIm1vbGVjdWxlQXJlYSIsInNldFNjYWxlTWFnbml0dWRlIiwieFNjYWxlIiwieVNjYWxlIiwiTWF0aCIsIm1pbiIsInNoaWZ0WCIsImNlbnRlciIsIm1pbnVzIiwibGVmdFRvcCIsInBsdXNYWSIsImlzRnVsbCIsIk1PTEVDVUxFX0NPTExFQ1RJT05fQk9YX0hJR0hMSUdIVCIsIk1PTEVDVUxFX0NPTExFQ1RJT05fQkFDS0dST1VORCIsImJsaW5rTGVuZ3RoSW5TZWNvbmRzIiwiYmxpbmtEZWxheUluTXMiLCJvbiIsImNvdW50cyIsImZsb29yIiwidGljayIsImFzc2VydCIsIk1PTEVDVUxFX0NPTExFQ1RJT05fQk9YX0JPUkRFUl9CTElOSyIsInNldFRpbWVvdXQiLCJjbGVhclRpbWVvdXQiLCJtb2xlY3VsZU1hcCIsImRpbWVuc2lvbkxlbmd0aCIsImNyZWF0ZUljb25JbWFnZSIsImNoaWxkcmVuIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJDb2xsZWN0aW9uQm94Tm9kZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMC0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBSZXByZXNlbnRzIGEgZ2VuZXJpYyBjb2xsZWN0aW9uIGJveCBub2RlIHdoaWNoIGlzIGRlY29yYXRlZCBieSBhZGRpdGlvbmFsIGhlYWRlciBub2RlcyAocHJvYmFibHkgdGV4dCBkZXNjcmliaW5nIHdoYXQgY2FuIGJlIHB1dCBpbiwgd2hhdCBpcyBpbiBpdCxcclxuICogZXRjLilcclxuICpcclxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxyXG4gKiBAYXV0aG9yIERlbnplbGwgQmFybmV0dCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgc3RlcFRpbWVyIGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvc3RlcFRpbWVyLmpzJztcclxuaW1wb3J0IEFycm93Tm9kZSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvQXJyb3dOb2RlLmpzJztcclxuaW1wb3J0IHsgQ29sb3IsIE5vZGUsIFJlY3RhbmdsZSwgVkJveCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBidWlsZEFNb2xlY3VsZSBmcm9tICcuLi8uLi9idWlsZEFNb2xlY3VsZS5qcyc7XHJcbmltcG9ydCBCQU1Db25zdGFudHMgZnJvbSAnLi4vQkFNQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IE1vbGVjdWxlTGlzdCBmcm9tICcuLi9tb2RlbC9Nb2xlY3VsZUxpc3QuanMnO1xyXG5pbXBvcnQgQkFNSWNvbkZhY3RvcnkgZnJvbSAnLi9CQU1JY29uRmFjdG9yeS5qcyc7XHJcbmltcG9ydCBTaG93TW9sZWN1bGUzREJ1dHRvbk5vZGUgZnJvbSAnLi92aWV3M2QvU2hvd01vbGVjdWxlM0RCdXR0b25Ob2RlLmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBCTEFDS19CT1hfUEFERElORyA9IDc7XHJcblxyXG4vLyB7T2JqZWN0Ljxtb2xlY3VsZUlkOm51bWJlciwgTm9kZT59IFVzZWQgdG8gbWFwIG1vbGVjdWxlcyB0byB0aGVpciByZXNwZWN0aXZlIHRodW1ibmFpbHNcclxuY29uc3QgbW9sZWN1bGVJZFRodW1ibmFpbE1hcCA9IHt9O1xyXG5cclxuY2xhc3MgQ29sbGVjdGlvbkJveE5vZGUgZXh0ZW5kcyBWQm94IHtcclxuICAvKipcclxuICAgKiBAcGFyYW0ge0NvbGxlY3Rpb25Cb3h9IGJveFxyXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb259IHRvTW9kZWxCb3VuZHMgLSBVc2VkIHRvIHVwZGF0ZSBwb3NpdGlvbiBvZiB0aGUgY29sbGVjdGlvbiBib3hcclxuICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBzaG93RGlhbG9nQ2FsbGJhY2tcclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIGJveCwgdG9Nb2RlbEJvdW5kcywgc2hvd0RpYWxvZ0NhbGxiYWNrLCBvcHRpb25zICkge1xyXG4gICAgc3VwZXIoIHsgc3BhY2luZzogMiB9ICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge0NvbGxlY3Rpb25Cb3h9XHJcbiAgICB0aGlzLmJveCA9IGJveDtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7ZnVuY3Rpb259XHJcbiAgICB0aGlzLnRvTW9kZWxCb3VuZHMgPSB0b01vZGVsQm91bmRzO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtOb2RlfVxyXG4gICAgdGhpcy5ib3hOb2RlID0gbmV3IE5vZGUoKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7QXJyYXkuPE5vZGU+fVxyXG4gICAgdGhpcy5tb2xlY3VsZU5vZGVzID0gW107XHJcblxyXG4gICAgLy8gQHByaXZhdGUge2Z1bmN0aW9ufG51bGx9IE5PVCB6ZXJvLCBzaW5jZSB0aGF0IGNvdWxkIGJlIGEgdmFsaWQgdGltZW91dCBJRCBmb3Igc3RlcFRpbWVyLnNldFRpbWVvdXQhXHJcbiAgICB0aGlzLmJsaW5rVGltZW91dCA9IG51bGw7XHJcblxyXG4gICAgLy8gQHByaXZhdGUge09iamVjdC48bW9sZWN1bGVJZDpudW1iZXIsTm9kZT59IHN0b3JlcyBub2RlcyBmb3IgZWFjaCBtb2xlY3VsZVxyXG4gICAgdGhpcy5tb2xlY3VsZU5vZGVNYXAgPSB7fTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7UmVjdGFuZ2xlfVxyXG4gICAgdGhpcy5ibGFja0JveCA9IG5ldyBSZWN0YW5nbGUoIDAsIDAsIDE2MCwgNTAsIHtcclxuICAgICAgZmlsbDogQ29sb3IuQkxBQ0ssXHJcbiAgICAgIGxpbmVXaWR0aDogNFxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEFycmFuZ2UgYnV0dG9uIHBvc2l0aW9uIGZvciB0byB0cmlnZ2VyIDNEIHJlcHJlc2VudGF0aW9uXHJcbiAgICBjb25zdCBzaG93M2RCdXR0b24gPSBuZXcgU2hvd01vbGVjdWxlM0RCdXR0b25Ob2RlKCBib3gubW9sZWN1bGVUeXBlLCBzaG93RGlhbG9nQ2FsbGJhY2sgKTtcclxuICAgIHNob3czZEJ1dHRvbi50b3VjaEFyZWEgPSBzaG93M2RCdXR0b24uYm91bmRzLmRpbGF0ZWQoIDEwICk7XHJcbiAgICBzaG93M2RCdXR0b24ucmlnaHQgPSB0aGlzLmJsYWNrQm94LnJpZ2h0IC0gQkxBQ0tfQk9YX1BBRERJTkc7XHJcbiAgICBzaG93M2RCdXR0b24uY2VudGVyWSA9IHRoaXMuYmxhY2tCb3guY2VudGVyWTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7bnVtYmVyfVxyXG4gICAgdGhpcy5idXR0b24zZFdpZHRoID0gc2hvdzNkQnV0dG9uLndpZHRoO1xyXG4gICAgYm94LnF1YW50aXR5UHJvcGVydHkubGluayggcXVhbnRpdHkgPT4geyBzaG93M2RCdXR0b24udmlzaWJsZSA9IHF1YW50aXR5ID4gMDsgfSApO1xyXG4gICAgdGhpcy5ibGFja0JveC5hZGRDaGlsZCggc2hvdzNkQnV0dG9uICk7XHJcbiAgICB0aGlzLmJveE5vZGUuYWRkQ2hpbGQoIHRoaXMuYmxhY2tCb3ggKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7QXJyb3dOb2RlfUN1ZSB0aGF0IHRlbGxzIHRoZSB1c2VyIHdoZXJlIHRvIGRyb3AgdGhlIG1vbGVjdWxlLlxyXG4gICAgdGhpcy5jdWVOb2RlID0gbmV3IEFycm93Tm9kZSggMTAsIDAsIDM0LCAwLCB7XHJcbiAgICAgIGZpbGw6ICdibHVlJyxcclxuICAgICAgc3Ryb2tlOiAnYmxhY2snLFxyXG4gICAgICByaWdodDogdGhpcy5ibGFja0JveC5sZWZ0IC0gNSxcclxuICAgICAgY2VudGVyWTogdGhpcy5ibGFja0JveC5jZW50ZXJZLFxyXG4gICAgICB0YWlsV2lkdGg6IDgsXHJcbiAgICAgIGhlYWRXaWR0aDogMTQsXHJcbiAgICAgIHBpY2thYmxlOiBmYWxzZVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIEN1ZXMgZXhpc3RzIGZvciB0aGUgZHVyYXRpb24gb2Ygc2ltIGxpZmV0aW1lLlxyXG4gICAgYm94LmN1ZVZpc2liaWxpdHlQcm9wZXJ0eS5saW5rKCB2aXNpYmxlID0+IHtcclxuICAgICAgdGhpcy5jdWVOb2RlLnZpc2libGUgPSB2aXNpYmxlO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIFRoZSBibGFjayBib3gncyBib3VuZHMgYXJlIGV4cGFuZGVkIHRvIGtlZXAgdGhlIGJsYWNrIGJveCBzeW1tZXRyaWNhbCB3aXRoIHRoZSBwYW5lbC4gVGhlIGFycm93IG5vZGUgaXNcclxuICAgIC8vIHBvc2l0aW9uZWQgdG8gdGhlIHJpZ2h0IHNpZGUgb2YgdGhlIGNlbnRlcmVkIGJsYWNrIGJveC5cclxuICAgIHRoaXMuYmxhY2tCb3gubG9jYWxCb3VuZHMgPSB0aGlzLmJsYWNrQm94LmxvY2FsQm91bmRzLndpdGhNYXhYKFxyXG4gICAgICB0aGlzLmJsYWNrQm94LmxvY2FsQm91bmRzLnJpZ2h0ICsgdGhpcy5ibGFja0JveC5sZWZ0IC0gdGhpcy5jdWVOb2RlLmxlZnRcclxuICAgICk7XHJcbiAgICB0aGlzLmJveE5vZGUuYWRkQ2hpbGQoIHRoaXMuY3VlTm9kZSApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtOb2RlfSBMYXllciB0byBob3VzZSBtb2xlY3VsZXNcclxuICAgIHRoaXMubW9sZWN1bGVMYXllciA9IG5ldyBOb2RlKCB7fSApO1xyXG4gICAgdGhpcy5ib3hOb2RlLmFkZENoaWxkKCB0aGlzLm1vbGVjdWxlTGF5ZXIgKTtcclxuXHJcbiAgICAvLyBUb2dnbGUgdGhlIGJveCdzIGN1ZXNcclxuICAgIHRoaXMudXBkYXRlQm94R3JhcGhpY3MoKTtcclxuXHJcbiAgICAvLyBBZGQgbGlzdGVuZXJzIGZvciB0aGUgQ29sbGVjdGlvbiBCb3ggdGhhdCBleGlzdCBmb3IgdGhlIHNpbSBsaWZldGltZS5cclxuICAgIGJveC5hZGRlZE1vbGVjdWxlRW1pdHRlci5hZGRMaXN0ZW5lciggdGhpcy5hZGRNb2xlY3VsZS5iaW5kKCB0aGlzICkgKTtcclxuICAgIGJveC5yZW1vdmVkTW9sZWN1bGVFbWl0dGVyLmFkZExpc3RlbmVyKCB0aGlzLnJlbW92ZU1vbGVjdWxlLmJpbmQoIHRoaXMgKSApO1xyXG4gICAgYm94LmFjY2VwdGVkTW9sZWN1bGVDcmVhdGlvbkVtaXR0ZXIuYWRkTGlzdGVuZXIoIHRoaXMuYmxpbmsuYmluZCggdGhpcyApICk7XHJcblxyXG4gICAgdGhpcy5hZGRDaGlsZCggdGhpcy5ib3hOb2RlICk7XHJcbiAgICB0aGlzLm11dGF0ZSggb3B0aW9ucyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQWxsb3dzIHVzIHRvIHNldCB0aGUgbW9kZWwgcG9zaXRpb24gb2YgdGhlIGNvbGxlY3Rpb24gYm94ZXMgYWNjb3JkaW5nIHRvIGhvdyB0aGV5IGFyZSBsYWlkIG91dFxyXG4gICAqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHVwZGF0ZVBvc2l0aW9uKCkge1xyXG4gICAgdGhpcy5ib3guZHJvcEJvdW5kc1Byb3BlcnR5LnNldCggdGhpcy50b01vZGVsQm91bmRzKCB0aGlzLmJsYWNrQm94ICkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEFkZCBtb2xlY3VsZSB0byBtYXAgYW5kIG1vbGVjdWxlIGxheWVyLiBVcGRhdGUgdGhlIGxheWVyIGFuZCBncmFwaGljcy5cclxuICAgKiBAcGFyYW0ge01vbGVjdWxlfSBtb2xlY3VsZVxyXG4gICAqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGFkZE1vbGVjdWxlKCBtb2xlY3VsZSApIHtcclxuICAgIHRoaXMuY2FuY2VsQmxpbmtzSW5Qcm9ncmVzcygpO1xyXG4gICAgdGhpcy51cGRhdGVCb3hHcmFwaGljcygpO1xyXG5cclxuICAgIGNvbnN0IGNvbXBsZXRlTW9sZWN1bGUgPSBNb2xlY3VsZUxpc3QuZ2V0TWFzdGVySW5zdGFuY2UoKS5maW5kTWF0Y2hpbmdDb21wbGV0ZU1vbGVjdWxlKCBtb2xlY3VsZSApO1xyXG4gICAgY29uc3QgcHNldWRvM0ROb2RlID0gQ29sbGVjdGlvbkJveE5vZGUubG9va3VwVGh1bWJuYWlsKCBjb21wbGV0ZU1vbGVjdWxlLCBtb2xlY3VsZUlkVGh1bWJuYWlsTWFwICk7XHJcbiAgICB0aGlzLm1vbGVjdWxlTGF5ZXIuYWRkQ2hpbGQoIHBzZXVkbzNETm9kZSApO1xyXG4gICAgdGhpcy5tb2xlY3VsZU5vZGVzLnB1c2goIHBzZXVkbzNETm9kZSApO1xyXG4gICAgdGhpcy5tb2xlY3VsZU5vZGVNYXBbIG1vbGVjdWxlLm1vbGVjdWxlSWQgXSA9IHBzZXVkbzNETm9kZTtcclxuXHJcbiAgICB0aGlzLnVwZGF0ZU1vbGVjdWxlTGF5b3V0KCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZW1vdmUgbW9sZWN1bGUgdG8gbWFwIGFuZCBtb2xlY3VsZSBsYXllci4gVXBkYXRlIHRoZSBsYXllciBhbmQgZ3JhcGhpY3MuXHJcbiAgICogQHBhcmFtIHtNb2xlY3VsZX0gbW9sZWN1bGVcclxuICAgKlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgcmVtb3ZlTW9sZWN1bGUoIG1vbGVjdWxlICkge1xyXG4gICAgdGhpcy5jYW5jZWxCbGlua3NJblByb2dyZXNzKCk7XHJcbiAgICB0aGlzLnVwZGF0ZUJveEdyYXBoaWNzKCk7XHJcblxyXG4gICAgY29uc3QgbGFzdE1vbGVjdWxlTm9kZSA9IHRoaXMubW9sZWN1bGVOb2RlTWFwWyBtb2xlY3VsZS5tb2xlY3VsZUlkIF07XHJcbiAgICB0aGlzLm1vbGVjdWxlTGF5ZXIucmVtb3ZlQ2hpbGQoIGxhc3RNb2xlY3VsZU5vZGUgKTtcclxuICAgIF8ucmVtb3ZlKCB0aGlzLm1vbGVjdWxlTm9kZXMsIGl0ZW0gPT4ge1xyXG4gICAgICByZXR1cm4gbGFzdE1vbGVjdWxlTm9kZSA9PT0gaXRlbSA/IGxhc3RNb2xlY3VsZU5vZGUgOiBudWxsO1xyXG4gICAgfSApO1xyXG4gICAgdGhpcy5tb2xlY3VsZU5vZGVNYXBbIG1vbGVjdWxlLm1vbGVjdWxlSWQgXS5kZXRhY2goKTtcclxuICAgIGRlbGV0ZSB0aGlzLm1vbGVjdWxlTm9kZU1hcFsgbW9sZWN1bGUubW9sZWN1bGVJZCBdO1xyXG5cclxuICAgIHRoaXMudXBkYXRlTW9sZWN1bGVMYXlvdXQoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFVwZGF0ZSB0aGUgbW9sZWN1bGVzIHRoYXQgYXJlIHdpdGhpbiB0aGUgYm94XHJcbiAgICpcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIHVwZGF0ZU1vbGVjdWxlTGF5b3V0KCkge1xyXG5cclxuICAgIC8vIHBvc2l0aW9uIG1vbGVjdWxlIG5vZGVzXHJcbiAgICB0aGlzLmxheU91dE1vbGVjdWxlTGlzdCggdGhpcy5tb2xlY3VsZU5vZGVzICk7XHJcblxyXG4gICAgLy8gY2VudGVyIGluIHRoZSBibGFjayBib3hcclxuICAgIGlmICggdGhpcy5ib3gucXVhbnRpdHlQcm9wZXJ0eS52YWx1ZSA+IDAgKSB7XHJcblxyXG4gICAgICAvLyBNb2xlY3VsZSBjZW50ZXJpbmcgaXMgYWRqdXN0ZWQgZm9yIE11bHRpcGxlQ29sbGVjdGlvbkJveE5vZGVzLlxyXG4gICAgICB0aGlzLmNlbnRlck1vbGVjdWxlc0luQmxhY2tCb3goIHRoaXMuYm94LmNhcGFjaXR5ID4gMSApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogTGF5b3V0IG9mIG1vbGVjdWxlcy4gU3BhY2VkIGhvcml6b250YWxseSB3aXRoIG1vbGVjdWxlUGFkZGluZywgYW5kIHZlcnRpY2FsbHkgY2VudGVyZWRcclxuICAgKiBAcGFyYW0ge0FycmF5LjxSZWN0YW5nbGU+fSBtb2xlY3VsZU5vZGVzIExpc3Qgb2YgbW9sZWN1bGVzIHRvIGxheSBvdXRcclxuICAgKlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgbGF5T3V0TW9sZWN1bGVMaXN0KCBtb2xlY3VsZU5vZGVzICkge1xyXG4gICAgY29uc3QgbWF4SGVpZ2h0ID0gXy5tYXgoIG1vbGVjdWxlTm9kZXMubWFwKCBub2RlID0+IG5vZGUuaGVpZ2h0ICkgKTtcclxuICAgIGxldCB4ID0gMDtcclxuICAgIG1vbGVjdWxlTm9kZXMuZm9yRWFjaCggbW9sZWN1bGVOb2RlID0+IHtcclxuICAgICAgbW9sZWN1bGVOb2RlLnNldFRyYW5zbGF0aW9uKCB4LCAoIG1heEhlaWdodCAtIG1vbGVjdWxlTm9kZS5oZWlnaHQgKSAvIDIgKTtcclxuICAgICAgeCArPSBtb2xlY3VsZU5vZGUud2lkdGg7XHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm4gdGhlIG1vbGVjdWxlIGFyZWEuIEV4Y2x1ZGluZyB0aGUgYXJlYSBpbiB0aGUgYmxhY2sgYm94IHdoZXJlIHRoZSAzRCBidXR0b24gbmVlZHMgdG8gZ28uXHJcbiAgICpcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqIEByZXR1cm5zIHtCb3VuZHMyfVxyXG4gICAqL1xyXG4gIGdldE1vbGVjdWxlQXJlYUluQmxhY2tCb3goKSB7XHJcbiAgICBjb25zdCBib3VuZHMgPSB0aGlzLmJsYWNrQm94LmJvdW5kcztcclxuXHJcbiAgICAvLyBsZWF2ZSByb29tIGZvciAzZCBidXR0b24gb24gcmlnaHQgaGFuZCBzaWRlXHJcbiAgICByZXR1cm4gYm91bmRzLndpdGhNYXhYKCBib3VuZHMubWF4WCAtIEJMQUNLX0JPWF9QQURESU5HIC0gdGhpcy5idXR0b24zZFdpZHRoICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDZW50ZXIgdGhlIG1vbGVjdWxlcywgd2hpbGUgY29uc2lkZXJpbmcgaWYgdGhlIGJsYWNrIGJveCBjYW4gZml0IG11bHRpcGxlIG1vbGVjdWxlc1xyXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gaXNNdWx0aXBsZUNvbGxlY3Rpb25Cb3hcclxuICAgKlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgY2VudGVyTW9sZWN1bGVzSW5CbGFja0JveCggaXNNdWx0aXBsZUNvbGxlY3Rpb25Cb3ggKSB7XHJcbiAgICBjb25zdCBtb2xlY3VsZUFyZWEgPSB0aGlzLmdldE1vbGVjdWxlQXJlYUluQmxhY2tCb3goKTtcclxuXHJcbiAgICAvLyBmb3Igbm93LCB3ZSBzY2FsZSB0aGUgbW9sZWN1bGVzIHVwIGFuZCBkb3duIGRlcGVuZGluZyBvbiB0aGVpciBzaXplXHJcbiAgICBpc011bHRpcGxlQ29sbGVjdGlvbkJveCA/IHRoaXMubW9sZWN1bGVMYXllci5zZXRTY2FsZU1hZ25pdHVkZSggMS4yMyApIDogdGhpcy5tb2xlY3VsZUxheWVyLnNldFNjYWxlTWFnbml0dWRlKCAxICk7XHJcbiAgICBjb25zdCB4U2NhbGUgPSAoIG1vbGVjdWxlQXJlYS53aWR0aCAtIDUgKSAvIHRoaXMubW9sZWN1bGVMYXllci53aWR0aDtcclxuICAgIGNvbnN0IHlTY2FsZSA9ICggbW9sZWN1bGVBcmVhLmhlaWdodCAtIDUgKSAvIHRoaXMubW9sZWN1bGVMYXllci5oZWlnaHQ7XHJcbiAgICB0aGlzLm1vbGVjdWxlTGF5ZXIuc2V0U2NhbGVNYWduaXR1ZGUoIE1hdGgubWluKCB4U2NhbGUsIHlTY2FsZSApICk7XHJcblxyXG4gICAgLy8gU2hpZnQgdGhlIG1vbGVjdWxlIGNlbnRlciBmb3IgTXVsdGlwbGVDb2xsZWN0aW9uQm94Tm9kZXNcclxuICAgIGNvbnN0IHNoaWZ0WCA9IGlzTXVsdGlwbGVDb2xsZWN0aW9uQm94ID8gMTUgOiAwO1xyXG4gICAgdGhpcy5tb2xlY3VsZUxheWVyLmNlbnRlciA9IG1vbGVjdWxlQXJlYS5jZW50ZXIubWludXMoIG1vbGVjdWxlQXJlYS5sZWZ0VG9wLnBsdXNYWSggc2hpZnRYLCAwICkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFVwZGF0ZSB0aGUgc3Ryb2tlIGFyb3VuZCB0aGUgY29sbGVjdGlvbiBib3guXHJcbiAgICpcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIHVwZGF0ZUJveEdyYXBoaWNzKCkge1xyXG4gICAgaWYgKCB0aGlzLmJveC5pc0Z1bGwoKSApIHtcclxuICAgICAgdGhpcy5ibGFja0JveC5zdHJva2UgPSBCQU1Db25zdGFudHMuTU9MRUNVTEVfQ09MTEVDVElPTl9CT1hfSElHSExJR0hUO1xyXG4gICAgICB0aGlzLmJveC5jdWVWaXNpYmlsaXR5UHJvcGVydHkudmFsdWUgPSBmYWxzZTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICB0aGlzLmJsYWNrQm94LnN0cm9rZSA9IEJBTUNvbnN0YW50cy5NT0xFQ1VMRV9DT0xMRUNUSU9OX0JBQ0tHUk9VTkQ7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXRzIHVwIGEgYmxpbmtpbmcgYm94IHRvIHJlZ2lzdGVyIHRoYXQgYSBtb2xlY3VsZSB3YXMgY3JlYXRlZCB0aGF0IGNhbiBnbyBpbnRvIGEgYm94XHJcbiAgICpcclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIGJsaW5rKCkge1xyXG4gICAgY29uc3QgYmxpbmtMZW5ndGhJblNlY29uZHMgPSAxLjM7XHJcblxyXG4gICAgLy8gb3VyIGRlbGF5IGJldHdlZW4gc3RhdGVzXHJcbiAgICBjb25zdCBibGlua0RlbGF5SW5NcyA9IDEwMDtcclxuXHJcbiAgICAvLyBwcm9wZXJ0aWVzIHRoYXQgd2Ugd2lsbCB1c2Ugb3ZlciB0aW1lIGluIG91ciBibGlua2VyXHJcbiAgICBsZXQgb24gPSBmYWxzZTsgLy8gb24vb2ZmIHN0YXRlXHJcbiAgICBsZXQgY291bnRzID0gTWF0aC5mbG9vciggYmxpbmtMZW5ndGhJblNlY29uZHMgKiAxMDAwIC8gYmxpbmtEZWxheUluTXMgKTsgLy8gZGVjcmVtZW50cyB0byB6ZXJvIHRvIHN0b3AgdGhlIGJsaW5rZXJcclxuXHJcbiAgICB0aGlzLmNhbmNlbEJsaW5rc0luUHJvZ3Jlc3MoKTtcclxuXHJcbiAgICBjb25zdCB0aWNrID0gKCkgPT4ge1xyXG5cclxuICAgICAgLy8gcHJlY2F1dGlvbmFyaWx5IHNldCB0aGlzIHRvIG51bGwgc28gd2UgbmV2ZXIgY2FuY2VsIGEgdGltZW91dCB0aGF0IGhhcyBvY2N1cnJlZFxyXG4gICAgICB0aGlzLmJsaW5rVGltZW91dCA9IG51bGw7XHJcblxyXG4gICAgICAvLyBkZWNyZW1lbnQgYW5kIGNoZWNrXHJcbiAgICAgIGNvdW50cy0tO1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBjb3VudHMgPj0gMCApO1xyXG5cclxuICAgICAgaWYgKCBjb3VudHMgPT09IDAgKSB7XHJcblxyXG4gICAgICAgIC8vIHNldCB1cCBvdXIgbm9ybWFsIGdyYXBoaWNzIChib3JkZXIvYmFja2dyb3VuZClcclxuICAgICAgICB0aGlzLnVwZGF0ZUJveEdyYXBoaWNzKCk7XHJcblxyXG4gICAgICAgIC8vIHNldFRpbWVvdXQgbm90IHJlLXNldFxyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIC8vIHRvZ2dsZSBzdGF0ZVxyXG4gICAgICAgIG9uID0gIW9uO1xyXG5cclxuICAgICAgICAvLyBkcmF3IGdyYXBoaWNzXHJcbiAgICAgICAgaWYgKCBvbiApIHtcclxuICAgICAgICAgIHRoaXMuYmxhY2tCb3guc3Ryb2tlID0gQkFNQ29uc3RhbnRzLk1PTEVDVUxFX0NPTExFQ1RJT05fQk9YX0JPUkRFUl9CTElOSztcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICB0aGlzLmJsYWNrQm94LnN0cm9rZSA9IEJBTUNvbnN0YW50cy5NT0xFQ1VMRV9DT0xMRUNUSU9OX0JBQ0tHUk9VTkQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBzZXQgdGhlIGJsaW5rVGltZW91dCBzbyBpdCBjYW4gYmUgY2FuY2VsZWRcclxuICAgICAgICB0aGlzLmJsaW5rVGltZW91dCA9IHN0ZXBUaW1lci5zZXRUaW1lb3V0KCB0aWNrLCBibGlua0RlbGF5SW5NcyApO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG4gICAgdGhpcy5ibGlua1RpbWVvdXQgPSBzdGVwVGltZXIuc2V0VGltZW91dCggdGljaywgYmxpbmtEZWxheUluTXMgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEludGVycnVwdCB0aGUgYmxpbmtpbmdcclxuICAgKlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgY2FuY2VsQmxpbmtzSW5Qcm9ncmVzcygpIHtcclxuXHJcbiAgICAvLyBzdG9wIGFueSBwcmV2aW91cyBibGlua2luZyBmcm9tIGhhcHBlbmluZy4gZG9uJ3Qgd2FudCBkb3VibGUtYmxpbmtpbmdcclxuICAgIGlmICggdGhpcy5ibGlua1RpbWVvdXQgIT09IG51bGwgKSB7XHJcbiAgICAgIHN0ZXBUaW1lci5jbGVhclRpbWVvdXQoIHRoaXMuYmxpbmtUaW1lb3V0ICk7XHJcbiAgICAgIHRoaXMuYmxpbmtUaW1lb3V0ID0gbnVsbDtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNlYXJjaCBmb3IgYSB0aHVtYm5haWwgdGhhdCByZXByZXNlbnRzIHRoZSBjb21wbGV0ZWQgbW9sZWN1bGUuIFRodW1ibmFpbCBpcyBkcmF3biB1c2luZyBjYW52YXMuXHJcbiAgICogQHBhcmFtIHtDb21wbGV0ZU1vbGVjdWxlfSBjb21wbGV0ZU1vbGVjdWxlXHJcbiAgICogQHBhcmFtIHtPYmplY3QuPG1vbGVjdWxlSWQ6bnVtYmVyLCBOb2RlPn0gbW9sZWN1bGVNYXBcclxuICAgKlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICogQHJldHVybnMge05vZGV9XHJcbiAgICovXHJcbiAgc3RhdGljIGxvb2t1cFRodW1ibmFpbCggY29tcGxldGVNb2xlY3VsZSwgbW9sZWN1bGVNYXAgKSB7XHJcbiAgICBjb25zdCBkaW1lbnNpb25MZW5ndGggPSA1MDtcclxuICAgIGlmICggIW1vbGVjdWxlTWFwWyBjb21wbGV0ZU1vbGVjdWxlLm1vbGVjdWxlSWQgXSApIHtcclxuICAgICAgbW9sZWN1bGVNYXBbIGNvbXBsZXRlTW9sZWN1bGUubW9sZWN1bGVJZCBdID0gQkFNSWNvbkZhY3RvcnkuY3JlYXRlSWNvbkltYWdlKFxyXG4gICAgICAgIGNvbXBsZXRlTW9sZWN1bGUsXHJcbiAgICAgICAgZGltZW5zaW9uTGVuZ3RoLFxyXG4gICAgICAgIGRpbWVuc2lvbkxlbmd0aCxcclxuICAgICAgICAxLFxyXG4gICAgICAgIHRydWVcclxuICAgICAgKTtcclxuICAgIH1cclxuICAgIC8vIHdyYXAgdGhlIHJldHVybmVkIGltYWdlIGluIGFuIGV4dHJhIG5vZGUgc28gd2UgY2FuIHRyYW5zZm9ybSB0aGVtIGluZGVwZW5kZW50bHksIGFuZCB0aGF0IHRha2VzIHVwIHRoZSBwcm9wZXIgYW1vdW50IG9mIHNwYWNlXHJcbiAgICByZXR1cm4gbmV3IFJlY3RhbmdsZSggMCwgMCwgZGltZW5zaW9uTGVuZ3RoLCBkaW1lbnNpb25MZW5ndGgsIHsgY2hpbGRyZW46IFsgbW9sZWN1bGVNYXBbIGNvbXBsZXRlTW9sZWN1bGUubW9sZWN1bGVJZCBdIF0gfSApO1xyXG4gIH1cclxufVxyXG5cclxuYnVpbGRBTW9sZWN1bGUucmVnaXN0ZXIoICdDb2xsZWN0aW9uQm94Tm9kZScsIENvbGxlY3Rpb25Cb3hOb2RlICk7XHJcbmV4cG9ydCBkZWZhdWx0IENvbGxlY3Rpb25Cb3hOb2RlO1xyXG4iXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFNBQVMsTUFBTSxrQ0FBa0M7QUFDeEQsT0FBT0MsU0FBUyxNQUFNLDBDQUEwQztBQUNoRSxTQUFTQyxLQUFLLEVBQUVDLElBQUksRUFBRUMsU0FBUyxFQUFFQyxJQUFJLFFBQVEsbUNBQW1DO0FBQ2hGLE9BQU9DLGNBQWMsTUFBTSx5QkFBeUI7QUFDcEQsT0FBT0MsWUFBWSxNQUFNLG9CQUFvQjtBQUM3QyxPQUFPQyxZQUFZLE1BQU0sMEJBQTBCO0FBQ25ELE9BQU9DLGNBQWMsTUFBTSxxQkFBcUI7QUFDaEQsT0FBT0Msd0JBQXdCLE1BQU0sc0NBQXNDOztBQUUzRTtBQUNBLE1BQU1DLGlCQUFpQixHQUFHLENBQUM7O0FBRTNCO0FBQ0EsTUFBTUMsc0JBQXNCLEdBQUcsQ0FBQyxDQUFDO0FBRWpDLE1BQU1DLGlCQUFpQixTQUFTUixJQUFJLENBQUM7RUFDbkM7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VTLFdBQVdBLENBQUVDLEdBQUcsRUFBRUMsYUFBYSxFQUFFQyxrQkFBa0IsRUFBRUMsT0FBTyxFQUFHO0lBQzdELEtBQUssQ0FBRTtNQUFFQyxPQUFPLEVBQUU7SUFBRSxDQUFFLENBQUM7O0lBRXZCO0lBQ0EsSUFBSSxDQUFDSixHQUFHLEdBQUdBLEdBQUc7O0lBRWQ7SUFDQSxJQUFJLENBQUNDLGFBQWEsR0FBR0EsYUFBYTs7SUFFbEM7SUFDQSxJQUFJLENBQUNJLE9BQU8sR0FBRyxJQUFJakIsSUFBSSxDQUFDLENBQUM7O0lBRXpCO0lBQ0EsSUFBSSxDQUFDa0IsYUFBYSxHQUFHLEVBQUU7O0lBRXZCO0lBQ0EsSUFBSSxDQUFDQyxZQUFZLEdBQUcsSUFBSTs7SUFFeEI7SUFDQSxJQUFJLENBQUNDLGVBQWUsR0FBRyxDQUFDLENBQUM7O0lBRXpCO0lB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