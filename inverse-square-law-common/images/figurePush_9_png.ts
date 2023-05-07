/* eslint-disable */
import asyncLoader from '../../phet-core/js/asyncLoader.js';

const image = new Image();
const unlock = asyncLoader.createLock( image );
image.onload = unlock;
image.src = 'data:image/png;base64,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';
export default image;