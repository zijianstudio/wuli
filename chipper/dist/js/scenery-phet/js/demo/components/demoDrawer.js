// Copyright 2022, University of Colorado Boulder

/**
 * Demo for Drawer
 */

import Drawer from '../../Drawer.js';
import PhetFont from '../../PhetFont.js';
import { Node, Rectangle, Text } from '../../../../scenery/js/imports.js';
export default function demoDrawer(layoutBounds) {
  const rectangle = new Rectangle(0, 0, 400, 50, {
    fill: 'gray',
    stroke: 'black',
    cornerRadius: 10
  });
  const textNode = new Text('Hello Drawer!', {
    font: new PhetFont(40),
    fill: 'red'
  });
  const drawer = new Drawer(textNode, {
    handlePosition: 'bottom',
    open: false,
    xMargin: 30,
    yMargin: 20,
    centerX: rectangle.centerX,
    top: rectangle.bottom - 1
  });
  return new Node({
    children: [drawer, rectangle],
    center: layoutBounds.center
  });
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEcmF3ZXIiLCJQaGV0Rm9udCIsIk5vZGUiLCJSZWN0YW5nbGUiLCJUZXh0IiwiZGVtb0RyYXdlciIsImxheW91dEJvdW5kcyIsInJlY3RhbmdsZSIsImZpbGwiLCJzdHJva2UiLCJjb3JuZXJSYWRpdXMiLCJ0ZXh0Tm9kZSIsImZvbnQiLCJkcmF3ZXIiLCJoYW5kbGVQb3NpdGlvbiIsIm9wZW4iLCJ4TWFyZ2luIiwieU1hcmdpbiIsImNlbnRlclgiLCJ0b3AiLCJib3R0b20iLCJjaGlsZHJlbiIsImNlbnRlciJdLCJzb3VyY2VzIjpbImRlbW9EcmF3ZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIERlbW8gZm9yIERyYXdlclxyXG4gKi9cclxuXHJcbmltcG9ydCBEcmF3ZXIgZnJvbSAnLi4vLi4vRHJhd2VyLmpzJztcclxuaW1wb3J0IFBoZXRGb250IGZyb20gJy4uLy4uL1BoZXRGb250LmpzJztcclxuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL0JvdW5kczIuanMnO1xyXG5pbXBvcnQgeyBOb2RlLCBSZWN0YW5nbGUsIFRleHQgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZGVtb0RyYXdlciggbGF5b3V0Qm91bmRzOiBCb3VuZHMyICk6IE5vZGUge1xyXG5cclxuICBjb25zdCByZWN0YW5nbGUgPSBuZXcgUmVjdGFuZ2xlKCAwLCAwLCA0MDAsIDUwLCB7XHJcbiAgICBmaWxsOiAnZ3JheScsXHJcbiAgICBzdHJva2U6ICdibGFjaycsXHJcbiAgICBjb3JuZXJSYWRpdXM6IDEwXHJcbiAgfSApO1xyXG5cclxuICBjb25zdCB0ZXh0Tm9kZSA9IG5ldyBUZXh0KCAnSGVsbG8gRHJhd2VyIScsIHtcclxuICAgIGZvbnQ6IG5ldyBQaGV0Rm9udCggNDAgKSxcclxuICAgIGZpbGw6ICdyZWQnXHJcbiAgfSApO1xyXG5cclxuICBjb25zdCBkcmF3ZXIgPSBuZXcgRHJhd2VyKCB0ZXh0Tm9kZSwge1xyXG4gICAgaGFuZGxlUG9zaXRpb246ICdib3R0b20nLFxyXG4gICAgb3BlbjogZmFsc2UsXHJcbiAgICB4TWFyZ2luOiAzMCxcclxuICAgIHlNYXJnaW46IDIwLFxyXG4gICAgY2VudGVyWDogcmVjdGFuZ2xlLmNlbnRlclgsXHJcbiAgICB0b3A6IHJlY3RhbmdsZS5ib3R0b20gLSAxXHJcbiAgfSApO1xyXG5cclxuICByZXR1cm4gbmV3IE5vZGUoIHtcclxuICAgIGNoaWxkcmVuOiBbIGRyYXdlciwgcmVjdGFuZ2xlIF0sXHJcbiAgICBjZW50ZXI6IGxheW91dEJvdW5kcy5jZW50ZXJcclxuICB9ICk7XHJcbn0iXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxNQUFNLE1BQU0saUJBQWlCO0FBQ3BDLE9BQU9DLFFBQVEsTUFBTSxtQkFBbUI7QUFFeEMsU0FBU0MsSUFBSSxFQUFFQyxTQUFTLEVBQUVDLElBQUksUUFBUSxtQ0FBbUM7QUFFekUsZUFBZSxTQUFTQyxVQUFVQSxDQUFFQyxZQUFxQixFQUFTO0VBRWhFLE1BQU1DLFNBQVMsR0FBRyxJQUFJSixTQUFTLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFO0lBQzlDSyxJQUFJLEVBQUUsTUFBTTtJQUNaQyxNQUFNLEVBQUUsT0FBTztJQUNmQyxZQUFZLEVBQUU7RUFDaEIsQ0FBRSxDQUFDO0VBRUgsTUFBTUMsUUFBUSxHQUFHLElBQUlQLElBQUksQ0FBRSxlQUFlLEVBQUU7SUFDMUNRLElBQUksRUFBRSxJQUFJWCxRQUFRLENBQUUsRUFBRyxDQUFDO0lBQ3hCTyxJQUFJLEVBQUU7RUFDUixDQUFFLENBQUM7RUFFSCxNQUFNSyxNQUFNLEdBQUcsSUFBSWIsTUFBTSxDQUFFVyxRQUFRLEVBQUU7SUFDbkNHLGNBQWMsRUFBRSxRQUFRO0lBQ3hCQyxJQUFJLEVBQUUsS0FBSztJQUNYQyxPQUFPLEVBQUUsRUFBRTtJQUNYQyxPQUFPLEVBQUUsRUFBRTtJQUNYQyxPQUFPLEVBQUVYLFNBQVMsQ0FBQ1csT0FBTztJQUMxQkMsR0FBRyxFQUFFWixTQUFTLENBQUNhLE1BQU0sR0FBRztFQUMxQixDQUFFLENBQUM7RUFFSCxPQUFPLElBQUlsQixJQUFJLENBQUU7SUFDZm1CLFFBQVEsRUFBRSxDQUFFUixNQUFNLEVBQUVOLFNBQVMsQ0FBRTtJQUMvQmUsTUFBTSxFQUFFaEIsWUFBWSxDQUFDZ0I7RUFDdkIsQ0FBRSxDQUFDO0FBQ0wifQ==