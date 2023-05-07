// Copyright 2013-2023, University of Colorado Boulder

/**
 * Convenience type for creating a group of Checkboxes with vertical orientation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 */

import optionize, { combineOptions } from '../../phet-core/js/optionize.js';
import { VBox } from '../../scenery/js/imports.js';
import Tandem from '../../tandem/js/Tandem.js';
import Checkbox from './Checkbox.js';
import sun from './sun.js';
import { getGroupItemNodes } from './GroupItemOptions.js';

// additional options that are common to 'group items'

export default class VerticalCheckboxGroup extends VBox {
  constructor(items, providedOptions) {
    const options = optionize()({
      // dilation of pointer areas for each checkbox, y dimension is computed
      touchAreaXDilation: 5,
      mouseAreaXDilation: 5,
      // supertype options
      spacing: 10,
      // vertical spacing
      align: 'left',
      stretch: true,
      tandem: Tandem.REQUIRED
    }, providedOptions);
    const nodes = getGroupItemNodes(items, options.tandem);
    const checkboxes = [];

    // Create a checkbox for each item
    options.children = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const node = nodes[i];
      assert && assert(!node.hasPDOMContent, 'Accessibility is provided by Checkbox and VerticalCheckboxGroupItem.options. ' + 'Additional PDOM content in the provided Node could break accessibility.');

      // set pointer areas, y dimensions are computed
      const yDilation = options.spacing / 2;

      // @ts-expect-error - runtime check to prevent prior pattern, see https://github.com/phetsims/sun/issues/794
      assert && assert(!item.tandem, 'Cannot specify tandem on item, use tandemName instead');
      const checkbox = new Checkbox(item.property, node, combineOptions({
        tandem: item.tandemName ? options.tandem.createTandem(item.tandemName) : Tandem.OPTIONAL,
        mouseAreaXDilation: options.mouseAreaXDilation,
        touchAreaXDilation: options.touchAreaXDilation,
        mouseAreaYDilation: yDilation,
        touchAreaYDilation: yDilation
      }, options.checkboxOptions, item.options));

      // For disposal
      checkboxes.push(checkbox);
      options.children.push(checkbox);
    }
    super(options);
    this.disposeVerticalCheckboxGroup = () => {
      checkboxes.forEach(checkbox => checkbox.dispose());
      nodes.forEach(node => node.dispose());
    };
  }
  dispose() {
    this.disposeVerticalCheckboxGroup();
    super.dispose();
  }
}
sun.register('VerticalCheckboxGroup', VerticalCheckboxGroup);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJvcHRpb25pemUiLCJjb21iaW5lT3B0aW9ucyIsIlZCb3giLCJUYW5kZW0iLCJDaGVja2JveCIsInN1biIsImdldEdyb3VwSXRlbU5vZGVzIiwiVmVydGljYWxDaGVja2JveEdyb3VwIiwiY29uc3RydWN0b3IiLCJpdGVtcyIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJ0b3VjaEFyZWFYRGlsYXRpb24iLCJtb3VzZUFyZWFYRGlsYXRpb24iLCJzcGFjaW5nIiwiYWxpZ24iLCJzdHJldGNoIiwidGFuZGVtIiwiUkVRVUlSRUQiLCJub2RlcyIsImNoZWNrYm94ZXMiLCJjaGlsZHJlbiIsImkiLCJsZW5ndGgiLCJpdGVtIiwibm9kZSIsImFzc2VydCIsImhhc1BET01Db250ZW50IiwieURpbGF0aW9uIiwiY2hlY2tib3giLCJwcm9wZXJ0eSIsInRhbmRlbU5hbWUiLCJjcmVhdGVUYW5kZW0iLCJPUFRJT05BTCIsIm1vdXNlQXJlYVlEaWxhdGlvbiIsInRvdWNoQXJlYVlEaWxhdGlvbiIsImNoZWNrYm94T3B0aW9ucyIsInB1c2giLCJkaXNwb3NlVmVydGljYWxDaGVja2JveEdyb3VwIiwiZm9yRWFjaCIsImRpc3Bvc2UiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlZlcnRpY2FsQ2hlY2tib3hHcm91cC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBDb252ZW5pZW5jZSB0eXBlIGZvciBjcmVhdGluZyBhIGdyb3VwIG9mIENoZWNrYm94ZXMgd2l0aCB2ZXJ0aWNhbCBvcmllbnRhdGlvbi5cclxuICpcclxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgU3RyaWN0T21pdCBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvU3RyaWN0T21pdC5qcyc7XHJcbmltcG9ydCBvcHRpb25pemUsIHsgY29tYmluZU9wdGlvbnMgfSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcclxuaW1wb3J0IHsgVkJveCwgVkJveE9wdGlvbnMgfSBmcm9tICcuLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xyXG5pbXBvcnQgQ2hlY2tib3gsIHsgQ2hlY2tib3hPcHRpb25zIH0gZnJvbSAnLi9DaGVja2JveC5qcyc7XHJcbmltcG9ydCBzdW4gZnJvbSAnLi9zdW4uanMnO1xyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBHcm91cEl0ZW1PcHRpb25zLCB7IGdldEdyb3VwSXRlbU5vZGVzIH0gZnJvbSAnLi9Hcm91cEl0ZW1PcHRpb25zLmpzJztcclxuXHJcbmV4cG9ydCB0eXBlIFZlcnRpY2FsQ2hlY2tib3hHcm91cEl0ZW0gPSB7XHJcbiAgcHJvcGVydHk6IFByb3BlcnR5PGJvb2xlYW4+OyAvLyBQcm9wZXJ0eSBhc3NvY2lhdGVkIHdpdGggdGhlIGNoZWNrYm94XHJcbiAgb3B0aW9ucz86IFN0cmljdE9taXQ8Q2hlY2tib3hPcHRpb25zLCAndGFuZGVtJz47IC8vIEl0ZW0tc3BlY2lmaWMgb3B0aW9ucyB0byBiZSBwYXNzZWQgdG8gdGhlIENoZWNrYm94IGNvbnN0cnVjdG9yXHJcbn0gJiBHcm91cEl0ZW1PcHRpb25zOyAvLyBhZGRpdGlvbmFsIG9wdGlvbnMgdGhhdCBhcmUgY29tbW9uIHRvICdncm91cCBpdGVtcydcclxuXHJcbnR5cGUgU2VsZk9wdGlvbnMgPSB7XHJcbiAgY2hlY2tib3hPcHRpb25zPzogU3RyaWN0T21pdDxDaGVja2JveE9wdGlvbnMsICd0YW5kZW0nPjtcclxuICB0b3VjaEFyZWFYRGlsYXRpb24/OiBudW1iZXI7XHJcbiAgbW91c2VBcmVhWERpbGF0aW9uPzogbnVtYmVyO1xyXG59O1xyXG5cclxuZXhwb3J0IHR5cGUgVmVydGljYWxDaGVja2JveEdyb3VwT3B0aW9ucyA9IFNlbGZPcHRpb25zICYgU3RyaWN0T21pdDxWQm94T3B0aW9ucywgJ2NoaWxkcmVuJz47XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBWZXJ0aWNhbENoZWNrYm94R3JvdXAgZXh0ZW5kcyBWQm94IHtcclxuICBwcml2YXRlIHJlYWRvbmx5IGRpc3Bvc2VWZXJ0aWNhbENoZWNrYm94R3JvdXA6ICgpID0+IHZvaWQ7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggaXRlbXM6IFZlcnRpY2FsQ2hlY2tib3hHcm91cEl0ZW1bXSwgcHJvdmlkZWRPcHRpb25zPzogVmVydGljYWxDaGVja2JveEdyb3VwT3B0aW9ucyApIHtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPFZlcnRpY2FsQ2hlY2tib3hHcm91cE9wdGlvbnMsIFN0cmljdE9taXQ8U2VsZk9wdGlvbnMsICdjaGVja2JveE9wdGlvbnMnPiwgVkJveE9wdGlvbnM+KCkoIHtcclxuXHJcbiAgICAgIC8vIGRpbGF0aW9uIG9mIHBvaW50ZXIgYXJlYXMgZm9yIGVhY2ggY2hlY2tib3gsIHkgZGltZW5zaW9uIGlzIGNvbXB1dGVkXHJcbiAgICAgIHRvdWNoQXJlYVhEaWxhdGlvbjogNSxcclxuICAgICAgbW91c2VBcmVhWERpbGF0aW9uOiA1LFxyXG5cclxuICAgICAgLy8gc3VwZXJ0eXBlIG9wdGlvbnNcclxuICAgICAgc3BhY2luZzogMTAsIC8vIHZlcnRpY2FsIHNwYWNpbmdcclxuICAgICAgYWxpZ246ICdsZWZ0JyxcclxuICAgICAgc3RyZXRjaDogdHJ1ZSxcclxuICAgICAgdGFuZGVtOiBUYW5kZW0uUkVRVUlSRURcclxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIGNvbnN0IG5vZGVzID0gZ2V0R3JvdXBJdGVtTm9kZXMoIGl0ZW1zLCBvcHRpb25zLnRhbmRlbSApO1xyXG4gICAgY29uc3QgY2hlY2tib3hlczogQ2hlY2tib3hbXSA9IFtdO1xyXG5cclxuICAgIC8vIENyZWF0ZSBhIGNoZWNrYm94IGZvciBlYWNoIGl0ZW1cclxuICAgIG9wdGlvbnMuY2hpbGRyZW4gPSBbXTtcclxuICAgIGZvciAoIGxldCBpID0gMDsgaSA8IGl0ZW1zLmxlbmd0aDsgaSsrICkge1xyXG5cclxuICAgICAgY29uc3QgaXRlbSA9IGl0ZW1zWyBpIF07XHJcbiAgICAgIGNvbnN0IG5vZGUgPSBub2Rlc1sgaSBdO1xyXG5cclxuICAgICAgYXNzZXJ0ICYmIGFzc2VydCggIW5vZGUuaGFzUERPTUNvbnRlbnQsXHJcbiAgICAgICAgJ0FjY2Vzc2liaWxpdHkgaXMgcHJvdmlkZWQgYnkgQ2hlY2tib3ggYW5kIFZlcnRpY2FsQ2hlY2tib3hHcm91cEl0ZW0ub3B0aW9ucy4gJyArXHJcbiAgICAgICAgJ0FkZGl0aW9uYWwgUERPTSBjb250ZW50IGluIHRoZSBwcm92aWRlZCBOb2RlIGNvdWxkIGJyZWFrIGFjY2Vzc2liaWxpdHkuJyApO1xyXG5cclxuICAgICAgLy8gc2V0IHBvaW50ZXIgYXJlYXMsIHkgZGltZW5zaW9ucyBhcmUgY29tcHV0ZWRcclxuICAgICAgY29uc3QgeURpbGF0aW9uID0gb3B0aW9ucy5zcGFjaW5nIC8gMjtcclxuXHJcbiAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgLSBydW50aW1lIGNoZWNrIHRvIHByZXZlbnQgcHJpb3IgcGF0dGVybiwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zdW4vaXNzdWVzLzc5NFxyXG4gICAgICBhc3NlcnQgJiYgYXNzZXJ0KCAhaXRlbS50YW5kZW0sICdDYW5ub3Qgc3BlY2lmeSB0YW5kZW0gb24gaXRlbSwgdXNlIHRhbmRlbU5hbWUgaW5zdGVhZCcgKTtcclxuXHJcbiAgICAgIGNvbnN0IGNoZWNrYm94ID0gbmV3IENoZWNrYm94KCBpdGVtLnByb3BlcnR5LCBub2RlLFxyXG4gICAgICAgIGNvbWJpbmVPcHRpb25zPENoZWNrYm94T3B0aW9ucz4oIHtcclxuICAgICAgICAgIHRhbmRlbTogaXRlbS50YW5kZW1OYW1lID8gb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCBpdGVtLnRhbmRlbU5hbWUgKSA6XHJcbiAgICAgICAgICAgICAgICAgIFRhbmRlbS5PUFRJT05BTCxcclxuICAgICAgICAgIG1vdXNlQXJlYVhEaWxhdGlvbjogb3B0aW9ucy5tb3VzZUFyZWFYRGlsYXRpb24sXHJcbiAgICAgICAgICB0b3VjaEFyZWFYRGlsYXRpb246IG9wdGlvbnMudG91Y2hBcmVhWERpbGF0aW9uLFxyXG4gICAgICAgICAgbW91c2VBcmVhWURpbGF0aW9uOiB5RGlsYXRpb24sXHJcbiAgICAgICAgICB0b3VjaEFyZWFZRGlsYXRpb246IHlEaWxhdGlvblxyXG4gICAgICAgIH0sIG9wdGlvbnMuY2hlY2tib3hPcHRpb25zLCBpdGVtLm9wdGlvbnMgKSApO1xyXG5cclxuICAgICAgLy8gRm9yIGRpc3Bvc2FsXHJcbiAgICAgIGNoZWNrYm94ZXMucHVzaCggY2hlY2tib3ggKTtcclxuXHJcbiAgICAgIG9wdGlvbnMuY2hpbGRyZW4ucHVzaCggY2hlY2tib3ggKTtcclxuICAgIH1cclxuXHJcbiAgICBzdXBlciggb3B0aW9ucyApO1xyXG5cclxuICAgIHRoaXMuZGlzcG9zZVZlcnRpY2FsQ2hlY2tib3hHcm91cCA9ICgpID0+IHtcclxuICAgICAgY2hlY2tib3hlcy5mb3JFYWNoKCBjaGVja2JveCA9PiBjaGVja2JveC5kaXNwb3NlKCkgKTtcclxuICAgICAgbm9kZXMuZm9yRWFjaCggbm9kZSA9PiBub2RlLmRpc3Bvc2UoKSApO1xyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBvdmVycmlkZSBkaXNwb3NlKCk6IHZvaWQge1xyXG4gICAgdGhpcy5kaXNwb3NlVmVydGljYWxDaGVja2JveEdyb3VwKCk7XHJcbiAgICBzdXBlci5kaXNwb3NlKCk7XHJcbiAgfVxyXG59XHJcblxyXG5zdW4ucmVnaXN0ZXIoICdWZXJ0aWNhbENoZWNrYm94R3JvdXAnLCBWZXJ0aWNhbENoZWNrYm94R3JvdXAgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFHQSxPQUFPQSxTQUFTLElBQUlDLGNBQWMsUUFBUSxpQ0FBaUM7QUFDM0UsU0FBU0MsSUFBSSxRQUFxQiw2QkFBNkI7QUFDL0QsT0FBT0MsTUFBTSxNQUFNLDJCQUEyQjtBQUM5QyxPQUFPQyxRQUFRLE1BQTJCLGVBQWU7QUFDekQsT0FBT0MsR0FBRyxNQUFNLFVBQVU7QUFFMUIsU0FBMkJDLGlCQUFpQixRQUFRLHVCQUF1Qjs7QUFLckQ7O0FBVXRCLGVBQWUsTUFBTUMscUJBQXFCLFNBQVNMLElBQUksQ0FBQztFQUcvQ00sV0FBV0EsQ0FBRUMsS0FBa0MsRUFBRUMsZUFBOEMsRUFBRztJQUV2RyxNQUFNQyxPQUFPLEdBQUdYLFNBQVMsQ0FBd0YsQ0FBQyxDQUFFO01BRWxIO01BQ0FZLGtCQUFrQixFQUFFLENBQUM7TUFDckJDLGtCQUFrQixFQUFFLENBQUM7TUFFckI7TUFDQUMsT0FBTyxFQUFFLEVBQUU7TUFBRTtNQUNiQyxLQUFLLEVBQUUsTUFBTTtNQUNiQyxPQUFPLEVBQUUsSUFBSTtNQUNiQyxNQUFNLEVBQUVkLE1BQU0sQ0FBQ2U7SUFDakIsQ0FBQyxFQUFFUixlQUFnQixDQUFDO0lBRXBCLE1BQU1TLEtBQUssR0FBR2IsaUJBQWlCLENBQUVHLEtBQUssRUFBRUUsT0FBTyxDQUFDTSxNQUFPLENBQUM7SUFDeEQsTUFBTUcsVUFBc0IsR0FBRyxFQUFFOztJQUVqQztJQUNBVCxPQUFPLENBQUNVLFFBQVEsR0FBRyxFQUFFO0lBQ3JCLEtBQU0sSUFBSUMsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHYixLQUFLLENBQUNjLE1BQU0sRUFBRUQsQ0FBQyxFQUFFLEVBQUc7TUFFdkMsTUFBTUUsSUFBSSxHQUFHZixLQUFLLENBQUVhLENBQUMsQ0FBRTtNQUN2QixNQUFNRyxJQUFJLEdBQUdOLEtBQUssQ0FBRUcsQ0FBQyxDQUFFO01BRXZCSSxNQUFNLElBQUlBLE1BQU0sQ0FBRSxDQUFDRCxJQUFJLENBQUNFLGNBQWMsRUFDcEMsK0VBQStFLEdBQy9FLHlFQUEwRSxDQUFDOztNQUU3RTtNQUNBLE1BQU1DLFNBQVMsR0FBR2pCLE9BQU8sQ0FBQ0csT0FBTyxHQUFHLENBQUM7O01BRXJDO01BQ0FZLE1BQU0sSUFBSUEsTUFBTSxDQUFFLENBQUNGLElBQUksQ0FBQ1AsTUFBTSxFQUFFLHVEQUF3RCxDQUFDO01BRXpGLE1BQU1ZLFFBQVEsR0FBRyxJQUFJekIsUUFBUSxDQUFFb0IsSUFBSSxDQUFDTSxRQUFRLEVBQUVMLElBQUksRUFDaER4QixjQUFjLENBQW1CO1FBQy9CZ0IsTUFBTSxFQUFFTyxJQUFJLENBQUNPLFVBQVUsR0FBR3BCLE9BQU8sQ0FBQ00sTUFBTSxDQUFDZSxZQUFZLENBQUVSLElBQUksQ0FBQ08sVUFBVyxDQUFDLEdBQ2hFNUIsTUFBTSxDQUFDOEIsUUFBUTtRQUN2QnBCLGtCQUFrQixFQUFFRixPQUFPLENBQUNFLGtCQUFrQjtRQUM5Q0Qsa0JBQWtCLEVBQUVELE9BQU8sQ0FBQ0Msa0JBQWtCO1FBQzlDc0Isa0JBQWtCLEVBQUVOLFNBQVM7UUFDN0JPLGtCQUFrQixFQUFFUDtNQUN0QixDQUFDLEVBQUVqQixPQUFPLENBQUN5QixlQUFlLEVBQUVaLElBQUksQ0FBQ2IsT0FBUSxDQUFFLENBQUM7O01BRTlDO01BQ0FTLFVBQVUsQ0FBQ2lCLElBQUksQ0FBRVIsUUFBUyxDQUFDO01BRTNCbEIsT0FBTyxDQUFDVSxRQUFRLENBQUNnQixJQUFJLENBQUVSLFFBQVMsQ0FBQztJQUNuQztJQUVBLEtBQUssQ0FBRWxCLE9BQVEsQ0FBQztJQUVoQixJQUFJLENBQUMyQiw0QkFBNEIsR0FBRyxNQUFNO01BQ3hDbEIsVUFBVSxDQUFDbUIsT0FBTyxDQUFFVixRQUFRLElBQUlBLFFBQVEsQ0FBQ1csT0FBTyxDQUFDLENBQUUsQ0FBQztNQUNwRHJCLEtBQUssQ0FBQ29CLE9BQU8sQ0FBRWQsSUFBSSxJQUFJQSxJQUFJLENBQUNlLE9BQU8sQ0FBQyxDQUFFLENBQUM7SUFDekMsQ0FBQztFQUNIO0VBRWdCQSxPQUFPQSxDQUFBLEVBQVM7SUFDOUIsSUFBSSxDQUFDRiw0QkFBNEIsQ0FBQyxDQUFDO0lBQ25DLEtBQUssQ0FBQ0UsT0FBTyxDQUFDLENBQUM7RUFDakI7QUFDRjtBQUVBbkMsR0FBRyxDQUFDb0MsUUFBUSxDQUFFLHVCQUF1QixFQUFFbEMscUJBQXNCLENBQUMifQ==