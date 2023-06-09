// Copyright 2018-2021, University of Colorado Boulder

/**
 * Manages all alerts for the Faradays Law sim. Creates alert strings and sends them
 * to the UtteranceQueue to be spoken.
 *
 * As of 12/2/20, all sim-specific alerts are being disabled for a publication with only
 * alternative input because the alerts are somewhat unfinished and too frequent. Interactive
 * descriptions are not supported in this release, but we don't want to publish with
 * descriptions that we know would create an unpleasant experience. See
 * https://github.com/phetsims/faradays-law/issues/109
 */

import Alerter from '../../../../scenery-phet/js/accessibility/describers/Alerter.js';
import Utterance from '../../../../utterance-queue/js/Utterance.js';
import faradaysLaw from '../../faradaysLaw.js';
// import MagnetDescriber from './MagnetDescriber.js';

// the alert manager
class FaradaysLawAlertManager extends Alerter {
  constructor(node, describer) {
    super({
      descriptionAlertNode: node
    });
    this.describer = describer;

    // @private {Utterance} - utterance for end of a keyboard movement, single utterance
    // gets added to the utteranceQueue to prevent too many alerts with this content
    this.keyboardMovementUtterance = new Utterance();
  }

  /**
   * @public
   */
  magnetFocusAlert() {
    //const alert = this.describer.magnetFocusAlertText;
    //this.alertDescriptionUtterance( alert );
  }

  /**
   * @public
   */
  movementEndAlert() {
    this.keyboardMovementUtterance.alert = this.describer.magnetMovedAlertText();
    // this.alertDescriptionUtterance(  this.keyboardMovementUtterance );
  }

  /**
   * @public
   * @param {OrientationEnum} orientation
   */
  flipMagnetAlert(orientation) {
    //const alert = this.describer.getFlipMagnetAlertText( orientation );
    //this.alertDescriptionUtterance( alert );
  }

  /**
   * @public
   * @param speed
   * @param direction
   */
  static magnetSlidingAlert(speed, direction) {
    //const alert = MagnetDescriber.getMagnetSlidingAlertText( speed, direction );
    // this.alertDescriptionUtterance(  alert );
  }

  /**
   * @public
   * @param showVoltmeter
   */
  static voltmeterAttachmentAlert(showVoltmeter) {
    //const alert = MagnetDescriber.getVoltmeterAttachmentAlertText( showVoltmeter );
    //this.alertDescriptionUtterance( alert );
  }

  /**
   * @public
   * @param showLines
   */
  static fieldLinesVisibilityAlert(showLines) {
    //const alert = MagnetDescriber.getFieldLinesVisibilityAlertText( showLines );
    //this.alertDescriptionUtterance( alert );
  }

