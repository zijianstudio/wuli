// Copyright 2016-2023, University of Colorado Boulder

/**
 * Panel that contains:
 * - equations that correspond to functions in the builder, in two forms
 * - control for switching between equation forms
 *
 * Performance is optimized so that the panel synchronizes with the model only while updatesEnabled is true.
 * When updatesEnabled is changed from false to true, anything that is 'dirty' is updated.
 * See updatesEnabled and dirty flags.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Vector2 from '../../../../../dot/js/Vector2.js';
import merge from '../../../../../phet-core/js/merge.js';
import PhetFont from '../../../../../scenery-phet/js/PhetFont.js';
import { Node, Rectangle, Text } from '../../../../../scenery/js/imports.js';
import Checkbox from '../../../../../sun/js/Checkbox.js';
import functionBuilder from '../../../functionBuilder.js';
import FunctionBuilderStrings from '../../../FunctionBuilderStrings.js';
import FBConstants from '../../FBConstants.js';
import FBQueryParameters from '../../FBQueryParameters.js';
import FBSymbols from '../../FBSymbols.js';
import HelpfulEquation from '../../model/equations/HelpfulEquation.js';
import SlopeInterceptEquation from '../../model/equations/SlopeInterceptEquation.js';
import HelpfulEquationNode from './HelpfulEquationNode.js';
import SlopeInterceptEquationNode from './SlopeInterceptEquationNode.js';
export default class EquationPanel extends Node {
  /**
   * @param {Builder} builder
   * @param {Property.<boolean>} slopeInterceptProperty - display the equation in slope-intercept form?
   * @param {Object} [options]
   */
  constructor(builder, slopeInterceptProperty, options) {
    options = merge({
      size: FBConstants.EQUATION_DRAWER_SIZE,
      cornerRadius: 0,
      xSymbol: FBSymbols.X,
      // {string} symbol for x, the input
      ySymbol: FBSymbols.Y,
      // {string} symbol for y, the output
      xyFont: FBConstants.EQUATION_OPTIONS.xyFont,
      // {Font} for x & y symbols
      xyAsCards: false,
      // {boolean} put x & y symbols on a rectangle background, like a card?
      updateEnabled: true // {boolean} does this node update when the model changes?
    }, options);

    // background
    const backgroundNode = new Rectangle(0, 0, options.size.width, options.size.height, {
      cornerRadius: options.cornerRadius,
      fill: 'white'
    });

    // 'simplify' checkbox, at bottom center
    const simplifyLabel = new Text(FunctionBuilderStrings.simplifyStringProperty, {
      font: new PhetFont(16),
      maxWidth: 0.75 * backgroundNode.width
    });
    const simplifyCheckbox = new Checkbox(slopeInterceptProperty, simplifyLabel, {
      centerX: backgroundNode.centerX,
      bottom: backgroundNode.bottom - 10
    });
    simplifyCheckbox.touchArea = simplifyCheckbox.localBounds.dilatedXY(10, 10);
    assert && assert(!options.children, 'decoration not supported');
    options.children = [backgroundNode, simplifyCheckbox];
    super(options);

    // @private
    this.backgroundNode = backgroundNode;
    this.builder = builder;
    this.slopeInterceptProperty = slopeInterceptProperty;
    this.xSymbol = options.xSymbol;
    this.ySymbol = options.ySymbol;
    this.xyFont = options.xyFont;
    this.xyAsCards = options.xyAsCards;
    this._updateEnabled = options.updateEnabled;
    this.dirty = true; // {boolean} does this node need to be updated?

    // @private initialized by updateEquations
    this.slopeInterceptEquationNode = null;
    this.helpfulEquationNode = null;

    // @private constrain equation to available space in panel
    this.equationMaxWidth = 0.85 * this.backgroundNode.width;
    this.equationMaxHeight = 0.9 * (simplifyCheckbox.top - this.backgroundNode.top);

    // @private center of space available for equations
    this.equationCenter = new Vector2(this.backgroundNode.centerX, this.backgroundNode.top + (simplifyCheckbox.top - this.backgroundNode.top) / 2);

    // Controls which equation is visible.
    // unlink unnecessary, instances exist for lifetime of the sim
    slopeInterceptProperty.lazyLink(slopeIntercept => {
      this.slopeInterceptEquationNode.visible = slopeIntercept;
      this.helpfulEquationNode.visible = !slopeIntercept;
    });

    // Updates equations when functions in the builder change.
    // removeListener unnecessary, instances exist for lifetime of the sim
    builder.functionChangedEmitter.addListener(() => {
      this.dirty = true;
      if (this.updateEnabled) {
        this.updateEquations();
      }
    });
    if (this.updateEnabled) {
      this.updateEquations();
    }
  }

  /**
   * Updates both equations. Calling this is relatively expensive, since it completely rebuilds the equations
   * and changes the scene graph.
   * @private
   */
  updateEquations() {
    assert && assert(this.updateEnabled && this.dirty);

    /*
     * Apply all functions in the builder. Pass in an empty array, because the functions in the builder
     * return MathFunction[], and the input is required to be of the same type as the output.
     */
    const mathFunctions = this.builder.applyAllFunctions([]);

    // PhET-specific form
    if (this.helpfulEquationNode) {
      this.removeChild(this.helpfulEquationNode);
    }
    const helpfulEquation = new HelpfulEquation(mathFunctions, {
      xSymbol: this.xSymbol
    });
    this.helpfulEquationNode = new HelpfulEquationNode(helpfulEquation, {
      xSymbol: this.xSymbol,
      ySymbol: this.ySymbol,
      xyFont: this.xyFont,
      xyAsCards: this.xyAsCards,
      maxWidth: this.equationMaxWidth,
      maxHeight: this.equationMaxHeight,
      center: this.equationCenter,
      visible: !this.slopeInterceptProperty.get()
    });
    this.addChild(this.helpfulEquationNode);

    // slope-intercept form
    if (this.slopeInterceptEquationNode) {
      this.removeChild(this.slopeInterceptEquationNode);
    }
    const slopeInterceptEquation = new SlopeInterceptEquation(mathFunctions, {
      xSymbol: this.xSymbol
    });
    this.slopeInterceptEquationNode = new SlopeInterceptEquationNode(slopeInterceptEquation.slope, slopeInterceptEquation.intercept, {
      showLeftHandSide: true,
      // show 'y =' part of equation
      xSymbol: this.xSymbol,
      ySymbol: this.ySymbol,
      xyFont: this.xyFont,
      xyAsCards: this.xyAsCards,
      maxWidth: this.equationMaxWidth,
      maxHeight: this.equationMaxHeight,
      center: this.equationCenter,
      visible: this.slopeInterceptProperty.get()
    });
    this.addChild(this.slopeInterceptEquationNode);
    this.dirty = false;
  }

  /**
   * Determines whether updating of this node is enabled.
   * @param {boolean} updateEnabled
   * @public
   */
  setUpdateEnabled(updateEnabled) {
    FBQueryParameters.log && console.log(`${this.constructor.name}.setUpdateEnabled ${updateEnabled}`);
    const wasUpdateEnabled = this._updateEnabled;
    this._updateEnabled = updateEnabled;
    if (this.dirty && !wasUpdateEnabled && updateEnabled) {
      this.updateEquations();
    }
  }
  set updateEnabled(value) {
    this.setUpdateEnabled(value);
  }

  /**
   * Is updating of this node enabled?
   * @returns {boolean}
   * @public
   */
  getUpdateEnabled() {
    return this._updateEnabled;
  }
  get updateEnabled() {
    return this.getUpdateEnabled();
  }
}
functionBuilder.register('EquationPanel', EquationPanel);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWZWN0b3IyIiwibWVyZ2UiLCJQaGV0Rm9udCIsIk5vZGUiLCJSZWN0YW5nbGUiLCJUZXh0IiwiQ2hlY2tib3giLCJmdW5jdGlvbkJ1aWxkZXIiLCJGdW5jdGlvbkJ1aWxkZXJTdHJpbmdzIiwiRkJDb25zdGFudHMiLCJGQlF1ZXJ5UGFyYW1ldGVycyIsIkZCU3ltYm9scyIsIkhlbHBmdWxFcXVhdGlvbiIsIlNsb3BlSW50ZXJjZXB0RXF1YXRpb24iLCJIZWxwZnVsRXF1YXRpb25Ob2RlIiwiU2xvcGVJbnRlcmNlcHRFcXVhdGlvbk5vZGUiLCJFcXVhdGlvblBhbmVsIiwiY29uc3RydWN0b3IiLCJidWlsZGVyIiwic2xvcGVJbnRlcmNlcHRQcm9wZXJ0eSIsIm9wdGlvbnMiLCJzaXplIiwiRVFVQVRJT05fRFJBV0VSX1NJWkUiLCJjb3JuZXJSYWRpdXMiLCJ4U3ltYm9sIiwiWCIsInlTeW1ib2wiLCJZIiwieHlGb250IiwiRVFVQVRJT05fT1BUSU9OUyIsInh5QXNDYXJkcyIsInVwZGF0ZUVuYWJsZWQiLCJiYWNrZ3JvdW5kTm9kZSIsIndpZHRoIiwiaGVpZ2h0IiwiZmlsbCIsInNpbXBsaWZ5TGFiZWwiLCJzaW1wbGlmeVN0cmluZ1Byb3BlcnR5IiwiZm9udCIsIm1heFdpZHRoIiwic2ltcGxpZnlDaGVja2JveCIsImNlbnRlclgiLCJib3R0b20iLCJ0b3VjaEFyZWEiLCJsb2NhbEJvdW5kcyIsImRpbGF0ZWRYWSIsImFzc2VydCIsImNoaWxkcmVuIiwiX3VwZGF0ZUVuYWJsZWQiLCJkaXJ0eSIsInNsb3BlSW50ZXJjZXB0RXF1YXRpb25Ob2RlIiwiaGVscGZ1bEVxdWF0aW9uTm9kZSIsImVxdWF0aW9uTWF4V2lkdGgiLCJlcXVhdGlvbk1heEhlaWdodCIsInRvcCIsImVxdWF0aW9uQ2VudGVyIiwibGF6eUxpbmsiLCJzbG9wZUludGVyY2VwdCIsInZpc2libGUiLCJmdW5jdGlvbkNoYW5nZWRFbWl0dGVyIiwiYWRkTGlzdGVuZXIiLCJ1cGRhdGVFcXVhdGlvbnMiLCJtYXRoRnVuY3Rpb25zIiwiYXBwbHlBbGxGdW5jdGlvbnMiLCJyZW1vdmVDaGlsZCIsImhlbHBmdWxFcXVhdGlvbiIsIm1heEhlaWdodCIsImNlbnRlciIsImdldCIsImFkZENoaWxkIiwic2xvcGVJbnRlcmNlcHRFcXVhdGlvbiIsInNsb3BlIiwiaW50ZXJjZXB0Iiwic2hvd0xlZnRIYW5kU2lkZSIsInNldFVwZGF0ZUVuYWJsZWQiLCJsb2ciLCJjb25zb2xlIiwibmFtZSIsIndhc1VwZGF0ZUVuYWJsZWQiLCJ2YWx1ZSIsImdldFVwZGF0ZUVuYWJsZWQiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkVxdWF0aW9uUGFuZWwuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTYtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogUGFuZWwgdGhhdCBjb250YWluczpcclxuICogLSBlcXVhdGlvbnMgdGhhdCBjb3JyZXNwb25kIHRvIGZ1bmN0aW9ucyBpbiB0aGUgYnVpbGRlciwgaW4gdHdvIGZvcm1zXHJcbiAqIC0gY29udHJvbCBmb3Igc3dpdGNoaW5nIGJldHdlZW4gZXF1YXRpb24gZm9ybXNcclxuICpcclxuICogUGVyZm9ybWFuY2UgaXMgb3B0aW1pemVkIHNvIHRoYXQgdGhlIHBhbmVsIHN5bmNocm9uaXplcyB3aXRoIHRoZSBtb2RlbCBvbmx5IHdoaWxlIHVwZGF0ZXNFbmFibGVkIGlzIHRydWUuXHJcbiAqIFdoZW4gdXBkYXRlc0VuYWJsZWQgaXMgY2hhbmdlZCBmcm9tIGZhbHNlIHRvIHRydWUsIGFueXRoaW5nIHRoYXQgaXMgJ2RpcnR5JyBpcyB1cGRhdGVkLlxyXG4gKiBTZWUgdXBkYXRlc0VuYWJsZWQgYW5kIGRpcnR5IGZsYWdzLlxyXG4gKlxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCBQaGV0Rm9udCBmcm9tICcuLi8uLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvUGhldEZvbnQuanMnO1xyXG5pbXBvcnQgeyBOb2RlLCBSZWN0YW5nbGUsIFRleHQgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgQ2hlY2tib3ggZnJvbSAnLi4vLi4vLi4vLi4vLi4vc3VuL2pzL0NoZWNrYm94LmpzJztcclxuaW1wb3J0IGZ1bmN0aW9uQnVpbGRlciBmcm9tICcuLi8uLi8uLi9mdW5jdGlvbkJ1aWxkZXIuanMnO1xyXG5pbXBvcnQgRnVuY3Rpb25CdWlsZGVyU3RyaW5ncyBmcm9tICcuLi8uLi8uLi9GdW5jdGlvbkJ1aWxkZXJTdHJpbmdzLmpzJztcclxuaW1wb3J0IEZCQ29uc3RhbnRzIGZyb20gJy4uLy4uL0ZCQ29uc3RhbnRzLmpzJztcclxuaW1wb3J0IEZCUXVlcnlQYXJhbWV0ZXJzIGZyb20gJy4uLy4uL0ZCUXVlcnlQYXJhbWV0ZXJzLmpzJztcclxuaW1wb3J0IEZCU3ltYm9scyBmcm9tICcuLi8uLi9GQlN5bWJvbHMuanMnO1xyXG5pbXBvcnQgSGVscGZ1bEVxdWF0aW9uIGZyb20gJy4uLy4uL21vZGVsL2VxdWF0aW9ucy9IZWxwZnVsRXF1YXRpb24uanMnO1xyXG5pbXBvcnQgU2xvcGVJbnRlcmNlcHRFcXVhdGlvbiBmcm9tICcuLi8uLi9tb2RlbC9lcXVhdGlvbnMvU2xvcGVJbnRlcmNlcHRFcXVhdGlvbi5qcyc7XHJcbmltcG9ydCBIZWxwZnVsRXF1YXRpb25Ob2RlIGZyb20gJy4vSGVscGZ1bEVxdWF0aW9uTm9kZS5qcyc7XHJcbmltcG9ydCBTbG9wZUludGVyY2VwdEVxdWF0aW9uTm9kZSBmcm9tICcuL1Nsb3BlSW50ZXJjZXB0RXF1YXRpb25Ob2RlLmpzJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEVxdWF0aW9uUGFuZWwgZXh0ZW5kcyBOb2RlIHtcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtCdWlsZGVyfSBidWlsZGVyXHJcbiAgICogQHBhcmFtIHtQcm9wZXJ0eS48Ym9vbGVhbj59IHNsb3BlSW50ZXJjZXB0UHJvcGVydHkgLSBkaXNwbGF5IHRoZSBlcXVhdGlvbiBpbiBzbG9wZS1pbnRlcmNlcHQgZm9ybT9cclxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IoIGJ1aWxkZXIsIHNsb3BlSW50ZXJjZXB0UHJvcGVydHksIG9wdGlvbnMgKSB7XHJcblxyXG4gICAgb3B0aW9ucyA9IG1lcmdlKCB7XHJcbiAgICAgIHNpemU6IEZCQ29uc3RhbnRzLkVRVUFUSU9OX0RSQVdFUl9TSVpFLFxyXG4gICAgICBjb3JuZXJSYWRpdXM6IDAsXHJcbiAgICAgIHhTeW1ib2w6IEZCU3ltYm9scy5YLCAvLyB7c3RyaW5nfSBzeW1ib2wgZm9yIHgsIHRoZSBpbnB1dFxyXG4gICAgICB5U3ltYm9sOiBGQlN5bWJvbHMuWSwgLy8ge3N0cmluZ30gc3ltYm9sIGZvciB5LCB0aGUgb3V0cHV0XHJcbiAgICAgIHh5Rm9udDogRkJDb25zdGFudHMuRVFVQVRJT05fT1BUSU9OUy54eUZvbnQsIC8vIHtGb250fSBmb3IgeCAmIHkgc3ltYm9sc1xyXG4gICAgICB4eUFzQ2FyZHM6IGZhbHNlLCAvLyB7Ym9vbGVhbn0gcHV0IHggJiB5IHN5bWJvbHMgb24gYSByZWN0YW5nbGUgYmFja2dyb3VuZCwgbGlrZSBhIGNhcmQ/XHJcbiAgICAgIHVwZGF0ZUVuYWJsZWQ6IHRydWUgLy8ge2Jvb2xlYW59IGRvZXMgdGhpcyBub2RlIHVwZGF0ZSB3aGVuIHRoZSBtb2RlbCBjaGFuZ2VzP1xyXG4gICAgfSwgb3B0aW9ucyApO1xyXG5cclxuICAgIC8vIGJhY2tncm91bmRcclxuICAgIGNvbnN0IGJhY2tncm91bmROb2RlID0gbmV3IFJlY3RhbmdsZSggMCwgMCwgb3B0aW9ucy5zaXplLndpZHRoLCBvcHRpb25zLnNpemUuaGVpZ2h0LCB7XHJcbiAgICAgIGNvcm5lclJhZGl1czogb3B0aW9ucy5jb3JuZXJSYWRpdXMsXHJcbiAgICAgIGZpbGw6ICd3aGl0ZSdcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyAnc2ltcGxpZnknIGNoZWNrYm94LCBhdCBib3R0b20gY2VudGVyXHJcbiAgICBjb25zdCBzaW1wbGlmeUxhYmVsID0gbmV3IFRleHQoIEZ1bmN0aW9uQnVpbGRlclN0cmluZ3Muc2ltcGxpZnlTdHJpbmdQcm9wZXJ0eSwge1xyXG4gICAgICBmb250OiBuZXcgUGhldEZvbnQoIDE2ICksXHJcbiAgICAgIG1heFdpZHRoOiAwLjc1ICogYmFja2dyb3VuZE5vZGUud2lkdGhcclxuICAgIH0gKTtcclxuICAgIGNvbnN0IHNpbXBsaWZ5Q2hlY2tib3ggPSBuZXcgQ2hlY2tib3goIHNsb3BlSW50ZXJjZXB0UHJvcGVydHksIHNpbXBsaWZ5TGFiZWwsIHtcclxuICAgICAgY2VudGVyWDogYmFja2dyb3VuZE5vZGUuY2VudGVyWCxcclxuICAgICAgYm90dG9tOiBiYWNrZ3JvdW5kTm9kZS5ib3R0b20gLSAxMFxyXG4gICAgfSApO1xyXG4gICAgc2ltcGxpZnlDaGVja2JveC50b3VjaEFyZWEgPSBzaW1wbGlmeUNoZWNrYm94LmxvY2FsQm91bmRzLmRpbGF0ZWRYWSggMTAsIDEwICk7XHJcblxyXG4gICAgYXNzZXJ0ICYmIGFzc2VydCggIW9wdGlvbnMuY2hpbGRyZW4sICdkZWNvcmF0aW9uIG5vdCBzdXBwb3J0ZWQnICk7XHJcbiAgICBvcHRpb25zLmNoaWxkcmVuID0gWyBiYWNrZ3JvdW5kTm9kZSwgc2ltcGxpZnlDaGVja2JveCBdO1xyXG5cclxuICAgIHN1cGVyKCBvcHRpb25zICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGVcclxuICAgIHRoaXMuYmFja2dyb3VuZE5vZGUgPSBiYWNrZ3JvdW5kTm9kZTtcclxuICAgIHRoaXMuYnVpbGRlciA9IGJ1aWxkZXI7XHJcbiAgICB0aGlzLnNsb3BlSW50ZXJjZXB0UHJvcGVydHkgPSBzbG9wZUludGVyY2VwdFByb3BlcnR5O1xyXG4gICAgdGhpcy54U3ltYm9sID0gb3B0aW9ucy54U3ltYm9sO1xyXG4gICAgdGhpcy55U3ltYm9sID0gb3B0aW9ucy55U3ltYm9sO1xyXG4gICAgdGhpcy54eUZvbnQgPSBvcHRpb25zLnh5Rm9udDtcclxuICAgIHRoaXMueHlBc0NhcmRzID0gb3B0aW9ucy54eUFzQ2FyZHM7XHJcbiAgICB0aGlzLl91cGRhdGVFbmFibGVkID0gb3B0aW9ucy51cGRhdGVFbmFibGVkO1xyXG4gICAgdGhpcy5kaXJ0eSA9IHRydWU7IC8vIHtib29sZWFufSBkb2VzIHRoaXMgbm9kZSBuZWVkIHRvIGJlIHVwZGF0ZWQ/XHJcblxyXG4gICAgLy8gQHByaXZhdGUgaW5pdGlhbGl6ZWQgYnkgdXBkYXRlRXF1YXRpb25zXHJcbiAgICB0aGlzLnNsb3BlSW50ZXJjZXB0RXF1YXRpb25Ob2RlID0gbnVsbDtcclxuICAgIHRoaXMuaGVscGZ1bEVxdWF0aW9uTm9kZSA9IG51bGw7XHJcblxyXG4gICAgLy8gQHByaXZhdGUgY29uc3RyYWluIGVxdWF0aW9uIHRvIGF2YWlsYWJsZSBzcGFjZSBpbiBwYW5lbFxyXG4gICAgdGhpcy5lcXVhdGlvbk1heFdpZHRoID0gMC44NSAqIHRoaXMuYmFja2dyb3VuZE5vZGUud2lkdGg7XHJcbiAgICB0aGlzLmVxdWF0aW9uTWF4SGVpZ2h0ID0gMC45ICogKCBzaW1wbGlmeUNoZWNrYm94LnRvcCAtIHRoaXMuYmFja2dyb3VuZE5vZGUudG9wICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGUgY2VudGVyIG9mIHNwYWNlIGF2YWlsYWJsZSBmb3IgZXF1YXRpb25zXHJcbiAgICB0aGlzLmVxdWF0aW9uQ2VudGVyID0gbmV3IFZlY3RvcjIoXHJcbiAgICAgIHRoaXMuYmFja2dyb3VuZE5vZGUuY2VudGVyWCxcclxuICAgICAgdGhpcy5iYWNrZ3JvdW5kTm9kZS50b3AgKyAoIHNpbXBsaWZ5Q2hlY2tib3gudG9wIC0gdGhpcy5iYWNrZ3JvdW5kTm9kZS50b3AgKSAvIDJcclxuICAgICk7XHJcblxyXG4gICAgLy8gQ29udHJvbHMgd2hpY2ggZXF1YXRpb24gaXMgdmlzaWJsZS5cclxuICAgIC8vIHVubGluayB1bm5lY2Vzc2FyeSwgaW5zdGFuY2VzIGV4aXN0IGZvciBsaWZldGltZSBvZiB0aGUgc2ltXHJcbiAgICBzbG9wZUludGVyY2VwdFByb3BlcnR5LmxhenlMaW5rKCBzbG9wZUludGVyY2VwdCA9PiB7XHJcbiAgICAgIHRoaXMuc2xvcGVJbnRlcmNlcHRFcXVhdGlvbk5vZGUudmlzaWJsZSA9IHNsb3BlSW50ZXJjZXB0O1xyXG4gICAgICB0aGlzLmhlbHBmdWxFcXVhdGlvbk5vZGUudmlzaWJsZSA9ICFzbG9wZUludGVyY2VwdDtcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBVcGRhdGVzIGVxdWF0aW9ucyB3aGVuIGZ1bmN0aW9ucyBpbiB0aGUgYnVpbGRlciBjaGFuZ2UuXHJcbiAgICAvLyByZW1vdmVMaXN0ZW5lciB1bm5lY2Vzc2FyeSwgaW5zdGFuY2VzIGV4aXN0IGZvciBsaWZldGltZSBvZiB0aGUgc2ltXHJcbiAgICBidWlsZGVyLmZ1bmN0aW9uQ2hhbmdlZEVtaXR0ZXIuYWRkTGlzdGVuZXIoICgpID0+IHtcclxuICAgICAgdGhpcy5kaXJ0eSA9IHRydWU7XHJcbiAgICAgIGlmICggdGhpcy51cGRhdGVFbmFibGVkICkge1xyXG4gICAgICAgIHRoaXMudXBkYXRlRXF1YXRpb25zKCk7XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuXHJcbiAgICBpZiAoIHRoaXMudXBkYXRlRW5hYmxlZCApIHtcclxuICAgICAgdGhpcy51cGRhdGVFcXVhdGlvbnMoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFVwZGF0ZXMgYm90aCBlcXVhdGlvbnMuIENhbGxpbmcgdGhpcyBpcyByZWxhdGl2ZWx5IGV4cGVuc2l2ZSwgc2luY2UgaXQgY29tcGxldGVseSByZWJ1aWxkcyB0aGUgZXF1YXRpb25zXHJcbiAgICogYW5kIGNoYW5nZXMgdGhlIHNjZW5lIGdyYXBoLlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgdXBkYXRlRXF1YXRpb25zKCkge1xyXG5cclxuICAgIGFzc2VydCAmJiBhc3NlcnQoIHRoaXMudXBkYXRlRW5hYmxlZCAmJiB0aGlzLmRpcnR5ICk7XHJcblxyXG4gICAgLypcclxuICAgICAqIEFwcGx5IGFsbCBmdW5jdGlvbnMgaW4gdGhlIGJ1aWxkZXIuIFBhc3MgaW4gYW4gZW1wdHkgYXJyYXksIGJlY2F1c2UgdGhlIGZ1bmN0aW9ucyBpbiB0aGUgYnVpbGRlclxyXG4gICAgICogcmV0dXJuIE1hdGhGdW5jdGlvbltdLCBhbmQgdGhlIGlucHV0IGlzIHJlcXVpcmVkIHRvIGJlIG9mIHRoZSBzYW1lIHR5cGUgYXMgdGhlIG91dHB1dC5cclxuICAgICAqL1xyXG4gICAgY29uc3QgbWF0aEZ1bmN0aW9ucyA9IHRoaXMuYnVpbGRlci5hcHBseUFsbEZ1bmN0aW9ucyggW10gKTtcclxuXHJcbiAgICAvLyBQaEVULXNwZWNpZmljIGZvcm1cclxuICAgIGlmICggdGhpcy5oZWxwZnVsRXF1YXRpb25Ob2RlICkge1xyXG4gICAgICB0aGlzLnJlbW92ZUNoaWxkKCB0aGlzLmhlbHBmdWxFcXVhdGlvbk5vZGUgKTtcclxuICAgIH1cclxuICAgIGNvbnN0IGhlbHBmdWxFcXVhdGlvbiA9IG5ldyBIZWxwZnVsRXF1YXRpb24oIG1hdGhGdW5jdGlvbnMsIHtcclxuICAgICAgeFN5bWJvbDogdGhpcy54U3ltYm9sXHJcbiAgICB9ICk7XHJcbiAgICB0aGlzLmhlbHBmdWxFcXVhdGlvbk5vZGUgPSBuZXcgSGVscGZ1bEVxdWF0aW9uTm9kZSggaGVscGZ1bEVxdWF0aW9uLCB7XHJcbiAgICAgIHhTeW1ib2w6IHRoaXMueFN5bWJvbCxcclxuICAgICAgeVN5bWJvbDogdGhpcy55U3ltYm9sLFxyXG4gICAgICB4eUZvbnQ6IHRoaXMueHlGb250LFxyXG4gICAgICB4eUFzQ2FyZHM6IHRoaXMueHlBc0NhcmRzLFxyXG4gICAgICBtYXhXaWR0aDogdGhpcy5lcXVhdGlvbk1heFdpZHRoLFxyXG4gICAgICBtYXhIZWlnaHQ6IHRoaXMuZXF1YXRpb25NYXhIZWlnaHQsXHJcbiAgICAgIGNlbnRlcjogdGhpcy5lcXVhdGlvbkNlbnRlcixcclxuICAgICAgdmlzaWJsZTogIXRoaXMuc2xvcGVJbnRlcmNlcHRQcm9wZXJ0eS5nZXQoKVxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5hZGRDaGlsZCggdGhpcy5oZWxwZnVsRXF1YXRpb25Ob2RlICk7XHJcblxyXG4gICAgLy8gc2xvcGUtaW50ZXJjZXB0IGZvcm1cclxuICAgIGlmICggdGhpcy5zbG9wZUludGVyY2VwdEVxdWF0aW9uTm9kZSApIHtcclxuICAgICAgdGhpcy5yZW1vdmVDaGlsZCggdGhpcy5zbG9wZUludGVyY2VwdEVxdWF0aW9uTm9kZSApO1xyXG4gICAgfVxyXG4gICAgY29uc3Qgc2xvcGVJbnRlcmNlcHRFcXVhdGlvbiA9IG5ldyBTbG9wZUludGVyY2VwdEVxdWF0aW9uKCBtYXRoRnVuY3Rpb25zLCB7XHJcbiAgICAgIHhTeW1ib2w6IHRoaXMueFN5bWJvbFxyXG4gICAgfSApO1xyXG4gICAgdGhpcy5zbG9wZUludGVyY2VwdEVxdWF0aW9uTm9kZSA9IG5ldyBTbG9wZUludGVyY2VwdEVxdWF0aW9uTm9kZShcclxuICAgICAgc2xvcGVJbnRlcmNlcHRFcXVhdGlvbi5zbG9wZSwgc2xvcGVJbnRlcmNlcHRFcXVhdGlvbi5pbnRlcmNlcHQsIHtcclxuICAgICAgICBzaG93TGVmdEhhbmRTaWRlOiB0cnVlLCAvLyBzaG93ICd5ID0nIHBhcnQgb2YgZXF1YXRpb25cclxuICAgICAgICB4U3ltYm9sOiB0aGlzLnhTeW1ib2wsXHJcbiAgICAgICAgeVN5bWJvbDogdGhpcy55U3ltYm9sLFxyXG4gICAgICAgIHh5Rm9udDogdGhpcy54eUZvbnQsXHJcbiAgICAgICAgeHlBc0NhcmRzOiB0aGlzLnh5QXNDYXJkcyxcclxuICAgICAgICBtYXhXaWR0aDogdGhpcy5lcXVhdGlvbk1heFdpZHRoLFxyXG4gICAgICAgIG1heEhlaWdodDogdGhpcy5lcXVhdGlvbk1heEhlaWdodCxcclxuICAgICAgICBjZW50ZXI6IHRoaXMuZXF1YXRpb25DZW50ZXIsXHJcbiAgICAgICAgdmlzaWJsZTogdGhpcy5zbG9wZUludGVyY2VwdFByb3BlcnR5LmdldCgpXHJcbiAgICAgIH0gKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHRoaXMuc2xvcGVJbnRlcmNlcHRFcXVhdGlvbk5vZGUgKTtcclxuXHJcbiAgICB0aGlzLmRpcnR5ID0gZmFsc2U7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBEZXRlcm1pbmVzIHdoZXRoZXIgdXBkYXRpbmcgb2YgdGhpcyBub2RlIGlzIGVuYWJsZWQuXHJcbiAgICogQHBhcmFtIHtib29sZWFufSB1cGRhdGVFbmFibGVkXHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIHNldFVwZGF0ZUVuYWJsZWQoIHVwZGF0ZUVuYWJsZWQgKSB7XHJcbiAgICBGQlF1ZXJ5UGFyYW1ldGVycy5sb2cgJiYgY29uc29sZS5sb2coIGAke3RoaXMuY29uc3RydWN0b3IubmFtZX0uc2V0VXBkYXRlRW5hYmxlZCAke3VwZGF0ZUVuYWJsZWR9YCApO1xyXG4gICAgY29uc3Qgd2FzVXBkYXRlRW5hYmxlZCA9IHRoaXMuX3VwZGF0ZUVuYWJsZWQ7XHJcbiAgICB0aGlzLl91cGRhdGVFbmFibGVkID0gdXBkYXRlRW5hYmxlZDtcclxuICAgIGlmICggdGhpcy5kaXJ0eSAmJiAhd2FzVXBkYXRlRW5hYmxlZCAmJiB1cGRhdGVFbmFibGVkICkge1xyXG4gICAgICB0aGlzLnVwZGF0ZUVxdWF0aW9ucygpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgc2V0IHVwZGF0ZUVuYWJsZWQoIHZhbHVlICkgeyB0aGlzLnNldFVwZGF0ZUVuYWJsZWQoIHZhbHVlICk7IH1cclxuXHJcbiAgLyoqXHJcbiAgICogSXMgdXBkYXRpbmcgb2YgdGhpcyBub2RlIGVuYWJsZWQ/XHJcbiAgICogQHJldHVybnMge2Jvb2xlYW59XHJcbiAgICogQHB1YmxpY1xyXG4gICAqL1xyXG4gIGdldFVwZGF0ZUVuYWJsZWQoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5fdXBkYXRlRW5hYmxlZDtcclxuICB9XHJcblxyXG4gIGdldCB1cGRhdGVFbmFibGVkKCkgeyByZXR1cm4gdGhpcy5nZXRVcGRhdGVFbmFibGVkKCk7IH1cclxufVxyXG5cclxuZnVuY3Rpb25CdWlsZGVyLnJlZ2lzdGVyKCAnRXF1YXRpb25QYW5lbCcsIEVxdWF0aW9uUGFuZWwgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsT0FBTyxNQUFNLGtDQUFrQztBQUN0RCxPQUFPQyxLQUFLLE1BQU0sc0NBQXNDO0FBQ3hELE9BQU9DLFFBQVEsTUFBTSw0Q0FBNEM7QUFDakUsU0FBU0MsSUFBSSxFQUFFQyxTQUFTLEVBQUVDLElBQUksUUFBUSxzQ0FBc0M7QUFDNUUsT0FBT0MsUUFBUSxNQUFNLG1DQUFtQztBQUN4RCxPQUFPQyxlQUFlLE1BQU0sNkJBQTZCO0FBQ3pELE9BQU9DLHNCQUFzQixNQUFNLG9DQUFvQztBQUN2RSxPQUFPQyxXQUFXLE1BQU0sc0JBQXNCO0FBQzlDLE9BQU9DLGlCQUFpQixNQUFNLDRCQUE0QjtBQUMxRCxPQUFPQyxTQUFTLE1BQU0sb0JBQW9CO0FBQzFDLE9BQU9DLGVBQWUsTUFBTSwwQ0FBMEM7QUFDdEUsT0FBT0Msc0JBQXNCLE1BQU0saURBQWlEO0FBQ3BGLE9BQU9DLG1CQUFtQixNQUFNLDBCQUEwQjtBQUMxRCxPQUFPQywwQkFBMEIsTUFBTSxpQ0FBaUM7QUFFeEUsZUFBZSxNQUFNQyxhQUFhLFNBQVNiLElBQUksQ0FBQztFQUU5QztBQUNGO0FBQ0E7QUFDQTtBQUNBO0VBQ0VjLFdBQVdBLENBQUVDLE9BQU8sRUFBRUMsc0JBQXNC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