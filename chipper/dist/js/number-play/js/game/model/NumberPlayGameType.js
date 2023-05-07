// Copyright 2021-2022, University of Colorado Boulder

import EnumerationValue from '../../../../phet-core/js/EnumerationValue.js';
import Enumeration from '../../../../phet-core/js/Enumeration.js';
import numberPlay from '../../numberPlay.js';
import NumberPlayStrings from '../../NumberPlayStrings.js';
import subitizeGameIcon1_png from '../../../images/subitizeGameIcon1_png.js';
import countingGameIcon1_png from '../../../images/countingGameIcon1_png.js';
import subitizeGameIcon2_png from '../../../images/subitizeGameIcon2_png.js';
import countingGameIcon2_png from '../../../images/countingGameIcon2_png.js';

/**
 *  NumberPlayGameType identifies the game type in Number Play.
 *
 * @author Luisa Vargas
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

class NumberPlayGameType extends EnumerationValue {
  static COUNTING = new NumberPlayGameType({
    1: NumberPlayStrings.countingLevel1DescriptionStringProperty,
    2: NumberPlayStrings.countingLevel2DescriptionStringProperty
  }, {
    1: countingGameIcon1_png,
    2: countingGameIcon2_png
  });
  static SUBITIZE = new NumberPlayGameType({
    1: NumberPlayStrings.subitizingLevel1DescriptionStringProperty,
    2: NumberPlayStrings.subitizingLevel2DescriptionStringProperty
  }, {
    1: subitizeGameIcon1_png,
    2: subitizeGameIcon2_png
  });
  static enumeration = new Enumeration(NumberPlayGameType);
  constructor(levelDescriptions, levelImages) {
    super();
    this.levelDescriptions = levelDescriptions;
    this.levelImages = levelImages;
  }
}
numberPlay.register('NumberPlayGameType', NumberPlayGameType);
export default NumberPlayGameType;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJFbnVtZXJhdGlvblZhbHVlIiwiRW51bWVyYXRpb24iLCJudW1iZXJQbGF5IiwiTnVtYmVyUGxheVN0cmluZ3MiLCJzdWJpdGl6ZUdhbWVJY29uMV9wbmciLCJjb3VudGluZ0dhbWVJY29uMV9wbmciLCJzdWJpdGl6ZUdhbWVJY29uMl9wbmciLCJjb3VudGluZ0dhbWVJY29uMl9wbmciLCJOdW1iZXJQbGF5R2FtZVR5cGUiLCJDT1VOVElORyIsImNvdW50aW5nTGV2ZWwxRGVzY3JpcHRpb25TdHJpbmdQcm9wZXJ0eSIsImNvdW50aW5nTGV2ZWwyRGVzY3JpcHRpb25TdHJpbmdQcm9wZXJ0eSIsIlNVQklUSVpFIiwic3ViaXRpemluZ0xldmVsMURlc2NyaXB0aW9uU3RyaW5nUHJvcGVydHkiLCJzdWJpdGl6aW5nTGV2ZWwyRGVzY3JpcHRpb25TdHJpbmdQcm9wZXJ0eSIsImVudW1lcmF0aW9uIiwiY29uc3RydWN0b3IiLCJsZXZlbERlc2NyaXB0aW9ucyIsImxldmVsSW1hZ2VzIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJOdW1iZXJQbGF5R2FtZVR5cGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjEtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG5pbXBvcnQgRW51bWVyYXRpb25WYWx1ZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvRW51bWVyYXRpb25WYWx1ZS5qcyc7XHJcbmltcG9ydCBFbnVtZXJhdGlvbiBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvRW51bWVyYXRpb24uanMnO1xyXG5pbXBvcnQgbnVtYmVyUGxheSBmcm9tICcuLi8uLi9udW1iZXJQbGF5LmpzJztcclxuaW1wb3J0IE51bWJlclBsYXlTdHJpbmdzIGZyb20gJy4uLy4uL051bWJlclBsYXlTdHJpbmdzLmpzJztcclxuaW1wb3J0IHN1Yml0aXplR2FtZUljb24xX3BuZyBmcm9tICcuLi8uLi8uLi9pbWFnZXMvc3ViaXRpemVHYW1lSWNvbjFfcG5nLmpzJztcclxuaW1wb3J0IGNvdW50aW5nR2FtZUljb24xX3BuZyBmcm9tICcuLi8uLi8uLi9pbWFnZXMvY291bnRpbmdHYW1lSWNvbjFfcG5nLmpzJztcclxuaW1wb3J0IHN1Yml0aXplR2FtZUljb24yX3BuZyBmcm9tICcuLi8uLi8uLi9pbWFnZXMvc3ViaXRpemVHYW1lSWNvbjJfcG5nLmpzJztcclxuaW1wb3J0IGNvdW50aW5nR2FtZUljb24yX3BuZyBmcm9tICcuLi8uLi8uLi9pbWFnZXMvY291bnRpbmdHYW1lSWNvbjJfcG5nLmpzJztcclxuaW1wb3J0IExpbmthYmxlUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9MaW5rYWJsZVByb3BlcnR5LmpzJztcclxuXHJcbi8qKlxyXG4gKiAgTnVtYmVyUGxheUdhbWVUeXBlIGlkZW50aWZpZXMgdGhlIGdhbWUgdHlwZSBpbiBOdW1iZXIgUGxheS5cclxuICpcclxuICogQGF1dGhvciBMdWlzYSBWYXJnYXNcclxuICogQGF1dGhvciBDaHJpcyBLbHVzZW5kb3JmIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbnR5cGUgTGV2ZWxEZXNjcmlwdGlvbnMgPSBSZWNvcmQ8bnVtYmVyLCBMaW5rYWJsZVByb3BlcnR5PHN0cmluZz4+O1xyXG50eXBlIExldmVsSW1hZ2VzID0gUmVjb3JkPG51bWJlciwgSFRNTEltYWdlRWxlbWVudD47XHJcblxyXG5jbGFzcyBOdW1iZXJQbGF5R2FtZVR5cGUgZXh0ZW5kcyBFbnVtZXJhdGlvblZhbHVlIHtcclxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IENPVU5USU5HID0gbmV3IE51bWJlclBsYXlHYW1lVHlwZSgge1xyXG4gICAgMTogTnVtYmVyUGxheVN0cmluZ3MuY291bnRpbmdMZXZlbDFEZXNjcmlwdGlvblN0cmluZ1Byb3BlcnR5LFxyXG4gICAgMjogTnVtYmVyUGxheVN0cmluZ3MuY291bnRpbmdMZXZlbDJEZXNjcmlwdGlvblN0cmluZ1Byb3BlcnR5XHJcbiAgfSwge1xyXG4gICAgMTogY291bnRpbmdHYW1lSWNvbjFfcG5nLFxyXG4gICAgMjogY291bnRpbmdHYW1lSWNvbjJfcG5nXHJcbiAgfSApO1xyXG5cclxuICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IFNVQklUSVpFID0gbmV3IE51bWJlclBsYXlHYW1lVHlwZSgge1xyXG4gICAgMTogTnVtYmVyUGxheVN0cmluZ3Muc3ViaXRpemluZ0xldmVsMURlc2NyaXB0aW9uU3RyaW5nUHJvcGVydHksXHJcbiAgICAyOiBOdW1iZXJQbGF5U3RyaW5ncy5zdWJpdGl6aW5nTGV2ZWwyRGVzY3JpcHRpb25TdHJpbmdQcm9wZXJ0eVxyXG4gIH0sIHtcclxuICAgIDE6IHN1Yml0aXplR2FtZUljb24xX3BuZyxcclxuICAgIDI6IHN1Yml0aXplR2FtZUljb24yX3BuZ1xyXG4gIH0gKTtcclxuXHJcbiAgcHVibGljIHN0YXRpYyByZWFkb25seSBlbnVtZXJhdGlvbiA9IG5ldyBFbnVtZXJhdGlvbiggTnVtYmVyUGxheUdhbWVUeXBlICk7XHJcblxyXG4gIHB1YmxpYyByZWFkb25seSBsZXZlbERlc2NyaXB0aW9uczogTGV2ZWxEZXNjcmlwdGlvbnM7XHJcbiAgcHVibGljIHJlYWRvbmx5IGxldmVsSW1hZ2VzOiBMZXZlbEltYWdlcztcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBsZXZlbERlc2NyaXB0aW9uczogTGV2ZWxEZXNjcmlwdGlvbnMsIGxldmVsSW1hZ2VzOiBMZXZlbEltYWdlcyApIHtcclxuICAgIHN1cGVyKCk7XHJcblxyXG4gICAgdGhpcy5sZXZlbERlc2NyaXB0aW9ucyA9IGxldmVsRGVzY3JpcHRpb25zO1xyXG4gICAgdGhpcy5sZXZlbEltYWdlcyA9IGxldmVsSW1hZ2VzO1xyXG4gIH1cclxufVxyXG5cclxubnVtYmVyUGxheS5yZWdpc3RlciggJ051bWJlclBsYXlHYW1lVHlwZScsIE51bWJlclBsYXlHYW1lVHlwZSApO1xyXG5leHBvcnQgZGVmYXVsdCBOdW1iZXJQbGF5R2FtZVR5cGU7XHJcbiJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUEsT0FBT0EsZ0JBQWdCLE1BQU0sOENBQThDO0FBQzNFLE9BQU9DLFdBQVcsTUFBTSx5Q0FBeUM7QUFDakUsT0FBT0MsVUFBVSxNQUFNLHFCQUFxQjtBQUM1QyxPQUFPQyxpQkFBaUIsTUFBTSw0QkFBNEI7QUFDMUQsT0FBT0MscUJBQXFCLE1BQU0sMENBQTBDO0FBQzVFLE9BQU9DLHFCQUFxQixNQUFNLDBDQUEwQztBQUM1RSxPQUFPQyxxQkFBcUIsTUFBTSwwQ0FBMEM7QUFDNUUsT0FBT0MscUJBQXFCLE1BQU0sMENBQTBDOztBQUc1RTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBS0EsTUFBTUMsa0JBQWtCLFNBQVNSLGdCQUFnQixDQUFDO0VBQ2hELE9BQXVCUyxRQUFRLEdBQUcsSUFBSUQsa0JBQWtCLENBQUU7SUFDeEQsQ0FBQyxFQUFFTCxpQkFBaUIsQ0FBQ08sdUNBQXVDO0lBQzVELENBQUMsRUFBRVAsaUJBQWlCLENBQUNRO0VBQ3ZCLENBQUMsRUFBRTtJQUNELENBQUMsRUFBRU4scUJBQXFCO0lBQ3hCLENBQUMsRUFBRUU7RUFDTCxDQUFFLENBQUM7RUFFSCxPQUF1QkssUUFBUSxHQUFHLElBQUlKLGtCQUFrQixDQUFFO0lBQ3hELENBQUMsRUFBRUwsaUJBQWlCLENBQUNVLHlDQUF5QztJQUM5RCxDQUFDLEVBQUVWLGlCQUFpQixDQUFDVztFQUN2QixDQUFDLEVBQUU7SUFDRCxDQUFDLEVBQUVWLHFCQUFxQjtJQUN4QixDQUFDLEVBQUVFO0VBQ0wsQ0FBRSxDQUFDO0VBRUgsT0FBdUJTLFdBQVcsR0FBRyxJQUFJZCxXQUFXLENBQUVPLGtCQUFtQixDQUFDO0VBS25FUSxXQUFXQSxDQUFFQyxpQkFBb0MsRUFBRUMsV0FBd0IsRUFBRztJQUNuRixLQUFLLENBQUMsQ0FBQztJQUVQLElBQUksQ0FBQ0QsaUJBQWlCLEdBQUdBLGlCQUFpQjtJQUMxQyxJQUFJLENBQUNDLFdBQVcsR0FBR0EsV0FBVztFQUNoQztBQUNGO0FBRUFoQixVQUFVLENBQUNpQixRQUFRLENBQUUsb0JBQW9CLEVBQUVYLGtCQUFtQixDQUFDO0FBQy9ELGVBQWVBLGtCQUFrQiJ9