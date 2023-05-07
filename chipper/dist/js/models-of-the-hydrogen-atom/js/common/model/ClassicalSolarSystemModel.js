// Copyright 2019-2022, University of Colorado Boulder

/**
 * ClassicalSolarSystemModel is a predictive model of the hydrogen atom.
 *
 * Physical representation:
 * Proton at the center, electron spirals towards the proton. Our spiral is clockwise to be consistent with all other
 * orbits in this sim. The electron starts at a fixed distance and random angle from the proton. The radius of the
 * spiral decreases linearly and the electron accelerates as the electron moves closer to the proton. The final state
 * shows the electron on top of the proton. In this final state, the atom is considered "destroyed".
 *
 * Collision behavior:
 * The spiraling behavior should occur fast enough so that the atom is  destroyed before any photons reach it.
 * Therefore, there are no collisions.
 *
 * Absorption behavior:
 * Atom is destroyed, so it does not absorb photons.
 *
 * Emission behavior:
 * Atom is destroyed, so it does not emit photons.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import optionize from '../../../../phet-core/js/optionize.js';
import classicalSolarSystemButton_png from '../../../images/classicalSolarSystemButton_png.js';
import modelsOfTheHydrogenAtom from '../../modelsOfTheHydrogenAtom.js';
import ModelsOfTheHydrogenAtomStrings from '../../ModelsOfTheHydrogenAtomStrings.js';
import HydrogenAtom from './HydrogenAtom.js';
import MOTHAUtils from '../MOTHAUtils.js';
import Utils from '../../../../dot/js/Utils.js';
import Electron from './Electron.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import BooleanIO from '../../../../tandem/js/types/BooleanIO.js';
import Proton from './Proton.js';
const ELECTRON_DISTANCE = 150; // initial distance from electron to proton
const ELECTRON_DISTANCE_DELTA = 220; // amount the distance between the proton and electron is reduced per second
const MIN_ELECTRON_DISTANCE = 5; // any distance smaller than this is effectively zero
const ELECTRON_ANGLE_DELTA = Utils.toRadians(600); // initial change in electron's rotation angle per second
const ELECTRON_ACCELERATION = 1.008; // scaling of electronAngleDeltaProperty each time step is called

export default class ClassicalSolarSystemModel extends HydrogenAtom {
  // offset of the electron relative to the atom's position

  // distance between electron and proton

  // in radians

  // in radians

  // Has the atom been destroyed?

  constructor(zoomedInBox, providedOptions) {
    const options = optionize()({
      // HydrogenAtomOptions
      displayNameProperty: ModelsOfTheHydrogenAtomStrings.classicalSolarSystemStringProperty,
      iconHTMLImageElement: classicalSolarSystemButton_png,
      hasTransitionWavelengths: false
    }, providedOptions);
    super(zoomedInBox, options);
    this.proton = new Proton({
      position: this.position,
      tandem: options.tandem.createTandem('proton')
    });
    this.electron = new Electron({
      //TODO position is not properly initialized
      tandem: options.tandem.createTandem('electron')
    });
    this.electronDistanceProperty = new NumberProperty(ELECTRON_DISTANCE, {
      tandem: options.tandem.createTandem('electronDistanceProperty')
    });

    //TODO we want this to start at a different angle each time reset, but that conflicts with PhET-iO
    this.electronAngleProperty = new NumberProperty(MOTHAUtils.nextAngle(), {
      tandem: options.tandem.createTandem('electronAngleProperty')
    });

    //TODO make this go away, just set electron.positionProperty directly
    this.electronOffsetProperty = new DerivedProperty([this.electronDistanceProperty, this.electronAngleProperty], (distance, angle) => MOTHAUtils.polarToCartesian(distance, angle), {
      tandem: options.tandem.createTandem('electronOffsetProperty'),
      phetioValueType: Vector2.Vector2IO
    });
    this.electronOffsetProperty.link(electronOffset => {
      this.electron.positionProperty.value = this.position.plus(electronOffset);
    });
    this.electronAngleDeltaProperty = new NumberProperty(ELECTRON_ANGLE_DELTA, {
      tandem: options.tandem.createTandem('electronAngleDeltaProperty')
    });

    // The atom is destroyed when the electron hits the proton.
    this.isDestroyedProperty = new DerivedProperty([this.electronDistanceProperty], electronDistance => electronDistance === 0, {
      tandem: options.tandem.createTandem('isDestroyedProperty'),
      phetioValueType: BooleanIO
    });
  }
  dispose() {
    assert && assert(false, 'dispose is not supported, exists for the lifetime of the sim');
    super.dispose();
  }
  reset() {
    this.proton.reset();
    this.electron.reset();
    this.electronDistanceProperty.reset();
    this.electronAngleProperty.reset();
    this.electronAngleDeltaProperty.reset();
    super.reset();
  }
  step(dt) {
    if (!this.isDestroyedProperty.value) {
      // decrement the orbit angle, so the orbit is clockwise
      this.electronAngleProperty.value -= this.electronAngleDeltaProperty.value * dt;

      // increase the rate of change of the orbit angle
      this.electronAngleDeltaProperty.value *= ELECTRON_ACCELERATION;

      // decrease the electron's distance from the proton
      let newElectronDistance = this.electronDistanceProperty.value - ELECTRON_DISTANCE_DELTA * dt;
      if (newElectronDistance <= MIN_ELECTRON_DISTANCE) {
        newElectronDistance = 0;
      }
      this.electronDistanceProperty.value = newElectronDistance;
    }
  }
  movePhoton(photon, dt) {
    photon.move(dt);
  }
}
modelsOfTheHydrogenAtom.register('ClassicalSolarSystemModel', ClassicalSolarSystemModel);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJOdW1iZXJQcm9wZXJ0eSIsIlZlY3RvcjIiLCJvcHRpb25pemUiLCJjbGFzc2ljYWxTb2xhclN5c3RlbUJ1dHRvbl9wbmciLCJtb2RlbHNPZlRoZUh5ZHJvZ2VuQXRvbSIsIk1vZGVsc09mVGhlSHlkcm9nZW5BdG9tU3RyaW5ncyIsIkh5ZHJvZ2VuQXRvbSIsIk1PVEhBVXRpbHMiLCJVdGlscyIsIkVsZWN0cm9uIiwiRGVyaXZlZFByb3BlcnR5IiwiQm9vbGVhbklPIiwiUHJvdG9uIiwiRUxFQ1RST05fRElTVEFOQ0UiLCJFTEVDVFJPTl9ESVNUQU5DRV9ERUxUQSIsIk1JTl9FTEVDVFJPTl9ESVNUQU5DRSIsIkVMRUNUUk9OX0FOR0xFX0RFTFRBIiwidG9SYWRpYW5zIiwiRUxFQ1RST05fQUNDRUxFUkFUSU9OIiwiQ2xhc3NpY2FsU29sYXJTeXN0ZW1Nb2RlbCIsImNvbnN0cnVjdG9yIiwiem9vbWVkSW5Cb3giLCJwcm92aWRlZE9wdGlvbnMiLCJvcHRpb25zIiwiZGlzcGxheU5hbWVQcm9wZXJ0eSIsImNsYXNzaWNhbFNvbGFyU3lzdGVtU3RyaW5nUHJvcGVydHkiLCJpY29uSFRNTEltYWdlRWxlbWVudCIsImhhc1RyYW5zaXRpb25XYXZlbGVuZ3RocyIsInByb3RvbiIsInBvc2l0aW9uIiwidGFuZGVtIiwiY3JlYXRlVGFuZGVtIiwiZWxlY3Ryb24iLCJlbGVjdHJvbkRpc3RhbmNlUHJvcGVydHkiLCJlbGVjdHJvbkFuZ2xlUHJvcGVydHkiLCJuZXh0QW5nbGUiLCJlbGVjdHJvbk9mZnNldFByb3BlcnR5IiwiZGlzdGFuY2UiLCJhbmdsZSIsInBvbGFyVG9DYXJ0ZXNpYW4iLCJwaGV0aW9WYWx1ZVR5cGUiLCJWZWN0b3IySU8iLCJsaW5rIiwiZWxlY3Ryb25PZmZzZXQiLCJwb3NpdGlvblByb3BlcnR5IiwidmFsdWUiLCJwbHVzIiwiZWxlY3Ryb25BbmdsZURlbHRhUHJvcGVydHkiLCJpc0Rlc3Ryb3llZFByb3BlcnR5IiwiZWxlY3Ryb25EaXN0YW5jZSIsImRpc3Bvc2UiLCJhc3NlcnQiLCJyZXNldCIsInN0ZXAiLCJkdCIsIm5ld0VsZWN0cm9uRGlzdGFuY2UiLCJtb3ZlUGhvdG9uIiwicGhvdG9uIiwibW92ZSIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiQ2xhc3NpY2FsU29sYXJTeXN0ZW1Nb2RlbC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOS0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBDbGFzc2ljYWxTb2xhclN5c3RlbU1vZGVsIGlzIGEgcHJlZGljdGl2ZSBtb2RlbCBvZiB0aGUgaHlkcm9nZW4gYXRvbS5cclxuICpcclxuICogUGh5c2ljYWwgcmVwcmVzZW50YXRpb246XHJcbiAqIFByb3RvbiBhdCB0aGUgY2VudGVyLCBlbGVjdHJvbiBzcGlyYWxzIHRvd2FyZHMgdGhlIHByb3Rvbi4gT3VyIHNwaXJhbCBpcyBjbG9ja3dpc2UgdG8gYmUgY29uc2lzdGVudCB3aXRoIGFsbCBvdGhlclxyXG4gKiBvcmJpdHMgaW4gdGhpcyBzaW0uIFRoZSBlbGVjdHJvbiBzdGFydHMgYXQgYSBmaXhlZCBkaXN0YW5jZSBhbmQgcmFuZG9tIGFuZ2xlIGZyb20gdGhlIHByb3Rvbi4gVGhlIHJhZGl1cyBvZiB0aGVcclxuICogc3BpcmFsIGRlY3JlYXNlcyBsaW5lYXJseSBhbmQgdGhlIGVsZWN0cm9uIGFjY2VsZXJhdGVzIGFzIHRoZSBlbGVjdHJvbiBtb3ZlcyBjbG9zZXIgdG8gdGhlIHByb3Rvbi4gVGhlIGZpbmFsIHN0YXRlXHJcbiAqIHNob3dzIHRoZSBlbGVjdHJvbiBvbiB0b3Agb2YgdGhlIHByb3Rvbi4gSW4gdGhpcyBmaW5hbCBzdGF0ZSwgdGhlIGF0b20gaXMgY29uc2lkZXJlZCBcImRlc3Ryb3llZFwiLlxyXG4gKlxyXG4gKiBDb2xsaXNpb24gYmVoYXZpb3I6XHJcbiAqIFRoZSBzcGlyYWxpbmcgYmVoYXZpb3Igc2hvdWxkIG9jY3VyIGZhc3QgZW5vdWdoIHNvIHRoYXQgdGhlIGF0b20gaXMgIGRlc3Ryb3llZCBiZWZvcmUgYW55IHBob3RvbnMgcmVhY2ggaXQuXHJcbiAqIFRoZXJlZm9yZSwgdGhlcmUgYXJlIG5vIGNvbGxpc2lvbnMuXHJcbiAqXHJcbiAqIEFic29ycHRpb24gYmVoYXZpb3I6XHJcbiAqIEF0b20gaXMgZGVzdHJveWVkLCBzbyBpdCBkb2VzIG5vdCBhYnNvcmIgcGhvdG9ucy5cclxuICpcclxuICogRW1pc3Npb24gYmVoYXZpb3I6XHJcbiAqIEF0b20gaXMgZGVzdHJveWVkLCBzbyBpdCBkb2VzIG5vdCBlbWl0IHBob3RvbnMuXHJcbiAqXHJcbiAqIEBhdXRob3IgQ2hyaXMgTWFsbGV5IChQaXhlbFpvb20sIEluYy4pXHJcbiAqL1xyXG5cclxuaW1wb3J0IE51bWJlclByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvTnVtYmVyUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCBvcHRpb25pemUsIHsgRW1wdHlTZWxmT3B0aW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9vcHRpb25pemUuanMnO1xyXG5pbXBvcnQgU3RyaWN0T21pdCBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvdHlwZXMvU3RyaWN0T21pdC5qcyc7XHJcbmltcG9ydCBjbGFzc2ljYWxTb2xhclN5c3RlbUJ1dHRvbl9wbmcgZnJvbSAnLi4vLi4vLi4vaW1hZ2VzL2NsYXNzaWNhbFNvbGFyU3lzdGVtQnV0dG9uX3BuZy5qcyc7XHJcbmltcG9ydCBtb2RlbHNPZlRoZUh5ZHJvZ2VuQXRvbSBmcm9tICcuLi8uLi9tb2RlbHNPZlRoZUh5ZHJvZ2VuQXRvbS5qcyc7XHJcbmltcG9ydCBNb2RlbHNPZlRoZUh5ZHJvZ2VuQXRvbVN0cmluZ3MgZnJvbSAnLi4vLi4vTW9kZWxzT2ZUaGVIeWRyb2dlbkF0b21TdHJpbmdzLmpzJztcclxuaW1wb3J0IEh5ZHJvZ2VuQXRvbSwgeyBIeWRyb2dlbkF0b21PcHRpb25zIH0gZnJvbSAnLi9IeWRyb2dlbkF0b20uanMnO1xyXG5pbXBvcnQgWm9vbWVkSW5Cb3ggZnJvbSAnLi9ab29tZWRJbkJveC5qcyc7XHJcbmltcG9ydCBNT1RIQVV0aWxzIGZyb20gJy4uL01PVEhBVXRpbHMuanMnO1xyXG5pbXBvcnQgVXRpbHMgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL1V0aWxzLmpzJztcclxuaW1wb3J0IEVsZWN0cm9uIGZyb20gJy4vRWxlY3Ryb24uanMnO1xyXG5pbXBvcnQgRGVyaXZlZFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvRGVyaXZlZFByb3BlcnR5LmpzJztcclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgVFJlYWRPbmx5UHJvcGVydHkgZnJvbSAnLi4vLi4vLi4vLi4vYXhvbi9qcy9UUmVhZE9ubHlQcm9wZXJ0eS5qcyc7XHJcbmltcG9ydCBCb29sZWFuSU8gZnJvbSAnLi4vLi4vLi4vLi4vdGFuZGVtL2pzL3R5cGVzL0Jvb2xlYW5JTy5qcyc7XHJcbmltcG9ydCBQcm90b24gZnJvbSAnLi9Qcm90b24uanMnO1xyXG5pbXBvcnQgUGhvdG9uIGZyb20gJy4vUGhvdG9uLmpzJztcclxuXHJcbmNvbnN0IEVMRUNUUk9OX0RJU1RBTkNFID0gMTUwOyAvLyBpbml0aWFsIGRpc3RhbmNlIGZyb20gZWxlY3Ryb24gdG8gcHJvdG9uXHJcbmNvbnN0IEVMRUNUUk9OX0RJU1RBTkNFX0RFTFRBID0gMjIwOyAvLyBhbW91bnQgdGhlIGRpc3RhbmNlIGJldHdlZW4gdGhlIHByb3RvbiBhbmQgZWxlY3Ryb24gaXMgcmVkdWNlZCBwZXIgc2Vjb25kXHJcbmNvbnN0IE1JTl9FTEVDVFJPTl9ESVNUQU5DRSA9IDU7IC8vIGFueSBkaXN0YW5jZSBzbWFsbGVyIHRoYW4gdGhpcyBpcyBlZmZlY3RpdmVseSB6ZXJvXHJcbmNvbnN0IEVMRUNUUk9OX0FOR0xFX0RFTFRBID0gVXRpbHMudG9SYWRpYW5zKCA2MDAgKTsgLy8gaW5pdGlhbCBjaGFuZ2UgaW4gZWxlY3Ryb24ncyByb3RhdGlvbiBhbmdsZSBwZXIgc2Vjb25kXHJcbmNvbnN0IEVMRUNUUk9OX0FDQ0VMRVJBVElPTiA9IDEuMDA4OyAvLyBzY2FsaW5nIG9mIGVsZWN0cm9uQW5nbGVEZWx0YVByb3BlcnR5IGVhY2ggdGltZSBzdGVwIGlzIGNhbGxlZFxyXG5cclxudHlwZSBTZWxmT3B0aW9ucyA9IEVtcHR5U2VsZk9wdGlvbnM7XHJcblxyXG50eXBlIENsYXNzaWNhbFNvbGFyU3lzdGVtTW9kZWxPcHRpb25zID0gU2VsZk9wdGlvbnMgJlxyXG4gIFN0cmljdE9taXQ8SHlkcm9nZW5BdG9tT3B0aW9ucywgJ2Rpc3BsYXlOYW1lUHJvcGVydHknIHwgJ2ljb25IVE1MSW1hZ2VFbGVtZW50JyB8ICdoYXNUcmFuc2l0aW9uV2F2ZWxlbmd0aHMnPjtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENsYXNzaWNhbFNvbGFyU3lzdGVtTW9kZWwgZXh0ZW5kcyBIeWRyb2dlbkF0b20ge1xyXG5cclxuICBwdWJsaWMgcmVhZG9ubHkgcHJvdG9uOiBQcm90b247XHJcbiAgcHVibGljIHJlYWRvbmx5IGVsZWN0cm9uOiBFbGVjdHJvbjtcclxuXHJcbiAgLy8gb2Zmc2V0IG9mIHRoZSBlbGVjdHJvbiByZWxhdGl2ZSB0byB0aGUgYXRvbSdzIHBvc2l0aW9uXHJcbiAgcHJpdmF0ZSByZWFkb25seSBlbGVjdHJvbk9mZnNldFByb3BlcnR5OiBUUmVhZE9ubHlQcm9wZXJ0eTxWZWN0b3IyPjtcclxuXHJcbiAgLy8gZGlzdGFuY2UgYmV0d2VlbiBlbGVjdHJvbiBhbmQgcHJvdG9uXHJcbiAgcHJpdmF0ZSByZWFkb25seSBlbGVjdHJvbkRpc3RhbmNlUHJvcGVydHk6IFByb3BlcnR5PG51bWJlcj47XHJcblxyXG4gIC8vIGluIHJhZGlhbnNcclxuICBwcml2YXRlIHJlYWRvbmx5IGVsZWN0cm9uQW5nbGVQcm9wZXJ0eTogUHJvcGVydHk8bnVtYmVyPjtcclxuXHJcbiAgLy8gaW4gcmFkaWFuc1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgZWxlY3Ryb25BbmdsZURlbHRhUHJvcGVydHk6IFByb3BlcnR5PG51bWJlcj47XHJcblxyXG4gIC8vIEhhcyB0aGUgYXRvbSBiZWVuIGRlc3Ryb3llZD9cclxuICBwdWJsaWMgcmVhZG9ubHkgaXNEZXN0cm95ZWRQcm9wZXJ0eTogVFJlYWRPbmx5UHJvcGVydHk8Ym9vbGVhbj47XHJcblxyXG4gIHB1YmxpYyBjb25zdHJ1Y3Rvciggem9vbWVkSW5Cb3g6IFpvb21lZEluQm94LCBwcm92aWRlZE9wdGlvbnM6IENsYXNzaWNhbFNvbGFyU3lzdGVtTW9kZWxPcHRpb25zICkge1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnMgPSBvcHRpb25pemU8Q2xhc3NpY2FsU29sYXJTeXN0ZW1Nb2RlbE9wdGlvbnMsIFNlbGZPcHRpb25zLCBIeWRyb2dlbkF0b21PcHRpb25zPigpKCB7XHJcblxyXG4gICAgICAvLyBIeWRyb2dlbkF0b21PcHRpb25zXHJcbiAgICAgIGRpc3BsYXlOYW1lUHJvcGVydHk6IE1vZGVsc09mVGhlSHlkcm9nZW5BdG9tU3RyaW5ncy5jbGFzc2ljYWxTb2xhclN5c3RlbVN0cmluZ1Byb3BlcnR5LFxyXG4gICAgICBpY29uSFRNTEltYWdlRWxlbWVudDogY2xhc3NpY2FsU29sYXJTeXN0ZW1CdXR0b25fcG5nLFxyXG4gICAgICBoYXNUcmFuc2l0aW9uV2F2ZWxlbmd0aHM6IGZhbHNlXHJcbiAgICB9LCBwcm92aWRlZE9wdGlvbnMgKTtcclxuXHJcbiAgICBzdXBlciggem9vbWVkSW5Cb3gsIG9wdGlvbnMgKTtcclxuXHJcbiAgICB0aGlzLnByb3RvbiA9IG5ldyBQcm90b24oIHtcclxuICAgICAgcG9zaXRpb246IHRoaXMucG9zaXRpb24sXHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAncHJvdG9uJyApXHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5lbGVjdHJvbiA9IG5ldyBFbGVjdHJvbigge1xyXG4gICAgICAvL1RPRE8gcG9zaXRpb24gaXMgbm90IHByb3Blcmx5IGluaXRpYWxpemVkXHJcbiAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnZWxlY3Ryb24nIClcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLmVsZWN0cm9uRGlzdGFuY2VQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggRUxFQ1RST05fRElTVEFOQ0UsIHtcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdlbGVjdHJvbkRpc3RhbmNlUHJvcGVydHknIClcclxuICAgIH0gKTtcclxuXHJcbiAgICAvL1RPRE8gd2Ugd2FudCB0aGlzIHRvIHN0YXJ0IGF0IGEgZGlmZmVyZW50IGFuZ2xlIGVhY2ggdGltZSByZXNldCwgYnV0IHRoYXQgY29uZmxpY3RzIHdpdGggUGhFVC1pT1xyXG4gICAgdGhpcy5lbGVjdHJvbkFuZ2xlUHJvcGVydHkgPSBuZXcgTnVtYmVyUHJvcGVydHkoIE1PVEhBVXRpbHMubmV4dEFuZ2xlKCksIHtcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdlbGVjdHJvbkFuZ2xlUHJvcGVydHknIClcclxuICAgIH0gKTtcclxuXHJcbiAgICAvL1RPRE8gbWFrZSB0aGlzIGdvIGF3YXksIGp1c3Qgc2V0IGVsZWN0cm9uLnBvc2l0aW9uUHJvcGVydHkgZGlyZWN0bHlcclxuICAgIHRoaXMuZWxlY3Ryb25PZmZzZXRQcm9wZXJ0eSA9IG5ldyBEZXJpdmVkUHJvcGVydHkoXHJcbiAgICAgIFsgdGhpcy5lbGVjdHJvbkRpc3RhbmNlUHJvcGVydHksIHRoaXMuZWxlY3Ryb25BbmdsZVByb3BlcnR5IF0sXHJcbiAgICAgICggZGlzdGFuY2UsIGFuZ2xlICkgPT4gTU9USEFVdGlscy5wb2xhclRvQ2FydGVzaWFuKCBkaXN0YW5jZSwgYW5nbGUgKSwge1xyXG4gICAgICAgIHRhbmRlbTogb3B0aW9ucy50YW5kZW0uY3JlYXRlVGFuZGVtKCAnZWxlY3Ryb25PZmZzZXRQcm9wZXJ0eScgKSxcclxuICAgICAgICBwaGV0aW9WYWx1ZVR5cGU6IFZlY3RvcjIuVmVjdG9yMklPXHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLmVsZWN0cm9uT2Zmc2V0UHJvcGVydHkubGluayggZWxlY3Ryb25PZmZzZXQgPT4ge1xyXG4gICAgICB0aGlzLmVsZWN0cm9uLnBvc2l0aW9uUHJvcGVydHkudmFsdWUgPSB0aGlzLnBvc2l0aW9uLnBsdXMoIGVsZWN0cm9uT2Zmc2V0ICk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5lbGVjdHJvbkFuZ2xlRGVsdGFQcm9wZXJ0eSA9IG5ldyBOdW1iZXJQcm9wZXJ0eSggRUxFQ1RST05fQU5HTEVfREVMVEEsIHtcclxuICAgICAgdGFuZGVtOiBvcHRpb25zLnRhbmRlbS5jcmVhdGVUYW5kZW0oICdlbGVjdHJvbkFuZ2xlRGVsdGFQcm9wZXJ0eScgKVxyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIFRoZSBhdG9tIGlzIGRlc3Ryb3llZCB3aGVuIHRoZSBlbGVjdHJvbiBoaXRzIHRoZSBwcm90b24uXHJcbiAgICB0aGlzLmlzRGVzdHJveWVkUHJvcGVydHkgPSBuZXcgRGVyaXZlZFByb3BlcnR5KCBbIHRoaXMuZWxlY3Ryb25EaXN0YW5jZVByb3BlcnR5IF0sXHJcbiAgICAgIGVsZWN0cm9uRGlzdGFuY2UgPT4gKCBlbGVjdHJvbkRpc3RhbmNlID09PSAwICksIHtcclxuICAgICAgICB0YW5kZW06IG9wdGlvbnMudGFuZGVtLmNyZWF0ZVRhbmRlbSggJ2lzRGVzdHJveWVkUHJvcGVydHknICksXHJcbiAgICAgICAgcGhldGlvVmFsdWVUeXBlOiBCb29sZWFuSU9cclxuICAgICAgfSApO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIG92ZXJyaWRlIGRpc3Bvc2UoKTogdm9pZCB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBmYWxzZSwgJ2Rpc3Bvc2UgaXMgbm90IHN1cHBvcnRlZCwgZXhpc3RzIGZvciB0aGUgbGlmZXRpbWUgb2YgdGhlIHNpbScgKTtcclxuICAgIHN1cGVyLmRpc3Bvc2UoKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBvdmVycmlkZSByZXNldCgpOiB2b2lkIHtcclxuICAgIHRoaXMucHJvdG9uLnJlc2V0KCk7XHJcbiAgICB0aGlzLmVsZWN0cm9uLnJlc2V0KCk7XHJcbiAgICB0aGlzLmVsZWN0cm9uRGlzdGFuY2VQcm9wZXJ0eS5yZXNldCgpO1xyXG4gICAgdGhpcy5lbGVjdHJvbkFuZ2xlUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHRoaXMuZWxlY3Ryb25BbmdsZURlbHRhUHJvcGVydHkucmVzZXQoKTtcclxuICAgIHN1cGVyLnJlc2V0KCk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgb3ZlcnJpZGUgc3RlcCggZHQ6IG51bWJlciApOiB2b2lkIHtcclxuICAgIGlmICggIXRoaXMuaXNEZXN0cm95ZWRQcm9wZXJ0eS52YWx1ZSApIHtcclxuXHJcbiAgICAgIC8vIGRlY3JlbWVudCB0aGUgb3JiaXQgYW5nbGUsIHNvIHRoZSBvcmJpdCBpcyBjbG9ja3dpc2VcclxuICAgICAgdGhpcy5lbGVjdHJvbkFuZ2xlUHJvcGVydHkudmFsdWUgLT0gKCB0aGlzLmVsZWN0cm9uQW5nbGVEZWx0YVByb3BlcnR5LnZhbHVlICogZHQgKTtcclxuXHJcbiAgICAgIC8vIGluY3JlYXNlIHRoZSByYXRlIG9mIGNoYW5nZSBvZiB0aGUgb3JiaXQgYW5nbGVcclxuICAgICAgdGhpcy5lbGVjdHJvbkFuZ2xlRGVsdGFQcm9wZXJ0eS52YWx1ZSAqPSBFTEVDVFJPTl9BQ0NFTEVSQVRJT047XHJcblxyXG4gICAgICAvLyBkZWNyZWFzZSB0aGUgZWxlY3Ryb24ncyBkaXN0YW5jZSBmcm9tIHRoZSBwcm90b25cclxuICAgICAgbGV0IG5ld0VsZWN0cm9uRGlzdGFuY2UgPSB0aGlzLmVsZWN0cm9uRGlzdGFuY2VQcm9wZXJ0eS52YWx1ZSAtICggRUxFQ1RST05fRElTVEFOQ0VfREVMVEEgKiBkdCApO1xyXG4gICAgICBpZiAoIG5ld0VsZWN0cm9uRGlzdGFuY2UgPD0gTUlOX0VMRUNUUk9OX0RJU1RBTkNFICkge1xyXG4gICAgICAgIG5ld0VsZWN0cm9uRGlzdGFuY2UgPSAwO1xyXG4gICAgICB9XHJcbiAgICAgIHRoaXMuZWxlY3Ryb25EaXN0YW5jZVByb3BlcnR5LnZhbHVlID0gbmV3RWxlY3Ryb25EaXN0YW5jZTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBvdmVycmlkZSBtb3ZlUGhvdG9uKCBwaG90b246IFBob3RvbiwgZHQ6IG51bWJlciApOiB2b2lkIHtcclxuICAgIHBob3Rvbi5tb3ZlKCBkdCApO1xyXG4gIH1cclxufVxyXG5cclxubW9kZWxzT2ZUaGVIeWRyb2dlbkF0b20ucmVnaXN0ZXIoICdDbGFzc2ljYWxTb2xhclN5c3RlbU1vZGVsJywgQ2xhc3NpY2FsU29sYXJTeXN0ZW1Nb2RlbCApOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLGNBQWMsTUFBTSx1Q0FBdUM7QUFDbEUsT0FBT0MsT0FBTyxNQUFNLCtCQUErQjtBQUNuRCxPQUFPQyxTQUFTLE1BQTRCLHVDQUF1QztBQUVuRixPQUFPQyw4QkFBOEIsTUFBTSxtREFBbUQ7QUFDOUYsT0FBT0MsdUJBQXVCLE1BQU0sa0NBQWtDO0FBQ3RFLE9BQU9DLDhCQUE4QixNQUFNLHlDQUF5QztBQUNwRixPQUFPQyxZQUFZLE1BQStCLG1CQUFtQjtBQUVyRSxPQUFPQyxVQUFVLE1BQU0sa0JBQWtCO0FBQ3pDLE9BQU9DLEtBQUssTUFBTSw2QkFBNkI7QUFDL0MsT0FBT0MsUUFBUSxNQUFNLGVBQWU7QUFDcEMsT0FBT0MsZUFBZSxNQUFNLHdDQUF3QztBQUdw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