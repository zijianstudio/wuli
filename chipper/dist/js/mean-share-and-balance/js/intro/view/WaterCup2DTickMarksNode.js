// Copyright 2022, University of Colorado Boulder

/**
 * Representation for the ticks marks on 2D water cup nodes.
 *
 * @author Marla Schulz (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { Line, Node } from '../../../../scenery/js/imports.js';
import meanShareAndBalance from '../../meanShareAndBalance.js';
export default class WaterCup2DTickMarksNode extends Node {
  constructor(cupHeight, providedOptions) {
    super(providedOptions);
    const tickLevels = [0.25, 0.5, 0.75];
    tickLevels.forEach(tickLevel => {
      const fraction = cupHeight * tickLevel;
      this.addTickMark(fraction);
    });
  }

  //creates and adds tick mark to node
  addTickMark(fraction) {
    const tickMark = new Line(0, fraction, 5, fraction, {
      stroke: 'black',
      lineWidth: 2
    });
    this.addChild(tickMark);
  }
}
meanShareAndBalance.register('WaterCup2DTickMarksNode', WaterCup2DTickMarksNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJMaW5lIiwiTm9kZSIsIm1lYW5TaGFyZUFuZEJhbGFuY2UiLCJXYXRlckN1cDJEVGlja01hcmtzTm9kZSIsImNvbnN0cnVjdG9yIiwiY3VwSGVpZ2h0IiwicHJvdmlkZWRPcHRpb25zIiwidGlja0xldmVscyIsImZvckVhY2giLCJ0aWNrTGV2ZWwiLCJmcmFjdGlvbiIsImFkZFRpY2tNYXJrIiwidGlja01hcmsiLCJzdHJva2UiLCJsaW5lV2lkdGgiLCJhZGRDaGlsZCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiV2F0ZXJDdXAyRFRpY2tNYXJrc05vZGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFJlcHJlc2VudGF0aW9uIGZvciB0aGUgdGlja3MgbWFya3Mgb24gMkQgd2F0ZXIgY3VwIG5vZGVzLlxyXG4gKlxyXG4gKiBAYXV0aG9yIE1hcmxhIFNjaHVseiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgUGlja1JlcXVpcmVkIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9QaWNrUmVxdWlyZWQuanMnO1xyXG5pbXBvcnQgeyBMaW5lLCBOb2RlLCBOb2RlT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBtZWFuU2hhcmVBbmRCYWxhbmNlIGZyb20gJy4uLy4uL21lYW5TaGFyZUFuZEJhbGFuY2UuanMnO1xyXG5cclxudHlwZSBUaWNrTWFya3NOb2RlT3B0aW9ucyA9IFBpY2tSZXF1aXJlZDxOb2RlT3B0aW9ucywgJ3Zpc2libGVQcm9wZXJ0eScgfCAndGFuZGVtJz47XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBXYXRlckN1cDJEVGlja01hcmtzTm9kZSBleHRlbmRzIE5vZGUge1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIGN1cEhlaWdodDogbnVtYmVyLCBwcm92aWRlZE9wdGlvbnM6IFRpY2tNYXJrc05vZGVPcHRpb25zICkge1xyXG4gICAgc3VwZXIoIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIGNvbnN0IHRpY2tMZXZlbHMgPSBbIDAuMjUsIDAuNSwgMC43NSBdO1xyXG4gICAgdGlja0xldmVscy5mb3JFYWNoKCB0aWNrTGV2ZWwgPT4ge1xyXG4gICAgICBjb25zdCBmcmFjdGlvbiA9IGN1cEhlaWdodCAqIHRpY2tMZXZlbDtcclxuXHJcbiAgICAgIHRoaXMuYWRkVGlja01hcmsoIGZyYWN0aW9uICk7XHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICAvL2NyZWF0ZXMgYW5kIGFkZHMgdGljayBtYXJrIHRvIG5vZGVcclxuICBwcml2YXRlIGFkZFRpY2tNYXJrKCBmcmFjdGlvbjogbnVtYmVyICk6IHZvaWQge1xyXG4gICAgY29uc3QgdGlja01hcmsgPSBuZXcgTGluZSggMCwgZnJhY3Rpb24sIDUsIGZyYWN0aW9uLCB7XHJcbiAgICAgIHN0cm9rZTogJ2JsYWNrJyxcclxuICAgICAgbGluZVdpZHRoOiAyXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCB0aWNrTWFyayApO1xyXG4gIH1cclxufVxyXG5cclxubWVhblNoYXJlQW5kQmFsYW5jZS5yZWdpc3RlciggJ1dhdGVyQ3VwMkRUaWNrTWFya3NOb2RlJywgV2F0ZXJDdXAyRFRpY2tNYXJrc05vZGUgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFHQSxTQUFTQSxJQUFJLEVBQUVDLElBQUksUUFBcUIsbUNBQW1DO0FBQzNFLE9BQU9DLG1CQUFtQixNQUFNLDhCQUE4QjtBQUk5RCxlQUFlLE1BQU1DLHVCQUF1QixTQUFTRixJQUFJLENBQUM7RUFFakRHLFdBQVdBLENBQUVDLFNBQWlCLEVBQUVDLGVBQXFDLEVBQUc7SUFDN0UsS0FBSyxDQUFFQSxlQUFnQixDQUFDO0lBRXhCLE1BQU1DLFVBQVUsR0FBRyxDQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFFO0lBQ3RDQSxVQUFVLENBQUNDLE9BQU8sQ0FBRUMsU0FBUyxJQUFJO01BQy9CLE1BQU1DLFFBQVEsR0FBR0wsU0FBUyxHQUFHSSxTQUFTO01BRXRDLElBQUksQ0FBQ0UsV0FBVyxDQUFFRCxRQUFTLENBQUM7SUFDOUIsQ0FBRSxDQUFDO0VBQ0w7O0VBRUE7RUFDUUMsV0FBV0EsQ0FBRUQsUUFBZ0IsRUFBUztJQUM1QyxNQUFNRSxRQUFRLEdBQUcsSUFBSVosSUFBSSxDQUFFLENBQUMsRUFBRVUsUUFBUSxFQUFFLENBQUMsRUFBRUEsUUFBUSxFQUFFO01BQ25ERyxNQUFNLEVBQUUsT0FBTztNQUNmQyxTQUFTLEVBQUU7SUFDYixDQUFFLENBQUM7SUFDSCxJQUFJLENBQUNDLFFBQVEsQ0FBRUgsUUFBUyxDQUFDO0VBQzNCO0FBQ0Y7QUFFQVYsbUJBQW1CLENBQUNjLFFBQVEsQ0FBRSx5QkFBeUIsRUFBRWIsdUJBQXdCLENBQUMifQ==