// Copyright 2023, University of Colorado Boulder

/**
 * ReferenceLineNode is the view representation of a vertical reference line
 * The reference line is composed of a vertical line, a XDragHandler and
 * a label that indicates the numerical value of its x- position (atop the vertical line)
 * The label is only visible if valuesVisibleProperty in the preferences is set to true
 * The shadedSphere (in XDragHandler) is user-controlled.
 *
 * @author Martin Veillette
 * @author Chris Malley (PixelZoom, Inc.)
 */

import calculusGrapher from '../../calculusGrapher.js';
import CalculusGrapherPreferences from '../model/CalculusGrapherPreferences.js';
import CalculusGrapherConstants from '../CalculusGrapherConstants.js';
import NumberDisplay from '../../../../scenery-phet/js/NumberDisplay.js';
import CalculusGrapherSymbols from '../CalculusGrapherSymbols.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import CalculusGrapherColors from '../CalculusGrapherColors.js';
import ScrubberNode from './ScrubberNode.js';
import Multilink from '../../../../axon/js/Multilink.js';
import Utils from '../../../../dot/js/Utils.js';
import NumberIO from '../../../../tandem/js/types/NumberIO.js';

// number of decimal places shown for the x value, dragging snaps to this interval
const X_DECIMAL_PLACES = 1;
export default class ReferenceLineNode extends ScrubberNode {
  constructor(referenceLine, chartTransform, tandem) {
    super(referenceLine, chartTransform, {
      handleColor: referenceLine.handleColorProperty,
      lineStroke: referenceLine.lineColorProperty,
      lineDash: [],
      // solid line

      // This is a hack to keep referenceLineNode.visibleProperty from linking to referenceLine.visibleProperty in Studio.
      visibleProperty: new DerivedProperty([referenceLine.visibleProperty], visible => visible),
      tandem: tandem,
      // See https://github.com/phetsims/calculus-grapher/issues/281#issuecomment-1472217525
      phetioHandleNodeVisiblePropertyInstrumented: false
    });

    // See https://github.com/phetsims/calculus-grapher/issues/305
    const xDisplayProperty = new DerivedProperty([referenceLine.xProperty], x => Utils.roundToInterval(x, Math.pow(10, -X_DECIMAL_PLACES)), {
      tandem: tandem.createTandem('xDisplayProperty'),
      phetioValueType: NumberIO
    });

    // Create and add a numerical label at the top of the vertical line
    const numberDisplay = new NumberDisplay(xDisplayProperty, CalculusGrapherConstants.CURVE_X_RANGE, {
      align: 'center',
      decimalPlaces: X_DECIMAL_PLACES,
      valuePattern: new DerivedProperty([CalculusGrapherPreferences.functionVariableProperty, CalculusGrapherSymbols.xStringProperty, CalculusGrapherSymbols.tStringProperty], (functionVariable, xString, tString) => {
        const variableString = functionVariable === 'x' ? xString : tString;
        return `${variableString} = {{value}}`;
      }),
      useRichText: true,
      textOptions: {
        font: CalculusGrapherConstants.CONTROL_FONT,
        maxWidth: 60 // see https://github.com/phetsims/calculus-grapher/issues/304
      },

      visibleProperty: CalculusGrapherPreferences.valuesVisibleProperty,
      bottom: this.line.top - 5,
      centerX: 0,
      pickable: false // optimization, see https://github.com/phetsims/calculus-grapher/issues/210
      // No PhET-iO instrumentation, see https://github.com/phetsims/calculus-grapher/issues/305
    });

    this.addChild(numberDisplay);

    // Keep the numberDisplay centered at the top of the line.
    Multilink.multilink([this.line.boundsProperty, numberDisplay.boundsProperty], () => {
      numberDisplay.centerBottom = this.line.centerTop;
    });
  }

