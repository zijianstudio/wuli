// Copyright 2022-2023, University of Colorado Boulder

/**
 * Model that controls the logic for the Lab Screen.
 *
 * @author Agustín Vallejo (PhET Interactive Simulations)
 */

import mySolarSystem from '../../mySolarSystem.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import optionize from '../../../../phet-core/js/optionize.js';
import LabMode from '../../../../solar-system-common/js/model/LabMode.js';
import NumericalEngine from '../../common/model/NumericalEngine.js';
import MySolarSystemModel from '../../common/model/MySolarSystemModel.js';
export default class LabModel extends MySolarSystemModel {
  constructor(providedOptions) {
    const options = optionize()({
      engineFactory: bodies => new NumericalEngine(bodies),
      isLab: true
    }, providedOptions);
    super(options);
    this.labModeProperty.lazyLink(mode => {
      if (mode !== LabMode.CUSTOM) {
        this.userControlledProperty.value = true;
        this.clearPaths();
      }
    });
    this.userInteractingEmitter.addListener(() => {
      this.labModeProperty.value = LabMode.CUSTOM;
    });
    this.modeMap = new Map();
    this.setModesToMap();
    this.modeSetter = mode => {
      if (mode !== LabMode.CUSTOM) {
        this.isPlayingProperty.value = false;
        this.hasPlayedProperty.value = false;
        this.userControlledProperty.value = false;
        this.isAnyBodyCollidedProperty.reset();
        this.timeProperty.reset();
        const modeInfo = this.modeMap.get(mode);
        this.loadBodyStates(modeInfo);
        this.numberOfActiveBodiesProperty.value = this.bodies.length;
        this.followCenterOfMass();
        this.saveStartingBodyState();
        this.forceScaleProperty.reset();
        if (mode === LabMode.FOUR_STAR_BALLET) {
          this.forceScaleProperty.value = -1.1;
        }
      }
    };
    this.labModeProperty.link(this.modeSetter);
    this.numberOfActiveBodiesProperty.link(numberOfActiveBodies => {
      if (numberOfActiveBodies !== this.bodies.length) {
        this.isPlayingProperty.value = false;
        this.labModeProperty.value = LabMode.CUSTOM;
        if (numberOfActiveBodies > this.bodies.length) {
          this.addNextBody();
        } else {
          this.removeLastBody();
        }
      }
    });
  }
  reset() {
    super.reset();

    // Changing the Lab Mode briefly to custom so the reset actually triggers the listeners
    // If this is not done, the modeSetter wont be called.
    this.labModeProperty.value = LabMode.CUSTOM;
    this.labModeProperty.reset();
    this.userControlledProperty.reset();
    super.restart();
  }
  setModesToMap() {
    this.modeMap.set(LabMode.SUN_PLANET, [{
      active: true,
      mass: 250,
      position: new Vector2(0, 0),
      velocity: new Vector2(0, -11.1)
    }, {
      active: true,
      mass: 25,
      position: new Vector2(200, 0),
      velocity: new Vector2(0, 111)
    }]);
    this.modeMap.set(LabMode.SUN_PLANET_MOON, [{
      active: true,
      mass: 200,
      position: new Vector2(0, 0),
      velocity: new Vector2(0, 0)
    }, {
      active: true,
      mass: 10,
      position: new Vector2(160, 0),
      velocity: new Vector2(0, 120)
    }, {
      active: true,
      mass: 0.000001,
      position: new Vector2(140, 0),
      velocity: new Vector2(0, 53)
    }]);
    this.modeMap.set(LabMode.SUN_PLANET_COMET, [{
      active: true,
      mass: 200,
      position: new Vector2(0, 0),
      velocity: new Vector2(0, 0)
    }, {
      active: true,
      mass: 1,
      position: new Vector2(150, 0),
      velocity: new Vector2(0, 120)
    }, {
      active: true,
      mass: 0.000001,
      position: new Vector2(-220, 130),
      velocity: new Vector2(-20, -35)
    }]);
    this.modeMap.set(LabMode.TROJAN_ASTEROIDS, [{
      active: true,
      mass: 200,
      position: new Vector2(0, 0),
      velocity: new Vector2(0, 0)
    }, {
      active: true,
      mass: 5,
      position: new Vector2(150, 0),
      velocity: new Vector2(0, 119)
    }, {
      active: true,
      mass: 0.000001,
      position: new Vector2(75, -130),
      velocity: new Vector2(103, 60)
    }, {
      active: true,
      mass: 0.000001,
      position: new Vector2(75, 130),
      velocity: new Vector2(-103, 60)
    }]);
    this.modeMap.set(LabMode.ELLIPSES, [{
      active: true,
      mass: 250,
      position: new Vector2(-200, 0),
      velocity: new Vector2(0, 0)
    }, {
      active: true,
      mass: 0.000001,
      position: new Vector2(-115, 0),
      velocity: new Vector2(0, 151)
    }, {
      active: true,
      mass: 0.000001,
      position: new Vector2(50, 0),
      velocity: new Vector2(0, 60)
    }, {
      active: true,
      mass: 0.000001,
      position: new Vector2(220, 0),
      velocity: new Vector2(0, 37)
    }]);
    this.modeMap.set(LabMode.HYPERBOLIC, [{
      active: true,
      mass: 250,
      position: new Vector2(0, 25),
      velocity: new Vector2(0, 0)
    }, {
      active: true,
      mass: 0.000001,
      position: new Vector2(-250, -70),
      velocity: new Vector2(120, 0)
    }, {
      active: true,
      mass: 0.000001,
      position: new Vector2(-250, -140),
      velocity: new Vector2(120, 0)
    }, {
      active: true,
      mass: 0.000001,
      position: new Vector2(-250, -210),
      velocity: new Vector2(120, 0)
    }]);
    this.modeMap.set(LabMode.SLINGSHOT, [{
      active: true,
      mass: 200,
      position: new Vector2(1, 0),
      velocity: new Vector2(0, -1)
    }, {
      active: true,
      mass: 10,
      position: new Vector2(131, 55),
      velocity: new Vector2(-55, 115)
    }, {
      active: true,
      mass: 0.000001,
      position: new Vector2(-6, -128),
      velocity: new Vector2(83, 0)
    }]);
    this.modeMap.set(LabMode.DOUBLE_SLINGSHOT, [{
      active: true,
      mass: 200,
      position: new Vector2(0, 0),
      velocity: new Vector2(0, -1)
    }, {
      active: true,
      mass: 5,
      position: new Vector2(0, -112),
      velocity: new Vector2(134, 0)
    }, {
      active: true,
      mass: 5,
      position: new Vector2(186, -5),
      velocity: new Vector2(1, 111)
    }, {
      active: true,
      mass: 0.000001,
      position: new Vector2(70, 72),
      velocity: new Vector2(-47, 63)
    }]);
    this.modeMap.set(LabMode.BINARY_STAR_PLANET, [{
      active: true,
      mass: 150,
      position: new Vector2(-100, 0),
      velocity: new Vector2(0, -60)
    }, {
      active: true,
      mass: 120,
      position: new Vector2(100, 0),
      velocity: new Vector2(0, 50)
    }, {
      active: true,
      mass: 0.000001,
      position: new Vector2(-50, 0),
      velocity: new Vector2(0, 120)
    }]);
    this.modeMap.set(LabMode.FOUR_STAR_BALLET, [{
      active: true,
      mass: 120,
      position: new Vector2(-100, 100),
      velocity: new Vector2(-50, -50)
    }, {
      active: true,
      mass: 120,
      position: new Vector2(100, 100),
      velocity: new Vector2(-50, 50)
    }, {
      active: true,
      mass: 120,
      position: new Vector2(100, -100),
      velocity: new Vector2(50, 50)
    }, {
      active: true,
      mass: 120,
      position: new Vector2(-100, -100),
      velocity: new Vector2(50, -50)
    }]);
    this.modeMap.set(LabMode.DOUBLE_DOUBLE, [{
      active: true,
      mass: 60,
      position: new Vector2(-115, -3),
      velocity: new Vector2(0, -154)
    }, {
      active: true,
      mass: 70,
      position: new Vector2(102, 0),
      velocity: new Vector2(1, 150)
    }, {
      active: true,
      mass: 55,
      position: new Vector2(-77, -2),
      velocity: new Vector2(-1, 42)
    }, {
      active: true,
      mass: 62,
      position: new Vector2(135, 0),
      velocity: new Vector2(-1, -52)
    }]);
    this.modeMap.set(LabMode.CUSTOM, [{
      active: true,
      mass: 120,
      position: new Vector2(-100, 100),
      velocity: new Vector2(-50, -50)
    }, {
      active: true,
      mass: 120,
      position: new Vector2(100, 100),
      velocity: new Vector2(-50, 50)
    }, {
      active: true,
      mass: 120,
      position: new Vector2(100, -100),
      velocity: new Vector2(50, 50)
    }, {
      active: true,
      mass: 120,
      position: new Vector2(-100, -100),
      velocity: new Vector2(50, -50)
    }]);
  }
}
mySolarSystem.register('LabModel', LabModel);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJteVNvbGFyU3lzdGVtIiwiVmVjdG9yMiIsIm9wdGlvbml6ZSIsIkxhYk1vZGUiLCJOdW1lcmljYWxFbmdpbmUiLCJNeVNvbGFyU3lzdGVtTW9kZWwiLCJMYWJNb2RlbCIsImNvbnN0cnVjdG9yIiwicHJvdmlkZWRPcHRpb25zIiwib3B0aW9ucyIsImVuZ2luZUZhY3RvcnkiLCJib2RpZXMiLCJpc0xhYiIsImxhYk1vZGVQcm9wZXJ0eSIsImxhenlMaW5rIiwibW9kZSIsIkNVU1RPTSIsInVzZXJDb250cm9sbGVkUHJvcGVydHkiLCJ2YWx1ZSIsImNsZWFyUGF0aHMiLCJ1c2VySW50ZXJhY3RpbmdFbWl0dGVyIiwiYWRkTGlzdGVuZXIiLCJtb2RlTWFwIiwiTWFwIiwic2V0TW9kZXNUb01hcCIsIm1vZGVTZXR0ZXIiLCJpc1BsYXlpbmdQcm9wZXJ0eSIsImhhc1BsYXllZFByb3BlcnR5IiwiaXNBbnlCb2R5Q29sbGlkZWRQcm9wZXJ0eSIsInJlc2V0IiwidGltZVByb3BlcnR5IiwibW9kZUluZm8iLCJnZXQiLCJsb2FkQm9keVN0YXRlcyIsIm51bWJlck9mQWN0aXZlQm9kaWVzUHJvcGVydHkiLCJsZW5ndGgiLCJmb2xsb3dDZW50ZXJPZk1hc3MiLCJzYXZlU3RhcnRpbmdCb2R5U3RhdGUiLCJmb3JjZVNjYWxlUHJvcGVydHkiLCJGT1VSX1NUQVJfQkFMTEVUIiwibGluayIsIm51bWJlck9mQWN0aXZlQm9kaWVzIiwiYWRkTmV4dEJvZHkiLCJyZW1vdmVMYXN0Qm9keSIsInJlc3RhcnQiLCJzZXQiLCJTVU5fUExBTkVUIiwiYWN0aXZlIiwibWFzcyIsInBvc2l0aW9uIiwidmVsb2NpdHkiLCJTVU5fUExBTkVUX01PT04iLCJTVU5fUExBTkVUX0NPTUVUIiwiVFJPSkFOX0FTVEVST0lEUyIsIkVMTElQU0VTIiwiSFlQRVJCT0xJQyIsIlNMSU5HU0hPVCIsIkRPVUJMRV9TTElOR1NIT1QiLCJCSU5BUllfU1RBUl9QTEFORVQiLCJET1VCTEVfRE9VQkxFIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJMYWJNb2RlbC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMi0yMDIzLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBNb2RlbCB0aGF0IGNvbnRyb2xzIHRoZSBsb2dpYyBmb3IgdGhlIExhYiBTY3JlZW4uXHJcbiAqXHJcbiAqIEBhdXRob3IgQWd1c3TDrW4gVmFsbGVqbyAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgbXlTb2xhclN5c3RlbSBmcm9tICcuLi8uLi9teVNvbGFyU3lzdGVtLmpzJztcclxuaW1wb3J0IFZlY3RvcjIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1ZlY3RvcjIuanMnO1xyXG5pbXBvcnQgeyBCb2R5SW5mbyB9IGZyb20gJy4uLy4uLy4uLy4uL3NvbGFyLXN5c3RlbS1jb21tb24vanMvbW9kZWwvU29sYXJTeXN0ZW1Db21tb25Nb2RlbC5qcyc7XHJcbmltcG9ydCBvcHRpb25pemUsIHsgRW1wdHlTZWxmT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgU3RyaWN0T21pdCBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvU3RyaWN0T21pdC5qcyc7XHJcbmltcG9ydCBMYWJNb2RlIGZyb20gJy4uLy4uLy4uLy4uL3NvbGFyLXN5c3RlbS1jb21tb24vanMvbW9kZWwvTGFiTW9kZS5qcyc7XHJcbmltcG9ydCBOdW1lcmljYWxFbmdpbmUgZnJvbSAnLi4vLi4vY29tbW9uL21vZGVsL051bWVyaWNhbEVuZ2luZS5qcyc7XHJcbmltcG9ydCBNeVNvbGFyU3lzdGVtTW9kZWwsIHsgTXlTb2xhclN5c3RlbU1vZGVsT3B0aW9ucyB9IGZyb20gJy4uLy4uL2NvbW1vbi9tb2RlbC9NeVNvbGFyU3lzdGVtTW9kZWwuanMnO1xyXG5cclxudHlwZSBTdXBlclR5cGVPcHRpb25zID0gTXlTb2xhclN5c3RlbU1vZGVsT3B0aW9ucztcclxuXHJcbnR5cGUgTGFiTW9kZWxPcHRpb25zID0gU3RyaWN0T21pdDxTdXBlclR5cGVPcHRpb25zLCAnZW5naW5lRmFjdG9yeScgfCAnaXNMYWInPjtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIExhYk1vZGVsIGV4dGVuZHMgTXlTb2xhclN5c3RlbU1vZGVsIHtcclxuICBwcml2YXRlIHJlYWRvbmx5IG1vZGVNYXA6IE1hcDxMYWJNb2RlLCBCb2R5SW5mb1tdPjtcclxuICBwcml2YXRlIHJlYWRvbmx5IG1vZGVTZXR0ZXI6ICggbW9kZTogTGFiTW9kZSApID0+IHZvaWQ7XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggcHJvdmlkZWRPcHRpb25zOiBMYWJNb2RlbE9wdGlvbnMgKSB7XHJcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uaXplPExhYk1vZGVsT3B0aW9ucywgRW1wdHlTZWxmT3B0aW9ucywgU3VwZXJUeXBlT3B0aW9ucz4oKSgge1xyXG4gICAgICBlbmdpbmVGYWN0b3J5OiBib2RpZXMgPT4gbmV3IE51bWVyaWNhbEVuZ2luZSggYm9kaWVzICksXHJcbiAgICAgIGlzTGFiOiB0cnVlXHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuICAgIHN1cGVyKCBvcHRpb25zICk7XHJcblxyXG4gICAgdGhpcy5sYWJNb2RlUHJvcGVydHkubGF6eUxpbmsoIG1vZGUgPT4ge1xyXG4gICAgICBpZiAoIG1vZGUgIT09IExhYk1vZGUuQ1VTVE9NICkge1xyXG4gICAgICAgIHRoaXMudXNlckNvbnRyb2xsZWRQcm9wZXJ0eS52YWx1ZSA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5jbGVhclBhdGhzKCk7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLnVzZXJJbnRlcmFjdGluZ0VtaXR0ZXIuYWRkTGlzdGVuZXIoICgpID0+IHtcclxuICAgICAgdGhpcy5sYWJNb2RlUHJvcGVydHkudmFsdWUgPSBMYWJNb2RlLkNVU1RPTTtcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLm1vZGVNYXAgPSBuZXcgTWFwPExhYk1vZGUsIEJvZHlJbmZvW10+KCk7XHJcbiAgICB0aGlzLnNldE1vZGVzVG9NYXAoKTtcclxuXHJcbiAgICB0aGlzLm1vZGVTZXR0ZXIgPSAoIG1vZGU6IExhYk1vZGUgKSA9PiB7XHJcbiAgICAgIGlmICggbW9kZSAhPT0gTGFiTW9kZS5DVVNUT00gKSB7XHJcbiAgICAgICAgdGhpcy5pc1BsYXlpbmdQcm9wZXJ0eS52YWx1ZSA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuaGFzUGxheWVkUHJvcGVydHkudmFsdWUgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLnVzZXJDb250cm9sbGVkUHJvcGVydHkudmFsdWUgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmlzQW55Qm9keUNvbGxpZGVkUHJvcGVydHkucmVzZXQoKTtcclxuICAgICAgICB0aGlzLnRpbWVQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgICAgIGNvbnN0IG1vZGVJbmZvID0gdGhpcy5tb2RlTWFwLmdldCggbW9kZSApO1xyXG4gICAgICAgIHRoaXMubG9hZEJvZHlTdGF0ZXMoIG1vZGVJbmZvISApO1xyXG4gICAgICAgIHRoaXMubnVtYmVyT2ZBY3RpdmVCb2RpZXNQcm9wZXJ0eS52YWx1ZSA9IHRoaXMuYm9kaWVzLmxlbmd0aDtcclxuICAgICAgICB0aGlzLmZvbGxvd0NlbnRlck9mTWFzcygpO1xyXG4gICAgICAgIHRoaXMuc2F2ZVN0YXJ0aW5nQm9keVN0YXRlKCk7XHJcbiAgICAgICAgdGhpcy5mb3JjZVNjYWxlUHJvcGVydHkucmVzZXQoKTtcclxuXHJcbiAgICAgICAgaWYgKCBtb2RlID09PSBMYWJNb2RlLkZPVVJfU1RBUl9CQUxMRVQgKSB7XHJcbiAgICAgICAgICB0aGlzLmZvcmNlU2NhbGVQcm9wZXJ0eS52YWx1ZSA9IC0xLjE7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIHRoaXMubGFiTW9kZVByb3BlcnR5LmxpbmsoIHRoaXMubW9kZVNldHRlciApO1xyXG5cclxuICAgIHRoaXMubnVtYmVyT2ZBY3RpdmVCb2RpZXNQcm9wZXJ0eS5saW5rKCBudW1iZXJPZkFjdGl2ZUJvZGllcyA9PiB7XHJcbiAgICAgIGlmICggbnVtYmVyT2ZBY3RpdmVCb2RpZXMgIT09IHRoaXMuYm9kaWVzLmxlbmd0aCApIHtcclxuICAgICAgICB0aGlzLmlzUGxheWluZ1Byb3BlcnR5LnZhbHVlID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5sYWJNb2RlUHJvcGVydHkudmFsdWUgPSBMYWJNb2RlLkNVU1RPTTtcclxuICAgICAgICBpZiAoIG51bWJlck9mQWN0aXZlQm9kaWVzID4gdGhpcy5ib2RpZXMubGVuZ3RoICkge1xyXG4gICAgICAgICAgdGhpcy5hZGROZXh0Qm9keSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgIHRoaXMucmVtb3ZlTGFzdEJvZHkoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBvdmVycmlkZSByZXNldCgpOiB2b2lkIHtcclxuICAgIHN1cGVyLnJlc2V0KCk7XHJcblxyXG4gICAgLy8gQ2hhbmdpbmcgdGhlIExhYiBNb2RlIGJyaWVmbHkgdG8gY3VzdG9tIHNvIHRoZSByZXNldCBhY3R1YWxseSB0cmlnZ2VycyB0aGUgbGlzdGVuZXJzXHJcbiAgICAvLyBJZiB0aGlzIGlzIG5vdCBkb25lLCB0aGUgbW9kZVNldHRlciB3b250IGJlIGNhbGxlZC5cclxuICAgIHRoaXMubGFiTW9kZVByb3BlcnR5LnZhbHVlID0gTGFiTW9kZS5DVVNUT007XHJcbiAgICB0aGlzLmxhYk1vZGVQcm9wZXJ0eS5yZXNldCgpO1xyXG5cclxuICAgIHRoaXMudXNlckNvbnRyb2xsZWRQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgc3VwZXIucmVzdGFydCgpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHNldE1vZGVzVG9NYXAoKTogdm9pZCB7XHJcbiAgICB0aGlzLm1vZGVNYXAuc2V0KCBMYWJNb2RlLlNVTl9QTEFORVQsIFtcclxuICAgICAgeyBhY3RpdmU6IHRydWUsIG1hc3M6IDI1MCwgcG9zaXRpb246IG5ldyBWZWN0b3IyKCAwLCAwICksIHZlbG9jaXR5OiBuZXcgVmVjdG9yMiggMCwgLTExLjEgKSB9LFxyXG4gICAgICB7IGFjdGl2ZTogdHJ1ZSwgbWFzczogMjUsIHBvc2l0aW9uOiBuZXcgVmVjdG9yMiggMjAwLCAwICksIHZlbG9jaXR5OiBuZXcgVmVjdG9yMiggMCwgMTExICkgfVxyXG4gICAgXSApO1xyXG4gICAgdGhpcy5tb2RlTWFwLnNldCggTGFiTW9kZS5TVU5fUExBTkVUX01PT04sIFtcclxuICAgICAgeyBhY3RpdmU6IHRydWUsIG1hc3M6IDIwMCwgcG9zaXRpb246IG5ldyBWZWN0b3IyKCAwLCAwICksIHZlbG9jaXR5OiBuZXcgVmVjdG9yMiggMCwgMCApIH0sXHJcbiAgICAgIHsgYWN0aXZlOiB0cnVlLCBtYXNzOiAxMCwgcG9zaXRpb246IG5ldyBWZWN0b3IyKCAxNjAsIDAgKSwgdmVsb2NpdHk6IG5ldyBWZWN0b3IyKCAwLCAxMjAgKSB9LFxyXG4gICAgICB7IGFjdGl2ZTogdHJ1ZSwgbWFzczogMC4wMDAwMDEsIHBvc2l0aW9uOiBuZXcgVmVjdG9yMiggMTQwLCAwICksIHZlbG9jaXR5OiBuZXcgVmVjdG9yMiggMCwgNTMgKSB9XHJcbiAgICBdICk7XHJcbiAgICB0aGlzLm1vZGVNYXAuc2V0KCBMYWJNb2RlLlNVTl9QTEFORVRfQ09NRVQsIFtcclxuICAgICAgeyBhY3RpdmU6IHRydWUsIG1hc3M6IDIwMCwgcG9zaXRpb246IG5ldyBWZWN0b3IyKCAwLCAwICksIHZlbG9jaXR5OiBuZXcgVmVjdG9yMiggMCwgMCApIH0sXHJcbiAgICAgIHsgYWN0aXZlOiB0cnVlLCBtYXNzOiAxLCBwb3NpdGlvbjogbmV3IFZlY3RvcjIoIDE1MCwgMCApLCB2ZWxvY2l0eTogbmV3IFZlY3RvcjIoIDAsIDEyMCApIH0sXHJcbiAgICAgIHsgYWN0aXZlOiB0cnVlLCBtYXNzOiAwLjAwMDAwMSwgcG9zaXRpb246IG5ldyBWZWN0b3IyKCAtMjIwLCAxMzAgKSwgdmVsb2NpdHk6IG5ldyBWZWN0b3IyKCAtMjAsIC0zNSApIH1cclxuICAgIF0gKTtcclxuICAgIHRoaXMubW9kZU1hcC5zZXQoIExhYk1vZGUuVFJPSkFOX0FTVEVST0lEUywgW1xyXG4gICAgICB7IGFjdGl2ZTogdHJ1ZSwgbWFzczogMjAwLCBwb3NpdGlvbjogbmV3IFZlY3RvcjIoIDAsIDAgKSwgdmVsb2NpdHk6IG5ldyBWZWN0b3IyKCAwLCAwICkgfSxcclxuICAgICAgeyBhY3RpdmU6IHRydWUsIG1hc3M6IDUsIHBvc2l0aW9uOiBuZXcgVmVjdG9yMiggMTUwLCAwICksIHZlbG9jaXR5OiBuZXcgVmVjdG9yMiggMCwgMTE5ICkgfSxcclxuICAgICAgeyBhY3RpdmU6IHRydWUsIG1hc3M6IDAuMDAwMDAxLCBwb3NpdGlvbjogbmV3IFZlY3RvcjIoIDc1LCAtMTMwICksIHZlbG9jaXR5OiBuZXcgVmVjdG9yMiggMTAzLCA2MCApIH0sXHJcbiAgICAgIHsgYWN0aXZlOiB0cnVlLCBtYXNzOiAwLjAwMDAwMSwgcG9zaXRpb246IG5ldyBWZWN0b3IyKCA3NSwgMTMwICksIHZlbG9jaXR5OiBuZXcgVmVjdG9yMiggLTEwMywgNjAgKSB9XHJcbiAgICBdICk7XHJcbiAgICB0aGlzLm1vZGVNYXAuc2V0KCBMYWJNb2RlLkVMTElQU0VTLCBbXHJcbiAgICAgIHsgYWN0aXZlOiB0cnVlLCBtYXNzOiAyNTAsIHBvc2l0aW9uOiBuZXcgVmVjdG9yMiggLTIwMCwgMCApLCB2ZWxvY2l0eTogbmV3IFZlY3RvcjIoIDAsIDAgKSB9LFxyXG4gICAgICB7IGFjdGl2ZTogdHJ1ZSwgbWFzczogMC4wMDAwMDEsIHBvc2l0aW9uOiBuZXcgVmVjdG9yMiggLTExNSwgMCApLCB2ZWxvY2l0eTogbmV3IFZlY3RvcjIoIDAsIDE1MSApIH0sXHJcbiAgICAgIHsgYWN0aXZlOiB0cnVlLCBtYXNzOiAwLjAwMDAwMSwgcG9zaXRpb246IG5ldyBWZWN0b3IyKCA1MCwgMCApLCB2ZWxvY2l0eTogbmV3IFZlY3RvcjIoIDAsIDYwICkgfSxcclxuICAgICAgeyBhY3RpdmU6IHRydWUsIG1hc3M6IDAuMDAwMDAxLCBwb3NpdGlvbjogbmV3IFZlY3RvcjIoIDIyMCwgMCApLCB2ZWxvY2l0eTogbmV3IFZlY3RvcjIoIDAsIDM3ICkgfVxyXG4gICAgXSApO1xyXG4gICAgdGhpcy5tb2RlTWFwLnNldCggTGFiTW9kZS5IWVBFUkJPTElDLCBbXHJcbiAgICAgIHsgYWN0aXZlOiB0cnVlLCBtYXNzOiAyNTAsIHBvc2l0aW9uOiBuZXcgVmVjdG9yMiggMCwgMjUgKSwgdmVsb2NpdHk6IG5ldyBWZWN0b3IyKCAwLCAwICkgfSxcclxuICAgICAgeyBhY3RpdmU6IHRydWUsIG1hc3M6IDAuMDAwMDAxLCBwb3NpdGlvbjogbmV3IFZlY3RvcjIoIC0yNTAsIC03MCApLCB2ZWxvY2l0eTogbmV3IFZlY3RvcjIoIDEyMCwgMCApIH0sXHJcbiAgICAgIHsgYWN0aXZlOiB0cnVlLCBtYXNzOiAwLjAwMDAwMSwgcG9zaXRpb246IG5ldyBWZWN0b3IyKCAtMjUwLCAtMTQwICksIHZlbG9jaXR5OiBuZXcgVmVjdG9yMiggMTIwLCAwICkgfSxcclxuICAgICAgeyBhY3RpdmU6IHRydWUsIG1hc3M6IDAuMDAwMDAxLCBwb3NpdGlvbjogbmV3IFZlY3RvcjIoIC0yNTAsIC0yMTAgKSwgdmVsb2NpdHk6IG5ldyBWZWN0b3IyKCAxMjAsIDAgKSB9XHJcbiAgICBdICk7XHJcbiAgICB0aGlzLm1vZGVNYXAuc2V0KCBMYWJNb2RlLlNMSU5HU0hPVCwgW1xyXG4gICAgICB7IGFjdGl2ZTogdHJ1ZSwgbWFzczogMjAwLCBwb3NpdGlvbjogbmV3IFZlY3RvcjIoIDEsIDAgKSwgdmVsb2NpdHk6IG5ldyBWZWN0b3IyKCAwLCAtMSApIH0sXHJcbiAgICAgIHsgYWN0aXZlOiB0cnVlLCBtYXNzOiAxMCwgcG9zaXRpb246IG5ldyBWZWN0b3IyKCAxMzEsIDU1ICksIHZlbG9jaXR5OiBuZXcgVmVjdG9yMiggLTU1LCAxMTUgKSB9LFxyXG4gICAgICB7IGFjdGl2ZTogdHJ1ZSwgbWFzczogMC4wMDAwMDEsIHBvc2l0aW9uOiBuZXcgVmVjdG9yMiggLTYsIC0xMjggKSwgdmVsb2NpdHk6IG5ldyBWZWN0b3IyKCA4MywgMCApIH1cclxuICAgIF0gKTtcclxuICAgIHRoaXMubW9kZU1hcC5zZXQoIExhYk1vZGUuRE9VQkxFX1NMSU5HU0hPVCwgW1xyXG4gICAgICB7IGFjdGl2ZTogdHJ1ZSwgbWFzczogMjAwLCBwb3NpdGlvbjogbmV3IFZlY3RvcjIoIDAsIDAgKSwgdmVsb2NpdHk6IG5ldyBWZWN0b3IyKCAwLCAtMSApIH0sXHJcbiAgICAgIHsgYWN0aXZlOiB0cnVlLCBtYXNzOiA1LCBwb3NpdGlvbjogbmV3IFZlY3RvcjIoIDAsIC0xMTIgKSwgdmVsb2NpdHk6IG5ldyBWZWN0b3IyKCAxMzQsIDAgKSB9LFxyXG4gICAgICB7IGFjdGl2ZTogdHJ1ZSwgbWFzczogNSwgcG9zaXRpb246IG5ldyBWZWN0b3IyKCAxODYsIC01ICksIHZlbG9jaXR5OiBuZXcgVmVjdG9yMiggMSwgMTExICkgfSxcclxuICAgICAgeyBhY3RpdmU6IHRydWUsIG1hc3M6IDAuMDAwMDAxLCBwb3NpdGlvbjogbmV3IFZlY3RvcjIoIDcwLCA3MiApLCB2ZWxvY2l0eTogbmV3IFZlY3RvcjIoIC00NywgNjMgKSB9XHJcbiAgICBdICk7XHJcbiAgICB0aGlzLm1vZGVNYXAuc2V0KCBMYWJNb2RlLkJJTkFSWV9TVEFSX1BMQU5FVCwgW1xyXG4gICAgICB7IGFjdGl2ZTogdHJ1ZSwgbWFzczogMTUwLCBwb3NpdGlvbjogbmV3IFZlY3RvcjIoIC0xMDAsIDAgKSwgdmVsb2NpdHk6IG5ldyBWZWN0b3IyKCAwLCAtNjAgKSB9LFxyXG4gICAgICB7IGFjdGl2ZTogdHJ1ZSwgbWFzczogMTIwLCBwb3NpdGlvbjogbmV3IFZlY3RvcjIoIDEwMCwgMCApLCB2ZWxvY2l0eTogbmV3IFZlY3RvcjIoIDAsIDUwICkgfSxcclxuICAgICAgeyBhY3RpdmU6IHRydWUsIG1hc3M6IDAuMDAwMDAxLCBwb3NpdGlvbjogbmV3IFZlY3RvcjIoIC01MCwgMCApLCB2ZWxvY2l0eTogbmV3IFZlY3RvcjIoIDAsIDEyMCApIH1cclxuICAgIF0gKTtcclxuICAgIHRoaXMubW9kZU1hcC5zZXQoIExhYk1vZGUuRk9VUl9TVEFSX0JBTExFVCwgW1xyXG4gICAgICB7IGFjdGl2ZTogdHJ1ZSwgbWFzczogMTIwLCBwb3NpdGlvbjogbmV3IFZlY3RvcjIoIC0xMDAsIDEwMCApLCB2ZWxvY2l0eTogbmV3IFZlY3RvcjIoIC01MCwgLTUwICkgfSxcclxuICAgICAgeyBhY3RpdmU6IHRydWUsIG1hc3M6IDEyMCwgcG9zaXRpb246IG5ldyBWZWN0b3IyKCAxMDAsIDEwMCApLCB2ZWxvY2l0eTogbmV3IFZlY3RvcjIoIC01MCwgNTAgKSB9LFxyXG4gICAgICB7IGFjdGl2ZTogdHJ1ZSwgbWFzczogMTIwLCBwb3NpdGlvbjogbmV3IFZlY3RvcjIoIDEwMCwgLTEwMCApLCB2ZWxvY2l0eTogbmV3IFZlY3RvcjIoIDUwLCA1MCApIH0sXHJcbiAgICAgIHsgYWN0aXZlOiB0cnVlLCBtYXNzOiAxMjAsIHBvc2l0aW9uOiBuZXcgVmVjdG9yMiggLTEwMCwgLTEwMCApLCB2ZWxvY2l0eTogbmV3IFZlY3RvcjIoIDUwLCAtNTAgKSB9XHJcbiAgICBdICk7XHJcbiAgICB0aGlzLm1vZGVNYXAuc2V0KCBMYWJNb2RlLkRPVUJMRV9ET1VCTEUsIFtcclxuICAgICAgeyBhY3RpdmU6IHRydWUsIG1hc3M6IDYwLCBwb3NpdGlvbjogbmV3IFZlY3RvcjIoIC0xMTUsIC0zICksIHZlbG9jaXR5OiBuZXcgVmVjdG9yMiggMCwgLTE1NCApIH0sXHJcbiAgICAgIHsgYWN0aXZlOiB0cnVlLCBtYXNzOiA3MCwgcG9zaXRpb246IG5ldyBWZWN0b3IyKCAxMDIsIDAgKSwgdmVsb2NpdHk6IG5ldyBWZWN0b3IyKCAxLCAxNTAgKSB9LFxyXG4gICAgICB7IGFjdGl2ZTogdHJ1ZSwgbWFzczogNTUsIHBvc2l0aW9uOiBuZXcgVmVjdG9yMiggLTc3LCAtMiApLCB2ZWxvY2l0eTogbmV3IFZlY3RvcjIoIC0xLCA0MiApIH0sXHJcbiAgICAgIHsgYWN0aXZlOiB0cnVlLCBtYXNzOiA2MiwgcG9zaXRpb246IG5ldyBWZWN0b3IyKCAxMzUsIDAgKSwgdmVsb2NpdHk6IG5ldyBWZWN0b3IyKCAtMSwgLTUyICkgfVxyXG4gICAgXSApO1xyXG4gICAgdGhpcy5tb2RlTWFwLnNldCggTGFiTW9kZS5DVVNUT00sIFtcclxuICAgICAgeyBhY3RpdmU6IHRydWUsIG1hc3M6IDEyMCwgcG9zaXRpb246IG5ldyBWZWN0b3IyKCAtMTAwLCAxMDAgKSwgdmVsb2NpdHk6IG5ldyBWZWN0b3IyKCAtNTAsIC01MCApIH0sXHJcbiAgICAgIHsgYWN0aXZlOiB0cnVlLCBtYXNzOiAxMjAsIHBvc2l0aW9uOiBuZXcgVmVjdG9yMiggMTAwLCAxMDAgKSwgdmVsb2NpdHk6IG5ldyBWZWN0b3IyKCAtNTAsIDUwICkgfSxcclxuICAgICAgeyBhY3RpdmU6IHRydWUsIG1hc3M6IDEyMCwgcG9zaXRpb246IG5ldyBWZWN0b3IyKCAxMDAsIC0xMDAgKSwgdmVsb2NpdHk6IG5ldyBWZWN0b3IyKCA1MCwgNTAgKSB9LFxyXG4gICAgICB7IGFjdGl2ZTogdHJ1ZSwgbWFzczogMTIwLCBwb3NpdGlvbjogbmV3IFZlY3RvcjIoIC0xMDAsIC0xMDAgKSwgdmVsb2NpdHk6IG5ldyBWZWN0b3IyKCA1MCwgLTUwICkgfVxyXG4gICAgXSApO1xyXG4gIH1cclxufVxyXG5cclxubXlTb2xhclN5c3RlbS5yZWdpc3RlciggJ0xhYk1vZGVsJywgTGFiTW9kZWwgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsYUFBYSxNQUFNLHdCQUF3QjtBQUNsRCxPQUFPQyxPQUFPLE1BQU0sK0JBQStCO0FBRW5ELE9B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