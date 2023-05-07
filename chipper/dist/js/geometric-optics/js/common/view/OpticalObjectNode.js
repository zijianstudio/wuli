// Copyright 2022, University of Colorado Boulder

/**
 * OpticalObjectNode is the view base class for all optical objects.  It's primary responsibility is for cueing arrows,
 * which are common to all optical objects.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import { InteractiveHighlighting, Node } from '../../../../scenery/js/imports.js';
import geometricOptics from '../../geometricOptics.js';
import CueingArrowsNode from './CueingArrowsNode.js';
import optionize from '../../../../phet-core/js/optionize.js';
export default class OpticalObjectNode extends InteractiveHighlighting(Node) {
  /**
   * @param opticalObject - model element
   * @param objectDragModeProperty - constrains how an optical object can be dragged
   * @param wasDraggedProperty - was this optical object dragged?
   * @param providedOptions
   */
  constructor(opticalObject, objectDragModeProperty, wasDraggedProperty, providedOptions) {
    const options = optionize()({
      // NodeOptions
      tagName: 'div',
      focusable: true,
      phetioVisiblePropertyInstrumented: false,
      phetioInputEnabledPropertyInstrumented: true
    }, providedOptions);
    super(options);
    this.wasDraggedProperty = wasDraggedProperty;
    this.cueingArrowsNode = new CueingArrowsNode({
      visibleProperty: CueingArrowsNode.createVisibleProperty(this.inputEnabledProperty, wasDraggedProperty)
    });
    this.addChild(this.cueingArrowsNode);

    // Update cursor and cueing arrows to reflect how this Node is draggable.
    objectDragModeProperty.link(objectDragMode => {
      if (objectDragMode === 'freeDragging') {
        this.cursor = 'pointer';
        this.cueingArrowsNode.setDirection('both');
      } else {
        // horizontal dragging
        this.cursor = 'ew-resize';
        this.cueingArrowsNode.setDirection('horizontal');
      }
    });
    this.addLinkedElement(opticalObject, {
      tandem: options.tandem.createTandem(opticalObject.tandem.name)
    });
  }

  /**
   * Called by drag listeners when this Node is dragged.
   */
  drag() {
    this.wasDraggedProperty.value = true;
  }
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
    super.dispose();
  }
}
geometricOptics.register('OpticalObjectNode', OpticalObjectNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJJbnRlcmFjdGl2ZUhpZ2hsaWdodGluZyIsIk5vZGUiLCJnZW9tZXRyaWNPcHRpY3MiLCJDdWVpbmdBcnJvd3NOb2RlIiwib3B0aW9uaXplIiwiT3B0aWNhbE9iamVjdE5vZGUiLCJjb25zdHJ1Y3RvciIsIm9wdGljYWxPYmplY3QiLCJvYmplY3REcmFnTW9kZVByb3BlcnR5Iiwid2FzRHJhZ2dlZFByb3BlcnR5IiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsInRhZ05hbWUiLCJmb2N1c2FibGUiLCJwaGV0aW9WaXNpYmxlUHJvcGVydHlJbnN0cnVtZW50ZWQiLCJwaGV0aW9JbnB1dEVuYWJsZWRQcm9wZXJ0eUluc3RydW1lbnRlZCIsImN1ZWluZ0Fycm93c05vZGUiLCJ2aXNpYmxlUHJvcGVydHkiLCJjcmVhdGVWaXNpYmxlUHJvcGVydHkiLCJpbnB1dEVuYWJsZWRQcm9wZXJ0eSIsImFkZENoaWxkIiwibGluayIsIm9iamVjdERyYWdNb2RlIiwiY3Vyc29yIiwic2V0RGlyZWN0aW9uIiwiYWRkTGlua2VkRWxlbWVudCIsInRhbmRlbSIsImNyZWF0ZVRhbmRlbSIsIm5hbWUiLCJkcmFnIiwidmFsdWUiLCJkaXNwb3NlIiwiYXNzZXJ0IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJPcHRpY2FsT2JqZWN0Tm9kZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogT3B0aWNhbE9iamVjdE5vZGUgaXMgdGhlIHZpZXcgYmFzZSBjbGFzcyBmb3IgYWxsIG9wdGljYWwgb2JqZWN0cy4gIEl0J3MgcHJpbWFyeSByZXNwb25zaWJpbGl0eSBpcyBmb3IgY3VlaW5nIGFycm93cyxcclxuICogd2hpY2ggYXJlIGNvbW1vbiB0byBhbGwgb3B0aWNhbCBvYmplY3RzLlxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBUUmVhZE9ubHlQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1RSZWFkT25seVByb3BlcnR5LmpzJztcclxuaW1wb3J0IHsgSW50ZXJhY3RpdmVIaWdobGlnaHRpbmcsIE5vZGUsIE5vZGVPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IGdlb21ldHJpY09wdGljcyBmcm9tICcuLi8uLi9nZW9tZXRyaWNPcHRpY3MuanMnO1xyXG5pbXBvcnQgQ3VlaW5nQXJyb3dzTm9kZSBmcm9tICcuL0N1ZWluZ0Fycm93c05vZGUuanMnO1xyXG5pbXBvcnQgb3B0aW9uaXplLCB7IEVtcHR5U2VsZk9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcclxuaW1wb3J0IFBpY2tSZXF1aXJlZCBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvUGlja1JlcXVpcmVkLmpzJztcclxuaW1wb3J0IFBpY2tPcHRpb25hbCBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvUGlja09wdGlvbmFsLmpzJztcclxuaW1wb3J0IHsgT2JqZWN0RHJhZ01vZGUgfSBmcm9tICcuL09iamVjdERyYWdNb2RlLmpzJztcclxuaW1wb3J0IE9wdGljYWxPYmplY3QgZnJvbSAnLi4vbW9kZWwvT3B0aWNhbE9iamVjdC5qcyc7XHJcbmltcG9ydCBUUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9UUHJvcGVydHkuanMnO1xyXG5cclxudHlwZSBTZWxmT3B0aW9ucyA9IEVtcHR5U2VsZk9wdGlvbnM7XHJcblxyXG5leHBvcnQgdHlwZSBPcHRpY2FsT2JqZWN0Tm9kZU9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmXHJcbiAgUGlja1JlcXVpcmVkPE5vZGVPcHRpb25zLCAndGFuZGVtJz4gJlxyXG4gIFBpY2tPcHRpb25hbDxOb2RlT3B0aW9ucywgJ3Zpc2libGVQcm9wZXJ0eSc+O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgT3B0aWNhbE9iamVjdE5vZGUgZXh0ZW5kcyBJbnRlcmFjdGl2ZUhpZ2hsaWdodGluZyggTm9kZSApIHtcclxuXHJcbiAgcHJpdmF0ZSByZWFkb25seSB3YXNEcmFnZ2VkUHJvcGVydHk6IFRQcm9wZXJ0eTxib29sZWFuPjtcclxuICBwcm90ZWN0ZWQgcmVhZG9ubHkgY3VlaW5nQXJyb3dzTm9kZTogQ3VlaW5nQXJyb3dzTm9kZTtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIG9wdGljYWxPYmplY3QgLSBtb2RlbCBlbGVtZW50XHJcbiAgICogQHBhcmFtIG9iamVjdERyYWdNb2RlUHJvcGVydHkgLSBjb25zdHJhaW5zIGhvdyBhbiBvcHRpY2FsIG9iamVjdCBjYW4gYmUgZHJhZ2dlZFxyXG4gICAqIEBwYXJhbSB3YXNEcmFnZ2VkUHJvcGVydHkgLSB3YXMgdGhpcyBvcHRpY2FsIG9iamVjdCBkcmFnZ2VkP1xyXG4gICAqIEBwYXJhbSBwcm92aWRlZE9wdGlvbnNcclxuICAgKi9cclxuICBwcm90ZWN0ZWQgY29uc3RydWN0b3IoIG9wdGljYWxPYmplY3Q6IE9wdGljYWxPYmplY3QsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICBvYmplY3REcmFnTW9kZVByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxPYmplY3REcmFnTW9kZT4sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICB3YXNEcmFnZ2VkUHJvcGVydHk6IFRQcm9wZXJ0eTxib29sZWFuPixcclxuICAgICAgICAgICAgICAgICAgICAgICAgIHByb3ZpZGVkT3B0aW9uczogT3B0aWNhbE9iamVjdE5vZGVPcHRpb25zICkge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8T3B0aWNhbE9iamVjdE5vZGVPcHRpb25zLCBTZWxmT3B0aW9ucywgTm9kZU9wdGlvbnM+KCkoIHtcclxuXHJcbiAgICAgIC8vIE5vZGVPcHRpb25zXHJcbiAgICAgIHRhZ05hbWU6ICdkaXYnLFxyXG4gICAgICBmb2N1c2FibGU6IHRydWUsXHJcbiAgICAgIHBoZXRpb1Zpc2libGVQcm9wZXJ0eUluc3RydW1lbnRlZDogZmFsc2UsXHJcbiAgICAgIHBoZXRpb0lucHV0RW5hYmxlZFByb3BlcnR5SW5zdHJ1bWVudGVkOiB0cnVlXHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICBzdXBlciggb3B0aW9ucyApO1xyXG5cclxuICAgIHRoaXMud2FzRHJhZ2dlZFByb3BlcnR5ID0gd2FzRHJhZ2dlZFByb3BlcnR5O1xyXG5cclxuICAgIHRoaXMuY3VlaW5nQXJyb3dzTm9kZSA9IG5ldyBDdWVpbmdBcnJvd3NOb2RlKCB7XHJcbiAgICAgIHZpc2libGVQcm9wZXJ0eTogQ3VlaW5nQXJyb3dzTm9kZS5jcmVhdGVWaXNpYmxlUHJvcGVydHkoIHRoaXMuaW5wdXRFbmFibGVkUHJvcGVydHksIHdhc0RyYWdnZWRQcm9wZXJ0eSApXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCB0aGlzLmN1ZWluZ0Fycm93c05vZGUgKTtcclxuXHJcbiAgICAvLyBVcGRhdGUgY3Vyc29yIGFuZCBjdWVpbmcgYXJyb3dzIHRvIHJlZmxlY3QgaG93IHRoaXMgTm9kZSBpcyBkcmFnZ2FibGUuXHJcbiAgICBvYmplY3REcmFnTW9kZVByb3BlcnR5LmxpbmsoIG9iamVjdERyYWdNb2RlID0+IHtcclxuICAgICAgaWYgKCBvYmplY3REcmFnTW9kZSA9PT0gJ2ZyZWVEcmFnZ2luZycgKSB7XHJcbiAgICAgICAgdGhpcy5jdXJzb3IgPSAncG9pbnRlcic7XHJcbiAgICAgICAgdGhpcy5jdWVpbmdBcnJvd3NOb2RlLnNldERpcmVjdGlvbiggJ2JvdGgnICk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcblxyXG4gICAgICAgIC8vIGhvcml6b250YWwgZHJhZ2dpbmdcclxuICAgICAgICB0aGlzLmN1cnNvciA9ICdldy1yZXNpemUnO1xyXG4gICAgICAgIHRoaXMuY3VlaW5nQXJyb3dzTm9kZS5zZXREaXJlY3Rpb24oICdob3Jpem9udGFsJyApO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5hZGRMaW5rZWRFbGVtZW50KCBvcHRpY2FsT2JqZWN0LCB7XHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCBvcHRpY2FsT2JqZWN0LnRhbmRlbS5uYW1lIClcclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENhbGxlZCBieSBkcmFnIGxpc3RlbmVycyB3aGVuIHRoaXMgTm9kZSBpcyBkcmFnZ2VkLlxyXG4gICAqL1xyXG4gIHByb3RlY3RlZCBkcmFnKCk6IHZvaWQge1xyXG4gICAgdGhpcy53YXNEcmFnZ2VkUHJvcGVydHkudmFsdWUgPSB0cnVlO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBmYWxzZSwgJ2Rpc3Bvc2UgaXMgbm90IHN1cHBvcnRlZCwgZXhpc3RzIGZvciB0aGUgbGlmZXRpbWUgb2YgdGhlIHNpbScgKTtcclxuICAgIHN1cGVyLmRpc3Bvc2UoKTtcclxuICB9XHJcbn1cclxuXHJcbmdlb21ldHJpY09wdGljcy5yZWdpc3RlciggJ09wdGljYWxPYmplY3ROb2RlJywgT3B0aWNhbE9iamVjdE5vZGUgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFHQSxTQUFTQSx1QkFBdUIsRUFBRUMsSUFBSSxRQUFxQixtQ0FBbUM7QUFDOUYsT0FBT0MsZUFBZSxNQUFNLDBCQUEwQjtBQUN0RCxPQUFPQyxnQkFBZ0IsTUFBTSx1QkFBdUI7QUFDcEQsT0FBT0MsU0FBUyxNQUE0Qix1Q0FBdUM7QUFhbkYsZUFBZSxNQUFNQyxpQkFBaUIsU0FBU0wsdUJBQXVCLENBQUVDLElBQUssQ0FBQyxDQUFDO0VBSzdFO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNZSyxXQUFXQSxDQUFFQyxhQUE0QixFQUM1QkMsc0JBQXlELEVBQ3pEQyxrQkFBc0MsRUFDdENDLGVBQXlDLEVBQUc7SUFFakUsTUFBTUMsT0FBTyxHQUFHUCxTQUFTLENBQXFELENBQUMsQ0FBRTtNQUUvRTtNQUNBUSxPQUFPLEVBQUUsS0FBSztNQUNkQyxTQUFTLEVBQUUsSUFBSTtNQUNmQyxpQ0FBaUMsRUFBRSxLQUFLO01BQ3hDQyxzQ0FBc0MsRUFBRTtJQUMxQyxDQUFDLEVBQUVMLGVBQWdCLENBQUM7SUFFcEIsS0FBSyxDQUFFQyxPQUFRLENBQUM7SUFFaEIsSUFBSSxDQUFDRixrQkFBa0IsR0FBR0Esa0JBQWtCO0lBRTVDLElBQUksQ0FBQ08sZ0JBQWdCLEdBQUcsSUFBSWIsZ0JBQWdCLENBQUU7TUFDNUNjLGVBQWUsRUFBRWQsZ0JBQWdCLENBQUNlLHFCQUFxQixDQUFFLElBQUksQ0FBQ0Msb0JBQW9CLEVBQUVWLGtCQUFtQjtJQUN6RyxDQUFFLENBQUM7SUFDSCxJQUFJLENBQUNXLFFBQVEsQ0FBRSxJQUFJLENBQUNKLGdCQUFpQixDQUFDOztJQUV0QztJQUNBUixzQkFBc0IsQ0FBQ2EsSUFBSSxDQUFFQyxjQUFjLElBQUk7TUFDN0MsSUFBS0EsY0FBYyxLQUFLLGNBQWMsRUFBRztRQUN2QyxJQUFJLENBQUNDLE1BQU0sR0FBRyxTQUFTO1FBQ3ZCLElBQUksQ0FBQ1AsZ0JBQWdCLENBQUNRLFlBQVksQ0FBRSxNQUFPLENBQUM7TUFDOUMsQ0FBQyxNQUNJO1FBRUg7UUFDQSxJQUFJLENBQUNELE1BQU0sR0FBRyxXQUFXO1FBQ3pCLElBQUksQ0FBQ1AsZ0JBQWdCLENBQUNRLFlBQVksQ0FBRSxZQUFhLENBQUM7TUFDcEQ7SUFDRixDQUFFLENBQUM7SUFFSCxJQUFJLENBQUNDLGdCQUFnQixDQUFFbEIsYUFBYSxFQUFFO01BQ3BDbUIsTUFBTSxFQUFFZixPQUFPLENBQUNlLE1BQU0sQ0FBQ0MsWUFBWSxDQUFFcEIsYUFBYSxDQUFDbUIsTUFBTSxDQUFDRSxJQUFLO0lBQ2pFLENBQUUsQ0FBQztFQUNMOztFQUVBO0FBQ0Y7QUFDQTtFQUNZQyxJQUFJQSxDQUFBLEVBQVM7SUFDckIsSUFBSSxDQUFDcEIsa0JBQWtCLENBQUNxQixLQUFLLEdBQUcsSUFBSTtFQUN0QztFQUVnQkMsT0FBT0EsQ0FBQSxFQUFTO0lBQzlCQyxNQUFNLElBQUlBLE1BQU0sQ0FBRSxLQUFLLEVBQUUsOERBQStELENBQUM7SUFDekYsS0FBSyxDQUFDRCxPQUFPLENBQUMsQ0FBQztFQUNqQjtBQUNGO0FBRUE3QixlQUFlLENBQUMrQixRQUFRLENBQUUsbUJBQW1CLEVBQUU1QixpQkFBa0IsQ0FBQyJ9