// Copyright 2014-2022, University of Colorado Boulder

/**
 * Scenery node that represents a chunk of energy in the view.
 *
 * @author John Blanco
 * @author Jesse Greenberg
 * @author Chris Klusendorf (Phet Interactive Simulations)
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Circle, Image, Node, Text } from '../../../../scenery/js/imports.js';
import energyChemical_png from '../../../images/energyChemical_png.js';
import energyElectrical_png from '../../../images/energyElectrical_png.js';
import energyHidden_png from '../../../images/energyHidden_png.js';
import energyLight_png from '../../../images/energyLight_png.js';
import energyMechanical_png from '../../../images/energyMechanical_png.js';
import energyThermal_png from '../../../images/energyThermal_png.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';
import EnergyFormsAndChangesStrings from '../../EnergyFormsAndChangesStrings.js';
import EFACConstants from '../EFACConstants.js';
import EFACQueryParameters from '../EFACQueryParameters.js';
import EnergyType from '../model/EnergyType.js';
const energyChunkLabelString = EnergyFormsAndChangesStrings.energyChunkLabel;

// constants
const Z_DISTANCE_WHERE_FULLY_FADED = 0.1; // In meters

// convenience map that links energy types to their representing images
const mapEnergyTypeToImage = {};
mapEnergyTypeToImage[EnergyType.THERMAL] = energyThermal_png;
mapEnergyTypeToImage[EnergyType.ELECTRICAL] = energyElectrical_png;
mapEnergyTypeToImage[EnergyType.MECHANICAL] = energyMechanical_png;
mapEnergyTypeToImage[EnergyType.LIGHT] = energyLight_png;
mapEnergyTypeToImage[EnergyType.CHEMICAL] = energyChemical_png;
mapEnergyTypeToImage[EnergyType.HIDDEN] = energyHidden_png;

// array that holds the created energy chunk image nodes
const energyChunkImageNodes = {};
class EnergyChunkNode extends Node {
  /**
   * @param {EnergyChunk} energyChunk - model of an energy chunk
   * @param {ModelViewTransform2} modelViewTransform
   */
  constructor(energyChunk, modelViewTransform) {
    super();

    // control the overall visibility of this node
    const handleVisibilityChanged = visible => {
      !this.isDisposed && this.setVisible(visible);
    };
    energyChunk.visibleProperty.link(handleVisibilityChanged);

    // set up updating of transparency based on Z position
    const handleZPositionChanged = zPosition => {
      this.updateTransparency(zPosition);
    };
    energyChunk.zPositionProperty.link(handleZPositionChanged);

    // monitor the energy type and update the image if a change occurs
    const handleEnergyTypeChanged = energyType => {
      this.removeAllChildren();
      this.addChild(getEnergyChunkNode(energyType));
      if (EFACQueryParameters.showHelperShapes) {
        this.addChild(new Circle(6, {
          fill: 'pink'
        }));
      }
    };
    energyChunk.energyTypeProperty.link(handleEnergyTypeChanged);

    // set this node's position when the corresponding model element moves
    const handlePositionChanged = position => {
      assert && assert(!_.isNaN(position.x), `position.x = ${position.x}`);
      assert && assert(!_.isNaN(position.y), `position.y = ${position.y}`);
      this.translation = modelViewTransform.modelToViewPosition(position);
    };
    energyChunk.positionProperty.link(handlePositionChanged);
    this.disposeEnergyChunkNode = () => {
      energyChunk.visibleProperty.unlink(handleVisibilityChanged);
      energyChunk.zPositionProperty.unlink(handleZPositionChanged);
      energyChunk.energyTypeProperty.unlink(handleEnergyTypeChanged);
      energyChunk.positionProperty.unlink(handlePositionChanged);
    };
  }

  /**
   * update the transparency, which is a function of several factors
   * @private
   * @param {number} zPosition
   */
  updateTransparency(zPosition) {
    let zFadeValue = 1;
    if (zPosition < 0) {
      zFadeValue = Math.max((Z_DISTANCE_WHERE_FULLY_FADED + zPosition) / Z_DISTANCE_WHERE_FULLY_FADED, 0);
    }
    this.setOpacity(zFadeValue);
  }

  // @public
  dispose() {
    this.disposeEnergyChunkNode();
    super.dispose();
  }
}

