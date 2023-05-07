// Copyright 2019-2022, University of Colorado Boulder

/**
 * An adjustable Ellipsoid
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Property from '../../../../axon/js/Property.js';
import Bounds3 from '../../../../dot/js/Bounds3.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector3 from '../../../../dot/js/Vector3.js';
import { Shape } from '../../../../kite/js/imports.js';
import optionize from '../../../../phet-core/js/optionize.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import densityBuoyancyCommon from '../../densityBuoyancyCommon.js';
import Mass, { MASS_MAX_SHAPES_DIMENSION, MASS_MIN_SHAPES_DIMENSION } from './Mass.js';
import { MassShape } from './MassShape.js';
export default class Ellipsoid extends Mass {
  // Step information

  constructor(engine, size, providedConfig) {
    const config = optionize()({
      body: engine.createFromVertices(Ellipsoid.getEllipsoidVertices(size.width, size.height), false),
      shape: Ellipsoid.getEllipsoidShape(size.width, size.height),
      volume: Ellipsoid.getVolume(size),
      massShape: MassShape.ELLIPSOID,
      phetioType: Ellipsoid.EllipsoidIO
    }, providedConfig);
    assert && assert(!config.canRotate);
    super(engine, config);
    this.sizeProperty = new Property(size, {
      valueType: Bounds3,
      tandem: config.tandem.createTandem('sizeProperty'),
      phetioValueType: Bounds3.Bounds3IO
    });
    this.stepMaximumArea = 0;
    this.stepMaximumVolume = 0;
    this.updateSize(size);
  }

  /**
   * Updates the size of the ellipsoid.
   */
  updateSize(size) {
    this.engine.updateFromVertices(this.body, Ellipsoid.getEllipsoidVertices(size.width, size.height), false);
    this.sizeProperty.value = size;
    this.shapeProperty.value = Ellipsoid.getEllipsoidShape(size.width, size.height);
    this.volumeLock = true;
    this.volumeProperty.value = Ellipsoid.getVolume(size);
    this.volumeLock = false;
    this.forceOffsetProperty.value = new Vector3(0, 0, size.maxZ);
    this.massOffsetProperty.value = new Vector3(0, size.minY * 0.5, size.maxZ * 0.7);
  }

  /**
   * Returns the general size of the mass based on a general size scale.
   */
  static getSizeFromRatios(widthRatio, heightRatio) {
    const x = (MASS_MIN_SHAPES_DIMENSION + widthRatio * (MASS_MAX_SHAPES_DIMENSION - MASS_MIN_SHAPES_DIMENSION)) / 2;
    const y = (MASS_MIN_SHAPES_DIMENSION + heightRatio * (MASS_MAX_SHAPES_DIMENSION - MASS_MIN_SHAPES_DIMENSION)) / 2;
    return new Bounds3(-x, -y, -x, x, y, x);
  }

  /**
   * Sets the general size of the mass based on a general size scale.
   */
  setRatios(widthRatio, heightRatio) {
    this.updateSize(Ellipsoid.getSizeFromRatios(widthRatio, heightRatio));
  }

  /**
   * Called after a engine-physics-model step once before doing other operations (like computing buoyant forces,
   * displacement, etc.) so that it can set high-performance flags used for this purpose.
   *
   * Type-specific values are likely to be set, but this should set at least stepX/stepBottom/stepTop
   */
  updateStepInformation() {
    super.updateStepInformation();
    const xOffset = this.stepMatrix.m02();
    const yOffset = this.stepMatrix.m12();
    this.stepX = xOffset;
    this.stepBottom = yOffset + this.sizeProperty.value.minY;
    this.stepTop = yOffset + this.sizeProperty.value.maxY;
    const a = this.sizeProperty.value.width / 2;
    const b = this.sizeProperty.value.height / 2;
    const c = this.sizeProperty.value.depth / 2;
    this.stepMaximumArea = 4 * Math.PI * a * c; // 4 * pi * a * c
    this.stepMaximumVolume = this.stepMaximumArea * b / 3; // 4/3 * pi * a * b * c
  }

  /**
   * If there is an intersection with the ray and this mass, the t-value (distance the ray would need to travel to
   * reach the intersection, e.g. ray.position + ray.distance * t === intersectionPoint) will be returned. Otherwise
   * if there is no intersection, null will be returned.
   */
  intersect(ray, isTouch) {
    const translation = this.matrix.getTranslation().toVector3();
    const size = this.sizeProperty.value;
    const relativePosition = ray.position.minusXYZ(translation.x, translation.y, translation.z);
    const xp = 4 / (size.width * size.width);
    const yp = 4 / (size.height * size.height);
    const zp = 4 / (size.depth * size.depth);
    const a = xp * ray.direction.x * ray.direction.x + yp * ray.direction.y * ray.direction.y + zp * ray.direction.z * ray.direction.z;
    const b = 2 * (xp * relativePosition.x * ray.direction.x + yp * relativePosition.y * ray.direction.y + zp * relativePosition.z * ray.direction.z);
    const c = -1 + xp * relativePosition.x * relativePosition.x + yp * relativePosition.y * relativePosition.y + zp * relativePosition.z * relativePosition.z;
    const tValues = Utils.solveQuadraticRootsReal(a, b, c).filter(t => t > 0);
    if (tValues.length) {
      return tValues[0];
    } else {
      return null;
    }
  }

  /**
   * Returns the cumulative displaced volume of this object up to a given y level.
   *
   * Assumes step information was updated.
   */
  getDisplacedArea(liquidLevel) {
    if (liquidLevel < this.stepBottom || liquidLevel > this.stepTop) {
      return 0;
    } else {
      const ratio = (liquidLevel - this.stepBottom) / (this.stepTop - this.stepBottom);
      return this.stepMaximumArea * (ratio - ratio * ratio); // 4 * pi * a * c * ( t - t^2 )
    }
  }

  /**
   * Returns the displaced volume of this object up to a given y level, assuming a y value for the given liquid level.
   *
   * Assumes step information was updated.
   */
  getDisplacedVolume(liquidLevel) {
    if (liquidLevel <= this.stepBottom) {
      return 0;
    } else if (liquidLevel >= this.stepTop) {
      return this.stepMaximumVolume;
    } else {
      const ratio = (liquidLevel - this.stepBottom) / (this.stepTop - this.stepBottom);
      return this.stepMaximumVolume * ratio * ratio * (3 - 2 * ratio); // 4/3 * pi * a * b * c * t^2 * ( 3 - 2t )
    }
  }

  /**
   * Resets things to their original values.
   */
  reset() {
    this.sizeProperty.reset();
    this.updateSize(this.sizeProperty.value);
    super.reset();
  }

  /**
   * Releases references
   */
  dispose() {
    this.sizeProperty.dispose();
    super.dispose();
  }

  /**
   * Returns an ellipsoid shape
   */
  static getEllipsoidShape(width, height) {
    return Shape.ellipse(0, 0, width / 2, height / 2, 0);
  }

  /**
   * Returns vertices for an ellipsoid
   */
  static getEllipsoidVertices(width, height) {
    const segments = 80;
    const vertices = [];
    for (let i = 0; i < segments; i++) {
      const theta = i / segments * 2 * Math.PI;
      vertices.push(new Vector2(Math.cos(theta) * width / 2, Math.sin(theta) * height / 2));
    }
    return vertices;
  }

  /**
   * Returns the volume of an ellipsoid with the given axis-aligned bounding box.
   */
  static getVolume(size) {
    return Math.PI * size.width * size.height * size.depth / 6;
  }
  static EllipsoidIO = new IOType('EllipsoidIO', {
    valueType: Ellipsoid,
    supertype: Mass.MassIO,
    documentation: 'Represents an ellipsoid'
  });
}
densityBuoyancyCommon.register('Ellipsoid', Ellipsoid);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm9wZXJ0eSIsIkJvdW5kczMiLCJVdGlscyIsIlZlY3RvcjIiLCJWZWN0b3IzIiwiU2hhcGUiLCJvcHRpb25pemUiLCJJT1R5cGUiLCJkZW5zaXR5QnVveWFuY3lDb21tb24iLCJNYXNzIiwiTUFTU19NQVhfU0hBUEVTX0RJTUVOU0lPTiIsIk1BU1NfTUlOX1NIQVBFU19ESU1FTlNJT04iLCJNYXNzU2hhcGUiLCJFbGxpcHNvaWQiLCJjb25zdHJ1Y3RvciIsImVuZ2luZSIsInNpemUiLCJwcm92aWRlZENvbmZpZyIsImNvbmZpZyIsImJvZHkiLCJjcmVhdGVGcm9tVmVydGljZXMiLCJnZXRFbGxpcHNvaWRWZXJ0aWNlcyIsIndpZHRoIiwiaGVpZ2h0Iiwic2hhcGUiLCJnZXRFbGxpcHNvaWRTaGFwZSIsInZvbHVtZSIsImdldFZvbHVtZSIsIm1hc3NTaGFwZSIsIkVMTElQU09JRCIsInBoZXRpb1R5cGUiLCJFbGxpcHNvaWRJTyIsImFzc2VydCIsImNhblJvdGF0ZSIsInNpemVQcm9wZXJ0eSIsInZhbHVlVHlwZSIsInRhbmRlbSIsImNyZWF0ZVRhbmRlbSIsInBoZXRpb1ZhbHVlVHlwZSIsIkJvdW5kczNJTyIsInN0ZXBNYXhpbXVtQXJlYSIsInN0ZXBNYXhpbXVtVm9sdW1lIiwidXBkYXRlU2l6ZSIsInVwZGF0ZUZyb21WZXJ0aWNlcyIsInZhbHVlIiwic2hhcGVQcm9wZXJ0eSIsInZvbHVtZUxvY2siLCJ2b2x1bWVQcm9wZXJ0eSIsImZvcmNlT2Zmc2V0UHJvcGVydHkiLCJtYXhaIiwibWFzc09mZnNldFByb3BlcnR5IiwibWluWSIsImdldFNpemVGcm9tUmF0aW9zIiwid2lkdGhSYXRpbyIsImhlaWdodFJhdGlvIiwieCIsInkiLCJzZXRSYXRpb3MiLCJ1cGRhdGVTdGVwSW5mb3JtYXRpb24iLCJ4T2Zmc2V0Iiwic3RlcE1hdHJpeCIsIm0wMiIsInlPZmZzZXQiLCJtMTIiLCJzdGVwWCIsInN0ZXBCb3R0b20iLCJzdGVwVG9wIiwibWF4WSIsImEiLCJiIiwiYyIsImRlcHRoIiwiTWF0aCIsIlBJIiwiaW50ZXJzZWN0IiwicmF5IiwiaXNUb3VjaCIsInRyYW5zbGF0aW9uIiwibWF0cml4IiwiZ2V0VHJhbnNsYXRpb24iLCJ0b1ZlY3RvcjMiLCJyZWxhdGl2ZVBvc2l0aW9uIiwicG9zaXRpb24iLCJtaW51c1hZWiIsInoiLCJ4cCIsInlwIiwienAiLCJkaXJlY3Rpb24iLCJ0VmFsdWVzIiwic29sdmVRdWFkcmF0aWNSb290c1JlYWwiLCJmaWx0ZXIiLCJ0IiwibGVuZ3RoIiwiZ2V0RGlzcGxhY2VkQXJlYSIsImxpcXVpZExldmVsIiwicmF0aW8iLCJnZXREaXNwbGFjZWRWb2x1bWUiLCJyZXNldCIsImRpc3Bvc2UiLCJlbGxpcHNlIiwic2VnbWVudHMiLCJ2ZXJ0aWNlcyIsImkiLCJ0aGV0YSIsInB1c2giLCJjb3MiLCJzaW4iLCJzdXBlcnR5cGUiLCJNYXNzSU8iLCJkb2N1bWVudGF0aW9uIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJFbGxpcHNvaWQudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTktMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQW4gYWRqdXN0YWJsZSBFbGxpcHNvaWRcclxuICpcclxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxyXG4gKi9cclxuXHJcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IFN0cmljdE9taXQgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1N0cmljdE9taXQuanMnO1xyXG5pbXBvcnQgQm91bmRzMyBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvQm91bmRzMy5qcyc7XHJcbmltcG9ydCBSYXkzIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9SYXkzLmpzJztcclxuaW1wb3J0IFV0aWxzIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9VdGlscy5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IFZlY3RvcjMgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjMuanMnO1xyXG5pbXBvcnQgeyBTaGFwZSB9IGZyb20gJy4uLy4uLy4uLy4uL2tpdGUvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBvcHRpb25pemUsIHsgRW1wdHlTZWxmT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgSU9UeXBlIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy90eXBlcy9JT1R5cGUuanMnO1xyXG5pbXBvcnQgZGVuc2l0eUJ1b3lhbmN5Q29tbW9uIGZyb20gJy4uLy4uL2RlbnNpdHlCdW95YW5jeUNvbW1vbi5qcyc7XHJcbmltcG9ydCBNYXNzLCB7IEluc3RydW1lbnRlZE1hc3NPcHRpb25zLCBNQVNTX01BWF9TSEFQRVNfRElNRU5TSU9OLCBNQVNTX01JTl9TSEFQRVNfRElNRU5TSU9OIH0gZnJvbSAnLi9NYXNzLmpzJztcclxuaW1wb3J0IFBoeXNpY3NFbmdpbmUgZnJvbSAnLi9QaHlzaWNzRW5naW5lLmpzJztcclxuaW1wb3J0IHsgTWFzc1NoYXBlIH0gZnJvbSAnLi9NYXNzU2hhcGUuanMnO1xyXG5cclxuZXhwb3J0IHR5cGUgRWxsaXBzb2lkT3B0aW9ucyA9IFN0cmljdE9taXQ8SW5zdHJ1bWVudGVkTWFzc09wdGlvbnMsICdib2R5JyB8ICdzaGFwZScgfCAndm9sdW1lJyB8ICdtYXNzU2hhcGUnPjtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEVsbGlwc29pZCBleHRlbmRzIE1hc3Mge1xyXG5cclxuICBwdWJsaWMgcmVhZG9ubHkgc2l6ZVByb3BlcnR5OiBQcm9wZXJ0eTxCb3VuZHMzPjtcclxuXHJcbiAgLy8gU3RlcCBpbmZvcm1hdGlvblxyXG4gIHB1YmxpYyBzdGVwTWF4aW11bUFyZWE6IG51bWJlcjtcclxuICBwdWJsaWMgc3RlcE1heGltdW1Wb2x1bWU6IG51bWJlcjtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBlbmdpbmU6IFBoeXNpY3NFbmdpbmUsIHNpemU6IEJvdW5kczMsIHByb3ZpZGVkQ29uZmlnOiBFbGxpcHNvaWRPcHRpb25zICkge1xyXG4gICAgY29uc3QgY29uZmlnID0gb3B0aW9uaXplPEVsbGlwc29pZE9wdGlvbnMsIEVtcHR5U2VsZk9wdGlvbnMsIEluc3RydW1lbnRlZE1hc3NPcHRpb25zPigpKCB7XHJcbiAgICAgIGJvZHk6IGVuZ2luZS5jcmVhdGVGcm9tVmVydGljZXMoIEVsbGlwc29pZC5nZXRFbGxpcHNvaWRWZXJ0aWNlcyggc2l6ZS53aWR0aCwgc2l6ZS5oZWlnaHQgKSwgZmFsc2UgKSxcclxuICAgICAgc2hhcGU6IEVsbGlwc29pZC5nZXRFbGxpcHNvaWRTaGFwZSggc2l6ZS53aWR0aCwgc2l6ZS5oZWlnaHQgKSxcclxuICAgICAgdm9sdW1lOiBFbGxpcHNvaWQuZ2V0Vm9sdW1lKCBzaXplICksXHJcbiAgICAgIG1hc3NTaGFwZTogTWFzc1NoYXBlLkVMTElQU09JRCxcclxuXHJcbiAgICAgIHBoZXRpb1R5cGU6IEVsbGlwc29pZC5FbGxpcHNvaWRJT1xyXG4gICAgfSwgcHJvdmlkZWRDb25maWcgKTtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhY29uZmlnLmNhblJvdGF0ZSApO1xyXG5cclxuICAgIHN1cGVyKCBlbmdpbmUsIGNvbmZpZyBhcyBJbnN0cnVtZW50ZWRNYXNzT3B0aW9ucyApO1xyXG5cclxuICAgIHRoaXMuc2l6ZVByb3BlcnR5ID0gbmV3IFByb3BlcnR5KCBzaXplLCB7XHJcbiAgICAgIHZhbHVlVHlwZTogQm91bmRzMyxcclxuICAgICAgdGFuZGVtOiBjb25maWcudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3NpemVQcm9wZXJ0eScgKSxcclxuICAgICAgcGhldGlvVmFsdWVUeXBlOiBCb3VuZHMzLkJvdW5kczNJT1xyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMuc3RlcE1heGltdW1BcmVhID0gMDtcclxuICAgIHRoaXMuc3RlcE1heGltdW1Wb2x1bWUgPSAwO1xyXG5cclxuICAgIHRoaXMudXBkYXRlU2l6ZSggc2l6ZSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVXBkYXRlcyB0aGUgc2l6ZSBvZiB0aGUgZWxsaXBzb2lkLlxyXG4gICAqL1xyXG4gIHB1YmxpYyB1cGRhdGVTaXplKCBzaXplOiBCb3VuZHMzICk6IHZvaWQge1xyXG4gICAgdGhpcy5lbmdpbmUudXBkYXRlRnJvbVZlcnRpY2VzKCB0aGlzLmJvZHksIEVsbGlwc29pZC5nZXRFbGxpcHNvaWRWZXJ0aWNlcyggc2l6ZS53aWR0aCwgc2l6ZS5oZWlnaHQgKSwgZmFsc2UgKTtcclxuICAgIHRoaXMuc2l6ZVByb3BlcnR5LnZhbHVlID0gc2l6ZTtcclxuICAgIHRoaXMuc2hhcGVQcm9wZXJ0eS52YWx1ZSA9IEVsbGlwc29pZC5nZXRFbGxpcHNvaWRTaGFwZSggc2l6ZS53aWR0aCwgc2l6ZS5oZWlnaHQgKTtcclxuXHJcbiAgICB0aGlzLnZvbHVtZUxvY2sgPSB0cnVlO1xyXG4gICAgdGhpcy52b2x1bWVQcm9wZXJ0eS52YWx1ZSA9IEVsbGlwc29pZC5nZXRWb2x1bWUoIHNpemUgKTtcclxuICAgIHRoaXMudm9sdW1lTG9jayA9IGZhbHNlO1xyXG5cclxuICAgIHRoaXMuZm9yY2VPZmZzZXRQcm9wZXJ0eS52YWx1ZSA9IG5ldyBWZWN0b3IzKCAwLCAwLCBzaXplLm1heFogKTtcclxuICAgIHRoaXMubWFzc09mZnNldFByb3BlcnR5LnZhbHVlID0gbmV3IFZlY3RvcjMoIDAsIHNpemUubWluWSAqIDAuNSwgc2l6ZS5tYXhaICogMC43ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBnZW5lcmFsIHNpemUgb2YgdGhlIG1hc3MgYmFzZWQgb24gYSBnZW5lcmFsIHNpemUgc2NhbGUuXHJcbiAgICovXHJcbiAgcHVibGljIHN0YXRpYyBnZXRTaXplRnJvbVJhdGlvcyggd2lkdGhSYXRpbzogbnVtYmVyLCBoZWlnaHRSYXRpbzogbnVtYmVyICk6IEJvdW5kczMge1xyXG4gICAgY29uc3QgeCA9ICggTUFTU19NSU5fU0hBUEVTX0RJTUVOU0lPTiArIHdpZHRoUmF0aW8gKiAoIE1BU1NfTUFYX1NIQVBFU19ESU1FTlNJT04gLSBNQVNTX01JTl9TSEFQRVNfRElNRU5TSU9OICkgKSAvIDI7XHJcbiAgICBjb25zdCB5ID0gKCBNQVNTX01JTl9TSEFQRVNfRElNRU5TSU9OICsgaGVpZ2h0UmF0aW8gKiAoIE1BU1NfTUFYX1NIQVBFU19ESU1FTlNJT04gLSBNQVNTX01JTl9TSEFQRVNfRElNRU5TSU9OICkgKSAvIDI7XHJcbiAgICByZXR1cm4gbmV3IEJvdW5kczMoIC14LCAteSwgLXgsIHgsIHksIHggKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldHMgdGhlIGdlbmVyYWwgc2l6ZSBvZiB0aGUgbWFzcyBiYXNlZCBvbiBhIGdlbmVyYWwgc2l6ZSBzY2FsZS5cclxuICAgKi9cclxuICBwdWJsaWMgc2V0UmF0aW9zKCB3aWR0aFJhdGlvOiBudW1iZXIsIGhlaWdodFJhdGlvOiBudW1iZXIgKTogdm9pZCB7XHJcbiAgICB0aGlzLnVwZGF0ZVNpemUoIEVsbGlwc29pZC5nZXRTaXplRnJvbVJhdGlvcyggd2lkdGhSYXRpbywgaGVpZ2h0UmF0aW8gKSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ2FsbGVkIGFmdGVyIGEgZW5naW5lLXBoeXNpY3MtbW9kZWwgc3RlcCBvbmNlIGJlZm9yZSBkb2luZyBvdGhlciBvcGVyYXRpb25zIChsaWtlIGNvbXB1dGluZyBidW95YW50IGZvcmNlcyxcclxuICAgKiBkaXNwbGFjZW1lbnQsIGV0Yy4pIHNvIHRoYXQgaXQgY2FuIHNldCBoaWdoLXBlcmZvcm1hbmNlIGZsYWdzIHVzZWQgZm9yIHRoaXMgcHVycG9zZS5cclxuICAgKlxyXG4gICAqIFR5cGUtc3BlY2lmaWMgdmFsdWVzIGFyZSBsaWtlbHkgdG8gYmUgc2V0LCBidXQgdGhpcyBzaG91bGQgc2V0IGF0IGxlYXN0IHN0ZXBYL3N0ZXBCb3R0b20vc3RlcFRvcFxyXG4gICAqL1xyXG4gIHB1YmxpYyBvdmVycmlkZSB1cGRhdGVTdGVwSW5mb3JtYXRpb24oKTogdm9pZCB7XHJcbiAgICBzdXBlci51cGRhdGVTdGVwSW5mb3JtYXRpb24oKTtcclxuXHJcbiAgICBjb25zdCB4T2Zmc2V0ID0gdGhpcy5zdGVwTWF0cml4Lm0wMigpO1xyXG4gICAgY29uc3QgeU9mZnNldCA9IHRoaXMuc3RlcE1hdHJpeC5tMTIoKTtcclxuXHJcbiAgICB0aGlzLnN0ZXBYID0geE9mZnNldDtcclxuICAgIHRoaXMuc3RlcEJvdHRvbSA9IHlPZmZzZXQgKyB0aGlzLnNpemVQcm9wZXJ0eS52YWx1ZS5taW5ZO1xyXG4gICAgdGhpcy5zdGVwVG9wID0geU9mZnNldCArIHRoaXMuc2l6ZVByb3BlcnR5LnZhbHVlLm1heFk7XHJcblxyXG4gICAgY29uc3QgYSA9IHRoaXMuc2l6ZVByb3BlcnR5LnZhbHVlLndpZHRoIC8gMjtcclxuICAgIGNvbnN0IGIgPSB0aGlzLnNpemVQcm9wZXJ0eS52YWx1ZS5oZWlnaHQgLyAyO1xyXG4gICAgY29uc3QgYyA9IHRoaXMuc2l6ZVByb3BlcnR5LnZhbHVlLmRlcHRoIC8gMjtcclxuICAgIHRoaXMuc3RlcE1heGltdW1BcmVhID0gNCAqIE1hdGguUEkgKiBhICogYzsgLy8gNCAqIHBpICogYSAqIGNcclxuICAgIHRoaXMuc3RlcE1heGltdW1Wb2x1bWUgPSB0aGlzLnN0ZXBNYXhpbXVtQXJlYSAqIGIgLyAzOyAvLyA0LzMgKiBwaSAqIGEgKiBiICogY1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogSWYgdGhlcmUgaXMgYW4gaW50ZXJzZWN0aW9uIHdpdGggdGhlIHJheSBhbmQgdGhpcyBtYXNzLCB0aGUgdC12YWx1ZSAoZGlzdGFuY2UgdGhlIHJheSB3b3VsZCBuZWVkIHRvIHRyYXZlbCB0b1xyXG4gICAqIHJlYWNoIHRoZSBpbnRlcnNlY3Rpb24sIGUuZy4gcmF5LnBvc2l0aW9uICsgcmF5LmRpc3RhbmNlICogdCA9PT0gaW50ZXJzZWN0aW9uUG9pbnQpIHdpbGwgYmUgcmV0dXJuZWQuIE90aGVyd2lzZVxyXG4gICAqIGlmIHRoZXJlIGlzIG5vIGludGVyc2VjdGlvbiwgbnVsbCB3aWxsIGJlIHJldHVybmVkLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBvdmVycmlkZSBpbnRlcnNlY3QoIHJheTogUmF5MywgaXNUb3VjaDogYm9vbGVhbiApOiBudW1iZXIgfCBudWxsIHtcclxuICAgIGNvbnN0IHRyYW5zbGF0aW9uID0gdGhpcy5tYXRyaXguZ2V0VHJhbnNsYXRpb24oKS50b1ZlY3RvcjMoKTtcclxuICAgIGNvbnN0IHNpemUgPSB0aGlzLnNpemVQcm9wZXJ0eS52YWx1ZTtcclxuICAgIGNvbnN0IHJlbGF0aXZlUG9zaXRpb24gPSByYXkucG9zaXRpb24ubWludXNYWVooIHRyYW5zbGF0aW9uLngsIHRyYW5zbGF0aW9uLnksIHRyYW5zbGF0aW9uLnogKTtcclxuXHJcbiAgICBjb25zdCB4cCA9IDQgLyAoIHNpemUud2lkdGggKiBzaXplLndpZHRoICk7XHJcbiAgICBjb25zdCB5cCA9IDQgLyAoIHNpemUuaGVpZ2h0ICogc2l6ZS5oZWlnaHQgKTtcclxuICAgIGNvbnN0IHpwID0gNCAvICggc2l6ZS5kZXB0aCAqIHNpemUuZGVwdGggKTtcclxuXHJcbiAgICBjb25zdCBhID0geHAgKiByYXkuZGlyZWN0aW9uLnggKiByYXkuZGlyZWN0aW9uLnggKyB5cCAqIHJheS5kaXJlY3Rpb24ueSAqIHJheS5kaXJlY3Rpb24ueSArIHpwICogcmF5LmRpcmVjdGlvbi56ICogcmF5LmRpcmVjdGlvbi56O1xyXG4gICAgY29uc3QgYiA9IDIgKiAoIHhwICogcmVsYXRpdmVQb3NpdGlvbi54ICogcmF5LmRpcmVjdGlvbi54ICsgeXAgKiByZWxhdGl2ZVBvc2l0aW9uLnkgKiByYXkuZGlyZWN0aW9uLnkgKyB6cCAqIHJlbGF0aXZlUG9zaXRpb24ueiAqIHJheS5kaXJlY3Rpb24ueiApO1xyXG4gICAgY29uc3QgYyA9IC0xICsgeHAgKiByZWxhdGl2ZVBvc2l0aW9uLnggKiByZWxhdGl2ZVBvc2l0aW9uLnggKyB5cCAqIHJlbGF0aXZlUG9zaXRpb24ueSAqIHJlbGF0aXZlUG9zaXRpb24ueSArIHpwICogcmVsYXRpdmVQb3NpdGlvbi56ICogcmVsYXRpdmVQb3NpdGlvbi56O1xyXG5cclxuICAgIGNvbnN0IHRWYWx1ZXMgPSBVdGlscy5zb2x2ZVF1YWRyYXRpY1Jvb3RzUmVhbCggYSwgYiwgYyApIS5maWx0ZXIoIHQgPT4gdCA+IDAgKTtcclxuXHJcbiAgICBpZiAoIHRWYWx1ZXMubGVuZ3RoICkge1xyXG4gICAgICByZXR1cm4gdFZhbHVlc1sgMCBdO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgY3VtdWxhdGl2ZSBkaXNwbGFjZWQgdm9sdW1lIG9mIHRoaXMgb2JqZWN0IHVwIHRvIGEgZ2l2ZW4geSBsZXZlbC5cclxuICAgKlxyXG4gICAqIEFzc3VtZXMgc3RlcCBpbmZvcm1hdGlvbiB3YXMgdXBkYXRlZC5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0RGlzcGxhY2VkQXJlYSggbGlxdWlkTGV2ZWw6IG51bWJlciApOiBudW1iZXIge1xyXG4gICAgaWYgKCBsaXF1aWRMZXZlbCA8IHRoaXMuc3RlcEJvdHRvbSB8fCBsaXF1aWRMZXZlbCA+IHRoaXMuc3RlcFRvcCApIHtcclxuICAgICAgcmV0dXJuIDA7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgY29uc3QgcmF0aW8gPSAoIGxpcXVpZExldmVsIC0gdGhpcy5zdGVwQm90dG9tICkgLyAoIHRoaXMuc3RlcFRvcCAtIHRoaXMuc3RlcEJvdHRvbSApO1xyXG5cclxuICAgICAgcmV0dXJuIHRoaXMuc3RlcE1heGltdW1BcmVhICogKCByYXRpbyAtIHJhdGlvICogcmF0aW8gKTsgLy8gNCAqIHBpICogYSAqIGMgKiAoIHQgLSB0XjIgKVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0aGUgZGlzcGxhY2VkIHZvbHVtZSBvZiB0aGlzIG9iamVjdCB1cCB0byBhIGdpdmVuIHkgbGV2ZWwsIGFzc3VtaW5nIGEgeSB2YWx1ZSBmb3IgdGhlIGdpdmVuIGxpcXVpZCBsZXZlbC5cclxuICAgKlxyXG4gICAqIEFzc3VtZXMgc3RlcCBpbmZvcm1hdGlvbiB3YXMgdXBkYXRlZC5cclxuICAgKi9cclxuICBwdWJsaWMgZ2V0RGlzcGxhY2VkVm9sdW1lKCBsaXF1aWRMZXZlbDogbnVtYmVyICk6IG51bWJlciB7XHJcbiAgICBpZiAoIGxpcXVpZExldmVsIDw9IHRoaXMuc3RlcEJvdHRvbSApIHtcclxuICAgICAgcmV0dXJuIDA7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggbGlxdWlkTGV2ZWwgPj0gdGhpcy5zdGVwVG9wICkge1xyXG4gICAgICByZXR1cm4gdGhpcy5zdGVwTWF4aW11bVZvbHVtZTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICBjb25zdCByYXRpbyA9ICggbGlxdWlkTGV2ZWwgLSB0aGlzLnN0ZXBCb3R0b20gKSAvICggdGhpcy5zdGVwVG9wIC0gdGhpcy5zdGVwQm90dG9tICk7XHJcblxyXG4gICAgICByZXR1cm4gdGhpcy5zdGVwTWF4aW11bVZvbHVtZSAqIHJhdGlvICogcmF0aW8gKiAoIDMgLSAyICogcmF0aW8gKTsgLy8gNC8zICogcGkgKiBhICogYiAqIGMgKiB0XjIgKiAoIDMgLSAydCApXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXNldHMgdGhpbmdzIHRvIHRoZWlyIG9yaWdpbmFsIHZhbHVlcy5cclxuICAgKi9cclxuICBwdWJsaWMgb3ZlcnJpZGUgcmVzZXQoKTogdm9pZCB7XHJcbiAgICB0aGlzLnNpemVQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy51cGRhdGVTaXplKCB0aGlzLnNpemVQcm9wZXJ0eS52YWx1ZSApO1xyXG5cclxuICAgIHN1cGVyLnJlc2V0KCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZWxlYXNlcyByZWZlcmVuY2VzXHJcbiAgICovXHJcbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XHJcbiAgICB0aGlzLnNpemVQcm9wZXJ0eS5kaXNwb3NlKCk7XHJcblxyXG4gICAgc3VwZXIuZGlzcG9zZSgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyBhbiBlbGxpcHNvaWQgc2hhcGVcclxuICAgKi9cclxuICBwdWJsaWMgc3RhdGljIGdldEVsbGlwc29pZFNoYXBlKCB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlciApOiBTaGFwZSB7XHJcbiAgICByZXR1cm4gU2hhcGUuZWxsaXBzZSggMCwgMCwgd2lkdGggLyAyLCBoZWlnaHQgLyAyLCAwICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHZlcnRpY2VzIGZvciBhbiBlbGxpcHNvaWRcclxuICAgKi9cclxuICBwdWJsaWMgc3RhdGljIGdldEVsbGlwc29pZFZlcnRpY2VzKCB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlciApOiBWZWN0b3IyW10ge1xyXG4gICAgY29uc3Qgc2VnbWVudHMgPSA4MDtcclxuICAgIGNvbnN0IHZlcnRpY2VzID0gW107XHJcbiAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCBzZWdtZW50czsgaSsrICkge1xyXG4gICAgICBjb25zdCB0aGV0YSA9IGkgLyBzZWdtZW50cyAqIDIgKiBNYXRoLlBJO1xyXG5cclxuICAgICAgdmVydGljZXMucHVzaCggbmV3IFZlY3RvcjIoIE1hdGguY29zKCB0aGV0YSApICogd2lkdGggLyAyLCBNYXRoLnNpbiggdGhldGEgKSAqIGhlaWdodCAvIDIgKSApO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB2ZXJ0aWNlcztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIHZvbHVtZSBvZiBhbiBlbGxpcHNvaWQgd2l0aCB0aGUgZ2l2ZW4gYXhpcy1hbGlnbmVkIGJvdW5kaW5nIGJveC5cclxuICAgKi9cclxuICBwdWJsaWMgc3RhdGljIGdldFZvbHVtZSggc2l6ZTogQm91bmRzMyApOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIE1hdGguUEkgKiBzaXplLndpZHRoICogc2l6ZS5oZWlnaHQgKiBzaXplLmRlcHRoIC8gNjtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBzdGF0aWMgRWxsaXBzb2lkSU8gPSBuZXcgSU9UeXBlKCAnRWxsaXBzb2lkSU8nLCB7XHJcbiAgICB2YWx1ZVR5cGU6IEVsbGlwc29pZCxcclxuICAgIHN1cGVydHlwZTogTWFzcy5NYXNzSU8sXHJcbiAgICBkb2N1bWVudGF0aW9uOiAnUmVwcmVzZW50cyBhbiBlbGxpcHNvaWQnXHJcbiAgfSApO1xyXG59XHJcblxyXG5kZW5zaXR5QnVveWFuY3lDb21tb24ucmVnaXN0ZXIoICdFbGxpcHNvaWQnLCBFbGxpcHNvaWQgKTtcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFFBQVEsTUFBTSxpQ0FBaUM7QUFFdEQsT0FBT0MsT0FBTyxNQUFNLCtCQUErQjtBQUVuRCxPQUFPQyxLQUFLLE1BQU0sNkJBQTZCO0FBQy9DLE9BQU9DLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsT0FBT0MsT0FBTyxNQUFNLCtCQUErQjtBQUNuRCxTQUFTQyxLQUFLLFFBQVEsZ0NBQWdDO0FBQ3RELE9BQU9DLFNBQVMsTUFBNEIsdUNBQXVDO0FBQ25GLE9BQU9DLE1BQU0sTUFBTSx1Q0FBdUM7QUFDMUQsT0FBT0MscUJBQXFCLE1BQU0sZ0NBQWdDO0FBQ2xFLE9BQU9DLElBQUksSUFBNkJDLHlCQUF5QixFQUFFQyx5QkFBeUIsUUFBUSxXQUFXO0FBRS9HLFNBQVNDLFNBQVMsUUFB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