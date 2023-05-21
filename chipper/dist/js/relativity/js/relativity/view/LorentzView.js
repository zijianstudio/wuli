// Copyright 2023, University of Colorado Boulder

/**
 * TODO Describe this class and its responsibilities.
 *
 * @author Zijian Wang
 */

import { Image, Node } from '../../../../scenery/js/imports.js';
import relativity from '../../relativity.js';
import lorentz from '../../../images/lorentz.js';
export default class LorentzView extends Node {
  //private plane: Plane;
  constructor(option = undefined) {
    if (option) {
      option.children = [new Image(lorentz, {
        scale: 0.3
      })];
    }

    //this.img.setCenterX(0)
    //this.img.setCenterY(0)
    super(option);
  }
}
relativity.register('LorentzView', LorentzView);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJJbWFnZSIsIk5vZGUiLCJyZWxhdGl2aXR5IiwibG9yZW50eiIsIkxvcmVudHpWaWV3IiwiY29uc3RydWN0b3IiLCJvcHRpb24iLCJ1bmRlZmluZWQiLCJjaGlsZHJlbiIsInNjYWxlIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJMb3JlbnR6Vmlldy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogVE9ETyBEZXNjcmliZSB0aGlzIGNsYXNzIGFuZCBpdHMgcmVzcG9uc2liaWxpdGllcy5cclxuICpcclxuICogQGF1dGhvciBaaWppYW4gV2FuZ1xyXG4gKi9cclxuXHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IHtEcmFnTGlzdGVuZXIsIEltYWdlLCBOb2RlLCBOb2RlT3B0aW9uc30gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IHJlbGF0aXZpdHkgZnJvbSAnLi4vLi4vcmVsYXRpdml0eS5qcyc7XHJcbmltcG9ydCBsb3JlbnR6IGZyb20gJy4uLy4uLy4uL2ltYWdlcy9sb3JlbnR6LmpzJztcclxuaW1wb3J0IE1hdHJpeDMgZnJvbSBcIi4uLy4uLy4uLy4uL2RvdC9qcy9NYXRyaXgzLmpzXCI7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBMb3JlbnR6VmlldyBleHRlbmRzIE5vZGUge1xyXG4gICAgLy9wcml2YXRlIHBsYW5lOiBQbGFuZTtcclxuICAgIHB1YmxpYyBjb25zdHJ1Y3RvcihvcHRpb246Tm9kZU9wdGlvbnMgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQpIHtcclxuICAgICAgICBpZihvcHRpb24pe1xyXG4gICAgICAgICAgICBvcHRpb24uY2hpbGRyZW4gPSBbbmV3IEltYWdlKCBsb3JlbnR6LCB7XHJcbiAgICAgICAgICAgICAgICBzY2FsZTogMC4zLFxyXG4gICAgICAgICAgICB9KV1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vdGhpcy5pbWcuc2V0Q2VudGVyWCgwKVxyXG4gICAgICAgIC8vdGhpcy5pbWcuc2V0Q2VudGVyWSgwKVxyXG4gICAgICAgIHN1cGVyKCBvcHRpb24gKTtcclxuICAgIH1cclxufVxyXG5cclxucmVsYXRpdml0eS5yZWdpc3RlcignTG9yZW50elZpZXcnLCBMb3JlbnR6Vmlldyk7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUdBLFNBQXNCQSxLQUFLLEVBQUVDLElBQUksUUFBb0IsbUNBQW1DO0FBQ3hGLE9BQU9DLFVBQVUsTUFBTSxxQkFBcUI7QUFDNUMsT0FBT0MsT0FBTyxNQUFNLDRCQUE0QjtBQUdoRCxlQUFlLE1BQU1DLFdBQVcsU0FBU0gsSUFBSSxDQUFDO0VBQzFDO0VBQ09JLFdBQVdBLENBQUNDLE1BQThCLEdBQUdDLFNBQVMsRUFBRTtJQUMzRCxJQUFHRCxNQUFNLEVBQUM7TUFDTkEsTUFBTSxDQUFDRSxRQUFRLEdBQUcsQ0FBQyxJQUFJUixLQUFLLENBQUVHLE9BQU8sRUFBRTtRQUNuQ00sS0FBSyxFQUFFO01BQ1gsQ0FBQyxDQUFDLENBQUM7SUFDUDs7SUFFQTtJQUNBO0lBQ0EsS0FBSyxDQUFFSCxNQUFPLENBQUM7RUFDbkI7QUFDSjtBQUVBSixVQUFVLENBQUNRLFFBQVEsQ0FBQyxhQUFhLEVBQUVOLFdBQVcsQ0FBQyJ9