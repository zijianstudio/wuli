// Copyright 2017-2023, University of Colorado Boulder

/**
 * Controls for showing and changing the wire resistivity.  Exists for the life of the sim and hence does not require a
 * dispose implementation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { Text, VBox } from '../../../scenery/js/imports.js';
import HSlider from '../../../sun/js/HSlider.js';
import CCKCConstants from '../CCKCConstants.js';
import CircuitConstructionKitCommonStrings from '../CircuitConstructionKitCommonStrings.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import { combineOptions } from '../../../phet-core/js/optionize.js';
import CCKCColors from './CCKCColors.js';
const lotsStringProperty = CircuitConstructionKitCommonStrings.lotsStringProperty;
const tinyStringProperty = CircuitConstructionKitCommonStrings.tinyStringProperty;
const wireResistivityStringProperty = CircuitConstructionKitCommonStrings.wireResistivityStringProperty;

// constants
const TICK_LABEL_TEXT_OPTIONS = {
  fontSize: 12,
  maxWidth: 45,
  fill: CCKCColors.textFillProperty
};
export default class WireResistivityControl extends VBox {
  /**
   * @param wireResistivityProperty
   * @param alignGroup - for alignment with other controls
   * @param titleConfig
   * @param tandem
   */
  constructor(wireResistivityProperty, alignGroup, titleConfig, tandem) {
    const titleNode = new Text(wireResistivityStringProperty, combineOptions({
      tandem: tandem.createTandem('titleText'),
      fill: CCKCColors.textFillProperty
    }, titleConfig));
    const slider = new HSlider(wireResistivityProperty, CCKCConstants.WIRE_RESISTIVITY_RANGE, {
      trackSize: CCKCConstants.SLIDER_TRACK_SIZE,
      thumbSize: CCKCConstants.THUMB_SIZE,
      majorTickLength: CCKCConstants.MAJOR_TICK_LENGTH,
      phetioVisiblePropertyInstrumented: false,
      tandem: tandem.createTandem('slider')
    });
    slider.addMajorTick(0, new Text(tinyStringProperty, TICK_LABEL_TEXT_OPTIONS));
    slider.addMajorTick(CCKCConstants.WIRE_RESISTIVITY_RANGE.max, new Text(lotsStringProperty, TICK_LABEL_TEXT_OPTIONS));
    super({
      children: [titleNode, slider],
      tandem: tandem,
      visiblePropertyOptions: {
        phetioFeatured: true
      }
    });
  }
}
circuitConstructionKitCommon.register('WireResistivityControl', WireResistivityControl);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJUZXh0IiwiVkJveCIsIkhTbGlkZXIiLCJDQ0tDQ29uc3RhbnRzIiwiQ2lyY3VpdENvbnN0cnVjdGlvbktpdENvbW1vblN0cmluZ3MiLCJjaXJjdWl0Q29uc3RydWN0aW9uS2l0Q29tbW9uIiwiY29tYmluZU9wdGlvbnMiLCJDQ0tDQ29sb3JzIiwibG90c1N0cmluZ1Byb3BlcnR5IiwidGlueVN0cmluZ1Byb3BlcnR5Iiwid2lyZVJlc2lzdGl2aXR5U3RyaW5nUHJvcGVydHkiLCJUSUNLX0xBQkVMX1RFWFRfT1BUSU9OUyIsImZvbnRTaXplIiwibWF4V2lkdGgiLCJmaWxsIiwidGV4dEZpbGxQcm9wZXJ0eSIsIldpcmVSZXNpc3Rpdml0eUNvbnRyb2wiLCJjb25zdHJ1Y3RvciIsIndpcmVSZXNpc3Rpdml0eVByb3BlcnR5IiwiYWxpZ25Hcm91cCIsInRpdGxlQ29uZmlnIiwidGFuZGVtIiwidGl0bGVOb2RlIiwiY3JlYXRlVGFuZGVtIiwic2xpZGVyIiwiV0lSRV9SRVNJU1RJVklUWV9SQU5HRSIsInRyYWNrU2l6ZSIsIlNMSURFUl9UUkFDS19TSVpFIiwidGh1bWJTaXplIiwiVEhVTUJfU0laRSIsIm1ham9yVGlja0xlbmd0aCIsIk1BSk9SX1RJQ0tfTEVOR1RIIiwicGhldGlvVmlzaWJsZVByb3BlcnR5SW5zdHJ1bWVudGVkIiwiYWRkTWFqb3JUaWNrIiwibWF4IiwiY2hpbGRyZW4iLCJ2aXNpYmxlUHJvcGVydHlPcHRpb25zIiwicGhldGlvRmVhdHVyZWQiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIldpcmVSZXNpc3Rpdml0eUNvbnRyb2wudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTctMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQ29udHJvbHMgZm9yIHNob3dpbmcgYW5kIGNoYW5naW5nIHRoZSB3aXJlIHJlc2lzdGl2aXR5LiAgRXhpc3RzIGZvciB0aGUgbGlmZSBvZiB0aGUgc2ltIGFuZCBoZW5jZSBkb2VzIG5vdCByZXF1aXJlIGFcclxuICogZGlzcG9zZSBpbXBsZW1lbnRhdGlvbi5cclxuICpcclxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgeyBBbGlnbkdyb3VwLCBUZXh0LCBUZXh0T3B0aW9ucywgVkJveCB9IGZyb20gJy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBIU2xpZGVyIGZyb20gJy4uLy4uLy4uL3N1bi9qcy9IU2xpZGVyLmpzJztcclxuaW1wb3J0IENDS0NDb25zdGFudHMgZnJvbSAnLi4vQ0NLQ0NvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBDaXJjdWl0Q29uc3RydWN0aW9uS2l0Q29tbW9uU3RyaW5ncyBmcm9tICcuLi9DaXJjdWl0Q29uc3RydWN0aW9uS2l0Q29tbW9uU3RyaW5ncy5qcyc7XHJcbmltcG9ydCBjaXJjdWl0Q29uc3RydWN0aW9uS2l0Q29tbW9uIGZyb20gJy4uL2NpcmN1aXRDb25zdHJ1Y3Rpb25LaXRDb21tb24uanMnO1xyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBUYW5kZW0gZnJvbSAnLi4vLi4vLi4vdGFuZGVtL2pzL1RhbmRlbS5qcyc7XHJcbmltcG9ydCB7IGNvbWJpbmVPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCBDQ0tDQ29sb3JzIGZyb20gJy4vQ0NLQ0NvbG9ycy5qcyc7XHJcblxyXG5jb25zdCBsb3RzU3RyaW5nUHJvcGVydHkgPSBDaXJjdWl0Q29uc3RydWN0aW9uS2l0Q29tbW9uU3RyaW5ncy5sb3RzU3RyaW5nUHJvcGVydHk7XHJcbmNvbnN0IHRpbnlTdHJpbmdQcm9wZXJ0eSA9IENpcmN1aXRDb25zdHJ1Y3Rpb25LaXRDb21tb25TdHJpbmdzLnRpbnlTdHJpbmdQcm9wZXJ0eTtcclxuY29uc3Qgd2lyZVJlc2lzdGl2aXR5U3RyaW5nUHJvcGVydHkgPSBDaXJjdWl0Q29uc3RydWN0aW9uS2l0Q29tbW9uU3RyaW5ncy53aXJlUmVzaXN0aXZpdHlTdHJpbmdQcm9wZXJ0eTtcclxuXHJcbi8vIGNvbnN0YW50c1xyXG5jb25zdCBUSUNLX0xBQkVMX1RFWFRfT1BUSU9OUyA9IHsgZm9udFNpemU6IDEyLCBtYXhXaWR0aDogNDUsIGZpbGw6IENDS0NDb2xvcnMudGV4dEZpbGxQcm9wZXJ0eSB9O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgV2lyZVJlc2lzdGl2aXR5Q29udHJvbCBleHRlbmRzIFZCb3gge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0gd2lyZVJlc2lzdGl2aXR5UHJvcGVydHlcclxuICAgKiBAcGFyYW0gYWxpZ25Hcm91cCAtIGZvciBhbGlnbm1lbnQgd2l0aCBvdGhlciBjb250cm9sc1xyXG4gICAqIEBwYXJhbSB0aXRsZUNvbmZpZ1xyXG4gICAqIEBwYXJhbSB0YW5kZW1cclxuICAgKi9cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIHdpcmVSZXNpc3Rpdml0eVByb3BlcnR5OiBQcm9wZXJ0eTxudW1iZXI+LCBhbGlnbkdyb3VwOiBBbGlnbkdyb3VwLCB0aXRsZUNvbmZpZzogVGV4dE9wdGlvbnMsIHRhbmRlbTogVGFuZGVtICkge1xyXG5cclxuICAgIGNvbnN0IHRpdGxlTm9kZSA9IG5ldyBUZXh0KCB3aXJlUmVzaXN0aXZpdHlTdHJpbmdQcm9wZXJ0eSxcclxuICAgICAgY29tYmluZU9wdGlvbnM8VGV4dE9wdGlvbnM+KCB7IHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3RpdGxlVGV4dCcgKSwgZmlsbDogQ0NLQ0NvbG9ycy50ZXh0RmlsbFByb3BlcnR5IH0sIHRpdGxlQ29uZmlnICkgKTtcclxuXHJcbiAgICBjb25zdCBzbGlkZXIgPSBuZXcgSFNsaWRlciggd2lyZVJlc2lzdGl2aXR5UHJvcGVydHksIENDS0NDb25zdGFudHMuV0lSRV9SRVNJU1RJVklUWV9SQU5HRSwge1xyXG4gICAgICB0cmFja1NpemU6IENDS0NDb25zdGFudHMuU0xJREVSX1RSQUNLX1NJWkUsXHJcbiAgICAgIHRodW1iU2l6ZTogQ0NLQ0NvbnN0YW50cy5USFVNQl9TSVpFLFxyXG4gICAgICBtYWpvclRpY2tMZW5ndGg6IENDS0NDb25zdGFudHMuTUFKT1JfVElDS19MRU5HVEgsXHJcbiAgICAgIHBoZXRpb1Zpc2libGVQcm9wZXJ0eUluc3RydW1lbnRlZDogZmFsc2UsXHJcbiAgICAgIHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3NsaWRlcicgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIHNsaWRlci5hZGRNYWpvclRpY2soIDAsIG5ldyBUZXh0KCB0aW55U3RyaW5nUHJvcGVydHksIFRJQ0tfTEFCRUxfVEVYVF9PUFRJT05TICkgKTtcclxuICAgIHNsaWRlci5hZGRNYWpvclRpY2soIENDS0NDb25zdGFudHMuV0lSRV9SRVNJU1RJVklUWV9SQU5HRS5tYXgsIG5ldyBUZXh0KCBsb3RzU3RyaW5nUHJvcGVydHksIFRJQ0tfTEFCRUxfVEVYVF9PUFRJT05TICkgKTtcclxuXHJcbiAgICBzdXBlcigge1xyXG4gICAgICBjaGlsZHJlbjogWyB0aXRsZU5vZGUsIHNsaWRlciBdLFxyXG4gICAgICB0YW5kZW06IHRhbmRlbSxcclxuICAgICAgdmlzaWJsZVByb3BlcnR5T3B0aW9uczoge1xyXG4gICAgICAgIHBoZXRpb0ZlYXR1cmVkOiB0cnVlXHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuICB9XHJcbn1cclxuXHJcbmNpcmN1aXRDb25zdHJ1Y3Rpb25LaXRDb21tb24ucmVnaXN0ZXIoICdXaXJlUmVzaXN0aXZpdHlDb250cm9sJywgV2lyZVJlc2lzdGl2aXR5Q29udHJvbCApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLFNBQXFCQSxJQUFJLEVBQWVDLElBQUksUUFBUSxnQ0FBZ0M7QUFDcEYsT0FBT0MsT0FBTyxNQUFNLDRCQUE0QjtBQUNoRCxPQUFPQyxhQUFhLE1BQU0scUJBQXFCO0FBQy9DLE9BQU9DLG1DQUFtQyxNQUFNLDJDQUEyQztBQUMzRixPQUFPQyw0QkFBNEIsTUFBTSxvQ0FBb0M7QUFHN0UsU0FBU0MsY0FBYyxRQUFRLG9DQUFvQztBQUNuRSxPQUFPQyxVQUFVLE1BQU0saUJBQWlCO0FBRXhDLE1BQU1DLGtCQUFrQixHQUFHSixtQ0FBbUMsQ0FBQ0ksa0JBQWtCO0FBQ2pGLE1BQU1DLGtCQUFrQixHQUFHTCxtQ0FBbUMsQ0FBQ0ssa0JBQWtCO0FBQ2pGLE1BQU1DLDZCQUE2QixHQUFHTixtQ0FBbUMsQ0FBQ00sNkJBQTZCOztBQUV2RztBQUNBLE1BQU1DLHVCQUF1QixHQUFHO0VBQUVDLFFBQVEsRUFBRSxFQUFFO0VBQUVDLFFBQVEsRUFBRSxFQUFFO0VBQUVDLElBQUksRUFBRVAsVUFBVSxDQUFDUTtBQUFpQixDQUFDO0FBRWpHLGVBQWUsTUFBTUMsc0JBQXNCLFNBQVNmLElBQUksQ0FBQztFQUV2RDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDU2dCLFdBQVdBLENBQUVDLHVCQUF5QyxFQUFFQyxVQUFzQixFQUFFQyxXQUF3QixFQUFFQyxNQUFjLEVBQUc7SUFFaEksTUFBTUMsU0FBUyxHQUFHLElBQUl0QixJQUFJLENBQUVVLDZCQUE2QixFQUN2REosY0FBYyxDQUFlO01BQUVlLE1BQU0sRUFBRUEsTUFBTSxDQUFDRSxZQUFZLENBQUUsV0FBWSxDQUFDO01BQUVULElBQUksRUFBRVAsVUFBVSxDQUFDUTtJQUFpQixDQUFDLEVBQUVLLFdBQVksQ0FBRSxDQUFDO0lBRWpJLE1BQU1JLE1BQU0sR0FBRyxJQUFJdEIsT0FBTyxDQUFFZ0IsdUJBQXVCLEVBQUVmLGFBQWEsQ0FBQ3NCLHNCQUFzQixFQUFFO01BQ3pGQyxTQUFTLEVBQUV2QixhQUFhLENBQUN3QixpQkFBaUI7TUFDMUNDLFNBQVMsRUFBRXpCLGFBQWEsQ0FBQzBCLFVBQVU7TUFDbkNDLGVBQWUsRUFBRTNCLGFBQWEsQ0FBQzRCLGlCQUFpQjtNQUNoREMsaUNBQWlDLEVBQUUsS0FBSztNQUN4Q1gsTUFBTSxFQUFFQSxNQUFNLENBQUNFLFlBQVksQ0FBRSxRQUFTO0lBQ3hDLENBQUUsQ0FBQztJQUVIQyxNQUFNLENBQUNTLFlBQVksQ0FBRSxDQUFDLEVBQUUsSUFBSWpDLElBQUksQ0FBRVMsa0JBQWtCLEVBQUVFLHVCQUF3QixDQUFFLENBQUM7SUFDakZhLE1BQU0sQ0FBQ1MsWUFBWSxDQUFFOUIsYUFBYSxDQUFDc0Isc0JBQXNCLENBQUNTLEdBQUcsRUFBRSxJQUFJbEMsSUFBSSxDQUFFUSxrQkFBa0IsRUFBRUcsdUJBQXdCLENBQUUsQ0FBQztJQUV4SCxLQUFLLENBQUU7TUFDTHdCLFFBQVEsRUFBRSxDQUFFYixTQUFTLEVBQUVFLE1BQU0sQ0FBRTtNQUMvQkgsTUFBTSxFQUFFQSxNQUFNO01BQ2RlLHNCQUFzQixFQUFFO1FBQ3RCQyxjQUFjLEVBQUU7TUFDbEI7SUFDRixDQUFFLENBQUM7RUFDTDtBQUNGO0FBRUFoQyw0QkFBNEIsQ0FBQ2lDLFFBQVEsQ0FBRSx3QkFBd0IsRUFBRXRCLHNCQUF1QixDQUFDIn0=