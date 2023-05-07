// Copyright 2015-2022, University of Colorado Boulder

/**
 * Provides colors for Joist elements.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DerivedProperty from '../../axon/js/DerivedProperty.js';
import Property from '../../axon/js/Property.js';
import { Color } from '../../scenery/js/imports.js';
import joist from './joist.js';
class LookAndFeel {
  // Background color for the currently selected screen, which will be set on the Display as its backgroundColor

  // (joist-internal) True if the navigation bar background is black

  // (joist-internal) - Navigation bar background fill

  // (joist-internal) - Navigation bar text fill

  constructor() {
    this.backgroundColorProperty = new Property(Color.BLACK);
    this.navigationBarDarkProperty = new DerivedProperty([this.backgroundColorProperty], backgroundColor => backgroundColor.equals(Color.BLACK));
    this.navigationBarFillProperty = new DerivedProperty([this.navigationBarDarkProperty], backgroundDark => backgroundDark ? Color.WHITE : Color.BLACK);
    this.navigationBarTextFillProperty = new DerivedProperty([this.navigationBarFillProperty], navigationBarFill => navigationBarFill.equals(Color.BLACK) ? Color.WHITE : Color.BLACK);
  }
  reset() {
    this.backgroundColorProperty.reset();
  }
}
joist.register('LookAndFeel', LookAndFeel);
export default LookAndFeel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZXJpdmVkUHJvcGVydHkiLCJQcm9wZXJ0eSIsIkNvbG9yIiwiam9pc3QiLCJMb29rQW5kRmVlbCIsImNvbnN0cnVjdG9yIiwiYmFja2dyb3VuZENvbG9yUHJvcGVydHkiLCJCTEFDSyIsIm5hdmlnYXRpb25CYXJEYXJrUHJvcGVydHkiLCJiYWNrZ3JvdW5kQ29sb3IiLCJlcXVhbHMiLCJuYXZpZ2F0aW9uQmFyRmlsbFByb3BlcnR5IiwiYmFja2dyb3VuZERhcmsiLCJXSElURSIsIm5hdmlnYXRpb25CYXJUZXh0RmlsbFByb3BlcnR5IiwibmF2aWdhdGlvbkJhckZpbGwiLCJyZXNldCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiTG9va0FuZEZlZWwudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTUtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogUHJvdmlkZXMgY29sb3JzIGZvciBKb2lzdCBlbGVtZW50cy5cclxuICpcclxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgRGVyaXZlZFByb3BlcnR5IGZyb20gJy4uLy4uL2F4b24vanMvRGVyaXZlZFByb3BlcnR5LmpzJztcclxuaW1wb3J0IFRSZWFkT25seVByb3BlcnR5IGZyb20gJy4uLy4uL2F4b24vanMvVFJlYWRPbmx5UHJvcGVydHkuanMnO1xyXG5pbXBvcnQgUHJvcGVydHkgZnJvbSAnLi4vLi4vYXhvbi9qcy9Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCB7IENvbG9yIH0gZnJvbSAnLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IGpvaXN0IGZyb20gJy4vam9pc3QuanMnO1xyXG5cclxuY2xhc3MgTG9va0FuZEZlZWwge1xyXG5cclxuICAvLyBCYWNrZ3JvdW5kIGNvbG9yIGZvciB0aGUgY3VycmVudGx5IHNlbGVjdGVkIHNjcmVlbiwgd2hpY2ggd2lsbCBiZSBzZXQgb24gdGhlIERpc3BsYXkgYXMgaXRzIGJhY2tncm91bmRDb2xvclxyXG4gIHB1YmxpYyByZWFkb25seSBiYWNrZ3JvdW5kQ29sb3JQcm9wZXJ0eTogUHJvcGVydHk8Q29sb3I+O1xyXG5cclxuICAvLyAoam9pc3QtaW50ZXJuYWwpIFRydWUgaWYgdGhlIG5hdmlnYXRpb24gYmFyIGJhY2tncm91bmQgaXMgYmxhY2tcclxuICBwdWJsaWMgcmVhZG9ubHkgbmF2aWdhdGlvbkJhckRhcmtQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8Ym9vbGVhbj47XHJcblxyXG4gIC8vIChqb2lzdC1pbnRlcm5hbCkgLSBOYXZpZ2F0aW9uIGJhciBiYWNrZ3JvdW5kIGZpbGxcclxuICBwdWJsaWMgcmVhZG9ubHkgbmF2aWdhdGlvbkJhckZpbGxQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8Q29sb3I+O1xyXG5cclxuICAvLyAoam9pc3QtaW50ZXJuYWwpIC0gTmF2aWdhdGlvbiBiYXIgdGV4dCBmaWxsXHJcbiAgcHVibGljIHJlYWRvbmx5IG5hdmlnYXRpb25CYXJUZXh0RmlsbFByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxDb2xvcj47XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvcigpIHtcclxuXHJcbiAgICB0aGlzLmJhY2tncm91bmRDb2xvclByb3BlcnR5ID0gbmV3IFByb3BlcnR5PENvbG9yPiggQ29sb3IuQkxBQ0sgKTtcclxuXHJcbiAgICB0aGlzLm5hdmlnYXRpb25CYXJEYXJrUHJvcGVydHkgPSBuZXcgRGVyaXZlZFByb3BlcnR5KCBbIHRoaXMuYmFja2dyb3VuZENvbG9yUHJvcGVydHkgXSxcclxuICAgICAgYmFja2dyb3VuZENvbG9yID0+IGJhY2tncm91bmRDb2xvci5lcXVhbHMoIENvbG9yLkJMQUNLIClcclxuICAgICk7XHJcblxyXG4gICAgdGhpcy5uYXZpZ2F0aW9uQmFyRmlsbFByb3BlcnR5ID0gbmV3IERlcml2ZWRQcm9wZXJ0eSggWyB0aGlzLm5hdmlnYXRpb25CYXJEYXJrUHJvcGVydHkgXSxcclxuICAgICAgYmFja2dyb3VuZERhcmsgPT4gYmFja2dyb3VuZERhcmsgPyBDb2xvci5XSElURSA6IENvbG9yLkJMQUNLXHJcbiAgICApO1xyXG5cclxuICAgIHRoaXMubmF2aWdhdGlvbkJhclRleHRGaWxsUHJvcGVydHkgPSBuZXcgRGVyaXZlZFByb3BlcnR5KCBbIHRoaXMubmF2aWdhdGlvbkJhckZpbGxQcm9wZXJ0eSBdLFxyXG4gICAgICBuYXZpZ2F0aW9uQmFyRmlsbCA9PiBuYXZpZ2F0aW9uQmFyRmlsbC5lcXVhbHMoIENvbG9yLkJMQUNLICkgPyBDb2xvci5XSElURSA6IENvbG9yLkJMQUNLXHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHJlc2V0KCk6IHZvaWQge1xyXG4gICAgdGhpcy5iYWNrZ3JvdW5kQ29sb3JQcm9wZXJ0eS5yZXNldCgpO1xyXG4gIH1cclxufVxyXG5cclxuam9pc3QucmVnaXN0ZXIoICdMb29rQW5kRmVlbCcsIExvb2tBbmRGZWVsICk7XHJcbmV4cG9ydCBkZWZhdWx0IExvb2tBbmRGZWVsOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxlQUFlLE1BQU0sa0NBQWtDO0FBRTlELE9BQU9DLFFBQVEsTUFBTSwyQkFBMkI7QUFDaEQsU0FBU0MsS0FBSyxRQUFRLDZCQUE2QjtBQUNuRCxPQUFPQyxLQUFLLE1BQU0sWUFBWTtBQUU5QixNQUFNQyxXQUFXLENBQUM7RUFFaEI7O0VBR0E7O0VBR0E7O0VBR0E7O0VBR09DLFdBQVdBLENBQUEsRUFBRztJQUVuQixJQUFJLENBQUNDLHVCQUF1QixHQUFHLElBQUlMLFFBQVEsQ0FBU0MsS0FBSyxDQUFDSyxLQUFNLENBQUM7SUFFakUsSUFBSSxDQUFDQyx5QkFBeUIsR0FBRyxJQUFJUixlQUFlLENBQUUsQ0FBRSxJQUFJLENBQUNNLHVCQUF1QixDQUFFLEVBQ3BGRyxlQUFlLElBQUlBLGVBQWUsQ0FBQ0MsTUFBTSxDQUFFUixLQUFLLENBQUNLLEtBQU0sQ0FDekQsQ0FBQztJQUVELElBQUksQ0FBQ0kseUJBQXlCLEdBQUcsSUFBSVgsZUFBZSxDQUFFLENBQUUsSUFBSSxDQUFDUSx5QkFBeUIsQ0FBRSxFQUN0RkksY0FBYyxJQUFJQSxjQUFjLEdBQUdWLEtBQUssQ0FBQ1csS0FBSyxHQUFHWCxLQUFLLENBQUNLLEtBQ3pELENBQUM7SUFFRCxJQUFJLENBQUNPLDZCQUE2QixHQUFHLElBQUlkLGVBQWUsQ0FBRSxDQUFFLElBQUksQ0FBQ1cseUJBQXlCLENBQUUsRUFDMUZJLGlCQUFpQixJQUFJQSxpQkFBaUIsQ0FBQ0wsTUFBTSxDQUFFUixLQUFLLENBQUNLLEtBQU0sQ0FBQyxHQUFHTCxLQUFLLENBQUNXLEtBQUssR0FBR1gsS0FBSyxDQUFDSyxLQUNyRixDQUFDO0VBQ0g7RUFFT1MsS0FBS0EsQ0FBQSxFQUFTO0lBQ25CLElBQUksQ0FBQ1YsdUJBQXVCLENBQUNVLEtBQUssQ0FBQyxDQUFDO0VBQ3RDO0FBQ0Y7QUFFQWIsS0FBSyxDQUFDYyxRQUFRLENBQUUsYUFBYSxFQUFFYixXQUFZLENBQUM7QUFDNUMsZUFBZUEsV0FBVyJ9