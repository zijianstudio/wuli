// Copyright 2016-2021, University of Colorado Boulder

/**
 * Base view type for displaying SceneRatios (necklaces, billiards tables, splotches, etc.)
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import { Node } from '../../../../scenery/js/imports.js';
import proportionPlayground from '../../proportionPlayground.js';
class SceneRatioNode extends Node {
  /**
   * @param {SceneRatio} sceneRatio
   */
  constructor(sceneRatio) {
    super();
    sceneRatio.visibleProperty.linkAttribute(this, 'visible');
  }
}
proportionPlayground.register('SceneRatioNode', SceneRatioNode);
export default SceneRatioNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJOb2RlIiwicHJvcG9ydGlvblBsYXlncm91bmQiLCJTY2VuZVJhdGlvTm9kZSIsImNvbnN0cnVjdG9yIiwic2NlbmVSYXRpbyIsInZpc2libGVQcm9wZXJ0eSIsImxpbmtBdHRyaWJ1dGUiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlNjZW5lUmF0aW9Ob2RlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE2LTIwMjEsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIEJhc2UgdmlldyB0eXBlIGZvciBkaXNwbGF5aW5nIFNjZW5lUmF0aW9zIChuZWNrbGFjZXMsIGJpbGxpYXJkcyB0YWJsZXMsIHNwbG90Y2hlcywgZXRjLilcclxuICpcclxuICogQGF1dGhvciBKb25hdGhhbiBPbHNvbiA8am9uYXRoYW4ub2xzb25AY29sb3JhZG8uZWR1PlxyXG4gKi9cclxuXHJcbmltcG9ydCB7IE5vZGUgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgcHJvcG9ydGlvblBsYXlncm91bmQgZnJvbSAnLi4vLi4vcHJvcG9ydGlvblBsYXlncm91bmQuanMnO1xyXG5cclxuY2xhc3MgU2NlbmVSYXRpb05vZGUgZXh0ZW5kcyBOb2RlIHtcclxuICAvKipcclxuICAgKiBAcGFyYW0ge1NjZW5lUmF0aW99IHNjZW5lUmF0aW9cclxuICAgKi9cclxuICBjb25zdHJ1Y3Rvciggc2NlbmVSYXRpbyApIHtcclxuICAgIHN1cGVyKCk7XHJcblxyXG4gICAgc2NlbmVSYXRpby52aXNpYmxlUHJvcGVydHkubGlua0F0dHJpYnV0ZSggdGhpcywgJ3Zpc2libGUnICk7XHJcbiAgfVxyXG59XHJcblxyXG5wcm9wb3J0aW9uUGxheWdyb3VuZC5yZWdpc3RlciggJ1NjZW5lUmF0aW9Ob2RlJywgU2NlbmVSYXRpb05vZGUgKTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IFNjZW5lUmF0aW9Ob2RlOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxTQUFTQSxJQUFJLFFBQVEsbUNBQW1DO0FBQ3hELE9BQU9DLG9CQUFvQixNQUFNLCtCQUErQjtBQUVoRSxNQUFNQyxjQUFjLFNBQVNGLElBQUksQ0FBQztFQUNoQztBQUNGO0FBQ0E7RUFDRUcsV0FBV0EsQ0FBRUMsVUFBVSxFQUFHO0lBQ3hCLEtBQUssQ0FBQyxDQUFDO0lBRVBBLFVBQVUsQ0FBQ0MsZUFBZSxDQUFDQyxhQUFhLENBQUUsSUFBSSxFQUFFLFNBQVUsQ0FBQztFQUM3RDtBQUNGO0FBRUFMLG9CQUFvQixDQUFDTSxRQUFRLENBQUUsZ0JBQWdCLEVBQUVMLGNBQWUsQ0FBQztBQUVqRSxlQUFlQSxjQUFjIn0=