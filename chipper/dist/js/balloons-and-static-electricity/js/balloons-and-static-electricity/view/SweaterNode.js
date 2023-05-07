// Copyright 2013-2022, University of Colorado Boulder

/**
 * Scenery display object (scene graph node) for the sweater of the model.
 *
 * @author Vasily Shakhov (Mlearner)
 * @author John Blanco
 */

import Multilink from '../../../../axon/js/Multilink.js';
import { Image, Node, Path } from '../../../../scenery/js/imports.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import sweater_png from '../../../images/sweater_png.js';
import balloonsAndStaticElectricity from '../../balloonsAndStaticElectricity.js';
import BASEA11yStrings from '../BASEA11yStrings.js';
import BASEQueryParameters from '../BASEQueryParameters.js';
import SweaterDescriber from './describers/SweaterDescriber.js';
import MinusChargeNode from './MinusChargeNode.js';
import PlusChargeNode from './PlusChargeNode.js';
const sweaterLabelString = BASEA11yStrings.sweaterLabel.value;
class SweaterNode extends Node {
  /**
   * @param {BASEModel} model
   * @param {Tandem} tandem
   */
  constructor(model, tandem) {
    super({
      pickable: false,
      // pdom
      tagName: 'div',
      // sweater is just a div
      labelTagName: 'h3',
      // label is identified as a heading of level 3
      labelContent: sweaterLabelString
    });
    this.plusChargesNode = new Node({
      tandem: tandem.createTandem('plusChargesNode')
    });
    this.minusChargesNode = new Node({
      layerSplit: true,
      tandem: tandem.createTandem('minusChargesNode')
    });
    this.sweaterModel = model.sweater;

    // create the sweater image
    const sweaterImageNode = new Image(sweater_png, {
      tandem: tandem.createTandem('sweater')
    });

    // Balloons and Static Electricity has unit tests which run outside of the context of simLauncher and hence not all
    // images may have dimensions by now.
    if (sweaterImageNode.width > 0 && sweaterImageNode.height > 0) {
      // scale image to match model, then set position
      sweaterImageNode.scale(this.sweaterModel.width / sweaterImageNode.width, this.sweaterModel.height / sweaterImageNode.height);
    } else {
      assert && assert(window.hasOwnProperty('QUnit'), 'Images should have dimensions unless we are running a unit test');
    }
    sweaterImageNode.left = this.sweaterModel.x;
    sweaterImageNode.top = this.sweaterModel.y;

    // add the sweater image
    this.addChild(sweaterImageNode);

    // show the charge area
    if (BASEQueryParameters.showSweaterChargedArea) {
      this.addChild(new Path(this.sweaterModel.chargedArea, {
        fill: 'rgba( 255, 255, 0, 0.5 )'
      }));
    }

    // draw plus and minus charges
    this.sweaterModel.plusCharges.forEach(plusCharge => {
      this.plusChargesNode.addChild(new PlusChargeNode(plusCharge.position));
    });
    this.sweaterModel.minusCharges.forEach(minusCharge => {
      this.minusChargesNode.addChild(new MinusChargeNode(minusCharge.position));
    });
    this.addChild(this.plusChargesNode);
    this.addChild(this.minusChargesNode);

    // show all, none or charge difference
    const updateChargesVisibilityOnSweater = value => {
      if (model.showChargesProperty.get() === 'none') {
        this.plusChargesNode.visible = false;
        this.minusChargesNode.visible = false;
      } else {
        this.plusChargesNode.visible = true;
        this.minusChargesNode.visible = true;
        const showAll = model.showChargesProperty.get() === 'all';
        for (let i = 0; i < this.sweaterModel.minusCharges.length; i++) {
          const plusChargeNodes = this.plusChargesNode.children;
          const minusChargeNodes = this.minusChargesNode.children;
          plusChargeNodes[i].visible = showAll || this.sweaterModel.minusCharges[i].movedProperty.get();
          minusChargeNodes[i].visible = showAll && !this.sweaterModel.minusCharges[i].movedProperty.get();
        }
      }
    };

    // pdom - construct a type that manages descriptions depending on the state of the model
    const sweaterDescriber = new SweaterDescriber(model, this.sweaterModel);
    Multilink.multilink([model.showChargesProperty, this.sweaterModel.chargeProperty], (showCharges, charge) => {
      updateChargesVisibilityOnSweater(charge);
      this.setDescriptionContent(sweaterDescriber.getSweaterDescription(showCharges));
    });

    // When setting the state using phet-io, we must update the charge visibility, otherwise they can get out of sync
    // due to the fact that the movedProperty state could get loaded before the chargeProperty state.
    Tandem.PHET_IO_ENABLED && phet.phetio.phetioEngine.phetioStateEngine.stateSetEmitter.addListener(() => {
      updateChargesVisibilityOnSweater(model.showChargesProperty.get());
    });
  }
}
balloonsAndStaticElectricity.register('SweaterNode', SweaterNode);
export default SweaterNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNdWx0aWxpbmsiLCJJbWFnZSIsIk5vZGUiLCJQYXRoIiwiVGFuZGVtIiwic3dlYXRlcl9wbmciLCJiYWxsb29uc0FuZFN0YXRpY0VsZWN0cmljaXR5IiwiQkFTRUExMXlTdHJpbmdzIiwiQkFTRVF1ZXJ5UGFyYW1ldGVycyIsIlN3ZWF0ZXJEZXNjcmliZXIiLCJNaW51c0NoYXJnZU5vZGUiLCJQbHVzQ2hhcmdlTm9kZSIsInN3ZWF0ZXJMYWJlbFN0cmluZyIsInN3ZWF0ZXJMYWJlbCIsInZhbHVlIiwiU3dlYXRlck5vZGUiLCJjb25zdHJ1Y3RvciIsIm1vZGVsIiwidGFuZGVtIiwicGlja2FibGUiLCJ0YWdOYW1lIiwibGFiZWxUYWdOYW1lIiwibGFiZWxDb250ZW50IiwicGx1c0NoYXJnZXNOb2RlIiwiY3JlYXRlVGFuZGVtIiwibWludXNDaGFyZ2VzTm9kZSIsImxheWVyU3BsaXQiLCJzd2VhdGVyTW9kZWwiLCJzd2VhdGVyIiwic3dlYXRlckltYWdlTm9kZSIsIndpZHRoIiwiaGVpZ2h0Iiwic2NhbGUiLCJhc3NlcnQiLCJ3aW5kb3ciLCJoYXNPd25Qcm9wZXJ0eSIsImxlZnQiLCJ4IiwidG9wIiwieSIsImFkZENoaWxkIiwic2hvd1N3ZWF0ZXJDaGFyZ2VkQXJlYSIsImNoYXJnZWRBcmVhIiwiZmlsbCIsInBsdXNDaGFyZ2VzIiwiZm9yRWFjaCIsInBsdXNDaGFyZ2UiLCJwb3NpdGlvbiIsIm1pbnVzQ2hhcmdlcyIsIm1pbnVzQ2hhcmdlIiwidXBkYXRlQ2hhcmdlc1Zpc2liaWxpdHlPblN3ZWF0ZXIiLCJzaG93Q2hhcmdlc1Byb3BlcnR5IiwiZ2V0IiwidmlzaWJsZSIsInNob3dBbGwiLCJpIiwibGVuZ3RoIiwicGx1c0NoYXJnZU5vZGVzIiwiY2hpbGRyZW4iLCJtaW51c0NoYXJnZU5vZGVzIiwibW92ZWRQcm9wZXJ0eSIsInN3ZWF0ZXJEZXNjcmliZXIiLCJtdWx0aWxpbmsiLCJjaGFyZ2VQcm9wZXJ0eSIsInNob3dDaGFyZ2VzIiwiY2hhcmdlIiwic2V0RGVzY3JpcHRpb25Db250ZW50IiwiZ2V0U3dlYXRlckRlc2NyaXB0aW9uIiwiUEhFVF9JT19FTkFCTEVEIiwicGhldCIsInBoZXRpbyIsInBoZXRpb0VuZ2luZSIsInBoZXRpb1N0YXRlRW5naW5lIiwic3RhdGVTZXRFbWl0dGVyIiwiYWRkTGlzdGVuZXIiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlN3ZWF0ZXJOb2RlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDEzLTIwMjIsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIFNjZW5lcnkgZGlzcGxheSBvYmplY3QgKHNjZW5lIGdyYXBoIG5vZGUpIGZvciB0aGUgc3dlYXRlciBvZiB0aGUgbW9kZWwuXHJcbiAqXHJcbiAqIEBhdXRob3IgVmFzaWx5IFNoYWtob3YgKE1sZWFybmVyKVxyXG4gKiBAYXV0aG9yIEpvaG4gQmxhbmNvXHJcbiAqL1xyXG5cclxuaW1wb3J0IE11bHRpbGluayBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL011bHRpbGluay5qcyc7XHJcbmltcG9ydCB7IEltYWdlLCBOb2RlLCBQYXRoIH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IFRhbmRlbSBmcm9tICcuLi8uLi8uLi8uLi90YW5kZW0vanMvVGFuZGVtLmpzJztcclxuaW1wb3J0IHN3ZWF0ZXJfcG5nIGZyb20gJy4uLy4uLy4uL2ltYWdlcy9zd2VhdGVyX3BuZy5qcyc7XHJcbmltcG9ydCBiYWxsb29uc0FuZFN0YXRpY0VsZWN0cmljaXR5IGZyb20gJy4uLy4uL2JhbGxvb25zQW5kU3RhdGljRWxlY3RyaWNpdHkuanMnO1xyXG5pbXBvcnQgQkFTRUExMXlTdHJpbmdzIGZyb20gJy4uL0JBU0VBMTF5U3RyaW5ncy5qcyc7XHJcbmltcG9ydCBCQVNFUXVlcnlQYXJhbWV0ZXJzIGZyb20gJy4uL0JBU0VRdWVyeVBhcmFtZXRlcnMuanMnO1xyXG5pbXBvcnQgU3dlYXRlckRlc2NyaWJlciBmcm9tICcuL2Rlc2NyaWJlcnMvU3dlYXRlckRlc2NyaWJlci5qcyc7XHJcbmltcG9ydCBNaW51c0NoYXJnZU5vZGUgZnJvbSAnLi9NaW51c0NoYXJnZU5vZGUuanMnO1xyXG5pbXBvcnQgUGx1c0NoYXJnZU5vZGUgZnJvbSAnLi9QbHVzQ2hhcmdlTm9kZS5qcyc7XHJcblxyXG5jb25zdCBzd2VhdGVyTGFiZWxTdHJpbmcgPSBCQVNFQTExeVN0cmluZ3Muc3dlYXRlckxhYmVsLnZhbHVlO1xyXG5cclxuXHJcbmNsYXNzIFN3ZWF0ZXJOb2RlIGV4dGVuZHMgTm9kZSB7XHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtCQVNFTW9kZWx9IG1vZGVsXHJcbiAgICogQHBhcmFtIHtUYW5kZW19IHRhbmRlbVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBtb2RlbCwgdGFuZGVtICkge1xyXG5cclxuICAgIHN1cGVyKCB7XHJcbiAgICAgIHBpY2thYmxlOiBmYWxzZSxcclxuXHJcbiAgICAgIC8vIHBkb21cclxuICAgICAgdGFnTmFtZTogJ2RpdicsIC8vIHN3ZWF0ZXIgaXMganVzdCBhIGRpdlxyXG4gICAgICBsYWJlbFRhZ05hbWU6ICdoMycsIC8vIGxhYmVsIGlzIGlkZW50aWZpZWQgYXMgYSBoZWFkaW5nIG9mIGxldmVsIDNcclxuICAgICAgbGFiZWxDb250ZW50OiBzd2VhdGVyTGFiZWxTdHJpbmdcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLnBsdXNDaGFyZ2VzTm9kZSA9IG5ldyBOb2RlKCB7IHRhbmRlbTogdGFuZGVtLmNyZWF0ZVRhbmRlbSggJ3BsdXNDaGFyZ2VzTm9kZScgKSB9ICk7XHJcbiAgICB0aGlzLm1pbnVzQ2hhcmdlc05vZGUgPSBuZXcgTm9kZSgge1xyXG4gICAgICBsYXllclNwbGl0OiB0cnVlLFxyXG4gICAgICB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdtaW51c0NoYXJnZXNOb2RlJyApXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLnN3ZWF0ZXJNb2RlbCA9IG1vZGVsLnN3ZWF0ZXI7XHJcblxyXG4gICAgLy8gY3JlYXRlIHRoZSBzd2VhdGVyIGltYWdlXHJcbiAgICBjb25zdCBzd2VhdGVySW1hZ2VOb2RlID0gbmV3IEltYWdlKCBzd2VhdGVyX3BuZywgeyB0YW5kZW06IHRhbmRlbS5jcmVhdGVUYW5kZW0oICdzd2VhdGVyJyApIH0gKTtcclxuXHJcbiAgICAvLyBCYWxsb29ucyBhbmQgU3RhdGljIEVsZWN0cmljaXR5IGhhcyB1bml0IHRlc3RzIHdoaWNoIHJ1biBvdXRzaWRlIG9mIHRoZSBjb250ZXh0IG9mIHNpbUxhdW5jaGVyIGFuZCBoZW5jZSBub3QgYWxsXHJcbiAgICAvLyBpbWFnZXMgbWF5IGhhdmUgZGltZW5zaW9ucyBieSBub3cuXHJcbiAgICBpZiAoIHN3ZWF0ZXJJbWFnZU5vZGUud2lkdGggPiAwICYmIHN3ZWF0ZXJJbWFnZU5vZGUuaGVpZ2h0ID4gMCApIHtcclxuXHJcbiAgICAgIC8vIHNjYWxlIGltYWdlIHRvIG1hdGNoIG1vZGVsLCB0aGVuIHNldCBwb3NpdGlvblxyXG4gICAgICBzd2VhdGVySW1hZ2VOb2RlLnNjYWxlKFxyXG4gICAgICAgIHRoaXMuc3dlYXRlck1vZGVsLndpZHRoIC8gc3dlYXRlckltYWdlTm9kZS53aWR0aCxcclxuICAgICAgICB0aGlzLnN3ZWF0ZXJNb2RlbC5oZWlnaHQgLyBzd2VhdGVySW1hZ2VOb2RlLmhlaWdodFxyXG4gICAgICApO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIGFzc2VydCAmJiBhc3NlcnQoIHdpbmRvdy5oYXNPd25Qcm9wZXJ0eSggJ1FVbml0JyApLCAnSW1hZ2VzIHNob3VsZCBoYXZlIGRpbWVuc2lvbnMgdW5sZXNzIHdlIGFyZSBydW5uaW5nIGEgdW5pdCB0ZXN0JyApO1xyXG4gICAgfVxyXG5cclxuICAgIHN3ZWF0ZXJJbWFnZU5vZGUubGVmdCA9IHRoaXMuc3dlYXRlck1vZGVsLng7XHJcbiAgICBzd2VhdGVySW1hZ2VOb2RlLnRvcCA9IHRoaXMuc3dlYXRlck1vZGVsLnk7XHJcblxyXG4gICAgLy8gYWRkIHRoZSBzd2VhdGVyIGltYWdlXHJcbiAgICB0aGlzLmFkZENoaWxkKCBzd2VhdGVySW1hZ2VOb2RlICk7XHJcblxyXG4gICAgLy8gc2hvdyB0aGUgY2hhcmdlIGFyZWFcclxuICAgIGlmICggQkFTRVF1ZXJ5UGFyYW1ldGVycy5zaG93U3dlYXRlckNoYXJnZWRBcmVhICkge1xyXG4gICAgICB0aGlzLmFkZENoaWxkKCBuZXcgUGF0aCggdGhpcy5zd2VhdGVyTW9kZWwuY2hhcmdlZEFyZWEsIHtcclxuICAgICAgICBmaWxsOiAncmdiYSggMjU1LCAyNTUsIDAsIDAuNSApJ1xyXG4gICAgICB9ICkgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBkcmF3IHBsdXMgYW5kIG1pbnVzIGNoYXJnZXNcclxuICAgIHRoaXMuc3dlYXRlck1vZGVsLnBsdXNDaGFyZ2VzLmZvckVhY2goIHBsdXNDaGFyZ2UgPT4ge1xyXG4gICAgICB0aGlzLnBsdXNDaGFyZ2VzTm9kZS5hZGRDaGlsZCggbmV3IFBsdXNDaGFyZ2VOb2RlKCBwbHVzQ2hhcmdlLnBvc2l0aW9uICkgKTtcclxuICAgIH0gKTtcclxuICAgIHRoaXMuc3dlYXRlck1vZGVsLm1pbnVzQ2hhcmdlcy5mb3JFYWNoKCBtaW51c0NoYXJnZSA9PiB7XHJcbiAgICAgIHRoaXMubWludXNDaGFyZ2VzTm9kZS5hZGRDaGlsZCggbmV3IE1pbnVzQ2hhcmdlTm9kZSggbWludXNDaGFyZ2UucG9zaXRpb24gKSApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIHRoaXMuYWRkQ2hpbGQoIHRoaXMucGx1c0NoYXJnZXNOb2RlICk7XHJcbiAgICB0aGlzLmFkZENoaWxkKCB0aGlzLm1pbnVzQ2hhcmdlc05vZGUgKTtcclxuXHJcbiAgICAvLyBzaG93IGFsbCwgbm9uZSBvciBjaGFyZ2UgZGlmZmVyZW5jZVxyXG4gICAgY29uc3QgdXBkYXRlQ2hhcmdlc1Zpc2liaWxpdHlPblN3ZWF0ZXIgPSB2YWx1ZSA9PiB7XHJcbiAgICAgIGlmICggbW9kZWwuc2hvd0NoYXJnZXNQcm9wZXJ0eS5nZXQoKSA9PT0gJ25vbmUnICkge1xyXG4gICAgICAgIHRoaXMucGx1c0NoYXJnZXNOb2RlLnZpc2libGUgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLm1pbnVzQ2hhcmdlc05vZGUudmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIHRoaXMucGx1c0NoYXJnZXNOb2RlLnZpc2libGUgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMubWludXNDaGFyZ2VzTm9kZS52aXNpYmxlID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgY29uc3Qgc2hvd0FsbCA9ICggbW9kZWwuc2hvd0NoYXJnZXNQcm9wZXJ0eS5nZXQoKSA9PT0gJ2FsbCcgKTtcclxuICAgICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLnN3ZWF0ZXJNb2RlbC5taW51c0NoYXJnZXMubGVuZ3RoOyBpKysgKSB7XHJcbiAgICAgICAgICBjb25zdCBwbHVzQ2hhcmdlTm9kZXMgPSB0aGlzLnBsdXNDaGFyZ2VzTm9kZS5jaGlsZHJlbjtcclxuICAgICAgICAgIGNvbnN0IG1pbnVzQ2hhcmdlTm9kZXMgPSB0aGlzLm1pbnVzQ2hhcmdlc05vZGUuY2hpbGRyZW47XHJcbiAgICAgICAgICBwbHVzQ2hhcmdlTm9kZXNbIGkgXS52aXNpYmxlID0gc2hvd0FsbCB8fFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc3dlYXRlck1vZGVsLm1pbnVzQ2hhcmdlc1sgaSBdLm1vdmVkUHJvcGVydHkuZ2V0KCk7XHJcbiAgICAgICAgICBtaW51c0NoYXJnZU5vZGVzWyBpIF0udmlzaWJsZSA9IHNob3dBbGwgJiYgIXRoaXMuc3dlYXRlck1vZGVsLm1pbnVzQ2hhcmdlc1sgaSBdLm1vdmVkUHJvcGVydHkuZ2V0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIC8vIHBkb20gLSBjb25zdHJ1Y3QgYSB0eXBlIHRoYXQgbWFuYWdlcyBkZXNjcmlwdGlvbnMgZGVwZW5kaW5nIG9uIHRoZSBzdGF0ZSBvZiB0aGUgbW9kZWxcclxuICAgIGNvbnN0IHN3ZWF0ZXJEZXNjcmliZXIgPSBuZXcgU3dlYXRlckRlc2NyaWJlciggbW9kZWwsIHRoaXMuc3dlYXRlck1vZGVsICk7XHJcblxyXG4gICAgTXVsdGlsaW5rLm11bHRpbGluayggWyBtb2RlbC5zaG93Q2hhcmdlc1Byb3BlcnR5LCB0aGlzLnN3ZWF0ZXJNb2RlbC5jaGFyZ2VQcm9wZXJ0eSBdLCAoIHNob3dDaGFyZ2VzLCBjaGFyZ2UgKSA9PiB7XHJcbiAgICAgIHVwZGF0ZUNoYXJnZXNWaXNpYmlsaXR5T25Td2VhdGVyKCBjaGFyZ2UgKTtcclxuXHJcbiAgICAgIHRoaXMuc2V0RGVzY3JpcHRpb25Db250ZW50KCBzd2VhdGVyRGVzY3JpYmVyLmdldFN3ZWF0ZXJEZXNjcmlwdGlvbiggc2hvd0NoYXJnZXMgKSApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIC8vIFdoZW4gc2V0dGluZyB0aGUgc3RhdGUgdXNpbmcgcGhldC1pbywgd2UgbXVzdCB1cGRhdGUgdGhlIGNoYXJnZSB2aXNpYmlsaXR5LCBvdGhlcndpc2UgdGhleSBjYW4gZ2V0IG91dCBvZiBzeW5jXHJcbiAgICAvLyBkdWUgdG8gdGhlIGZhY3QgdGhhdCB0aGUgbW92ZWRQcm9wZXJ0eSBzdGF0ZSBjb3VsZCBnZXQgbG9hZGVkIGJlZm9yZSB0aGUgY2hhcmdlUHJvcGVydHkgc3RhdGUuXHJcbiAgICBUYW5kZW0uUEhFVF9JT19FTkFCTEVEICYmIHBoZXQucGhldGlvLnBoZXRpb0VuZ2luZS5waGV0aW9TdGF0ZUVuZ2luZS5zdGF0ZVNldEVtaXR0ZXIuYWRkTGlzdGVuZXIoICgpID0+IHtcclxuICAgICAgdXBkYXRlQ2hhcmdlc1Zpc2liaWxpdHlPblN3ZWF0ZXIoIG1vZGVsLnNob3dDaGFyZ2VzUHJvcGVydHkuZ2V0KCkgKTtcclxuICAgIH0gKTtcclxuICB9XHJcbn1cclxuXHJcbmJhbGxvb25zQW5kU3RhdGljRWxlY3RyaWNpdHkucmVnaXN0ZXIoICdTd2VhdGVyTm9kZScsIFN3ZWF0ZXJOb2RlICk7XHJcbmV4cG9ydCBkZWZhdWx0IFN3ZWF0ZXJOb2RlOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFNBQVMsTUFBTSxrQ0FBa0M7QUFDeEQsU0FBU0MsS0FBSyxFQUFFQyxJQUFJLEVBQUVDLElBQUksUUFBUSxtQ0FBbUM7QUFDckUsT0FBT0MsTUFBTSxNQUFNLGlDQUFpQztBQUNwRCxPQUFPQyxXQUFXLE1BQU0sZ0NBQWdDO0FBQ3hELE9BQU9DLDRCQUE0QixNQUFNLHVDQUF1QztBQUNoRixPQUFPQyxlQUFlLE1BQU0sdUJBQXVCO0FBQ25ELE9BQU9DLG1CQUFtQixNQUFNLDJCQUEyQjtBQUMzRCxPQUFPQyxnQkFBZ0IsTUFBTSxrQ0FBa0M7QUFDL0QsT0FBT0MsZUFBZSxNQUFNLHNCQUFzQjtBQUNsRCxPQUFPQyxjQUFjLE1BQU0scUJBQXFCO0FBRWhELE1BQU1DLGtCQUFrQixHQUFHTCxlQUFlLENBQUNNLFlBQVksQ0FBQ0MsS0FBSztBQUc3RCxNQUFNQyxXQUFXLFNBQVNiLElBQUksQ0FBQztFQUM3QjtBQUNGO0FBQ0E7QUFDQTtFQUNFYyxXQUFXQSxDQUFFQyxLQUFLLEVBQUVDLE1BQU0sRUFBRztJQUUzQixLQUFLLENBQUU7TUFDTEMsUUFBUSxFQUFFLEtBQUs7TUFFZjtNQUNBQyxPQUFPLEVBQUUsS0FBSztNQUFFO01BQ2hCQyxZQUFZLEVBQUUsSUFBSTtNQUFFO01BQ3BCQyxZQUFZLEVBQUVWO0lBQ2hCLENBQUUsQ0FBQztJQUVILElBQUksQ0FBQ1csZUFBZSxHQUFHLElBQUlyQixJQUFJLENBQUU7TUFBRWdCLE1BQU0sRUFBRUEsTUFBTSxDQUFDTSxZQUFZLENBQUUsaUJBQWtCO0lBQUUsQ0FBRSxDQUFDO0lBQ3ZGLElBQUksQ0FBQ0MsZ0JBQWdCLEdBQUcsSUFBSXZCLElBQUksQ0FBRTtNQUNo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