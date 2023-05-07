// Copyright 2016-2023, University of Colorado Boulder
// TODO: Review, document, annotate, i18n, bring up to standards

/**
 * Shows an empty box for 'Test' mode.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import CCKCColors from '../../../../circuit-construction-kit-common/js/view/CCKCColors.js';
import { Node, Rectangle } from '../../../../scenery/js/imports.js';
import circuitConstructionKitBlackBoxStudy from '../../circuitConstructionKitBlackBoxStudy.js';
class WhiteBoxNode extends Node {
  constructor(width, height, options) {
    super({
      children: [new Rectangle(0, 0, width, height, 20, 20, {
        stroke: 'black',
        lineWidth: 3,
        fill: CCKCColors.screenBackgroundColorProperty
      })]
    });
    this.mutate(options);
  }
}
circuitConstructionKitBlackBoxStudy.register('WhiteBoxNode', WhiteBoxNode);
export default WhiteBoxNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDQ0tDQ29sb3JzIiwiTm9kZSIsIlJlY3RhbmdsZSIsImNpcmN1aXRDb25zdHJ1Y3Rpb25LaXRCbGFja0JveFN0dWR5IiwiV2hpdGVCb3hOb2RlIiwiY29uc3RydWN0b3IiLCJ3aWR0aCIsImhlaWdodCIsIm9wdGlvbnMiLCJjaGlsZHJlbiIsInN0cm9rZSIsImxpbmVXaWR0aCIsImZpbGwiLCJzY3JlZW5CYWNrZ3JvdW5kQ29sb3JQcm9wZXJ0eSIsIm11dGF0ZSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiV2hpdGVCb3hOb2RlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE2LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG4vLyBUT0RPOiBSZXZpZXcsIGRvY3VtZW50LCBhbm5vdGF0ZSwgaTE4biwgYnJpbmcgdXAgdG8gc3RhbmRhcmRzXHJcblxyXG4vKipcclxuICogU2hvd3MgYW4gZW1wdHkgYm94IGZvciAnVGVzdCcgbW9kZS5cclxuICpcclxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgQ0NLQ0NvbG9ycyBmcm9tICcuLi8uLi8uLi8uLi9jaXJjdWl0LWNvbnN0cnVjdGlvbi1raXQtY29tbW9uL2pzL3ZpZXcvQ0NLQ0NvbG9ycy5qcyc7XHJcbmltcG9ydCB7IE5vZGUsIFJlY3RhbmdsZSB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBjaXJjdWl0Q29uc3RydWN0aW9uS2l0QmxhY2tCb3hTdHVkeSBmcm9tICcuLi8uLi9jaXJjdWl0Q29uc3RydWN0aW9uS2l0QmxhY2tCb3hTdHVkeS5qcyc7XHJcblxyXG5jbGFzcyBXaGl0ZUJveE5vZGUgZXh0ZW5kcyBOb2RlIHtcclxuICBjb25zdHJ1Y3Rvciggd2lkdGgsIGhlaWdodCwgb3B0aW9ucyApIHtcclxuICAgIHN1cGVyKCB7XHJcbiAgICAgIGNoaWxkcmVuOiBbXHJcbiAgICAgICAgbmV3IFJlY3RhbmdsZSggMCwgMCwgd2lkdGgsIGhlaWdodCwgMjAsIDIwLCB7XHJcbiAgICAgICAgICBzdHJva2U6ICdibGFjaycsXHJcbiAgICAgICAgICBsaW5lV2lkdGg6IDMsXHJcbiAgICAgICAgICBmaWxsOiBDQ0tDQ29sb3JzLnNjcmVlbkJhY2tncm91bmRDb2xvclByb3BlcnR5XHJcbiAgICAgICAgfSApXHJcbiAgICAgIF1cclxuICAgIH0gKTtcclxuICAgIHRoaXMubXV0YXRlKCBvcHRpb25zICk7XHJcbiAgfVxyXG59XHJcblxyXG5jaXJjdWl0Q29uc3RydWN0aW9uS2l0QmxhY2tCb3hTdHVkeS5yZWdpc3RlciggJ1doaXRlQm94Tm9kZScsIFdoaXRlQm94Tm9kZSApO1xyXG5leHBvcnQgZGVmYXVsdCBXaGl0ZUJveE5vZGU7Il0sIm1hcHBpbmdzIjoiQUFBQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsVUFBVSxNQUFNLG1FQUFtRTtBQUMxRixTQUFTQyxJQUFJLEVBQUVDLFNBQVMsUUFBUSxtQ0FBbUM7QUFDbkUsT0FBT0MsbUNBQW1DLE1BQU0sOENBQThDO0FBRTlGLE1BQU1DLFlBQVksU0FBU0gsSUFBSSxDQUFDO0VBQzlCSSxXQUFXQSxDQUFFQyxLQUFLLEVBQUVDLE1BQU0sRUFBRUMsT0FBTyxFQUFHO0lBQ3BDLEtBQUssQ0FBRTtNQUNMQyxRQUFRLEVBQUUsQ0FDUixJQUFJUCxTQUFTLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRUksS0FBSyxFQUFFQyxNQUFNLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRTtRQUMxQ0csTUFBTSxFQUFFLE9BQU87UUFDZkMsU0FBUyxFQUFFLENBQUM7UUFDWkMsSUFBSSxFQUFFWixVQUFVLENBQUNhO01BQ25CLENBQUUsQ0FBQztJQUVQLENBQUUsQ0FBQztJQUNILElBQUksQ0FBQ0MsTUFBTSxDQUFFTixPQUFRLENBQUM7RUFDeEI7QUFDRjtBQUVBTCxtQ0FBbUMsQ0FBQ1ksUUFBUSxDQUFFLGNBQWMsRUFBRVgsWUFBYSxDQUFDO0FBQzVFLGVBQWVBLFlBQVkifQ==