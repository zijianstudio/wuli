// Copyright 2020-2022, University of Colorado Boulder

/**
 * TODO #3
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Property from '../../../axon/js/Property.js';
import Dimension2 from '../../../dot/js/Dimension2.js';
import dotRandom from '../../../dot/js/dotRandom.js';
import Range from '../../../dot/js/Range.js';
import ScreenView from '../../../joist/js/ScreenView.js';
import merge from '../../../phet-core/js/merge.js';
import PhetFont from '../../../scenery-phet/js/PhetFont.js';
import { Circle, Color, Node, Plane, Text, VBox } from '../../../scenery/js/imports.js';
import HSlider from '../../../sun/js/HSlider.js';
import Animation from '../Animation.js';
import Easing from '../Easing.js';
import twixt from '../twixt.js';
import EasingComboBox from './EasingComboBox.js';
class AnimationScreenView extends ScreenView {
  constructor() {
    super();
    const positionProperty = new Property(this.layoutBounds.center);
    const colorProperty = new Property(new Color(0, 128, 255, 0.5));
    const durationProperty = new Property(0.5);
    const easingProperty = new Property(Easing.QUADRATIC_IN_OUT);

    // to get the input events :(
    this.addChild(new Plane());
    const animatedCircle = new Circle(20, {
      fill: colorProperty,
      stroke: 'black',
      children: [new Circle(3, {
        fill: 'black'
      })]
    });
    positionProperty.linkAttribute(animatedCircle, 'translation');
    this.addChild(animatedCircle);
    const targetCircle = new Circle(20, {
      stroke: 'red',
      translation: positionProperty.value
    });
    this.addChild(targetCircle);
    const larger = new Animation({
      setValue: function (value) {
        animatedCircle.setScaleMagnitude(value);
      },
      from: 0.7,
      to: 1,
      duration: 0.4,
      easing: Easing.QUADRATIC_IN_OUT
    });
    const smaller = new Animation({
      setValue: function (value) {
        animatedCircle.setScaleMagnitude(value);
      },
      from: 1,
      to: 0.7,
      duration: 0.4,
      easing: Easing.QUADRATIC_IN_OUT
    });
    larger.then(smaller);
    smaller.then(larger);
    smaller.start();
    let animation = null;
    this.addInputListener({
      down: event => {
        if (!event.canStartPress()) {
          return;
        }
        if (!(event.target instanceof Plane)) {
          return;
        }
        const localPoint = this.globalToLocalPoint(event.pointer.point);
        targetCircle.translation = localPoint;
        animation && animation.stop();
        animation = new Animation({
          targets: [{
            property: positionProperty,
            easing: easingProperty.value,
            to: localPoint
          }, {
            property: colorProperty,
            easing: easingProperty.value,
            to: new Color(dotRandom.nextInt(256), dotRandom.nextInt(256), dotRandom.nextInt(256), 0.5)
          }],
          duration: durationProperty.value
        }).start();
      }
    });
    function sliderGroup(property, range, label, majorTicks, options) {
      const labelNode = new Text(label, {
        font: new PhetFont(20)
      });
      const slider = new HSlider(property, range, {
        trackSize: new Dimension2(300, 5)
      });
      majorTicks.forEach(tick => {
        slider.addMajorTick(tick, new Text(tick, {
          font: new PhetFont(20)
        }));
      });
      return new VBox(merge({
        children: [labelNode, slider],
        spacing: 10
      }, options));
    }
    this.addChild(sliderGroup(durationProperty, new Range(0.1, 2), 'Duration', [0.1, 0.5, 1, 2], {
      left: 10,
      top: 10
    }));
    const listParent = new Node();
    this.addChild(new EasingComboBox(easingProperty, listParent, {
      right: this.layoutBounds.right - 10,
      top: 10
    }));
    this.addChild(new Text('Click to move the animation target', {
      font: new PhetFont(30),
      bottom: this.layoutBounds.bottom - 10,
      centerX: this.layoutBounds.centerX
    }));
    this.addChild(listParent);
  }
}
twixt.register('AnimationScreenView', AnimationScreenView);
export default AnimationScreenView;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm9wZXJ0eSIsIkRpbWVuc2lvbjIiLCJkb3RSYW5kb20iLCJSYW5nZSIsIlNjcmVlblZpZXciLCJtZXJnZSIsIlBoZXRGb250IiwiQ2lyY2xlIiwiQ29sb3IiLCJOb2RlIiwiUGxhbmUiLCJUZXh0IiwiVkJveCIsIkhTbGlkZXIiLCJBbmltYXRpb24iLCJFYXNpbmciLCJ0d2l4dCIsIkVhc2luZ0NvbWJvQm94IiwiQW5pbWF0aW9uU2NyZWVuVmlldyIsImNvbnN0cnVjdG9yIiwicG9zaXRpb25Qcm9wZXJ0eSIsImxheW91dEJvdW5kcyIsImNlbnRlciIsImNvbG9yUHJvcGVydHkiLCJkdXJhdGlvblByb3BlcnR5IiwiZWFzaW5nUHJvcGVydHkiLCJRVUFEUkFUSUNfSU5fT1VUIiwiYWRkQ2hpbGQiLCJhbmltYXRlZENpcmNsZSIsImZpbGwiLCJzdHJva2UiLCJjaGlsZHJlbiIsImxpbmtBdHRyaWJ1dGUiLCJ0YXJnZXRDaXJjbGUiLCJ0cmFuc2xhdGlvbiIsInZhbHVlIiwibGFyZ2VyIiwic2V0VmFsdWUiLCJzZXRTY2FsZU1hZ25pdHVkZSIsImZyb20iLCJ0byIsImR1cmF0aW9uIiwiZWFzaW5nIiwic21hbGxlciIsInRoZW4iLCJzdGFydCIsImFuaW1hdGlvbiIsImFkZElucHV0TGlzdGVuZXIiLCJkb3duIiwiZXZlbnQiLCJjYW5TdGFydFByZXNzIiwidGFyZ2V0IiwibG9jYWxQb2ludCIsImdsb2JhbFRvTG9jYWxQb2ludCIsInBvaW50ZXIiLCJwb2ludCIsInN0b3AiLCJ0YXJnZXRzIiwicHJvcGVydHkiLCJuZXh0SW50Iiwic2xpZGVyR3JvdXAiLCJyYW5nZSIsImxhYmVsIiwibWFqb3JUaWNrcyIsIm9wdGlvbnMiLCJsYWJlbE5vZGUiLCJmb250Iiwic2xpZGVyIiwidHJhY2tTaXplIiwiZm9yRWFjaCIsInRpY2siLCJhZGRNYWpvclRpY2siLCJzcGFjaW5nIiwibGVmdCIsInRvcCIsImxpc3RQYXJlbnQiLCJyaWdodCIsImJvdHRvbSIsImNlbnRlclgiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkFuaW1hdGlvblNjcmVlblZpZXcuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjAtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogVE9ETyAjM1xyXG4gKlxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XHJcbiAqL1xyXG5cclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgRGltZW5zaW9uMiBmcm9tICcuLi8uLi8uLi9kb3QvanMvRGltZW5zaW9uMi5qcyc7XHJcbmltcG9ydCBkb3RSYW5kb20gZnJvbSAnLi4vLi4vLi4vZG90L2pzL2RvdFJhbmRvbS5qcyc7XHJcbmltcG9ydCBSYW5nZSBmcm9tICcuLi8uLi8uLi9kb3QvanMvUmFuZ2UuanMnO1xyXG5pbXBvcnQgU2NyZWVuVmlldyBmcm9tICcuLi8uLi8uLi9qb2lzdC9qcy9TY3JlZW5WaWV3LmpzJztcclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCBQaGV0Rm9udCBmcm9tICcuLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvUGhldEZvbnQuanMnO1xyXG5pbXBvcnQgeyBDaXJjbGUsIENvbG9yLCBOb2RlLCBQbGFuZSwgVGV4dCwgVkJveCB9IGZyb20gJy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBIU2xpZGVyIGZyb20gJy4uLy4uLy4uL3N1bi9qcy9IU2xpZGVyLmpzJztcclxuaW1wb3J0IEFuaW1hdGlvbiBmcm9tICcuLi9BbmltYXRpb24uanMnO1xyXG5pbXBvcnQgRWFzaW5nIGZyb20gJy4uL0Vhc2luZy5qcyc7XHJcbmltcG9ydCB0d2l4dCBmcm9tICcuLi90d2l4dC5qcyc7XHJcbmltcG9ydCBFYXNpbmdDb21ib0JveCBmcm9tICcuL0Vhc2luZ0NvbWJvQm94LmpzJztcclxuXHJcbmNsYXNzIEFuaW1hdGlvblNjcmVlblZpZXcgZXh0ZW5kcyBTY3JlZW5WaWV3IHtcclxuICBjb25zdHJ1Y3RvcigpIHtcclxuXHJcbiAgICBzdXBlcigpO1xyXG5cclxuICAgIGNvbnN0IHBvc2l0aW9uUHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIHRoaXMubGF5b3V0Qm91bmRzLmNlbnRlciApO1xyXG4gICAgY29uc3QgY29sb3JQcm9wZXJ0eSA9IG5ldyBQcm9wZXJ0eSggbmV3IENvbG9yKCAwLCAxMjgsIDI1NSwgMC41ICkgKTtcclxuICAgIGNvbnN0IGR1cmF0aW9uUHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIDAuNSApO1xyXG4gICAgY29uc3QgZWFzaW5nUHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIEVhc2luZy5RVUFEUkFUSUNfSU5fT1VUICk7XHJcblxyXG4gICAgLy8gdG8gZ2V0IHRoZSBpbnB1dCBldmVudHMgOihcclxuICAgIHRoaXMuYWRkQ2hpbGQoIG5ldyBQbGFuZSgpICk7XHJcblxyXG4gICAgY29uc3QgYW5pbWF0ZWRDaXJjbGUgPSBuZXcgQ2lyY2xlKCAyMCwge1xyXG4gICAgICBmaWxsOiBjb2xvclByb3BlcnR5LFxyXG4gICAgICBzdHJva2U6ICdibGFjaycsXHJcbiAgICAgIGNoaWxkcmVuOiBbXHJcbiAgICAgICAgbmV3IENpcmNsZSggMywgeyBmaWxsOiAnYmxhY2snIH0gKVxyXG4gICAgICBdXHJcbiAgICB9ICk7XHJcbiAgICBwb3NpdGlvblByb3BlcnR5LmxpbmtBdHRyaWJ1dGUoIGFuaW1hdGVkQ2lyY2xlLCAndHJhbnNsYXRpb24nICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBhbmltYXRlZENpcmNsZSApO1xyXG5cclxuICAgIGNvbnN0IHRhcmdldENpcmNsZSA9IG5ldyBDaXJjbGUoIDIwLCB7XHJcbiAgICAgIHN0cm9rZTogJ3JlZCcsXHJcbiAgICAgIHRyYW5zbGF0aW9uOiBwb3NpdGlvblByb3BlcnR5LnZhbHVlXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCB0YXJnZXRDaXJjbGUgKTtcclxuXHJcbiAgICBjb25zdCBsYXJnZXIgPSBuZXcgQW5pbWF0aW9uKCB7XHJcbiAgICAgIHNldFZhbHVlOiBmdW5jdGlvbiggdmFsdWUgKSB7IGFuaW1hdGVkQ2lyY2xlLnNldFNjYWxlTWFnbml0dWRlKCB2YWx1ZSApOyB9LFxyXG4gICAgICBmcm9tOiAwLjcsXHJcbiAgICAgIHRvOiAxLFxyXG4gICAgICBkdXJhdGlvbjogMC40LFxyXG4gICAgICBlYXNpbmc6IEVhc2luZy5RVUFEUkFUSUNfSU5fT1VUXHJcbiAgICB9ICk7XHJcbiAgICBjb25zdCBzbWFsbGVyID0gbmV3IEFuaW1hdGlvbigge1xyXG4gICAgICBzZXRWYWx1ZTogZnVuY3Rpb24oIHZhbHVlICkgeyBhbmltYXRlZENpcmNsZS5zZXRTY2FsZU1hZ25pdHVkZSggdmFsdWUgKTsgfSxcclxuICAgICAgZnJvbTogMSxcclxuICAgICAgdG86IDAuNyxcclxuICAgICAgZHVyYXRpb246IDAuNCxcclxuICAgICAgZWFzaW5nOiBFYXNpbmcuUVVBRFJBVElDX0lOX09VVFxyXG4gICAgfSApO1xyXG4gICAgbGFyZ2VyLnRoZW4oIHNtYWxsZXIgKTtcclxuICAgIHNtYWxsZXIudGhlbiggbGFyZ2VyICk7XHJcbiAgICBzbWFsbGVyLnN0YXJ0KCk7XHJcblxyXG4gICAgbGV0IGFuaW1hdGlvbiA9IG51bGw7XHJcbiAgICB0aGlzLmFkZElucHV0TGlzdGVuZXIoIHtcclxuICAgICAgZG93bjogZXZlbnQgPT4ge1xyXG4gICAgICAgIGlmICggIWV2ZW50LmNhblN0YXJ0UHJlc3MoKSApIHsgcmV0dXJuOyB9XHJcbiAgICAgICAgaWYgKCAhKCBldmVudC50YXJnZXQgaW5zdGFuY2VvZiBQbGFuZSApICkgeyByZXR1cm47IH1cclxuXHJcbiAgICAgICAgY29uc3QgbG9jYWxQb2ludCA9IHRoaXMuZ2xvYmFsVG9Mb2NhbFBvaW50KCBldmVudC5wb2ludGVyLnBvaW50ICk7XHJcbiAgICAgICAgdGFyZ2V0Q2lyY2xlLnRyYW5zbGF0aW9uID0gbG9jYWxQb2ludDtcclxuXHJcbiAgICAgICAgYW5pbWF0aW9uICYmIGFuaW1hdGlvbi5zdG9wKCk7XHJcbiAgICAgICAgYW5pbWF0aW9uID0gbmV3IEFuaW1hdGlvbigge1xyXG4gICAgICAgICAgdGFyZ2V0czogWyB7XHJcbiAgICAgICAgICAgIHByb3BlcnR5OiBwb3NpdGlvblByb3BlcnR5LFxyXG4gICAgICAgICAgICBlYXNpbmc6IGVhc2luZ1Byb3BlcnR5LnZhbHVlLFxyXG4gICAgICAgICAgICB0bzogbG9jYWxQb2ludFxyXG4gICAgICAgICAgfSwge1xyXG4gICAgICAgICAgICBwcm9wZXJ0eTogY29sb3JQcm9wZXJ0eSxcclxuICAgICAgICAgICAgZWFzaW5nOiBlYXNpbmdQcm9wZXJ0eS52YWx1ZSxcclxuICAgICAgICAgICAgdG86IG5ldyBDb2xvciggZG90UmFuZG9tLm5leHRJbnQoIDI1NiApLCBkb3RSYW5kb20ubmV4dEludCggMjU2ICksIGRvdFJhbmRvbS5uZXh0SW50KCAyNTYgKSwgMC41IClcclxuICAgICAgICAgIH0gXSxcclxuICAgICAgICAgIGR1cmF0aW9uOiBkdXJhdGlvblByb3BlcnR5LnZhbHVlXHJcbiAgICAgICAgfSApLnN0YXJ0KCk7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuXHJcbiAgICBmdW5jdGlvbiBzbGlkZXJHcm91cCggcHJvcGVydHksIHJhbmdlLCBsYWJlbCwgbWFqb3JUaWNrcywgb3B0aW9ucyApIHtcclxuICAgICAgY29uc3QgbGFiZWxOb2RlID0gbmV3IFRleHQoIGxhYmVsLCB7IGZvbnQ6IG5ldyBQaGV0Rm9udCggMjAgKSB9ICk7XHJcbiAgICAgIGNvbnN0IHNsaWRlciA9IG5ldyBIU2xpZGVyKCBwcm9wZXJ0eSwgcmFuZ2UsIHtcclxuICAgICAgICB0cmFja1NpemU6IG5ldyBEaW1lbnNpb24yKCAzMDAsIDUgKVxyXG4gICAgICB9ICk7XHJcbiAgICAgIG1ham9yVGlja3MuZm9yRWFjaCggdGljayA9PiB7XHJcbiAgICAgICAgc2xpZGVyLmFkZE1ham9yVGljayggdGljaywgbmV3IFRleHQoIHRpY2ssIHsgZm9udDogbmV3IFBoZXRGb250KCAyMCApIH0gKSApO1xyXG4gICAgICB9ICk7XHJcbiAgICAgIHJldHVybiBuZXcgVkJveCggbWVyZ2UoIHtcclxuICAgICAgICBjaGlsZHJlbjogWyBsYWJlbE5vZGUsIHNsaWRlciBdLFxyXG4gICAgICAgIHNwYWNpbmc6IDEwXHJcbiAgICAgIH0sIG9wdGlvbnMgKSApO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuYWRkQ2hpbGQoIHNsaWRlckdyb3VwKCBkdXJhdGlvblByb3BlcnR5LCBuZXcgUmFuZ2UoIDAuMSwgMiApLCAnRHVyYXRpb24nLCBbIDAuMSwgMC41LCAxLCAyIF0sIHtcclxuICAgICAgbGVmdDogMTAsXHJcbiAgICAgIHRvcDogMTBcclxuICAgIH0gKSApO1xyXG5cclxuICAgIGNvbnN0IGxpc3RQYXJlbnQgPSBuZXcgTm9kZSgpO1xyXG5cclxuICAgIHRoaXMuYWRkQ2hpbGQoIG5ldyBFYXNpbmdDb21ib0JveCggZWFzaW5nUHJvcGVydHksIGxpc3RQYXJlbnQsIHtcclxuICAgICAgcmlnaHQ6IHRoaXMubGF5b3V0Qm91bmRzLnJpZ2h0IC0gMTAsXHJcbiAgICAgIHRvcDogMTBcclxuICAgIH0gKSApO1xyXG5cclxuICAgIHRoaXMuYWRkQ2hpbGQoIG5ldyBUZXh0KCAnQ2xpY2sgdG8gbW92ZSB0aGUgYW5pbWF0aW9uIHRhcmdldCcsIHtcclxuICAgICAgZm9udDogbmV3IFBoZXRGb250KCAzMCApLFxyXG4gICAgICBib3R0b206IHRoaXMubGF5b3V0Qm91bmRzLmJvdHRvbSAtIDEwLFxyXG4gICAgICBjZW50ZXJYOiB0aGlzLmxheW91dEJvdW5kcy5jZW50ZXJYXHJcbiAgICB9ICkgKTtcclxuXHJcbiAgICB0aGlzLmFkZENoaWxkKCBsaXN0UGFyZW50ICk7XHJcbiAgfVxyXG59XHJcblxyXG50d2l4dC5yZWdpc3RlciggJ0FuaW1hdGlvblNjcmVlblZpZXcnLCBBbmltYXRpb25TY3JlZW5WaWV3ICk7XHJcbmV4cG9ydCBkZWZhdWx0IEFuaW1hdGlvblNjcmVlblZpZXc7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFFBQVEsTUFBTSw4QkFBOEI7QUFDbkQsT0FBT0MsVUFBVSxNQUFNLCtCQUErQjtBQUN0RCxPQUFPQyxTQUFTLE1BQU0sOEJBQThCO0FBQ3BELE9BQU9DLEtBQUssTUFBTSwwQkFBMEI7QUFDNUMsT0FBT0MsVUFBVSxNQUFNLGlDQUFpQztBQUN4RCxPQUFPQyxLQUFLLE1BQU0sZ0NBQWdDO0FBQ2xELE9BQU9DLFFBQVEsTUFBTSxzQ0FBc0M7QUFDM0QsU0FBU0MsTUFBTSxFQUFFQyxLQUFLLEVBQUVDLElBQUksRUFBRUMsS0FBSyxFQUFFQyxJQUFJLEVBQUVDLElBQUksUUFBUSxnQ0FBZ0M7QUFDdkYsT0FBT0MsT0FBTyxNQUFNLDRCQUE0QjtBQUNoRCxPQUFPQyxTQUFTLE1BQU0saUJBQWlCO0FBQ3ZDLE9BQU9DLE1BQU0sTUFBTSxjQUFjO0FBQ2pDLE9BQU9DLEtBQUssTUFBTSxhQUFhO0FBQy9CLE9BQU9DLGNBQWMsTUFBTSxxQkFBcUI7QUFFaEQsTUFBTUMsbUJBQW1CLFNBQVNkLFVBQVUsQ0FBQztFQUMzQ2UsV0FBV0EsQ0FBQSxFQUFHO0lBRVosS0FBSyxDQUFDLENBQUM7SUFFUCxNQUFNQyxnQkFBZ0IsR0FBRyxJQUFJcEIsUUFBUSxDQUFFLElBQUksQ0FBQ3FCLFlBQVksQ0FBQ0MsTUFBTyxDQUFDO0lBQ2pFLE1BQU1DLGFBQWEsR0FBRyxJQUFJdkIsUUFBUSxDQUFFLElBQUlRLEtBQUssQ0FBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFJLENBQUUsQ0FBQztJQUNuRSxNQUFNZ0IsZ0JBQWdCLEdBQUcsSUFBSXhCLFFBQVEsQ0FBRSxHQUFJLENBQUM7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