// Copyright 2014-2022, University of Colorado Boulder

/**
 * Scene graph for the 'Faraday's Law' screen.
 *
 * @author Vasily Shakhov (MLearner)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import { Node } from '../../../../scenery/js/imports.js';
import boundaryReachedSoundPlayer from '../../../../tambo/js/shared-sound-players/boundaryReachedSoundPlayer.js';
import SoundClip from '../../../../tambo/js/sound-generators/SoundClip.js';
import soundManager from '../../../../tambo/js/soundManager.js';
import coilBumpHigh_mp3 from '../../../sounds/coilBumpHigh_mp3.js';
import coilBumpLow_mp3 from '../../../sounds/coilBumpLow_mp3.js';
import faradaysLaw from '../../faradaysLaw.js';
import FaradaysLawStrings from '../../FaradaysLawStrings.js';
import FaradaysLawConstants from '../FaradaysLawConstants.js';
import BulbNode from './BulbNode.js';
import CircuitDescriptionNode from './CircuitDescriptionNode.js';
import CoilNode from './CoilNode.js';
import CoilsWiresNode from './CoilsWiresNode.js';
import CoilTypeEnum from './CoilTypeEnum.js';
import ControlPanelNode from './ControlPanelNode.js';
import MagnetNodeWithField from './MagnetNodeWithField.js';
import VoltageSoundGenerator from './VoltageSoundGenerator.js';
import VoltmeterAndWiresNode from './VoltmeterAndWiresNode.js';

// constants
const summaryDescriptionString = FaradaysLawStrings.a11y.summaryDescription;
const moveMagnetToPlayString = FaradaysLawStrings.a11y.moveMagnetToPlay;
const COIL_BUMP_SOUND_LEVEL = 0.25;
class FaradaysLawScreenView extends ScreenView {
  /**
   * @param {FaradaysLawModel} model
   * @param {Tandem} tandem
   */
  constructor(model, tandem) {
    // pdom - screen Summary
    const summaryNode = new Node();
    summaryNode.addChild(new Node({
      tagName: 'p',
      innerContent: summaryDescriptionString
    }));
    summaryNode.addChild(new Node({
      tagName: 'p',
      innerContent: moveMagnetToPlayString
    }));
    super({
      layoutBounds: FaradaysLawConstants.LAYOUT_BOUNDS,
      screenSummaryContent: summaryNode,
      tandem: tandem
    });
    const circuitDescriptionNode = new CircuitDescriptionNode(model);
    this.addChild(circuitDescriptionNode);

    // coils
    const bottomCoilNode = new CoilNode(CoilTypeEnum.FOUR_COIL, {
      x: model.bottomCoil.position.x,
      y: model.bottomCoil.position.y
    });
    const topCoilNode = new CoilNode(CoilTypeEnum.TWO_COIL, {
      x: model.topCoil.position.x,
      y: model.topCoil.position.y
    });

    // @public {Vector2[]}
    this.bottomCoilEndPositions = {
      topEnd: bottomCoilNode.endRelativePositions.topEnd.plus(model.bottomCoil.position),
      bottomEnd: bottomCoilNode.endRelativePositions.bottomEnd.plus(model.bottomCoil.position)
    };

    // @public {Vector2[]}
    this.topCoilEndPositions = {
      topEnd: topCoilNode.endRelativePositions.topEnd.plus(model.topCoil.position),
      bottomEnd: topCoilNode.endRelativePositions.bottomEnd.plus(model.topCoil.position)
    };

    // voltmeter and bulb created
    const voltmeterAndWiresNode = new VoltmeterAndWiresNode(model.voltmeter.needleAngleProperty, tandem.createTandem('voltmeterNode'));
    const bulbNode = new BulbNode(model.voltageProperty, {
      center: FaradaysLawConstants.BULB_POSITION
    });

    // wires
    this.addChild(new CoilsWiresNode(this, model.topCoilVisibleProperty));

    // exists for the lifetime of the sim, no need to dispose
    model.voltmeterVisibleProperty.link(showVoltmeter => {
      voltmeterAndWiresNode.visible = showVoltmeter;
    });

    // When PhET-iO Studio makes the voltmeter invisible, we should also uncheck the checkbox.
    voltmeterAndWiresNode.visibleProperty.lazyLink(() => {
      model.voltmeterVisibleProperty.value = voltmeterAndWiresNode.visible;
    });

    // bulb added
    this.addChild(bulbNode);

    // coils added
    this.addChild(bottomCoilNode);
    this.addChild(topCoilNode);
    model.topCoilVisibleProperty.linkAttribute(topCoilNode, 'visible');

    // control panel
    const controlPanel = new ControlPanelNode(model, tandem);
    this.addChild(controlPanel);

    // voltmeter added
    this.addChild(voltmeterAndWiresNode);

    // @private
    this.magnetNodeWithField = new MagnetNodeWithField(model, tandem.createTandem('magnetNode'));
    this.addChild(this.magnetNodeWithField);
    this.pdomPlayAreaNode.pdomOrder = [circuitDescriptionNode, this.magnetNodeWithField];
    this.pdomControlAreaNode.pdomOrder = [controlPanel];

    // move coils to front
    bottomCoilNode.frontImage.detach();
    this.addChild(bottomCoilNode.frontImage);
    bottomCoilNode.frontImage.center = model.bottomCoil.position.plus(new Vector2(CoilNode.xOffset, 0));
    topCoilNode.frontImage.detach();
    this.addChild(topCoilNode.frontImage);
    topCoilNode.frontImage.center = model.topCoil.position.plus(new Vector2(CoilNode.xOffset + CoilNode.twoOffset, 0));
    model.topCoilVisibleProperty.linkAttribute(topCoilNode.frontImage, 'visible');

    // ------------------------------------------------------------------------------------------------------------------
    // sound generation
    // ------------------------------------------------------------------------------------------------------------------

    // sounds for when the magnet bumps into the coils
    const lowerCoilBumpSoundClip = new SoundClip(coilBumpLow_mp3, {
      initialOutputLevel: COIL_BUMP_SOUND_LEVEL
    });
    soundManager.addSoundGenerator(lowerCoilBumpSoundClip);
    const upperCoilBumpSoundClip = new SoundClip(coilBumpHigh_mp3, {
      initialOutputLevel: COIL_BUMP_SOUND_LEVEL
    });
    soundManager.addSoundGenerator(upperCoilBumpSoundClip);
    model.coilBumpEmitter.addListener(coilType => {
      coilType === CoilTypeEnum.FOUR_COIL ? lowerCoilBumpSoundClip.play() : upperCoilBumpSoundClip.play();
    });
    model.edgeBumpEmitter.addListener(() => {
      boundaryReachedSoundPlayer.play();
    });

    // sound generation for voltage
    soundManager.addSoundGenerator(new VoltageSoundGenerator(model.voltageProperty));
  }
}
faradaysLaw.register('FaradaysLawScreenView', FaradaysLawScreenView);
export default FaradaysLawScreenView;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWZWN0b3IyIiwiU2NyZWVuVmlldyIsIk5vZGUiLCJib3VuZGFyeVJlYWNoZWRTb3VuZFBsYXllciIsIlNvdW5kQ2xpcCIsInNvdW5kTWFuYWdlciIsImNvaWxCdW1wSGlnaF9tcDMiLCJjb2lsQnVtcExvd19tcDMiLCJmYXJhZGF5c0xhdyIsIkZhcmFkYXlzTGF3U3RyaW5ncyIsIkZhcmFkYXlzTGF3Q29uc3RhbnRzIiwiQnVsYk5vZGUiLCJDaXJjdWl0RGVzY3JpcHRpb25Ob2RlIiwiQ29pbE5vZGUiLCJDb2lsc1dpcmVzTm9kZSIsIkNvaWxUeXBlRW51bSIsIkNvbnRyb2xQYW5lbE5vZGUiLCJNYWduZXROb2RlV2l0aEZpZWxkIiwiVm9sdGFnZVNvdW5kR2VuZXJhdG9yIiwiVm9sdG1ldGVyQW5kV2lyZXNOb2RlIiwic3VtbWFyeURlc2NyaXB0aW9uU3RyaW5nIiwiYTExeSIsInN1bW1hcnlEZXNjcmlwdGlvbiIsIm1vdmVNYWduZXRUb1BsYXlTdHJpbmciLCJtb3ZlTWFnbmV0VG9QbGF5IiwiQ09JTF9CVU1QX1NPVU5EX0xFVkVMIiwiRmFyYWRheXNMYXdTY3JlZW5WaWV3IiwiY29uc3RydWN0b3IiLCJtb2RlbCIsInRhbmRlbSIsInN1bW1hcnlOb2RlIiwiYWRkQ2hpbGQiLCJ0YWdOYW1lIiwiaW5uZXJDb250ZW50IiwibGF5b3V0Qm91bmRzIiwiTEFZT1VUX0JPVU5EUyIsInNjcmVlblN1bW1hcnlDb250ZW50IiwiY2lyY3VpdERlc2NyaXB0aW9uTm9kZSIsImJvdHRvbUNvaWxOb2RlIiwiRk9VUl9DT0lMIiwieCIsImJvdHRvbUNvaWwiLCJwb3NpdGlvbiIsInkiLCJ0b3BDb2lsTm9kZSIsIlRXT19DT0lMIiwidG9wQ29pbCIsImJvdHRvbUNvaWxFbmRQb3NpdGlvbnMiLCJ0b3BFbmQiLCJlbmRSZWxhdGl2ZVBvc2l0aW9ucyIsInBsdXMiLCJib3R0b21FbmQiLCJ0b3BDb2lsRW5kUG9zaXRpb25zIiwidm9sdG1ldGVyQW5kV2lyZXNOb2RlIiwidm9sdG1ldGVyIiwibmVlZGxlQW5nbGVQcm9wZXJ0eSIsImNyZWF0ZVRhbmRlbSIsImJ1bGJOb2RlIiwidm9sdGFnZVByb3BlcnR5IiwiY2VudGVyIiwiQlVMQl9QT1NJVElPTiIsInRvcENvaWxWaXNpYmxlUHJvcGVydHkiLCJ2b2x0bWV0ZXJWaXNpYmxlUHJvcGVydHkiLCJsaW5rIiwic2hvd1ZvbHRtZXRlciIsInZpc2libGUiLCJ2aXNpYmxlUHJvcGVydHkiLCJsYXp5TGluayIsInZhbHVlIiwibGlua0F0dHJpYnV0ZSIsImNvbnRyb2xQYW5lbCIsIm1hZ25ldE5vZGVXaXRoRmllbGQiLCJwZG9tUGxheUFyZWFOb2RlIiwicGRvbU9yZGVyIiwicGRvbUNvbnRyb2xBcmVhTm9kZSIsImZyb250SW1hZ2UiLCJkZXRhY2giLCJ4T2Zmc2V0IiwidHdvT2Zmc2V0IiwibG93ZXJDb2lsQnVtcFNvdW5kQ2xpcCIsImluaXRpYWxPdXRwdXRMZXZlbCIsImFkZFNvdW5kR2VuZXJhdG9yIiwidXBwZXJDb2lsQnVtcFNvdW5kQ2xpcCIsImNvaWxCdW1wRW1pdHRlciIsImFkZExpc3RlbmVyIiwiY29pbFR5cGUiLCJwbGF5IiwiZWRnZUJ1bXBFbWl0dGVyIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJGYXJhZGF5c0xhd1NjcmVlblZpZXcuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTQtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogU2NlbmUgZ3JhcGggZm9yIHRoZSAnRmFyYWRheSdzIExhdycgc2NyZWVuLlxyXG4gKlxyXG4gKiBAYXV0aG9yIFZhc2lseSBTaGFraG92IChNTGVhcm5lcilcclxuICogQGF1dGhvciBTYW0gUmVpZCAoUGhFVCBJbnRlcmFjdGl2ZSBTaW11bGF0aW9ucylcclxuICovXHJcblxyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCBTY3JlZW5WaWV3IGZyb20gJy4uLy4uLy4uLy4uL2pvaXN0L2pzL1NjcmVlblZpZXcuanMnO1xyXG5pbXBvcnQgeyBOb2RlIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IGJvdW5kYXJ5UmVhY2hlZFNvdW5kUGxheWVyIGZyb20gJy4uLy4uLy4uLy4uL3RhbWJvL2pzL3NoYXJlZC1zb3VuZC1wbGF5ZXJzL2JvdW5kYXJ5UmVhY2hlZFNvdW5kUGxheWVyLmpzJztcclxuaW1wb3J0IFNvdW5kQ2xpcCBmcm9tICcuLi8uLi8uLi8uLi90YW1iby9qcy9zb3VuZC1nZW5lcmF0b3JzL1NvdW5kQ2xpcC5qcyc7XHJcbmltcG9ydCBzb3VuZE1hbmFnZXIgZnJvbSAnLi4vLi4vLi4vLi4vdGFtYm8vanMvc291bmRNYW5hZ2VyLmpzJztcclxuaW1wb3J0IGNvaWxCdW1wSGlnaF9tcDMgZnJvbSAnLi4vLi4vLi4vc291bmRzL2NvaWxCdW1wSGlnaF9tcDMuanMnO1xyXG5pbXBvcnQgY29pbEJ1bXBMb3dfbXAzIGZyb20gJy4uLy4uLy4uL3NvdW5kcy9jb2lsQnVtcExvd19tcDMuanMnO1xyXG5pbXBvcnQgZmFyYWRheXNMYXcgZnJvbSAnLi4vLi4vZmFyYWRheXNMYXcuanMnO1xyXG5pbXBvcnQgRmFyYWRheXNMYXdTdHJpbmdzIGZyb20gJy4uLy4uL0ZhcmFkYXlzTGF3U3RyaW5ncy5qcyc7XHJcbmltcG9ydCBGYXJhZGF5c0xhd0NvbnN0YW50cyBmcm9tICcuLi9GYXJhZGF5c0xhd0NvbnN0YW50cy5qcyc7XHJcbmltcG9ydCBCdWxiTm9kZSBmcm9tICcuL0J1bGJOb2RlLmpzJztcclxuaW1wb3J0IENpcmN1aXREZXNjcmlwdGlvbk5vZGUgZnJvbSAnLi9DaXJjdWl0RGVzY3JpcHRpb25Ob2RlLmpzJztcclxuaW1wb3J0IENvaWxOb2RlIGZyb20gJy4vQ29pbE5vZGUuanMnO1xyXG5pbXBvcnQgQ29pbHNXaXJlc05vZGUgZnJvbSAnLi9Db2lsc1dpcmVzTm9kZS5qcyc7XHJcbmltcG9ydCBDb2lsVHlwZUVudW0gZnJvbSAnLi9Db2lsVHlwZUVudW0uanMnO1xyXG5pbXBvcnQgQ29udHJvbFBhbmVsTm9kZSBmcm9tICcuL0NvbnRyb2xQYW5lbE5vZGUuanMnO1xyXG5pbXBvcnQgTWFnbmV0Tm9kZVdpdGhGaWVsZCBmcm9tICcuL01hZ25ldE5vZGVXaXRoRmllbGQuanMnO1xyXG5pbXBvcnQgVm9sdGFnZVNvdW5kR2VuZXJhdG9yIGZyb20gJy4vVm9sdGFnZVNvdW5kR2VuZXJhdG9yLmpzJztcclxuaW1wb3J0IFZvbHRtZXRlckFuZFdpcmVzTm9kZSBmcm9tICcuL1ZvbHRtZXRlckFuZFdpcmVzTm9kZS5qcyc7XHJcblxyXG4vLyBjb25zdGFudHNcclxuY29uc3Qgc3VtbWFyeURlc2NyaXB0aW9uU3RyaW5nID0gRmFyYWRheXNMYXdTdHJpbmdzLmExMXkuc3VtbWFyeURlc2NyaXB0aW9uO1xyXG5jb25zdCBtb3ZlTWFnbmV0VG9QbGF5U3RyaW5nID0gRmFyYWRheXNMYXdTdHJpbmdzLmExMXkubW92ZU1hZ25ldFRvUGxheTtcclxuY29uc3QgQ09JTF9CVU1QX1NPVU5EX0xFVkVMID0gMC4yNTtcclxuXHJcbmNsYXNzIEZhcmFkYXlzTGF3U2NyZWVuVmlldyBleHRlbmRzIFNjcmVlblZpZXcge1xyXG5cclxuICAvKipcclxuICAgKiBAcGFyYW0ge0ZhcmFkYXlzTGF3TW9kZWx9IG1vZGVsXHJcbiAgICogQHBhcmFtIHtUYW5kZW19IHRhbmRlbVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBtb2RlbCwgdGFuZGVtICkge1xyXG5cclxuICAgIC8vIHBkb20gLSBzY3JlZW4gU3VtbWFyeVxyXG4gICAgY29uc3Qgc3VtbWFyeU5vZGUgPSBuZXcgTm9kZSgpO1xyXG4gICAgc3VtbWFyeU5vZGUuYWRkQ2hpbGQoIG5ldyBOb2RlKCB7IHRhZ05hbWU6ICdwJywgaW5uZXJDb250ZW50OiBzdW1tYXJ5RGVzY3JpcHRpb25TdHJpbmcgfSApICk7XHJcbiAgICBzdW1tYXJ5Tm9kZS5hZGRDaGlsZCggbmV3IE5vZGUoIHsgdGFnTmFtZTogJ3AnLCBpbm5lckNvbnRlbnQ6IG1vdmVNYWduZXRUb1BsYXlTdHJpbmcgfSApICk7XHJcblxyXG4gICAgc3VwZXIoIHtcclxuICAgICAgbGF5b3V0Qm91bmRzOiBGYXJhZGF5c0xhd0NvbnN0YW50cy5MQVlPVVRfQk9VTkRTLFxyXG4gICAgICBzY3JlZW5TdW1tYXJ5Q29udGVudDogc3VtbWFyeU5vZGUsXHJcbiAgICAgIHRhbmRlbTogdGFuZGVtXHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgY2lyY3VpdERlc2NyaXB0aW9uTm9kZSA9IG5ldyBDaXJjdWl0RGVzY3JpcHRpb25Ob2RlKCBtb2RlbCApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggY2lyY3VpdERlc2NyaXB0aW9uTm9kZSApO1xyXG5cclxuICAgIC8vIGNvaWxzXHJcbiAgICBjb25zdCBib3R0b21Db2lsTm9kZSA9IG5ldyBDb2lsTm9kZSggQ29pbFR5cGVFbnVtLkZPVVJfQ09JTCwge1xyXG4gICAgICB4OiBtb2RlbC5ib3R0b21Db2lsLnBvc2l0aW9uLngsXHJcbiAgICAgIHk6IG1vZGVsLmJvdHRvbUNvaWwucG9zaXRpb24ueVxyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbnN0IHRvcENvaWxOb2RlID0gbmV3IENvaWxOb2RlKCBDb2lsVHlwZUVudW0uVFdPX0NPSUwsIHtcclxuICAgICAgeDogbW9kZWwudG9wQ29pbC5wb3NpdGlvbi54LFxyXG4gICAgICB5OiBtb2RlbC50b3BDb2lsLnBvc2l0aW9uLnlcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBAcHVibGljIHtWZWN0b3IyW119XHJcbiAgICB0aGlzLmJvdHRvbUNvaWxFbmRQb3NpdGlvbnMgPSB7XHJcbiAgICAgIHRvcEVuZDogYm90dG9tQ29pbE5vZGUuZW5kUmVsYXRpdmVQb3NpdGlvbnMudG9wRW5kLnBsdXMoIG1vZGVsLmJvdHRvbUNvaWwucG9zaXRpb24gKSxcclxuICAgICAgYm90dG9tRW5kOiBib3R0b21Db2lsTm9kZS5lbmRSZWxhdGl2ZVBvc2l0aW9ucy5ib3R0b21FbmQucGx1cyggbW9kZWwuYm90dG9tQ29pbC5wb3NpdGlvbiApXHJcbiAgICB9O1xyXG5cclxuICAgIC8vIEBwdWJsaWMge1ZlY3RvcjJbXX1cclxuICAgIHRoaXMudG9wQ29pbEVuZFBvc2l0aW9ucyA9IHtcclxuICAgICAgdG9wRW5kOiB0b3BDb2lsTm9kZS5lbmRSZWxhdGl2ZVBvc2l0aW9ucy50b3BFbmQucGx1cyggbW9kZWwudG9wQ29pbC5wb3NpdGlvbiApLFxyXG4gICAgICBib3R0b21FbmQ6IHRvcENvaWxOb2RlLmVuZFJlbGF0aXZlUG9zaXRpb25zLmJvdHRvbUVuZC5wbHVzKCBtb2RlbC50b3BDb2lsLnBvc2l0aW9uIClcclxuICAgIH07XHJcblxyXG4gICAgLy8gdm9sdG1ldGVyIGFuZCBidWxiIGNyZWF0ZWRcclxuICAgIGNvbnN0IHZvbHRtZXRlckFuZFdpcmVzTm9kZSA9IG5ldyBWb2x0bWV0ZXJBbmRXaXJlc05vZGUoIG1vZGVsLnZvbHRtZXRlci5uZWVkbGVBbmdsZVByb3BlcnR5LCB0YW5kZW0uY3JlYXRlVGFuZGVtKCAndm9sdG1ldGVyTm9kZScgKSApO1xyXG4gICAgY29uc3QgYnVsYk5vZGUgPSBuZXcgQnVsYk5vZGUoIG1vZGVsLnZvbHRhZ2VQcm9wZXJ0eSwge1xyXG4gICAgICBjZW50ZXI6IEZhcmFkYXlzTGF3Q29uc3RhbnRzLkJVTEJfUE9TSVRJT05cclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyB3aXJlc1xyXG4gICAgdGhpcy5hZGRDaGlsZCggbmV3IENvaWxzV2lyZXNOb2RlKCB0aGlzLCBtb2RlbC50b3BDb2lsVmlzaWJsZVByb3BlcnR5ICkgKTtcclxuXHJcbiAgICAvLyBleGlzdHMgZm9yIHRoZSBsaWZldGltZSBvZiB0aGUgc2ltLCBubyBuZWVkIHRvIGRpc3Bvc2VcclxuICAgIG1vZGVsLnZvbHRtZXRlclZpc2libGVQcm9wZXJ0eS5saW5rKCBzaG93Vm9sdG1ldGVyID0+IHtcclxuICAgICAgdm9sdG1ldGVyQW5kV2lyZXNOb2RlLnZpc2libGUgPSBzaG93Vm9sdG1ldGVyO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIFdoZW4gUGhFVC1pTyBTdHVkaW8gbWFrZXMgdGhlIHZvbHRtZXRlciBpbnZpc2libGUsIHdlIHNob3VsZCBhbHNvIHVuY2hlY2sgdGhlIGNoZWNrYm94LlxyXG4gICAgdm9sdG1ldGVyQW5kV2lyZXNOb2RlLnZpc2libGVQcm9wZXJ0eS5sYXp5TGluayggKCkgPT4ge1xyXG4gICAgICBtb2RlbC52b2x0bWV0ZXJWaXNpYmxlUHJvcGVydHkudmFsdWUgPSB2b2x0bWV0ZXJBbmRXaXJlc05vZGUudmlzaWJsZTtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBidWxiIGFkZGVkXHJcbiAgICB0aGlzLmFkZENoaWxkKCBidWxiTm9kZSApO1xyXG5cclxuICAgIC8vIGNvaWxzIGFkZGVkXHJcbiAgICB0aGlzLmFkZENoaWxkKCBib3R0b21Db2lsTm9kZSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggdG9wQ29pbE5vZGUgKTtcclxuICAgIG1vZGVsLnRvcENvaWxWaXNpYmxlUHJvcGVydHkubGlua0F0dHJpYnV0ZSggdG9wQ29pbE5vZGUsICd2aXNpYmxlJyApO1xyXG5cclxuICAgIC8vIGNvbnRyb2wgcGFuZWxcclxuICAgIGNvbnN0IGNvbnRyb2xQYW5lbCA9IG5ldyBDb250cm9sUGFuZWxOb2RlKCBtb2RlbCwgdGFuZGVtICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCBjb250cm9sUGFuZWwgKTtcclxuXHJcbiAgICAvLyB2b2x0bWV0ZXIgYWRkZWRcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHZvbHRtZXRlckFuZFdpcmVzTm9kZSApO1xyXG5cclxuICAgIC8vIEBwcml2YXRlXHJcbiAgICB0aGlzLm1hZ25ldE5vZGVXaXRoRmllbGQgPSBuZXcgTWFnbmV0Tm9kZVdpdGhGaWVsZCggbW9kZWwsIHRhbmRlbS5jcmVhdGVUYW5kZW0oICdtYWduZXROb2RlJyApICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCB0aGlzLm1hZ25ldE5vZGVXaXRoRmllbGQgKTtcclxuICAgIHRoaXMucGRvbVBsYXlBcmVhTm9kZS5wZG9tT3JkZXIgPSBbIGNpcmN1aXREZXNjcmlwdGlvbk5vZGUsIHRoaXMubWFnbmV0Tm9kZVdpdGhGaWVsZCBdO1xyXG4gICAgdGhpcy5wZG9tQ29udHJvbEFyZWFOb2RlLnBkb21PcmRlciA9IFsgY29udHJvbFBhbmVsIF07XHJcblxyXG4gICAgLy8gbW92ZSBjb2lscyB0byBmcm9udFxyXG4gICAgYm90dG9tQ29pbE5vZGUuZnJvbnRJbWFnZS5kZXRhY2goKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIGJvdHRvbUNvaWxOb2RlLmZyb250SW1hZ2UgKTtcclxuICAgIGJvdHRvbUNvaWxOb2RlLmZyb250SW1hZ2UuY2VudGVyID0gbW9kZWwuYm90dG9tQ29pbC5wb3NpdGlvbi5wbHVzKCBuZXcgVmVjdG9yMiggQ29pbE5vZGUueE9mZnNldCwgMCApICk7XHJcblxyXG4gICAgdG9wQ29pbE5vZGUuZnJvbnRJbWFnZS5kZXRhY2goKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHRvcENvaWxOb2RlLmZyb250SW1hZ2UgKTtcclxuICAgIHRvcENvaWxOb2RlLmZyb250SW1hZ2UuY2VudGVyID0gbW9kZWwudG9wQ29pbC5wb3NpdGlvbi5wbHVzKCBuZXcgVmVjdG9yMiggQ29pbE5vZGUueE9mZnNldCArIENvaWxOb2RlLnR3b09mZnNldCwgMCApICk7XHJcbiAgICBtb2RlbC50b3BDb2lsVmlzaWJsZVByb3BlcnR5LmxpbmtBdHRyaWJ1dGUoIHRvcENvaWxOb2RlLmZyb250SW1hZ2UsICd2aXNpYmxlJyApO1xyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gc291bmQgZ2VuZXJhdGlvblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgLy8gc291bmRzIGZvciB3aGVuIHRoZSBtYWduZXQgYnVtcHMgaW50byB0aGUgY29pbHNcclxuICAgIGNvbnN0IGxvd2VyQ29pbEJ1bXBTb3VuZENsaXAgPSBuZXcgU291bmRDbGlwKCBjb2lsQnVtcExvd19tcDMsIHsgaW5pdGlhbE91dHB1dExldmVsOiBDT0lMX0JVTVBfU09VTkRfTEVWRUwgfSApO1xyXG4gICAgc291bmRNYW5hZ2VyLmFkZFNvdW5kR2VuZXJhdG9yKCBsb3dlckNvaWxCdW1wU291bmRDbGlwICk7XHJcbiAgICBjb25zdCB1cHBlckNvaWxCdW1wU291bmRDbGlwID0gbmV3IFNvdW5kQ2xpcCggY29pbEJ1bXBIaWdoX21wMywgeyBpbml0aWFsT3V0cHV0TGV2ZWw6IENPSUxfQlVNUF9TT1VORF9MRVZFTCB9ICk7XHJcbiAgICBzb3VuZE1hbmFnZXIuYWRkU291bmRHZW5lcmF0b3IoIHVwcGVyQ29pbEJ1bXBTb3VuZENsaXAgKTtcclxuICAgIG1vZGVsLmNvaWxCdW1wRW1pdHRlci5hZGRMaXN0ZW5lciggY29pbFR5cGUgPT4ge1xyXG4gICAgICBjb2lsVHlwZSA9PT0gQ29pbFR5cGVFbnVtLkZPVVJfQ09JTCA/IGxvd2VyQ29pbEJ1bXBTb3VuZENsaXAucGxheSgpIDogdXBwZXJDb2lsQnVtcFNvdW5kQ2xpcC5wbGF5KCk7XHJcbiAgICB9ICk7XHJcbiAgICBtb2RlbC5lZGdlQnVtcEVtaXR0ZXIuYWRkTGlzdGVuZXIoICgpID0+IHtcclxuICAgICAgYm91bmRhcnlSZWFjaGVkU291bmRQbGF5ZXIucGxheSgpO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIHNvdW5kIGdlbmVyYXRpb24gZm9yIHZvbHRhZ2VcclxuICAgIHNvdW5kTWFuYWdlci5hZGRTb3VuZEdlbmVyYXRvciggbmV3IFZvbHRhZ2VTb3VuZEdlbmVyYXRvciggbW9kZWwudm9sdGFnZVByb3BlcnR5ICkgKTtcclxuICB9XHJcbn1cclxuXHJcbmZhcmFkYXlzTGF3LnJlZ2lzdGVyKCAnRmFyYWRheXNMYXdTY3JlZW5WaWV3JywgRmFyYWRheXNMYXdTY3JlZW5WaWV3ICk7XHJcbmV4cG9ydCBkZWZhdWx0IEZhcmFkYXlzTGF3U2NyZWVuVmlldzsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxPQUFPLE1BQU0sK0JBQStCO0FBQ25ELE9BQU9DLFVBQVUsTUFBTSxvQ0FBb0M7QUFDM0QsU0FBU0MsSUFBSSxRQUFRLG1DQUFtQztBQUN4RCxPQUFPQywwQkFBMEIsTUFBTSx5RUFBeUU7QUFDaEgsT0FBT0MsU0FBUyxNQUFNLG9EQUFvRDtBQUMxRSxPQUFPQyxZQUFZLE1BQU0sc0NBQXNDO0FBQy9ELE9BQU9DLGdCQUFnQixNQUFNLHFDQUFxQztBQUNsRSxPQUFPQyxlQUFlLE1BQU0sb0NBQW9DO0FBQ2hFLE9BQU9DLFdBQVcsTUFBTSxzQkFBc0I7QUFDOUMsT0FBT0Msa0JBQWtCLE1BQU0sNkJBQTZCO0FBQzVELE9BQU9DLG9CQUFvQixNQUFNLDRCQUE0QjtBQUM3RCxPQUFPQyxRQUFRLE1BQU0sZUFBZTtBQUNwQyxPQUFPQyxzQkFBc0IsTUFBTSw2QkFBNkI7QUFDaEUsT0FBT0MsUUFBUSxNQUFNLGVBQWU7QUFDcEMsT0FBT0MsY0FBYyxNQUFNLHFCQUFxQjtBQUNoRCxPQUFPQyxZQUFZLE1BQU0sbUJBQW1CO0FBQzVDLE9BQU9DLGdCQUFnQixNQUFNLHVCQUF1QjtBQUNwRCxPQUFPQyxtQkFBbUIsTUFBTSwwQkFBMEI7QUFDMUQsT0FBT0MscUJBQXFCLE1BQU0sNEJBQTRCO0FBQzlELE9BQU9DLHFCQUFxQixNQUFNLDRCQUE0Qjs7QUFFOUQ7QUFDQSxNQUFNQyx3QkFBd0IsR0FBR1gsa0JBQWtCLENBQUNZLElBQUks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