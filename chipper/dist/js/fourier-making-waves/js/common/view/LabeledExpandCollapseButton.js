// Copyright 2021-2023, University of Colorado Boulder

/**
 * LabeledExpandCollapseButton adds a label to the right of an ExpandCollapseButton.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import merge from '../../../../phet-core/js/merge.js';
import { FireListener, HBox, Text } from '../../../../scenery/js/imports.js';
import ExpandCollapseButton from '../../../../sun/js/ExpandCollapseButton.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import fourierMakingWaves from '../../fourierMakingWaves.js';
import FMWConstants from '../FMWConstants.js';
export default class LabeledExpandCollapseButton extends HBox {
  /**
   * @param {TReadOnlyProperty.<string>} labelStringProperty
   * @param {Property.<boolean>} expandedProperty
   * @param {Object} [options]
   */
  constructor(labelStringProperty, expandedProperty, options) {
    options = merge({
      // HBox options
      spacing: 6,
      // ExpandCollapseButton options
      expandCollapseButtonOptions: FMWConstants.EXPAND_COLLAPSE_BUTTON_OPTIONS,
      // Text options
      textOptions: {
        font: FMWConstants.TITLE_FONT,
        maxWidth: FMWConstants.CHART_TITLE_MAX_WIDTH
      },
      // phet-io options
      tandem: Tandem.REQUIRED
    }, options);
    const labelText = new Text(labelStringProperty, merge({
      cursor: 'pointer',
      tandem: options.tandem.createTandem('labelText')
    }, options.textOptions));
    const expandCollapseButton = new ExpandCollapseButton(expandedProperty, merge({
      touchAreaXDilation: 6,
      touchAreaYDilation: 6,
      tandem: options.tandem.createTandem('expandCollapseButton')
    }, options.expandCollapseButtonOptions));
    assert && assert(!options.children, 'LabeledExpandCollapseButton sets children');
    options.children = [expandCollapseButton, labelText];
    super(options);

    // Clicking on the label toggles expandedProperty
    labelText.addInputListener(new FireListener({
      fire: () => {
        expandedProperty.value = !expandedProperty.value;
      }
    }));
  }
}
fourierMakingWaves.register('LabeledExpandCollapseButton', LabeledExpandCollapseButton);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJtZXJnZSIsIkZpcmVMaXN0ZW5lciIsIkhCb3giLCJUZXh0IiwiRXhwYW5kQ29sbGFwc2VCdXR0b24iLCJUYW5kZW0iLCJmb3VyaWVyTWFraW5nV2F2ZXMiLCJGTVdDb25zdGFudHMiLCJMYWJlbGVkRXhwYW5kQ29sbGFwc2VCdXR0b24iLCJjb25zdHJ1Y3RvciIsImxhYmVsU3RyaW5nUHJvcGVydHkiLCJleHBhbmRlZFByb3BlcnR5Iiwib3B0aW9ucyIsInNwYWNpbmciLCJleHBhbmRDb2xsYXBzZUJ1dHRvbk9wdGlvbnMiLCJFWFBBTkRfQ09MTEFQU0VfQlVUVE9OX09QVElPTlMiLCJ0ZXh0T3B0aW9ucyIsImZvbnQiLCJUSVRMRV9GT05UIiwibWF4V2lkdGgiLCJDSEFSVF9USVRMRV9NQVhfV0lEVEgiLCJ0YW5kZW0iLCJSRVFVSVJFRCIsImxhYmVsVGV4dCIsImN1cnNvciIsImNyZWF0ZVRhbmRlbSIsImV4cGFuZENvbGxhcHNlQnV0dG9uIiwidG91Y2hBcmVhWERpbGF0aW9uIiwidG91Y2hBcmVhWURpbGF0aW9uIiwiYXNzZXJ0IiwiY2hpbGRyZW4iLCJhZGRJbnB1dExpc3RlbmVyIiwiZmlyZSIsInZhbHVlIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJMYWJlbGVkRXhwYW5kQ29sbGFwc2VCdXR0b24uanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjEtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogTGFiZWxlZEV4cGFuZENvbGxhcHNlQnV0dG9uIGFkZHMgYSBsYWJlbCB0byB0aGUgcmlnaHQgb2YgYW4gRXhwYW5kQ29sbGFwc2VCdXR0b24uXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCB7IEZpcmVMaXN0ZW5lciwgSEJveCwgVGV4dCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBFeHBhbmRDb2xsYXBzZUJ1dHRvbiBmcm9tICcuLi8uLi8uLi8uLi9zdW4vanMvRXhwYW5kQ29sbGFwc2VCdXR0b24uanMnO1xyXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xyXG5pbXBvcnQgZm91cmllck1ha2luZ1dhdmVzIGZyb20gJy4uLy4uL2ZvdXJpZXJNYWtpbmdXYXZlcy5qcyc7XHJcbmltcG9ydCBGTVdDb25zdGFudHMgZnJvbSAnLi4vRk1XQ29uc3RhbnRzLmpzJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIExhYmVsZWRFeHBhbmRDb2xsYXBzZUJ1dHRvbiBleHRlbmRzIEhCb3gge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge1RSZWFkT25seVByb3BlcnR5LjxzdHJpbmc+fSBsYWJlbFN0cmluZ1Byb3BlcnR5XHJcbiAgICogQHBhcmFtIHtQcm9wZXJ0eS48Ym9vbGVhbj59IGV4cGFuZGVkUHJvcGVydHlcclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIGxhYmVsU3RyaW5nUHJvcGVydHksIGV4cGFuZGVkUHJvcGVydHksIG9wdGlvbnMgKSB7XHJcblxyXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XHJcblxyXG4gICAgICAvLyBIQm94IG9wdGlvbnNcclxuICAgICAgc3BhY2luZzogNixcclxuXHJcbiAgICAgIC8vIEV4cGFuZENvbGxhcHNlQnV0dG9uIG9wdGlvbnNcclxuICAgICAgZXhwYW5kQ29sbGFwc2VCdXR0b25PcHRpb25zOiBGTVdDb25zdGFudHMuRVhQQU5EX0NPTExBUFNFX0JVVFRPTl9PUFRJT05TLFxyXG5cclxuICAgICAgLy8gVGV4dCBvcHRpb25zXHJcbiAgICAgIHRleHRPcHRpb25zOiB7XHJcbiAgICAgICAgZm9udDogRk1XQ29uc3RhbnRzLlRJVExFX0ZPTlQsXHJcbiAgICAgICAgbWF4V2lkdGg6IEZNV0NvbnN0YW50cy5DSEFSVF9USVRMRV9NQVhfV0lEVEhcclxuICAgICAgfSxcclxuXHJcbiAgICAgIC8vIHBoZXQtaW8gb3B0aW9uc1xyXG4gICAgICB0YW5kZW06IFRhbmRlbS5SRVFVSVJFRFxyXG4gICAgfSwgb3B0aW9ucyApO1xyXG5cclxuICAgIGNvbnN0IGxhYmVsVGV4dCA9IG5ldyBUZXh0KCBsYWJlbFN0cmluZ1Byb3BlcnR5LCBtZXJnZSgge1xyXG4gICAgICBjdXJzb3I6ICdwb2ludGVyJyxcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdsYWJlbFRleHQnIClcclxuICAgIH0sIG9wdGlvbnMudGV4dE9wdGlvbnMgKSApO1xyXG5cclxuICAgIGNvbnN0IGV4cGFuZENvbGxhcHNlQnV0dG9uID0gbmV3IEV4cGFuZENvbGxhcHNlQnV0dG9uKCBleHBhbmRlZFByb3BlcnR5LCBtZXJnZSgge1xyXG4gICAgICB0b3VjaEFyZWFYRGlsYXRpb246IDYsXHJcbiAgICAgIHRvdWNoQXJlYVlEaWxhdGlvbjogNixcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdleHBhbmRDb2xsYXBzZUJ1dHRvbicgKVxyXG4gICAgfSwgb3B0aW9ucy5leHBhbmRDb2xsYXBzZUJ1dHRvbk9wdGlvbnMgKSApO1xyXG5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoICFvcHRpb25zLmNoaWxkcmVuLCAnTGFiZWxlZEV4cGFuZENvbGxhcHNlQnV0dG9uIHNldHMgY2hpbGRyZW4nICk7XHJcbiAgICBvcHRpb25zLmNoaWxkcmVuID0gWyBleHBhbmRDb2xsYXBzZUJ1dHRvbiwgbGFiZWxUZXh0IF07XHJcblxyXG4gICAgc3VwZXIoIG9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBDbGlja2luZyBvbiB0aGUgbGFiZWwgdG9nZ2xlcyBleHBhbmRlZFByb3BlcnR5XHJcbiAgICBsYWJlbFRleHQuYWRkSW5wdXRMaXN0ZW5lciggbmV3IEZpcmVMaXN0ZW5lcigge1xyXG4gICAgICBmaXJlOiAoKSA9PiB7XHJcbiAgICAgICAgZXhwYW5kZWRQcm9wZXJ0eS52YWx1ZSA9ICFleHBhbmRlZFByb3BlcnR5LnZhbHVlO1xyXG4gICAgICB9XHJcbiAgICB9ICkgKTtcclxuICB9XHJcbn1cclxuXHJcbmZvdXJpZXJNYWtpbmdXYXZlcy5yZWdpc3RlciggJ0xhYmVsZWRFeHBhbmRDb2xsYXBzZUJ1dHRvbicsIExhYmVsZWRFeHBhbmRDb2xsYXBzZUJ1dHRvbiApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxLQUFLLE1BQU0sbUNBQW1DO0FBQ3JELFNBQVNDLFlBQVksRUFBRUMsSUFBSSxFQUFFQyxJQUFJLFFBQVEsbUNBQW1DO0FBQzVFLE9BQU9DLG9CQUFvQixNQUFNLDRDQUE0QztBQUM3RSxPQUFPQyxNQUFNLE1BQU0saUNBQWlDO0FBQ3BELE9BQU9DLGtCQUFrQixNQUFNLDZCQUE2QjtBQUM1RCxPQUFPQyxZQUFZLE1BQU0sb0JBQW9CO0FBRTdDLGVBQWUsTUFBTUMsMkJBQTJCLFNBQVNOLElBQUksQ0FBQztFQUU1RDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0VBQ0VPLFdBQVdBLENBQUVDLG1CQUFtQixFQUFFQyxnQkFBZ0IsRUFBRUMsT0FBTyxFQUFHO0lBRTVEQSxPQUFPLEdBQUdaLEtBQUssQ0FBRTtNQUVmO01BQ0FhLE9BQU8sRUFBRSxDQUFDO01BRVY7TUFDQUMsMkJBQTJCLEVBQUVQLFlBQVksQ0FBQ1EsOEJBQThCO01BRXhFO01BQ0FDLFdBQVcsRUFBRTtRQUNYQyxJQUFJLEVBQUVWLFlBQVksQ0FBQ1csVUFBVTtRQUM3QkMsUUFBUSxFQUFFWixZQUFZLENBQUNhO01BQ3pCLENBQUM7TUFFRDtNQUNBQyxNQUFNLEVBQUVoQixNQUFNLENBQUNpQjtJQUNqQixDQUFDLEVBQUVWLE9BQVEsQ0FBQztJQUVaLE1BQU1XLFNBQVMsR0FBRyxJQUFJcEIsSUFBSSxDQUFFTyxtQkFBbUIsRUFBRVYsS0FBSyxDQUFFO01BQ3REd0IsTUFBTSxFQUFFLFNBQVM7TUFDakJILE1BQU0sRUFBRVQsT0FBTyxDQUFDUyxNQUFNLENBQUNJLFlBQVksQ0FBRSxXQUFZO0lBQ25ELENBQUMsRUFBRWIsT0FBTyxDQUFDSSxXQUFZLENBQUUsQ0FBQztJQUUxQixNQUFNVSxvQkFBb0IsR0FBRyxJQUFJdEIsb0JBQW9CLENBQUVPLGdCQUFnQixFQUFFWCxLQUFLLENBQUU7TUFDOUUyQixrQkFBa0IsRUFBRSxDQUFDO01BQ3JCQyxrQkFBa0IsRUFBRSxDQUFDO01BQ3JCUCxNQUFNLEVBQUVULE9BQU8sQ0FBQ1MsTUFBTSxDQUFDSSxZQUFZLENBQUUsc0JBQXVCO0lBQzlELENBQUMsRUFBRWIsT0FBTyxDQUFDRSwyQkFBNEIsQ0FBRSxDQUFDO0lBRTFDZSxNQUFNLElBQUlBLE1BQU0sQ0FBRSxDQUFDakIsT0FBTyxDQUFDa0IsUUFBUSxFQUFFLDJDQUE0QyxDQUFDO0lBQ2xGbEIsT0FBTyxDQUFDa0IsUUFBUSxHQUFHLENBQUVKLG9CQUFvQixFQUFFSCxTQUFTLENBQUU7SUFFdEQsS0FBSyxDQUFFWCxPQUFRLENBQUM7O0lBRWhCO0lBQ0FXLFNBQVMsQ0FBQ1EsZ0JBQWdCLENBQUUsSUFBSTlCLFlBQVksQ0FBRTtNQUM1QytCLElBQUksRUFBRUEsQ0FBQSxLQUFNO1FBQ1ZyQixnQkFBZ0IsQ0FBQ3NCLEtBQUssR0FBRyxDQUFDdEIsZ0JBQWdCLENBQUNzQixLQUFLO01BQ2xEO0lBQ0YsQ0FBRSxDQUFFLENBQUM7RUFDUDtBQUNGO0FBRUEzQixrQkFBa0IsQ0FBQzRCLFFBQVEsQ0FBRSw2QkFBNkIsRUFBRTFCLDJCQUE0QixDQUFDIn0=