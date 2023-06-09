// Copyright 2018-2022, University of Colorado Boulder

/**
 * Display a score as 'Score: N', where N is a number.
 * See specification in https://github.com/phetsims/vegas/issues/59.
 *
 * @author Andrea Lin
 */

import Utils from '../../dot/js/Utils.js';
import StringUtils from '../../phetcommon/js/util/StringUtils.js';
import { Node, Text } from '../../scenery/js/imports.js';
import StatusBar from '../../scenery-phet/js/StatusBar.js';
import vegas from './vegas.js';
import VegasStrings from './VegasStrings.js';
import optionize from '../../phet-core/js/optionize.js';
import DerivedProperty from '../../axon/js/DerivedProperty.js';
export default class ScoreDisplayLabeledNumber extends Node {
  constructor(scoreProperty, providedOptions) {
    const options = optionize()({
      // SelfOptions
      font: StatusBar.DEFAULT_FONT,
      textFill: 'black',
      scoreDecimalPlaces: 0
    }, providedOptions);
    const scoreDisplayStringProperty = new DerivedProperty([VegasStrings.pattern.score.numberStringProperty, scoreProperty], (pattern, score) => StringUtils.fillIn(pattern, {
      score: Utils.toFixed(score, options.scoreDecimalPlaces)
    }));
    const scoreDisplayText = new Text(scoreDisplayStringProperty, {
      font: options.font,
      fill: options.textFill
    });
    options.children = [scoreDisplayText];
    super(options);
    this.disposeScoreDisplayLabeledNumber = () => {
      scoreDisplayStringProperty.dispose();
    };
  }
  dispose() {
    this.disposeScoreDisplayLabeledNumber();
    super.dispose();
  }
}
vegas.register('ScoreDisplayLabeledNumber', ScoreDisplayLabeledNumber);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJVdGlscyIsIlN0cmluZ1V0aWxzIiwiTm9kZSIsIlRleHQiLCJTdGF0dXNCYXIiLCJ2ZWdhcyIsIlZlZ2FzU3RyaW5ncyIsIm9wdGlvbml6ZSIsIkRlcml2ZWRQcm9wZXJ0eSIsIlNjb3JlRGlzcGxheUxhYmVsZWROdW1iZXIiLCJjb25zdHJ1Y3RvciIsInNjb3JlUHJvcGVydHkiLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwiZm9udCIsIkRFRkFVTFRfRk9OVCIsInRleHRGaWxsIiwic2NvcmVEZWNpbWFsUGxhY2VzIiwic2NvcmVEaXNwbGF5U3RyaW5nUHJvcGVydHkiLCJwYXR0ZXJuIiwic2NvcmUiLCJudW1iZXJTdHJpbmdQcm9wZXJ0eSIsImZpbGxJbiIsInRvRml4ZWQiLCJzY29yZURpc3BsYXlUZXh0IiwiZmlsbCIsImNoaWxkcmVuIiwiZGlzcG9zZVNjb3JlRGlzcGxheUxhYmVsZWROdW1iZXIiLCJkaXNwb3NlIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJTY29yZURpc3BsYXlMYWJlbGVkTnVtYmVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIERpc3BsYXkgYSBzY29yZSBhcyAnU2NvcmU6IE4nLCB3aGVyZSBOIGlzIGEgbnVtYmVyLlxyXG4gKiBTZWUgc3BlY2lmaWNhdGlvbiBpbiBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvdmVnYXMvaXNzdWVzLzU5LlxyXG4gKlxyXG4gKiBAYXV0aG9yIEFuZHJlYSBMaW5cclxuICovXHJcblxyXG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vLi4vZG90L2pzL1V0aWxzLmpzJztcclxuaW1wb3J0IFN0cmluZ1V0aWxzIGZyb20gJy4uLy4uL3BoZXRjb21tb24vanMvdXRpbC9TdHJpbmdVdGlscy5qcyc7XHJcbmltcG9ydCB7IEZvbnQsIEhCb3hPcHRpb25zLCBOb2RlLCBUQ29sb3IsIFRleHQgfSBmcm9tICcuLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgU3RhdHVzQmFyIGZyb20gJy4uLy4uL3NjZW5lcnktcGhldC9qcy9TdGF0dXNCYXIuanMnO1xyXG5pbXBvcnQgdmVnYXMgZnJvbSAnLi92ZWdhcy5qcyc7XHJcbmltcG9ydCBWZWdhc1N0cmluZ3MgZnJvbSAnLi9WZWdhc1N0cmluZ3MuanMnO1xyXG5pbXBvcnQgb3B0aW9uaXplIGZyb20gJy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgU3RyaWN0T21pdCBmcm9tICcuLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvU3RyaWN0T21pdC5qcyc7XHJcbmltcG9ydCBEZXJpdmVkUHJvcGVydHkgZnJvbSAnLi4vLi4vYXhvbi9qcy9EZXJpdmVkUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgVFJlYWRPbmx5UHJvcGVydHkgZnJvbSAnLi4vLi4vYXhvbi9qcy9UUmVhZE9ubHlQcm9wZXJ0eS5qcyc7XHJcblxyXG50eXBlIFNlbGZPcHRpb25zID0ge1xyXG4gIGZvbnQ/OiBGb250O1xyXG4gIHRleHRGaWxsPzogVENvbG9yO1xyXG4gIHNjb3JlRGVjaW1hbFBsYWNlcz86IG51bWJlcjtcclxufTtcclxuXHJcbmV4cG9ydCB0eXBlIFNjb3JlRGlzcGxheUxhYmVsZWROdW1iZXJPcHRpb25zID0gU2VsZk9wdGlvbnMgJiBTdHJpY3RPbWl0PEhCb3hPcHRpb25zLCAnY2hpbGRyZW4nPjtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNjb3JlRGlzcGxheUxhYmVsZWROdW1iZXIgZXh0ZW5kcyBOb2RlIHtcclxuXHJcbiAgcHJpdmF0ZSByZWFkb25seSBkaXNwb3NlU2NvcmVEaXNwbGF5TGFiZWxlZE51bWJlcjogKCkgPT4gdm9pZDtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBzY29yZVByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxudW1iZXI+LCBwcm92aWRlZE9wdGlvbnM/OiBTY29yZURpc3BsYXlMYWJlbGVkTnVtYmVyT3B0aW9ucyApIHtcclxuXHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPFNjb3JlRGlzcGxheUxhYmVsZWROdW1iZXJPcHRpb25zLCBTZWxmT3B0aW9ucywgSEJveE9wdGlvbnM+KCkoIHtcclxuXHJcbiAgICAgIC8vIFNlbGZPcHRpb25zXHJcbiAgICAgIGZvbnQ6IFN0YXR1c0Jhci5ERUZBVUxUX0ZPTlQsXHJcbiAgICAgIHRleHRGaWxsOiAnYmxhY2snLFxyXG4gICAgICBzY29yZURlY2ltYWxQbGFjZXM6IDBcclxuICAgIH0sIHByb3ZpZGVkT3B0aW9ucyApO1xyXG5cclxuICAgIGNvbnN0IHNjb3JlRGlzcGxheVN0cmluZ1Byb3BlcnR5ID0gbmV3IERlcml2ZWRQcm9wZXJ0eShcclxuICAgICAgWyBWZWdhc1N0cmluZ3MucGF0dGVybi5zY29yZS5udW1iZXJTdHJpbmdQcm9wZXJ0eSwgc2NvcmVQcm9wZXJ0eSBdLFxyXG4gICAgICAoIHBhdHRlcm46IHN0cmluZywgc2NvcmU6IG51bWJlciApID0+IFN0cmluZ1V0aWxzLmZpbGxJbiggcGF0dGVybiwge1xyXG4gICAgICAgIHNjb3JlOiBVdGlscy50b0ZpeGVkKCBzY29yZSwgb3B0aW9ucy5zY29yZURlY2ltYWxQbGFjZXMgKVxyXG4gICAgICB9IClcclxuICAgICk7XHJcblxyXG4gICAgY29uc3Qgc2NvcmVEaXNwbGF5VGV4dCA9IG5ldyBUZXh0KCBzY29yZURpc3BsYXlTdHJpbmdQcm9wZXJ0eSwge1xyXG4gICAgICBmb250OiBvcHRpb25zLmZvbnQsXHJcbiAgICAgIGZpbGw6IG9wdGlvbnMudGV4dEZpbGxcclxuICAgIH0gKTtcclxuXHJcbiAgICBvcHRpb25zLmNoaWxkcmVuID0gWyBzY29yZURpc3BsYXlUZXh0IF07XHJcblxyXG4gICAgc3VwZXIoIG9wdGlvbnMgKTtcclxuXHJcbiAgICB0aGlzLmRpc3Bvc2VTY29yZURpc3BsYXlMYWJlbGVkTnVtYmVyID0gKCkgPT4ge1xyXG4gICAgICBzY29yZURpc3BsYXlTdHJpbmdQcm9wZXJ0eS5kaXNwb3NlKCk7XHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XHJcbiAgICB0aGlzLmRpc3Bvc2VTY29yZURpc3BsYXlMYWJlbGVkTnVtYmVyKCk7XHJcbiAgICBzdXBlci5kaXNwb3NlKCk7XHJcbiAgfVxyXG59XHJcblxyXG52ZWdhcy5yZWdpc3RlciggJ1Njb3JlRGlzcGxheUxhYmVsZWROdW1iZXInLCBTY29yZURpc3BsYXlMYWJlbGVkTnVtYmVyICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsS0FBSyxNQUFNLHVCQUF1QjtBQUN6QyxPQUFPQyxXQUFXLE1BQU0seUNBQXlDO0FBQ2pFLFNBQTRCQyxJQUFJLEVBQVVDLElBQUksUUFBUSw2QkFBNkI7QUFDbkYsT0FBT0MsU0FBUyxNQUFNLG9DQUFvQztBQUMxRCxPQUFPQyxLQUFLLE1BQU0sWUFBWTtBQUM5QixPQUFPQyxZQUFZLE1BQU0sbUJBQW1CO0FBQzVDLE9BQU9DLFNBQVMsTUFBTSxpQ0FBaUM7QUFFdkQsT0FBT0MsZUFBZSxNQUFNLGtDQUFrQztBQVc5RCxlQUFlLE1BQU1DLHlCQUF5QixTQUFTUCxJQUFJLENBQUM7RUFJbkRRLFdBQVdBLENBQUVDLGFBQXdDLEVBQUVDLGVBQWtELEVBQUc7SUFFakgsTUFBTUMsT0FBTyxHQUFHTixTQUFTLENBQTZELENBQUMsQ0FBRTtNQUV2RjtNQUNBTyxJQUFJLEVBQUVWLFNBQVMsQ0FBQ1csWUFBWTtNQUM1QkMsUUFBUSxFQUFFLE9BQU87TUFDakJDLGtCQUFrQixFQUFFO0lBQ3RCLENBQUMsRUFBRUwsZUFBZ0IsQ0FBQztJQUVwQixNQUFNTSwwQkFBMEIsR0FBRyxJQUFJVixlQUFlLENBQ3BELENBQUVGLFlBQVksQ0FBQ2EsT0FBTyxDQUFDQyxLQUFLLENBQUNDLG9CQUFvQixFQUFFVixhQUFhLENBQUUsRUFDbEUsQ0FBRVEsT0FBZSxFQUFFQyxLQUFhLEtBQU1uQixXQUFXLENBQUNxQixNQUFNLENBQUVILE9BQU8sRUFBRTtNQUNqRUMsS0FBSyxFQUFFcEIsS0FBSyxDQUFDdUIsT0FBTyxDQUFFSCxLQUFLLEVBQUVQLE9BQU8sQ0FBQ0ksa0JBQW1CO0lBQzFELENBQUUsQ0FDSixDQUFDO0lBRUQsTUFBTU8sZ0JBQWdCLEdBQUcsSUFBSXJCLElBQUksQ0FBRWUsMEJBQTBCLEVBQUU7TUFDN0RKLElBQUksRUFBRUQsT0FBTyxDQUFDQyxJQUFJO01BQ2xCVyxJQUFJLEVBQUVaLE9BQU8sQ0FBQ0c7SUFDaEIsQ0FBRSxDQUFDO0lBRUhILE9BQU8sQ0FBQ2EsUUFBUSxHQUFHLENBQUVGLGdCQUFnQixDQUFFO0lBRXZDLEtBQUssQ0FBRVgsT0FBUSxDQUFDO0lBRWhCLElBQUksQ0FBQ2MsZ0NBQWdDLEdBQUcsTUFBTTtNQUM1Q1QsMEJBQTBCLENBQUNVLE9BQU8sQ0FBQyxDQUFDO0lBQ3RDLENBQUM7RUFDSDtFQUVnQkEsT0FBT0EsQ0FBQSxFQUFTO0lBQzlCLElBQUksQ0FBQ0QsZ0NBQWdDLENBQUMsQ0FBQztJQUN2QyxLQUFLLENBQUNDLE9BQU8sQ0FBQyxDQUFDO0VBQ2pCO0FBQ0Y7QUFFQXZCLEtBQUssQ0FBQ3dCLFFBQVEsQ0FBRSwyQkFBMkIsRUFBRXBCLHlCQUEwQixDQUFDIn0=