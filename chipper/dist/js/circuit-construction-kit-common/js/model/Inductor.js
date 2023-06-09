// Copyright 2019-2022, University of Colorado Boulder

/**
 * Model for an inductor.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import NumberProperty from '../../../axon/js/NumberProperty.js';
import Range from '../../../dot/js/Range.js';
import optionize from '../../../phet-core/js/optionize.js';
import CCKCConstants from '../CCKCConstants.js';
import CCKCQueryParameters from '../CCKCQueryParameters.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import DynamicCircuitElement from './DynamicCircuitElement.js';
// constants
const INDUCTOR_LENGTH = CCKCConstants.INDUCTOR_LENGTH;
export default class Inductor extends DynamicCircuitElement {
  // the inductance in Henries

  static INDUCTANCE_DEFAULT = CCKCQueryParameters.inductanceDefault;
  static INDUCTANCE_RANGE = new Range(CCKCQueryParameters.inductanceMin, CCKCQueryParameters.inductanceMax);
  static INDUCTANCE_NUMBER_OF_DECIMAL_PLACES = CCKCQueryParameters.inductorNumberDecimalPlaces;
  constructor(startVertex, endVertex, tandem, providedOptions) {
    const options = optionize()({
      inductance: Inductor.INDUCTANCE_DEFAULT,
      numberOfDecimalPlaces: Inductor.INDUCTANCE_NUMBER_OF_DECIMAL_PLACES
    }, providedOptions);
    super(startVertex, endVertex, INDUCTOR_LENGTH, tandem, options);
    this.inductanceProperty = new NumberProperty(options.inductance, {
      range: Inductor.INDUCTANCE_RANGE,
      tandem: tandem.createTandem('inductanceProperty')
    });
  }

  /**
   * Dispose of this and PhET-iO instrumented children, so they will be unregistered.
   */
  dispose() {
    this.inductanceProperty.dispose();
    super.dispose();
  }

  /**
   * Get the properties so that the circuit can be solved when changed.
   */
  getCircuitProperties() {
    return [this.inductanceProperty];
  }
}
circuitConstructionKitCommon.register('Inductor', Inductor);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJOdW1iZXJQcm9wZXJ0eSIsIlJhbmdlIiwib3B0aW9uaXplIiwiQ0NLQ0NvbnN0YW50cyIsIkNDS0NRdWVyeVBhcmFtZXRlcnMiLCJjaXJjdWl0Q29uc3RydWN0aW9uS2l0Q29tbW9uIiwiRHluYW1pY0NpcmN1aXRFbGVtZW50IiwiSU5EVUNUT1JfTEVOR1RIIiwiSW5kdWN0b3IiLCJJTkRVQ1RBTkNFX0RFRkFVTFQiLCJpbmR1Y3RhbmNlRGVmYXVsdCIsIklORFVDVEFOQ0VfUkFOR0UiLCJpbmR1Y3RhbmNlTWluIiwiaW5kdWN0YW5jZU1heCIsIklORFVDVEFOQ0VfTlVNQkVSX09GX0RFQ0lNQUxfUExBQ0VTIiwiaW5kdWN0b3JOdW1iZXJEZWNpbWFsUGxhY2VzIiwiY29uc3RydWN0b3IiLCJzdGFydFZlcnRleCIsImVuZFZlcnRleCIsInRhbmRlbSIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJpbmR1Y3RhbmNlIiwibnVtYmVyT2ZEZWNpbWFsUGxhY2VzIiwiaW5kdWN0YW5jZVByb3BlcnR5IiwicmFuZ2UiLCJjcmVhdGVUYW5kZW0iLCJkaXNwb3NlIiwiZ2V0Q2lyY3VpdFByb3BlcnRpZXMiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkluZHVjdG9yLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE5LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIE1vZGVsIGZvciBhbiBpbmR1Y3Rvci5cclxuICpcclxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgTnVtYmVyUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9OdW1iZXJQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IFJhbmdlIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9SYW5nZS5qcyc7XHJcbmltcG9ydCBvcHRpb25pemUgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCBJbnRlbnRpb25hbEFueSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvSW50ZW50aW9uYWxBbnkuanMnO1xyXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xyXG5pbXBvcnQgQ0NLQ0NvbnN0YW50cyBmcm9tICcuLi9DQ0tDQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IENDS0NRdWVyeVBhcmFtZXRlcnMgZnJvbSAnLi4vQ0NLQ1F1ZXJ5UGFyYW1ldGVycy5qcyc7XHJcbmltcG9ydCBjaXJjdWl0Q29uc3RydWN0aW9uS2l0Q29tbW9uIGZyb20gJy4uL2NpcmN1aXRDb25zdHJ1Y3Rpb25LaXRDb21tb24uanMnO1xyXG5pbXBvcnQgRHluYW1pY0NpcmN1aXRFbGVtZW50LCB7IER5bmFtaWNDaXJjdWl0RWxlbWVudE9wdGlvbnMgfSBmcm9tICcuL0R5bmFtaWNDaXJjdWl0RWxlbWVudC5qcyc7XHJcbmltcG9ydCBWZXJ0ZXggZnJvbSAnLi9WZXJ0ZXguanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IElORFVDVE9SX0xFTkdUSCA9IENDS0NDb25zdGFudHMuSU5EVUNUT1JfTEVOR1RIO1xyXG5cclxudHlwZSBTZWxmT3B0aW9ucyA9IHtcclxuICBpbmR1Y3RhbmNlPzogbnVtYmVyO1xyXG59O1xyXG50eXBlIEluZHVjdG9yT3B0aW9ucyA9IFNlbGZPcHRpb25zICYgRHluYW1pY0NpcmN1aXRFbGVtZW50T3B0aW9ucztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEluZHVjdG9yIGV4dGVuZHMgRHluYW1pY0NpcmN1aXRFbGVtZW50IHtcclxuXHJcbiAgLy8gdGhlIGluZHVjdGFuY2UgaW4gSGVucmllc1xyXG4gIHB1YmxpYyByZWFkb25seSBpbmR1Y3RhbmNlUHJvcGVydHk6IE51bWJlclByb3BlcnR5O1xyXG4gIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgSU5EVUNUQU5DRV9ERUZBVUxUID0gQ0NLQ1F1ZXJ5UGFyYW1ldGVycy5pbmR1Y3RhbmNlRGVmYXVsdDtcclxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IElORFVDVEFOQ0VfUkFOR0UgPSBuZXcgUmFuZ2UoIENDS0NRdWVyeVBhcmFtZXRlcnMuaW5kdWN0YW5jZU1pbiwgQ0NLQ1F1ZXJ5UGFyYW1ldGVycy5pbmR1Y3RhbmNlTWF4ICk7XHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBJTkRVQ1RBTkNFX05VTUJFUl9PRl9ERUNJTUFMX1BMQUNFUyA9IENDS0NRdWVyeVBhcmFtZXRlcnMuaW5kdWN0b3JOdW1iZXJEZWNpbWFsUGxhY2VzO1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHN0YXJ0VmVydGV4OiBWZXJ0ZXgsIGVuZFZlcnRleDogVmVydGV4LCB0YW5kZW06IFRhbmRlbSwgcHJvdmlkZWRPcHRpb25zPzogSW5kdWN0b3JPcHRpb25zICkge1xyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxJbmR1Y3Rvck9wdGlvbnMsIFNlbGZPcHRpb25zLCBEeW5hbWljQ2lyY3VpdEVsZW1lbnRPcHRpb25zPigpKCB7XHJcbiAgICAgIGluZHVjdGFuY2U6IEluZHVjdG9yLklORFVDVEFOQ0VfREVGQVVMVCxcclxuICAgICAgbnVtYmVyT2ZEZWNpbWFsUGxhY2VzOiBJbmR1Y3Rvci5JTkRVQ1RBTkNFX05VTUJFUl9PRl9ERUNJTUFMX1BMQUNFU1xyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgc3VwZXIoIHN0YXJ0VmVydGV4LCBlbmRWZXJ0ZXgsIElORFVDVE9SX0xFTkdUSCwgdGFuZGVtLCBvcHRpb25zICk7XHJcblxyXG4gICAgdGhpcy5pbmR1Y3RhbmNlUHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIG9wdGlvbnMuaW5kdWN0YW5jZSwge1xyXG4gICAgICByYW5nZTogSW5kdWN0b3IuSU5EVUNUQU5DRV9SQU5HRSxcclxuICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnaW5kdWN0YW5jZVByb3BlcnR5JyApXHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBEaXNwb3NlIG9mIHRoaXMgYW5kIFBoRVQtaU8gaW5zdHJ1bWVudGVkIGNoaWxkcmVuLCBzbyB0aGV5IHdpbGwgYmUgdW5yZWdpc3RlcmVkLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBvdmVycmlkZSBkaXNwb3NlKCk6IHZvaWQge1xyXG4gICAgdGhpcy5pbmR1Y3RhbmNlUHJvcGVydHkuZGlzcG9zZSgpO1xyXG4gICAgc3VwZXIuZGlzcG9zZSgpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IHRoZSBwcm9wZXJ0aWVzIHNvIHRoYXQgdGhlIGNpcmN1aXQgY2FuIGJlIHNvbHZlZCB3aGVuIGNoYW5nZWQuXHJcbiAgICovXHJcbiAgcHVibGljIGdldENpcmN1aXRQcm9wZXJ0aWVzKCk6IFByb3BlcnR5PEludGVudGlvbmFsQW55PltdIHtcclxuICAgIHJldHVybiBbIHRoaXMuaW5kdWN0YW5jZVByb3BlcnR5IF07XHJcbiAgfVxyXG59XHJcblxyXG5jaXJjdWl0Q29uc3RydWN0aW9uS2l0Q29tbW9uLnJlZ2lzdGVyKCAnSW5kdWN0b3InLCBJbmR1Y3RvciApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxjQUFjLE1BQU0sb0NBQW9DO0FBRS9ELE9BQU9DLEtBQUssTUFBTSwwQkFBMEI7QUFDNUMsT0FBT0MsU0FBUyxNQUFNLG9DQUFvQztBQUcxRCxPQUFPQyxhQUFhLE1BQU0scUJBQXFCO0FBQy9DLE9BQU9DLG1CQUFtQixNQUFNLDJCQUEyQjtBQUMzRCxPQUFPQyw0QkFBNEIsTUFBTSxvQ0FBb0M7QUFDN0UsT0FBT0MscUJBQXFCLE1BQXdDLDRCQUE0QjtBQUdoRztBQUNBLE1BQU1DLGVBQWUsR0FBR0osYUFBYSxDQUFDSSxlQUFlO0FBT3JELGVBQWUsTUFBTUMsUUFBUSxTQUFTRixxQkFBcUIsQ0FBQztFQUUxRDs7RUFFQSxPQUF1Qkcsa0JBQWtCLEdBQUdMLG1CQUFtQixDQUFDTSxpQkFBaUI7RUFDakYsT0FBdUJDLGdCQUFnQixHQUFHLElBQUlWLEtBQUssQ0FBRUcsbUJBQW1CLENBQUNRLGFBQWEsRUFBRVIsbUJBQW1CLENBQUNTLGFBQWMsQ0FBQztFQUMzSCxPQUF1QkMsbUNBQW1DLEdBQUdWLG1CQUFtQixDQUFDVywyQkFBMkI7RUFFckdDLFdBQVdBLENBQUVDLFdBQW1CLEVBQUVDLFNBQWlCLEVBQUVDLE1BQWMsRUFBRUMsZUFBaUMsRUFBRztJQUM5RyxNQUFNQyxPQUFPLEdBQUduQixTQUFTLENBQTZELENBQUMsQ0FBRTtNQUN2Rm9CLFVBQVUsRUFBRWQsUUFBUSxDQUFDQyxrQkFBa0I7TUFDdkNjLHFCQUFxQixFQUFFZixRQUFRLENBQUNNO0lBQ2xDLENBQUMsRUFBRU0sZUFBZ0IsQ0FBQztJQUVwQixLQUFLLENBQUVILFdBQVcsRUFBRUMsU0FBUyxFQUFFWCxlQUFlLEVBQUVZLE1BQU0sRUFBRUUsT0FBUSxDQUFDO0lBRWpFLElBQUksQ0FBQ0csa0JBQWtCLEdBQUcsSUFBSXhCLGNBQWMsQ0FBRXFCLE9BQU8sQ0FBQ0MsVUFBVSxFQUFFO01BQ2hFRyxLQUFLLEVBQUVqQixRQUFRLENBQUNHLGdCQUFnQjtNQUNoQ1EsTUFBTSxFQUFFQSxNQUFNLENBQUNPLFlBQVksQ0FBRSxvQkFBcUI7SUFDcEQsQ0FBRSxDQUFDO0VBQ0w7O0VBRUE7QUFDRjtBQUNBO0VBQ2tCQyxPQUFPQSxDQUFBLEVBQVM7SUFDOUIsSUFBSSxDQUFDSCxrQkFBa0IsQ0FBQ0csT0FBTyxDQUFDLENBQUM7SUFDakMsS0FBSyxDQUFDQSxPQUFPLENBQUMsQ0FBQztFQUNqQjs7RUFFQTtBQUNGO0FBQ0E7RUFDU0Msb0JBQW9CQSxDQUFBLEVBQStCO0lBQ3hELE9BQU8sQ0FBRSxJQUFJLENBQUNKLGtCQUFrQixDQUFFO0VBQ3BDO0FBQ0Y7QUFFQW5CLDRCQUE0QixDQUFDd0IsUUFBUSxDQUFFLFVBQVUsRUFBRXJCLFFBQVMsQ0FBQyJ9