/**
 * Helper function that creates the image for an EnergyChunkNode.
 * @param {EnergyType} energyType
 * @returns {Image}
 */
const createEnergyChunkImageNode = energyType => {
  const background = new Image(mapEnergyTypeToImage[energyType]);
  const energyText = new Text(energyChunkLabelString, {
    font: new PhetFont(16)
  });
  energyText.scale(Math.min(background.width / energyText.width, background.height / energyText.height) * 0.65);
  energyText.center = background.center;
  background.addChild(energyText);
  background.scale(EFACConstants.ENERGY_CHUNK_WIDTH / background.width);
  background.center = Vector2.ZERO;
  return background;
};

/**
 * Helper function that returns the correct image for an EnergyChunkNode.
 * @param {EnergyType} energyType
 * @returns {Image}
 */
const getEnergyChunkNode = energyType => {
  // these need to be lazily created because the images are not decoded fast enough in the built version to be
  // available right away
  if (!energyChunkImageNodes[energyType]) {
    energyChunkImageNodes[energyType] = createEnergyChunkImageNode(energyType);
  }
  return energyChunkImageNodes[energyType];
};

// statics
EnergyChunkNode.Z_DISTANCE_WHERE_FULLY_FADED = Z_DISTANCE_WHERE_FULLY_FADED;
energyFormsAndChanges.register('EnergyChunkNode', EnergyChunkNode);
export default EnergyChunkNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWZWN0b3IyIiwiUGhldEZvbnQiLCJDaXJjbGUiLCJJbWFnZSIsIk5vZGUiLCJUZXh0IiwiZW5lcmd5Q2hlbWljYWxfcG5nIiwiZW5lcmd5RWxlY3RyaWNhbF9wbmciLCJlbmVyZ3lIaWRkZW5fcG5nIiwiZW5lcmd5TGlnaHRfcG5nIiwiZW5lcmd5TWVjaGFuaWNhbF9wbmciLCJlbmVyZ3lUaGVybWFsX3BuZyIsImVuZXJneUZvcm1zQW5kQ2hhbmdlcyIsIkVuZXJneUZvcm1zQW5kQ2hhbmdlc1N0cmluZ3MiLCJFRkFDQ29uc3RhbnRzIiwiRUZBQ1F1ZXJ5UGFyYW1ldGVycyIsIkVuZXJneVR5cGUiLCJlbmVyZ3lDaHVua0xhYmVsU3RyaW5nIiwiZW5lcmd5Q2h1bmtMYWJlbCIsIlpfRElTVEFOQ0VfV0hFUkVfRlVMTFlfRkFERUQiLCJtYXBFbmVyZ3lUeXBlVG9JbWFnZSIsIlRIRVJNQUwiLCJFTEVDVFJJQ0FMIiwiTUVDSEFOSUNBTCIsIkxJR0hUIiwiQ0hFTUlDQUwiLCJISURERU4iLCJlbmVyZ3lDaHVua0ltYWdlTm9kZXMiLCJFbmVyZ3lDaHVua05vZGUiLCJjb25zdHJ1Y3RvciIsImVuZXJneUNodW5rIiwibW9kZWxWaWV3VHJhbnNmb3JtIiwiaGFuZGxlVmlzaWJpbGl0eUNoYW5nZWQiLCJ2aXNpYmxlIiwiaXNEaXNwb3NlZCIsInNldFZpc2libGUiLCJ2aXNpYmxlUHJvcGVydHkiLCJsaW5rIiwiaGFuZGxlWlBvc2l0aW9uQ2hhbmdlZCIsInpQb3NpdGlvbiIsInVwZGF0ZVRyYW5zcGFyZW5jeSIsInpQb3NpdGlvblByb3BlcnR5IiwiaGFuZGxlRW5lcmd5VHlwZUNoYW5nZWQiLCJlbmVyZ3lUeXBlIiwicmVtb3ZlQWxsQ2hpbGRyZW4iLCJhZGRDaGlsZCIsImdldEVuZXJneUNodW5rTm9kZSIsInNob3dIZWxwZXJTaGFwZXMiLCJmaWxsIiwiZW5lcmd5VHlwZVByb3BlcnR5IiwiaGFuZGxlUG9zaXRpb25DaGFuZ2VkIiwicG9zaXRpb24iLCJhc3NlcnQiLCJfIiwiaXNOYU4iLCJ4IiwieSIsInRyYW5zbGF0aW9uIiwibW9kZWxUb1ZpZXdQb3NpdGlvbiIsInBvc2l0aW9uUHJvcGVydHkiLCJkaXNwb3NlRW5lcmd5Q2h1bmtOb2RlIiwidW5saW5rIiwiekZhZGVWYWx1ZSIsIk1hdGgiLCJtYXgiLCJzZXRPcGFjaXR5IiwiZGlzcG9zZSIsImNyZWF0ZUVuZXJneUNodW5rSW1hZ2VOb2RlIiwiYmFja2dyb3VuZCIsImVuZXJneVRleHQiLCJmb250Iiwic2NhbGUiLCJtaW4iLCJ3aWR0aCIsImhlaWdodCIsImNlbnRlciIsIkVORVJHWV9DSFVOS19XSURUSCIsIlpFUk8iLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkVuZXJneUNodW5rTm9kZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNC0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBTY2VuZXJ5IG5vZGUgdGhhdCByZXByZXNlbnRzIGEgY2h1bmsgb2YgZW5lcmd5IGluIHRoZSB2aWV3LlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvXHJcbiAqIEBhdXRob3IgSmVzc2UgR3JlZW5iZXJnXHJcbiAqIEBhdXRob3IgQ2hyaXMgS2x1c2VuZG9yZiAoUGhldCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCBQaGV0Rm9udCBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvUGhldEZvbnQuanMnO1xyXG5pbXBvcnQgeyBDaXJjbGUsIEltYWdlLCBOb2RlLCBUZXh0IH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IGVuZXJneUNoZW1pY2FsX3BuZyBmcm9tICcuLi8uLi8uLi9pbWFnZXMvZW5lcmd5Q2hlbWljYWxfcG5nLmpzJztcclxuaW1wb3J0IGVuZXJneUVsZWN0cmljYWxfcG5nIGZyb20gJy4uLy4uLy4uL2ltYWdlcy9lbmVyZ3lFbGVjdHJpY2FsX3BuZy5qcyc7XHJcbmltcG9ydCBlbmVyZ3lIaWRkZW5fcG5nIGZyb20gJy4uLy4uLy4uL2ltYWdlcy9lbmVyZ3lIaWRkZW5fcG5nLmpzJztcclxuaW1wb3J0IGVuZXJneUxpZ2h0X3BuZyBmcm9tICcuLi8uLi8uLi9pbWFnZXMvZW5lcmd5TGlnaHRfcG5nLmpzJztcclxuaW1wb3J0IGVuZXJneU1lY2hhbmljYWxfcG5nIGZyb20gJy4uLy4uLy4uL2ltYWdlcy9lbmVyZ3lNZWNoYW5pY2FsX3BuZy5qcyc7XHJcbmltcG9ydCBlbmVyZ3lUaGVybWFsX3BuZyBmcm9tICcuLi8uLi8uLi9pbWFnZXMvZW5lcmd5VGhlcm1hbF9wbmcuanMnO1xyXG5pbXBvcnQgZW5lcmd5Rm9ybXNBbmRDaGFuZ2VzIGZyb20gJy4uLy4uL2VuZXJneUZvcm1zQW5kQ2hhbmdlcy5qcyc7XHJcbmltcG9ydCBFbmVyZ3lGb3Jtc0FuZENoYW5nZXNTdHJpbmdzIGZyb20gJy4uLy4uL0VuZXJneUZvcm1zQW5kQ2hhbmdlc1N0cmluZ3MuanMnO1xyXG5pbXBvcnQgRUZBQ0NvbnN0YW50cyBmcm9tICcuLi9FRkFDQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IEVGQUNRdWVyeVBhcmFtZXRlcnMgZnJvbSAnLi4vRUZBQ1F1ZXJ5UGFyYW1ldGVycy5qcyc7XHJcbmltcG9ydCBFbmVyZ3lUeXBlIGZyb20gJy4uL21vZGVsL0VuZXJneVR5cGUuanMnO1xyXG5cclxuY29uc3QgZW5lcmd5Q2h1bmtMYWJlbFN0cmluZyA9IEVuZXJneUZvcm1zQW5kQ2hhbmdlc1N0cmluZ3MuZW5lcmd5Q2h1bmtMYWJlbDtcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBaX0RJU1RBTkNFX1dIRVJFX0ZVTExZX0ZBREVEID0gMC4xOyAvLyBJbiBtZXRlcnNcclxuXHJcbi8vIGNvbnZlbmllbmNlIG1hcCB0aGF0IGxpbmtzIGVuZXJneSB0eXBlcyB0byB0aGVpciByZXByZXNlbnRpbmcgaW1hZ2VzXHJcbmNvbnN0IG1hcEVuZXJneVR5cGVUb0ltYWdlID0ge307XHJcbm1hcEVuZXJneVR5cGVUb0ltYWdlWyBFbmVyZ3lUeXBlLlRIRVJNQUwgXSA9IGVuZXJneVRoZXJtYWxfcG5nO1xyXG5tYXBFbmVyZ3lUeXBlVG9JbWFnZVsgRW5lcmd5VHlwZS5FTEVDVFJJQ0FMIF0gPSBlbmVyZ3lFbGVjdHJpY2FsX3BuZztcclxubWFwRW5lcmd5VHlwZVRvSW1hZ2VbIEVuZXJneVR5cGUuTUVDSEFOSUNBTCBdID0gZW5lcmd5TWVjaGFuaWNhbF9wbmc7XHJcbm1hcEVuZXJneVR5cGVUb0ltYWdlWyBFbmVyZ3lUeXBlLkxJR0hUIF0gPSBlbmVyZ3lMaWdodF9wbmc7XHJcbm1hcEVuZXJneVR5cGVUb0ltYWdlWyBFbmVyZ3lUeXBlLkNIRU1JQ0FMIF0gPSBlbmVyZ3lDaGVtaWNhbF9wbmc7XHJcbm1hcEVuZXJneVR5cGVUb0ltYWdlWyBFbmVyZ3lUeXBlLkhJRERFTiBdID0gZW5lcmd5SGlkZGVuX3BuZztcclxuXHJcbi8vIGFycmF5IHRoYXQgaG9sZHMgdGhlIGNyZWF0ZWQgZW5lcmd5IGNodW5rIGltYWdlIG5vZGVzXHJcbmNvbnN0IGVuZXJneUNodW5rSW1hZ2VOb2RlcyA9IHt9O1xyXG5cclxuY2xhc3MgRW5lcmd5Q2h1bmtOb2RlIGV4dGVuZHMgTm9kZSB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7RW5lcmd5Q2h1bmt9IGVuZXJneUNodW5rIC0gbW9kZWwgb2YgYW4gZW5lcmd5IGNodW5rXHJcbiAgICogQHBhcmFtIHtNb2RlbFZpZXdUcmFuc2Zvcm0yfSBtb2RlbFZpZXdUcmFuc2Zvcm1cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggZW5lcmd5Q2h1bmssIG1vZGVsVmlld1RyYW5zZm9ybSApIHtcclxuICAgIHN1cGVyKCk7XHJcblxyXG4gICAgLy8gY29udHJvbCB0aGUgb3ZlcmFsbCB2aXNpYmlsaXR5IG9mIHRoaXMgbm9kZVxyXG4gICAgY29uc3QgaGFuZGxlVmlzaWJpbGl0eUNoYW5nZWQgPSB2aXNpYmxlID0+IHtcclxuICAgICAgIXRoaXMuaXNEaXNwb3NlZCAmJiB0aGlzLnNldFZpc2libGUoIHZpc2libGUgKTtcclxuICAgIH07XHJcbiAgICBlbmVyZ3lDaHVuay52aXNpYmxlUHJvcGVydHkubGluayggaGFuZGxlVmlzaWJpbGl0eUNoYW5nZWQgKTtcclxuXHJcbiAgICAvLyBzZXQgdXAgdXBkYXRpbmcgb2YgdHJhbnNwYXJlbmN5IGJhc2VkIG9uIFogcG9zaXRpb25cclxuICAgIGNvbnN0IGhhbmRsZVpQb3NpdGlvbkNoYW5nZWQgPSB6UG9zaXRpb24gPT4ge1xyXG4gICAgICB0aGlzLnVwZGF0ZVRyYW5zcGFyZW5jeSggelBvc2l0aW9uICk7XHJcbiAgICB9O1xyXG4gICAgZW5lcmd5Q2h1bmsuelBvc2l0aW9uUHJvcGVydHkubGluayggaGFuZGxlWlBvc2l0aW9uQ2hhbmdlZCApO1xyXG5cclxuICAgIC8vIG1vbml0b3IgdGhlIGVuZXJneSB0eXBlIGFuZCB1cGRhdGUgdGhlIGltYWdlIGlmIGEgY2hhbmdlIG9jY3Vyc1xyXG4gICAgY29uc3QgaGFuZGxlRW5lcmd5VHlwZUNoYW5nZWQgPSBlbmVyZ3lUeXBlID0+IHtcclxuICAgICAgdGhpcy5yZW1vdmVBbGxDaGlsZHJlbigpO1xyXG4gICAgICB0aGlzLmFkZENoaWxkKCBnZXRFbmVyZ3lDaHVua05vZGUoIGVuZXJneVR5cGUgKSApO1xyXG5cclxuICAgICAgaWYgKCBFRkFDUXVlcnlQYXJhbWV0ZXJzLnNob3dIZWxwZXJTaGFwZXMgKSB7XHJcbiAgICAgICAgdGhpcy5hZGRDaGlsZCggbmV3IENpcmNsZSggNiwgeyBmaWxsOiAncGluaycgfSApICk7XHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgICBlbmVyZ3lDaHVuay5lbmVyZ3lUeXBlUHJvcGVydHkubGluayggaGFuZGxlRW5lcmd5VHlwZUNoYW5nZWQgKTtcclxuXHJcbiAgICAvLyBzZXQgdGhpcyBub2RlJ3MgcG9zaXRpb24gd2hlbiB0aGUgY29ycmVzcG9uZGluZyBtb2RlbCBlbGVtZW50IG1vdmVzXHJcbiAgICBjb25zdCBoYW5kbGVQb3NpdGlvbkNoYW5nZWQgPSBwb3NpdGlvbiA9PiB7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoICFfLmlzTmFOKCBwb3NpdGlvbi54ICksIGBwb3NpdGlvbi54ID0gJHtwb3NpdGlvbi54fWAgKTtcclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggIV8uaXNOYU4oIHBvc2l0aW9uLnkgKSwgYHBvc2l0aW9uLnkgPSAke3Bvc2l0aW9uLnl9YCApO1xyXG4gICAgICB0aGlzLnRyYW5zbGF0aW9uID0gbW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3UG9zaXRpb24oIHBvc2l0aW9uICk7XHJcbiAgICB9O1xyXG4gICAgZW5lcmd5Q2h1bmsucG9zaXRpb25Qcm9wZXJ0eS5saW5rKCBoYW5kbGVQb3NpdGlvbkNoYW5nZWQgKTtcclxuXHJcbiAgICB0aGlzLmRpc3Bvc2VFbmVyZ3lDaHVua05vZGUgPSAoKSA9PiB7XHJcbiAgICAgIGVuZXJneUNodW5rLnZpc2libGVQcm9wZXJ0eS51bmxpbmsoIGhhbmRsZVZpc2liaWxpdHlDaGFuZ2VkICk7XHJcbiAgICAgIGVuZXJneUNodW5rLnpQb3NpdGlvblByb3BlcnR5LnVubGluayggaGFuZGxlWlBvc2l0aW9uQ2hhbmdlZCApO1xyXG4gICAgICBlbmVyZ3lDaHVuay5lbmVyZ3lUeXBlUHJvcGVydHkudW5saW5rKCBoYW5kbGVFbmVyZ3lUeXBlQ2hhbmdlZCApO1xyXG4gICAgICBlbmVyZ3lDaHVuay5wb3NpdGlvblByb3BlcnR5LnVubGluayggaGFuZGxlUG9zaXRpb25DaGFuZ2VkICk7XHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogdXBkYXRlIHRoZSB0cmFuc3BhcmVuY3ksIHdoaWNoIGlzIGEgZnVuY3Rpb24gb2Ygc2V2ZXJhbCBmYWN0b3JzXHJcbiAgICogQHByaXZhdGVcclxuICAgKiBAcGFyYW0ge251bWJlcn0gelBvc2l0aW9uXHJcbiAgICovXHJcbiAgdXBkYXRlVHJhbnNwYXJlbmN5KCB6UG9zaXRpb24gKSB7XHJcbiAgICBsZXQgekZhZGVWYWx1ZSA9IDE7XHJcbiAgICBpZiAoIHpQb3NpdGlvbiA8IDAgKSB7XHJcbiAgICAgIHpGYWRlVmFsdWUgPSBNYXRoLm1heCggKCBaX0RJU1RBTkNFX1dIRVJFX0ZVTExZX0ZBREVEICsgelBvc2l0aW9uICkgLyBaX0RJU1RBTkNFX1dIRVJFX0ZVTExZX0ZBREVELCAwICk7XHJcbiAgICB9XHJcbiAgICB0aGlzLnNldE9wYWNpdHkoIHpGYWRlVmFsdWUgKTtcclxuICB9XHJcblxyXG4gIC8vIEBwdWJsaWNcclxuICBkaXNwb3NlKCkge1xyXG4gICAgdGhpcy5kaXNwb3NlRW5lcmd5Q2h1bmtOb2RlKCk7XHJcbiAgICBzdXBlci5kaXNwb3NlKCk7XHJcbiAgfVxyXG59XHJcblxyXG4vKipcclxuICogSGVscGVyIGZ1bmN0aW9uIHRoYXQgY3JlYXRlcyB0aGUgaW1hZ2UgZm9yIGFuIEVuZXJneUNodW5rTm9kZS5cclxuICogQHBhcmFtIHtFbmVyZ3lUeXBlfSBlbmVyZ3lUeXBlXHJcbiAqIEByZXR1cm5zIHtJbWFnZX1cclxuICovXHJcbmNvbnN0IGNyZWF0ZUVuZXJneUNodW5rSW1hZ2VOb2RlID0gZW5lcmd5VHlwZSA9PiB7XHJcbiAgY29uc3QgYmFja2dyb3VuZCA9IG5ldyBJbWFnZSggbWFwRW5lcmd5VHlwZVRvSW1hZ2VbIGVuZXJneVR5cGUgXSApO1xyXG4gIGNvbnN0IGVuZXJneVRleHQgPSBuZXcgVGV4dCggZW5lcmd5Q2h1bmtMYWJlbFN0cmluZywgeyBmb250OiBuZXcgUGhldEZvbnQoIDE2ICkgfSApO1xyXG4gIGVuZXJneVRleHQuc2NhbGUoIE1hdGgubWluKCBiYWNrZ3JvdW5kLndpZHRoIC8gZW5lcmd5VGV4dC53aWR0aCwgYmFja2dyb3VuZC5oZWlnaHQgLyBlbmVyZ3lUZXh0LmhlaWdodCApICogMC42NSApO1xyXG4gIGVuZXJneVRleHQuY2VudGVyID0gYmFja2dyb3VuZC5jZW50ZXI7XHJcbiAgYmFja2dyb3VuZC5hZGRDaGlsZCggZW5lcmd5VGV4dCApO1xyXG4gIGJhY2tncm91bmQuc2NhbGUoIEVGQUNDb25zdGFudHMuRU5FUkdZX0NIVU5LX1dJRFRIIC8gYmFja2dyb3VuZC53aWR0aCApO1xyXG4gIGJhY2tncm91bmQuY2VudGVyID0gVmVjdG9yMi5aRVJPO1xyXG4gIHJldHVybiBiYWNrZ3JvdW5kO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEhlbHBlciBmdW5jdGlvbiB0aGF0IHJldHVybnMgdGhlIGNvcnJlY3QgaW1hZ2UgZm9yIGFuIEVuZXJneUNodW5rTm9kZS5cclxuICogQHBhcmFtIHtFbmVyZ3lUeXBlfSBlbmVyZ3lUeXBlXHJcbiAqIEByZXR1cm5zIHtJbWFnZX1cclxuICovXHJcbmNvbnN0IGdldEVuZXJneUNodW5rTm9kZSA9IGVuZXJneVR5cGUgPT4ge1xyXG5cclxuICAvLyB0aGVzZSBuZWVkIHRvIGJlIGxhemlseSBjcmVhdGVkIGJlY2F1c2UgdGhlIGltYWdlcyBhcmUgbm90IGRlY29kZWQgZmFzdCBlbm91Z2ggaW4gdGhlIGJ1aWx0IHZlcnNpb24gdG8gYmVcclxuICAvLyBhdmFpbGFibGUgcmlnaHQgYXdheVxyXG4gIGlmICggIWVuZXJneUNodW5rSW1hZ2VOb2Rlc1sgZW5lcmd5VHlwZSBdICkge1xyXG4gICAgZW5lcmd5Q2h1bmtJbWFnZU5vZGVzWyBlbmVyZ3lUeXBlIF0gPSBjcmVhdGVFbmVyZ3lDaHVua0ltYWdlTm9kZSggZW5lcmd5VHlwZSApO1xyXG4gIH1cclxuICByZXR1cm4gZW5lcmd5Q2h1bmtJbWFnZU5vZGVzWyBlbmVyZ3lUeXBlIF07XHJcbn07XHJcblxyXG4vLyBzdGF0aWNzXHJcbkVuZXJneUNodW5rTm9kZS5aX0RJU1RBTkNFX1dIRVJFX0ZVTExZX0ZBREVEID0gWl9ESVNUQU5DRV9XSEVSRV9GVUxMWV9GQURFRDtcclxuXHJcbmVuZXJneUZvcm1zQW5kQ2hhbmdlcy5yZWdpc3RlciggJ0VuZXJneUNodW5rTm9kZScsIEVuZXJneUNodW5rTm9kZSApO1xyXG5leHBvcnQgZGVmYXVsdCBFbmVyZ3lDaHVua05vZGU7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxPQUFPLE1BQU0sK0JBQStCO0FBQ25ELE9BQU9DLFFBQVEsTUFBTSx5Q0FBeUM7QUFDOUQsU0FBU0MsTUFBTSxFQUFFQyxLQUFLLEVBQUVDLElBQUksRUFBRUMsSUFBSSxRQUFRLG1DQUFtQztBQUM3RSxPQUFPQyxrQkFBa0IsTUFBTSx1Q0FBdUM7QUFDdEUsT0FBT0Msb0JBQW9CLE1BQU0seUNBQXlDO0FBQzFFLE9BQU9DLGdCQUFnQixNQUFNLHFDQUFxQztBQUNsRSxPQUFPQyxlQUFlLE1BQU0sb0NBQW9DO0FBQ2hFLE9BQU9DLG9CQUFvQixNQUFNLHlDQUF5QztBQUMxRSxPQUFPQyxpQkFBaUIsTUFBTSxzQ0FBc0M7QUFDcEUsT0FBT0MscUJBQXFCLE1BQU0sZ0NBQWdDO0FBQ2xFLE9BQU9DLDRCQUE0QixNQUFNLHVDQUF1QztBQUNoRixPQUFPQyxhQUFhLE1BQU0scUJBQXFCO0FBQy9DLE9BQU9DLG1CQUFtQixNQUFNLDJCQUEyQjtBQUMzRCxPQUFPQyxVQUFVLE1BQU0sd0JBQXdCO0FBRS9DLE1BQU1DLHNCQUFzQixHQUFHSiw0QkFBNEIsQ0FBQ0ssZ0JBQWdCOztBQUU1RTtBQUNBLE1BQU1DLDRCQUE0QixHQUFHLEdBQUcsQ0FBQyxDQUFDOztBQUUxQztBQUNBLE1BQU1DLG9CQUFvQixHQUFHLENBQUMsQ0FBQztBQUMvQkEsb0JBQW9CLENBQUVKLFVBQVUsQ0FBQ0ssT0FBTyxDQUFFLEdBQUdWLGlCQUFpQjtBQUM5RFMsb0JBQW9CLENBQUVKLFVBQVUsQ0FBQ00sVUFBVSxDQUFFLEdBQUdmLG9CQUFvQjtBQUNwRWEsb0JBQW9CLENBQUVKLFVBQVUsQ0FBQ08sVUFBVSxDQUFFLEdBQUdiLG9CQUFvQjtBQUNwRVUsb0JBQW9C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