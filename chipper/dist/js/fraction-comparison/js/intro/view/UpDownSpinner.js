// Copyright 2021-2022, University of Colorado Boulder

/**
 * Node for up/down buttons.  Used in the Fractions sims to increase/decrease numerator/denominator.  See also LeftRightSpinner.
 *
 * TODO support for press to hold
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { Shape } from '../../../../kite/js/imports.js';
import deprecationWarning from '../../../../phet-core/js/deprecationWarning.js';
import InstanceRegistry from '../../../../phet-core/js/documentation/InstanceRegistry.js';
import merge from '../../../../phet-core/js/merge.js';
import sceneryPhet from '../../../../scenery-phet/js/sceneryPhet.js';
import { Path, VBox } from '../../../../scenery/js/imports.js';
import RoundPushButton from '../../../../sun/js/buttons/RoundPushButton.js';

/**
 * @deprecated - Please use NumberPicker or generalize RoundNumberSpinner, see https://github.com/phetsims/fraction-comparison/issues/41
 */
class UpDownSpinner extends VBox {
  /**
   *
   * @param {Property.<number>} valueProperty
   * @param {Property.<boolean>} upEnabledProperty
   * @param {Property.<boolean>} downEnabledProperty
   * @param {Object} [options]
   */
  constructor(valueProperty, upEnabledProperty, downEnabledProperty, options) {
    deprecationWarning('Please use NumberPicker or generalize RoundNumberSpinner, see https://github.com/phetsims/fraction-comparison/issues/41');
    options = merge({
      spacing: 6
    }, options);
    const shapeWidth = 26;
    const upShape = new Shape().moveTo(0, 0).lineTo(shapeWidth / 2, -10).lineTo(shapeWidth, 0);
    const downShape = new Shape().moveTo(0, 0).lineTo(shapeWidth / 2, 10).lineTo(shapeWidth, 0);
    const upIcon = new Path(upShape, {
      lineWidth: 5,
      stroke: 'black',
      lineCap: 'round'
    });
    const downIcon = new Path(downShape, {
      lineWidth: 5,
      stroke: 'black',
      lineCap: 'round'
    });
    const radius = 20;
    const upButton = new RoundPushButton({
      content: upIcon,
      listener: function () {
        valueProperty.set(valueProperty.get() + 1);
      },
      radius: radius,
      touchAreaDilation: 5,
      baseColor: '#fefd53',
      yContentOffset: -3
    });
    const upEnabledPropertyLinkAttribute = enabled => {
      upButton.enabled = enabled;
    };
    upEnabledProperty.link(upEnabledPropertyLinkAttribute);
    const downButton = new RoundPushButton({
      content: downIcon,
      listener: function () {
        valueProperty.set(valueProperty.get() - 1);
      },
      radius: radius,
      touchAreaDilation: 5,
      baseColor: '#fefd53',
      yContentOffset: +3
    });
    const downEnabledPropertyLinkAttribute = enabled => {
      downButton.enabled = enabled;
    };
    downEnabledProperty.link(downEnabledPropertyLinkAttribute);
    assert && assert(!options.children, 'UpDownSpinner sets children');
    options.children = [upButton, downButton];
    super(options);

    // @private
    this.disposeUpDownSpinner = function () {
      if (upEnabledProperty.hasListener(upEnabledPropertyLinkAttribute)) {
        upEnabledProperty.unlink(upEnabledPropertyLinkAttribute);
      }
      if (downEnabledProperty.hasListener(downEnabledPropertyLinkAttribute)) {
        downEnabledProperty.unlink(downEnabledPropertyLinkAttribute);
      }
    };

    // support for binder documentation, stripped out in builds and only runs when ?binder is specified
    assert && phet.chipper.queryParameters.binder && InstanceRegistry.registerDataURL('scenery-phet', 'UpDownSpinner', this);
  }

