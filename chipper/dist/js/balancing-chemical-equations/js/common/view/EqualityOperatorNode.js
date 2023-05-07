// Copyright 2014-2023, University of Colorado Boulder

/**
 * Equality operator between 2 sides of equation: equals (balanced) or not equals (not balanced).
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import optionize, { combineOptions } from '../../../../phet-core/js/optionize.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Node, Text } from '../../../../scenery/js/imports.js';
import balancingChemicalEquations from '../../balancingChemicalEquations.js';
import BCEConstants from '../BCEConstants.js';
export default class EqualityOperatorNode extends Node {
  constructor(equationProperty, providedOptions) {
    const options = optionize()({}, providedOptions);
    const textOptions = {
      font: new PhetFont(80),
      stroke: 'black'
    };
    const equalsSignNode = new Text('\u003D', combineOptions({
      fill: BCEConstants.BALANCED_HIGHLIGHT_COLOR
    }, textOptions));
    const notEqualsSignNode = new Text('\u2260', combineOptions({
      fill: BCEConstants.UNBALANCED_COLOR,
      center: equalsSignNode.center
    }, textOptions));
    options.children = [equalsSignNode, notEqualsSignNode];
    super(options);

    // show the correct operator, based on whether the equation is balanced
    const balancedObserver = balanced => {
      equalsSignNode.visible = balanced;
      notEqualsSignNode.visible = !balanced;
    };
    equationProperty.link((newEquation, oldEquation) => {
      if (oldEquation) {
        oldEquation.balancedProperty.unlink(balancedObserver);
      }
      newEquation.balancedProperty.link(balancedObserver);
    });
  }

  // No dispose needed, instances of this type persist for lifetime of the sim.
}

balancingChemicalEquations.register('EqualityOperatorNode', EqualityOperatorNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJvcHRpb25pemUiLCJjb21iaW5lT3B0aW9ucyIsIlBoZXRGb250IiwiTm9kZSIsIlRleHQiLCJiYWxhbmNpbmdDaGVtaWNhbEVxdWF0aW9ucyIsIkJDRUNvbnN0YW50cyIsIkVxdWFsaXR5T3BlcmF0b3JOb2RlIiwiY29uc3RydWN0b3IiLCJlcXVhdGlvblByb3BlcnR5IiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsInRleHRPcHRpb25zIiwiZm9udCIsInN0cm9rZSIsImVxdWFsc1NpZ25Ob2RlIiwiZmlsbCIsIkJBTEFOQ0VEX0hJR0hMSUdIVF9DT0xPUiIsIm5vdEVxdWFsc1NpZ25Ob2RlIiwiVU5CQUxBTkNFRF9DT0xPUiIsImNlbnRlciIsImNoaWxkcmVuIiwiYmFsYW5jZWRPYnNlcnZlciIsImJhbGFuY2VkIiwidmlzaWJsZSIsImxpbmsiLCJuZXdFcXVhdGlvbiIsIm9sZEVxdWF0aW9uIiwiYmFsYW5jZWRQcm9wZXJ0eSIsInVubGluayIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiRXF1YWxpdHlPcGVyYXRvck5vZGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTQtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogRXF1YWxpdHkgb3BlcmF0b3IgYmV0d2VlbiAyIHNpZGVzIG9mIGVxdWF0aW9uOiBlcXVhbHMgKGJhbGFuY2VkKSBvciBub3QgZXF1YWxzIChub3QgYmFsYW5jZWQpLlxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBUUmVhZE9ubHlQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1RSZWFkT25seVByb3BlcnR5LmpzJztcclxuaW1wb3J0IG9wdGlvbml6ZSwgeyBjb21iaW5lT3B0aW9ucywgRW1wdHlTZWxmT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgUGhldEZvbnQgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1BoZXRGb250LmpzJztcclxuaW1wb3J0IHsgTm9kZSwgTm9kZU9wdGlvbnMsIE5vZGVUcmFuc2xhdGlvbk9wdGlvbnMsIFRleHQsIFRleHRPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IGJhbGFuY2luZ0NoZW1pY2FsRXF1YXRpb25zIGZyb20gJy4uLy4uL2JhbGFuY2luZ0NoZW1pY2FsRXF1YXRpb25zLmpzJztcclxuaW1wb3J0IEJDRUNvbnN0YW50cyBmcm9tICcuLi9CQ0VDb25zdGFudHMuanMnO1xyXG5pbXBvcnQgRXF1YXRpb24gZnJvbSAnLi4vbW9kZWwvRXF1YXRpb24uanMnO1xyXG5cclxudHlwZSBTZWxmT3B0aW9ucyA9IEVtcHR5U2VsZk9wdGlvbnM7XHJcblxyXG50eXBlIEVxdWFsaXR5T3BlcmF0b3JOb2RlT3B0aW9ucyA9IFNlbGZPcHRpb25zICYgTm9kZVRyYW5zbGF0aW9uT3B0aW9ucztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEVxdWFsaXR5T3BlcmF0b3JOb2RlIGV4dGVuZHMgTm9kZSB7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggZXF1YXRpb25Qcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8RXF1YXRpb24+LCBwcm92aWRlZE9wdGlvbnM/OiBFcXVhbGl0eU9wZXJhdG9yTm9kZU9wdGlvbnMgKSB7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxFcXVhbGl0eU9wZXJhdG9yTm9kZU9wdGlvbnMsIFNlbGZPcHRpb25zLCBOb2RlT3B0aW9ucz4oKSgge30sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIGNvbnN0IHRleHRPcHRpb25zID0ge1xyXG4gICAgICBmb250OiBuZXcgUGhldEZvbnQoIDgwICksXHJcbiAgICAgIHN0cm9rZTogJ2JsYWNrJ1xyXG4gICAgfTtcclxuXHJcbiAgICBjb25zdCBlcXVhbHNTaWduTm9kZSA9IG5ldyBUZXh0KCAnXFx1MDAzRCcsIGNvbWJpbmVPcHRpb25zPFRleHRPcHRpb25zPigge1xyXG4gICAgICBmaWxsOiBCQ0VDb25zdGFudHMuQkFMQU5DRURfSElHSExJR0hUX0NPTE9SXHJcbiAgICB9LCB0ZXh0T3B0aW9ucyApICk7XHJcblxyXG4gICAgY29uc3Qgbm90RXF1YWxzU2lnbk5vZGUgPSBuZXcgVGV4dCggJ1xcdTIyNjAnLCBjb21iaW5lT3B0aW9uczxUZXh0T3B0aW9ucz4oIHtcclxuICAgICAgZmlsbDogQkNFQ29uc3RhbnRzLlVOQkFMQU5DRURfQ09MT1IsIGNlbnRlcjogZXF1YWxzU2lnbk5vZGUuY2VudGVyXHJcbiAgICB9LCB0ZXh0T3B0aW9ucyApICk7XHJcblxyXG4gICAgb3B0aW9ucy5jaGlsZHJlbiA9IFsgZXF1YWxzU2lnbk5vZGUsIG5vdEVxdWFsc1NpZ25Ob2RlIF07XHJcblxyXG4gICAgc3VwZXIoIG9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBzaG93IHRoZSBjb3JyZWN0IG9wZXJhdG9yLCBiYXNlZCBvbiB3aGV0aGVyIHRoZSBlcXVhdGlvbiBpcyBiYWxhbmNlZFxyXG4gICAgY29uc3QgYmFsYW5jZWRPYnNlcnZlciA9ICggYmFsYW5jZWQ6IGJvb2xlYW4gKSA9PiB7XHJcbiAgICAgIGVxdWFsc1NpZ25Ob2RlLnZpc2libGUgPSBiYWxhbmNlZDtcclxuICAgICAgbm90RXF1YWxzU2lnbk5vZGUudmlzaWJsZSA9ICFiYWxhbmNlZDtcclxuICAgIH07XHJcbiAgICBlcXVhdGlvblByb3BlcnR5LmxpbmsoICggbmV3RXF1YXRpb24sIG9sZEVxdWF0aW9uICkgPT4ge1xyXG4gICAgICBpZiAoIG9sZEVxdWF0aW9uICkge1xyXG4gICAgICAgIG9sZEVxdWF0aW9uLmJhbGFuY2VkUHJvcGVydHkudW5saW5rKCBiYWxhbmNlZE9ic2VydmVyICk7XHJcbiAgICAgIH1cclxuICAgICAgbmV3RXF1YXRpb24uYmFsYW5jZWRQcm9wZXJ0eS5saW5rKCBiYWxhbmNlZE9ic2VydmVyICk7XHJcbiAgICB9ICk7XHJcbiAgfVxyXG5cclxuICAvLyBObyBkaXNwb3NlIG5lZWRlZCwgaW5zdGFuY2VzIG9mIHRoaXMgdHlwZSBwZXJzaXN0IGZvciBsaWZldGltZSBvZiB0aGUgc2ltLlxyXG59XHJcblxyXG5iYWxhbmNpbmdDaGVtaWNhbEVxdWF0aW9ucy5yZWdpc3RlciggJ0VxdWFsaXR5T3BlcmF0b3JOb2RlJywgRXF1YWxpdHlPcGVyYXRvck5vZGUgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBR0EsT0FBT0EsU0FBUyxJQUFJQyxjQUFjLFFBQTBCLHVDQUF1QztBQUNuRyxPQUFPQyxRQUFRLE1BQU0seUNBQXlDO0FBQzlELFNBQVNDLElBQUksRUFBdUNDLElBQUksUUFBcUIsbUNBQW1DO0FBQ2hILE9BQU9DLDBCQUEwQixNQUFNLHFDQUFxQztBQUM1RSxPQUFPQyxZQUFZLE1BQU0sb0JBQW9CO0FBTzdDLGVBQWUsTUFBTUMsb0JBQW9CLFNBQVNKLElBQUksQ0FBQztFQUU5Q0ssV0FBV0EsQ0FBRUMsZ0JBQTZDLEVBQUVDLGVBQTZDLEVBQUc7SUFFakgsTUFBTUMsT0FBTyxHQUFHWCxTQUFTLENBQXdELENBQUMsQ0FBRSxDQUFDLENBQUMsRUFBRVUsZUFBZ0IsQ0FBQztJQUV6RyxNQUFNRSxXQUFXLEdBQUc7TUFDbEJDLElBQUksRUFBRSxJQUFJWCxRQUFRLENBQUUsRUFBRyxDQUFDO01BQ3hCWSxNQUFNLEVBQUU7SUFDVixDQUFDO0lBRUQsTUFBTUMsY0FBYyxHQUFHLElBQUlYLElBQUksQ0FBRSxRQUFRLEVBQUVILGNBQWMsQ0FBZTtNQUN0RWUsSUFBSSxFQUFFVixZQUFZLENBQUNXO0lBQ3JCLENBQUMsRUFBRUwsV0FBWSxDQUFFLENBQUM7SUFFbEIsTUFBTU0saUJBQWlCLEdBQUcsSUFBSWQsSUFBSSxDQUFFLFFBQVEsRUFBRUgsY0FBYyxDQUFlO01BQ3pFZSxJQUFJLEVBQUVWLFlBQVksQ0FBQ2EsZ0JBQWdCO01BQUVDLE1BQU0sRUFBRUwsY0FBYyxDQUFDSztJQUM5RCxDQUFDLEVBQUVSLFdBQVksQ0FBRSxDQUFDO0lBRWxCRCxPQUFPLENBQUNVLFFBQVEsR0FBRyxDQUFFTixjQUFjLEVBQUVHLGlCQUFpQixDQUFFO0lBRXhELEtBQUssQ0FBRVAsT0FBUSxDQUFDOztJQUVoQjtJQUNBLE1BQU1XLGdCQUFnQixHQUFLQyxRQUFpQixJQUFNO01BQ2hEUixjQUFjLENBQUNTLE9BQU8sR0FBR0QsUUFBUTtNQUNqQ0wsaUJBQWlCLENBQUNNLE9BQU8sR0FBRyxDQUFDRCxRQUFRO0lBQ3ZDLENBQUM7SUFDRGQsZ0JBQWdCLENBQUNnQixJQUFJLENBQUUsQ0FBRUMsV0FBVyxFQUFFQyxXQUFXLEtBQU07TUFDckQsSUFBS0EsV0FBVyxFQUFHO1FBQ2pCQSxXQUFXLENBQUNDLGdCQUFnQixDQUFDQyxNQUFNLENBQUVQLGdCQUFpQixDQUFDO01BQ3pEO01BQ0FJLFdBQVcsQ0FBQ0UsZ0JBQWdCLENBQUNILElBQUksQ0FBRUgsZ0JBQWlCLENBQUM7SUFDdkQsQ0FBRSxDQUFDO0VBQ0w7O0VBRUE7QUFDRjs7QUFFQWpCLDBCQUEwQixDQUFDeUIsUUFBUSxDQUFFLHNCQUFzQixFQUFFdkIsb0JBQXFCLENBQUMifQ==