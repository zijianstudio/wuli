/* eslint-disable */
import asyncLoader from '../../phet-core/js/asyncLoader.js';

const image = new Image();
const unlock = asyncLoader.createLock( image );
image.onload = unlock;
image.src = 'data:image/png;base64,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';
export default image;