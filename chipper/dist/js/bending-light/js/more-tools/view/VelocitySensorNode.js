// Copyright 2015-2023, University of Colorado Boulder

/**
 * View for the Velocity Sensor tool. Measures the velocity at the sensor's tip and shows it in the display box. Also
 * points a blue arrow along the direction of the velocity and the arrow length is proportional to the velocity.  The
 * origin of the node (0,0) in the node's coordinate frame is at the hot spot, the left side of the triangle, where
 * the velocity vector arrow appears.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Siddhartha Chinthapally (Actual Concepts)
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import Utils from '../../../../dot/js/Utils.js';
import { Shape } from '../../../../kite/js/imports.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import ArrowShape from '../../../../scenery-phet/js/ArrowShape.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import ShadedRectangle from '../../../../scenery-phet/js/ShadedRectangle.js';
import { Color, LinearGradient, Node, Path, Rectangle, Text } from '../../../../scenery/js/imports.js';
import BendingLightStrings from '../../BendingLightStrings.js';
import bendingLight from '../../bendingLight.js';
import BendingLightConstants from '../../common/BendingLightConstants.js';
import Multilink from '../../../../axon/js/Multilink.js';
const speedString = BendingLightStrings.speed;
const unknownVelocityString = BendingLightStrings.unknownVelocity;
const velocityPatternString = BendingLightStrings.velocityPattern;
class VelocitySensorNode extends Node {
  /**
   * @param modelViewTransform - Transform between model and view coordinate frames
   * @param velocitySensor - model for the velocity sensor
   * @param arrowScale - scale to be applied for the velocity value to display as arrow
   * @param [providedOptions]
   */
  constructor(modelViewTransform, velocitySensor, arrowScale, providedOptions) {
    super({
      cursor: 'pointer',
      pickable: true
    });
    this.modelViewTransform = modelViewTransform; // (read-only)
    this.velocitySensor = velocitySensor; // (read-only)

    const rectangleWidth = 54;
    const rectangleHeight = 37;
    this.bodyNode = new Node();
    const triangleHeight = 15;
    const triangleWidth = 8;

    // Adding triangle shape
    const triangleShapeNode = new Path(new Shape().moveTo(0, 0).lineTo(triangleWidth, -triangleHeight / 2).lineTo(triangleWidth, +triangleHeight / 2).close(), {
      fill: '#CF8702',
      stroke: '#844702'
    });
    this.bodyNode.addChild(triangleShapeNode);

    // Adding outer rectangle
    const bodyColor = new Color('#CF8702');
    const arc = 7.5;
    const bodyRectangle = new Rectangle(0, 0, rectangleWidth, rectangleHeight, arc, arc, {
      stroke: '#844702',
      fill: new LinearGradient(0, 0, 0, rectangleHeight)

      // Highlights on top
      .addColorStop(0.0, bodyColor.colorUtilsBrightness(+0.4)).addColorStop(0.1, bodyColor.colorUtilsBrightness(+0.1)).addColorStop(0.6, bodyColor.colorUtilsBrightness(+0.0))

      // Shadows on bottom
      .addColorStop(0.9, bodyColor.colorUtilsBrightness(-0.1)).addColorStop(1.0, bodyColor.colorUtilsBrightness(-0.3)),
      lineWidth: 1,
      left: triangleShapeNode.right - 2,
      centerY: triangleShapeNode.centerY
    });
    this.bodyNode.addChild(bodyRectangle);

    // Adding velocity meter title text
    const titleText = new Text(speedString, {
      fill: 'black',
      font: new PhetFont(10),
      maxWidth: rectangleWidth - 7.5,
      centerX: bodyRectangle.centerX,
      bottom: bodyRectangle.bottom - 5
    });
    this.bodyNode.addChild(titleText);

    // Adding inner rectangle
    const whiteTextArea = new ShadedRectangle(new Bounds2(0, 0, rectangleWidth - 15, rectangleHeight - 22.5), {
      baseColor: 'white',
      lightSource: 'rightBottom',
      cornerRadius: 3,
      centerX: bodyRectangle.centerX,
      top: bodyRectangle.top + 3
    });
    this.bodyNode.addChild(whiteTextArea);

    // Adding velocity measure label
    const labelText = new Text('', {
      fill: 'black',
      font: new PhetFont(10),
      center: whiteTextArea.center
    });
    this.bodyNode.addChild(labelText);
    this.addChild(this.bodyNode);

    // Arrow shape
    const arrowWidth = 6;
    this.arrowShape = new Path(null, {
      fill: 'blue',
      opacity: 0.6
    });
    this.bodyNode.addChild(this.arrowShape);
    velocitySensor.valueProperty.link(velocity => {
      const positionX = modelViewTransform.modelToViewDeltaX(velocity.x) * arrowScale;
      const positionY = modelViewTransform.modelToViewDeltaY(velocity.y) * arrowScale;

      // update the arrow shape when the velocity value changes
      this.arrowShape.setShape(new ArrowShape(0, 0, positionX, positionY, {
        tailWidth: arrowWidth,
        headWidth: 2 * arrowWidth,
        headHeight: 2 * arrowWidth
      }));
    });
    velocitySensor.isArrowVisibleProperty.linkAttribute(this.arrowShape, 'visible');

    // update the velocity node position
    velocitySensor.positionProperty.link(position => {
      const velocitySensorXPosition = modelViewTransform.modelToViewX(position.x);
      const velocitySensorYPosition = modelViewTransform.modelToViewY(position.y);
      this.setTranslation(velocitySensorXPosition, velocitySensorYPosition);
    });

    // Update the text when the value or units changes.
    Multilink.multilink([velocitySensor.valueProperty, velocitySensor.positionProperty], (velocity, position) => {
      // add '?' for null velocity
      if (velocity.magnitude === 0) {
        labelText.string = unknownVelocityString;
      } else {
        const stringNumber = Utils.toFixed(velocity.magnitude / BendingLightConstants.SPEED_OF_LIGHT, 2);
        const text = StringUtils.format(velocityPatternString, stringNumber);
        labelText.setString(text);
      }
      labelText.center = whiteTextArea.center;
    });

    // Overall scaling, vestigial
    this.bodyNode.setScaleMagnitude(0.7);
    this.mutate(providedOptions);
  }
}
bendingLight.register('VelocitySensorNode', VelocitySensorNode);
export default VelocitySensorNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb3VuZHMyIiwiVXRpbHMiLCJTaGFwZSIsIlN0cmluZ1V0aWxzIiwiQXJyb3dTaGFwZSIsIlBoZXRGb250IiwiU2hhZGVkUmVjdGFuZ2xlIiwiQ29sb3IiLCJMaW5lYXJHcmFkaWVudCIsIk5vZGUiLCJQYXRoIiwiUmVjdGFuZ2xlIiwiVGV4dCIsIkJlbmRpbmdMaWdodFN0cmluZ3MiLCJiZW5kaW5nTGlnaHQiLCJCZW5kaW5nTGlnaHRDb25zdGFudHMiLCJNdWx0aWxpbmsiLCJzcGVlZFN0cmluZyIsInNwZWVkIiwidW5rbm93blZlbG9jaXR5U3RyaW5nIiwidW5rbm93blZlbG9jaXR5IiwidmVsb2NpdHlQYXR0ZXJuU3RyaW5nIiwidmVsb2NpdHlQYXR0ZXJuIiwiVmVsb2NpdHlTZW5zb3JOb2RlIiwiY29uc3RydWN0b3IiLCJtb2RlbFZpZXdUcmFuc2Zvcm0iLCJ2ZWxvY2l0eVNlbnNvciIsImFycm93U2NhbGUiLCJwcm92aWRlZE9wdGlvbnMiLCJjdXJzb3IiLCJwaWNrYWJsZSIsInJlY3RhbmdsZVdpZHRoIiwicmVjdGFuZ2xlSGVpZ2h0IiwiYm9keU5vZGUiLCJ0cmlhbmdsZUhlaWdodCIsInRyaWFuZ2xlV2lkdGgiLCJ0cmlhbmdsZVNoYXBlTm9kZSIsIm1vdmVUbyIsImxpbmVUbyIsImNsb3NlIiwiZmlsbCIsInN0cm9rZSIsImFkZENoaWxkIiwiYm9keUNvbG9yIiwiYXJjIiwiYm9keVJlY3RhbmdsZSIsImFkZENvbG9yU3RvcCIsImNvbG9yVXRpbHNCcmlnaHRuZXNzIiwibGluZVdpZHRoIiwibGVmdCIsInJpZ2h0IiwiY2VudGVyWSIsInRpdGxlVGV4dCIsImZvbnQiLCJtYXhXaWR0aCIsImNlbnRlclgiLCJib3R0b20iLCJ3aGl0ZVRleHRBcmVhIiwiYmFzZUNvbG9yIiwibGlnaHRTb3VyY2UiLCJjb3JuZXJSYWRpdXMiLCJ0b3AiLCJsYWJlbFRleHQiLCJjZW50ZXIiLCJhcnJvd1dpZHRoIiwiYXJyb3dTaGFwZSIsIm9wYWNpdHkiLCJ2YWx1ZVByb3BlcnR5IiwibGluayIsInZlbG9jaXR5IiwicG9zaXRpb25YIiwibW9kZWxUb1ZpZXdEZWx0YVgiLCJ4IiwicG9zaXRpb25ZIiwibW9kZWxUb1ZpZXdEZWx0YVkiLCJ5Iiwic2V0U2hhcGUiLCJ0YWlsV2lkdGgiLCJoZWFkV2lkdGgiLCJoZWFkSGVpZ2h0IiwiaXNBcnJvd1Zpc2libGVQcm9wZXJ0eSIsImxpbmtBdHRyaWJ1dGUiLCJwb3NpdGlvblByb3BlcnR5IiwicG9zaXRpb24iLCJ2ZWxvY2l0eVNlbnNvclhQb3NpdGlvbiIsIm1vZGVsVG9WaWV3WCIsInZlbG9jaXR5U2Vuc29yWVBvc2l0aW9uIiwibW9kZWxUb1ZpZXdZIiwic2V0VHJhbnNsYXRpb24iLCJtdWx0aWxpbmsiLCJtYWduaXR1ZGUiLCJzdHJpbmciLCJzdHJpbmdOdW1iZXIiLCJ0b0ZpeGVkIiwiU1BFRURfT0ZfTElHSFQiLCJ0ZXh0IiwiZm9ybWF0Iiwic2V0U3RyaW5nIiwic2V0U2NhbGVNYWduaXR1ZGUiLCJtdXRhdGUiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlZlbG9jaXR5U2Vuc29yTm9kZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNS0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBWaWV3IGZvciB0aGUgVmVsb2NpdHkgU2Vuc29yIHRvb2wuIE1lYXN1cmVzIHRoZSB2ZWxvY2l0eSBhdCB0aGUgc2Vuc29yJ3MgdGlwIGFuZCBzaG93cyBpdCBpbiB0aGUgZGlzcGxheSBib3guIEFsc29cclxuICogcG9pbnRzIGEgYmx1ZSBhcnJvdyBhbG9uZyB0aGUgZGlyZWN0aW9uIG9mIHRoZSB2ZWxvY2l0eSBhbmQgdGhlIGFycm93IGxlbmd0aCBpcyBwcm9wb3J0aW9uYWwgdG8gdGhlIHZlbG9jaXR5LiAgVGhlXHJcbiAqIG9yaWdpbiBvZiB0aGUgbm9kZSAoMCwwKSBpbiB0aGUgbm9kZSdzIGNvb3JkaW5hdGUgZnJhbWUgaXMgYXQgdGhlIGhvdCBzcG90LCB0aGUgbGVmdCBzaWRlIG9mIHRoZSB0cmlhbmdsZSwgd2hlcmVcclxuICogdGhlIHZlbG9jaXR5IHZlY3RvciBhcnJvdyBhcHBlYXJzLlxyXG4gKlxyXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKiBAYXV0aG9yIFNpZGRoYXJ0aGEgQ2hpbnRoYXBhbGx5IChBY3R1YWwgQ29uY2VwdHMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL0JvdW5kczIuanMnO1xyXG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1V0aWxzLmpzJztcclxuaW1wb3J0IHsgU2hhcGUgfSBmcm9tICcuLi8uLi8uLi8uLi9raXRlL2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgU3RyaW5nVXRpbHMgZnJvbSAnLi4vLi4vLi4vLi4vcGhldGNvbW1vbi9qcy91dGlsL1N0cmluZ1V0aWxzLmpzJztcclxuaW1wb3J0IEFycm93U2hhcGUgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL0Fycm93U2hhcGUuanMnO1xyXG5pbXBvcnQgUGhldEZvbnQgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1BoZXRGb250LmpzJztcclxuaW1wb3J0IFNoYWRlZFJlY3RhbmdsZSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvU2hhZGVkUmVjdGFuZ2xlLmpzJztcclxuaW1wb3J0IHsgQ29sb3IsIExpbmVhckdyYWRpZW50LCBOb2RlLCBOb2RlT3B0aW9ucywgUGF0aCwgUmVjdGFuZ2xlLCBUZXh0IH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IEJlbmRpbmdMaWdodFN0cmluZ3MgZnJvbSAnLi4vLi4vQmVuZGluZ0xpZ2h0U3RyaW5ncy5qcyc7XHJcbmltcG9ydCBiZW5kaW5nTGlnaHQgZnJvbSAnLi4vLi4vYmVuZGluZ0xpZ2h0LmpzJztcclxuaW1wb3J0IEJlbmRpbmdMaWdodENvbnN0YW50cyBmcm9tICcuLi8uLi9jb21tb24vQmVuZGluZ0xpZ2h0Q29uc3RhbnRzLmpzJztcclxuaW1wb3J0IE1vZGVsVmlld1RyYW5zZm9ybTIgZnJvbSAnLi4vLi4vLi4vLi4vcGhldGNvbW1vbi9qcy92aWV3L01vZGVsVmlld1RyYW5zZm9ybTIuanMnO1xyXG5pbXBvcnQgVmVsb2NpdHlTZW5zb3IgZnJvbSAnLi4vbW9kZWwvVmVsb2NpdHlTZW5zb3IuanMnO1xyXG5pbXBvcnQgTXVsdGlsaW5rIGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvTXVsdGlsaW5rLmpzJztcclxuXHJcbmNvbnN0IHNwZWVkU3RyaW5nID0gQmVuZGluZ0xpZ2h0U3RyaW5ncy5zcGVlZDtcclxuY29uc3QgdW5rbm93blZlbG9jaXR5U3RyaW5nID0gQmVuZGluZ0xpZ2h0U3RyaW5ncy51bmtub3duVmVsb2NpdHk7XHJcbmNvbnN0IHZlbG9jaXR5UGF0dGVyblN0cmluZyA9IEJlbmRpbmdMaWdodFN0cmluZ3MudmVsb2NpdHlQYXR0ZXJuO1xyXG5cclxuY2xhc3MgVmVsb2NpdHlTZW5zb3JOb2RlIGV4dGVuZHMgTm9kZSB7XHJcbiAgcHJpdmF0ZSBtb2RlbFZpZXdUcmFuc2Zvcm06IE1vZGVsVmlld1RyYW5zZm9ybTI7XHJcbiAgcHJpdmF0ZSB2ZWxvY2l0eVNlbnNvcjogVmVsb2NpdHlTZW5zb3I7XHJcbiAgcHJpdmF0ZSByZWFkb25seSBib2R5Tm9kZTogTm9kZTtcclxuICBwcml2YXRlIGFycm93U2hhcGU6IFBhdGg7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSBtb2RlbFZpZXdUcmFuc2Zvcm0gLSBUcmFuc2Zvcm0gYmV0d2VlbiBtb2RlbCBhbmQgdmlldyBjb29yZGluYXRlIGZyYW1lc1xyXG4gICAqIEBwYXJhbSB2ZWxvY2l0eVNlbnNvciAtIG1vZGVsIGZvciB0aGUgdmVsb2NpdHkgc2Vuc29yXHJcbiAgICogQHBhcmFtIGFycm93U2NhbGUgLSBzY2FsZSB0byBiZSBhcHBsaWVkIGZvciB0aGUgdmVsb2NpdHkgdmFsdWUgdG8gZGlzcGxheSBhcyBhcnJvd1xyXG4gICAqIEBwYXJhbSBbcHJvdmlkZWRPcHRpb25zXVxyXG4gICAqL1xyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggbW9kZWxWaWV3VHJhbnNmb3JtOiBNb2RlbFZpZXdUcmFuc2Zvcm0yLCB2ZWxvY2l0eVNlbnNvcjogVmVsb2NpdHlTZW5zb3IsIGFycm93U2NhbGU6IG51bWJlciwgcHJvdmlkZWRPcHRpb25zPzogTm9kZU9wdGlvbnMgKSB7XHJcblxyXG4gICAgc3VwZXIoIHtcclxuICAgICAgY3Vyc29yOiAncG9pbnRlcicsXHJcbiAgICAgIHBpY2thYmxlOiB0cnVlXHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5tb2RlbFZpZXdUcmFuc2Zvcm0gPSBtb2RlbFZpZXdUcmFuc2Zvcm07IC8vIChyZWFkLW9ubHkpXHJcbiAgICB0aGlzLnZlbG9jaXR5U2Vuc29yID0gdmVsb2NpdHlTZW5zb3I7IC8vIChyZWFkLW9ubHkpXHJcblxyXG4gICAgY29uc3QgcmVjdGFuZ2xlV2lkdGggPSA1NDtcclxuICAgIGNvbnN0IHJlY3RhbmdsZUhlaWdodCA9IDM3O1xyXG4gICAgdGhpcy5ib2R5Tm9kZSA9IG5ldyBOb2RlKCk7XHJcblxyXG4gICAgY29uc3QgdHJpYW5nbGVIZWlnaHQgPSAxNTtcclxuICAgIGNvbnN0IHRyaWFuZ2xlV2lkdGggPSA4O1xyXG5cclxuICAgIC8vIEFkZGluZyB0cmlhbmdsZSBzaGFwZVxyXG4gICAgY29uc3QgdHJpYW5nbGVTaGFwZU5vZGUgPSBuZXcgUGF0aCggbmV3IFNoYXBlKClcclxuICAgICAgLm1vdmVUbyggMCwgMCApXHJcbiAgICAgIC5saW5lVG8oIHRyaWFuZ2xlV2lkdGgsIC10cmlhbmdsZUhlaWdodCAvIDIgKVxyXG4gICAgICAubGluZVRvKCB0cmlhbmdsZVdpZHRoLCArdHJpYW5nbGVIZWlnaHQgLyAyIClcclxuICAgICAgLmNsb3NlKCksIHtcclxuICAgICAgZmlsbDogJyNDRjg3MDInLFxyXG4gICAgICBzdHJva2U6ICcjODQ0NzAyJ1xyXG4gICAgfSApO1xyXG4gICAgdGhpcy5ib2R5Tm9kZS5hZGRDaGlsZCggdHJpYW5nbGVTaGFwZU5vZGUgKTtcclxuXHJcbiAgICAvLyBBZGRpbmcgb3V0ZXIgcmVjdGFuZ2xlXHJcbiAgICBjb25zdCBib2R5Q29sb3IgPSBuZXcgQ29sb3IoICcjQ0Y4NzAyJyApO1xyXG4gICAgY29uc3QgYXJjID0gNy41O1xyXG4gICAgY29uc3QgYm9keVJlY3RhbmdsZSA9IG5ldyBSZWN0YW5nbGUoIDAsIDAsIHJlY3RhbmdsZVdpZHRoLCByZWN0YW5nbGVIZWlnaHQsIGFyYywgYXJjLCB7XHJcbiAgICAgIHN0cm9rZTogJyM4NDQ3MDInLFxyXG4gICAgICBmaWxsOiBuZXcgTGluZWFyR3JhZGllbnQoIDAsIDAsIDAsIHJlY3RhbmdsZUhlaWdodCApXHJcblxyXG4gICAgICAgIC8vIEhpZ2hsaWdodHMgb24gdG9wXHJcbiAgICAgICAgLmFkZENvbG9yU3RvcCggMC4wLCBib2R5Q29sb3IuY29sb3JVdGlsc0JyaWdodG5lc3MoICswLjQgKSApXHJcbiAgICAgICAgLmFkZENvbG9yU3RvcCggMC4xLCBib2R5Q29sb3IuY29sb3JVdGlsc0JyaWdodG5lc3MoICswLjEgKSApXHJcbiAgICAgICAgLmFkZENvbG9yU3RvcCggMC42LCBib2R5Q29sb3IuY29sb3JVdGlsc0JyaWdodG5lc3MoICswLjAgKSApXHJcblxyXG4gICAgICAgIC8vIFNoYWRvd3Mgb24gYm90dG9tXHJcbiAgICAgICAgLmFkZENvbG9yU3RvcCggMC45LCBib2R5Q29sb3IuY29sb3JVdGlsc0JyaWdodG5lc3MoIC0wLjEgKSApXHJcbiAgICAgICAgLmFkZENvbG9yU3RvcCggMS4wLCBib2R5Q29sb3IuY29sb3JVdGlsc0JyaWdodG5lc3MoIC0wLjMgKSApLFxyXG4gICAgICBsaW5lV2lkdGg6IDEsXHJcbiAgICAgIGxlZnQ6IHRyaWFuZ2xlU2hhcGVOb2RlLnJpZ2h0IC0gMixcclxuICAgICAgY2VudGVyWTogdHJpYW5nbGVTaGFwZU5vZGUuY2VudGVyWVxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5ib2R5Tm9kZS5hZGRDaGlsZCggYm9keVJlY3RhbmdsZSApO1xyXG5cclxuICAgIC8vIEFkZGluZyB2ZWxvY2l0eSBtZXRlciB0aXRsZSB0ZXh0XHJcbiAgICBjb25zdCB0aXRsZVRleHQgPSBuZXcgVGV4dCggc3BlZWRTdHJpbmcsIHtcclxuICAgICAgZmlsbDogJ2JsYWNrJyxcclxuICAgICAgZm9udDogbmV3IFBoZXRGb250KCAxMCApLFxyXG4gICAgICBtYXhXaWR0aDogcmVjdGFuZ2xlV2lkdGggLSA3LjUsXHJcbiAgICAgIGNlbnRlclg6IGJvZHlSZWN0YW5nbGUuY2VudGVyWCxcclxuICAgICAgYm90dG9tOiBib2R5UmVjdGFuZ2xlLmJvdHRvbSAtIDVcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLmJvZHlOb2RlLmFkZENoaWxkKCB0aXRsZVRleHQgKTtcclxuXHJcbiAgICAvLyBBZGRpbmcgaW5uZXIgcmVjdGFuZ2xlXHJcbiAgICBjb25zdCB3aGl0ZVRleHRBcmVhID0gbmV3IFNoYWRlZFJlY3RhbmdsZSggbmV3IEJvdW5kczIoIDAsIDAsIHJlY3RhbmdsZVdpZHRoIC0gMTUsIHJlY3RhbmdsZUhlaWdodCAtIDIyLjUgKSwge1xyXG4gICAgICBiYXNlQ29sb3I6ICd3aGl0ZScsXHJcbiAgICAgIGxpZ2h0U291cmNlOiAncmlnaHRCb3R0b20nLFxyXG4gICAgICBjb3JuZXJSYWRpdXM6IDMsXHJcbiAgICAgIGNlbnRlclg6IGJvZHlSZWN0YW5nbGUuY2VudGVyWCxcclxuICAgICAgdG9wOiBib2R5UmVjdGFuZ2xlLnRvcCArIDNcclxuICAgIH0gKTtcclxuICAgIHRoaXMuYm9keU5vZGUuYWRkQ2hpbGQoIHdoaXRlVGV4dEFyZWEgKTtcclxuXHJcbiAgICAvLyBBZGRpbmcgdmVsb2NpdHkgbWVhc3VyZSBsYWJlbFxyXG4gICAgY29uc3QgbGFiZWxUZXh0ID0gbmV3IFRleHQoICcnLCB7XHJcbiAgICAgIGZpbGw6ICdibGFjaycsXHJcbiAgICAgIGZvbnQ6IG5ldyBQaGV0Rm9udCggMTAgKSxcclxuICAgICAgY2VudGVyOiB3aGl0ZVRleHRBcmVhLmNlbnRlclxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5ib2R5Tm9kZS5hZGRDaGlsZCggbGFiZWxUZXh0ICk7XHJcblxyXG4gICAgdGhpcy5hZGRDaGlsZCggdGhpcy5ib2R5Tm9kZSApO1xyXG5cclxuICAgIC8vIEFycm93IHNoYXBlXHJcbiAgICBjb25zdCBhcnJvd1dpZHRoID0gNjtcclxuICAgIHRoaXMuYXJyb3dTaGFwZSA9IG5ldyBQYXRoKCBudWxsLCB7XHJcbiAgICAgIGZpbGw6ICdibHVlJyxcclxuICAgICAgb3BhY2l0eTogMC42XHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmJvZHlOb2RlLmFkZENoaWxkKCB0aGlzLmFycm93U2hhcGUgKTtcclxuXHJcbiAgICB2ZWxvY2l0eVNlbnNvci52YWx1ZVByb3BlcnR5LmxpbmsoIHZlbG9jaXR5ID0+IHtcclxuXHJcbiAgICAgIGNvbnN0IHBvc2l0aW9uWCA9IG1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld0RlbHRhWCggdmVsb2NpdHkueCApICogYXJyb3dTY2FsZTtcclxuICAgICAgY29uc3QgcG9zaXRpb25ZID0gbW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3RGVsdGFZKCB2ZWxvY2l0eS55ICkgKiBhcnJvd1NjYWxlO1xyXG5cclxuICAgICAgLy8gdXBkYXRlIHRoZSBhcnJvdyBzaGFwZSB3aGVuIHRoZSB2ZWxvY2l0eSB2YWx1ZSBjaGFuZ2VzXHJcbiAgICAgIHRoaXMuYXJyb3dTaGFwZS5zZXRTaGFwZSggbmV3IEFycm93U2hhcGUoIDAsIDAsIHBvc2l0aW9uWCwgcG9zaXRpb25ZLCB7XHJcbiAgICAgICAgdGFpbFdpZHRoOiBhcnJvd1dpZHRoLFxyXG4gICAgICAgIGhlYWRXaWR0aDogMiAqIGFycm93V2lkdGgsXHJcbiAgICAgICAgaGVhZEhlaWdodDogMiAqIGFycm93V2lkdGhcclxuICAgICAgfSApICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgdmVsb2NpdHlTZW5zb3IuaXNBcnJvd1Zpc2libGVQcm9wZXJ0eS5saW5rQXR0cmlidXRlKCB0aGlzLmFycm93U2hhcGUsICd2aXNpYmxlJyApO1xyXG5cclxuICAgIC8vIHVwZGF0ZSB0aGUgdmVsb2NpdHkgbm9kZSBwb3NpdGlvblxyXG4gICAgdmVsb2NpdHlTZW5zb3IucG9zaXRpb25Qcm9wZXJ0eS5saW5rKCBwb3NpdGlvbiA9PiB7XHJcbiAgICAgIGNvbnN0IHZlbG9jaXR5U2Vuc29yWFBvc2l0aW9uID0gbW9kZWxWaWV3VHJhbnNmb3JtLm1vZGVsVG9WaWV3WCggcG9zaXRpb24ueCApO1xyXG4gICAgICBjb25zdCB2ZWxvY2l0eVNlbnNvcllQb3NpdGlvbiA9IG1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld1koIHBvc2l0aW9uLnkgKTtcclxuICAgICAgdGhpcy5zZXRUcmFuc2xhdGlvbiggdmVsb2NpdHlTZW5zb3JYUG9zaXRpb24sIHZlbG9jaXR5U2Vuc29yWVBvc2l0aW9uICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gVXBkYXRlIHRoZSB0ZXh0IHdoZW4gdGhlIHZhbHVlIG9yIHVuaXRzIGNoYW5nZXMuXHJcbiAgICBNdWx0aWxpbmsubXVsdGlsaW5rKCBbIHZlbG9jaXR5U2Vuc29yLnZhbHVlUHJvcGVydHksIHZlbG9jaXR5U2Vuc29yLnBvc2l0aW9uUHJvcGVydHkgXSxcclxuICAgICAgKCB2ZWxvY2l0eSwgcG9zaXRpb24gKSA9PiB7XHJcblxyXG4gICAgICAgIC8vIGFkZCAnPycgZm9yIG51bGwgdmVsb2NpdHlcclxuICAgICAgICBpZiAoIHZlbG9jaXR5Lm1hZ25pdHVkZSA9PT0gMCApIHtcclxuICAgICAgICAgIGxhYmVsVGV4dC5zdHJpbmcgPSB1bmtub3duVmVsb2NpdHlTdHJpbmc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgY29uc3Qgc3RyaW5nTnVtYmVyID0gVXRpbHMudG9GaXhlZCggdmVsb2NpdHkubWFnbml0dWRlIC8gQmVuZGluZ0xpZ2h0Q29uc3RhbnRzLlNQRUVEX09GX0xJR0hULCAyICk7XHJcbiAgICAgICAgICBjb25zdCB0ZXh0ID0gU3RyaW5nVXRpbHMuZm9ybWF0KCB2ZWxvY2l0eVBhdHRlcm5TdHJpbmcsIHN0cmluZ051bWJlciApO1xyXG4gICAgICAgICAgbGFiZWxUZXh0LnNldFN0cmluZyggdGV4dCApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsYWJlbFRleHQuY2VudGVyID0gd2hpdGVUZXh0QXJlYS5jZW50ZXI7XHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAvLyBPdmVyYWxsIHNjYWxpbmcsIHZlc3RpZ2lhbFxyXG4gICAgdGhpcy5ib2R5Tm9kZS5zZXRTY2FsZU1hZ25pdHVkZSggMC43ICk7XHJcblxyXG4gICAgdGhpcy5tdXRhdGUoIHByb3ZpZGVkT3B0aW9ucyApO1xyXG4gIH1cclxufVxyXG5cclxuYmVuZGluZ0xpZ2h0LnJlZ2lzdGVyKCAnVmVsb2NpdHlTZW5zb3JOb2RlJywgVmVsb2NpdHlTZW5zb3JOb2RlICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBWZWxvY2l0eVNlbnNvck5vZGU7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsT0FBTyxNQUFNLCtCQUErQjtBQUNuRCxPQUFPQyxLQUFLLE1BQU0sNkJBQTZCO0FBQy9DLFNBQVNDLEtBQUssUUFBUSxnQ0FBZ0M7QUFDdEQsT0FBT0MsV0FBVyxNQUFNLCtDQUErQztBQUN2RSxPQUFPQyxVQUFVLE1BQU0sMkNBQTJDO0FBQ2xFLE9BQU9DLFFBQVEsTUFBTSx5Q0FBeUM7QUFDOUQsT0FBT0MsZUFBZSxNQUFNLGdEQUFnRDtBQUM1RSxTQUFTQyxLQUFLLEVBQUVDLGNBQWMsRUFBRUMsSUFBSSxFQUFlQyxJ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