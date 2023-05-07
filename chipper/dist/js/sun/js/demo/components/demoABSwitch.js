// Copyright 2022, University of Colorado Boulder

/**
 * Demo for ABSwitch.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import StringProperty from '../../../../axon/js/StringProperty.js';
import { Font, Text } from '../../../../scenery/js/imports.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import ABSwitch from '../../ABSwitch.js';
export default function demoABSwitch(layoutBounds) {
  const property = new StringProperty('A');
  const labelOptions = {
    font: new Font({
      size: 24
    })
  };
  const labelA = new Text('A', labelOptions);
  const labelB = new Text('B', labelOptions);
  return new ABSwitch(property, 'A', labelA, 'B', labelB, {
    center: layoutBounds.center,
    tandem: Tandem.OPT_OUT
  });
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTdHJpbmdQcm9wZXJ0eSIsIkZvbnQiLCJUZXh0IiwiVGFuZGVtIiwiQUJTd2l0Y2giLCJkZW1vQUJTd2l0Y2giLCJsYXlvdXRCb3VuZHMiLCJwcm9wZXJ0eSIsImxhYmVsT3B0aW9ucyIsImZvbnQiLCJzaXplIiwibGFiZWxBIiwibGFiZWxCIiwiY2VudGVyIiwidGFuZGVtIiwiT1BUX09VVCJdLCJzb3VyY2VzIjpbImRlbW9BQlN3aXRjaC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogRGVtbyBmb3IgQUJTd2l0Y2guXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IFN0cmluZ1Byb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvU3RyaW5nUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgQm91bmRzMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvQm91bmRzMi5qcyc7XHJcbmltcG9ydCB7IEZvbnQsIE5vZGUsIFRleHQgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgVGFuZGVtIGZyb20gJy4uLy4uLy4uLy4uL3RhbmRlbS9qcy9UYW5kZW0uanMnO1xyXG5pbXBvcnQgQUJTd2l0Y2ggZnJvbSAnLi4vLi4vQUJTd2l0Y2guanMnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZGVtb0FCU3dpdGNoKCBsYXlvdXRCb3VuZHM6IEJvdW5kczIgKTogTm9kZSB7XHJcblxyXG4gIGNvbnN0IHByb3BlcnR5ID0gbmV3IFN0cmluZ1Byb3BlcnR5KCAnQScgKTtcclxuXHJcbiAgY29uc3QgbGFiZWxPcHRpb25zID0geyBmb250OiBuZXcgRm9udCggeyBzaXplOiAyNCB9ICkgfTtcclxuICBjb25zdCBsYWJlbEEgPSBuZXcgVGV4dCggJ0EnLCBsYWJlbE9wdGlvbnMgKTtcclxuICBjb25zdCBsYWJlbEIgPSBuZXcgVGV4dCggJ0InLCBsYWJlbE9wdGlvbnMgKTtcclxuXHJcbiAgcmV0dXJuIG5ldyBBQlN3aXRjaCggcHJvcGVydHksICdBJywgbGFiZWxBLCAnQicsIGxhYmVsQiwge1xyXG4gICAgY2VudGVyOiBsYXlvdXRCb3VuZHMuY2VudGVyLFxyXG4gICAgdGFuZGVtOiBUYW5kZW0uT1BUX09VVFxyXG4gIH0gKTtcclxufSJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxjQUFjLE1BQU0sdUNBQXVDO0FBRWxFLFNBQVNDLElBQUksRUFBUUMsSUFBSSxRQUFRLG1DQUFtQztBQUNwRSxPQUFPQyxNQUFNLE1BQU0saUNBQWlDO0FBQ3BELE9BQU9DLFFBQVEsTUFBTSxtQkFBbUI7QUFFeEMsZUFBZSxTQUFTQyxZQUFZQSxDQUFFQyxZQUFxQixFQUFTO0VBRWxFLE1BQU1DLFFBQVEsR0FBRyxJQUFJUCxjQUFjLENBQUUsR0FBSSxDQUFDO0VBRTFDLE1BQU1RLFlBQVksR0FBRztJQUFFQyxJQUFJLEVBQUUsSUFBSVIsSUFBSSxDQUFFO01BQUVTLElBQUksRUFBRTtJQUFHLENBQUU7RUFBRSxDQUFDO0VBQ3ZELE1BQU1DLE1BQU0sR0FBRyxJQUFJVCxJQUFJLENBQUUsR0FBRyxFQUFFTSxZQUFhLENBQUM7RUFDNUMsTUFBTUksTUFBTSxHQUFHLElBQUlWLElBQUksQ0FBRSxHQUFHLEVBQUVNLFlBQWEsQ0FBQztFQUU1QyxPQUFPLElBQUlKLFFBQVEsQ0FBRUcsUUFBUSxFQUFFLEdBQUcsRUFBRUksTUFBTSxFQUFFLEdBQUcsRUFBRUMsTUFBTSxFQUFFO0lBQ3ZEQyxNQUFNLEVBQUVQLFlBQVksQ0FBQ08sTUFBTTtJQUMzQkMsTUFBTSxFQUFFWCxNQUFNLENBQUNZO0VBQ2pCLENBQUUsQ0FBQztBQUNMIn0=