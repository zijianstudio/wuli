/* eslint-disable */
import asyncLoader from '../../phet-core/js/asyncLoader.js';

const image = new Image();
const unlock = asyncLoader.createLock( image );
image.onload = unlock;
image.src = 'data:image/png;base64,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';
export default image;