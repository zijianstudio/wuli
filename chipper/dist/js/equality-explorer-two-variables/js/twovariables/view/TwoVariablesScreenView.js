// Copyright 2018-2022, University of Colorado Boulder

/**
 * View for the 'Two Variables' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import EqualityExplorerScreenView from '../../../../equality-explorer/js/common/view/EqualityExplorerScreenView.js';
import equalityExplorerTwoVariables from '../../equalityExplorerTwoVariables.js';
import TwoVariablesSceneNode from './TwoVariablesSceneNode.js';
export default class TwoVariablesScreenView extends EqualityExplorerScreenView {
  constructor(model, tandem) {
    super(model, tandem);
  }

  /**
   * Creates the Node for this scene.
   */
  createSceneNode(scene, equationAccordionBoxExpandedProperty, snapshotsAccordionBoxExpandedProperty, layoutBounds, providedOptions) {
    return new TwoVariablesSceneNode(scene, equationAccordionBoxExpandedProperty, snapshotsAccordionBoxExpandedProperty, layoutBounds, providedOptions);
  }
}
equalityExplorerTwoVariables.register('TwoVariablesScreenView', TwoVariablesScreenView);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJFcXVhbGl0eUV4cGxvcmVyU2NyZWVuVmlldyIsImVxdWFsaXR5RXhwbG9yZXJUd29WYXJpYWJsZXMiLCJUd29WYXJpYWJsZXNTY2VuZU5vZGUiLCJUd29WYXJpYWJsZXNTY3JlZW5WaWV3IiwiY29uc3RydWN0b3IiLCJtb2RlbCIsInRhbmRlbSIsImNyZWF0ZVNjZW5lTm9kZSIsInNjZW5lIiwiZXF1YXRpb25BY2NvcmRpb25Cb3hFeHBhbmRlZFByb3BlcnR5Iiwic25hcHNob3RzQWNjb3JkaW9uQm94RXhwYW5kZWRQcm9wZXJ0eSIsImxheW91dEJvdW5kcyIsInByb3ZpZGVkT3B0aW9ucyIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiVHdvVmFyaWFibGVzU2NyZWVuVmlldy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBWaWV3IGZvciB0aGUgJ1R3byBWYXJpYWJsZXMnIHNjcmVlbi5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBCb3VuZHMyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9Cb3VuZHMyLmpzJztcclxuaW1wb3J0IEVxdWFsaXR5RXhwbG9yZXJTY2VuZSBmcm9tICcuLi8uLi8uLi8uLi9lcXVhbGl0eS1leHBsb3Jlci9qcy9jb21tb24vbW9kZWwvRXF1YWxpdHlFeHBsb3JlclNjZW5lLmpzJztcclxuaW1wb3J0IEVxdWFsaXR5RXhwbG9yZXJTY3JlZW5WaWV3IGZyb20gJy4uLy4uLy4uLy4uL2VxdWFsaXR5LWV4cGxvcmVyL2pzL2NvbW1vbi92aWV3L0VxdWFsaXR5RXhwbG9yZXJTY3JlZW5WaWV3LmpzJztcclxuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcclxuaW1wb3J0IGVxdWFsaXR5RXhwbG9yZXJUd29WYXJpYWJsZXMgZnJvbSAnLi4vLi4vZXF1YWxpdHlFeHBsb3JlclR3b1ZhcmlhYmxlcy5qcyc7XHJcbmltcG9ydCBUd29WYXJpYWJsZXNNb2RlbCBmcm9tICcuLi9tb2RlbC9Ud29WYXJpYWJsZXNNb2RlbC5qcyc7XHJcbmltcG9ydCBUd29WYXJpYWJsZXNTY2VuZU5vZGUsIHsgVHdvVmFyaWFibGVzU2NlbmVOb2RlT3B0aW9ucyB9IGZyb20gJy4vVHdvVmFyaWFibGVzU2NlbmVOb2RlLmpzJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFR3b1ZhcmlhYmxlc1NjcmVlblZpZXcgZXh0ZW5kcyBFcXVhbGl0eUV4cGxvcmVyU2NyZWVuVmlldyB7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggbW9kZWw6IFR3b1ZhcmlhYmxlc01vZGVsLCB0YW5kZW06IFRhbmRlbSApIHtcclxuICAgIHN1cGVyKCBtb2RlbCwgdGFuZGVtICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGVzIHRoZSBOb2RlIGZvciB0aGlzIHNjZW5lLlxyXG4gICAqL1xyXG4gIHByb3RlY3RlZCBvdmVycmlkZSBjcmVhdGVTY2VuZU5vZGUoIHNjZW5lOiBFcXVhbGl0eUV4cGxvcmVyU2NlbmUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXF1YXRpb25BY2NvcmRpb25Cb3hFeHBhbmRlZFByb3BlcnR5OiBQcm9wZXJ0eTxib29sZWFuPixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzbmFwc2hvdHNBY2NvcmRpb25Cb3hFeHBhbmRlZFByb3BlcnR5OiBQcm9wZXJ0eTxib29sZWFuPixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXlvdXRCb3VuZHM6IEJvdW5kczIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvdmlkZWRPcHRpb25zOiBUd29WYXJpYWJsZXNTY2VuZU5vZGVPcHRpb25zICk6IFR3b1ZhcmlhYmxlc1NjZW5lTm9kZSB7XHJcbiAgICByZXR1cm4gbmV3IFR3b1ZhcmlhYmxlc1NjZW5lTm9kZSggc2NlbmUsIGVxdWF0aW9uQWNjb3JkaW9uQm94RXhwYW5kZWRQcm9wZXJ0eSxcclxuICAgICAgc25hcHNob3RzQWNjb3JkaW9uQm94RXhwYW5kZWRQcm9wZXJ0eSwgbGF5b3V0Qm91bmRzLCBwcm92aWRlZE9wdGlvbnMgKTtcclxuICB9XHJcbn1cclxuXHJcbmVxdWFsaXR5RXhwbG9yZXJUd29WYXJpYWJsZXMucmVnaXN0ZXIoICdUd29WYXJpYWJsZXNTY3JlZW5WaWV3JywgVHdvVmFyaWFibGVzU2NyZWVuVmlldyApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFLQSxPQUFPQSwwQkFBMEIsTUFBTSw0RUFBNEU7QUFFbkgsT0FBT0MsNEJBQTRCLE1BQU0sdUNBQXVDO0FBRWhGLE9BQU9DLHFCQUFxQixNQUF3Qyw0QkFBNEI7QUFFaEcsZUFBZSxNQUFNQyxzQkFBc0IsU0FBU0gsMEJBQTBCLENBQUM7RUFFdEVJLFdBQVdBLENBQUVDLEtBQXdCLEVBQUVDLE1BQWMsRUFBRztJQUM3RCxLQUFLLENBQUVELEtBQUssRUFBRUMsTUFBTyxDQUFDO0VBQ3hCOztFQUVBO0FBQ0Y7QUFDQTtFQUNxQkMsZUFBZUEsQ0FBRUMsS0FBNEIsRUFDNUJDLG9DQUF1RCxFQUN2REMscUNBQXdELEVBQ3hEQyxZQUFxQixFQUNyQkMsZUFBNkMsRUFBMEI7SUFDekcsT0FBTyxJQUFJVixxQkFBcUIsQ0FBRU0sS0FBSyxFQUFFQyxvQ0FBb0MsRUFDM0VDLHFDQUFxQyxFQUFFQyxZQUFZLEVBQUVDLGVBQWdCLENBQUM7RUFDMUU7QUFDRjtBQUVBWCw0QkFBNEIsQ0FBQ1ksUUFBUSxDQUFFLHdCQUF3QixFQUFFVixzQkFBdUIsQ0FBQyJ9