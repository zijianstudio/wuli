// Copyright 2020-2022, University of Colorado Boulder

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import optionize from '../../phet-core/js/optionize.js';
import { Circle, Line, Node } from '../../scenery/js/imports.js';
import sceneryPhet from './sceneryPhet.js';
export default class MagnifyingGlassNode extends Node {
  constructor(providedOptions) {
    const options = optionize()({
      // SelfOptions
      glassRadius: 15,
      glassFill: 'white',
      glassStroke: 'black',
      icon: null
    }, providedOptions);

    // the magnifying glass
    const glassLineWidth = 0.25 * options.glassRadius;
    const glassNode = new Circle(options.glassRadius, {
      fill: options.glassFill,
      stroke: options.glassStroke,
      lineWidth: glassLineWidth
    });

    // handle at lower-left of glass, at a 45-degree angle
    const outsideRadius = options.glassRadius + glassLineWidth / 2; // use outside radius so handle line cap doesn't appear inside glassNode
    const handleNode = new Line(outsideRadius * Math.cos(Math.PI / 4), outsideRadius * Math.sin(Math.PI / 4), options.glassRadius * Math.cos(Math.PI / 4) + 0.65 * options.glassRadius, options.glassRadius * Math.sin(Math.PI / 4) + 0.65 * options.glassRadius, {
      stroke: options.glassStroke,
      lineWidth: 0.4 * options.glassRadius,
      lineCap: 'round'
    });
    options.children = [glassNode, handleNode];
    if (options.icon) {
      options.icon.center = glassNode.center;
      options.children.push(options.icon);
    }
    super(options);
  }
}
sceneryPhet.register('MagnifyingGlassNode', MagnifyingGlassNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJvcHRpb25pemUiLCJDaXJjbGUiLCJMaW5lIiwiTm9kZSIsInNjZW5lcnlQaGV0IiwiTWFnbmlmeWluZ0dsYXNzTm9kZSIsImNvbnN0cnVjdG9yIiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsImdsYXNzUmFkaXVzIiwiZ2xhc3NGaWxsIiwiZ2xhc3NTdHJva2UiLCJpY29uIiwiZ2xhc3NMaW5lV2lkdGgiLCJnbGFzc05vZGUiLCJmaWxsIiwic3Ryb2tlIiwibGluZVdpZHRoIiwib3V0c2lkZVJhZGl1cyIsImhhbmRsZU5vZGUiLCJNYXRoIiwiY29zIiwiUEkiLCJzaW4iLCJsaW5lQ2FwIiwiY2hpbGRyZW4iLCJjZW50ZXIiLCJwdXNoIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJNYWduaWZ5aW5nR2xhc3NOb2RlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIwLTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqXHJcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IG9wdGlvbml6ZSBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvb3B0aW9uaXplLmpzJztcclxuaW1wb3J0IFN0cmljdE9taXQgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1N0cmljdE9taXQuanMnO1xyXG5pbXBvcnQgeyBDaXJjbGUsIFRDb2xvciwgTGluZSwgTm9kZSwgTm9kZU9wdGlvbnMgfSBmcm9tICcuLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgc2NlbmVyeVBoZXQgZnJvbSAnLi9zY2VuZXJ5UGhldC5qcyc7XHJcblxyXG50eXBlIFNlbGZPcHRpb25zID0ge1xyXG4gIGdsYXNzUmFkaXVzPzogbnVtYmVyO1xyXG4gIGdsYXNzRmlsbD86IFRDb2xvcjsgLy8gY2VudGVyIG9mIHRoZSBnbGFzc1xyXG4gIGdsYXNzU3Ryb2tlPzogVENvbG9yOyAvLyByaW0gYW5kIGhhbmRsZVxyXG4gIGljb24/OiBOb2RlIHwgbnVsbDsgLy8gb3B0aW9uYWwgaWNvbiB3aWxsIGJlIGNlbnRlcmVkIGluIHRoZSBnbGFzcyBhcmVhLCBpZiBwcm92aWRlZFxyXG59O1xyXG5cclxuZXhwb3J0IHR5cGUgTWFnbmlmeWluZ0dsYXNzTm9kZU9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIFN0cmljdE9taXQ8Tm9kZU9wdGlvbnMsICdjaGlsZHJlbic+O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTWFnbmlmeWluZ0dsYXNzTm9kZSBleHRlbmRzIE5vZGUge1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHByb3ZpZGVkT3B0aW9uczogTWFnbmlmeWluZ0dsYXNzTm9kZU9wdGlvbnMgKSB7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxNYWduaWZ5aW5nR2xhc3NOb2RlT3B0aW9ucywgU2VsZk9wdGlvbnMsIE5vZGVPcHRpb25zPigpKCB7XHJcblxyXG4gICAgICAvLyBTZWxmT3B0aW9uc1xyXG4gICAgICBnbGFzc1JhZGl1czogMTUsXHJcbiAgICAgIGdsYXNzRmlsbDogJ3doaXRlJyxcclxuICAgICAgZ2xhc3NTdHJva2U6ICdibGFjaycsXHJcbiAgICAgIGljb246IG51bGxcclxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIC8vIHRoZSBtYWduaWZ5aW5nIGdsYXNzXHJcbiAgICBjb25zdCBnbGFzc0xpbmVXaWR0aCA9IDAuMjUgKiBvcHRpb25zLmdsYXNzUmFkaXVzO1xyXG4gICAgY29uc3QgZ2xhc3NOb2RlID0gbmV3IENpcmNsZSggb3B0aW9ucy5nbGFzc1JhZGl1cywge1xyXG4gICAgICBmaWxsOiBvcHRpb25zLmdsYXNzRmlsbCxcclxuICAgICAgc3Ryb2tlOiBvcHRpb25zLmdsYXNzU3Ryb2tlLFxyXG4gICAgICBsaW5lV2lkdGg6IGdsYXNzTGluZVdpZHRoXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gaGFuZGxlIGF0IGxvd2VyLWxlZnQgb2YgZ2xhc3MsIGF0IGEgNDUtZGVncmVlIGFuZ2xlXHJcbiAgICBjb25zdCBvdXRzaWRlUmFkaXVzID0gb3B0aW9ucy5nbGFzc1JhZGl1cyArICggZ2xhc3NMaW5lV2lkdGggLyAyICk7IC8vIHVzZSBvdXRzaWRlIHJhZGl1cyBzbyBoYW5kbGUgbGluZSBjYXAgZG9lc24ndCBhcHBlYXIgaW5zaWRlIGdsYXNzTm9kZVxyXG4gICAgY29uc3QgaGFuZGxlTm9kZSA9IG5ldyBMaW5lKFxyXG4gICAgICBvdXRzaWRlUmFkaXVzICogTWF0aC5jb3MoIE1hdGguUEkgLyA0ICksIG91dHNpZGVSYWRpdXMgKiBNYXRoLnNpbiggTWF0aC5QSSAvIDQgKSxcclxuICAgICAgb3B0aW9ucy5nbGFzc1JhZGl1cyAqIE1hdGguY29zKCBNYXRoLlBJIC8gNCApICsgKCAwLjY1ICogb3B0aW9ucy5nbGFzc1JhZGl1cyApLCBvcHRpb25zLmdsYXNzUmFkaXVzICogTWF0aC5zaW4oIE1hdGguUEkgLyA0ICkgKyAoIDAuNjUgKiBvcHRpb25zLmdsYXNzUmFkaXVzICksIHtcclxuICAgICAgICBzdHJva2U6IG9wdGlvbnMuZ2xhc3NTdHJva2UsXHJcbiAgICAgICAgbGluZVdpZHRoOiAwLjQgKiBvcHRpb25zLmdsYXNzUmFkaXVzLFxyXG4gICAgICAgIGxpbmVDYXA6ICdyb3VuZCdcclxuICAgICAgfSApO1xyXG5cclxuICAgIG9wdGlvbnMuY2hpbGRyZW4gPSBbIGdsYXNzTm9kZSwgaGFuZGxlTm9kZSBdO1xyXG5cclxuICAgIGlmICggb3B0aW9ucy5pY29uICkge1xyXG4gICAgICBvcHRpb25zLmljb24uY2VudGVyID0gZ2xhc3NOb2RlLmNlbnRlcjtcclxuICAgICAgb3B0aW9ucy5jaGlsZHJlbi5wdXNoKCBvcHRpb25zLmljb24gKTtcclxuICAgIH1cclxuXHJcbiAgICBzdXBlciggb3B0aW9ucyApO1xyXG4gIH1cclxufVxyXG5cclxuc2NlbmVyeVBoZXQucmVnaXN0ZXIoICdNYWduaWZ5aW5nR2xhc3NOb2RlJywgTWFnbmlmeWluZ0dsYXNzTm9kZSApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsU0FBUyxNQUFNLGlDQUFpQztBQUV2RCxTQUFTQyxNQUFNLEVBQVVDLElBQUksRUFBRUMsSUFBSSxRQUFxQiw2QkFBNkI7QUFDckYsT0FBT0MsV0FBVyxNQUFNLGtCQUFrQjtBQVcxQyxlQUFlLE1BQU1DLG1CQUFtQixTQUFTRixJQUFJLENBQUM7RUFFN0NHLFdBQVdBLENBQUVDLGVBQTJDLEVBQUc7SUFFaEUsTUFBTUMsT0FBTyxHQUFHUixTQUFTLENBQXVELENBQUMsQ0FBRTtNQUVqRjtNQUNBUyxXQUFXLEVBQUUsRUFBRTtNQUNmQyxTQUFTLEVBQUUsT0FBTztNQUNsQkMsV0FBVyxFQUFFLE9BQU87TUFDcEJDLElBQUksRUFBRTtJQUNSLENBQUMsRUFBRUwsZUFBZ0IsQ0FBQzs7SUFFcEI7SUFDQSxNQUFNTSxjQUFjLEdBQUcsSUFBSSxHQUFHTCxPQUFPLENBQUNDLFdBQVc7SUFDakQsTUFBTUssU0FBUyxHQUFHLElBQUliLE1BQU0sQ0FBRU8sT0FBTyxDQUFDQyxXQUFXLEVBQUU7TUFDakRNLElBQUksRUFBRVAsT0FBTyxDQUFDRSxTQUFTO01BQ3ZCTSxNQUFNLEVBQUVSLE9BQU8sQ0FBQ0csV0FBVztNQUMzQk0sU0FBUyxFQUFFSjtJQUNiLENBQUUsQ0FBQzs7SUFFSDtJQUNBLE1BQU1LLGFBQWEsR0FBR1YsT0FBTyxDQUFDQyxXQUFXLEdBQUtJLGNBQWMsR0FBRyxDQUFHLENBQUMsQ0FBQztJQUNwRSxNQUFNTSxVQUFVLEdBQUcsSUFBSWpCLElBQUksQ0FDekJnQixhQUFhLEdBQUdFLElBQUksQ0FBQ0MsR0FBRyxDQUFFRCxJQUFJLENBQUNFLEVBQUUsR0FBRyxDQUFFLENBQUMsRUFBRUosYUFBYSxHQUFHRSxJQUFJLENBQUNHLEdBQUcsQ0FBRUgsSUFBSSxDQUFDRSxFQUFFLEdBQUcsQ0FBRSxDQUFDLEVBQ2hGZCxPQUFPLENBQUNDLFdBQVcsR0FBR1csSUFBSSxDQUFDQyxHQUFHLENBQUVELElBQUksQ0FBQ0UsRUFBRSxHQUFHLENBQUUsQ0FBQyxHQUFLLElBQUksR0FBR2QsT0FBTyxDQUFDQyxXQUFhLEVBQUVELE9BQU8sQ0FBQ0MsV0FBVyxHQUFHVyxJQUFJLENBQUNHLEdBQUcsQ0FBRUgsSUFBSSxDQUFDRSxFQUFFLEdBQUcsQ0FBRSxDQUFDLEdBQUssSUFBSSxHQUFHZCxPQUFPLENBQUNDLFdBQWEsRUFBRTtNQUM5Sk8sTUFBTSxFQUFFUixPQUFPLENBQUNHLFdBQVc7TUFDM0JNLFNBQVMsRUFBRSxHQUFHLEdBQUdULE9BQU8sQ0FBQ0MsV0FBVztNQUNwQ2UsT0FBTyxFQUFFO0lBQ1gsQ0FBRSxDQUFDO0lBRUxoQixPQUFPLENBQUNpQixRQUFRLEdBQUcsQ0FBRVgsU0FBUyxFQUFFSyxVQUFVLENBQUU7SUFFNUMsSUFBS1gsT0FBTyxDQUFDSSxJQUFJLEVBQUc7TUFDbEJKLE9BQU8sQ0FBQ0ksSUFBSSxDQUFDYyxNQUFNLEdBQUdaLFNBQVMsQ0FBQ1ksTUFBTTtNQUN0Q2xCLE9BQU8sQ0FBQ2lCLFFBQVEsQ0FBQ0UsSUFBSSxDQUFFbkIsT0FBTyxDQUFDSSxJQUFLLENBQUM7SUFDdkM7SUFFQSxLQUFLLENBQUVKLE9BQVEsQ0FBQztFQUNsQjtBQUNGO0FBRUFKLFdBQVcsQ0FBQ3dCLFFBQVEsQ0FBRSxxQkFBcUIsRUFBRXZCLG1CQUFvQixDQUFDIn0=