// Copyright 2017-2023, University of Colorado Boulder

/**
 * Model of the shelf.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Dimension2 from '../../../../dot/js/Dimension2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import unitRates from '../../unitRates.js';
import ShoppingContainer from './ShoppingContainer.js';
export default class Shelf extends ShoppingContainer {
  /**
   * @param {Object} [options]
   */
  constructor(options) {
    options = merge({
      position: new Vector2(0, 0),
      // {Vector2} position of the center of the shelf's top face

      // ShoppingContainer options
      numberOfBags: 4,
      // {number} maximum number of bags on the shelf
      bagSize: new Dimension2(100, 100),
      // {number} dimensions of each bag
      bagRowYOffset: 0,
      // {number} offset of bag row from shelf origin
      numberOfItems: 15,
      // {number} maximum number of items on the shelf
      itemSize: new Dimension2(25, 25),
      // {number} dimensions of each item
      backRowYOffset: 8,
      // {number} offset of items back row from shelf origin
      frontRowYOffset: 16 // {number} offset of items front row from shelf origin
    }, options);
    super(options);

    // @public (read-only) description of pseudo-3D shape
    this.width = 350; // {number} width of the top face, at its center
    this.height = 15; // {number} height of the front face
    this.depth = 45; // {number} depth, after flattening to 2D
    this.perspectiveXOffset = 30; // {number} offset for parallel perspective, after flattening to 2D
  }
}

