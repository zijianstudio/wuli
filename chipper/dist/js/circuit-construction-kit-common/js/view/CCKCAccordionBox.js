// Copyright 2017-2023, University of Colorado Boulder

/**
 * AccordionBox that is customized with constants for Circuit Construction Kit.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Denzell Barnett (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import optionize, { combineOptions } from '../../../phet-core/js/optionize.js';
import { HBox, HStrut, Text } from '../../../scenery/js/imports.js';
import AccordionBox from '../../../sun/js/AccordionBox.js';
import CCKCConstants from '../CCKCConstants.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import CCKCColors from './CCKCColors.js';

// constants
const BUTTON_MARGIN = 8;
export default class CCKCAccordionBox extends AccordionBox {
  /**
   * @param content - the content to display in the accordion box when it is expanded
   * @param title - the text to display in the title bar
   * @param tandem
   * @param [providedOptions]
   */
  constructor(content, title, tandem, providedOptions) {
    const options = optionize()({
      strutWidth: 10
    }, providedOptions);
    super(content, combineOptions({
      fill: CCKCColors.panelFillProperty,
      stroke: CCKCColors.panelStrokeProperty,
      cornerRadius: CCKCConstants.CORNER_RADIUS,
      titleXMargin: 10,
      buttonXMargin: BUTTON_MARGIN,
      buttonYMargin: BUTTON_MARGIN,
      titleYMargin: 4,
      titleXSpacing: 14,
      contentYSpacing: 0,
      lineWidth: CCKCConstants.PANEL_LINE_WIDTH,
      minWidth: CCKCConstants.RIGHT_SIDE_PANEL_MIN_WIDTH,
      expandedProperty: new BooleanProperty(false, {
        tandem: tandem.createTandem('expandedProperty'),
        phetioFeatured: true
      }),
      // Expand touch area to match the margins
      expandCollapseButtonOptions: {
        touchAreaYDilation: BUTTON_MARGIN,
        touchAreaXDilation: BUTTON_MARGIN
      },
      titleNode: new HBox({
        children: [new HStrut(options.strutWidth), new Text(title, {
          fontSize: CCKCConstants.FONT_SIZE,
          maxWidth: 175,
          fill: CCKCColors.textFillProperty,
          tandem: tandem.createTandem('titleText')
        })]
      }),
      tandem: tandem
    }, options));
  }
}
circuitConstructionKitCommon.register('CCKCAccordionBox', CCKCAccordionBox);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJvcHRpb25pemUiLCJjb21iaW5lT3B0aW9ucyIsIkhCb3giLCJIU3RydXQiLCJUZXh0IiwiQWNjb3JkaW9uQm94IiwiQ0NLQ0NvbnN0YW50cyIsImNpcmN1aXRDb25zdHJ1Y3Rpb25LaXRDb21tb24iLCJDQ0tDQ29sb3JzIiwiQlVUVE9OX01BUkdJTiIsIkNDS0NBY2NvcmRpb25Cb3giLCJjb25zdHJ1Y3RvciIsImNvbnRlbnQiLCJ0aXRsZSIsInRhbmRlbSIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJzdHJ1dFdpZHRoIiwiZmlsbCIsInBhbmVsRmlsbFByb3BlcnR5Iiwic3Ryb2tlIiwicGFuZWxTdHJva2VQcm9wZXJ0eSIsImNvcm5lclJhZGl1cyIsIkNPUk5FUl9SQURJVVMiLCJ0aXRsZVhNYXJnaW4iLCJidXR0b25YTWFyZ2luIiwiYnV0dG9uWU1hcmdpbiIsInRpdGxlWU1hcmdpbiIsInRpdGxlWFNwYWNpbmciLCJjb250ZW50WVNwYWNpbmciLCJsaW5lV2lkdGgiLCJQQU5FTF9MSU5FX1dJRFRIIiwibWluV2lkdGgiLCJSSUdIVF9TSURFX1BBTkVMX01JTl9XSURUSCIsImV4cGFuZGVkUHJvcGVydHkiLCJjcmVhdGVUYW5kZW0iLCJwaGV0aW9GZWF0dXJlZCIsImV4cGFuZENvbGxhcHNlQnV0dG9uT3B0aW9ucyIsInRvdWNoQXJlYVlEaWxhdGlvbiIsInRvdWNoQXJlYVhEaWxhdGlvbiIsInRpdGxlTm9kZSIsImNoaWxkcmVuIiwiZm9udFNpemUiLCJGT05UX1NJWkUiLCJtYXhXaWR0aCIsInRleHRGaWxsUHJvcGVydHkiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkNDS0NBY2NvcmRpb25Cb3gudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTctMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQWNjb3JkaW9uQm94IHRoYXQgaXMgY3VzdG9taXplZCB3aXRoIGNvbnN0YW50cyBmb3IgQ2lyY3VpdCBDb25zdHJ1Y3Rpb24gS2l0LlxyXG4gKlxyXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKiBAYXV0aG9yIERlbnplbGwgQmFybmV0dCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgQm9vbGVhblByb3BlcnR5IGZyb20gJy4uLy4uLy4uL2F4b24vanMvQm9vbGVhblByb3BlcnR5LmpzJztcclxuaW1wb3J0IFRSZWFkT25seVByb3BlcnR5IGZyb20gJy4uLy4uLy4uL2F4b24vanMvVFJlYWRPbmx5UHJvcGVydHkuanMnO1xyXG5pbXBvcnQgb3B0aW9uaXplLCB7IGNvbWJpbmVPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCB7IEhCb3gsIEhTdHJ1dCwgTm9kZSwgVGV4dCB9IGZyb20gJy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBBY2NvcmRpb25Cb3gsIHsgQWNjb3JkaW9uQm94T3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uL3N1bi9qcy9BY2NvcmRpb25Cb3guanMnO1xyXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xyXG5pbXBvcnQgQ0NLQ0NvbnN0YW50cyBmcm9tICcuLi9DQ0tDQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IGNpcmN1aXRDb25zdHJ1Y3Rpb25LaXRDb21tb24gZnJvbSAnLi4vY2lyY3VpdENvbnN0cnVjdGlvbktpdENvbW1vbi5qcyc7XHJcbmltcG9ydCBDQ0tDQ29sb3JzIGZyb20gJy4vQ0NLQ0NvbG9ycy5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgQlVUVE9OX01BUkdJTiA9IDg7XHJcblxyXG50eXBlIFNlbGZPcHRpb25zID0ge1xyXG4gIHN0cnV0V2lkdGg/OiBudW1iZXI7XHJcbn07XHJcbmV4cG9ydCB0eXBlIENDS0NBY2NvcmRpb25Cb3hPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBBY2NvcmRpb25Cb3hPcHRpb25zO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ0NLQ0FjY29yZGlvbkJveCBleHRlbmRzIEFjY29yZGlvbkJveCB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSBjb250ZW50IC0gdGhlIGNvbnRlbnQgdG8gZGlzcGxheSBpbiB0aGUgYWNjb3JkaW9uIGJveCB3aGVuIGl0IGlzIGV4cGFuZGVkXHJcbiAgICogQHBhcmFtIHRpdGxlIC0gdGhlIHRleHQgdG8gZGlzcGxheSBpbiB0aGUgdGl0bGUgYmFyXHJcbiAgICogQHBhcmFtIHRhbmRlbVxyXG4gICAqIEBwYXJhbSBbcHJvdmlkZWRPcHRpb25zXVxyXG4gICAqL1xyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggY29udGVudDogTm9kZSwgdGl0bGU6IFRSZWFkT25seVByb3BlcnR5PHN0cmluZz4sIHRhbmRlbTogVGFuZGVtLCBwcm92aWRlZE9wdGlvbnM/OiBDQ0tDQWNjb3JkaW9uQm94T3B0aW9ucyApIHtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPENDS0NBY2NvcmRpb25Cb3hPcHRpb25zLCBTZWxmT3B0aW9ucywgQWNjb3JkaW9uQm94T3B0aW9ucz4oKSgge1xyXG4gICAgICBzdHJ1dFdpZHRoOiAxMFxyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgc3VwZXIoIGNvbnRlbnQsIGNvbWJpbmVPcHRpb25zPEFjY29yZGlvbkJveE9wdGlvbnM+KCB7XHJcbiAgICAgIGZpbGw6IENDS0NDb2xvcnMucGFuZWxGaWxsUHJvcGVydHksXHJcbiAgICAgIHN0cm9rZTogQ0NLQ0NvbG9ycy5wYW5lbFN0cm9rZVByb3BlcnR5LFxyXG4gICAgICBjb3JuZXJSYWRpdXM6IENDS0NDb25zdGFudHMuQ09STkVSX1JBRElVUyxcclxuICAgICAgdGl0bGVYTWFyZ2luOiAxMCxcclxuICAgICAgYnV0dG9uWE1hcmdpbjogQlVUVE9OX01BUkdJTixcclxuICAgICAgYnV0dG9uWU1hcmdpbjogQlVUVE9OX01BUkdJTixcclxuICAgICAgdGl0bGVZTWFyZ2luOiA0LFxyXG4gICAgICB0aXRsZVhTcGFjaW5nOiAxNCxcclxuICAgICAgY29udGVudFlTcGFjaW5nOiAwLFxyXG4gICAgICBsaW5lV2lkdGg6IENDS0NDb25zdGFudHMuUEFORUxfTElORV9XSURUSCxcclxuICAgICAgbWluV2lkdGg6IENDS0NDb25zdGFudHMuUklHSFRfU0lERV9QQU5FTF9NSU5fV0lEVEgsXHJcbiAgICAgIGV4cGFuZGVkUHJvcGVydHk6IG5ldyBCb29sZWFuUHJvcGVydHkoIGZhbHNlLCB7XHJcbiAgICAgICAgdGFuZGVtOiB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnZXhwYW5kZWRQcm9wZXJ0eScgKSxcclxuICAgICAgICBwaGV0aW9GZWF0dXJlZDogdHJ1ZVxyXG4gICAgICB9ICksXHJcblxyXG4gICAgICAvLyBFeHBhbmQgdG91Y2ggYXJlYSB0byBtYXRjaCB0aGUgbWFyZ2luc1xyXG4gICAgICBleHBhbmRDb2xsYXBzZUJ1dHRvbk9wdGlvbnM6IHtcclxuICAgICAgICB0b3VjaEFyZWFZRGlsYXRpb246IEJVVFRPTl9NQVJHSU4sXHJcbiAgICAgICAgdG91Y2hBcmVhWERpbGF0aW9uOiBCVVRUT05fTUFSR0lOXHJcbiAgICAgIH0sXHJcbiAgICAgIHRpdGxlTm9kZTogbmV3IEhCb3goIHtcclxuICAgICAgICBjaGlsZHJlbjogW1xyXG4gICAgICAgICAgbmV3IEhTdHJ1dCggb3B0aW9ucy5zdHJ1dFdpZHRoICksXHJcbiAgICAgICAgICBuZXcgVGV4dCggdGl0bGUsIHtcclxuICAgICAgICAgICAgZm9udFNpemU6IENDS0NDb25zdGFudHMuRk9OVF9TSVpFLFxyXG4gICAgICAgICAgICBtYXhXaWR0aDogMTc1LFxyXG4gICAgICAgICAgICBmaWxsOiBDQ0tDQ29sb3JzLnRleHRGaWxsUHJvcGVydHksXHJcbiAgICAgICAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3RpdGxlVGV4dCcgKVxyXG4gICAgICAgICAgfSApXHJcbiAgICAgICAgXVxyXG4gICAgICB9ICksXHJcbiAgICAgIHRhbmRlbTogdGFuZGVtXHJcbiAgICB9LCBvcHRpb25zICkgKTtcclxuICB9XHJcbn1cclxuXHJcbmNpcmN1aXRDb25zdHJ1Y3Rpb25LaXRDb21tb24ucmVnaXN0ZXIoICdDQ0tDQWNjb3JkaW9uQm94JywgQ0NLQ0FjY29yZGlvbkJveCApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGVBQWUsTUFBTSxxQ0FBcUM7QUFFakUsT0FBT0MsU0FBUyxJQUFJQyxjQUFjLFFBQVEsb0NBQW9DO0FBQzlFLFNBQVNDLElBQUksRUFBRUMsTUFBTSxFQUFRQyxJQUFJLFFBQVEsZ0NBQWdDO0FBQ3pFLE9BQU9DLFlBQVksTUFBK0IsaUNBQWlDO0FBRW5GLE9BQU9DLGFBQWEsTUFBTSxxQkFBcUI7QUFDL0MsT0FBT0MsNEJBQTRCLE1BQU0sb0NBQW9DO0FBQzdFLE9BQU9DLFVBQVUsTUFBTSxpQkFBaUI7O0FBRXhDO0FBQ0EsTUFBTUMsYUFBYSxHQUFHLENBQUM7QUFPdkIsZUFBZSxNQUFNQyxnQkFBZ0IsU0FBU0wsWUFBWSxDQUFDO0VBRXpEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNTTSxXQUFXQSxDQUFFQyxPQUFhLEVBQUVDLEtBQWdDLEVBQUVDLE1BQWMsRUFBRUMsZUFBeUMsRUFBRztJQUUvSCxNQUFNQyxPQUFPLEdBQUdoQixTQUFTLENBQTRELENBQUMsQ0FBRTtNQUN0RmlCLFVBQVUsRUFBRTtJQUNkLENBQUMsRUFBRUYsZUFBZ0IsQ0FBQztJQUVwQixLQUFLLENBQUVILE9BQU8sRUFBRVgsY0FBYyxDQUF1QjtNQUNuRGlCLElBQUksRUFBRVYsVUFBVSxDQUFDVyxpQkFBaUI7TUFDbENDLE1BQU0sRUFBRVosVUFBVSxDQUFDYSxtQkFBbUI7TUFDdENDLFlBQVksRUFBRWhCLGFBQWEsQ0FBQ2lCLGFBQWE7TUFDekNDLFlBQVksRUFBRSxFQUFFO01BQ2hCQyxhQUFhLEVBQUVoQixhQUFhO01BQzVCaUIsYUFBYSxFQUFFakIsYUFBYTtNQUM1QmtCLFlBQVksRUFBRSxDQUFDO01BQ2ZDLGFBQWEsRUFBRSxFQUFFO01BQ2pCQyxlQUFlLEVBQUUsQ0FBQztNQUNsQkMsU0FBUyxFQUFFeEIsYUFBYSxDQUFDeUIsZ0JBQWdCO01BQ3pDQyxRQUFRLEVBQUUxQixhQUFhLENBQUMyQiwwQkFBMEI7TUFDbERDLGdCQUFnQixFQUFFLElBQUluQyxlQUFlLENBQUUsS0FBSyxFQUFFO1FBQzVDZSxNQUFNLEVBQUVBLE1BQU0sQ0FBQ3FCLFlBQVksQ0FBRSxrQkFBbUIsQ0FBQztRQUNqREMsY0FBYyxFQUFFO01BQ2xCLENBQUUsQ0FBQztNQUVIO01BQ0FDLDJCQUEyQixFQUFFO1FBQzNCQyxrQkFBa0IsRUFBRTdCLGFBQWE7UUFDakM4QixrQkFBa0IsRUFBRTlCO01BQ3RCLENBQUM7TUFDRCtCLFNBQVMsRUFBRSxJQUFJdEMsSUFBSSxDQUFFO1FBQ25CdUMsUUFBUSxFQUFFLENBQ1IsSUFBSXRDLE1BQU0sQ0FBRWEsT0FBTyxDQUFDQyxVQUFXLENBQUMsRUFDaEMsSUFBSWIsSUFBSSxDQUFFUyxLQUFLLEVBQUU7VUFDZjZCLFFBQVEsRUFBRXBDLGFBQWEsQ0FBQ3FDLFNBQVM7VUFDakNDLFFBQVEsRUFBRSxHQUFHO1VBQ2IxQixJQUFJLEVBQUVWLFVBQVUsQ0FBQ3FDLGdCQUFnQjtVQUNqQy9CLE1BQU0sRUFBRUEsTUFBTSxDQUFDcUIsWUFBWSxDQUFFLFdBQVk7UUFDM0MsQ0FBRSxDQUFDO01BRVAsQ0FBRSxDQUFDO01BQ0hyQixNQUFNLEVBQUVBO0lBQ1YsQ0FBQyxFQUFFRSxPQUFRLENBQUUsQ0FBQztFQUNoQjtBQUNGO0FBRUFULDRCQUE0QixDQUFDdUMsUUFBUSxDQUFFLGtCQUFrQixFQUFFcEMsZ0JBQWlCLENBQUMifQ==