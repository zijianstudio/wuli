// Copyright 2019-2023, University of Colorado Boulder

/**
 * Panel with a vertical checkbox group, for display options.
 *
 * @author Michael Barlow (PhET Interactive Simulations)
 * @author Jesse Greenberg (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import ISLCConstants from '../../../inverse-square-law-common/js/ISLCConstants.js';
import ISLCPanel from '../../../inverse-square-law-common/js/view/ISLCPanel.js';
import merge from '../../../phet-core/js/merge.js';
import { Text, VBox } from '../../../scenery/js/imports.js';
import Checkbox from '../../../sun/js/Checkbox.js';
import Tandem from '../../../tandem/js/Tandem.js';
import gravityForceLabBasics from '../gravityForceLabBasics.js';
class GFLBCheckboxPanel extends ISLCPanel {
  /**
   * @param {*[]} checkboxItems - Array of Objects with content for each checkbox. Each entry should look like
   *                            {
   *                              label: {string},
   *                              property: Property.<boolean>,
   *                              options: {Object} - options for the GFLBCheckbox, see inner class
   *                            }
   * @param {Object} [options]
   */
  constructor(checkboxItems, options) {
    options = merge({
      // {Object} options passed to ALL checkboxes, for options that are unique to each checkbox,
      // use GFLBCheckbox options, and provide through checkboxItems `options`
      checkboxOptions: ISLCConstants.CHECKBOX_OPTIONS,
      // ISLCPanel options
      fill: '#FDF498',
      xMargin: 10,
      yMargin: 10,
      minWidth: 170,
      // phet-io
      tandem: Tandem.REQUIRED
    }, options);
    const checkboxes = [];
    checkboxItems.forEach((item, index) => {
      const contentNode = new Text(item.label, merge({}, ISLCConstants.UI_TEXT_OPTIONS, {
        tandem: item.options.tandem.createTandem('labelText')
      }));
      checkboxes.push(new Checkbox(item.property, contentNode, merge({}, item.options, options.checkboxOptions)));
    });
    const panelContent = new VBox({
      children: checkboxes,
      align: 'left',
      spacing: 10
    });
    super(panelContent, options);
  }
}
gravityForceLabBasics.register('GFLBCheckboxPanel', GFLBCheckboxPanel);
export default GFLBCheckboxPanel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJJU0xDQ29uc3RhbnRzIiwiSVNMQ1BhbmVsIiwibWVyZ2UiLCJUZXh0IiwiVkJveCIsIkNoZWNrYm94IiwiVGFuZGVtIiwiZ3Jhdml0eUZvcmNlTGFiQmFzaWNzIiwiR0ZMQkNoZWNrYm94UGFuZWwiLCJjb25zdHJ1Y3RvciIsImNoZWNrYm94SXRlbXMiLCJvcHRpb25zIiwiY2hlY2tib3hPcHRpb25zIiwiQ0hFQ0tCT1hfT1BUSU9OUyIsImZpbGwiLCJ4TWFyZ2luIiwieU1hcmdpbiIsIm1pbldpZHRoIiwidGFuZGVtIiwiUkVRVUlSRUQiLCJjaGVja2JveGVzIiwiZm9yRWFjaCIsIml0ZW0iLCJpbmRleCIsImNvbnRlbnROb2RlIiwibGFiZWwiLCJVSV9URVhUX09QVElPTlMiLCJjcmVhdGVUYW5kZW0iLCJwdXNoIiwicHJvcGVydHkiLCJwYW5lbENvbnRlbnQiLCJjaGlsZHJlbiIsImFsaWduIiwic3BhY2luZyIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiR0ZMQkNoZWNrYm94UGFuZWwuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTktMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogUGFuZWwgd2l0aCBhIHZlcnRpY2FsIGNoZWNrYm94IGdyb3VwLCBmb3IgZGlzcGxheSBvcHRpb25zLlxyXG4gKlxyXG4gKiBAYXV0aG9yIE1pY2hhZWwgQmFybG93IChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKiBAYXV0aG9yIEplc3NlIEdyZWVuYmVyZyAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICogQGF1dGhvciBNaWNoYWVsIEthdXptYW5uIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCBJU0xDQ29uc3RhbnRzIGZyb20gJy4uLy4uLy4uL2ludmVyc2Utc3F1YXJlLWxhdy1jb21tb24vanMvSVNMQ0NvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBJU0xDUGFuZWwgZnJvbSAnLi4vLi4vLi4vaW52ZXJzZS1zcXVhcmUtbGF3LWNvbW1vbi9qcy92aWV3L0lTTENQYW5lbC5qcyc7XHJcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xyXG5pbXBvcnQgeyBUZXh0LCBWQm94IH0gZnJvbSAnLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IENoZWNrYm94IGZyb20gJy4uLy4uLy4uL3N1bi9qcy9DaGVja2JveC5qcyc7XHJcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XHJcbmltcG9ydCBncmF2aXR5Rm9yY2VMYWJCYXNpY3MgZnJvbSAnLi4vZ3Jhdml0eUZvcmNlTGFiQmFzaWNzLmpzJztcclxuXHJcbmNsYXNzIEdGTEJDaGVja2JveFBhbmVsIGV4dGVuZHMgSVNMQ1BhbmVsIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHsqW119IGNoZWNrYm94SXRlbXMgLSBBcnJheSBvZiBPYmplY3RzIHdpdGggY29udGVudCBmb3IgZWFjaCBjaGVja2JveC4gRWFjaCBlbnRyeSBzaG91bGQgbG9vayBsaWtlXHJcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6IHtzdHJpbmd9LFxyXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydHk6IFByb3BlcnR5Ljxib29sZWFuPixcclxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnM6IHtPYmplY3R9IC0gb3B0aW9ucyBmb3IgdGhlIEdGTEJDaGVja2JveCwgc2VlIGlubmVyIGNsYXNzXHJcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggY2hlY2tib3hJdGVtcywgb3B0aW9ucyApIHtcclxuXHJcbiAgICBvcHRpb25zID0gbWVyZ2UoIHtcclxuXHJcbiAgICAgIC8vIHtPYmplY3R9IG9wdGlvbnMgcGFzc2VkIHRvIEFMTCBjaGVja2JveGVzLCBmb3Igb3B0aW9ucyB0aGF0IGFyZSB1bmlxdWUgdG8gZWFjaCBjaGVja2JveCxcclxuICAgICAgLy8gdXNlIEdGTEJDaGVja2JveCBvcHRpb25zLCBhbmQgcHJvdmlkZSB0aHJvdWdoIGNoZWNrYm94SXRlbXMgYG9wdGlvbnNgXHJcbiAgICAgIGNoZWNrYm94T3B0aW9uczogSVNMQ0NvbnN0YW50cy5DSEVDS0JPWF9PUFRJT05TLFxyXG5cclxuICAgICAgLy8gSVNMQ1BhbmVsIG9wdGlvbnNcclxuICAgICAgZmlsbDogJyNGREY0OTgnLFxyXG4gICAgICB4TWFyZ2luOiAxMCxcclxuICAgICAgeU1hcmdpbjogMTAsXHJcbiAgICAgIG1pbldpZHRoOiAxNzAsXHJcblxyXG4gICAgICAvLyBwaGV0LWlvXHJcbiAgICAgIHRhbmRlbTogVGFuZGVtLlJFUVVJUkVEXHJcbiAgICB9LCBvcHRpb25zICk7XHJcblxyXG4gICAgY29uc3QgY2hlY2tib3hlcyA9IFtdO1xyXG5cclxuICAgIGNoZWNrYm94SXRlbXMuZm9yRWFjaCggKCBpdGVtLCBpbmRleCApID0+IHtcclxuICAgICAgY29uc3QgY29udGVudE5vZGUgPSBuZXcgVGV4dCggaXRlbS5sYWJlbCwgbWVyZ2UoIHt9LCBJU0xDQ29uc3RhbnRzLlVJX1RFWFRfT1BUSU9OUywge1xyXG4gICAgICAgIHRhbmRlbTogaXRlbS5vcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdsYWJlbFRleHQnIClcclxuICAgICAgfSApICk7XHJcblxyXG4gICAgICBjaGVja2JveGVzLnB1c2goIG5ldyBDaGVja2JveCggaXRlbS5wcm9wZXJ0eSwgY29udGVudE5vZGUsIG1lcmdlKCB7fSwgaXRlbS5vcHRpb25zLCBvcHRpb25zLmNoZWNrYm94T3B0aW9ucyApICkgKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCBwYW5lbENvbnRlbnQgPSBuZXcgVkJveCgge1xyXG4gICAgICBjaGlsZHJlbjogY2hlY2tib3hlcyxcclxuICAgICAgYWxpZ246ICdsZWZ0JyxcclxuICAgICAgc3BhY2luZzogMTBcclxuICAgIH0gKTtcclxuXHJcbiAgICBzdXBlciggcGFuZWxDb250ZW50LCBvcHRpb25zICk7XHJcbiAgfVxyXG59XHJcblxyXG5ncmF2aXR5Rm9yY2VMYWJCYXNpY3MucmVnaXN0ZXIoICdHRkxCQ2hlY2tib3hQYW5lbCcsIEdGTEJDaGVja2JveFBhbmVsICk7XHJcbmV4cG9ydCBkZWZhdWx0IEdGTEJDaGVja2JveFBhbmVsOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxhQUFhLE1BQU0sd0RBQXdEO0FBQ2xGLE9BQU9DLFNBQVMsTUFBTSx5REFBeUQ7QUFDL0UsT0FBT0MsS0FBSyxNQUFNLGdDQUFnQztBQUNsRCxTQUFTQyxJQUFJLEVBQUVDLElBQUksUUFBUSxnQ0FBZ0M7QUFDM0QsT0FBT0MsUUFBUSxNQUFNLDZCQUE2QjtBQUNsRCxPQUFPQyxNQUFNLE1BQU0sOEJBQThCO0FBQ2pELE9BQU9DLHFCQUFxQixNQUFNLDZCQUE2QjtBQUUvRCxNQUFNQyxpQkFBaUIsU0FBU1AsU0FBUyxDQUFDO0VBRXhDO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFUSxXQUFXQSxDQUFFQyxhQUFhLEVBQUVDLE9BQU8sRUFBRztJQUVwQ0EsT0FBTyxHQUFHVCxLQUFLLENBQUU7TUFFZjtNQUNBO01BQ0FVLGVBQWUsRUFBRVosYUFBYSxDQUFDYSxnQkFBZ0I7TUFFL0M7TUFDQUMsSUFBSSxFQUFFLFNBQVM7TUFDZkMsT0FBTyxFQUFFLEVBQUU7TUFDWEMsT0FBTyxFQUFFLEVBQUU7TUFDWEMsUUFBUSxFQUFFLEdBQUc7TUFFYjtNQUNBQyxNQUFNLEVBQUVaLE1BQU0sQ0FBQ2E7SUFDakIsQ0FBQyxFQUFFUixPQUFRLENBQUM7SUFFWixNQUFNUyxVQUFVLEdBQUcsRUFBRTtJQUVyQlYsYUFBYSxDQUFDVyxPQUFPLENBQUUsQ0FBRUMsSUFBSSxFQUFFQyxLQUFLLEtBQU07TUFDeEMsTUFBTUMsV0FBVyxHQUFHLElBQUlyQixJQUFJLENBQUVtQixJQUFJLENBQUNHLEtBQUssRUFBRXZCLEtBQUssQ0FBRSxDQUFDLENBQUMsRUFBRUYsYUFBYSxDQUFDMEIsZUFBZSxFQUFFO1FBQ2xGUixNQUFNLEVBQUVJLElBQUksQ0FBQ1gsT0FBTyxDQUFDTyxNQUFNLENBQUNTLFlBQVksQ0FBRSxXQUFZO01BQ3hELENBQUUsQ0FBRSxDQUFDO01BRUxQLFVBQVUsQ0FBQ1EsSUFBSSxDQUFFLElBQUl2QixRQUFRLENBQUVpQixJQUFJLENBQUNPLFFBQVEsRUFBRUwsV0FBVyxFQUFFdEIsS0FBSyxDQUFFLENBQUMsQ0FBQyxFQUFFb0IsSUFBSSxDQUFDWCxPQUFPLEVBQUVBLE9BQU8sQ0FBQ0MsZUFBZ0IsQ0FBRSxDQUFFLENBQUM7SUFDbkgsQ0FBRSxDQUFDO0lBRUgsTUFBTWtCLFlBQVksR0FBRyxJQUFJMUIsSUFBSSxDQUFFO01BQzdCMkIsUUFBUSxFQUFFWCxVQUFVO01BQ3BCWSxLQUFLLEVBQUUsTUFBTTtNQUNiQyxPQUFPLEVBQUU7SUFDWCxDQUFFLENBQUM7SUFFSCxLQUFLLENBQUVILFlBQVksRUFBRW5CLE9BQVEsQ0FBQztFQUNoQztBQUNGO0FBRUFKLHFCQUFxQixDQUFDMkIsUUFBUSxDQUFFLG1CQUFtQixFQUFFMUIsaUJBQWtCLENBQUM7QUFDeEUsZUFBZUEsaUJBQWlCIn0=