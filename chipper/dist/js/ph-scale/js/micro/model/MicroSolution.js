// Copyright 2020-2022, University of Colorado Boulder

/**
 * MicroSolution is the solution model used in the Micro screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import SolutionDerivedProperties from '../../common/model/SolutionDerivedProperties.js';
import Solution from '../../common/model/Solution.js';
import phScale from '../../phScale.js';
export default class MicroSolution extends Solution {
  constructor(soluteProperty, providedOptions) {
    super(soluteProperty, providedOptions);
    this.derivedProperties = new SolutionDerivedProperties(this.pHProperty, this.totalVolumeProperty, {
      // Properties created by SolutionDerivedProperties should appear as if they are children of MicroSolution.
      tandem: providedOptions.tandem
    });
  }
}
phScale.register('MicroSolution', MicroSolution);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTb2x1dGlvbkRlcml2ZWRQcm9wZXJ0aWVzIiwiU29sdXRpb24iLCJwaFNjYWxlIiwiTWljcm9Tb2x1dGlvbiIsImNvbnN0cnVjdG9yIiwic29sdXRlUHJvcGVydHkiLCJwcm92aWRlZE9wdGlvbnMiLCJkZXJpdmVkUHJvcGVydGllcyIsInBIUHJvcGVydHkiLCJ0b3RhbFZvbHVtZVByb3BlcnR5IiwidGFuZGVtIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJNaWNyb1NvbHV0aW9uLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIwLTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIE1pY3JvU29sdXRpb24gaXMgdGhlIHNvbHV0aW9uIG1vZGVsIHVzZWQgaW4gdGhlIE1pY3JvIHNjcmVlbi5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICovXHJcblxyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCB7IEVtcHR5U2VsZk9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcclxuaW1wb3J0IFNvbHV0ZSBmcm9tICcuLi8uLi9jb21tb24vbW9kZWwvU29sdXRlLmpzJztcclxuaW1wb3J0IFNvbHV0aW9uRGVyaXZlZFByb3BlcnRpZXMgZnJvbSAnLi4vLi4vY29tbW9uL21vZGVsL1NvbHV0aW9uRGVyaXZlZFByb3BlcnRpZXMuanMnO1xyXG5pbXBvcnQgU29sdXRpb24sIHsgU29sdXRpb25PcHRpb25zIH0gZnJvbSAnLi4vLi4vY29tbW9uL21vZGVsL1NvbHV0aW9uLmpzJztcclxuaW1wb3J0IHBoU2NhbGUgZnJvbSAnLi4vLi4vcGhTY2FsZS5qcyc7XHJcblxyXG50eXBlIFNlbGZPcHRpb25zID0gRW1wdHlTZWxmT3B0aW9ucztcclxuXHJcbnR5cGUgTWljcm9Tb2x1dGlvbk9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIFNvbHV0aW9uT3B0aW9ucztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1pY3JvU29sdXRpb24gZXh0ZW5kcyBTb2x1dGlvbiB7XHJcblxyXG4gIHB1YmxpYyByZWFkb25seSBkZXJpdmVkUHJvcGVydGllczogU29sdXRpb25EZXJpdmVkUHJvcGVydGllcztcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBzb2x1dGVQcm9wZXJ0eTogUHJvcGVydHk8U29sdXRlPiwgcHJvdmlkZWRPcHRpb25zOiBNaWNyb1NvbHV0aW9uT3B0aW9ucyApIHtcclxuXHJcbiAgICBzdXBlciggc29sdXRlUHJvcGVydHksIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIHRoaXMuZGVyaXZlZFByb3BlcnRpZXMgPSBuZXcgU29sdXRpb25EZXJpdmVkUHJvcGVydGllcyggdGhpcy5wSFByb3BlcnR5LCB0aGlzLnRvdGFsVm9sdW1lUHJvcGVydHksIHtcclxuXHJcbiAgICAgIC8vIFByb3BlcnRpZXMgY3JlYXRlZCBieSBTb2x1dGlvbkRlcml2ZWRQcm9wZXJ0aWVzIHNob3VsZCBhcHBlYXIgYXMgaWYgdGhleSBhcmUgY2hpbGRyZW4gb2YgTWljcm9Tb2x1dGlvbi5cclxuICAgICAgdGFuZGVtOiBwcm92aWRlZE9wdGlvbnMudGFuZGVtXHJcbiAgICB9ICk7XHJcbiAgfVxyXG59XHJcblxyXG5waFNjYWxlLnJlZ2lzdGVyKCAnTWljcm9Tb2x1dGlvbicsIE1pY3JvU29sdXRpb24gKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBS0EsT0FBT0EseUJBQXlCLE1BQU0saURBQWlEO0FBQ3ZGLE9BQU9DLFFBQVEsTUFBMkIsZ0NBQWdDO0FBQzFFLE9BQU9DLE9BQU8sTUFBTSxrQkFBa0I7QUFNdEMsZUFBZSxNQUFNQyxhQUFhLFNBQVNGLFFBQVEsQ0FBQztFQUkzQ0csV0FBV0EsQ0FBRUMsY0FBZ0MsRUFBRUMsZUFBcUMsRUFBRztJQUU1RixLQUFLLENBQUVELGNBQWMsRUFBRUMsZUFBZ0IsQ0FBQztJQUV4QyxJQUFJLENBQUNDLGlCQUFpQixHQUFHLElBQUlQLHlCQUF5QixDQUFFLElBQUksQ0FBQ1EsVUFBVSxFQUFFLElBQUksQ0FBQ0MsbUJBQW1CLEVBQUU7TUFFakc7TUFDQUMsTUFBTSxFQUFFSixlQUFlLENBQUNJO0lBQzFCLENBQUUsQ0FBQztFQUNMO0FBQ0Y7QUFFQVIsT0FBTyxDQUFDUyxRQUFRLENBQUUsZUFBZSxFQUFFUixhQUFjLENBQUMifQ==