/* eslint-disable */
import asyncLoader from '../../phet-core/js/asyncLoader.js';

const image = new Image();
const unlock = asyncLoader.createLock( image );
image.onload = unlock;
image.src = 'data:image/png;base64,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';
export default image;