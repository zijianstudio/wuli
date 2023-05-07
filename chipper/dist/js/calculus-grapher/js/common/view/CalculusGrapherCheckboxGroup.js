// Copyright 2022-2023, University of Colorado Boulder

/**
 * CalculusGrapherCheckboxGroup is a group of checkboxes for controlling visibility of the grid lines and the reference line
 *
 * NOTE! This is not a subclass of VerticalCheckboxGroup for 2 important reasons:
 * (1) Subclasses need to add additional checkboxes, and VerticalCheckboxGroup does not support adding additional items.
 * (2) VerticalCheckboxGroup makes all checkboxes have pointer areas with uniform widths, and there's no way to
 *     opt-out of that behavior. That's a problem in the Lab screen, where turning on the 'Predict' preference will
 *     cause the GridCheckbox pointer areas to overlap with the ResetAllButton. So in this sim, having uniform pointer
 *     area widths is undesirable.
 *
 * @author Martin Veillette
 * @author Chris Malley (PixelZoom, Inc.)
 */

import calculusGrapher from '../../calculusGrapher.js';
import { VBox } from '../../../../scenery/js/imports.js';
import ReferenceLineCheckbox from './ReferenceLineCheckbox.js';
import GridCheckbox from './GridCheckbox.js';
export default class CalculusGrapherCheckboxGroup extends VBox {
  // For checkboxes added to this group, if their labels are RichText, they should use these max dimensions.
  // See https://github.com/phetsims/calculus-grapher/issues/283
  static RICH_TEXT_MAX_WIDTH = 100;
  static RICH_TEXT_MAX_HEIGHT = 40;
  constructor(gridVisibleProperty, referenceLineVisibleProperty, tandem) {
    const referenceLineCheckbox = new ReferenceLineCheckbox(referenceLineVisibleProperty, tandem.createTandem('referenceLineCheckbox'));
    const gridCheckbox = new GridCheckbox(gridVisibleProperty, tandem.createTandem('gridCheckbox'));
    super({
      children: [referenceLineCheckbox, gridCheckbox],
      align: 'left',
      spacing: 10,
      tandem: tandem
    });
  }
}
calculusGrapher.register('CalculusGrapherCheckboxGroup', CalculusGrapherCheckboxGroup);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjYWxjdWx1c0dyYXBoZXIiLCJWQm94IiwiUmVmZXJlbmNlTGluZUNoZWNrYm94IiwiR3JpZENoZWNrYm94IiwiQ2FsY3VsdXNHcmFwaGVyQ2hlY2tib3hHcm91cCIsIlJJQ0hfVEVYVF9NQVhfV0lEVEgiLCJSSUNIX1RFWFRfTUFYX0hFSUdIVCIsImNvbnN0cnVjdG9yIiwiZ3JpZFZpc2libGVQcm9wZXJ0eSIsInJlZmVyZW5jZUxpbmVWaXNpYmxlUHJvcGVydHkiLCJ0YW5kZW0iLCJyZWZlcmVuY2VMaW5lQ2hlY2tib3giLCJjcmVhdGVUYW5kZW0iLCJncmlkQ2hlY2tib3giLCJjaGlsZHJlbiIsImFsaWduIiwic3BhY2luZyIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiQ2FsY3VsdXNHcmFwaGVyQ2hlY2tib3hHcm91cC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMi0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBDYWxjdWx1c0dyYXBoZXJDaGVja2JveEdyb3VwIGlzIGEgZ3JvdXAgb2YgY2hlY2tib3hlcyBmb3IgY29udHJvbGxpbmcgdmlzaWJpbGl0eSBvZiB0aGUgZ3JpZCBsaW5lcyBhbmQgdGhlIHJlZmVyZW5jZSBsaW5lXHJcbiAqXHJcbiAqIE5PVEUhIFRoaXMgaXMgbm90IGEgc3ViY2xhc3Mgb2YgVmVydGljYWxDaGVja2JveEdyb3VwIGZvciAyIGltcG9ydGFudCByZWFzb25zOlxyXG4gKiAoMSkgU3ViY2xhc3NlcyBuZWVkIHRvIGFkZCBhZGRpdGlvbmFsIGNoZWNrYm94ZXMsIGFuZCBWZXJ0aWNhbENoZWNrYm94R3JvdXAgZG9lcyBub3Qgc3VwcG9ydCBhZGRpbmcgYWRkaXRpb25hbCBpdGVtcy5cclxuICogKDIpIFZlcnRpY2FsQ2hlY2tib3hHcm91cCBtYWtlcyBhbGwgY2hlY2tib3hlcyBoYXZlIHBvaW50ZXIgYXJlYXMgd2l0aCB1bmlmb3JtIHdpZHRocywgYW5kIHRoZXJlJ3Mgbm8gd2F5IHRvXHJcbiAqICAgICBvcHQtb3V0IG9mIHRoYXQgYmVoYXZpb3IuIFRoYXQncyBhIHByb2JsZW0gaW4gdGhlIExhYiBzY3JlZW4sIHdoZXJlIHR1cm5pbmcgb24gdGhlICdQcmVkaWN0JyBwcmVmZXJlbmNlIHdpbGxcclxuICogICAgIGNhdXNlIHRoZSBHcmlkQ2hlY2tib3ggcG9pbnRlciBhcmVhcyB0byBvdmVybGFwIHdpdGggdGhlIFJlc2V0QWxsQnV0dG9uLiBTbyBpbiB0aGlzIHNpbSwgaGF2aW5nIHVuaWZvcm0gcG9pbnRlclxyXG4gKiAgICAgYXJlYSB3aWR0aHMgaXMgdW5kZXNpcmFibGUuXHJcbiAqXHJcbiAqIEBhdXRob3IgTWFydGluIFZlaWxsZXR0ZVxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBjYWxjdWx1c0dyYXBoZXIgZnJvbSAnLi4vLi4vY2FsY3VsdXNHcmFwaGVyLmpzJztcclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgeyBWQm94IH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcclxuaW1wb3J0IFJlZmVyZW5jZUxpbmVDaGVja2JveCBmcm9tICcuL1JlZmVyZW5jZUxpbmVDaGVja2JveC5qcyc7XHJcbmltcG9ydCBHcmlkQ2hlY2tib3ggZnJvbSAnLi9HcmlkQ2hlY2tib3guanMnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ2FsY3VsdXNHcmFwaGVyQ2hlY2tib3hHcm91cCBleHRlbmRzIFZCb3gge1xyXG5cclxuICAvLyBGb3IgY2hlY2tib3hlcyBhZGRlZCB0byB0aGlzIGdyb3VwLCBpZiB0aGVpciBsYWJlbHMgYXJlIFJpY2hUZXh0LCB0aGV5IHNob3VsZCB1c2UgdGhlc2UgbWF4IGRpbWVuc2lvbnMuXHJcbiAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9jYWxjdWx1cy1ncmFwaGVyL2lzc3Vlcy8yODNcclxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IFJJQ0hfVEVYVF9NQVhfV0lEVEggPSAxMDA7XHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBSSUNIX1RFWFRfTUFYX0hFSUdIVCA9IDQwO1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIGdyaWRWaXNpYmxlUHJvcGVydHk6IFByb3BlcnR5PGJvb2xlYW4+LCByZWZlcmVuY2VMaW5lVmlzaWJsZVByb3BlcnR5OiBQcm9wZXJ0eTxib29sZWFuPiwgdGFuZGVtOiBUYW5kZW0gKSB7XHJcblxyXG4gICAgY29uc3QgcmVmZXJlbmNlTGluZUNoZWNrYm94ID0gbmV3IFJlZmVyZW5jZUxpbmVDaGVja2JveCggcmVmZXJlbmNlTGluZVZpc2libGVQcm9wZXJ0eSxcclxuICAgICAgdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3JlZmVyZW5jZUxpbmVDaGVja2JveCcgKSApO1xyXG5cclxuICAgIGNvbnN0IGdyaWRDaGVja2JveCA9IG5ldyBHcmlkQ2hlY2tib3goIGdyaWRWaXNpYmxlUHJvcGVydHksIHRhbmRlbS5jcmVhdGVUYW5kZW0oICdncmlkQ2hlY2tib3gnICkgKTtcclxuXHJcbiAgICBzdXBlcigge1xyXG4gICAgICBjaGlsZHJlbjogWyByZWZlcmVuY2VMaW5lQ2hlY2tib3gsIGdyaWRDaGVja2JveCBdLFxyXG4gICAgICBhbGlnbjogJ2xlZnQnLFxyXG4gICAgICBzcGFjaW5nOiAxMCxcclxuICAgICAgdGFuZGVtOiB0YW5kZW1cclxuICAgIH0gKTtcclxuICB9XHJcbn1cclxuXHJcbmNhbGN1bHVzR3JhcGhlci5yZWdpc3RlciggJ0NhbGN1bHVzR3JhcGhlckNoZWNrYm94R3JvdXAnLCBDYWxjdWx1c0dyYXBoZXJDaGVja2JveEdyb3VwICk7XHJcbiJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsZUFBZSxNQUFNLDBCQUEwQjtBQUV0RCxTQUFTQyxJQUFJLFFBQVEsbUNBQW1DO0FBRXhELE9BQU9DLHFCQUFxQixNQUFNLDRCQUE0QjtBQUM5RCxPQUFPQyxZQUFZLE1BQU0sbUJBQW1CO0FBRTVDLGVBQWUsTUFBTUMsNEJBQTRCLFNBQVNILElBQUksQ0FBQztFQUU3RDtFQUNBO0VBQ0EsT0FBdUJJLG1CQUFtQixHQUFHLEdBQUc7RUFDaEQsT0FBdUJDLG9CQUFvQixHQUFHLEVBQUU7RUFFekNDLFdBQVdBLENBQUVDLG1CQUFzQyxFQUFFQyw0QkFBK0MsRUFBRUMsTUFBYyxFQUFHO0lBRTVILE1BQU1DLHFCQUFxQixHQUFHLElBQUlULHFCQUFxQixDQUFFTyw0QkFBNEIsRUFDbkZDLE1BQU0sQ0FBQ0UsWUFBWSxDQUFFLHVCQUF3QixDQUFFLENBQUM7SUFFbEQsTUFBTUMsWUFBWSxHQUFHLElBQUlWLFlBQVksQ0FBRUssbUJBQW1CLEVBQUVFLE1BQU0sQ0FBQ0UsWUFBWSxDQUFFLGNBQWUsQ0FBRSxDQUFDO0lBRW5HLEtBQUssQ0FBRTtNQUNMRSxRQUFRLEVBQUUsQ0FBRUgscUJBQXFCLEVBQUVFLFlBQVksQ0FBRTtNQUNqREUsS0FBSyxFQUFFLE1BQU07TUFDYkMsT0FBTyxFQUFFLEVBQUU7TUFDWE4sTUFBTSxFQUFFQTtJQUNWLENBQUUsQ0FBQztFQUNMO0FBQ0Y7QUFFQVYsZUFBZSxDQUFDaUIsUUFBUSxDQUFFLDhCQUE4QixFQUFFYiw0QkFBNkIsQ0FBQyJ9