// Copyright 2013-2022, University of Colorado Boulder

/**
 * mass object view
 *
 * @author Anton Ulyanov (Mlearner)
 * @author Aadish Gupta (PhET Interactive Simulations)
 */

import ForceValuesDisplayEnum from '../../../inverse-square-law-common/js/model/ForceValuesDisplayEnum.js';
import ISLCObjectNode from '../../../inverse-square-law-common/js/view/ISLCObjectNode.js';
import { Shape } from '../../../kite/js/imports.js';
import merge from '../../../phet-core/js/merge.js';
import { RadialGradient } from '../../../scenery/js/imports.js';
import Tandem from '../../../tandem/js/Tandem.js';
import gravityForceLab from '../gravityForceLab.js';
import GravityForceLabConstants from '../GravityForceLabConstants.js';

// constants
const ARROW_LABEL_COLOR_STRING = '#000';
const MASS_NODE_Y_POSITION = 185;
const MIN_ARROW_WIDTH = 0.1; // this way the force arrow never disappears when set to the minimum force (which isn't 0)
const MAX_ARROW_WIDTH = 700;
const FORCE_THRESHOLD_PERCENT = 1.6 * Math.pow(10, -4); // the percent of force when we convert between the two arrow mappings

class MassNode extends ISLCObjectNode {
  /**
   * @param {ISLCModel} model
   * @param {Mass} mass
   * @param {Bounds2} layoutBounds
   * @param {ModelViewTransform2} modelViewTransform
   * @param {ISLCAlertManager} alertManager
   * @param {ForceDescriber} forceDescriber
   * @param {GravityForceLabPositionDescriber} positionDescriber
   * @param {Object} [options]
   */
  constructor(model, mass, layoutBounds, modelViewTransform, alertManager, forceDescriber, positionDescriber, options) {
    options = merge({
      arrowNodeOptions: {
        arrowFill: ARROW_LABEL_COLOR_STRING,
        arrowLabelFill: ARROW_LABEL_COLOR_STRING,
        maxArrowWidth: MAX_ARROW_WIDTH,
        minArrowWidth: MIN_ARROW_WIDTH,
        backgroundFill: GravityForceLabConstants.BACKGROUND_COLOR_PROPERTY,
        forceThresholdPercent: FORCE_THRESHOLD_PERCENT,
        mapArrowWidthWithTwoFunctions: true
      },
      pullerNodeOptions: {
        ropeLength: 40
      },
      y: MASS_NODE_Y_POSITION,
      snapToNearest: GravityForceLabConstants.POSITION_SNAP_VALUE,
      stepSize: GravityForceLabConstants.POSITION_STEP_SIZE,
      // {function} - to support REGULAR and BASICS without duplicating too much code.
      finishWiringListeners: () => this.linkToForceValuesDisplayProperty(model),
      // phet-io
      tandem: Tandem.REQUIRED
    }, options);
    super(model, mass, layoutBounds, modelViewTransform, alertManager, forceDescriber, positionDescriber, options);
    this.objectModel.radiusProperty.link(() => {
      // pdom - update the focusHighlight with the radius (ParallelDOM.js setter)
      this.focusHighlight = Shape.bounds(this.dragNode.bounds.dilated(5));

      // set the pointer and touch areas
      const pullerBounds = this.pullerNode.localToParentBounds(this.pullerNode.touchAreaBounds);
      this.mouseArea = Shape.xor([Shape.bounds(pullerBounds), this.objectCircle.createCircleShape()]);
      this.touchArea = this.mouseArea;
    });
    this.addInputListener({
      focus: () => {
        positionDescriber.lastMoveCloser = null;
      }
    });
    options.finishWiringListeners();
  }

