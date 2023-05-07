// Copyright 2021-2023, University of Colorado Boulder

/**
 * Serializes a generalized object
 * @deprecated
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Matrix3 from '../../../dot/js/Matrix3.js';
import Bounds2 from '../../../dot/js/Bounds2.js';
import Vector2 from '../../../dot/js/Vector2.js';
import { Shape } from '../../../kite/js/imports.js';
import ReadOnlyProperty from '../../../axon/js/ReadOnlyProperty.js';
import inheritance from '../../../phet-core/js/inheritance.js';
import { CanvasContextWrapper, CanvasNode, Circle, Color, Display, DOM, Gradient, Image, Line, LinearGradient, Node, Paint, PAINTABLE_DEFAULT_OPTIONS, Path, Pattern, RadialGradient, Rectangle, scenery, Text, WebGLNode } from '../imports.js';
const scenerySerialize = value => {
  if (value instanceof Vector2) {
    return {
      type: 'Vector2',
      x: value.x,
      y: value.y
    };
  } else if (value instanceof Matrix3) {
    return {
      type: 'Matrix3',
      m00: value.m00(),
      m01: value.m01(),
      m02: value.m02(),
      m10: value.m10(),
      m11: value.m11(),
      m12: value.m12(),
      m20: value.m20(),
      m21: value.m21(),
      m22: value.m22()
    };
  } else if (value instanceof Bounds2) {
    const bounds = value;
    return {
      type: 'Bounds2',
      maxX: bounds.maxX,
      maxY: bounds.maxY,
      minX: bounds.minX,
      minY: bounds.minY
    };
  } else if (value instanceof Shape) {
    return {
      type: 'Shape',
      path: value.getSVGPath()
    };
  } else if (Array.isArray(value)) {
    return {
      type: 'Array',
      value: value.map(scenerySerialize)
    };
  } else if (value instanceof Color) {
    return {
      type: 'Color',
      red: value.red,
      green: value.green,
      blue: value.blue,
      alpha: value.alpha
    };
  } else if (value instanceof ReadOnlyProperty) {
    return {
      type: 'Property',
      value: scenerySerialize(value.value)
    };
  } else if (Paint && value instanceof Paint) {
    const paintSerialization = {};
    if (value.transformMatrix) {
      paintSerialization.transformMatrix = scenerySerialize(value.transformMatrix);
    }
    if (Gradient && (value instanceof RadialGradient || value instanceof LinearGradient)) {
      paintSerialization.stops = value.stops.map(stop => {
        return {
          ratio: stop.ratio,
          stop: scenerySerialize(stop.color)
        };
      });
      paintSerialization.start = scenerySerialize(value.start);
      paintSerialization.end = scenerySerialize(value.end);
      if (LinearGradient && value instanceof LinearGradient) {
        paintSerialization.type = 'LinearGradient';
      } else if (RadialGradient && value instanceof RadialGradient) {
        paintSerialization.type = 'RadialGradient';
        paintSerialization.startRadius = value.startRadius;
        paintSerialization.endRadius = value.endRadius;
      }
    }
    if (Pattern && value instanceof Pattern) {
      paintSerialization.type = 'Pattern';
      paintSerialization.url = value.image.src;
    }
    return paintSerialization;
  } else if (value instanceof Node) {
    const node = value;
    const options = {};
    const setup = {
      // maxWidth
      // maxHeight
      // clipArea
      // mouseArea
      // touchArea
      // matrix
      // localBounds
      // children {Array.<number>} - IDs
      // hasInputListeners {boolean}
    };
    ['visible', 'opacity', 'disabledOpacity', 'pickable', 'inputEnabled', 'cursor', 'transformBounds', 'renderer', 'usesOpacity', 'layerSplit', 'cssTransform', 'excludeInvisible', 'webglScale', 'preventFit'].forEach(simpleKey => {
      // @ts-expect-error
      if (node[simpleKey] !== Node.DEFAULT_NODE_OPTIONS[simpleKey]) {
        // @ts-expect-error
        options[simpleKey] = node[simpleKey];
      }
    });

    // From ParallelDOM
    ['tagName', 'innerContent', 'accessibleName', 'helpText'].forEach(simpleKey => {
      // All default to null
      // @ts-expect-error
      if (node[simpleKey] !== null) {
        // @ts-expect-error
        options[simpleKey] = node[simpleKey];
      }
    });
    ['maxWidth', 'maxHeight', 'clipArea', 'mouseArea', 'touchArea'].forEach(serializedKey => {
      // @ts-expect-error
      if (node[serializedKey] !== Node.DEFAULT_NODE_OPTIONS[serializedKey]) {
        // @ts-expect-error
        setup[serializedKey] = scenerySerialize(node[serializedKey]);
      }
    });
    if (!node.matrix.isIdentity()) {
      setup.matrix = scenerySerialize(node.matrix);
    }
    if (node._localBoundsOverridden) {
      setup.localBounds = scenerySerialize(node.localBounds);
    }
    setup.children = node.children.map(child => {
      return child.id;
    });
    setup.hasInputListeners = node.inputListeners.length > 0;
    const serialization = {
      id: node.id,
      type: 'Node',
      types: inheritance(node.constructor).map(type => type.name).filter(name => {
        return name && name !== 'Object' && name !== 'Node';
      }),
      name: node.constructor.name,
      options: options,
      setup: setup
    };
    if (Path && node instanceof Path) {
      serialization.type = 'Path';
      setup.path = scenerySerialize(node.shape);
      if (node.boundsMethod !== Path.DEFAULT_PATH_OPTIONS.boundsMethod) {
        options.boundsMethod = node.boundsMethod;
      }
    }
    if (Circle && node instanceof Circle) {
      serialization.type = 'Circle';
      options.radius = node.radius;
    }
    if (Line && node instanceof Line) {
      serialization.type = 'Line';
      options.x1 = node.x1;
      options.y1 = node.y1;
      options.x2 = node.x2;
      options.y2 = node.y2;
    }
    if (Rectangle && node instanceof Rectangle) {
      serialization.type = 'Rectangle';
      options.rectX = node.rectX;
      options.rectY = node.rectY;
      options.rectWidth = node.rectWidth;
      options.rectHeight = node.rectHeight;
      options.cornerXRadius = node.cornerXRadius;
      options.cornerYRadius = node.cornerYRadius;
    }
    if (Text && node instanceof Text) {
      serialization.type = 'Text';
      // TODO: defaults for Text?
      if (node.boundsMethod !== 'hybrid') {
        options.boundsMethod = node.boundsMethod;
      }
      options.string = node.string;
      options.font = node.font;
    }
    if (Image && node instanceof Image) {
      serialization.type = 'Image';
      ['imageOpacity', 'initialWidth', 'initialHeight', 'mipmapBias', 'mipmapInitialLevel', 'mipmapMaxLevel'].forEach(simpleKey => {
        // @ts-expect-error
        if (node[simpleKey] !== Image.DEFAULT_IMAGE_OPTIONS[simpleKey]) {
          // @ts-expect-error
          options[simpleKey] = node[simpleKey];
        }
      });
      setup.width = node.imageWidth;
      setup.height = node.imageHeight;

      // Initialized with a mipmap
      if (node._mipmapData) {
        setup.imageType = 'mipmapData';
        setup.mipmapData = node._mipmapData.map(level => {
          return {
            url: level.url,
            width: level.width,
            height: level.height
            // will reconstitute img {HTMLImageElement} and canvas {HTMLCanvasElement}
          };
        });
      } else {
        if (node._mipmap) {
          setup.generateMipmaps = true;
        }
        if (node._image instanceof HTMLImageElement) {
          setup.imageType = 'image';
          setup.src = node._image.src;
        } else if (node._image instanceof HTMLCanvasElement) {
          setup.imageType = 'canvas';
          setup.src = node._image.toDataURL();
        }
      }
    }
    if (CanvasNode && node instanceof CanvasNode || WebGLNode && node instanceof WebGLNode) {
      serialization.type = CanvasNode && node instanceof CanvasNode ? 'CanvasNode' : 'WebGLNode';
      setup.canvasBounds = scenerySerialize(node.canvasBounds);

      // Identify the approximate scale of the node
      // let scale = Math.min( 5, node._drawables.length ? ( 1 / _.mean( node._drawables.map( drawable => {
      //   const scaleVector = drawable.instance.trail.getMatrix().getScaleVector();
      //   return ( scaleVector.x + scaleVector.y ) / 2;
      // } ) ) ) : 1 );
      const scale = 1;
      const canvas = document.createElement('canvas');
      canvas.width = Math.ceil(node.canvasBounds.width * scale);
      canvas.height = Math.ceil(node.canvasBounds.height * scale);
      const context = canvas.getContext('2d');
      const wrapper = new CanvasContextWrapper(canvas, context);
      const matrix = Matrix3.scale(1 / scale);
      wrapper.context.setTransform(scale, 0, 0, scale, -node.canvasBounds.left, -node.canvasBounds.top);
      node.renderToCanvasSelf(wrapper, matrix);
      setup.url = canvas.toDataURL();
      setup.scale = scale;
      setup.offset = scenerySerialize(node.canvasBounds.leftTop);
    }
    if (DOM && node instanceof DOM) {
      serialization.type = 'DOM';
      serialization.element = new window.XMLSerializer().serializeToString(node.element);
      if (node.element instanceof window.HTMLCanvasElement) {
        serialization.dataURL = node.element.toDataURL();
      }
      options.preventTransform = node.preventTransform;
    }

    // Paintable
    if (Path && node instanceof Path || Text && node instanceof Text) {
      ['fillPickable', 'strokePickable', 'lineWidth', 'lineCap', 'lineJoin', 'lineDashOffset', 'miterLimit'].forEach(simpleKey => {
        // @ts-expect-error
        if (node[simpleKey] !== PAINTABLE_DEFAULT_OPTIONS[simpleKey]) {
          // @ts-expect-error
          options[simpleKey] = node[simpleKey];
        }
      });

      // Ignoring cachedPaints, since we'd 'double' it anyways

      if (node.fill !== PAINTABLE_DEFAULT_OPTIONS.fill) {
        setup.fill = scenerySerialize(node.fill);
      }
      if (node.stroke !== PAINTABLE_DEFAULT_OPTIONS.stroke) {
        setup.stroke = scenerySerialize(node.stroke);
      }
      if (node.lineDash.length) {
        setup.lineDash = scenerySerialize(node.lineDash);
      }
    }
    return serialization;
  } else if (value instanceof Display) {
    return {
      type: 'Display',
      width: value.width,
      height: value.height,
      backgroundColor: scenerySerialize(value.backgroundColor),
      tree: {
        type: 'Subtree',
        rootNodeId: value.rootNode.id,
        nodes: serializeConnectedNodes(value.rootNode)
      }
    };
  } else {
    return {
      type: 'value',
      value: value
    };
  }
};
const serializeConnectedNodes = rootNode => {
  return rootNode.getSubtreeNodes().map(scenerySerialize);
};
scenery.register('scenerySerialize', scenerySerialize);
export { scenerySerialize as default, serializeConnectedNodes };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNYXRyaXgzIiwiQm91bmRzMiIsIlZlY3RvcjIiLCJTaGFwZSIsIlJlYWRPbmx5UHJvcGVydHkiLCJpbmhlcml0YW5jZSIsIkNhbnZhc0NvbnRleHRXcmFwcGVyIiwiQ2FudmFzTm9kZSIsIkNpcmNsZSIsIkNvbG9yIiwiRGlzcGxheSIsIkRPTSIsIkdyYWRpZW50IiwiSW1hZ2UiLCJMaW5lIiwiTGluZWFyR3JhZGllbnQiLCJOb2RlIiwiUGFpbnQiLCJQQUlOVEFCTEVfREVGQVVMVF9PUFRJT05TIiwiUGF0aCIsIlBhdHRlcm4iLCJSYWRpYWxHcmFkaWVudCIsIlJlY3RhbmdsZSIsInNjZW5lcnkiLCJUZXh0IiwiV2ViR0xOb2RlIiwic2NlbmVyeVNlcmlhbGl6ZSIsInZhbHVlIiwidHlwZSIsIngiLCJ5IiwibTAwIiwibTAxIiwibTAyIiwibTEwIiwibTExIiwibTEyIiwibTIwIiwibTIxIiwibTIyIiwiYm91bmRzIiwibWF4WCIsIm1heFkiLCJtaW5YIiwibWluWSIsInBhdGgiLCJnZXRTVkdQYXRoIiwiQXJyYXkiLCJpc0FycmF5IiwibWFwIiwicmVkIiwiZ3JlZW4iLCJibHVlIiwiYWxwaGEiLCJwYWludFNlcmlhbGl6YXRpb24iLCJ0cmFuc2Zvcm1NYXRyaXgiLCJzdG9wcyIsInN0b3AiLCJyYXRpbyIsImNvbG9yIiwic3RhcnQiLCJlbmQiLCJzdGFydFJhZGl1cyIsImVuZFJhZGl1cyIsInVybCIsImltYWdlIiwic3JjIiwibm9kZSIsIm9wdGlvbnMiLCJzZXR1cCIsImZvckVhY2giLCJzaW1wbGVLZXkiLCJERUZBVUxUX05PREVfT1BUSU9OUyIsInNlcmlhbGl6ZWRLZXkiLCJtYXRyaXgiLCJpc0lkZW50aXR5IiwiX2xvY2FsQm91bmRzT3ZlcnJpZGRlbiIsImxvY2FsQm91bmRzIiwiY2hpbGRyZW4iLCJjaGlsZCIsImlkIiwiaGFzSW5wdXRMaXN0ZW5lcnMiLCJpbnB1dExpc3RlbmVycyIsImxlbmd0aCIsInNlcmlhbGl6YXRpb24iLCJ0eXBlcyIsImNvbnN0cnVjdG9yIiwibmFtZSIsImZpbHRlciIsInNoYXBlIiwiYm91bmRzTWV0aG9kIiwiREVGQVVMVF9QQVRIX09QVElPTlMiLCJyYWRpdXMiLCJ4MSIsInkxIiwieDIiLCJ5MiIsInJlY3RYIiwicmVjdFkiLCJyZWN0V2lkdGgiLCJyZWN0SGVpZ2h0IiwiY29ybmVyWFJhZGl1cyIsImNvcm5lcllSYWRpdXMiLCJzdHJpbmciLCJmb250IiwiREVGQVVMVF9JTUFHRV9PUFRJT05TIiwid2lkdGgiLCJpbWFnZVdpZHRoIiwiaGVpZ2h0IiwiaW1hZ2VIZWlnaHQiLCJfbWlwbWFwRGF0YSIsImltYWdlVHlwZSIsIm1pcG1hcERhdGEiLCJsZXZlbCIsIl9taXBtYXAiLCJnZW5lcmF0ZU1pcG1hcHMiLCJfaW1hZ2UiLCJIVE1MSW1hZ2VFbGVtZW50IiwiSFRNTENhbnZhc0VsZW1lbnQiLCJ0b0RhdGFVUkwiLCJjYW52YXNCb3VuZHMiLCJzY2FsZSIsImNhbnZhcyIsImRvY3VtZW50IiwiY3JlYXRlRWxlbWVudCIsIk1hdGgiLCJjZWlsIiwiY29udGV4dCIsImdldENvbnRleHQiLCJ3cmFwcGVyIiwic2V0VHJhbnNmb3JtIiwibGVmdCIsInRvcCIsInJlbmRlclRvQ2FudmFzU2VsZiIsIm9mZnNldCIsImxlZnRUb3AiLCJlbGVtZW50Iiwid2luZG93IiwiWE1MU2VyaWFsaXplciIsInNlcmlhbGl6ZVRvU3RyaW5nIiwiZGF0YVVSTCIsInByZXZlbnRUcmFuc2Zvcm0iLCJmaWxsIiwic3Ryb2tlIiwibGluZURhc2giLCJiYWNrZ3JvdW5kQ29sb3IiLCJ0cmVlIiwicm9vdE5vZGVJZCIsInJvb3ROb2RlIiwibm9kZXMiLCJzZXJpYWxpemVDb25uZWN0ZWROb2RlcyIsImdldFN1YnRyZWVOb2RlcyIsInJlZ2lzdGVyIiwiZGVmYXVsdCJdLCJzb3VyY2VzIjpbInNjZW5lcnlTZXJpYWxpemUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMjEtMjAyMywgVW5pdmVyc2l0eSBvZiBDb2xvcmFkbyBCb3VsZGVyXHJcblxyXG4vKipcclxuICogU2VyaWFsaXplcyBhIGdlbmVyYWxpemVkIG9iamVjdFxyXG4gKiBAZGVwcmVjYXRlZFxyXG4gKlxyXG4gKiBAYXV0aG9yIEpvbmF0aGFuIE9sc29uIDxqb25hdGhhbi5vbHNvbkBjb2xvcmFkby5lZHU+XHJcbiAqL1xyXG5cclxuaW1wb3J0IE1hdHJpeDMgZnJvbSAnLi4vLi4vLi4vZG90L2pzL01hdHJpeDMuanMnO1xyXG5pbXBvcnQgQm91bmRzMiBmcm9tICcuLi8uLi8uLi9kb3QvanMvQm91bmRzMi5qcyc7XHJcbmltcG9ydCBWZWN0b3IyIGZyb20gJy4uLy4uLy4uL2RvdC9qcy9WZWN0b3IyLmpzJztcclxuaW1wb3J0IHsgU2hhcGUgfSBmcm9tICcuLi8uLi8uLi9raXRlL2pzL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgUmVhZE9ubHlQcm9wZXJ0eSBmcm9tICcuLi8uLi8uLi9heG9uL2pzL1JlYWRPbmx5UHJvcGVydHkuanMnO1xyXG5pbXBvcnQgaW5oZXJpdGFuY2UgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL2luaGVyaXRhbmNlLmpzJztcclxuaW1wb3J0IHsgQ2FudmFzQ29udGV4dFdyYXBwZXIsIENhbnZhc05vZGUsIENpcmNsZSwgQ29sb3IsIERpc3BsYXksIERPTSwgR3JhZGllbnQsIEltYWdlLCBMaW5lLCBMaW5lYXJHcmFkaWVudCwgTm9kZSwgUGFpbnQsIFBBSU5UQUJMRV9ERUZBVUxUX09QVElPTlMsIFBhdGgsIFBhdHRlcm4sIFJhZGlhbEdyYWRpZW50LCBSZWN0YW5nbGUsIHNjZW5lcnksIFRleHQsIFdlYkdMTm9kZSB9IGZyb20gJy4uL2ltcG9ydHMuanMnO1xyXG5pbXBvcnQgSW50ZW50aW9uYWxBbnkgZnJvbSAnLi4vLi4vLi4vcGhldC1jb3JlL2pzL3R5cGVzL0ludGVudGlvbmFsQW55LmpzJztcclxuXHJcbmNvbnN0IHNjZW5lcnlTZXJpYWxpemUgPSAoIHZhbHVlOiB1bmtub3duICk6IEludGVudGlvbmFsQW55ID0+IHtcclxuICBpZiAoIHZhbHVlIGluc3RhbmNlb2YgVmVjdG9yMiApIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIHR5cGU6ICdWZWN0b3IyJyxcclxuICAgICAgeDogKCB2YWx1ZSApLngsXHJcbiAgICAgIHk6ICggdmFsdWUgKS55XHJcbiAgICB9O1xyXG4gIH1cclxuICBlbHNlIGlmICggdmFsdWUgaW5zdGFuY2VvZiBNYXRyaXgzICkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgdHlwZTogJ01hdHJpeDMnLFxyXG4gICAgICBtMDA6IHZhbHVlLm0wMCgpLFxyXG4gICAgICBtMDE6IHZhbHVlLm0wMSgpLFxyXG4gICAgICBtMDI6IHZhbHVlLm0wMigpLFxyXG4gICAgICBtMTA6IHZhbHVlLm0xMCgpLFxyXG4gICAgICBtMTE6IHZhbHVlLm0xMSgpLFxyXG4gICAgICBtMTI6IHZhbHVlLm0xMigpLFxyXG4gICAgICBtMjA6IHZhbHVlLm0yMCgpLFxyXG4gICAgICBtMjE6IHZhbHVlLm0yMSgpLFxyXG4gICAgICBtMjI6IHZhbHVlLm0yMigpXHJcbiAgICB9O1xyXG4gIH1cclxuICBlbHNlIGlmICggdmFsdWUgaW5zdGFuY2VvZiBCb3VuZHMyICkge1xyXG4gICAgY29uc3QgYm91bmRzID0gdmFsdWU7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICB0eXBlOiAnQm91bmRzMicsXHJcbiAgICAgIG1heFg6IGJvdW5kcy5tYXhYLFxyXG4gICAgICBtYXhZOiBib3VuZHMubWF4WSxcclxuICAgICAgbWluWDogYm91bmRzLm1pblgsXHJcbiAgICAgIG1pblk6IGJvdW5kcy5taW5ZXHJcbiAgICB9O1xyXG4gIH1cclxuICBlbHNlIGlmICggdmFsdWUgaW5zdGFuY2VvZiBTaGFwZSApIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIHR5cGU6ICdTaGFwZScsXHJcbiAgICAgIHBhdGg6IHZhbHVlLmdldFNWR1BhdGgoKVxyXG4gICAgfTtcclxuICB9XHJcbiAgZWxzZSBpZiAoIEFycmF5LmlzQXJyYXkoIHZhbHVlICkgKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICB0eXBlOiAnQXJyYXknLFxyXG4gICAgICB2YWx1ZTogdmFsdWUubWFwKCBzY2VuZXJ5U2VyaWFsaXplIClcclxuICAgIH07XHJcbiAgfVxyXG4gIGVsc2UgaWYgKCB2YWx1ZSBpbnN0YW5jZW9mIENvbG9yICkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgdHlwZTogJ0NvbG9yJyxcclxuICAgICAgcmVkOiB2YWx1ZS5yZWQsXHJcbiAgICAgIGdyZWVuOiB2YWx1ZS5ncmVlbixcclxuICAgICAgYmx1ZTogdmFsdWUuYmx1ZSxcclxuICAgICAgYWxwaGE6IHZhbHVlLmFscGhhXHJcbiAgICB9O1xyXG4gIH1cclxuICBlbHNlIGlmICggdmFsdWUgaW5zdGFuY2VvZiBSZWFkT25seVByb3BlcnR5ICkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgdHlwZTogJ1Byb3BlcnR5JyxcclxuICAgICAgdmFsdWU6IHNjZW5lcnlTZXJpYWxpemUoIHZhbHVlLnZhbHVlIClcclxuICAgIH07XHJcbiAgfVxyXG4gIGVsc2UgaWYgKCBQYWludCAmJiB2YWx1ZSBpbnN0YW5jZW9mIFBhaW50ICkge1xyXG4gICAgY29uc3QgcGFpbnRTZXJpYWxpemF0aW9uOiBJbnRlbnRpb25hbEFueSA9IHt9O1xyXG5cclxuICAgIGlmICggdmFsdWUudHJhbnNmb3JtTWF0cml4ICkge1xyXG4gICAgICBwYWludFNlcmlhbGl6YXRpb24udHJhbnNmb3JtTWF0cml4ID0gc2NlbmVyeVNlcmlhbGl6ZSggdmFsdWUudHJhbnNmb3JtTWF0cml4ICk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCBHcmFkaWVudCAmJiAoIHZhbHVlIGluc3RhbmNlb2YgUmFkaWFsR3JhZGllbnQgfHwgdmFsdWUgaW5zdGFuY2VvZiBMaW5lYXJHcmFkaWVudCApICkge1xyXG4gICAgICBwYWludFNlcmlhbGl6YXRpb24uc3RvcHMgPSB2YWx1ZS5zdG9wcy5tYXAoIHN0b3AgPT4ge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICByYXRpbzogc3RvcC5yYXRpbyxcclxuICAgICAgICAgIHN0b3A6IHNjZW5lcnlTZXJpYWxpemUoIHN0b3AuY29sb3IgKVxyXG4gICAgICAgIH07XHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAgIHBhaW50U2VyaWFsaXphdGlvbi5zdGFydCA9IHNjZW5lcnlTZXJpYWxpemUoIHZhbHVlLnN0YXJ0ICk7XHJcbiAgICAgIHBhaW50U2VyaWFsaXphdGlvbi5lbmQgPSBzY2VuZXJ5U2VyaWFsaXplKCB2YWx1ZS5lbmQgKTtcclxuXHJcbiAgICAgIGlmICggTGluZWFyR3JhZGllbnQgJiYgdmFsdWUgaW5zdGFuY2VvZiBMaW5lYXJHcmFkaWVudCApIHtcclxuICAgICAgICBwYWludFNlcmlhbGl6YXRpb24udHlwZSA9ICdMaW5lYXJHcmFkaWVudCc7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSBpZiAoIFJhZGlhbEdyYWRpZW50ICYmIHZhbHVlIGluc3RhbmNlb2YgUmFkaWFsR3JhZGllbnQgKSB7XHJcbiAgICAgICAgcGFpbnRTZXJpYWxpemF0aW9uLnR5cGUgPSAnUmFkaWFsR3JhZGllbnQnO1xyXG4gICAgICAgIHBhaW50U2VyaWFsaXphdGlvbi5zdGFydFJhZGl1cyA9IHZhbHVlLnN0YXJ0UmFkaXVzO1xyXG4gICAgICAgIHBhaW50U2VyaWFsaXphdGlvbi5lbmRSYWRpdXMgPSB2YWx1ZS5lbmRSYWRpdXM7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAoIFBhdHRlcm4gJiYgdmFsdWUgaW5zdGFuY2VvZiBQYXR0ZXJuICkge1xyXG4gICAgICBwYWludFNlcmlhbGl6YXRpb24udHlwZSA9ICdQYXR0ZXJuJztcclxuICAgICAgcGFpbnRTZXJpYWxpemF0aW9uLnVybCA9IHZhbHVlLmltYWdlLnNyYztcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gcGFpbnRTZXJpYWxpemF0aW9uO1xyXG4gIH1cclxuICBlbHNlIGlmICggdmFsdWUgaW5zdGFuY2VvZiBOb2RlICkge1xyXG4gICAgY29uc3Qgbm9kZSA9IHZhbHVlO1xyXG5cclxuICAgIGNvbnN0IG9wdGlvbnM6IEludGVudGlvbmFsQW55ID0ge307XHJcbiAgICBjb25zdCBzZXR1cDogSW50ZW50aW9uYWxBbnkgPSB7XHJcbiAgICAgIC8vIG1heFdpZHRoXHJcbiAgICAgIC8vIG1heEhlaWdodFxyXG4gICAgICAvLyBjbGlwQXJlYVxyXG4gICAgICAvLyBtb3VzZUFyZWFcclxuICAgICAgLy8gdG91Y2hBcmVhXHJcbiAgICAgIC8vIG1hdHJpeFxyXG4gICAgICAvLyBsb2NhbEJvdW5kc1xyXG4gICAgICAvLyBjaGlsZHJlbiB7QXJyYXkuPG51bWJlcj59IC0gSURzXHJcbiAgICAgIC8vIGhhc0lucHV0TGlzdGVuZXJzIHtib29sZWFufVxyXG5cclxuICAgIH07XHJcblxyXG4gICAgW1xyXG4gICAgICAndmlzaWJsZScsXHJcbiAgICAgICdvcGFjaXR5JyxcclxuICAgICAgJ2Rpc2FibGVkT3BhY2l0eScsXHJcbiAgICAgICdwaWNrYWJsZScsXHJcbiAgICAgICdpbnB1dEVuYWJsZWQnLFxyXG4gICAgICAnY3Vyc29yJyxcclxuICAgICAgJ3RyYW5zZm9ybUJvdW5kcycsXHJcbiAgICAgICdyZW5kZXJlcicsXHJcbiAgICAgICd1c2VzT3BhY2l0eScsXHJcbiAgICAgICdsYXllclNwbGl0JyxcclxuICAgICAgJ2Nzc1RyYW5zZm9ybScsXHJcbiAgICAgICdleGNsdWRlSW52aXNpYmxlJyxcclxuICAgICAgJ3dlYmdsU2NhbGUnLFxyXG4gICAgICAncHJldmVudEZpdCdcclxuICAgIF0uZm9yRWFjaCggc2ltcGxlS2V5ID0+IHtcclxuICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvclxyXG4gICAgICBpZiAoIG5vZGVbIHNpbXBsZUtleSBdICE9PSBOb2RlLkRFRkFVTFRfTk9ERV9PUFRJT05TWyBzaW1wbGVLZXkgXSApIHtcclxuICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yXHJcbiAgICAgICAgb3B0aW9uc1sgc2ltcGxlS2V5IF0gPSBub2RlWyBzaW1wbGVLZXkgXTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG5cclxuXHJcbiAgICAvLyBGcm9tIFBhcmFsbGVsRE9NXHJcbiAgICBbXHJcbiAgICAgICd0YWdOYW1lJyxcclxuICAgICAgJ2lubmVyQ29udGVudCcsXHJcbiAgICAgICdhY2Nlc3NpYmxlTmFtZScsXHJcbiAgICAgICdoZWxwVGV4dCdcclxuICAgIF0uZm9yRWFjaCggc2ltcGxlS2V5ID0+IHtcclxuXHJcbiAgICAgIC8vIEFsbCBkZWZhdWx0IHRvIG51bGxcclxuICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvclxyXG4gICAgICBpZiAoIG5vZGVbIHNpbXBsZUtleSBdICE9PSBudWxsICkge1xyXG4gICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3JcclxuICAgICAgICBvcHRpb25zWyBzaW1wbGVLZXkgXSA9IG5vZGVbIHNpbXBsZUtleSBdO1xyXG4gICAgICB9XHJcbiAgICB9ICk7XHJcblxyXG4gICAgW1xyXG4gICAgICAnbWF4V2lkdGgnLFxyXG4gICAgICAnbWF4SGVpZ2h0JyxcclxuICAgICAgJ2NsaXBBcmVhJyxcclxuICAgICAgJ21vdXNlQXJlYScsXHJcbiAgICAgICd0b3VjaEFyZWEnXHJcbiAgICBdLmZvckVhY2goIHNlcmlhbGl6ZWRLZXkgPT4ge1xyXG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yXHJcbiAgICAgIGlmICggbm9kZVsgc2VyaWFsaXplZEtleSBdICE9PSBOb2RlLkRFRkFVTFRfTk9ERV9PUFRJT05TWyBzZXJpYWxpemVkS2V5IF0gKSB7XHJcbiAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvclxyXG4gICAgICAgIHNldHVwWyBzZXJpYWxpemVkS2V5IF0gPSBzY2VuZXJ5U2VyaWFsaXplKCBub2RlWyBzZXJpYWxpemVkS2V5IF0gKTtcclxuICAgICAgfVxyXG4gICAgfSApO1xyXG4gICAgaWYgKCAhbm9kZS5tYXRyaXguaXNJZGVudGl0eSgpICkge1xyXG4gICAgICBzZXR1cC5tYXRyaXggPSBzY2VuZXJ5U2VyaWFsaXplKCBub2RlLm1hdHJpeCApO1xyXG4gICAgfVxyXG4gICAgaWYgKCBub2RlLl9sb2NhbEJvdW5kc092ZXJyaWRkZW4gKSB7XHJcbiAgICAgIHNldHVwLmxvY2FsQm91bmRzID0gc2NlbmVyeVNlcmlhbGl6ZSggbm9kZS5sb2NhbEJvdW5kcyApO1xyXG4gICAgfVxyXG4gICAgc2V0dXAuY2hpbGRyZW4gPSBub2RlLmNoaWxkcmVuLm1hcCggY2hpbGQgPT4ge1xyXG4gICAgICByZXR1cm4gY2hpbGQuaWQ7XHJcbiAgICB9ICk7XHJcbiAgICBzZXR1cC5oYXNJbnB1dExpc3RlbmVycyA9IG5vZGUuaW5wdXRMaXN0ZW5lcnMubGVuZ3RoID4gMDtcclxuXHJcbiAgICBjb25zdCBzZXJpYWxpemF0aW9uOiBJbnRlbnRpb25hbEFueSA9IHtcclxuICAgICAgaWQ6IG5vZGUuaWQsXHJcbiAgICAgIHR5cGU6ICdOb2RlJyxcclxuICAgICAgdHlwZXM6IGluaGVyaXRhbmNlKCBub2RlLmNvbnN0cnVjdG9yICkubWFwKCB0eXBlID0+IHR5cGUubmFtZSApLmZpbHRlciggbmFtZSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIG5hbWUgJiYgbmFtZSAhPT0gJ09iamVjdCcgJiYgbmFtZSAhPT0gJ05vZGUnO1xyXG4gICAgICB9ICksXHJcbiAgICAgIG5hbWU6IG5vZGUuY29uc3RydWN0b3IubmFtZSxcclxuICAgICAgb3B0aW9uczogb3B0aW9ucyxcclxuICAgICAgc2V0dXA6IHNldHVwXHJcbiAgICB9O1xyXG5cclxuICAgIGlmICggUGF0aCAmJiBub2RlIGluc3RhbmNlb2YgUGF0aCApIHtcclxuICAgICAgc2VyaWFsaXphdGlvbi50eXBlID0gJ1BhdGgnO1xyXG4gICAgICBzZXR1cC5wYXRoID0gc2NlbmVyeVNlcmlhbGl6ZSggbm9kZS5zaGFwZSApO1xyXG4gICAgICBpZiAoIG5vZGUuYm91bmRzTWV0aG9kICE9PSBQYXRoLkRFRkFVTFRfUEFUSF9PUFRJT05TLmJvdW5kc01ldGhvZCApIHtcclxuICAgICAgICBvcHRpb25zLmJvdW5kc01ldGhvZCA9IG5vZGUuYm91bmRzTWV0aG9kO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCBDaXJjbGUgJiYgbm9kZSBpbnN0YW5jZW9mIENpcmNsZSApIHtcclxuICAgICAgc2VyaWFsaXphdGlvbi50eXBlID0gJ0NpcmNsZSc7XHJcbiAgICAgIG9wdGlvbnMucmFkaXVzID0gbm9kZS5yYWRpdXM7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCBMaW5lICYmIG5vZGUgaW5zdGFuY2VvZiBMaW5lICkge1xyXG4gICAgICBzZXJpYWxpemF0aW9uLnR5cGUgPSAnTGluZSc7XHJcbiAgICAgIG9wdGlvbnMueDEgPSBub2RlLngxO1xyXG4gICAgICBvcHRpb25zLnkxID0gbm9kZS55MTtcclxuICAgICAgb3B0aW9ucy54MiA9IG5vZGUueDI7XHJcbiAgICAgIG9wdGlvbnMueTIgPSBub2RlLnkyO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICggUmVjdGFuZ2xlICYmIG5vZGUgaW5zdGFuY2VvZiBSZWN0YW5nbGUgKSB7XHJcbiAgICAgIHNlcmlhbGl6YXRpb24udHlwZSA9ICdSZWN0YW5nbGUnO1xyXG4gICAgICBvcHRpb25zLnJlY3RYID0gbm9kZS5yZWN0WDtcclxuICAgICAgb3B0aW9ucy5yZWN0WSA9IG5vZGUucmVjdFk7XHJcbiAgICAgIG9wdGlvbnMucmVjdFdpZHRoID0gbm9kZS5yZWN0V2lkdGg7XHJcbiAgICAgIG9wdGlvbnMucmVjdEhlaWdodCA9IG5vZGUucmVjdEhlaWdodDtcclxuICAgICAgb3B0aW9ucy5jb3JuZXJYUmFkaXVzID0gbm9kZS5jb3JuZXJYUmFkaXVzO1xyXG4gICAgICBvcHRpb25zLmNvcm5lcllSYWRpdXMgPSBub2RlLmNvcm5lcllSYWRpdXM7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCBUZXh0ICYmIG5vZGUgaW5zdGFuY2VvZiBUZXh0ICkge1xyXG4gICAgICBzZXJpYWxpemF0aW9uLnR5cGUgPSAnVGV4dCc7XHJcbiAgICAgIC8vIFRPRE86IGRlZmF1bHRzIGZvciBUZXh0P1xyXG4gICAgICBpZiAoIG5vZGUuYm91bmRzTWV0aG9kICE9PSAnaHlicmlkJyApIHtcclxuICAgICAgICBvcHRpb25zLmJvdW5kc01ldGhvZCA9IG5vZGUuYm91bmRzTWV0aG9kO1xyXG4gICAgICB9XHJcbiAgICAgIG9wdGlvbnMuc3RyaW5nID0gbm9kZS5zdHJpbmc7XHJcbiAgICAgIG9wdGlvbnMuZm9udCA9IG5vZGUuZm9udDtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIEltYWdlICYmIG5vZGUgaW5zdGFuY2VvZiBJbWFnZSApIHtcclxuICAgICAgc2VyaWFsaXphdGlvbi50eXBlID0gJ0ltYWdlJztcclxuICAgICAgW1xyXG4gICAgICAgICdpbWFnZU9wYWNpdHknLFxyXG4gICAgICAgICdpbml0aWFsV2lkdGgnLFxyXG4gICAgICAgICdpbml0aWFsSGVpZ2h0JyxcclxuICAgICAgICAnbWlwbWFwQmlhcycsXHJcbiAgICAgICAgJ21pcG1hcEluaXRpYWxMZXZlbCcsXHJcbiAgICAgICAgJ21pcG1hcE1heExldmVsJ1xyXG4gICAgICBdLmZvckVhY2goIHNpbXBsZUtleSA9PiB7XHJcbiAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvclxyXG4gICAgICAgIGlmICggbm9kZVsgc2ltcGxlS2V5IF0gIT09IEltYWdlLkRFRkFVTFRfSU1BR0VfT1BUSU9OU1sgc2ltcGxlS2V5IF0gKSB7XHJcbiAgICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yXHJcbiAgICAgICAgICBvcHRpb25zWyBzaW1wbGVLZXkgXSA9IG5vZGVbIHNpbXBsZUtleSBdO1xyXG4gICAgICAgIH1cclxuICAgICAgfSApO1xyXG5cclxuICAgICAgc2V0dXAud2lkdGggPSBub2RlLmltYWdlV2lkdGg7XHJcbiAgICAgIHNldHVwLmhlaWdodCA9IG5vZGUuaW1hZ2VIZWlnaHQ7XHJcblxyXG4gICAgICAvLyBJbml0aWFsaXplZCB3aXRoIGEgbWlwbWFwXHJcbiAgICAgIGlmICggbm9kZS5fbWlwbWFwRGF0YSApIHtcclxuICAgICAgICBzZXR1cC5pbWFnZVR5cGUgPSAnbWlwbWFwRGF0YSc7XHJcbiAgICAgICAgc2V0dXAubWlwbWFwRGF0YSA9IG5vZGUuX21pcG1hcERhdGEubWFwKCBsZXZlbCA9PiB7XHJcbiAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICB1cmw6IGxldmVsLnVybCxcclxuICAgICAgICAgICAgd2lkdGg6IGxldmVsLndpZHRoLFxyXG4gICAgICAgICAgICBoZWlnaHQ6IGxldmVsLmhlaWdodFxyXG4gICAgICAgICAgICAvLyB3aWxsIHJlY29uc3RpdHV0ZSBpbWcge0hUTUxJbWFnZUVsZW1lbnR9IGFuZCBjYW52YXMge0hUTUxDYW52YXNFbGVtZW50fVxyXG4gICAgICAgICAgfTtcclxuICAgICAgICB9ICk7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgaWYgKCBub2RlLl9taXBtYXAgKSB7XHJcbiAgICAgICAgICBzZXR1cC5nZW5lcmF0ZU1pcG1hcHMgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIG5vZGUuX2ltYWdlIGluc3RhbmNlb2YgSFRNTEltYWdlRWxlbWVudCApIHtcclxuICAgICAgICAgIHNldHVwLmltYWdlVHlwZSA9ICdpbWFnZSc7XHJcbiAgICAgICAgICBzZXR1cC5zcmMgPSBub2RlLl9pbWFnZS5zcmM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKCBub2RlLl9pbWFnZSBpbnN0YW5jZW9mIEhUTUxDYW52YXNFbGVtZW50ICkge1xyXG4gICAgICAgICAgc2V0dXAuaW1hZ2VUeXBlID0gJ2NhbnZhcyc7XHJcbiAgICAgICAgICBzZXR1cC5zcmMgPSBub2RlLl9pbWFnZS50b0RhdGFVUkwoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAoICggQ2FudmFzTm9kZSAmJiBub2RlIGluc3RhbmNlb2YgQ2FudmFzTm9kZSApIHx8XHJcbiAgICAgICAgICggV2ViR0xOb2RlICYmIG5vZGUgaW5zdGFuY2VvZiBXZWJHTE5vZGUgKSApIHtcclxuICAgICAgc2VyaWFsaXphdGlvbi50eXBlID0gKCBDYW52YXNOb2RlICYmIG5vZGUgaW5zdGFuY2VvZiBDYW52YXNOb2RlICkgPyAnQ2FudmFzTm9kZScgOiAnV2ViR0xOb2RlJztcclxuXHJcbiAgICAgIHNldHVwLmNhbnZhc0JvdW5kcyA9IHNjZW5lcnlTZXJpYWxpemUoIG5vZGUuY2FudmFzQm91bmRzICk7XHJcblxyXG4gICAgICAvLyBJZGVudGlmeSB0aGUgYXBwcm94aW1hdGUgc2NhbGUgb2YgdGhlIG5vZGVcclxuICAgICAgLy8gbGV0IHNjYWxlID0gTWF0aC5taW4oIDUsIG5vZGUuX2RyYXdhYmxlcy5sZW5ndGggPyAoIDEgLyBfLm1lYW4oIG5vZGUuX2RyYXdhYmxlcy5tYXAoIGRyYXdhYmxlID0+IHtcclxuICAgICAgLy8gICBjb25zdCBzY2FsZVZlY3RvciA9IGRyYXdhYmxlLmluc3RhbmNlLnRyYWlsLmdldE1hdHJpeCgpLmdldFNjYWxlVmVjdG9yKCk7XHJcbiAgICAgIC8vICAgcmV0dXJuICggc2NhbGVWZWN0b3IueCArIHNjYWxlVmVjdG9yLnkgKSAvIDI7XHJcbiAgICAgIC8vIH0gKSApICkgOiAxICk7XHJcbiAgICAgIGNvbnN0IHNjYWxlID0gMTtcclxuICAgICAgY29uc3QgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2NhbnZhcycgKTtcclxuICAgICAgY2FudmFzLndpZHRoID0gTWF0aC5jZWlsKCBub2RlLmNhbnZhc0JvdW5kcy53aWR0aCAqIHNjYWxlICk7XHJcbiAgICAgIGNhbnZhcy5oZWlnaHQgPSBNYXRoLmNlaWwoIG5vZGUuY2FudmFzQm91bmRzLmhlaWdodCAqIHNjYWxlICk7XHJcbiAgICAgIGNvbnN0IGNvbnRleHQgPSBjYW52YXMuZ2V0Q29udGV4dCggJzJkJyApITtcclxuICAgICAgY29uc3Qgd3JhcHBlciA9IG5ldyBDYW52YXNDb250ZXh0V3JhcHBlciggY2FudmFzLCBjb250ZXh0ICk7XHJcbiAgICAgIGNvbnN0IG1hdHJpeCA9IE1hdHJpeDMuc2NhbGUoIDEgLyBzY2FsZSApO1xyXG4gICAgICB3cmFwcGVyLmNvbnRleHQuc2V0VHJhbnNmb3JtKCBzY2FsZSwgMCwgMCwgc2NhbGUsIC1ub2RlLmNhbnZhc0JvdW5kcy5sZWZ0LCAtbm9kZS5jYW52YXNCb3VuZHMudG9wICk7XHJcbiAgICAgIG5vZGUucmVuZGVyVG9DYW52YXNTZWxmKCB3cmFwcGVyLCBtYXRyaXggKTtcclxuICAgICAgc2V0dXAudXJsID0gY2FudmFzLnRvRGF0YVVSTCgpO1xyXG4gICAgICBzZXR1cC5zY2FsZSA9IHNjYWxlO1xyXG4gICAgICBzZXR1cC5vZmZzZXQgPSBzY2VuZXJ5U2VyaWFsaXplKCBub2RlLmNhbnZhc0JvdW5kcy5sZWZ0VG9wICk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCBET00gJiYgbm9kZSBpbnN0YW5jZW9mIERPTSApIHtcclxuICAgICAgc2VyaWFsaXphdGlvbi50eXBlID0gJ0RPTSc7XHJcbiAgICAgIHNlcmlhbGl6YXRpb24uZWxlbWVudCA9IG5ldyB3aW5kb3cuWE1MU2VyaWFsaXplcigpLnNlcmlhbGl6ZVRvU3RyaW5nKCBub2RlLmVsZW1lbnQgKTtcclxuICAgICAgaWYgKCBub2RlLmVsZW1lbnQgaW5zdGFuY2VvZiB3aW5kb3cuSFRNTENhbnZhc0VsZW1lbnQgKSB7XHJcbiAgICAgICAgc2VyaWFsaXphdGlvbi5kYXRhVVJMID0gbm9kZS5lbGVtZW50LnRvRGF0YVVSTCgpO1xyXG4gICAgICB9XHJcbiAgICAgIG9wdGlvbnMucHJldmVudFRyYW5zZm9ybSA9IG5vZGUucHJldmVudFRyYW5zZm9ybTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBQYWludGFibGVcclxuICAgIGlmICggKCBQYXRoICYmIG5vZGUgaW5zdGFuY2VvZiBQYXRoICkgfHxcclxuICAgICAgICAgKCBUZXh0ICYmIG5vZGUgaW5zdGFuY2VvZiBUZXh0ICkgKSB7XHJcblxyXG4gICAgICBbXHJcbiAgICAgICAgJ2ZpbGxQaWNrYWJsZScsXHJcbiAgICAgICAgJ3N0cm9rZVBpY2thYmxlJyxcclxuICAgICAgICAnbGluZVdpZHRoJyxcclxuICAgICAgICAnbGluZUNhcCcsXHJcbiAgICAgICAgJ2xpbmVKb2luJyxcclxuICAgICAgICAnbGluZURhc2hPZmZzZXQnLFxyXG4gICAgICAgICdtaXRlckxpbWl0J1xyXG4gICAgICBdLmZvckVhY2goIHNpbXBsZUtleSA9PiB7XHJcbiAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvclxyXG4gICAgICAgIGlmICggbm9kZVsgc2ltcGxlS2V5IF0gIT09IFBBSU5UQUJMRV9ERUZBVUxUX09QVElPTlNbIHNpbXBsZUtleSBdICkge1xyXG4gICAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvclxyXG4gICAgICAgICAgb3B0aW9uc1sgc2ltcGxlS2V5IF0gPSBub2RlWyBzaW1wbGVLZXkgXTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gKTtcclxuXHJcbiAgICAgIC8vIElnbm9yaW5nIGNhY2hlZFBhaW50cywgc2luY2Ugd2UnZCAnZG91YmxlJyBpdCBhbnl3YXlzXHJcblxyXG4gICAgICBpZiAoIG5vZGUuZmlsbCAhPT0gUEFJTlRBQkxFX0RFRkFVTFRfT1BUSU9OUy5maWxsICkge1xyXG4gICAgICAgIHNldHVwLmZpbGwgPSBzY2VuZXJ5U2VyaWFsaXplKCBub2RlLmZpbGwgKTtcclxuICAgICAgfVxyXG4gICAgICBpZiAoIG5vZGUuc3Ryb2tlICE9PSBQQUlOVEFCTEVfREVGQVVMVF9PUFRJT05TLnN0cm9rZSApIHtcclxuICAgICAgICBzZXR1cC5zdHJva2UgPSBzY2VuZXJ5U2VyaWFsaXplKCBub2RlLnN0cm9rZSApO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICggbm9kZS5saW5lRGFzaC5sZW5ndGggKSB7XHJcbiAgICAgICAgc2V0dXAubGluZURhc2ggPSBzY2VuZXJ5U2VyaWFsaXplKCBub2RlLmxpbmVEYXNoICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gc2VyaWFsaXphdGlvbjtcclxuICB9XHJcbiAgZWxzZSBpZiAoIHZhbHVlIGluc3RhbmNlb2YgRGlzcGxheSApIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIHR5cGU6ICdEaXNwbGF5JyxcclxuICAgICAgd2lkdGg6IHZhbHVlLndpZHRoLFxyXG4gICAgICBoZWlnaHQ6IHZhbHVlLmhlaWdodCxcclxuICAgICAgYmFja2dyb3VuZENvbG9yOiBzY2VuZXJ5U2VyaWFsaXplKCB2YWx1ZS5iYWNrZ3JvdW5kQ29sb3IgKSxcclxuICAgICAgdHJlZToge1xyXG4gICAgICAgIHR5cGU6ICdTdWJ0cmVlJyxcclxuICAgICAgICByb290Tm9kZUlkOiB2YWx1ZS5yb290Tm9kZS5pZCxcclxuICAgICAgICBub2Rlczogc2VyaWFsaXplQ29ubmVjdGVkTm9kZXMoIHZhbHVlLnJvb3ROb2RlIClcclxuICAgICAgfVxyXG4gICAgfTtcclxuICB9XHJcbiAgZWxzZSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICB0eXBlOiAndmFsdWUnLFxyXG4gICAgICB2YWx1ZTogdmFsdWVcclxuICAgIH07XHJcbiAgfVxyXG59O1xyXG5cclxuY29uc3Qgc2VyaWFsaXplQ29ubmVjdGVkTm9kZXMgPSAoIHJvb3ROb2RlOiBOb2RlICk6IEludGVudGlvbmFsQW55ID0+IHtcclxuICByZXR1cm4gcm9vdE5vZGUuZ2V0U3VidHJlZU5vZGVzKCkubWFwKCBzY2VuZXJ5U2VyaWFsaXplICk7XHJcbn07XHJcblxyXG5zY2VuZXJ5LnJlZ2lzdGVyKCAnc2NlbmVyeVNlcmlhbGl6ZScsIHNjZW5lcnlTZXJpYWxpemUgKTtcclxuZXhwb3J0IHsgc2NlbmVyeVNlcmlhbGl6ZSBhcyBkZWZhdWx0LCBzZXJpYWxpemVDb25uZWN0ZWROb2RlcyB9OyJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7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