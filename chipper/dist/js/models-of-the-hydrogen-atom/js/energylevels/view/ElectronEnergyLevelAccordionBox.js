// Copyright 2015-2022, University of Colorado Boulder

/**
 * ElectronEnergyLevelAccordionBox is the accordion box that contains the electron energy level diagram.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Dimension2 from '../../../../dot/js/Dimension2.js';
import optionize from '../../../../phet-core/js/optionize.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Rectangle, Text } from '../../../../scenery/js/imports.js';
import AccordionBox from '../../../../sun/js/AccordionBox.js';
import MOTHAColors from '../../common/MOTHAColors.js';
import modelsOfTheHydrogenAtom from '../../modelsOfTheHydrogenAtom.js';
import ModelsOfTheHydrogenAtomStrings from '../../ModelsOfTheHydrogenAtomStrings.js';

// constants
const DIAGRAM_SIZE = new Dimension2(220, 420);
export default class ElectronEnergyLevelAccordionBox extends AccordionBox {
  constructor(providedOptions) {
    const options = optionize()({
      // AccordionBoxOptions
      fill: MOTHAColors.electronEnergyLevelAccordionBoxFillProperty,
      stroke: MOTHAColors.electronEnergyLevelAccordionBoxStrokeProperty,
      cornerRadius: 5,
      buttonXMargin: 5,
      buttonYMargin: 5,
      contentXMargin: 5,
      contentYMargin: 5,
      contentYSpacing: 0,
      expandCollapseButtonOptions: {
        touchAreaXDilation: 16,
        touchAreaYDilation: 16
      },
      buttonAlign: 'left',
      titleAlignX: 'left',
      titleXSpacing: 10
    }, providedOptions);
    options.titleNode = new Text(ModelsOfTheHydrogenAtomStrings.electronEnergyLevelStringProperty, {
      font: new PhetFont({
        size: 16,
        weight: 'bold'
      }),
      fill: MOTHAColors.electronEnergyLevelTitleFillProperty,
      maxWidth: 150,
      // i18n, determined empirically
      tandem: options.tandem.createTandem('titleText')
    });

    //TODO this is a placeholder
    const diagramNode = new Rectangle(0, 0, DIAGRAM_SIZE.width, DIAGRAM_SIZE.height, {
      fill: 'white',
      stroke: 'black'
    });
    super(diagramNode, options);
  }
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
    super.dispose();
  }
}
modelsOfTheHydrogenAtom.register('ElectronEnergyLevelAccordionBox', ElectronEnergyLevelAccordionBox);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEaW1lbnNpb24yIiwib3B0aW9uaXplIiwiUGhldEZvbnQiLCJSZWN0YW5nbGUiLCJUZXh0IiwiQWNjb3JkaW9uQm94IiwiTU9USEFDb2xvcnMiLCJtb2RlbHNPZlRoZUh5ZHJvZ2VuQXRvbSIsIk1vZGVsc09mVGhlSHlkcm9nZW5BdG9tU3RyaW5ncyIsIkRJQUdSQU1fU0laRSIsIkVsZWN0cm9uRW5lcmd5TGV2ZWxBY2NvcmRpb25Cb3giLCJjb25zdHJ1Y3RvciIsInByb3ZpZGVkT3B0aW9ucyIsIm9wdGlvbnMiLCJmaWxsIiwiZWxlY3Ryb25FbmVyZ3lMZXZlbEFjY29yZGlvbkJveEZpbGxQcm9wZXJ0eSIsInN0cm9rZSIsImVsZWN0cm9uRW5lcmd5TGV2ZWxBY2NvcmRpb25Cb3hTdHJva2VQcm9wZXJ0eSIsImNvcm5lclJhZGl1cyIsImJ1dHRvblhNYXJnaW4iLCJidXR0b25ZTWFyZ2luIiwiY29udGVudFhNYXJnaW4iLCJjb250ZW50WU1hcmdpbiIsImNvbnRlbnRZU3BhY2luZyIsImV4cGFuZENvbGxhcHNlQnV0dG9uT3B0aW9ucyIsInRvdWNoQXJlYVhEaWxhdGlvbiIsInRvdWNoQXJlYVlEaWxhdGlvbiIsImJ1dHRvbkFsaWduIiwidGl0bGVBbGlnblgiLCJ0aXRsZVhTcGFjaW5nIiwidGl0bGVOb2RlIiwiZWxlY3Ryb25FbmVyZ3lMZXZlbFN0cmluZ1Byb3BlcnR5IiwiZm9udCIsInNpemUiLCJ3ZWlnaHQiLCJlbGVjdHJvbkVuZXJneUxldmVsVGl0bGVGaWxsUHJvcGVydHkiLCJtYXhXaWR0aCIsInRhbmRlbSIsImNyZWF0ZVRhbmRlbSIsImRpYWdyYW1Ob2RlIiwid2lkdGgiLCJoZWlnaHQiLCJkaXNwb3NlIiwiYXNzZXJ0IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJFbGVjdHJvbkVuZXJneUxldmVsQWNjb3JkaW9uQm94LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE1LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEVsZWN0cm9uRW5lcmd5TGV2ZWxBY2NvcmRpb25Cb3ggaXMgdGhlIGFjY29yZGlvbiBib3ggdGhhdCBjb250YWlucyB0aGUgZWxlY3Ryb24gZW5lcmd5IGxldmVsIGRpYWdyYW0uXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IERpbWVuc2lvbjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL0RpbWVuc2lvbjIuanMnO1xyXG5pbXBvcnQgb3B0aW9uaXplLCB7IEVtcHR5U2VsZk9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcclxuaW1wb3J0IFBpY2tSZXF1aXJlZCBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvUGlja1JlcXVpcmVkLmpzJztcclxuaW1wb3J0IFBoZXRGb250IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9QaGV0Rm9udC5qcyc7XHJcbmltcG9ydCB7IE5vZGVUcmFuc2xhdGlvbk9wdGlvbnMsIFJlY3RhbmdsZSwgVGV4dCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBBY2NvcmRpb25Cb3gsIHsgQWNjb3JkaW9uQm94T3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9BY2NvcmRpb25Cb3guanMnO1xyXG5pbXBvcnQgTU9USEFDb2xvcnMgZnJvbSAnLi4vLi4vY29tbW9uL01PVEhBQ29sb3JzLmpzJztcclxuaW1wb3J0IG1vZGVsc09mVGhlSHlkcm9nZW5BdG9tIGZyb20gJy4uLy4uL21vZGVsc09mVGhlSHlkcm9nZW5BdG9tLmpzJztcclxuaW1wb3J0IE1vZGVsc09mVGhlSHlkcm9nZW5BdG9tU3RyaW5ncyBmcm9tICcuLi8uLi9Nb2RlbHNPZlRoZUh5ZHJvZ2VuQXRvbVN0cmluZ3MuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IERJQUdSQU1fU0laRSA9IG5ldyBEaW1lbnNpb24yKCAyMjAsIDQyMCApO1xyXG5cclxudHlwZSBTZWxmT3B0aW9ucyA9IEVtcHR5U2VsZk9wdGlvbnM7XHJcblxyXG50eXBlIEVsZWN0cm9uRW5lcmd5TGV2ZWxBY2NvcmRpb25Cb3hPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBOb2RlVHJhbnNsYXRpb25PcHRpb25zICZcclxuICBQaWNrUmVxdWlyZWQ8QWNjb3JkaW9uQm94T3B0aW9ucywgJ2V4cGFuZGVkUHJvcGVydHknIHwgJ3RhbmRlbSc+O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRWxlY3Ryb25FbmVyZ3lMZXZlbEFjY29yZGlvbkJveCBleHRlbmRzIEFjY29yZGlvbkJveCB7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggcHJvdmlkZWRPcHRpb25zPzogRWxlY3Ryb25FbmVyZ3lMZXZlbEFjY29yZGlvbkJveE9wdGlvbnMgKSB7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxFbGVjdHJvbkVuZXJneUxldmVsQWNjb3JkaW9uQm94T3B0aW9ucywgU2VsZk9wdGlvbnMsIEFjY29yZGlvbkJveE9wdGlvbnM+KCkoIHtcclxuXHJcbiAgICAgIC8vIEFjY29yZGlvbkJveE9wdGlvbnNcclxuICAgICAgZmlsbDogTU9USEFDb2xvcnMuZWxlY3Ryb25FbmVyZ3lMZXZlbEFjY29yZGlvbkJveEZpbGxQcm9wZXJ0eSxcclxuICAgICAgc3Ryb2tlOiBNT1RIQUNvbG9ycy5lbGVjdHJvbkVuZXJneUxldmVsQWNjb3JkaW9uQm94U3Ryb2tlUHJvcGVydHksXHJcbiAgICAgIGNvcm5lclJhZGl1czogNSxcclxuICAgICAgYnV0dG9uWE1hcmdpbjogNSxcclxuICAgICAgYnV0dG9uWU1hcmdpbjogNSxcclxuICAgICAgY29udGVudFhNYXJnaW46IDUsXHJcbiAgICAgIGNvbnRlbnRZTWFyZ2luOiA1LFxyXG4gICAgICBjb250ZW50WVNwYWNpbmc6IDAsXHJcbiAgICAgIGV4cGFuZENvbGxhcHNlQnV0dG9uT3B0aW9uczoge1xyXG4gICAgICAgIHRvdWNoQXJlYVhEaWxhdGlvbjogMTYsXHJcbiAgICAgICAgdG91Y2hBcmVhWURpbGF0aW9uOiAxNlxyXG4gICAgICB9LFxyXG4gICAgICBidXR0b25BbGlnbjogJ2xlZnQnLFxyXG4gICAgICB0aXRsZUFsaWduWDogJ2xlZnQnLFxyXG4gICAgICB0aXRsZVhTcGFjaW5nOiAxMFxyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgb3B0aW9ucy50aXRsZU5vZGUgPSBuZXcgVGV4dCggTW9kZWxzT2ZUaGVIeWRyb2dlbkF0b21TdHJpbmdzLmVsZWN0cm9uRW5lcmd5TGV2ZWxTdHJpbmdQcm9wZXJ0eSwge1xyXG4gICAgICBmb250OiBuZXcgUGhldEZvbnQoIHsgc2l6ZTogMTYsIHdlaWdodDogJ2JvbGQnIH0gKSxcclxuICAgICAgZmlsbDogTU9USEFDb2xvcnMuZWxlY3Ryb25FbmVyZ3lMZXZlbFRpdGxlRmlsbFByb3BlcnR5LFxyXG4gICAgICBtYXhXaWR0aDogMTUwLCAvLyBpMThuLCBkZXRlcm1pbmVkIGVtcGlyaWNhbGx5XHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAndGl0bGVUZXh0JyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy9UT0RPIHRoaXMgaXMgYSBwbGFjZWhvbGRlclxyXG4gICAgY29uc3QgZGlhZ3JhbU5vZGUgPSBuZXcgUmVjdGFuZ2xlKCAwLCAwLCBESUFHUkFNX1NJWkUud2lkdGgsIERJQUdSQU1fU0laRS5oZWlnaHQsIHtcclxuICAgICAgZmlsbDogJ3doaXRlJyxcclxuICAgICAgc3Ryb2tlOiAnYmxhY2snXHJcbiAgICB9ICk7XHJcblxyXG4gICAgc3VwZXIoIGRpYWdyYW1Ob2RlLCBvcHRpb25zICk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgb3ZlcnJpZGUgZGlzcG9zZSgpOiB2b2lkIHtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGZhbHNlLCAnZGlzcG9zZSBpcyBub3Qgc3VwcG9ydGVkLCBleGlzdHMgZm9yIHRoZSBsaWZldGltZSBvZiB0aGUgc2ltJyApO1xyXG4gICAgc3VwZXIuZGlzcG9zZSgpO1xyXG4gIH1cclxufVxyXG5cclxubW9kZWxzT2ZUaGVIeWRyb2dlbkF0b20ucmVnaXN0ZXIoICdFbGVjdHJvbkVuZXJneUxldmVsQWNjb3JkaW9uQm94JywgRWxlY3Ryb25FbmVyZ3lMZXZlbEFjY29yZGlvbkJveCApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxVQUFVLE1BQU0sa0NBQWtDO0FBQ3pELE9BQU9DLFNBQVMsTUFBNEIsdUNBQXVDO0FBRW5GLE9BQU9DLFFBQVEsTUFBTSx5Q0FBeUM7QUFDOUQsU0FBaUNDLFNBQVMsRUFBRUMsSUFBSSxRQUFRLG1DQUFtQztBQUMzRixPQUFPQyxZQUFZLE1BQStCLG9DQUFvQztBQUN0RixPQUFPQyxXQUFXLE1BQU0sNkJBQTZCO0FBQ3JELE9BQU9DLHVCQUF1QixNQUFNLGtDQUFrQztBQUN0RSxPQUFPQyw4QkFBOEIsTUFBTSx5Q0FBeUM7O0FBRXBGO0FBQ0EsTUFBTUMsWUFBWSxHQUFHLElBQUlULFVBQVUsQ0FBRSxHQUFHLEVBQUUsR0FBSSxDQUFDO0FBTy9DLGVBQWUsTUFBTVUsK0JBQStCLFNBQVNMLFlBQVksQ0FBQztFQUVqRU0sV0FBV0EsQ0FBRUMsZUFBd0QsRUFBRztJQUU3RSxNQUFNQyxPQUFPLEdBQUdaLFNBQVMsQ0FBMkUsQ0FBQyxDQUFFO01BRXJHO01BQ0FhLElBQUksRUFBRVIsV0FBVyxDQUFDUywyQ0FBMkM7TUFDN0RDLE1BQU0sRUFBRVYsV0FBVyxDQUFDVyw2Q0FBNkM7TUFDakVDLFlBQVksRUFBRSxDQUFDO01BQ2ZDLGFBQWEsRUFBRSxDQUFDO01BQ2hCQyxhQUFhLEVBQUUsQ0FBQztNQUNoQkMsY0FBYyxFQUFFLENBQUM7TUFDakJDLGNBQWMsRUFBRSxDQUFDO01BQ2pCQyxlQUFlLEVBQUUsQ0FBQztNQUNsQkMsMkJBQTJCLEVBQUU7UUFDM0JDLGtCQUFrQixFQUFFLEVBQUU7UUFDdEJDLGtCQUFrQixFQUFFO01BQ3RCLENBQUM7TUFDREMsV0FBVyxFQUFFLE1BQU07TUFDbkJDLFdBQVcsRUFBRSxNQUFNO01BQ25CQyxhQUFhLEVBQUU7SUFDakIsQ0FBQyxFQUFFakIsZUFBZ0IsQ0FBQztJQUVwQkMsT0FBTyxDQUFDaUIsU0FBUyxHQUFHLElBQUkxQixJQUFJLENBQUVJLDhCQUE4QixDQUFDdUIsaUNBQWlDLEVBQUU7TUFDOUZDLElBQUksRUFBRSxJQUFJOUIsUUFBUSxDQUFFO1FBQUUrQixJQUFJLEVBQUUsRUFBRTtRQUFFQyxNQUFNLEVBQUU7TUFBTyxDQUFFLENBQUM7TUFDbERwQixJQUFJLEVBQUVSLFdBQVcsQ0FBQzZCLG9DQUFvQztNQUN0REMsUUFBUSxFQUFFLEdBQUc7TUFBRTtNQUNmQyxNQUFNLEVBQUV4QixPQUFPLENBQUN3QixNQUFNLENBQUNDLFlBQVksQ0FBRSxXQUFZO0lBQ25ELENBQUUsQ0FBQzs7SUFFSDtJQUNBLE1BQU1DLFdBQVcsR0FBRyxJQUFJcEMsU0FBUyxDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUVNLFlBQVksQ0FBQytCLEtBQUssRUFBRS9CLFlBQVksQ0FBQ2dDLE1BQU0sRUFBRTtNQUNoRjNCLElBQUksRUFBRSxPQUFPO01BQ2JFLE1BQU0sRUFBRTtJQUNWLENBQUUsQ0FBQztJQUVILEtBQUssQ0FBRXVCLFdBQVcsRUFBRTFCLE9BQVEsQ0FBQztFQUMvQjtFQUVnQjZCLE9BQU9BLENBQUEsRUFBUztJQUM5QkMsTUFBTSxJQUFJQSxNQUFNLENBQUUsS0FBSyxFQUFFLDhEQUErRCxDQUFDO0lBQ3pGLEtBQUssQ0FBQ0QsT0FBTyxDQUFDLENBQUM7RUFDakI7QUFDRjtBQUVBbkMsdUJBQXVCLENBQUNxQyxRQUFRLENBQUUsaUNBQWlDLEVBQUVsQywrQkFBZ0MsQ0FBQyJ9