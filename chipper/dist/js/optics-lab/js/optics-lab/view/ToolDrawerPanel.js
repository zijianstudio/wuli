// Copyright 2015-2022, University of Colorado Boulder

/**
 * Toolbox for selecting light sources, lenses, mirrors, and masks
 * Click on icon to drag sources or component onto stage
 * Drag component back to toolbox to delete from stage
 *
 * @author Michael Dubson (PhET Interactive Simulations)
 */

import merge from '../../../../phet-core/js/merge.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { HBox, Node, Rectangle, SimpleDragHandler, Text, VBox } from '../../../../scenery/js/imports.js';
import Panel from '../../../../sun/js/Panel.js';
import opticsLab from '../../opticsLab.js';
import Type from '../model/Type.js';

//constants
const DISPLAY_FONT = new PhetFont(12);
const PANEL_COLOR = '#ccc';
class ToolDrawerPanel extends Panel {
  /**
   * @param {OpticsLabScreenView} mainView
   */
  constructor(mainView) {
    /**
     * Create icon with dragListener
     * @param {string} string
     * @param {Type} type
     * @returns {Node}
     */
    const createIcon = (string, type) => {
      const fontOptions = {
        font: DISPLAY_FONT
      };
      const pieceText = new Text(string, fontOptions);
      const iconLayer = new Node();
      iconLayer.addChild(pieceText);
      iconLayer.addChild(new Rectangle(pieceText.bounds.dilatedXY(8, 5), {
        fill: 'green',
        cursor: 'pointer',
        opacity: 0.1
      }));
      let pieceGrabbed;
      iconLayer.addInputListener(new SimpleDragHandler({
        allowTouchSnag: true,
        start: e => {
          const startPosition = this.globalToParentPoint(e.pointer.point);
          pieceGrabbed = mainView.addPiece(type, startPosition);
          //pieceGrabbed.mainView.setSelectedPiece( pieceGrabbed );
          mainView.setSelectedPiece(pieceGrabbed);
        },
        drag: e => {
          const position = this.globalToParentPoint(e.pointer.point); //returns Vector2

          pieceGrabbed.pieceModel.setPosition(position);
        },
        end: e => {
          const vEnd = this.globalToParentPoint(e.pointer.point);
          if (this.visibleBounds.containsCoordinates(vEnd.x, vEnd.y)) {
            mainView.removePiece(pieceGrabbed);
          }
        }
      } //end addInputListener
      ));

      return iconLayer;
    }; //end nodeSetup

    const fanSourceIcon = createIcon('Fan Source', Type.FAN_SOURCE);
    const beamSourceIcon = createIcon('Beam Source', Type.BEAM_SOURCE);
    const convergingLensIcon = createIcon('Converging Lens', Type.CONVERGING_LENS);
    const convergingMirrorIcon = createIcon('Converging Mirror', Type.CONVERGING_MIRROR);
    const divergingLensIcon = createIcon('Diverging Lens', Type.DIVERGING_LENS);
    const divergingMirrorIcon = createIcon('Diverging Mirror', Type.DIVERGING_MIRROR);
    const simpleMaskIcon = createIcon('Simple Mask', Type.SIMPLE_MASK);
    const slitMaskIcon = createIcon('Slit Mask', Type.SLIT_MASK);
    const planeMirrorIcon = createIcon('Plane Mirror', Type.PLANE_MIRROR);
    const vBoxOptions = {
      align: 'left',
      spacing: 5
    };
    const sourceVBox = new VBox(merge({
      children: [fanSourceIcon, beamSourceIcon]
    }, vBoxOptions));
    const lensVBox = new VBox(merge({
      children: [convergingLensIcon, divergingLensIcon]
    }, vBoxOptions));
    const curvedMirrorVBox = new VBox(merge({
      children: [convergingMirrorIcon, divergingMirrorIcon]
    }, vBoxOptions));
    const planeMirrorVBox = new VBox(merge({
      children: [planeMirrorIcon]
    }, vBoxOptions));
    const maskVBox = new VBox(merge({
      children: [simpleMaskIcon, slitMaskIcon]
    }, vBoxOptions));
    const panelContent = new HBox({
      children: [sourceVBox, lensVBox, planeMirrorVBox, curvedMirrorVBox, maskVBox],
      align: 'top',
      spacing: 10
    });
    super(panelContent, {
      xMargin: 15,
      yMargin: 5,
      lineWidth: 2,
      fill: PANEL_COLOR
    });
  } //end constructor
}

