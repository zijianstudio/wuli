// Copyright 2019-2022, University of Colorado Boulder

/**
 * Visual representation of a capacitor with a vacuum gap.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Jesse Greenberg (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 */

import Multilink from '../../../axon/js/Multilink.js';
import validate from '../../../axon/js/validate.js';
import Bounds2 from '../../../dot/js/Bounds2.js';
import { Shape } from '../../../kite/js/imports.js';
import merge from '../../../phet-core/js/merge.js';
import Orientation from '../../../phet-core/js/Orientation.js';
import { Node } from '../../../scenery/js/imports.js';
import sceneryPhet from '../sceneryPhet.js';
import CapacitorConstants from './CapacitorConstants.js';
import EFieldNode from './EFieldNode.js';
import PlateNode from './PlateNode.js';

// constants
const CLIP_HEIGHT = 100;
const CLIP_WIDTH = 300;
class CapacitorNode extends Node {
  /**
   * @param {ParallelCircuit} circuit
   * @param {YawPitchModelViewTransform3} modelViewTransform
   * @param {Property.<boolean>} plateChargeVisibleProperty
   * @param {Property.<boolean>} electricFieldVisibleProperty
   * @param {Object} [options]
   */
  constructor(circuit, modelViewTransform, plateChargeVisibleProperty, electricFieldVisibleProperty, options) {
    options = merge({
      orientation: Orientation.VERTICAL,
      includeChargeNode: true
    }, options);
    super();
    validate(options.orientation, {
      validValues: Orientation.enumeration.values
    });

    // @private
    this.capacitor = circuit.capacitor;
    this.modelViewTransform = modelViewTransform;

    // @private {PlateNode}
    this.topPlateNode = new PlateNode(this.capacitor, modelViewTransform, CapacitorConstants.POLARITY.POSITIVE, circuit.maxPlateCharge, options.orientation, options.includeChargeNode);
    this.bottomPlateNode = new PlateNode(this.capacitor, modelViewTransform, CapacitorConstants.POLARITY.NEGATIVE, circuit.maxPlateCharge, options.orientation, options.includeChargeNode);
    const eFieldNode = new EFieldNode(this.capacitor, modelViewTransform, circuit.maxEffectiveEField, this.getPlatesBounds());

    // rendering order
    this.addChild(this.bottomPlateNode);
    this.addChild(eFieldNode);
    this.addChild(this.topPlateNode);
    const updateGeometry = Multilink.multilink([this.capacitor.plateSizeProperty, this.capacitor.plateSeparationProperty], () => this.updateGeometry());
    const updateVisibility = visible => {
      this.topPlateNode.setChargeVisible(visible);
      this.bottomPlateNode.setChargeVisible(visible);
    };
    plateChargeVisibleProperty.link(updateVisibility);
    const updateElectricFieldVisibility = visible => eFieldNode.setVisible(visible);
    electricFieldVisibleProperty.link(updateElectricFieldVisibility);
    this.mutate(options);

    // @private
    this.disposeCapacitorNode = () => {
      updateGeometry.dispose();
      plateChargeVisibleProperty.unlink(updateVisibility);
      electricFieldVisibleProperty.unlink(updateElectricFieldVisibility);
    };
  }

  // @public
  dispose() {
    this.disposeCapacitorNode();
    super.dispose();
  }

  /**
   * Returns true if the front side contains the specified point, used for voltmeter probe hit testing.
   * @param {Vector2} globalPoint
   * @returns {boolean}
   * @public
   */
  frontSideContainsSensorPoint(globalPoint) {
    const point = this.topPlateNode.globalToParentPoint(globalPoint);
    return this.topPlateNode.containsPoint(point);
  }

  /**
   * Returns true if the back side contains the specified point, used for voltmeter probe hit testing.
   * @param {Vector2} globalPoint
   * @returns {boolean}
   * @public
   */
  backSideContainsSensorPoint(globalPoint) {
    const point = this.bottomPlateNode.globalToParentPoint(globalPoint);
    return this.bottomPlateNode.containsPoint(point);
  }

