// Copyright 2023, University of Colorado Boulder

/**
 * A collection of Properties used for prototypes that connect this simulation to tangible devices.
 * While working on this sim, we collaborated with Saint Louis University to develop ways to communicate
 * between simulation and several physical/tangible devices. This included prototypes using a serial connection,
 * BLE, custom OpenCV, and Mediapipe.
 *
 * For more information and notes during prototyping see
 * https://github.com/phetsims/quadrilateral/issues/52
 * https://github.com/phetsims/quadrilateral/issues/32
 * https://github.com/phetsims/quadrilateral/issues/341
 * https://github.com/phetsims/quadrilateral/issues/20
 * https://github.com/phetsims/quadrilateral/issues/301
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../../axon/js/BooleanProperty.js';
import Property from '../../../../../axon/js/Property.js';
import Bounds2 from '../../../../../dot/js/Bounds2.js';
import Vector2 from '../../../../../dot/js/Vector2.js';
import ModelViewTransform2 from '../../../../../phetcommon/js/view/ModelViewTransform2.js';
import NullableIO from '../../../../../tandem/js/types/NullableIO.js';
import quadrilateral from '../../../quadrilateral.js';
import QuadrilateralConstants from '../../../QuadrilateralConstants.js';
import QuadrilateralShapeModel from '../QuadrilateralShapeModel.js';
import MarkerDetectionModel from './MarkerDetectionModel.js';
import QuadrilateralVertexLabel from '../QuadrilateralVertexLabel.js';
export default class TangibleConnectionModel {
  // True when we are connected to a device in some way, either bluetooth, serial, or OpenCV.

  // Properties specifically related to marker detection from OpenCV prototypes.

  // The Bounds provided by the physical model, so we know how to map the physical model coordinates to
  // simulation model space. Null until device size is known and provided during a calibration step.
  // A transform that goes from tangible to virtual space. Used to set simulation vertex positions from
  // position data provided by the physical device.
  physicalToModelTransform = ModelViewTransform2.createIdentity();

  // If true, the simulation is currently "calibrating" to a physical device. During this phase, we are setting
  // the physicalModelBounds or the physicalToModelTransform.
  // The model with values related to options that can be set by Preferences that control behavior of tangible input.
  // So that this connection model can directly control the shape.
  // So that we can test proposed QuadrilateralVertex positions before we change the "real" shapeModel.
  constructor(shapeModel, testShapeModel, tangibleOptionsModel, tandem) {
    this.connectedToDeviceProperty = new BooleanProperty(false, {
      tandem: tandem.createTandem('connectedToDeviceProperty')
    });
    this.physicalModelBoundsProperty = new Property(null, {
      tandem: tandem.createTandem('physicalModelBoundsProperty'),
      phetioValueType: NullableIO(Bounds2.Bounds2IO)
    });
    this.isCalibratingProperty = new BooleanProperty(false, {
      tandem: tandem.createTandem('isCalibratingProperty')
    });
    this.markerDetectionModel = new MarkerDetectionModel(tandem.createTandem('markerDetectionModel'));
    this.tangibleOptionsModel = tangibleOptionsModel;
    this.shapeModel = shapeModel;
    this.testShapeModel = testShapeModel;

    // Put a reference to this connection model on the window so that we can access it in wrappers that facilitate
    // communication between device and simulation.
    // @ts-expect-error - For good reason, TypeScript doesn't allow this. But it is fine for prototype code.
    window.tangibleConnectionModel = this;
  }

  /**
   * Set the physical model bounds from the device dimensions. For now, we assume that the device behaves like
   * one provided by CHROME lab, where sides are created from a socket and arm such that when the arm is fully extended
   * it will be twice as large as when it is fully collapsed. When calibrating, we ask for the largest shape possible,
   * so the minimum lengths are just half the provided values. There is also an assumption that the sides are the same
   * and the largest possible shape is a square.
   *
   * PROTOTYPE: These assumptions are specific to the device that we used to prototype, maybe create a more robust
   * calibration function if more devices are supported.
   */
  setPhysicalModelBounds(topLength, rightLength, bottomLength, leftLength) {
    // assuming a square shape for extrema - we may need a mapping function for each individual side if this cannot be assumed
    const maxLength = _.max([topLength, rightLength, bottomLength, leftLength]);
    this.physicalModelBoundsProperty.value = new Bounds2(0, 0, maxLength, maxLength);
  }

  /**
   * Create a transform that can be used to transform between tangible and virtual space. The scaling only uses one
   * dimension because we assume scaling should be the same in both x and y. It uses height as the limiting factor for
   * scaling because the simulation bounds are wider than they are tall.
   *
   * PROTOTYPE: If we commit to this, we would want to look into a better solution that does not count on those
   * assumptions.
   */
  setPhysicalToVirtualTransform(width, height) {
    this.physicalToModelTransform = ModelViewTransform2.createSinglePointScaleMapping(new Vector2(width / 2, height / 2),
    // center of the physical space "model"
    new Vector2(0, 0),
    // origin of the simulation model
    QuadrilateralConstants.MODEL_BOUNDS.height / height // scale from physical model to simulation space
    );
  }

  /**
   * Apply a series of checks on the proposed positions to make sure that the requested shape does not cross
   * and does not have overlap.
   */
  isShapeAllowedForTangible(labelToPositionMap) {
    let allowed = true;
    const vertexAPosition = labelToPositionMap.get(QuadrilateralVertexLabel.VERTEX_A);
    const vertexBPosition = labelToPositionMap.get(QuadrilateralVertexLabel.VERTEX_B);
    const vertexCPosition = labelToPositionMap.get(QuadrilateralVertexLabel.VERTEX_C);
    const vertexDPosition = labelToPositionMap.get(QuadrilateralVertexLabel.VERTEX_D);

    // all positions defined from tangible/device input
    allowed = !!vertexAPosition && !!vertexBPosition && !!vertexCPosition && !!vertexDPosition;
    if (allowed) {
      this.testShapeModel.setVertexPositions(labelToPositionMap);
      allowed = QuadrilateralShapeModel.isQuadrilateralShapeAllowed(this.testShapeModel);
    }
    return allowed;
  }
}
quadrilateral.register('TangibleConnectionModel', TangibleConnectionModel);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJQcm9wZXJ0eSIsIkJvdW5kczIiLCJWZWN0b3IyIiwiTW9kZWxWaWV3VHJhbnNmb3JtMiIsIk51bGxhYmxlSU8iLCJxdWFkcmlsYXRlcmFsIiwiUXVhZHJpbGF0ZXJhbENvbnN0YW50cyIsIlF1YWRyaWxhdGVyYWxTaGFwZU1vZGVsIiwiTWFya2VyRGV0ZWN0aW9uTW9kZWwiLCJRdWFkcmlsYXRlcmFsVmVydGV4TGFiZWwiLCJUYW5naWJsZUNvbm5lY3Rpb25Nb2RlbCIsInBoeXNpY2FsVG9Nb2RlbFRyYW5zZm9ybSIsImNyZWF0ZUlkZW50aXR5IiwiY29uc3RydWN0b3IiLCJzaGFwZU1vZGVsIiwidGVzdFNoYXBlTW9kZWwiLCJ0YW5naWJsZU9wdGlvbnNNb2RlbCIsInRhbmRlbSIsImNvbm5lY3RlZFRvRGV2aWNlUHJvcGVydHkiLCJjcmVhdGVUYW5kZW0iLCJwaHlzaWNhbE1vZGVsQm91bmRzUHJvcGVydHkiLCJwaGV0aW9WYWx1ZVR5cGUiLCJCb3VuZHMySU8iLCJpc0NhbGlicmF0aW5nUHJvcGVydHkiLCJtYXJrZXJEZXRlY3Rpb25Nb2RlbCIsIndpbmRvdyIsInRhbmdpYmxlQ29ubmVjdGlvbk1vZGVsIiwic2V0UGh5c2ljYWxNb2RlbEJvdW5kcyIsInRvcExlbmd0aCIsInJpZ2h0TGVuZ3RoIiwiYm90dG9tTGVuZ3RoIiwibGVmdExlbmd0aCIsIm1heExlbmd0aCIsIl8iLCJtYXgiLCJ2YWx1ZSIsInNldFBoeXNpY2FsVG9WaXJ0dWFsVHJhbnNmb3JtIiwid2lkdGgiLCJoZWlnaHQiLCJjcmVhdGVTaW5nbGVQb2ludFNjYWxlTWFwcGluZyIsIk1PREVMX0JPVU5EUyIsImlzU2hhcGVBbGxvd2VkRm9yVGFuZ2libGUiLCJsYWJlbFRvUG9zaXRpb25NYXAiLCJhbGxvd2VkIiwidmVydGV4QVBvc2l0aW9uIiwiZ2V0IiwiVkVSVEVYX0EiLCJ2ZXJ0ZXhCUG9zaXRpb24iLCJWRVJURVhfQiIsInZlcnRleENQb3NpdGlvbiIsIlZFUlRFWF9DIiwidmVydGV4RFBvc2l0aW9uIiwiVkVSVEVYX0QiLCJzZXRWZXJ0ZXhQb3NpdGlvbnMiLCJpc1F1YWRyaWxhdGVyYWxTaGFwZUFsbG93ZWQiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlRhbmdpYmxlQ29ubmVjdGlvbk1vZGVsLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBBIGNvbGxlY3Rpb24gb2YgUHJvcGVydGllcyB1c2VkIGZvciBwcm90b3R5cGVzIHRoYXQgY29ubmVjdCB0aGlzIHNpbXVsYXRpb24gdG8gdGFuZ2libGUgZGV2aWNlcy5cclxuICogV2hpbGUgd29ya2luZyBvbiB0aGlzIHNpbSwgd2UgY29sbGFib3JhdGVkIHdpdGggU2FpbnQgTG91aXMgVW5pdmVyc2l0eSB0byBkZXZlbG9wIHdheXMgdG8gY29tbXVuaWNhdGVcclxuICogYmV0d2VlbiBzaW11bGF0aW9uIGFuZCBzZXZlcmFsIHBoeXNpY2FsL3RhbmdpYmxlIGRldmljZXMuIFRoaXMgaW5jbHVkZWQgcHJvdG90eXBlcyB1c2luZyBhIHNlcmlhbCBjb25uZWN0aW9uLFxyXG4gKiBCTEUsIGN1c3RvbSBPcGVuQ1YsIGFuZCBNZWRpYXBpcGUuXHJcbiAqXHJcbiAqIEZvciBtb3JlIGluZm9ybWF0aW9uIGFuZCBub3RlcyBkdXJpbmcgcHJvdG90eXBpbmcgc2VlXHJcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9xdWFkcmlsYXRlcmFsL2lzc3Vlcy81MlxyXG4gKiBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvcXVhZHJpbGF0ZXJhbC9pc3N1ZXMvMzJcclxuICogaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3F1YWRyaWxhdGVyYWwvaXNzdWVzLzM0MVxyXG4gKiBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvcXVhZHJpbGF0ZXJhbC9pc3N1ZXMvMjBcclxuICogaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL3F1YWRyaWxhdGVyYWwvaXNzdWVzLzMwMVxyXG4gKlxyXG4gKiBAYXV0aG9yIEplc3NlIEdyZWVuYmVyZyAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgQm9vbGVhblByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uLy4uL2F4b24vanMvQm9vbGVhblByb3BlcnR5LmpzJztcclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgVFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uLy4uL2F4b24vanMvVFByb3BlcnR5LmpzJztcclxuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi4vLi4vLi4vLi4vLi4vZG90L2pzL0JvdW5kczIuanMnO1xyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCBNb2RlbFZpZXdUcmFuc2Zvcm0yIGZyb20gJy4uLy4uLy4uLy4uLy4uL3BoZXRjb21tb24vanMvdmlldy9Nb2RlbFZpZXdUcmFuc2Zvcm0yLmpzJztcclxuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi8uLi8uLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcclxuaW1wb3J0IE51bGxhYmxlSU8gZnJvbSAnLi4vLi4vLi4vLi4vLi4vdGFuZGVtL2pzL3R5cGVzL051bGxhYmxlSU8uanMnO1xyXG5pbXBvcnQgcXVhZHJpbGF0ZXJhbCBmcm9tICcuLi8uLi8uLi9xdWFkcmlsYXRlcmFsLmpzJztcclxuaW1wb3J0IFF1YWRyaWxhdGVyYWxDb25zdGFudHMgZnJvbSAnLi4vLi4vLi4vUXVhZHJpbGF0ZXJhbENvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBRdWFkcmlsYXRlcmFsU2hhcGVNb2RlbCwgeyBWZXJ0ZXhMYWJlbFRvUHJvcG9zZWRQb3NpdGlvbk1hcCB9IGZyb20gJy4uL1F1YWRyaWxhdGVyYWxTaGFwZU1vZGVsLmpzJztcclxuaW1wb3J0IFF1YWRyaWxhdGVyYWxUYW5naWJsZU9wdGlvbnNNb2RlbCBmcm9tICcuL1F1YWRyaWxhdGVyYWxUYW5naWJsZU9wdGlvbnNNb2RlbC5qcyc7XHJcbmltcG9ydCBNYXJrZXJEZXRlY3Rpb25Nb2RlbCBmcm9tICcuL01hcmtlckRldGVjdGlvbk1vZGVsLmpzJztcclxuaW1wb3J0IFF1YWRyaWxhdGVyYWxWZXJ0ZXhMYWJlbCBmcm9tICcuLi9RdWFkcmlsYXRlcmFsVmVydGV4TGFiZWwuanMnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVGFuZ2libGVDb25uZWN0aW9uTW9kZWwge1xyXG5cclxuICAvLyBUcnVlIHdoZW4gd2UgYXJlIGNvbm5lY3RlZCB0byBhIGRldmljZSBpbiBzb21lIHdheSwgZWl0aGVyIGJsdWV0b290aCwgc2VyaWFsLCBvciBPcGVuQ1YuXHJcbiAgcHVibGljIGNvbm5lY3RlZFRvRGV2aWNlUHJvcGVydHk6IFRQcm9wZXJ0eTxib29sZWFuPjtcclxuXHJcbiAgLy8gUHJvcGVydGllcyBzcGVjaWZpY2FsbHkgcmVsYXRlZCB0byBtYXJrZXIgZGV0ZWN0aW9uIGZyb20gT3BlbkNWIHByb3RvdHlwZXMuXHJcbiAgcHVibGljIG1hcmtlckRldGVjdGlvbk1vZGVsOiBNYXJrZXJEZXRlY3Rpb25Nb2RlbDtcclxuXHJcbiAgLy8gVGhlIEJvdW5kcyBwcm92aWRlZCBieSB0aGUgcGh5c2ljYWwgbW9kZWwsIHNvIHdlIGtub3cgaG93IHRvIG1hcCB0aGUgcGh5c2ljYWwgbW9kZWwgY29vcmRpbmF0ZXMgdG9cclxuICAvLyBzaW11bGF0aW9uIG1vZGVsIHNwYWNlLiBOdWxsIHVudGlsIGRldmljZSBzaXplIGlzIGtub3duIGFuZCBwcm92aWRlZCBkdXJpbmcgYSBjYWxpYnJhdGlvbiBzdGVwLlxyXG4gIHB1YmxpYyBwaHlzaWNhbE1vZGVsQm91bmRzUHJvcGVydHk6IFRQcm9wZXJ0eTxCb3VuZHMyIHwgbnVsbD47XHJcblxyXG4gIC8vIEEgdHJhbnNmb3JtIHRoYXQgZ29lcyBmcm9tIHRhbmdpYmxlIHRvIHZpcnR1YWwgc3BhY2UuIFVzZWQgdG8gc2V0IHNpbXVsYXRpb24gdmVydGV4IHBvc2l0aW9ucyBmcm9tXHJcbiAgLy8gcG9zaXRpb24gZGF0YSBwcm92aWRlZCBieSB0aGUgcGh5c2ljYWwgZGV2aWNlLlxyXG4gIHB1YmxpYyBwaHlzaWNhbFRvTW9kZWxUcmFuc2Zvcm0gPSBNb2RlbFZpZXdUcmFuc2Zvcm0yLmNyZWF0ZUlkZW50aXR5KCk7XHJcblxyXG4gIC8vIElmIHRydWUsIHRoZSBzaW11bGF0aW9uIGlzIGN1cnJlbnRseSBcImNhbGlicmF0aW5nXCIgdG8gYSBwaHlzaWNhbCBkZXZpY2UuIER1cmluZyB0aGlzIHBoYXNlLCB3ZSBhcmUgc2V0dGluZ1xyXG4gIC8vIHRoZSBwaHlzaWNhbE1vZGVsQm91bmRzIG9yIHRoZSBwaHlzaWNhbFRvTW9kZWxUcmFuc2Zvcm0uXHJcbiAgcHVibGljIGlzQ2FsaWJyYXRpbmdQcm9wZXJ0eTogVFByb3BlcnR5PGJvb2xlYW4+O1xyXG5cclxuICAvLyBUaGUgbW9kZWwgd2l0aCB2YWx1ZXMgcmVsYXRlZCB0byBvcHRpb25zIHRoYXQgY2FuIGJlIHNldCBieSBQcmVmZXJlbmNlcyB0aGF0IGNvbnRyb2wgYmVoYXZpb3Igb2YgdGFuZ2libGUgaW5wdXQuXHJcbiAgcHVibGljIHJlYWRvbmx5IHRhbmdpYmxlT3B0aW9uc01vZGVsOiBRdWFkcmlsYXRlcmFsVGFuZ2libGVPcHRpb25zTW9kZWw7XHJcblxyXG4gIC8vIFNvIHRoYXQgdGhpcyBjb25uZWN0aW9uIG1vZGVsIGNhbiBkaXJlY3RseSBjb250cm9sIHRoZSBzaGFwZS5cclxuICBwdWJsaWMgcmVhZG9ubHkgc2hhcGVNb2RlbDogUXVhZHJpbGF0ZXJhbFNoYXBlTW9kZWw7XHJcblxyXG4gIC8vIFNvIHRoYXQgd2UgY2FuIHRlc3QgcHJvcG9zZWQgUXVhZHJpbGF0ZXJhbFZlcnRleCBwb3NpdGlvbnMgYmVmb3JlIHdlIGNoYW5nZSB0aGUgXCJyZWFsXCIgc2hhcGVNb2RlbC5cclxuICBwdWJsaWMgcmVhZG9ubHkgdGVzdFNoYXBlTW9kZWw6IFF1YWRyaWxhdGVyYWxTaGFwZU1vZGVsO1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHNoYXBlTW9kZWw6IFF1YWRyaWxhdGVyYWxTaGFwZU1vZGVsLCB0ZXN0U2hhcGVNb2RlbDogUXVhZHJpbGF0ZXJhbFNoYXBlTW9kZWwsIHRhbmdpYmxlT3B0aW9uc01vZGVsOiBRdWFkcmlsYXRlcmFsVGFuZ2libGVPcHRpb25zTW9kZWwsIHRhbmRlbTogVGFuZGVtICkge1xyXG4gICAgdGhpcy5jb25uZWN0ZWRUb0RldmljZVByb3BlcnR5ID0gbmV3IEJvb2xlYW5Qcm9wZXJ0eSggZmFsc2UsIHtcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnY29ubmVjdGVkVG9EZXZpY2VQcm9wZXJ0eScgKVxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5waHlzaWNhbE1vZGVsQm91bmRzUHJvcGVydHkgPSBuZXcgUHJvcGVydHk8Qm91bmRzMiB8IG51bGw+KCBudWxsLCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3BoeXNpY2FsTW9kZWxCb3VuZHNQcm9wZXJ0eScgKSxcclxuICAgICAgcGhldGlvVmFsdWVUeXBlOiBOdWxsYWJsZUlPKCBCb3VuZHMyLkJvdW5kczJJTyApXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmlzQ2FsaWJyYXRpbmdQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIGZhbHNlLCB7XHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2lzQ2FsaWJyYXRpbmdQcm9wZXJ0eScgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMubWFya2VyRGV0ZWN0aW9uTW9kZWwgPSBuZXcgTWFya2VyRGV0ZWN0aW9uTW9kZWwoIHRhbmRlbS5jcmVhdGVUYW5kZW0oICdtYXJrZXJEZXRlY3Rpb25Nb2RlbCcgKSApO1xyXG4gICAgdGhpcy50YW5naWJsZU9wdGlvbnNNb2RlbCA9IHRhbmdpYmxlT3B0aW9uc01vZGVsO1xyXG4gICAgdGhpcy5zaGFwZU1vZGVsID0gc2hhcGVNb2RlbDtcclxuICAgIHRoaXMudGVzdFNoYXBlTW9kZWwgPSB0ZXN0U2hhcGVNb2RlbDtcclxuXHJcbiAgICAvLyBQdXQgYSByZWZlcmVuY2UgdG8gdGhpcyBjb25uZWN0aW9uIG1vZGVsIG9uIHRoZSB3aW5kb3cgc28gdGhhdCB3ZSBjYW4gYWNjZXNzIGl0IGluIHdyYXBwZXJzIHRoYXQgZmFjaWxpdGF0ZVxyXG4gICAgLy8gY29tbXVuaWNhdGlvbiBiZXR3ZWVuIGRldmljZSBhbmQgc2ltdWxhdGlvbi5cclxuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgLSBGb3IgZ29vZCByZWFzb24sIFR5cGVTY3JpcHQgZG9lc24ndCBhbGxvdyB0aGlzLiBCdXQgaXQgaXMgZmluZSBmb3IgcHJvdG90eXBlIGNvZGUuXHJcbiAgICB3aW5kb3cudGFuZ2libGVDb25uZWN0aW9uTW9kZWwgPSB0aGlzO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0IHRoZSBwaHlzaWNhbCBtb2RlbCBib3VuZHMgZnJvbSB0aGUgZGV2aWNlIGRpbWVuc2lvbnMuIEZvciBub3csIHdlIGFzc3VtZSB0aGF0IHRoZSBkZXZpY2UgYmVoYXZlcyBsaWtlXHJcbiAgICogb25lIHByb3ZpZGVkIGJ5IENIUk9NRSBsYWIsIHdoZXJlIHNpZGVzIGFyZSBjcmVhdGVkIGZyb20gYSBzb2NrZXQgYW5kIGFybSBzdWNoIHRoYXQgd2hlbiB0aGUgYXJtIGlzIGZ1bGx5IGV4dGVuZGVkXHJcbiAgICogaXQgd2lsbCBiZSB0d2ljZSBhcyBsYXJnZSBhcyB3aGVuIGl0IGlzIGZ1bGx5IGNvbGxhcHNlZC4gV2hlbiBjYWxpYnJhdGluZywgd2UgYXNrIGZvciB0aGUgbGFyZ2VzdCBzaGFwZSBwb3NzaWJsZSxcclxuICAgKiBzbyB0aGUgbWluaW11bSBsZW5ndGhzIGFyZSBqdXN0IGhhbGYgdGhlIHByb3ZpZGVkIHZhbHVlcy4gVGhlcmUgaXMgYWxzbyBhbiBhc3N1bXB0aW9uIHRoYXQgdGhlIHNpZGVzIGFyZSB0aGUgc2FtZVxyXG4gICAqIGFuZCB0aGUgbGFyZ2VzdCBwb3NzaWJsZSBzaGFwZSBpcyBhIHNxdWFyZS5cclxuICAgKlxyXG4gICAqIFBST1RPVFlQRTogVGhlc2UgYXNzdW1wdGlvbnMgYXJlIHNwZWNpZmljIHRvIHRoZSBkZXZpY2UgdGhhdCB3ZSB1c2VkIHRvIHByb3RvdHlwZSwgbWF5YmUgY3JlYXRlIGEgbW9yZSByb2J1c3RcclxuICAgKiBjYWxpYnJhdGlvbiBmdW5jdGlvbiBpZiBtb3JlIGRldmljZXMgYXJlIHN1cHBvcnRlZC5cclxuICAgKi9cclxuICBwdWJsaWMgc2V0UGh5c2ljYWxNb2RlbEJvdW5kcyggdG9wTGVuZ3RoOiBudW1iZXIsIHJpZ2h0TGVuZ3RoOiBudW1iZXIsIGJvdHRvbUxlbmd0aDogbnVtYmVyLCBsZWZ0TGVuZ3RoOiBudW1iZXIgKTogdm9pZCB7XHJcblxyXG4gICAgLy8gYXNzdW1pbmcgYSBzcXVhcmUgc2hhcGUgZm9yIGV4dHJlbWEgLSB3ZSBtYXkgbmVlZCBhIG1hcHBpbmcgZnVuY3Rpb24gZm9yIGVhY2ggaW5kaXZpZHVhbCBzaWRlIGlmIHRoaXMgY2Fubm90IGJlIGFzc3VtZWRcclxuICAgIGNvbnN0IG1heExlbmd0aCA9IF8ubWF4KCBbIHRvcExlbmd0aCwgcmlnaHRMZW5ndGgsIGJvdHRvbUxlbmd0aCwgbGVmdExlbmd0aCBdICkhO1xyXG4gICAgdGhpcy5waHlzaWNhbE1vZGVsQm91bmRzUHJvcGVydHkudmFsdWUgPSBuZXcgQm91bmRzMiggMCwgMCwgbWF4TGVuZ3RoLCBtYXhMZW5ndGggKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZSBhIHRyYW5zZm9ybSB0aGF0IGNhbiBiZSB1c2VkIHRvIHRyYW5zZm9ybSBiZXR3ZWVuIHRhbmdpYmxlIGFuZCB2aXJ0dWFsIHNwYWNlLiBUaGUgc2NhbGluZyBvbmx5IHVzZXMgb25lXHJcbiAgICogZGltZW5zaW9uIGJlY2F1c2Ugd2UgYXNzdW1lIHNjYWxpbmcgc2hvdWxkIGJlIHRoZSBzYW1lIGluIGJvdGggeCBhbmQgeS4gSXQgdXNlcyBoZWlnaHQgYXMgdGhlIGxpbWl0aW5nIGZhY3RvciBmb3JcclxuICAgKiBzY2FsaW5nIGJlY2F1c2UgdGhlIHNpbXVsYXRpb24gYm91bmRzIGFyZSB3aWRlciB0aGFuIHRoZXkgYXJlIHRhbGwuXHJcbiAgICpcclxuICAgKiBQUk9UT1RZUEU6IElmIHdlIGNvbW1pdCB0byB0aGlzLCB3ZSB3b3VsZCB3YW50IHRvIGxvb2sgaW50byBhIGJldHRlciBzb2x1dGlvbiB0aGF0IGRvZXMgbm90IGNvdW50IG9uIHRob3NlXHJcbiAgICogYXNzdW1wdGlvbnMuXHJcbiAgICovXHJcbiAgcHVibGljIHNldFBoeXNpY2FsVG9WaXJ0dWFsVHJhbnNmb3JtKCB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlciApOiB2b2lkIHtcclxuICAgIHRoaXMucGh5c2ljYWxUb01vZGVsVHJhbnNmb3JtID0gTW9kZWxWaWV3VHJhbnNmb3JtMi5jcmVhdGVTaW5nbGVQb2ludFNjYWxlTWFwcGluZyhcclxuICAgICAgbmV3IFZlY3RvcjIoIHdpZHRoIC8gMiwgaGVpZ2h0IC8gMiApLCAvLyBjZW50ZXIgb2YgdGhlIHBoeXNpY2FsIHNwYWNlIFwibW9kZWxcIlxyXG4gICAgICBuZXcgVmVjdG9yMiggMCwgMCApLCAvLyBvcmlnaW4gb2YgdGhlIHNpbXVsYXRpb24gbW9kZWxcclxuICAgICAgUXVhZHJpbGF0ZXJhbENvbnN0YW50cy5NT0RFTF9CT1VORFMuaGVpZ2h0IC8gKCBoZWlnaHQgKSAvLyBzY2FsZSBmcm9tIHBoeXNpY2FsIG1vZGVsIHRvIHNpbXVsYXRpb24gc3BhY2VcclxuICAgICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBBcHBseSBhIHNlcmllcyBvZiBjaGVja3Mgb24gdGhlIHByb3Bvc2VkIHBvc2l0aW9ucyB0byBtYWtlIHN1cmUgdGhhdCB0aGUgcmVxdWVzdGVkIHNoYXBlIGRvZXMgbm90IGNyb3NzXHJcbiAgICogYW5kIGRvZXMgbm90IGhhdmUgb3ZlcmxhcC5cclxuICAgKi9cclxuICBwdWJsaWMgaXNTaGFwZUFsbG93ZWRGb3JUYW5naWJsZSggbGFiZWxUb1Bvc2l0aW9uTWFwOiBWZXJ0ZXhMYWJlbFRvUHJvcG9zZWRQb3NpdGlvbk1hcCApOiBib29sZWFuIHtcclxuICAgIGxldCBhbGxvd2VkID0gdHJ1ZTtcclxuXHJcbiAgICBjb25zdCB2ZXJ0ZXhBUG9zaXRpb24gPSBsYWJlbFRvUG9zaXRpb25NYXAuZ2V0KCBRdWFkcmlsYXRlcmFsVmVydGV4TGFiZWwuVkVSVEVYX0EgKTtcclxuICAgIGNvbnN0IHZlcnRleEJQb3NpdGlvbiA9IGxhYmVsVG9Qb3NpdGlvbk1hcC5nZXQoIFF1YWRyaWxhdGVyYWxWZXJ0ZXhMYWJlbC5WRVJURVhfQiApO1xyXG4gICAgY29uc3QgdmVydGV4Q1Bvc2l0aW9uID0gbGFiZWxUb1Bvc2l0aW9uTWFwLmdldCggUXVhZHJpbGF0ZXJhbFZlcnRleExhYmVsLlZFUlRFWF9DICk7XHJcbiAgICBjb25zdCB2ZXJ0ZXhEUG9zaXRpb24gPSBsYWJlbFRvUG9zaXRpb25NYXAuZ2V0KCBRdWFkcmlsYXRlcmFsVmVydGV4TGFiZWwuVkVSVEVYX0QgKTtcclxuXHJcbiAgICAvLyBhbGwgcG9zaXRpb25zIGRlZmluZWQgZnJvbSB0YW5naWJsZS9kZXZpY2UgaW5wdXRcclxuICAgIGFsbG93ZWQgPSAhIXZlcnRleEFQb3NpdGlvbiEgJiYgISF2ZXJ0ZXhCUG9zaXRpb24hICYmICEhdmVydGV4Q1Bvc2l0aW9uISAmJiAhIXZlcnRleERQb3NpdGlvbiE7XHJcblxyXG4gICAgaWYgKCBhbGxvd2VkICkge1xyXG4gICAgICB0aGlzLnRlc3RTaGFwZU1vZGVsLnNldFZlcnRleFBvc2l0aW9ucyggbGFiZWxUb1Bvc2l0aW9uTWFwICk7XHJcbiAgICAgIGFsbG93ZWQgPSBRdWFkcmlsYXRlcmFsU2hhcGVNb2RlbC5pc1F1YWRyaWxhdGVyYWxTaGFwZUFsbG93ZWQoIHRoaXMudGVzdFNoYXBlTW9kZWwgKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gYWxsb3dlZDtcclxuICB9XHJcbn1cclxuXHJcbnF1YWRyaWxhdGVyYWwucmVnaXN0ZXIoICdUYW5naWJsZUNvbm5lY3Rpb25Nb2RlbCcsIFRhbmdpYmxlQ29ubmVjdGlvbk1vZGVsICk7XHJcbiJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGVBQWUsTUFBTSwyQ0FBMkM7QUFDdkUsT0FBT0MsUUFBUSxNQUFNLG9DQUFvQztBQUV6RCxPQUFPQyxPQUFPLE1BQU0sa0NBQWtDO0FBQ3RELE9BQU9DLE9BQU8sTUFBTSxrQ0FBa0M7QUFDdEQsT0FBT0MsbUJBQW1CLE1BQU0sMERBQTBEO0FBRTFGLE9BQU9DLFVBQVUsTUFBTSw4Q0FBOEM7QUFDckUsT0FBT0MsYUFBYSxNQUFNLDJCQUEyQjtBQUNyRCxPQUFPQyxzQkFBc0IsTUFBTSxvQ0FBb0M7QUFDdkUsT0FBT0MsdUJBQXVCLE1BQTRDLCtCQUErQjtBQUV6RyxPQUFPQyxvQkFBb0IsTUFBTSwyQkFBMkI7QUFDNUQsT0FBT0Msd0JBQXdCLE1BQU0sZ0NBQWdDO0FBRXJFLGVBQWUsTUFBTUMsdUJBQXVCLENBQUM7RUFFM0M7O0VBR0E7O0VBR0E7RUFDQTtFQUdBO0VBQ0E7RUFDT0Msd0JBQXdCLEdBQUdSLG1CQUFtQixDQUFDUyxjQUFjLENBQUMsQ0FBQzs7RUFFdEU7RUFDQTtFQUdBO0VBR0E7RUFHQTtFQUdPQyxXQUFXQSxDQUFFQyxVQUFtQyxFQUFFQyxjQUF1QyxFQUFFQyxvQkFBdUQsRUFBRUMsTUFBYyxFQUFHO0lBQzFLLElBQUksQ0FBQ0MseUJBQXlCLEdBQUcsSUFBSW5CLGVBQWUsQ0FBRSxLQUFLLEVBQUU7TUFDM0RrQixNQUFNLEVBQUVBLE1BQU0sQ0FBQ0UsWUFBWSxDQUFFLDJCQUE0QjtJQUMzRCxDQUFFLENBQUM7SUFDSCxJQUFJLENBQUNDLDJCQUEyQixHQUFHLElBQUlwQixRQUFRLENBQWtCLElBQUksRUFBRTtNQUNyRWlCLE1BQU0sRUFBRUEsTUFBTSxDQUFDRSxZQUFZLENBQUUsNkJBQThCLENBQUM7TUFDNURFLGVBQWUsRUFBRWpCLFVBQVUsQ0FBRUgsT0FBTyxDQUFDcUIsU0FBVTtJQUNqRCxDQUFFLENBQUM7SUFDSCxJQUFJLENBQUNDLHFCQUFxQixHQUFHLElBQUl4QixlQUFlLENBQUUsS0FBSyxFQUFFO01BQ3ZEa0IsTUFBTSxFQUFFQSxNQUFNLENBQUNFLFlBQVksQ0FBRSx1QkFBd0I7SUFDdkQsQ0FBRSxDQUFDO0lBRUgsSUFBSSxDQUFDSyxvQkFBb0IsR0FBRyxJQUFJaEIsb0JBQW9CLENBQUVTLE1BQU0sQ0FBQ0UsWUFBWSxDQUFFLHNCQUF1QixDQUFFLENBQUM7SUFDckcsSUFBSSxDQUFDSCxvQkFBb0IsR0FBR0Esb0JBQW9CO0lBQ2hELElBQUksQ0FBQ0YsVUFBVSxHQUFHQSxVQUFVO0lBQzVCLElBQUksQ0FBQ0MsY0FBYyxHQUFHQSxjQUFjOztJQUVwQztJQUNBO0lBQ0E7SUFDQVUsTUFBTSxDQUFDQyx1QkFBdUIsR0FBRyxJQUFJO0VBQ3ZDOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ1NDLHNCQUFzQkEsQ0FBRUMsU0FBaUIsRUFBRUMsV0FBbUIsRUFBRUMsWUFBb0IsRUFBRUMsVUFBa0IsRUFBUztJQUV0SDtJQUNBLE1BQU1DLFNBQVMsR0FBR0MsQ0FBQyxDQUFDQyxHQUFHLENBQUUsQ0FBRU4sU0FBUyxFQUFFQyxXQUFXLEVBQUVDLFlBQVksRUFBRUMsVUFBVSxDQUFHLENBQUU7SUFDaEYsSUFBSSxDQUFDWCwyQkFBMkIsQ0FBQ2UsS0FBSyxHQUFHLElBQUlsQyxPQUFPLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRStCLFNBQVMsRUFBRUEsU0FBVSxDQUFDO0VBQ3BGOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDU0ksNkJBQTZCQSxDQUFFQyxLQUFhLEVBQUVDLE1BQWMsRUFBUztJQUMxRSxJQUFJLENBQUMzQix3QkFBd0IsR0FBR1IsbUJBQW1CLENBQUNvQyw2QkFBNkIsQ0FDL0UsSUFBSXJDLE9BQU8sQ0FBRW1DLEtBQUssR0FBRyxDQUFDLEVBQUVDLE1BQU0sR0FBRyxDQUFFLENBQUM7SUFBRTtJQUN0QyxJQUFJcEMsT0FBTyxDQUFFLENBQUMsRUFBRSxDQUFFLENBQUM7SUFBRTtJQUNyQkksc0JBQXNCLENBQUNrQyxZQUFZLENBQUNGLE1BQU0sR0FBS0EsTUFBUSxDQUFDO0lBQzFELENBQUM7RUFDSDs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtFQUNTRyx5QkFBeUJBLENBQUVDLGtCQUFvRCxFQUFZO0lBQ2hHLElBQUlDLE9BQU8sR0FBRyxJQUFJO0lBRWxCLE1BQU1DLGVBQWUsR0FBR0Ysa0JBQWtCLENBQUNHLEdBQUcsQ0FBRXBDLHdCQUF3QixDQUFDcUMsUUFBUyxDQUFDO0lBQ25GLE1BQU1DLGVBQWUsR0FBR0wsa0JBQWtCLENBQUNHLEdBQUcsQ0FBRXBDLHdCQUF3QixDQUFDdUMsUUFBUyxDQUFDO0lBQ25GLE1BQU1DLGVBQWUsR0FBR1Asa0JBQWtCLENBQUNHLEdBQUcsQ0FBRXBDLHdCQUF3QixDQUFDeUMsUUFBUyxDQUFDO0lBQ25GLE1BQU1DLGVBQWUsR0FBR1Qsa0JBQWtCLENBQUNHLEdBQUcsQ0FBRXBDLHdCQUF3QixDQUFDMkMsUUFBUyxDQUFDOztJQUVuRjtJQUNBVCxPQUFPLEdBQUcsQ0FBQyxDQUFDQyxlQUFnQixJQUFJLENBQUMsQ0FBQ0csZUFBZ0IsSUFBSSxDQUFDLENBQUNFLGVBQWdCLElBQUksQ0FBQyxDQUFDRSxlQUFnQjtJQUU5RixJQUFLUixPQUFPLEVBQUc7TUFDYixJQUFJLENBQUM1QixjQUFjLENBQUNzQyxrQkFBa0IsQ0FBRVgsa0JBQW1CLENBQUM7TUFDNURDLE9BQU8sR0FBR3BDLHVCQUF1QixDQUFDK0MsMkJBQTJCLENBQUUsSUFBSSxDQUFDdkMsY0FBZSxDQUFDO0lBQ3RGO0lBRUEsT0FBTzRCLE9BQU87RUFDaEI7QUFDRjtBQUVBdEMsYUFBYSxDQUFDa0QsUUFBUSxDQUFFLHlCQUF5QixFQUFFN0MsdUJBQXdCLENBQUMifQ==