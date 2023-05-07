// Copyright 2019-2023, University of Colorado Boulder

/**
 * Model for a single graph on the 'Explore 2D' screen. 'Explore 2D' has a total of 2 graphs (polar and Cartesian).
 *
 * Characteristics of a Explore 2D Graph (which extends Graph) are:
 *  - Explore 2D graphs have exactly 1 vector sets each
 *  - Has its own sum visible property respectively
 *  - Two-dimensional
 *  - Has a color palette for the vectors on the graph
 *
 * @author Brandon Li
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import CoordinateSnapModes from '../../common/model/CoordinateSnapModes.js';
import Graph from '../../common/model/Graph.js';
import VectorColorPalette from '../../common/model/VectorColorPalette.js';
import VectorSet from '../../common/model/VectorSet.js';
import VectorAdditionConstants from '../../common/VectorAdditionConstants.js';
import vectorAddition from '../../vectorAddition.js';
export default class Explore2DGraph extends Graph {
  /**
   * @param {CoordinateSnapModes} coordinateSnapMode - coordinateSnapMode for the graph
   * @param {EnumerationProperty.<ComponentVectorStyles>} componentStyleProperty
   * @param {BooleanProperty} sumVisibleProperty
   * @param {VectorColorPalette} vectorColorPalette - color palette for vectors on the graph
   */
  constructor(coordinateSnapMode, componentStyleProperty, sumVisibleProperty, vectorColorPalette) {
    assert && assert(CoordinateSnapModes.enumeration.includes(coordinateSnapMode), `invalid coordinateSnapMode: ${coordinateSnapMode}`);
    assert && assert(componentStyleProperty instanceof EnumerationProperty, `invalid componentStyleProperty: ${componentStyleProperty}`);
    assert && assert(sumVisibleProperty instanceof BooleanProperty, `invalid sumVisibleProperty: ${sumVisibleProperty}`);
    assert && assert(vectorColorPalette instanceof VectorColorPalette, `invalid vectorColorPalette: ${vectorColorPalette}`);
    super(VectorAdditionConstants.DEFAULT_GRAPH_BOUNDS, coordinateSnapMode);

    // @public (read-only) {VectorSet} vectorSet - Graphs on 'Explore 2D' have exactly one vector set
    this.vectorSet = new VectorSet(this, componentStyleProperty, sumVisibleProperty, vectorColorPalette);

    // Add the one and only vector set
    this.vectorSets.push(this.vectorSet);
  }
}
vectorAddition.register('Explore2DGraph', Explore2DGraph);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJFbnVtZXJhdGlvblByb3BlcnR5IiwiQ29vcmRpbmF0ZVNuYXBNb2RlcyIsIkdyYXBoIiwiVmVjdG9yQ29sb3JQYWxldHRlIiwiVmVjdG9yU2V0IiwiVmVjdG9yQWRkaXRpb25Db25zdGFudHMiLCJ2ZWN0b3JBZGRpdGlvbiIsIkV4cGxvcmUyREdyYXBoIiwiY29uc3RydWN0b3IiLCJjb29yZGluYXRlU25hcE1vZGUiLCJjb21wb25lbnRTdHlsZVByb3BlcnR5Iiwic3VtVmlzaWJsZVByb3BlcnR5IiwidmVjdG9yQ29sb3JQYWxldHRlIiwiYXNzZXJ0IiwiZW51bWVyYXRpb24iLCJpbmNsdWRlcyIsIkRFRkFVTFRfR1JBUEhfQk9VTkRTIiwidmVjdG9yU2V0IiwidmVjdG9yU2V0cyIsInB1c2giLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkV4cGxvcmUyREdyYXBoLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE5LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIE1vZGVsIGZvciBhIHNpbmdsZSBncmFwaCBvbiB0aGUgJ0V4cGxvcmUgMkQnIHNjcmVlbi4gJ0V4cGxvcmUgMkQnIGhhcyBhIHRvdGFsIG9mIDIgZ3JhcGhzIChwb2xhciBhbmQgQ2FydGVzaWFuKS5cclxuICpcclxuICogQ2hhcmFjdGVyaXN0aWNzIG9mIGEgRXhwbG9yZSAyRCBHcmFwaCAod2hpY2ggZXh0ZW5kcyBHcmFwaCkgYXJlOlxyXG4gKiAgLSBFeHBsb3JlIDJEIGdyYXBocyBoYXZlIGV4YWN0bHkgMSB2ZWN0b3Igc2V0cyBlYWNoXHJcbiAqICAtIEhhcyBpdHMgb3duIHN1bSB2aXNpYmxlIHByb3BlcnR5IHJlc3BlY3RpdmVseVxyXG4gKiAgLSBUd28tZGltZW5zaW9uYWxcclxuICogIC0gSGFzIGEgY29sb3IgcGFsZXR0ZSBmb3IgdGhlIHZlY3RvcnMgb24gdGhlIGdyYXBoXHJcbiAqXHJcbiAqIEBhdXRob3IgQnJhbmRvbiBMaVxyXG4gKi9cclxuXHJcbmltcG9ydCBCb29sZWFuUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Cb29sZWFuUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgRW51bWVyYXRpb25Qcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0VudW1lcmF0aW9uUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgQ29vcmRpbmF0ZVNuYXBNb2RlcyBmcm9tICcuLi8uLi9jb21tb24vbW9kZWwvQ29vcmRpbmF0ZVNuYXBNb2Rlcy5qcyc7XHJcbmltcG9ydCBHcmFwaCBmcm9tICcuLi8uLi9jb21tb24vbW9kZWwvR3JhcGguanMnO1xyXG5pbXBvcnQgVmVjdG9yQ29sb3JQYWxldHRlIGZyb20gJy4uLy4uL2NvbW1vbi9tb2RlbC9WZWN0b3JDb2xvclBhbGV0dGUuanMnO1xyXG5pbXBvcnQgVmVjdG9yU2V0IGZyb20gJy4uLy4uL2NvbW1vbi9tb2RlbC9WZWN0b3JTZXQuanMnO1xyXG5pbXBvcnQgVmVjdG9yQWRkaXRpb25Db25zdGFudHMgZnJvbSAnLi4vLi4vY29tbW9uL1ZlY3RvckFkZGl0aW9uQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IHZlY3RvckFkZGl0aW9uIGZyb20gJy4uLy4uL3ZlY3RvckFkZGl0aW9uLmpzJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEV4cGxvcmUyREdyYXBoIGV4dGVuZHMgR3JhcGgge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge0Nvb3JkaW5hdGVTbmFwTW9kZXN9IGNvb3JkaW5hdGVTbmFwTW9kZSAtIGNvb3JkaW5hdGVTbmFwTW9kZSBmb3IgdGhlIGdyYXBoXHJcbiAgICogQHBhcmFtIHtFbnVtZXJhdGlvblByb3BlcnR5LjxDb21wb25lbnRWZWN0b3JTdHlsZXM+fSBjb21wb25lbnRTdHlsZVByb3BlcnR5XHJcbiAgICogQHBhcmFtIHtCb29sZWFuUHJvcGVydHl9IHN1bVZpc2libGVQcm9wZXJ0eVxyXG4gICAqIEBwYXJhbSB7VmVjdG9yQ29sb3JQYWxldHRlfSB2ZWN0b3JDb2xvclBhbGV0dGUgLSBjb2xvciBwYWxldHRlIGZvciB2ZWN0b3JzIG9uIHRoZSBncmFwaFxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBjb29yZGluYXRlU25hcE1vZGUsIGNvbXBvbmVudFN0eWxlUHJvcGVydHksIHN1bVZpc2libGVQcm9wZXJ0eSwgdmVjdG9yQ29sb3JQYWxldHRlICkge1xyXG5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIENvb3JkaW5hdGVTbmFwTW9kZXMuZW51bWVyYXRpb24uaW5jbHVkZXMoIGNvb3JkaW5hdGVTbmFwTW9kZSApLCBgaW52YWxpZCBjb29yZGluYXRlU25hcE1vZGU6ICR7Y29vcmRpbmF0ZVNuYXBNb2RlfWAgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIGNvbXBvbmVudFN0eWxlUHJvcGVydHkgaW5zdGFuY2VvZiBFbnVtZXJhdGlvblByb3BlcnR5LCBgaW52YWxpZCBjb21wb25lbnRTdHlsZVByb3BlcnR5OiAke2NvbXBvbmVudFN0eWxlUHJvcGVydHl9YCApO1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggc3VtVmlzaWJsZVByb3BlcnR5IGluc3RhbmNlb2YgQm9vbGVhblByb3BlcnR5LCBgaW52YWxpZCBzdW1WaXNpYmxlUHJvcGVydHk6ICR7c3VtVmlzaWJsZVByb3BlcnR5fWAgKTtcclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHZlY3RvckNvbG9yUGFsZXR0ZSBpbnN0YW5jZW9mIFZlY3RvckNvbG9yUGFsZXR0ZSwgYGludmFsaWQgdmVjdG9yQ29sb3JQYWxldHRlOiAke3ZlY3RvckNvbG9yUGFsZXR0ZX1gICk7XHJcblxyXG4gICAgc3VwZXIoIFZlY3RvckFkZGl0aW9uQ29uc3RhbnRzLkRFRkFVTFRfR1JBUEhfQk9VTkRTLCBjb29yZGluYXRlU25hcE1vZGUgKTtcclxuXHJcbiAgICAvLyBAcHVibGljIChyZWFkLW9ubHkpIHtWZWN0b3JTZXR9IHZlY3RvclNldCAtIEdyYXBocyBvbiAnRXhwbG9yZSAyRCcgaGF2ZSBleGFjdGx5IG9uZSB2ZWN0b3Igc2V0XHJcbiAgICB0aGlzLnZlY3RvclNldCA9IG5ldyBWZWN0b3JTZXQoIHRoaXMsIGNvbXBvbmVudFN0eWxlUHJvcGVydHksIHN1bVZpc2libGVQcm9wZXJ0eSwgdmVjdG9yQ29sb3JQYWxldHRlICk7XHJcblxyXG4gICAgLy8gQWRkIHRoZSBvbmUgYW5kIG9ubHkgdmVjdG9yIHNldFxyXG4gICAgdGhpcy52ZWN0b3JTZXRzLnB1c2goIHRoaXMudmVjdG9yU2V0ICk7XHJcbiAgfVxyXG59XHJcblxyXG52ZWN0b3JBZGRpdGlvbi5yZWdpc3RlciggJ0V4cGxvcmUyREdyYXBoJywgRXhwbG9yZTJER3JhcGggKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsZUFBZSxNQUFNLHdDQUF3QztBQUNwRSxPQUFPQyxtQkFBbUIsTUFBTSw0Q0FBNEM7QUFDNUUsT0FBT0MsbUJBQW1CLE1BQU0sMkNBQTJDO0FBQzNFLE9BQU9DLEtBQUssTUFBTSw2QkFBNkI7QUFDL0MsT0FBT0Msa0JBQWtCLE1BQU0sMENBQTBDO0FBQ3pFLE9BQU9DLFNBQVMsTUFBTSxpQ0FBaUM7QUFDdkQsT0FBT0MsdUJBQXVCLE1BQU0seUNBQXlDO0FBQzdFLE9BQU9DLGNBQWMsTUFBTSx5QkFBeUI7QUFFcEQsZUFBZSxNQUFNQyxjQUFjLFNBQVNMLEtBQUssQ0FBQztFQUVoRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRU0sV0FBV0EsQ0FBRUMsa0JBQWtCLEVBQUVDLHNCQUFzQixFQUFFQyxrQkFBa0IsRUFBRUMsa0JBQWtCLEVBQUc7SUFFaEdDLE1BQU0sSUFBSUEsTUFBTSxDQUFFWixtQkFBbUIsQ0FBQ2EsV0FBVyxDQUFDQyxRQUFRLENBQUVOLGtCQUFtQixDQUFDLEVBQUcsK0JBQThCQSxrQkFBbUIsRUFBRSxDQUFDO0lBQ3ZJSSxNQUFNLElBQUlBLE1BQU0sQ0FBRUgsc0JBQXNCLFlBQVlWLG1CQUFtQixFQUFHLG1DQUFrQ1Usc0JBQXVCLEVBQUUsQ0FBQztJQUN0SUcsTUFBTSxJQUFJQSxNQUFNLENBQUVGLGtCQUFrQixZQUFZWixlQUFlLEVBQUcsK0JBQThCWSxrQkFBbUIsRUFBRSxDQUFDO0lBQ3RIRSxNQUFNLElBQUlBLE1BQU0sQ0FBRUQsa0JBQWtCLFlBQVlULGtCQUFrQixFQUFHLCtCQUE4QlMsa0JBQW1CLEVBQUUsQ0FBQztJQUV6SCxLQUFLLENBQUVQLHVCQUF1QixDQUFDVyxvQkFBb0IsRUFBRVAsa0JBQW1CLENBQUM7O0lBRXpFO0lBQ0EsSUFBSSxDQUFDUSxTQUFTLEdBQUcsSUFBSWIsU0FBUyxDQUFFLElBQUksRUFBRU0sc0JBQXNCLEVBQUVDLGtCQUFrQixFQUFFQyxrQkFBbUIsQ0FBQzs7SUFFdEc7SUFDQSxJQUFJLENBQUNNLFVBQVUsQ0FBQ0MsSUFBSSxDQUFFLElBQUksQ0FBQ0YsU0FBVSxDQUFDO0VBQ3hDO0FBQ0Y7QUFFQVgsY0FBYyxDQUFDYyxRQUFRLENBQUUsZ0JBQWdCLEVBQUViLGNBQWUsQ0FBQyJ9