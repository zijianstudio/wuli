// Copyright 2015-2023, University of Colorado Boulder

/**
 * ControlIsotope is a control that allows the client to control the quantity of an isotope.  It has arrow buttons, a
 * slider, a numerical readout, and a label for the isotope.
 */

import Dimension2 from '../../../../dot/js/Dimension2.js';
import Range from '../../../../dot/js/Range.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Node, Text } from '../../../../scenery/js/imports.js';
import IsotopeNode from '../../../../shred/js/view/IsotopeNode.js';
import ArrowButton from '../../../../sun/js/buttons/ArrowButton.js';
import HSlider from '../../../../sun/js/HSlider.js';
import Panel from '../../../../sun/js/Panel.js';
import isotopesAndAtomicMass from '../../isotopesAndAtomicMass.js';
const READOUT_SIZE = new Dimension2(30, 15);
class ControlIsotope extends Node {
  /**
   * @param {Property.<number>} controller
   * @param {number} minRange
   * @param {number} maxRange
   */
  constructor(controller, minRange, maxRange) {
    super(); // Call super constructor.
    const sliderLayer = new Node();
    this.addChild(sliderLayer);
    const labelLayer = new Node();
    this.addChild(labelLayer);
    const numericLayer = new Node();
    this.addChild(numericLayer);
    const range = new Range(minRange, maxRange);
    const tickLabelOptions = {
      font: new PhetFont(12),
      pickable: false
    };
    const slider = new HSlider(controller.quantityProperty, range, {
      trackSize: new Dimension2(80, 5),
      thumbSize: new Dimension2(15, 30),
      thumbTouchAreaXDilation: 8,
      thumbTouchAreaYDilation: 8,
      majorTickLength: 15,
      tickLabelSpacing: 0
    });

    // major ticks
    slider.addMajorTick(range.min, new Text(range.min, tickLabelOptions));
    slider.addMajorTick(range.max, new Text(range.max, tickLabelOptions));
    sliderLayer.addChild(slider);
    const plusButton = new ArrowButton('right', () => {
      controller.quantityProperty.set(Math.floor(controller.quantityProperty.get()) + 1);
    }, {
      arrowHeight: 10,
      arrowWidth: 10
    });
    const minusButton = new ArrowButton('left', () => {
      controller.quantityProperty.set(Math.floor(controller.quantityProperty.get()) - 1);
    }, {
      arrowHeight: 10,
      arrowWidth: 10
    });
    numericLayer.addChild(plusButton);
    numericLayer.addChild(minusButton);
    const isotopeText = new Text('', {
      font: new PhetFont(20),
      maxWidth: 0.9 * READOUT_SIZE.width,
      maxHeight: 0.9 * READOUT_SIZE.height
    });
    const panel = new Panel(isotopeText, {
      minWidth: READOUT_SIZE.width,
      minHeight: READOUT_SIZE.height,
      resize: false,
      cornerRadius: 5,
      lineWidth: 1,
      align: 'center'
    });
    numericLayer.addChild(panel);
    plusButton.left = panel.right + 5;
    minusButton.right = panel.left - 5;
    plusButton.centerY = panel.centerY;
    minusButton.centerY = panel.centerY;
    const changedValue = value => {
      isotopeText.setString(Math.floor(value));
      isotopeText.centerX = READOUT_SIZE.width / 2;
      isotopeText.centerY = READOUT_SIZE.height * 0.75;
      minusButton.enabled = !(Math.floor(value) === minRange);
      plusButton.enabled = !(Math.floor(value) === maxRange);
      controller.setIsotopeQuantity(Math.floor(value));
    };
    controller.quantityProperty.link(changedValue);
    const isotopeNode = new IsotopeNode(controller.controllerIsotope, 6, {
      showLabel: false
    });
    labelLayer.addChild(isotopeNode);
    const captionLabel = new Text(controller.caption, {
      font: new PhetFont({
        size: 14
      }),
      fill: 'black',
      maxWidth: 60
    });
    labelLayer.addChild(captionLabel);
    captionLabel.left = isotopeNode.right + 5;
    captionLabel.centerY = isotopeNode.centerY;
    labelLayer.bottom = sliderLayer.top - 5;
    numericLayer.bottom = labelLayer.top - 10;
    labelLayer.centerX = numericLayer.centerX;
    sliderLayer.centerX = numericLayer.centerX + 5;
    this.disposeControlIsotope = () => {
      controller.quantityProperty.unlink(changedValue);
    };
  }

