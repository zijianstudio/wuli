// Copyright 2016-2022, University of Colorado Boulder

/**
 * a Scenery Node that represents and electrical generator in the view
 *
 * @author John Blanco
 * @author Andrew Adare
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Image, Text } from '../../../../scenery/js/imports.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import connector_png from '../../../images/connector_png.js';
import generator_png from '../../../images/generator_png.js';
import generatorWheelHub_png from '../../../images/generatorWheelHub_png.js';
import generatorWheelPaddlesShort_png from '../../../images/generatorWheelPaddlesShort_png.js';
import generatorWheelSpokes_png from '../../../images/generatorWheelSpokes_png.js';
import wireBottomLeft_png from '../../../images/wireBottomLeft_png.js';
import EFACConstants from '../../common/EFACConstants.js';
import EnergyChunkLayer from '../../common/view/EnergyChunkLayer.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';
import EnergyFormsAndChangesStrings from '../../EnergyFormsAndChangesStrings.js';
import Generator from '../model/Generator.js';
import MoveFadeModelElementNode from './MoveFadeModelElementNode.js';

// constants
const SPOKES_AND_PADDLES_CENTER_Y_OFFSET = -65;
const generatorString = EnergyFormsAndChangesStrings.generator;
class GeneratorNode extends MoveFadeModelElementNode {
  /**
   * @param {Generator} generator EnergyConverter
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Object} [options]
   */
  constructor(generator, modelViewTransform, options) {
    options = merge({
      // {boolean} - whether the mechanical energy chunk layer is added
      addMechanicalEnergyChunkLayer: true,
      // phet-io
      tandem: Tandem.REQUIRED
    }, options);
    super(generator, modelViewTransform, options.tandem);
    const generatorNode = new Image(generator_png, {
      left: -107,
      top: -165
    });
    const labelText = new Text(generatorString, {
      font: new PhetFont(19),
      centerX: generatorNode.centerX,
      bottom: generatorNode.bottom - 6,
      tandem: options.tandem.createTandem('labelText'),
      maxWidth: 160,
      // empirially determined
      phetioVisiblePropertyInstrumented: true
    });
    const spokesNode = new Image(generatorWheelSpokes_png, {
      centerX: generatorNode.centerX,
      centerY: generatorNode.centerY + SPOKES_AND_PADDLES_CENTER_Y_OFFSET
    });
    const paddlesNode = new Image(generatorWheelPaddlesShort_png, {
      centerX: generatorNode.centerX,
      centerY: generatorNode.centerY + SPOKES_AND_PADDLES_CENTER_Y_OFFSET
    });
    const generatorWheelHubNode = new Image(generatorWheelHub_png, {
      centerX: paddlesNode.centerX,
      centerY: paddlesNode.centerY,
      maxWidth: modelViewTransform.modelToViewDeltaX(Generator.WHEEL_RADIUS * 2)
    });
    const wireBottomLeftNode = new Image(wireBottomLeft_png, {
      right: generatorNode.right - 29,
      top: generatorNode.centerY - 30,
      scale: EFACConstants.WIRE_IMAGE_SCALE
    });
    const connectorNode = new Image(connector_png, {
      left: generatorNode.right - 2,
      centerY: generatorNode.centerY + 90
    });
    this.addChild(wireBottomLeftNode);
    this.addChild(new EnergyChunkLayer(generator.electricalEnergyChunks, modelViewTransform, {
      parentPositionProperty: generator.positionProperty
    }));
    this.addChild(generatorNode);
    this.addChild(labelText);
    this.addChild(connectorNode);
    this.addChild(spokesNode);
    this.addChild(paddlesNode);
    this.addChild(generatorWheelHubNode);
    this.addChild(new EnergyChunkLayer(generator.hiddenEnergyChunks, modelViewTransform, {
      parentPositionProperty: generator.positionProperty
    }));

    // @public (read-only)
    this.mechanicalEnergyChunkLayer = null;
    if (options.addMechanicalEnergyChunkLayer) {
      this.mechanicalEnergyChunkLayer = new EnergyChunkLayer(generator.energyChunkList, modelViewTransform, {
        parentPositionProperty: generator.positionProperty
      });
      this.addChild(this.mechanicalEnergyChunkLayer);
    } else {
      // create this layer anyway so that it can be extracted and layered differently than it is be default
      this.mechanicalEnergyChunkLayer = new EnergyChunkLayer(generator.energyChunkList, modelViewTransform);
    }

    // update the rotation of the wheel image based on model value
    const wheelRotationPoint = new Vector2(paddlesNode.center.x, paddlesNode.center.y);
    generator.wheelRotationalAngleProperty.link(angle => {
      const delta = -angle - paddlesNode.getRotation();
      paddlesNode.rotateAround(wheelRotationPoint, delta);
      spokesNode.rotateAround(wheelRotationPoint, delta);
    });

    // hide the paddles and show the spokes when in direct coupling mode
    generator.directCouplingModeProperty.link(directCouplingMode => {
      paddlesNode.setVisible(!directCouplingMode);
      spokesNode.setVisible(directCouplingMode);
    });
  }

  /**
   * Return the mechanical energy chunk layer. This supports adding the energy chunk layer from
   * outside of this node to alter the layering order.
   * @returns {EnergyChunkLayer}
   * @public
   */
  getMechanicalEnergyChunkLayer() {
    assert && assert(!this.hasChild(this.mechanicalEnergyChunkLayer), 'this.mechanicalEnergyChunkLayer is already a child of GeneratorNode');
    return this.mechanicalEnergyChunkLayer;
  }
}
energyFormsAndChanges.register('GeneratorNode', GeneratorNode);
export default GeneratorNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWZWN0b3IyIiwibWVyZ2UiLCJQaGV0Rm9udCIsIkltYWdlIiwiVGV4dCIsIlRhbmRlbSIsImNvbm5lY3Rvcl9wbmciLCJnZW5lcmF0b3JfcG5nIiwiZ2VuZXJhdG9yV2hlZWxIdWJfcG5nIiwiZ2VuZXJhdG9yV2hlZWxQYWRkbGVzU2hvcnRfcG5nIiwiZ2VuZXJhdG9yV2hlZWxTcG9rZXNfcG5nIiwid2lyZUJvdHRvbUxlZnRfcG5nIiwiRUZBQ0NvbnN0YW50cyIsIkVuZXJneUNodW5rTGF5ZXIiLCJlbmVyZ3lGb3Jtc0FuZENoYW5nZXMiLCJFbmVyZ3lGb3Jtc0FuZENoYW5nZXNTdHJpbmdzIiwiR2VuZXJhdG9yIiwiTW92ZUZhZGVNb2RlbEVsZW1lbnROb2RlIiwiU1BPS0VTX0FORF9QQURETEVTX0NFTlRFUl9ZX09GRlNFVCIsImdlbmVyYXRvclN0cmluZyIsImdlbmVyYXRvciIsIkdlbmVyYXRvck5vZGUiLCJjb25zdHJ1Y3RvciIsIm1vZGVsVmlld1RyYW5zZm9ybSIsIm9wdGlvbnMiLCJhZGRNZWNoYW5pY2FsRW5lcmd5Q2h1bmtMYXllciIsInRhbmRlbSIsIlJFUVVJUkVEIiwiZ2VuZXJhdG9yTm9kZSIsImxlZnQiLCJ0b3AiLCJsYWJlbFRleHQiLCJmb250IiwiY2VudGVyWCIsImJvdHRvbSIsImNyZWF0ZVRhbmRlbSIsIm1heFdpZHRoIiwicGhldGlvVmlzaWJsZVByb3BlcnR5SW5zdHJ1bWVudGVkIiwic3Bva2VzTm9kZSIsImNlbnRlclkiLCJwYWRkbGVzTm9kZSIsImdlbmVyYXRvcldoZWVsSHViTm9kZSIsIm1vZGVsVG9WaWV3RGVsdGFYIiwiV0hFRUxfUkFESVVTIiwid2lyZUJvdHRvbUxlZnROb2RlIiwicmlnaHQiLCJzY2FsZSIsIldJUkVfSU1BR0VfU0NBTEUiLCJjb25uZWN0b3JOb2RlIiwiYWRkQ2hpbGQiLCJlbGVjdHJpY2FsRW5lcmd5Q2h1bmtzIiwicGFyZW50UG9zaXRpb25Qcm9wZXJ0eSIsInBvc2l0aW9uUHJvcGVydHkiLCJoaWRkZW5FbmVyZ3lDaHVua3MiLCJtZWNoYW5pY2FsRW5lcmd5Q2h1bmtMYXllciIsImVuZXJneUNodW5rTGlzdCIsIndoZWVsUm90YXRpb25Qb2ludCIsImNlbnRlciIsIngiLCJ5Iiwid2hlZWxSb3RhdGlvbmFsQW5nbGVQcm9wZXJ0eSIsImxpbmsiLCJhbmdsZSIsImRlbHRhIiwiZ2V0Um90YXRpb24iLCJyb3RhdGVBcm91bmQiLCJkaXJlY3RDb3VwbGluZ01vZGVQcm9wZXJ0eSIsImRpcmVjdENvdXBsaW5nTW9kZSIsInNldFZpc2libGUiLCJnZXRNZWNoYW5pY2FsRW5lcmd5Q2h1bmtMYXllciIsImFzc2VydCIsImhhc0NoaWxkIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJHZW5lcmF0b3JOb2RlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE2LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIGEgU2NlbmVyeSBOb2RlIHRoYXQgcmVwcmVzZW50cyBhbmQgZWxlY3RyaWNhbCBnZW5lcmF0b3IgaW4gdGhlIHZpZXdcclxuICpcclxuICogQGF1dGhvciBKb2huIEJsYW5jb1xyXG4gKiBAYXV0aG9yIEFuZHJldyBBZGFyZVxyXG4gKi9cclxuXHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCBQaGV0Rm9udCBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvUGhldEZvbnQuanMnO1xyXG5pbXBvcnQgeyBJbWFnZSwgVGV4dCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XHJcbmltcG9ydCBjb25uZWN0b3JfcG5nIGZyb20gJy4uLy4uLy4uL2ltYWdlcy9jb25uZWN0b3JfcG5nLmpzJztcclxuaW1wb3J0IGdlbmVyYXRvcl9wbmcgZnJvbSAnLi4vLi4vLi4vaW1hZ2VzL2dlbmVyYXRvcl9wbmcuanMnO1xyXG5pbXBvcnQgZ2VuZXJhdG9yV2hlZWxIdWJfcG5nIGZyb20gJy4uLy4uLy4uL2ltYWdlcy9nZW5lcmF0b3JXaGVlbEh1Yl9wbmcuanMnO1xyXG5pbXBvcnQgZ2VuZXJhdG9yV2hlZWxQYWRkbGVzU2hvcnRfcG5nIGZyb20gJy4uLy4uLy4uL2ltYWdlcy9nZW5lcmF0b3JXaGVlbFBhZGRsZXNTaG9ydF9wbmcuanMnO1xyXG5pbXBvcnQgZ2VuZXJhdG9yV2hlZWxTcG9rZXNfcG5nIGZyb20gJy4uLy4uLy4uL2ltYWdlcy9nZW5lcmF0b3JXaGVlbFNwb2tlc19wbmcuanMnO1xyXG5pbXBvcnQgd2lyZUJvdHRvbUxlZnRfcG5nIGZyb20gJy4uLy4uLy4uL2ltYWdlcy93aXJlQm90dG9tTGVmdF9wbmcuanMnO1xyXG5pbXBvcnQgRUZBQ0NvbnN0YW50cyBmcm9tICcuLi8uLi9jb21tb24vRUZBQ0NvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBFbmVyZ3lDaHVua0xheWVyIGZyb20gJy4uLy4uL2NvbW1vbi92aWV3L0VuZXJneUNodW5rTGF5ZXIuanMnO1xyXG5pbXBvcnQgZW5lcmd5Rm9ybXNBbmRDaGFuZ2VzIGZyb20gJy4uLy4uL2VuZXJneUZvcm1zQW5kQ2hhbmdlcy5qcyc7XHJcbmltcG9ydCBFbmVyZ3lGb3Jtc0FuZENoYW5nZXNTdHJpbmdzIGZyb20gJy4uLy4uL0VuZXJneUZvcm1zQW5kQ2hhbmdlc1N0cmluZ3MuanMnO1xyXG5pbXBvcnQgR2VuZXJhdG9yIGZyb20gJy4uL21vZGVsL0dlbmVyYXRvci5qcyc7XHJcbmltcG9ydCBNb3ZlRmFkZU1vZGVsRWxlbWVudE5vZGUgZnJvbSAnLi9Nb3ZlRmFkZU1vZGVsRWxlbWVudE5vZGUuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IFNQT0tFU19BTkRfUEFERExFU19DRU5URVJfWV9PRkZTRVQgPSAtNjU7XHJcblxyXG5jb25zdCBnZW5lcmF0b3JTdHJpbmcgPSBFbmVyZ3lGb3Jtc0FuZENoYW5nZXNTdHJpbmdzLmdlbmVyYXRvcjtcclxuXHJcbmNsYXNzIEdlbmVyYXRvck5vZGUgZXh0ZW5kcyBNb3ZlRmFkZU1vZGVsRWxlbWVudE5vZGUge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge0dlbmVyYXRvcn0gZ2VuZXJhdG9yIEVuZXJneUNvbnZlcnRlclxyXG4gICAqIEBwYXJhbSB7TW9kZWxWaWV3VHJhbnNmb3JtMn0gbW9kZWxWaWV3VHJhbnNmb3JtXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBnZW5lcmF0b3IsIG1vZGVsVmlld1RyYW5zZm9ybSwgb3B0aW9ucyApIHtcclxuXHJcbiAgICBvcHRpb25zID0gbWVyZ2UoIHtcclxuXHJcbiAgICAgIC8vIHtib29sZWFufSAtIHdoZXRoZXIgdGhlIG1lY2hhbmljYWwgZW5lcmd5IGNodW5rIGxheWVyIGlzIGFkZGVkXHJcbiAgICAgIGFkZE1lY2hhbmljYWxFbmVyZ3lDaHVua0xheWVyOiB0cnVlLFxyXG5cclxuICAgICAgLy8gcGhldC1pb1xyXG4gICAgICB0YW5kZW06IFRhbmRlbS5SRVFVSVJFRFxyXG4gICAgfSwgb3B0aW9ucyApO1xyXG5cclxuICAgIHN1cGVyKCBnZW5lcmF0b3IsIG1vZGVsVmlld1RyYW5zZm9ybSwgb3B0aW9ucy50YW5kZW0gKTtcclxuXHJcbiAgICBjb25zdCBnZW5lcmF0b3JOb2RlID0gbmV3IEltYWdlKCBnZW5lcmF0b3JfcG5nLCB7IGxlZnQ6IC0xMDcsIHRvcDogLTE2NSB9ICk7XHJcbiAgICBjb25zdCBsYWJlbFRleHQgPSBuZXcgVGV4dCggZ2VuZXJhdG9yU3RyaW5nLCB7XHJcbiAgICAgIGZvbnQ6IG5ldyBQaGV0Rm9udCggMTkgKSxcclxuICAgICAgY2VudGVyWDogZ2VuZXJhdG9yTm9kZS5jZW50ZXJYLFxyXG4gICAgICBib3R0b206IGdlbmVyYXRvck5vZGUuYm90dG9tIC0gNixcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdsYWJlbFRleHQnICksXHJcbiAgICAgIG1heFdpZHRoOiAxNjAsIC8vIGVtcGlyaWFsbHkgZGV0ZXJtaW5lZFxyXG4gICAgICBwaGV0aW9WaXNpYmxlUHJvcGVydHlJbnN0cnVtZW50ZWQ6IHRydWVcclxuICAgIH0gKTtcclxuICAgIGNvbnN0IHNwb2tlc05vZGUgPSBuZXcgSW1hZ2UoIGdlbmVyYXRvcldoZWVsU3Bva2VzX3BuZywge1xyXG4gICAgICBjZW50ZXJYOiBnZW5lcmF0b3JOb2RlLmNlbnRlclgsXHJcbiAgICAgIGNlbnRlclk6IGdlbmVyYXRvck5vZGUuY2VudGVyWSArIFNQT0tFU19BTkRfUEFERExFU19DRU5URVJfWV9PRkZTRVRcclxuICAgIH0gKTtcclxuICAgIGNvbnN0IHBhZGRsZXNOb2RlID0gbmV3IEltYWdlKCBnZW5lcmF0b3JXaGVlbFBhZGRsZXNTaG9ydF9wbmcsIHtcclxuICAgICAgY2VudGVyWDogZ2VuZXJhdG9yTm9kZS5jZW50ZXJYLFxyXG4gICAgICBjZW50ZXJZOiBnZW5lcmF0b3JOb2RlLmNlbnRlclkgKyBTUE9LRVNfQU5EX1BBRERMRVNfQ0VOVEVSX1lfT0ZGU0VUXHJcbiAgICB9ICk7XHJcbiAgICBjb25zdCBnZW5lcmF0b3JXaGVlbEh1Yk5vZGUgPSBuZXcgSW1hZ2UoIGdlbmVyYXRvcldoZWVsSHViX3BuZywge1xyXG4gICAgICBjZW50ZXJYOiBwYWRkbGVzTm9kZS5jZW50ZXJYLFxyXG4gICAgICBjZW50ZXJZOiBwYWRkbGVzTm9kZS5jZW50ZXJZLFxyXG4gICAgICBtYXhXaWR0aDogbW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3RGVsdGFYKCBHZW5lcmF0b3IuV0hFRUxfUkFESVVTICogMiApXHJcbiAgICB9ICk7XHJcbiAgICBjb25zdCB3aXJlQm90dG9tTGVmdE5vZGUgPSBuZXcgSW1hZ2UoIHdpcmVCb3R0b21MZWZ0X3BuZywge1xyXG4gICAgICByaWdodDogZ2VuZXJhdG9yTm9kZS5yaWdodCAtIDI5LFxyXG4gICAgICB0b3A6IGdlbmVyYXRvck5vZGUuY2VudGVyWSAtIDMwLFxyXG4gICAgICBzY2FsZTogRUZBQ0NvbnN0YW50cy5XSVJFX0lNQUdFX1NDQUxFXHJcbiAgICB9ICk7XHJcbiAgICBjb25zdCBjb25uZWN0b3JOb2RlID0gbmV3IEltYWdlKCBjb25uZWN0b3JfcG5nLCB7XHJcbiAgICAgIGxlZnQ6IGdlbmVyYXRvck5vZGUucmlnaHQgLSAyLFxyXG4gICAgICBjZW50ZXJZOiBnZW5lcmF0b3JOb2RlLmNlbnRlclkgKyA5MFxyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMuYWRkQ2hpbGQoIHdpcmVCb3R0b21MZWZ0Tm9kZSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggbmV3IEVuZXJneUNodW5rTGF5ZXIoIGdlbmVyYXRvci5lbGVjdHJpY2FsRW5lcmd5Q2h1bmtzLCBtb2RlbFZpZXdUcmFuc2Zvcm0sIHtcclxuICAgICAgcGFyZW50UG9zaXRpb25Qcm9wZXJ0eTogZ2VuZXJhdG9yLnBvc2l0aW9uUHJvcGVydHlcclxuICAgIH0gKSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggZ2VuZXJhdG9yTm9kZSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggbGFiZWxUZXh0ICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBjb25uZWN0b3JOb2RlICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBzcG9rZXNOb2RlICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBwYWRkbGVzTm9kZSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggZ2VuZXJhdG9yV2hlZWxIdWJOb2RlICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBuZXcgRW5lcmd5Q2h1bmtMYXllciggZ2VuZXJhdG9yLmhpZGRlbkVuZXJneUNodW5rcywgbW9kZWxWaWV3VHJhbnNmb3JtLCB7XHJcbiAgICAgIHBhcmVudFBvc2l0aW9uUHJvcGVydHk6IGdlbmVyYXRvci5wb3NpdGlvblByb3BlcnR5XHJcbiAgICB9ICkgKTtcclxuXHJcbiAgICAvLyBAcHVibGljIChyZWFkLW9ubHkpXHJcbiAgICB0aGlzLm1lY2hhbmljYWxFbmVyZ3lDaHVua0xheWVyID0gbnVsbDtcclxuXHJcbiAgICBpZiAoIG9wdGlvbnMuYWRkTWVjaGFuaWNhbEVuZXJneUNodW5rTGF5ZXIgKSB7XHJcbiAgICAgIHRoaXMubWVjaGFuaWNhbEVuZXJneUNodW5rTGF5ZXIgPSBuZXcgRW5lcmd5Q2h1bmtMYXllciggZ2VuZXJhdG9yLmVuZXJneUNodW5rTGlzdCwgbW9kZWxWaWV3VHJhbnNmb3JtLCB7XHJcbiAgICAgICAgcGFyZW50UG9zaXRpb25Qcm9wZXJ0eTogZ2VuZXJhdG9yLnBvc2l0aW9uUHJvcGVydHlcclxuICAgICAgfSApO1xyXG4gICAgICB0aGlzLmFkZENoaWxkKCB0aGlzLm1lY2hhbmljYWxFbmVyZ3lDaHVua0xheWVyICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuXHJcbiAgICAgIC8vIGNyZWF0ZSB0aGlzIGxheWVyIGFueXdheSBzbyB0aGF0IGl0IGNhbiBiZSBleHRyYWN0ZWQgYW5kIGxheWVyZWQgZGlmZmVyZW50bHkgdGhhbiBpdCBpcyBiZSBkZWZhdWx0XHJcbiAgICAgIHRoaXMubWVjaGFuaWNhbEVuZXJneUNodW5rTGF5ZXIgPSBuZXcgRW5lcmd5Q2h1bmtMYXllciggZ2VuZXJhdG9yLmVuZXJneUNodW5rTGlzdCwgbW9kZWxWaWV3VHJhbnNmb3JtICk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gdXBkYXRlIHRoZSByb3RhdGlvbiBvZiB0aGUgd2hlZWwgaW1hZ2UgYmFzZWQgb24gbW9kZWwgdmFsdWVcclxuICAgIGNvbnN0IHdoZWVsUm90YXRpb25Qb2ludCA9IG5ldyBWZWN0b3IyKCBwYWRkbGVzTm9kZS5jZW50ZXIueCwgcGFkZGxlc05vZGUuY2VudGVyLnkgKTtcclxuICAgIGdlbmVyYXRvci53aGVlbFJvdGF0aW9uYWxBbmdsZVByb3BlcnR5LmxpbmsoIGFuZ2xlID0+IHtcclxuICAgICAgY29uc3QgZGVsdGEgPSAtYW5nbGUgLSBwYWRkbGVzTm9kZS5nZXRSb3RhdGlvbigpO1xyXG4gICAgICBwYWRkbGVzTm9kZS5yb3RhdGVBcm91bmQoIHdoZWVsUm90YXRpb25Qb2ludCwgZGVsdGEgKTtcclxuICAgICAgc3Bva2VzTm9kZS5yb3RhdGVBcm91bmQoIHdoZWVsUm90YXRpb25Qb2ludCwgZGVsdGEgKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBoaWRlIHRoZSBwYWRkbGVzIGFuZCBzaG93IHRoZSBzcG9rZXMgd2hlbiBpbiBkaXJlY3QgY291cGxpbmcgbW9kZVxyXG4gICAgZ2VuZXJhdG9yLmRpcmVjdENvdXBsaW5nTW9kZVByb3BlcnR5LmxpbmsoIGRpcmVjdENvdXBsaW5nTW9kZSA9PiB7XHJcbiAgICAgIHBhZGRsZXNOb2RlLnNldFZpc2libGUoICFkaXJlY3RDb3VwbGluZ01vZGUgKTtcclxuICAgICAgc3Bva2VzTm9kZS5zZXRWaXNpYmxlKCBkaXJlY3RDb3VwbGluZ01vZGUgKTtcclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybiB0aGUgbWVjaGFuaWNhbCBlbmVyZ3kgY2h1bmsgbGF5ZXIuIFRoaXMgc3VwcG9ydHMgYWRkaW5nIHRoZSBlbmVyZ3kgY2h1bmsgbGF5ZXIgZnJvbVxyXG4gICAqIG91dHNpZGUgb2YgdGhpcyBub2RlIHRvIGFsdGVyIHRoZSBsYXllcmluZyBvcmRlci5cclxuICAgKiBAcmV0dXJucyB7RW5lcmd5Q2h1bmtMYXllcn1cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZ2V0TWVjaGFuaWNhbEVuZXJneUNodW5rTGF5ZXIoKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KFxyXG4gICAgICAhdGhpcy5oYXNDaGlsZCggdGhpcy5tZWNoYW5pY2FsRW5lcmd5Q2h1bmtMYXllciApLFxyXG4gICAgICAndGhpcy5tZWNoYW5pY2FsRW5lcmd5Q2h1bmtMYXllciBpcyBhbHJlYWR5IGEgY2hpbGQgb2YgR2VuZXJhdG9yTm9kZSdcclxuICAgICk7XHJcbiAgICByZXR1cm4gdGhpcy5tZWNoYW5pY2FsRW5lcmd5Q2h1bmtMYXllcjtcclxuICB9XHJcbn1cclxuXHJcbmVuZXJneUZvcm1zQW5kQ2hhbmdlcy5yZWdpc3RlciggJ0dlbmVyYXRvck5vZGUnLCBHZW5lcmF0b3JOb2RlICk7XHJcbmV4cG9ydCBkZWZhdWx0IEdlbmVyYXRvck5vZGU7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsT0FBTyxNQUFNLCtCQUErQjtBQUNuRCxPQUFPQyxLQUFLLE1BQU0sbUNBQW1DO0FBQ3JELE9BQU9DLFFBQVEsTUFBTSx5Q0FBeUM7QUFDOUQsU0FBU0MsS0FBSyxFQUFFQyxJQUFJLFFBQVEsbUNBQW1DO0FBQy9ELE9BQU9DLE1BQU0sTUFBTSxpQ0FBaUM7QUFDcEQsT0FBT0MsYUFBYSxNQUFNLGtDQUFrQztBQUM1RCxPQUFPQyxhQUFhLE1BQU0sa0NBQWtDO0FBQzVELE9BQU9DLHFCQUFxQixNQUFNLDBDQUEwQztBQUM1RSxPQUFPQyw4QkFBOEIsTUFBTSxtREFBbUQ7QUFDOUYsT0FBT0Msd0JBQXdCLE1BQU0sNkNBQTZDO0FBQ2xGLE9BQU9DLGtCQUFrQixNQUFNLHVDQUF1QztBQUN0RSxPQUFPQyxhQUFhLE1BQU0sK0JBQStCO0FBQ3pELE9BQU9DLGdCQUFnQixNQUFNLHVDQUF1QztBQUNwRSxPQUFPQyxxQkFBcUIsTUFBTSxnQ0FBZ0M7QUFDbEUsT0FBT0MsNEJBQTRCLE1BQU0sdUNBQXVDO0FBQ2hGLE9BQU9DLFNBQVMsTUFBTSx1QkFBdUI7QUFDN0MsT0FBT0Msd0JBQXdCLE1BQU0sK0JBQStCOztBQUVwRTtBQUNBLE1BQU1DLGtDQUFrQyxHQUFHLENBQUMsRUFBRTtBQUU5QyxNQUFNQyxlQUFlLEdBQUdKLDRCQUE0QixDQUFDSyxTQUFTO0FBRTlELE1BQU1DLGFBQWEs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