// Copyright 2017-2022, University of Colorado Boulder

/**
 * View of a scene in the 'Variables' screen.
 * Same as the 'Basics' screen, but with a control for changing the variable value.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import BasicsSceneNode from '../../basics/view/BasicsSceneNode.js';
import VariablesAccordionBox from '../../common/view/VariablesAccordionBox.js';
import equalityExplorer from '../../equalityExplorer.js';
import optionize from '../../../../phet-core/js/optionize.js';
export default class VariablesSceneNode extends BasicsSceneNode {
  // whether variable values are visible in snapshots

  // whether the Variables accordion box is expanded or collapsed

  constructor(scene, equationAccordionBoxExpandedProperty, snapshotsAccordionBoxExpandedProperty, layoutBounds, providedOptions) {
    const options = optionize()({
      // BasicsSceneNode options
      termsToolboxSpacing: 30 // horizontal spacing between terms in the toolbox
    }, providedOptions);
    const variableValuesVisibleProperty = new BooleanProperty(true, {
      tandem: options.tandem.createTandem('variableValuesVisibleProperty')
    });
    options.variableValuesVisibleProperty = variableValuesVisibleProperty;
    super(scene, equationAccordionBoxExpandedProperty, snapshotsAccordionBoxExpandedProperty, layoutBounds, options);
    const variables = scene.variables;
    assert && assert(variables && variables.length > 0);
    this.variableValuesVisibleProperty = variableValuesVisibleProperty;
    this.variablesAccordionBoxExpandedProperty = new BooleanProperty(true, {
      // singular vs plural tandem name, to match VariablesAccordionBox title
      tandem: variables.length === 1 ? options.tandem.createTandem('variableAccordionBoxExpandedProperty') : options.tandem.createTandem('variablesAccordionBoxExpandedProperty')
    });

    // Variables accordion box, above the Snapshots accordion box
    const variablesAccordionBox = new VariablesAccordionBox(variables, {
      expandedProperty: this.variablesAccordionBoxExpandedProperty,
      fixedWidth: this.snapshotsAccordionBox.width,
      // same width as Snapshots
      right: this.snapshotsAccordionBox.right,
      top: this.snapshotsAccordionBox.top,
      // singular vs plural tandem name, to match VariablesAccordionBox title
      tandem: variables.length === 1 ? options.tandem.createTandem('variableAccordionBox') : options.tandem.createTandem('variablesAccordionBox')
    });
    this.addChild(variablesAccordionBox);
    variablesAccordionBox.moveToBack();
    const snapshotsAccordionBoxTop = this.snapshotsAccordionBox.top; // save the original position
    variablesAccordionBox.visibleProperty.link(visible => {
      if (visible) {
        // shift the Snapshots accordion box down
        this.snapshotsAccordionBox.top = variablesAccordionBox.bottom + 10;
      } else {
        this.snapshotsAccordionBox.top = snapshotsAccordionBoxTop;
      }
    });
  }
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
    super.dispose();
  }
  reset() {
    this.variablesAccordionBoxExpandedProperty.reset();
    this.variableValuesVisibleProperty.reset();
    super.reset();
  }
}
equalityExplorer.register('VariablesSceneNode', VariablesSceneNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJCYXNpY3NTY2VuZU5vZGUiLCJWYXJpYWJsZXNBY2NvcmRpb25Cb3giLCJlcXVhbGl0eUV4cGxvcmVyIiwib3B0aW9uaXplIiwiVmFyaWFibGVzU2NlbmVOb2RlIiwiY29uc3RydWN0b3IiLCJzY2VuZSIsImVxdWF0aW9uQWNjb3JkaW9uQm94RXhwYW5kZWRQcm9wZXJ0eSIsInNuYXBzaG90c0FjY29yZGlvbkJveEV4cGFuZGVkUHJvcGVydHkiLCJsYXlvdXRCb3VuZHMiLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwidGVybXNUb29sYm94U3BhY2luZyIsInZhcmlhYmxlVmFsdWVzVmlzaWJsZVByb3BlcnR5IiwidGFuZGVtIiwiY3JlYXRlVGFuZGVtIiwidmFyaWFibGVzIiwiYXNzZXJ0IiwibGVuZ3RoIiwidmFyaWFibGVzQWNjb3JkaW9uQm94RXhwYW5kZWRQcm9wZXJ0eSIsInZhcmlhYmxlc0FjY29yZGlvbkJveCIsImV4cGFuZGVkUHJvcGVydHkiLCJmaXhlZFdpZHRoIiwic25hcHNob3RzQWNjb3JkaW9uQm94Iiwid2lkdGgiLCJyaWdodCIsInRvcCIsImFkZENoaWxkIiwibW92ZVRvQmFjayIsInNuYXBzaG90c0FjY29yZGlvbkJveFRvcCIsInZpc2libGVQcm9wZXJ0eSIsImxpbmsiLCJ2aXNpYmxlIiwiYm90dG9tIiwiZGlzcG9zZSIsInJlc2V0IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJWYXJpYWJsZXNTY2VuZU5vZGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTctMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogVmlldyBvZiBhIHNjZW5lIGluIHRoZSAnVmFyaWFibGVzJyBzY3JlZW4uXHJcbiAqIFNhbWUgYXMgdGhlICdCYXNpY3MnIHNjcmVlbiwgYnV0IHdpdGggYSBjb250cm9sIGZvciBjaGFuZ2luZyB0aGUgdmFyaWFibGUgdmFsdWUuXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IEJvb2xlYW5Qcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0Jvb2xlYW5Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBCYXNpY3NTY2VuZU5vZGUsIHsgQmFzaWNzU2NlbmVOb2RlT3B0aW9ucyB9IGZyb20gJy4uLy4uL2Jhc2ljcy92aWV3L0Jhc2ljc1NjZW5lTm9kZS5qcyc7XHJcbmltcG9ydCBWYXJpYWJsZXNBY2NvcmRpb25Cb3ggZnJvbSAnLi4vLi4vY29tbW9uL3ZpZXcvVmFyaWFibGVzQWNjb3JkaW9uQm94LmpzJztcclxuaW1wb3J0IGVxdWFsaXR5RXhwbG9yZXIgZnJvbSAnLi4vLi4vZXF1YWxpdHlFeHBsb3Jlci5qcyc7XHJcbmltcG9ydCBFcXVhbGl0eUV4cGxvcmVyU2NlbmUgZnJvbSAnLi4vLi4vY29tbW9uL21vZGVsL0VxdWFsaXR5RXhwbG9yZXJTY2VuZS5qcyc7XHJcbmltcG9ydCBvcHRpb25pemUsIHsgRW1wdHlTZWxmT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBCb3VuZHMyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9Cb3VuZHMyLmpzJztcclxuaW1wb3J0IFN0cmljdE9taXQgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1N0cmljdE9taXQuanMnO1xyXG5cclxudHlwZSBTZWxmT3B0aW9ucyA9IEVtcHR5U2VsZk9wdGlvbnM7XHJcblxyXG5leHBvcnQgdHlwZSBWYXJpYWJsZXNTY2VuZU5vZGVPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBTdHJpY3RPbWl0PEJhc2ljc1NjZW5lTm9kZU9wdGlvbnMsICd2YXJpYWJsZVZhbHVlc1Zpc2libGVQcm9wZXJ0eSc+O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVmFyaWFibGVzU2NlbmVOb2RlIGV4dGVuZHMgQmFzaWNzU2NlbmVOb2RlIHtcclxuXHJcbiAgLy8gd2hldGhlciB2YXJpYWJsZSB2YWx1ZXMgYXJlIHZpc2libGUgaW4gc25hcHNob3RzXHJcbiAgcHJpdmF0ZSByZWFkb25seSB2YXJpYWJsZVZhbHVlc1Zpc2libGVQcm9wZXJ0eTogUHJvcGVydHk8Ym9vbGVhbj47XHJcblxyXG4gIC8vIHdoZXRoZXIgdGhlIFZhcmlhYmxlcyBhY2NvcmRpb24gYm94IGlzIGV4cGFuZGVkIG9yIGNvbGxhcHNlZFxyXG4gIHByaXZhdGUgcmVhZG9ubHkgdmFyaWFibGVzQWNjb3JkaW9uQm94RXhwYW5kZWRQcm9wZXJ0eTogUHJvcGVydHk8Ym9vbGVhbj47XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3Rvciggc2NlbmU6IEVxdWFsaXR5RXhwbG9yZXJTY2VuZSxcclxuICAgICAgICAgICAgICAgICAgICAgIGVxdWF0aW9uQWNjb3JkaW9uQm94RXhwYW5kZWRQcm9wZXJ0eTogUHJvcGVydHk8Ym9vbGVhbj4sXHJcbiAgICAgICAgICAgICAgICAgICAgICBzbmFwc2hvdHNBY2NvcmRpb25Cb3hFeHBhbmRlZFByb3BlcnR5OiBQcm9wZXJ0eTxib29sZWFuPixcclxuICAgICAgICAgICAgICAgICAgICAgIGxheW91dEJvdW5kczogQm91bmRzMixcclxuICAgICAgICAgICAgICAgICAgICAgIHByb3ZpZGVkT3B0aW9uczogVmFyaWFibGVzU2NlbmVOb2RlT3B0aW9ucyApIHtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPFZhcmlhYmxlc1NjZW5lTm9kZU9wdGlvbnMsIFNlbGZPcHRpb25zLCBCYXNpY3NTY2VuZU5vZGVPcHRpb25zPigpKCB7XHJcblxyXG4gICAgICAvLyBCYXNpY3NTY2VuZU5vZGUgb3B0aW9uc1xyXG4gICAgICB0ZXJtc1Rvb2xib3hTcGFjaW5nOiAzMCAvLyBob3Jpem9udGFsIHNwYWNpbmcgYmV0d2VlbiB0ZXJtcyBpbiB0aGUgdG9vbGJveFxyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgY29uc3QgdmFyaWFibGVWYWx1ZXNWaXNpYmxlUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCB0cnVlLCB7XHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAndmFyaWFibGVWYWx1ZXNWaXNpYmxlUHJvcGVydHknIClcclxuICAgIH0gKTtcclxuICAgIG9wdGlvbnMudmFyaWFibGVWYWx1ZXNWaXNpYmxlUHJvcGVydHkgPSB2YXJpYWJsZVZhbHVlc1Zpc2libGVQcm9wZXJ0eTtcclxuXHJcbiAgICBzdXBlciggc2NlbmUsIGVxdWF0aW9uQWNjb3JkaW9uQm94RXhwYW5kZWRQcm9wZXJ0eSwgc25hcHNob3RzQWNjb3JkaW9uQm94RXhwYW5kZWRQcm9wZXJ0eSwgbGF5b3V0Qm91bmRzLCBvcHRpb25zICk7XHJcblxyXG4gICAgY29uc3QgdmFyaWFibGVzID0gc2NlbmUudmFyaWFibGVzITtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHZhcmlhYmxlcyAmJiB2YXJpYWJsZXMubGVuZ3RoID4gMCApO1xyXG5cclxuICAgIHRoaXMudmFyaWFibGVWYWx1ZXNWaXNpYmxlUHJvcGVydHkgPSB2YXJpYWJsZVZhbHVlc1Zpc2libGVQcm9wZXJ0eTtcclxuICAgIHRoaXMudmFyaWFibGVzQWNjb3JkaW9uQm94RXhwYW5kZWRQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIHRydWUsIHtcclxuXHJcbiAgICAgIC8vIHNpbmd1bGFyIHZzIHBsdXJhbCB0YW5kZW0gbmFtZSwgdG8gbWF0Y2ggVmFyaWFibGVzQWNjb3JkaW9uQm94IHRpdGxlXHJcbiAgICAgIHRhbmRlbTogKCB2YXJpYWJsZXMubGVuZ3RoID09PSAxICkgP1xyXG4gICAgICAgICAgICAgIG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3ZhcmlhYmxlQWNjb3JkaW9uQm94RXhwYW5kZWRQcm9wZXJ0eScgKSA6XHJcbiAgICAgICAgICAgICAgb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAndmFyaWFibGVzQWNjb3JkaW9uQm94RXhwYW5kZWRQcm9wZXJ0eScgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIFZhcmlhYmxlcyBhY2NvcmRpb24gYm94LCBhYm92ZSB0aGUgU25hcHNob3RzIGFjY29yZGlvbiBib3hcclxuICAgIGNvbnN0IHZhcmlhYmxlc0FjY29yZGlvbkJveCA9IG5ldyBWYXJpYWJsZXNBY2NvcmRpb25Cb3goIHZhcmlhYmxlcywge1xyXG4gICAgICBleHBhbmRlZFByb3BlcnR5OiB0aGlzLnZhcmlhYmxlc0FjY29yZGlvbkJveEV4cGFuZGVkUHJvcGVydHksXHJcbiAgICAgIGZpeGVkV2lkdGg6IHRoaXMuc25hcHNob3RzQWNjb3JkaW9uQm94LndpZHRoLCAvLyBzYW1lIHdpZHRoIGFzIFNuYXBzaG90c1xyXG4gICAgICByaWdodDogdGhpcy5zbmFwc2hvdHNBY2NvcmRpb25Cb3gucmlnaHQsXHJcbiAgICAgIHRvcDogdGhpcy5zbmFwc2hvdHNBY2NvcmRpb25Cb3gudG9wLFxyXG5cclxuICAgICAgLy8gc2luZ3VsYXIgdnMgcGx1cmFsIHRhbmRlbSBuYW1lLCB0byBtYXRjaCBWYXJpYWJsZXNBY2NvcmRpb25Cb3ggdGl0bGVcclxuICAgICAgdGFuZGVtOiAoIHZhcmlhYmxlcy5sZW5ndGggPT09IDEgKSA/XHJcbiAgICAgICAgICAgICAgb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAndmFyaWFibGVBY2NvcmRpb25Cb3gnICkgOlxyXG4gICAgICAgICAgICAgIG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3ZhcmlhYmxlc0FjY29yZGlvbkJveCcgKVxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggdmFyaWFibGVzQWNjb3JkaW9uQm94ICk7XHJcbiAgICB2YXJpYWJsZXNBY2NvcmRpb25Cb3gubW92ZVRvQmFjaygpO1xyXG5cclxuICAgIGNvbnN0IHNuYXBzaG90c0FjY29yZGlvbkJveFRvcCA9IHRoaXMuc25hcHNob3RzQWNjb3JkaW9uQm94LnRvcDsgLy8gc2F2ZSB0aGUgb3JpZ2luYWwgcG9zaXRpb25cclxuICAgIHZhcmlhYmxlc0FjY29yZGlvbkJveC52aXNpYmxlUHJvcGVydHkubGluayggdmlzaWJsZSA9PiB7XHJcbiAgICAgIGlmICggdmlzaWJsZSApIHtcclxuICAgICAgICAvLyBzaGlmdCB0aGUgU25hcHNob3RzIGFjY29yZGlvbiBib3ggZG93blxyXG4gICAgICAgIHRoaXMuc25hcHNob3RzQWNjb3JkaW9uQm94LnRvcCA9IHZhcmlhYmxlc0FjY29yZGlvbkJveC5ib3R0b20gKyAxMDtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICB0aGlzLnNuYXBzaG90c0FjY29yZGlvbkJveC50b3AgPSBzbmFwc2hvdHNBY2NvcmRpb25Cb3hUb3A7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBvdmVycmlkZSBkaXNwb3NlKCk6IHZvaWQge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZmFsc2UsICdkaXNwb3NlIGlzIG5vdCBzdXBwb3J0ZWQsIGV4aXN0cyBmb3IgdGhlIGxpZmV0aW1lIG9mIHRoZSBzaW0nICk7XHJcbiAgICBzdXBlci5kaXNwb3NlKCk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgb3ZlcnJpZGUgcmVzZXQoKTogdm9pZCB7XHJcbiAgICB0aGlzLnZhcmlhYmxlc0FjY29yZGlvbkJveEV4cGFuZGVkUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMudmFyaWFibGVWYWx1ZXNWaXNpYmxlUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHN1cGVyLnJlc2V0KCk7XHJcbiAgfVxyXG59XHJcblxyXG5lcXVhbGl0eUV4cGxvcmVyLnJlZ2lzdGVyKCAnVmFyaWFibGVzU2NlbmVOb2RlJywgVmFyaWFi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