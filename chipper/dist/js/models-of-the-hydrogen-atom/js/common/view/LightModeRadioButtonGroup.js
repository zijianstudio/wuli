// Copyright 2016-2023, University of Colorado Boulder

//TODO on mouseDown in projector mode, radio buttons go gray
/**
 * LightModeRadioButtonGroup provides radio buttons for selecting between monochromatic and full spectrum (white) light.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import optionize from '../../../../phet-core/js/optionize.js';
import LaserPointerNode from '../../../../scenery-phet/js/LaserPointerNode.js';
import { Color, Node, Rectangle } from '../../../../scenery/js/imports.js';
import RectangularRadioButtonGroup from '../../../../sun/js/buttons/RectangularRadioButtonGroup.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import modelsOfTheHydrogenAtom from '../../modelsOfTheHydrogenAtom.js';
import MOTHAColors from '../MOTHAColors.js';
export default class LightModeRadioButtonGroup extends RectangularRadioButtonGroup {
  constructor(lightModeProperty, providedOptions) {
    const options = optionize()({
      // RectangularRadioButtonGroupOptions
      orientation: 'vertical',
      spacing: 8,
      radioButtonOptions: {
        xMargin: 15,
        yMargin: 6,
        baseColor: MOTHAColors.lightModeRadioButtonFillProperty,
        buttonAppearanceStrategyOptions: {
          selectedLineWidth: 2,
          deselectedLineWidth: 2,
          selectedStroke: MOTHAColors.lightModeRadioButtonSelectedStrokeProperty,
          deselectedStroke: MOTHAColors.lightModeRadioButtonDeselectedStrokeProperty,
          overFill: MOTHAColors.lightModeRadioButtonFillProperty,
          overStroke: MOTHAColors.lightModeRadioButtonDeselectedStrokeProperty
        }
      }
    }, providedOptions);
    super(lightModeProperty, [{
      value: 'white',
      createNode: () => createModeIcon(Color.white),
      tandemName: 'whiteRadioButton'
    }, {
      value: 'monochromatic',
      createNode: () => createModeIcon(Color.red),
      tandemName: 'monochromaticRadioButton'
    }], options);
  }
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
    super.dispose();
  }
}

/**
 * Creates an icon for a light mode.
 */