unitRates.register('Shelf', Shelf);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEaW1lbnNpb24yIiwiVmVjdG9yMiIsIm1lcmdlIiwidW5pdFJhdGVzIiwiU2hvcHBpbmdDb250YWluZXIiLCJTaGVsZiIsImNvbnN0cnVjdG9yIiwib3B0aW9ucyIsInBvc2l0aW9uIiwibnVtYmVyT2ZCYWdzIiwiYmFnU2l6ZSIsImJhZ1Jvd1lPZmZzZXQiLCJudW1iZXJPZkl0ZW1zIiwiaXRlbVNpemUiLCJiYWNrUm93WU9mZnNldCIsImZyb250Um93WU9mZnNldCIsIndpZHRoIiwiaGVpZ2h0IiwiZGVwdGgiLCJwZXJzcGVjdGl2ZVhPZmZzZXQiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlNoZWxmLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE3LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIE1vZGVsIG9mIHRoZSBzaGVsZi5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgRGltZW5zaW9uMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvRGltZW5zaW9uMi5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCB1bml0UmF0ZXMgZnJvbSAnLi4vLi4vdW5pdFJhdGVzLmpzJztcclxuaW1wb3J0IFNob3BwaW5nQ29udGFpbmVyIGZyb20gJy4vU2hvcHBpbmdDb250YWluZXIuanMnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2hlbGYgZXh0ZW5kcyBTaG9wcGluZ0NvbnRhaW5lciB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cclxuICAgKi9cclxuICBjb25zdHJ1Y3Rvciggb3B0aW9ucyApIHtcclxuXHJcbiAgICBvcHRpb25zID0gbWVyZ2UoIHtcclxuXHJcbiAgICAgIHBvc2l0aW9uOiBuZXcgVmVjdG9yMiggMCwgMCApLCAvLyB7VmVjdG9yMn0gcG9zaXRpb24gb2YgdGhlIGNlbnRlciBvZiB0aGUgc2hlbGYncyB0b3AgZmFjZVxyXG5cclxuICAgICAgLy8gU2hvcHBpbmdDb250YWluZXIgb3B0aW9uc1xyXG4gICAgICBudW1iZXJPZkJhZ3M6IDQsIC8vIHtudW1iZXJ9IG1heGltdW0gbnVtYmVyIG9mIGJhZ3Mgb24gdGhlIHNoZWxmXHJcbiAgICAgIGJhZ1NpemU6IG5ldyBEaW1lbnNpb24yKCAxMDAsIDEwMCApLCAvLyB7bnVtYmVyfSBkaW1lbnNpb25zIG9mIGVhY2ggYmFnXHJcbiAgICAgIGJhZ1Jvd1lPZmZzZXQ6IDAsIC8vIHtudW1iZXJ9IG9mZnNldCBvZiBiYWcgcm93IGZyb20gc2hlbGYgb3JpZ2luXHJcbiAgICAgIG51bWJlck9mSXRlbXM6IDE1LCAvLyB7bnVtYmVyfSBtYXhpbXVtIG51bWJlciBvZiBpdGVtcyBvbiB0aGUgc2hlbGZcclxuICAgICAgaXRlbVNpemU6IG5ldyBEaW1lbnNpb24yKCAyNSwgMjUgKSwgLy8ge251bWJlcn0gZGltZW5zaW9ucyBvZiBlYWNoIGl0ZW1cclxuICAgICAgYmFja1Jvd1lPZmZzZXQ6IDgsIC8vIHtudW1iZXJ9IG9mZnNldCBvZiBpdGVtcyBiYWNrIHJvdyBmcm9tIHNoZWxmIG9yaWdpblxyXG4gICAgICBmcm9udFJvd1lPZmZzZXQ6IDE2IC8vIHtudW1iZXJ9IG9mZnNldCBvZiBpdGVtcyBmcm9udCByb3cgZnJvbSBzaGVsZiBvcmlnaW5cclxuXHJcbiAgICB9LCBvcHRpb25zICk7XHJcblxyXG4gICAgc3VwZXIoIG9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBAcHVibGljIChyZWFkLW9ubHkpIGRlc2NyaXB0aW9uIG9mIHBzZXVkby0zRCBzaGFwZVxyXG4gICAgdGhpcy53aWR0aCA9IDM1MDsgLy8ge251bWJlcn0gd2lkdGggb2YgdGhlIHRvcCBmYWNlLCBhdCBpdHMgY2VudGVyXHJcbiAgICB0aGlzLmhlaWdodCA9IDE1OyAvLyB7bnVtYmVyfSBoZWlnaHQgb2YgdGhlIGZyb250IGZhY2VcclxuICAgIHRoaXMuZGVwdGggPSA0NTsgLy8ge251bWJlcn0gZGVwdGgsIGFmdGVyIGZsYXR0ZW5pbmcgdG8gMkRcclxuICAgIHRoaXMucGVyc3BlY3RpdmVYT2Zmc2V0ID0gMzA7IC8vIHtudW1iZXJ9IG9mZnNldCBmb3IgcGFyYWxsZWwgcGVyc3BlY3RpdmUsIGFmdGVyIGZsYXR0ZW5pbmcgdG8gMkRcclxuICB9XHJcbn1cclxuXHJcbnVuaXRSYXRlcy5yZWdpc3RlciggJ1NoZWxmJywgU2hlbGYgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsVUFBVSxNQUFNLGtDQUFrQztBQUN6RCxPQUFPQyxPQUFPLE1BQU0sK0JBQStCO0FBQ25ELE9BQU9DLEtBQUssTUFBTSxtQ0FBbUM7QUFDckQsT0FBT0MsU0FBUyxNQUFNLG9CQUFvQjtBQUMxQyxPQUFPQyxpQkFBaUIsTUFBTSx3QkFBd0I7QUFFdEQsZUFBZSxNQUFNQyxLQUFLLFNBQVNELGlCQUFpQixDQUFDO0VBRW5EO0FBQ0Y7QUFDQTtFQUNFRSxXQUFXQSxDQUFFQyxPQUFPLEVBQUc7SUFFckJBLE9BQU8sR0FBR0wsS0FBSyxDQUFFO01BRWZNLFFBQVEsRUFBRSxJQUFJUCxPQUFPLENBQUUsQ0FBQyxFQUFFLENBQUUsQ0FBQztNQUFFOztNQUUvQjtNQUNBUSxZQUFZLEVBQUUsQ0FBQztNQUFFO01BQ2pCQyxPQUFPLEVBQUUsSUFBSVYsVUFBVSxDQUFFLEdBQUcsRUFBRSxHQUFJLENBQUM7TUFBRTtNQUNyQ1csYUFBYSxFQUFFLENBQUM7TUFBRTtNQUNsQkMsYUFBYSxFQUFFLEVBQUU7TUFBRTtNQUNuQkMsUUFBUSxFQUFFLElBQUliLFVBQVUsQ0FBRSxFQUFFLEVBQUUsRUFBRyxDQUFDO01BQUU7TUFDcENjLGNBQWMsRUFBRSxDQUFDO01BQUU7TUFDbkJDLGVBQWUsRUFBRSxFQUFFLENBQUM7SUFFdEIsQ0FBQyxFQUFFUixPQUFRLENBQUM7SUFFWixLQUFLLENBQUVBLE9BQVEsQ0FBQzs7SUFFaEI7SUFDQSxJQUFJLENBQUNTLEtBQUssR0FBRyxHQUFHLENBQUMsQ0FBQztJQUNsQixJQUFJLENBQUNDLE1BQU0sR0FBRyxFQUFFLENBQUMsQ0FBQztJQUNsQixJQUFJLENBQUNDLEtBQUssR0FBRyxFQUFFLENBQUMsQ0FBQztJQUNqQixJQUFJLENBQUNDLGtCQUFrQixHQUFHLEVBQUUsQ0FBQyxDQUFDO0VBQ2hDO0FBQ0Y7O0FBRUFoQixTQUFTLENBQUNpQixRQUFRLENBQUUsT0FBTyxFQUFFZixLQUFNLENBQUMifQ==