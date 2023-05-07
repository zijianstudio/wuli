// Copyright 2022, University of Colorado Boulder

/**
 * Wire up a draggable/resizable div for the canvas element to live in. Returns that container
 * This code was adapted from https://evangelistagrace.github.io/tutorials/draggable-and-resizable-div.html
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import tangible from '../tangible.js';
const CAPTURE = {
  capture: true
};
const draggableResizableElement = htmlElement => {
  const item = document.createElement('div');
  item.classList.add('item');
  item.style.zIndex = '100000';
  item.style.bottom = '0'; // initially put it on the bottom
  const content = document.createElement('div');
  content.classList.add('content');
  content.appendChild(htmlElement);
  item.appendChild(content);
  const createResizer = className => {
    const div = document.createElement('div');
    div.classList.add('resizer');
    div.classList.add(className);
    return div;
  };
  const resizers = [createResizer('top-left'), createResizer('top-right'), createResizer('bottom-left'), createResizer('bottom-right')];
  resizers.forEach(resizer => item.appendChild(resizer));
  const style = document.createElement('style');
  style.setAttribute('id', 'new-animations');
  style.setAttribute('type', 'text/css');
  document.head.appendChild(style);
  style.innerHTML = `
.item {
    width: 640px;
    height: 350px;
    position: fixed;
    background-color: lightsalmon;
    padding: 4px;
    box-sizing: border-box;
    cursor: move;
  }
.item .content {
    height: 100%;
  }
.item .content h3 {
    text-align: center;
    font-family: Merriweather, serif;
  }

.resizer {
    position: absolute;
    width: 10px;
    height: 10px;
    background: black;
    z-index: 2;
  }
.resizer.top-left {
    top: -1px;
    left: -1px;
    cursor: nw-resize;
  }
.resizer.top-right {
    top: -1px;
    right: -1px;
    cursor: ne-resize;
  }
.resizer.bottom-left {
    bottom: -1px;
    left: -1px;
    cursor: sw-resize;
  }
.resizer.bottom-right {
    bottom: -1px;
    right: -1px;
    cursor: se-resize;
  }
  `;
  const minWidth = 100;
  const minHeight = 100;
  const maxWidth = 900;
  const maxHeight = 900;
  let isResizing = false;

  // Resizers must be first so that the capture in the "item" listener doesn't suck up the event for the resizer
  resizers.forEach(resizer => {
    resizer.addEventListener('pointerdown', e => {
      e.preventDefault();
      e.cancelBubble = true;
      const prevX = e.clientX;
      const prevY = e.clientY;
      const currentResizer = e.target;
      const rect = item.getBoundingClientRect();
      const prevLeft = rect.left;
      const prevTop = rect.top;
      let newWidth;
      let newHeight;
      isResizing = true;
      const pointermove = e => {
        e.preventDefault();
        e.cancelBubble = true;
        const newX = prevX - e.clientX; //negative to the right, positive to the left
        const newY = prevY - e.clientY; //negative to the bottom, positive to the top
        if (currentResizer.classList.contains('bottom-right')) {
          newWidth = rect.width - newX;
          newHeight = rect.height - newY;
          if (newWidth > minWidth && newWidth < maxWidth) {
            item.style.width = newWidth + 'px';
          }
          if (newHeight > minHeight && newHeight < maxHeight) {
            item.style.height = newHeight + 'px';
          }
        } else if (currentResizer.classList.contains('bottom-left')) {
          newWidth = rect.width + newX;
          newHeight = rect.height - newY;
          if (newWidth > minWidth && newWidth < maxWidth) {
            item.style.left = prevLeft - newX + 'px';
            item.style.width = newWidth + 'px';
          }
          if (newHeight > minHeight && newHeight < maxHeight) {
            item.style.height = newHeight + 'px';
          }
        } else if (currentResizer.classList.contains('top-right')) {
          newWidth = rect.width - newX;
          newHeight = rect.height + newY;
          if (newWidth > minWidth && newWidth < maxWidth) {
            item.style.width = newWidth + 'px';
          }
          if (newHeight > minHeight && newHeight < maxHeight) {
            item.style.top = prevTop - newY + 'px';
            item.style.height = newHeight + 'px';
          }
        } else if (currentResizer.classList.contains('top-left')) {
          newWidth = rect.width + newX;
          newHeight = rect.height + newY;
          if (newWidth > minWidth && newWidth < maxWidth) {
            item.style.left = prevLeft - newX + 'px';
            item.style.width = newWidth + 'px';
          }
          if (newHeight > minHeight && newHeight < maxHeight) {
            item.style.top = prevTop - newY + 'px';
            item.style.height = newHeight + 'px';
          }
        }
      };
      const pointerup = e => {
        e.preventDefault();
        e.cancelBubble = true;
        isResizing = false;
        window.removeEventListener('pointermove', pointermove, CAPTURE);
        window.removeEventListener('pointerup', pointerup, CAPTURE);
      };
      window.addEventListener('pointermove', pointermove, CAPTURE);
      window.addEventListener('pointerup', pointerup, CAPTURE);
    }, CAPTURE);
  });
  item.addEventListener('pointerdown', e => {
    if (!(e.target && e.target.classList.contains('resizer'))) {
      e.preventDefault();
      e.cancelBubble = true;
    }

    //get the initial mouse coordinates and the position coordinates of the element
    const prevX = e.clientX;
    const prevY = e.clientY;
    const rect = content.getBoundingClientRect();
    const prevLeft = rect.left;
    const prevTop = rect.top;
    const pointermove = e => {
      if (isResizing) {
        return;
      }
      e.preventDefault();
      e.cancelBubble = true;

      //get horizontal and vertical distance of the mouse move
      const newX = prevX - e.clientX; //negative to the right, positive to the left
      const newY = prevY - e.clientY; //negative to the bottom, positive to the top

      //set coordinates of the element to move it to its new position
      item.style.left = prevLeft - newX + 'px';
      item.style.top = prevTop - newY + 'px';
    };
    const pointerup = e => {
      e.preventDefault();
      e.cancelBubble = true;
      window.removeEventListener('pointermove', pointermove, CAPTURE);
      window.removeEventListener('pointerup', pointerup, CAPTURE);
    };
    window.addEventListener('pointermove', pointermove, CAPTURE);
    window.addEventListener('pointerup', pointerup, CAPTURE);
  }, CAPTURE);
  return item;
};
tangible.register('draggableResizableElement', draggableResizableElement);
export default draggableResizableElement;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJ0YW5naWJsZSIsIkNBUFRVUkUiLCJjYXB0dXJlIiwiZHJhZ2dhYmxlUmVzaXphYmxlRWxlbWVudCIsImh0bWxFbGVtZW50IiwiaXRlbSIsImRvY3VtZW50IiwiY3JlYXRlRWxlbWVudCIsImNsYXNzTGlzdCIsImFkZCIsInN0eWxlIiwiekluZGV4IiwiYm90dG9tIiwiY29udGVudCIsImFwcGVuZENoaWxkIiwiY3JlYXRlUmVzaXplciIsImNsYXNzTmFtZSIsImRpdiIsInJlc2l6ZXJzIiwiZm9yRWFjaCIsInJlc2l6ZXIiLCJzZXRBdHRyaWJ1dGUiLCJoZWFkIiwiaW5uZXJIVE1MIiwibWluV2lkdGgiLCJtaW5IZWlnaHQiLCJtYXhXaWR0aCIsIm1heEhlaWdodCIsImlzUmVzaXppbmciLCJhZGRFdmVudExpc3RlbmVyIiwiZSIsInByZXZlbnREZWZhdWx0IiwiY2FuY2VsQnViYmxlIiwicHJldlgiLCJjbGllbnRYIiwicHJldlkiLCJjbGllbnRZIiwiY3VycmVudFJlc2l6ZXIiLCJ0YXJnZXQiLCJyZWN0IiwiZ2V0Qm91bmRpbmdDbGllbnRSZWN0IiwicHJldkxlZnQiLCJsZWZ0IiwicHJldlRvcCIsInRvcCIsIm5ld1dpZHRoIiwibmV3SGVpZ2h0IiwicG9pbnRlcm1vdmUiLCJuZXdYIiwibmV3WSIsImNvbnRhaW5zIiwid2lkdGgiLCJoZWlnaHQiLCJwb2ludGVydXAiLCJ3aW5kb3ciLCJyZW1vdmVFdmVudExpc3RlbmVyIiwicmVnaXN0ZXIiXSwic291cmNlcyI6WyJkcmFnZ2FibGVSZXNpemFibGVIVE1MRWxlbWVudC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAyMiwgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogV2lyZSB1cCBhIGRyYWdnYWJsZS9yZXNpemFibGUgZGl2IGZvciB0aGUgY2FudmFzIGVsZW1lbnQgdG8gbGl2ZSBpbi4gUmV0dXJucyB0aGF0IGNvbnRhaW5lclxyXG4gKiBUaGlzIGNvZGUgd2FzIGFkYXB0ZWQgZnJvbSBodHRwczovL2V2YW5nZWxpc3RhZ3JhY2UuZ2l0aHViLmlvL3R1dG9yaWFscy9kcmFnZ2FibGUtYW5kLXJlc2l6YWJsZS1kaXYuaHRtbFxyXG4gKiBAYXV0aG9yIE1pY2hhZWwgS2F1em1hbm4gKFBoRVQgSW50ZXJhY3RpdmUgU2ltdWxhdGlvbnMpXHJcbiAqL1xyXG5cclxuaW1wb3J0IHRhbmdpYmxlIGZyb20gJy4uL3RhbmdpYmxlLmpzJztcclxuXHJcbmNvbnN0IENBUFRVUkUgPSB7IGNhcHR1cmU6IHRydWUgfTtcclxuXHJcbmNvbnN0IGRyYWdnYWJsZVJlc2l6YWJsZUVsZW1lbnQgPSAoIGh0bWxFbGVtZW50OiBIVE1MRWxlbWVudCApOiBIVE1MRWxlbWVudCA9PiB7XHJcbiAgY29uc3QgaXRlbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdkaXYnICk7XHJcbiAgaXRlbS5jbGFzc0xpc3QuYWRkKCAnaXRlbScgKTtcclxuICBpdGVtLnN0eWxlLnpJbmRleCA9ICcxMDAwMDAnO1xyXG4gIGl0ZW0uc3R5bGUuYm90dG9tID0gJzAnOyAvLyBpbml0aWFsbHkgcHV0IGl0IG9uIHRoZSBib3R0b21cclxuICBjb25zdCBjb250ZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2RpdicgKTtcclxuICBjb250ZW50LmNsYXNzTGlzdC5hZGQoICdjb250ZW50JyApO1xyXG4gIGNvbnRlbnQuYXBwZW5kQ2hpbGQoIGh0bWxFbGVtZW50ICk7XHJcbiAgaXRlbS5hcHBlbmRDaGlsZCggY29udGVudCApO1xyXG5cclxuICBjb25zdCBjcmVhdGVSZXNpemVyID0gKCBjbGFzc05hbWU6IHN0cmluZyApID0+IHtcclxuICAgIGNvbnN0IGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdkaXYnICk7XHJcbiAgICBkaXYuY2xhc3NMaXN0LmFkZCggJ3Jlc2l6ZXInICk7XHJcbiAgICBkaXYuY2xhc3NMaXN0LmFkZCggY2xhc3NOYW1lICk7XHJcbiAgICByZXR1cm4gZGl2O1xyXG4gIH07XHJcbiAgY29uc3QgcmVzaXplcnMgPSBbXHJcbiAgICBjcmVhdGVSZXNpemVyKCAndG9wLWxlZnQnICksXHJcbiAgICBjcmVhdGVSZXNpemVyKCAndG9wLXJpZ2h0JyApLFxyXG4gICAgY3JlYXRlUmVzaXplciggJ2JvdHRvbS1sZWZ0JyApLFxyXG4gICAgY3JlYXRlUmVzaXplciggJ2JvdHRvbS1yaWdodCcgKVxyXG4gIF07XHJcbiAgcmVzaXplcnMuZm9yRWFjaCggcmVzaXplciA9PiBpdGVtLmFwcGVuZENoaWxkKCByZXNpemVyICkgKTtcclxuXHJcbiAgY29uc3Qgc3R5bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnc3R5bGUnICk7XHJcbiAgc3R5bGUuc2V0QXR0cmlidXRlKCAnaWQnLCAnbmV3LWFuaW1hdGlvbnMnICk7XHJcbiAgc3R5bGUuc2V0QXR0cmlidXRlKCAndHlwZScsICd0ZXh0L2NzcycgKTtcclxuICBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKCBzdHlsZSApO1xyXG4gIHN0eWxlLmlubmVySFRNTCA9IGBcclxuLml0ZW0ge1xyXG4gICAgd2lkdGg6IDY0MHB4O1xyXG4gICAgaGVpZ2h0OiAzNTBweDtcclxuICAgIHBvc2l0aW9uOiBmaXhlZDtcclxuICAgIGJhY2tncm91bmQtY29sb3I6IGxpZ2h0c2FsbW9uO1xyXG4gICAgcGFkZGluZzogNHB4O1xyXG4gICAgYm94LXNpemluZzogYm9yZGVyLWJveDtcclxuICAgIGN1cnNvcjogbW92ZTtcclxuICB9XHJcbi5pdGVtIC5jb250ZW50IHtcclxuICAgIGhlaWdodDogMTAwJTtcclxuICB9XHJcbi5pdGVtIC5jb250ZW50IGgzIHtcclxuICAgIHRleHQtYWxpZ246IGNlbnRlcjtcclxuICAgIGZvbnQtZmFtaWx5OiBNZXJyaXdlYXRoZXIsIHNlcmlmO1xyXG4gIH1cclxuXHJcbi5yZXNpemVyIHtcclxuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcclxuICAgIHdpZHRoOiAxMHB4O1xyXG4gICAgaGVpZ2h0OiAxMHB4O1xyXG4gICAgYmFja2dyb3VuZDogYmxhY2s7XHJcbiAgICB6LWluZGV4OiAyO1xyXG4gIH1cclxuLnJlc2l6ZXIudG9wLWxlZnQge1xyXG4gICAgdG9wOiAtMXB4O1xyXG4gICAgbGVmdDogLTFweDtcclxuICAgIGN1cnNvcjogbnctcmVzaXplO1xyXG4gIH1cclxuLnJlc2l6ZXIudG9wLXJpZ2h0IHtcclxuICAgIHRvcDogLTFweDtcclxuICAgIHJpZ2h0OiAtMXB4O1xyXG4gICAgY3Vyc29yOiBuZS1yZXNpemU7XHJcbiAgfVxyXG4ucmVzaXplci5ib3R0b20tbGVmdCB7XHJcbiAgICBib3R0b206IC0xcHg7XHJcbiAgICBsZWZ0OiAtMXB4O1xyXG4gICAgY3Vyc29yOiBzdy1yZXNpemU7XHJcbiAgfVxyXG4ucmVzaXplci5ib3R0b20tcmlnaHQge1xyXG4gICAgYm90dG9tOiAtMXB4O1xyXG4gICAgcmlnaHQ6IC0xcHg7XHJcbiAgICBjdXJzb3I6IHNlLXJlc2l6ZTtcclxuICB9XHJcbiAgYDtcclxuXHJcbiAgY29uc3QgbWluV2lkdGggPSAxMDA7XHJcbiAgY29uc3QgbWluSGVpZ2h0ID0gMTAwO1xyXG4gIGNvbnN0IG1heFdpZHRoID0gOTAwO1xyXG4gIGNvbnN0IG1heEhlaWdodCA9IDkwMDtcclxuXHJcbiAgbGV0IGlzUmVzaXppbmcgPSBmYWxzZTtcclxuXHJcblxyXG4gIC8vIFJlc2l6ZXJzIG11c3QgYmUgZmlyc3Qgc28gdGhhdCB0aGUgY2FwdHVyZSBpbiB0aGUgXCJpdGVtXCIgbGlzdGVuZXIgZG9lc24ndCBzdWNrIHVwIHRoZSBldmVudCBmb3IgdGhlIHJlc2l6ZXJcclxuICByZXNpemVycy5mb3JFYWNoKCAoIHJlc2l6ZXI6IE5vZGUgKSA9PiB7XHJcbiAgICByZXNpemVyLmFkZEV2ZW50TGlzdGVuZXIoICdwb2ludGVyZG93bicsICggKCBlOiBQb2ludGVyRXZlbnQgKSA9PiB7XHJcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgZS5jYW5jZWxCdWJibGUgPSB0cnVlO1xyXG5cclxuICAgICAgY29uc3QgcHJldlggPSBlLmNsaWVudFg7XHJcbiAgICAgIGNvbnN0IHByZXZZID0gZS5jbGllbnRZO1xyXG4gICAgICBjb25zdCBjdXJyZW50UmVzaXplciA9IGUudGFyZ2V0O1xyXG4gICAgICBjb25zdCByZWN0ID0gaXRlbS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuICAgICAgY29uc3QgcHJldkxlZnQgPSByZWN0LmxlZnQ7XHJcbiAgICAgIGNvbnN0IHByZXZUb3AgPSByZWN0LnRvcDtcclxuICAgICAgbGV0IG5ld1dpZHRoO1xyXG4gICAgICBsZXQgbmV3SGVpZ2h0O1xyXG5cclxuICAgICAgaXNSZXNpemluZyA9IHRydWU7XHJcblxyXG4gICAgICBjb25zdCBwb2ludGVybW92ZSA9ICggZTogUG9pbnRlckV2ZW50ICkgPT4ge1xyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuXHJcbiAgICAgICAgZS5jYW5jZWxCdWJibGUgPSB0cnVlO1xyXG4gICAgICAgIGNvbnN0IG5ld1ggPSBwcmV2WCAtIGUuY2xpZW50WDsgLy9uZWdhdGl2ZSB0byB0aGUgcmlnaHQsIHBvc2l0aXZlIHRvIHRoZSBsZWZ0XHJcbiAgICAgICAgY29uc3QgbmV3WSA9IHByZXZZIC0gZS5jbGllbnRZOyAvL25lZ2F0aXZlIHRvIHRoZSBib3R0b20sIHBvc2l0aXZlIHRvIHRoZSB0b3BcclxuICAgICAgICBpZiAoICggY3VycmVudFJlc2l6ZXIgYXMgRWxlbWVudCApLmNsYXNzTGlzdC5jb250YWlucyggJ2JvdHRvbS1yaWdodCcgKSApIHtcclxuICAgICAgICAgIG5ld1dpZHRoID0gcmVjdC53aWR0aCAtIG5ld1g7XHJcbiAgICAgICAgICBuZXdIZWlnaHQgPSByZWN0LmhlaWdodCAtIG5ld1k7XHJcbiAgICAgICAgICBpZiAoIG5ld1dpZHRoID4gbWluV2lkdGggJiYgbmV3V2lkdGggPCBtYXhXaWR0aCApIHtcclxuICAgICAgICAgICAgaXRlbS5zdHlsZS53aWR0aCA9IG5ld1dpZHRoICsgJ3B4JztcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGlmICggbmV3SGVpZ2h0ID4gbWluSGVpZ2h0ICYmIG5ld0hlaWdodCA8IG1heEhlaWdodCApIHtcclxuICAgICAgICAgICAgaXRlbS5zdHlsZS5oZWlnaHQgPSBuZXdIZWlnaHQgKyAncHgnO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoICggY3VycmVudFJlc2l6ZXIgYXMgRWxlbWVudCApLmNsYXNzTGlzdC5jb250YWlucyggJ2JvdHRvbS1sZWZ0JyApICkge1xyXG4gICAgICAgICAgbmV3V2lkdGggPSByZWN0LndpZHRoICsgbmV3WDtcclxuICAgICAgICAgIG5ld0hlaWdodCA9IHJlY3QuaGVpZ2h0IC0gbmV3WTtcclxuXHJcbiAgICAgICAgICBpZiAoIG5ld1dpZHRoID4gbWluV2lkdGggJiYgbmV3V2lkdGggPCBtYXhXaWR0aCApIHtcclxuICAgICAgICAgICAgaXRlbS5zdHlsZS5sZWZ0ID0gcHJldkxlZnQgLSBuZXdYICsgJ3B4JztcclxuICAgICAgICAgICAgaXRlbS5zdHlsZS53aWR0aCA9IG5ld1dpZHRoICsgJ3B4JztcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGlmICggbmV3SGVpZ2h0ID4gbWluSGVpZ2h0ICYmIG5ld0hlaWdodCA8IG1heEhlaWdodCApIHtcclxuICAgICAgICAgICAgaXRlbS5zdHlsZS5oZWlnaHQgPSBuZXdIZWlnaHQgKyAncHgnO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICggKCBjdXJyZW50UmVzaXplciBhcyBFbGVtZW50ICkuY2xhc3NMaXN0LmNvbnRhaW5zKCAndG9wLXJpZ2h0JyApICkge1xyXG4gICAgICAgICAgbmV3V2lkdGggPSByZWN0LndpZHRoIC0gbmV3WDtcclxuICAgICAgICAgIG5ld0hlaWdodCA9IHJlY3QuaGVpZ2h0ICsgbmV3WTtcclxuXHJcbiAgICAgICAgICBpZiAoIG5ld1dpZHRoID4gbWluV2lkdGggJiYgbmV3V2lkdGggPCBtYXhXaWR0aCApIHtcclxuICAgICAgICAgICAgaXRlbS5zdHlsZS53aWR0aCA9IG5ld1dpZHRoICsgJ3B4JztcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGlmICggbmV3SGVpZ2h0ID4gbWluSGVpZ2h0ICYmIG5ld0hlaWdodCA8IG1heEhlaWdodCApIHtcclxuICAgICAgICAgICAgaXRlbS5zdHlsZS50b3AgPSBwcmV2VG9wIC0gbmV3WSArICdweCc7XHJcbiAgICAgICAgICAgIGl0ZW0uc3R5bGUuaGVpZ2h0ID0gbmV3SGVpZ2h0ICsgJ3B4JztcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKCAoIGN1cnJlbnRSZXNpemVyIGFzIEVsZW1lbnQgKS5jbGFzc0xpc3QuY29udGFpbnMoICd0b3AtbGVmdCcgKSApIHtcclxuICAgICAgICAgIG5ld1dpZHRoID0gcmVjdC53aWR0aCArIG5ld1g7XHJcbiAgICAgICAgICBuZXdIZWlnaHQgPSByZWN0LmhlaWdodCArIG5ld1k7XHJcblxyXG4gICAgICAgICAgaWYgKCBuZXdXaWR0aCA+IG1pbldpZHRoICYmIG5ld1dpZHRoIDwgbWF4V2lkdGggKSB7XHJcbiAgICAgICAgICAgIGl0ZW0uc3R5bGUubGVmdCA9IHByZXZMZWZ0IC0gbmV3WCArICdweCc7XHJcbiAgICAgICAgICAgIGl0ZW0uc3R5bGUud2lkdGggPSBuZXdXaWR0aCArICdweCc7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBpZiAoIG5ld0hlaWdodCA+IG1pbkhlaWdodCAmJiBuZXdIZWlnaHQgPCBtYXhIZWlnaHQgKSB7XHJcbiAgICAgICAgICAgIGl0ZW0uc3R5bGUudG9wID0gcHJldlRvcCAtIG5ld1kgKyAncHgnO1xyXG4gICAgICAgICAgICBpdGVtLnN0eWxlLmhlaWdodCA9IG5ld0hlaWdodCArICdweCc7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9O1xyXG5cclxuICAgICAgY29uc3QgcG9pbnRlcnVwID0gKCBlOiBQb2ludGVyRXZlbnQgKSA9PiB7XHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIGUuY2FuY2VsQnViYmxlID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgaXNSZXNpemluZyA9IGZhbHNlO1xyXG4gICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCAncG9pbnRlcm1vdmUnLCBwb2ludGVybW92ZSwgQ0FQVFVSRSApO1xyXG4gICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCAncG9pbnRlcnVwJywgcG9pbnRlcnVwLCBDQVBUVVJFICk7XHJcbiAgICAgIH07XHJcblxyXG4gICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciggJ3BvaW50ZXJtb3ZlJywgcG9pbnRlcm1vdmUsIENBUFRVUkUgKTtcclxuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoICdwb2ludGVydXAnLCBwb2ludGVydXAsIENBUFRVUkUgKTtcclxuICAgIH0gKSBhcyBFdmVudExpc3RlbmVyLCBDQVBUVVJFICk7XHJcbiAgfSApO1xyXG5cclxuXHJcbiAgaXRlbS5hZGRFdmVudExpc3RlbmVyKCAncG9pbnRlcmRvd24nLCAoIGU6IFBvaW50ZXJFdmVudCApID0+IHtcclxuICAgIGlmICggISggZS50YXJnZXQgJiYgKCBlLnRhcmdldCBhcyBFbGVtZW50ICkuY2xhc3NMaXN0LmNvbnRhaW5zKCAncmVzaXplcicgKSApICkge1xyXG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgIGUuY2FuY2VsQnViYmxlID0gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICAvL2dldCB0aGUgaW5pdGlhbCBtb3VzZSBjb29yZGluYXRlcyBhbmQgdGhlIHBvc2l0aW9uIGNvb3JkaW5hdGVzIG9mIHRoZSBlbGVtZW50XHJcbiAgICBjb25zdCBwcmV2WCA9IGUuY2xpZW50WDtcclxuICAgIGNvbnN0IHByZXZZID0gZS5jbGllbnRZO1xyXG4gICAgY29uc3QgcmVjdCA9IGNvbnRlbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcbiAgICBjb25zdCBwcmV2TGVmdCA9IHJlY3QubGVmdDtcclxuICAgIGNvbnN0IHByZXZUb3AgPSByZWN0LnRvcDtcclxuXHJcbiAgICBjb25zdCBwb2ludGVybW92ZSA9ICggZTogUG9pbnRlckV2ZW50ICkgPT4ge1xyXG5cclxuICAgICAgaWYgKCBpc1Jlc2l6aW5nICkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgIGUuY2FuY2VsQnViYmxlID0gdHJ1ZTtcclxuXHJcbiAgICAgIC8vZ2V0IGhvcml6b250YWwgYW5kIHZlcnRpY2FsIGRpc3RhbmNlIG9mIHRoZSBtb3VzZSBtb3ZlXHJcbiAgICAgIGNvbnN0IG5ld1ggPSBwcmV2WCAtIGUuY2xpZW50WDsgLy9uZWdhdGl2ZSB0byB0aGUgcmlnaHQsIHBvc2l0aXZlIHRvIHRoZSBsZWZ0XHJcbiAgICAgIGNvbnN0IG5ld1kgPSBwcmV2WSAtIGUuY2xpZW50WTsgLy9uZWdhdGl2ZSB0byB0aGUgYm90dG9tLCBwb3NpdGl2ZSB0byB0aGUgdG9wXHJcblxyXG4gICAgICAvL3NldCBjb29yZGluYXRlcyBvZiB0aGUgZWxlbWVudCB0byBtb3ZlIGl0IHRvIGl0cyBuZXcgcG9zaXRpb25cclxuICAgICAgaXRlbS5zdHlsZS5sZWZ0ID0gcHJldkxlZnQgLSBuZXdYICsgJ3B4JztcclxuICAgICAgaXRlbS5zdHlsZS50b3AgPSBwcmV2VG9wIC0gbmV3WSArICdweCc7XHJcbiAgICB9O1xyXG5cclxuICAgIGNvbnN0IHBvaW50ZXJ1cCA9ICggZTogUG9pbnRlckV2ZW50ICkgPT4ge1xyXG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgIGUuY2FuY2VsQnViYmxlID0gdHJ1ZTtcclxuXHJcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCAncG9pbnRlcm1vdmUnLCBwb2ludGVybW92ZSwgQ0FQVFVSRSApO1xyXG4gICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ3BvaW50ZXJ1cCcsIHBvaW50ZXJ1cCwgQ0FQVFVSRSApO1xyXG4gICAgfTtcclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCAncG9pbnRlcm1vdmUnLCBwb2ludGVybW92ZSwgQ0FQVFVSRSApO1xyXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoICdwb2ludGVydXAnLCBwb2ludGVydXAsIENBUFRVUkUgKTtcclxuICB9LCBDQVBUVVJFICk7XHJcblxyXG4gIHJldHVybiBpdGVtO1xyXG59O1xyXG5cclxuXHJcbnRhbmdpYmxlLnJlZ2lzdGVyKCAnZHJhZ2dhYmxlUmVzaXphYmxlRWxlbWVudCcsIGRyYWdnYWJsZVJlc2l6YWJsZUVsZW1lbnQgKTtcclxuZXhwb3J0IGRlZmF1bHQgZHJhZ2dhYmxlUmVzaXphYmxlRWxlbWVudDtcclxuIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE9BQU9BLFFBQVEsTUFBTSxnQkFBZ0I7QUFFckMsTUFBTUMsT0FBTyxHQUFHO0VBQUVDLE9BQU8sRUFBRTtBQUFLLENBQUM7QUFFakMsTUFBTUMseUJBQXlCLEdBQUtDLFdBQXdCLElBQW1CO0VBQzdFLE1BQU1DLElBQUksR0FBR0MsUUFBUSxDQUFDQyxhQUFhLENBQUUsS0FBTSxDQUFDO0VBQzVDRixJQUFJLENBQUNHLFNBQVMsQ0FBQ0MsR0FBRyxDQUFFLE1BQU8sQ0FBQztFQUM1QkosSUFBSSxDQUFDSyxLQUFLLENBQUNDLE1BQU0sR0FBRyxRQUFRO0VBQzVCTixJQUFJLENBQUNLLEtBQUssQ0FBQ0UsTUFBTSxHQUFHLEdBQUcsQ0FBQyxDQUFDO0VBQ3pCLE1BQU1DLE9BQU8sR0FBR1AsUUFBUSxDQUFDQyxhQUFhLENBQUUsS0FBTSxDQUFDO0VBQy9DTSxPQUFPLENBQUNMLFNBQVMsQ0FBQ0MsR0FBRyxDQUFFLFNBQVUsQ0FBQztFQUNsQ0ksT0FBTyxDQUFDQyxXQUFXLENBQUVWLFdBQVksQ0FBQztFQUNsQ0MsSUFBSSxDQUFDUyxXQUFXLENBQUVELE9BQVEsQ0FBQztFQUUzQixNQUFNRSxhQUFhLEdBQUtDLFNBQWlCLElBQU07SUFDN0MsTUFBTUMsR0FBRyxHQUFHWCxRQUFRLENBQUNDLGFBQWEsQ0FBRSxLQUFNLENBQUM7SUFDM0NVLEdBQUcsQ0FBQ1QsU0FBUyxDQUFDQyxHQUFHLENBQUUsU0FBVSxDQUFDO0lBQzlCUSxHQUFHLENBQUNULFNBQVMsQ0FBQ0MsR0FBRyxDQUFFTyxTQUFVLENBQUM7SUFDOUIsT0FBT0MsR0FBRztFQUNaLENBQUM7RUFDRCxNQUFNQyxRQUFRLEdBQUcsQ0FDZkgsYUFBYSxDQUFFLFVBQVcsQ0FBQyxFQUMzQkEsYUFBYSxDQUFFLFdBQVksQ0FBQyxFQUM1QkEsYUFBYSxDQUFFLGFBQWMsQ0FBQyxFQUM5QkEsYUFBYSxDQUFFLGNBQWUsQ0FBQyxDQUNoQztFQUNERyxRQUFRLENBQUNDLE9BQU8sQ0FBRUMsT0FBTyxJQUFJZixJQUFJLENBQUNTLFdBQVcsQ0FBRU0sT0FBUSxDQUFFLENBQUM7RUFFMUQsTUFBTVYsS0FBSyxHQUFHSixRQUFRLENBQUNDLGFBQWEsQ0FBRSxPQUFRLENBQUM7RUFDL0NHLEtBQUssQ0FBQ1csWUFBWSxDQUFFLElBQUksRUFBRSxnQkFBaUIsQ0FBQztFQUM1Q1gsS0FBSyxDQUFDVyxZQUFZLENBQUUsTUFBTSxFQUFFLFVBQVcsQ0FBQztFQUN4Q2YsUUFBUSxDQUFDZ0IsSUFBSSxDQUFDUixXQUFXLENBQUVKLEtBQU0sQ0FBQztFQUNsQ0EsS0FBSyxDQUFDYSxTQUFTLEdBQUk7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7RUFFRCxNQUFNQyxRQUFRLEdBQUcsR0FBRztFQUNwQixNQUFNQyxTQUFTLEdBQUcsR0FBRztFQUNyQixNQUFNQyxRQUFRLEdBQUcsR0FBRztFQUNwQixNQUFNQyxTQUFTLEdBQUcsR0FBRztFQUVyQixJQUFJQyxVQUFVLEdBQUcsS0FBSzs7RUFHdEI7RUFDQVYsUUFBUSxDQUFDQyxPQUFPLENBQUlDLE9BQWEsSUFBTTtJQUNyQ0EsT0FBTyxDQUFDUyxnQkFBZ0IsQ0FBRSxhQUFhLEVBQU1DLENBQWUsSUFBTTtNQUNoRUEsQ0FBQyxDQUFDQyxjQUFjLENBQUMsQ0FBQztNQUNsQkQsQ0FBQyxDQUFDRSxZQUFZLEdBQUcsSUFBSTtNQUVyQixNQUFNQyxLQUFLLEdBQUdILENBQUMsQ0FBQ0ksT0FBTztNQUN2QixNQUFNQyxLQUFLLEdBQUdMLENBQUMsQ0FBQ00sT0FBTztNQUN2QixNQUFNQyxjQUFjLEdBQUdQLENBQUMsQ0FBQ1EsTUFBTTtNQUMvQixNQUFNQyxJQUFJLEdBQUdsQyxJQUFJLENBQUNtQyxxQkFBcUIsQ0FBQyxDQUFDO01BQ3pDLE1BQU1DLFFBQVEsR0FBR0YsSUFBSSxDQUFDRyxJQUFJO01BQzFCLE1BQU1DLE9BQU8sR0FBR0osSUFBSSxDQUFDSyxHQUFHO01BQ3hCLElBQUlDLFFBQVE7TUFDWixJQUFJQyxTQUFTO01BRWJsQixVQUFVLEdBQUcsSUFBSTtNQUVqQixNQUFNbUIsV0FBVyxHQUFLakIsQ0FBZSxJQUFNO1FBQ3pDQSxDQUFDLENBQUNDLGNBQWMsQ0FBQyxDQUFDO1FBRWxCRCxDQUFDLENBQUNFLFlBQVksR0FBRyxJQUFJO1FBQ3JCLE1BQU1nQixJQUFJLEdBQUdmLEtBQUssR0FBR0gsQ0FBQyxDQUFDSSxPQUFPLENBQUMsQ0FBQztRQUNoQyxNQUFNZSxJQUFJLEdBQUdkLEtBQUssR0FBR0wsQ0FBQyxDQUFDTSxPQUFPLENBQUMsQ0FBQztRQUNoQyxJQUFPQyxjQUFjLENBQWM3QixTQUFTLENBQUMwQyxRQUFRLENBQUUsY0FBZSxDQUFDLEVBQUc7VUFDeEVMLFFBQVEsR0FBR04sSUFBSSxDQUFDWSxLQUFLLEdBQUdILElBQUk7VUFDNUJGLFNBQVMsR0FBR1AsSUFBSSxDQUFDYSxNQUFNLEdBQUdILElBQUk7VUFDOUIsSUFBS0osUUFBUSxHQUFHckIsUUFBUSxJQUFJcUIsUUFBUSxHQUFHbkIsUUFBUSxFQUFHO1lBQ2hEckIsSUFBSSxDQUFDSyxLQUFLLENBQUN5QyxLQUFLLEdBQUdOLFFBQVEsR0FBRyxJQUFJO1VBQ3BDO1VBQ0EsSUFBS0MsU0FBUyxHQUFHckIsU0FBUyxJQUFJcUIsU0FBUyxHQUFHbkIsU0FBUyxFQUFHO1lBQ3BEdEIsSUFBSSxDQUFDSyxLQUFLLENBQUMwQyxNQUFNLEdBQUdOLFNBQVMsR0FBRyxJQUFJO1VBQ3RDO1FBRUYsQ0FBQyxNQUNJLElBQU9ULGNBQWMsQ0FBYzdCLFNBQVMsQ0FBQzBDLFFBQVEsQ0FBRSxhQUFjLENBQUMsRUFBRztVQUM1RUwsUUFBUSxHQUFHTixJQUFJLENBQUNZLEtBQUssR0FBR0gsSUFBSTtVQUM1QkYsU0FBUyxHQUFHUCxJQUFJLENBQUNhLE1BQU0sR0FBR0gsSUFBSTtVQUU5QixJQUFLSixRQUFRLEdBQUdyQixRQUFRLElBQUlxQixRQUFRLEdBQUduQixRQUFRLEVBQUc7WUFDaERyQixJQUFJLENBQUNLLEtBQUssQ0FBQ2dDLElBQUksR0FBR0QsUUFBUSxHQUFHTyxJQUFJLEdBQUcsSUFBSTtZQUN4QzNDLElBQUksQ0FBQ0ssS0FBSyxDQUFDeUMsS0FBSyxHQUFHTixRQUFRLEdBQUcsSUFBSTtVQUNwQztVQUNBLElBQUtDLFNBQVMsR0FBR3JCLFNBQVMsSUFBSXFCLFNBQVMsR0FBR25CLFNBQVMsRUFBRztZQUNwRHRCLElBQUksQ0FBQ0ssS0FBSyxDQUFDMEMsTUFBTSxHQUFHTixTQUFTLEdBQUcsSUFBSTtVQUN0QztRQUNGLENBQUMsTUFDSSxJQUFPVCxjQUFjLENBQWM3QixTQUFTLENBQUMwQyxRQUFRLENBQUUsV0FBWSxDQUFDLEVBQUc7VUFDMUVMLFFBQVEsR0FBR04sSUFBSSxDQUFDWSxLQUFLLEdBQUdILElBQUk7VUFDNUJGLFNBQVMsR0FBR1AsSUFBSSxDQUFDYSxNQUFNLEdBQUdILElBQUk7VUFFOUIsSUFBS0osUUFBUSxHQUFHckIsUUFBUSxJQUFJcUIsUUFBUSxHQUFHbkIsUUFBUSxFQUFHO1lBQ2hEckIsSUFBSSxDQUFDSyxLQUFLLENBQUN5QyxLQUFLLEdBQUdOLFFBQVEsR0FBRyxJQUFJO1VBQ3BDO1VBQ0EsSUFBS0MsU0FBUyxHQUFHckIsU0FBUyxJQUFJcUIsU0FBUyxHQUFHbkIsU0FBUyxFQUFHO1lBQ3BEdEIsSUFBSSxDQUFDSyxLQUFLLENBQUNrQyxHQUFHLEdBQUdELE9BQU8sR0FBR00sSUFBSSxHQUFHLElBQUk7WUFDdEM1QyxJQUFJLENBQUNLLEtBQUssQ0FBQzBDLE1BQU0sR0FBR04sU0FBUyxHQUFHLElBQUk7VUFDdEM7UUFFRixDQUFDLE1BQ0ksSUFBT1QsY0FBYyxDQUFjN0IsU0FBUyxDQUFDMEMsUUFBUSxDQUFFLFVBQVcsQ0FBQyxFQUFHO1VBQ3pFTCxRQUFRLEdBQUdOLElBQUksQ0FBQ1ksS0FBSyxHQUFHSCxJQUFJO1VBQzVCRixTQUFTLEdBQUdQLElBQUksQ0FBQ2EsTUFBTSxHQUFHSCxJQUFJO1VBRTlCLElBQUtKLFFBQVEsR0FBR3JCLFFBQVEsSUFBSXFCLFFBQVEsR0FBR25CLFFBQVEsRUFBRztZQUNoRHJCLElBQUksQ0FBQ0ssS0FBSyxDQUFDZ0MsSUFBSSxHQUFHRCxRQUFRLEdBQUdPLElBQUksR0FBRyxJQUFJO1lBQ3hDM0MsSUFBSSxDQUFDSyxLQUFLLENBQUN5QyxLQUFLLEdBQUdOLFFBQVEsR0FBRyxJQUFJO1VBQ3BDO1VBQ0EsSUFBS0MsU0FBUyxHQUFHckIsU0FBUyxJQUFJcUIsU0FBUyxHQUFHbkIsU0FBUyxFQUFHO1lBQ3BEdEIsSUFBSSxDQUFDSyxLQUFLLENBQUNrQyxHQUFHLEdBQUdELE9BQU8sR0FBR00sSUFBSSxHQUFHLElBQUk7WUFDdEM1QyxJQUFJLENBQUNLLEtBQUssQ0FBQzBDLE1BQU0sR0FBR04sU0FBUyxHQUFHLElBQUk7VUFDdEM7UUFDRjtNQUNGLENBQUM7TUFFRCxNQUFNTyxTQUFTLEdBQUt2QixDQUFlLElBQU07UUFDdkNBLENBQUMsQ0FBQ0MsY0FBYyxDQUFDLENBQUM7UUFDbEJELENBQUMsQ0FBQ0UsWUFBWSxHQUFHLElBQUk7UUFFckJKLFVBQVUsR0FBRyxLQUFLO1FBQ2xCMEIsTUFBTSxDQUFDQyxtQkFBbUIsQ0FBRSxhQUFhLEVBQUVSLFdBQVcsRUFBRTlDLE9BQVEsQ0FBQztRQUNqRXFELE1BQU0sQ0FBQ0MsbUJBQW1CLENBQUUsV0FBVyxFQUFFRixTQUFTLEVBQUVwRCxPQUFRLENBQUM7TUFDL0QsQ0FBQztNQUVEcUQsTUFBTSxDQUFDekIsZ0JBQWdCLENBQUUsYUFBYSxFQUFFa0IsV0FBVyxFQUFFOUMsT0FBUSxDQUFDO01BQzlEcUQsTUFBTSxDQUFDekIsZ0JBQWdCLENBQUUsV0FBVyxFQUFFd0IsU0FBUyxFQUFFcEQsT0FBUSxDQUFDO0lBQzVELENBQUMsRUFBcUJBLE9BQVEsQ0FBQztFQUNqQyxDQUFFLENBQUM7RUFHSEksSUFBSSxDQUFDd0IsZ0JBQWdCLENBQUUsYUFBYSxFQUFJQyxDQUFlLElBQU07SUFDM0QsSUFBSyxFQUFHQSxDQUFDLENBQUNRLE1BQU0sSUFBTVIsQ0FBQyxDQUFDUSxNQUFNLENBQWM5QixTQUFTLENBQUMwQyxRQUFRLENBQUUsU0FBVSxDQUFDLENBQUUsRUFBRztNQUM5RXBCLENBQUMsQ0FBQ0MsY0FBYyxDQUFDLENBQUM7TUFDbEJELENBQUMsQ0FBQ0UsWUFBWSxHQUFHLElBQUk7SUFDdkI7O0lBRUE7SUFDQSxNQUFNQyxLQUFLLEdBQUdILENBQUMsQ0FBQ0ksT0FBTztJQUN2QixNQUFNQyxLQUFLLEdBQUdMLENBQUMsQ0FBQ00sT0FBTztJQUN2QixNQUFNRyxJQUFJLEdBQUcxQixPQUFPLENBQUMyQixxQkFBcUIsQ0FBQyxDQUFDO0lBQzVDLE1BQU1DLFFBQVEsR0FBR0YsSUFBSSxDQUFDRyxJQUFJO0lBQzFCLE1BQU1DLE9BQU8sR0FBR0osSUFBSSxDQUFDSyxHQUFHO0lBRXhCLE1BQU1HLFdBQVcsR0FBS2pCLENBQWUsSUFBTTtNQUV6QyxJQUFLRixVQUFVLEVBQUc7UUFDaEI7TUFDRjtNQUNBRSxDQUFDLENBQUNDLGNBQWMsQ0FBQyxDQUFDO01BQ2xCRCxDQUFDLENBQUNFLFlBQVksR0FBRyxJQUFJOztNQUVyQjtNQUNBLE1BQU1nQixJQUFJLEdBQUdmLEtBQUssR0FBR0gsQ0FBQyxDQUFDSSxPQUFPLENBQUMsQ0FBQztNQUNoQyxNQUFNZSxJQUFJLEdBQUdkLEtBQUssR0FBR0wsQ0FBQyxDQUFDTSxPQUFPLENBQUMsQ0FBQzs7TUFFaEM7TUFDQS9CLElBQUksQ0FBQ0ssS0FBSyxDQUFDZ0MsSUFBSSxHQUFHRCxRQUFRLEdBQUdPLElBQUksR0FBRyxJQUFJO01BQ3hDM0MsSUFBSSxDQUFDSyxLQUFLLENBQUNrQyxHQUFHLEdBQUdELE9BQU8sR0FBR00sSUFBSSxHQUFHLElBQUk7SUFDeEMsQ0FBQztJQUVELE1BQU1JLFNBQVMsR0FBS3ZCLENBQWUsSUFBTTtNQUN2Q0EsQ0FBQyxDQUFDQyxjQUFjLENBQUMsQ0FBQztNQUNsQkQsQ0FBQyxDQUFDRSxZQUFZLEdBQUcsSUFBSTtNQUVyQnNCLE1BQU0sQ0FBQ0MsbUJBQW1CLENBQUUsYUFBYSxFQUFFUixXQUFXLEVBQUU5QyxPQUFRLENBQUM7TUFDakVxRCxNQUFNLENBQUNDLG1CQUFtQixDQUFFLFdBQVcsRUFBRUYsU0FBUyxFQUFFcEQsT0FBUSxDQUFDO0lBQy9ELENBQUM7SUFDRHFELE1BQU0sQ0FBQ3pCLGdCQUFnQixDQUFFLGFBQWEsRUFBRWtCLFdBQVcsRUFBRTlDLE9BQVEsQ0FBQztJQUM5RHFELE1BQU0sQ0FBQ3pCLGdCQUFnQixDQUFFLFdBQVcsRUFBRXdCLFNBQVMsRUFBRXBELE9BQVEsQ0FBQztFQUM1RCxDQUFDLEVBQUVBLE9BQVEsQ0FBQztFQUVaLE9BQU9JLElBQUk7QUFDYixDQUFDO0FBR0RMLFFBQVEsQ0FBQ3dELFFBQVEsQ0FBRSwyQkFBMkIsRUFBRXJELHlCQUEwQixDQUFDO0FBQzNFLGVBQWVBLHlCQUF5QiJ9