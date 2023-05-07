// Copyright 2016-2023, University of Colorado Boulder

/**
 * View-specific Properties for the 'Game' screen
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import balancingChemicalEquations from '../../balancingChemicalEquations.js';
export default class GameViewProperties {
  // Whether the 'Reactants' accordion box is expanded

  // Whether the 'Products' accordion box is expanded

  // Whether the game timer is enabled

  constructor() {
    this.reactantsBoxExpandedProperty = new BooleanProperty(true);
    this.productsBoxExpandedProperty = new BooleanProperty(true);
    this.timerEnabledProperty = new BooleanProperty(false);
  }
  reset() {
    this.reactantsBoxExpandedProperty.reset();
    this.productsBoxExpandedProperty.reset();
    this.timerEnabledProperty.reset();
  }
}
balancingChemicalEquations.register('GameViewProperties', GameViewProperties);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCb29sZWFuUHJvcGVydHkiLCJiYWxhbmNpbmdDaGVtaWNhbEVxdWF0aW9ucyIsIkdhbWVWaWV3UHJvcGVydGllcyIsImNvbnN0cnVjdG9yIiwicmVhY3RhbnRzQm94RXhwYW5kZWRQcm9wZXJ0eSIsInByb2R1Y3RzQm94RXhwYW5kZWRQcm9wZXJ0eSIsInRpbWVyRW5hYmxlZFByb3BlcnR5IiwicmVzZXQiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkdhbWVWaWV3UHJvcGVydGllcy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNi0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBWaWV3LXNwZWNpZmljIFByb3BlcnRpZXMgZm9yIHRoZSAnR2FtZScgc2NyZWVuXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IEJvb2xlYW5Qcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL0Jvb2xlYW5Qcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IGJhbGFuY2luZ0NoZW1pY2FsRXF1YXRpb25zIGZyb20gJy4uLy4uL2JhbGFuY2luZ0NoZW1pY2FsRXF1YXRpb25zLmpzJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEdhbWVWaWV3UHJvcGVydGllcyB7XHJcblxyXG4gIC8vIFdoZXRoZXIgdGhlICdSZWFjdGFudHMnIGFjY29yZGlvbiBib3ggaXMgZXhwYW5kZWRcclxuICBwdWJsaWMgcmVhZG9ubHkgcmVhY3RhbnRzQm94RXhwYW5kZWRQcm9wZXJ0eTogUHJvcGVydHk8Ym9vbGVhbj47XHJcblxyXG4gIC8vIFdoZXRoZXIgdGhlICdQcm9kdWN0cycgYWNjb3JkaW9uIGJveCBpcyBleHBhbmRlZFxyXG4gIHB1YmxpYyByZWFkb25seSBwcm9kdWN0c0JveEV4cGFuZGVkUHJvcGVydHk6IFByb3BlcnR5PGJvb2xlYW4+O1xyXG5cclxuICAvLyBXaGV0aGVyIHRoZSBnYW1lIHRpbWVyIGlzIGVuYWJsZWRcclxuICBwdWJsaWMgcmVhZG9ubHkgdGltZXJFbmFibGVkUHJvcGVydHk6IFByb3BlcnR5PGJvb2xlYW4+O1xyXG5cclxuICBwdWJsaWMgY29uc3RydWN0b3IoKSB7XHJcbiAgICB0aGlzLnJlYWN0YW50c0JveEV4cGFuZGVkUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCB0cnVlICk7XHJcbiAgICB0aGlzLnByb2R1Y3RzQm94RXhwYW5kZWRQcm9wZXJ0eSA9IG5ldyBCb29sZWFuUHJvcGVydHkoIHRydWUgKTtcclxuICAgIHRoaXMudGltZXJFbmFibGVkUHJvcGVydHkgPSBuZXcgQm9vbGVhblByb3BlcnR5KCBmYWxzZSApO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHJlc2V0KCk6IHZvaWQge1xyXG4gICAgdGhpcy5yZWFjdGFudHNCb3hFeHBhbmRlZFByb3BlcnR5LnJlc2V0KCk7XHJcbiAgICB0aGlzLnByb2R1Y3RzQm94RXhwYW5kZWRQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy50aW1lckVuYWJsZWRQcm9wZXJ0eS5yZXNldCgpO1xyXG4gIH1cclxufVxyXG5cclxuYmFsYW5jaW5nQ2hlbWljYWxFcXVhdGlvbnMucmVnaXN0ZXIoICdHYW1lVmlld1Byb3BlcnRpZXMnLCBHYW1lVmlld1Byb3BlcnRpZXMgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsZUFBZSxNQUFNLHdDQUF3QztBQUVwRSxPQUFPQywwQkFBMEIsTUFBTSxxQ0FBcUM7QUFFNUUsZUFBZSxNQUFNQyxrQkFBa0IsQ0FBQztFQUV0Qzs7RUFHQTs7RUFHQTs7RUFHT0MsV0FBV0EsQ0FBQSxFQUFHO0lBQ25CLElBQUksQ0FBQ0MsNEJBQTRCLEdBQUcsSUFBSUosZUFBZSxDQUFFLElBQUssQ0FBQztJQUMvRCxJQUFJLENBQUNLLDJCQUEyQixHQUFHLElBQUlMLGVBQWUsQ0FBRSxJQUFLLENBQUM7SUFDOUQsSUFBSSxDQUFDTSxvQkFBb0IsR0FBRyxJQUFJTixlQUFlLENBQUUsS0FBTSxDQUFDO0VBQzFEO0VBRU9PLEtBQUtBLENBQUEsRUFBUztJQUNuQixJQUFJLENBQUNILDRCQUE0QixDQUFDRyxLQUFLLENBQUMsQ0FBQztJQUN6QyxJQUFJLENBQUNGLDJCQUEyQixDQUFDRSxLQUFLLENBQUMsQ0FBQztJQUN4QyxJQUFJLENBQUNELG9CQUFvQixDQUFDQyxLQUFLLENBQUMsQ0FBQztFQUNuQztBQUNGO0FBRUFOLDBCQUEwQixDQUFDTyxRQUFRLENBQUUsb0JBQW9CLEVBQUVOLGtCQUFtQixDQUFDIn0=