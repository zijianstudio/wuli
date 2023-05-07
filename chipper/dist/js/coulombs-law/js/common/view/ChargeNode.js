// Copyright 2017-2022, University of Colorado Boulder

/**
 * Scenery node for the charge object. Children include the pusher/pullers, the circular charge, the force arrow, and
 * all labels. Most instantiation details are handled in ISLCObjectNode including all Property linking and drawing.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 * @author Michael Barlow (PhET Interactive Simulations)
 *
 */

import ForceValuesDisplayEnum from '../../../../inverse-square-law-common/js/model/ForceValuesDisplayEnum.js';
import ISLCObjectNode from '../../../../inverse-square-law-common/js/view/ISLCObjectNode.js';
import merge from '../../../../phet-core/js/merge.js';
import { RadialGradient } from '../../../../scenery/js/imports.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import coulombsLaw from '../../coulombsLaw.js';
import CoulombsLawColors from '../CoulombsLawColors.js';

// constants
const CHARGE_NODE_Y_POSITION = 205;
class ChargeNode extends ISLCObjectNode {
  /**
   * @param {CoulombsLawCommonModel} model
   * @param {Charge} chargeObjectModel
   * @param {Bounds2} layoutBounds
   * @param {ModelViewTransform2} modelViewTransform
   * @param {ISLCAlertManager} alertManager
   * @param {ForceDescriber} forceDescriber
   * @param {PositionDescriber} positionDescriber
   * @param {Object} [options]
   */
  constructor(model, chargeObjectModel, layoutBounds, modelViewTransform, alertManager, forceDescriber, positionDescriber, options) {
    options = merge({
      label: 'This Charge',
      // TODO: factor out into strings files
      otherObjectLabel: 'Other Charge',
      scientificNotationMode: true,
      snapToNearest: model.snapObjectsToNearest,
      attractNegative: true,
      y: CHARGE_NODE_Y_POSITION,
      pullerNodeOptions: {
        displayShadow: false
      },
      arrowNodeOptions: {
        maxArrowWidth: 50,
        forceReadoutDecimalPlaces: 9,
        // colors for projector and default modes
        labelFill: CoulombsLawColors.forceArrowLabelFillProperty,
        arrowLabelFill: CoulombsLawColors.forceArrowLabelFillProperty,
        arrowFill: CoulombsLawColors.forceArrowFillProperty,
        arrowStroke: CoulombsLawColors.forceArrowStrokeProperty,
        labelShadowFill: CoulombsLawColors.labelShadowFillProperty,
        backgroundFill: CoulombsLawColors.backgroundProperty
      },
      labelOptions: {
        fill: CoulombsLawColors.forceArrowLabelFillProperty
      },
      // phet-io
      tandem: Tandem.REQUIRED,
      // TODO: proper sting usage
      a11yCreateAriaValueText: formattedValue => `${formattedValue} coulombs`
    }, options);
    super(model, chargeObjectModel, layoutBounds, modelViewTransform, alertManager, forceDescriber, positionDescriber, options);

    // @private - Used for incrementing the radius to prevent division by zero in RadialGradient
    this.snapToNearest = options.snapToNearest;

    // force display Property is never removed/destroyed, no disposal required
    model.forceValuesDisplayProperty.lazyLink(this.redrawForce.bind(this));

    // stroke added here for projector mode and white bg printing options
    this.objectCircle.stroke = 'black';
    this.objectCircle.lineWidth = 0.5;
  }

  /**
   * Alter the radial gradient based on the radius of the charge object
   * @param  {Color} baseColor
   * @protected
   * @override
   */
  updateGradient(baseColor) {
    let radius = this.modelViewTransform.modelToViewDeltaX(this.objectModel.radiusProperty.get());

    // if the radius = 1, radial gradient will throw an divide-by-zero error
    // ensure inequality
    radius = radius === 1 ? radius + this.snapToNearest : radius;
    this.objectCircle.fill = new RadialGradient(-radius * 0.6, -radius * 0.6, 1, -radius * 0.6, -radius * 0.6, radius).addColorStop(0, baseColor.colorUtilsBrighter(0.5).toCSS()).addColorStop(1, baseColor.toCSS());
  }

