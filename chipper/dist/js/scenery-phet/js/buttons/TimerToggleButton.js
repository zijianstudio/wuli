// Copyright 2013-2022, University of Colorado Boulder

/**
 * Button for toggling timer on and off.
 *
 * @author John Blanco
 */

import { Shape } from '../../../kite/js/imports.js';
import optionize from '../../../phet-core/js/optionize.js';
import { Node, Path } from '../../../scenery/js/imports.js';
import BooleanRectangularToggleButton from '../../../sun/js/buttons/BooleanRectangularToggleButton.js';
import PhetColorScheme from '../PhetColorScheme.js';
import sceneryPhet from '../sceneryPhet.js';
import SimpleClockIcon from '../SimpleClockIcon.js';

// constants
const WIDTH = 45;
const HEIGHT = 45;
const MARGIN = 4;
export default class TimerToggleButton extends BooleanRectangularToggleButton {
  constructor(timerRunningProperty, provideOptions) {
    const options = optionize()({
      // BooleanRectangularToggleButtonOptions
      baseColor: PhetColorScheme.BUTTON_YELLOW,
      minWidth: WIDTH,
      minHeight: HEIGHT,
      xMargin: MARGIN,
      yMargin: MARGIN
    }, provideOptions);
    const clockRadius = WIDTH * 0.35;
    super(timerRunningProperty, createOnIcon(clockRadius), createOffIcon(clockRadius), options);
  }
}

/**
 * Creates the icon for the 'on' state. This is a clock icon.
 */
function createOnIcon(clockRadius) {
  return new SimpleClockIcon(clockRadius);
}

/**
 * Creates the icon for the 'off' state. This is a clock icon with a red 'X' over it.
 */
