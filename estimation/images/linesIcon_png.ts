/* eslint-disable */
import asyncLoader from '../../phet-core/js/asyncLoader.js';

const image = new Image();
const unlock = asyncLoader.createLock( image );
image.onload = unlock;
image.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAAALCAYAAADP9otxAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAHhJREFUeNpijIj6tZ6BgSGAgUjAxMT69t3bMwU7tpsuYRgGgAmIHUjUwwPElgzDBLAAcSIQGwLxfyID7CMQr2EYBaNgFIyCUTD0ASMuCVFOFrZXuVohv3781QJy/wzXAGDBI8cPxEuHewpgwiP3C4gvD3P/fwAIMABW6hZHARBfrwAAAABJRU5ErkJggg==';
export default image;