  /**
   * @public
   * @param showTopCoil
   */
  static coilConnectionAlert(showTopCoil) {
    //const alert = MagnetDescriber.getCoilConnectionAlertText( showTopCoil );
    //this.alertDescriptionUtterance( alert );
  }
}
faradaysLaw.register('FaradaysLawAlertManager', FaradaysLawAlertManager);
export default FaradaysLawAlertManager;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJBbGVydGVyIiwiVXR0ZXJhbmNlIiwiZmFyYWRheXNMYXciLCJGYXJhZGF5c0xhd0FsZXJ0TWFuYWdlciIsImNvbnN0cnVjdG9yIiwibm9kZSIsImRlc2NyaWJlciIsImRlc2NyaXB0aW9uQWxlcnROb2RlIiwia2V5Ym9hcmRNb3ZlbWVudFV0dGVyYW5jZSIsIm1hZ25ldEZvY3VzQWxlcnQiLCJtb3ZlbWVudEVuZEFsZXJ0IiwiYWxlcnQiLCJtYWduZXRNb3ZlZEFsZXJ0VGV4dCIsImZsaXBNYWduZXRBbGVydCIsIm9yaWVudGF0aW9uIiwibWFnbmV0U2xpZGluZ0FsZXJ0Iiwic3BlZWQiLCJkaXJlY3Rpb24iLCJ2b2x0bWV0ZXJBdHRhY2htZW50QWxlcnQiLCJzaG93Vm9sdG1ldGVyIiwiZmllbGRMaW5lc1Zpc2liaWxpdHlBbGVydCIsInNob3dMaW5lcyIsImNvaWxDb25uZWN0aW9uQWxlcnQiLCJzaG93VG9wQ29pbCIsInJlZ2lzdGVyIl0sInNvdXJjZXMiOlsiRmFyYWRheXNMYXdBbGVydE1hbmFnZXIuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyMSwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogTWFuYWdlcyBhbGwgYWxlcnRzIGZvciB0aGUgRmFyYWRheXMgTGF3IHNpbS4gQ3JlYXRlcyBhbGVydCBzdHJpbmdzIGFuZCBzZW5kcyB0aGVtXHJcbiAqIHRvIHRoZSBVdHRlcmFuY2VRdWV1ZSB0byBiZSBzcG9rZW4uXHJcbiAqXHJcbiAqIEFzIG9mIDEyLzIvMjAsIGFsbCBzaW0tc3BlY2lmaWMgYWxlcnRzIGFyZSBiZWluZyBkaXNhYmxlZCBmb3IgYSBwdWJsaWNhdGlvbiB3aXRoIG9ubHlcclxuICogYWx0ZXJuYXRpdmUgaW5wdXQgYmVjYXVzZSB0aGUgYWxlcnRzIGFyZSBzb21ld2hhdCB1bmZpbmlzaGVkIGFuZCB0b28gZnJlcXVlbnQuIEludGVyYWN0aXZlXHJcbiAqIGRlc2NyaXB0aW9ucyBhcmUgbm90IHN1cHBvcnRlZCBpbiB0aGlzIHJlbGVhc2UsIGJ1dCB3ZSBkb24ndCB3YW50IHRvIHB1Ymxpc2ggd2l0aFxyXG4gKiBkZXNjcmlwdGlvbnMgdGhhdCB3ZSBrbm93IHdvdWxkIGNyZWF0ZSBhbiB1bnBsZWFzYW50IGV4cGVyaWVuY2UuIFNlZVxyXG4gKiBodHRwczovL2dpdGh1Yi5jb20vcGhldHNpbXMvZmFyYWRheXMtbGF3L2lzc3Vlcy8xMDlcclxuICovXHJcblxyXG5pbXBvcnQgQWxlcnRlciBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvYWNjZXNzaWJpbGl0eS9kZXNjcmliZXJzL0FsZXJ0ZXIuanMnO1xyXG5pbXBvcnQgVXR0ZXJhbmNlIGZyb20gJy4uLy4uLy4uLy4uL3V0dGVyYW5jZS1xdWV1ZS9qcy9VdHRlcmFuY2UuanMnO1xyXG5pbXBvcnQgZmFyYWRheXNMYXcgZnJvbSAnLi4vLi4vZmFyYWRheXNMYXcuanMnO1xyXG4vLyBpbXBvcnQgTWFnbmV0RGVzY3JpYmVyIGZyb20gJy4vTWFnbmV0RGVzY3JpYmVyLmpzJztcclxuXHJcbi8vIHRoZSBhbGVydCBtYW5hZ2VyXHJcbmNsYXNzIEZhcmFkYXlzTGF3QWxlcnRNYW5hZ2VyIGV4dGVuZHMgQWxlcnRlciB7XHJcblxyXG4gIGNvbnN0cnVjdG9yKCBub2RlLCBkZXNjcmliZXIgKSB7XHJcbiAgICBzdXBlcigge1xyXG4gICAgICBkZXNjcmlwdGlvbkFsZXJ0Tm9kZTogbm9kZVxyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMuZGVzY3JpYmVyID0gZGVzY3JpYmVyO1xyXG5cclxuICAgIC8vIEBwcml2YXRlIHtVdHRlcmFuY2V9IC0gdXR0ZXJhbmNlIGZvciBlbmQgb2YgYSBrZXlib2FyZCBtb3ZlbWVudCwgc2luZ2xlIHV0dGVyYW5jZVxyXG4gICAgLy8gZ2V0cyBhZGRlZCB0byB0aGUgdXR0ZXJhbmNlUXVldWUgdG8gcHJldmVudCB0b28gbWFueSBhbGVydHMgd2l0aCB0aGlzIGNvbnRlbnRcclxuICAgIHRoaXMua2V5Ym9hcmRNb3ZlbWVudFV0dGVyYW5jZSA9IG5ldyBVdHRlcmFuY2UoKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKi9cclxuICBtYWduZXRGb2N1c0FsZXJ0KCkge1xyXG4gICAgLy9jb25zdCBhbGVydCA9IHRoaXMuZGVzY3JpYmVyLm1hZ25ldEZvY3VzQWxlcnRUZXh0O1xyXG4gICAgLy90aGlzLmFsZXJ0RGVzY3JpcHRpb25VdHRlcmFuY2UoIGFsZXJ0ICk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgbW92ZW1lbnRFbmRBbGVydCgpIHtcclxuICAgIHRoaXMua2V5Ym9hcmRNb3ZlbWVudFV0dGVyYW5jZS5hbGVydCA9IHRoaXMuZGVzY3JpYmVyLm1hZ25ldE1vdmVkQWxlcnRUZXh0KCk7XHJcbiAgICAvLyB0aGlzLmFsZXJ0RGVzY3JpcHRpb25VdHRlcmFuY2UoICB0aGlzLmtleWJvYXJkTW92ZW1lbnRVdHRlcmFuY2UgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAcGFyYW0ge09yaWVudGF0aW9uRW51bX0gb3JpZW50YXRpb25cclxuICAgKi9cclxuICBmbGlwTWFnbmV0QWxlcnQoIG9yaWVudGF0aW9uICkge1xyXG4gICAgLy9jb25zdCBhbGVydCA9IHRoaXMuZGVzY3JpYmVyLmdldEZsaXBNYWduZXRBbGVydFRleHQoIG9yaWVudGF0aW9uICk7XHJcbiAgICAvL3RoaXMuYWxlcnREZXNjcmlwdGlvblV0dGVyYW5jZSggYWxlcnQgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAcGFyYW0gc3BlZWRcclxuICAgKiBAcGFyYW0gZGlyZWN0aW9uXHJcbiAgICovXHJcbiAgc3RhdGljIG1hZ25ldFNsaWRpbmdBbGVydCggc3BlZWQsIGRpcmVjdGlvbiApIHtcclxuICAgIC8vY29uc3QgYWxlcnQgPSBNYWduZXREZXNjcmliZXIuZ2V0TWFnbmV0U2xpZGluZ0FsZXJ0VGV4dCggc3BlZWQsIGRpcmVjdGlvbiApO1xyXG4gICAgLy8gdGhpcy5hbGVydERlc2NyaXB0aW9uVXR0ZXJhbmNlKCAgYWxlcnQgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAcGFyYW0gc2hvd1ZvbHRtZXRlclxyXG4gICAqL1xyXG4gIHN0YXRpYyB2b2x0bWV0ZXJBdHRhY2htZW50QWxlcnQoIHNob3dWb2x0bWV0ZXIgKSB7XHJcbiAgICAvL2NvbnN0IGFsZXJ0ID0gTWFnbmV0RGVzY3JpYmVyLmdldFZvbHRtZXRlckF0dGFjaG1lbnRBbGVydFRleHQoIHNob3dWb2x0bWV0ZXIgKTtcclxuICAgIC8vdGhpcy5hbGVydERlc2NyaXB0aW9uVXR0ZXJhbmNlKCBhbGVydCApO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQHB1YmxpY1xyXG4gICAqIEBwYXJhbSBzaG93TGluZXNcclxuICAgKi9cclxuICBzdGF0aWMgZmllbGRMaW5lc1Zpc2liaWxpdHlBbGVydCggc2hvd0xpbmVzICkge1xyXG4gICAgLy9jb25zdCBhbGVydCA9IE1hZ25ldERlc2NyaWJlci5nZXRGaWVsZExpbmVzVmlzaWJpbGl0eUFsZXJ0VGV4dCggc2hvd0xpbmVzICk7XHJcbiAgICAvL3RoaXMuYWxlcnREZXNjcmlwdGlvblV0dGVyYW5jZSggYWxlcnQgKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAcGFyYW0gc2hvd1RvcENvaWxcclxuICAgKi9cclxuICBzdGF0aWMgY29pbENvbm5lY3Rpb25BbGVydCggc2hvd1RvcENvaWwgKSB7XHJcbiAgICAvL2NvbnN0IGFsZXJ0ID0gTWFnbmV0RGVzY3JpYmVyLmdldENvaWxDb25uZWN0aW9uQWxlcnRUZXh0KCBzaG93VG9wQ29pbCApO1xyXG4gICAgLy90aGlzLmFsZXJ0RGVzY3JpcHRpb25VdHRlcmFuY2UoIGFsZXJ0ICk7XHJcbiAgfVxyXG59XHJcblxyXG5mYXJhZGF5c0xhdy5yZWdpc3RlciggJ0ZhcmFkYXlzTGF3QWxlcnRNYW5hZ2VyJywgRmFyYWRheXNMYXdBbGVydE1hbmFnZXIgKTtcclxuZXhwb3J0IGRlZmF1bHQgRmFyYWRheXNMYXdBbGVydE1hbmFnZXI7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxPQUFPLE1BQU0saUVBQWlFO0FBQ3JGLE9BQU9DLFNBQVMsTUFBTSw2Q0FBNkM7QUFDbkUsT0FBT0MsV0FBVyxNQUFNLHNCQUFzQjtBQUM5Qzs7QUFFQTtBQUNBLE1BQU1DLHVCQUF1QixTQUFTSCxPQUFPLENBQUM7RUFFNUNJLFdBQVdBLENBQUVDLElBQUksRUFBRUMsU0FBUyxFQUFHO0lBQzdCLEtBQUssQ0FBRTtNQUNMQyxvQkFBb0IsRUFBRUY7SUFDeEIsQ0FBRSxDQUFDO0lBRUgsSUFBSSxDQUFDQyxTQUFTLEdBQUdBLFNBQVM7O0lBRTFCO0lBQ0E7SUFDQSxJQUFJLENBQUNFLHlCQUF5QixHQUFHLElBQUlQLFNBQVMsQ0FBQyxDQUFDO0VBQ2xEOztFQUVBO0FBQ0Y7QUFDQTtFQUNFUSxnQkFBZ0JBLENBQUEsRUFBRztJQUNqQjtJQUNBO0VBQUE7O0VBR0Y7QUFDRjtBQUNBO0VBQ0VDLGdCQUFnQkEsQ0FBQSxFQUFHO0lBQ2pCLElBQUksQ0FBQ0YseUJBQXlCLENBQUNHLEtBQUssR0FBRyxJQUFJLENBQUNMLFNBQVMsQ0FBQ00sb0JBQW9CLENBQUMsQ0FBQztJQUM1RTtFQUNGOztFQUVBO0FBQ0Y7QUFDQTtBQUNBO0VBQ0VDLGVBQWVBLENBQUVDLFdBQVcsRUFBRztJQUM3QjtJQUNBO0VBQUE7O0VBR0Y7QUFDRjtBQUNBO0FBQ0E7QUFDQTtFQUNFLE9BQU9DLGtCQUFrQkEsQ0FBRUMsS0FBSyxFQUFFQyxTQUFTLEVBQUc7SUFDNUM7SUFDQTtFQUFBOztFQUdGO0FBQ0Y7QUFDQTtBQUNBO0VBQ0UsT0FBT0Msd0JBQXdCQSxDQUFFQyxhQUFhLEVBQUc7SUFDL0M7SUFDQTtFQUFBOztFQUdGO0FBQ0Y7QUFDQTtBQUNBO0VBQ0UsT0FBT0MseUJBQXlCQSxDQUFFQyxTQUFTLEVBQUc7SUFDNUM7SUFDQTtFQUFBOztFQUdGO0FBQ0Y7QUFDQTtBQUNBO0VBQ0UsT0FBT0MsbUJBQW1CQSxDQUFFQyxXQUFXLEVBQUc7SUFDeEM7SUFDQTtFQUFBO0FBRUo7QUFFQXJCLFdBQVcsQ0FBQ3NCLFFBQVEsQ0FBRSx5QkFBeUIsRUFBRXJCLHVCQUF3QixDQUFDO0FBQzFFLGVBQWVBLHVCQUF1QiJ9