  /**
   * release memory references
   * @public
   */
  dispose() {
    this.disposeControlIsotope();
    super.dispose();
  }
}
isotopesAndAtomicMass.register('ControlIsotope', ControlIsotope);
export default ControlIsotope;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEaW1lbnNpb24yIiwiUmFuZ2UiLCJQaGV0Rm9udCIsIk5vZGUiLCJUZXh0IiwiSXNvdG9wZU5vZGUiLCJBcnJvd0J1dHRvbiIsIkhTbGlkZXIiLCJQYW5lbCIsImlzb3RvcGVzQW5kQXRvbWljTWFzcyIsIlJFQURPVVRfU0laRSIsIkNvbnRyb2xJc290b3BlIiwiY29uc3RydWN0b3IiLCJjb250cm9sbGVyIiwibWluUmFuZ2UiLCJtYXhSYW5nZSIsInNsaWRlckxheWVyIiwiYWRkQ2hpbGQiLCJsYWJlbExheWVyIiwibnVtZXJpY0xheWVyIiwicmFuZ2UiLCJ0aWNrTGFiZWxPcHRpb25zIiwiZm9udCIsInBpY2thYmxlIiwic2xpZGVyIiwicXVhbnRpdHlQcm9wZXJ0eSIsInRyYWNrU2l6ZSIsInRodW1iU2l6ZSIsInRodW1iVG91Y2hBcmVhWERpbGF0aW9uIiwidGh1bWJUb3VjaEFyZWFZRGlsYXRpb24iLCJtYWpvclRpY2tMZW5ndGgiLCJ0aWNrTGFiZWxTcGFjaW5nIiwiYWRkTWFqb3JUaWNrIiwibWluIiwibWF4IiwicGx1c0J1dHRvbiIsInNldCIsIk1hdGgiLCJmbG9vciIsImdldCIsImFycm93SGVpZ2h0IiwiYXJyb3dXaWR0aCIsIm1pbnVzQnV0dG9uIiwiaXNvdG9wZVRleHQiLCJtYXhXaWR0aCIsIndpZHRoIiwibWF4SGVpZ2h0IiwiaGVpZ2h0IiwicGFuZWwiLCJtaW5XaWR0aCIsIm1pbkhlaWdodCIsInJlc2l6ZSIsImNvcm5lclJhZGl1cyIsImxpbmVXaWR0aCIsImFsaWduIiwibGVmdCIsInJpZ2h0IiwiY2VudGVyWSIsImNoYW5nZWRWYWx1ZSIsInZhbHVlIiwic2V0U3RyaW5nIiwiY2VudGVyWCIsImVuYWJsZWQiLCJzZXRJc290b3BlUXVhbnRpdHkiLCJsaW5rIiwiaXNvdG9wZU5vZGUiLCJjb250cm9sbGVySXNvdG9wZSIsInNob3dMYWJlbCIsImNhcHRpb25MYWJlbCIsImNhcHRpb24iLCJzaXplIiwiZmlsbCIsImJvdHRvbSIsInRvcCIsImRpc3Bvc2VDb250cm9sSXNvdG9wZSIsInVubGluayIsImRpc3Bvc2UiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkNvbnRyb2xJc290b3BlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE1LTIwMjMsIFVuaXZlcnNpdHkgb2YgQ29sb3JhZG8gQm91bGRlclxyXG5cclxuLyoqXHJcbiAqIENvbnRyb2xJc290b3BlIGlzIGEgY29udHJvbCB0aGF0IGFsbG93cyB0aGUgY2xpZW50IHRvIGNvbnRyb2wgdGhlIHF1YW50aXR5IG9mIGFuIGlzb3RvcGUuICBJdCBoYXMgYXJyb3cgYnV0dG9ucywgYVxyXG4gKiBzbGlkZXIsIGEgbnVtZXJpY2FsIHJlYWRvdXQsIGFuZCBhIGxhYmVsIGZvciB0aGUgaXNvdG9wZS5cclxuICovXHJcblxyXG5pbXBvcnQgRGltZW5zaW9uMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvRGltZW5zaW9uMi5qcyc7XHJcbmltcG9ydCBSYW5nZSBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvUmFuZ2UuanMnO1xyXG5pbXBvcnQgUGhldEZvbnQgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL1BoZXRGb250LmpzJztcclxuaW1wb3J0IHsgTm9kZSwgVGV4dCB9IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnkvanMvaW1wb3J0cy5qcyc7XHJcbmltcG9ydCBJc290b3BlTm9kZSBmcm9tICcuLi8uLi8uLi8uLi9zaHJlZC9qcy92aWV3L0lzb3RvcGVOb2RlLmpzJztcclxuaW1wb3J0IEFycm93QnV0dG9uIGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9idXR0b25zL0Fycm93QnV0dG9uLmpzJztcclxuaW1wb3J0IEhTbGlkZXIgZnJvbSAnLi4vLi4vLi4vLi4vc3VuL2pzL0hTbGlkZXIuanMnO1xyXG5pbXBvcnQgUGFuZWwgZnJvbSAnLi4vLi4vLi4vLi4vc3VuL2pzL1BhbmVsLmpzJztcclxuaW1wb3J0IGlzb3RvcGVzQW5kQXRvbWljTWFzcyBmcm9tICcuLi8uLi9pc290b3Blc0FuZEF0b21pY01hc3MuanMnO1xyXG5cclxuY29uc3QgUkVBRE9VVF9TSVpFID0gbmV3IERpbWVuc2lvbjIoIDMwLCAxNSApO1xyXG5cclxuY2xhc3MgQ29udHJvbElzb3RvcGUgZXh0ZW5kcyBOb2RlIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtQcm9wZXJ0eS48bnVtYmVyPn0gY29udHJvbGxlclxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBtaW5SYW5nZVxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBtYXhSYW5nZVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBjb250cm9sbGVyLCBtaW5SYW5nZSwgbWF4UmFuZ2UgKSB7XHJcbiAgICBzdXBlcigpOyAvLyBDYWxsIHN1cGVyIGNvbnN0cnVjdG9yLlxyXG4gICAgY29uc3Qgc2xpZGVyTGF5ZXIgPSBuZXcgTm9kZSgpO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggc2xpZGVyTGF5ZXIgKTtcclxuICAgIGNvbnN0IGxhYmVsTGF5ZXIgPSBuZXcgTm9kZSgpO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggbGFiZWxMYXllciApO1xyXG4gICAgY29uc3QgbnVtZXJpY0xheWVyID0gbmV3IE5vZGUoKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIG51bWVyaWNMYXllciApO1xyXG5cclxuICAgIGNvbnN0IHJhbmdlID0gbmV3IFJhbmdlKCBtaW5SYW5nZSwgbWF4UmFuZ2UgKTtcclxuICAgIGNvbnN0IHRpY2tMYWJlbE9wdGlvbnMgPSB7IGZvbnQ6IG5ldyBQaGV0Rm9udCggMTIgKSwgcGlja2FibGU6IGZhbHNlIH07XHJcbiAgICBjb25zdCBzbGlkZXIgPSBuZXcgSFNsaWRlciggY29udHJvbGxlci5xdWFudGl0eVByb3BlcnR5LCByYW5nZSwge1xyXG4gICAgICB0cmFja1NpemU6IG5ldyBEaW1lbnNpb24yKCA4MCwgNSApLFxyXG4gICAgICB0aHVtYlNpemU6IG5ldyBEaW1lbnNpb24yKCAxNSwgMzAgKSxcclxuICAgICAgdGh1bWJUb3VjaEFyZWFYRGlsYXRpb246IDgsXHJcbiAgICAgIHRodW1iVG91Y2hBcmVhWURpbGF0aW9uOiA4LFxyXG4gICAgICBtYWpvclRpY2tMZW5ndGg6IDE1LFxyXG4gICAgICB0aWNrTGFiZWxTcGFjaW5nOiAwXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gbWFqb3IgdGlja3NcclxuICAgIHNsaWRlci5hZGRNYWpvclRpY2soIHJhbmdlLm1pbiwgbmV3IFRleHQoIHJhbmdlLm1pbiwgdGlja0xhYmVsT3B0aW9ucyApICk7XHJcbiAgICBzbGlkZXIuYWRkTWFqb3JUaWNrKCByYW5nZS5tYXgsIG5ldyBUZXh0KCByYW5nZS5tYXgsIHRpY2tMYWJlbE9wdGlvbnMgKSApO1xyXG4gICAgc2xpZGVyTGF5ZXIuYWRkQ2hpbGQoIHNsaWRlciApO1xyXG5cclxuICAgIGNvbnN0IHBsdXNCdXR0b24gPSBuZXcgQXJyb3dCdXR0b24oICdyaWdodCcsICggKCkgPT4ge1xyXG4gICAgICBjb250cm9sbGVyLnF1YW50aXR5UHJvcGVydHkuc2V0KCBNYXRoLmZsb29yKCBjb250cm9sbGVyLnF1YW50aXR5UHJvcGVydHkuZ2V0KCkgKSArIDEgKTtcclxuICAgIH0gKSwgeyBhcnJvd0hlaWdodDogMTAsIGFycm93V2lkdGg6IDEwIH0gKTtcclxuICAgIGNvbnN0IG1pbnVzQnV0dG9uID0gbmV3IEFycm93QnV0dG9uKCAnbGVmdCcsICggKCkgPT4ge1xyXG4gICAgICBjb250cm9sbGVyLnF1YW50aXR5UHJvcGVydHkuc2V0KCBNYXRoLmZsb29yKCBjb250cm9sbGVyLnF1YW50aXR5UHJvcGVydHkuZ2V0KCkgKSAtIDEgKTtcclxuICAgIH0gKSwgeyBhcnJvd0hlaWdodDogMTAsIGFycm93V2lkdGg6IDEwIH0gKTtcclxuICAgIG51bWVyaWNMYXllci5hZGRDaGlsZCggcGx1c0J1dHRvbiApO1xyXG4gICAgbnVtZXJpY0xheWVyLmFkZENoaWxkKCBtaW51c0J1dHRvbiApO1xyXG5cclxuICAgIGNvbnN0IGlzb3RvcGVUZXh0ID0gbmV3IFRleHQoICcnLCB7XHJcbiAgICAgIGZvbnQ6IG5ldyBQaGV0Rm9udCggMjAgKSxcclxuICAgICAgbWF4V2lkdGg6IDAuOSAqIFJFQURPVVRfU0laRS53aWR0aCxcclxuICAgICAgbWF4SGVpZ2h0OiAwLjkgKiBSRUFET1VUX1NJWkUuaGVpZ2h0XHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgcGFuZWwgPSBuZXcgUGFuZWwoIGlzb3RvcGVUZXh0LCB7XHJcbiAgICAgIG1pbldpZHRoOiBSRUFET1VUX1NJWkUud2lkdGgsXHJcbiAgICAgIG1pbkhlaWdodDogUkVBRE9VVF9TSVpFLmhlaWdodCxcclxuICAgICAgcmVzaXplOiBmYWxzZSxcclxuICAgICAgY29ybmVyUmFkaXVzOiA1LFxyXG4gICAgICBsaW5lV2lkdGg6IDEsXHJcbiAgICAgIGFsaWduOiAnY2VudGVyJ1xyXG4gICAgfSApO1xyXG5cclxuICAgIG51bWVyaWNMYXllci5hZGRDaGlsZCggcGFuZWwgKTtcclxuICAgIHBsdXNCdXR0b24ubGVmdCA9IHBhbmVsLnJpZ2h0ICsgNTtcclxuICAgIG1pbnVzQnV0dG9uLnJpZ2h0ID0gcGFuZWwubGVmdCAtIDU7XHJcbiAgICBwbHVzQnV0dG9uLmNlbnRlclkgPSBwYW5lbC5jZW50ZXJZO1xyXG4gICAgbWludXNCdXR0b24uY2VudGVyWSA9IHBhbmVsLmNlbnRlclk7XHJcblxyXG4gICAgY29uc3QgY2hhbmdlZFZhbHVlID0gdmFsdWUgPT4ge1xyXG4gICAgICBpc290b3BlVGV4dC5zZXRTdHJpbmcoIE1hdGguZmxvb3IoIHZhbHVlICkgKTtcclxuICAgICAgaXNvdG9wZVRleHQuY2VudGVyWCA9IFJFQURPVVRfU0laRS53aWR0aCAvIDI7XHJcbiAgICAgIGlzb3RvcGVUZXh0LmNlbnRlclkgPSBSRUFET1VUX1NJWkUuaGVpZ2h0ICogMC43NTtcclxuXHJcbiAgICAgIG1pbnVzQnV0dG9uLmVuYWJsZWQgPSAhKCBNYXRoLmZsb29yKCB2YWx1ZSApID09PSBtaW5SYW5nZSApO1xyXG4gICAgICBwbHVzQnV0dG9uLmVuYWJsZWQgPSAhKCBNYXRoLmZsb29yKCB2YWx1ZSApID09PSBtYXhSYW5nZSApO1xyXG4gICAgICBjb250cm9sbGVyLnNldElzb3RvcGVRdWFudGl0eSggTWF0aC5mbG9vciggdmFsdWUgKSApO1xyXG4gICAgfTtcclxuXHJcbiAgICBjb250cm9sbGVyLnF1YW50aXR5UHJvcGVydHkubGluayggY2hhbmdlZFZhbHVlICk7XHJcblxyXG4gICAgY29uc3QgaXNvdG9wZU5vZGUgPSBuZXcgSXNvdG9wZU5vZGUoIGNvbnRyb2xsZXIuY29udHJvbGxlcklzb3RvcGUsIDYsIHtcclxuICAgICAgc2hvd0xhYmVsOiBmYWxzZVxyXG4gICAgfSApO1xyXG4gICAgbGFiZWxMYXllci5hZGRDaGlsZCggaXNvdG9wZU5vZGUgKTtcclxuICAgIGNvbnN0IGNhcHRpb25MYWJlbCA9IG5ldyBUZXh0KCBjb250cm9sbGVyLmNhcHRpb24sIHtcclxuICAgICAgZm9udDogbmV3IFBoZXRGb250KCB7IHNpemU6IDE0IH0gKSxcclxuICAgICAgZmlsbDogJ2JsYWNrJyxcclxuICAgICAgbWF4V2lkdGg6IDYwXHJcbiAgICB9ICk7XHJcbiAgICBsYWJlbExheWVyLmFkZENoaWxkKCBjYXB0aW9uTGFiZWwgKTtcclxuICAgIGNhcHRpb25MYWJlbC5sZWZ0ID0gaXNvdG9wZU5vZGUucmlnaHQgKyA1O1xyXG4gICAgY2FwdGlvbkxhYmVsLmNlbnRlclkgPSBpc290b3BlTm9kZS5jZW50ZXJZO1xyXG4gICAgbGFiZWxMYXllci5ib3R0b20gPSBzbGlkZXJMYXllci50b3AgLSA1O1xyXG4gICAgbnVtZXJpY0xheWVyLmJvdHRvbSA9IGxhYmVsTGF5ZXIudG9wIC0gMTA7XHJcbiAgICBsYWJlbExheWVyLmNlbnRlclggPSBudW1lcmljTGF5ZXIuY2VudGVyWDtcclxuICAgIHNsaWRlckxheWVyLmNlbnRlclggPSBudW1lcmljTGF5ZXIuY2VudGVyWCArIDU7XHJcblxyXG4gICAgdGhpcy5kaXNwb3NlQ29udHJvbElzb3RvcGUgPSAoKSA9PiB7XHJcbiAgICAgIGNvbnRyb2xsZXIucXVhbnRpdHlQcm9wZXJ0eS51bmxpbmsoIGNoYW5nZWRWYWx1ZSApO1xyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIHJlbGVhc2UgbWVtb3J5IHJlZmVyZW5jZXNcclxuICAgKiBAcHVibGljXHJcbiAgICovXHJcbiAgZGlzcG9zZSgpIHtcclxuICAgIHRoaXMuZGlzcG9zZUNvbnRyb2xJc290b3BlKCk7XHJcbiAgICBzdXBlci5kaXNwb3NlKCk7XHJcbiAgfVxyXG59XHJcblxyXG5pc290b3Blc0FuZEF0b21pY01hc3MucmVnaXN0ZXIoICdDb250cm9sSXNvdG9wZScsIENvbnRyb2xJc290b3BlICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBDb250cm9sSXNvdG9wZTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFVBQVUsTUFBTSxrQ0FBa0M7QUFDekQsT0FBT0MsS0FBSyxNQUFNLDZCQUE2QjtBQUMvQyxPQUFPQyxRQUFRLE1BQU0seUNBQXlDO0FBQzlELFNBQVNDLElBQUksRUFBRUMsSUFBSSxRQUFRLG1DQUFtQztBQUM5RCxPQUFPQyxXQUFXLE1BQU0sMENBQTBDO0FBQ2xFLE9BQU9DLFdBQVcsTUFBTSwyQ0FBMkM7QUFDbkUsT0FBT0MsT0FBTyxNQUFNLCtCQUErQjtBQUNuRCxPQUFPQyxLQUFLLE1BQU0sNkJBQTZCO0FBQy9DLE9BQU9DLHFCQUFxQixNQUFNLGdDQUFnQztBQUVsRSxNQUFNQyxZQUFZLEdBQUcsSUFBSVYsVUFBVSxDQUFFLEVBQUUsRUFBRSxFQUFHLENBQUM7QUFFN0MsTUFBTVcsY0FBYyxTQUFTUixJQUFJLENBQUM7RUFFaEM7QUFDRjtBQUNBO0FBQ0E7QUFDQTtFQUNFUyxXQUFXQSxDQUFFQyxVQUFVLEVBQUVDLFFBQVEsRUFBRUMsUUFBUSxFQUFHO0lBQzVDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FB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