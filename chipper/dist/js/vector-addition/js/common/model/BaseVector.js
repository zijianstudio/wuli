// Copyright 2019-2023, University of Colorado Boulder

/**
 * BaseVector is the abstract base class for base vectors.  It disables tip dragging and removal of vectors.
 * Base vectors are created at the start of the sim, and are never disposed.
 * See https://github.com/phetsims/vector-addition/issues/63 for an overview of how BaseVectors fit into the class
 * hierarchy.
 *
 * @author Brandon Li
 */

import vectorAddition from '../../vectorAddition.js';
import Vector from './Vector.js';

// constants
const OPTIONS = {
  isRemovable: false,
  // BaseVectors are not removable
  isTipDraggable: false,
  // BaseVectors are not draggable by the tip
  isOnGraphInitially: true // BaseVectors are always on the graph
};

export default class BaseVector extends Vector {
  /**
   * @abstract
   * @param {Vector2} initialTailPosition - starting tail position of the BaseVector
   * @param {Vector2} initialComponents - starting components of the BaseVector
   * @param {EquationsGraph} graph - the graph the BaseVector belongs to
   * @param {EquationsVectorSet} vectorSet - the set that the BaseVector belongs to
   * @param {string|null} symbol - the symbol for the Base Vector (i.e. 'a', 'b', 'c', ...)
   */
  constructor(initialTailPosition, initialComponents, graph, vectorSet, symbol) {
    super(initialTailPosition, initialComponents, graph, vectorSet, symbol, OPTIONS);
  }

