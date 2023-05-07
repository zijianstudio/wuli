// Copyright 2014-2023, University of Colorado Boulder

/**
 * Displays a dynamic numeric value.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Utils from '../../../../dot/js/Utils.js';
import optionize from '../../../../phet-core/js/optionize.js';
import { Text } from '../../../../scenery/js/imports.js';
import reactantsProductsAndLeftovers from '../../reactantsProductsAndLeftovers.js';
export default class NumberNode extends Text {
  constructor(numberProperty, providedOptions) {
    const options = optionize()({
      // SelfOptions
      decimalPlaces: 0
    }, providedOptions);
    super('');
    const numberPropertyObserver = value => {
      this.string = Utils.toFixed(value, options.decimalPlaces);
    };
    numberProperty.link(numberPropertyObserver); // must be unlinked in dispose

    this.mutate(options);
    this.disposeNumberNode = () => {
      if (numberProperty.hasListener(numberPropertyObserver)) {
        numberProperty.unlink(numberPropertyObserver);
      }
    };
  }
  dispose() {
    this.disposeNumberNode();
    super.dispose();
  }
}
reactantsProductsAndLeftovers.register('NumberNode', NumberNode);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJVdGlscyIsIm9wdGlvbml6ZSIsIlRleHQiLCJyZWFjdGFudHNQcm9kdWN0c0FuZExlZnRvdmVycyIsIk51bWJlck5vZGUiLCJjb25zdHJ1Y3RvciIsIm51bWJlclByb3BlcnR5IiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsImRlY2ltYWxQbGFjZXMiLCJudW1iZXJQcm9wZXJ0eU9ic2VydmVyIiwidmFsdWUiLCJzdHJpbmciLCJ0b0ZpeGVkIiwibGluayIsIm11dGF0ZSIsImRpc3Bvc2VOdW1iZXJOb2RlIiwiaGFzTGlzdGVuZXIiLCJ1bmxpbmsiLCJkaXNwb3NlIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJOdW1iZXJOb2RlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE0LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIERpc3BsYXlzIGEgZHluYW1pYyBudW1lcmljIHZhbHVlLlxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBUUmVhZE9ubHlQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1RSZWFkT25seVByb3BlcnR5LmpzJztcclxuaW1wb3J0IFV0aWxzIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9VdGlscy5qcyc7XHJcbmltcG9ydCBvcHRpb25pemUgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL29wdGlvbml6ZS5qcyc7XHJcbmltcG9ydCBQaWNrT3B0aW9uYWwgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL1BpY2tPcHRpb25hbC5qcyc7XHJcbmltcG9ydCB7IE5vZGVUcmFuc2xhdGlvbk9wdGlvbnMsIFRleHQsIFRleHRPcHRpb25zIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IHJlYWN0YW50c1Byb2R1Y3RzQW5kTGVmdG92ZXJzIGZyb20gJy4uLy4uL3JlYWN0YW50c1Byb2R1Y3RzQW5kTGVmdG92ZXJzLmpzJztcclxuXHJcbnR5cGUgU2VsZk9wdGlvbnMgPSB7XHJcbiAgZGVjaW1hbFBsYWNlcz86IG51bWJlcjsgLy8gbnVtYmVyIG9mIGRlY2ltYWwgcGxhY2VzIHRvIGJlIGRpc3BsYXllZFxyXG59O1xyXG5cclxudHlwZSBOdW1iZXJOb2RlT3B0aW9ucyA9IFNlbGZPcHRpb25zICYgTm9kZVRyYW5zbGF0aW9uT3B0aW9ucyAmIFBpY2tPcHRpb25hbDxUZXh0T3B0aW9ucywgJ2ZvbnQnPjtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE51bWJlck5vZGUgZXh0ZW5kcyBUZXh0IHtcclxuXHJcbiAgcHJpdmF0ZSByZWFkb25seSBkaXNwb3NlTnVtYmVyTm9kZTogKCkgPT4gdm9pZDtcclxuXHJcbiAgcHVibGljIGNvbnN0cnVjdG9yKCBudW1iZXJQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8bnVtYmVyPiwgcHJvdmlkZWRPcHRpb25zPzogTnVtYmVyTm9kZU9wdGlvbnMgKSB7XHJcblxyXG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbml6ZTxOdW1iZXJOb2RlT3B0aW9ucywgU2VsZk9wdGlvbnMsIFRleHRPcHRpb25zPigpKCB7XHJcblxyXG4gICAgICAvLyBTZWxmT3B0aW9uc1xyXG4gICAgICBkZWNpbWFsUGxhY2VzOiAwXHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICBzdXBlciggJycgKTtcclxuXHJcbiAgICBjb25zdCBudW1iZXJQcm9wZXJ0eU9ic2VydmVyID0gKCB2YWx1ZTogbnVtYmVyICkgPT4ge1xyXG4gICAgICB0aGlzLnN0cmluZyA9IFV0aWxzLnRvRml4ZWQoIHZhbHVlLCBvcHRpb25zLmRlY2ltYWxQbGFjZXMgKTtcclxuICAgIH07XHJcbiAgICBudW1iZXJQcm9wZXJ0eS5saW5rKCBudW1iZXJQcm9wZXJ0eU9ic2VydmVyICk7IC8vIG11c3QgYmUgdW5saW5rZWQgaW4gZGlzcG9zZVxyXG5cclxuICAgIHRoaXMubXV0YXRlKCBvcHRpb25zICk7XHJcblxyXG4gICAgdGhpcy5kaXNwb3NlTnVtYmVyTm9kZSA9ICgpID0+IHtcclxuICAgICAgaWYgKCBudW1iZXJQcm9wZXJ0eS5oYXNMaXN0ZW5lciggbnVtYmVyUHJvcGVydHlPYnNlcnZlciApICkge1xyXG4gICAgICAgIG51bWJlclByb3BlcnR5LnVubGluayggbnVtYmVyUHJvcGVydHlPYnNlcnZlciApO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XHJcbiAgICB0aGlzLmRpc3Bvc2VOdW1iZXJOb2RlKCk7XHJcbiAgICBzdXBlci5kaXNwb3NlKCk7XHJcbiAgfVxyXG59XHJcblxyXG5yZWFjdGFudHNQcm9kdWN0c0FuZExlZnRvdmVycy5yZWdpc3RlciggJ051bWJlck5vZGUnLCBOdW1iZXJOb2RlICk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUdBLE9BQU9BLEtBQUssTUFBTSw2QkFBNkI7QUFDL0MsT0FBT0MsU0FBUyxNQUFNLHVDQUF1QztBQUU3RCxTQUFpQ0MsSUFBSSxRQUFxQixtQ0FBbUM7QUFDN0YsT0FBT0MsNkJBQTZCLE1BQU0sd0NBQXdDO0FBUWxGLGVBQWUsTUFBTUMsVUFBVSxTQUFTRixJQUFJLENBQUM7RUFJcENHLFdBQVdBLENBQUVDLGNBQXlDLEVBQUVDLGVBQW1DLEVBQUc7SUFFbkcsTUFBTUMsT0FBTyxHQUFHUCxTQUFTLENBQThDLENBQUMsQ0FBRTtNQUV4RTtNQUNBUSxhQUFhLEVBQUU7SUFDakIsQ0FBQyxFQUFFRixlQUFnQixDQUFDO0lBRXBCLEtBQUssQ0FBRSxFQUFHLENBQUM7SUFFWCxNQUFNRyxzQkFBc0IsR0FBS0MsS0FBYSxJQUFNO01BQ2xELElBQUksQ0FBQ0MsTUFBTSxHQUFHWixLQUFLLENBQUNhLE9BQU8sQ0FBRUYsS0FBSyxFQUFFSCxPQUFPLENBQUNDLGFBQWMsQ0FBQztJQUM3RCxDQUFDO0lBQ0RILGNBQWMsQ0FBQ1EsSUFBSSxDQUFFSixzQkFBdUIsQ0FBQyxDQUFDLENBQUM7O0lBRS9DLElBQUksQ0FBQ0ssTUFBTSxDQUFFUCxPQUFRLENBQUM7SUFFdEIsSUFBSSxDQUFDUSxpQkFBaUIsR0FBRyxNQUFNO01BQzdCLElBQUtWLGNBQWMsQ0FBQ1csV0FBVyxDQUFFUCxzQkFBdUIsQ0FBQyxFQUFHO1FBQzFESixjQUFjLENBQUNZLE1BQU0sQ0FBRVIsc0JBQXVCLENBQUM7TUFDakQ7SUFDRixDQUFDO0VBQ0g7RUFFZ0JTLE9BQU9BLENBQUEsRUFBUztJQUM5QixJQUFJLENBQUNILGlCQUFpQixDQUFDLENBQUM7SUFDeEIsS0FBSyxDQUFDRyxPQUFPLENBQUMsQ0FBQztFQUNqQjtBQUNGO0FBRUFoQiw2QkFBNkIsQ0FBQ2lCLFFBQVEsQ0FBRSxZQUFZLEVBQUVoQixVQUFXLENBQUMifQ==