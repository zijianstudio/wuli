// Copyright 2014-2022, University of Colorado Boulder

/**
 * a phase diagram in an accordion box
 *
 * @author Siddhartha Chinthapally (Actual Concepts)
 */

import merge from '../../../../phet-core/js/merge.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Text } from '../../../../scenery/js/imports.js';
import AccordionBox from '../../../../sun/js/AccordionBox.js';
import SOMConstants from '../../common/SOMConstants.js';
import SOMColors from '../../common/view/SOMColors.js';
import statesOfMatter from '../../statesOfMatter.js';
import StatesOfMatterStrings from '../../StatesOfMatterStrings.js';
import PhaseDiagram from './PhaseDiagram.js';
const phaseDiagramString = StatesOfMatterStrings.phaseDiagram;
class PhaseDiagramAccordionBox extends AccordionBox {
  /**
   * @param {Property.<boolean>} expandedProperty - is to expand the phase diagram
   * @param {Object} [options] that can be passed on to the underlying node
   */
  constructor(expandedProperty, options) {
    options = merge({
      fill: SOMColors.controlPanelBackgroundProperty,
      stroke: SOMColors.controlPanelStrokeProperty,
      expandedProperty: expandedProperty,
      contentAlign: 'center',
      titleAlignX: 'center',
      buttonAlign: 'left',
      cornerRadius: SOMConstants.PANEL_CORNER_RADIUS,
      contentYSpacing: -1,
      contentYMargin: 5,
      contentXMargin: 5,
      buttonYMargin: 4,
      buttonXMargin: 5,
      maxWidth: 100,
      expandCollapseButtonOptions: {
        sideLength: 12,
        touchAreaXDilation: 15,
        touchAreaYDilation: 10
      },
      tandem: options.tandem.createTandem('accordionBox'),
      visiblePropertyOptions: {
        phetioReadOnly: true
      }
    }, options);
    const phaseDiagram = new PhaseDiagram();
    const titleNode = new Text(phaseDiagramString, {
      fill: SOMColors.controlPanelTextProperty,
      font: new PhetFont({
        size: 13
      }),
      maxWidth: options.maxWidth * 0.75
    });
    super(phaseDiagram, merge(options, {
      titleNode: titleNode
    }));

    // @private - make phase diagram available so that methods can access it
    this.phaseDiagram = phaseDiagram;
  }

  /**
   * Set the normalized position for this marker.
   * @param normalizedTemperature - Temperature (X position) value between 0 and 1 (inclusive).
   * @param normalizedPressure    - Pressure (Y position) value between 0 and 1 (inclusive).
   * @public
   */
  setStateMarkerPos(normalizedTemperature, normalizedPressure) {
    this.phaseDiagram.setStateMarkerPos(normalizedTemperature, normalizedPressure);
  }

  /**
   * Set the visibility of the state marker.
   * @param {boolean} isVisible
   * @public
   */
  setStateMarkerVisible(isVisible) {
    this.phaseDiagram.setStateMarkerVisible(isVisible);
  }