  /**
   * @public
   * @override
   */
  dispose() {
    assert && assert(false, 'BaseVector is not intended to be disposed');
  }
}
vectorAddition.register('BaseVector', BaseVector);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJ2ZWN0b3JBZGRpdGlvbiIsIlZlY3RvciIsIk9QVElPTlMiLCJpc1JlbW92YWJsZSIsImlzVGlwRHJhZ2dhYmxlIiwiaXNPbkdyYXBoSW5pdGlhbGx5IiwiQmFzZVZlY3RvciIsImNvbnN0cnVjdG9yIiwiaW5pdGlhbFRhaWxQb3NpdGlvbiIsImluaXRpYWxDb21wb25lbnRzIiwiZ3JhcGgiLCJ2ZWN0b3JTZXQiLCJzeW1ib2wiLCJkaXNwb3NlIiwiYXNzZXJ0IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJCYXNlVmVjdG9yLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE5LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEJhc2VWZWN0b3IgaXMgdGhlIGFic3RyYWN0IGJhc2UgY2xhc3MgZm9yIGJhc2UgdmVjdG9ycy4gIEl0IGRpc2FibGVzIHRpcCBkcmFnZ2luZyBhbmQgcmVtb3ZhbCBvZiB2ZWN0b3JzLlxyXG4gKiBCYXNlIHZlY3RvcnMgYXJlIGNyZWF0ZWQgYXQgdGhlIHN0YXJ0IG9mIHRoZSBzaW0sIGFuZCBhcmUgbmV2ZXIgZGlzcG9zZWQuXHJcbiAqIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvdmVjdG9yLWFkZGl0aW9uL2lzc3Vlcy82MyBmb3IgYW4gb3ZlcnZpZXcgb2YgaG93IEJhc2VWZWN0b3JzIGZpdCBpbnRvIHRoZSBjbGFzc1xyXG4gKiBoaWVyYXJjaHkuXHJcbiAqXHJcbiAqIEBhdXRob3IgQnJhbmRvbiBMaVxyXG4gKi9cclxuXHJcbmltcG9ydCB2ZWN0b3JBZGRpdGlvbiBmcm9tICcuLi8uLi92ZWN0b3JBZGRpdGlvbi5qcyc7XHJcbmltcG9ydCBWZWN0b3IgZnJvbSAnLi9WZWN0b3IuanMnO1xyXG5cclxuLy8gY29uc3RhbnRzXHJcbmNvbnN0IE9QVElPTlMgPSB7XHJcbiAgaXNSZW1vdmFibGU6IGZhbHNlLCAgICAgICAvLyBCYXNlVmVjdG9ycyBhcmUgbm90IHJlbW92YWJsZVxyXG4gIGlzVGlwRHJhZ2dhYmxlOiBmYWxzZSwgICAgLy8gQmFzZVZlY3RvcnMgYXJlIG5vdCBkcmFnZ2FibGUgYnkgdGhlIHRpcFxyXG4gIGlzT25HcmFwaEluaXRpYWxseTogdHJ1ZSAgLy8gQmFzZVZlY3RvcnMgYXJlIGFsd2F5cyBvbiB0aGUgZ3JhcGhcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEJhc2VWZWN0b3IgZXh0ZW5kcyBWZWN0b3Ige1xyXG5cclxuICAvKipcclxuICAgKiBAYWJzdHJhY3RcclxuICAgKiBAcGFyYW0ge1ZlY3RvcjJ9IGluaXRpYWxUYWlsUG9zaXRpb24gLSBzdGFydGluZyB0YWlsIHBvc2l0aW9uIG9mIHRoZSBCYXNlVmVjdG9yXHJcbiAgICogQHBhcmFtIHtWZWN0b3IyfSBpbml0aWFsQ29tcG9uZW50cyAtIHN0YXJ0aW5nIGNvbXBvbmVudHMgb2YgdGhlIEJhc2VWZWN0b3JcclxuICAgKiBAcGFyYW0ge0VxdWF0aW9uc0dyYXBofSBncmFwaCAtIHRoZSBncmFwaCB0aGUgQmFzZVZlY3RvciBiZWxvbmdzIHRvXHJcbiAgICogQHBhcmFtIHtFcXVhdGlvbnNWZWN0b3JTZXR9IHZlY3RvclNldCAtIHRoZSBzZXQgdGhhdCB0aGUgQmFzZVZlY3RvciBiZWxvbmdzIHRvXHJcbiAgICogQHBhcmFtIHtzdHJpbmd8bnVsbH0gc3ltYm9sIC0gdGhlIHN5bWJvbCBmb3IgdGhlIEJhc2UgVmVjdG9yIChpLmUuICdhJywgJ2InLCAnYycsIC4uLilcclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggaW5pdGlhbFRhaWxQb3NpdGlvbiwgaW5pdGlhbENvbXBvbmVudHMsIGdyYXBoLCB2ZWN0b3JTZXQsIHN5bWJvbCApIHtcclxuXHJcbiAgICBzdXBlciggaW5pdGlhbFRhaWxQb3NpdGlvbiwgaW5pdGlhbENvbXBvbmVudHMsIGdyYXBoLCB2ZWN0b3JTZXQsIHN5bWJvbCwgT1BUSU9OUyApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEBvdmVycmlkZVxyXG4gICAqL1xyXG4gIGRpc3Bvc2UoKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBmYWxzZSwgJ0Jhc2VWZWN0b3IgaXMgbm90IGludGVuZGVkIHRvIGJlIGRpc3Bvc2VkJyApO1xyXG4gIH1cclxufVxyXG5cclxudmVjdG9yQWRkaXRpb24ucmVnaXN0ZXIoICdCYXNlVmVjdG9yJywgQmFzZVZlY3RvciApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxjQUFjLE1BQU0seUJBQXlCO0FBQ3BELE9BQU9DLE1BQU0sTUFBTSxhQUFhOztBQUVoQztBQUNBLE1BQU1DLE9BQU8sR0FBRztFQUNkQyxXQUFXLEVBQUUsS0FBSztFQUFRO0VBQzFCQyxjQUFjLEVBQUUsS0FBSztFQUFLO0VBQzFCQyxrQkFBa0IsRUFBRSxJQUFJLENBQUU7QUFDNUIsQ0FBQzs7QUFFRCxlQUFlLE1BQU1DLFVBQVUsU0FBU0wsTUFBTSxDQUFDO0VBRTdDO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRU0sV0FBV0EsQ0FBRUMsbUJBQW1CLEVBQUVDLGlCQUFpQixFQUFFQyxLQUFLLEVBQUVDLFNBQVMsRUFBRUMsTUFBTSxFQUFHO0lBRTlFLEtBQUssQ0FBRUosbUJBQW1CLEVBQUVDLGlCQUFpQixFQUFFQyxLQUFLLEVBQUVDLFNBQVMsRUFBRUMsTUFBTSxFQUFFVixPQUFRLENBQUM7RUFDcEY7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7RUFDRVcsT0FBT0EsQ0FBQSxFQUFHO0lBQ1JDLE1BQU0sSUFBSUEsTUFBTSxDQUFFLEtBQUssRUFBRSwyQ0FBNEMsQ0FBQztFQUN4RTtBQUNGO0FBRUFkLGNBQWMsQ0FBQ2UsUUFBUSxDQUFFLFlBQVksRUFBRVQsVUFBVyxDQUFDIn0=