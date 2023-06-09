// Copyright 2013-2021, University of Colorado Boulder

/**
 * View for the chamber pool. Chamber pool is a connected pool with two openings on the ground.
 * All the corner angles are 90 degrees.
 *
 * @author Vasily Shakhov (Mlearner)
 * @author Siddhartha Chinthapally (Actual Concepts)
 */

import { Node } from '../../../../scenery/js/imports.js';
import fluidPressureAndFlow from '../../fluidPressureAndFlow.js';
import ChamberPoolBack from './ChamberPoolBack.js';
import ChamberPoolWaterNode from './ChamberPoolWaterNode.js';
import MassNode from './MassNode.js';
import MassStackNode from './MassStackNode.js';
import TrapezoidPoolGrid from './TrapezoidPoolGrid.js';
class ChamberPoolView extends Node {
  /**
   * @param {ChamberPoolModel} chamberPoolModel
   * @param {ModelViewTransform2} modelViewTransform for transforming between model and view co-ordinates
   * @param {Bounds2} dragBounds - bounds for limiting the dragging of mass nodes.
   */
  constructor(chamberPoolModel, modelViewTransform, dragBounds) {
    super();

    // add pool
    this.addChild(new ChamberPoolBack(chamberPoolModel, modelViewTransform));

    // add water
    this.addChild(new ChamberPoolWaterNode(chamberPoolModel, modelViewTransform));

    // add masses
    chamberPoolModel.masses.forEach(massModel => {
      this.addChild(new MassNode(massModel, chamberPoolModel, modelViewTransform, dragBounds));
    });
    // add mass stack
    this.addChild(new MassStackNode(chamberPoolModel, modelViewTransform));

    // pool dimensions in view values
    const poolDimensions = chamberPoolModel.poolDimensions;
    const poolLeftX = poolDimensions.leftChamber.x1;
    const poolTopY = poolDimensions.leftOpening.y1;
    const poolRightX = poolDimensions.rightOpening.x2;
    const poolBottomY = poolDimensions.leftChamber.y2 - 0.3;
    const poolHeight = -poolDimensions.leftChamber.y2;
    const labelXPosition = modelViewTransform.modelToViewX((poolDimensions.leftChamber.x2 + poolDimensions.rightOpening.x1) / 2);

    // add grid
    this.addChild(new TrapezoidPoolGrid(chamberPoolModel.underPressureModel, modelViewTransform, poolLeftX, poolTopY, poolRightX, poolBottomY, poolHeight, labelXPosition, 0));
  }
}
fluidPressureAndFlow.register('ChamberPoolView', ChamberPoolView);
export default ChamberPoolView;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJOb2RlIiwiZmx1aWRQcmVzc3VyZUFuZEZsb3ciLCJDaGFtYmVyUG9vbEJhY2siLCJDaGFtYmVyUG9vbFdhdGVyTm9kZSIsIk1hc3NOb2RlIiwiTWFzc1N0YWNrTm9kZSIsIlRyYXBlem9pZFBvb2xHcmlkIiwiQ2hhbWJlclBvb2xWaWV3IiwiY29uc3RydWN0b3IiLCJjaGFtYmVyUG9vbE1vZGVsIiwibW9kZWxWaWV3VHJhbnNmb3JtIiwiZHJhZ0JvdW5kcyIsImFkZENoaWxkIiwibWFzc2VzIiwiZm9yRWFjaCIsIm1hc3NNb2RlbCIsInBvb2xEaW1lbnNpb25zIiwicG9vbExlZnRYIiwibGVmdENoYW1iZXIiLCJ4MSIsInBvb2xUb3BZIiwibGVmdE9wZW5pbmciLCJ5MSIsInBvb2xSaWdodFgiLCJyaWdodE9wZW5pbmciLCJ4MiIsInBvb2xCb3R0b21ZIiwieTIiLCJwb29sSGVpZ2h0IiwibGFiZWxYUG9zaXRpb24iLCJtb2RlbFRvVmlld1giLCJ1bmRlclByZXNzdXJlTW9kZWwiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkNoYW1iZXJQb29sVmlldy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDIxLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBWaWV3IGZvciB0aGUgY2hhbWJlciBwb29sLiBDaGFtYmVyIHBvb2wgaXMgYSBjb25uZWN0ZWQgcG9vbCB3aXRoIHR3byBvcGVuaW5ncyBvbiB0aGUgZ3JvdW5kLlxyXG4gKiBBbGwgdGhlIGNvcm5lciBhbmdsZXMgYXJlIDkwIGRlZ3JlZXMuXHJcbiAqXHJcbiAqIEBhdXRob3IgVmFzaWx5IFNoYWtob3YgKE1sZWFybmVyKVxyXG4gKiBAYXV0aG9yIFNpZGRoYXJ0aGEgQ2hpbnRoYXBhbGx5IChBY3R1YWwgQ29uY2VwdHMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IHsgTm9kZSB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBmbHVpZFByZXNzdXJlQW5kRmxvdyBmcm9tICcuLi8uLi9mbHVpZFByZXNzdXJlQW5kRmxvdy5qcyc7XHJcbmltcG9ydCBDaGFtYmVyUG9vbEJhY2sgZnJvbSAnLi9DaGFtYmVyUG9vbEJhY2suanMnO1xyXG5pbXBvcnQgQ2hhbWJlclBvb2xXYXRlck5vZGUgZnJvbSAnLi9DaGFtYmVyUG9vbFdhdGVyTm9kZS5qcyc7XHJcbmltcG9ydCBNYXNzTm9kZSBmcm9tICcuL01hc3NOb2RlLmpzJztcclxuaW1wb3J0IE1hc3NTdGFja05vZGUgZnJvbSAnLi9NYXNzU3RhY2tOb2RlLmpzJztcclxuaW1wb3J0IFRyYXBlem9pZFBvb2xHcmlkIGZyb20gJy4vVHJhcGV6b2lkUG9vbEdyaWQuanMnO1xyXG5cclxuY2xhc3MgQ2hhbWJlclBvb2xWaWV3IGV4dGVuZHMgTm9kZSB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7Q2hhbWJlclBvb2xNb2RlbH0gY2hhbWJlclBvb2xNb2RlbFxyXG4gICAqIEBwYXJhbSB7TW9kZWxWaWV3VHJhbnNmb3JtMn0gbW9kZWxWaWV3VHJhbnNmb3JtIGZvciB0cmFuc2Zvcm1pbmcgYmV0d2VlbiBtb2RlbCBhbmQgdmlldyBjby1vcmRpbmF0ZXNcclxuICAgKiBAcGFyYW0ge0JvdW5kczJ9IGRyYWdCb3VuZHMgLSBib3VuZHMgZm9yIGxpbWl0aW5nIHRoZSBkcmFnZ2luZyBvZiBtYXNzIG5vZGVzLlxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBjaGFtYmVyUG9vbE1vZGVsLCBtb2RlbFZpZXdUcmFuc2Zvcm0sIGRyYWdCb3VuZHMgKSB7XHJcblxyXG4gICAgc3VwZXIoKTtcclxuXHJcbiAgICAvLyBhZGQgcG9vbFxyXG4gICAgdGhpcy5hZGRDaGlsZCggbmV3IENoYW1iZXJQb29sQmFjayggY2hhbWJlclBvb2xNb2RlbCwgbW9kZWxWaWV3VHJhbnNmb3JtICkgKTtcclxuXHJcbiAgICAvLyBhZGQgd2F0ZXJcclxuICAgIHRoaXMuYWRkQ2hpbGQoIG5ldyBDaGFtYmVyUG9vbFdhdGVyTm9kZSggY2hhbWJlclBvb2xNb2RlbCwgbW9kZWxWaWV3VHJhbnNmb3JtICkgKTtcclxuXHJcbiAgICAvLyBhZGQgbWFzc2VzXHJcbiAgICBjaGFtYmVyUG9vbE1vZGVsLm1hc3Nlcy5mb3JFYWNoKCBtYXNzTW9kZWwgPT4ge1xyXG4gICAgICB0aGlzLmFkZENoaWxkKCBuZXcgTWFzc05vZGUoIG1hc3NNb2RlbCwgY2hhbWJlclBvb2xNb2RlbCwgbW9kZWxWaWV3VHJhbnNmb3JtLCBkcmFnQm91bmRzICkgKTtcclxuICAgIH0gKTtcclxuICAgIC8vIGFkZCBtYXNzIHN0YWNrXHJcbiAgICB0aGlzLmFkZENoaWxkKCBuZXcgTWFzc1N0YWNrTm9kZSggY2hhbWJlclBvb2xNb2RlbCwgbW9kZWxWaWV3VHJhbnNmb3JtICkgKTtcclxuXHJcbiAgICAvLyBwb29sIGRpbWVuc2lvbnMgaW4gdmlldyB2YWx1ZXNcclxuICAgIGNvbnN0IHBvb2xEaW1lbnNpb25zID0gY2hhbWJlclBvb2xNb2RlbC5wb29sRGltZW5zaW9ucztcclxuXHJcbiAgICBjb25zdCBwb29sTGVmdFggPSBwb29sRGltZW5zaW9ucy5sZWZ0Q2hhbWJlci54MTtcclxuICAgIGNvbnN0IHBvb2xUb3BZID0gcG9vbERpbWVuc2lvbnMubGVmdE9wZW5pbmcueTE7XHJcbiAgICBjb25zdCBwb29sUmlnaHRYID0gcG9vbERpbWVuc2lvbnMucmlnaHRPcGVuaW5nLngyO1xyXG4gICAgY29uc3QgcG9vbEJvdHRvbVkgPSBwb29sRGltZW5zaW9ucy5sZWZ0Q2hhbWJlci55MiAtIDAuMztcclxuICAgIGNvbnN0IHBvb2xIZWlnaHQgPSAtcG9vbERpbWVuc2lvbnMubGVmdENoYW1iZXIueTI7XHJcbiAgICBjb25zdCBsYWJlbFhQb3NpdGlvbiA9IG1vZGVsVmlld1RyYW5zZm9ybS5tb2RlbFRvVmlld1goICggcG9vbERpbWVuc2lvbnMubGVmdENoYW1iZXIueDIgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvb2xEaW1lbnNpb25zLnJpZ2h0T3BlbmluZy54MSApIC8gMiApO1xyXG5cclxuICAgIC8vIGFkZCBncmlkXHJcbiAgICB0aGlzLmFkZENoaWxkKCBuZXcgVHJhcGV6b2lkUG9vbEdyaWQoIGNoYW1iZXJQb29sTW9kZWwudW5kZXJQcmVzc3VyZU1vZGVsLCBtb2RlbFZpZXdUcmFuc2Zvcm0sIHBvb2xMZWZ0WCwgcG9vbFRvcFksXHJcbiAgICAgIHBvb2xSaWdodFgsIHBvb2xCb3R0b21ZLCBwb29sSGVpZ2h0LCBsYWJlbFhQb3NpdGlvbiwgMCApICk7XHJcbiAgfVxyXG59XHJcblxyXG5mbHVpZFByZXNzdXJlQW5kRmxvdy5yZWdpc3RlciggJ0NoYW1iZXJQb29sVmlldycsIENoYW1iZXJQb29sVmlldyApO1xyXG5leHBvcnQgZGVmYXVsdCBDaGFtYmVyUG9vbFZpZXc7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxTQUFTQSxJQUFJLFFBQVEsbUNBQW1DO0FBQ3hELE9BQU9DLG9CQUFvQixNQUFNLCtCQUErQjtBQUNoRSxPQUFPQyxlQUFlLE1BQU0sc0JBQXNCO0FBQ2xELE9BQU9DLG9CQUFvQixNQUFNLDJCQUEyQjtBQUM1RCxPQUFPQyxRQUFRLE1BQU0sZUFBZTtBQUNwQyxPQUFPQyxhQUFhLE1BQU0sb0JBQW9CO0FBQzlDLE9BQU9DLGlCQUFpQixNQUFNLHdCQUF3QjtBQUV0RCxNQUFNQyxlQUFlLFNBQVNQLElBQUksQ0FBQztFQUVqQztBQUNGO0FBQ0E7QUFDQTtBQUNBO0VBQ0VRLFdBQVdBLENBQUVDLGdCQUFnQixFQUFFQyxrQkFBa0IsRUFBRUMsVUFBVSxFQUFHO0lBRTlELEtBQUssQ0FBQyxDQUFDOztJQUVQO0lBQ0EsSUFBSSxDQUFDQyxRQUFRLENBQUUsSUFBSVYsZUFBZSxDQUFFTyxnQkFBZ0IsRUFBRUMsa0JBQW1CLENBQUUsQ0FBQzs7SUFFNUU7SUFDQSxJQUFJLENBQUNFLFFBQVEsQ0FBRSxJQUFJVCxvQkFBb0IsQ0FBRU0sZ0JBQWdCLEVBQUVDLGtCQUFtQixDQUFFLENBQUM7O0lBRWpGO0lBQ0FELGdCQUFnQixDQUFDSSxNQUFNLENBQUNDLE9BQU8sQ0FBRUMsU0FBUyxJQUFJO01BQzVDLElBQUksQ0FBQ0gsUUFBUSxDQUFFLElBQUlSLFFBQVEsQ0FBRVcsU0FBUyxFQUFFTixnQkFBZ0IsRUFBRUMsa0JBQWtCLEVBQUVDLFVBQVcsQ0FBRSxDQUFDO0lBQzlGLENBQUUsQ0FBQztJQUNIO0lBQ0EsSUFBSSxDQUFDQyxRQUFRLENBQUUsSUFBSVAsYUFBYSxDQUFFSSxnQkFBZ0IsRUFBRUMsa0JBQW1CLENBQUUsQ0FBQzs7SUFFMUU7SUFDQSxNQUFNTSxjQUFjLEdBQUdQLGdCQUFnQixDQUFDTyxjQUFjO0lBRXRELE1BQU1DLFNBQVMsR0FBR0QsY0FBYyxDQUFDRSxXQUFXLENBQUNDLEVBQUU7SUFDL0MsTUFBTUMsUUFBUSxHQUFHSixjQUFjLENBQUNLLFdBQVcsQ0FBQ0MsRUFBRTtJQUM5QyxNQUFNQyxVQUFVLEdBQUdQLGNBQWMsQ0FBQ1EsWUFBWSxDQUFDQyxFQUFFO0lBQ2pELE1BQU1DLFdBQVcsR0FBR1YsY0FBYyxDQUFDRSxXQUFXLENBQUNTLEVBQUUsR0FBRyxHQUFHO0lBQ3ZELE1BQU1DLFVBQVUsR0FBRyxDQUFDWixjQUFjLENBQUNFLFdBQVcsQ0FBQ1MsRUFBRTtJQUNqRCxNQUFNRSxjQUFjLEdBQUduQixrQkFBa0IsQ0FBQ29CLFlBQVksQ0FBRSxDQUFFZCxjQUFjLENBQUNFLFdBQVcsQ0FBQ08sRUFBRSxHQUM3QlQsY0FBYyxDQUFDUSxZQUFZLENBQUNMLEVBQUUsSUFBSyxDQUFFLENBQUM7O0lBRWhHO0lBQ0EsSUFBSSxDQUFDUCxRQUFRLENBQUUsSUFBSU4saUJBQWlCLENBQUVHLGdCQUFnQixDQUFDc0Isa0JBQWtCLEVBQUVyQixrQkFBa0IsRUFBRU8sU0FBUyxFQUFFRyxRQUFRLEVBQ2hIRyxVQUFVLEVBQUVHLFdBQVcsRUFBRUUsVUFBVSxFQUFFQyxjQUFjLEVBQUUsQ0FBRSxDQUFFLENBQUM7RUFDOUQ7QUFDRjtBQUVBNUIsb0JBQW9CLENBQUMrQixRQUFRLENBQUUsaUJBQWlCLEVBQUV6QixlQUFnQixDQUFDO0FBQ25FLGVBQWVBLGVBQWUifQ==