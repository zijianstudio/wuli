// Copyright 2017-2022, University of Colorado Boulder

/**
 * View for the 'Basics' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import EqualityExplorerScreenView from '../../common/view/EqualityExplorerScreenView.js';
import equalityExplorer from '../../equalityExplorer.js';
import BasicsSceneNode from './BasicsSceneNode.js';
export default class BasicsScreenView extends EqualityExplorerScreenView {
  constructor(model, tandem) {
    super(model, tandem);
  }

  /**
   * Creates the Node for this scene.
   */
  createSceneNode(scene, equationAccordionBoxExpandedProperty, snapshotsAccordionBoxExpandedProperty, layoutBounds, providedOptions) {
    return new BasicsSceneNode(scene, equationAccordionBoxExpandedProperty, snapshotsAccordionBoxExpandedProperty, layoutBounds, providedOptions);
  }
}
equalityExplorer.register('BasicsScreenView', BasicsScreenView);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJFcXVhbGl0eUV4cGxvcmVyU2NyZWVuVmlldyIsImVxdWFsaXR5RXhwbG9yZXIiLCJCYXNpY3NTY2VuZU5vZGUiLCJCYXNpY3NTY3JlZW5WaWV3IiwiY29uc3RydWN0b3IiLCJtb2RlbCIsInRhbmRlbSIsImNyZWF0ZVNjZW5lTm9kZSIsInNjZW5lIiwiZXF1YXRpb25BY2NvcmRpb25Cb3hFeHBhbmRlZFByb3BlcnR5Iiwic25hcHNob3RzQWNjb3JkaW9uQm94RXhwYW5kZWRQcm9wZXJ0eSIsImxheW91dEJvdW5kcyIsInByb3ZpZGVkT3B0aW9ucyIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiQmFzaWNzU2NyZWVuVmlldy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNy0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBWaWV3IGZvciB0aGUgJ0Jhc2ljcycgc2NyZWVuLlxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBFcXVhbGl0eUV4cGxvcmVyU2NyZWVuVmlldyBmcm9tICcuLi8uLi9jb21tb24vdmlldy9FcXVhbGl0eUV4cGxvcmVyU2NyZWVuVmlldy5qcyc7XHJcbmltcG9ydCBlcXVhbGl0eUV4cGxvcmVyIGZyb20gJy4uLy4uL2VxdWFsaXR5RXhwbG9yZXIuanMnO1xyXG5pbXBvcnQgQmFzaWNzU2NlbmVOb2RlLCB7IEJhc2ljc1NjZW5lTm9kZU9wdGlvbnMgfSBmcm9tICcuL0Jhc2ljc1NjZW5lTm9kZS5qcyc7XHJcbmltcG9ydCBFcXVhbGl0eUV4cGxvcmVyU2NlbmUgZnJvbSAnLi4vLi4vY29tbW9uL21vZGVsL0VxdWFsaXR5RXhwbG9yZXJTY2VuZS5qcyc7XHJcbmltcG9ydCBCb3VuZHMyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9Cb3VuZHMyLmpzJztcclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgQmFzaWNzTW9kZWwgZnJvbSAnLi4vbW9kZWwvQmFzaWNzTW9kZWwuanMnO1xyXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQmFzaWNzU2NyZWVuVmlldyBleHRlbmRzIEVxdWFsaXR5RXhwbG9yZXJTY3JlZW5WaWV3IHtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBtb2RlbDogQmFzaWNzTW9kZWwsIHRhbmRlbTogVGFuZGVtICkge1xyXG4gICAgc3VwZXIoIG1vZGVsLCB0YW5kZW0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgdGhlIE5vZGUgZm9yIHRoaXMgc2NlbmUuXHJcbiAgICovXHJcbiAgcHJvdGVjdGVkIG92ZXJyaWRlIGNyZWF0ZVNjZW5lTm9kZSggc2NlbmU6IEVxdWFsaXR5RXhwbG9yZXJTY2VuZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcXVhdGlvbkFjY29yZGlvbkJveEV4cGFuZGVkUHJvcGVydHk6IFByb3BlcnR5PGJvb2xlYW4+LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNuYXBzaG90c0FjY29yZGlvbkJveEV4cGFuZGVkUHJvcGVydHk6IFByb3BlcnR5PGJvb2xlYW4+LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxheW91dEJvdW5kczogQm91bmRzMixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm92aWRlZE9wdGlvbnM6IEJhc2ljc1NjZW5lTm9kZU9wdGlvbnMgKTogQmFzaWNzU2NlbmVOb2RlIHtcclxuICAgIHJldHVybiBuZXcgQmFzaWNzU2NlbmVOb2RlKCBzY2VuZSwgZXF1YXRpb25BY2NvcmRpb25Cb3hFeHBhbmRlZFByb3BlcnR5LFxyXG4gICAgICBzbmFwc2hvdHNBY2NvcmRpb25Cb3hFeHBhbmRlZFByb3BlcnR5LCBsYXlvdXRCb3VuZHMsIHByb3ZpZGVkT3B0aW9ucyApO1xyXG4gIH1cclxufVxyXG5cclxuZXF1YWxpdHlFeHBsb3Jlci5yZWdpc3RlciggJ0Jhc2ljc1NjcmVlblZpZXcnLCBCYXNpY3NTY3JlZW5WaWV3ICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLDBCQUEwQixNQUFNLGlEQUFpRDtBQUN4RixPQUFPQyxnQkFBZ0IsTUFBTSwyQkFBMkI7QUFDeEQsT0FBT0MsZUFBZSxNQUFrQyxzQkFBc0I7QUFPOUUsZUFBZSxNQUFNQyxnQkFBZ0IsU0FBU0gsMEJBQTBCLENBQUM7RUFFaEVJLFdBQVdBLENBQUVDLEtBQWtCLEVBQUVDLE1BQWMsRUFBRztJQUN2RCxLQUFLLENBQUVELEtBQUssRUFBRUMsTUFBTyxDQUFDO0VBQ3hCOztFQUVBO0FBQ0Y7QUFDQTtFQUNxQkMsZUFBZUEsQ0FBRUMsS0FBNEIsRUFDNUJDLG9DQUF1RCxFQUN2REMscUNBQXdELEVBQ3hEQyxZQUFxQixFQUNyQkMsZUFBdUMsRUFBb0I7SUFDN0YsT0FBTyxJQUFJVixlQUFlLENBQUVNLEtBQUssRUFBRUMsb0NBQW9DLEVBQ3JFQyxxQ0FBcUMsRUFBRUMsWUFBWSxFQUFFQyxlQUFnQixDQUFDO0VBQzFFO0FBQ0Y7QUFFQVgsZ0JBQWdCLENBQUNZLFFBQVEsQ0FBRSxrQkFBa0IsRUFBRVYsZ0JBQWlCLENBQUMifQ==