// Copyright 2017-2023, University of Colorado Boulder

/**
 * Radio buttons that allow the user to choose between Schematic and Lifelike views. Exists for the life of the sim and
 * hence does not require a dispose implementation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import NumberProperty from '../../../axon/js/NumberProperty.js';
import Property from '../../../axon/js/Property.js';
import Vector2 from '../../../dot/js/Vector2.js';
import optionize from '../../../phet-core/js/optionize.js';
import RectangularRadioButtonGroup from '../../../sun/js/buttons/RectangularRadioButtonGroup.js';
import Tandem from '../../../tandem/js/Tandem.js';
import CCKCConstants from '../CCKCConstants.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import Battery from '../model/Battery.js';
import CircuitElementViewType from '../model/CircuitElementViewType.js';
import Vertex from '../model/Vertex.js';
import BatteryNode from './BatteryNode.js';
import CCKCColors from './CCKCColors.js';

// constants
const BATTERY_LENGTH = CCKCConstants.BATTERY_LENGTH;
const SCALE = 0.4;
export default class ViewRadioButtonGroup extends RectangularRadioButtonGroup {
  /**
   * @param viewTypeProperty - whether to show lifelike or schematic representations
   * @param tandem
   * @param [providedOptions]
   */
  constructor(viewTypeProperty, tandem, providedOptions) {
    const options = optionize()({
      spacing: 20,
      orientation: 'horizontal',
      touchAreaXDilation: 9,
      touchAreaYDilation: 10,
      radioButtonOptions: {
        baseColor: CCKCColors.panelFillProperty,
        cornerRadius: CCKCConstants.CORNER_RADIUS,
        xMargin: 8,
        yMargin: 11,
        buttonAppearanceStrategyOptions: {
          deselectedButtonOpacity: 0.4,
          overButtonOpacity: 0.7,
          selectedStroke: CCKCColors.panelStrokeProperty,
          deselectedStroke: CCKCColors.panelStrokeProperty
        },
        phetioVisiblePropertyInstrumented: false
      },
      tandem: tandem
    }, providedOptions);

    // Create a battery which can be used in the views
    const startVertex = new Vertex(new Vector2(BATTERY_LENGTH / 2, 0), new Property(null));
    const endVertex = new Vertex(new Vector2(-BATTERY_LENGTH / 2, 0), new Property(null));
    const battery = new Battery(endVertex, startVertex, new NumberProperty(0), 'normal', Tandem.OPTIONAL, {
      initialOrientation: 'left',
      numberOfDecimalPlaces: Battery.VOLTAGE_DECIMAL_PLACES
    });

    /**
     * Create a battery node to be used as an icon.
     */
    const createBatteryNode = (view, tandem) => new BatteryNode(null, null, battery, new Property(view), tandem, {
      isIcon: true,
      scale: SCALE
    });
    super(viewTypeProperty, [{
      value: CircuitElementViewType.LIFELIKE,
      createNode: tandem => createBatteryNode(CircuitElementViewType.LIFELIKE, Tandem.OPT_OUT),
      tandemName: 'lifelikeRadioButton'
    }, {
      value: CircuitElementViewType.SCHEMATIC,
      createNode: tandem => createBatteryNode(CircuitElementViewType.SCHEMATIC, Tandem.OPT_OUT),
      tandemName: 'schematicRadioButton'
    }], options);
  }
}
circuitConstructionKitCommon.register('ViewRadioButtonGroup', ViewRadioButtonGroup);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJOdW1iZXJQcm9wZXJ0eSIsIlByb3BlcnR5IiwiVmVjdG9yMiIsIm9wdGlvbml6ZSIsIlJlY3Rhbmd1bGFyUmFkaW9CdXR0b25Hcm91cCIsIlRhbmRlbSIsIkNDS0NDb25zdGFudHMiLCJjaXJjdWl0Q29uc3RydWN0aW9uS2l0Q29tbW9uIiwiQmF0dGVyeSIsIkNpcmN1aXRFbGVtZW50Vmlld1R5cGUiLCJWZXJ0ZXgiLCJCYXR0ZXJ5Tm9kZSIsIkNDS0NDb2xvcnMiLCJCQVRURVJZX0xFTkdUSCIsIlNDQUxFIiwiVmlld1JhZGlvQnV0dG9uR3JvdXAiLCJjb25zdHJ1Y3RvciIsInZpZXdUeXBlUHJvcGVydHkiLCJ0YW5kZW0iLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwic3BhY2luZyIsIm9yaWVudGF0aW9uIiwidG91Y2hBcmVhWERpbGF0aW9uIiwidG91Y2hBcmVhWURpbGF0aW9uIiwicmFkaW9CdXR0b25PcHRpb25zIiwiYmFzZUNvbG9yIiwicGFuZWxGaWxsUHJvcGVydHkiLCJjb3JuZXJSYWRpdXMiLCJDT1JORVJfUkFESVVTIiwieE1hcmdpbiIsInlNYXJnaW4iLCJidXR0b25BcHBlYXJhbmNlU3RyYXRlZ3lPcHRpb25zIiwiZGVzZWxlY3RlZEJ1dHRvbk9wYWNpdHkiLCJvdmVyQnV0dG9uT3BhY2l0eSIsInNlbGVjdGVkU3Ryb2tlIiwicGFuZWxTdHJva2VQcm9wZXJ0eSIsImRlc2VsZWN0ZWRTdHJva2UiLCJwaGV0aW9WaXNpYmxlUHJvcGVydHlJbnN0cnVtZW50ZWQiLCJzdGFydFZlcnRleCIsImVuZFZlcnRleCIsImJhdHRlcnkiLCJPUFRJT05BTCIsImluaXRpYWxPcmllbnRhdGlvbiIsIm51bWJlck9mRGVjaW1hbFBsYWNlcyIsIlZPTFRBR0VfREVDSU1BTF9QTEFDRVMiLCJjcmVhdGVCYXR0ZXJ5Tm9kZSIsInZpZXciLCJpc0ljb24iLCJzY2FsZSIsInZhbHVlIiwiTElGRUxJS0UiLCJjcmVhdGVOb2RlIiwiT1BUX09VVCIsInRhbmRlbU5hbWUiLCJTQ0hFTUFUSUMiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlZpZXdSYWRpb0J1dHRvbkdyb3VwLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE3LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFJhZGlvIGJ1dHRvbnMgdGhhdCBhbGxvdyB0aGUgdXNlciB0byBjaG9vc2UgYmV0d2VlbiBTY2hlbWF0aWMgYW5kIExpZmVsaWtlIHZpZXdzLiBFeGlzdHMgZm9yIHRoZSBsaWZlIG9mIHRoZSBzaW0gYW5kXHJcbiAqIGhlbmNlIGRvZXMgbm90IHJlcXVpcmUgYSBkaXNwb3NlIGltcGxlbWVudGF0aW9uLlxyXG4gKlxyXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBOdW1iZXJQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi9heG9uL2pzL051bWJlclByb3BlcnR5LmpzJztcclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCBvcHRpb25pemUsIHsgRW1wdHlTZWxmT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgUmVjdGFuZ3VsYXJSYWRpb0J1dHRvbkdyb3VwLCB7IFJlY3Rhbmd1bGFyUmFkaW9CdXR0b25Hcm91cE9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi9zdW4vanMvYnV0dG9ucy9SZWN0YW5ndWxhclJhZGlvQnV0dG9uR3JvdXAuanMnO1xyXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xyXG5pbXBvcnQgQ0NLQ0NvbnN0YW50cyBmcm9tICcuLi9DQ0tDQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IGNpcmN1aXRDb25zdHJ1Y3Rpb25LaXRDb21tb24gZnJvbSAnLi4vY2lyY3VpdENvbnN0cnVjdGlvbktpdENvbW1vbi5qcyc7XHJcbmltcG9ydCBCYXR0ZXJ5IGZyb20gJy4uL21vZGVsL0JhdHRlcnkuanMnO1xyXG5pbXBvcnQgQ2lyY3VpdEVsZW1lbnQgZnJvbSAnLi4vbW9kZWwvQ2lyY3VpdEVsZW1lbnQuanMnO1xyXG5pbXBvcnQgQ2lyY3VpdEVsZW1lbnRWaWV3VHlwZSBmcm9tICcuLi9tb2RlbC9DaXJjdWl0RWxlbWVudFZpZXdUeXBlLmpzJztcclxuaW1wb3J0IFZlcnRleCBmcm9tICcuLi9tb2RlbC9WZXJ0ZXguanMnO1xyXG5pbXBvcnQgQmF0dGVyeU5vZGUgZnJvbSAnLi9CYXR0ZXJ5Tm9kZS5qcyc7XHJcbmltcG9ydCBDQ0tDQ29sb3JzIGZyb20gJy4vQ0NLQ0NvbG9ycy5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgQkFUVEVSWV9MRU5HVEggPSBDQ0tDQ29uc3RhbnRzLkJBVFRFUllfTEVOR1RIO1xyXG5jb25zdCBTQ0FMRSA9IDAuNDtcclxuXHJcbnR5cGUgU2VsZk9wdGlvbnMgPSBFbXB0eVNlbGZPcHRpb25zO1xyXG50eXBlIFZpZXdSYWRpb0J1dHRvbkdyb3VwT3B0aW9ucyA9IFJlY3Rhbmd1bGFyUmFkaW9CdXR0b25Hcm91cE9wdGlvbnMgJiBTZWxmT3B0aW9ucztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFZpZXdSYWRpb0J1dHRvbkdyb3VwIGV4dGVuZHMgUmVjdGFuZ3VsYXJSYWRpb0J1dHRvbkdyb3VwPENpcmN1aXRFbGVtZW50Vmlld1R5cGU+IHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHZpZXdUeXBlUHJvcGVydHkgLSB3aGV0aGVyIHRvIHNob3cgbGlmZWxpa2Ugb3Igc2NoZW1hdGljIHJlcHJlc2VudGF0aW9uc1xyXG4gICAqIEBwYXJhbSB0YW5kZW1cclxuICAgKiBAcGFyYW0gW3Byb3ZpZGVkT3B0aW9uc11cclxuICAgKi9cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHZpZXdUeXBlUHJvcGVydHk6IFByb3BlcnR5PENpcmN1aXRFbGVtZW50Vmlld1R5cGU+LCB0YW5kZW06IFRhbmRlbSwgcHJvdmlkZWRPcHRpb25zPzogVmlld1JhZGlvQnV0dG9uR3JvdXBPcHRpb25zICkge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8Vmlld1JhZGlvQnV0dG9uR3JvdXBPcHRpb25zLCBTZWxmT3B0aW9ucywgUmVjdGFuZ3VsYXJSYWRpb0J1dHRvbkdyb3VwT3B0aW9ucz4oKSgge1xyXG4gICAgICBzcGFjaW5nOiAyMCxcclxuICAgICAgb3JpZW50YXRpb246ICdob3Jpem9udGFsJyxcclxuICAgICAgdG91Y2hBcmVhWERpbGF0aW9uOiA5LFxyXG4gICAgICB0b3VjaEFyZWFZRGlsYXRpb246IDEwLFxyXG4gICAgICByYWRpb0J1dHRvbk9wdGlvbnM6IHtcclxuICAgICAgICBiYXNlQ29sb3I6IENDS0NDb2xvcnMucGFuZWxGaWxsUHJvcGVydHksXHJcbiAgICAgICAgY29ybmVyUmFkaXVzOiBDQ0tDQ29uc3RhbnRzLkNPUk5FUl9SQURJVVMsXHJcbiAgICAgICAgeE1hcmdpbjogOCxcclxuICAgICAgICB5TWFyZ2luOiAxMSxcclxuICAgICAgICBidXR0b25BcHBlYXJhbmNlU3RyYXRlZ3lPcHRpb25zOiB7XHJcbiAgICAgICAgICBkZXNlbGVjdGVkQnV0dG9uT3BhY2l0eTogMC40LFxyXG4gICAgICAgICAgb3ZlckJ1dHRvbk9wYWNpdHk6IDAuNyxcclxuICAgICAgICAgIHNlbGVjdGVkU3Ryb2tlOiBDQ0tDQ29sb3JzLnBhbmVsU3Ryb2tlUHJvcGVydHksXHJcbiAgICAgICAgICBkZXNlbGVjdGVkU3Ryb2tlOiBDQ0tDQ29sb3JzLnBhbmVsU3Ryb2tlUHJvcGVydHlcclxuICAgICAgICB9LFxyXG4gICAgICAgIHBoZXRpb1Zpc2libGVQcm9wZXJ0eUluc3RydW1lbnRlZDogZmFsc2VcclxuICAgICAgfSxcclxuICAgICAgdGFuZGVtOiB0YW5kZW1cclxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIC8vIENyZWF0ZSBhIGJhdHRlcnkgd2hpY2ggY2FuIGJlIHVzZWQgaW4gdGhlIHZpZXdzXHJcbiAgICBjb25zdCBzdGFydFZlcnRleCA9IG5ldyBWZXJ0ZXgoIG5ldyBWZWN0b3IyKCBCQVRURVJZX0xFTkdUSCAvIDIsIDAgKSwgbmV3IFByb3BlcnR5PENpcmN1aXRFbGVtZW50IHwgVmVydGV4IHwgbnVsbD4oIG51bGwgKSApO1xyXG4gICAgY29uc3QgZW5kVmVydGV4ID0gbmV3IFZlcnRleCggbmV3IFZlY3RvcjIoIC1CQVRURVJZX0xFTkdUSCAvIDIsIDAgKSwgbmV3IFByb3BlcnR5PENpcmN1aXRFbGVtZW50IHwgVmVydGV4IHwgbnVsbD4oIG51bGwgKSApO1xyXG4gICAgY29uc3QgYmF0dGVyeSA9IG5ldyBCYXR0ZXJ5KCBlbmRWZXJ0ZXgsIHN0YXJ0VmVydGV4LCBuZXcgTnVtYmVyUHJvcGVydHkoIDAgKSwgJ25vcm1hbCcsIFRhbmRlbS5PUFRJT05BTCwge1xyXG4gICAgICBpbml0aWFsT3JpZW50YXRpb246ICdsZWZ0JyxcclxuICAgICAgbnVtYmVyT2ZEZWNpbWFsUGxhY2VzOiBCYXR0ZXJ5LlZPTFRBR0VfREVDSU1BTF9QTEFDRVNcclxuICAgIH0gKTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIENyZWF0ZSBhIGJhdHRlcnkgbm9kZSB0byBiZSB1c2VkIGFzIGFuIGljb24uXHJcbiAgICAgKi9cclxuICAgIGNvbnN0IGNyZWF0ZUJhdHRlcnlOb2RlID0gKCB2aWV3OiBDaXJjdWl0RWxlbWVudFZpZXdUeXBlLCB0YW5kZW06IFRhbmRlbSApID0+IG5ldyBCYXR0ZXJ5Tm9kZSggbnVsbCwgbnVsbCwgYmF0dGVyeSwgbmV3IFByb3BlcnR5KCB2aWV3ICksIHRhbmRlbSwge1xyXG4gICAgICBpc0ljb246IHRydWUsXHJcbiAgICAgIHNjYWxlOiBTQ0FMRVxyXG4gICAgfSApO1xyXG4gICAgc3VwZXIoIHZpZXdUeXBlUHJvcGVydHksIFsge1xyXG4gICAgICB2YWx1ZTogQ2lyY3VpdEVsZW1lbnRWaWV3VHlwZS5MSUZFTElLRSxcclxuICAgICAgY3JlYXRlTm9kZTogdGFuZGVtID0+IGNyZWF0ZUJhdHRlcnlOb2RlKCBDaXJjdWl0RWxlbWVudFZpZXdUeXBlLkxJRkVMSUtFLCBUYW5kZW0uT1BUX09VVCApLFxyXG4gICAgICB0YW5kZW1OYW1lOiAnbGlmZWxpa2VSYWRpb0J1dHRvbidcclxuICAgIH0sIHtcclxuICAgICAgdmFsdWU6IENpcmN1aXRFbGVtZW50Vmlld1R5cGUuU0NIRU1BVElDLFxyXG4gICAgICBjcmVhdGVOb2RlOiB0YW5kZW0gPT4gY3JlYXRlQmF0dGVyeU5vZGUoIENpcmN1aXRFbGVtZW50Vmlld1R5cGUuU0NIRU1BVElDLCBUYW5kZW0uT1BUX09VVCApLFxyXG4gICAgICB0YW5kZW1OYW1lOiAnc2NoZW1hdGljUmFkaW9CdXR0b24nXHJcbiAgICB9IF0sIG9wdGlvbnMgKTtcclxuICB9XHJcbn1cclxuXHJcbmNpcmN1aXRDb25zdHJ1Y3Rpb25LaXRDb21tb24ucmVnaXN0ZXIoICdWaWV3UmFkaW9CdXR0b25Hcm91cCcsIFZpZXdSYWRpb0J1dHRvbkdyb3VwICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsY0FBYyxNQUFNLG9DQUFvQztBQUMvRCxPQUFPQyxRQUFRLE1BQU0sOEJBQThCO0FBQ25ELE9BQU9DLE9BQU8sTUFBTSw0QkFBNEI7QUFDaEQsT0FBT0MsU0FBUyxNQUE0QixvQ0FBb0M7QUFDaEYsT0FBT0MsMkJBQTJCLE1BQThDLHdEQUF3RDtBQUN4SSxPQUFPQyxNQUFNLE1BQU0sOEJBQThCO0FBQ2pELE9BQU9DLGFBQWEsTUFBTSxxQkFBcUI7QUFDL0MsT0FBT0MsNEJBQTRCLE1BQU0sb0NBQW9DO0FBQzdFLE9BQU9DLE9BQU8sTUFBTSxxQkFBcUI7QUFF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