// Copyright 2014-2022, University of Colorado Boulder

/**
 * ConcentrationGraph is the model for the concentration graph.
 *
 * @author Andrey Zelenkov (Mlearner)
 * @author Chris Malley (PixelZoom, Inc.)
 */

import acidBaseSolutions from '../../acidBaseSolutions.js';
export default class ConcentrationGraph {
  // dimensions of the graph's background

  // position, origin at upper-left corner

  constructor(beaker, solutionsMap, solutionTypeProperty) {
    this.solutionsMap = solutionsMap;
    this.solutionTypeProperty = solutionTypeProperty;
    this.width = 0.5 * beaker.size.width;
    this.height = 0.9 * beaker.size.height;
    this.position = beaker.position.plusXY((this.width - beaker.size.width) / 2, -(beaker.size.height + this.height) / 2);
  }
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
  }
}
acidBaseSolutions.register('ConcentrationGraph', ConcentrationGraph);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJhY2lkQmFzZVNvbHV0aW9ucyIsIkNvbmNlbnRyYXRpb25HcmFwaCIsImNvbnN0cnVjdG9yIiwiYmVha2VyIiwic29sdXRpb25zTWFwIiwic29sdXRpb25UeXBlUHJvcGVydHkiLCJ3aWR0aCIsInNpemUiLCJoZWlnaHQiLCJwb3NpdGlvbiIsInBsdXNYWSIsImRpc3Bvc2UiLCJhc3NlcnQiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkNvbmNlbnRyYXRpb25HcmFwaC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNC0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBDb25jZW50cmF0aW9uR3JhcGggaXMgdGhlIG1vZGVsIGZvciB0aGUgY29uY2VudHJhdGlvbiBncmFwaC5cclxuICpcclxuICogQGF1dGhvciBBbmRyZXkgWmVsZW5rb3YgKE1sZWFybmVyKVxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBUUmVhZE9ubHlQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1RSZWFkT25seVByb3BlcnR5LmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgYWNpZEJhc2VTb2x1dGlvbnMgZnJvbSAnLi4vLi4vYWNpZEJhc2VTb2x1dGlvbnMuanMnO1xyXG5pbXBvcnQgeyBTb2x1dGlvblR5cGUgfSBmcm9tICcuL1NvbHV0aW9uVHlwZS5qcyc7XHJcbmltcG9ydCBCZWFrZXIgZnJvbSAnLi9CZWFrZXIuanMnO1xyXG5pbXBvcnQgeyBTb2x1dGlvbk1hcCB9IGZyb20gJy4vQUJTTW9kZWwuanMnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29uY2VudHJhdGlvbkdyYXBoIHtcclxuXHJcbiAgcHVibGljIHJlYWRvbmx5IHNvbHV0aW9uc01hcDogU29sdXRpb25NYXA7XHJcbiAgcHVibGljIHJlYWRvbmx5IHNvbHV0aW9uVHlwZVByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxTb2x1dGlvblR5cGU+O1xyXG4gIHB1YmxpYyByZWFkb25seSB3aWR0aDogbnVtYmVyOyAvLyBkaW1lbnNpb25zIG9mIHRoZSBncmFwaCdzIGJhY2tncm91bmRcclxuICBwdWJsaWMgcmVhZG9ubHkgaGVpZ2h0OiBudW1iZXI7XHJcbiAgcHVibGljIHJlYWRvbmx5IHBvc2l0aW9uOiBWZWN0b3IyOyAvLyBwb3NpdGlvbiwgb3JpZ2luIGF0IHVwcGVyLWxlZnQgY29ybmVyXHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggYmVha2VyOiBCZWFrZXIsXHJcbiAgICAgICAgICAgICAgICAgICAgICBzb2x1dGlvbnNNYXA6IFNvbHV0aW9uTWFwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgc29sdXRpb25UeXBlUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PFNvbHV0aW9uVHlwZT4gKSB7XHJcblxyXG4gICAgdGhpcy5zb2x1dGlvbnNNYXAgPSBzb2x1dGlvbnNNYXA7XHJcbiAgICB0aGlzLnNvbHV0aW9uVHlwZVByb3BlcnR5ID0gc29sdXRpb25UeXBlUHJvcGVydHk7XHJcbiAgICB0aGlzLndpZHRoID0gMC41ICogYmVha2VyLnNpemUud2lkdGg7XHJcbiAgICB0aGlzLmhlaWdodCA9IDAuOSAqIGJlYWtlci5zaXplLmhlaWdodDtcclxuICAgIHRoaXMucG9zaXRpb24gPSBiZWFrZXIucG9zaXRpb24ucGx1c1hZKCAoIHRoaXMud2lkdGggLSBiZWFrZXIuc2l6ZS53aWR0aCApIC8gMiwgLSggYmVha2VyLnNpemUuaGVpZ2h0ICsgdGhpcy5oZWlnaHQgKSAvIDIgKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBkaXNwb3NlKCk6IHZvaWQge1xyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggZmFsc2UsICdkaXNwb3NlIGlzIG5vdCBzdXBwb3J0ZWQsIGV4aXN0cyBmb3IgdGhlIGxpZmV0aW1lIG9mIHRoZSBzaW0nICk7XHJcbiAgfVxyXG59XHJcblxyXG5hY2lkQmFzZVNvbHV0aW9ucy5yZWdpc3RlciggJ0NvbmNlbnRyYXRpb25HcmFwaCcsIENvbmNlbnRyYXRpb25HcmFwaCApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUlBLE9BQU9BLGlCQUFpQixNQUFNLDRCQUE0QjtBQUsxRCxlQUFlLE1BQU1DLGtCQUFrQixDQUFDO0VBSVA7O0VBRUk7O0VBRTVCQyxXQUFXQSxDQUFFQyxNQUFjLEVBQ2RDLFlBQXlCLEVBQ3pCQyxvQkFBcUQsRUFBRztJQUUxRSxJQUFJLENBQUNELFlBQVksR0FBR0EsWUFBWTtJQUNoQyxJQUFJLENBQUNDLG9CQUFvQixHQUFHQSxvQkFBb0I7SUFDaEQsSUFBSSxDQUFDQyxLQUFLLEdBQUcsR0FBRyxHQUFHSCxNQUFNLENBQUNJLElBQUksQ0FBQ0QsS0FBSztJQUNwQyxJQUFJLENBQUNFLE1BQU0sR0FBRyxHQUFHLEdBQUdMLE1BQU0sQ0FBQ0ksSUFBSSxDQUFDQyxNQUFNO0lBQ3RDLElBQUksQ0FBQ0MsUUFBUSxHQUFHTixNQUFNLENBQUNNLFFBQVEsQ0FBQ0MsTUFBTSxDQUFFLENBQUUsSUFBSSxDQUFDSixLQUFLLEdBQUdILE1BQU0sQ0FBQ0ksSUFBSSxDQUFDRCxLQUFLLElBQUssQ0FBQyxFQUFFLEVBQUdILE1BQU0sQ0FBQ0ksSUFBSSxDQUFDQyxNQUFNLEdBQUcsSUFBSSxDQUFDQSxNQUFNLENBQUUsR0FBRyxDQUFFLENBQUM7RUFDN0g7RUFFT0csT0FBT0EsQ0FBQSxFQUFTO0lBQ3JCQyxNQUFNLElBQUlBLE1BQU0sQ0FBRSxLQUFLLEVBQUUsOERBQStELENBQUM7RUFDM0Y7QUFDRjtBQUVBWixpQkFBaUIsQ0FBQ2EsUUFBUSxDQUFFLG9CQUFvQixFQUFFWixrQkFBbUIsQ0FBQyJ9