opticsLab.register('ToolDrawerPanel', ToolDrawerPanel);
export default ToolDrawerPanel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJtZXJnZSIsIlBoZXRGb250IiwiSEJveCIsIk5vZGUiLCJSZWN0YW5nbGUiLCJTaW1wbGVEcmFnSGFuZGxlciIsIlRleHQiLCJWQm94IiwiUGFuZWwiLCJvcHRpY3NMYWIiLCJUeXBlIiwiRElTUExBWV9GT05UIiwiUEFORUxfQ09MT1IiLCJUb29sRHJhd2VyUGFuZWwiLCJjb25zdHJ1Y3RvciIsIm1haW5WaWV3IiwiY3JlYXRlSWNvbiIsInN0cmluZyIsInR5cGUiLCJmb250T3B0aW9ucyIsImZvbnQiLCJwaWVjZVRleHQiLCJpY29uTGF5ZXIiLCJhZGRDaGlsZCIsImJvdW5kcyIsImRpbGF0ZWRYWSIsImZpbGwiLCJjdXJzb3IiLCJvcGFjaXR5IiwicGllY2VHcmFiYmVkIiwiYWRkSW5wdXRMaXN0ZW5lciIsImFsbG93VG91Y2hTbmFnIiwic3RhcnQiLCJlIiwic3RhcnRQb3NpdGlvbiIsImdsb2JhbFRvUGFyZW50UG9pbnQiLCJwb2ludGVyIiwicG9pbnQiLCJhZGRQaWVjZSIsInNldFNlbGVjdGVkUGllY2UiLCJkcmFnIiwicG9zaXRpb24iLCJwaWVjZU1vZGVsIiwic2V0UG9zaXRpb24iLCJlbmQiLCJ2RW5kIiwidmlzaWJsZUJvdW5kcyIsImNvbnRhaW5zQ29vcmRpbmF0ZXMiLCJ4IiwieSIsInJlbW92ZVBpZWNlIiwiZmFuU291cmNlSWNvbiIsIkZBTl9TT1VSQ0UiLCJiZWFtU291cmNlSWNvbiIsIkJFQU1fU09VUkNFIiwiY29udmVyZ2luZ0xlbnNJY29uIiwiQ09OVkVSR0lOR19MRU5TIiwiY29udmVyZ2luZ01pcnJvckljb24iLCJDT05WRVJHSU5HX01JUlJPUiIsImRpdmVyZ2luZ0xlbnNJY29uIiwiRElWRVJHSU5HX0xFTlMiLCJkaXZlcmdpbmdNaXJyb3JJY29uIiwiRElWRVJHSU5HX01JUlJPUiIsInNpbXBsZU1hc2tJY29uIiwiU0lNUExFX01BU0siLCJzbGl0TWFza0ljb24iLCJTTElUX01BU0siLCJwbGFuZU1pcnJvckljb24iLCJQTEFORV9NSVJST1IiLCJ2Qm94T3B0aW9ucyIsImFsaWduIiwic3BhY2luZyIsInNvdXJjZVZCb3giLCJjaGlsZHJlbiIsImxlbnNWQm94IiwiY3VydmVkTWlycm9yVkJveCIsInBsYW5lTWlycm9yVkJveCIsIm1hc2tWQm94IiwicGFuZWxDb250ZW50IiwieE1hcmdpbiIsInlNYXJnaW4iLCJsaW5lV2lkdGgiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIlRvb2xEcmF3ZXJQYW5lbC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxNS0yMDIyLCBVbml2ZXJzaXR5IG9mIENvbG9yYWRvIEJvdWxkZXJcclxuXHJcbi8qKlxyXG4gKiBUb29sYm94IGZvciBzZWxlY3RpbmcgbGlnaHQgc291cmNlcywgbGVuc2VzLCBtaXJyb3JzLCBhbmQgbWFza3NcclxuICogQ2xpY2sgb24gaWNvbiB0byBkcmFnIHNvdXJjZXMgb3IgY29tcG9uZW50IG9udG8gc3RhZ2VcclxuICogRHJhZyBjb21wb25lbnQgYmFjayB0byB0b29sYm94IHRvIGRlbGV0ZSBmcm9tIHN0YWdlXHJcbiAqXHJcbiAqIEBhdXRob3IgTWljaGFlbCBEdWJzb24gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IG1lcmdlIGZyb20gJy4uLy4uLy4uLy4uL3BoZXQtY29yZS9qcy9tZXJnZS5qcyc7XHJcbmltcG9ydCBQaGV0Rm9udCBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5LXBoZXQvanMvUGhldEZvbnQuanMnO1xyXG5pbXBvcnQgeyBIQm94LCBOb2RlLCBSZWN0YW5nbGUsIFNpbXBsZURyYWdIYW5kbGVyLCBUZXh0LCBWQm94IH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IFBhbmVsIGZyb20gJy4uLy4uLy4uLy4uL3N1bi9qcy9QYW5lbC5qcyc7XHJcbmltcG9ydCBvcHRpY3NMYWIgZnJvbSAnLi4vLi4vb3B0aWNzTGFiLmpzJztcclxuaW1wb3J0IFR5cGUgZnJvbSAnLi4vbW9kZWwvVHlwZS5qcyc7XHJcblxyXG4vL2NvbnN0YW50c1xyXG5jb25zdCBESVNQTEFZX0ZPTlQgPSBuZXcgUGhldEZvbnQoIDEyICk7XHJcbmNvbnN0IFBBTkVMX0NPTE9SID0gJyNjY2MnO1xyXG5cclxuY2xhc3MgVG9vbERyYXdlclBhbmVsIGV4dGVuZHMgUGFuZWwge1xyXG4gIC8qKlxyXG4gICAqIEBwYXJhbSB7T3B0aWNzTGFiU2NyZWVuVmlld30gbWFpblZpZXdcclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggbWFpblZpZXcgKSB7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDcmVhdGUgaWNvbiB3aXRoIGRyYWdMaXN0ZW5lclxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHN0cmluZ1xyXG4gICAgICogQHBhcmFtIHtUeXBlfSB0eXBlXHJcbiAgICAgKiBAcmV0dXJucyB7Tm9kZX1cclxuICAgICAqL1xyXG4gICAgY29uc3QgY3JlYXRlSWNvbiA9ICggc3RyaW5nLCB0eXBlICkgPT4ge1xyXG5cclxuICAgICAgY29uc3QgZm9udE9wdGlvbnMgPSB7IGZvbnQ6IERJU1BMQVlfRk9OVCB9O1xyXG4gICAgICBjb25zdCBwaWVjZVRleHQgPSBuZXcgVGV4dCggc3RyaW5nLCBmb250T3B0aW9ucyApO1xyXG4gICAgICBjb25zdCBpY29uTGF5ZXIgPSBuZXcgTm9kZSgpO1xyXG4gICAgICBpY29uTGF5ZXIuYWRkQ2hpbGQoIHBpZWNlVGV4dCApO1xyXG4gICAgICBpY29uTGF5ZXIuYWRkQ2hpbGQoIG5ldyBSZWN0YW5nbGUoIHBpZWNlVGV4dC5ib3VuZHMuZGlsYXRlZFhZKCA4LCA1ICksIHtcclxuICAgICAgICBmaWxsOiAnZ3JlZW4nLFxyXG4gICAgICAgIGN1cnNvcjogJ3BvaW50ZXInLFxyXG4gICAgICAgIG9wYWNpdHk6IDAuMVxyXG4gICAgICB9ICkgKTtcclxuXHJcbiAgICAgIGxldCBwaWVjZUdyYWJiZWQ7XHJcbiAgICAgIGljb25MYXllci5hZGRJbnB1dExpc3RlbmVyKCBuZXcgU2ltcGxlRHJhZ0hhbmRsZXIoXHJcbiAgICAgICAge1xyXG5cclxuICAgICAgICAgIGFsbG93VG91Y2hTbmFnOiB0cnVlLFxyXG5cclxuICAgICAgICAgIHN0YXJ0OiBlID0+IHtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IHN0YXJ0UG9zaXRpb24gPSB0aGlzLmdsb2JhbFRvUGFyZW50UG9pbnQoIGUucG9pbnRlci5wb2ludCApO1xyXG4gICAgICAgICAgICBwaWVjZUdyYWJiZWQgPSBtYWluVmlldy5hZGRQaWVjZSggdHlwZSwgc3RhcnRQb3NpdGlvbiApO1xyXG4gICAgICAgICAgICAvL3BpZWNlR3JhYmJlZC5tYWluVmlldy5zZXRTZWxlY3RlZFBpZWNlKCBwaWVjZUdyYWJiZWQgKTtcclxuICAgICAgICAgICAgbWFpblZpZXcuc2V0U2VsZWN0ZWRQaWVjZSggcGllY2VHcmFiYmVkICk7XHJcbiAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgIGRyYWc6IGUgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBwb3NpdGlvbiA9IHRoaXMuZ2xvYmFsVG9QYXJlbnRQb2ludCggZS5wb2ludGVyLnBvaW50ICk7ICAgLy9yZXR1cm5zIFZlY3RvcjJcclxuXHJcbiAgICAgICAgICAgIHBpZWNlR3JhYmJlZC5waWVjZU1vZGVsLnNldFBvc2l0aW9uKCBwb3NpdGlvbiApO1xyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIGVuZDogZSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IHZFbmQgPSB0aGlzLmdsb2JhbFRvUGFyZW50UG9pbnQoIGUucG9pbnRlci5wb2ludCApO1xyXG4gICAgICAgICAgICBpZiAoIHRoaXMudmlzaWJsZUJvdW5kcy5jb250YWluc0Nvb3JkaW5hdGVzKCB2RW5kLngsIHZFbmQueSApICkge1xyXG4gICAgICAgICAgICAgIG1haW5WaWV3LnJlbW92ZVBpZWNlKCBwaWVjZUdyYWJiZWQgKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0vL2VuZCBhZGRJbnB1dExpc3RlbmVyXHJcbiAgICAgICkgKTtcclxuICAgICAgcmV0dXJuIGljb25MYXllcjtcclxuICAgIH07IC8vZW5kIG5vZGVTZXR1cFxyXG5cclxuICAgIGNvbnN0IGZhblNvdXJjZUljb24gPSBjcmVhdGVJY29uKCAnRmFuIFNvdXJjZScsIFR5cGUuRkFOX1NPVVJDRSApO1xyXG4gICAgY29uc3QgYmVhbVNvdXJjZUljb24gPSBjcmVhdGVJY29uKCAnQmVhbSBTb3VyY2UnLCBUeXBlLkJFQU1fU09VUkNFICk7XHJcbiAgICBjb25zdCBjb252ZXJnaW5nTGVuc0ljb24gPSBjcmVhdGVJY29uKCAnQ29udmVyZ2luZyBMZW5zJywgVHlwZS5DT05WRVJHSU5HX0xFTlMgKTtcclxuICAgIGNvbnN0IGNvbnZlcmdpbmdNaXJyb3JJY29uID0gY3JlYXRlSWNvbiggJ0NvbnZlcmdpbmcgTWlycm9yJywgVHlwZS5DT05WRVJHSU5HX01JUlJPUiApO1xyXG4gICAgY29uc3QgZGl2ZXJnaW5nTGVuc0ljb24gPSBjcmVhdGVJY29uKCAnRGl2ZXJnaW5nIExlbnMnLCBUeXBlLkRJVkVSR0lOR19MRU5TICk7XHJcbiAgICBjb25zdCBkaXZlcmdpbmdNaXJyb3JJY29uID0gY3JlYXRlSWNvbiggJ0RpdmVyZ2luZyBNaXJyb3InLCBUeXBlLkRJVkVSR0lOR19NSVJST1IgKTtcclxuICAgIGNvbnN0IHNpbXBsZU1hc2tJY29uID0gY3JlYXRlSWNvbiggJ1NpbXBsZSBNYXNrJywgVHlwZS5TSU1QTEVfTUFTSyApO1xyXG4gICAgY29uc3Qgc2xpdE1hc2tJY29uID0gY3JlYXRlSWNvbiggJ1NsaXQgTWFzaycsIFR5cGUuU0xJVF9NQVNLICk7XHJcbiAgICBjb25zdCBwbGFuZU1pcnJvckljb24gPSBjcmVhdGVJY29uKCAnUGxhbmUgTWlycm9yJywgVHlwZS5QTEFORV9NSVJST1IgKTtcclxuXHJcbiAgICBjb25zdCB2Qm94T3B0aW9ucyA9IHsgYWxpZ246ICdsZWZ0Jywgc3BhY2luZzogNSB9O1xyXG5cclxuICAgIGNvbnN0IHNvdXJjZVZCb3ggPSBuZXcgVkJveCggbWVyZ2UoIHsgY2hpbGRyZW46IFsgZmFuU291cmNlSWNvbiwgYmVhbVNvdXJjZUljb24gXSB9LCB2Qm94T3B0aW9ucyApICk7XHJcbiAgICBjb25zdCBsZW5zVkJveCA9IG5ldyBWQm94KCBtZXJnZSggeyBjaGlsZHJlbjogWyBjb252ZXJnaW5nTGVuc0ljb24sIGRpdmVyZ2luZ0xlbnNJY29uIF0gfSwgdkJveE9wdGlvbnMgKSApO1xyXG4gICAgY29uc3QgY3VydmVkTWlycm9yVkJveCA9IG5ldyBWQm94KCBtZXJnZSggeyBjaGlsZHJlbjogWyBjb252ZXJnaW5nTWlycm9ySWNvbiwgZGl2ZXJnaW5nTWlycm9ySWNvbiBdIH0sIHZCb3hPcHRpb25zICkgKTtcclxuICAgIGNvbnN0IHBsYW5lTWlycm9yVkJveCA9IG5ldyBWQm94KCBtZXJnZSggeyBjaGlsZHJlbjogWyBwbGFuZU1pcnJvckljb24gXSB9LCB2Qm94T3B0aW9ucyApICk7XHJcbiAgICBjb25zdCBtYXNrVkJveCA9IG5ldyBWQm94KCBtZXJnZSggeyBjaGlsZHJlbjogWyBzaW1wbGVNYXNrSWNvbiwgc2xpdE1hc2tJY29uIF0gfSwgdkJveE9wdGlvbnMgKSApO1xyXG5cclxuICAgIGNvbnN0IHBhbmVsQ29udGVudCA9IG5ldyBIQm94KCB7XHJcbiAgICAgIGNoaWxkcmVuOiBbIHNvdXJjZVZCb3gsIGxlbnNWQm94LCBwbGFuZU1pcnJvclZCb3gsIGN1cnZlZE1pcnJvclZCb3gsIG1hc2tWQm94IF0sXHJcbiAgICAgIGFsaWduOiAndG9wJyxcclxuICAgICAgc3BhY2luZzogMTBcclxuICAgIH0gKTtcclxuXHJcbiAgICBzdXBlciggcGFuZWxDb250ZW50LCB7IHhNYXJnaW46IDE1LCB5TWFyZ2luOiA1LCBsaW5lV2lkdGg6IDIsIGZpbGw6IFBBTkVMX0NPTE9SIH0gKTtcclxuXHJcbiAgfS8vZW5kIGNvbnN0cnVjdG9yXHJcbn1cclxuXHJcbm9wdGljc0xhYi5yZWdpc3RlciggJ1Rvb2xEcmF3ZXJQYW5lbCcsIFRvb2xEcmF3ZXJQYW5lbCApO1xyXG5leHBvcnQgZGVmYXVsdCBUb29sRHJhd2VyUGFuZWw7Il0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxLQUFLLE1BQU0sbUNBQW1DO0FBQ3JELE9BQU9DLFFBQVEsTUFBTSx5Q0FBeUM7QUFDOUQsU0FBU0MsSUFBSSxFQUFFQyxJQUFJLEVBQUVDLFNBQVMsRUFBRUMsaUJBQWlCLEVBQUVDLElBQUksRUFBRUMsSUFBSSxRQUFRLG1DQUFtQztBQUN4RyxPQUFPQyxLQUFLLE1BQU0sNkJBQTZCO0FBQy9DLE9BQU9DLFNBQVMsTUFBTSxvQkFBb0I7QUFDMUMsT0FBT0MsSUFBSSxNQUFNLGtCQUFrQjs7QUFFbkM7QUFDQSxNQUFNQyxZQUFZLEdBQUcsSUFBSVYsUUFBUSxDQUFFLEVBQUcsQ0FBQztBQUN2QyxNQUFNVyxXQUFXLEdBQUcsTUFBTTtBQUUxQixNQUFNQyxlQUFlLFNBQVNMLEtBQUssQ0FBQztFQUNsQztBQUNGO0FBQ0E7RUFDRU0sV0FBV0EsQ0FBRUMsUUFBUSxFQUFHO0lBRXRCO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtJQUNJLE1BQU1DLFVBQVUsR0FBR0EsQ0FBRUMsTUFBTSxFQUFFQyxJQUFJLEtBQU07TUFFckMsTUFBTUMsV0FBVyxHQUFHO1FBQUVDLElBQUksRUFBRVQ7TUFBYSxDQUFDO01BQzFDLE1BQU1VLFNBQVMsR0FBRyxJQUFJZixJQUFJLENBQUVXLE1BQU0sRUFBRUUsV0FBWSxDQUFDO01BQ2pELE1BQU1HLFNBQVMsR0FBRyxJQUFJbkIsSUFBSSxDQUFDLENBQUM7TUFDNUJtQixTQUFTLENBQUNDLFFBQVEsQ0FBRUYsU0FBVSxDQUFDO01BQy9CQyxTQUFTLENBQUNDLFFBQVEsQ0FBRSxJQUFJbkIsU0FBUyxDQUFFaUIsU0FBUyxDQUFDRyxNQUFNLENBQUNDLFNBQVMsQ0FBRSxDQUFDLEVB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