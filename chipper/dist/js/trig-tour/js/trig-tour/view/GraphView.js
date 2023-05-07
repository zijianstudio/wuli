// Copyright 2015-2022, University of Colorado Boulder

/**
 * View of Graph of sin, cos, or tan vs. theta, at bottom of stage, below unit circle
 *
 * The graph exists in a panel that can be minimized so that the graph is hidden on the display.  Since the
 * panel needs to shrink down to the size of the title when minimized, AccordionBox could not be used.
 *
 * The GraphView is constructed with TrigPlotsNode and TrigTourGraphAxesNode.  The TrigTourGraphAxesNode contains
 * the axes and labels and the TrigTourPlotsNode handles drawing the plot shape and path rendering.  This file
 * puts them together with a grabbable indicator arrow that points to the current value of theta and the function.
 *
 * @author Michael Dubson (PhET developer) on 6/3/2015.
 */

import Property from '../../../../axon/js/Property.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import MathSymbols from '../../../../scenery-phet/js/MathSymbols.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Circle, HBox, Line, Node, Rectangle, SimpleDragHandler, Spacer, Text } from '../../../../scenery/js/imports.js';
import ExpandCollapseButton from '../../../../sun/js/ExpandCollapseButton.js';
import Panel from '../../../../sun/js/Panel.js';
import trigTour from '../../trigTour.js';
import TrigTourStrings from '../../TrigTourStrings.js';
import TrigTourModel from '../model/TrigTourModel.js';
import TrigFunctionLabelText from './TrigFunctionLabelText.js';
import TrigIndicatorArrowNode from './TrigIndicatorArrowNode.js';
import TrigPlotsNode from './TrigPlotsNode.js';
import TrigTourColors from './TrigTourColors.js';
import TrigTourGraphAxesNode from './TrigTourGraphAxesNode.js';

//strings
const cosString = TrigTourStrings.cos;
const sinString = TrigTourStrings.sin;
const tanString = TrigTourStrings.tan;
const vsString = TrigTourStrings.vs;

//constants
const BACKGROUND_COLOR = TrigTourColors.BACKGROUND_COLOR;
const COS_COLOR = TrigTourColors.COS_COLOR;
const SIN_COLOR = TrigTourColors.SIN_COLOR;
const TAN_COLOR = TrigTourColors.TAN_COLOR;
const LINE_COLOR = TrigTourColors.LINE_COLOR;
const TEXT_COLOR_GRAY = TrigTourColors.TEXT_COLOR_GRAY;
const VIEW_BACKGROUND_COLOR = TrigTourColors.VIEW_BACKGROUND_COLOR;
const DISPLAY_FONT = new PhetFont(20);
const ITALIC_DISPLAY_FONT = new PhetFont({
  size: 20,
  style: 'italic'
});
class GraphView extends Node {
  /**
   * Constructor for view of Graph, which displays sin, cos, or tan vs angle theta in either degrees or radians, and
   * has a draggable handle for changing the angle.
   *
   * @param {TrigTourModel} trigTourModel
   * @param {number} height of y-axis on graph
   * @param {number} width of x-axis on graph
   * @param {ViewProperties} viewProperties - which graph is visible, one of 'cos', 'sin', or 'tan'
   */
  constructor(trigTourModel, height, width, viewProperties) {
    // Call the super constructor
    super();

    // @private
    this.trigTourModel = trigTourModel;
    this.viewProperties = viewProperties;
    this.expandedProperty = new Property(true); // @private, Graph can be hidden with expandCollapse button

    // Graph drawing code is determined empirically, numbers are chosen based on what 'looks good'.
    const marginWidth = 25; // distance between edge of Node and edge of nearest full wavelength
    const wavelength = (width - 2 * marginWidth) / 4; //wavelength of sinusoidal curve in view coordinates
    this.amplitude = 0.475 * height; // @private amplitude of sinusoidal curve in view coordinates
    const numberOfWavelengths = 2 * 2; // number of full wavelengths displayed, must be even to keep graph symmetric

    const buttonSpacer = new Spacer(17, 0);

    // @private
    this.graphTitle = new Text('', {
      font: DISPLAY_FONT,
      maxWidth: width / 3
    });
    this.titleDisplayHBox = new HBox({
      children: [buttonSpacer, this.graphTitle],
      spacing: 5
    });
    const panelOptions = {
      fill: 'white',
      stroke: TEXT_COLOR_GRAY,
      lineWidth: 2,
      // width of the background border
      xMargin: 12,
      yMargin: 5,
      cornerRadius: 5,
      // radius of the rounded corners on the background
      // resize: false, // dynamically resize when content bounds change
      backgroundPickable: false,
      align: 'left',
      // {string} horizontal of content in the pane, left|center|right
      minWidth: 0 // minimum width of the panel
    };

    // @private when graph is collapsed/hidden, a title is displayed
    this.titleDisplayPanel = new Panel(this.titleDisplayHBox, panelOptions);
    this.expandCollapseButton = new ExpandCollapseButton(this.expandedProperty, {
      sideLength: 15,
      cursor: 'pointer'
    });
    let hitBound = 30;
    let midX = this.expandCollapseButton.centerX;
    const midY = this.expandCollapseButton.centerY;
    this.expandCollapseButton.mouseArea = new Bounds2(midX - hitBound, midY - hitBound, midX + hitBound, midY + hitBound);
    this.expandCollapseButton.touchArea = new Bounds2(midX - hitBound, midY - hitBound, midX + hitBound, midY + hitBound);

    // draw white background
    const backgroundHeight = 1.2 * height;
    const backgroundWidth = 1.05 * width;
    const arcRadius = 10;
    const backgroundRectangle = new Rectangle(-backgroundWidth / 2, -(backgroundHeight / 2) - 5, backgroundWidth, backgroundHeight, arcRadius, arcRadius, {
      fill: VIEW_BACKGROUND_COLOR,
      stroke: TEXT_COLOR_GRAY,
      lineWidth: 2
    });

    // align expandCollapseButton and titleDisplayButton
    this.expandCollapseButton.left = backgroundRectangle.left + 7;
    this.expandCollapseButton.top = backgroundRectangle.top + 7;
    this.titleDisplayPanel.left = backgroundRectangle.left;
    this.titleDisplayPanel.top = backgroundRectangle.top;

    // draw right and left border rectangles, which serve to hide indicator line when it is off the graph
    const borderWidth = 400;
    const borderHeight = 1000;
    const rightBorder = new Rectangle(-backgroundWidth / 2 - borderWidth - 1, -0.8 * borderHeight, borderWidth, borderHeight, {
      fill: BACKGROUND_COLOR
    });
    const leftBorder = new Rectangle(backgroundWidth / 2 + 1, -0.8 * borderHeight, borderWidth, borderHeight, {
      fill: BACKGROUND_COLOR
    });

    // @public (read-only) axes node for displaying axes on the graph
    this.graphAxesNode = new TrigTourGraphAxesNode(width, wavelength, numberOfWavelengths, this.amplitude, viewProperties);

    // @public (read-only) node containing paths of the trig curves sin, cos, and tan
    this.trigPlotsNode = new TrigPlotsNode(wavelength, numberOfWavelengths, this.amplitude, viewProperties.graphProperty);

    // SingularityIndicator is a dashed vertical line indicating singularity in tan function at angle = +/- 90 deg
    this.singularityIndicator = new Line(0, -800, 0, 400, {
      stroke: TAN_COLOR,
      lineWidth: 2,
      lineDash: [10, 5],
      cursor: 'pointer'
    });

    // Lines are not draggable.  An invisible rectangle needs to cover the singularity indicator so that the user
    // can  drag it once it appears.
    hitBound = 20;
    const minY = this.singularityIndicator.bottom;
    const maxY = this.singularityIndicator.top;
    midX = this.singularityIndicator.centerX;
    this.singularityRectangle = new Rectangle(midX - hitBound, minY, midX + 2 * hitBound, -maxY, {
      cursor: 'pointer',
      visible: false,
      opacity: 0,
      // this needs to be completely invisible
      center: this.singularityIndicator.center
    });
    this.singularityIndicator.visible = false;
    this.trigPlotsNode.addChild(this.singularityIndicator);
    this.trigPlotsNode.addChild(this.singularityRectangle);

    // trigIndicatorArrowNode is a vertical arrow on the trig curve showing current value of angle and
    // trigFunction(angle) a red dot on top of the indicator line echoes red dot on unit circle
    this.trigIndicatorArrowNode = new TrigIndicatorArrowNode(this.amplitude, 'vertical', {
      tailWidth: 4,
      lineWidth: 1,
      headWidth: 12,
      headHeight: 20,
      cursor: 'pointer'
    });
    const interactionArea = new Bounds2(-hitBound, -height / 2, hitBound, height / 2);
    this.trigIndicatorArrowNode.mouseArea = interactionArea;
    this.trigIndicatorArrowNode.touchArea = interactionArea;
    this.redDotHandle = new Circle(7, {
      stroke: LINE_COLOR,
      fill: 'red',
      cursor: 'pointer'
    });
    this.trigIndicatorArrowNode.addChild(this.redDotHandle);

    // All graphic elements, curves, axes, labels, etc are placed on display node, with visibility set by
    // expandCollapseButton
    const displayNode = new Node();

    // Rendering order for display children.
    displayNode.children = [this.graphAxesNode.axisNode, this.trigPlotsNode, this.graphAxesNode.labelsNode, this.trigIndicatorArrowNode, rightBorder, leftBorder];
    this.children = [backgroundRectangle, this.titleDisplayPanel, this.expandCollapseButton, displayNode];

    // link visibility to the expandCollapseButton
    this.expandedProperty.link(expanded => {
      backgroundRectangle.visible = expanded;
      displayNode.visible = expanded;
      this.titleDisplayPanel.visible = !expanded;
    });
    const dragHandler = new SimpleDragHandler({
      allowTouchSnag: true,
      drag: e => {
        const position = this.trigIndicatorArrowNode.globalToParentPoint(e.pointer.point); //returns Vector2
        const fullAngle = 2 * Math.PI * position.x / wavelength; // in radians

        // make sure the full angle does not exceed max allowed angle
        trigTourModel.checkMaxAngleExceeded();
        if (!trigTourModel.maxAngleExceededProperty.value) {
          if (!viewProperties.specialAnglesVisibleProperty.value) {
            trigTourModel.setFullAngleInRadians(fullAngle);
          } else {
            trigTourModel.setSpecialAngleWithFullAngle(fullAngle);
          }
        } else {
          // max angle exceeded, ony update if user tries to decrease magnitude of fullAngle
          if (Math.abs(fullAngle) < TrigTourModel.MAX_FULL_ANGLE) {
            trigTourModel.setFullAngleInRadians(fullAngle);
          }
        }
      }
    });

    // add a drag handler to the indicatorArrowNode
    this.trigIndicatorArrowNode.addInputListener(dragHandler);
    this.singularityRectangle.addInputListener(dragHandler);

    // Register for synchronization with model
    // function that reduces the indicator arrow tail width around the tan function singularity
    const setIndicatorTailWidth = () => {
      const tanSize = Math.abs(trigTourModel.tan());
      if (this.viewProperties.graphProperty.value === 'tan' && tanSize > 1.5) {
        this.trigIndicatorArrowNode.setTailWidth(Math.max(2, 5 - 0.1 * tanSize));
      } else {
        this.trigIndicatorArrowNode.setTailWidth(5);
      }
    };
    trigTourModel.fullAngleProperty.link(fullAngle => {
      const xPos = fullAngle / (2 * Math.PI) * wavelength;
      this.trigIndicatorArrowNode.x = xPos;
      this.singularityIndicator.x = xPos;
      this.singularityRectangle.x = xPos;
      setIndicatorTailWidth();
      this.setTrigIndicatorArrowNode();
    });
    viewProperties.graphProperty.link(graph => {
      // whenever the graph changes, make sure that the trigIndicatorArrowNode has a correctly sized tail width
      setIndicatorTailWidth();

      // set title bar in GraphView
      this.setTitleBarText(graph);
      if (trigTourModel.singularityProperty.value) {
        if (graph === 'cos' || graph === 'sin') {
          this.trigIndicatorArrowNode.opacity = 1;
          this.singularityIndicator.visible = false;
          this.singularityRectangle.visible = false;
        } else {
          // always want indicatorLine grabbable, so do NOT want indicatorLine.visible = false
          this.trigIndicatorArrowNode.opacity = 0;
          this.singularityIndicator.visible = true;
          this.singularityRectangle.visible = true;
        }
      }
      this.setTrigIndicatorArrowNode();
    });
    trigTourModel.singularityProperty.link(singularity => {
      if (this.viewProperties.graphProperty.value === 'tan') {
        this.singularityIndicator.visible = singularity;
        this.singularityRectangle.visible = singularity;
        // trigIndicatorArrowNode must always be draggable, so it must adjust visibility by setting opacity
        if (singularity) {
          this.trigIndicatorArrowNode.opacity = 0;
        } else {
          this.trigIndicatorArrowNode.opacity = 1;
        }
      }
    });
  }