  /**
   * Returns the clipping region for the top shape, in global coordinates, used to show wires or electrons flowing in/out of the capacitor.
   * @returns {Shape}
   * @public
   */
  getTopPlateClipShapeToGlobal() {
    // Note x & y are defined for a vertical capacitor, like in Capacitor Lab: Basics
    const topNode = this.topPlateNode.topNode;
    const shape = Shape.rect(topNode.center.x - CLIP_HEIGHT, topNode.center.y - CLIP_WIDTH, CLIP_HEIGHT * 2, CLIP_WIDTH);
    return shape.transformed(topNode.getLocalToGlobalMatrix());
  }

  /**
   * Returns the clipping region for the bottom shape, in global coordinates, used to show wires or electrons flowing in/out of the capacitor.
   * @returns {Shape}
   * @public
   */
  getBottomPlateClipShapeToGlobal() {
    // Note x & y are defined for a vertical capacitor, like in Capacitor Lab: Basics
    const frontNode = this.bottomPlateNode.frontNode;
    const shape = Shape.rect(frontNode.bounds.center.x - CLIP_HEIGHT, frontNode.bounds.bottom, CLIP_HEIGHT * 2, CLIP_WIDTH);
    return shape.transformed(frontNode.getLocalToGlobalMatrix());
  }

  /**
   * Update the geometry of the capacitor plates.
   * @private
   */
  updateGeometry() {
    // geometry
    this.topPlateNode.setBoxSize(this.capacitor.plateSizeProperty.value);
    this.bottomPlateNode.setBoxSize(this.capacitor.plateSizeProperty.value);

    // layout nodes
    const x = 0;
    const z = 0;
    const topPlateY = -this.capacitor.plateSeparationProperty.value / 2 - this.capacitor.plateSizeProperty.value.height;
    this.topPlateNode.center = this.modelViewTransform.modelToViewDeltaXYZ(x, topPlateY, z);
    const bottomPlateY = this.capacitor.plateSeparationProperty.value / 2;
    this.bottomPlateNode.center = this.modelViewTransform.modelToViewDeltaXYZ(x, bottomPlateY, z);
  }

