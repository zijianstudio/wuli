// Copyright 2020-2022, University of Colorado Boulder

/**
 * Property to control the enabled of something. In general this should never be called by clients, but instead is factored
 * out for consistency in PhET libraries. This serves as the default Property to control enabled with PhET-iO instrumentation
 *
 * @author Michael Kauzmann(PhET Interactive Simulations)
 */

import optionize from '../../phet-core/js/optionize.js';
import axon from './axon.js';
import BooleanProperty from './BooleanProperty.js';
const TANDEM_NAME = 'enabledProperty';
export default class EnabledProperty extends BooleanProperty {
  constructor(initialEnabled, providedOptions) {
    const options = optionize()({
      phetioDocumentation: 'Determines whether the element is enabled (true) or disabled (false).',
      phetioFeatured: true,
      // by default, the tandem name must match. In rare occurrences (such as when one model must have 2 separate
      // EnabledProperties, like this.mass1EnabledProperty = ..., this.mass2EnabledProperty = ...
      // you can opt out of the name check. This should be used sparingly. For instance, for the example above, it may
      // be better to do this.mass1.enabledProperty anyways.
      checkTandemName: true
    }, providedOptions);
    if (assert && options && options.tandem && options.tandem.supplied && options.checkTandemName) {
      assert && assert(options.tandem.name === TANDEM_NAME, `EnabledProperty tandems should be named ${TANDEM_NAME}`);
    }
    super(initialEnabled, options);
  }
  static get TANDEM_NAME() {
    return TANDEM_NAME;
  }
}
axon.register('EnabledProperty', EnabledProperty);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJvcHRpb25pemUiLCJheG9uIiwiQm9vbGVhblByb3BlcnR5IiwiVEFOREVNX05BTUUiLCJFbmFibGVkUHJvcGVydHkiLCJjb25zdHJ1Y3RvciIsImluaXRpYWxFbmFibGVkIiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsInBoZXRpb0RvY3VtZW50YXRpb24iLCJwaGV0aW9GZWF0dXJlZCIsImNoZWNrVGFuZGVtTmFtZSIsImFzc2VydCIsInRhbmRlbSIsInN1cHBsaWVkIiwibmFtZSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiRW5hYmxlZFByb3BlcnR5LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIwLTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFByb3BlcnR5IHRvIGNvbnRyb2wgdGhlIGVuYWJsZWQgb2Ygc29tZXRoaW5nLiBJbiBnZW5lcmFsIHRoaXMgc2hvdWxkIG5ldmVyIGJlIGNhbGxlZCBieSBjbGllbnRzLCBidXQgaW5zdGVhZCBpcyBmYWN0b3JlZFxyXG4gKiBvdXQgZm9yIGNvbnNpc3RlbmN5IGluIFBoRVQgbGlicmFyaWVzLiBUaGlzIHNlcnZlcyBhcyB0aGUgZGVmYXVsdCBQcm9wZXJ0eSB0byBjb250cm9sIGVuYWJsZWQgd2l0aCBQaEVULWlPIGluc3RydW1lbnRhdGlvblxyXG4gKlxyXG4gKiBAYXV0aG9yIE1pY2hhZWwgS2F1em1hbm4oUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgb3B0aW9uaXplIGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgYXhvbiBmcm9tICcuL2F4b24uanMnO1xyXG5pbXBvcnQgQm9vbGVhblByb3BlcnR5LCB7IEJvb2xlYW5Qcm9wZXJ0eU9wdGlvbnMgfSBmcm9tICcuL0Jvb2xlYW5Qcm9wZXJ0eS5qcyc7XHJcblxyXG5jb25zdCBUQU5ERU1fTkFNRSA9ICdlbmFibGVkUHJvcGVydHknO1xyXG5cclxudHlwZSBTZWxmT3B0aW9ucyA9IHtcclxuICBjaGVja1RhbmRlbU5hbWU/OiBib29sZWFuO1xyXG59O1xyXG5cclxuZXhwb3J0IHR5cGUgRW5hYmxlZFByb3BlcnR5T3B0aW9ucyA9IFNlbGZPcHRpb25zICYgQm9vbGVhblByb3BlcnR5T3B0aW9ucztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEVuYWJsZWRQcm9wZXJ0eSBleHRlbmRzIEJvb2xlYW5Qcm9wZXJ0eSB7XHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBpbml0aWFsRW5hYmxlZDogYm9vbGVhbiwgcHJvdmlkZWRPcHRpb25zPzogRW5hYmxlZFByb3BlcnR5T3B0aW9ucyApIHtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPEVuYWJsZWRQcm9wZXJ0eU9wdGlvbnMsIFNlbGZPcHRpb25zLCBCb29sZWFuUHJvcGVydHlPcHRpb25zPigpKCB7XHJcbiAgICAgIHBoZXRpb0RvY3VtZW50YXRpb246ICdEZXRlcm1pbmVzIHdoZXRoZXIgdGhlIGVsZW1lbnQgaXMgZW5hYmxlZCAodHJ1ZSkgb3IgZGlzYWJsZWQgKGZhbHNlKS4nLFxyXG4gICAgICBwaGV0aW9GZWF0dXJlZDogdHJ1ZSxcclxuXHJcbiAgICAgIC8vIGJ5IGRlZmF1bHQsIHRoZSB0YW5kZW0gbmFtZSBtdXN0IG1hdGNoLiBJbiByYXJlIG9jY3VycmVuY2VzIChzdWNoIGFzIHdoZW4gb25lIG1vZGVsIG11c3QgaGF2ZSAyIHNlcGFyYXRlXHJcbiAgICAgIC8vIEVuYWJsZWRQcm9wZXJ0aWVzLCBsaWtlIHRoaXMubWFzczFFbmFibGVkUHJvcGVydHkgPSAuLi4sIHRoaXMubWFzczJFbmFibGVkUHJvcGVydHkgPSAuLi5cclxuICAgICAgLy8geW91IGNhbiBvcHQgb3V0IG9mIHRoZSBuYW1lIGNoZWNrLiBUaGlzIHNob3VsZCBiZSB1c2VkIHNwYXJpbmdseS4gRm9yIGluc3RhbmNlLCBmb3IgdGhlIGV4YW1wbGUgYWJvdmUsIGl0IG1heVxyXG4gICAgICAvLyBiZSBiZXR0ZXIgdG8gZG8gdGhpcy5tYXNzMS5lbmFibGVkUHJvcGVydHkgYW55d2F5cy5cclxuICAgICAgY2hlY2tUYW5kZW1OYW1lOiB0cnVlXHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICBpZiAoIGFzc2VydCAmJiBvcHRpb25zICYmIG9wdGlvbnMudGFuZGVtICYmIG9wdGlvbnMudGFuZGVtLnN1cHBsaWVkICYmIG9wdGlvbnMuY2hlY2tUYW5kZW1OYW1lICkge1xyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCBvcHRpb25zLnRhbmRlbS5uYW1lID09PSBUQU5ERU1fTkFNRSwgYEVuYWJsZWRQcm9wZXJ0eSB0YW5kZW1zIHNob3VsZCBiZSBuYW1lZCAke1RBTkRFTV9OQU1FfWAgKTtcclxuICAgIH1cclxuXHJcbiAgICBzdXBlciggaW5pdGlhbEVuYWJsZWQsIG9wdGlvbnMgKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBzdGF0aWMgZ2V0IFRBTkRFTV9OQU1FKCk6IHN0cmluZyB7IHJldHVybiBUQU5ERU1fTkFNRTsgfVxyXG59XHJcblxyXG5heG9uLnJlZ2lzdGVyKCAnRW5hYmxlZFByb3BlcnR5JywgRW5hYmxlZFByb3BlcnR5ICk7XHJcbiJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFNBQVMsTUFBTSxpQ0FBaUM7QUFDdkQsT0FBT0MsSUFBSSxNQUFNLFdBQVc7QUFDNUIsT0FBT0MsZUFBZSxNQUFrQyxzQkFBc0I7QUFFOUUsTUFBTUMsV0FBVyxHQUFHLGlCQUFpQjtBQVFyQyxlQUFlLE1BQU1DLGVBQWUsU0FBU0YsZUFBZSxDQUFDO0VBQ3BERyxXQUFXQSxDQUFFQyxjQUF1QixFQUFFQyxlQUF3QyxFQUFHO0lBRXRGLE1BQU1DLE9BQU8sR0FBR1IsU0FBUyxDQUE4RCxDQUFDLENBQUU7TUFDeEZTLG1CQUFtQixFQUFFLHVFQUF1RTtNQUM1RkMsY0FBYyxFQUFFLElBQUk7TUFFcEI7TUFDQTtNQUNBO01BQ0E7TUFDQUMsZUFBZSxFQUFFO0lBQ25CLENBQUMsRUFBRUosZUFBZ0IsQ0FBQztJQUVwQixJQUFLSyxNQUFNLElBQUlKLE9BQU8sSUFBSUEsT0FBTyxDQUFDSyxNQUFNLElBQUlMLE9BQU8sQ0FBQ0ssTUFBTSxDQUFDQyxRQUFRLElBQUlOLE9BQU8sQ0FBQ0csZUFBZSxFQUFHO01BQy9GQyxNQUFNLElBQUlBLE1BQU0sQ0FBRUosT0FBTyxDQUFDSyxNQUFNLENBQUNFLElBQUksS0FBS1osV0FBVyxFQUFHLDJDQUEwQ0EsV0FBWSxFQUFFLENBQUM7SUFDbkg7SUFFQSxLQUFLLENBQUVHLGNBQWMsRUFBRUUsT0FBUSxDQUFDO0VBQ2xDO0VBRUEsV0FBa0JMLFdBQVdBLENBQUEsRUFBVztJQUFFLE9BQU9BLFdBQVc7RUFBRTtBQUNoRTtBQUVBRixJQUFJLENBQUNlLFFBQVEsQ0FBRSxpQkFBaUIsRUFBRVosZUFBZ0IsQ0FBQyJ9