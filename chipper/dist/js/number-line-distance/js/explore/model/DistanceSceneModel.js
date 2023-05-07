// Copyright 2020-2022, University of Colorado Boulder

/**
 * Model for the 'Distance' scene
 *
 * @author Saurabh Totey
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import SpatializedNumberLine from '../../../../number-line-common/js/common/model/SpatializedNumberLine.js';
import AbstractNLDBaseModel from '../../common/model/AbstractNLDBaseModel.js';
import NLDConstants from '../../common/NLDConstants.js';
import numberLineDistance from '../../numberLineDistance.js';
import DistancePointController from './DistancePointController.js';

// constants
const TRAPEZOID_OFFSET_FROM_NUMBERLINE = 180;
const TRAPEZOID_HEIGHT = 50;
class DistanceSceneModel extends AbstractNLDBaseModel {
  /**
   * @param {Tandem} tandem
   */
  constructor(tandem) {
    // values empirically determined
    const numberLine = new SpatializedNumberLine(NLDConstants.NLD_LAYOUT_BOUNDS.center.plusXY(0, -75), {
      widthInModelSpace: NLDConstants.NLD_LAYOUT_BOUNDS.width - 250,
      heightInModelSpace: NLDConstants.NLD_LAYOUT_BOUNDS.height - 160,
      labelsInitiallyVisible: true,
      tickMarksInitiallyVisible: true,
      preventOverlap: false
    });

    // values used for placing the sidewalk
    // values empirically determined
    const numberLineMinimumXPosition = numberLine.valueToModelPosition(numberLine.displayedRangeProperty.value.min).x;
    const numberLineMaximumXPosition = numberLine.valueToModelPosition(numberLine.displayedRangeProperty.value.max).x;
    const numberLineY = numberLine.centerPositionProperty.value.y;
    const sidewalkBounds = new Bounds2(numberLineMinimumXPosition - 50, numberLineY + TRAPEZOID_OFFSET_FROM_NUMBERLINE, numberLineMaximumXPosition + 50, numberLineY + TRAPEZOID_OFFSET_FROM_NUMBERLINE + TRAPEZOID_HEIGHT);
    const lockingBounds = sidewalkBounds.withMinY(numberLineY + 125).withMaxY(sidewalkBounds.bottom + 10);

    // Create the model with the point controllers. The point controllers don't lock onto the same y-level for #23.
    // The locking heights and scales are empirically determined and will need to change if the images change.
    super(numberLine, new DistancePointController(numberLine, lockingBounds, TRAPEZOID_OFFSET_FROM_NUMBERLINE + TRAPEZOID_HEIGHT / 2 - 52, 0.3), new DistancePointController(numberLine, lockingBounds, TRAPEZOID_OFFSET_FROM_NUMBERLINE + TRAPEZOID_HEIGHT / 2 - 18, 0.5), tandem);

    // @public (read-only) {Bounds2}
    this.sidewalkBounds = sidewalkBounds;
  }
}
numberLineDistance.register('DistanceSceneModel', DistanceSceneModel);
export default DistanceSceneModel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb3VuZHMyIiwiU3BhdGlhbGl6ZWROdW1iZXJMaW5lIiwiQWJzdHJhY3ROTERCYXNlTW9kZWwiLCJOTERDb25zdGFudHMiLCJudW1iZXJMaW5lRGlzdGFuY2UiLCJEaXN0YW5jZVBvaW50Q29udHJvbGxlciIsIlRSQVBFWk9JRF9PRkZTRVRfRlJPTV9OVU1CRVJMSU5FIiwiVFJBUEVaT0lEX0hFSUdIVCIsIkRpc3RhbmNlU2NlbmVNb2RlbCIsImNvbnN0cnVjdG9yIiwidGFuZGVtIiwibnVtYmVyTGluZSIsIk5MRF9MQVlPVVRfQk9VTkRTIiwiY2VudGVyIiwicGx1c1hZIiwid2lkdGhJbk1vZGVsU3BhY2UiLCJ3aWR0aCIsImhlaWdodEluTW9kZWxTcGFjZSIsImhlaWdodCIsImxhYmVsc0luaXRpYWxseVZpc2libGUiLCJ0aWNrTWFya3NJbml0aWFsbHlWaXNpYmxlIiwicHJldmVudE92ZXJsYXAiLCJudW1iZXJMaW5lTWluaW11bVhQb3NpdGlvbiIsInZhbHVlVG9Nb2RlbFBvc2l0aW9uIiwiZGlzcGxheWVkUmFuZ2VQcm9wZXJ0eSIsInZhbHVlIiwibWluIiwieCIsIm51bWJlckxpbmVNYXhpbXVtWFBvc2l0aW9uIiwibWF4IiwibnVtYmVyTGluZVkiLCJjZW50ZXJQb3NpdGlvblByb3BlcnR5IiwieSIsInNpZGV3YWxrQm91bmRzIiwibG9ja2luZ0JvdW5kcyIsIndpdGhNaW5ZIiwid2l0aE1heFkiLCJib3R0b20iLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkRpc3RhbmNlU2NlbmVNb2RlbC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMC0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBNb2RlbCBmb3IgdGhlICdEaXN0YW5jZScgc2NlbmVcclxuICpcclxuICogQGF1dGhvciBTYXVyYWJoIFRvdGV5XHJcbiAqL1xyXG5cclxuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL0JvdW5kczIuanMnO1xyXG5pbXBvcnQgU3BhdGlhbGl6ZWROdW1iZXJMaW5lIGZyb20gJy4uLy4uLy4uLy4uL251bWJlci1saW5lLWNvbW1vbi9qcy9jb21tb24vbW9kZWwvU3BhdGlhbGl6ZWROdW1iZXJMaW5lLmpzJztcclxuaW1wb3J0IEFic3RyYWN0TkxEQmFzZU1vZGVsIGZyb20gJy4uLy4uL2NvbW1vbi9tb2RlbC9BYnN0cmFjdE5MREJhc2VNb2RlbC5qcyc7XHJcbmltcG9ydCBOTERDb25zdGFudHMgZnJvbSAnLi4vLi4vY29tbW9uL05MRENvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBudW1iZXJMaW5lRGlzdGFuY2UgZnJvbSAnLi4vLi4vbnVtYmVyTGluZURpc3RhbmNlLmpzJztcclxuaW1wb3J0IERpc3RhbmNlUG9pbnRDb250cm9sbGVyIGZyb20gJy4vRGlzdGFuY2VQb2ludENvbnRyb2xsZXIuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IFRSQVBFWk9JRF9PRkZTRVRfRlJPTV9OVU1CRVJMSU5FID0gMTgwO1xyXG5jb25zdCBUUkFQRVpPSURfSEVJR0hUID0gNTA7XHJcblxyXG5jbGFzcyBEaXN0YW5jZVNjZW5lTW9kZWwgZXh0ZW5kcyBBYnN0cmFjdE5MREJhc2VNb2RlbCB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7VGFuZGVtfSB0YW5kZW1cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggdGFuZGVtICkge1xyXG5cclxuICAgIC8vIHZhbHVlcyBlbXBpcmljYWxseSBkZXRlcm1pbmVkXHJcbiAgICBjb25zdCBudW1iZXJMaW5lID0gbmV3IFNwYXRpYWxpemVkTnVtYmVyTGluZSggTkxEQ29uc3RhbnRzLk5MRF9MQVlPVVRfQk9VTkRTLmNlbnRlci5wbHVzWFkoIDAsIC03NSApLCB7XHJcbiAgICAgIHdpZHRoSW5Nb2RlbFNwYWNlOiBOTERDb25zdGFudHMuTkxEX0xBWU9VVF9CT1VORFMud2lkdGggLSAyNTAsXHJcbiAgICAgIGhlaWdodEluTW9kZWxTcGFjZTogTkxEQ29uc3RhbnRzLk5MRF9MQVlPVVRfQk9VTkRTLmhlaWdodCAtIDE2MCxcclxuICAgICAgbGFiZWxzSW5pdGlhbGx5VmlzaWJsZTogdHJ1ZSxcclxuICAgICAgdGlja01hcmtzSW5pdGlhbGx5VmlzaWJsZTogdHJ1ZSxcclxuICAgICAgcHJldmVudE92ZXJsYXA6IGZhbHNlXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gdmFsdWVzIHVzZWQgZm9yIHBsYWNpbmcgdGhlIHNpZGV3YWxrXHJcbiAgICAvLyB2YWx1ZXMgZW1waXJpY2FsbHkgZGV0ZXJtaW5lZFxyXG4gICAgY29uc3QgbnVtYmVyTGluZU1pbmltdW1YUG9zaXRpb24gPSBudW1iZXJMaW5lLnZhbHVlVG9Nb2RlbFBvc2l0aW9uKCBudW1iZXJMaW5lLmRpc3BsYXllZFJhbmdlUHJvcGVydHkudmFsdWUubWluICkueDtcclxuICAgIGNvbnN0IG51bWJlckxpbmVNYXhpbXVtWFBvc2l0aW9uID0gbnVtYmVyTGluZS52YWx1ZVRvTW9kZWxQb3NpdGlvbiggbnVtYmVyTGluZS5kaXNwbGF5ZWRSYW5nZVByb3BlcnR5LnZhbHVlLm1heCApLng7XHJcbiAgICBjb25zdCBudW1iZXJMaW5lWSA9IG51bWJlckxpbmUuY2VudGVyUG9zaXRpb25Qcm9wZXJ0eS52YWx1ZS55O1xyXG4gICAgY29uc3Qgc2lkZXdhbGtCb3VuZHMgPSBuZXcgQm91bmRzMihcclxuICAgICAgbnVtYmVyTGluZU1pbmltdW1YUG9zaXRpb24gLSA1MCxcclxuICAgICAgbnVtYmVyTGluZVkgKyBUUkFQRVpPSURfT0ZGU0VUX0ZST01fTlVNQkVSTElORSxcclxuICAgICAgbnVtYmVyTGluZU1heGltdW1YUG9zaXRpb24gKyA1MCxcclxuICAgICAgbnVtYmVyTGluZVkgKyBUUkFQRVpPSURfT0ZGU0VUX0ZST01fTlVNQkVSTElORSArIFRSQVBFWk9JRF9IRUlHSFRcclxuICAgICk7XHJcbiAgICBjb25zdCBsb2NraW5nQm91bmRzID0gc2lkZXdhbGtCb3VuZHMud2l0aE1pblkoIG51bWJlckxpbmVZICsgMTI1ICkud2l0aE1heFkoIHNpZGV3YWxrQm91bmRzLmJvdHRvbSArIDEwICk7XHJcblxyXG4gICAgLy8gQ3JlYXRlIHRoZSBtb2RlbCB3aXRoIHRoZSBwb2ludCBjb250cm9sbGVycy4gVGhlIHBvaW50IGNvbnRyb2xsZXJzIGRvbid0IGxvY2sgb250byB0aGUgc2FtZSB5LWxldmVsIGZvciAjMjMuXHJcbiAgICAvLyBUaGUgbG9ja2luZyBoZWlnaHRzIGFuZCBzY2FsZXMgYXJlIGVtcGlyaWNhbGx5IGRldGVybWluZWQgYW5kIHdpbGwgbmVlZCB0byBjaGFuZ2UgaWYgdGhlIGltYWdlcyBjaGFuZ2UuXHJcbiAgICBzdXBlcihcclxuICAgICAgbnVtYmVyTGluZSxcclxuICAgICAgbmV3IERpc3RhbmNlUG9pbnRDb250cm9sbGVyKFxyXG4gICAgICAgIG51bWJlckxpbmUsXHJcbiAgICAgICAgbG9ja2luZ0JvdW5kcyxcclxuICAgICAgICBUUkFQRVpPSURfT0ZGU0VUX0ZST01fTlVNQkVSTElORSArIFRSQVBFWk9JRF9IRUlHSFQgLyAyIC0gNTIsXHJcbiAgICAgICAgMC4zXHJcbiAgICAgICksXHJcbiAgICAgIG5ldyBEaXN0YW5jZVBvaW50Q29udHJvbGxlcihcclxuICAgICAgICBudW1iZXJMaW5lLFxyXG4gICAgICAgIGxvY2tpbmdCb3VuZHMsXHJcbiAgICAgICAgVFJBUEVaT0lEX09GRlNFVF9GUk9NX05VTUJFUkxJTkUgKyBUUkFQRVpPSURfSEVJR0hUIC8gMiAtIDE4LFxyXG4gICAgICAgIDAuNVxyXG4gICAgICApLFxyXG4gICAgICB0YW5kZW1cclxuICAgICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAocmVhZC1vbmx5KSB7Qm91bmRzMn1cclxuICAgIHRoaXMuc2lkZXdhbGtCb3VuZHMgPSBzaWRld2Fsa0JvdW5kcztcclxuICB9XHJcbn1cclxuXHJcbm51bWJlckxpbmVEaXN0YW5jZS5yZWdpc3RlciggJ0Rpc3RhbmNlU2NlbmVNb2RlbCcsIERpc3RhbmNlU2NlbmVNb2RlbCApO1xyXG5leHBvcnQgZGVmYXVsdCBEaXN0YW5jZVNjZW5lTW9kZWw7XHJcbiJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxPQUFPLE1BQU0sK0JBQStCO0FBQ25ELE9BQU9DLHFCQUFxQixNQUFNLHlFQUF5RTtBQUMzRyxPQUFPQyxvQkFBb0IsTUFBTSw0Q0FBNEM7QUFDN0UsT0FBT0MsWUFBWSxNQUFNLDhCQUE4QjtBQUN2RCxPQUFPQyxrQkFBa0IsTUFBTSw2QkFBNkI7QUFDNUQsT0FBT0MsdUJBQXVCLE1BQU0sOEJBQThCOztBQUVsRTtBQUNBLE1BQU1DLGdDQUFnQyxHQUFHLEdBQUc7QUFDNUMsTUFBTUMsZ0JBQWdCLEdBQUcsRUFBRTtBQUUzQixNQUFNQyxrQkFBa0IsU0FBU04sb0JBQW9CLENBQUM7RUFFcEQ7QUFDRjtBQUNBO0VBQ0VPLFdBQVdBLENBQUVDLE1BQU0sRUFBRztJQUVwQjtJQUNBLE1BQU1DLFVBQVUsR0FBRyxJQUFJVixxQkFBcUIsQ0FBRUUsWUFBWSxDQUFDUyxpQkFBaUIsQ0FBQ0MsTUFBTSxDQUFDQyxNQUFNLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRyxDQUFDLEVBQUU7TUFDcEdDLGlCQUFpQixFQUFFWixZQUFZLENBQUNTLGlCQUFpQixDQUFDSSxLQUFLLEdBQUcsR0FBRztNQUM3REMsa0JBQWtCLEVBQUVkLFlBQVksQ0FBQ1MsaUJBQWlCLENBQUNNLE1BQU0sR0FBRyxHQUFHO01BQy9EQyxzQkFBc0IsRUFBRSxJQUFJO01BQzVCQyx5QkFBeUIsRUFBRSxJQUFJO01BQy9CQyxjQUFjLEVBQUU7SUFDbEIsQ0FBRSxDQUFDOztJQUVIO0lBQ0E7SUFDQSxNQUFNQywwQkFBMEIsR0FBR1gsVUFBVSxDQUFDWSxvQkFBb0IsQ0FBRVosVUFBVSxDQUFDYSxzQkFBc0IsQ0FBQ0MsS0FBSyxDQUFDQyxHQUFJLENBQUMsQ0FBQ0MsQ0FBQztJQUNuSCxNQUFNQywwQkFBMEIsR0FBR2pCLFVBQVUsQ0FBQ1ksb0JBQW9CLENBQUVaLFVBQVUsQ0FBQ2Esc0JBQXNCLENBQUNDLEtBQUssQ0FBQ0ksR0FBSSxDQUFDLENBQUNGLENBQUM7SUFDbkgsTUFBTUcsV0FBVyxHQUFHbkIsVUFBVSxDQUFDb0Isc0JBQXNCLENBQUNOLEtBQUssQ0FBQ08sQ0FBQztJQUM3RCxNQUFNQyxjQUFjLEdBQUcsSUFBSWpDLE9BQU8sQ0FDaENzQiwwQkFBMEIsR0FBRyxFQUFFLEVBQy9CUSxXQUFXLEdBQUd4QixnQ0FBZ0MsRUFDOUNzQiwwQkFBMEIsR0FBRyxFQUFFLEVBQy9CRSxXQUFXLEdBQUd4QixnQ0FBZ0MsR0FBR0MsZ0JBQ25ELENBQUM7SUFDRCxNQUFNMkIsYUFBYSxHQUFHRCxjQUFjLENBQUNFLFFBQVEsQ0FBRUwsV0FBVyxHQUFHLEdBQUksQ0FBQyxDQUFDTSxRQUFRLENBQUVILGNBQWMsQ0FBQ0ksTUFBTSxHQUFHLEVBQUcsQ0FBQzs7SUFFekc7SUFDQTtJQUNBLEtBQUssQ0FDSDFCLFVBQVUsRUFDVixJQUFJTix1QkFBdUIsQ0FDekJNLFVBQVUsRUFDVnVCLGFBQWEsRUFDYjVCLGdDQUFnQyxHQUFHQyxnQkFBZ0IsR0FBRyxDQUFDLEdBQUcsRUFBRSxFQUM1RCxHQUNGLENBQUMsRUFDRCxJQUFJRix1QkFBdUIsQ0FDekJNLFVBQVUsRUFDVnVCLGFBQWEsRUFDYjVCLGdDQUFnQyxHQUFHQyxnQkFBZ0IsR0FBRyxDQUFDLEdBQUcsRUFBRSxFQUM1RCxHQUNGLENBQUMsRUFDREcsTUFDRixDQUFDOztJQUVEO0lBQ0EsSUFBSSxDQUFDdUIsY0FBYyxHQUFHQSxjQUFjO0VBQ3RDO0FBQ0Y7QUFFQTdCLGtCQUFrQixDQUFDa0MsUUFBUSxDQUFFLG9CQUFvQixFQUFFOUIsa0JBQW1CLENBQUM7QUFDdkUsZUFBZUEsa0JBQWtCIn0=