  /**
   * Updates the node's arrow length, force readout, and puller image.
   * @private
   */
  redrawForce() {
    this.arrowNode.scientificNotationMode = this.model.forceValuesDisplayProperty.value === ForceValuesDisplayEnum.SCIENTIFIC;
    super.redrawForce();
  }
}
coulombsLaw.register('ChargeNode', ChargeNode);
export default ChargeNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJGb3JjZVZhbHVlc0Rpc3BsYXlFbnVtIiwiSVNMQ09iamVjdE5vZGUiLCJtZXJnZSIsIlJhZGlhbEdyYWRpZW50IiwiVGFuZGVtIiwiY291bG9tYnNMYXciLCJDb3Vsb21ic0xhd0NvbG9ycyIsIkNIQVJHRV9OT0RFX1lfUE9TSVRJT04iLCJDaGFyZ2VOb2RlIiwiY29uc3RydWN0b3IiLCJtb2RlbCIsImNoYXJnZU9iamVjdE1vZGVsIiwibGF5b3V0Qm91bmRzIiwibW9kZWxWaWV3VHJhbnNmb3JtIiwiYWxlcnRNYW5hZ2VyIiwiZm9yY2VEZXNjcmliZXIiLCJwb3NpdGlvbkRlc2NyaWJlciIsIm9wdGlvbnMiLCJsYWJlbCIsIm90aGVyT2JqZWN0TGFiZWwiLCJzY2llbnRpZmljTm90YXRpb25Nb2RlIiwic25hcFRvTmVhcmVzdCIsInNuYXBPYmplY3RzVG9OZWFyZXN0IiwiYXR0cmFjdE5lZ2F0aXZlIiwieSIsInB1bGxlck5vZGVPcHRpb25zIiwiZGlzcGxheVNoYWRvdyIsImFycm93Tm9kZU9wdGlvbnMiLCJtYXhBcnJvd1dpZHRoIiwiZm9yY2VSZWFkb3V0RGVjaW1hbFBsYWNlcyIsImxhYmVsRmlsbCIsImZvcmNlQXJyb3dMYWJlbEZpbGxQcm9wZXJ0eSIsImFycm93TGFiZWxGaWxsIiwiYXJyb3dGaWxsIiwiZm9yY2VBcnJvd0ZpbGxQcm9wZXJ0eSIsImFycm93U3Ryb2tlIiwiZm9yY2VBcnJvd1N0cm9rZVByb3BlcnR5IiwibGFiZWxTaGFkb3dGaWxsIiwibGFiZWxTaGFkb3dGaWxsUHJvcGVydHkiLCJiYWNrZ3JvdW5kRmlsbCIsImJhY2tncm91bmRQcm9wZXJ0eSIsImxhYmVsT3B0aW9ucyIsImZpbGwiLCJ0YW5kZW0iLCJSRVFVSVJFRCIsImExMXlDcmVhdGVBcmlhVmFsdWVUZXh0IiwiZm9ybWF0dGVkVmFsdWUiLCJmb3JjZVZhbHVlc0Rpc3BsYXlQcm9wZXJ0eSIsImxhenlMaW5rIiwicmVkcmF3Rm9yY2UiLCJiaW5kIiwib2JqZWN0Q2lyY2xlIiwic3Ryb2tlIiwibGluZVdpZHRoIiwidXBkYXRlR3JhZGllbnQiLCJiYXNlQ29sb3IiLCJyYWRpdXMiLCJtb2RlbFRvVmlld0RlbHRhWCIsIm9iamVjdE1vZGVsIiwicmFkaXVzUHJvcGVydHkiLCJnZXQiLCJhZGRDb2xvclN0b3AiLCJjb2xvclV0aWxzQnJpZ2h0ZXIiLCJ0b0NTUyIsImFycm93Tm9kZSIsInZhbHVlIiwiU0NJRU5USUZJQyIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiQ2hhcmdlTm9kZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNy0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBTY2VuZXJ5IG5vZGUgZm9yIHRoZSBjaGFyZ2Ugb2JqZWN0LiBDaGlsZHJlbiBpbmNsdWRlIHRoZSBwdXNoZXIvcHVsbGVycywgdGhlIGNpcmN1bGFyIGNoYXJnZSwgdGhlIGZvcmNlIGFycm93LCBhbmRcclxuICogYWxsIGxhYmVscy4gTW9zdCBpbnN0YW50aWF0aW9uIGRldGFpbHMgYXJlIGhhbmRsZWQgaW4gSVNMQ09iamVjdE5vZGUgaW5jbHVkaW5nIGFsbCBQcm9wZXJ0eSBsaW5raW5nIGFuZCBkcmF3aW5nLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEplc3NlIEdyZWVuYmVyZyAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICogQGF1dGhvciBNaWNoYWVsIEJhcmxvdyAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICpcclxuICovXHJcblxyXG5pbXBvcnQgRm9yY2VWYWx1ZXNEaXNwbGF5RW51bSBmcm9tICcuLi8uLi8uLi8uLi9pbnZlcnNlLXNxdWFyZS1sYXctY29tbW9uL2pzL21vZGVsL0ZvcmNlVmFsdWVzRGlzcGxheUVudW0uanMnO1xyXG5pbXBvcnQgSVNMQ09iamVjdE5vZGUgZnJvbSAnLi4vLi4vLi4vLi4vaW52ZXJzZS1zcXVhcmUtbGF3LWNvbW1vbi9qcy92aWV3L0lTTENPYmplY3ROb2RlLmpzJztcclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCB7IFJhZGlhbEdyYWRpZW50IH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcclxuaW1wb3J0IGNvdWxvbWJzTGF3IGZyb20gJy4uLy4uL2NvdWxvbWJzTGF3LmpzJztcclxuaW1wb3J0IENvdWxvbWJzTGF3Q29sb3JzIGZyb20gJy4uL0NvdWxvbWJzTGF3Q29sb3JzLmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBDSEFSR0VfTk9ERV9ZX1BPU0lUSU9OID0gMjA1O1xyXG5cclxuY2xhc3MgQ2hhcmdlTm9kZSBleHRlbmRzIElTTENPYmplY3ROb2RlIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtDb3Vsb21ic0xhd0NvbW1vbk1vZGVsfSBtb2RlbFxyXG4gICAqIEBwYXJhbSB7Q2hhcmdlfSBjaGFyZ2VPYmplY3RNb2RlbFxyXG4gICAqIEBwYXJhbSB7Qm91bmRzMn0gbGF5b3V0Qm91bmRzXHJcbiAgICogQHBhcmFtIHtNb2RlbFZpZXdUcmFuc2Zvcm0yfSBtb2RlbFZpZXdUcmFuc2Zvcm1cclxuICAgKiBAcGFyYW0ge0lTTENBbGVydE1hbmFnZXJ9IGFsZXJ0TWFuYWdlclxyXG4gICAqIEBwYXJhbSB7Rm9yY2VEZXNjcmliZXJ9IGZvcmNlRGVzY3JpYmVyXHJcbiAgICogQHBhcmFtIHtQb3NpdGlvbkRlc2NyaWJlcn0gcG9zaXRpb25EZXNjcmliZXJcclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIG1vZGVsLCBjaGFyZ2VPYmplY3RNb2RlbCwgbGF5b3V0Qm91bmRzLCBtb2RlbFZpZXdUcmFuc2Zvcm0sIGFsZXJ0TWFuYWdlciwgZm9yY2VEZXNjcmliZXIsIHBvc2l0aW9uRGVzY3JpYmVyLCBvcHRpb25zICkge1xyXG5cclxuICAgIG9wdGlvbnMgPSBtZXJnZSgge1xyXG4gICAgICBsYWJlbDogJ1RoaXMgQ2hhcmdlJywgLy8gVE9ETzogZmFjdG9yIG91dCBpbnRvIHN0cmluZ3MgZmlsZXNcclxuICAgICAgb3RoZXJPYmplY3RMYWJlbDogJ090aGVyIENoYXJnZScsXHJcbiAgICAgIHNjaWVudGlmaWNOb3RhdGlvbk1vZGU6IHRydWUsXHJcbiAgICAgIHNuYXBUb05lYXJlc3Q6IG1vZGVsLnNuYXBPYmplY3RzVG9OZWFyZXN0LFxyXG4gICAgICBhdHRyYWN0TmVnYXRpdmU6IHRydWUsXHJcbiAgICAgIHk6IENIQVJHRV9OT0RFX1lfUE9TSVRJT04sXHJcblxyXG4gICAgICBwdWxsZXJOb2RlT3B0aW9uczoge1xyXG4gICAgICAgIGRpc3BsYXlTaGFkb3c6IGZhbHNlXHJcbiAgICAgIH0sXHJcblxyXG4gICAgICBhcnJvd05vZGVPcHRpb25zOiB7XHJcbiAgICAgICAgbWF4QXJyb3dXaWR0aDogNTAsXHJcbiAgICAgICAgZm9yY2VSZWFkb3V0RGVjaW1hbFBsYWNlczogOSxcclxuXHJcbiAgICAgICAgLy8gY29sb3JzIGZvciBwcm9qZWN0b3IgYW5kIGRlZmF1bHQgbW9kZXNcclxuICAgICAgICBsYWJlbEZpbGw6IENvdWxvbWJzTGF3Q29sb3JzLmZvcmNlQXJyb3dMYWJlbEZpbGxQcm9wZXJ0eSxcclxuICAgICAgICBhcnJvd0xhYmVsRmlsbDogQ291bG9tYnNMYXdDb2xvcnMuZm9yY2VBcnJvd0xhYmVsRmlsbFByb3BlcnR5LFxyXG4gICAgICAgIGFycm93RmlsbDogQ291bG9tYnNMYXdDb2xvcnMuZm9yY2VBcnJvd0ZpbGxQcm9wZXJ0eSxcclxuICAgICAgICBhcnJvd1N0cm9rZTogQ291bG9tYnNMYXdDb2xvcnMuZm9yY2VBcnJvd1N0cm9rZVByb3BlcnR5LFxyXG4gICAgICAgIGxhYmVsU2hhZG93RmlsbDogQ291bG9tYnNMYXdDb2xvcnMubGFiZWxTaGFkb3dGaWxsUHJvcGVydHksXHJcbiAgICAgICAgYmFja2dyb3VuZEZpbGw6IENvdWxvbWJzTGF3Q29sb3JzLmJhY2tncm91bmRQcm9wZXJ0eVxyXG4gICAgICB9LFxyXG4gICAgICBsYWJlbE9wdGlvbnM6IHtcclxuICAgICAgICBmaWxsOiBDb3Vsb21ic0xhd0NvbG9ycy5mb3JjZUFycm93TGFiZWxGaWxsUHJvcGVydHlcclxuICAgICAgfSxcclxuXHJcbiAgICAgIC8vIHBoZXQtaW9cclxuICAgICAgdGFuZGVtOiBUYW5kZW0uUkVRVUlSRUQsXHJcblxyXG4gICAgICAvLyBUT0RPOiBwcm9wZXIgc3RpbmcgdXNhZ2VcclxuICAgICAgYTExeUNyZWF0ZUFyaWFWYWx1ZVRleHQ6IGZvcm1hdHRlZFZhbHVlID0+IGAke2Zvcm1hdHRlZFZhbHVlfSBjb3Vsb21ic2BcclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICBzdXBlcihcclxuICAgICAgbW9kZWwsXHJcbiAgICAgIGNoYXJnZU9iamVjdE1vZGVsLFxyXG4gICAgICBsYXlvdXRCb3VuZHMsXHJcbiAgICAgIG1vZGVsVmlld1RyYW5zZm9ybSxcclxuICAgICAgYWxlcnRNYW5hZ2VyLFxyXG4gICAgICBmb3JjZURlc2NyaWJlcixcclxuICAgICAgcG9zaXRpb25EZXNjcmliZXIsXHJcbiAgICAgIG9wdGlvbnNcclxuICAgICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUgLSBVc2VkIGZvciBpbmNyZW1lbnRpbmcgdGhlIHJhZGl1cyB0byBwcmV2ZW50IGRpdmlzaW9uIGJ5IHplcm8gaW4gUmFkaWFsR3JhZGllbnRcclxuICAgIHRoaXMuc25hcFRvTmVhcmVzdCA9IG9wdGlvbnMuc25hcFRvTmVhcmVzdDtcclxuXHJcbiAgICAvLyBmb3JjZSBkaXNwbGF5IFByb3BlcnR5IGlzIG5ldmVyIHJlbW92ZWQvZGVzdHJveWVkLCBubyBkaXNwb3NhbCByZXF1aXJlZFxyXG4gICAgbW9kZWwuZm9yY2VWYWx1ZXNEaXNwbGF5UHJvcGVydHkubGF6eUxpbmsoIHRoaXMucmVkcmF3Rm9yY2UuYmluZCggdGhpcyApICk7XHJcblxyXG4gICAgLy8gc3Ryb2tlIGFkZGVkIGhlcmUgZm9yIHByb2plY3RvciBtb2RlIGFuZCB3aGl0ZSBiZyBwcmludGluZyBvcHRpb25zXHJcbiAgICB0aGlzLm9iamVjdENpcmNsZS5zdHJva2UgPSAnYmxhY2snO1xyXG4gICAgdGhpcy5vYmplY3RDaXJjbGUubGluZVdpZHRoID0gMC41O1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQWx0ZXIgdGhlIHJhZGlhbCBncmFkaWVudCBiYXNlZCBvbiB0aGUgcmFkaXVzIG9mIHRoZSBjaGFyZ2Ugb2JqZWN0XHJcbiAgICogQHBhcmFtICB7Q29sb3J9IGJhc2VDb2xvclxyXG4gICAqIEBwcm90ZWN0ZWRcclxuICAgKiBAb3ZlcnJpZGVcclxuICAgKi9cclxuICB1cGRhdGVHcmFkaWVudCggYmFzZUNvbG9yICkge1xyXG4gICAgbGV0IHJhZGl1cyA9IHRoaXMubW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3RGVsdGFYKCB0aGlzLm9iamVjdE1vZGVsLnJhZGl1c1Byb3BlcnR5LmdldCgpICk7XHJcblxyXG4gICAgLy8gaWYgdGhlIHJhZGl1cyA9IDEsIHJhZGlhbCBncmFkaWVudCB3aWxsIHRocm93IGFuIGRpdmlkZS1ieS16ZXJvIGVycm9yXHJcbiAgICAvLyBlbnN1cmUgaW5lcXVhbGl0eVxyXG4gICAgcmFkaXVzID0gcmFkaXVzID09PSAxID8gcmFkaXVzICsgdGhpcy5zbmFwVG9OZWFyZXN0IDogcmFkaXVzO1xyXG5cclxuICAgIHRoaXMub2JqZWN0Q2lyY2xlLmZpbGwgPSBuZXcgUmFkaWFsR3JhZGllbnQoIC1yYWRpdXMgKiAwLjYsIC1yYWRpdXMgKiAwLjYsIDEsIC1yYWRpdXMgKiAwLjYsIC1yYWRpdXMgKiAwLjYsIHJhZGl1cyApXHJcbiAgICAgIC5hZGRDb2xvclN0b3AoIDAsIGJhc2VDb2xvci5jb2xvclV0aWxzQnJpZ2h0ZXIoIDAuNSApLnRvQ1NTKCkgKVxyXG4gICAgICAuYWRkQ29sb3JTdG9wKCAxLCBiYXNlQ29sb3IudG9DU1MoKSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogVXBkYXRlcyB0aGUgbm9kZSdzIGFycm93IGxlbmd0aCwgZm9yY2UgcmVhZG91dCwgYW5kIHB1bGxlciBpbWFnZS5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqL1xyXG4gIHJlZHJhd0ZvcmNlKCkge1xyXG4gICAgdGhpcy5hcnJvd05vZGUuc2NpZW50aWZpY05vdGF0aW9uTW9kZSA9IHRoaXMubW9kZWwuZm9yY2VWYWx1ZXNEaXNwbGF5UHJvcGVydHkudmFsdWUgPT09IEZvcmNlVmFsdWVzRGlzcGxheUVudW0uU0NJRU5USUZJQztcclxuICAgIHN1cGVyLnJlZHJhd0ZvcmNlKCk7XHJcbiAgfVxyXG59XHJcblxyXG5jb3Vsb21ic0xhdy5yZWdpc3RlciggJ0NoYXJnZU5vZGUnLCBDaGFyZ2VOb2RlICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBDaGFyZ2VOb2RlOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxzQkFBc0IsTUFBTSwwRUFBMEU7QUFDN0csT0FBT0MsY0FBYyxNQUFNLGlFQUFpRTtBQUM1RixPQUFPQyxLQUFLLE1BQU0sbUNBQW1DO0FBQ3JELFNBQVNDLGNBQWMsUUFBUSxtQ0FBbUM7QUFDbEUsT0FBT0MsTUFBTSxNQUFNLGlDQUFpQztBQUNwRCxPQUFPQyxXQUFXLE1BQU0sc0JBQXNCO0FBQzlDLE9BQU9DLGlCQUFpQixNQUFNLHlCQUF5Qjs7QUFFdkQ7QUFDQSxNQUFNQyxzQkFBc0IsR0FBRyxHQUFHO0FBRWxDLE1BQU1DLFVBQVUsU0FBU1AsY0FBYyxDQUFDO0VBRXRDO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VRLFdBQVdBLENBQUVDLEtBQUssRUFBRUMsaUJBQWlCLEVBQUVDLFlBQVksRUFBRUMsa0JBQWtCLEVBQUVDLFlBQVksRUFBRUMsY0FBYyxFQUFFQyxpQkFBaUIsRUFBRUMsT0FBTyxFQUFHO0lBRWxJQSxPQUFPLEdBQUdmLEtBQUssQ0FBRTtNQUNmZ0IsS0FBSyxFQUFFLGFBQWE7TUFBRTtNQUN0QkMsZ0JBQWdCLEVBQUUsY0FBYztNQUNoQ0Msc0JBQXNCLEVBQUUsSUFBSTtNQUM1QkMsYUFBYSxFQUFFWCxLQUFLLENBQUNZLG9CQUFvQjtNQUN6Q0MsZUFBZSxFQUFFLElBQUk7TUFDckJDLENBQUMsRUFBRWpCLHNCQUFzQjtNQUV6QmtCLGlCQUFpQixFQUFFO1FBQ2pCQyxhQUFhLEVBQUU7TUFDakIsQ0FBQztNQUVEQyxnQkFBZ0IsRUFBRTtRQUNoQkMsYUFBYSxFQUFFLEVBQUU7UUFDakJDLHlCQUF5QixFQUFFLENBQUM7UUFFNUI7UUFDQUMsU0FBUyxFQUFFeEIsaUJBQWlCLENBQUN5QiwyQkFBMkI7UUFDeERDLGNBQWMsRUFBRTFCLGlCQUFpQixDQUFDeUIsMkJBQTJCO1FBQzdERSxTQUFTLEVBQUUzQixpQkFBaUIsQ0FBQzRCLHNCQUFzQjtRQUNuREMsV0FBVyxFQUFFN0IsaUJBQWlCLENBQUM4Qix3QkFBd0I7UUFDdkRDLGVBQWUsRUFBRS9CLGlCQUFpQixDQUFDZ0MsdUJBQXVCO1FBQzFEQyxjQUFjLEVBQUVqQyxpQkFBaUIsQ0FBQ2tDO01BQ3BDLENBQUM7TUFDREMsWUFBWSxFQUFFO1FBQ1pDLElBQUksRUFBRXBDLGlCQUFpQixDQUFDeUI7TUFDMUIsQ0FBQztNQUVEO01BQ0FZLE1BQU0sRUFBRXZDLE1BQU0sQ0FBQ3dDLFFBQVE7TUFFdkI7TUFDQUMsdUJBQXVCLEVBQUVDLGNBQWMsSUFBSyxHQUFFQSxjQUFlO0lBQy9ELENBQUMsRUFBRTdCLE9BQVEsQ0FBQztJQUVaLEtBQUssQ0FDSFAsS0FBSyxFQUNMQyxpQkFBaUIsRUFDakJDLFlBQVksRUFDWkMsa0JBQWtCLEVBQ2xCQyxZQUFZLEVBQ1pDLGNBQWMsRUFDZEMsaUJBQWlCLEVBQ2pCQyxPQUNGLENBQUM7O0lBRUQ7SUFDQSxJQUFJLENBQUNJLGFBQWEsR0FBR0osT0FBTyxDQUFDSSxhQUFhOztJQUUxQztJQUNBWCxLQUFLLENBQUNxQywwQkFBMEIsQ0FBQ0MsUUFBUSxDQUFFLElBQUksQ0FBQ0MsV0FBVyxDQUFDQyxJQUFJLENBQUUsSUFBSyxDQUFFLENBQUM7O0lBRTFFO0lBQ0EsSUFBSSxDQUFDQyxZQUFZLENBQUNDLE1BQU0sR0FBRyxPQUFPO0lBQ2xDLElBQUksQ0FBQ0QsWUFBWSxDQUFDRSxTQUFTLEdBQUcsR0FBRztFQUNuQzs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRUMsY0FBY0EsQ0FBRUMsU0FBUyxFQUFHO0lBQzFCLElBQUlDLE1BQU0sR0FBRyxJQUFJLENBQUMzQyxrQkFBa0IsQ0FBQzRDLGlCQUFpQixDQUFFLElBQUksQ0FBQ0MsV0FBVyxDQUFDQyxjQUFjLENBQUNDLEdBQUcsQ0FBQyxDQUFFLENBQUM7O0lBRS9GO0lBQ0E7SUFDQUosTUFBTSxHQUFHQSxNQUFNLEtBQUssQ0FBQyxHQUFHQSxNQUFNLEdBQUcsSUFBSSxDQUFDbkMsYUFBYSxHQUFHbUMsTUFBTTtJQUU1RCxJQUFJLENBQUNMLFlBQVksQ0FBQ1QsSUFBSSxHQUFHLElBQUl2QyxjQUFjLENBQUUsQ0FBQ3FELE1BQU0sR0FBRyxHQUFHLEVBQUUsQ0FBQ0EsTUFBTSxHQUFHLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQ0EsTUFBTSxHQUFHLEdBQUcsRUFBRSxDQUFDQSxNQUFNLEdBQUcsR0FBRyxFQUFFQSxNQUFPLENBQUMsQ0FDakhLLFlBQVksQ0FBRSxDQUFDLEVBQUVOLFNBQVMsQ0FBQ08sa0JBQWtCLENBQUUsR0FBSSxDQUFDLENBQUNDLEtBQUssQ0FBQyxDQUFFLENBQUMsQ0FDOURGLFlBQVksQ0FBRSxDQUFDLEVBQUVOLFNBQVMsQ0FBQ1EsS0FBSyxDQUFDLENBQUUsQ0FBQztFQUN6Qzs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtFQUNFZCxXQUFXQSxDQUFBLEVBQUc7SUFDWixJQUFJLENBQUNlLFNBQVMsQ0FBQzVDLHNCQUFzQixHQUFHLElBQUksQ0FBQ1YsS0FBSyxDQUFDcUMsMEJBQTBCLENBQUNrQixLQUFLLEtBQUtqRSxzQkFBc0IsQ0FBQ2tFLFVBQVU7SUFDekgsS0FBSyxDQUFDakIsV0FBVyxDQUFDLENBQUM7RUFDckI7QUFDRjtBQUVBNUMsV0FBVyxDQUFDOEQsUUFBUSxDQUFFLFlBQVksRUFBRTNELFVBQVcsQ0FBQztBQUVoRCxlQUFlQSxVQUFVIn0=