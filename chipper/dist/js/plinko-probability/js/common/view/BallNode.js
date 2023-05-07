// Copyright 2015-2020, University of Colorado Boulder

/**
 * Scenery node that represents a ball.
 *
 * @author Martin Veillette (Berea College)
 */

import ShadedSphereNode from '../../../../scenery-phet/js/ShadedSphereNode.js';
import plinkoProbability from '../../plinkoProbability.js';
import PlinkoProbabilityConstants from '../PlinkoProbabilityConstants.js';
class BallNode extends ShadedSphereNode {
  /**
   * @param {number} radius - in view coordinates
   */
  constructor(radius) {
    super(2 * radius, {
      mainColor: PlinkoProbabilityConstants.BALL_COLOR,
      highlightColor: PlinkoProbabilityConstants.BALL_HIGHLIGHT_COLOR
    });
  }
}
plinkoProbability.register('BallNode', BallNode);
export default BallNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTaGFkZWRTcGhlcmVOb2RlIiwicGxpbmtvUHJvYmFiaWxpdHkiLCJQbGlua29Qcm9iYWJpbGl0eUNvbnN0YW50cyIsIkJhbGxOb2RlIiwiY29uc3RydWN0b3IiLCJyYWRpdXMiLCJtYWluQ29sb3IiLCJCQUxMX0NPTE9SIiwiaGlnaGxpZ2h0Q29sb3IiLCJCQUxMX0hJR0hMSUdIVF9DT0xPUiIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiQmFsbE5vZGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTUtMjAyMCwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogU2NlbmVyeSBub2RlIHRoYXQgcmVwcmVzZW50cyBhIGJhbGwuXHJcbiAqXHJcbiAqIEBhdXRob3IgTWFydGluIFZlaWxsZXR0ZSAoQmVyZWEgQ29sbGVnZSlcclxuICovXHJcblxyXG5pbXBvcnQgU2hhZGVkU3BoZXJlTm9kZSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvU2hhZGVkU3BoZXJlTm9kZS5qcyc7XHJcbmltcG9ydCBwbGlua29Qcm9iYWJpbGl0eSBmcm9tICcuLi8uLi9wbGlua29Qcm9iYWJpbGl0eS5qcyc7XHJcbmltcG9ydCBQbGlua29Qcm9iYWJpbGl0eUNvbnN0YW50cyBmcm9tICcuLi9QbGlua29Qcm9iYWJpbGl0eUNvbnN0YW50cy5qcyc7XHJcblxyXG5jbGFzcyBCYWxsTm9kZSBleHRlbmRzIFNoYWRlZFNwaGVyZU5vZGUge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge251bWJlcn0gcmFkaXVzIC0gaW4gdmlldyBjb29yZGluYXRlc1xyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCByYWRpdXMgKSB7XHJcbiAgICBzdXBlciggMiAqIHJhZGl1cywge1xyXG4gICAgICBtYWluQ29sb3I6IFBsaW5rb1Byb2JhYmlsaXR5Q29uc3RhbnRzLkJBTExfQ09MT1IsXHJcbiAgICAgIGhpZ2hsaWdodENvbG9yOiBQbGlua29Qcm9iYWJpbGl0eUNvbnN0YW50cy5CQUxMX0hJR0hMSUdIVF9DT0xPUlxyXG4gICAgfSApO1xyXG4gIH1cclxufVxyXG5cclxucGxpbmtvUHJvYmFiaWxpdHkucmVnaXN0ZXIoICdCYWxsTm9kZScsIEJhbGxOb2RlICk7XHJcbmV4cG9ydCBkZWZhdWx0IEJhbGxOb2RlOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxnQkFBZ0IsTUFBTSxpREFBaUQ7QUFDOUUsT0FBT0MsaUJBQWlCLE1BQU0sNEJBQTRCO0FBQzFELE9BQU9DLDBCQUEwQixNQUFNLGtDQUFrQztBQUV6RSxNQUFNQyxRQUFRLFNBQVNILGdCQUFnQixDQUFDO0VBRXRDO0FBQ0Y7QUFDQTtFQUNFSSxXQUFXQSxDQUFFQyxNQUFNLEVBQUc7SUFDcEIsS0FBSyxDQUFFLENBQUMsR0FBR0EsTUFBTSxFQUFFO01BQ2pCQyxTQUFTLEVBQUVKLDBCQUEwQixDQUFDSyxVQUFVO01BQ2hEQyxjQUFjLEVBQUVOLDBCQUEwQixDQUFDTztJQUM3QyxDQUFFLENBQUM7RUFDTDtBQUNGO0FBRUFSLGlCQUFpQixDQUFDUyxRQUFRLENBQUUsVUFBVSxFQUFFUCxRQUFTLENBQUM7QUFDbEQsZUFBZUEsUUFBUSJ9