function createModeIcon(beamColor) {
  const laserNode = new LaserPointerNode(new BooleanProperty(true), {
    hasButton: false,
    rotation: -Math.PI / 2,
    // pointing up
    bodySize: new Dimension2(18, 17),
    // height x width (due to rotation)
    nozzleSize: new Dimension2(5, 13),
    // height x width (due to rotation)
    cornerRadius: 2,
    lineWidth: 0.5,
    pickable: false,
    tandem: Tandem.OPT_OUT // opt out because this is a non-interactive icon
  });

  // If the beam color is the same as the radio button fill, stroke the beam.
  const strokeProperty = new DerivedProperty([MOTHAColors.lightModeRadioButtonFillProperty], lightModeRadioButtonFill => lightModeRadioButtonFill.equals(beamColor) ? 'black' : 'transparent');
  const beamNode = new Rectangle(0, 0, 5, 10, {
    fill: beamColor,
    stroke: strokeProperty,
    lineWidth: 0.5,
    centerX: laserNode.centerX,
    bottom: laserNode.top + 1
  });
  return new Node({
    children: [beamNode, laserNode]
  });
}
modelsOfTheHydrogenAtom.register('LightModeRadioButtonGroup', LightModeRadioButtonGroup);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJEZXJpdmVkUHJvcGVydHkiLCJEaW1lbnNpb24yIiwib3B0aW9uaXplIiwiTGFzZXJQb2ludGVyTm9kZSIsIkNvbG9yIiwiTm9kZSIsIlJlY3RhbmdsZSIsIlJlY3Rhbmd1bGFyUmFkaW9CdXR0b25Hcm91cCIsIlRhbmRlbSIsIm1vZGVsc09mVGhlSHlkcm9nZW5BdG9tIiwiTU9USEFDb2xvcnMiLCJMaWdodE1vZGVSYWRpb0J1dHRvbkdyb3VwIiwiY29uc3RydWN0b3IiLCJsaWdodE1vZGVQcm9wZXJ0eSIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJvcmllbnRhdGlvbiIsInNwYWNpbmciLCJyYWRpb0J1dHRvbk9wdGlvbnMiLCJ4TWFyZ2luIiwieU1hcmdpbiIsImJhc2VDb2xvciIsImxpZ2h0TW9kZVJhZGlvQnV0dG9uRmlsbFByb3BlcnR5IiwiYnV0dG9uQXBwZWFyYW5jZVN0cmF0ZWd5T3B0aW9ucyIsInNlbGVjdGVkTGluZVdpZHRoIiwiZGVzZWxlY3RlZExpbmVXaWR0aCIsInNlbGVjdGVkU3Ryb2tlIiwibGlnaHRNb2RlUmFkaW9CdXR0b25TZWxlY3RlZFN0cm9rZVByb3BlcnR5IiwiZGVzZWxlY3RlZFN0cm9rZSIsImxpZ2h0TW9kZVJhZGlvQnV0dG9uRGVzZWxlY3RlZFN0cm9rZVByb3BlcnR5Iiwib3ZlckZpbGwiLCJvdmVyU3Ryb2tlIiwidmFsdWUiLCJjcmVhdGVOb2RlIiwiY3JlYXRlTW9kZUljb24iLCJ3aGl0ZSIsInRhbmRlbU5hbWUiLCJyZWQiLCJkaXNwb3NlIiwiYXNzZXJ0IiwiYmVhbUNvbG9yIiwibGFzZXJOb2RlIiwiaGFzQnV0dG9uIiwicm90YXRpb24iLCJNYXRoIiwiUEkiLCJib2R5U2l6ZSIsIm5venpsZVNpemUiLCJjb3JuZXJSYWRpdXMiLCJsaW5lV2lkdGgiLCJwaWNrYWJsZSIsInRhbmRlbSIsIk9QVF9PVVQiLCJzdHJva2VQcm9wZXJ0eSIsImxpZ2h0TW9kZVJhZGlvQnV0dG9uRmlsbCIsImVxdWFscyIsImJlYW1Ob2RlIiwiZmlsbCIsInN0cm9rZSIsImNlbnRlclgiLCJib3R0b20iLCJ0b3AiLCJjaGlsZHJlbiIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiTGlnaHRNb2RlUmFkaW9CdXR0b25Hcm91cC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNi0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8vVE9ETyBvbiBtb3VzZURvd24gaW4gcHJvamVjdG9yIG1vZGUsIHJhZGlvIGJ1dHRvbnMgZ28gZ3JheVxyXG4vKipcclxuICogTGlnaHRNb2RlUmFkaW9CdXR0b25Hcm91cCBwcm92aWRlcyByYWRpbyBidXR0b25zIGZvciBzZWxlY3RpbmcgYmV0d2VlbiBtb25vY2hyb21hdGljIGFuZCBmdWxsIHNwZWN0cnVtICh3aGl0ZSkgbGlnaHQuXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IEJvb2xlYW5Qcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0Jvb2xlYW5Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBEZXJpdmVkUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9EZXJpdmVkUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBEaW1lbnNpb24yIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9EaW1lbnNpb24yLmpzJztcclxuaW1wb3J0IG9wdGlvbml6ZSwgeyBFbXB0eVNlbGZPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCBQaWNrUmVxdWlyZWQgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1BpY2tSZXF1aXJlZC5qcyc7XHJcbmltcG9ydCBMYXNlclBvaW50ZXJOb2RlIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9MYXNlclBvaW50ZXJOb2RlLmpzJztcclxuaW1wb3J0IHsgQ29sb3IsIE5vZGUsIE5vZGVUcmFuc2xhdGlvbk9wdGlvbnMsIFJlY3RhbmdsZSB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBSZWN0YW5ndWxhclJhZGlvQnV0dG9uR3JvdXAsIHsgUmVjdGFuZ3VsYXJSYWRpb0J1dHRvbkdyb3VwT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9idXR0b25zL1JlY3Rhbmd1bGFyUmFkaW9CdXR0b25Hcm91cC5qcyc7XHJcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XHJcbmltcG9ydCBtb2RlbHNPZlRoZUh5ZHJvZ2VuQXRvbSBmcm9tICcuLi8uLi9tb2RlbHNPZlRoZUh5ZHJvZ2VuQXRvbS5qcyc7XHJcbmltcG9ydCB7IExpZ2h0TW9kZSB9IGZyb20gJy4uL21vZGVsL0xpZ2h0TW9kZS5qcyc7XHJcbmltcG9ydCBNT1RIQUNvbG9ycyBmcm9tICcuLi9NT1RIQUNvbG9ycy5qcyc7XHJcblxyXG50eXBlIFNlbGZPcHRpb25zID0gRW1wdHlTZWxmT3B0aW9ucztcclxuXHJcbnR5cGUgTGlnaHRNb2RlUmFkaW9CdXR0b25Hcm91cE9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIE5vZGVUcmFuc2xhdGlvbk9wdGlvbnMgJlxyXG4gIFBpY2tSZXF1aXJlZDxSZWN0YW5ndWxhclJhZGlvQnV0dG9uR3JvdXBPcHRpb25zLCAndGFuZGVtJz47XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBMaWdodE1vZGVSYWRpb0J1dHRvbkdyb3VwIGV4dGVuZHMgUmVjdGFuZ3VsYXJSYWRpb0J1dHRvbkdyb3VwPExpZ2h0TW9kZT4ge1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIGxpZ2h0TW9kZVByb3BlcnR5OiBQcm9wZXJ0eTxMaWdodE1vZGU+LCBwcm92aWRlZE9wdGlvbnM6IExpZ2h0TW9kZVJhZGlvQnV0dG9uR3JvdXBPcHRpb25zICkge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8TGlnaHRNb2RlUmFkaW9CdXR0b25Hcm91cE9wdGlvbnMsIFNlbGZPcHRpb25zLCBSZWN0YW5ndWxhclJhZGlvQnV0dG9uR3JvdXBPcHRpb25zPigpKCB7XHJcblxyXG4gICAgICAvLyBSZWN0YW5ndWxhclJhZGlvQnV0dG9uR3JvdXBPcHRpb25zXHJcbiAgICAgIG9yaWVudGF0aW9uOiAndmVydGljYWwnLFxyXG4gICAgICBzcGFjaW5nOiA4LFxyXG4gICAgICByYWRpb0J1dHRvbk9wdGlvbnM6IHtcclxuICAgICAgICB4TWFyZ2luOiAxNSxcclxuICAgICAgICB5TWFyZ2luOiA2LFxyXG4gICAgICAgIGJhc2VDb2xvcjogTU9USEFDb2xvcnMubGlnaHRNb2RlUmFkaW9CdXR0b25GaWxsUHJvcGVydHksXHJcbiAgICAgICAgYnV0dG9uQXBwZWFyYW5jZVN0cmF0ZWd5T3B0aW9uczoge1xyXG4gICAgICAgICAgc2VsZWN0ZWRMaW5lV2lkdGg6IDIsXHJcbiAgICAgICAgICBkZXNlbGVjdGVkTGluZVdpZHRoOiAyLFxyXG4gICAgICAgICAgc2VsZWN0ZWRTdHJva2U6IE1PVEhBQ29sb3JzLmxpZ2h0TW9kZVJhZGlvQnV0dG9uU2VsZWN0ZWRTdHJva2VQcm9wZXJ0eSxcclxuICAgICAgICAgIGRlc2VsZWN0ZWRTdHJva2U6IE1PVEhBQ29sb3JzLmxpZ2h0TW9kZVJhZGlvQnV0dG9uRGVzZWxlY3RlZFN0cm9rZVByb3BlcnR5LFxyXG4gICAgICAgICAgb3ZlckZpbGw6IE1PVEhBQ29sb3JzLmxpZ2h0TW9kZVJhZGlvQnV0dG9uRmlsbFByb3BlcnR5LFxyXG4gICAgICAgICAgb3ZlclN0cm9rZTogTU9USEFDb2xvcnMubGlnaHRNb2RlUmFkaW9CdXR0b25EZXNlbGVjdGVkU3Ryb2tlUHJvcGVydHlcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIHN1cGVyKCBsaWdodE1vZGVQcm9wZXJ0eSwgW1xyXG4gICAgICB7IHZhbHVlOiAnd2hpdGUnLCBjcmVhdGVOb2RlOiAoKSA9PiBjcmVhdGVNb2RlSWNvbiggQ29sb3Iud2hpdGUgKSwgdGFuZGVtTmFtZTogJ3doaXRlUmFkaW9CdXR0b24nIH0sXHJcbiAgICAgIHsgdmFsdWU6ICdtb25vY2hyb21hdGljJywgY3JlYXRlTm9kZTogKCkgPT4gY3JlYXRlTW9kZUljb24oIENvbG9yLnJlZCApLCB0YW5kZW1OYW1lOiAnbW9ub2Nocm9tYXRpY1JhZGlvQnV0dG9uJyB9XHJcbiAgICBdLCBvcHRpb25zICk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgb3ZlcnJpZGUgZGlzcG9zZSgpOiB2b2lkIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGZhbHNlLCAnZGlzcG9zZSBpcyBub3Qgc3VwcG9ydGVkLCBleGlzdHMgZm9yIHRoZSBsaWZldGltZSBvZiB0aGUgc2ltJyApO1xyXG4gICAgc3VwZXIuZGlzcG9zZSgpO1xyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIENyZWF0ZXMgYW4gaWNvbiBmb3IgYSBsaWdodCBtb2RlLlxyXG4gKi9cclxuZnVuY3Rpb24gY3JlYXRlTW9kZUljb24oIGJlYW1Db2xvcjogQ29sb3IgKTogTm9kZSB7XHJcblxyXG4gIGNvbnN0IGxhc2VyTm9kZSA9IG5ldyBMYXNlclBvaW50ZXJOb2RlKCBuZXcgQm9vbGVhblByb3BlcnR5KCB0cnVlICksIHtcclxuICAgIGhhc0J1dHRvbjogZmFsc2UsXHJcbiAgICByb3RhdGlvbjogLU1hdGguUEkgLyAyLCAvLyBwb2ludGluZyB1cFxyXG4gICAgYm9keVNpemU6IG5ldyBEaW1lbnNpb24yKCAxOCwgMTcgKSwgLy8gaGVpZ2h0IHggd2lkdGggKGR1ZSB0byByb3RhdGlvbilcclxuICAgIG5venpsZVNpemU6IG5ldyBEaW1lbnNpb24yKCA1LCAxMyApLCAvLyBoZWlnaHQgeCB3aWR0aCAoZHVlIHRvIHJvdGF0aW9uKVxyXG4gICAgY29ybmVyUmFkaXVzOiAyLFxyXG4gICAgbGluZVdpZHRoOiAwLjUsXHJcbiAgICBwaWNrYWJsZTogZmFsc2UsXHJcbiAgICB0YW5kZW06IFRhbmRlbS5PUFRfT1VUIC8vIG9wdCBvdXQgYmVjYXVzZSB0aGlzIGlzIGEgbm9uLWludGVyYWN0aXZlIGljb25cclxuICB9ICk7XHJcblxyXG4gIC8vIElmIHRoZSBiZWFtIGNvbG9yIGlzIHRoZSBzYW1lIGFzIHRoZSByYWRpbyBidXR0b24gZmlsbCwgc3Ryb2tlIHRoZSBiZWFtLlxyXG4gIGNvbnN0IHN0cm9rZVByb3BlcnR5ID0gbmV3IERlcml2ZWRQcm9wZXJ0eSggWyBNT1RIQUNvbG9ycy5saWdodE1vZGVSYWRpb0J1dHRvbkZpbGxQcm9wZXJ0eSBdLFxyXG4gICAgbGlnaHRNb2RlUmFkaW9CdXR0b25GaWxsID0+ICggbGlnaHRNb2RlUmFkaW9CdXR0b25GaWxsLmVxdWFscyggYmVhbUNvbG9yICkgKSA/ICdibGFjaycgOiAndHJhbnNwYXJlbnQnXHJcbiAgKTtcclxuXHJcbiAgY29uc3QgYmVhbU5vZGUgPSBuZXcgUmVjdGFuZ2xlKCAwLCAwLCA1LCAxMCwge1xyXG4gICAgZmlsbDogYmVhbUNvbG9yLFxyXG4gICAgc3Ryb2tlOiBzdHJva2VQcm9wZXJ0eSxcclxuICAgIGxpbmVXaWR0aDogMC41LFxyXG4gICAgY2VudGVyWDogbGFzZXJOb2RlLmNlbnRlclgsXHJcbiAgICBib3R0b206IGxhc2VyTm9kZS50b3AgKyAxXHJcbiAgfSApO1xyXG5cclxuICByZXR1cm4gbmV3IE5vZGUoIHsgY2hpbGRyZW46IFsgYmVhbU5vZGUsIGxhc2VyTm9kZSBdIH0gKTtcclxufVxyXG5cclxubW9kZWxzT2ZUaGVIeWRyb2dlbkF0b20ucmVnaXN0ZXIoICdMaWdodE1vZGVSYWRpb0J1dHRvbkdyb3VwJywgTGlnaHRNb2RlUmFkaW9CdXR0b25Hcm91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