  /**
   * Set the phase diagram to be shaped such that it looks more like the phase diagram water, which is to say that the
   * solid-liquid line leans to the left rather than to the right.  Note that this is a very non-general approach - it
   * would be more general to allow the various points in the graph (e.g. triple point, critical point) to be
   * positioned anywhere, but currently it isn't worth the extra effort to do so.  Feel free if it is ever needed.
   * @param {boolean} depictingWater
   * @public
   */
  setDepictingWater(depictingWater) {
    this.phaseDiagram.setDepictingWater(depictingWater);
  }
}
statesOfMatter.register('PhaseDiagramAccordionBox', PhaseDiagramAccordionBox);
export default PhaseDiagramAccordionBox;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJtZXJnZSIsIlBoZXRGb250IiwiVGV4dCIsIkFjY29yZGlvbkJveCIsIlNPTUNvbnN0YW50cyIsIlNPTUNvbG9ycyIsInN0YXRlc09mTWF0dGVyIiwiU3RhdGVzT2ZNYXR0ZXJTdHJpbmdzIiwiUGhhc2VEaWFncmFtIiwicGhhc2VEaWFncmFtU3RyaW5nIiwicGhhc2VEaWFncmFtIiwiUGhhc2VEaWFncmFtQWNjb3JkaW9uQm94IiwiY29uc3RydWN0b3IiLCJleHBhbmRlZFByb3BlcnR5Iiwib3B0aW9ucyIsImZpbGwiLCJjb250cm9sUGFuZWxCYWNrZ3JvdW5kUHJvcGVydHkiLCJzdHJva2UiLCJjb250cm9sUGFuZWxTdHJva2VQcm9wZXJ0eSIsImNvbnRlbnRBbGlnbiIsInRpdGxlQWxpZ25YIiwiYnV0dG9uQWxpZ24iLCJjb3JuZXJSYWRpdXMiLCJQQU5FTF9DT1JORVJfUkFESVVTIiwiY29udGVudFlTcGFjaW5nIiwiY29udGVudFlNYXJnaW4iLCJjb250ZW50WE1hcmdpbiIsImJ1dHRvbllNYXJnaW4iLCJidXR0b25YTWFyZ2luIiwibWF4V2lkdGgiLCJleHBhbmRDb2xsYXBzZUJ1dHRvbk9wdGlvbnMiLCJzaWRlTGVuZ3RoIiwidG91Y2hBcmVhWERpbGF0aW9uIiwidG91Y2hBcmVhWURpbGF0aW9uIiwidGFuZGVtIiwiY3JlYXRlVGFuZGVtIiwidmlzaWJsZVByb3BlcnR5T3B0aW9ucyIsInBoZXRpb1JlYWRPbmx5IiwidGl0bGVOb2RlIiwiY29udHJvbFBhbmVsVGV4dFByb3BlcnR5IiwiZm9udCIsInNpemUiLCJzZXRTdGF0ZU1hcmtlclBvcyIsIm5vcm1hbGl6ZWRUZW1wZXJhdHVyZSIsIm5vcm1hbGl6ZWRQcmVzc3VyZSIsInNldFN0YXRlTWFya2VyVmlzaWJsZSIsImlzVmlzaWJsZSIsInNldERlcGljdGluZ1dhdGVyIiwiZGVwaWN0aW5nV2F0ZXIiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlBoYXNlRGlhZ3JhbUFjY29yZGlvbkJveC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNC0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBhIHBoYXNlIGRpYWdyYW0gaW4gYW4gYWNjb3JkaW9uIGJveFxyXG4gKlxyXG4gKiBAYXV0aG9yIFNpZGRoYXJ0aGEgQ2hpbnRoYXBhbGx5IChBY3R1YWwgQ29uY2VwdHMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCBQaGV0Rm9udCBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvUGhldEZvbnQuanMnO1xyXG5pbXBvcnQgeyBUZXh0IH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IEFjY29yZGlvbkJveCBmcm9tICcuLi8uLi8uLi8uLi9zdW4vanMvQWNjb3JkaW9uQm94LmpzJztcclxuaW1wb3J0IFNPTUNvbnN0YW50cyBmcm9tICcuLi8uLi9jb21tb24vU09NQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IFNPTUNvbG9ycyBmcm9tICcuLi8uLi9jb21tb24vdmlldy9TT01Db2xvcnMuanMnO1xyXG5pbXBvcnQgc3RhdGVzT2ZNYXR0ZXIgZnJvbSAnLi4vLi4vc3RhdGVzT2ZNYXR0ZXIuanMnO1xyXG5pbXBvcnQgU3RhdGVzT2ZNYXR0ZXJTdHJpbmdzIGZyb20gJy4uLy4uL1N0YXRlc09mTWF0dGVyU3RyaW5ncy5qcyc7XHJcbmltcG9ydCBQaGFzZURpYWdyYW0gZnJvbSAnLi9QaGFzZURpYWdyYW0uanMnO1xyXG5cclxuY29uc3QgcGhhc2VEaWFncmFtU3RyaW5nID0gU3RhdGVzT2ZNYXR0ZXJTdHJpbmdzLnBoYXNlRGlhZ3JhbTtcclxuXHJcbmNsYXNzIFBoYXNlRGlhZ3JhbUFjY29yZGlvbkJveCBleHRlbmRzIEFjY29yZGlvbkJveCB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7UHJvcGVydHkuPGJvb2xlYW4+fSBleHBhbmRlZFByb3BlcnR5IC0gaXMgdG8gZXhwYW5kIHRoZSBwaGFzZSBkaWFncmFtXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXSB0aGF0IGNhbiBiZSBwYXNzZWQgb24gdG8gdGhlIHVuZGVybHlpbmcgbm9kZVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBleHBhbmRlZFByb3BlcnR5LCBvcHRpb25zICkge1xyXG5cclxuICAgIG9wdGlvbnMgPSBtZXJnZSgge1xyXG4gICAgICBmaWxsOiBTT01Db2xvcnMuY29udHJvbFBhbmVsQmFja2dyb3VuZFByb3BlcnR5LFxyXG4gICAgICBzdHJva2U6IFNPTUNvbG9ycy5jb250cm9sUGFuZWxTdHJva2VQcm9wZXJ0eSxcclxuICAgICAgZXhwYW5kZWRQcm9wZXJ0eTogZXhwYW5kZWRQcm9wZXJ0eSxcclxuICAgICAgY29udGVudEFsaWduOiAnY2VudGVyJyxcclxuICAgICAgdGl0bGVBbGlnblg6ICdjZW50ZXInLFxyXG4gICAgICBidXR0b25BbGlnbjogJ2xlZnQnLFxyXG4gICAgICBjb3JuZXJSYWRpdXM6IFNPTUNvbnN0YW50cy5QQU5FTF9DT1JORVJfUkFESVVTLFxyXG4gICAgICBjb250ZW50WVNwYWNpbmc6IC0xLFxyXG4gICAgICBjb250ZW50WU1hcmdpbjogNSxcclxuICAgICAgY29udGVudFhNYXJnaW46IDUsXHJcbiAgICAgIGJ1dHRvbllNYXJnaW46IDQsXHJcbiAgICAgIGJ1dHRvblhNYXJnaW46IDUsXHJcbiAgICAgIG1heFdpZHRoOiAxMDAsXHJcbiAgICAgIGV4cGFuZENvbGxhcHNlQnV0dG9uT3B0aW9uczoge1xyXG4gICAgICAgIHNpZGVMZW5ndGg6IDEyLFxyXG4gICAgICAgIHRvdWNoQXJlYVhEaWxhdGlvbjogMTUsXHJcbiAgICAgICAgdG91Y2hBcmVhWURpbGF0aW9uOiAxMFxyXG4gICAgICB9LFxyXG4gICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2FjY29yZGlvbkJveCcgKSxcclxuICAgICAgdmlzaWJsZVByb3BlcnR5T3B0aW9uczogeyBwaGV0aW9SZWFkT25seTogdHJ1ZSB9XHJcbiAgICB9LCBvcHRpb25zICk7XHJcblxyXG4gICAgY29uc3QgcGhhc2VEaWFncmFtID0gbmV3IFBoYXNlRGlhZ3JhbSgpO1xyXG5cclxuICAgIGNvbnN0IHRpdGxlTm9kZSA9IG5ldyBUZXh0KCBwaGFzZURpYWdyYW1TdHJpbmcsIHtcclxuICAgICAgZmlsbDogU09NQ29sb3JzLmNvbnRyb2xQYW5lbFRleHRQcm9wZXJ0eSxcclxuICAgICAgZm9udDogbmV3IFBoZXRGb250KCB7IHNpemU6IDEzIH0gKSxcclxuICAgICAgbWF4V2lkdGg6IG9wdGlvbnMubWF4V2lkdGggKiAwLjc1XHJcbiAgICB9ICk7XHJcblxyXG4gICAgc3VwZXIoIHBoYXNlRGlhZ3JhbSwgbWVyZ2UoIG9wdGlvbnMsIHsgdGl0bGVOb2RlOiB0aXRsZU5vZGUgfSApICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUgLSBtYWtlIHBoYXNlIGRpYWdyYW0gYXZhaWxhYmxlIHNvIHRoYXQgbWV0aG9kcyBjYW4gYWNjZXNzIGl0XHJcbiAgICB0aGlzLnBoYXNlRGlhZ3JhbSA9IHBoYXNlRGlhZ3JhbTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFNldCB0aGUgbm9ybWFsaXplZCBwb3NpdGlvbiBmb3IgdGhpcyBtYXJrZXIuXHJcbiAgICogQHBhcmFtIG5vcm1hbGl6ZWRUZW1wZXJhdHVyZSAtIFRlbXBlcmF0dXJlIChYIHBvc2l0aW9uKSB2YWx1ZSBiZXR3ZWVuIDAgYW5kIDEgKGluY2x1c2l2ZSkuXHJcbiAgICogQHBhcmFtIG5vcm1hbGl6ZWRQcmVzc3VyZSAgICAtIFByZXNzdXJlIChZIHBvc2l0aW9uKSB2YWx1ZSBiZXR3ZWVuIDAgYW5kIDEgKGluY2x1c2l2ZSkuXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHNldFN0YXRlTWFya2VyUG9zKCBub3JtYWxpemVkVGVtcGVyYXR1cmUsIG5vcm1hbGl6ZWRQcmVzc3VyZSApIHtcclxuICAgIHRoaXMucGhhc2VEaWFncmFtLnNldFN0YXRlTWFya2VyUG9zKCBub3JtYWxpemVkVGVtcGVyYXR1cmUsIG5vcm1hbGl6ZWRQcmVzc3VyZSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0IHRoZSB2aXNpYmlsaXR5IG9mIHRoZSBzdGF0ZSBtYXJrZXIuXHJcbiAgICogQHBhcmFtIHtib29sZWFufSBpc1Zpc2libGVcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgc2V0U3RhdGVNYXJrZXJWaXNpYmxlKCBpc1Zpc2libGUgKSB7XHJcbiAgICB0aGlzLnBoYXNlRGlhZ3JhbS5zZXRTdGF0ZU1hcmtlclZpc2libGUoIGlzVmlzaWJsZSApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0IHRoZSBwaGFzZSBkaWFncmFtIHRvIGJlIHNoYXBlZCBzdWNoIHRoYXQgaXQgbG9va3MgbW9yZSBsaWtlIHRoZSBwaGFzZSBkaWFncmFtIHdhdGVyLCB3aGljaCBpcyB0byBzYXkgdGhhdCB0aGVcclxuICAgKiBzb2xpZC1saXF1aWQgbGluZSBsZWFucyB0byB0aGUgbGVmdCByYXRoZXIgdGhhbiB0byB0aGUgcmlnaHQuICBOb3RlIHRoYXQgdGhpcyBpcyBhIHZlcnkgbm9uLWdlbmVyYWwgYXBwcm9hY2ggLSBpdFxyXG4gICAqIHdvdWxkIGJlIG1vcmUgZ2VuZXJhbCB0byBhbGxvdyB0aGUgdmFyaW91cyBwb2ludHMgaW4gdGhlIGdyYXBoIChlLmcuIHRyaXBsZSBwb2ludCwgY3JpdGljYWwgcG9pbnQpIHRvIGJlXHJcbiAgICogcG9zaXRpb25lZCBhbnl3aGVyZSwgYnV0IGN1cnJlbnRseSBpdCBpc24ndCB3b3J0aCB0aGUgZXh0cmEgZWZmb3J0IHRvIGRvIHNvLiAgRmVlbCBmcmVlIGlmIGl0IGlzIGV2ZXIgbmVlZGVkLlxyXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gZGVwaWN0aW5nV2F0ZXJcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgc2V0RGVwaWN0aW5nV2F0ZXIoIGRlcGljdGluZ1dhdGVyICkge1xyXG4gICAgdGhpcy5waGFzZURpYWdyYW0uc2V0RGVwaWN0aW5nV2F0ZXIoIGRlcGljdGluZ1dhdGVyICk7XHJcbiAgfVxyXG59XHJcblxyXG5zdGF0ZXNPZk1hdHRlci5yZWdpc3RlciggJ1BoYXNlRGlhZ3JhbUFjY29yZGlvbkJveCcsIFBoYXNlRGlhZ3JhbUFjY29yZGlvbkJveCApO1xyXG5leHBvcnQgZGVmYXVsdCBQaGFzZURpYWdyYW1BY2NvcmRpb25Cb3g7XHJcbiJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxLQUFLLE1BQU0sbUNBQW1DO0FBQ3JELE9BQU9DLFFBQVEsTUFBTSx5Q0FBeUM7QUFDOUQsU0FBU0MsSUFBSSxRQUFRLG1DQUFtQztBQUN4RCxPQUFPQyxZQUFZLE1BQU0sb0NBQW9DO0FBQzdELE9BQU9DLFlBQVksTUFBTSw4QkFBOEI7QUFDdkQsT0FBT0MsU0FBUyxNQUFNLGdDQUFnQztBQUN0RCxPQUFPQyxjQUFjLE1BQU0seUJBQXlCO0FBQ3BELE9BQU9DLHFCQUFxQixNQUFNLGdDQUFnQztBQUNsRSxPQUFPQyxZQUFZLE1BQU0sbUJBQW1CO0FBRTVDLE1BQU1DLGtCQUFrQixHQUFHRixxQkFBcUIsQ0FBQ0csWUFBWTtBQUU3RCxNQUFNQyx3QkFBd0IsU0FBU1IsWUFBWSxDQUFDO0VBRWxEO0FBQ0Y7QUFDQTtBQUNBO0VBQ0VTLFdBQVdBLENBQUVDLGdCQUFnQixFQUFFQyxPQUFPLEVBQUc7SUFFdkNBLE9BQU8sR0FBR2QsS0FBSyxDQUFFO01BQ2ZlLElBQUksRUFBRVYsU0FBUyxDQUFDVyw4QkFBOEI7TUFDOUNDLE1BQU0sRUFBRVosU0FBUyxDQUFDYSwwQkFBMEI7TUFDNUNMLGdCQUFnQixFQUFFQSxnQkFBZ0I7TUFDbENNLFlBQVksRUFBRSxRQUFRO01BQ3RCQyxXQUFXLEVBQUUsUUFBUTtNQUNyQkMsV0FBVyxFQUFFLE1BQU07TUFDbkJDLFlBQVksRUFBRWxCLFlBQVksQ0FBQ21CLG1CQUFtQjtNQUM5Q0MsZUFBZSxFQUFFLENBQUMsQ0FBQztNQUNuQkMsY0FBYyxFQUFFLENBQUM7TUFDakJDLGNBQWMsRUFBRSxDQUFDO01BQ2pCQyxhQUFhLEVBQUUsQ0FBQztNQUNoQkMsYUFBYSxFQUFFLENBQUM7TUFDaEJDLFFBQVEsRUFBRSxHQUFHO01BQ2JDLDJCQUEyQixFQUFFO1FBQzNCQyxVQUFVLEVBQUUsRUFBRTtRQUNkQyxrQkFBa0IsRUFBRSxFQUFFO1FBQ3RCQyxrQkFBa0IsRUFBRTtNQUN0QixDQUFDO01BQ0RDLE1BQU0sRUFBRXBCLE9BQU8sQ0FBQ29CLE1BQU0sQ0FBQ0MsWUFBWSxDQUFFLGNBQWUsQ0FBQztNQUNyREMsc0JBQXNCLEVBQUU7UUFBRUMsY0FBYyxFQUFFO01BQUs7SUFDakQsQ0FBQyxFQUFFdkIsT0FBUSxDQUFDO0lBRVosTUFBTUosWUFBWSxHQUFHLElBQUlGLFlBQVksQ0FBQyxDQUFDO0lBRXZDLE1BQU04QixTQUFTLEdBQUcsSUFBSXBDLElBQUksQ0FBRU8sa0JBQWtCLEVBQUU7TUFDOUNNLElBQUksRUFBRVYsU0FBUyxDQUFDa0Msd0JBQXdCO01BQ3hDQyxJQUFJLEVBQUUsSUFBSXZDLFFBQVEsQ0FBRTtRQUFFd0MsSUFBSSxFQUFFO01BQUcsQ0FBRSxDQUFDO01BQ2xDWixRQUFRLEVBQUVmLE9BQU8sQ0FBQ2UsUUFBUSxHQUFHO0lBQy9CLENBQUUsQ0FBQztJQUVILEtBQUssQ0FBRW5CLFlBQVksRUFBRVYsS0FBSyxDQUFFYyxPQUFPLEVBQUU7TUFBRXdCLFNBQVMsRUFBRUE7SUFBVSxDQUFFLENBQUUsQ0FBQzs7SUFFakU7SUFDQSxJQUFJLENBQUM1QixZQUFZLEdBQUdBLFlBQVk7RUFDbEM7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VnQyxpQkFBaUJBLENBQUVDLHFCQUFxQixFQUFFQyxrQkFBa0IsRUFBRztJQUM3RCxJQUFJLENBQUNsQyxZQUFZLENBQUNnQyxpQkFBaUIsQ0FBRUMscUJBQXFCLEVBQUVDLGtCQUFtQixDQUFDO0VBQ2xGOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7RUFDRUMscUJBQXFCQSxDQUFFQyxTQUFTLEVBQUc7SUFDakMsSUFBSSxDQUFDcEMsWUFBWSxDQUFDbUMscUJBQXFCLENBQUVDLFNBQVUsQ0FBQztFQUN0RDs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VDLGlCQUFpQkEsQ0FBRUMsY0FBYyxFQUFHO0lBQ2xDLElBQUksQ0FBQ3RDLFlBQVksQ0FBQ3FDLGlCQUFpQixDQUFFQyxjQUFlLENBQUM7RUFDdkQ7QUFDRjtBQUVBMUMsY0FBYyxDQUFDMkMsUUFBUSxDQUFFLDBCQUEwQixFQUFFdEMsd0JBQXlCLENBQUM7QUFDL0UsZUFBZUEsd0JBQXdCIn0=