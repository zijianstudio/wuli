// Copyright 2014-2023, University of Colorado Boulder

/**
 * Node that represents a "beaker container" in the view.  A beaker container is a beaker that contains fluid, and in
 * which other objects can be placed, which generally displaces the fluid.
 *
 * See the header comments in the parent class for some important information about how this class is used on the
 * canvas.
 *
 * @author John Blanco
 * @author Jesse Greenberg
 * @author Andrew Adare
 */

import Multilink from '../../../../axon/js/Multilink.js';
import Matrix3 from '../../../../dot/js/Matrix3.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { Shape } from '../../../../kite/js/imports.js';
import { Path } from '../../../../scenery/js/imports.js';
import PhetioGroup from '../../../../tandem/js/PhetioGroup.js';
import EFACConstants from '../../common/EFACConstants.js';
import EFACQueryParameters from '../../common/EFACQueryParameters.js';
import BeakerView from '../../common/view/BeakerView.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';
import ThermalElementDragHandler from './ThermalElementDragHandler.js';

// constants
const BLOCK_PERSPECTIVE_ANGLE = EFACConstants.BLOCK_PERSPECTIVE_ANGLE;
const BLOCK_PERSPECTIVE_EDGE_PROPORTION = EFACConstants.BLOCK_PERSPECTIVE_EDGE_PROPORTION;
class BeakerContainerView extends BeakerView {
  /**
   * @param {Beaker} beaker
   * @param {EFACIntroModel} model
   * @param {ModelViewTransform2} modelViewTransform
   * @param {function} constrainPosition
   * @param {Object} [options]
   */
  constructor(beaker, model, modelViewTransform, constrainPosition, options) {
    super(beaker, model.energyChunksVisibleProperty, modelViewTransform, options);

    // @private
    this.beaker = beaker;

    // variables for creating reusable shapes for doing the updates to the clipping areas
    const beakerRectangleWidthInView = -modelViewTransform.modelToViewDeltaY(beaker.width);
    const beakerRectangleHeightInView = -modelViewTransform.modelToViewDeltaY(beaker.height);

    // @private {Shape} - A shape that corresponds to the untransformed beaker content shape, used for the energy chunk
    // clip area.  It is extended a ways up for chunks that come from the top of the air and extends down for those that
    // go between the beaker and the heater/cooler.
    this.untransformedBeakerClipShape = Shape.rect(-beakerRectangleWidthInView / 2, -beakerRectangleHeightInView * 9, beakerRectangleWidthInView, beakerRectangleHeightInView * 9.5);

    // @private - These values are used for calculating the clipping caused by the presence of blocks in the beaker.
    // They are computed once here so that they don't have to be recomputed every time the clipping shape is updated.
    // This assumes the blocks are all the same size and do not change size. Only needed if any blocks exist.
    if (model.blockGroup.count) {
      this.blockWidthInView = modelViewTransform.modelToViewDeltaX(model.blockGroup.getElement(0).width);
      this.blockHeightInView = -modelViewTransform.modelToViewDeltaY(model.blockGroup.getElement(0).height);
      const perspectiveEdgeSize = this.blockWidthInView * BLOCK_PERSPECTIVE_EDGE_PROPORTION;
      this.forwardProjectionVector = new Vector2(-perspectiveEdgeSize / 2, 0).rotated(-BLOCK_PERSPECTIVE_ANGLE);
    }
    if (EFACQueryParameters.showHelperShapes) {
      this.clipAreaHelperNode = new Path(this.untransformedBeakerClipShape, {
        fill: 'rgba(255, 0, 0, 0.2)'
      });
      this.energyChunkRootNode.addChild(this.clipAreaHelperNode);
    }

    // Update the clipping area based on the motion of this beaker, the blocks, and whether the energy chunks are
    // visible.  The clipping area hides energy chunks that overlap with blocks, making it look much less visually
    // distracting, as though the energy chunks in the beaker are behind the blocks.
    const propertiesThatInfluenceClipArea = [];
    model.blockGroup.forEach(block => {
      propertiesThatInfluenceClipArea.push(block.positionProperty);
    });
    propertiesThatInfluenceClipArea.push(beaker.positionProperty);
    propertiesThatInfluenceClipArea.push(model.energyChunksVisibleProperty);
    Multilink.multilink(propertiesThatInfluenceClipArea, () => {
      this.updateEnergyChunkClipArea(beaker, model.blockGroup, model.energyChunksVisibleProperty.value, modelViewTransform);
    });

    // add an input listener to make this draggable
    this.grabNode.addInputListener(new ThermalElementDragHandler(beaker, this.grabNode, modelViewTransform, constrainPosition, model.isPlayingProperty, options.tandem.createTandem('dragListener')));
  }

  /**
   * Update the clipping area that is used to hide energy chunks that are in the beaker but occluded by blocks that
   * are ALSO in the beaker.
   * @param {Beaker} beaker
   * @param {Block[]} blocks
   * @param {boolean} energyChunksVisible
   * @param {ModelViewTransform2} modelViewTransform
   * @private
   */
  updateEnergyChunkClipArea(beaker, blocks, energyChunksVisible, modelViewTransform) {
    if (energyChunksVisible) {
      // The clip area is defined by an outer rectangle that is basically the entire beaker area and then some inner
      // rectangles for the blocks if they overlap with the beaker.  The inner pieces have to be drawn with the opposite
      // winding order from the outer ones in order to create the "hole" effect.  The outer shape extends above and
      // below the basic beaker model rectangle in order to prevent clipping of energy chunks that are positioned at
      // the upper and lower rim of the beaker and energy chunks moving between the beaker and the heater/cooler.
      const clipArea = this.untransformedBeakerClipShape.transformed(Matrix3.translationFromVector(modelViewTransform.modelToViewPosition(beaker.positionProperty.get())));

      // add the "holes" in the clip mask that correspond to the blocks
      this.addProjectedBlocksToClipArea(blocks, clipArea, modelViewTransform);

      // set the updated clip area
      this.energyChunkRootNode.clipArea = clipArea;
      if (this.clipAreaHelperNode) {
        this.clipAreaHelperNode.setShape(clipArea);
      }
    } else {
      // If the energy chunks aren't visible, don't have a clip area at all.  This was found to be necessary because
      // on Firefox, not setting it to null would cause the energy chunks to still be visible when they shouldn't be,
      // see https://github.com/phetsims/energy-forms-and-changes/issues/173.
      this.energyChunkRootNode.clipArea = null;
    }
  }

