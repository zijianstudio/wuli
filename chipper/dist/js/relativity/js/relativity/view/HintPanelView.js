// Copyright 2019-2023, University of Colorado Boulder

/**
 * GraphControlPanel is the base class for graph control panels. These panels contain controls that affect the graph.
 *
 * @author Brandon Li
 * @author Chris Malley (PixelZoom, Inc.)
 */

import merge from '../../../../phet-core/js/merge.js';
import { RichText, Text, VBox } from '../../../../scenery/js/imports.js';
import Panel from '../../../../sun/js/Panel.js';
import LorentzView from "./LorentzView.js";
export default class HintPanelView extends Panel {
  isPlaying = false;
  velocity = 0;
  aChecked = true;
  space_shuttle_x = 0;
  space_shuttle_x_ = 0;
  space_shuttle_t = 0;
  space_shuttle_t_ = 0;

  /**
   * @param {Node[]} children
   * @param {Object} [options]
   */
  constructor(options) {
    options = merge({
      cornerRadius: 5,
      xMargin: 6,
      yMargin: 8,
      stroke: 'rgb( 190, 190, 190 )',
      fill: 'rgb( 240, 240, 240 )',
      resize: false
    }, options);
    const fontSize = 18;
    let a = new RichText("说明：<br><br>可演示内容：动尺变短，动钟变慢，验证洛伦兹变换公式，以及双生子佯谬。<br><br>" + "我们假定，每次速度发生变化，都是由飞船引起。飞船变速这一事件，在两个系的时空坐标记作 (x1, t1), (x1', t1')。将其设置为新的时空原点，" + "对于之后任意时刻飞船的新坐标 (x2, t2), (x2', t2')，(x2-x1, t2-t1) 与 (x2'-x1', t2'-t1') 服从洛伦兹变换，直到下次变速过程发生，并再次更新时空原点。", {
      lineWrap: 419
    });
    const textSpeed0 = new Text("可以演示动尺变短，动钟变慢，验证洛伦兹变换公式，以及双生子佯谬:", {
      fontSize: fontSize
    });
    const lv = new LorentzView({});
    const vBox = new VBox({
      spacing: 6,
      children: [a]
    });
    super(vBox, options);
  }

  /**
   * @public
   * @override
   */
  /*dispose() {
    assert && assert( false, 'GraphControlPanel is not intended to be disposed' );
  }*/
}

