// Copyright 2013-2022, University of Colorado Boulder

/**
 * Button for expanding/collapsing something.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import { Shape } from '../../kite/js/imports.js';
import InstanceRegistry from '../../phet-core/js/documentation/InstanceRegistry.js';
import optionize from '../../phet-core/js/optionize.js';
import { Path } from '../../scenery/js/imports.js';
import Tandem from '../../tandem/js/Tandem.js';
import BooleanRectangularToggleButton from './buttons/BooleanRectangularToggleButton.js';
import ButtonNode from './buttons/ButtonNode.js';
import sun from './sun.js';
// constants
const SYMBOL_RELATIVE_WIDTH = 0.6; // width of +/- symbols relative to button sideLength (see options)
const RELATIVE_X_MARGIN = (1 - SYMBOL_RELATIVE_WIDTH) / 2; // margin to produce a button of specified sideLength

export default class ExpandCollapseButton extends BooleanRectangularToggleButton {
  constructor(expandedProperty, providedOptions) {
    const options = optionize()({
      // SelfOptions
      sideLength: 25,
      // BooleanRectangularToggleButtonOptions
      stroke: 'black',
      touchAreaXDilation: 5,
      touchAreaYDilation: 5,
      // phet-io
      tandem: Tandem.REQUIRED,
      tandemNameSuffix: 'Button'
    }, providedOptions);

    // BooleanRectangularToggleButtonOptions that are controlled by ExpandCollapseButton
    options.cornerRadius = 0.1 * options.sideLength;
    options.xMargin = RELATIVE_X_MARGIN * options.sideLength;
    options.yMargin = options.xMargin;
    options.buttonAppearanceStrategy = ButtonNode.FlatAppearanceStrategy;

    // configure the +/- symbol on the button
    const symbolLength = SYMBOL_RELATIVE_WIDTH * options.sideLength;
    const symbolLineWidth = 0.15 * options.sideLength;
    const symbolOptions = {
      lineWidth: symbolLineWidth,
      stroke: 'white',
      centerX: options.sideLength / 2,
      centerY: options.sideLength / 2,
      pickable: false
    };

    // Expand '+' content
    const plusSymbolShape = new Shape().moveTo(symbolLength / 2, 0).lineTo(symbolLength / 2, symbolLength).moveTo(0, symbolLength / 2).lineTo(symbolLength, symbolLength / 2);
    const expandNode = new Path(plusSymbolShape, symbolOptions);

    // Collapse '-' content
    const minusSymbolShape = new Shape().moveTo(-symbolLength / 2, 0).lineTo(symbolLength / 2, 0);
    const collapseNode = new Path(minusSymbolShape, symbolOptions);
    super(expandedProperty, collapseNode, expandNode, options);

    // listeners must be removed in dispose
    const expandedPropertyObserver = expanded => {
      //TODO use PhetColorScheme.RED_COLORBLIND, see https://github.com/phetsims/sun/issues/485
      this.baseColor = expanded ? 'rgb( 255, 85, 0 )' : 'rgb( 0, 179, 0 )';
      this.setPDOMAttribute('aria-expanded', expanded);
    };
    expandedProperty.link(expandedPropertyObserver);

    // support for binder documentation, stripped out in builds and only runs when ?binder is specified
    assert && phet.chipper.queryParameters.binder && InstanceRegistry.registerDataURL('sun', 'ExpandCollapseButton', this);
    this.disposeExpandCollapseButton = () => {
      expandedProperty.unlink(expandedPropertyObserver);
    };
  }
  dispose() {
    this.disposeExpandCollapseButton();
    super.dispose();
  }
}
sun.register('ExpandCollapseButton', ExpandCollapseButton);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTaGFwZSIsIkluc3RhbmNlUmVnaXN0cnkiLCJvcHRpb25pemUiLCJQYXRoIiwiVGFuZGVtIiwiQm9vbGVhblJlY3Rhbmd1bGFyVG9nZ2xlQnV0dG9uIiwiQnV0dG9uTm9kZSIsInN1biIsIlNZTUJPTF9SRUxBVElWRV9XSURUSCIsIlJFTEFUSVZFX1hfTUFSR0lOIiwiRXhwYW5kQ29sbGFwc2VCdXR0b24iLCJjb25zdHJ1Y3RvciIsImV4cGFuZGVkUHJvcGVydHkiLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwic2lkZUxlbmd0aCIsInN0cm9rZSIsInRvdWNoQXJlYVhEaWxhdGlvbiIsInRvdWNoQXJlYVlEaWxhdGlvbiIsInRhbmRlbSIsIlJFUVVJUkVEIiwidGFuZGVtTmFtZVN1ZmZpeCIsImNvcm5lclJhZGl1cyIsInhNYXJnaW4iLCJ5TWFyZ2luIiwiYnV0dG9uQXBwZWFyYW5jZVN0cmF0ZWd5IiwiRmxhdEFwcGVhcmFuY2VTdHJhdGVneSIsInN5bWJvbExlbmd0aCIsInN5bWJvbExpbmVXaWR0aCIsInN5bWJvbE9wdGlvbnMiLCJsaW5lV2lkdGgiLCJjZW50ZXJYIiwiY2VudGVyWSIsInBpY2thYmxlIiwicGx1c1N5bWJvbFNoYXBlIiwibW92ZVRvIiwibGluZVRvIiwiZXhwYW5kTm9kZSIsIm1pbnVzU3ltYm9sU2hhcGUiLCJjb2xsYXBzZU5vZGUiLCJleHBhbmRlZFByb3BlcnR5T2JzZXJ2ZXIiLCJleHBhbmRlZCIsImJhc2VDb2xvciIsInNldFBET01BdHRyaWJ1dGUiLCJsaW5rIiwiYXNzZXJ0IiwicGhldCIsImNoaXBwZXIiLCJxdWVyeVBhcmFtZXRlcnMiLCJiaW5kZXIiLCJyZWdpc3RlckRhdGFVUkwiLCJkaXNwb3NlRXhwYW5kQ29sbGFwc2VCdXR0b24iLCJ1bmxpbmsiLCJkaXNwb3NlIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJFeHBhbmRDb2xsYXBzZUJ1dHRvbi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxMy0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBCdXR0b24gZm9yIGV4cGFuZGluZy9jb2xsYXBzaW5nIHNvbWV0aGluZy5cclxuICpcclxuICogQGF1dGhvciBDaHJpcyBNYWxsZXkgKFBpeGVsWm9vbSwgSW5jLilcclxuICogQGF1dGhvciBKZXNzZSBHcmVlbmJlcmcgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IFN0cmljdE9taXQgZnJvbSAnLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1N0cmljdE9taXQuanMnO1xyXG5pbXBvcnQgeyBTaGFwZSB9IGZyb20gJy4uLy4uL2tpdGUvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBJbnN0YW5jZVJlZ2lzdHJ5IGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9kb2N1bWVudGF0aW9uL0luc3RhbmNlUmVnaXN0cnkuanMnO1xyXG5pbXBvcnQgb3B0aW9uaXplIGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgeyBQYXRoIH0gZnJvbSAnLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcclxuaW1wb3J0IEJvb2xlYW5SZWN0YW5ndWxhclRvZ2dsZUJ1dHRvbiwgeyBCb29sZWFuUmVjdGFuZ3VsYXJUb2dnbGVCdXR0b25PcHRpb25zIH0gZnJvbSAnLi9idXR0b25zL0Jvb2xlYW5SZWN0YW5ndWxhclRvZ2dsZUJ1dHRvbi5qcyc7XHJcbmltcG9ydCBCdXR0b25Ob2RlIGZyb20gJy4vYnV0dG9ucy9CdXR0b25Ob2RlLmpzJztcclxuaW1wb3J0IHN1biBmcm9tICcuL3N1bi5qcyc7XHJcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBTWU1CT0xfUkVMQVRJVkVfV0lEVEggPSAwLjY7IC8vIHdpZHRoIG9mICsvLSBzeW1ib2xzIHJlbGF0aXZlIHRvIGJ1dHRvbiBzaWRlTGVuZ3RoIChzZWUgb3B0aW9ucylcclxuY29uc3QgUkVMQVRJVkVfWF9NQVJHSU4gPSAoIDEgLSBTWU1CT0xfUkVMQVRJVkVfV0lEVEggKSAvIDI7IC8vIG1hcmdpbiB0byBwcm9kdWNlIGEgYnV0dG9uIG9mIHNwZWNpZmllZCBzaWRlTGVuZ3RoXHJcblxyXG50eXBlIFNlbGZPcHRpb25zID0ge1xyXG4gIHNpZGVMZW5ndGg/OiBudW1iZXI7IC8vIGxlbmd0aCBvZiBvbmUgc2lkZSBvZiB0aGUgc3F1YXJlIGJ1dHRvblxyXG59O1xyXG5cclxuZXhwb3J0IHR5cGUgRXhwYW5kQ29sbGFwc2VCdXR0b25PcHRpb25zID0gU2VsZk9wdGlvbnMgJlxyXG4gIFN0cmljdE9taXQ8Qm9vbGVhblJlY3Rhbmd1bGFyVG9nZ2xlQnV0dG9uT3B0aW9ucywgJ2Nvcm5lclJhZGl1cycgfCAneE1hcmdpbicgfCAneU1hcmdpbicgfCAnYnV0dG9uQXBwZWFyYW5jZVN0cmF0ZWd5Jz47XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBFeHBhbmRDb2xsYXBzZUJ1dHRvbiBleHRlbmRzIEJvb2xlYW5SZWN0YW5ndWxhclRvZ2dsZUJ1dHRvbiB7XHJcblxyXG4gIHByaXZhdGUgcmVhZG9ubHkgZGlzcG9zZUV4cGFuZENvbGxhcHNlQnV0dG9uOiAoKSA9PiB2b2lkO1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIGV4cGFuZGVkUHJvcGVydHk6IFByb3BlcnR5PGJvb2xlYW4+LCBwcm92aWRlZE9wdGlvbnM/OiBFeHBhbmRDb2xsYXBzZUJ1dHRvbk9wdGlvbnMgKSB7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxFeHBhbmRDb2xsYXBzZUJ1dHRvbk9wdGlvbnMsIFNlbGZPcHRpb25zLCBCb29sZWFuUmVjdGFuZ3VsYXJUb2dnbGVCdXR0b25PcHRpb25zPigpKCB7XHJcblxyXG4gICAgICAvLyBTZWxmT3B0aW9uc1xyXG4gICAgICBzaWRlTGVuZ3RoOiAyNSxcclxuXHJcbiAgICAgIC8vIEJvb2xlYW5SZWN0YW5ndWxhclRvZ2dsZUJ1dHRvbk9wdGlvbnNcclxuICAgICAgc3Ryb2tlOiAnYmxhY2snLFxyXG4gICAgICB0b3VjaEFyZWFYRGlsYXRpb246IDUsXHJcbiAgICAgIHRvdWNoQXJlYVlEaWxhdGlvbjogNSxcclxuXHJcbiAgICAgIC8vIHBoZXQtaW9cclxuICAgICAgdGFuZGVtOiBUYW5kZW0uUkVRVUlSRUQsXHJcbiAgICAgIHRhbmRlbU5hbWVTdWZmaXg6ICdCdXR0b24nXHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBCb29sZWFuUmVjdGFuZ3VsYXJUb2dnbGVCdXR0b25PcHRpb25zIHRoYXQgYXJlIGNvbnRyb2xsZWQgYnkgRXhwYW5kQ29sbGFwc2VCdXR0b25cclxuICAgIG9wdGlvbnMuY29ybmVyUmFkaXVzID0gMC4xICogb3B0aW9ucy5zaWRlTGVuZ3RoO1xyXG4gICAgb3B0aW9ucy54TWFyZ2luID0gUkVMQVRJVkVfWF9NQVJHSU4gKiBvcHRpb25zLnNpZGVMZW5ndGg7XHJcbiAgICBvcHRpb25zLnlNYXJnaW4gPSBvcHRpb25zLnhNYXJnaW47XHJcbiAgICBvcHRpb25zLmJ1dHRvbkFwcGVhcmFuY2VTdHJhdGVneSA9IEJ1dHRvbk5vZGUuRmxhdEFwcGVhcmFuY2VTdHJhdGVneTtcclxuXHJcbiAgICAvLyBjb25maWd1cmUgdGhlICsvLSBzeW1ib2wgb24gdGhlIGJ1dHRvblxyXG4gICAgY29uc3Qgc3ltYm9sTGVuZ3RoID0gU1lNQk9MX1JFTEFUSVZFX1dJRFRIICogb3B0aW9ucy5zaWRlTGVuZ3RoO1xyXG4gICAgY29uc3Qgc3ltYm9sTGluZVdpZHRoID0gMC4xNSAqIG9wdGlvbnMuc2lkZUxlbmd0aDtcclxuICAgIGNvbnN0IHN5bWJvbE9wdGlvbnMgPSB7XHJcbiAgICAgIGxpbmVXaWR0aDogc3ltYm9sTGluZVdpZHRoLFxyXG4gICAgICBzdHJva2U6ICd3aGl0ZScsXHJcbiAgICAgIGNlbnRlclg6IG9wdGlvbnMuc2lkZUxlbmd0aCAvIDIsXHJcbiAgICAgIGNlbnRlclk6IG9wdGlvbnMuc2lkZUxlbmd0aCAvIDIsXHJcbiAgICAgIHBpY2thYmxlOiBmYWxzZVxyXG4gICAgfTtcclxuXHJcbiAgICAvLyBFeHBhbmQgJysnIGNvbnRlbnRcclxuICAgIGNvbnN0IHBsdXNTeW1ib2xTaGFwZSA9IG5ldyBTaGFwZSgpXHJcbiAgICAgIC5tb3ZlVG8oIHN5bWJvbExlbmd0aCAvIDIsIDAgKVxyXG4gICAgICAubGluZVRvKCBzeW1ib2xMZW5ndGggLyAyLCBzeW1ib2xMZW5ndGggKVxyXG4gICAgICAubW92ZVRvKCAwLCBzeW1ib2xMZW5ndGggLyAyIClcclxuICAgICAgLmxpbmVUbyggc3ltYm9sTGVuZ3RoLCBzeW1ib2xMZW5ndGggLyAyICk7XHJcbiAgICBjb25zdCBleHBhbmROb2RlID0gbmV3IFBhdGgoIHBsdXNTeW1ib2xTaGFwZSwgc3ltYm9sT3B0aW9ucyApO1xyXG5cclxuICAgIC8vIENvbGxhcHNlICctJyBjb250ZW50XHJcbiAgICBjb25zdCBtaW51c1N5bWJvbFNoYXBlID0gbmV3IFNoYXBlKClcclxuICAgICAgLm1vdmVUbyggLXN5bWJvbExlbmd0aCAvIDIsIDAgKVxyXG4gICAgICAubGluZVRvKCBzeW1ib2xMZW5ndGggLyAyLCAwICk7XHJcbiAgICBjb25zdCBjb2xsYXBzZU5vZGUgPSBuZXcgUGF0aCggbWludXNTeW1ib2xTaGFwZSwgc3ltYm9sT3B0aW9ucyApO1xyXG5cclxuICAgIHN1cGVyKCBleHBhbmRlZFByb3BlcnR5LCBjb2xsYXBzZU5vZGUsIGV4cGFuZE5vZGUsIG9wdGlvbnMgKTtcclxuXHJcbiAgICAvLyBsaXN0ZW5lcnMgbXVzdCBiZSByZW1vdmVkIGluIGRpc3Bvc2VcclxuICAgIGNvbnN0IGV4cGFuZGVkUHJvcGVydHlPYnNlcnZlciA9ICggZXhwYW5kZWQ6IGJvb2xlYW4gKSA9PiB7XHJcblxyXG4gICAgICAvL1RPRE8gdXNlIFBoZXRDb2xvclNjaGVtZS5SRURfQ09MT1JCTElORCwgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9waGV0c2ltcy9zdW4vaXNzdWVzLzQ4NVxyXG4gICAgICB0aGlzLmJhc2VDb2xvciA9IGV4cGFuZGVkID8gJ3JnYiggMjU1LCA4NSwgMCApJyA6ICdyZ2IoIDAsIDE3OSwgMCApJztcclxuXHJcbiAgICAgIHRoaXMuc2V0UERPTUF0dHJpYnV0ZSggJ2FyaWEtZXhwYW5kZWQnLCBleHBhbmRlZCApO1xyXG4gICAgfTtcclxuICAgIGV4cGFuZGVkUHJvcGVydHkubGluayggZXhwYW5kZWRQcm9wZXJ0eU9ic2VydmVyICk7XHJcblxyXG4gICAgLy8gc3VwcG9ydCBmb3IgYmluZGVyIGRvY3VtZW50YXRpb24sIHN0cmlwcGVkIG91dCBpbiBidWlsZHMgYW5kIG9ubHkgcnVucyB3aGVuID9iaW5kZXIgaXMgc3BlY2lmaWVkXHJcbiAgICBhc3NlcnQgJiYgcGhldC5jaGlwcGVyLnF1ZXJ5UGFyYW1ldGVycy5iaW5kZXIgJiYgSW5zdGFuY2VSZWdpc3RyeS5yZWdpc3RlckRhdGFVUkwoICdzdW4nLCAnRXhwYW5kQ29sbGFwc2VCdXR0b24nLCB0aGlzICk7XHJcblxyXG4gICAgdGhpcy5kaXNwb3NlRXhwYW5kQ29sbGFwc2VCdXR0b24gPSAoKSA9PiB7XHJcbiAgICAgIGV4cGFuZGVkUHJvcGVydHkudW5saW5rKCBleHBhbmRlZFByb3BlcnR5T2JzZXJ2ZXIgKTtcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgb3ZlcnJpZGUgZGlzcG9zZSgpOiB2b2lkIHtcclxuICAgIHRoaXMuZGlzcG9zZUV4cGFuZENvbGxhcHNlQnV0dG9uKCk7XHJcbiAgICBzdXBlci5kaXNwb3NlKCk7XHJcbiAgfVxyXG59XHJcblxyXG5zdW4ucmVnaXN0ZXIoICdFeHBhbmRDb2xsYXBzZUJ1dHRvbicsIEV4cGFuZENvbGxhcHNlQnV0dG9uICk7XHJcbiJdLCJtYXBw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