// Copyright 2022, University of Colorado Boulder

/**
 * The container plate (in the bottom representation) that holds all of the chocolate a person has brought.
 * Each table plate is associated with a person.
 *
 * @author Marla Schulz (PhET Interactive Simulations)
 *
 */

import { Image, Node, VBox } from '../../../../scenery/js/imports.js';
import meanShareAndBalance from '../../meanShareAndBalance.js';
import NumberPicker from '../../../../sun/js/NumberPicker.js';
import MeanShareAndBalanceConstants from '../../common/MeanShareAndBalanceConstants.js';
import Range from '../../../../dot/js/Range.js';
import Property from '../../../../axon/js/Property.js';
import chocolateBar_png from '../../../images/chocolateBar_png.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import plate_png from '../../../images/plate_png.js';
export default class TablePlateNode extends Node {
  constructor(person, providedOptions) {
    const options = providedOptions;
    const plate = new Image(plate_png, {
      scale: 0.1,
      centerY: person.position.y
    });
    const numberPickerRange = new Range(MeanShareAndBalanceConstants.MIN_NUMBER_OF_CHOCOLATES, MeanShareAndBalanceConstants.MAX_NUMBER_OF_CHOCOLATES_PER_PERSON);
    const numberPicker = new NumberPicker(person.chocolateNumberProperty, new Property(numberPickerRange), {
      centerTop: new Vector2(plate.centerBottom.x, plate.centerBottom.y + 55),
      tandem: options.tandem.createTandem('numberPicker')
    });
    const chocolateScale = 0.04;

    // create chocolate person brought
    // REVIEW: See if it would be appropriate to use _.times elsewhere
    const chocolatesArray = _.times(MeanShareAndBalanceConstants.MAX_NUMBER_OF_CHOCOLATES_PER_PERSON, () => new Image(chocolateBar_png, {
      scale: chocolateScale
    }));
    const chocolatesVBox = new VBox({
      children: chocolatesArray,
      spacing: 1.5
    });
    person.chocolateNumberProperty.link(chocolateNumber => {
      chocolatesArray.forEach((chocolate, i) => {
        chocolate.visibleProperty.value = i < chocolateNumber;
        chocolatesVBox.centerBottom = new Vector2(plate.centerX, plate.centerY);
      });
    });
    const chocolatesNode = new Node({
      children: [plate, chocolatesVBox],
      layoutOptions: {
        minContentHeight: 265 * chocolateScale * 10
      }
    });
    super({
      children: [chocolatesNode, numberPicker],
      x: person.position.x,
      visibleProperty: person.isActiveProperty
    });
  }
}
meanShareAndBalance.register('TablePlateNode', TablePlateNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJJbWFnZSIsIk5vZGUiLCJWQm94IiwibWVhblNoYXJlQW5kQmFsYW5jZSIsIk51bWJlclBpY2tlciIsIk1lYW5TaGFyZUFuZEJhbGFuY2VDb25zdGFudHMiLCJSYW5nZSIsIlByb3BlcnR5IiwiY2hvY29sYXRlQmFyX3BuZyIsIlZlY3RvcjIiLCJwbGF0ZV9wbmciLCJUYWJsZVBsYXRlTm9kZSIsImNvbnN0cnVjdG9yIiwicGVyc29uIiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsInBsYXRlIiwic2NhbGUiLCJjZW50ZXJZIiwicG9zaXRpb24iLCJ5IiwibnVtYmVyUGlja2VyUmFuZ2UiLCJNSU5fTlVNQkVSX09GX0NIT0NPTEFURVMiLCJNQVhfTlVNQkVSX09GX0NIT0NPTEFURVNfUEVSX1BFUlNPTiIsIm51bWJlclBpY2tlciIsImNob2NvbGF0ZU51bWJlclByb3BlcnR5IiwiY2VudGVyVG9wIiwiY2VudGVyQm90dG9tIiwieCIsInRhbmRlbSIsImNyZWF0ZVRhbmRlbSIsImNob2NvbGF0ZVNjYWxlIiwiY2hvY29sYXRlc0FycmF5IiwiXyIsInRpbWVzIiwiY2hvY29sYXRlc1ZCb3giLCJjaGlsZHJlbiIsInNwYWNpbmciLCJsaW5rIiwiY2hvY29sYXRlTnVtYmVyIiwiZm9yRWFjaCIsImNob2NvbGF0ZSIsImkiLCJ2aXNpYmxlUHJvcGVydHkiLCJ2YWx1ZSIsImNlbnRlclgiLCJjaG9jb2xhdGVzTm9kZSIsImxheW91dE9wdGlvbnMiLCJtaW5Db250ZW50SGVpZ2h0IiwiaXNBY3RpdmVQcm9wZXJ0eSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiVGFibGVQbGF0ZU5vZGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFRoZSBjb250YWluZXIgcGxhdGUgKGluIHRoZSBib3R0b20gcmVwcmVzZW50YXRpb24pIHRoYXQgaG9sZHMgYWxsIG9mIHRoZSBjaG9jb2xhdGUgYSBwZXJzb24gaGFzIGJyb3VnaHQuXHJcbiAqIEVhY2ggdGFibGUgcGxhdGUgaXMgYXNzb2NpYXRlZCB3aXRoIGEgcGVyc29uLlxyXG4gKlxyXG4gKiBAYXV0aG9yIE1hcmxhIFNjaHVseiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICpcclxuICovXHJcblxyXG5pbXBvcnQgeyBJbWFnZSwgTm9kZSwgTm9kZU9wdGlvbnMsIFZCb3ggfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgbWVhblNoYXJlQW5kQmFsYW5jZSBmcm9tICcuLi8uLi9tZWFuU2hhcmVBbmRCYWxhbmNlLmpzJztcclxuaW1wb3J0IFBlcnNvbiBmcm9tICcuLi9tb2RlbC9QZXJzb24uanMnO1xyXG5pbXBvcnQgTnVtYmVyUGlja2VyIGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9OdW1iZXJQaWNrZXIuanMnO1xyXG5pbXBvcnQgTWVhblNoYXJlQW5kQmFsYW5jZUNvbnN0YW50cyBmcm9tICcuLi8uLi9jb21tb24vTWVhblNoYXJlQW5kQmFsYW5jZUNvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBSYW5nZSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvUmFuZ2UuanMnO1xyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBjaG9jb2xhdGVCYXJfcG5nIGZyb20gJy4uLy4uLy4uL2ltYWdlcy9jaG9jb2xhdGVCYXJfcG5nLmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgUGlja1JlcXVpcmVkIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy90eXBlcy9QaWNrUmVxdWlyZWQuanMnO1xyXG5pbXBvcnQgcGxhdGVfcG5nIGZyb20gJy4uLy4uLy4uL2ltYWdlcy9wbGF0ZV9wbmcuanMnO1xyXG5cclxudHlwZSBQZXJzb25Ob2RlT3B0aW9ucyA9IFBpY2tSZXF1aXJlZDxOb2RlT3B0aW9ucywgJ3RhbmRlbSc+O1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVGFibGVQbGF0ZU5vZGUgZXh0ZW5kcyBOb2RlIHtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBwZXJzb246IFBlcnNvbiwgcHJvdmlkZWRPcHRpb25zOiBQZXJzb25Ob2RlT3B0aW9ucyApIHtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zID0gcHJvdmlkZWRPcHRpb25zO1xyXG5cclxuICAgIGNvbnN0IHBsYXRlID0gbmV3IEltYWdlKCBwbGF0ZV9wbmcsIHtcclxuICAgICAgc2NhbGU6IDAuMSxcclxuICAgICAgY2VudGVyWTogcGVyc29uLnBvc2l0aW9uLnlcclxuICAgIH0gKTtcclxuXHJcblxyXG4gICAgY29uc3QgbnVtYmVyUGlja2VyUmFuZ2UgPSBuZXcgUmFuZ2UoIE1lYW5TaGFyZUFuZEJhbGFuY2VDb25zdGFudHMuTUlOX05VTUJFUl9PRl9DSE9DT0xBVEVTLCBNZWFuU2hhcmVBbmRCYWxhbmNlQ29uc3RhbnRzLk1BWF9OVU1CRVJfT0ZfQ0hPQ09MQVRFU19QRVJfUEVSU09OICk7XHJcbiAgICBjb25zdCBudW1iZXJQaWNrZXIgPSBuZXcgTnVtYmVyUGlja2VyKCBwZXJzb24uY2hvY29sYXRlTnVtYmVyUHJvcGVydHksIG5ldyBQcm9wZXJ0eSggbnVtYmVyUGlja2VyUmFuZ2UgKSxcclxuICAgICAgeyBjZW50ZXJUb3A6IG5ldyBWZWN0b3IyKCBwbGF0ZS5jZW50ZXJCb3R0b20ueCwgcGxhdGUuY2VudGVyQm90dG9tLnkgKyA1NSApLCB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ251bWJlclBpY2tlcicgKSB9ICk7XHJcblxyXG4gICAgY29uc3QgY2hvY29sYXRlU2NhbGUgPSAwLjA0O1xyXG5cclxuICAgIC8vIGNyZWF0ZSBjaG9jb2xhdGUgcGVyc29uIGJyb3VnaHRcclxuICAgIC8vIFJFVklFVzogU2VlIGlmIGl0IHdvdWxkIGJlIGFwcHJvcHJpYXRlIHRvIHVzZSBfLnRpbWVzIGVsc2V3aGVyZVxyXG4gICAgY29uc3QgY2hvY29sYXRlc0FycmF5ID0gXy50aW1lcyggTWVhblNoYXJlQW5kQmFsYW5jZUNvbnN0YW50cy5NQVhfTlVNQkVSX09GX0NIT0NPTEFURVNfUEVSX1BFUlNPTiwgKCkgPT4gbmV3IEltYWdlKCBjaG9jb2xhdGVCYXJfcG5nLCB7XHJcbiAgICAgIHNjYWxlOiBjaG9jb2xhdGVTY2FsZVxyXG4gICAgfSApICk7XHJcblxyXG4gICAgY29uc3QgY2hvY29sYXRlc1ZCb3ggPSBuZXcgVkJveCgge1xyXG4gICAgICBjaGlsZHJlbjogY2hvY29sYXRlc0FycmF5LFxyXG4gICAgICBzcGFjaW5nOiAxLjVcclxuICAgIH0gKTtcclxuXHJcbiAgICBwZXJzb24uY2hvY29sYXRlTnVtYmVyUHJvcGVydHkubGluayggY2hvY29sYXRlTnVtYmVyID0+IHtcclxuICAgICAgY2hvY29sYXRlc0FycmF5LmZvckVhY2goICggY2hvY29sYXRlLCBpICkgPT4ge1xyXG4gICAgICAgIGNob2NvbGF0ZS52aXNpYmxlUHJvcGVydHkudmFsdWUgPSBpIDwgY2hvY29sYXRlTnVtYmVyO1xyXG4gICAgICAgIGNob2NvbGF0ZXNWQm94LmNlbnRlckJvdHRvbSA9IG5ldyBWZWN0b3IyKCBwbGF0ZS5jZW50ZXJYLCBwbGF0ZS5jZW50ZXJZICk7XHJcbiAgICAgIH0gKTtcclxuICAgIH0gKTtcclxuXHJcbiAgICBjb25zdCBjaG9jb2xhdGVzTm9kZSA9IG5ldyBOb2RlKCB7XHJcbiAgICAgIGNoaWxkcmVuOiBbIHBsYXRlLCBjaG9jb2xhdGVzVkJveCBdLFxyXG4gICAgICBsYXlvdXRPcHRpb25zOiB7XHJcbiAgICAgICAgbWluQ29udGVudEhlaWdodDogKCAyNjUgKiBjaG9jb2xhdGVTY2FsZSApICogMTBcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuICAgIHN1cGVyKCB7XHJcbiAgICAgIGNoaWxkcmVuOiBbIGNob2NvbGF0ZXNOb2RlLCBudW1iZXJQaWNrZXIgXSxcclxuICAgICAgeDogcGVyc29uLnBvc2l0aW9uLngsXHJcbiAgICAgIHZpc2libGVQcm9wZXJ0eTogcGVyc29uLmlzQWN0aXZlUHJvcGVydHlcclxuICAgIH0gKTtcclxuICB9XHJcbn1cclxuXHJcbm1lYW5TaGFyZUFuZEJhbGFuY2UucmVnaXN0ZXIoICdUYWJsZVBsYXRlTm9kZScsIFRhYmxlUGxhdGVOb2RlICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxTQUFTQSxLQUFLLEVBQUVDLElBQUksRUFBZUMsSUFBSSxRQUFRLG1DQUFtQztBQUNsRixPQUFPQyxtQkFBbUIsTUFBTSw4QkFBOEI7QUFFOUQsT0FBT0MsWUFBWSxNQUFNLG9DQUFvQztBQUM3RCxPQUFPQyw0QkFBNEIsTUFBTSw4Q0FBOEM7QUFDdkYsT0FBT0MsS0FBSyxNQUFNLDZCQUE2QjtBQUMvQyxPQUFPQyxRQUFRLE1BQU0saUNBQWlDO0FBQ3RELE9BQU9DLGdCQUFnQixNQUFNLHFDQUFxQztBQUNsRSxPQUFPQyxPQUFPLE1BQU0sK0JBQStCO0FBRW5ELE9BQU9DLFNBQVMsTUFBTSw4QkFBOEI7QUFJcEQsZUFBZSxNQUFNQyxjQUFjLFNBQVNWLElBQUksQ0FBQztFQUV4Q1csV0FBV0EsQ0FBRUMsTUFBYyxFQUFFQyxlQUFrQyxFQUFHO0lBRXZFLE1BQU1DLE9BQU8sR0FBR0QsZUFBZTtJQUUvQixNQUFNRSxLQUFLLEdBQUcsSUFBSWhCLEtBQUssQ0FBRVUsU0FBUyxFQUFFO01BQ2xDTyxLQUFLLEVBQUUsR0FBRztNQUNWQyxPQUFPLEVBQUVMLE1BQU0sQ0FBQ00sUUFBUSxDQUFDQztJQUMzQixDQUFFLENBQUM7SUFHSCxNQUFNQyxpQkFBaUIsR0FBRyxJQUFJZixLQUFLLENBQUVELDRCQUE0QixDQUFDaUIsd0JBQXdCLEVBQUVqQiw0QkFBNEIsQ0FBQ2tCLG1DQUFvQyxDQUFDO0lBQzlKLE1BQU1DLFlBQVksR0FBRyxJQUFJcEIsWUFBWSxDQUFFUyxNQUFNLENBQUNZLHVCQUF1QixFQUFFLElBQUlsQixRQUFRLENBQUVjLGlCQUFrQixDQUFDLEVBQ3RHO01BQUVLLFNBQVMsRUFBRSxJQUFJakIsT0FBTyxDQUFFTyxLQUFLLENBQUNXLFlBQVksQ0FBQ0MsQ0FBQyxFQUFFWixLQUFLLENBQUNXLFlBQVksQ0FBQ1AsQ0FBQyxHQUFHLEVBQUcsQ0FBQztNQUFFUyxNQUFNLEVBQUVkLE9BQU8sQ0FBQ2MsTUFBTSxDQUFDQyxZQUFZLENBQUUsY0FBZTtJQUFFLENBQUUsQ0FBQztJQUV4SSxNQUFNQyxjQUFjLEdBQUcsSUFBSTs7SUFFM0I7SUFDQTtJQUNBLE1BQU1DLGVBQWUsR0FBR0MsQ0FBQyxDQUFDQyxLQUFLLENBQUU3Qiw0QkFBNEIsQ0FBQ2tCLG1DQUFtQyxFQUFFLE1BQU0sSUFBSXZCLEtBQUssQ0FBRVEsZ0JBQWdCLEVBQUU7TUFDcElTLEtBQUssRUFBRWM7SUFDVCxDQUFFLENBQUUsQ0FBQztJQUVMLE1BQU1JLGNBQWMsR0FBRyxJQUFJakMsSUFBSSxDQUFFO01BQy9Ca0MsUUFBUSxFQUFFSixlQUFlO01BQ3pCSyxPQUFPLEVBQUU7SUFDWCxDQUFFLENBQUM7SUFFSHhCLE1BQU0sQ0FBQ1ksdUJBQXVCLENBQUNhLElBQUksQ0FBRUMsZUFBZSxJQUFJO01BQ3REUCxlQUFlLENBQUNRLE9BQU8sQ0FBRSxDQUFFQyxTQUFTLEVBQUVDLENBQUMsS0FBTTtRQUMzQ0QsU0FBUyxDQUFDRSxlQUFlLENBQUNDLEtBQUssR0FBR0YsQ0FBQyxHQUFHSCxlQUFlO1FBQ3JESixjQUFjLENBQUNSLFlBQVksR0FBRyxJQUFJbEIsT0FBTyxDQUFFTyxLQUFLLENBQUM2QixPQUFPLEVBQUU3QixLQUFLLENBQUNFLE9BQVEsQ0FBQztNQUMzRSxDQUFFLENBQUM7SUFDTCxDQUFFLENBQUM7SUFFSCxNQUFNNEIsY0FBYyxHQUFHLElBQUk3QyxJQUFJLENBQUU7TUFDL0JtQyxRQUFRLEVBQUUsQ0FBRXBCLEtBQUssRUFBRW1CLGNBQWMsQ0FBRTtNQUNuQ1ksYUFBYSxFQUFFO1FBQ2JDLGdCQUFnQixFQUFJLEdBQUcsR0FBR2pCLGNBQWMsR0FBSztNQUMvQztJQUNGLENBQUUsQ0FBQztJQUVILEtBQUssQ0FBRTtNQUNMSyxRQUFRLEVBQUUsQ0FBRVUsY0FBYyxFQUFFdEIsWUFBWSxDQUFFO01BQzFDSSxDQUFDLEVBQUVmLE1BQU0sQ0FBQ00sUUFBUSxDQUFDUyxDQUFDO01BQ3BCZSxlQUFlLEVBQUU5QixNQUFNLENBQUNvQztJQUMxQixDQUFFLENBQUM7RUFDTDtBQUNGO0FBRUE5QyxtQkFBbUIsQ0FBQytDLFFBQVEsQ0FBRSxnQkFBZ0IsRUFBRXZDLGNBQWUsQ0FBQyJ9