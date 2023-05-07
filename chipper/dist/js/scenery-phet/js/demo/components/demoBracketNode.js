// Copyright 2022, University of Colorado Boulder

/**
 * Demo for BracketNode
 */

import BracketNode from '../../BracketNode.js';
import PhetFont from '../../PhetFont.js';
import { Text } from '../../../../scenery/js/imports.js';
export default function demoBracketNode(layoutBounds) {
  return new BracketNode({
    orientation: 'left',
    bracketTipPosition: 0.75,
    labelNode: new Text('bracket', {
      font: new PhetFont(20)
    }),
    spacing: 10,
    center: layoutBounds.center
  });
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCcmFja2V0Tm9kZSIsIlBoZXRGb250IiwiVGV4dCIsImRlbW9CcmFja2V0Tm9kZSIsImxheW91dEJvdW5kcyIsIm9yaWVudGF0aW9uIiwiYnJhY2tldFRpcFBvc2l0aW9uIiwibGFiZWxOb2RlIiwiZm9udCIsInNwYWNpbmciLCJjZW50ZXIiXSwic291cmNlcyI6WyJkZW1vQnJhY2tldE5vZGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIERlbW8gZm9yIEJyYWNrZXROb2RlXHJcbiAqL1xyXG5cclxuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL0JvdW5kczIuanMnO1xyXG5pbXBvcnQgQnJhY2tldE5vZGUgZnJvbSAnLi4vLi4vQnJhY2tldE5vZGUuanMnO1xyXG5pbXBvcnQgUGhldEZvbnQgZnJvbSAnLi4vLi4vUGhldEZvbnQuanMnO1xyXG5pbXBvcnQgeyBOb2RlLCBUZXh0IH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGRlbW9CcmFja2V0Tm9kZSggbGF5b3V0Qm91bmRzOiBCb3VuZHMyICk6IE5vZGUge1xyXG4gIHJldHVybiBuZXcgQnJhY2tldE5vZGUoIHtcclxuICAgIG9yaWVudGF0aW9uOiAnbGVmdCcsXHJcbiAgICBicmFja2V0VGlwUG9zaXRpb246IDAuNzUsXHJcbiAgICBsYWJlbE5vZGU6IG5ldyBUZXh0KCAnYnJhY2tldCcsIHsgZm9udDogbmV3IFBoZXRGb250KCAyMCApIH0gKSxcclxuICAgIHNwYWNpbmc6IDEwLFxyXG4gICAgY2VudGVyOiBsYXlvdXRCb3VuZHMuY2VudGVyXHJcbiAgfSApO1xyXG59Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7O0FBR0EsT0FBT0EsV0FBVyxNQUFNLHNCQUFzQjtBQUM5QyxPQUFPQyxRQUFRLE1BQU0sbUJBQW1CO0FBQ3hDLFNBQWVDLElBQUksUUFBUSxtQ0FBbUM7QUFFOUQsZUFBZSxTQUFTQyxlQUFlQSxDQUFFQyxZQUFxQixFQUFTO0VBQ3JFLE9BQU8sSUFBSUosV0FBVyxDQUFFO0lBQ3RCSyxXQUFXLEVBQUUsTUFBTTtJQUNuQkMsa0JBQWtCLEVBQUUsSUFBSTtJQUN4QkMsU0FBUyxFQUFFLElBQUlMLElBQUksQ0FBRSxTQUFTLEVBQUU7TUFBRU0sSUFBSSxFQUFFLElBQUlQLFFBQVEsQ0FBRSxFQUFHO0lBQUUsQ0FBRSxDQUFDO0lBQzlEUSxPQUFPLEVBQUUsRUFBRTtJQUNYQyxNQUFNLEVBQUVOLFlBQVksQ0FBQ007RUFDdkIsQ0FBRSxDQUFDO0FBQ0wifQ==