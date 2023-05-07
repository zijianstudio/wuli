// Copyright 2020-2023, University of Colorado Boulder

/**
 * Advanced control panel that appears in "Lab" screens which allows the user to adjust the resistivity of wires
 * and the internal resistance of voltage sources.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { Text, VBox } from '../../../scenery/js/imports.js';
import CCKCConstants from '../CCKCConstants.js';
import CircuitConstructionKitCommonStrings from '../CircuitConstructionKitCommonStrings.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import CCKCAccordionBox from './CCKCAccordionBox.js';
import CCKCCheckbox from './CCKCCheckbox.js';
import SourceResistanceControl from './SourceResistanceControl.js';
import WireResistivityControl from './WireResistivityControl.js';
import optionize, { combineOptions } from '../../../phet-core/js/optionize.js';
import CCKCColors from './CCKCColors.js';
export default class AdvancedAccordionBox extends CCKCAccordionBox {
  /**
   * @param circuit
   * @param alignGroup - to match the width of other panels
   * @param batteryResistanceControlString
   * @param tandem
   * @param [providedOptions]
   */
  constructor(circuit, alignGroup, batteryResistanceControlString, tandem, providedOptions) {
    const options = optionize()({
      showRealBulbsCheckbox: true
    }, providedOptions);
    const TEXT_OPTIONS = {
      fontSize: CCKCConstants.FONT_SIZE,
      maxWidth: 120,
      fill: CCKCColors.textFillProperty
    }; // Factor out titles

    const children = [new WireResistivityControl(circuit.wireResistivityProperty, alignGroup, TEXT_OPTIONS, tandem.createTandem('wireResistivityControl')), new SourceResistanceControl(circuit.sourceResistanceProperty, alignGroup, batteryResistanceControlString, TEXT_OPTIONS, tandem.createTandem('sourceResistanceControl'))];
    if (options.showRealBulbsCheckbox) {
      const addRealBulbsCheckboxTandem = tandem.createTandem('addRealBulbsCheckbox');
      children.push(new CCKCCheckbox(circuit.addRealBulbsProperty, new Text(CircuitConstructionKitCommonStrings.addRealBulbsStringProperty, combineOptions({
        tandem: addRealBulbsCheckboxTandem.createTandem('labelText')
      }, TEXT_OPTIONS)), {
        tandem: addRealBulbsCheckboxTandem
      }));
    }
    super(alignGroup.createBox(new VBox({
      align: 'left',
      spacing: 15,
      children: children
    })), CircuitConstructionKitCommonStrings.advancedStringProperty, tandem, {
      // Left align the title, with no padding
      titleAlignX: 'left',
      titleXSpacing: 0
    });
    this.mutate(options);
  }
}
circuitConstructionKitCommon.register('AdvancedAccordionBox', AdvancedAccordionBox);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJUZXh0IiwiVkJveCIsIkNDS0NDb25zdGFudHMiLCJDaXJjdWl0Q29uc3RydWN0aW9uS2l0Q29tbW9uU3RyaW5ncyIsImNpcmN1aXRDb25zdHJ1Y3Rpb25LaXRDb21tb24iLCJDQ0tDQWNjb3JkaW9uQm94IiwiQ0NLQ0NoZWNrYm94IiwiU291cmNlUmVzaXN0YW5jZUNvbnRyb2wiLCJXaXJlUmVzaXN0aXZpdHlDb250cm9sIiwib3B0aW9uaXplIiwiY29tYmluZU9wdGlvbnMiLCJDQ0tDQ29sb3JzIiwiQWR2YW5jZWRBY2NvcmRpb25Cb3giLCJjb25zdHJ1Y3RvciIsImNpcmN1aXQiLCJhbGlnbkdyb3VwIiwiYmF0dGVyeVJlc2lzdGFuY2VDb250cm9sU3RyaW5nIiwidGFuZGVtIiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsInNob3dSZWFsQnVsYnNDaGVja2JveCIsIlRFWFRfT1BUSU9OUyIsImZvbnRTaXplIiwiRk9OVF9TSVpFIiwibWF4V2lkdGgiLCJmaWxsIiwidGV4dEZpbGxQcm9wZXJ0eSIsImNoaWxkcmVuIiwid2lyZVJlc2lzdGl2aXR5UHJvcGVydHkiLCJjcmVhdGVUYW5kZW0iLCJzb3VyY2VSZXNpc3RhbmNlUHJvcGVydHkiLCJhZGRSZWFsQnVsYnNDaGVja2JveFRhbmRlbSIsInB1c2giLCJhZGRSZWFsQnVsYnNQcm9wZXJ0eSIsImFkZFJlYWxCdWxic1N0cmluZ1Byb3BlcnR5IiwiY3JlYXRlQm94IiwiYWxpZ24iLCJzcGFjaW5nIiwiYWR2YW5jZWRTdHJpbmdQcm9wZXJ0eSIsInRpdGxlQWxpZ25YIiwidGl0bGVYU3BhY2luZyIsIm11dGF0ZSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiQWR2YW5jZWRBY2NvcmRpb25Cb3gudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjAtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQWR2YW5jZWQgY29udHJvbCBwYW5lbCB0aGF0IGFwcGVhcnMgaW4gXCJMYWJcIiBzY3JlZW5zIHdoaWNoIGFsbG93cyB0aGUgdXNlciB0byBhZGp1c3QgdGhlIHJlc2lzdGl2aXR5IG9mIHdpcmVzXHJcbiAqIGFuZCB0aGUgaW50ZXJuYWwgcmVzaXN0YW5jZSBvZiB2b2x0YWdlIHNvdXJjZXMuXHJcbiAqXHJcbiAqIEBhdXRob3IgU2FtIFJlaWQgKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IHsgQWxpZ25Hcm91cCwgTm9kZSwgVGV4dCwgVkJveCB9IGZyb20gJy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBDQ0tDQ29uc3RhbnRzIGZyb20gJy4uL0NDS0NDb25zdGFudHMuanMnO1xyXG5pbXBvcnQgQ2lyY3VpdENvbnN0cnVjdGlvbktpdENvbW1vblN0cmluZ3MgZnJvbSAnLi4vQ2lyY3VpdENvbnN0cnVjdGlvbktpdENvbW1vblN0cmluZ3MuanMnO1xyXG5pbXBvcnQgY2lyY3VpdENvbnN0cnVjdGlvbktpdENvbW1vbiBmcm9tICcuLi9jaXJjdWl0Q29uc3RydWN0aW9uS2l0Q29tbW9uLmpzJztcclxuaW1wb3J0IENDS0NBY2NvcmRpb25Cb3gsIHsgQ0NLQ0FjY29yZGlvbkJveE9wdGlvbnMgfSBmcm9tICcuL0NDS0NBY2NvcmRpb25Cb3guanMnO1xyXG5pbXBvcnQgQ0NLQ0NoZWNrYm94IGZyb20gJy4vQ0NLQ0NoZWNrYm94LmpzJztcclxuaW1wb3J0IFNvdXJjZVJlc2lzdGFuY2VDb250cm9sIGZyb20gJy4vU291cmNlUmVzaXN0YW5jZUNvbnRyb2wuanMnO1xyXG5pbXBvcnQgV2lyZVJlc2lzdGl2aXR5Q29udHJvbCBmcm9tICcuL1dpcmVSZXNpc3Rpdml0eUNvbnRyb2wuanMnO1xyXG5pbXBvcnQgQ2lyY3VpdCBmcm9tICcuLi9tb2RlbC9DaXJjdWl0LmpzJztcclxuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcclxuaW1wb3J0IG9wdGlvbml6ZSwgeyBjb21iaW5lT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgVFJlYWRPbmx5UHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9UUmVhZE9ubHlQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCB7IENoZWNrYm94T3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uL3N1bi9qcy9DaGVja2JveC5qcyc7XHJcbmltcG9ydCBDQ0tDQ29sb3JzIGZyb20gJy4vQ0NLQ0NvbG9ycy5qcyc7XHJcblxyXG50eXBlIFNlbGZPcHRpb25zID0ge1xyXG4gIHNob3dSZWFsQnVsYnNDaGVja2JveD86IGJvb2xlYW47XHJcbn07XHJcbnR5cGUgQWR2YW5jZWRBY2NvcmRpb25Cb3hPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBDQ0tDQWNjb3JkaW9uQm94T3B0aW9ucztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEFkdmFuY2VkQWNjb3JkaW9uQm94IGV4dGVuZHMgQ0NLQ0FjY29yZGlvbkJveCB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSBjaXJjdWl0XHJcbiAgICogQHBhcmFtIGFsaWduR3JvdXAgLSB0byBtYXRjaCB0aGUgd2lkdGggb2Ygb3RoZXIgcGFuZWxzXHJcbiAgICogQHBhcmFtIGJhdHRlcnlSZXNpc3RhbmNlQ29udHJvbFN0cmluZ1xyXG4gICAqIEBwYXJhbSB0YW5kZW1cclxuICAgKiBAcGFyYW0gW3Byb3ZpZGVkT3B0aW9uc11cclxuICAgKi9cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIGNpcmN1aXQ6IENpcmN1aXQsIGFsaWduR3JvdXA6IEFsaWduR3JvdXAsIGJhdHRlcnlSZXNpc3RhbmNlQ29udHJvbFN0cmluZzogVFJlYWRPbmx5UHJvcGVydHk8c3RyaW5nPiwgdGFuZGVtOiBUYW5kZW0sIHByb3ZpZGVkT3B0aW9ucz86IEFkdmFuY2VkQWNjb3JkaW9uQm94T3B0aW9ucyApIHtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPEFkdmFuY2VkQWNjb3JkaW9uQm94T3B0aW9ucywgU2VsZk9wdGlvbnMsIENDS0NBY2NvcmRpb25Cb3hPcHRpb25zPigpKCB7XHJcbiAgICAgIHNob3dSZWFsQnVsYnNDaGVja2JveDogdHJ1ZVxyXG4gICAgfSwgcHJvdmlkZWRPcHRpb25zICk7XHJcblxyXG4gICAgY29uc3QgVEVYVF9PUFRJT05TID0ge1xyXG4gICAgICBmb250U2l6ZTogQ0NLQ0NvbnN0YW50cy5GT05UX1NJWkUsXHJcbiAgICAgIG1heFdpZHRoOiAxMjAsXHJcbiAgICAgIGZpbGw6IENDS0NDb2xvcnMudGV4dEZpbGxQcm9wZXJ0eVxyXG4gICAgfTsgLy8gRmFjdG9yIG91dCB0aXRsZXNcclxuXHJcbiAgICBjb25zdCBjaGlsZHJlbjogTm9kZVtdID0gW1xyXG4gICAgICBuZXcgV2lyZVJlc2lzdGl2aXR5Q29udHJvbCggY2lyY3VpdC53aXJlUmVzaXN0aXZpdHlQcm9wZXJ0eSwgYWxpZ25Hcm91cCwgVEVYVF9PUFRJT05TLCB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnd2lyZVJlc2lzdGl2aXR5Q29udHJvbCcgKSApLFxyXG4gICAgICBuZXcgU291cmNlUmVzaXN0YW5jZUNvbnRyb2woIGNpcmN1aXQuc291cmNlUmVzaXN0YW5jZVByb3BlcnR5LCBhbGlnbkdyb3VwLCBiYXR0ZXJ5UmVzaXN0YW5jZUNvbnRyb2xTdHJpbmcsIFRFWFRfT1BUSU9OUywgdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3NvdXJjZVJlc2lzdGFuY2VDb250cm9sJyApIClcclxuICAgIF07XHJcblxyXG4gICAgaWYgKCBvcHRpb25zLnNob3dSZWFsQnVsYnNDaGVja2JveCApIHtcclxuICAgICAgY29uc3QgYWRkUmVhbEJ1bGJzQ2hlY2tib3hUYW5kZW0gPSB0YW5kZW0uY3JlYXRlVGFuZGVtKCAnYWRkUmVhbEJ1bGJzQ2hlY2tib3gnICk7XHJcbiAgICAgIGNoaWxkcmVuLnB1c2goXHJcbiAgICAgICAgbmV3IENDS0NDaGVja2JveCggY2lyY3VpdC5hZGRSZWFsQnVsYnNQcm9wZXJ0eSwgbmV3IFRleHQoIENpcmN1aXRDb25zdHJ1Y3Rpb25LaXRDb21tb25TdHJpbmdzLmFkZFJlYWxCdWxic1N0cmluZ1Byb3BlcnR5LCBjb21iaW5lT3B0aW9uczxDaGVja2JveE9wdGlvbnM+KCB7XHJcbiAgICAgICAgICB0YW5kZW06IGFkZFJlYWxCdWxic0NoZWNrYm94VGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2xhYmVsVGV4dCcgKVxyXG4gICAgICAgIH0sIFRFWFRfT1BUSU9OUyApICksIHtcclxuICAgICAgICAgIHRhbmRlbTogYWRkUmVhbEJ1bGJzQ2hlY2tib3hUYW5kZW1cclxuICAgICAgICB9IClcclxuICAgICAgKTtcclxuICAgIH1cclxuICAgIHN1cGVyKCBhbGlnbkdyb3VwLmNyZWF0ZUJveCggbmV3IFZCb3goIHtcclxuICAgICAgYWxpZ246ICdsZWZ0JyxcclxuICAgICAgc3BhY2luZzogMTUsXHJcbiAgICAgIGNoaWxkcmVuOiBjaGlsZHJlblxyXG4gICAgfSApICksIENpcmN1aXRDb25zdHJ1Y3Rpb25LaXRDb21tb25TdHJpbmdzLmFkdmFuY2VkU3RyaW5nUHJvcGVydHksIHRhbmRlbSwge1xyXG5cclxuICAgICAgLy8gTGVmdCBhbGlnbiB0aGUgdGl0bGUsIHdpdGggbm8gcGFkZGluZ1xyXG4gICAgICB0aXRsZUFsaWduWDogJ2xlZnQnLFxyXG4gICAgICB0aXRsZVhTcGFjaW5nOiAwXHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5tdXRhdGUoIG9wdGlvbnMgKTtcclxuICB9XHJcbn1cclxuXHJcbmNpcmN1aXRDb25zdHJ1Y3Rpb25LaXRDb21tb24ucmVnaXN0ZXIoICdBZHZhbmNlZEFjY29yZGlvbkJveCcsIEFkdmFuY2VkQWNjb3JkaW9uQm94ICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsU0FBMkJBLElBQUksRUFBRUMsSUFBSSxR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