  /**
   * Set the indicator line, which is a draggable, vertical arrow indicating current position on graph.
   * @private
   */
  setTrigIndicatorArrowNode() {
    const cosNow = this.trigTourModel.cos();
    const sinNow = this.trigTourModel.sin();
    const tanNow = this.trigTourModel.tan();
    const setIndicatorAndHandle = (trigValue, indicatorColor) => {
      this.trigIndicatorArrowNode.setEndPoint(trigValue * this.amplitude);
      this.trigIndicatorArrowNode.setColor(indicatorColor);
      this.redDotHandle.y = -trigValue * this.amplitude;
    };
    if (this.viewProperties.graphProperty.value === 'cos') {
      setIndicatorAndHandle(cosNow, COS_COLOR);
    } else if (this.viewProperties.graphProperty.value === 'sin') {
      setIndicatorAndHandle(sinNow, SIN_COLOR);
    } else if (this.viewProperties.graphProperty.value === 'tan') {
      setIndicatorAndHandle(tanNow, TAN_COLOR);
    } else {
      //Do nothing, following line for debugging only
      console.error('ERROR in GraphView.setTrigIndicatorArrowNode()');
    }
  }

  /**
   * Set the title bar text.  Different strings in the title require different font styles.  HTML text should be
   * avoided because it causes issues in performance.  So the text is built up here.
   * @private
   *
   * @param {string} trigString - the label for the trig function
   */
  setTitleBarText(trigString) {
    // determine the appropriate trig function string for the title.
    let trigTitleString;
    if (trigString === 'cos') {
      trigTitleString = cosString;
    }
    if (trigString === 'sin') {
      trigTitleString = sinString;
    } else if (trigString === 'tan') {
      trigTitleString = tanString;
    }

    // create each text component
    const variableThetaText = new Text(MathSymbols.THETA, {
      font: ITALIC_DISPLAY_FONT
    });
    const vsText = new Text(vsString, {
      font: DISPLAY_FONT
    });

    // build up and format the title
    const trigFunctionLabelText = new TrigFunctionLabelText(trigTitleString);

    // everything formatted in an HBox
    const titleTextHBox = new HBox({
      children: [trigFunctionLabelText, vsText, variableThetaText],
      spacing: 6,
      resize: false
    });

    // update the content of the title HBox, removing the title child, and inserting it back after update
    this.titleDisplayHBox.removeChildWithIndex(this.graphTitle, this.titleDisplayHBox.children.indexOf(this.graphTitle));
    this.graphTitle = titleTextHBox;
    this.titleDisplayHBox.insertChild(this.titleDisplayHBox.children.length, this.graphTitle);
  }
}
trigTour.register('GraphView', GraphView);
export default GraphView;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm9wZXJ0eSIsIkJvdW5kczIiLCJNYXRoU3ltYm9scyIsIlBoZXRGb250IiwiQ2lyY2xlIiwiSEJveCIsIkxpbmUiLCJOb2RlIiwiUmVjdGFuZ2xlIiwiU2ltcGxlRHJhZ0hhbmRsZXIiLCJTcGFjZXIiLCJUZXh0IiwiRXhwYW5kQ29sbGFwc2VCdXR0b24iLCJQYW5lbCIsInRyaWdUb3VyIiwiVHJpZ1RvdXJTdHJpbmdzIiwiVHJpZ1RvdXJNb2RlbCIsIlRyaWdGdW5jdGlvbkxhYmVsVGV4dCIsIlRyaWdJbmRpY2F0b3JBcnJvd05vZGUiLCJUcmlnUGxvdHNOb2RlIiwiVHJpZ1RvdXJDb2xvcnMiLCJUcmlnVG91ckdyYXBoQXhlc05vZGUiLCJjb3NTdHJpbmciLCJjb3MiLCJzaW5TdHJpbmciLCJzaW4iLCJ0YW5TdHJpbmciLCJ0YW4iLCJ2c1N0cmluZyIsInZzIiwiQkFDS0dST1VORF9DT0xPUiIsIkNPU19DT0xPUiIsIlNJTl9DT0xPUiIsIlRBTl9DT0xPUiIsIkxJTkVfQ09MT1IiLCJURVhUX0NPTE9SX0dSQVkiLCJWSUVXX0JBQ0tHUk9VTkRfQ09MT1IiLCJESVNQTEFZX0ZPTlQiLCJJVEFMSUNfRElTUExBWV9GT05UIiwic2l6ZSIsInN0eWxlIiwiR3JhcGhWaWV3IiwiY29uc3RydWN0b3IiLCJ0cmlnVG91ck1vZGVsIiwiaGVpZ2h0Iiwid2lkdGgiLCJ2aWV3UHJvcGVydGllcyIsImV4cGFuZGVkUHJvcGVydHkiLCJtYXJnaW5XaWR0aCIsIndhdmVsZW5ndGgiLCJhbXBsaXR1ZGUiLCJudW1iZXJPZldhdmVsZW5ndGhzIiwiYnV0dG9uU3BhY2VyIiwiZ3JhcGhUaXRsZSIsImZvbnQiLCJtYXhXaWR0aCIsInRpdGxlRGlzcGxheUhCb3giLCJjaGlsZHJlbiIsInNwYWNpbmciLCJwYW5lbE9wdGlvbnMiLCJmaWxsIiwic3Ryb2tlIiwibGluZVdpZHRoIiwieE1hcmdpbiIsInlNYXJnaW4iLCJjb3JuZXJSYWRpdXMiLCJiYWNrZ3JvdW5kUGlja2FibGUiLCJhbGlnbiIsIm1pbldpZHRoIiwidGl0bGVEaXNwbGF5UGFuZWwiLCJleHBhbmRDb2xsYXBzZUJ1dHRvbiIsInNpZGVMZW5ndGgiLCJjdXJzb3IiLCJoaXRCb3VuZCIsIm1pZFgiLCJjZW50ZXJYIiwibWlkWSIsImNlbnRlclkiLCJtb3VzZUFyZWEiLCJ0b3VjaEFyZWEiLCJiYWNrZ3JvdW5kSGVpZ2h0IiwiYmFja2dyb3VuZFdpZHRoIiwiYXJjUmFkaXVzIiwiYmFja2dyb3VuZFJlY3RhbmdsZSIsImxlZnQiLCJ0b3AiLCJib3JkZXJXaWR0aCIsImJvcmRlckhlaWdodCIsInJpZ2h0Qm9yZGVyIiwibGVmdEJvcmRlciIsImdyYXBoQXhlc05vZGUiLCJ0cmlnUGxvdHNOb2RlIiwiZ3JhcGhQcm9wZXJ0eSIsInNpbmd1bGFyaXR5SW5kaWNhdG9yIiwibGluZURhc2giLCJtaW5ZIiwiYm90dG9tIiwibWF4WSIsInNpbmd1bGFyaXR5UmVjdGFuZ2xlIiwidmlzaWJsZSIsIm9wYWNpdHkiLCJjZW50ZXIiLCJhZGRDaGlsZCIsInRyaWdJbmRpY2F0b3JBcnJvd05vZGUiLCJ0YWlsV2lkdGgiLCJoZWFkV2lkdGgiLCJoZWFkSGVpZ2h0IiwiaW50ZXJhY3Rpb25BcmVhIiwicmVkRG90SGFuZGxlIiwiZGlzcGxheU5vZGUiLCJheGlzTm9kZSIsImxhYmVsc05vZGUiLCJsaW5rIiwiZXhwYW5kZWQiLCJkcmFnSGFuZGxlciIsImFsbG93VG91Y2hTbmFnIiwiZHJhZyIsImUiLCJwb3NpdGlvbiIsImdsb2JhbFRvUGFyZW50UG9pbnQiLCJwb2ludGVyIiwicG9pbnQiLCJmdWxsQW5nbGUiLCJNYXRoIiwiUEkiLCJ4IiwiY2hlY2tNYXhBbmdsZUV4Y2VlZGVkIiwibWF4QW5nbGVFeGNlZWRlZFByb3BlcnR5IiwidmFsdWUiLCJzcGVjaWFsQW5nbGVzVmlzaWJsZVByb3BlcnR5Iiwic2V0RnVsbEFuZ2xlSW5SYWRpYW5zIiwic2V0U3BlY2lhbEFuZ2xlV2l0aEZ1bGxBbmdsZSIsImFicyIsIk1BWF9GVUxMX0FOR0xFIiwiYWRkSW5wdXRMaXN0ZW5lciIsInNldEluZGljYXRvclRhaWxXaWR0aCIsInRhblNpemUiLCJzZXRUYWlsV2lkdGgiLCJtYXgiLCJmdWxsQW5nbGVQcm9wZXJ0eSIsInhQb3MiLCJzZXRUcmlnSW5kaWNhdG9yQXJyb3dOb2RlIiwiZ3JhcGgiLCJzZXRUaXRsZUJhclRleHQiLCJzaW5ndWxhcml0eVByb3BlcnR5Iiwic2luZ3VsYXJpdHkiLCJjb3NOb3ciLCJzaW5Ob3ciLCJ0YW5Ob3ciLCJzZXRJbmRpY2F0b3JBbmRIYW5kbGUiLCJ0cmlnVmFsdWUiLCJpbmRpY2F0b3JDb2xvciIsInNldEVuZFBvaW50Iiwic2V0Q29sb3IiLCJ5IiwiY29uc29sZSIsImVycm9yIiwidHJpZ1N0cmluZyIsInRyaWdUaXRsZVN0cmluZyIsInZhcmlhYmxlVGhldGFUZXh0IiwiVEhFVEEiLCJ2c1RleHQiLCJ0cmlnRnVuY3Rpb25MYWJlbFRleHQiLCJ0aXRsZVRleHRIQm94IiwicmVzaXplIiwicmVtb3ZlQ2hpbGRXaXRoSW5kZXgiLCJpbmRleE9mIiwiaW5zZXJ0Q2hpbGQiLCJsZW5ndGgiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkdyYXBoVmlldy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNS0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBWaWV3IG9mIEdyYXBoIG9mIHNpbiwgY29zLCBvciB0YW4gdnMuIHRoZXRhLCBhdCBib3R0b20gb2Ygc3RhZ2UsIGJlbG93IHVuaXQgY2lyY2xlXHJcbiAqXHJcbiAqIFRoZSBncmFwaCBleGlzdHMgaW4gYSBwYW5lbCB0aGF0IGNhbiBiZSBtaW5pbWl6ZWQgc28gdGhhdCB0aGUgZ3JhcGggaXMgaGlkZGVuIG9uIHRoZSBkaXNwbGF5LiAgU2luY2UgdGhlXHJcbiAqIHBhbmVsIG5lZWRzIHRvIHNocmluayBkb3duIHRvIHRoZSBzaXplIG9mIHRoZSB0aXRsZSB3aGVuIG1pbmltaXplZCwgQWNjb3JkaW9uQm94IGNvdWxkIG5vdCBiZSB1c2VkLlxyXG4gKlxyXG4gKiBUaGUgR3JhcGhWaWV3IGlzIGNvbnN0cnVjdGVkIHdpdGggVHJpZ1Bsb3RzTm9kZSBhbmQgVHJpZ1RvdXJHcmFwaEF4ZXNOb2RlLiAgVGhlIFRyaWdUb3VyR3JhcGhBeGVzTm9kZSBjb250YWluc1xyXG4gKiB0aGUgYXhlcyBhbmQgbGFiZWxzIGFuZCB0aGUgVHJpZ1RvdXJQbG90c05vZGUgaGFuZGxlcyBkcmF3aW5nIHRoZSBwbG90IHNoYXBlIGFuZCBwYXRoIHJlbmRlcmluZy4gIFRoaXMgZmlsZVxyXG4gKiBwdXRzIHRoZW0gdG9nZXRoZXIgd2l0aCBhIGdyYWJiYWJsZSBpbmRpY2F0b3IgYXJyb3cgdGhhdCBwb2ludHMgdG8gdGhlIGN1cnJlbnQgdmFsdWUgb2YgdGhldGEgYW5kIHRoZSBmdW5jdGlvbi5cclxuICpcclxuICogQGF1dGhvciBNaWNoYWVsIER1YnNvbiAoUGhFVCBkZXZlbG9wZXIpIG9uIDYvMy8yMDE1LlxyXG4gKi9cclxuXHJcbmltcG9ydCBQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi8uLi9heG9uL2pzL1Byb3BlcnR5LmpzJztcclxuaW1wb3J0IEJvdW5kczIgZnJvbSAnLi4vLi4vLi4vLi4vZG90L2pzL0JvdW5kczIuanMnO1xyXG5pbXBvcnQgTWF0aFN5bWJvbHMgZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL01hdGhTeW1ib2xzLmpzJztcclxuaW1wb3J0IFBoZXRGb250IGZyb20gJy4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9QaGV0Rm9udC5qcyc7XHJcbmltcG9ydCB7IENpcmNsZSwgSEJveCwgTGluZSwgTm9kZSwgUmVjdGFuZ2xlLCBTaW1wbGVEcmFnSGFuZGxlciwgU3BhY2VyLCBUZXh0IH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IEV4cGFuZENvbGxhcHNlQnV0dG9uIGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9FeHBhbmRDb2xsYXBzZUJ1dHRvbi5qcyc7XHJcbmltcG9ydCBQYW5lbCBmcm9tICcuLi8uLi8uLi8uLi9zdW4vanMvUGFuZWwuanMnO1xyXG5pbXBvcnQgdHJpZ1RvdXIgZnJvbSAnLi4vLi4vdHJpZ1RvdXIuanMnO1xyXG5pbXBvcnQgVHJpZ1RvdXJTdHJpbmdzIGZyb20gJy4uLy4uL1RyaWdUb3VyU3RyaW5ncy5qcyc7XHJcbmltcG9ydCBUcmlnVG91ck1vZGVsIGZyb20gJy4uL21vZGVsL1RyaWdUb3VyTW9kZWwuanMnO1xyXG5pbXBvcnQgVHJpZ0Z1bmN0aW9uTGFiZWxUZXh0IGZyb20gJy4vVHJpZ0Z1bmN0aW9uTGFiZWxUZXh0LmpzJztcclxuaW1wb3J0IFRyaWdJbmRpY2F0b3JBcnJvd05vZGUgZnJvbSAnLi9UcmlnSW5kaWNhdG9yQXJyb3dOb2RlLmpzJztcclxuaW1wb3J0IFRyaWdQbG90c05vZGUgZnJvbSAnLi9UcmlnUGxvdHNOb2RlLmpzJztcclxuaW1wb3J0IFRyaWdUb3VyQ29sb3JzIGZyb20gJy4vVHJpZ1RvdXJDb2xvcnMuanMnO1xyXG5pbXBvcnQgVHJpZ1RvdXJHcmFwaEF4ZXNOb2RlIGZyb20gJy4vVHJpZ1RvdXJHcmFwaEF4ZXNOb2RlLmpzJztcclxuXHJcbi8vc3RyaW5nc1xyXG5jb25zdCBjb3NTdHJpbmcgPSBUcmlnVG91clN0cmluZ3MuY29zO1xyXG5jb25zdCBzaW5TdHJpbmcgPSBUcmlnVG91clN0cmluZ3Muc2luO1xyXG5jb25zdCB0YW5TdHJpbmcgPSBUcmlnVG91clN0cmluZ3MudGFuO1xyXG5jb25zdCB2c1N0cmluZyA9IFRyaWdUb3VyU3RyaW5ncy52cztcclxuXHJcbi8vY29uc3RhbnRzXHJcbmNvbnN0IEJBQ0tHUk9VTkRfQ09MT1IgPSBUcmlnVG91ckNvbG9ycy5CQUNLR1JPVU5EX0NPTE9SO1xyXG5jb25zdCBDT1NfQ09MT1IgPSBUcmlnVG91ckNvbG9ycy5DT1NfQ09MT1I7XHJcbmNvbnN0IFNJTl9DT0xPUiA9IFRyaWdUb3VyQ29sb3JzLlNJTl9DT0xPUjtcclxuY29uc3QgVEFOX0NPTE9SID0gVHJpZ1RvdXJDb2xvcnMuVEFOX0NPTE9SO1xyXG5jb25zdCBMSU5FX0NPTE9SID0gVHJpZ1RvdXJDb2xvcnMuTElORV9DT0xPUjtcclxuY29uc3QgVEVYVF9DT0xPUl9HUkFZID0gVHJpZ1RvdXJDb2xvcnMuVEVYVF9DT0xPUl9HUkFZO1xyXG5jb25zdCBWSUVXX0JBQ0tHUk9VTkRfQ09MT1IgPSBUcmlnVG91ckNvbG9ycy5WSUVXX0JBQ0tHUk9VTkRfQ09MT1I7XHJcbmNvbnN0IERJU1BMQVlfRk9OVCA9IG5ldyBQaGV0Rm9udCggMjAgKTtcclxuY29uc3QgSVRBTElDX0RJU1BMQVlfRk9OVCA9IG5ldyBQaGV0Rm9udCggeyBzaXplOiAyMCwgc3R5bGU6ICdpdGFsaWMnIH0gKTtcclxuXHJcbmNsYXNzIEdyYXBoVmlldyBleHRlbmRzIE5vZGUge1xyXG4gIC8qKlxyXG4gICAqIENvbnN0cnVjdG9yIGZvciB2aWV3IG9mIEdyYXBoLCB3aGljaCBkaXNwbGF5cyBzaW4sIGNvcywgb3IgdGFuIHZzIGFuZ2xlIHRoZXRhIGluIGVpdGhlciBkZWdyZWVzIG9yIHJhZGlhbnMsIGFuZFxyXG4gICAqIGhhcyBhIGRyYWdnYWJsZSBoYW5kbGUgZm9yIGNoYW5naW5nIHRoZSBhbmdsZS5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7VHJpZ1RvdXJNb2RlbH0gdHJpZ1RvdXJNb2RlbFxyXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBoZWlnaHQgb2YgeS1heGlzIG9uIGdyYXBoXHJcbiAgICogQHBhcmFtIHtudW1iZXJ9IHdpZHRoIG9mIHgtYXhpcyBvbiBncmFwaFxyXG4gICAqIEBwYXJhbSB7Vmlld1Byb3BlcnRpZXN9IHZpZXdQcm9wZXJ0aWVzIC0gd2hpY2ggZ3JhcGggaXMgdmlzaWJsZSwgb25lIG9mICdjb3MnLCAnc2luJywgb3IgJ3RhbidcclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggdHJpZ1RvdXJNb2RlbCwgaGVpZ2h0LCB3aWR0aCwgdmlld1Byb3BlcnRpZXMgKSB7XHJcblxyXG4gICAgLy8gQ2FsbCB0aGUgc3VwZXIgY29uc3RydWN0b3JcclxuICAgIHN1cGVyKCk7XHJcblxyXG4gICAgLy8gQHByaXZhdGVcclxuICAgIHRoaXMudHJpZ1RvdXJNb2RlbCA9IHRyaWdUb3VyTW9kZWw7XHJcbiAgICB0aGlzLnZpZXdQcm9wZXJ0aWVzID0gdmlld1Byb3BlcnRpZXM7XHJcbiAgICB0aGlzLmV4cGFuZGVkUHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIHRydWUgKTsgLy8gQHByaXZhdGUsIEdyYXBoIGNhbiBiZSBoaWRkZW4gd2l0aCBleHBhbmRDb2xsYXBzZSBidXR0b25cclxuXHJcbiAgICAvLyBHcmFwaCBkcmF3aW5nIGNvZGUgaXMgZGV0ZXJtaW5lZCBlbXBpcmljYWxseSwgbnVtYmVycyBhcmUgY2hvc2VuIGJhc2VkIG9uIHdoYXQgJ2xvb2tzIGdvb2QnLlxyXG4gICAgY29uc3QgbWFyZ2luV2lkdGggPSAyNTsgICAvLyBkaXN0YW5jZSBiZXR3ZWVuIGVkZ2Ugb2YgTm9kZSBhbmQgZWRnZSBvZiBuZWFyZXN0IGZ1bGwgd2F2ZWxlbmd0aFxyXG4gICAgY29uc3Qgd2F2ZWxlbmd0aCA9ICggd2lkdGggLSAyICogbWFyZ2luV2lkdGggKSAvIDQ7ICAvL3dhdmVsZW5ndGggb2Ygc2ludXNvaWRhbCBjdXJ2ZSBpbiB2aWV3IGNvb3JkaW5hdGVzXHJcbiAgICB0aGlzLmFtcGxpdHVkZSA9IDAuNDc1ICogaGVpZ2h0OyAgLy8gQHByaXZhdGUgYW1wbGl0dWRlIG9mIHNpbnVzb2lkYWwgY3VydmUgaW4gdmlldyBjb29yZGluYXRlc1xyXG4gICAgY29uc3QgbnVtYmVyT2ZXYXZlbGVuZ3RocyA9IDIgKiAyOyAgICAvLyBudW1iZXIgb2YgZnVsbCB3YXZlbGVuZ3RocyBkaXNwbGF5ZWQsIG11c3QgYmUgZXZlbiB0byBrZWVwIGdyYXBoIHN5bW1ldHJpY1xyXG5cclxuICAgIGNvbnN0IGJ1dHRvblNwYWNlciA9IG5ldyBTcGFjZXIoIDE3LCAwICk7XHJcblxyXG4gICAgLy8gQHByaXZhdGVcclxuICAgIHRoaXMuZ3JhcGhUaXRsZSA9IG5ldyBUZXh0KCAnJywgeyBmb250OiBESVNQTEFZX0ZPTlQsIG1heFdpZHRoOiB3aWR0aCAvIDMgfSApO1xyXG4gICAgdGhpcy50aXRsZURpc3BsYXlIQm94ID0gbmV3IEhCb3goIHsgY2hpbGRyZW46IFsgYnV0dG9uU3BhY2VyLCB0aGlzLmdyYXBoVGl0bGUgXSwgc3BhY2luZzogNSB9ICk7XHJcblxyXG4gICAgY29uc3QgcGFuZWxPcHRpb25zID0ge1xyXG4gICAgICBmaWxsOiAnd2hpdGUnLFxyXG4gICAgICBzdHJva2U6IFRFWFRfQ09MT1JfR1JBWSxcclxuICAgICAgbGluZVdpZHRoOiAyLCAvLyB3aWR0aCBvZiB0aGUgYmFja2dyb3VuZCBib3JkZXJcclxuICAgICAgeE1hcmdpbjogMTIsXHJcbiAgICAgIHlNYXJnaW46IDUsXHJcbiAgICAgIGNvcm5lclJhZGl1czogNSwgLy8gcmFkaXVzIG9mIHRoZSByb3VuZGVkIGNvcm5lcnMgb24gdGhlIGJhY2tncm91bmRcclxuICAgICAgLy8gcmVzaXplOiBmYWxzZSwgLy8gZHluYW1pY2FsbHkgcmVzaXplIHdoZW4gY29udGVudCBib3VuZHMgY2hhbmdlXHJcbiAgICAgIGJhY2tncm91bmRQaWNrYWJsZTogZmFsc2UsXHJcbiAgICAgIGFsaWduOiAnbGVmdCcsIC8vIHtzdHJpbmd9IGhvcml6b250YWwgb2YgY29udGVudCBpbiB0aGUgcGFuZSwgbGVmdHxjZW50ZXJ8cmlnaHRcclxuICAgICAgbWluV2lkdGg6IDAgLy8gbWluaW11bSB3aWR0aCBvZiB0aGUgcGFuZWxcclxuICAgIH07XHJcblxyXG4gICAgLy8gQHByaXZhdGUgd2hlbiBncmFwaCBpcyBjb2xsYXBzZWQvaGlkZGVuLCBhIHRpdGxlIGlzIGRpc3BsYXllZFxyXG4gICAgdGhpcy50aXRsZURpc3BsYXlQYW5lbCA9IG5ldyBQYW5lbCggdGhpcy50aXRsZURpc3BsYXlIQm94LCBwYW5lbE9wdGlvbnMgKTtcclxuICAgIHRoaXMuZXhwYW5kQ29sbGFwc2VCdXR0b24gPSBuZXcgRXhwYW5kQ29sbGFwc2VCdXR0b24oIHRoaXMuZXhwYW5kZWRQcm9wZXJ0eSwge1xyXG4gICAgICBzaWRlTGVuZ3RoOiAxNSxcclxuICAgICAgY3Vyc29yOiAncG9pbnRlcidcclxuICAgIH0gKTtcclxuICAgIGxldCBoaXRCb3VuZCA9IDMwO1xyXG4gICAgbGV0IG1pZFggPSB0aGlzLmV4cGFuZENvbGxhcHNlQnV0dG9uLmNlbnRlclg7XHJcbiAgICBjb25zdCBtaWRZID0gdGhpcy5leHBhbmRDb2xsYXBzZUJ1dHRvbi5jZW50ZXJZO1xyXG4gICAgdGhpcy5leHBhbmRDb2xsYXBzZUJ1dHRvbi5tb3VzZUFyZWEgPSBuZXcgQm91bmRzMiggbWlkWCAtIGhpdEJvdW5kLCBtaWRZIC0gaGl0Qm91bmQsIG1pZFggKyBoaXRCb3VuZCwgbWlkWSArIGhpdEJvdW5kICk7XHJcbiAgICB0aGlzLmV4cGFuZENvbGxhcHNlQnV0dG9uLnRvdWNoQXJlYSA9IG5ldyBCb3VuZHMyKCBtaWRYIC0gaGl0Qm91bmQsIG1pZFkgLSBoaXRCb3VuZCwgbWlkWCArIGhpdEJvdW5kLCBtaWRZICsgaGl0Qm91bmQgKTtcclxuXHJcbiAgICAvLyBkcmF3IHdoaXRlIGJhY2tncm91bmRcclxuICAgIGNvbnN0IGJhY2tncm91bmRIZWlnaHQgPSAxLjIgKiBoZWlnaHQ7XHJcbiAgICBjb25zdCBiYWNrZ3JvdW5kV2lkdGggPSAxLjA1ICogd2lkdGg7XHJcbiAgICBjb25zdCBhcmNSYWRpdXMgPSAxMDtcclxuICAgIGNvbnN0IGJhY2tncm91bmRSZWN0YW5nbGUgPSBuZXcgUmVjdGFuZ2xlKCAtYmFja2dyb3VuZFdpZHRoIC8gMiwgLSggYmFja2dyb3VuZEhlaWdodCAvIDIgKSAtIDUsIGJhY2tncm91bmRXaWR0aCwgYmFja2dyb3VuZEhlaWdodCwgYXJjUmFkaXVzLCBhcmNSYWRpdXMsIHtcclxuICAgICAgZmlsbDogVklFV19CQUNLR1JPVU5EX0NPTE9SLFxyXG4gICAgICBzdHJva2U6IFRFWFRfQ09MT1JfR1JBWSxcclxuICAgICAgbGluZVdpZHRoOiAyXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gYWxpZ24gZXhwYW5kQ29sbGFwc2VCdXR0b24gYW5kIHRpdGxlRGlzcGxheUJ1dHRvblxyXG4gICAgdGhpcy5leHBhbmRDb2xsYXBzZUJ1dHRvbi5sZWZ0ID0gYmFja2dyb3VuZFJlY3RhbmdsZS5sZWZ0ICsgNztcclxuICAgIHRoaXMuZXhwYW5kQ29sbGFwc2VCdXR0b24udG9wID0gYmFja2dyb3VuZFJlY3RhbmdsZS50b3AgKyA3O1xyXG4gICAgdGhpcy50aXRsZURpc3BsYXlQYW5lbC5sZWZ0ID0gYmFja2dyb3VuZFJlY3RhbmdsZS5sZWZ0O1xyXG4gICAgdGhpcy50aXRsZURpc3BsYXlQYW5lbC50b3AgPSBiYWNrZ3JvdW5kUmVjdGFuZ2xlLnRvcDtcclxuXHJcbiAgICAvLyBkcmF3IHJpZ2h0IGFuZCBsZWZ0IGJvcmRlciByZWN0YW5nbGVzLCB3aGljaCBzZXJ2ZSB0byBoaWRlIGluZGljYXRvciBsaW5lIHdoZW4gaXQgaXMgb2ZmIHRoZSBncmFwaFxyXG4gICAgY29uc3QgYm9yZGVyV2lkdGggPSA0MDA7XHJcbiAgICBjb25zdCBib3JkZXJIZWlnaHQgPSAxMDAwO1xyXG4gICAgY29uc3QgcmlnaHRCb3JkZXIgPSBuZXcgUmVjdGFuZ2xlKFxyXG4gICAgICAtYmFja2dyb3VuZFdpZHRoIC8gMiAtIGJvcmRlcldpZHRoIC0gMSxcclxuICAgICAgLTAuOCAqIGJvcmRlckhlaWdodCwgYm9yZGVyV2lkdGgsXHJcbiAgICAgIGJvcmRlckhlaWdodCxcclxuICAgICAgeyBmaWxsOiBCQUNLR1JPVU5EX0NPTE9SIH1cclxuICAgICk7XHJcbiAgICBjb25zdCBsZWZ0Qm9yZGVyID0gbmV3IFJlY3RhbmdsZShcclxuICAgICAgYmFja2dyb3VuZFdpZHRoIC8gMiArIDEsXHJcbiAgICAgIC0wLjggKiBib3JkZXJIZWlnaHQsXHJcbiAgICAgIGJvcmRlcldpZHRoLFxyXG4gICAgICBib3JkZXJIZWlnaHQsXHJcbiAgICAgIHsgZmlsbDogQkFDS0dST1VORF9DT0xPUiB9XHJcbiAgICApO1xyXG5cclxuICAgIC8vIEBwdWJsaWMgKHJlYWQtb25seSkgYXhlcyBub2RlIGZvciBkaXNwbGF5aW5nIGF4ZXMgb24gdGhlIGdyYXBoXHJcbiAgICB0aGlzLmdyYXBoQXhlc05vZGUgPSBuZXcgVHJpZ1RvdXJHcmFwaEF4ZXNOb2RlKCB3aWR0aCwgd2F2ZWxlbmd0aCwgbnVtYmVyT2ZXYXZlbGVuZ3RocywgdGhpcy5hbXBsaXR1ZGUsIHZpZXdQcm9wZXJ0aWVzICk7XHJcblxyXG4gICAgLy8gQHB1YmxpYyAocmVhZC1vbmx5KSBub2RlIGNvbnRhaW5pbmcgcGF0aHMgb2YgdGhlIHRyaWcgY3VydmVzIHNpbiwgY29zLCBhbmQgdGFuXHJcbiAgICB0aGlzLnRyaWdQbG90c05vZGUgPSBuZXcgVHJpZ1Bsb3RzTm9kZSggd2F2ZWxlbmd0aCwgbnVtYmVyT2ZXYXZlbGVuZ3RocywgdGhpcy5hbXBsaXR1ZGUsIHZpZXdQcm9wZXJ0aWVzLmdyYXBoUHJvcGVydHkgKTtcclxuXHJcbiAgICAvLyBTaW5ndWxhcml0eUluZGljYXRvciBpcyBhIGRhc2hlZCB2ZXJ0aWNhbCBsaW5lIGluZGljYXRpbmcgc2luZ3VsYXJpdHkgaW4gdGFuIGZ1bmN0aW9uIGF0IGFuZ2xlID0gKy8tIDkwIGRlZ1xyXG4gICAgdGhpcy5zaW5ndWxhcml0eUluZGljYXRvciA9IG5ldyBMaW5lKCAwLCAtODAwLCAwLCA0MDAsIHtcclxuICAgICAgc3Ryb2tlOiBUQU5fQ09MT1IsXHJcbiAgICAgIGxpbmVXaWR0aDogMixcclxuICAgICAgbGluZURhc2g6IFsgMTAsIDUgXSxcclxuICAgICAgY3Vyc29yOiAncG9pbnRlcidcclxuICAgIH0gKTtcclxuXHJcbiAgICAvLyBMaW5lcyBhcmUgbm90IGRyYWdnYWJsZS4gIEFuIGludmlzaWJsZSByZWN0YW5nbGUgbmVlZHMgdG8gY292ZXIgdGhlIHNpbmd1bGFyaXR5IGluZGljYXRvciBzbyB0aGF0IHRoZSB1c2VyXHJcbiAgICAvLyBjYW4gIGRyYWcgaXQgb25jZSBpdCBhcHBlYXJzLlxyXG4gICAgaGl0Qm91bmQgPSAyMDtcclxuICAgIGNvbnN0IG1pblkgPSB0aGlzLnNpbmd1bGFyaXR5SW5kaWNhdG9yLmJvdHRvbTtcclxuICAgIGNvbnN0IG1heFkgPSB0aGlzLnNpbmd1bGFyaXR5SW5kaWNhdG9yLnRvcDtcclxuICAgIG1pZFggPSB0aGlzLnNpbmd1bGFyaXR5SW5kaWNhdG9yLmNlbnRlclg7XHJcblxyXG4gICAgdGhpcy5zaW5ndWxhcml0eVJlY3RhbmdsZSA9IG5ldyBSZWN0YW5nbGUoIG1pZFggLSBoaXRCb3VuZCwgbWluWSwgbWlkWCArIDIgKiBoaXRCb3VuZCwgLW1heFksIHtcclxuICAgICAgY3Vyc29yOiAncG9pbnRlcicsXHJcbiAgICAgIHZpc2libGU6IGZhbHNlLFxyXG4gICAgICBvcGFjaXR5OiAwLCAvLyB0aGlzIG5lZWRzIHRvIGJlIGNvbXBsZXRlbHkgaW52aXNpYmxlXHJcbiAgICAgIGNlbnRlcjogdGhpcy5zaW5ndWxhcml0eUluZGljYXRvci5jZW50ZXJcclxuICAgIH0gKTtcclxuXHJcbiAgICB0aGlzLnNpbmd1bGFyaXR5SW5kaWNhdG9yLnZpc2libGUgPSBmYWxzZTtcclxuICAgIHRoaXMudHJpZ1Bsb3RzTm9kZS5hZGRDaGlsZCggdGhpcy5zaW5ndWxhcml0eUluZGljYXRvciApO1xyXG4gICAgdGhpcy50cmlnUGxvdHNOb2RlLmFkZENoaWxkKCB0aGlzLnNpbmd1bGFyaXR5UmVjdGFuZ2xlICk7XHJcblxyXG4gICAgLy8gdHJpZ0luZGljYXRvckFycm93Tm9kZSBpcyBhIHZlcnRpY2FsIGFycm93IG9uIHRoZSB0cmlnIGN1cnZlIHNob3dpbmcgY3VycmVudCB2YWx1ZSBvZiBhbmdsZSBhbmRcclxuICAgIC8vIHRyaWdGdW5jdGlvbihhbmdsZSkgYSByZWQgZG90IG9uIHRvcCBvZiB0aGUgaW5kaWNhdG9yIGxpbmUgZWNob2VzIHJlZCBkb3Qgb24gdW5pdCBjaXJjbGVcclxuICAgIHRoaXMudHJpZ0luZGljYXRvckFycm93Tm9kZSA9IG5ldyBUcmlnSW5kaWNhdG9yQXJyb3dOb2RlKCB0aGlzLmFtcGxpdHVkZSwgJ3ZlcnRpY2FsJywge1xyXG4gICAgICB0YWlsV2lkdGg6IDQsXHJcbiAgICAgIGxpbmVXaWR0aDogMSxcclxuICAgICAgaGVhZFdpZHRoOiAxMixcclxuICAgICAgaGVhZEhlaWdodDogMjAsXHJcbiAgICAgIGN1cnNvcjogJ3BvaW50ZXInXHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgaW50ZXJhY3Rpb25BcmVhID0gbmV3IEJvdW5kczIoIC1oaXRCb3VuZCwgLWhlaWdodCAvIDIsIGhpdEJvdW5kLCBoZWlnaHQgLyAyICk7XHJcbiAgICB0aGlzLnRyaWdJbmRpY2F0b3JBcnJvd05vZGUubW91c2VBcmVhID0gaW50ZXJhY3Rpb25BcmVhO1xyXG4gICAgdGhpcy50cmlnSW5kaWNhdG9yQXJyb3dOb2RlLnRvdWNoQXJlYSA9IGludGVyYWN0aW9uQXJlYTtcclxuICAgIHRoaXMucmVkRG90SGFuZGxlID0gbmV3IENpcmNsZSggNywgeyBzdHJva2U6IExJTkVfQ09MT1IsIGZpbGw6ICdyZWQnLCBjdXJzb3I6ICdwb2ludGVyJyB9ICk7XHJcbiAgICB0aGlzLnRyaWdJbmRpY2F0b3JBcnJvd05vZGUuYWRkQ2hpbGQoIHRoaXMucmVkRG90SGFuZGxlICk7XHJcblxyXG4gICAgLy8gQWxsIGdyYXBoaWMgZWxlbWVudHMsIGN1cnZlcywgYXhlcywgbGFiZWxzLCBldGMgYXJlIHBsYWNlZCBvbiBkaXNwbGF5IG5vZGUsIHdpdGggdmlzaWJpbGl0eSBzZXQgYnlcclxuICAgIC8vIGV4cGFuZENvbGxhcHNlQnV0dG9uXHJcbiAgICBjb25zdCBkaXNwbGF5Tm9kZSA9IG5ldyBOb2RlKCk7XHJcblxyXG4gICAgLy8gUmVuZGVyaW5nIG9yZGVyIGZvciBkaXNwbGF5IGNoaWxkcmVuLlxyXG4gICAgZGlzcGxheU5vZGUuY2hpbGRyZW4gPSBbXHJcbiAgICAgIHRoaXMuZ3JhcGhBeGVzTm9kZS5heGlzTm9kZSxcclxuICAgICAgdGhpcy50cmlnUGxvdHNOb2RlLFxyXG4gICAgICB0aGlzLmdyYXBoQXhlc05vZGUubGFiZWxzTm9kZSxcclxuICAgICAgdGhpcy50cmlnSW5kaWNhdG9yQXJyb3dOb2RlLFxyXG4gICAgICByaWdodEJvcmRlcixcclxuICAgICAgbGVmdEJvcmRlclxyXG4gICAgXTtcclxuXHJcbiAgICB0aGlzLmNoaWxkcmVuID0gW1xyXG4gICAgICBiYWNrZ3JvdW5kUmVjdGFuZ2xlLFxyXG4gICAgICB0aGlzLnRpdGxlRGlzcGxheVBhbmVsLFxyXG4gICAgICB0aGlzLmV4cGFuZENvbGxhcHNlQnV0dG9uLFxyXG4gICAgICBkaXNwbGF5Tm9kZVxyXG4gICAgXTtcclxuXHJcbiAgICAvLyBsaW5rIHZpc2liaWxpdHkgdG8gdGhlIGV4cGFuZENvbGxhcHNlQnV0dG9uXHJcbiAgICB0aGlzLmV4cGFuZGVkUHJvcGVydHkubGluayggZXhwYW5kZWQgPT4ge1xyXG4gICAgICBiYWNrZ3JvdW5kUmVjdGFuZ2xlLnZpc2libGUgPSBleHBhbmRlZDtcclxuICAgICAgZGlzcGxheU5vZGUudmlzaWJsZSA9IGV4cGFuZGVkO1xyXG4gICAgICB0aGlzLnRpdGxlRGlzcGxheVBhbmVsLnZpc2libGUgPSAhZXhwYW5kZWQ7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgY29uc3QgZHJhZ0hhbmRsZXIgPSBuZXcgU2ltcGxlRHJhZ0hhbmRsZXIoXHJcbiAgICAgIHtcclxuICAgICAgICBhbGxvd1RvdWNoU25hZzogdHJ1ZSxcclxuXHJcbiAgICAgICAgZHJhZzogZSA9PiB7XHJcbiAgICAgICAgICBjb25zdCBwb3NpdGlvbiA9IHRoaXMudHJpZ0luZGljYXRvckFycm93Tm9kZS5nbG9iYWxUb1BhcmVudFBvaW50KCBlLnBvaW50ZXIucG9pbnQgKTsgICAvL3JldHVybnMgVmVjdG9yMlxyXG4gICAgICAgICAgY29uc3QgZnVsbEFuZ2xlID0gKCAyICogTWF0aC5QSSAqIHBvc2l0aW9uLnggLyB3YXZlbGVuZ3RoICk7ICAgLy8gaW4gcmFkaWFuc1xyXG5cclxuICAgICAgICAgIC8vIG1ha2Ugc3VyZSB0aGUgZnVsbCBhbmdsZSBkb2VzIG5vdCBleGNlZWQgbWF4IGFsbG93ZWQgYW5nbGVcclxuICAgICAgICAgIHRyaWdUb3VyTW9kZWwuY2hlY2tNYXhBbmdsZUV4Y2VlZGVkKCk7XHJcblxyXG4gICAgICAgICAgaWYgKCAhdHJpZ1RvdXJNb2RlbC5tYXhBbmdsZUV4Y2VlZGVkUHJvcGVydHkudmFsdWUgKSB7XHJcbiAgICAgICAgICAgIGlmICggIXZpZXdQcm9wZXJ0aWVzLnNwZWNpYWxBbmdsZXNWaXNpYmxlUHJvcGVydHkudmFsdWUgKSB7XHJcbiAgICAgICAgICAgICAgdHJpZ1RvdXJNb2RlbC5zZXRGdWxsQW5nbGVJblJhZGlhbnMoIGZ1bGxBbmdsZSApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgIHRyaWdUb3VyTW9kZWwuc2V0U3BlY2lhbEFuZ2xlV2l0aEZ1bGxBbmdsZSggZnVsbEFuZ2xlICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAvLyBtYXggYW5nbGUgZXhjZWVkZWQsIG9ueSB1cGRhdGUgaWYgdXNlciB0cmllcyB0byBkZWNyZWFzZSBtYWduaXR1ZGUgb2YgZnVsbEFuZ2xlXHJcbiAgICAgICAgICAgIGlmICggTWF0aC5hYnMoIGZ1bGxBbmdsZSApIDwgVHJpZ1RvdXJNb2RlbC5NQVhfRlVMTF9BTkdMRSApIHtcclxuICAgICAgICAgICAgICB0cmlnVG91ck1vZGVsLnNldEZ1bGxBbmdsZUluUmFkaWFucyggZnVsbEFuZ2xlICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfVxyXG4gICAgICB9ICk7XHJcblxyXG4gICAgLy8gYWRkIGEgZHJhZyBoYW5kbGVyIHRvIHRoZSBpbmRpY2F0b3JBcnJvd05vZGVcclxuICAgIHRoaXMudHJpZ0luZGljYXRvckFycm93Tm9kZS5hZGRJbnB1dExpc3RlbmVyKCBkcmFnSGFuZGxlciApO1xyXG4gICAgdGhpcy5zaW5ndWxhcml0eVJlY3RhbmdsZS5hZGRJbnB1dExpc3RlbmVyKCBkcmFnSGFuZGxlciApO1xyXG5cclxuICAgIC8vIFJlZ2lzdGVyIGZvciBzeW5jaHJvbml6YXRpb24gd2l0aCBtb2RlbFxyXG4gICAgLy8gZnVuY3Rpb24gdGhhdCByZWR1Y2VzIHRoZSBpbmRpY2F0b3IgYXJyb3cgdGFpbCB3aWR0aCBhcm91bmQgdGhlIHRhbiBmdW5jdGlvbiBzaW5ndWxhcml0eVxyXG4gICAgY29uc3Qgc2V0SW5kaWNhdG9yVGFpbFdpZHRoID0gKCkgPT4ge1xyXG4gICAgICBjb25zdCB0YW5TaXplID0gTWF0aC5hYnMoIHRyaWdUb3VyTW9kZWwudGFuKCkgKTtcclxuICAgICAgaWYgKCB0aGlzLnZpZXdQcm9wZXJ0aWVzLmdyYXBoUHJvcGVydHkudmFsdWUgPT09ICd0YW4nICYmIHRhblNpemUgPiAxLjUgKSB7XHJcbiAgICAgICAgdGhpcy50cmlnSW5kaWNhdG9yQXJyb3dOb2RlLnNldFRhaWxXaWR0aCggTWF0aC5tYXgoIDIsIDUgLSAwLjEgKiB0YW5TaXplICkgKTtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIHtcclxuICAgICAgICB0aGlzLnRyaWdJbmRpY2F0b3JBcnJvd05vZGUuc2V0VGFpbFdpZHRoKCA1ICk7XHJcbiAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgdHJpZ1RvdXJNb2RlbC5mdWxsQW5nbGVQcm9wZXJ0eS5saW5rKCBmdWxsQW5nbGUgPT4ge1xyXG4gICAgICBjb25zdCB4UG9zID0gZnVsbEFuZ2xlIC8gKCAyICogTWF0aC5QSSApICogd2F2ZWxlbmd0aDtcclxuICAgICAgdGhpcy50cmlnSW5kaWNhdG9yQXJyb3dOb2RlLnggPSB4UG9zO1xyXG4gICAgICB0aGlzLnNpbmd1bGFyaXR5SW5kaWNhdG9yLnggPSB4UG9zO1xyXG4gICAgICB0aGlzLnNpbmd1bGFyaXR5UmVjdGFuZ2xlLnggPSB4UG9zO1xyXG4gICAgICBzZXRJbmRpY2F0b3JUYWlsV2lkdGgoKTtcclxuICAgICAgdGhpcy5zZXRUcmlnSW5kaWNhdG9yQXJyb3dOb2RlKCk7XHJcbiAgICB9ICk7XHJcblxyXG4gICAgdmlld1Byb3BlcnRpZXMuZ3JhcGhQcm9wZXJ0eS5saW5rKCBncmFwaCA9PiB7XHJcbiAgICAgIC8vIHdoZW5ldmVyIHRoZSBncmFwaCBjaGFuZ2VzLCBtYWtlIHN1cmUgdGhhdCB0aGUgdHJpZ0luZGljYXRvckFycm93Tm9kZSBoYXMgYSBjb3JyZWN0bHkgc2l6ZWQgdGFpbCB3aWR0aFxyXG4gICAgICBzZXRJbmRpY2F0b3JUYWlsV2lkdGgoKTtcclxuXHJcbiAgICAgIC8vIHNldCB0aXRsZSBiYXIgaW4gR3JhcGhWaWV3XHJcbiAgICAgIHRoaXMuc2V0VGl0bGVCYXJUZXh0KCBncmFwaCApO1xyXG4gICAgICBpZiAoIHRyaWdUb3VyTW9kZWwuc2luZ3VsYXJpdHlQcm9wZXJ0eS52YWx1ZSApIHtcclxuICAgICAgICBpZiAoIGdyYXBoID09PSAnY29zJyB8fCBncmFwaCA9PT0gJ3NpbicgKSB7XHJcbiAgICAgICAgICB0aGlzLnRyaWdJbmRpY2F0b3JBcnJvd05vZGUub3BhY2l0eSA9IDE7XHJcbiAgICAgICAgICB0aGlzLnNpbmd1bGFyaXR5SW5kaWNhdG9yLnZpc2libGUgPSBmYWxzZTtcclxuICAgICAgICAgIHRoaXMuc2luZ3VsYXJpdHlSZWN0YW5nbGUudmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgIC8vIGFsd2F5cyB3YW50IGluZGljYXRvckxpbmUgZ3JhYmJhYmxlLCBzbyBkbyBOT1Qgd2FudCBpbmRpY2F0b3JMaW5lLnZpc2libGUgPSBmYWxzZVxyXG4gICAgICAgICAgdGhpcy50cmlnSW5kaWNhdG9yQXJyb3dOb2RlLm9wYWNpdHkgPSAwO1xyXG4gICAgICAgICAgdGhpcy5zaW5ndWxhcml0eUluZGljYXRvci52aXNpYmxlID0gdHJ1ZTtcclxuICAgICAgICAgIHRoaXMuc2luZ3VsYXJpdHlSZWN0YW5nbGUudmlzaWJsZSA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIHRoaXMuc2V0VHJpZ0luZGljYXRvckFycm93Tm9kZSgpO1xyXG4gICAgfSApO1xyXG5cclxuICAgIHRyaWdUb3VyTW9kZWwuc2luZ3VsYXJpdHlQcm9wZXJ0eS5saW5rKCBzaW5ndWxhcml0eSA9PiB7XHJcbiAgICAgIGlmICggdGhpcy52aWV3UHJvcGVydGllcy5ncmFwaFByb3BlcnR5LnZhbHVlID09PSAndGFuJyApIHtcclxuICAgICAgICB0aGlzLnNpbmd1bGFyaXR5SW5kaWNhdG9yLnZpc2libGUgPSBzaW5ndWxhcml0eTtcclxuICAgICAgICB0aGlzLnNpbmd1bGFyaXR5UmVjdGFuZ2xlLnZpc2libGUgPSBzaW5ndWxhcml0eTtcclxuICAgICAgICAvLyB0cmlnSW5kaWNhdG9yQXJyb3dOb2RlIG11c3QgYWx3YXlzIGJlIGRyYWdnYWJsZSwgc28gaXQgbXVzdCBhZGp1c3QgdmlzaWJpbGl0eSBieSBzZXR0aW5nIG9wYWNpdHlcclxuICAgICAgICBpZiAoIHNpbmd1bGFyaXR5ICkge1xyXG4gICAgICAgICAgdGhpcy50cmlnSW5kaWNhdG9yQXJyb3dOb2RlLm9wYWNpdHkgPSAwO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgIHRoaXMudHJpZ0luZGljYXRvckFycm93Tm9kZS5vcGFjaXR5ID0gMTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0gKTtcclxuICB9XHJcblxyXG5cclxuICAvKipcclxuICAgKiBTZXQgdGhlIGluZGljYXRvciBsaW5lLCB3aGljaCBpcyBhIGRyYWdnYWJsZSwgdmVydGljYWwgYXJyb3cgaW5kaWNhdGluZyBjdXJyZW50IHBvc2l0aW9uIG9uIGdyYXBoLlxyXG4gICAqIEBwcml2YXRlXHJcbiAgICovXHJcbiAgc2V0VHJpZ0luZGljYXRvckFycm93Tm9kZSgpIHtcclxuICAgIGNvbnN0IGNvc05vdyA9IHRoaXMudHJpZ1RvdXJNb2RlbC5jb3MoKTtcclxuICAgIGNvbnN0IHNpbk5vdyA9IHRoaXMudHJpZ1RvdXJNb2RlbC5zaW4oKTtcclxuICAgIGNvbnN0IHRhbk5vdyA9IHRoaXMudHJpZ1RvdXJNb2RlbC50YW4oKTtcclxuXHJcbiAgICBjb25zdCBzZXRJbmRpY2F0b3JBbmRIYW5kbGUgPSAoIHRyaWdWYWx1ZSwgaW5kaWNhdG9yQ29sb3IgKSA9PiB7XHJcbiAgICAgIHRoaXMudHJpZ0luZGljYXRvckFycm93Tm9kZS5zZXRFbmRQb2ludCggdHJpZ1ZhbHVlICogdGhpcy5hbXBsaXR1ZGUgKTtcclxuICAgICAgdGhpcy50cmlnSW5kaWNhdG9yQXJyb3dOb2RlLnNldENvbG9yKCBpbmRpY2F0b3JDb2xvciApO1xyXG4gICAgICB0aGlzLnJlZERvdEhhbmRsZS55ID0gLXRyaWdWYWx1ZSAqIHRoaXMuYW1wbGl0dWRlO1xyXG4gICAgfTtcclxuICAgIGlmICggdGhpcy52aWV3UHJvcGVydGllcy5ncmFwaFByb3BlcnR5LnZhbHVlID09PSAnY29zJyApIHtcclxuICAgICAgc2V0SW5kaWNhdG9yQW5kSGFuZGxlKCBjb3NOb3csIENPU19DT0xPUiApO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoIHRoaXMudmlld1Byb3BlcnRpZXMuZ3JhcGhQcm9wZXJ0eS52YWx1ZSA9PT0gJ3NpbicgKSB7XHJcbiAgICAgIHNldEluZGljYXRvckFuZEhhbmRsZSggc2luTm93LCBTSU5fQ09MT1IgKTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKCB0aGlzLnZpZXdQcm9wZXJ0aWVzLmdyYXBoUHJvcGVydHkudmFsdWUgPT09ICd0YW4nICkge1xyXG4gICAgICBzZXRJbmRpY2F0b3JBbmRIYW5kbGUoIHRhbk5vdywgVEFOX0NPTE9SICk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgLy9EbyBub3RoaW5nLCBmb2xsb3dpbmcgbGluZSBmb3IgZGVidWdnaW5nIG9ubHlcclxuICAgICAgY29uc29sZS5lcnJvciggJ0VSUk9SIGluIEdyYXBoVmlldy5zZXRUcmlnSW5kaWNhdG9yQXJyb3dOb2RlKCknICk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTZXQgdGhlIHRpdGxlIGJhciB0ZXh0LiAgRGlmZmVyZW50IHN0cmluZ3MgaW4gdGhlIHRpdGxlIHJlcXVpcmUgZGlmZmVyZW50IGZvbnQgc3R5bGVzLiAgSFRNTCB0ZXh0IHNob3VsZCBiZVxyXG4gICAqIGF2b2lkZWQgYmVjYXVzZSBpdCBjYXVzZXMgaXNzdWVzIGluIHBlcmZvcm1hbmNlLiAgU28gdGhlIHRleHQgaXMgYnVpbHQgdXAgaGVyZS5cclxuICAgKiBAcHJpdmF0ZVxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IHRyaWdTdHJpbmcgLSB0aGUgbGFiZWwgZm9yIHRoZSB0cmlnIGZ1bmN0aW9uXHJcbiAgICovXHJcbiAgc2V0VGl0bGVCYXJUZXh0KCB0cmlnU3RyaW5nICkge1xyXG5cclxuICAgIC8vIGRldGVybWluZSB0aGUgYXBwcm9wcmlhdGUgdHJpZyBmdW5jdGlvbiBzdHJpbmcgZm9yIHRoZSB0aXRsZS5cclxuICAgIGxldCB0cmlnVGl0bGVTdHJpbmc7XHJcbiAgICBpZiAoIHRyaWdTdHJpbmcgPT09ICdjb3MnICkge1xyXG4gICAgICB0cmlnVGl0bGVTdHJpbmcgPSBjb3NTdHJpbmc7XHJcbiAgICB9XHJcbiAgICBpZiAoIHRyaWdTdHJpbmcgPT09ICdzaW4nICkge1xyXG4gICAgICB0cmlnVGl0bGVTdHJpbmcgPSBzaW5TdHJpbmc7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICggdHJpZ1N0cmluZyA9PT0gJ3RhbicgKSB7XHJcbiAgICAgIHRyaWdUaXRsZVN0cmluZyA9IHRhblN0cmluZztcclxuICAgIH1cclxuXHJcbiAgICAvLyBjcmVhdGUgZWFjaCB0ZXh0IGNvbXBvbmVudFxyXG4gICAgY29uc3QgdmFyaWFibGVUaGV0YVRleHQgPSBuZXcgVGV4dCggTWF0aFN5bWJvbHMuVEhFVEEsIHsgZm9udDogSVRBTElDX0RJU1BMQVlfRk9OVCB9ICk7XHJcbiAgICBjb25zdCB2c1RleHQgPSBuZXcgVGV4dCggdnNTdHJpbmcsIHsgZm9udDogRElTUExBWV9GT05UIH0gKTtcclxuXHJcbiAgICAvLyBidWlsZCB1cCBhbmQgZm9ybWF0IHRoZSB0aXRsZVxyXG4gICAgY29uc3QgdHJpZ0Z1bmN0aW9uTGFiZWxUZXh0ID0gbmV3IFRyaWdGdW5jdGlvbkxhYmVsVGV4dCggdHJpZ1RpdGxlU3RyaW5nICk7XHJcblxyXG4gICAgLy8gZXZlcnl0aGluZyBmb3JtYXR0ZWQgaW4gYW4gSEJveFxyXG4gICAgY29uc3QgdGl0bGVUZXh0SEJveCA9IG5ldyBIQm94KCB7XHJcbiAgICAgIGNoaWxkcmVuOiBbIHRyaWdGdW5jdGlvbkxhYmVsVGV4dCwgdnNUZXh0LCB2YXJpYWJsZVRoZXRhVGV4dCBdLFxyXG4gICAgICBzcGFjaW5nOiA2LFxyXG4gICAgICByZXNpemU6IGZhbHNlXHJcbiAgICB9ICk7XHJcblxyXG4gICAgLy8gdXBkYXRlIHRoZSBjb250ZW50IG9mIHRoZSB0aXRsZSBIQm94LCByZW1vdmluZyB0aGUgdGl0bGUgY2hpbGQsIGFuZCBpbnNlcnRpbmcgaXQgYmFjayBhZnRlciB1cGRhdGVcclxuICAgIHRoaXMudGl0bGVEaXNwbGF5SEJveC5yZW1vdmVDaGlsZFdpdGhJbmRleCggdGhpcy5ncmFwaFRpdGxlLCB0aGlzLnRpdGxlRGlzcGxheUhCb3guY2hpbGRyZW4uaW5kZXhPZiggdGhpcy5ncmFwaFRpdGxlICkgKTtcclxuICAgIHRoaXMuZ3JhcGhUaXRsZSA9IHRpdGxlVGV4dEhCb3g7XHJcbiAgICB0aGlzLnRpdGxlRGlzcGxheUhCb3guaW5zZXJ0Q2hpbGQoIHRoaXMudGl0bGVEaXNwbGF5SEJveC5jaGlsZHJlbi5sZW5ndGgsIHRoaXMuZ3JhcGhUaXRsZSApO1xyXG5cclxuICB9XHJcbn1cclxuXHJcbnRyaWdUb3VyLnJlZ2lzdGVyKCAnR3JhcGhWaWV3JywgR3JhcGhWaWV3ICk7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBHcmFwaFZpZXc7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsT0FBT0EsUUFBUSxNQUFNLGlDQUFpQztBQUN0RCxPQUFPQyxPQUFPLE1BQU0sK0JBQStCO0FBQ25ELE9BQU9DLFdBQVcsTUFBTSw0Q0FBNEM7QUFDcEUsT0FBT0MsUUFBUSxNQUFNLHlDQUF5QztBQUM5RCxTQUFTQyxNQUFNLEVBQUVDLElBQUksRUFBRUMsSUFBSSxFQUFFQyxJQUFJLEVBQUVDLFNBQVMsRUFBRUMsaUJBQWlCLEVBQUVDLE1BQU0sRUFBRUMsSUFBSSxRQUFRLG1DQUFtQztBQUN4SCxPQUFPQyxvQkFBb0IsTUFBTSw0Q0FBNEM7QUFDN0UsT0FBT0MsS0FBSyxNQUFNLDZCQUE2QjtBQUMvQyxPQUFPQyxRQUFRLE1BQU0sbUJBQW1CO0FBQ3hDLE9BQU9DLGVBQWUsTUFBTSwwQkFBMEI7QUFDdEQsT0FBT0MsYUFBYSxNQUFNLDJCQUEyQjtBQUNyRCxPQUFPQyxxQkFBcUIsTUFBTSw0QkFBNEI7QUFDOUQsT0FBT0Msc0JBQXNCLE1BQU0sNkJBQTZCO0FBQ2hFLE9BQU9DLGFBQWEsTUFBTSxvQkFBb0I7QUFDOUMsT0FBT0MsY0FBYyxNQUFNLHFCQUFxQjtBQUNoRCxPQUFPQyxxQkFBcUIsTUFBTSw0QkFBNEI7O0FBRTlEO0FBQ0EsTUFBTUMsU0FBUyxHQUFHUCxlQUFlLENBQUNRLEdBQUc7QUFDckMsTUFBTUMsU0FBUyxHQUFHVCxlQUFlLENBQUNVLEdBQUc7QUFDckMsTUFBTUMsU0FBUyxHQUFHWCxlQUFlLENBQUNZLEdBQUc7QUFDckMsTUFBTUMsUUFBUSxHQUFHYixlQUFlLENBQUNjLEVBQUU7O0FBRW5DO0FBQ0EsTUFBTUMsZ0JBQWdCLEdBQUdWLGNBQWMsQ0FBQ1UsZ0JBQWdCO0FBQ3hE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