  /**
   * Get the bound of the capacitor from the plates.  Allows for bounds to be passed into the canvas node before the
   * children are added to the view.
   * @public
   *
   * @returns {Bounds2}
   */
  getPlatesBounds() {
    return new Bounds2(this.topPlateNode.left, this.topPlateNode.top, this.bottomPlateNode.right, this.bottomPlateNode.bottom);
  }
}
sceneryPhet.register('CapacitorNode', CapacitorNode);
export default CapacitorNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNdWx0aWxpbmsiLCJ2YWxpZGF0ZSIsIkJvdW5kczIiLCJTaGFwZSIsIm1lcmdlIiwiT3JpZW50YXRpb24iLCJOb2RlIiwic2NlbmVyeVBoZXQiLCJDYXBhY2l0b3JDb25zdGFudHMiLCJFRmllbGROb2RlIiwiUGxhdGVOb2RlIiwiQ0xJUF9IRUlHSFQiLCJDTElQX1dJRFRIIiwiQ2FwYWNpdG9yTm9kZSIsImNvbnN0cnVjdG9yIiwiY2lyY3VpdCIsIm1vZGVsVmlld1RyYW5zZm9ybSIsInBsYXRlQ2hhcmdlVmlzaWJsZVByb3BlcnR5IiwiZWxlY3RyaWNGaWVsZFZpc2libGVQcm9wZXJ0eSIsIm9wdGlvbnMiLCJvcmllbnRhdGlvbiIsIlZFUlRJQ0FMIiwiaW5jbHVkZUNoYXJnZU5vZGUiLCJ2YWxpZFZhbHVlcyIsImVudW1lcmF0aW9uIiwidmFsdWVzIiwiY2FwYWNpdG9yIiwidG9wUGxhdGVOb2RlIiwiUE9MQVJJVFkiLCJQT1NJVElWRSIsIm1heFBsYXRlQ2hhcmdlIiwiYm90dG9tUGxhdGVOb2RlIiwiTkVHQVRJVkUiLCJlRmllbGROb2RlIiwibWF4RWZmZWN0aXZlRUZpZWxkIiwiZ2V0UGxhdGVzQm91bmRzIiwiYWRkQ2hpbGQiLCJ1cGRhdGVHZW9tZXRyeSIsIm11bHRpbGluayIsInBsYXRlU2l6ZVByb3BlcnR5IiwicGxhdGVTZXBhcmF0aW9uUHJvcGVydHkiLCJ1cGRhdGVWaXNpYmlsaXR5IiwidmlzaWJsZSIsInNldENoYXJnZVZpc2libGUiLCJsaW5rIiwidXBkYXRlRWxlY3RyaWNGaWVsZFZpc2liaWxpdHkiLCJzZXRWaXNpYmxlIiwibXV0YXRlIiwiZGlzcG9zZUNhcGFjaXRvck5vZGUiLCJkaXNwb3NlIiwidW5saW5rIiwiZnJvbnRTaWRlQ29udGFpbnNTZW5zb3JQb2ludCIsImdsb2JhbFBvaW50IiwicG9pbnQiLCJnbG9iYWxUb1BhcmVudFBvaW50IiwiY29udGFpbnNQb2ludCIsImJhY2tTaWRlQ29udGFpbnNTZW5zb3JQb2ludCIsImdldFRvcFBsYXRlQ2xpcFNoYXBlVG9HbG9iYWwiLCJ0b3BOb2RlIiwic2hhcGUiLCJyZWN0IiwiY2VudGVyIiwieCIsInkiLCJ0cmFuc2Zvcm1lZCIsImdldExvY2FsVG9HbG9iYWxNYXRyaXgiLCJnZXRCb3R0b21QbGF0ZUNsaXBTaGFwZVRvR2xvYmFsIiwiZnJvbnROb2RlIiwiYm91bmRzIiwiYm90dG9tIiwic2V0Qm94U2l6ZSIsInZhbHVlIiwieiIsInRvcFBsYXRlWSIsImhlaWdodCIsIm1vZGVsVG9WaWV3RGVsdGFYWVoiLCJib3R0b21QbGF0ZVkiLCJsZWZ0IiwidG9wIiwicmlnaHQiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkNhcGFjaXRvck5vZGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTktMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogVmlzdWFsIHJlcHJlc2VudGF0aW9uIG9mIGEgY2FwYWNpdG9yIHdpdGggYSB2YWN1dW0gZ2FwLlxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKiBAYXV0aG9yIEplc3NlIEdyZWVuYmVyZyAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICogQGF1dGhvciBBbmRyZXcgQWRhcmUgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IE11bHRpbGluayBmcm9tICcuLi8uLi8uLi9heG9uL2pzL011bHRpbGluay5qcyc7XHJcbmltcG9ydCB2YWxpZGF0ZSBmcm9tICcuLi8uLi8uLi9heG9uL2pzL3ZhbGlkYXRlLmpzJztcclxuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi4vLi4vLi4vZG90L2pzL0JvdW5kczIuanMnO1xyXG5pbXBvcnQgeyBTaGFwZSB9IGZyb20gJy4uLy4uLy4uL2tpdGUvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xyXG5pbXBvcnQgT3JpZW50YXRpb24gZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL09yaWVudGF0aW9uLmpzJztcclxuaW1wb3J0IHsgTm9kZSB9IGZyb20gJy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBzY2VuZXJ5UGhldCBmcm9tICcuLi9zY2VuZXJ5UGhldC5qcyc7XHJcbmltcG9ydCBDYXBhY2l0b3JDb25zdGFudHMgZnJvbSAnLi9DYXBhY2l0b3JDb25zdGFudHMuanMnO1xyXG5pbXBvcnQgRUZpZWxkTm9kZSBmcm9tICcuL0VGaWVsZE5vZGUuanMnO1xyXG5pbXBvcnQgUGxhdGVOb2RlIGZyb20gJy4vUGxhdGVOb2RlLmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBDTElQX0hFSUdIVCA9IDEwMDtcclxuY29uc3QgQ0xJUF9XSURUSCA9IDMwMDtcclxuXHJcbmNsYXNzIENhcGFjaXRvck5vZGUgZXh0ZW5kcyBOb2RlIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtQYXJhbGxlbENpcmN1aXR9IGNpcmN1aXRcclxuICAgKiBAcGFyYW0ge1lhd1BpdGNoTW9kZWxWaWV3VHJhbnNmb3JtM30gbW9kZWxWaWV3VHJhbnNmb3JtXHJcbiAgICogQHBhcmFtIHtQcm9wZXJ0eS48Ym9vbGVhbj59IHBsYXRlQ2hhcmdlVmlzaWJsZVByb3BlcnR5XHJcbiAgICogQHBhcmFtIHtQcm9wZXJ0eS48Ym9vbGVhbj59IGVsZWN0cmljRmllbGRWaXNpYmxlUHJvcGVydHlcclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIGNpcmN1aXQsIG1vZGVsVmlld1RyYW5zZm9ybSwgcGxhdGVDaGFyZ2VWaXNpYmxlUHJvcGVydHksIGVsZWN0cmljRmllbGRWaXNpYmxlUHJvcGVydHksIG9wdGlvbnMgKSB7XHJcblxyXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XHJcbiAgICAgIG9yaWVudGF0aW9uOiBPcmllbnRhdGlvbi5WRVJUSUNBTCxcclxuICAgICAgaW5jbHVkZUNoYXJnZU5vZGU6IHRydWVcclxuICAgIH0sIG9wdGlvbnMgKTtcclxuICAgIHN1cGVyKCk7XHJcblxyXG4gICAgdmFsaWRhdGUoIG9wdGlvbnMub3JpZW50YXRpb24sIHsgdmFsaWRWYWx1ZXM6IE9yaWVudGF0aW9uLmVudW1lcmF0aW9uLnZhbHVlcyB9ICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGVcclxuICAgIHRoaXMuY2FwYWNpdG9yID0gY2lyY3VpdC5jYXBhY2l0b3I7XHJcbiAgICB0aGlzLm1vZGVsVmlld1RyYW5zZm9ybSA9IG1vZGVsVmlld1RyYW5zZm9ybTtcclxuXHJcbiAgICAvLyBAcHJpdmF0ZSB7UGxhdGVOb2RlfVxyXG4gICAgdGhpcy50b3BQbGF0ZU5vZGUgPSBuZXcgUGxhdGVOb2RlKCB0aGlzLmNhcGFjaXRvciwgbW9kZWxWaWV3VHJhbnNmb3JtLCBDYXBhY2l0b3JDb25zdGFudHMuUE9MQVJJVFkuUE9TSVRJVkUsIGNpcmN1aXQubWF4UGxhdGVDaGFyZ2UsIG9wdGlvbnMub3JpZW50YXRpb24sIG9wdGlvbnMuaW5jbHVkZUNoYXJnZU5vZGUgKTtcclxuICAgIHRoaXMuYm90dG9tUGxhdGVOb2RlID0gbmV3IFBsYXRlTm9kZSggdGhpcy5jYXBhY2l0b3IsIG1vZGVsVmlld1RyYW5zZm9ybSwgQ2FwYWNpdG9yQ29uc3RhbnRzLlBPTEFSSVRZLk5FR0FUSVZFLCBjaXJjdWl0Lm1heFBsYXRlQ2hhcmdlLCBvcHRpb25zLm9yaWVudGF0aW9uLCBvcHRpb25zLmluY2x1ZGVDaGFyZ2VOb2RlICk7XHJcblxyXG4gICAgY29uc3QgZUZpZWxkTm9kZSA9IG5ldyBFRmllbGROb2RlKCB0aGlzLmNhcGFjaXRvciwgbW9kZWxWaWV3VHJhbnNmb3JtLCBjaXJjdWl0Lm1heEVmZmVjdGl2ZUVGaWVsZCwgdGhpcy5nZXRQbGF0ZXNCb3VuZHMoKSApO1xyXG5cclxuICAgIC8vIHJlbmRlcmluZyBvcmRlclxyXG4gICAgdGhpcy5hZGRDaGlsZCggdGhpcy5ib3R0b21QbGF0ZU5vZGUgKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIGVGaWVsZE5vZGUgKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHRoaXMudG9wUGxhdGVOb2RlICk7XHJcblxyXG4gICAgY29uc3QgdXBkYXRlR2VvbWV0cnkgPSBNdWx0aWxpbmsubXVsdGlsaW5rKCBbXHJcbiAgICAgIHRoaXMuY2FwYWNpdG9yLnBsYXRlU2l6ZVByb3BlcnR5LFxyXG4gICAgICB0aGlzLmNhcGFjaXRvci5wbGF0ZVNlcGFyYXRpb25Qcm9wZXJ0eVxyXG4gICAgXSwgKCkgPT4gdGhpcy51cGRhdGVHZW9tZXRyeSgpICk7XHJcblxyXG4gICAgY29uc3QgdXBkYXRlVmlzaWJpbGl0eSA9IHZpc2libGUgPT4ge1xyXG4gICAgICB0aGlzLnRvcFBsYXRlTm9kZS5zZXRDaGFyZ2VWaXNpYmxlKCB2aXNpYmxlICk7XHJcbiAgICAgIHRoaXMuYm90dG9tUGxhdGVOb2RlLnNldENoYXJnZVZpc2libGUoIHZpc2libGUgKTtcclxuICAgIH07XHJcbiAgICBwbGF0ZUNoYXJnZVZpc2libGVQcm9wZXJ0eS5saW5rKCB1cGRhdGVWaXNpYmlsaXR5ICk7XHJcblxyXG4gICAgY29uc3QgdXBkYXRlRWxlY3RyaWNGaWVsZFZpc2liaWxpdHkgPSB2aXNpYmxlID0+IGVGaWVsZE5vZGUuc2V0VmlzaWJsZSggdmlzaWJsZSApO1xyXG4gICAgZWxlY3RyaWNGaWVsZFZpc2libGVQcm9wZXJ0eS5saW5rKCB1cGRhdGVFbGVjdHJpY0ZpZWxkVmlzaWJpbGl0eSApO1xyXG5cclxuICAgIHRoaXMubXV0YXRlKCBvcHRpb25zICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGVcclxuICAgIHRoaXMuZGlzcG9zZUNhcGFjaXRvck5vZGUgPSAoKSA9PiB7XHJcbiAgICAgIHVwZGF0ZUdlb21ldHJ5LmRpc3Bvc2UoKTtcclxuICAgICAgcGxhdGVDaGFyZ2VWaXNpYmxlUHJvcGVydHkudW5saW5rKCB1cGRhdGVWaXNpYmlsaXR5ICk7XHJcbiAgICAgIGVsZWN0cmljRmllbGRWaXNpYmxlUHJvcGVydHkudW5saW5rKCB1cGRhdGVFbGVjdHJpY0ZpZWxkVmlzaWJpbGl0eSApO1xyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIC8vIEBwdWJsaWNcclxuICBkaXNwb3NlKCkge1xyXG4gICAgdGhpcy5kaXNwb3NlQ2FwYWNpdG9yTm9kZSgpO1xyXG4gICAgc3VwZXIuZGlzcG9zZSgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUmV0dXJucyB0cnVlIGlmIHRoZSBmcm9udCBzaWRlIGNvbnRhaW5zIHRoZSBzcGVjaWZpZWQgcG9pbnQsIHVzZWQgZm9yIHZvbHRtZXRlciBwcm9iZSBoaXQgdGVzdGluZy5cclxuICAgKiBAcGFyYW0ge1ZlY3RvcjJ9IGdsb2JhbFBvaW50XHJcbiAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGZyb250U2lkZUNvbnRhaW5zU2Vuc29yUG9pbnQoIGdsb2JhbFBvaW50ICkge1xyXG4gICAgY29uc3QgcG9pbnQgPSB0aGlzLnRvcFBsYXRlTm9kZS5nbG9iYWxUb1BhcmVudFBvaW50KCBnbG9iYWxQb2ludCApO1xyXG4gICAgcmV0dXJuIHRoaXMudG9wUGxhdGVOb2RlLmNvbnRhaW5zUG9pbnQoIHBvaW50ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRydWUgaWYgdGhlIGJhY2sgc2lkZSBjb250YWlucyB0aGUgc3BlY2lmaWVkIHBvaW50LCB1c2VkIGZvciB2b2x0bWV0ZXIgcHJvYmUgaGl0IHRlc3RpbmcuXHJcbiAgICogQHBhcmFtIHtWZWN0b3IyfSBnbG9iYWxQb2ludFxyXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBiYWNrU2lkZUNvbnRhaW5zU2Vuc29yUG9pbnQoIGdsb2JhbFBvaW50ICkge1xyXG4gICAgY29uc3QgcG9pbnQgPSB0aGlzLmJvdHRvbVBsYXRlTm9kZS5nbG9iYWxUb1BhcmVudFBvaW50KCBnbG9iYWxQb2ludCApO1xyXG4gICAgcmV0dXJuIHRoaXMuYm90dG9tUGxhdGVOb2RlLmNvbnRhaW5zUG9pbnQoIHBvaW50ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBSZXR1cm5zIHRoZSBjbGlwcGluZyByZWdpb24gZm9yIHRoZSB0b3Agc2hhcGUsIGluIGdsb2JhbCBjb29yZGluYXRlcywgdXNlZCB0byBzaG93IHdpcmVzIG9yIGVsZWN0cm9ucyBmbG93aW5nIGluL291dCBvZiB0aGUgY2FwYWNpdG9yLlxyXG4gICAqIEByZXR1cm5zIHtTaGFwZX1cclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZ2V0VG9wUGxhdGVDbGlwU2hhcGVUb0dsb2JhbCgpIHtcclxuXHJcbiAgICAvLyBOb3RlIHggJiB5IGFyZSBkZWZpbmVkIGZvciBhIHZlcnRpY2FsIGNhcGFjaXRvciwgbGlrZSBpbiBDYXBhY2l0b3IgTGFiOiBCYXNpY3NcclxuICAgIGNvbnN0IHRvcE5vZGUgPSB0aGlzLnRvcFBsYXRlTm9kZS50b3BOb2RlO1xyXG4gICAgY29uc3Qgc2hhcGUgPSBTaGFwZS5yZWN0KCB0b3BOb2RlLmNlbnRlci54IC0gQ0xJUF9IRUlHSFQsIHRvcE5vZGUuY2VudGVyLnkgLSBDTElQX1dJRFRILCBDTElQX0hFSUdIVCAqIDIsIENMSVBfV0lEVEggKTtcclxuICAgIHJldHVybiBzaGFwZS50cmFuc2Zvcm1lZCggdG9wTm9kZS5nZXRMb2NhbFRvR2xvYmFsTWF0cml4KCkgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFJldHVybnMgdGhlIGNsaXBwaW5nIHJlZ2lvbiBmb3IgdGhlIGJvdHRvbSBzaGFwZSwgaW4gZ2xvYmFsIGNvb3JkaW5hdGVzLCB1c2VkIHRvIHNob3cgd2lyZXMgb3IgZWxlY3Ryb25zIGZsb3dpbmcgaW4vb3V0IG9mIHRoZSBjYXBhY2l0b3IuXHJcbiAgICogQHJldHVybnMge1NoYXBlfVxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBnZXRCb3R0b21QbGF0ZUNsaXBTaGFwZVRvR2xvYmFsKCkge1xyXG5cclxuICAgIC8vIE5vdGUgeCAmIHkgYXJlIGRlZmluZWQgZm9yIGEgdmVydGljYWwgY2FwYWNpdG9yLCBsaWtlIGluIENhcGFjaXRvciBMYWI6IEJhc2ljc1xyXG4gICAgY29uc3QgZnJvbnROb2RlID0gdGhpcy5ib3R0b21QbGF0ZU5vZGUuZnJvbnROb2RlO1xyXG4gICAgY29uc3Qgc2hhcGUgPSBTaGFwZS5yZWN0KCBmcm9udE5vZGUuYm91bmRzLmNlbnRlci54IC0gQ0xJUF9IRUlHSFQsIGZyb250Tm9kZS5ib3VuZHMuYm90dG9tLCBDTElQX0hFSUdIVCAqIDIsIENMSVBfV0lEVEggKTtcclxuICAgIHJldHVybiBzaGFwZS50cmFuc2Zvcm1lZCggZnJvbnROb2RlLmdldExvY2FsVG9HbG9iYWxNYXRyaXgoKSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVXBkYXRlIHRoZSBnZW9tZXRyeSBvZiB0aGUgY2FwYWNpdG9yIHBsYXRlcy5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIHVwZGF0ZUdlb21ldHJ5KCkge1xyXG5cclxuICAgIC8vIGdlb21ldHJ5XHJcbiAgICB0aGlzLnRvcFBsYXRlTm9kZS5zZXRCb3hTaXplKCB0aGlzLmNhcGFjaXRvci5wbGF0ZVNpemVQcm9wZXJ0eS52YWx1ZSApO1xyXG4gICAgdGhpcy5ib3R0b21QbGF0ZU5vZGUuc2V0Qm94U2l6ZSggdGhpcy5jYXBhY2l0b3IucGxhdGVTaXplUHJvcGVydHkudmFsdWUgKTtcclxuXHJcbiAgICAvLyBsYXlvdXQgbm9kZXNcclxuICAgIGNvbnN0IHggPSAwO1xyXG4gICAgY29uc3QgeiA9IDA7XHJcblxyXG4gICAgY29uc3QgdG9wUGxhdGVZID0gLXRoaXMuY2FwYWNpdG9yLnBsYXRlU2VwYXJhdGlvblByb3BlcnR5LnZhbHVlIC8gMiAtIHRoaXMuY2FwYWNpdG9yLnBsYXRlU2l6ZVByb3BlcnR5LnZhbHVlLmhlaWdodDtcclxuICAgIHRoaXMudG9wUGxhdGVOb2RlLmNlbnRlciA9IHRoaXMubW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3RGVsdGFYWVooIHgsIHRvcFBsYXRlWSwgeiApO1xyXG5cclxuICAgIGNvbnN0IGJvdHRvbVBsYXRlWSA9IHRoaXMuY2FwYWNpdG9yLnBsYXRlU2VwYXJhdGlvblByb3BlcnR5LnZhbHVlIC8gMjtcclxuICAgIHRoaXMuYm90dG9tUGxhdGVOb2RlLmNlbnRlciA9IHRoaXMubW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3RGVsdGFYWVooIHgsIGJvdHRvbVBsYXRlWSwgeiApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IHRoZSBib3VuZCBvZiB0aGUgY2FwYWNpdG9yIGZyb20gdGhlIHBsYXRlcy4gIEFsbG93cyBmb3IgYm91bmRzIHRvIGJlIHBhc3NlZCBpbnRvIHRoZSBjYW52YXMgbm9kZSBiZWZvcmUgdGhlXHJcbiAgICogY2hpbGRyZW4gYXJlIGFkZGVkIHRvIHRoZSB2aWV3LlxyXG4gICAqIEBwdWJsaWNcclxuICAgKlxyXG4gICAqIEByZXR1cm5zIHtCb3VuZHMyfVxyXG4gICAqL1xyXG4gIGdldFBsYXRlc0JvdW5kcygpIHtcclxuICAgIHJldHVybiBuZXcgQm91bmRzMihcclxuICAgICAgdGhpcy50b3BQbGF0ZU5vZGUubGVmdCxcclxuICAgICAgdGhpcy50b3BQbGF0ZU5vZGUudG9wLFxyXG4gICAgICB0aGlzLmJvdHRvbVBsYXRlTm9kZS5yaWdodCxcclxuICAgICAgdGhpcy5ib3R0b21QbGF0ZU5vZGUuYm90dG9tXHJcbiAgICApO1xyXG4gIH1cclxufVxyXG5cclxuc2NlbmVyeVBoZXQucmVnaXN0ZXIoICdDYXBhY2l0b3JOb2RlJywgQ2FwYWNpdG9yTm9kZSApO1xyXG5leHBvcnQgZGVmYXVsdCBDYXBhY2l0b3JOb2RlOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtB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