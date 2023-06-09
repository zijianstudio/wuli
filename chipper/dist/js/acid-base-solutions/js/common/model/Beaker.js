// Copyright 2014-2022, University of Colorado Boulder

/**
 * Beaker is the model for the beaker. The origin is at the bottom center.
 *
 * @author Andrey Zelenkov (Mlearner)
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import optionize from '../../../../phet-core/js/optionize.js';
import acidBaseSolutions from '../../acidBaseSolutions.js';
export default class Beaker {
  // convenience fields related to size and position

  constructor(providedOptions) {
    const options = optionize()({
      size: new Dimension2(360, 270),
      position: new Vector2(230, 410)
    }, providedOptions);
    this.size = options.size;
    this.position = options.position;
    this.left = this.position.x - this.size.width / 2;
    this.right = this.left + this.size.width;
    this.bottom = this.position.y;
    this.top = this.bottom - this.size.height;
    this.bounds = new Bounds2(this.left, this.top, this.right, this.bottom);
  }
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
  }
}
acidBaseSolutions.register('Beaker', Beaker);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb3VuZHMyIiwiRGltZW5zaW9uMiIsIlZlY3RvcjIiLCJvcHRpb25pemUiLCJhY2lkQmFzZVNvbHV0aW9ucyIsIkJlYWtlciIsImNvbnN0cnVjdG9yIiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsInNpemUiLCJwb3NpdGlvbiIsImxlZnQiLCJ4Iiwid2lkdGgiLCJyaWdodCIsImJvdHRvbSIsInkiLCJ0b3AiLCJoZWlnaHQiLCJib3VuZHMiLCJkaXNwb3NlIiwiYXNzZXJ0IiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJCZWFrZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTQtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQmVha2VyIGlzIHRoZSBtb2RlbCBmb3IgdGhlIGJlYWtlci4gVGhlIG9yaWdpbiBpcyBhdCB0aGUgYm90dG9tIGNlbnRlci5cclxuICpcclxuICogQGF1dGhvciBBbmRyZXkgWmVsZW5rb3YgKE1sZWFybmVyKVxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBCb3VuZHMyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9Cb3VuZHMyLmpzJztcclxuaW1wb3J0IERpbWVuc2lvbjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL0RpbWVuc2lvbjIuanMnO1xyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCBvcHRpb25pemUgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCBhY2lkQmFzZVNvbHV0aW9ucyBmcm9tICcuLi8uLi9hY2lkQmFzZVNvbHV0aW9ucy5qcyc7XHJcblxyXG50eXBlIFNlbGZPcHRpb25zID0ge1xyXG4gIHNpemU/OiBEaW1lbnNpb24yO1xyXG4gIHBvc2l0aW9uPzogVmVjdG9yMjtcclxufTtcclxuXHJcbnR5cGUgQmVha2VyT3B0aW9ucyA9IFNlbGZPcHRpb25zO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQmVha2VyIHtcclxuXHJcbiAgcHVibGljIHJlYWRvbmx5IHNpemU6IERpbWVuc2lvbjI7XHJcbiAgcHVibGljIHJlYWRvbmx5IHBvc2l0aW9uOiBWZWN0b3IyO1xyXG5cclxuICAvLyBjb252ZW5pZW5jZSBmaWVsZHMgcmVsYXRlZCB0byBzaXplIGFuZCBwb3NpdGlvblxyXG4gIHB1YmxpYyByZWFkb25seSBsZWZ0OiBudW1iZXI7XHJcbiAgcHVibGljIHJlYWRvbmx5IHJpZ2h0OiBudW1iZXI7XHJcbiAgcHVibGljIHJlYWRvbmx5IHRvcDogbnVtYmVyO1xyXG4gIHB1YmxpYyByZWFkb25seSBib3R0b206IG51bWJlcjtcclxuXHJcbiAgcHVibGljIHJlYWRvbmx5IGJvdW5kczogQm91bmRzMjtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBwcm92aWRlZE9wdGlvbnM/OiBCZWFrZXJPcHRpb25zICkge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8QmVha2VyT3B0aW9ucywgU2VsZk9wdGlvbnM+KCkoIHtcclxuICAgICAgc2l6ZTogbmV3IERpbWVuc2lvbjIoIDM2MCwgMjcwICksXHJcbiAgICAgIHBvc2l0aW9uOiBuZXcgVmVjdG9yMiggMjMwLCA0MTAgKVxyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgdGhpcy5zaXplID0gb3B0aW9ucy5zaXplO1xyXG4gICAgdGhpcy5wb3NpdGlvbiA9IG9wdGlvbnMucG9zaXRpb247XHJcbiAgICB0aGlzLmxlZnQgPSB0aGlzLnBvc2l0aW9uLnggLSB0aGlzLnNpemUud2lkdGggLyAyO1xyXG4gICAgdGhpcy5yaWdodCA9IHRoaXMubGVmdCArIHRoaXMuc2l6ZS53aWR0aDtcclxuICAgIHRoaXMuYm90dG9tID0gdGhpcy5wb3NpdGlvbi55O1xyXG4gICAgdGhpcy50b3AgPSB0aGlzLmJvdHRvbSAtIHRoaXMuc2l6ZS5oZWlnaHQ7XHJcblxyXG4gICAgdGhpcy5ib3VuZHMgPSBuZXcgQm91bmRzMiggdGhpcy5sZWZ0LCB0aGlzLnRvcCwgdGhpcy5yaWdodCwgdGhpcy5ib3R0b20gKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBkaXNwb3NlKCk6IHZvaWQge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZmFsc2UsICdkaXNwb3NlIGlzIG5vdCBzdXBwb3J0ZWQsIGV4aXN0cyBmb3IgdGhlIGxpZmV0aW1lIG9mIHRoZSBzaW0nICk7XHJcbiAgfVxyXG59XHJcblxyXG5hY2lkQmFzZVNvbHV0aW9ucy5yZWdpc3RlciggJ0JlYWtlcicsIEJlYWtlciApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsT0FBT0MsVUFBVSxNQUFNLGtDQUFrQztBQUN6RCxPQUFPQyxPQUFPLE1BQU0sK0JBQStCO0FBQ25ELE9BQU9DLFNBQVMsTUFBTSx1Q0FBdUM7QUFDN0QsT0FBT0MsaUJBQWlCLE1BQU0sNEJBQTRCO0FBUzFELGVBQWUsTUFBTUMsTUFBTSxDQUFDO0VBSzFCOztFQVFPQyxXQUFXQSxDQUFFQyxlQUErQixFQUFHO0lBRXBELE1BQU1DLE9BQU8sR0FBR0wsU0FBUyxDQUE2QixDQUFDLENBQUU7TUFDdkRNLElBQUksRUFBRSxJQUFJUixVQUFVLENBQUUsR0FBRyxFQUFFLEdBQUksQ0FBQztNQUNoQ1MsUUFBUSxFQUFFLElBQUlSLE9BQU8sQ0FBRSxHQUFHLEVBQUUsR0FBSTtJQUNsQyxDQUFDLEVBQUVLLGVBQWdCLENBQUM7SUFFcEIsSUFBSSxDQUFDRSxJQUFJLEdBQUdELE9BQU8sQ0FBQ0MsSUFBSTtJQUN4QixJQUFJLENBQUNDLFFBQVEsR0FBR0YsT0FBTyxDQUFDRSxRQUFRO0lBQ2hDLElBQUksQ0FBQ0MsSUFBSSxHQUFHLElBQUksQ0FBQ0QsUUFBUSxDQUFDRSxDQUFDLEdBQUcsSUFBSSxDQUFDSCxJQUFJLENBQUNJLEtBQUssR0FBRyxDQUFDO0lBQ2pELElBQUksQ0FBQ0MsS0FBSyxHQUFHLElBQUksQ0FBQ0gsSUFBSSxHQUFHLElBQUksQ0FBQ0YsSUFBSSxDQUFDSSxLQUFLO0lBQ3hDLElBQUksQ0FBQ0UsTUFBTSxHQUFHLElBQUksQ0FBQ0wsUUFBUSxDQUFDTSxDQUFDO0lBQzdCLElBQUksQ0FBQ0MsR0FBRyxHQUFHLElBQUksQ0FBQ0YsTUFBTSxHQUFHLElBQUksQ0FBQ04sSUFBSSxDQUFDUyxNQUFNO0lBRXpDLElBQUksQ0FBQ0MsTUFBTSxHQUFHLElBQUluQixPQUFPLENBQUUsSUFBSSxDQUFDVyxJQUFJLEVBQUUsSUFBSSxDQUFDTSxHQUFHLEVBQUUsSUFBSSxDQUFDSCxLQUFLLEVBQUUsSUFBSSxDQUFDQyxNQUFPLENBQUM7RUFDM0U7RUFFT0ssT0FBT0EsQ0FBQSxFQUFTO0lBQ3JCQyxNQUFNLElBQUlBLE1BQU0sQ0FBRSxLQUFLLEVBQUUsOERBQStELENBQUM7RUFDM0Y7QUFDRjtBQUVBakIsaUJBQWlCLENBQUNrQixRQUFRLENBQUUsUUFBUSxFQUFFakIsTUFBTyxDQUFDIn0=