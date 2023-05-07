// Copyright 2021-2023, University of Colorado Boulder

/**
 * Text for displaying a comparison statement for the two current numbers.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Node, Text } from '../../../../scenery/js/imports.js';
import numberCompare from '../../numberCompare.js';
import NumberSuiteCommonConstants from '../../../../number-suite-common/js/common/NumberSuiteCommonConstants.js';
class ComparisonTextNode extends Node {
  constructor(comparisonStringProperty, layoutBounds) {
    super();

    // create and add the comparison text
    const textNode = new Text(comparisonStringProperty.value, {
      font: new PhetFont(16),
      maxWidth: layoutBounds.erodedX(NumberSuiteCommonConstants.ACCORDION_BOX_MARGIN_X).width
    });
    this.addChild(textNode);

    // update the comparison text when the comparison string changes and center our position
    comparisonStringProperty.link(comparisonString => {
      textNode.string = comparisonString;
      this.centerX = layoutBounds.centerX;
    });
  }
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
    super.dispose();
  }
}
numberCompare.register('ComparisonTextNode', ComparisonTextNode);
export default ComparisonTextNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQaGV0Rm9udCIsIk5vZGUiLCJUZXh0IiwibnVtYmVyQ29tcGFyZSIsIk51bWJlclN1aXRlQ29tbW9uQ29uc3RhbnRzIiwiQ29tcGFyaXNvblRleHROb2RlIiwiY29uc3RydWN0b3IiLCJjb21wYXJpc29uU3RyaW5nUHJvcGVydHkiLCJsYXlvdXRCb3VuZHMiLCJ0ZXh0Tm9kZSIsInZhbHVlIiwiZm9udCIsIm1heFdpZHRoIiwiZXJvZGVkWCIsIkFDQ09SRElPTl9CT1hfTUFSR0lOX1giLCJ3aWR0aCIsImFkZENoaWxkIiwibGluayIsImNvbXBhcmlzb25TdHJpbmciLCJzdHJpbmciLCJjZW50ZXJYIiwiZGlzcG9zZSIsImFzc2VydCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiQ29tcGFyaXNvblRleHROb2RlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIxLTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFRleHQgZm9yIGRpc3BsYXlpbmcgYSBjb21wYXJpc29uIHN0YXRlbWVudCBmb3IgdGhlIHR3byBjdXJyZW50IG51bWJlcnMuXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgS2x1c2VuZG9yZiAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgQm91bmRzMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvQm91bmRzMi5qcyc7XHJcbmltcG9ydCBQaGV0Rm9udCBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvUGhldEZvbnQuanMnO1xyXG5pbXBvcnQgeyBOb2RlLCBUZXh0IH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IFRSZWFkT25seVByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvVFJlYWRPbmx5UHJvcGVydHkuanMnO1xyXG5pbXBvcnQgbnVtYmVyQ29tcGFyZSBmcm9tICcuLi8uLi9udW1iZXJDb21wYXJlLmpzJztcclxuaW1wb3J0IE51bWJlclN1aXRlQ29tbW9uQ29uc3RhbnRzIGZyb20gJy4uLy4uLy4uLy4uL251bWJlci1zdWl0ZS1jb21tb24vanMvY29tbW9uL051bWJlclN1aXRlQ29tbW9uQ29uc3RhbnRzLmpzJztcclxuXHJcbmNsYXNzIENvbXBhcmlzb25UZXh0Tm9kZSBleHRlbmRzIE5vZGUge1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoIGNvbXBhcmlzb25TdHJpbmdQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8c3RyaW5nPiwgbGF5b3V0Qm91bmRzOiBCb3VuZHMyICkge1xyXG4gICAgc3VwZXIoKTtcclxuXHJcbiAgICAvLyBjcmVhdGUgYW5kIGFkZCB0aGUgY29tcGFyaXNvbiB0ZXh0XHJcbiAgICBjb25zdCB0ZXh0Tm9kZSA9IG5ldyBUZXh0KFxyXG4gICAgICBjb21wYXJpc29uU3RyaW5nUHJvcGVydHkudmFsdWUsIHtcclxuICAgICAgICBmb250OiBuZXcgUGhldEZvbnQoIDE2ICksXHJcbiAgICAgICAgbWF4V2lkdGg6IGxheW91dEJvdW5kcy5lcm9kZWRYKCBOdW1iZXJTdWl0ZUNvbW1vbkNvbnN0YW50cy5BQ0NPUkRJT05fQk9YX01BUkdJTl9YICkud2lkdGhcclxuICAgICAgfSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggdGV4dE5vZGUgKTtcclxuXHJcbiAgICAvLyB1cGRhdGUgdGhlIGNvbXBhcmlzb24gdGV4dCB3aGVuIHRoZSBjb21wYXJpc29uIHN0cmluZyBjaGFuZ2VzIGFuZCBjZW50ZXIgb3VyIHBvc2l0aW9uXHJcbiAgICBjb21wYXJpc29uU3RyaW5nUHJvcGVydHkubGluayggY29tcGFyaXNvblN0cmluZyA9PiB7XHJcbiAgICAgIHRleHROb2RlLnN0cmluZyA9IGNvbXBhcmlzb25TdHJpbmc7XHJcbiAgICAgIHRoaXMuY2VudGVyWCA9IGxheW91dEJvdW5kcy5jZW50ZXJYO1xyXG4gICAgfSApO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBmYWxzZSwgJ2Rpc3Bvc2UgaXMgbm90IHN1cHBvcnRlZCwgZXhpc3RzIGZvciB0aGUgbGlmZXRpbWUgb2YgdGhlIHNpbScgKTtcclxuICAgIHN1cGVyLmRpc3Bvc2UoKTtcclxuICB9XHJcbn1cclxuXHJcbm51bWJlckNvbXBhcmUucmVnaXN0ZXIoICdDb21wYXJpc29uVGV4dE5vZGUnLCBDb21wYXJpc29uVGV4dE5vZGUgKTtcclxuZXhwb3J0IGRlZmF1bHQgQ29tcGFyaXNvblRleHROb2RlOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFHQSxPQUFPQSxRQUFRLE1BQU0seUNBQXlDO0FBQzlELFNBQVNDLElBQUksRUFBRUMsSUFBSSxRQUFRLG1DQUFtQztBQUU5RCxPQUFPQyxhQUFhLE1BQU0sd0JBQXdCO0FBQ2xELE9BQU9DLDBCQUEwQixNQUFNLHlFQUF5RTtBQUVoSCxNQUFNQyxrQkFBa0IsU0FBU0osSUFBSSxDQUFDO0VBRTdCSyxXQUFXQSxDQUFFQyx3QkFBbUQsRUFBRUMsWUFBcUIsRUFBRztJQUMvRixLQUFLLENBQUMsQ0FBQzs7SUFFUDtJQUNBLE1BQU1DLFFBQVEsR0FBRyxJQUFJUCxJQUFJLENBQ3ZCSyx3QkFBd0IsQ0FBQ0csS0FBSyxFQUFFO01BQzlCQyxJQUFJLEVBQUUsSUFBSVgsUUFBUSxDQUFFLEVBQUcsQ0FBQztNQUN4QlksUUFBUSxFQUFFSixZQUFZLENBQUNLLE9BQU8sQ0FBRVQsMEJBQTBCLENBQUNVLHNCQUF1QixDQUFDLENBQUNDO0lBQ3RGLENBQUUsQ0FBQztJQUNMLElBQUksQ0FBQ0MsUUFBUSxDQUFFUCxRQUFTLENBQUM7O0lBRXpCO0lBQ0FGLHdCQUF3QixDQUFDVSxJQUFJLENBQUVDLGdCQUFnQixJQUFJO01BQ2pEVCxRQUFRLENBQUNVLE1BQU0sR0FBR0QsZ0JBQWdCO01BQ2xDLElBQUksQ0FBQ0UsT0FBTyxHQUFHWixZQUFZLENBQUNZLE9BQU87SUFDckMsQ0FBRSxDQUFDO0VBQ0w7RUFFZ0JDLE9BQU9BLENBQUEsRUFBUztJQUM5QkMsTUFBTSxJQUFJQSxNQUFNLENBQUUsS0FBSyxFQUFFLDhEQUErRCxDQUFDO0lBQ3pGLEtBQUssQ0FBQ0QsT0FBTyxDQUFDLENBQUM7RUFDakI7QUFDRjtBQUVBbEIsYUFBYSxDQUFDb0IsUUFBUSxDQUFFLG9CQUFvQixFQUFFbEIsa0JBQW1CLENBQUM7QUFDbEUsZUFBZUEsa0JBQWtCIn0=