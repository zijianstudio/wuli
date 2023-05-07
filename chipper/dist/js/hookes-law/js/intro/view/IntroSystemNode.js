// Copyright 2015-2022, University of Colorado Boulder

/**
 * IntroSystemNode is the single-spring system for the "Intro" screen.
 * It includes one spring, a robotic arm, and all visual representations that go with them.
 * The origin is at the point where the spring attaches to the wall.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Multilink from '../../../../axon/js/Multilink.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Utils from '../../../../dot/js/Utils.js';
import optionize from '../../../../phet-core/js/optionize.js';
import { Node } from '../../../../scenery/js/imports.js';
import HookesLawColors from '../../common/HookesLawColors.js';
import HookesLawConstants from '../../common/HookesLawConstants.js';
import AppliedForceVectorNode from '../../common/view/AppliedForceVectorNode.js';
import DisplacementVectorNode from '../../common/view/DisplacementVectorNode.js';
import EquilibriumPositionNode from '../../common/view/EquilibriumPositionNode.js';
import HookesLawSpringNode from '../../common/view/HookesLawSpringNode.js';
import NibNode from '../../common/view/NibNode.js';
import RoboticArmNode from '../../common/view/RoboticArmNode.js';
import SpringForceVectorNode from '../../common/view/SpringForceVectorNode.js';
import WallNode from '../../common/view/WallNode.js';
import hookesLaw from '../../hookesLaw.js';
import IntroSpringControls from './IntroSpringControls.js';
export default class IntroSystemNode extends Node {
  constructor(system, viewProperties, providedOptions) {
    const options = optionize()({
      // SelfOptions
      unitDisplacementLength: 1
    }, providedOptions);
    assert && assert(Number.isInteger(options.systemNumber) && options.systemNumber >= 1);
    assert && assert(options.unitDisplacementLength > 0);

    // to improve readability
    const spring = system.spring;
    const roboticArm = system.roboticArm;

    // This sim operates in 1 dimension (x), so center everything on y = 0.
    const xOrigin = options.unitDisplacementLength * spring.leftProperty.value;
    const yOrigin = 0;

    // number of interactions in progress that affect displacement
    const numberOfInteractionsInProgressProperty = new NumberProperty(0, {
      numberType: 'Integer',
      isValidValue: value => value >= 0
    });

    //------------------------------------------------
    // Scene graph

    // origin is at right-center of wall
    const wallNode = new WallNode(HookesLawConstants.WALL_SIZE, {
      right: xOrigin,
      centerY: yOrigin
    });
    const springNode = new HookesLawSpringNode(spring, {
      frontColor: HookesLawColors.SINGLE_SPRING_FRONT,
      middleColor: HookesLawColors.SINGLE_SPRING_MIDDLE,
      backColor: HookesLawColors.SINGLE_SPRING_BACK,
      loops: HookesLawConstants.SINGLE_SPRING_LOOPS,
      unitDisplacementLength: options.unitDisplacementLength,
      // use x,y exclusively for layout, other translation options are inaccurate because we're using boundsMethod:'none'
      x: xOrigin,
      y: yOrigin
    });

    // pincers grab this
    const nibNode = new NibNode({
      fill: HookesLawColors.SINGLE_SPRING_MIDDLE,
      // x is based on rightSpring.leftProperty
      centerY: yOrigin
    });
    const roboticArmNode = new RoboticArmNode(roboticArm, spring.rightRangeProperty, numberOfInteractionsInProgressProperty, {
      unitDisplacementLength: options.unitDisplacementLength,
      x: options.unitDisplacementLength * roboticArm.right,
      y: yOrigin,
      tandem: options.tandem.createTandem('roboticArmNode')
    });
    const equilibriumPositionNode = new EquilibriumPositionNode(wallNode.height, {
      centerX: options.unitDisplacementLength * spring.equilibriumXProperty.value,
      centerY: yOrigin,
      visibleProperty: viewProperties.equilibriumPositionVisibleProperty,
      tandem: options.tandem.createTandem('equilibriumPositionNode')
    });
    const appliedForceVectorNode = new AppliedForceVectorNode(spring.appliedForceProperty, viewProperties.valuesVisibleProperty, {
      // x is determined by spring.rightProperty
      // bottom determined empirically, springNode.top is not accurate because we're using boundsMethod:'none'
      bottom: springNode.y - 50,
      visibleProperty: viewProperties.appliedForceVectorVisibleProperty,
      tandem: options.tandem.createTandem('appliedForceVectorNode')
    });
    const springForceVectorNode = new SpringForceVectorNode(spring.springForceProperty, viewProperties.valuesVisibleProperty, {
      // x is determined by spring.rightProperty
      y: appliedForceVectorNode.y,
      visibleProperty: viewProperties.springForceVectorVisibleProperty,
      tandem: options.tandem.createTandem('springForceVectorNode')
    });
    const displacementVectorNode = new DisplacementVectorNode(spring.displacementProperty, viewProperties.valuesVisibleProperty, {
      unitDisplacementLength: options.unitDisplacementLength,
      x: equilibriumPositionNode.centerX,
      // top determined empirically, springNode.bottom is not accurate because we're using boundMethod:'none'
      top: springNode.y + 50,
      visibleProperty: viewProperties.displacementVectorVisibleProperty,
      tandem: options.tandem.createTandem('displacementVectorNode')
    });
    const springControls = new IntroSpringControls(spring, numberOfInteractionsInProgressProperty, {
      systemNumber: options.systemNumber,
      centerX: wallNode.left + (roboticArmNode.right - wallNode.left) / 2,
      top: wallNode.bottom + 10,
      maxWidth: roboticArmNode.right - wallNode.left,
      // constrain width for i18n
      tandem: options.tandem.createTandem('springControls')
    });
    options.children = [equilibriumPositionNode, roboticArmNode, springNode, wallNode, nibNode, appliedForceVectorNode, springForceVectorNode, displacementVectorNode, springControls];

    //------------------------------------------------
    // Property observers

    // Position the force vectors at the right end of the spring.
    spring.rightProperty.link(right => {
      appliedForceVectorNode.x = springForceVectorNode.x = nibNode.x = options.unitDisplacementLength * right;
    });

    // Open pincers when displacement is zero and no user interactions affecting displacement are talking place.
    Multilink.multilink([numberOfInteractionsInProgressProperty, spring.displacementProperty], (numberOfInteractions, displacement) => {
      assert && assert(numberOfInteractions >= 0);
      const fixedDisplacement = Utils.toFixedNumber(displacement, HookesLawConstants.DISPLACEMENT_DECIMAL_PLACES);
      roboticArmNode.setPincersOpen(numberOfInteractions === 0 && fixedDisplacement === 0);
    });
    super(options);
  }
}
hookesLaw.register('IntroSystemNode', IntroSystemNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNdWx0aWxpbmsiLCJOdW1iZXJQcm9wZXJ0eSIsIlV0aWxzIiwib3B0aW9uaXplIiwiTm9kZSIsIkhvb2tlc0xhd0NvbG9ycyIsIkhvb2tlc0xhd0NvbnN0YW50cyIsIkFwcGxpZWRGb3JjZVZlY3Rvck5vZGUiLCJEaXNwbGFjZW1lbnRWZWN0b3JOb2RlIiwiRXF1aWxpYnJpdW1Qb3NpdGlvbk5vZGUiLCJIb29rZXNMYXdTcHJpbmdOb2RlIiwiTmliTm9kZSIsIlJvYm90aWNBcm1Ob2RlIiwiU3ByaW5nRm9yY2VWZWN0b3JOb2RlIiwiV2FsbE5vZGUiLCJob29rZXNMYXciLCJJbnRyb1NwcmluZ0NvbnRyb2xzIiwiSW50cm9TeXN0ZW1Ob2RlIiwiY29uc3RydWN0b3IiLCJzeXN0ZW0iLCJ2aWV3UHJvcGVydGllcyIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJ1bml0RGlzcGxhY2VtZW50TGVuZ3RoIiwiYXNzZXJ0IiwiTnVtYmVyIiwiaXNJbnRlZ2VyIiwic3lzdGVtTnVtYmVyIiwic3ByaW5nIiwicm9ib3RpY0FybSIsInhPcmlnaW4iLCJsZWZ0UHJvcGVydHkiLCJ2YWx1ZSIsInlPcmlnaW4iLCJudW1iZXJPZkludGVyYWN0aW9uc0luUHJvZ3Jlc3NQcm9wZXJ0eSIsIm51bWJlclR5cGUiLCJpc1ZhbGlkVmFsdWUiLCJ3YWxsTm9kZSIsIldBTExfU0laRSIsInJpZ2h0IiwiY2VudGVyWSIsInNwcmluZ05vZGUiLCJmcm9udENvbG9yIiwiU0lOR0xFX1NQUklOR19GUk9OVCIsIm1pZGRsZUNvbG9yIiwiU0lOR0xFX1NQUklOR19NSURETEUiLCJiYWNrQ29sb3IiLCJTSU5HTEVfU1BSSU5HX0JBQ0siLCJsb29wcyIsIlNJTkdMRV9TUFJJTkdfTE9PUFMiLCJ4IiwieSIsIm5pYk5vZGUiLCJmaWxsIiwicm9ib3RpY0FybU5vZGUiLCJyaWdodFJhbmdlUHJvcGVydHkiLCJ0YW5kZW0iLCJjcmVhdGVUYW5kZW0iLCJlcXVpbGlicml1bVBvc2l0aW9uTm9kZSIsImhlaWdodCIsImNlbnRlclgiLCJlcXVpbGlicml1bVhQcm9wZXJ0eSIsInZpc2libGVQcm9wZXJ0eSIsImVxdWlsaWJyaXVtUG9zaXRpb25WaXNpYmxlUHJvcGVydHkiLCJhcHBsaWVkRm9yY2VWZWN0b3JOb2RlIiwiYXBwbGllZEZvcmNlUHJvcGVydHkiLCJ2YWx1ZXNWaXNpYmxlUHJvcGVydHkiLCJib3R0b20iLCJhcHBsaWVkRm9yY2VWZWN0b3JWaXNpYmxlUHJvcGVydHkiLCJzcHJpbmdGb3JjZVZlY3Rvck5vZGUiLCJzcHJpbmdGb3JjZVByb3BlcnR5Iiwic3ByaW5nRm9yY2VWZWN0b3JWaXNpYmxlUHJvcGVydHkiLCJkaXNwbGFjZW1lbnRWZWN0b3JOb2RlIiwiZGlzcGxhY2VtZW50UHJvcGVydHkiLCJ0b3AiLCJkaXNwbGFjZW1lbnRWZWN0b3JWaXNpYmxlUHJvcGVydHkiLCJzcHJpbmdDb250cm9scyIsImxlZnQiLCJtYXhXaWR0aCIsImNoaWxkcmVuIiwicmlnaHRQcm9wZXJ0eSIsImxpbmsiLCJtdWx0aWxpbmsiLCJudW1iZXJPZkludGVyYWN0aW9ucyIsImRpc3BsYWNlbWVudCIsImZpeGVkRGlzcGxhY2VtZW50IiwidG9GaXhlZE51bWJlciIsIkRJU1BMQUNFTUVOVF9ERUNJTUFMX1BMQUNFUyIsInNldFBpbmNlcnNPcGVuIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJJbnRyb1N5c3RlbU5vZGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTUtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogSW50cm9TeXN0ZW1Ob2RlIGlzIHRoZSBzaW5nbGUtc3ByaW5nIHN5c3RlbSBmb3IgdGhlIFwiSW50cm9cIiBzY3JlZW4uXHJcbiAqIEl0IGluY2x1ZGVzIG9uZSBzcHJpbmcsIGEgcm9ib3RpYyBhcm0sIGFuZCBhbGwgdmlzdWFsIHJlcHJlc2VudGF0aW9ucyB0aGF0IGdvIHdpdGggdGhlbS5cclxuICogVGhlIG9yaWdpbiBpcyBhdCB0aGUgcG9pbnQgd2hlcmUgdGhlIHNwcmluZyBhdHRhY2hlcyB0byB0aGUgd2FsbC5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgTXVsdGlsaW5rIGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvTXVsdGlsaW5rLmpzJztcclxuaW1wb3J0IE51bWJlclByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvTnVtYmVyUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1V0aWxzLmpzJztcclxuaW1wb3J0IG9wdGlvbml6ZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcclxuaW1wb3J0IFBpY2tSZXF1aXJlZCBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvUGlja1JlcXVpcmVkLmpzJztcclxuaW1wb3J0IHsgTm9kZSwgTm9kZU9wdGlvbnMsIE5vZGVUcmFuc2xhdGlvbk9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgSG9va2VzTGF3Q29sb3JzIGZyb20gJy4uLy4uL2NvbW1vbi9Ib29rZXNMYXdDb2xvcnMuanMnO1xyXG5pbXBvcnQgSG9va2VzTGF3Q29uc3RhbnRzIGZyb20gJy4uLy4uL2NvbW1vbi9Ib29rZXNMYXdDb25zdGFudHMuanMnO1xyXG5pbXBvcnQgU2luZ2xlU3ByaW5nU3lzdGVtIGZyb20gJy4uLy4uL2NvbW1vbi9tb2RlbC9TaW5nbGVTcHJpbmdTeXN0ZW0uanMnO1xyXG5pbXBvcnQgQXBwbGllZEZvcmNlVmVjdG9yTm9kZSBmcm9tICcuLi8uLi9jb21tb24vdmlldy9BcHBsaWVkRm9yY2VWZWN0b3JOb2RlLmpzJztcclxuaW1wb3J0IERpc3BsYWNlbWVudFZlY3Rvck5vZGUgZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvRGlzcGxhY2VtZW50VmVjdG9yTm9kZS5qcyc7XHJcbmltcG9ydCBFcXVpbGlicml1bVBvc2l0aW9uTm9kZSBmcm9tICcuLi8uLi9jb21tb24vdmlldy9FcXVpbGlicml1bVBvc2l0aW9uTm9kZS5qcyc7XHJcbmltcG9ydCBIb29rZXNMYXdTcHJpbmdOb2RlIGZyb20gJy4uLy4uL2NvbW1vbi92aWV3L0hvb2tlc0xhd1NwcmluZ05vZGUuanMnO1xyXG5pbXBvcnQgTmliTm9kZSBmcm9tICcuLi8uLi9jb21tb24vdmlldy9OaWJOb2RlLmpzJztcclxuaW1wb3J0IFJvYm90aWNBcm1Ob2RlIGZyb20gJy4uLy4uL2NvbW1vbi92aWV3L1JvYm90aWNBcm1Ob2RlLmpzJztcclxuaW1wb3J0IFNwcmluZ0ZvcmNlVmVjdG9yTm9kZSBmcm9tICcuLi8uLi9jb21tb24vdmlldy9TcHJpbmdGb3JjZVZlY3Rvck5vZGUuanMnO1xyXG5pbXBvcnQgV2FsbE5vZGUgZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvV2FsbE5vZGUuanMnO1xyXG5pbXBvcnQgaG9va2VzTGF3IGZyb20gJy4uLy4uL2hvb2tlc0xhdy5qcyc7XHJcbmltcG9ydCBJbnRyb1NwcmluZ0NvbnRyb2xzIGZyb20gJy4vSW50cm9TcHJpbmdDb250cm9scy5qcyc7XHJcbmltcG9ydCBJbnRyb1ZpZXdQcm9wZXJ0aWVzIGZyb20gJy4vSW50cm9WaWV3UHJvcGVydGllcy5qcyc7XHJcblxyXG50eXBlIFNlbGZPcHRpb25zID0ge1xyXG4gIHN5c3RlbU51bWJlcjogbnVtYmVyOyAvLyBpbnRlZ2VyIHVzZWQgdG8gbGFiZWwgdGhlIHN5c3RlbVxyXG4gIHVuaXREaXNwbGFjZW1lbnRMZW5ndGg/OiBudW1iZXI7IC8vIHZpZXcgbGVuZ3RoIG9mIDEgbWV0ZXIgb2YgZGlzcGxhY2VtZW50XHJcbn07XHJcblxyXG50eXBlIEludHJvU3lzdGVtTm9kZU9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIE5vZGVUcmFuc2xhdGlvbk9wdGlvbnMgJiBQaWNrUmVxdWlyZWQ8Tm9kZU9wdGlvbnMsICd0YW5kZW0nPjtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEludHJvU3lzdGVtTm9kZSBleHRlbmRzIE5vZGUge1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHN5c3RlbTogU2luZ2xlU3ByaW5nU3lzdGVtLCB2aWV3UHJvcGVydGllczogSW50cm9WaWV3UHJvcGVydGllcywgcHJvdmlkZWRPcHRpb25zOiBJbnRyb1N5c3RlbU5vZGVPcHRpb25zICkge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8SW50cm9TeXN0ZW1Ob2RlT3B0aW9ucywgU2VsZk9wdGlvbnMsIE5vZGVPcHRpb25zPigpKCB7XHJcblxyXG4gICAgICAvLyBTZWxmT3B0aW9uc1xyXG4gICAgICB1bml0RGlzcGxhY2VtZW50TGVuZ3RoOiAxXHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBOdW1iZXIuaXNJbnRlZ2VyKCBvcHRpb25zLnN5c3RlbU51bWJlciApICYmIG9wdGlvbnMuc3lzdGVtTnVtYmVyID49IDEgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIG9wdGlvbnMudW5pdERpc3BsYWNlbWVudExlbmd0aCA+IDAgKTtcclxuXHJcbiAgICAvLyB0byBpbXByb3ZlIHJlYWRhYmlsaXR5XHJcbiAgICBjb25zdCBzcHJpbmcgPSBzeXN0ZW0uc3ByaW5nO1xyXG4gICAgY29uc3Qgcm9ib3RpY0FybSA9IHN5c3RlbS5yb2JvdGljQXJtO1xyXG5cclxuICAgIC8vIFRoaXMgc2ltIG9wZXJhdGVzIGluIDEgZGltZW5zaW9uICh4KSwgc28gY2VudGVyIGV2ZXJ5dGhpbmcgb24geSA9IDAuXHJcbiAgICBjb25zdCB4T3JpZ2luID0gb3B0aW9ucy51bml0RGlzcGxhY2VtZW50TGVuZ3RoICogc3ByaW5nLmxlZnRQcm9wZXJ0eS52YWx1ZTtcclxuICAgIGNvbnN0IHlPcmlnaW4gPSAwO1xyXG5cclxuICAgIC8vIG51bWJlciBvZiBpbnRlcmFjdGlvbnMgaW4gcHJvZ3Jlc3MgdGhhdCBhZmZlY3QgZGlzcGxhY2VtZW50XHJcbiAgICBjb25zdCBudW1iZXJPZkludGVyYWN0aW9uc0luUHJvZ3Jlc3NQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggMCwge1xyXG4gICAgICBudW1iZXJUeXBlOiAnSW50ZWdlcicsXHJcbiAgICAgIGlzVmFsaWRWYWx1ZTogdmFsdWUgPT4gKCB2YWx1ZSA+PSAwIClcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gU2NlbmUgZ3JhcGhcclxuXHJcbiAgICAvLyBvcmlnaW4gaXMgYXQgcmlnaHQtY2VudGVyIG9mIHdhbGxcclxuICAgIGNvbnN0IHdhbGxOb2RlID0gbmV3IFdhbGxOb2RlKCBIb29rZXNMYXdDb25zdGFudHMuV0FMTF9TSVpFLCB7XHJcbiAgICAgIHJpZ2h0OiB4T3JpZ2luLFxyXG4gICAgICBjZW50ZXJZOiB5T3JpZ2luXHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3Qgc3ByaW5nTm9kZSA9IG5ldyBIb29rZXNMYXdTcHJpbmdOb2RlKCBzcHJpbmcsIHtcclxuICAgICAgZnJvbnRDb2xvcjogSG9va2VzTGF3Q29sb3JzLlNJTkdMRV9TUFJJTkdfRlJPTlQsXHJcbiAgICAgIG1pZGRsZUNvbG9yOiBIb29rZXNMYXdDb2xvcnMuU0lOR0xFX1NQUklOR19NSURETEUsXHJcbiAgICAgIGJhY2tDb2xvcjogSG9va2VzTGF3Q29sb3JzLlNJTkdMRV9TUFJJTkdfQkFDSyxcclxuICAgICAgbG9vcHM6IEhvb2tlc0xhd0NvbnN0YW50cy5TSU5HTEVfU1BSSU5HX0xPT1BTLFxyXG4gICAgICB1bml0RGlzcGxhY2VtZW50TGVuZ3RoOiBvcHRpb25zLnVuaXREaXNwbGFjZW1lbnRMZW5ndGgsXHJcbiAgICAgIC8vIHVzZSB4LHkgZXhjbHVzaXZlbHkgZm9yIGxheW91dCwgb3RoZXIgdHJhbnNsYXRpb24gb3B0aW9ucyBhcmUgaW5hY2N1cmF0ZSBiZWNhdXNlIHdlJ3JlIHVzaW5nIGJvdW5kc01ldGhvZDonbm9uZSdcclxuICAgICAgeDogeE9yaWdpbixcclxuICAgICAgeTogeU9yaWdpblxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIHBpbmNlcnMgZ3JhYiB0aGlzXHJcbiAgICBjb25zdCBuaWJOb2RlID0gbmV3IE5pYk5vZGUoIHtcclxuICAgICAgZmlsbDogSG9va2VzTGF3Q29sb3JzLlNJTkdMRV9TUFJJTkdfTUlERExFLFxyXG4gICAgICAvLyB4IGlzIGJhc2VkIG9uIHJpZ2h0U3ByaW5nLmxlZnRQcm9wZXJ0eVxyXG4gICAgICBjZW50ZXJZOiB5T3JpZ2luXHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3Qgcm9ib3RpY0FybU5vZGUgPSBuZXcgUm9ib3RpY0FybU5vZGUoIHJvYm90aWNBcm0sIHNwcmluZy5yaWdodFJhbmdlUHJvcGVydHksIG51bWJlck9mSW50ZXJhY3Rpb25zSW5Qcm9ncmVzc1Byb3BlcnR5LCB7XHJcbiAgICAgIHVuaXREaXNwbGFjZW1lbnRMZW5ndGg6IG9wdGlvbnMudW5pdERpc3BsYWNlbWVudExlbmd0aCxcclxuICAgICAgeDogb3B0aW9ucy51bml0RGlzcGxhY2VtZW50TGVuZ3RoICogcm9ib3RpY0FybS5yaWdodCxcclxuICAgICAgeTogeU9yaWdpbixcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdyb2JvdGljQXJtTm9kZScgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IGVxdWlsaWJyaXVtUG9zaXRpb25Ob2RlID0gbmV3IEVxdWlsaWJyaXVtUG9zaXRpb25Ob2RlKCB3YWxsTm9kZS5oZWlnaHQsIHtcclxuICAgICAgY2VudGVyWDogb3B0aW9ucy51bml0RGlzcGxhY2VtZW50TGVuZ3RoICogc3ByaW5nLmVxdWlsaWJyaXVtWFByb3BlcnR5LnZhbHVlLFxyXG4gICAgICBjZW50ZXJZOiB5T3JpZ2luLFxyXG4gICAgICB2aXNpYmxlUHJvcGVydHk6IHZpZXdQcm9wZXJ0aWVzLmVxdWlsaWJyaXVtUG9zaXRpb25WaXNpYmxlUHJvcGVydHksXHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnZXF1aWxpYnJpdW1Qb3NpdGlvbk5vZGUnIClcclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCBhcHBsaWVkRm9yY2VWZWN0b3JOb2RlID0gbmV3IEFwcGxpZWRGb3JjZVZlY3Rvck5vZGUoXHJcbiAgICAgIHNwcmluZy5hcHBsaWVkRm9yY2VQcm9wZXJ0eSwgdmlld1Byb3BlcnRpZXMudmFsdWVzVmlzaWJsZVByb3BlcnR5LCB7XHJcbiAgICAgICAgLy8geCBpcyBkZXRlcm1pbmVkIGJ5IHNwcmluZy5yaWdodFByb3BlcnR5XHJcbiAgICAgICAgLy8gYm90dG9tIGRldGVybWluZWQgZW1waXJpY2FsbHksIHNwcmluZ05vZGUudG9wIGlzIG5vdCBhY2N1cmF0ZSBiZWNhdXNlIHdlJ3JlIHVzaW5nIGJvdW5kc01ldGhvZDonbm9uZSdcclxuICAgICAgICBib3R0b206IHNwcmluZ05vZGUueSAtIDUwLFxyXG4gICAgICAgIHZpc2libGVQcm9wZXJ0eTogdmlld1Byb3BlcnRpZXMuYXBwbGllZEZvcmNlVmVjdG9yVmlzaWJsZVByb3BlcnR5LFxyXG4gICAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnYXBwbGllZEZvcmNlVmVjdG9yTm9kZScgKVxyXG4gICAgICB9ICk7XHJcblxyXG4gICAgY29uc3Qgc3ByaW5nRm9yY2VWZWN0b3JOb2RlID0gbmV3IFNwcmluZ0ZvcmNlVmVjdG9yTm9kZShcclxuICAgICAgc3ByaW5nLnNwcmluZ0ZvcmNlUHJvcGVydHksIHZpZXdQcm9wZXJ0aWVzLnZhbHVlc1Zpc2libGVQcm9wZXJ0eSwge1xyXG4gICAgICAgIC8vIHggaXMgZGV0ZXJtaW5lZCBieSBzcHJpbmcucmlnaHRQcm9wZXJ0eVxyXG4gICAgICAgIHk6IGFwcGxpZWRGb3JjZVZlY3Rvck5vZGUueSxcclxuICAgICAgICB2aXNpYmxlUHJvcGVydHk6IHZpZXdQcm9wZXJ0aWVzLnNwcmluZ0ZvcmNlVmVjdG9yVmlzaWJsZVByb3BlcnR5LFxyXG4gICAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnc3ByaW5nRm9yY2VWZWN0b3JOb2RlJyApXHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCBkaXNwbGFjZW1lbnRWZWN0b3JOb2RlID0gbmV3IERpc3BsYWNlbWVudFZlY3Rvck5vZGUoXHJcbiAgICAgIHNwcmluZy5kaXNwbGFjZW1lbnRQcm9wZXJ0eSwgdmlld1Byb3BlcnRpZXMudmFsdWVzVmlzaWJsZVByb3BlcnR5LCB7XHJcbiAgICAgICAgdW5pdERpc3BsYWNlbWVudExlbmd0aDogb3B0aW9ucy51bml0RGlzcGxhY2VtZW50TGVuZ3RoLFxyXG4gICAgICAgIHg6IGVxdWlsaWJyaXVtUG9zaXRpb25Ob2RlLmNlbnRlclgsXHJcbiAgICAgICAgLy8gdG9wIGRldGVybWluZWQgZW1waXJpY2FsbHksIHNwcmluZ05vZGUuYm90dG9tIGlzIG5vdCBhY2N1cmF0ZSBiZWNhdXNlIHdlJ3JlIHVzaW5nIGJvdW5kTWV0aG9kOidub25lJ1xyXG4gICAgICAgIHRvcDogc3ByaW5nTm9kZS55ICsgNTAsXHJcbiAgICAgICAgdmlzaWJsZVByb3BlcnR5OiB2aWV3UHJvcGVydGllcy5kaXNwbGFjZW1lbnRWZWN0b3JWaXNpYmxlUHJvcGVydHksXHJcbiAgICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdkaXNwbGFjZW1lbnRWZWN0b3JOb2RlJyApXHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCBzcHJpbmdDb250cm9scyA9IG5ldyBJbnRyb1NwcmluZ0NvbnRyb2xzKCBzcHJpbmcsIG51bWJlck9mSW50ZXJhY3Rpb25zSW5Qcm9ncmVzc1Byb3BlcnR5LCB7XHJcbiAgICAgIHN5c3RlbU51bWJlcjogb3B0aW9ucy5zeXN0ZW1OdW1iZXIsXHJcbiAgICAgIGNlbnRlclg6IHdhbGxOb2RlLmxlZnQgKyAoIHJvYm90aWNBcm1Ob2RlLnJpZ2h0IC0gd2FsbE5vZGUubGVmdCApIC8gMixcclxuICAgICAgdG9wOiB3YWxsTm9kZS5ib3R0b20gKyAxMCxcclxuICAgICAgbWF4V2lkdGg6IHJvYm90aWNBcm1Ob2RlLnJpZ2h0IC0gd2FsbE5vZGUubGVmdCwgLy8gY29uc3RyYWluIHdpZHRoIGZvciBpMThuXHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnc3ByaW5nQ29udHJvbHMnIClcclxuICAgIH0gKTtcclxuXHJcbiAgICBvcHRpb25zLmNoaWxkcmVuID0gW1xyXG4gICAgICBlcXVpbGlicml1bVBvc2l0aW9uTm9kZSwgcm9ib3RpY0FybU5vZGUsIHNwcmluZ05vZGUsIHdhbGxOb2RlLCBuaWJOb2RlLFxyXG4gICAgICBhcHBsaWVkRm9yY2VWZWN0b3JOb2RlLCBzcHJpbmdGb3JjZVZlY3Rvck5vZGUsIGRpc3BsYWNlbWVudFZlY3Rvck5vZGUsXHJcbiAgICAgIHNwcmluZ0NvbnRyb2xzXHJcbiAgICBdO1xyXG5cclxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyBQcm9wZXJ0eSBvYnNlcnZlcnNcclxuXHJcbiAgICAvLyBQb3NpdGlvbiB0aGUgZm9yY2UgdmVjdG9ycyBhdCB0aGUgcmlnaHQgZW5kIG9mIHRoZSBzcHJpbmcuXHJcbiAgICBzcHJpbmcucmlnaHRQcm9wZXJ0eS5saW5rKCByaWdodCA9PiB7XHJcbiAgICAgIGFwcGxpZWRGb3JjZVZlY3Rvck5vZGUueCA9IHNwcmluZ0ZvcmNlVmVjdG9yTm9kZS54ID0gbmliTm9kZS54ID0gKCBvcHRpb25zLnVuaXREaXNwbGFjZW1lbnRMZW5ndGggKiByaWdodCApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIE9wZW4gcGluY2VycyB3aGVuIGRpc3BsYWNlbWVudCBpcyB6ZXJvIGFuZCBubyB1c2VyIGludGVyYWN0aW9ucyBhZmZlY3RpbmcgZGlzcGxhY2VtZW50IGFyZSB0YWxraW5nIHBsYWNlLlxyXG4gICAgTXVsdGlsaW5rLm11bHRpbGluayggWyBudW1iZXJPZkludGVyYWN0aW9uc0luUHJvZ3Jlc3NQcm9wZXJ0eSwgc3ByaW5nLmRpc3BsYWNlbWVudFByb3BlcnR5IF0sXHJcbiAgICAgICggbnVtYmVyT2ZJbnRlcmFjdGlvbnMsIGRpc3BsYWNlbWVudCApID0+IHtcclxuICAgICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBudW1iZXJPZkludGVyYWN0aW9ucyA+PSAwICk7XHJcbiAgICAgICAgY29uc3QgZml4ZWREaXNwbGFjZW1lbnQgPSBVdGlscy50b0ZpeGVkTnVtYmVyKCBkaXNwbGFjZW1lbnQsIEhvb2tlc0xhd0NvbnN0YW50cy5ESVNQTEFDRU1FTlRfREVDSU1BTF9QTEFDRVMgKTtcclxuICAgICAgICByb2JvdGljQXJtTm9kZS5zZXRQaW5jZXJzT3BlbiggbnVtYmVyT2ZJbnRlcmFjdGlvbnMgPT09IDAgJiYgZml4ZWREaXNwbGFjZW1lbnQgPT09IDAgKTtcclxuICAgICAgfSApO1xyXG5cclxuICAgIHN1cGVyKCBvcHRpb25zICk7XHJcbiAgfVxyXG59XHJcblxyXG5ob29rZXNMYXcucmVnaXN0ZXIoICdJbnRyb1N5c3RlbU5vZGUnLCBJbnRyb1N5c3RlbU5vZGUgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFNBQVMsTUFBTSxrQ0FBa0M7QUFDeEQsT0FBT0MsY0FBYyxNQUFNLHVDQUF1QztBQUNsRSxPQUFPQyxLQUFLLE1BQU0sNkJBQTZCO0FBQy9DLE9BQU9DLFNBQVMsTUFBTSx1Q0FBdUM7QUFFN0QsU0FBU0MsSUFBSSxRQUE2QyxtQ0FBbUM7QUFDN0YsT0FBT0MsZUFBZSxNQUFNLGlDQUFpQztBQUM3RCxPQUFPQyxrQkFBa0Is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