// Copyright 2021-2023, University of Colorado Boulder

/**
 * Base class that defines a settable Property that determines whether the Object is enabled or not. This includes
 * support for phet-io instrumentation and a variety of options to customize the enabled Property as well as how it is
 * created.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import EnabledProperty from './EnabledProperty.js';
import merge from '../../phet-core/js/merge.js';
import { optionize3 } from '../../phet-core/js/optionize.js';
import Tandem from '../../tandem/js/Tandem.js';
import axon from './axon.js';
import Disposable from './Disposable.js';

// constants
const DEFAULT_OPTIONS = {
  enabledProperty: null,
  enabled: true,
  enabledPropertyOptions: null,
  phetioEnabledPropertyInstrumented: true,
  tandem: Tandem.OPTIONAL
};
export default class EnabledComponent extends Disposable {
  constructor(providedOptions) {
    const options = optionize3()({}, DEFAULT_OPTIONS, providedOptions);
    const ownsEnabledProperty = !options.enabledProperty;
    assert && options.enabledPropertyOptions && assert(!(!options.phetioEnabledPropertyInstrumented && options.enabledPropertyOptions.tandem), 'incompatible options. Cannot specify phetioEnabledPropertyInstrumented opt out and a Tandem via enabledPropertyOptions.');
    super();

    // @ts-expect-error There is no way without a plethora of parameterized types to convey if this enabledProperty is
    // settable, so accept unsettable, and typecast to settable.
    this.enabledProperty = options.enabledProperty || new EnabledProperty(options.enabled, merge({
      tandem: options.phetioEnabledPropertyInstrumented ? options.tandem.createTandem(EnabledProperty.TANDEM_NAME) : Tandem.OPT_OUT
    }, options.enabledPropertyOptions));
    this.disposeEnabledComponent = () => {
      ownsEnabledProperty && this.enabledProperty.dispose();
    };
  }
  setEnabled(enabled) {
    assert && assert(this.enabledProperty.isSettable(), 'cannot set enabledProperty');
    this.enabledProperty.value = enabled;
  }
  set enabled(value) {
    this.setEnabled(value);
  }
  get enabled() {
    return this.isEnabled();
  }
  isEnabled() {
    return this.enabledProperty.value;
  }
  dispose() {
    this.disposeEnabledComponent();
    super.dispose();
  }
}
axon.register('EnabledComponent', EnabledComponent);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJFbmFibGVkUHJvcGVydHkiLCJtZXJnZSIsIm9wdGlvbml6ZTMiLCJUYW5kZW0iLCJheG9uIiwiRGlzcG9zYWJsZSIsIkRFRkFVTFRfT1BUSU9OUyIsImVuYWJsZWRQcm9wZXJ0eSIsImVuYWJsZWQiLCJlbmFibGVkUHJvcGVydHlPcHRpb25zIiwicGhldGlvRW5hYmxlZFByb3BlcnR5SW5zdHJ1bWVudGVkIiwidGFuZGVtIiwiT1BUSU9OQUwiLCJFbmFibGVkQ29tcG9uZW50IiwiY29uc3RydWN0b3IiLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwib3duc0VuYWJsZWRQcm9wZXJ0eSIsImFzc2VydCIsImNyZWF0ZVRhbmRlbSIsIlRBTkRFTV9OQU1FIiwiT1BUX09VVCIsImRpc3Bvc2VFbmFibGVkQ29tcG9uZW50IiwiZGlzcG9zZSIsInNldEVuYWJsZWQiLCJpc1NldHRhYmxlIiwidmFsdWUiLCJpc0VuYWJsZWQiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkVuYWJsZWRDb21wb25lbnQudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjEtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQmFzZSBjbGFzcyB0aGF0IGRlZmluZXMgYSBzZXR0YWJsZSBQcm9wZXJ0eSB0aGF0IGRldGVybWluZXMgd2hldGhlciB0aGUgT2JqZWN0IGlzIGVuYWJsZWQgb3Igbm90LiBUaGlzIGluY2x1ZGVzXHJcbiAqIHN1cHBvcnQgZm9yIHBoZXQtaW8gaW5zdHJ1bWVudGF0aW9uIGFuZCBhIHZhcmlldHkgb2Ygb3B0aW9ucyB0byBjdXN0b21pemUgdGhlIGVuYWJsZWQgUHJvcGVydHkgYXMgd2VsbCBhcyBob3cgaXQgaXNcclxuICogY3JlYXRlZC5cclxuICpcclxuICogQGF1dGhvciBNaWNoYWVsIEthdXptYW5uIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBFbmFibGVkUHJvcGVydHksIHsgRW5hYmxlZFByb3BlcnR5T3B0aW9ucyB9IGZyb20gJy4vRW5hYmxlZFByb3BlcnR5LmpzJztcclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCB7IG9wdGlvbml6ZTMgfSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcclxuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcclxuaW1wb3J0IGF4b24gZnJvbSAnLi9heG9uLmpzJztcclxuaW1wb3J0IFRQcm9wZXJ0eSBmcm9tICcuL1RQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBUUmVhZE9ubHlQcm9wZXJ0eSBmcm9tICcuL1RSZWFkT25seVByb3BlcnR5LmpzJztcclxuaW1wb3J0IERpc3Bvc2FibGUgZnJvbSAnLi9EaXNwb3NhYmxlLmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBERUZBVUxUX09QVElPTlMgPSB7XHJcbiAgZW5hYmxlZFByb3BlcnR5OiBudWxsLFxyXG4gIGVuYWJsZWQ6IHRydWUsXHJcbiAgZW5hYmxlZFByb3BlcnR5T3B0aW9uczogbnVsbCxcclxuICBwaGV0aW9FbmFibGVkUHJvcGVydHlJbnN0cnVtZW50ZWQ6IHRydWUsXHJcbiAgdGFuZGVtOiBUYW5kZW0uT1BUSU9OQUxcclxufSBhcyBjb25zdDtcclxuXHJcbnR5cGUgU2VsZk9wdGlvbnMgPSB7XHJcblxyXG4gIC8vIGlmIG5vdCBwcm92aWRlZCwgYSBQcm9wZXJ0eSB3aWxsIGJlIGNyZWF0ZWRcclxuICBlbmFibGVkUHJvcGVydHk/OiBUUmVhZE9ubHlQcm9wZXJ0eTxib29sZWFuPiB8IG51bGw7XHJcblxyXG4gIC8vIGluaXRpYWwgdmFsdWUgb2YgZW5hYmxlZFByb3BlcnR5IGlmIHdlIGNyZWF0ZSBpdCwgaWdub3JlZCBpZiBlbmFibGVkUHJvcGVydHkgaXMgcHJvdmlkZWRcclxuICBlbmFibGVkPzogYm9vbGVhbjtcclxuXHJcbiAgLy8gb3B0aW9ucyB0byBlbmFibGVkUHJvcGVydHkgaWYgd2UgY3JlYXRlIGl0LCBpZ25vcmVkIGlmIGVuYWJsZWRQcm9wZXJ0eSBpcyBwcm92aWRlZFxyXG4gIGVuYWJsZWRQcm9wZXJ0eU9wdGlvbnM/OiBFbmFibGVkUHJvcGVydHlPcHRpb25zIHwgbnVsbDtcclxuXHJcbiAgLy8gV2hldGhlciB0aGUgZGVmYXVsdC1jcmVhdGVkIGVuYWJsZWRQcm9wZXJ0eSBzaG91bGQgYmUgaW5zdHJ1bWVudGVkIGZvciBQaEVULWlPLiBJZ25vcmVkIGlmXHJcbiAgLy8gb3B0aW9ucy5lbmFibGVkUHJvcGVydHkgaXMgcHJvdmlkZWQuXHJcbiAgcGhldGlvRW5hYmxlZFByb3BlcnR5SW5zdHJ1bWVudGVkPzogYm9vbGVhbjtcclxuXHJcbiAgLy8gcGhldC1pb1xyXG4gIHRhbmRlbT86IFRhbmRlbTtcclxufTtcclxuXHJcbmV4cG9ydCB0eXBlIEVuYWJsZWRDb21wb25lbnRPcHRpb25zID0gU2VsZk9wdGlvbnM7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBFbmFibGVkQ29tcG9uZW50IGV4dGVuZHMgRGlzcG9zYWJsZSB7XHJcblxyXG4gIHB1YmxpYyBlbmFibGVkUHJvcGVydHk6IFRQcm9wZXJ0eTxib29sZWFuPjtcclxuXHJcbiAgcHJpdmF0ZSBkaXNwb3NlRW5hYmxlZENvbXBvbmVudDogKCkgPT4gdm9pZDtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBwcm92aWRlZE9wdGlvbnM/OiBFbmFibGVkQ29tcG9uZW50T3B0aW9ucyApIHtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplMzxFbmFibGVkQ29tcG9uZW50T3B0aW9ucywgU2VsZk9wdGlvbnM+KCkoIHt9LCBERUZBVUxUX09QVElPTlMsIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIGNvbnN0IG93bnNFbmFibGVkUHJvcGVydHkgPSAhb3B0aW9ucy5lbmFibGVkUHJvcGVydHk7XHJcblxyXG4gICAgYXNzZXJ0ICYmIG9wdGlvbnMuZW5hYmxlZFByb3BlcnR5T3B0aW9ucyAmJiBhc3NlcnQoICEoICFvcHRpb25zLnBoZXRpb0VuYWJsZWRQcm9wZXJ0eUluc3RydW1lbnRlZCAmJiBvcHRpb25zLmVuYWJsZWRQcm9wZXJ0eU9wdGlvbnMudGFuZGVtICksXHJcbiAgICAgICdpbmNvbXBhdGlibGUgb3B0aW9ucy4gQ2Fubm90IHNwZWNpZnkgcGhldGlvRW5hYmxlZFByb3BlcnR5SW5zdHJ1bWVudGVkIG9wdCBvdXQgYW5kIGEgVGFuZGVtIHZpYSBlbmFibGVkUHJvcGVydHlPcHRpb25zLicgKTtcclxuXHJcbiAgICBzdXBlcigpO1xyXG5cclxuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgVGhlcmUgaXMgbm8gd2F5IHdpdGhvdXQgYSBwbGV0aG9yYSBvZiBwYXJhbWV0ZXJpemVkIHR5cGVzIHRvIGNvbnZleSBpZiB0aGlzIGVuYWJsZWRQcm9wZXJ0eSBpc1xyXG4gICAgLy8gc2V0dGFibGUsIHNvIGFjY2VwdCB1bnNldHRhYmxlLCBhbmQgdHlwZWNhc3QgdG8gc2V0dGFibGUuXHJcbiAgICB0aGlzLmVuYWJsZWRQcm9wZXJ0eSA9IG9wdGlvbnMuZW5hYmxlZFByb3BlcnR5IHx8IG5ldyBFbmFibGVkUHJvcGVydHkoIG9wdGlvbnMuZW5hYmxlZCwgbWVyZ2UoIHtcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnBoZXRpb0VuYWJsZWRQcm9wZXJ0eUluc3RydW1lbnRlZCA/IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggRW5hYmxlZFByb3BlcnR5LlRBTkRFTV9OQU1FICkgOiBUYW5kZW0uT1BUX09VVFxyXG4gICAgfSwgb3B0aW9ucy5lbmFibGVkUHJvcGVydHlPcHRpb25zICkgKTtcclxuXHJcbiAgICB0aGlzLmRpc3Bvc2VFbmFibGVkQ29tcG9uZW50ID0gKCkgPT4ge1xyXG4gICAgICBvd25zRW5hYmxlZFByb3BlcnR5ICYmIHRoaXMuZW5hYmxlZFByb3BlcnR5LmRpc3Bvc2UoKTtcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHNldEVuYWJsZWQoIGVuYWJsZWQ6IGJvb2xlYW4gKTogdm9pZCB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCB0aGlzLmVuYWJsZWRQcm9wZXJ0eS5pc1NldHRhYmxlKCksICdjYW5ub3Qgc2V0IGVuYWJsZWRQcm9wZXJ0eScgKTtcclxuICAgIHRoaXMuZW5hYmxlZFByb3BlcnR5LnZhbHVlID0gZW5hYmxlZDtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBzZXQgZW5hYmxlZCggdmFsdWU6IGJvb2xlYW4gKSB7IHRoaXMuc2V0RW5hYmxlZCggdmFsdWUgKTsgfVxyXG5cclxuICBwdWJsaWMgZ2V0IGVuYWJsZWQoKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLmlzRW5hYmxlZCgpOyB9XHJcblxyXG4gIHB1YmxpYyBpc0VuYWJsZWQoKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLmVuYWJsZWRQcm9wZXJ0eS52YWx1ZTsgfVxyXG5cclxuICBwdWJsaWMgb3ZlcnJpZGUgZGlzcG9zZSgpOiB2b2lkIHtcclxuICAgIHRoaXMuZGlzcG9zZUVuYWJsZWRDb21wb25lbnQoKTtcclxuICAgIHN1cGVyLmRpc3Bvc2UoKTtcclxuICB9XHJcbn1cclxuXHJcbmF4b24ucmVnaXN0ZXIoICdFbmFibGVkQ29tcG9uZW50JywgRW5hYmxlZENvbXBvbmVudCApO1xyXG4iXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsZUFBZSxNQUFrQyxzQkFBc0I7QUFDOUUsT0FBT0MsS0FBSyxNQUFNLDZCQUE2QjtBQUMvQyxTQUFTQyxVQUFVLFFBQVEsaUNBQWlDO0FBQzVELE9BQU9DLE1BQU0sTUFBTSwyQkFBMkI7QUFDOUMsT0FBT0MsSUFBSSxNQUFNLFdBQVc7QUFHNUIsT0FBT0MsVUFBVSxNQUFNLGlCQUFpQjs7QUFFeEM7QUFDQSxNQUFNQyxlQUFlLEdBQUc7RUFDdEJDLGVBQWUsRUFBRSxJQUFJO0VBQ3JCQyxPQUFPLEVBQUUsSUFBSTtFQUNiQyxzQkFBc0IsRUFBRSxJQUFJO0VBQzVCQyxpQ0FBaUMsRUFBRSxJQUFJO0VBQ3ZDQyxNQUFNLEVBQUVSLE1BQU0sQ0FBQ1M7QUFDakIsQ0FBVTtBQXVCVixlQUFlLE1BQU1DLGdCQUFnQixTQUFTUixVQUFVLENBQUM7RUFNaERTLFdBQVdBLENBQUVDLGVBQXlDLEVBQUc7SUFFOUQsTUFBTUMsT0FBTyxHQUFHZCxVQUFVLENBQXVDLENBQUMsQ0FBRSxDQUFDLENBQUMsRUFBRUksZUFBZSxFQUFFUyxlQUFnQixDQUFDO0lBRTFHLE1BQU1FLG1CQUFtQixHQUFHLENBQUNELE9BQU8sQ0FBQ1QsZUFBZTtJQUVwRFcsTUFBTSxJQUFJRixPQUFPLENBQUNQLHNCQUFzQixJQUFJUyxNQUFNLENBQUUsRUFBRyxDQUFDRixPQUFPLENBQUNOLGlDQUFpQyxJQUFJTSxPQUFPLENBQUNQLHNCQUFzQixDQUFDRSxNQUFNLENBQUUsRUFDMUkseUhBQTBILENBQUM7SUFFN0gsS0FBSyxDQUFDLENBQUM7O0lBRVA7SUFDQTtJQUNBLElBQUksQ0FBQ0osZUFBZSxHQUFHUyxPQUFPLENBQUNULGVBQWUsSUFBSSxJQUFJUCxlQUFlLENBQUVnQixPQUFPLENBQUNSLE9BQU8sRUFBRVAsS0FBSyxDQUFFO01BQzdGVSxNQUFNLEVBQUVLLE9BQU8sQ0FBQ04saUNBQWlDLEdBQUdNLE9BQU8sQ0FBQ0wsTUFBTSxDQUFDUSxZQUFZLENBQUVuQixlQUFlLENBQUNvQixXQUFZLENBQUMsR0FBR2pCLE1BQU0sQ0FBQ2tCO0lBQzFILENBQUMsRUFBRUwsT0FBTyxDQUFDUCxzQkFBdUIsQ0FBRSxDQUFDO0lBRXJDLElBQUksQ0FBQ2EsdUJBQXVCLEdBQUcsTUFBTTtNQUNuQ0wsbUJBQW1CLElBQUksSUFBSSxDQUFDVixlQUFlLENBQUNnQixPQUFPLENBQUMsQ0FBQztJQUN2RCxDQUFDO0VBQ0g7RUFFUUMsVUFBVUEsQ0FBRWhCLE9BQWdCLEVBQVM7SUFDM0NVLE1BQU0sSUFBSUEsTUFBTSxDQUFFLElBQUksQ0FBQ1gsZUFBZSxDQUFDa0IsVUFBVSxDQUFDLENBQUMsRUFBRSw0QkFBNkIsQ0FBQztJQUNuRixJQUFJLENBQUNsQixlQUFlLENBQUNtQixLQUFLLEdBQUdsQixPQUFPO0VBQ3RDO0VBRUEsSUFBV0EsT0FBT0EsQ0FBRWtCLEtBQWMsRUFBRztJQUFFLElBQUksQ0FBQ0YsVUFBVSxDQUFFRSxLQUFNLENBQUM7RUFBRTtFQUVqRSxJQUFXbEIsT0FBT0EsQ0FBQSxFQUFZO0lBQUUsT0FBTyxJQUFJLENBQUNtQixTQUFTLENBQUMsQ0FBQztFQUFFO0VBRWxEQSxTQUFTQSxDQUFBLEVBQVk7SUFBRSxPQUFPLElBQUksQ0FBQ3BCLGVBQWUsQ0FBQ21CLEtBQUs7RUFBRTtFQUVqREgsT0FBT0EsQ0FBQSxFQUFTO0lBQzlCLElBQUksQ0FBQ0QsdUJBQXVCLENBQUMsQ0FBQztJQUM5QixLQUFLLENBQUNDLE9BQU8sQ0FBQyxDQUFDO0VBQ2pCO0FBQ0Y7QUFFQW5CLElBQUksQ0FBQ3dCLFFBQVEsQ0FBRSxrQkFBa0IsRUFBRWYsZ0JBQWlCLENBQUMifQ==