  /**
   * @public
   * @override
   */
  dispose() {
    this.disposeUpDownSpinner();
    super.dispose();
  }
}
sceneryPhet.register('UpDownSpinner', UpDownSpinner);
export default UpDownSpinner;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTaGFwZSIsImRlcHJlY2F0aW9uV2FybmluZyIsIkluc3RhbmNlUmVnaXN0cnkiLCJtZXJnZSIsInNjZW5lcnlQaGV0IiwiUGF0aCIsIlZCb3giLCJSb3VuZFB1c2hCdXR0b24iLCJVcERvd25TcGlubmVyIiwiY29uc3RydWN0b3IiLCJ2YWx1ZVByb3BlcnR5IiwidXBFbmFibGVkUHJvcGVydHkiLCJkb3duRW5hYmxlZFByb3BlcnR5Iiwib3B0aW9ucyIsInNwYWNpbmciLCJzaGFwZVdpZHRoIiwidXBTaGFwZSIsIm1vdmVUbyIsImxpbmVUbyIsImRvd25TaGFwZSIsInVwSWNvbiIsImxpbmVXaWR0aCIsInN0cm9rZSIsImxpbmVDYXAiLCJkb3duSWNvbiIsInJhZGl1cyIsInVwQnV0dG9uIiwiY29udGVudCIsImxpc3RlbmVyIiwic2V0IiwiZ2V0IiwidG91Y2hBcmVhRGlsYXRpb24iLCJiYXNlQ29sb3IiLCJ5Q29udGVudE9mZnNldCIsInVwRW5hYmxlZFByb3BlcnR5TGlua0F0dHJpYnV0ZSIsImVuYWJsZWQiLCJsaW5rIiwiZG93bkJ1dHRvbiIsImRvd25FbmFibGVkUHJvcGVydHlMaW5rQXR0cmlidXRlIiwiYXNzZXJ0IiwiY2hpbGRyZW4iLCJkaXNwb3NlVXBEb3duU3Bpbm5lciIsImhhc0xpc3RlbmVyIiwidW5saW5rIiwicGhldCIsImNoaXBwZXIiLCJxdWVyeVBhcmFtZXRlcnMiLCJiaW5kZXIiLCJyZWdpc3RlckRhdGFVUkwiLCJkaXNwb3NlIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJVcERvd25TcGlubmVyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIxLTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIE5vZGUgZm9yIHVwL2Rvd24gYnV0dG9ucy4gIFVzZWQgaW4gdGhlIEZyYWN0aW9ucyBzaW1zIHRvIGluY3JlYXNlL2RlY3JlYXNlIG51bWVyYXRvci9kZW5vbWluYXRvci4gIFNlZSBhbHNvIExlZnRSaWdodFNwaW5uZXIuXHJcbiAqXHJcbiAqIFRPRE8gc3VwcG9ydCBmb3IgcHJlc3MgdG8gaG9sZFxyXG4gKiBAYXV0aG9yIFNhbSBSZWlkIChQaEVUIEludGVyYWN0aXZlIFNpbXVsYXRpb25zKVxyXG4gKi9cclxuXHJcbmltcG9ydCB7IFNoYXBlIH0gZnJvbSAnLi4vLi4vLi4vLi4va2l0ZS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IGRlcHJlY2F0aW9uV2FybmluZyBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvZGVwcmVjYXRpb25XYXJuaW5nLmpzJztcclxuaW1wb3J0IEluc3RhbmNlUmVnaXN0cnkgZnJvbSAnLi4vLi4vLi4vLi4vcGhldC1jb3JlL2pzL2RvY3VtZW50YXRpb24vSW5zdGFuY2VSZWdpc3RyeS5qcyc7XHJcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xyXG5pbXBvcnQgc2NlbmVyeVBoZXQgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL3NjZW5lcnlQaGV0LmpzJztcclxuaW1wb3J0IHsgUGF0aCwgVkJveCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBSb3VuZFB1c2hCdXR0b24gZnJvbSAnLi4vLi4vLi4vLi4vc3VuL2pzL2J1dHRvbnMvUm91bmRQdXNoQnV0dG9uLmpzJztcclxuXHJcbi8qKlxyXG4gKiBAZGVwcmVjYXRlZCAtIFBsZWFzZSB1c2UgTnVtYmVyUGlja2VyIG9yIGdlbmVyYWxpemUgUm91bmROdW1iZXJTcGlubmVyLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2ZyYWN0aW9uLWNvbXBhcmlzb24vaXNzdWVzLzQxXHJcbiAqL1xyXG5jbGFzcyBVcERvd25TcGlubmVyIGV4dGVuZHMgVkJveCB7XHJcblxyXG4gIC8qKlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtQcm9wZXJ0eS48bnVtYmVyPn0gdmFsdWVQcm9wZXJ0eVxyXG4gICAqIEBwYXJhbSB7UHJvcGVydHkuPGJvb2xlYW4+fSB1cEVuYWJsZWRQcm9wZXJ0eVxyXG4gICAqIEBwYXJhbSB7UHJvcGVydHkuPGJvb2xlYW4+fSBkb3duRW5hYmxlZFByb3BlcnR5XHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCB2YWx1ZVByb3BlcnR5LCB1cEVuYWJsZWRQcm9wZXJ0eSwgZG93bkVuYWJsZWRQcm9wZXJ0eSwgb3B0aW9ucyApIHtcclxuICAgIGRlcHJlY2F0aW9uV2FybmluZyggJ1BsZWFzZSB1c2UgTnVtYmVyUGlja2VyIG9yIGdlbmVyYWxpemUgUm91bmROdW1iZXJTcGlubmVyLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3BoZXRzaW1zL2ZyYWN0aW9uLWNvbXBhcmlzb24vaXNzdWVzLzQxJyApO1xyXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XHJcbiAgICAgIHNwYWNpbmc6IDZcclxuICAgIH0sIG9wdGlvbnMgKTtcclxuXHJcbiAgICBjb25zdCBzaGFwZVdpZHRoID0gMjY7XHJcbiAgICBjb25zdCB1cFNoYXBlID0gbmV3IFNoYXBlKCkubW92ZVRvKCAwLCAwICkubGluZVRvKCBzaGFwZVdpZHRoIC8gMiwgLTEwICkubGluZVRvKCBzaGFwZVdpZHRoLCAwICk7XHJcbiAgICBjb25zdCBkb3duU2hhcGUgPSBuZXcgU2hhcGUoKS5tb3ZlVG8oIDAsIDAgKS5saW5lVG8oIHNoYXBlV2lkdGggLyAyLCAxMCApLmxpbmVUbyggc2hhcGVXaWR0aCwgMCApO1xyXG5cclxuICAgIGNvbnN0IHVwSWNvbiA9IG5ldyBQYXRoKCB1cFNoYXBlLCB7IGxpbmVXaWR0aDogNSwgc3Ryb2tlOiAnYmxhY2snLCBsaW5lQ2FwOiAncm91bmQnIH0gKTtcclxuICAgIGNvbnN0IGRvd25JY29uID0gbmV3IFBhdGgoIGRvd25TaGFwZSwgeyBsaW5lV2lkdGg6IDUsIHN0cm9rZTogJ2JsYWNrJywgbGluZUNhcDogJ3JvdW5kJyB9ICk7XHJcblxyXG4gICAgY29uc3QgcmFkaXVzID0gMjA7XHJcbiAgICBjb25zdCB1cEJ1dHRvbiA9IG5ldyBSb3VuZFB1c2hCdXR0b24oIHtcclxuICAgICAgY29udGVudDogdXBJY29uLFxyXG4gICAgICBsaXN0ZW5lcjogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFsdWVQcm9wZXJ0eS5zZXQoIHZhbHVlUHJvcGVydHkuZ2V0KCkgKyAxICk7XHJcbiAgICAgIH0sXHJcbiAgICAgIHJhZGl1czogcmFkaXVzLFxyXG4gICAgICB0b3VjaEFyZWFEaWxhdGlvbjogNSxcclxuICAgICAgYmFzZUNvbG9yOiAnI2ZlZmQ1MycsXHJcbiAgICAgIHlDb250ZW50T2Zmc2V0OiAtM1xyXG4gICAgfSApO1xyXG4gICAgY29uc3QgdXBFbmFibGVkUHJvcGVydHlMaW5rQXR0cmlidXRlID0gZW5hYmxlZCA9PiB7dXBCdXR0b24uZW5hYmxlZCA9IGVuYWJsZWQ7fTtcclxuICAgIHVwRW5hYmxlZFByb3BlcnR5LmxpbmsoIHVwRW5hYmxlZFByb3BlcnR5TGlua0F0dHJpYnV0ZSApO1xyXG5cclxuICAgIGNvbnN0IGRvd25CdXR0b24gPSBuZXcgUm91bmRQdXNoQnV0dG9uKCB7XHJcbiAgICAgIGNvbnRlbnQ6IGRvd25JY29uLFxyXG4gICAgICBsaXN0ZW5lcjogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFsdWVQcm9wZXJ0eS5zZXQoIHZhbHVlUHJvcGVydHkuZ2V0KCkgLSAxICk7XHJcbiAgICAgIH0sXHJcbiAgICAgIHJhZGl1czogcmFkaXVzLFxyXG4gICAgICB0b3VjaEFyZWFEaWxhdGlvbjogNSxcclxuICAgICAgYmFzZUNvbG9yOiAnI2ZlZmQ1MycsXHJcbiAgICAgIHlDb250ZW50T2Zmc2V0OiArM1xyXG4gICAgfSApO1xyXG4gICAgY29uc3QgZG93bkVuYWJsZWRQcm9wZXJ0eUxpbmtBdHRyaWJ1dGUgPSBlbmFibGVkID0+IHtkb3duQnV0dG9uLmVuYWJsZWQgPSBlbmFibGVkO307XHJcbiAgICBkb3duRW5hYmxlZFByb3BlcnR5LmxpbmsoIGRvd25FbmFibGVkUHJvcGVydHlMaW5rQXR0cmlidXRlICk7XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIW9wdGlvbnMuY2hpbGRyZW4sICdVcERvd25TcGlubmVyIHNldHMgY2hpbGRyZW4nICk7XHJcbiAgICBvcHRpb25zLmNoaWxkcmVuID0gWyB1cEJ1dHRvbiwgZG93bkJ1dHRvbiBdO1xyXG5cclxuICAgIHN1cGVyKCBvcHRpb25zICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGVcclxuICAgIHRoaXMuZGlzcG9zZVVwRG93blNwaW5uZXIgPSBmdW5jdGlvbigpIHtcclxuICAgICAgaWYgKCB1cEVuYWJsZWRQcm9wZXJ0eS5oYXNMaXN0ZW5lciggdXBFbmFibGVkUHJvcGVydHlMaW5rQXR0cmlidXRlICkgKSB7XHJcbiAgICAgICAgdXBFbmFibGVkUHJvcGVydHkudW5saW5rKCB1cEVuYWJsZWRQcm9wZXJ0eUxpbmtBdHRyaWJ1dGUgKTtcclxuICAgICAgfVxyXG4gICAgICBpZiAoIGRvd25FbmFibGVkUHJvcGVydHkuaGFzTGlzdGVuZXIoIGRvd25FbmFibGVkUHJvcGVydHlMaW5rQXR0cmlidXRlICkgKSB7XHJcbiAgICAgICAgZG93bkVuYWJsZWRQcm9wZXJ0eS51bmxpbmsoIGRvd25FbmFibGVkUHJvcGVydHlMaW5rQXR0cmlidXRlICk7XHJcbiAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgLy8gc3VwcG9ydCBmb3IgYmluZGVyIGRvY3VtZW50YXRpb24sIHN0cmlwcGVkIG91dCBpbiBidWlsZHMgYW5kIG9ubHkgcnVucyB3aGVuID9iaW5kZXIgaXMgc3BlY2lmaWVkXHJcbiAgICBhc3NlcnQgJiYgcGhldC5jaGlwcGVyLnF1ZXJ5UGFyYW1ldGVycy5iaW5kZXIgJiYgSW5zdGFuY2VSZWdpc3RyeS5yZWdpc3RlckRhdGFVUkwoICdzY2VuZXJ5LXBoZXQnLCAnVXBEb3duU3Bpbm5lcicsIHRoaXMgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAb3ZlcnJpZGVcclxuICAgKi9cclxuICBkaXNwb3NlKCkge1xyXG4gICAgdGhpcy5kaXNwb3NlVXBEb3duU3Bpbm5lcigpO1xyXG4gICAgc3VwZXIuZGlzcG9zZSgpO1xyXG4gIH1cclxufVxyXG5cclxuc2NlbmVyeVBoZXQucmVnaXN0ZXIoICdVcERvd25TcGlubmVyJywgVXBEb3duU3Bpbm5lciApO1xyXG5leHBvcnQgZGVmYXVsdCBVcERvd25TcGlubmVyOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLFNBQVNBLEtBQUssUUFBUSxnQ0FBZ0M7QUFDdEQsT0FBT0Msa0JBQWtCLE1BQU0sZ0RBQWdEO0FBQy9FLE9BQU9DLGdCQUFnQixNQUFNLDREQUE0RDtBQUN6RixPQUFPQyxLQUFLLE1BQU0sbUNBQW1DO0FBQ3JELE9BQU9DLFdBQVcsTUFBTSw0Q0FBNEM7QUFDcEUsU0FBU0MsSUFBSSxFQUFFQyxJQUFJLFFBQVEsbUNBQW1DO0FBQzlELE9BQU9DLGVBQWUsTUFBTSwrQ0FBK0M7O0FBRTNFO0FBQ0E7QUFDQTtBQUNBLE1BQU1DLGFBQWEsU0FBU0YsSUFBSSxDQUFDO0VBRS9CO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0VHLFdBQVdBLENBQUVDLGFBQWEsRUFBRUMsaUJBQWlCLEVBQUVDLG1CQUFtQixFQUFFQyxPQUFPLEVBQUc7SUFDNUVaLGtCQUFrQixDQUFFLHlIQUEwSCxDQUFDO0lBQy9JWSxPQUFPLEdBQUdWLEtBQUssQ0FBRTtNQUNmVyxPQUFPLEVBQUU7SUFDWCxDQUFDLEVBQUVELE9BQVEsQ0FBQztJQUVaLE1BQU1FLFVBQVUsR0FBRyxFQUFFO0lBQ3JCLE1BQU1DLE9BQU8sR0FBRyxJQUFJaEIsS0FBSyxDQUFDLENBQUMsQ0FBQ2lCLE1BQU0sQ0FBRSxDQUFDLEVBQUUsQ0FBRSxDQUFDLENBQUNDLE1BQU0sQ0FBRUgsVUFBVSxHQUFH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