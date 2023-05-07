// Copyright 2015-2022, University of Colorado Boulder

/**
 * Node for component, which can be either lens, mirror, plane mirror, or mask
 *
 * @author Michael Dubson (PhET Interactive Simulations)
 */

import Property from '../../../../axon/js/Property.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { Circle, Node, SimpleDragHandler } from '../../../../scenery/js/imports.js';
import opticsLab from '../../opticsLab.js';
import ComponentGraphic from './ComponentGraphic.js';
class ComponentNode extends Node {
  /**
   * Constructor for ComponentNode which renders sample element as a scenery node.
   * @param {ComponentModel} componentModel
   * @param {OpticsLabScreenView} mainView
   */
  constructor(componentModel, mainView) {
    super({
      // Show a cursor hand over the bar magnet
      cursor: 'pointer'
    });
    this.pieceModel = componentModel;
    this.type = componentModel.type;
    this.showFocalPointsProperty = new Property(false);
    const height = componentModel.diameterProperty.value;
    const radius = componentModel.radiusProperty.value; //radius of curvature
    const index = componentModel.indexProperty.value;
    const componentGraphic = new ComponentGraphic(componentModel.type, height, radius, index);
    const angle = componentModel.angleProperty.value;
    const rotationHandle = new Circle(5, {
      x: Math.sin(angle) * height / 2,
      y: Math.cos(angle) * height / 2,
      fill: 'yellow'
    });
    this.addChild(componentGraphic);
    this.addChild(rotationHandle);

    // When dragging, move the sample element
    let mouseDownPosition;
    this.addInputListener(new SimpleDragHandler({
      // When dragging across it in a mobile device, pick it up
      allowTouchSnag: true,
      start: e => {
        mainView.setSelectedPiece(this);
        const position = this.globalToParentPoint(e.pointer.point);
        const currentNodePos = componentModel.positionProperty.value;
        mouseDownPosition = position.minus(currentNodePos);
        //this.mouseDownPosition = e.pointer.point;
      },

      drag: e => {
        const position = this.globalToParentPoint(e.pointer.point).minus(mouseDownPosition);
        componentModel.setPosition(position);
      },
      end: e => {
        const position = this.globalToParentPoint(e.pointer.point);
        if (mainView.toolDrawerPanel.visibleBounds.containsPoint(position)) {
          mainView.removePiece(this);
        }
      }
    }));
    rotationHandle.addInputListener(new SimpleDragHandler({
      allowTouchSnag: true,
      //start function for testing only
      start: e => {
        mainView.setSelectedPiece(this);
      },
      drag: e => {
        const mousePosRelative = rotationHandle.globalToParentPoint(e.pointer.point); //returns Vector2
        const angle = mousePosRelative.angle - Math.PI / 2; //angle = 0 when beam horizontal, CW is + angle
        componentModel.setAngle(angle);
      }
    })); //end rotationHandle.addInputListener()

    // Register for synchronization with pieceModel.
    componentModel.positionProperty.link(position => {
      this.translation = position;
    });
    componentModel.angleProperty.link(angle => {
      componentGraphic.rotation = angle;
      const cosAngle = Math.cos(angle);
      const sinAngle = Math.sin(angle);
      const diameter = componentModel.diameterProperty.value;
      rotationHandle.translation = new Vector2(-(diameter / 2) * sinAngle, diameter / 2 * cosAngle);
    });
    componentModel.diameterProperty.link(diameter => {
      componentGraphic.setDiameter(diameter);
      const angle = componentModel.angleProperty.value;
      const cosAngle = Math.cos(angle);
      const sinAngle = Math.sin(angle);
      //var diameter = componentModel.diameter;
      rotationHandle.translation = new Vector2(-(diameter / 2) * sinAngle, diameter / 2 * cosAngle);
    });
    componentModel.radiusProperty.link(R => {
      componentGraphic.setRadius(R);
    });
    componentModel.indexProperty.link(n => {
      componentGraphic.setIndex(n);
    });
    this.showFocalPointsProperty.link(isVisible => {
      componentGraphic.setFocalPointsVisibility(isVisible);
    });
    componentModel.fProperty.link(focalLength => {
      if (focalLength) {
        componentGraphic.setFocalPointPositions(focalLength);
      }
    });
  }
}
opticsLab.register('ComponentNode', ComponentNode);
export default ComponentNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm9wZXJ0eSIsIlZlY3RvcjIiLCJDaXJjbGUiLCJOb2RlIiwiU2ltcGxlRHJhZ0hhbmRsZXIiLCJvcHRpY3NMYWIiLCJDb21wb25lbnRHcmFwaGljIiwiQ29tcG9uZW50Tm9kZSIsImNvbnN0cnVjdG9yIiwiY29tcG9uZW50TW9kZWwiLCJtYWluVmlldyIsImN1cnNvciIsInBpZWNlTW9kZWwiLCJ0eXBlIiwic2hvd0ZvY2FsUG9pbnRzUHJvcGVydHkiLCJoZWlnaHQiLCJkaWFtZXRlclByb3BlcnR5IiwidmFsdWUiLCJyYWRpdXMiLCJyYWRpdXNQcm9wZXJ0eSIsImluZGV4IiwiaW5kZXhQcm9wZXJ0eSIsImNvbXBvbmVudEdyYXBoaWMiLCJhbmdsZSIsImFuZ2xlUHJvcGVydHkiLCJyb3RhdGlvbkhhbmRsZSIsIngiLCJNYXRoIiwic2luIiwieSIsImNvcyIsImZpbGwiLCJhZGRDaGlsZCIsIm1vdXNlRG93blBvc2l0aW9uIiwiYWRkSW5wdXRMaXN0ZW5lciIsImFsbG93VG91Y2hTbmFnIiwic3RhcnQiLCJlIiwic2V0U2VsZWN0ZWRQaWVjZSIsInBvc2l0aW9uIiwiZ2xvYmFsVG9QYXJlbnRQb2ludCIsInBvaW50ZXIiLCJwb2ludCIsImN1cnJlbnROb2RlUG9zIiwicG9zaXRpb25Qcm9wZXJ0eSIsIm1pbnVzIiwiZHJhZyIsInNldFBvc2l0aW9uIiwiZW5kIiwidG9vbERyYXdlclBhbmVsIiwidmlzaWJsZUJvdW5kcyIsImNvbnRhaW5zUG9pbnQiLCJyZW1vdmVQaWVjZSIsIm1vdXNlUG9zUmVsYXRpdmUiLCJQSSIsInNldEFuZ2xlIiwibGluayIsInRyYW5zbGF0aW9uIiwicm90YXRpb24iLCJjb3NBbmdsZSIsInNpbkFuZ2xlIiwiZGlhbWV0ZXIiLCJzZXREaWFtZXRlciIsIlIiLCJzZXRSYWRpdXMiLCJuIiwic2V0SW5kZXgiLCJpc1Zpc2libGUiLCJzZXRGb2NhbFBvaW50c1Zpc2liaWxpdHkiLCJmUHJvcGVydHkiLCJmb2NhbExlbmd0aCIsInNldEZvY2FsUG9pbnRQb3NpdGlvbnMiLCJyZWdpc3RlciJdLCJzb3VyY2VzIjpbIkNvbXBvbmVudE5vZGUuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTUtMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogTm9kZSBmb3IgY29tcG9uZW50LCB3aGljaCBjYW4gYmUgZWl0aGVyIGxlbnMsIG1pcnJvciwgcGxhbmUgbWlycm9yLCBvciBtYXNrXHJcbiAqXHJcbiAqIEBhdXRob3IgTWljaGFlbCBEdWJzb24gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IFByb3BlcnR5IGZyb20gJy4uLy4uLy4uLy4uL2F4b24vanMvUHJvcGVydHkuanMnO1xyXG5pbXBvcnQgVmVjdG9yMiBmcm9tICcuLi8uLi8uLi8uLi9kb3QvanMvVmVjdG9yMi5qcyc7XHJcbmltcG9ydCB7IENpcmNsZSwgTm9kZSwgU2ltcGxlRHJhZ0hhbmRsZXIgfSBmcm9tICcuLi8uLi8uLi8uLi9zY2VuZXJ5L2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgb3B0aWNzTGFiIGZyb20gJy4uLy4uL29wdGljc0xhYi5qcyc7XHJcbmltcG9ydCBDb21wb25lbnRHcmFwaGljIGZyb20gJy4vQ29tcG9uZW50R3JhcGhpYy5qcyc7XHJcblxyXG5jbGFzcyBDb21wb25lbnROb2RlIGV4dGVuZHMgTm9kZSB7XHJcbiAgLyoqXHJcbiAgICogQ29uc3RydWN0b3IgZm9yIENvbXBvbmVudE5vZGUgd2hpY2ggcmVuZGVycyBzYW1wbGUgZWxlbWVudCBhcyBhIHNjZW5lcnkgbm9kZS5cclxuICAgKiBAcGFyYW0ge0NvbXBvbmVudE1vZGVsfSBjb21wb25lbnRNb2RlbFxyXG4gICAqIEBwYXJhbSB7T3B0aWNzTGFiU2NyZWVuVmlld30gbWFpblZpZXdcclxuICAgKi9cclxuICBjb25zdHJ1Y3RvciggY29tcG9uZW50TW9kZWwsIG1haW5WaWV3ICkge1xyXG5cclxuICAgIHN1cGVyKCB7XHJcbiAgICAgIC8vIFNob3cgYSBjdXJzb3IgaGFuZCBvdmVyIHRoZSBiYXIgbWFnbmV0XHJcbiAgICAgIGN1cnNvcjogJ3BvaW50ZXInXHJcbiAgICB9ICk7XHJcblxyXG4gICAgdGhpcy5waWVjZU1vZGVsID0gY29tcG9uZW50TW9kZWw7XHJcbiAgICB0aGlzLnR5cGUgPSBjb21wb25lbnRNb2RlbC50eXBlO1xyXG5cclxuICAgIHRoaXMuc2hvd0ZvY2FsUG9pbnRzUHJvcGVydHkgPSBuZXcgUHJvcGVydHkoIGZhbHNlICk7XHJcblxyXG4gICAgY29uc3QgaGVpZ2h0ID0gY29tcG9uZW50TW9kZWwuZGlhbWV0ZXJQcm9wZXJ0eS52YWx1ZTtcclxuXHJcbiAgICBjb25zdCByYWRpdXMgPSBjb21wb25lbnRNb2RlbC5yYWRpdXNQcm9wZXJ0eS52YWx1ZTsgICAgLy9yYWRpdXMgb2YgY3VydmF0dXJlXHJcbiAgICBjb25zdCBpbmRleCA9IGNvbXBvbmVudE1vZGVsLmluZGV4UHJvcGVydHkudmFsdWU7XHJcblxyXG4gICAgY29uc3QgY29tcG9uZW50R3JhcGhpYyA9IG5ldyBDb21wb25lbnRHcmFwaGljKCBjb21wb25lbnRNb2RlbC50eXBlLCBoZWlnaHQsIHJhZGl1cywgaW5kZXggKTtcclxuICAgIGNvbnN0IGFuZ2xlID0gY29tcG9uZW50TW9kZWwuYW5nbGVQcm9wZXJ0eS52YWx1ZTtcclxuICAgIGNvbnN0IHJvdGF0aW9uSGFuZGxlID0gbmV3IENpcmNsZSggNSwge1xyXG4gICAgICB4OiBNYXRoLnNpbiggYW5nbGUgKSAqIGhlaWdodCAvIDIsXHJcbiAgICAgIHk6IE1hdGguY29zKCBhbmdsZSApICogaGVpZ2h0IC8gMixcclxuICAgICAgZmlsbDogJ3llbGxvdydcclxuICAgIH0gKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIGNvbXBvbmVudEdyYXBoaWMgKTtcclxuICAgIHRoaXMuYWRkQ2hpbGQoIHJvdGF0aW9uSGFuZGxlICk7XHJcblxyXG4gICAgLy8gV2hlbiBkcmFnZ2luZywgbW92ZSB0aGUgc2FtcGxlIGVsZW1lbnRcclxuICAgIGxldCBtb3VzZURvd25Qb3NpdGlvbjtcclxuICAgIHRoaXMuYWRkSW5wdXRMaXN0ZW5lciggbmV3IFNpbXBsZURyYWdIYW5kbGVyKFxyXG4gICAgICB7XHJcbiAgICAgICAgLy8gV2hlbiBkcmFnZ2luZyBhY3Jvc3MgaXQgaW4gYSBtb2JpbGUgZGV2aWNlLCBwaWNrIGl0IHVwXHJcbiAgICAgICAgYWxsb3dUb3VjaFNuYWc6IHRydWUsXHJcbiAgICAgICAgc3RhcnQ6IGUgPT4ge1xyXG4gICAgICAgICAgbWFpblZpZXcuc2V0U2VsZWN0ZWRQaWVjZSggdGhpcyApO1xyXG4gICAgICAgICAgY29uc3QgcG9zaXRpb24gPSB0aGlzLmdsb2JhbFRvUGFyZW50UG9pbnQoIGUucG9pbnRlci5wb2ludCApO1xyXG4gICAgICAgICAgY29uc3QgY3VycmVudE5vZGVQb3MgPSBjb21wb25lbnRNb2RlbC5wb3NpdGlvblByb3BlcnR5LnZhbHVlO1xyXG4gICAgICAgICAgbW91c2VEb3duUG9zaXRpb24gPSBwb3NpdGlvbi5taW51cyggY3VycmVudE5vZGVQb3MgKTtcclxuICAgICAgICAgIC8vdGhpcy5tb3VzZURvd25Qb3NpdGlvbiA9IGUucG9pbnRlci5wb2ludDtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBkcmFnOiBlID0+IHtcclxuICAgICAgICAgIGNvbnN0IHBvc2l0aW9uID0gdGhpcy5nbG9iYWxUb1BhcmVudFBvaW50KCBlLnBvaW50ZXIucG9pbnQgKS5taW51cyggbW91c2VEb3duUG9zaXRpb24gKTtcclxuICAgICAgICAgIGNvbXBvbmVudE1vZGVsLnNldFBvc2l0aW9uKCBwb3NpdGlvbiApO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZW5kOiBlID0+IHtcclxuICAgICAgICAgIGNvbnN0IHBvc2l0aW9uID0gdGhpcy5nbG9iYWxUb1BhcmVudFBvaW50KCBlLnBvaW50ZXIucG9pbnQgKTtcclxuICAgICAgICAgIGlmICggbWFpblZpZXcudG9vbERyYXdlclBhbmVsLnZpc2libGVCb3VuZHMuY29udGFpbnNQb2ludCggcG9zaXRpb24gKSApIHtcclxuICAgICAgICAgICAgbWFpblZpZXcucmVtb3ZlUGllY2UoIHRoaXMgKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH0gKSApO1xyXG5cclxuICAgIHJvdGF0aW9uSGFuZGxlLmFkZElucHV0TGlzdGVuZXIoIG5ldyBTaW1wbGVEcmFnSGFuZGxlcigge1xyXG4gICAgICBhbGxvd1RvdWNoU25hZzogdHJ1ZSxcclxuICAgICAgLy9zdGFydCBmdW5jdGlvbiBmb3IgdGVzdGluZyBvbmx5XHJcbiAgICAgIHN0YXJ0OiBlID0+IHtcclxuICAgICAgICBtYWluVmlldy5zZXRTZWxlY3RlZFBpZWNlKCB0aGlzICk7XHJcbiAgICAgIH0sXHJcblxyXG4gICAgICBkcmFnOiBlID0+IHtcclxuICAgICAgICBjb25zdCBtb3VzZVBvc1JlbGF0aXZlID0gcm90YXRpb25IYW5kbGUuZ2xvYmFsVG9QYXJlbnRQb2ludCggZS5wb2ludGVyLnBvaW50ICk7ICAgLy9yZXR1cm5zIFZlY3RvcjJcclxuICAgICAgICBjb25zdCBhbmdsZSA9IG1vdXNlUG9zUmVsYXRpdmUuYW5nbGUgLSBNYXRoLlBJIC8gMjsgIC8vYW5nbGUgPSAwIHdoZW4gYmVhbSBob3Jpem9udGFsLCBDVyBpcyArIGFuZ2xlXHJcbiAgICAgICAgY29tcG9uZW50TW9kZWwuc2V0QW5nbGUoIGFuZ2xlICk7XHJcblxyXG4gICAgICB9XHJcbiAgICB9ICkgKTsvL2VuZCByb3RhdGlvbkhhbmRsZS5hZGRJbnB1dExpc3RlbmVyKClcclxuXHJcbiAgICAvLyBSZWdpc3RlciBmb3Igc3luY2hyb25pemF0aW9uIHdpdGggcGllY2VNb2RlbC5cclxuICAgIGNvbXBvbmVudE1vZGVsLnBvc2l0aW9uUHJvcGVydHkubGluayggcG9zaXRpb24gPT4ge1xyXG4gICAgICB0aGlzLnRyYW5zbGF0aW9uID0gcG9zaXRpb247XHJcbiAgICB9ICk7XHJcbiAgICBjb21wb25lbnRNb2RlbC5hbmdsZVByb3BlcnR5LmxpbmsoIGFuZ2xlID0+IHtcclxuICAgICAgY29tcG9uZW50R3JhcGhpYy5yb3RhdGlvbiA9IGFuZ2xlO1xyXG4gICAgICBjb25zdCBjb3NBbmdsZSA9IE1hdGguY29zKCBhbmdsZSApO1xyXG4gICAgICBjb25zdCBzaW5BbmdsZSA9IE1hdGguc2luKCBhbmdsZSApO1xyXG4gICAgICBjb25zdCBkaWFtZXRlciA9IGNvbXBvbmVudE1vZGVsLmRpYW1ldGVyUHJvcGVydHkudmFsdWU7XHJcbiAgICAgIHJvdGF0aW9uSGFuZGxlLnRyYW5zbGF0aW9uID0gbmV3IFZlY3RvcjIoIC0oIGRpYW1ldGVyIC8gMiApICogc2luQW5nbGUsICggZGlhbWV0ZXIgLyAyICkgKiBjb3NBbmdsZSApO1xyXG4gICAgfSApO1xyXG4gICAgY29tcG9uZW50TW9kZWwuZGlhbWV0ZXJQcm9wZXJ0eS5saW5rKCBkaWFtZXRlciA9PiB7XHJcbiAgICAgIGNvbXBvbmVudEdyYXBoaWMuc2V0RGlhbWV0ZXIoIGRpYW1ldGVyICk7XHJcbiAgICAgIGNvbnN0IGFuZ2xlID0gY29tcG9uZW50TW9kZWwuYW5nbGVQcm9wZXJ0eS52YWx1ZTtcclxuICAgICAgY29uc3QgY29zQW5nbGUgPSBNYXRoLmNvcyggYW5nbGUgKTtcclxuICAgICAgY29uc3Qgc2luQW5nbGUgPSBNYXRoLnNpbiggYW5nbGUgKTtcclxuICAgICAgLy92YXIgZGlhbWV0ZXIgPSBjb21wb25lbnRNb2RlbC5kaWFtZXRlcjtcclxuICAgICAgcm90YXRpb25IYW5kbGUudHJhbnNsYXRpb24gPSBuZXcgVmVjdG9yMiggLSggZGlhbWV0ZXIgLyAyICkgKiBzaW5BbmdsZSwgKCBkaWFtZXRlciAvIDIgKSAqIGNvc0FuZ2xlICk7XHJcbiAgICB9ICk7XHJcbiAgICBjb21wb25lbnRNb2RlbC5yYWRpdXNQcm9wZXJ0eS5saW5rKCBSID0+IHtcclxuICAgICAgY29tcG9uZW50R3JhcGhpYy5zZXRSYWRpdXMoIFIgKTtcclxuICAgIH0gKTtcclxuICAgIGNvbXBvbmVudE1vZGVsLmluZGV4UHJvcGVydHkubGluayggbiA9PiB7XHJcbiAgICAgIGNvbXBvbmVudEdyYXBoaWMuc2V0SW5kZXgoIG4gKTtcclxuICAgIH0gKTtcclxuICAgIHRoaXMuc2hvd0ZvY2FsUG9pbnRzUHJvcGVydHkubGluayggaXNWaXNpYmxlID0+IHtcclxuICAgICAgY29tcG9uZW50R3JhcGhpYy5zZXRGb2NhbFBvaW50c1Zpc2liaWxpdHkoIGlzVmlzaWJsZSApO1xyXG4gICAgfSApO1xyXG5cclxuICAgIGNvbXBvbmVudE1vZGVsLmZQcm9wZXJ0eS5saW5rKCBmb2NhbExlbmd0aCA9PiB7XHJcbiAgICAgIGlmICggZm9jYWxMZW5ndGggKSB7XHJcbiAgICAgICAgY29tcG9uZW50R3JhcGhpYy5zZXRGb2NhbFBvaW50UG9zaXRpb25zKCBmb2NhbExlbmd0aCApO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcbiAgfVxyXG59XHJcblxyXG5vcHRpY3NMYWIucmVnaXN0ZXIoICdDb21wb25lbnROb2RlJywgQ29tcG9uZW50Tm9kZSApO1xyXG5leHBvcnQgZGVmYXVsdCBDb21wb25lbnROb2RlOyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxRQUFRLE1BQU0saUNBQWlDO0FBQ3RELE9BQU9DLE9BQU8sTUFBTSwrQkFBK0I7QUFDbkQsU0FBU0MsTUFBTSxFQUFFQyxJQUFJLEVBQUVDLGlCQUFpQixRQUFRLG1DQUFtQztBQUNuRixPQUFPQyxTQUFTLE1BQU0sb0JBQW9CO0FBQzFDLE9BQU9DLGdCQUFnQixNQUFNLHVCQUF1QjtBQUVwRCxNQUFNQyxhQUFhLFNBQVNKLElBQUksQ0FBQztFQUMvQjtBQUNGO0FBQ0E7QUFDQTtBQUNBO0VBQ0VLLFdBQVdBLENBQUVDLGNBQWMsRUFBRUMsUUFBUSxFQUFHO0lBRXRDLEtBQUssQ0FBRTtNQUNMO01BQ0FDLE1B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