  /**
   * Add shapes corresponded to the provided blocks to the provide clip area shape, accounting for any 3D projection
   * used for the blocks. This essentially creates "holes" in the clip mask preventing anything in the parent node
   * (generally energy chunks) from being rendered in the same place as the blocks. This method can handle any number
   * of blocks stacked in the beaker, but only clips for the bottom two, since the beaker can only fit two blocks,
   * plus a tiny bit of a third.
   * @param {PhetioGroup.<Block>} blockGroup
   * @param {Shape} clipAreaShape
   * @param {ModelViewTransform2} modelViewTransform
   * @private
   */
  addProjectedBlocksToClipArea(blockGroup, clipAreaShape, modelViewTransform) {
    assert && assert(blockGroup instanceof PhetioGroup, 'invalid blockGroup');

    // hoisted block variable
    let block;

    // if neither of the blocks is in the beaker then there are no "holes" to add, use C-style loop for performance
    let blocksInBeaker = [];
    for (let i = 0; i < blockGroup.count; i++) {
      block = blockGroup.getElement(i);
      if (this.beaker.getBounds().containsPoint(block.positionProperty.value) || this.beaker.topSurface.elementOnSurfaceProperty.value === block) {
        blocksInBeaker.push(block);
      }
    }
    if (blocksInBeaker.length === 0) {
      // nothing to do, bail
      return;
    }

    // use the bounds of the shape for faster tests, assumes that it is rectangular
    const chipAreaShapeBounds = clipAreaShape.bounds;

    // determine whether the blocks are stacked upon each other
    let blocksAreStacked = false;
    if (blocksInBeaker.length > 1) {
      blocksInBeaker = _.sortBy(blocksInBeaker, block => block.positionProperty.value.y);
      blocksAreStacked = blocksInBeaker[1].isStackedUpon(blocksInBeaker[0]);
    }
    if (blocksAreStacked) {
      // When the blocks are stacked, draw a single shape that encompasses both.  This is necessary because if the
      // shapes are drawn separately and they overlap, a space is created where the energy chunks are not occluded.
      const bottomBlockPositionInView = modelViewTransform.modelToViewPosition(blocksInBeaker[0].positionProperty.value);
      if (chipAreaShapeBounds.containsPoint(bottomBlockPositionInView)) {
        clipAreaShape.moveTo(bottomBlockPositionInView.x - this.blockWidthInView / 2 + this.forwardProjectionVector.x, bottomBlockPositionInView.y + this.forwardProjectionVector.y);
        clipAreaShape.lineToRelative(this.blockWidthInView, 0);
        clipAreaShape.lineToRelative(-this.forwardProjectionVector.x * 2, -this.forwardProjectionVector.y * 2);
        clipAreaShape.lineToRelative(0, -this.blockHeightInView * 2);
        clipAreaShape.lineToRelative(-this.blockWidthInView, 0);
        clipAreaShape.lineToRelative(this.forwardProjectionVector.x * 2, this.forwardProjectionVector.y * 2);
        clipAreaShape.lineToRelative(0, this.blockHeightInView * 2);
      }
    } else {
      // C-style loop for best performance
      for (let i = 0; i < blocksInBeaker.length; i++) {
        block = blocksInBeaker[i];
        const blockPositionInView = modelViewTransform.modelToViewPosition(block.positionProperty.value);

        // The following code makes some assumptions that are known to be true for the EFAC simulation but which
        // wouldn't necessarily true for a generalized version of this.  Those assumptions are that the provided shape
        // is rectangular and that the position of the block is the bottom center.
        if (chipAreaShapeBounds.containsPoint(blockPositionInView)) {
          clipAreaShape.moveTo(blockPositionInView.x - this.blockWidthInView / 2 + this.forwardProjectionVector.x, blockPositionInView.y + this.forwardProjectionVector.y);
          clipAreaShape.lineToRelative(this.blockWidthInView, 0);
          clipAreaShape.lineToRelative(-this.forwardProjectionVector.x * 2, -this.forwardProjectionVector.y * 2);
          clipAreaShape.lineToRelative(0, -this.blockHeightInView);
          clipAreaShape.lineToRelative(-this.blockWidthInView, 0);
          clipAreaShape.lineToRelative(this.forwardProjectionVector.x * 2, this.forwardProjectionVector.y * 2);
          clipAreaShape.lineToRelative(0, this.blockHeightInView);
        }
      }
    }
  }
}
energyFormsAndChanges.register('BeakerContainerView', BeakerContainerView);
export default BeakerContainerView;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNdWx0aWxpbmsiLCJNYXRyaXgzIiwiVmVjdG9yMiIsIlNoYXBlIiwiUGF0aCIsIlBoZXRpb0dyb3VwIiwiRUZBQ0NvbnN0YW50cyIsIkVGQUNRdWVyeVBhcmFtZXRlcnMiLCJCZWFrZXJWaWV3IiwiZW5lcmd5Rm9ybXNBbmRDaGFuZ2VzIiwiVGhlcm1hbEVsZW1lbnREcmFnSGFuZGxlciIsIkJMT0NLX1BFUlNQRUNUSVZFX0FOR0xFIiwiQkxPQ0tfUEVSU1BFQ1RJVkVfRURHRV9QUk9QT1JUSU9OIiwiQmVha2VyQ29udGFpbmVyVmlldyIsImNvbnN0cnVjdG9yIiwiYmVha2VyIiwibW9kZWwiLCJtb2RlbFZpZXdUcmFuc2Zvcm0iLCJjb25zdHJhaW5Qb3NpdGlvbiIsIm9wdGlvbnMiLCJlbmVyZ3lDaHVua3NWaXNpYmxlUHJvcGVydHkiLCJiZWFrZXJSZWN0YW5nbGVXaWR0aEluVmlldyIsIm1vZGVsVG9WaWV3RGVsdGFZIiwid2lkdGgiLCJiZWFrZXJSZWN0YW5nbGVIZWlnaHRJblZpZXciLCJoZWlnaHQiLCJ1bnRyYW5zZm9ybWVkQmVha2VyQ2xpcFNoYXBlIiwicmVjdCIsImJsb2NrR3JvdXAiLCJjb3VudCIsImJsb2NrV2lkdGhJblZpZXciLCJtb2RlbFRvVmlld0RlbHRhWCIsImdldEVsZW1lbnQiLCJibG9ja0hlaWdodEluVmlldyIsInBlcnNwZWN0aXZlRWRnZVNpemUiLCJmb3J3YXJkUHJvamVjdGlvblZlY3RvciIsInJvdGF0ZWQiLCJzaG93SGVscGVyU2hhcGVzIiwiY2xpcEFyZWFIZWxwZXJOb2RlIiwiZmlsbCIsImVuZXJneUNodW5rUm9vdE5vZGUiLCJhZGRDaGlsZCIsInByb3BlcnRpZXNUaGF0SW5mbHVlbmNlQ2xpcEFyZWEiLCJmb3JFYWNoIiwiYmxvY2siLCJwdXNoIiwicG9zaXRpb25Qcm9wZXJ0eSIsIm11bHRpbGluayIsInVwZGF0ZUVuZXJneUNodW5rQ2xpcEFyZWEiLCJ2YWx1ZSIsImdyYWJOb2RlIiwiYWRkSW5wdXRMaXN0ZW5lciIsImlzUGxheWluZ1Byb3BlcnR5IiwidGFuZGVtIiwiY3JlYXRlVGFuZGVtIiwiYmxvY2tzIiwiZW5lcmd5Q2h1bmtzVmlzaWJsZSIsImNsaXBBcmVhIiwidHJhbnNmb3JtZWQiLCJ0cmFuc2xhdGlvbkZyb21WZWN0b3IiLCJtb2RlbFRvVmlld1Bvc2l0aW9uIiwiZ2V0IiwiYWRkUHJvamVjdGVkQmxvY2tzVG9DbGlwQXJlYSIsInNldFNoYXBlIiwiY2xpcEFyZWFTaGFwZSIsImFzc2VydCIsImJsb2Nrc0luQmVha2VyIiwiaSIsImdldEJvdW5kcyIsImNvbnRhaW5zUG9pbnQiLCJ0b3BTdXJmYWNlIiwiZWxlbWVudE9uU3VyZmFjZVByb3BlcnR5IiwibGVuZ3RoIiwiY2hpcEFyZWFTaGFwZUJvdW5kcyIsImJvdW5kcyIsImJsb2Nrc0FyZVN0YWNrZWQiLCJfIiwic29ydEJ5IiwieSIsImlzU3RhY2tlZFVwb24iLCJib3R0b21CbG9ja1Bvc2l0aW9uSW5WaWV3IiwibW92ZVRvIiwieCIsImxpbmVUb1JlbGF0aXZlIiwiYmxvY2tQb3NpdGlvbkluVmlldyIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiQmVha2VyQ29udGFpbmVyVmlldy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNC0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBOb2RlIHRoYXQgcmVwcmVzZW50cyBhIFwiYmVha2VyIGNvbnRhaW5lclwiIGluIHRoZSB2aWV3LiAgQSBiZWFrZXIgY29udGFpbmVyIGlzIGEgYmVha2VyIHRoYXQgY29udGFpbnMgZmx1aWQsIGFuZCBpblxyXG4gKiB3aGljaCBvdGhlciBvYmplY3RzIGNhbiBiZSBwbGFjZWQsIHdoaWNoIGdlbmVyYWxseSBkaXNwbGFjZXMgdGhlIGZsdWlkLlxyXG4gKlxyXG4gKiBTZWUgdGhlIGhlYWRlciBjb21tZW50cyBpbiB0aGUgcGFyZW50IGNsYXNzIGZvciBzb21lIGltcG9ydGFudCBpbmZvcm1hdGlvbiBhYm91dCBob3cgdGhpcyBjbGFzcyBpcyB1c2VkIG9uIHRoZVxyXG4gKiBjYW52YXMuXHJcbiAqXHJcbiAqIEBhdXRob3IgSm9obiBCbGFuY29cclxuICogQGF1dGhvciBKZXNzZSBHcmVlbmJlcmdcclxuICogQGF1dGhvciBBbmRyZXcgQWRhcmVcclxuICovXHJcblxyXG5pbXBvcnQgTXVsdGlsaW5rIGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvTXVsdGlsaW5rLmpzJztcclxuaW1wb3J0IE1hdHJpeDMgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL01hdHJpeDMuanMnO1xyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCB7IFNoYXBlIH0gZnJvbSAnLi4vLi4vLi4vLi4va2l0ZS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IHsgUGF0aCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBQaGV0aW9Hcm91cCBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvUGhldGlvR3JvdXAuanMnO1xyXG5pbXBvcnQgRUZBQ0NvbnN0YW50cyBmcm9tICcuLi8uLi9jb21tb24vRUZBQ0NvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBFRkFDUXVlcnlQYXJhbWV0ZXJzIGZyb20gJy4uLy4uL2NvbW1vbi9FRkFDUXVlcnlQYXJhbWV0ZXJzLmpzJztcclxuaW1wb3J0IEJlYWtlclZpZXcgZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvQmVha2VyVmlldy5qcyc7XHJcbmltcG9ydCBlbmVyZ3lGb3Jtc0FuZENoYW5nZXMgZnJvbSAnLi4vLi4vZW5lcmd5Rm9ybXNBbmRDaGFuZ2VzLmpzJztcclxuaW1wb3J0IFRoZXJtYWxFbGVtZW50RHJhZ0hhbmRsZXIgZnJvbSAnLi9UaGVybWFsRWxlbWVudERyYWdIYW5kbGVyLmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBCTE9DS19QRVJTUEVDVElWRV9BTkdMRSA9IEVGQUNDb25zdGFudHMuQkxPQ0tfUEVSU1BFQ1RJVkVfQU5HTEU7XHJcbmNvbnN0IEJMT0NLX1BFUlNQRUNUSVZFX0VER0VfUFJPUE9SVElPTiA9IEVGQUNDb25zdGFudHMuQkxPQ0tfUEVSU1BFQ1RJVkVfRURHRV9QUk9QT1JUSU9OO1xyXG5cclxuY2xhc3MgQmVha2VyQ29udGFpbmVyVmlldyBleHRlbmRzIEJlYWtlclZpZXcge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge0JlYWtlcn0gYmVha2VyXHJcbiAgICogQHBhcmFtIHtFRkFDSW50cm9Nb2RlbH0gbW9kZWxcclxuICAgKiBAcGFyYW0ge01vZGVsVmlld1RyYW5zZm9ybTJ9IG1vZGVsVmlld1RyYW5zZm9ybVxyXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb259IGNvbnN0cmFpblBvc2l0aW9uXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBiZWFrZXIsIG1vZGVsLCBtb2RlbFZpZXdUcmFuc2Zvcm0sIGNvbnN0cmFpblBvc2l0aW9uLCBvcHRpb25zICkge1xyXG4gICAgc3VwZXIoIGJlYWtlciwgbW9kZWwuZW5lcmd5Q2h1bmtzVmlzaWJsZVByb3BlcnR5LCBtb2RlbFZpZXdUcmFuc2Zvcm0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZVxyXG4gICAgdGhpcy5iZWFrZXIgPSBiZWFrZXI7XHJcblxyXG4gICAgLy8gdmFyaWFibGVzIGZvciBjcmVhdGluZyByZXVzYWJsZSBzaGFwZXMgZm9yIGRvaW5nIHRoZSB1cGRhdGVzIHRvIHRoZSBjbGlwcGluZyBhcmVhc1xyXG4gICAgY29uc3QgYmVha2VyUmVjdGFuZ2xlV2lkdGhJblZpZXcgPSAtbW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3RGVsdGFZKCBiZWFrZXIud2lkdGggKTtcclxuICAgIGNvbnN0IGJlYWtlclJlY3RhbmdsZUhlaWdodEluVmlldyA9IC1tb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdEZWx0YVkoIGJlYWtlci5oZWlnaHQgKTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7U2hhcGV9IC0gQSBzaGFwZSB0aGF0IGNvcnJlc3BvbmRzIHRvIHRoZSB1bnRyYW5zZm9ybWVkIGJlYWtlciBjb250ZW50IHNoYXBlLCB1c2VkIGZvciB0aGUgZW5lcmd5IGNodW5rXHJcbiAgICAvLyBjbGlwIGFyZWEuICBJdCBpcyBleHRlbmRlZCBhIHdheXMgdXAgZm9yIGNodW5rcyB0aGF0IGNvbWUgZnJvbSB0aGUgdG9wIG9mIHRoZSBhaXIgYW5kIGV4dGVuZHMgZG93biBmb3IgdGhvc2UgdGhhdFxyXG4gICAgLy8gZ28gYmV0d2VlbiB0aGUgYmVha2VyIGFuZCB0aGUgaGVhdGVyL2Nvb2xlci5cclxuICAgIHRoaXMudW50cmFuc2Zvcm1lZEJlYWtlckNsaXBTaGFwZSA9IFNoYXBlLnJlY3QoXHJcbiAgICAgIC1iZWFrZXJSZWN0YW5nbGVXaWR0aEluVmlldyAvIDIsXHJcbiAgICAgIC1iZWFrZXJSZWN0YW5nbGVIZWlnaHRJblZpZXcgKiA5LFxyXG4gICAgICBiZWFrZXJSZWN0YW5nbGVXaWR0aEluVmlldyxcclxuICAgICAgYmVha2VyUmVjdGFuZ2xlSGVpZ2h0SW5WaWV3ICogOS41XHJcbiAgICApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIC0gVGhlc2UgdmFsdWVzIGFyZSB1c2VkIGZvciBjYWxjdWxhdGluZyB0aGUgY2xpcHBpbmcgY2F1c2VkIGJ5IHRoZSBwcmVzZW5jZSBvZiBibG9ja3MgaW4gdGhlIGJlYWtlci5cclxuICAgIC8vIFRoZXkgYXJlIGNvbXB1dGVkIG9uY2UgaGVyZSBzbyB0aGF0IHRoZXkgZG9uJ3QgaGF2ZSB0byBiZSByZWNvbXB1dGVkIGV2ZXJ5IHRpbWUgdGhlIGNsaXBwaW5nIHNoYXBlIGlzIHVwZGF0ZWQuXHJcbiAgICAvLyBUaGlzIGFzc3VtZXMgdGhlIGJsb2NrcyBhcmUgYWxsIHRoZSBzYW1lIHNpemUgYW5kIGRvIG5vdCBjaGFuZ2Ugc2l6ZS4gT25seSBuZWVkZWQgaWYgYW55IGJsb2NrcyBleGlzdC5cclxuICAgIGlmICggbW9kZWwuYmxvY2tHcm91cC5jb3VudCApIHtcclxuICAgICAgdGhpcy5ibG9ja1dpZHRoSW5WaWV3ID0gbW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3RGVsdGFYKCBtb2RlbC5ibG9ja0dyb3VwLmdldEVsZW1lbnQoIDAgKS53aWR0aCApO1xyXG4gICAgICB0aGlzLmJsb2NrSGVpZ2h0SW5WaWV3ID0gLW1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld0RlbHRhWSggbW9kZWwuYmxvY2tHcm91cC5nZXRFbGVtZW50KCAwICkuaGVpZ2h0ICk7XHJcbiAgICAgIGNvbnN0IHBlcnNwZWN0aXZlRWRnZVNpemUgPSB0aGlzLmJsb2NrV2lkdGhJblZpZXcgKiBCTE9DS19QRVJTUEVDVElWRV9FREdFX1BST1BPUlRJT047XHJcbiAgICAgIHRoaXMuZm9yd2FyZFByb2plY3Rpb25WZWN0b3IgPSBuZXcgVmVjdG9yMiggLXBlcnNwZWN0aXZlRWRnZVNpemUgLyAyLCAwICkucm90YXRlZCggLUJMT0NLX1BFUlNQRUNUSVZFX0FOR0xFICk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCBFRkFDUXVlcnlQYXJhbWV0ZXJzLnNob3dIZWxwZXJTaGFwZXMgKSB7XHJcbiAgICAgIHRoaXMuY2xpcEFyZWFIZWxwZXJOb2RlID0gbmV3IFBhdGgoIHRoaXMudW50cmFuc2Zvcm1lZEJlYWtlckNsaXBTaGFwZSwge1xyXG4gICAgICAgIGZpbGw6ICdyZ2JhKDI1NSwgMCwgMCwgMC4yKSdcclxuICAgICAgfSApO1xyXG4gICAgICB0aGlzLmVuZXJneUNodW5rUm9vdE5vZGUuYWRkQ2hpbGQoIHRoaXMuY2xpcEFyZWFIZWxwZXJOb2RlICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gVXBkYXRlIHRoZSBjbGlwcGluZyBhcmVhIGJhc2VkIG9uIHRoZSBtb3Rpb24gb2YgdGhpcyBiZWFrZXIsIHRoZSBibG9ja3MsIGFuZCB3aGV0aGVyIHRoZSBlbmVyZ3kgY2h1bmtzIGFyZVxyXG4gICAgLy8gdmlzaWJsZS4gIFRoZSBjbGlwcGluZyBhcmVhIGhpZGVzIGVuZXJneSBjaHVua3MgdGhhdCBvdmVybGFwIHdpdGggYmxvY2tzLCBtYWtpbmcgaXQgbG9vayBtdWNoIGxlc3MgdmlzdWFsbHlcclxuICAgIC8vIGRpc3RyYWN0aW5nLCBhcyB0aG91Z2ggdGhlIGVuZXJneSBjaHVua3MgaW4gdGhlIGJlYWtlciBhcmUgYmVoaW5kIHRoZSBibG9ja3MuXHJcbiAgICBjb25zdCBwcm9wZXJ0aWVzVGhhdEluZmx1ZW5jZUNsaXBBcmVhID0gW107XHJcbiAgICBtb2RlbC5ibG9ja0dyb3VwLmZvckVhY2goIGJsb2NrID0+IHtcclxuICAgICAgcHJvcGVydGllc1RoYXRJbmZsdWVuY2VDbGlwQXJlYS5wdXNoKCBibG9jay5wb3NpdGlvblByb3BlcnR5ICk7XHJcbiAgICB9ICk7XHJcbiAgICBwcm9wZXJ0aWVzVGhhdEluZmx1ZW5jZUNsaXBBcmVhLnB1c2goIGJlYWtlci5wb3NpdGlvblByb3BlcnR5ICk7XHJcbiAgICBwcm9wZXJ0aWVzVGhhdEluZmx1ZW5jZUNsaXBBcmVhLnB1c2goIG1vZGVsLmVuZXJneUNodW5rc1Zpc2libGVQcm9wZXJ0eSApO1xyXG4gICAgTXVsdGlsaW5rLm11bHRpbGluayggcHJvcGVydGllc1RoYXRJbmZsdWVuY2VDbGlwQXJlYSwgKCkgPT4ge1xyXG4gICAgICB0aGlzLnVwZGF0ZUVuZXJneUNodW5rQ2xpcEFyZWEoIGJlYWtlciwgbW9kZWwuYmxvY2tHcm91cCwgbW9kZWwuZW5lcmd5Q2h1bmtzVmlzaWJsZVByb3BlcnR5LnZhbHVlLCBtb2RlbFZpZXdUcmFuc2Zvcm0gKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBhZGQgYW4gaW5wdXQgbGlzdGVuZXIgdG8gbWFrZSB0aGlzIGRyYWdnYWJsZVxyXG4gICAgdGhpcy5ncmFiTm9kZS5hZGRJbnB1dExpc3RlbmVyKCBuZXcgVGhlcm1hbEVsZW1lbnREcmFnSGFuZGxlcihcclxuICAgICAgYmVha2VyLFxyXG4gICAgICB0aGlzLmdyYWJOb2RlLFxyXG4gICAgICBtb2RlbFZpZXdUcmFuc2Zvcm0sXHJcbiAgICAgIGNvbnN0cmFpblBvc2l0aW9uLFxyXG4gICAgICBtb2RlbC5pc1BsYXlpbmdQcm9wZXJ0eSxcclxuICAgICAgb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnZHJhZ0xpc3RlbmVyJyApXHJcbiAgICApICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBVcGRhdGUgdGhlIGNsaXBwaW5nIGFyZWEgdGhhdCBpcyB1c2VkIHRvIGhpZGUgZW5lcmd5IGNodW5rcyB0aGF0IGFyZSBpbiB0aGUgYmVha2VyIGJ1dCBvY2NsdWRlZCBieSBibG9ja3MgdGhhdFxyXG4gICAqIGFyZSBBTFNPIGluIHRoZSBiZWFrZXIuXHJcbiAgICogQHBhcmFtIHtCZWFrZXJ9IGJlYWtlclxyXG4gICAqIEBwYXJhbSB7QmxvY2tbXX0gYmxvY2tzXHJcbiAgICogQHBhcmFtIHtib29sZWFufSBlbmVyZ3lDaHVua3NWaXNpYmxlXHJcbiAgICogQHBhcmFtIHtNb2RlbFZpZXdUcmFuc2Zvcm0yfSBtb2RlbFZpZXdUcmFuc2Zvcm1cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIHVwZGF0ZUVuZXJneUNodW5rQ2xpcEFyZWEoIGJlYWtlciwgYmxvY2tzLCBlbmVyZ3lDaHVua3NWaXNpYmxlLCBtb2RlbFZpZXdUcmFuc2Zvcm0gKSB7XHJcblxyXG4gICAgaWYgKCBlbmVyZ3lDaHVua3NWaXNpYmxlICkge1xyXG5cclxuICAgICAgLy8gVGhlIGNsaXAgYXJlYSBpcyBkZWZpbmVkIGJ5IGFuIG91dGVyIHJlY3RhbmdsZSB0aGF0IGlzIGJhc2ljYWxseSB0aGUgZW50aXJlIGJlYWtlciBhcmVhIGFuZCB0aGVuIHNvbWUgaW5uZXJcclxuICAgICAgLy8gcmVjdGFuZ2xlcyBmb3IgdGhlIGJsb2NrcyBpZiB0aGV5IG92ZXJsYXAgd2l0aCB0aGUgYmVha2VyLiAgVGhlIGlubmVyIHBpZWNlcyBoYXZlIHRvIGJlIGRyYXduIHdpdGggdGhlIG9wcG9zaXRlXHJcbiAgICAgIC8vIHdpbmRpbmcgb3JkZXIgZnJvbSB0aGUgb3V0ZXIgb25lcyBpbiBvcmRlciB0byBjcmVhdGUgdGhlIFwiaG9sZVwiIGVmZmVjdC4gIFRoZSBvdXRlciBzaGFwZSBleHRlbmRzIGFib3ZlIGFuZFxyXG4gICAgICAvLyBiZWxvdyB0aGUgYmFzaWMgYmVha2VyIG1vZGVsIHJlY3RhbmdsZSBpbiBvcmRlciB0byBwcmV2ZW50IGNsaXBwaW5nIG9mIGVuZXJneSBjaHVua3MgdGhhdCBhcmUgcG9zaXRpb25lZCBhdFxyXG4gICAgICAvLyB0aGUgdXBwZXIgYW5kIGxvd2VyIHJpbSBvZiB0aGUgYmVha2VyIGFuZCBlbmVyZ3kgY2h1bmtzIG1vdmluZyBiZXR3ZWVuIHRoZSBiZWFrZXIgYW5kIHRoZSBoZWF0ZXIvY29vbGVyLlxyXG4gICAgICBjb25zdCBjbGlwQXJlYSA9IHRoaXMudW50cmFuc2Zvcm1lZEJlYWtlckNsaXBTaGFwZS50cmFuc2Zvcm1lZChcclxuICAgICAgICBNYXRyaXgzLnRyYW5zbGF0aW9uRnJvbVZlY3RvciggbW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3UG9zaXRpb24oIGJlYWtlci5wb3NpdGlvblByb3BlcnR5LmdldCgpICkgKVxyXG4gICAgICApO1xyXG5cclxuICAgICAgLy8gYWRkIHRoZSBcImhvbGVzXCIgaW4gdGhlIGNsaXAgbWFzayB0aGF0IGNvcnJlc3BvbmQgdG8gdGhlIGJsb2Nrc1xyXG4gICAgICB0aGlzLmFkZFByb2plY3RlZEJsb2Nrc1RvQ2xpcEFyZWEoIGJsb2NrcywgY2xpcEFyZWEsIG1vZGVsVmlld1RyYW5zZm9ybSApO1xyXG5cclxuICAgICAgLy8gc2V0IHRoZSB1cGRhdGVkIGNsaXAgYXJlYVxyXG4gICAgICB0aGlzLmVuZXJneUNodW5rUm9vdE5vZGUuY2xpcEFyZWEgPSBjbGlwQXJlYTtcclxuXHJcbiAgICAgIGlmICggdGhpcy5jbGlwQXJlYUhlbHBlck5vZGUgKSB7XHJcbiAgICAgICAgdGhpcy5jbGlwQXJlYUhlbHBlck5vZGUuc2V0U2hhcGUoIGNsaXBBcmVhICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG5cclxuICAgICAgLy8gSWYgdGhlIGVuZXJneSBjaHVua3MgYXJlbid0IHZpc2libGUsIGRvbid0IGhhdmUgYSBjbGlwIGFyZWEgYXQgYWxsLiAgVGhpcyB3YXMgZm91bmQgdG8gYmUgbmVjZXNzYXJ5IGJlY2F1c2VcclxuICAgICAgLy8gb24gRmlyZWZveCwgbm90IHNldHRpbmcgaXQgdG8gbnVsbCB3b3VsZCBjYXVzZSB0aGUgZW5lcmd5IGNodW5rcyB0byBzdGlsbCBiZSB2aXNpYmxlIHdoZW4gdGhleSBzaG91bGRuJ3QgYmUsXHJcbiAgICAgIC8vIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvZW5lcmd5LWZvcm1zLWFuZC1jaGFuZ2VzL2lzc3Vlcy8xNzMuXHJcbiAgICAgIHRoaXMuZW5lcmd5Q2h1bmtSb290Tm9kZS5jbGlwQXJlYSA9IG51bGw7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBZGQgc2hhcGVzIGNvcnJlc3BvbmRlZCB0byB0aGUgcHJvdmlkZWQgYmxvY2tzIHRvIHRoZSBwcm92aWRlIGNsaXAgYXJlYSBzaGFwZSwgYWNjb3VudGluZyBmb3IgYW55IDNEIHByb2plY3Rpb25cclxuICAgKiB1c2VkIGZvciB0aGUgYmxvY2tzLiBUaGlzIGVzc2VudGlhbGx5IGNyZWF0ZXMgXCJob2xlc1wiIGluIHRoZSBjbGlwIG1hc2sgcHJldmVudGluZyBhbnl0aGluZyBpbiB0aGUgcGFyZW50IG5vZGVcclxuICAgKiAoZ2VuZXJhbGx5IGVuZXJneSBjaHVua3MpIGZyb20gYmVpbmcgcmVuZGVyZWQgaW4gdGhlIHNhbWUgcGxhY2UgYXMgdGhlIGJsb2Nrcy4gVGhpcyBtZXRob2QgY2FuIGhhbmRsZSBhbnkgbnVtYmVyXHJcbiAgICogb2YgYmxvY2tzIHN0YWNrZWQgaW4gdGhlIGJlYWtlciwgYnV0IG9ubHkgY2xpcHMgZm9yIHRoZSBib3R0b20gdHdvLCBzaW5jZSB0aGUgYmVha2VyIGNhbiBvbmx5IGZpdCB0d28gYmxvY2tzLFxyXG4gICAqIHBsdXMgYSB0aW55IGJpdCBvZiBhIHRoaXJkLlxyXG4gICAqIEBwYXJhbSB7UGhldGlvR3JvdXAuPEJsb2NrPn0gYmxvY2tHcm91cFxyXG4gICAqIEBwYXJhbSB7U2hhcGV9IGNsaXBBcmVhU2hhcGVcclxuICAgKiBAcGFyYW0ge01vZGVsVmlld1RyYW5zZm9ybTJ9IG1vZGVsVmlld1RyYW5zZm9ybVxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgYWRkUHJvamVjdGVkQmxvY2tzVG9DbGlwQXJlYSggYmxvY2tHcm91cCwgY2xpcEFyZWFTaGFwZSwgbW9kZWxWaWV3VHJhbnNmb3JtICkge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggYmxvY2tHcm91cCBpbnN0YW5jZW9mIFBoZXRpb0dyb3VwLCAnaW52YWxpZCBibG9ja0dyb3VwJyApO1xyXG5cclxuICAgIC8vIGhvaXN0ZWQgYmxvY2sgdmFyaWFibGVcclxuICAgIGxldCBibG9jaztcclxuXHJcbiAgICAvLyBpZiBuZWl0aGVyIG9mIHRoZSBibG9ja3MgaXMgaW4gdGhlIGJlYWtlciB0aGVuIHRoZXJlIGFyZSBubyBcImhvbGVzXCIgdG8gYWRkLCB1c2UgQy1zdHlsZSBsb29wIGZvciBwZXJmb3JtYW5jZVxyXG4gICAgbGV0IGJsb2Nrc0luQmVha2VyID0gW107XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBibG9ja0dyb3VwLmNvdW50OyBpKysgKSB7XHJcbiAgICAgIGJsb2NrID0gYmxvY2tHcm91cC5nZXRFbGVtZW50KCBpICk7XHJcbiAgICAgIGlmICggdGhpcy5iZWFrZXIuZ2V0Qm91bmRzKCkuY29udGFpbnNQb2ludCggYmxvY2sucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZSApIHx8XHJcbiAgICAgICAgICAgdGhpcy5iZWFrZXIudG9wU3VyZmFjZS5lbGVtZW50T25TdXJmYWNlUHJvcGVydHkudmFsdWUgPT09IGJsb2NrICkge1xyXG4gICAgICAgIGJsb2Nrc0luQmVha2VyLnB1c2goIGJsb2NrICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGlmICggYmxvY2tzSW5CZWFrZXIubGVuZ3RoID09PSAwICkge1xyXG5cclxuICAgICAgLy8gbm90aGluZyB0byBkbywgYmFpbFxyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgLy8gdXNlIHRoZSBib3VuZHMgb2YgdGhlIHNoYXBlIGZvciBmYXN0ZXIgdGVzdHMsIGFzc3VtZXMgdGhhdCBpdCBpcyByZWN0YW5ndWxhclxyXG4gICAgY29uc3QgY2hpcEFyZWFTaGFwZUJvdW5kcyA9IGNsaXBBcmVhU2hhcGUuYm91bmRzO1xyXG5cclxuICAgIC8vIGRldGVybWluZSB3aGV0aGVyIHRoZSBibG9ja3MgYXJlIHN0YWNrZWQgdXBvbiBlYWNoIG90aGVyXHJcbiAgICBsZXQgYmxvY2tzQXJlU3RhY2tlZCA9IGZhbHNlO1xyXG4gICAgaWYgKCBibG9ja3NJbkJlYWtlci5sZW5ndGggPiAxICkge1xyXG4gICAgICBibG9ja3NJbkJlYWtlciA9IF8uc29ydEJ5KCBibG9ja3NJbkJlYWtlciwgYmxvY2sgPT4gYmxvY2sucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZS55ICk7XHJcbiAgICAgIGJsb2Nrc0FyZVN0YWNrZWQgPSBibG9ja3NJbkJlYWtlclsgMSBdLmlzU3RhY2tlZFVwb24oIGJsb2Nrc0luQmVha2VyWyAwIF0gKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIGJsb2Nrc0FyZVN0YWNrZWQgKSB7XHJcblxyXG4gICAgICAvLyBXaGVuIHRoZSBibG9ja3MgYXJlIHN0YWNrZWQsIGRyYXcgYSBzaW5nbGUgc2hhcGUgdGhhdCBlbmNvbXBhc3NlcyBib3RoLiAgVGhpcyBpcyBuZWNlc3NhcnkgYmVjYXVzZSBpZiB0aGVcclxuICAgICAgLy8gc2hhcGVzIGFyZSBkcmF3biBzZXBhcmF0ZWx5IGFuZCB0aGV5IG92ZXJsYXAsIGEgc3BhY2UgaXMgY3JlYXRlZCB3aGVyZSB0aGUgZW5lcmd5IGNodW5rcyBhcmUgbm90IG9jY2x1ZGVkLlxyXG4gICAgICBjb25zdCBib3R0b21CbG9ja1Bvc2l0aW9uSW5WaWV3ID0gbW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3UG9zaXRpb24oIGJsb2Nrc0luQmVha2VyWyAwIF0ucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZSApO1xyXG5cclxuICAgICAgaWYgKCBjaGlwQXJlYVNoYXBlQm91bmRzLmNvbnRhaW5zUG9pbnQoIGJvdHRvbUJsb2NrUG9zaXRpb25JblZpZXcgKSApIHtcclxuICAgICAgICBjbGlwQXJlYVNoYXBlLm1vdmVUbyhcclxuICAgICAgICAgIGJvdHRvbUJsb2NrUG9zaXRpb25JblZpZXcueCAtIHRoaXMuYmxvY2tXaWR0aEluVmlldyAvIDIgKyB0aGlzLmZvcndhcmRQcm9qZWN0aW9uVmVjdG9yLngsXHJcbiAgICAgICAgICBib3R0b21CbG9ja1Bvc2l0aW9uSW5WaWV3LnkgKyB0aGlzLmZvcndhcmRQcm9qZWN0aW9uVmVjdG9yLnlcclxuICAgICAgICApO1xyXG4gICAgICAgIGNsaXBBcmVhU2hhcGUubGluZVRvUmVsYXRpdmUoIHRoaXMuYmxvY2tXaWR0aEluVmlldywgMCApO1xyXG4gICAgICAgIGNsaXBBcmVhU2hhcGUubGluZVRvUmVsYXRpdmUoIC10aGlzLmZvcndhcmRQcm9qZWN0aW9uVmVjdG9yLnggKiAyLCAtdGhpcy5mb3J3YXJkUHJvamVjdGlvblZlY3Rvci55ICogMiApO1xyXG4gICAgICAgIGNsaXBBcmVhU2hhcGUubGluZVRvUmVsYXRpdmUoIDAsIC10aGlzLmJsb2NrSGVpZ2h0SW5WaWV3ICogMiApO1xyXG4gICAgICAgIGNsaXBBcmVhU2hhcGUubGluZVRvUmVsYXRpdmUoIC10aGlzLmJsb2NrV2lkdGhJblZpZXcsIDAgKTtcclxuICAgICAgICBjbGlwQXJlYVNoYXBlLmxpbmVUb1JlbGF0aXZlKCB0aGlzLmZvcndhcmRQcm9qZWN0aW9uVmVjdG9yLnggKiAyLCB0aGlzLmZvcndhcmRQcm9qZWN0aW9uVmVjdG9yLnkgKiAyICk7XHJcbiAgICAgICAgY2xpcEFyZWFTaGFwZS5saW5lVG9SZWxhdGl2ZSggMCwgdGhpcy5ibG9ja0hlaWdodEluVmlldyAqIDIgKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcblxyXG4gICAgICAvLyBDLXN0eWxlIGxvb3AgZm9yIGJlc3QgcGVyZm9ybWFuY2VcclxuICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgYmxvY2tzSW5CZWFrZXIubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgICAgYmxvY2sgPSBibG9ja3NJbkJlYWtlclsgaSBdO1xyXG4gICAgICAgIGNvbnN0IGJsb2NrUG9zaXRpb25JblZpZXcgPSBtb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdQb3NpdGlvbiggYmxvY2sucG9zaXRpb25Qcm9wZXJ0eS52YWx1ZSApO1xyXG5cclxuICAgICAgICAvLyBUaGUgZm9sbG93aW5nIGNvZGUgbWFrZXMgc29tZSBhc3N1bXB0aW9ucyB0aGF0IGFyZSBrbm93biB0byBiZSB0cnVlIGZvciB0aGUgRUZBQyBzaW11bGF0aW9uIGJ1dCB3aGljaFxyXG4gICAgICAgIC8vIHdvdWxkbid0IG5lY2Vzc2FyaWx5IHRydWUgZm9yIGEgZ2VuZXJhbGl6ZWQgdmVyc2lvbiBvZiB0aGlzLiAgVGhvc2UgYXNzdW1wdGlvbnMgYXJlIHRoYXQgdGhlIHByb3ZpZGVkIHNoYXBlXHJcbiAgICAgICAgLy8gaXMgcmVjdGFuZ3VsYXIgYW5kIHRoYXQgdGhlIHBvc2l0aW9uIG9mIHRoZSBibG9jayBpcyB0aGUgYm90dG9tIGNlbnRlci5cclxuICAgICAgICBpZiAoIGNoaXBBcmVhU2hhcGVCb3VuZHMuY29udGFpbnNQb2ludCggYmxvY2tQb3NpdGlvbkluVmlldyApICkge1xyXG4gICAgICAgICAgY2xpcEFyZWFTaGFwZS5tb3ZlVG8oXHJcbiAgICAgICAgICAgIGJsb2NrUG9zaXRpb25JblZpZXcueCAtIHRoaXMuYmxvY2tXaWR0aEluVmlldyAvIDIgKyB0aGlzLmZvcndhcmRQcm9qZWN0aW9uVmVjdG9yLngsXHJcbiAgICAgICAgICAgIGJsb2NrUG9zaXRpb25JblZpZXcueSArIHRoaXMuZm9yd2FyZFByb2plY3Rpb25WZWN0b3IueVxyXG4gICAgICAgICAgKTtcclxuICAgICAgICAgIGNsaXBBcmVhU2hhcGUubGluZVRvUmVsYXRpdmUoIHRoaXMuYmxvY2tXaWR0aEluVmlldywgMCApO1xyXG4gICAgICAgICAgY2xpcEFyZWFTaGFwZS5saW5lVG9SZWxhdGl2ZSggLXRoaXMuZm9yd2FyZFByb2plY3Rpb25WZWN0b3IueCAqIDIsIC10aGlzLmZvcndhcmRQcm9qZWN0aW9uVmVjdG9yLnkgKiAyICk7XHJcbiAgICAgICAgICBjbGlwQXJlYVNoYXBlLmxpbmVUb1JlbGF0aXZlKCAwLCAtdGhpcy5ibG9ja0hlaWdodEluVmlldyApO1xyXG4gICAgICAgICAgY2xpcEFyZWFTaGFwZS5saW5lVG9SZWxhdGl2ZSggLXRoaXMuYmxvY2tXaWR0aEluVmlldywgMCApO1xyXG4gICAgICAgICAgY2xpcEFyZWFTaGFwZS5saW5lVG9SZWxhdGl2ZSggdGhpcy5mb3J3YXJkUHJvamVjdGlvblZlY3Rvci54ICogMiwgdGhpcy5mb3J3YXJkUHJvamVjdGlvblZlY3Rvci55ICogMiApO1xyXG4gICAgICAgICAgY2xpcEFyZWFTaGFwZS5saW5lVG9SZWxhdGl2ZSggMCwgdGhpcy5ibG9ja0hlaWdodEluVmlldyApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuZW5lcmd5Rm9ybXNBbmRDaGFuZ2VzLnJlZ2lzdGVyKCAnQmVha2VyQ29udGFpbmVyVmlldycsIEJlYWtlckNvbnRhaW5lclZpZXcgKTtcclxuZXhwb3J0IGRlZmF1bHQgQmVha2VyQ29udGFpbmVyVmlldzsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FB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