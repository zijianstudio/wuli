// Copyright 2015-2023, University of Colorado Boulder

/**
 * ForceVectorNode is the base class for force vectors.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Utils from '../../../../dot/js/Utils.js';
import optionize from '../../../../phet-core/js/optionize.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import { Node, Rectangle, Text } from '../../../../scenery/js/imports.js';
import hookesLaw from '../../hookesLaw.js';
import HookesLawStrings from '../../HookesLawStrings.js';
import HookesLawConstants from '../HookesLawConstants.js';
export default class ForceVectorNode extends Node {
  /**
   * @param forceProperty - units = N
   * @param valueVisibleProperty - whether a value is visible on the vector
   * @param providedOptions
   */
  constructor(forceProperty, valueVisibleProperty, providedOptions) {
    const options = optionize()({
      // SelfOptions
      fill: 'white',
      stroke: 'black',
      decimalPlaces: 0,
      unitLength: HookesLawConstants.UNIT_FORCE_X,
      alignZero: 'left'
    }, providedOptions);
    const arrowNode = new ArrowNode(0, 0, 50, 0, {
      fill: options.fill,
      stroke: options.stroke,
      tailWidth: 10,
      headWidth: HookesLawConstants.VECTOR_HEAD_SIZE.width,
      headHeight: HookesLawConstants.VECTOR_HEAD_SIZE.height
    });
    const valueText = new Text('', {
      visibleProperty: valueVisibleProperty,
      maxWidth: 150,
      fill: options.fill,
      font: HookesLawConstants.VECTOR_VALUE_FONT,
      bottom: arrowNode.top - 2,
      // above the arrow
      tandem: options.tandem.createTandem('valueText')
    });

    // translucent background, so that value isn't difficult to read when it overlaps with other UI components
    const backgroundNode = new Rectangle(0, 0, 1, 1, {
      fill: 'rgba( 255, 255, 255, 0.8 )',
      cornerRadius: 5,
      visibleProperty: valueVisibleProperty
    });
    options.children = [arrowNode, backgroundNode, valueText];
    forceProperty.link(value => {
      // update the arrow
      arrowNode.visible = value !== 0; // since we can't draw a zero-length arrow
      if (value !== 0) {
        arrowNode.setTailAndTip(0, 0, value * options.unitLength, 0);
      }

      // update the value
      valueText.string = StringUtils.format(HookesLawStrings.pattern['0value']['1units'], Utils.toFixed(Math.abs(value), options.decimalPlaces), HookesLawStrings.newtons);

      // value position
      const margin = 5;
      if (value === 0) {
        if (options.alignZero === 'left') {
          valueText.left = margin;
        } else {
          valueText.right = -margin;
        }
      } else if (valueText.width + 2 * margin < arrowNode.width) {
        valueText.centerX = arrowNode.centerX;
      } else if (value > 0) {
        valueText.left = margin;
      } else {
        valueText.right = -margin;
      }

      // resize the background behind the value
      backgroundNode.setRect(0, 0, 1.1 * valueText.width, 1.1 * valueText.height, 5, 5);
      backgroundNode.center = valueText.center;
    });
    super(options);
  }
}
hookesLaw.register('ForceVectorNode', ForceVectorNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJVdGlscyIsIm9wdGlvbml6ZSIsIlN0cmluZ1V0aWxzIiwiQXJyb3dOb2RlIiwiTm9kZSIsIlJlY3RhbmdsZSIsIlRleHQiLCJob29rZXNMYXciLCJIb29rZXNMYXdTdHJpbmdzIiwiSG9va2VzTGF3Q29uc3RhbnRzIiwiRm9yY2VWZWN0b3JOb2RlIiwiY29uc3RydWN0b3IiLCJmb3JjZVByb3BlcnR5IiwidmFsdWVWaXNpYmxlUHJvcGVydHkiLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwiZmlsbCIsInN0cm9rZSIsImRlY2ltYWxQbGFjZXMiLCJ1bml0TGVuZ3RoIiwiVU5JVF9GT1JDRV9YIiwiYWxpZ25aZXJvIiwiYXJyb3dOb2RlIiwidGFpbFdpZHRoIiwiaGVhZFdpZHRoIiwiVkVDVE9SX0hFQURfU0laRSIsIndpZHRoIiwiaGVhZEhlaWdodCIsImhlaWdodCIsInZhbHVlVGV4dCIsInZpc2libGVQcm9wZXJ0eSIsIm1heFdpZHRoIiwiZm9udCIsIlZFQ1RPUl9WQUxVRV9GT05UIiwiYm90dG9tIiwidG9wIiwidGFuZGVtIiwiY3JlYXRlVGFuZGVtIiwiYmFja2dyb3VuZE5vZGUiLCJjb3JuZXJSYWRpdXMiLCJjaGlsZHJlbiIsImxpbmsiLCJ2YWx1ZSIsInZpc2libGUiLCJzZXRUYWlsQW5kVGlwIiwic3RyaW5nIiwiZm9ybWF0IiwicGF0dGVybiIsInRvRml4ZWQiLCJNYXRoIiwiYWJzIiwibmV3dG9ucyIsIm1hcmdpbiIsImxlZnQiLCJyaWdodCIsImNlbnRlclgiLCJzZXRSZWN0IiwiY2VudGVyIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJGb3JjZVZlY3Rvck5vZGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTUtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogRm9yY2VWZWN0b3JOb2RlIGlzIHRoZSBiYXNlIGNsYXNzIGZvciBmb3JjZSB2ZWN0b3JzLlxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBUUmVhZE9ubHlQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1RSZWFkT25seVByb3BlcnR5LmpzJztcclxuaW1wb3J0IFV0aWxzIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9VdGlscy5qcyc7XHJcbmltcG9ydCBvcHRpb25pemUgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCBQaWNrT3B0aW9uYWwgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1BpY2tPcHRpb25hbC5qcyc7XHJcbmltcG9ydCBQaWNrUmVxdWlyZWQgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1BpY2tSZXF1aXJlZC5qcyc7XHJcbmltcG9ydCBTdHJpbmdVdGlscyBmcm9tICcuLi8uLi8uLi8uLi9waGV0Y29tbW9uL2pzL3V0aWwvU3RyaW5nVXRpbHMuanMnO1xyXG5pbXBvcnQgQXJyb3dOb2RlIGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9BcnJvd05vZGUuanMnO1xyXG5pbXBvcnQgeyBOb2RlLCBOb2RlT3B0aW9ucywgTm9kZVRyYW5zbGF0aW9uT3B0aW9ucywgUmVjdGFuZ2xlLCBUQ29sb3IsIFRleHQgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgaG9va2VzTGF3IGZyb20gJy4uLy4uL2hvb2tlc0xhdy5qcyc7XHJcbmltcG9ydCBIb29rZXNMYXdTdHJpbmdzIGZyb20gJy4uLy4uL0hvb2tlc0xhd1N0cmluZ3MuanMnO1xyXG5pbXBvcnQgSG9va2VzTGF3Q29uc3RhbnRzIGZyb20gJy4uL0hvb2tlc0xhd0NvbnN0YW50cy5qcyc7XHJcblxyXG50eXBlIFNlbGZPcHRpb25zID0ge1xyXG4gIGZpbGw/OiBUQ29sb3I7XHJcbiAgc3Ryb2tlPzogVENvbG9yO1xyXG4gIGRlY2ltYWxQbGFjZXM/OiBudW1iZXI7XHJcbiAgdW5pdExlbmd0aD86IG51bWJlcjsgLy8gdmlldyBsZW5ndGggb2YgYSAxTiB2ZWN0b3JcclxuICBhbGlnblplcm8/OiAnbGVmdCcgfCAncmlnaHQnOyAvLyBob3cgdG8gYWxpZ24gemVybyAoJzAgTicpIHZhbHVlcywgcmVsYXRpdmUgdG8gdGhlIGFycm93IHRhaWxcclxufTtcclxuXHJcbmV4cG9ydCB0eXBlIEZvcmNlVmVjdG9yTm9kZU9wdGlvbnMgPSBTZWxmT3B0aW9ucyAmIE5vZGVUcmFuc2xhdGlvbk9wdGlvbnMgJlxyXG4gIFBpY2tPcHRpb25hbDxOb2RlT3B0aW9ucywgJ3Zpc2libGVQcm9wZXJ0eSc+ICZcclxuICBQaWNrUmVxdWlyZWQ8Tm9kZU9wdGlvbnMsICd0YW5kZW0nPjtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEZvcmNlVmVjdG9yTm9kZSBleHRlbmRzIE5vZGUge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0gZm9yY2VQcm9wZXJ0eSAtIHVuaXRzID0gTlxyXG4gICAqIEBwYXJhbSB2YWx1ZVZpc2libGVQcm9wZXJ0eSAtIHdoZXRoZXIgYSB2YWx1ZSBpcyB2aXNpYmxlIG9uIHRoZSB2ZWN0b3JcclxuICAgKiBAcGFyYW0gcHJvdmlkZWRPcHRpb25zXHJcbiAgICovXHJcbiAgcHJvdGVjdGVkIGNvbnN0cnVjdG9yKCBmb3JjZVByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxudW1iZXI+LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWVWaXNpYmxlUHJvcGVydHk6IFRSZWFkT25seVByb3BlcnR5PGJvb2xlYW4+LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgcHJvdmlkZWRPcHRpb25zOiBGb3JjZVZlY3Rvck5vZGVPcHRpb25zICkge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8Rm9yY2VWZWN0b3JOb2RlT3B0aW9ucywgU2VsZk9wdGlvbnMsIE5vZGVPcHRpb25zPigpKCB7XHJcblxyXG4gICAgICAvLyBTZWxmT3B0aW9uc1xyXG4gICAgICBmaWxsOiAnd2hpdGUnLFxyXG4gICAgICBzdHJva2U6ICdibGFjaycsXHJcbiAgICAgIGRlY2ltYWxQbGFjZXM6IDAsXHJcbiAgICAgIHVuaXRMZW5ndGg6IEhvb2tlc0xhd0NvbnN0YW50cy5VTklUX0ZPUkNFX1gsXHJcbiAgICAgIGFsaWduWmVybzogJ2xlZnQnXHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICBjb25zdCBhcnJvd05vZGUgPSBuZXcgQXJyb3dOb2RlKCAwLCAwLCA1MCwgMCwge1xyXG4gICAgICBmaWxsOiBvcHRpb25zLmZpbGwsXHJcbiAgICAgIHN0cm9rZTogb3B0aW9ucy5zdHJva2UsXHJcbiAgICAgIHRhaWxXaWR0aDogMTAsXHJcbiAgICAgIGhlYWRXaWR0aDogSG9va2VzTGF3Q29uc3RhbnRzLlZFQ1RPUl9IRUFEX1NJWkUud2lkdGgsXHJcbiAgICAgIGhlYWRIZWlnaHQ6IEhvb2tlc0xhd0NvbnN0YW50cy5WRUNUT1JfSEVBRF9TSVpFLmhlaWdodFxyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IHZhbHVlVGV4dCA9IG5ldyBUZXh0KCAnJywge1xyXG4gICAgICB2aXNpYmxlUHJvcGVydHk6IHZhbHVlVmlzaWJsZVByb3BlcnR5LFxyXG4gICAgICBtYXhXaWR0aDogMTUwLFxyXG4gICAgICBmaWxsOiBvcHRpb25zLmZpbGwsXHJcbiAgICAgIGZvbnQ6IEhvb2tlc0xhd0NvbnN0YW50cy5WRUNUT1JfVkFMVUVfRk9OVCxcclxuICAgICAgYm90dG9tOiBhcnJvd05vZGUudG9wIC0gMiwgLy8gYWJvdmUgdGhlIGFycm93XHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAndmFsdWVUZXh0JyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gdHJhbnNsdWNlbnQgYmFja2dyb3VuZCwgc28gdGhhdCB2YWx1ZSBpc24ndCBkaWZmaWN1bHQgdG8gcmVhZCB3aGVuIGl0IG92ZXJsYXBzIHdpdGggb3RoZXIgVUkgY29tcG9uZW50c1xyXG4gICAgY29uc3QgYmFja2dyb3VuZE5vZGUgPSBuZXcgUmVjdGFuZ2xlKCAwLCAwLCAxLCAxLCB7XHJcbiAgICAgIGZpbGw6ICdyZ2JhKCAyNTUsIDI1NSwgMjU1LCAwLjggKScsXHJcbiAgICAgIGNvcm5lclJhZGl1czogNSxcclxuICAgICAgdmlzaWJsZVByb3BlcnR5OiB2YWx1ZVZpc2libGVQcm9wZXJ0eVxyXG4gICAgfSApO1xyXG5cclxuICAgIG9wdGlvbnMuY2hpbGRyZW4gPSBbIGFycm93Tm9kZSwgYmFja2dyb3VuZE5vZGUsIHZhbHVlVGV4dCBdO1xyXG5cclxuICAgIGZvcmNlUHJvcGVydHkubGluayggdmFsdWUgPT4ge1xyXG5cclxuICAgICAgLy8gdXBkYXRlIHRoZSBhcnJvd1xyXG4gICAgICBhcnJvd05vZGUudmlzaWJsZSA9ICggdmFsdWUgIT09IDAgKTsgLy8gc2luY2Ugd2UgY2FuJ3QgZHJhdyBhIHplcm8tbGVuZ3RoIGFycm93XHJcbiAgICAgIGlmICggdmFsdWUgIT09IDAgKSB7XHJcbiAgICAgICAgYXJyb3dOb2RlLnNldFRhaWxBbmRUaXAoIDAsIDAsIHZhbHVlICogb3B0aW9ucy51bml0TGVuZ3RoLCAwICk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIHVwZGF0ZSB0aGUgdmFsdWVcclxuICAgICAgdmFsdWVUZXh0LnN0cmluZyA9IFN0cmluZ1V0aWxzLmZvcm1hdCggSG9va2VzTGF3U3RyaW5ncy5wYXR0ZXJuWyAnMHZhbHVlJyBdWyAnMXVuaXRzJyBdLFxyXG4gICAgICAgIFV0aWxzLnRvRml4ZWQoIE1hdGguYWJzKCB2YWx1ZSApLCBvcHRpb25zLmRlY2ltYWxQbGFjZXMgKSwgSG9va2VzTGF3U3RyaW5ncy5uZXd0b25zICk7XHJcblxyXG4gICAgICAvLyB2YWx1ZSBwb3NpdGlvblxyXG4gICAgICBjb25zdCBtYXJnaW4gPSA1O1xyXG4gICAgICBpZiAoIHZhbHVlID09PSAwICkge1xyXG4gICAgICAgIGlmICggb3B0aW9ucy5hbGlnblplcm8gPT09ICdsZWZ0JyApIHtcclxuICAgICAgICAgIHZhbHVlVGV4dC5sZWZ0ID0gbWFyZ2luO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgIHZhbHVlVGV4dC5yaWdodCA9IC1tYXJnaW47XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgaWYgKCB2YWx1ZVRleHQud2lkdGggKyAoIDIgKiBtYXJnaW4gKSA8IGFycm93Tm9kZS53aWR0aCApIHtcclxuICAgICAgICB2YWx1ZVRleHQuY2VudGVyWCA9IGFycm93Tm9kZS5jZW50ZXJYO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgaWYgKCB2YWx1ZSA+IDAgKSB7XHJcbiAgICAgICAgdmFsdWVUZXh0LmxlZnQgPSBtYXJnaW47XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgdmFsdWVUZXh0LnJpZ2h0ID0gLW1hcmdpbjtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gcmVzaXplIHRoZSBiYWNrZ3JvdW5kIGJlaGluZCB0aGUgdmFsdWVcclxuICAgICAgYmFja2dyb3VuZE5vZGUuc2V0UmVjdCggMCwgMCwgMS4xICogdmFsdWVUZXh0LndpZHRoLCAxLjEgKiB2YWx1ZVRleHQuaGVpZ2h0LCA1LCA1ICk7XHJcbiAgICAgIGJhY2tncm91bmROb2RlLmNlbnRlciA9IHZhbHVlVGV4dC5jZW50ZXI7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgc3VwZXIoIG9wdGlvbnMgKTtcclxuICB9XHJcbn1cclxuXHJcbmhvb2tlc0xhdy5yZWdpc3RlciggJ0ZvcmNlVmVjdG9yTm9kZScsIEZvcmNlVmVjdG9yTm9kZSApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFHQSxPQUFPQSxLQUFLLE1BQU0sNkJBQTZCO0FBQy9DLE9BQU9DLFNBQVMs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