  /**
   * Creates an icon for the reference line.
   */
  static createIcon() {
    return ScrubberNode.createIcon(CalculusGrapherColors.referenceLineHandleColorProperty, CalculusGrapherColors.referenceLineStrokeProperty);
  }
}
calculusGrapher.register('ReferenceLineNode', ReferenceLineNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjYWxjdWx1c0dyYXBoZXIiLCJDYWxjdWx1c0dyYXBoZXJQcmVmZXJlbmNlcyIsIkNhbGN1bHVzR3JhcGhlckNvbnN0YW50cyIsIk51bWJlckRpc3BsYXkiLCJDYWxjdWx1c0dyYXBoZXJTeW1ib2xzIiwiRGVyaXZlZFByb3BlcnR5IiwiQ2FsY3VsdXNHcmFwaGVyQ29sb3JzIiwiU2NydWJiZXJOb2RlIiwiTXVsdGlsaW5rIiwiVXRpbHMiLCJOdW1iZXJJTyIsIlhfREVDSU1BTF9QTEFDRVMiLCJSZWZlcmVuY2VMaW5lTm9kZSIsImNvbnN0cnVjdG9yIiwicmVmZXJlbmNlTGluZSIsImNoYXJ0VHJhbnNmb3JtIiwidGFuZGVtIiwiaGFuZGxlQ29sb3IiLCJoYW5kbGVDb2xvclByb3BlcnR5IiwibGluZVN0cm9rZSIsImxpbmVDb2xvclByb3BlcnR5IiwibGluZURhc2giLCJ2aXNpYmxlUHJvcGVydHkiLCJ2aXNpYmxlIiwicGhldGlvSGFuZGxlTm9kZVZpc2libGVQcm9wZXJ0eUluc3RydW1lbnRlZCIsInhEaXNwbGF5UHJvcGVydHkiLCJ4UHJvcGVydHkiLCJ4Iiwicm91bmRUb0ludGVydmFsIiwiTWF0aCIsInBvdyIsImNyZWF0ZVRhbmRlbSIsInBoZXRpb1ZhbHVlVHlwZSIsIm51bWJlckRpc3BsYXkiLCJDVVJWRV9YX1JBTkdFIiwiYWxpZ24iLCJkZWNpbWFsUGxhY2VzIiwidmFsdWVQYXR0ZXJuIiwiZnVuY3Rpb25WYXJpYWJsZVByb3BlcnR5IiwieFN0cmluZ1Byb3BlcnR5IiwidFN0cmluZ1Byb3BlcnR5IiwiZnVuY3Rpb25WYXJpYWJsZSIsInhTdHJpbmciLCJ0U3RyaW5nIiwidmFyaWFibGVTdHJpbmciLCJ1c2VSaWNoVGV4dCIsInRleHRPcHRpb25zIiwiZm9udCIsIkNPTlRST0xfRk9OVCIsIm1heFdpZHRoIiwidmFsdWVzVmlzaWJsZVByb3BlcnR5IiwiYm90dG9tIiwibGluZSIsInRvcCIsImNlbnRlclgiLCJwaWNrYWJsZSIsImFkZENoaWxkIiwibXVsdGlsaW5rIiwiYm91bmRzUHJvcGVydHkiLCJjZW50ZXJCb3R0b20iLCJjZW50ZXJUb3AiLCJjcmVhdGVJY29uIiwicmVmZXJlbmNlTGluZUhhbmRsZUNvbG9yUHJvcGVydHkiLCJyZWZlcmVuY2VMaW5lU3Ryb2tlUHJvcGVydHkiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlJlZmVyZW5jZUxpbmVOb2RlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBSZWZlcmVuY2VMaW5lTm9kZSBpcyB0aGUgdmlldyByZXByZXNlbnRhdGlvbiBvZiBhIHZlcnRpY2FsIHJlZmVyZW5jZSBsaW5lXHJcbiAqIFRoZSByZWZlcmVuY2UgbGluZSBpcyBjb21wb3NlZCBvZiBhIHZlcnRpY2FsIGxpbmUsIGEgWERyYWdIYW5kbGVyIGFuZFxyXG4gKiBhIGxhYmVsIHRoYXQgaW5kaWNhdGVzIHRoZSBudW1lcmljYWwgdmFsdWUgb2YgaXRzIHgtIHBvc2l0aW9uIChhdG9wIHRoZSB2ZXJ0aWNhbCBsaW5lKVxyXG4gKiBUaGUgbGFiZWwgaXMgb25seSB2aXNpYmxlIGlmIHZhbHVlc1Zpc2libGVQcm9wZXJ0eSBpbiB0aGUgcHJlZmVyZW5jZXMgaXMgc2V0IHRvIHRydWVcclxuICogVGhlIHNoYWRlZFNwaGVyZSAoaW4gWERyYWdIYW5kbGVyKSBpcyB1c2VyLWNvbnRyb2xsZWQuXHJcbiAqXHJcbiAqIEBhdXRob3IgTWFydGluIFZlaWxsZXR0ZVxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBjYWxjdWx1c0dyYXBoZXIgZnJvbSAnLi4vLi4vY2FsY3VsdXNHcmFwaGVyLmpzJztcclxuaW1wb3J0IHsgTm9kZSB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBDaGFydFRyYW5zZm9ybSBmcm9tICcuLi8uLi8uLi8uLi9iYW1ib28vanMvQ2hhcnRUcmFuc2Zvcm0uanMnO1xyXG5pbXBvcnQgQ2FsY3VsdXNHcmFwaGVyUHJlZmVyZW5jZXMgZnJvbSAnLi4vbW9kZWwvQ2FsY3VsdXNHcmFwaGVyUHJlZmVyZW5jZXMuanMnO1xyXG5pbXBvcnQgQ2FsY3VsdXNHcmFwaGVyQ29uc3RhbnRzIGZyb20gJy4uL0NhbGN1bHVzR3JhcGhlckNvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBOdW1iZXJEaXNwbGF5IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9OdW1iZXJEaXNwbGF5LmpzJztcclxuaW1wb3J0IENhbGN1bHVzR3JhcGhlclN5bWJvbHMgZnJvbSAnLi4vQ2FsY3VsdXNHcmFwaGVyU3ltYm9scy5qcyc7XHJcbmltcG9ydCBEZXJpdmVkUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9EZXJpdmVkUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgQ2FsY3VsdXNHcmFwaGVyQ29sb3JzIGZyb20gJy4uL0NhbGN1bHVzR3JhcGhlckNvbG9ycy5qcyc7XHJcbmltcG9ydCBSZWZlcmVuY2VMaW5lIGZyb20gJy4uL21vZGVsL1JlZmVyZW5jZUxpbmUuanMnO1xyXG5pbXBvcnQgU2NydWJiZXJOb2RlIGZyb20gJy4vU2NydWJiZXJOb2RlLmpzJztcclxuaW1wb3J0IE11bHRpbGluayBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL011bHRpbGluay5qcyc7XHJcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XHJcbmltcG9ydCBVdGlscyBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVXRpbHMuanMnO1xyXG5pbXBvcnQgTnVtYmVySU8gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL3R5cGVzL051bWJlcklPLmpzJztcclxuXHJcbi8vIG51bWJlciBvZiBkZWNpbWFsIHBsYWNlcyBzaG93biBmb3IgdGhlIHggdmFsdWUsIGRyYWdnaW5nIHNuYXBzIHRvIHRoaXMgaW50ZXJ2YWxcclxuY29uc3QgWF9ERUNJTUFMX1BMQUNFUyA9IDE7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSZWZlcmVuY2VMaW5lTm9kZSBleHRlbmRzIFNjcnViYmVyTm9kZSB7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggcmVmZXJlbmNlTGluZTogUmVmZXJlbmNlTGluZSxcclxuICAgICAgICAgICAgICAgICAgICAgIGNoYXJ0VHJhbnNmb3JtOiBDaGFydFRyYW5zZm9ybSxcclxuICAgICAgICAgICAgICAgICAgICAgIHRhbmRlbTogVGFuZGVtICkge1xyXG5cclxuICAgIHN1cGVyKCByZWZlcmVuY2VMaW5lLCBjaGFydFRyYW5zZm9ybSwge1xyXG4gICAgICBoYW5kbGVDb2xvcjogcmVmZXJlbmNlTGluZS5oYW5kbGVDb2xvclByb3BlcnR5LFxyXG4gICAgICBsaW5lU3Ryb2tlOiByZWZlcmVuY2VMaW5lLmxpbmVDb2xvclByb3BlcnR5LFxyXG4gICAgICBsaW5lRGFzaDogW10sIC8vIHNvbGlkIGxpbmVcclxuXHJcbiAgICAgIC8vIFRoaXMgaXMgYSBoYWNrIHRvIGtlZXAgcmVmZXJlbmNlTGluZU5vZGUudmlzaWJsZVByb3BlcnR5IGZyb20gbGlua2luZyB0byByZWZlcmVuY2VMaW5lLnZpc2libGVQcm9wZXJ0eSBpbiBTdHVkaW8uXHJcbiAgICAgIHZpc2libGVQcm9wZXJ0eTogbmV3IERlcml2ZWRQcm9wZXJ0eSggWyByZWZlcmVuY2VMaW5lLnZpc2libGVQcm9wZXJ0eSBdLCB2aXNpYmxlID0+IHZpc2libGUgKSxcclxuICAgICAgdGFuZGVtOiB0YW5kZW0sXHJcblxyXG4gICAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2NhbGN1bHVzLWdyYXBoZXIvaXNzdWVzLzI4MSNpc3N1ZWNvbW1lbnQtMTQ3MjIxNzUyNVxyXG4gICAgICBwaGV0aW9IYW5kbGVOb2RlVmlzaWJsZVByb3BlcnR5SW5zdHJ1bWVudGVkOiBmYWxzZVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvY2FsY3VsdXMtZ3JhcGhlci9pc3N1ZXMvMzA1XHJcbiAgICBjb25zdCB4RGlzcGxheVByb3BlcnR5ID0gbmV3IERlcml2ZWRQcm9wZXJ0eSggWyByZWZlcmVuY2VMaW5lLnhQcm9wZXJ0eSBdLFxyXG4gICAgICB4ID0+IFV0aWxzLnJvdW5kVG9JbnRlcnZhbCggeCwgTWF0aC5wb3coIDEwLCAtWF9ERUNJTUFMX1BMQUNFUyApICksIHtcclxuICAgICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICd4RGlzcGxheVByb3BlcnR5JyApLFxyXG4gICAgICAgIHBoZXRpb1ZhbHVlVHlwZTogTnVtYmVySU9cclxuICAgICAgfSApO1xyXG5cclxuICAgIC8vIENyZWF0ZSBhbmQgYWRkIGEgbnVtZXJpY2FsIGxhYmVsIGF0IHRoZSB0b3Agb2YgdGhlIHZlcnRpY2FsIGxpbmVcclxuICAgIGNvbnN0IG51bWJlckRpc3BsYXkgPSBuZXcgTnVtYmVyRGlzcGxheSggeERpc3BsYXlQcm9wZXJ0eSxcclxuICAgICAgQ2FsY3VsdXNHcmFwaGVyQ29uc3RhbnRzLkNVUlZFX1hfUkFOR0UsIHtcclxuICAgICAgICBhbGlnbjogJ2NlbnRlcicsXHJcbiAgICAgICAgZGVjaW1hbFBsYWNlczogWF9ERUNJTUFMX1BMQUNFUyxcclxuICAgICAgICB2YWx1ZVBhdHRlcm46IG5ldyBEZXJpdmVkUHJvcGVydHkoXHJcbiAgICAgICAgICBbIENhbGN1bHVzR3JhcGhlclByZWZlcmVuY2VzLmZ1bmN0aW9uVmFyaWFibGVQcm9wZXJ0eSwgQ2FsY3VsdXNHcmFwaGVyU3ltYm9scy54U3RyaW5nUHJvcGVydHksIENhbGN1bHVzR3JhcGhlclN5bWJvbHMudFN0cmluZ1Byb3BlcnR5IF0sXHJcbiAgICAgICAgICAoIGZ1bmN0aW9uVmFyaWFibGUsIHhTdHJpbmcsIHRTdHJpbmcgKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IHZhcmlhYmxlU3RyaW5nID0gKCBmdW5jdGlvblZhcmlhYmxlID09PSAneCcgKSA/IHhTdHJpbmcgOiB0U3RyaW5nO1xyXG4gICAgICAgICAgICByZXR1cm4gYCR7dmFyaWFibGVTdHJpbmd9ID0ge3t2YWx1ZX19YDtcclxuICAgICAgICAgIH0gKSxcclxuICAgICAgICB1c2VSaWNoVGV4dDogdHJ1ZSxcclxuICAgICAgICB0ZXh0T3B0aW9uczoge1xyXG4gICAgICAgICAgZm9udDogQ2FsY3VsdXNHcmFwaGVyQ29uc3RhbnRzLkNPTlRST0xfRk9OVCxcclxuICAgICAgICAgIG1heFdpZHRoOiA2MCAvLyBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2NhbGN1bHVzLWdyYXBoZXIvaXNzdWVzLzMwNFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdmlzaWJsZVByb3BlcnR5OiBDYWxjdWx1c0dyYXBoZXJQcmVmZXJlbmNlcy52YWx1ZXNWaXNpYmxlUHJvcGVydHksXHJcbiAgICAgICAgYm90dG9tOiB0aGlzLmxpbmUudG9wIC0gNSxcclxuICAgICAgICBjZW50ZXJYOiAwLFxyXG4gICAgICAgIHBpY2thYmxlOiBmYWxzZSAvLyBvcHRpbWl6YXRpb24sIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvY2FsY3VsdXMtZ3JhcGhlci9pc3N1ZXMvMjEwXHJcbiAgICAgICAgLy8gTm8gUGhFVC1pTyBpbnN0cnVtZW50YXRpb24sIHNlZSBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvY2FsY3VsdXMtZ3JhcGhlci9pc3N1ZXMvMzA1XHJcbiAgICAgIH0gKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIG51bWJlckRpc3BsYXkgKTtcclxuXHJcbiAgICAvLyBLZWVwIHRoZSBudW1iZXJEaXNwbGF5IGNlbnRlcmVkIGF0IHRoZSB0b3Agb2YgdGhlIGxpbmUuXHJcbiAgICBNdWx0aWxpbmsubXVsdGlsaW5rKCBbIHRoaXMubGluZS5ib3VuZHNQcm9wZXJ0eSwgbnVtYmVyRGlzcGxheS5ib3VuZHNQcm9wZXJ0eSBdLCAoKSA9PiB7XHJcbiAgICAgIG51bWJlckRpc3BsYXkuY2VudGVyQm90dG9tID0gdGhpcy5saW5lLmNlbnRlclRvcDtcclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgYW4gaWNvbiBmb3IgdGhlIHJlZmVyZW5jZSBsaW5lLlxyXG4gICAqL1xyXG4gIHB1YmxpYyBzdGF0aWMgb3ZlcnJpZGUgY3JlYXRlSWNvbigpOiBOb2RlIHtcclxuICAgIHJldHVybiBTY3J1YmJlck5vZGUuY3JlYXRlSWNvbiggQ2FsY3VsdXNHcmFwaGVyQ29sb3JzLnJlZmVyZW5jZUxpbmVIYW5kbGVDb2xvclByb3BlcnR5LCBDYWxjdWx1c0dyYXBoZXJDb2xvcnMucmVmZXJlbmNlTGluZVN0cm9rZVByb3BlcnR5ICk7XHJcbiAgfVxyXG59XHJcbmNhbGN1bHVzR3JhcGhlci5yZWdpc3RlciggJ1JlZmVyZW5jZUxpbmVOb2RlJywgUmVmZXJlbmNlTGluZU5vZGUgKTtcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxlQUFlLE1BQU0sMEJBQTBCO0FBR3RELE9BQU9DLDBCQUEwQixNQUFNLHdDQUF3QztBQUMvRSxPQUFPQyx3QkFBd0IsTUFBTSxnQ0FBZ0M7QUFDckUsT0FBT0MsYUFBYSxNQUFNLDhDQUE4QztBQUN4RSxPQUFPQyxzQkFBc0IsTUFBTSw4QkFBOEI7QUFDakUsT0FBT0MsZUFBZSxNQUFNLHdDQUF3QztBQUNwRSxPQUFPQyxxQkFBcUIsTUFBTSw2QkFBNkI7QUFFL0QsT0FBT0MsWUFBWSxNQUFNLG1CQUFtQjtBQUM1QyxPQUFPQyxTQUFTLE1BQU0sa0NBQWtDO0FBRXhELE9BQU9DLEtBQUssTUFBTSw2QkFBNkI7QUFDL0MsT0FBT0MsUUFBUSxNQUFNLHlDQUF5Qzs7QUFFOUQ7QUFDQSxNQUFNQyxnQkFBZ0IsR0FBRyxDQUFDO0FBRTFC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