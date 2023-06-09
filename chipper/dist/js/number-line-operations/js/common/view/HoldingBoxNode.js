// Copyright 2020-2021, University of Colorado Boulder

/**
 * HoldingBoxNode is the view representation of a box (i.e. a rectangle) where ValueItem instances are stored when not
 * in use.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import { Rectangle } from '../../../../scenery/js/imports.js';
import numberLineOperations from '../../numberLineOperations.js';

// constants
const CORNER_RADIUS = 7;
class HoldingBoxNode extends Rectangle {
  /**
   * @param {HoldingBox} holdingBox - model of the storage box
   */
  constructor(holdingBox) {
    super(holdingBox.rectangleBounds.minX, holdingBox.rectangleBounds.minY, holdingBox.rectangleBounds.width, holdingBox.rectangleBounds.height, CORNER_RADIUS, CORNER_RADIUS, {
      fill: 'white',
      stroke: 'black'
    });
  }
}
numberLineOperations.register('HoldingBoxNode', HoldingBoxNode);
export default HoldingBoxNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSZWN0YW5nbGUiLCJudW1iZXJMaW5lT3BlcmF0aW9ucyIsIkNPUk5FUl9SQURJVVMiLCJIb2xkaW5nQm94Tm9kZSIsImNvbnN0cnVjdG9yIiwiaG9sZGluZ0JveCIsInJlY3RhbmdsZUJvdW5kcyIsIm1pblgiLCJtaW5ZIiwid2lkdGgiLCJoZWlnaHQiLCJmaWxsIiwic3Ryb2tlIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJIb2xkaW5nQm94Tm9kZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMC0yMDIxLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBIb2xkaW5nQm94Tm9kZSBpcyB0aGUgdmlldyByZXByZXNlbnRhdGlvbiBvZiBhIGJveCAoaS5lLiBhIHJlY3RhbmdsZSkgd2hlcmUgVmFsdWVJdGVtIGluc3RhbmNlcyBhcmUgc3RvcmVkIHdoZW4gbm90XHJcbiAqIGluIHVzZS5cclxuICpcclxuICogQGF1dGhvciBKb2huIEJsYW5jbyAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgeyBSZWN0YW5nbGUgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgbnVtYmVyTGluZU9wZXJhdGlvbnMgZnJvbSAnLi4vLi4vbnVtYmVyTGluZU9wZXJhdGlvbnMuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IENPUk5FUl9SQURJVVMgPSA3O1xyXG5cclxuY2xhc3MgSG9sZGluZ0JveE5vZGUgZXh0ZW5kcyBSZWN0YW5nbGUge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge0hvbGRpbmdCb3h9IGhvbGRpbmdCb3ggLSBtb2RlbCBvZiB0aGUgc3RvcmFnZSBib3hcclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggaG9sZGluZ0JveCApIHtcclxuXHJcbiAgICBzdXBlcihcclxuICAgICAgaG9sZGluZ0JveC5yZWN0YW5nbGVCb3VuZHMubWluWCxcclxuICAgICAgaG9sZGluZ0JveC5yZWN0YW5nbGVCb3VuZHMubWluWSxcclxuICAgICAgaG9sZGluZ0JveC5yZWN0YW5nbGVCb3VuZHMud2lkdGgsXHJcbiAgICAgIGhvbGRpbmdCb3gucmVjdGFuZ2xlQm91bmRzLmhlaWdodCxcclxuICAgICAgQ09STkVSX1JBRElVUyxcclxuICAgICAgQ09STkVSX1JBRElVUyxcclxuICAgICAge1xyXG4gICAgICAgIGZpbGw6ICd3aGl0ZScsXHJcbiAgICAgICAgc3Ryb2tlOiAnYmxhY2snXHJcbiAgICAgIH1cclxuICAgICk7XHJcbiAgfVxyXG59XHJcblxyXG5udW1iZXJMaW5lT3BlcmF0aW9ucy5yZWdpc3RlciggJ0hvbGRpbmdCb3hOb2RlJywgSG9sZGluZ0JveE5vZGUgKTtcclxuZXhwb3J0IGRlZmF1bHQgSG9sZGluZ0JveE5vZGU7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsU0FBU0EsU0FBUyxRQUFRLG1DQUFtQztBQUM3RCxPQUFPQyxvQkFBb0IsTUFBTSwrQkFBK0I7O0FBRWhFO0FBQ0EsTUFBTUMsYUFBYSxHQUFHLENBQUM7QUFFdkIsTUFBTUMsY0FBYyxTQUFTSCxTQUFTLENBQUM7RUFFckM7QUFDRjtBQUNBO0VBQ0VJLFdBQVdBLENBQUVDLFVBQVUsRUFBRztJQUV4QixLQUFLLENBQ0hBLFVBQVUsQ0FBQ0MsZUFBZSxDQUFDQyxJQUFJLEVBQy9CRixVQUFVLENBQUNDLGVBQWUsQ0FBQ0UsSUFBSSxFQUMvQkgsVUFBVSxDQUFDQyxlQUFlLENBQUNHLEtBQUssRUFDaENKLFVBQVUsQ0FBQ0MsZUFBZSxDQUFDSSxNQUFNLEVBQ2pDUixhQUFhLEVBQ2JBLGFBQWEsRUFDYjtNQUNFUyxJQUFJLEVBQUUsT0FBTztNQUNiQyxNQUFNLEVBQUU7SUFDVixDQUNGLENBQUM7RUFDSDtBQUNGO0FBRUFYLG9CQUFvQixDQUFDWSxRQUFRLENBQUUsZ0JBQWdCLEVBQUVWLGNBQWUsQ0FBQztBQUNqRSxlQUFlQSxjQUFjIn0=