function createOffIcon(clockRadius) {
  const clockIcon = new SimpleClockIcon(clockRadius, {
    opacity: 0.8
  });
  const xShapeWidth = clockIcon.width * 0.8;
  const xShape = new Shape().moveTo(0, 0).lineTo(xShapeWidth, xShapeWidth).moveTo(0, xShapeWidth).lineTo(xShapeWidth, 0);
  const xNode = new Path(xShape, {
    stroke: 'red',
    opacity: 0.55,
    lineWidth: 6,
    lineCap: 'round',
    center: clockIcon.center
  });
  return new Node({
    children: [clockIcon, xNode]
  });
}
sceneryPhet.register('TimerToggleButton', TimerToggleButton);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTaGFwZSIsIm9wdGlvbml6ZSIsIk5vZGUiLCJQYXRoIiwiQm9vbGVhblJlY3Rhbmd1bGFyVG9nZ2xlQnV0dG9uIiwiUGhldENvbG9yU2NoZW1lIiwic2NlbmVyeVBoZXQiLCJTaW1wbGVDbG9ja0ljb24iLCJXSURUSCIsIkhFSUdIVCIsIk1BUkdJTiIsIlRpbWVyVG9nZ2xlQnV0dG9uIiwiY29uc3RydWN0b3IiLCJ0aW1lclJ1bm5pbmdQcm9wZXJ0eSIsInByb3ZpZGVPcHRpb25zIiwib3B0aW9ucyIsImJhc2VDb2xvciIsIkJVVFRPTl9ZRUxMT1ciLCJtaW5XaWR0aCIsIm1pbkhlaWdodCIsInhNYXJnaW4iLCJ5TWFyZ2luIiwiY2xvY2tSYWRpdXMiLCJjcmVhdGVPbkljb24iLCJjcmVhdGVPZmZJY29uIiwiY2xvY2tJY29uIiwib3BhY2l0eSIsInhTaGFwZVdpZHRoIiwid2lkdGgiLCJ4U2hhcGUiLCJtb3ZlVG8iLCJsaW5lVG8iLCJ4Tm9kZSIsInN0cm9rZSIsImxpbmVXaWR0aCIsImxpbmVDYXAiLCJjZW50ZXIiLCJjaGlsZHJlbiIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiVGltZXJUb2dnbGVCdXR0b24udHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTMtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogQnV0dG9uIGZvciB0b2dnbGluZyB0aW1lciBvbiBhbmQgb2ZmLlxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvXHJcbiAqL1xyXG5cclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgeyBTaGFwZSB9IGZyb20gJy4uLy4uLy4uL2tpdGUvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBvcHRpb25pemUsIHsgRW1wdHlTZWxmT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgeyBOb2RlLCBQYXRoIH0gZnJvbSAnLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IEJvb2xlYW5SZWN0YW5ndWxhclRvZ2dsZUJ1dHRvbiwgeyBCb29sZWFuUmVjdGFuZ3VsYXJUb2dnbGVCdXR0b25PcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vc3VuL2pzL2J1dHRvbnMvQm9vbGVhblJlY3Rhbmd1bGFyVG9nZ2xlQnV0dG9uLmpzJztcclxuaW1wb3J0IFBoZXRDb2xvclNjaGVtZSBmcm9tICcuLi9QaGV0Q29sb3JTY2hlbWUuanMnO1xyXG5pbXBvcnQgc2NlbmVyeVBoZXQgZnJvbSAnLi4vc2NlbmVyeVBoZXQuanMnO1xyXG5pbXBvcnQgU2ltcGxlQ2xvY2tJY29uIGZyb20gJy4uL1NpbXBsZUNsb2NrSWNvbi5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3QgV0lEVEggPSA0NTtcclxuY29uc3QgSEVJR0hUID0gNDU7XHJcbmNvbnN0IE1BUkdJTiA9IDQ7XHJcblxyXG50eXBlIFNlbGZPcHRpb25zID0gRW1wdHlTZWxmT3B0aW9ucztcclxuXHJcbmV4cG9ydCB0eXBlIFRpbWVyVG9nZ2xlQnV0dG9uT3B0aW9ucyA9IFNlbGZPcHRpb25zICYgQm9vbGVhblJlY3Rhbmd1bGFyVG9nZ2xlQnV0dG9uT3B0aW9ucztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRpbWVyVG9nZ2xlQnV0dG9uIGV4dGVuZHMgQm9vbGVhblJlY3Rhbmd1bGFyVG9nZ2xlQnV0dG9uIHtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCB0aW1lclJ1bm5pbmdQcm9wZXJ0eTogUHJvcGVydHk8Ym9vbGVhbj4sIHByb3ZpZGVPcHRpb25zPzogVGltZXJUb2dnbGVCdXR0b25PcHRpb25zICkge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8VGltZXJUb2dnbGVCdXR0b25PcHRpb25zLCBTZWxmT3B0aW9ucywgQm9vbGVhblJlY3Rhbmd1bGFyVG9nZ2xlQnV0dG9uT3B0aW9ucz4oKSgge1xyXG5cclxuICAgICAgLy8gQm9vbGVhblJlY3Rhbmd1bGFyVG9nZ2xlQnV0dG9uT3B0aW9uc1xyXG4gICAgICBiYXNlQ29sb3I6IFBoZXRDb2xvclNjaGVtZS5CVVRUT05fWUVMTE9XLFxyXG4gICAgICBtaW5XaWR0aDogV0lEVEgsXHJcbiAgICAgIG1pbkhlaWdodDogSEVJR0hULFxyXG4gICAgICB4TWFyZ2luOiBNQVJHSU4sXHJcbiAgICAgIHlNYXJnaW46IE1BUkdJTlxyXG4gICAgfSwgcHJvdmlkZU9wdGlvbnMgKTtcclxuXHJcbiAgICBjb25zdCBjbG9ja1JhZGl1cyA9IFdJRFRIICogMC4zNTtcclxuXHJcbiAgICBzdXBlciggdGltZXJSdW5uaW5nUHJvcGVydHksIGNyZWF0ZU9uSWNvbiggY2xvY2tSYWRpdXMgKSwgY3JlYXRlT2ZmSWNvbiggY2xvY2tSYWRpdXMgKSwgb3B0aW9ucyApO1xyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIENyZWF0ZXMgdGhlIGljb24gZm9yIHRoZSAnb24nIHN0YXRlLiBUaGlzIGlzIGEgY2xvY2sgaWNvbi5cclxuICovXHJcbmZ1bmN0aW9uIGNyZWF0ZU9uSWNvbiggY2xvY2tSYWRpdXM6IG51bWJlciApOiBOb2RlIHtcclxuICByZXR1cm4gbmV3IFNpbXBsZUNsb2NrSWNvbiggY2xvY2tSYWRpdXMgKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIENyZWF0ZXMgdGhlIGljb24gZm9yIHRoZSAnb2ZmJyBzdGF0ZS4gVGhpcyBpcyBhIGNsb2NrIGljb24gd2l0aCBhIHJlZCAnWCcgb3ZlciBpdC5cclxuICovXHJcbmZ1bmN0aW9uIGNyZWF0ZU9mZkljb24oIGNsb2NrUmFkaXVzOiBudW1iZXIgKTogTm9kZSB7XHJcblxyXG4gIGNvbnN0IGNsb2NrSWNvbiA9IG5ldyBTaW1wbGVDbG9ja0ljb24oIGNsb2NrUmFkaXVzLCB7IG9wYWNpdHk6IDAuOCB9ICk7XHJcblxyXG4gIGNvbnN0IHhTaGFwZVdpZHRoID0gY2xvY2tJY29uLndpZHRoICogMC44O1xyXG4gIGNvbnN0IHhTaGFwZSA9IG5ldyBTaGFwZSgpXHJcbiAgICAubW92ZVRvKCAwLCAwIClcclxuICAgIC5saW5lVG8oIHhTaGFwZVdpZHRoLCB4U2hhcGVXaWR0aCApXHJcbiAgICAubW92ZVRvKCAwLCB4U2hhcGVXaWR0aCApXHJcbiAgICAubGluZVRvKCB4U2hhcGVXaWR0aCwgMCApO1xyXG4gIGNvbnN0IHhOb2RlID0gbmV3IFBhdGgoIHhTaGFwZSwge1xyXG4gICAgc3Ryb2tlOiAncmVkJyxcclxuICAgIG9wYWNpdHk6IDAuNTUsXHJcbiAgICBsaW5lV2lkdGg6IDYsXHJcbiAgICBsaW5lQ2FwOiAncm91bmQnLFxyXG4gICAgY2VudGVyOiBjbG9ja0ljb24uY2VudGVyXHJcbiAgfSApO1xyXG5cclxuICByZXR1cm4gbmV3IE5vZGUoIHtcclxuICAgIGNoaWxkcmVuOiBbIGNsb2NrSWNvbiwgeE5vZGUgXVxyXG4gIH0gKTtcclxufVxyXG5cclxuc2NlbmVyeVBoZXQucmVnaXN0ZXIoICdUaW1lclRvZ2dsZUJ1dHRvbicsIFRpbWVyVG9nZ2xlQnV0dG9uICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUdBLFNBQVNBLEtBQUssUUFBUSw2QkFBNkI7QUFDbkQsT0FBT0MsU0FBUyxNQUE0QixvQ0FBb0M7QUFDaEYsU0FBU0MsSUFBSSxFQUFFQyxJQUFJLFFBQVEsZ0NBQWdDO0FBQzNELE9BQU9DLDhCQUE4QixNQUFpRCwyREFBMkQ7QUFDakosT0FBT0MsZUFBZSxNQUFNLHVCQUF1QjtBQUNuRCxPQUFPQyxXQUFXLE1BQU0sbUJBQW1CO0FBQzNDLE9BQU9DLGVBQWUsTUFBTSx1QkFBdUI7O0FBRW5EO0FBQ0EsTUFBTUMsS0FBSyxHQUFHLEVBQUU7QUFDaEIsTUFBTUMsTUFBTSxHQUFHLEVBQUU7QUFDakIsTUFBTUMsTUFBTSxHQUFHLENBQUM7QUFNaEIsZUFBZSxNQUFNQyxpQkFBaUIsU0FBU1AsOEJBQThCLENBQUM7RUFFckVRLFdBQVdBLENBQUVDLG9CQUF1QyxFQUFFQyxjQUF5QyxFQUFHO0lBRXZHLE1BQU1DLE9BQU8sR0FBR2QsU0FBUyxDQUErRSxDQUFDLENBQUU7TUFFekc7TUFDQWUsU0FBUyxFQUFFWCxlQUFlLENBQUNZLGFBQWE7TUFDeENDLFFBQVEsRUFBRVYsS0FBSztNQUNmVyxTQUFTLEVBQUVWLE1BQU07TUFDakJXLE9BQU8sRUFBRVYsTUFBTTtNQUNmVyxPQUFPLEVBQUVYO0lBQ1gsQ0FBQyxFQUFFSSxjQUFlLENBQUM7SUFFbkIsTUFBTVEsV0FBVyxHQUFHZCxLQUFLLEdBQUcsSUFBSTtJQUVoQyxLQUFLLENBQUVLLG9CQUFvQixFQUFFVSxZQUFZLENBQUVELFdBQVksQ0FBQyxFQUFFRSxhQUFhLENBQUVGLFdBQVksQ0FBQyxFQUFFUCxPQUFRLENBQUM7RUFDbkc7QUFDRjs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxTQUFTUSxZQUFZQSxDQUFFRCxXQUFtQixFQUFTO0VBQ2pELE9BQU8sSUFBSWYsZUFBZSxDQUFFZSxXQUFZLENBQUM7QUFDM0M7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsU0FBU0UsYUFBYUEsQ0FBRUYsV0FBbUIsRUFBUztFQUVsRCxNQUFNRyxTQUFTLEdBQUcsSUFBSWxCLGVBQWUsQ0FBRWUsV0FBVyxFQUFFO0lBQUVJLE9BQU8sRUFBRTtFQUFJLENBQUUsQ0FBQztFQUV0RSxNQUFNQyxXQUFXLEdBQUdGLFNBQVMsQ0FBQ0csS0FBSyxHQUFHLEdBQUc7RUFDekMsTUFBTUMsTUFBTSxHQUFHLElBQUk3QixLQUFLLENBQUMsQ0FBQyxDQUN2QjhCLE1BQU0sQ0FBRSxDQUFDLEVBQUUsQ0FBRSxDQUFDLENBQ2RDLE1BQU0sQ0FBRUosV0FBVyxFQUFFQSxXQUFZLENBQUMsQ0FDbENHLE1BQU0sQ0FBRSxDQUFDLEVBQUVILFdBQVksQ0FBQyxDQUN4QkksTUFBTSxDQUFFSixXQUFXLEVBQUUsQ0FBRSxDQUFDO0VBQzNCLE1BQU1LLEtBQUssR0FBRyxJQUFJN0IsSUFBSSxDQUFFMEIsTUFBTSxFQUFFO0lBQzlCSSxNQUFNLEVBQUUsS0FBSztJQUNiUCxPQUFPLEVBQUUsSUFBSTtJQUNiUSxTQUFTLEVBQUUsQ0FBQztJQUNaQyxPQUFPLEVBQUUsT0FBTztJQUNoQkMsTUFBTSxFQUFFWCxTQUFTLENBQUNXO0VBQ3BCLENBQUUsQ0FBQztFQUVILE9BQU8sSUFBSWxDLElBQUksQ0FBRTtJQUNmbUMsUUFBUSxFQUFFLENBQUVaLFNBQVMsRUFBRU8sS0FBSztFQUM5QixDQUFFLENBQUM7QUFDTDtBQUVBMUIsV0FBVyxDQUFDZ0MsUUFBUSxDQUFFLG1CQUFtQixFQUFFM0IsaUJBQWtCLENBQUMifQ==