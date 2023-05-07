// Copyright 2014-2021, University of Colorado Boulder

import barrel_png from '../../../../images/barrel_png.js';
import balancingAct from '../../../balancingAct.js';
import ImageMass from '../ImageMass.js';

// constants
const MASS = 90; // In kg
const HEIGHT = 0.75; // In meters

class Barrel extends ImageMass {
  /**
   * @param initialPosition
   * @param isMystery
   */
  constructor(initialPosition, isMystery) {
    super(MASS, barrel_png, HEIGHT, initialPosition, isMystery);
  }
}
balancingAct.register('Barrel', Barrel);
export default Barrel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJiYXJyZWxfcG5nIiwiYmFsYW5jaW5nQWN0IiwiSW1hZ2VNYXNzIiwiTUFTUyIsIkhFSUdIVCIsIkJhcnJlbCIsImNvbnN0cnVjdG9yIiwiaW5pdGlhbFBvc2l0aW9uIiwiaXNNeXN0ZXJ5IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJCYXJyZWwuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTQtMjAyMSwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG5cclxuaW1wb3J0IGJhcnJlbF9wbmcgZnJvbSAnLi4vLi4vLi4vLi4vaW1hZ2VzL2JhcnJlbF9wbmcuanMnO1xyXG5pbXBvcnQgYmFsYW5jaW5nQWN0IGZyb20gJy4uLy4uLy4uL2JhbGFuY2luZ0FjdC5qcyc7XHJcbmltcG9ydCBJbWFnZU1hc3MgZnJvbSAnLi4vSW1hZ2VNYXNzLmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBNQVNTID0gOTA7IC8vIEluIGtnXHJcbmNvbnN0IEhFSUdIVCA9IDAuNzU7IC8vIEluIG1ldGVyc1xyXG5cclxuY2xhc3MgQmFycmVsIGV4dGVuZHMgSW1hZ2VNYXNzIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIGluaXRpYWxQb3NpdGlvblxyXG4gICAqIEBwYXJhbSBpc015c3RlcnlcclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggaW5pdGlhbFBvc2l0aW9uLCBpc015c3RlcnkgKSB7XHJcbiAgICBzdXBlciggTUFTUywgYmFycmVsX3BuZywgSEVJR0hULCBpbml0aWFsUG9zaXRpb24sIGlzTXlzdGVyeSApO1xyXG4gIH1cclxufVxyXG5cclxuYmFsYW5jaW5nQWN0LnJlZ2lzdGVyKCAnQmFycmVsJywgQmFycmVsICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBCYXJyZWw7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFHQSxPQUFPQSxVQUFVLE1BQU0sa0NBQWtDO0FBQ3pELE9BQU9DLFlBQVksTUFBTSwwQkFBMEI7QUFDbkQsT0FBT0MsU0FBUyxNQUFNLGlCQUFpQjs7QUFFdkM7QUFDQSxNQUFNQyxJQUFJLEdBQUcsRUFBRSxDQUFDLENBQUM7QUFDakIsTUFBTUMsTUFBTSxHQUFHLElBQUksQ0FBQyxDQUFDOztBQUVyQixNQUFNQyxNQUFNLFNBQVNILFNBQVMsQ0FBQztFQUU3QjtBQUNGO0FBQ0E7QUFDQTtFQUNFSSxXQUFXQSxDQUFFQyxlQUFlLEVBQUVDLFNBQVMsRUFBRztJQUN4QyxLQUFLLENBQUVMLElBQUksRUFBRUgsVUFBVSxFQUFFSSxNQUFNLEVBQUVHLGVBQWUsRUFBRUMsU0FBVSxDQUFDO0VBQy9EO0FBQ0Y7QUFFQVAsWUFBWSxDQUFDUSxRQUFRLENBQUUsUUFBUSxFQUFFSixNQUFPLENBQUM7QUFFekMsZUFBZUEsTUFBTSJ9