  /**
   * @protected
   * @override
   * @param {Color} baseColor
   */
  updateGradient(baseColor) {
    const radius = this.modelViewTransform.modelToViewDeltaX(this.objectModel.radiusProperty.get());
    this.objectCircle.fill = new RadialGradient(-radius * 0.6, -radius * 0.6, 1, -radius * 0.6, -radius * 0.6, radius).addColorStop(0, baseColor.colorUtilsBrighter(0.5).toCSS()).addColorStop(1, baseColor.toCSS());
    if (this.model.constantRadiusProperty.get()) {
      this.objectCircle.stroke = baseColor.colorUtilsDarker(0.15);
    } else {
      this.objectCircle.stroke = null;
    }
  }

  /**
   * Listener to set the readouts in appropriate scientific notation.
   * This listener is factored out in case subtypes want to call it when passing in options.
   * @param {GravityForceLabModel} model
   * @private
   */
  linkToForceValuesDisplayProperty(model) {
    model.forceValuesDisplayProperty.link(forceDisplay => {
      this.setReadoutsInScientificNotation(forceDisplay === ForceValuesDisplayEnum.SCIENTIFIC);
    });
  }
}
gravityForceLab.register('MassNode', MassNode);
export default MassNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJGb3JjZVZhbHVlc0Rpc3BsYXlFbnVtIiwiSVNMQ09iamVjdE5vZGUiLCJTaGFwZSIsIm1lcmdlIiwiUmFkaWFsR3JhZGllbnQiLCJUYW5kZW0iLCJncmF2aXR5Rm9yY2VMYWIiLCJHcmF2aXR5Rm9yY2VMYWJDb25zdGFudHMiLCJBUlJPV19MQUJFTF9DT0xPUl9TVFJJTkciLCJNQVNTX05PREVfWV9QT1NJVElPTiIsIk1JTl9BUlJPV19XSURUSCIsIk1BWF9BUlJPV19XSURUSCIsIkZPUkNFX1RIUkVTSE9MRF9QRVJDRU5UIiwiTWF0aCIsInBvdyIsIk1hc3NOb2RlIiwiY29uc3RydWN0b3IiLCJtb2RlbCIsIm1hc3MiLCJsYXlvdXRCb3VuZHMiLCJtb2RlbFZpZXdUcmFuc2Zvcm0iLCJhbGVydE1hbmFnZXIiLCJmb3JjZURlc2NyaWJlciIsInBvc2l0aW9uRGVzY3JpYmVyIiwib3B0aW9ucyIsImFycm93Tm9kZU9wdGlvbnMiLCJhcnJvd0ZpbGwiLCJhcnJvd0xhYmVsRmlsbCIsIm1heEFycm93V2lkdGgiLCJtaW5BcnJvd1dpZHRoIiwiYmFja2dyb3VuZEZpbGwiLCJCQUNLR1JPVU5EX0NPTE9SX1BST1BFUlRZIiwiZm9yY2VUaHJlc2hvbGRQZXJjZW50IiwibWFwQXJyb3dXaWR0aFdpdGhUd29GdW5jdGlvbnMiLCJwdWxsZXJOb2RlT3B0aW9ucyIsInJvcGVMZW5ndGgiLCJ5Iiwic25hcFRvTmVhcmVzdCIsIlBPU0lUSU9OX1NOQVBfVkFMVUUiLCJzdGVwU2l6ZSIsIlBPU0lUSU9OX1NURVBfU0laRSIsImZpbmlzaFdpcmluZ0xpc3RlbmVycyIsImxpbmtUb0ZvcmNlVmFsdWVzRGlzcGxheVByb3BlcnR5IiwidGFuZGVtIiwiUkVRVUlSRUQiLCJvYmplY3RNb2RlbCIsInJhZGl1c1Byb3BlcnR5IiwibGluayIsImZvY3VzSGlnaGxpZ2h0IiwiYm91bmRzIiwiZHJhZ05vZGUiLCJkaWxhdGVkIiwicHVsbGVyQm91bmRzIiwicHVsbGVyTm9kZSIsImxvY2FsVG9QYXJlbnRCb3VuZHMiLCJ0b3VjaEFyZWFCb3VuZHMiLCJtb3VzZUFyZWEiLCJ4b3IiLCJvYmplY3RDaXJjbGUiLCJjcmVhdGVDaXJjbGVTaGFwZSIsInRvdWNoQXJlYSIsImFkZElucHV0TGlzdGVuZXIiLCJmb2N1cyIsImxhc3RNb3ZlQ2xvc2VyIiwidXBkYXRlR3JhZGllbnQiLCJiYXNlQ29sb3IiLCJyYWRpdXMiLCJtb2RlbFRvVmlld0RlbHRhWCIsImdldCIsImZpbGwiLCJhZGRDb2xvclN0b3AiLCJjb2xvclV0aWxzQnJpZ2h0ZXIiLCJ0b0NTUyIsImNvbnN0YW50UmFkaXVzUHJvcGVydHkiLCJzdHJva2UiLCJjb2xvclV0aWxzRGFya2VyIiwiZm9yY2VWYWx1ZXNEaXNwbGF5UHJvcGVydHkiLCJmb3JjZURpc3BsYXkiLCJzZXRSZWFkb3V0c0luU2NpZW50aWZpY05vdGF0aW9uIiwiU0NJRU5USUZJQyIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiTWFzc05vZGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTMtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogbWFzcyBvYmplY3Qgdmlld1xyXG4gKlxyXG4gKiBAYXV0aG9yIEFudG9uIFVseWFub3YgKE1sZWFybmVyKVxyXG4gKiBAYXV0aG9yIEFhZGlzaCBHdXB0YSAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgRm9yY2VWYWx1ZXNEaXNwbGF5RW51bSBmcm9tICcuLi8uLi8uLi9pbnZlcnNlLXNxdWFyZS1sYXctY29tbW9uL2pzL21vZGVsL0ZvcmNlVmFsdWVzRGlzcGxheUVudW0uanMnO1xyXG5pbXBvcnQgSVNMQ09iamVjdE5vZGUgZnJvbSAnLi4vLi4vLi4vaW52ZXJzZS1zcXVhcmUtbGF3LWNvbW1vbi9qcy92aWV3L0lTTENPYmplY3ROb2RlLmpzJztcclxuaW1wb3J0IHsgU2hhcGUgfSBmcm9tICcuLi8uLi8uLi9raXRlL2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgbWVyZ2UgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL21lcmdlLmpzJztcclxuaW1wb3J0IHsgUmFkaWFsR3JhZGllbnQgfSBmcm9tICcuLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xyXG5pbXBvcnQgZ3Jhdml0eUZvcmNlTGFiIGZyb20gJy4uL2dyYXZpdHlGb3JjZUxhYi5qcyc7XHJcbmltcG9ydCBHcmF2aXR5Rm9yY2VMYWJDb25zdGFudHMgZnJvbSAnLi4vR3Jhdml0eUZvcmNlTGFiQ29uc3RhbnRzLmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBBUlJPV19MQUJFTF9DT0xPUl9TVFJJTkcgPSAnIzAwMCc7XHJcbmNvbnN0IE1BU1NfTk9ERV9ZX1BPU0lUSU9OID0gMTg1O1xyXG5jb25zdCBNSU5fQVJST1dfV0lEVEggPSAwLjE7IC8vIHRoaXMgd2F5IHRoZSBmb3JjZSBhcnJvdyBuZXZlciBkaXNhcHBlYXJzIHdoZW4gc2V0IHRvIHRoZSBtaW5pbXVtIGZvcmNlICh3aGljaCBpc24ndCAwKVxyXG5jb25zdCBNQVhfQVJST1dfV0lEVEggPSA3MDA7XHJcbmNvbnN0IEZPUkNFX1RIUkVTSE9MRF9QRVJDRU5UID0gMS42ICogTWF0aC5wb3coIDEwLCAtNCApOyAvLyB0aGUgcGVyY2VudCBvZiBmb3JjZSB3aGVuIHdlIGNvbnZlcnQgYmV0d2VlbiB0aGUgdHdvIGFycm93IG1hcHBpbmdzXHJcblxyXG5jbGFzcyBNYXNzTm9kZSBleHRlbmRzIElTTENPYmplY3ROb2RlIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtJU0xDTW9kZWx9IG1vZGVsXHJcbiAgICogQHBhcmFtIHtNYXNzfSBtYXNzXHJcbiAgICogQHBhcmFtIHtCb3VuZHMyfSBsYXlvdXRCb3VuZHNcclxuICAgKiBAcGFyYW0ge01vZGVsVmlld1RyYW5zZm9ybTJ9IG1vZGVsVmlld1RyYW5zZm9ybVxyXG4gICAqIEBwYXJhbSB7SVNMQ0FsZXJ0TWFuYWdlcn0gYWxlcnRNYW5hZ2VyXHJcbiAgICogQHBhcmFtIHtGb3JjZURlc2NyaWJlcn0gZm9yY2VEZXNjcmliZXJcclxuICAgKiBAcGFyYW0ge0dyYXZpdHlGb3JjZUxhYlBvc2l0aW9uRGVzY3JpYmVyfSBwb3NpdGlvbkRlc2NyaWJlclxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggbW9kZWwsIG1hc3MsIGxheW91dEJvdW5kcywgbW9kZWxWaWV3VHJhbnNmb3JtLCBhbGVydE1hbmFnZXIsIGZvcmNlRGVzY3JpYmVyLCBwb3NpdGlvbkRlc2NyaWJlciwgb3B0aW9ucyApIHtcclxuXHJcbiAgICBvcHRpb25zID0gbWVyZ2UoIHtcclxuICAgICAgYXJyb3dOb2RlT3B0aW9uczoge1xyXG4gICAgICAgIGFycm93RmlsbDogQVJST1dfTEFCRUxfQ09MT1JfU1RSSU5HLFxyXG4gICAgICAgIGFycm93TGFiZWxGaWxsOiBBUlJPV19MQUJFTF9DT0xPUl9TVFJJTkcsXHJcbiAgICAgICAgbWF4QXJyb3dXaWR0aDogTUFYX0FSUk9XX1dJRFRILFxyXG4gICAgICAgIG1pbkFycm93V2lkdGg6IE1JTl9BUlJPV19XSURUSCxcclxuICAgICAgICBiYWNrZ3JvdW5kRmlsbDogR3Jhdml0eUZvcmNlTGFiQ29uc3RhbnRzLkJBQ0tHUk9VTkRfQ09MT1JfUFJPUEVSVFksXHJcbiAgICAgICAgZm9yY2VUaHJlc2hvbGRQZXJjZW50OiBGT1JDRV9USFJFU0hPTERfUEVSQ0VOVCxcclxuICAgICAgICBtYXBBcnJvd1dpZHRoV2l0aFR3b0Z1bmN0aW9uczogdHJ1ZVxyXG4gICAgICB9LFxyXG4gICAgICBwdWxsZXJOb2RlT3B0aW9uczoge1xyXG4gICAgICAgIHJvcGVMZW5ndGg6IDQwXHJcbiAgICAgIH0sXHJcbiAgICAgIHk6IE1BU1NfTk9ERV9ZX1BPU0lUSU9OLFxyXG4gICAgICBzbmFwVG9OZWFyZXN0OiBHcmF2aXR5Rm9yY2VMYWJDb25zdGFudHMuUE9TSVRJT05fU05BUF9WQUxVRSxcclxuICAgICAgc3RlcFNpemU6IEdyYXZpdHlGb3JjZUxhYkNvbnN0YW50cy5QT1NJVElPTl9TVEVQX1NJWkUsXHJcblxyXG4gICAgICAvLyB7ZnVuY3Rpb259IC0gdG8gc3VwcG9ydCBSRUdVTEFSIGFuZCBCQVNJQ1Mgd2l0aG91dCBkdXBsaWNhdGluZyB0b28gbXVjaCBjb2RlLlxyXG4gICAgICBmaW5pc2hXaXJpbmdMaXN0ZW5lcnM6ICgpID0+IHRoaXMubGlua1RvRm9yY2VWYWx1ZXNEaXNwbGF5UHJvcGVydHkoIG1vZGVsICksXHJcblxyXG4gICAgICAvLyBwaGV0LWlvXHJcbiAgICAgIHRhbmRlbTogVGFuZGVtLlJFUVVJUkVEXHJcbiAgICB9LCBvcHRpb25zICk7XHJcblxyXG4gICAgc3VwZXIoIG1vZGVsLCBtYXNzLCBsYXlvdXRCb3VuZHMsIG1vZGVsVmlld1RyYW5zZm9ybSwgYWxlcnRNYW5hZ2VyLCBmb3JjZURlc2NyaWJlciwgcG9zaXRpb25EZXNjcmliZXIsIG9wdGlvbnMgKTtcclxuXHJcbiAgICB0aGlzLm9iamVjdE1vZGVsLnJhZGl1c1Byb3BlcnR5LmxpbmsoICgpID0+IHtcclxuXHJcbiAgICAgIC8vIHBkb20gLSB1cGRhdGUgdGhlIGZvY3VzSGlnaGxpZ2h0IHdpdGggdGhlIHJhZGl1cyAoUGFyYWxsZWxET00uanMgc2V0dGVyKVxyXG4gICAgICB0aGlzLmZvY3VzSGlnaGxpZ2h0ID0gU2hhcGUuYm91bmRzKCB0aGlzLmRyYWdOb2RlLmJvdW5kcy5kaWxhdGVkKCA1ICkgKTtcclxuXHJcbiAgICAgIC8vIHNldCB0aGUgcG9pbnRlciBhbmQgdG91Y2ggYXJlYXNcclxuICAgICAgY29uc3QgcHVsbGVyQm91bmRzID0gdGhpcy5wdWxsZXJOb2RlLmxvY2FsVG9QYXJlbnRCb3VuZHMoIHRoaXMucHVsbGVyTm9kZS50b3VjaEFyZWFCb3VuZHMgKTtcclxuICAgICAgdGhpcy5tb3VzZUFyZWEgPSBTaGFwZS54b3IoIFsgU2hhcGUuYm91bmRzKCBwdWxsZXJCb3VuZHMgKSwgdGhpcy5vYmplY3RDaXJjbGUuY3JlYXRlQ2lyY2xlU2hhcGUoKSBdICk7XHJcbiAgICAgIHRoaXMudG91Y2hBcmVhID0gdGhpcy5tb3VzZUFyZWE7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5hZGRJbnB1dExpc3RlbmVyKCB7XHJcbiAgICAgIGZvY3VzOiAoKSA9PiB7XHJcbiAgICAgICAgcG9zaXRpb25EZXNjcmliZXIubGFzdE1vdmVDbG9zZXIgPSBudWxsO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgb3B0aW9ucy5maW5pc2hXaXJpbmdMaXN0ZW5lcnMoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwcm90ZWN0ZWRcclxuICAgKiBAb3ZlcnJpZGVcclxuICAgKiBAcGFyYW0ge0NvbG9yfSBiYXNlQ29sb3JcclxuICAgKi9cclxuICB1cGRhdGVHcmFkaWVudCggYmFzZUNvbG9yICkge1xyXG4gICAgY29uc3QgcmFkaXVzID0gdGhpcy5tb2RlbFZpZXdUcmFuc2Zvcm0ubW9kZWxUb1ZpZXdEZWx0YVgoIHRoaXMub2JqZWN0TW9kZWwucmFkaXVzUHJvcGVydHkuZ2V0KCkgKTtcclxuICAgIHRoaXMub2JqZWN0Q2lyY2xlLmZpbGwgPSBuZXcgUmFkaWFsR3JhZGllbnQoXHJcbiAgICAgIC1yYWRpdXMgKiAwLjYsIC1yYWRpdXMgKiAwLjYsIDEsIC1yYWRpdXMgKiAwLjYsIC1yYWRpdXMgKiAwLjYsIHJhZGl1cyApXHJcbiAgICAgIC5hZGRDb2xvclN0b3AoIDAsIGJhc2VDb2xvci5jb2xvclV0aWxzQnJpZ2h0ZXIoIDAuNSApLnRvQ1NTKCkgKVxyXG4gICAgICAuYWRkQ29sb3JTdG9wKCAxLCBiYXNlQ29sb3IudG9DU1MoKSApO1xyXG4gICAgaWYgKCB0aGlzLm1vZGVsLmNvbnN0YW50UmFkaXVzUHJvcGVydHkuZ2V0KCkgKSB7XHJcbiAgICAgIHRoaXMub2JqZWN0Q2lyY2xlLnN0cm9rZSA9IGJhc2VDb2xvci5jb2xvclV0aWxzRGFya2VyKCAwLjE1ICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgdGhpcy5vYmplY3RDaXJjbGUuc3Ryb2tlID0gbnVsbDtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIExpc3RlbmVyIHRvIHNldCB0aGUgcmVhZG91dHMgaW4gYXBwcm9wcmlhdGUgc2NpZW50aWZpYyBub3RhdGlvbi5cclxuICAgKiBUaGlzIGxpc3RlbmVyIGlzIGZhY3RvcmVkIG91dCBpbiBjYXNlIHN1YnR5cGVzIHdhbnQgdG8gY2FsbCBpdCB3aGVuIHBhc3NpbmcgaW4gb3B0aW9ucy5cclxuICAgKiBAcGFyYW0ge0dyYXZpdHlGb3JjZUxhYk1vZGVsfSBtb2RlbFxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgbGlua1RvRm9yY2VWYWx1ZXNEaXNwbGF5UHJvcGVydHkoIG1vZGVsICkge1xyXG4gICAgbW9kZWwuZm9yY2VWYWx1ZXNEaXNwbGF5UHJvcGVydHkubGluayggZm9yY2VEaXNwbGF5ID0+IHtcclxuICAgICAgdGhpcy5zZXRSZWFkb3V0c0luU2NpZW50aWZpY05vdGF0aW9uKCBmb3JjZURpc3BsYXkgPT09IEZvcmNlVmFsdWVzRGlzcGxheUVudW0uU0NJRU5USUZJQyApO1xyXG4gICAgfSApO1xyXG4gIH1cclxufVxyXG5cclxuZ3Jhdml0eUZvcmNlTGFiLnJlZ2lzdGVyKCAnTWFzc05vZGUnLCBNYXNzTm9kZSApO1xyXG5leHBvcnQgZGVmYXVsdCBNYXNzTm9kZTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxzQkFBc0IsTUFBTSx1RUFBdUU7QUFDMUcsT0FBT0MsY0FBYyxNQUFNLDhEQUE4RDtBQUN6RixTQUFTQyxLQUFLLFFBQVEsNkJBQTZCO0FBQ25ELE9BQU9DLEtBQUssTUFBTSxnQ0FBZ0M7QUFDbEQsU0FBU0MsY0FBYyxRQUFRLGdDQUFnQztBQUMvRCxPQUFPQyxNQUFNLE1BQU0sOEJBQThCO0FBQ2pELE9BQU9DLGVBQWUsTUFBTSx1QkFBdUI7QUFDbkQsT0FBT0Msd0JBQXdCLE1BQU0sZ0NBQWdDOztBQUVyRTtBQUNBLE1BQU1DLHdCQUF3QixHQUFHLE1BQU07QUFDdkMsTUFBTUMsb0JBQW9CLEdBQUcsR0FBRztBQUNoQyxNQUFNQyxlQUFlLEdBQUcsR0FBRyxDQUFDLENBQUM7QUFDN0IsTUFBTUMsZUFBZSxHQUFHLEdBQUc7QUFDM0IsTUFBTUMsdUJBQXVCLEdBQUcsR0FBRyxHQUFHQyxJQUFJLENBQUNDLEdBQUcsQ0FBRSxFQUFFLEVBQUUsQ0FBQyxDQUFFLENBQUMsQ0FBQyxDQUFDOztBQUUxRCxNQUFNQyxRQUFRLFNBQVNkLGNBQWMsQ0FBQztFQUVwQztBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFZSxXQUFXQSxDQUFFQyxLQUFLLEVBQUVDLElBQUksRUFBRUMsWUFBWSxFQUFFQyxrQkFBa0IsRUFBRUMsWUFBWSxFQUFFQyxjQUFjLEVBQUVDLGlCQUFpQixFQUFFQyxPQUFPLEVBQUc7SUFFckhBLE9BQU8sR0FBR3JCLEtBQUssQ0FBRTtNQUNmc0IsZ0JBQWdCLEVBQUU7UUFDaEJDLFNBQVMsRUFBRWxCLHdCQUF3QjtRQUNuQ21CLGNBQWMsRUFBRW5CLHdCQUF3QjtRQUN4Q29CLGFBQWEsRUFBRWpCLGVBQWU7UUFDOUJrQixhQUFhLEVBQUVuQixlQUFlO1FBQzlCb0IsY0FBYyxFQUFFdkIsd0JBQXdCLENBQUN3Qix5QkFBeUI7UUFDbEVDLHFCQUFxQixFQUFFcEIsdUJBQXVCO1FBQzlDcUIsNkJBQTZCLEVBQUU7TUFDakMsQ0FBQztNQUNEQyxpQkFBaUIsRUFBRTtRQUNqQkMsVUFBVSxFQUFFO01BQ2QsQ0FBQztNQUNEQyxDQUFDLEVBQUUzQixvQkFBb0I7TUFDdkI0QixhQUFhLEVBQUU5Qix3QkFBd0IsQ0FBQytCLG1CQUFtQjtNQUMzREMsUUFBUSxFQUFFaEMsd0JBQXdCLENBQUNpQyxrQkFBa0I7TUFFckQ7TUFDQUMscUJBQXFCLEVBQUVBLENBQUEsS0FBTSxJQUFJLENBQUNDLGdDQUFnQyxDQUFFekIsS0FBTSxDQUFDO01BRTNFO01BQ0EwQixNQUFNLEVBQUV0QyxNQUFNLENBQUN1QztJQUNqQixDQUFDLEVBQUVwQixPQUFRLENBQUM7SUFFWixLQUFLLENBQUVQLEtBQUssRUFBRUMsSUFBSSxFQUFFQyxZQUFZLEVBQUVDLGtCQUFrQixFQUFFQyxZQUFZLEVBQUVDLGNBQWMsRUFBRUMsaUJBQWlCLEVBQUVDLE9BQVEsQ0FBQztJQUVoSCxJQUFJLENBQUNxQixXQUFXLENBQUNDLGNBQWMsQ0FBQ0MsSUFBSSxDQUFFLE1BQU07TUFFMUM7TUFDQSxJQUFJLENBQUNDLGNBQWMsR0FBRzlDLEtBQUssQ0FBQytDLE1BQU0sQ0FBRSxJQUFJLENBQUNDLFFBQVEsQ0FBQ0QsTUFBTSxDQUFDRSxPQUFPLENBQUUsQ0FBRSxDQUFFLENBQUM7O01BRXZFO01BQ0EsTUFBTUMsWUFBWSxHQUFHLElBQUksQ0FBQ0MsVUFBVSxDQUFDQyxtQkFBbUIsQ0FBRSxJQUFJLENBQUNELFVBQVUsQ0FBQ0UsZUFBZ0IsQ0FBQztNQUMzRixJQUFJLENBQUNDLFNBQVMsR0FBR3RELEtBQUssQ0FBQ3VELEdBQUcsQ0FBRSxDQUFFdkQsS0FBSyxDQUFDK0MsTUFBTSxDQUFFRyxZQUFhLENBQUMsRUFBRSxJQUFJLENBQUNNLFlBQVksQ0FBQ0MsaUJBQWlCLENBQUMsQ0FBQyxDQUFHLENBQUM7TUFDckcsSUFBSSxDQUFDQyxTQUFTLEdBQUcsSUFBSSxDQUFDSixTQUFTO0lBQ2pDLENBQUUsQ0FBQztJQUVILElBQUksQ0FBQ0ssZ0JBQWdCLENBQUU7TUFDckJDLEtBQUssRUFBRUEsQ0FBQSxLQUFNO1FBQ1h2QyxpQkFBaUIsQ0FBQ3dDLGNBQWMsR0FBRyxJQUFJO01BQ3pDO0lBQ0YsQ0FBRSxDQUFDO0lBRUh2QyxPQUFPLENBQUNpQixxQkFBcUIsQ0FBQyxDQUFDO0VBQ2pDOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7RUFDRXVCLGNBQWNBLENBQUVDLFNBQVMsRUFBRztJQUMxQixNQUFNQyxNQUFNLEdBQUcsSUFBSSxDQUFDOUMsa0JBQWtCLENBQUMrQyxpQkFBaUIsQ0FBRSxJQUFJLENBQUN0QixXQUFXLENBQUNDLGNBQWMsQ0FBQ3NCLEdBQUcsQ0FBQyxDQUFFLENBQUM7SUFDakcsSUFBSSxDQUFDVixZQUFZLENBQUNXLElBQUksR0FBRyxJQUFJakUsY0FBYyxDQUN6QyxDQUFDOEQsTUFBTSxHQUFHLEdBQUcsRUFBRSxDQUFDQSxNQUFNLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDQSxNQUFNLEdBQUcsR0FBRyxFQUFFLENBQUNBLE1BQU0sR0FBRyxHQUFHLEVBQUVBLE1BQU8sQ0FBQyxDQUN0RUksWUFBWSxDQUFFLENBQUMsRUFBRUwsU0FBUyxDQUFDTSxrQkFBa0IsQ0FBRSxHQUFJLENBQUMsQ0FBQ0MsS0FBSyxDQUFDLENBQUUsQ0FBQyxDQUM5REYsWUFBWSxDQUFFLENBQUMsRUFBRUwsU0FBUyxDQUFDTyxLQUFLLENBQUMsQ0FBRSxDQUFDO0lBQ3ZDLElBQUssSUFBSSxDQUFDdkQsS0FBSyxDQUFDd0Qsc0JBQXNCLENBQUNMLEdBQUcsQ0FBQyxDQUFDLEVBQUc7TUFDN0MsSUFBSSxDQUFDVixZQUFZLENBQUNnQixNQUFNLEdBQUdULFNBQVMsQ0FBQ1UsZ0JBQWdCLENBQUUsSUFBSyxDQUFDO0lBQy9ELENBQUMsTUFDSTtNQUNILElBQUksQ0FBQ2pCLFlBQVksQ0FBQ2dCLE1BQU0sR0FBRyxJQUFJO0lBQ2pDO0VBQ0Y7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VoQyxnQ0FBZ0NBLENBQUV6QixLQUFLLEVBQUc7SUFDeENBLEtBQUssQ0FBQzJELDBCQUEwQixDQUFDN0IsSUFBSSxDQUFFOEIsWUFBWSxJQUFJO01BQ3JELElBQUksQ0FBQ0MsK0JBQStCLENBQUVELFlBQVksS0FBSzdFLHNCQUFzQixDQUFDK0UsVUFBVyxDQUFDO0lBQzVGLENBQUUsQ0FBQztFQUNMO0FBQ0Y7QUFFQXpFLGVBQWUsQ0FBQzBFLFFBQVEsQ0FBRSxVQUFVLEVBQUVqRSxRQUFTLENBQUM7QUFDaEQsZUFBZUEsUUFBUSJ9