//relativity.register( 'ControlPanelView', ControlPanelView );
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJtZXJnZSIsIlJpY2hUZXh0IiwiVGV4dCIsIlZCb3giLCJQYW5lbCIsIkxvcmVudHpWaWV3IiwiSGludFBhbmVsVmlldyIsImlzUGxheWluZyIsInZlbG9jaXR5IiwiYUNoZWNrZWQiLCJzcGFjZV9zaHV0dGxlX3giLCJzcGFjZV9zaHV0dGxlX3hfIiwic3BhY2Vfc2h1dHRsZV90Iiwic3BhY2Vfc2h1dHRsZV90XyIsImNvbnN0cnVjdG9yIiwib3B0aW9ucyIsImNvcm5lclJhZGl1cyIsInhNYXJnaW4iLCJ5TWFyZ2luIiwic3Ryb2tlIiwiZmlsbCIsInJlc2l6ZSIsImZvbnRTaXplIiwiYSIsImxpbmVXcmFwIiwidGV4dFNwZWVkMCIsImx2IiwidkJveCIsInNwYWNpbmciLCJjaGlsZHJlbiJdLCJzb3VyY2VzIjpbIkhpbnRQYW5lbFZpZXcudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTktMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogR3JhcGhDb250cm9sUGFuZWwgaXMgdGhlIGJhc2UgY2xhc3MgZm9yIGdyYXBoIGNvbnRyb2wgcGFuZWxzLiBUaGVzZSBwYW5lbHMgY29udGFpbiBjb250cm9scyB0aGF0IGFmZmVjdCB0aGUgZ3JhcGguXHJcbiAqXHJcbiAqIEBhdXRob3IgQnJhbmRvbiBMaVxyXG4gKiBAYXV0aG9yIENocmlzIE1hbGxleSAoUGl4ZWxab29tLCBJbmMuKVxyXG4gKi9cclxuXHJcbmltcG9ydCBtZXJnZSBmcm9tICcuLi8uLi8uLi8uLi9waGV0LWNvcmUvanMvbWVyZ2UuanMnO1xyXG5pbXBvcnQge0FsaWduQm94LCBIQm94LCBOb2RlLCBSaWNoVGV4dCwgVGV4dCwgVkJveH0gZnJvbSAnLi4vLi4vLi4vLi4vc2NlbmVyeS9qcy9pbXBvcnRzLmpzJztcclxuaW1wb3J0IFBhbmVsLCB7UGFuZWxPcHRpb25zfSBmcm9tICcuLi8uLi8uLi8uLi9zdW4vanMvUGFuZWwuanMnO1xyXG5pbXBvcnQgQm9vbGVhblByb3BlcnR5IGZyb20gXCIuLi8uLi8uLi8uLi9heG9uL2pzL0Jvb2xlYW5Qcm9wZXJ0eS5qc1wiO1xyXG5pbXBvcnQgTWF0aFN5bWJvbEZvbnQgZnJvbSBcIi4uLy4uLy4uLy4uL3NjZW5lcnktcGhldC9qcy9NYXRoU3ltYm9sRm9udC5qc1wiO1xyXG5pbXBvcnQgTnVtYmVyUHJvcGVydHkgZnJvbSBcIi4uLy4uLy4uLy4uL2F4b24vanMvTnVtYmVyUHJvcGVydHkuanNcIjtcclxuaW1wb3J0IFJhbmdlIGZyb20gXCIuLi8uLi8uLi8uLi9kb3QvanMvUmFuZ2UuanNcIjtcclxuaW1wb3J0IFBsYXlQYXVzZUJ1dHRvbiBmcm9tIFwiLi4vLi4vLi4vLi4vc2NlbmVyeS1waGV0L2pzL2J1dHRvbnMvUGxheVBhdXNlQnV0dG9uLmpzXCI7XHJcbmltcG9ydCBTbGlkZXIgZnJvbSBcIi4uLy4uLy4uLy4uL3N1bi9qcy9TbGlkZXIuanNcIjtcclxuaW1wb3J0IERpbWVuc2lvbjIgZnJvbSBcIi4uLy4uLy4uLy4uL2RvdC9qcy9EaW1lbnNpb24yLmpzXCI7XHJcbmltcG9ydCBMb3JlbnR6VmlldyBmcm9tIFwiLi9Mb3JlbnR6Vmlldy5qc1wiO1xyXG5pbXBvcnQgUmVsYXRpdml0eUNvbnN0YW50cyBmcm9tIFwiLi4vLi4vY29tbW9uL1JlbGF0aXZpdHlDb25zdGFudHNcIjtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEhpbnRQYW5lbFZpZXcgZXh0ZW5kcyBQYW5lbCB7XHJcbiAgcHVibGljIGlzUGxheWluZzogYm9vbGVhbiA9IGZhbHNlO1xyXG4gIHB1YmxpYyB2ZWxvY2l0eTogbnVtYmVyPTA7XHJcbiAgcHVibGljIGFDaGVja2VkOiBib29sZWFuPXRydWU7XHJcbiAgcHVibGljIHNwYWNlX3NodXR0bGVfeD0wXHJcbiAgcHVibGljIHNwYWNlX3NodXR0bGVfeF89MFxyXG4gIHB1YmxpYyBzcGFjZV9zaHV0dGxlX3Q9MFxyXG4gIHB1YmxpYyBzcGFjZV9zaHV0dGxlX3RfPTBcclxuXHJcbiAgLyoqXHJcbiAgICogQHBhcmFtIHtOb2RlW119IGNoaWxkcmVuXHJcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKCBvcHRpb25zOlBhbmVsT3B0aW9ucyApIHtcclxuXHJcbiAgICBvcHRpb25zID0gbWVyZ2UoIHtcclxuICAgICAgY29ybmVyUmFkaXVzOiA1LFxyXG4gICAgICB4TWFyZ2luOiA2LFxyXG4gICAgICB5TWFyZ2luOiA4LFxyXG4gICAgICBzdHJva2U6ICdyZ2IoIDE5MCwgMTkwLCAxOTAgKScsXHJcbiAgICAgIGZpbGw6ICdyZ2IoIDI0MCwgMjQwLCAyNDAgKScsXHJcbiAgICAgIHJlc2l6ZTogZmFsc2UsXHJcbiAgICB9LCBvcHRpb25zICk7XHJcblxyXG4gICAgY29uc3QgZm9udFNpemUgPSAxOFxyXG4gICAgbGV0IGEgPSBuZXcgUmljaFRleHQoXCLor7TmmI7vvJo8YnI+PGJyPuWPr+a8lOekuuWGheWuue+8muWKqOWwuuWPmOefre+8jOWKqOmSn+WPmOaFou+8jOmqjOivgea0m+S8puWFueWPmOaNouWFrOW8j++8jOS7peWPiuWPjOeUn+WtkOS9r+iwrOOAgjxicj48YnI+XCIgK1xyXG4gICAgICAgIFwi5oiR5Lus5YGH5a6a77yM5q+P5qyh6YCf5bqm5Y+R55Sf5Y+Y5YyW77yM6YO95piv55Sx6aOe6Ii55byV6LW344CC6aOe6Ii55Y+Y6YCf6L+Z5LiA5LqL5Lu277yM5Zyo5Lik5Liq57O755qE5pe256m65Z2Q5qCH6K6w5L2cICh4MSwgdDEpLCAoeDEnLCB0MScp44CC5bCG5YW26K6+572u5Li65paw55qE5pe256m65Y6f54K577yMXCIgK1xyXG4gICAgICAgIFwi5a+55LqO5LmL5ZCO5Lu75oSP5pe25Yi76aOe6Ii555qE5paw5Z2Q5qCHICh4MiwgdDIpLCAoeDInLCB0Micp77yMKHgyLXgxLCB0Mi10MSkg5LiOICh4MicteDEnLCB0MictdDEnKSDmnI3ku47mtJvkvKblhbnlj5jmjaLvvIznm7TliLDkuIvmrKHlj5jpgJ/ov4fnqIvlj5HnlJ/vvIzlubblho3mrKHmm7TmlrDml7bnqbrljp/ngrnjgIJcIix7IGxpbmVXcmFwOiA0MTl9KVxyXG4gICAgY29uc3QgdGV4dFNwZWVkMCA9IG5ldyBUZXh0KCBcIuWPr+S7pea8lOekuuWKqOWwuuWPmOefre+8jOWKqOmSn+WPmOaFou+8jOmqjOivgea0m+S8puWFueWPmOaNouWFrOW8j++8jOS7peWPiuWPjOeUn+WtkOS9r+iwrDpcIiwgeyAgZm9udFNpemU6IGZvbnRTaXplICB9ICk7XHJcbiAgICBjb25zdCBsdiA9IG5ldyBMb3JlbnR6Vmlldyh7fSlcclxuXHJcbiAgICBjb25zdCB2Qm94ID0gbmV3IFZCb3goe1xyXG4gICAgICBzcGFjaW5nOiA2LFxyXG4gICAgICBjaGlsZHJlbjogWyBhIF0sXHJcbiAgICB9KTtcclxuXHJcbiAgICBzdXBlcih2Qm94LCBvcHRpb25zKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBwdWJsaWNcclxuICAgKiBAb3ZlcnJpZGVcclxuICAgKi9cclxuICAvKmRpc3Bvc2UoKSB7XHJcbiAgICBhc3NlcnQgJiYgYXNzZXJ0KCBmYWxzZSwgJ0dyYXBoQ29udHJvbFBhbmVsIGlzIG5vdCBpbnRlbmRlZCB0byBiZSBkaXNwb3NlZCcgKTtcclxuICB9Ki9cclxufVxyXG5cclxuLy9yZWxhdGl2aXR5LnJlZ2lzdGVyKCAnQ29udHJvbFBhbmVsVmlldycsIENvbnRyb2xQYW5lbFZpZXcgKTsiXSwibWFwcGluZ3MiOiJBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxLQUFLLE1BQU0sbUNBQW1DO0FBQ3JELFNBQThCQyxRQUFRLEVBQUVDLElBQUksRUFBRUMsSUFBSSxRQUFPLG1DQUFtQztBQUM1RixPQUFPQyxLQUFLLE1BQXNCLDZCQUE2QjtBQVEvRCxPQUFPQyxXQUFXLE1BQU0sa0JBQWtCO0FBRzFDLGVBQWUsTUFBTUMsYUFBYSxTQUFTRixLQUFLLENBQUM7RUFDeENHLFNBQVMsR0FBWSxLQUFLO0VBQzFCQyxRQUFRLEdBQVMsQ0FBQztFQUNsQkMsUUFBUSxHQUFVLElBQUk7RUFDdEJDLGVBQWUsR0FBQyxDQUFDO0VBQ2pCQyxnQkFBZ0IsR0FBQyxDQUFDO0VBQ2xCQyxlQUFlLEdBQUMsQ0FBQztFQUNqQkMsZ0JBQWdCLEdBQUMsQ0FBQzs7RUFFekI7QUFDRjtBQUNBO0FBQ0E7RUFDRUMsV0FBV0EsQ0FBRUMsT0FBb0IsRUFBRztJQUVsQ0EsT0FBTyxHQUFHZixLQUFLLENBQUU7TUFDZmdCLFlBQVksRUFBRSxDQUFDO01BQ2ZDLE9BQU8sRUFBRSxDQUFDO01BQ1ZDLE9BQU8sRUFBRSxDQUFDO01BQ1ZDLE1BQU0sRUFBRSxzQkFBc0I7TUFDOUJDLElBQUksRUFBRSxzQkFBc0I7TUFDNUJDLE1BQU0sRUFBRTtJQUNWLENBQUMsRUFBRU4sT0FBUSxDQUFDO0lBRVosTUFBTU8sUUFBUSxHQUFHLEVBQUU7SUFDbkIsSUFBSUMsQ0FBQyxHQUFHLElBQUl0QixRQUFRLENBQUMsdURBQXVELEdBQ3hFLDhFQUE4RSxHQUM5RSx1R0FBdUcsRUFBQztNQUFFdUIsUUFBUSxFQUFFO0lBQUcsQ0FBQyxDQUFDO0lBQzdILE1BQU1DLFVBQVUsR0FBRyxJQUFJdkIsSUFBSSxDQUFFLGtDQUFrQyxFQUFFO01BQUdvQixRQUFRLEVBQUVBO0lBQVUsQ0FBRSxDQUFDO0lBQzNGLE1BQU1JLEVBQUUsR0FBRyxJQUFJckIsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBRTlCLE1BQU1zQixJQUFJLEdBQUcsSUFBSXhCLElBQUksQ0FBQztNQUNwQnlCLE9BQU8sRUFBRSxDQUFDO01BQ1ZDLFFBQVEsRUFBRSxDQUFFTixDQUFDO0lBQ2YsQ0FBQyxDQUFDO0lBRUYsS0FBSyxDQUFDSSxJQUFJLEVBQUVaLE9BQU8sQ0FBQztFQUN0Qjs7RUFFQTtBQUNGO0FBQ0E7QUFDQTtFQUNFO0FBQ0Y7QUFDQTtBQUNBOztBQUVBIn0=