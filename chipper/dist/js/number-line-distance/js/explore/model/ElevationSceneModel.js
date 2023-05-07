// Copyright 2020-2022, University of Colorado Boulder

/**
 * Model for the 'Elevation' scene
 *
 * @author Saurabh Totey
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import Range from '../../../../dot/js/Range.js';
import SpatializedNumberLine from '../../../../number-line-common/js/common/model/SpatializedNumberLine.js';
import Orientation from '../../../../phet-core/js/Orientation.js';
import AbstractNLDBaseModel from '../../common/model/AbstractNLDBaseModel.js';
import NLDConstants from '../../common/NLDConstants.js';
import numberLineDistance from '../../numberLineDistance.js';
import AreaPointController from './AreaPointController.js';
import DropFromDirection from './DropFromDirection.js';
class ElevationSceneModel extends AbstractNLDBaseModel {
  /**
   * @param {Tandem} tandem
   */
  constructor(tandem) {
    const numberLine = new SpatializedNumberLine(NLDConstants.NLD_LAYOUT_BOUNDS.center.plusXY(-310, 20), {
      widthInModelSpace: NLDConstants.NLD_LAYOUT_BOUNDS.width - 100,
      heightInModelSpace: NLDConstants.NLD_LAYOUT_BOUNDS.height - 275,
      initialOrientation: Orientation.VERTICAL,
      initialDisplayedRange: new Range(-20, 20),
      labelsInitiallyVisible: true,
      tickMarksInitiallyVisible: true,
      preventOverlap: false
    });
    const elevationAreaBounds = new Bounds2(300, numberLine.valueToModelPosition(numberLine.displayedRangeProperty.value.max).y, 750, numberLine.valueToModelPosition(numberLine.displayedRangeProperty.value.min).y);
    super(numberLine, new AreaPointController(DropFromDirection.LEFT, elevationAreaBounds, {
      numberLines: [numberLine],
      color: 'black'
    }), new AreaPointController(DropFromDirection.LEFT, elevationAreaBounds, {
      numberLines: [numberLine],
      color: '#446ab7'
    }), tandem);

    // @public (read-only) {Bounds2} the bounds where point controllers can be
    this.elevationAreaBounds = elevationAreaBounds;
  }
}
numberLineDistance.register('ElevationSceneModel', ElevationSceneModel);
export default ElevationSceneModel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb3VuZHMyIiwiUmFuZ2UiLCJTcGF0aWFsaXplZE51bWJlckxpbmUiLCJPcmllbnRhdGlvbiIsIkFic3RyYWN0TkxEQmFzZU1vZGVsIiwiTkxEQ29uc3RhbnRzIiwibnVtYmVyTGluZURpc3RhbmNlIiwiQXJlYVBvaW50Q29udHJvbGxlciIsIkRyb3BGcm9tRGlyZWN0aW9uIiwiRWxldmF0aW9uU2NlbmVNb2RlbCIsImNvbnN0cnVjdG9yIiwidGFuZGVtIiwibnVtYmVyTGluZSIsIk5MRF9MQVlPVVRfQk9VTkRTIiwiY2VudGVyIiwicGx1c1hZIiwid2lkdGhJbk1vZGVsU3BhY2UiLCJ3aWR0aCIsImhlaWdodEluTW9kZWxTcGFjZSIsImhlaWdodCIsImluaXRpYWxPcmllbnRhdGlvbiIsIlZFUlRJQ0FMIiwiaW5pdGlhbERpc3BsYXllZFJhbmdlIiwibGFiZWxzSW5pdGlhbGx5VmlzaWJsZSIsInRpY2tNYXJrc0luaXRpYWxseVZpc2libGUiLCJwcmV2ZW50T3ZlcmxhcCIsImVsZXZhdGlvbkFyZWFCb3VuZHMiLCJ2YWx1ZVRvTW9kZWxQb3NpdGlvbiIsImRpc3BsYXllZFJhbmdlUHJvcGVydHkiLCJ2YWx1ZSIsIm1heCIsInkiLCJtaW4iLCJMRUZUIiwibnVtYmVyTGluZXMiLCJjb2xvciIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiRWxldmF0aW9uU2NlbmVNb2RlbC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMC0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBNb2RlbCBmb3IgdGhlICdFbGV2YXRpb24nIHNjZW5lXHJcbiAqXHJcbiAqIEBhdXRob3IgU2F1cmFiaCBUb3RleVxyXG4gKi9cclxuXHJcbmltcG9ydCBCb3VuZHMyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9Cb3VuZHMyLmpzJztcclxuaW1wb3J0IFJhbmdlIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9SYW5nZS5qcyc7XHJcbmltcG9ydCBTcGF0aWFsaXplZE51bWJlckxpbmUgZnJvbSAnLi4vLi4vLi4vLi4vbnVtYmVyLWxpbmUtY29tbW9uL2pzL2NvbW1vbi9tb2RlbC9TcGF0aWFsaXplZE51bWJlckxpbmUuanMnO1xyXG5pbXBvcnQgT3JpZW50YXRpb24gZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL09yaWVudGF0aW9uLmpzJztcclxuaW1wb3J0IEFic3RyYWN0TkxEQmFzZU1vZGVsIGZyb20gJy4uLy4uL2NvbW1vbi9tb2RlbC9BYnN0cmFjdE5MREJhc2VNb2RlbC5qcyc7XHJcbmltcG9ydCBOTERDb25zdGFudHMgZnJvbSAnLi4vLi4vY29tbW9uL05MRENvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBudW1iZXJMaW5lRGlzdGFuY2UgZnJvbSAnLi4vLi4vbnVtYmVyTGluZURpc3RhbmNlLmpzJztcclxuaW1wb3J0IEFyZWFQb2ludENvbnRyb2xsZXIgZnJvbSAnLi9BcmVhUG9pbnRDb250cm9sbGVyLmpzJztcclxuaW1wb3J0IERyb3BGcm9tRGlyZWN0aW9uIGZyb20gJy4vRHJvcEZyb21EaXJlY3Rpb24uanMnO1xyXG5cclxuY2xhc3MgRWxldmF0aW9uU2NlbmVNb2RlbCBleHRlbmRzIEFic3RyYWN0TkxEQmFzZU1vZGVsIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtUYW5kZW19IHRhbmRlbVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCB0YW5kZW0gKSB7XHJcbiAgICBjb25zdCBudW1iZXJMaW5lID0gbmV3IFNwYXRpYWxpemVkTnVtYmVyTGluZSggTkxEQ29uc3RhbnRzLk5MRF9MQVlPVVRfQk9VTkRTLmNlbnRlci5wbHVzWFkoIC0zMTAsIDIwICksIHtcclxuICAgICAgd2lkdGhJbk1vZGVsU3BhY2U6IE5MRENvbnN0YW50cy5OTERfTEFZT1VUX0JPVU5EUy53aWR0aCAtIDEwMCxcclxuICAgICAgaGVpZ2h0SW5Nb2RlbFNwYWNlOiBOTERDb25zdGFudHMuTkxEX0xBWU9VVF9CT1VORFMuaGVpZ2h0IC0gMjc1LFxyXG4gICAgICBpbml0aWFsT3JpZW50YXRpb246IE9yaWVudGF0aW9uLlZFUlRJQ0FMLFxyXG4gICAgICBpbml0aWFsRGlzcGxheWVkUmFuZ2U6IG5ldyBSYW5nZSggLTIwLCAyMCApLFxyXG4gICAgICBsYWJlbHNJbml0aWFsbHlWaXNpYmxlOiB0cnVlLFxyXG4gICAgICB0aWNrTWFya3NJbml0aWFsbHlWaXNpYmxlOiB0cnVlLFxyXG4gICAgICBwcmV2ZW50T3ZlcmxhcDogZmFsc2VcclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCBlbGV2YXRpb25BcmVhQm91bmRzID0gbmV3IEJvdW5kczIoXHJcbiAgICAgIDMwMCwgbnVtYmVyTGluZS52YWx1ZVRvTW9kZWxQb3NpdGlvbiggbnVtYmVyTGluZS5kaXNwbGF5ZWRSYW5nZVByb3BlcnR5LnZhbHVlLm1heCApLnksXHJcbiAgICAgIDc1MCwgbnVtYmVyTGluZS52YWx1ZVRvTW9kZWxQb3NpdGlvbiggbnVtYmVyTGluZS5kaXNwbGF5ZWRSYW5nZVByb3BlcnR5LnZhbHVlLm1pbiApLnlcclxuICAgICk7XHJcblxyXG4gICAgc3VwZXIoXHJcbiAgICAgIG51bWJlckxpbmUsXHJcbiAgICAgIG5ldyBBcmVhUG9pbnRDb250cm9sbGVyKCBEcm9wRnJvbURpcmVjdGlvbi5MRUZULCBlbGV2YXRpb25BcmVhQm91bmRzLCB7XHJcbiAgICAgICAgbnVtYmVyTGluZXM6IFsgbnVtYmVyTGluZSBdLFxyXG4gICAgICAgIGNvbG9yOiAnYmxhY2snXHJcbiAgICAgIH0gKSxcclxuICAgICAgbmV3IEFyZWFQb2ludENvbnRyb2xsZXIoIERyb3BGcm9tRGlyZWN0aW9uLkxFRlQsIGVsZXZhdGlvbkFyZWFCb3VuZHMsIHtcclxuICAgICAgICBudW1iZXJMaW5lczogWyBudW1iZXJMaW5lIF0sXHJcbiAgICAgICAgY29sb3I6ICcjNDQ2YWI3J1xyXG4gICAgICB9ICksXHJcbiAgICAgIHRhbmRlbVxyXG4gICAgKTtcclxuXHJcbiAgICAvLyBAcHVibGljIChyZWFkLW9ubHkpIHtCb3VuZHMyfSB0aGUgYm91bmRzIHdoZXJlIHBvaW50IGNvbnRyb2xsZXJzIGNhbiBiZVxyXG4gICAgdGhpcy5lbGV2YXRpb25BcmVhQm91bmRzID0gZWxldmF0aW9uQXJlYUJvdW5kcztcclxuICB9XHJcblxyXG59XHJcblxyXG5udW1iZXJMaW5lRGlzdGFuY2UucmVnaXN0ZXIoICdFbGV2YXRpb25TY2VuZU1vZGVsJywgRWxldmF0aW9uU2NlbmVNb2RlbCApO1xyXG5leHBvcnQgZGVmYXVsdCBFbGV2YXRpb25TY2VuZU1vZGVsO1xyXG4iXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsT0FBTyxNQUFNLCtCQUErQjtBQUNuRCxPQUFPQyxLQUFLLE1BQU0sNkJBQTZCO0FBQy9DLE9BQU9DLHFCQUFxQixNQUFNLHlFQUF5RTtBQUMzRyxPQUFPQyxXQUFXLE1BQU0seUNBQXlDO0FBQ2pFLE9BQU9DLG9CQUFvQixNQUFNLDRDQUE0QztBQUM3RSxPQUFPQyxZQUFZLE1BQU0sOEJBQThCO0FBQ3ZELE9BQU9DLGtCQUFrQixNQUFNLDZCQUE2QjtBQUM1RCxPQUFPQyxtQkFBbUIsTUFBTSwwQkFBMEI7QUFDMUQsT0FBT0MsaUJBQWlCLE1BQU0sd0JBQXdCO0FBRXRELE1BQU1DLG1CQUFtQixTQUFTTCxvQkFBb0IsQ0FBQztFQUVyRDtBQUNGO0FBQ0E7RUFDRU0sV0FBV0EsQ0FBRUMsTUFBTSxFQUFHO0lBQ3BCLE1BQU1DLFVBQVUsR0FBRyxJQUFJVixxQkFBcUIsQ0FBRUcsWUFBWSxDQUFDUSxpQkFBaUIsQ0FBQ0MsTUFBTSxDQUFDQyxNQUFNLENBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRyxDQUFDLEVBQUU7TUFDdEdDLGlCQUFpQixFQUFFWCxZQUFZLENBQUNRLGlCQUFpQixDQUFDSSxLQUFLLEdBQUcsR0FBRztNQUM3REMsa0JBQWtCLEVBQUViLFlBQVksQ0FBQ1EsaUJBQWlCLENBQUNNLE1BQU0sR0FBRyxHQUFHO01BQy9EQyxrQkFBa0IsRUFBRWpCLFdBQVcsQ0FBQ2tCLFFBQVE7TUFDeENDLHFCQUFxQixFQUFFLElBQUlyQixLQUFLLENBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRyxDQUFDO01BQzNDc0Isc0JBQXNCLEVBQUUsSUFBSTtNQUM1QkMseUJBQXlCLEVBQUUsSUFBSTtNQUMvQkMsY0FBYyxFQUFFO0lBQ2xCLENBQUUsQ0FBQztJQUVILE1BQU1DLG1CQUFtQixHQUFHLElBQUkxQixPQUFPLENBQ3JDLEdBQUcsRUFBRVksVUFBVSxDQUFDZSxvQkFBb0IsQ0FBRWYsVUFBVSxDQUFDZ0Isc0JBQXNCLENBQUNDLEtBQUssQ0FBQ0MsR0FBSSxDQUFDLENBQUNDLENBQUMsRUFDckYsR0FBRyxFQUFFbkIsVUFBVSxDQUFDZSxvQkFBb0IsQ0FBRWYsVUFBVSxDQUFDZ0Isc0JBQXNCLENBQUNDLEtBQUssQ0FBQ0csR0FBSSxDQUFDLENBQUNELENBQ3RGLENBQUM7SUFFRCxLQUFLLENBQ0huQixVQUFVLEVBQ1YsSUFBSUwsbUJBQW1CLENBQUVDLGlCQUFpQixDQUFDeUIsSUFBSSxFQUFFUCxtQkFBbUIsRUFBRTtNQUNwRVEsV0FBVyxFQUFFLENBQUV0QixVQUFVLENBQUU7TUFDM0J1QixLQUFLLEVBQUU7SUFDVCxDQUFFLENBQUMsRUFDSCxJQUFJNUIsbUJBQW1CLENBQUVDLGlCQUFpQixDQUFDeUIsSUFBSSxFQUFFUCxtQkFBbUIsRUFBRTtNQUNwRVEsV0FBVyxFQUFFLENBQUV0QixVQUFVLENBQUU7TUFDM0J1QixLQUFLLEVBQUU7SUFDVCxDQUFFLENBQUMsRUFDSHhCLE1BQ0YsQ0FBQzs7SUFFRDtJQUNBLElBQUksQ0FBQ2UsbUJBQW1CLEdBQUdBLG1CQUFtQjtFQUNoRDtBQUVGO0FBRUFwQixrQkFBa0IsQ0FBQzhCLFFBQVEsQ0FBRSxxQkFBcUIsRUFBRTNCLG1CQUFvQixDQUFDO0FBQ3pFLGVBQWVBLG1CQUFtQiJ9