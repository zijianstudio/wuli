/* eslint-disable */
import asyncLoader from '../../phet-core/js/asyncLoader.js';

const image = new Image();
const unlock = asyncLoader.createLock( image );
image.onload = unlock;
image.src = 'data:image/png;base64,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CA2hgdAQGkIDoSE0EBpCQ2ggNISG0EBoCA2EhtAQGggNoYHQEBpCA6EhNBAaQkNoIDSEBkJDaAgNhIbQEBoIDaGB0BAaQgOhITQQGkJDaCA0hAZCQ2gIDYSG0EBoCA2hgdAQGkIDoSE0EBpCQ2ggNIQGQkNoCA2EhtBAaAgNoYHQEBoIDaEhNBAaQkNoIDSEBkJDaAgNhIbQQGgIDaGB0BAaCA2hITQQGkIDoSE0hAZCQ2gIzUOA0BAaCA2hITQQGkIDoSE0hAZCQ2ggNISG0EBoCA2EhtAQGggNoYHQEBpCA6EhNIQGQkNoIDSEhtBAaAgNhIbQEBoIDaGB0BAaQgOhITQQGkJDaCA0hIbQQGgIDYSG0BAaCA2hgdAQGkIDoSE0EBpCQ2ggNIQGQkNoCA2EhtAQGggNoYHQEBpCA6EhNBAaQkNoIDSEBkJDaAgNhIbQQGgIDaGB0BAaQgOhITQQGkJDaCA0hAZCQ2gIDYSG0EBoCA2hgdAQGggNoSE0EBpCQ2ggNIQGQkNoCA2EhtBAaAgNoYHQEBoIDaEhNBAaQgOhITSEBkJDaAgNhIbQQGgIDaGB0BAaCA2hITQQGkIDoSE0hAZCQ2ggNISG0EBoCA2hgdAQGggNoSE0EBpCA6EhNIQGQkNoIDSEhtBAaAgNhIbQEBoIDaEhNBAaQgOhITSEBkJDaCA0hIbQQGgIDYSG0BAaCA2hgdAQGkIDoSE0hAZCQ2ggNISG0EBoCA2EhtAQGggNoYHQEBpCA6EhNBAaQkNoIDSEhtBAaAgNhIbQEBoIDaGB0BAaQgOhITQQGkJDaCA0hAZCQ2gIDYSG0BCahwChITQQGkJDaCA0hAZCQ2gIDYSG0EBoCA2hgdAQGggNoSE0EBpCA6EhNIQGQkNoCA2EhtBAaAgNoYHQEBoIDaEhNBAaQgOhITSEBkJDaCA0hIbQQGgIDaGB0BAaCA2hITQQGkIDoSE0hAZCQ2ggNISG0EBoCA2EhtAQGggNoSE0EBpCA6EhNIQGQkNoIDSEhtBAaAgNhIbQEBoIDaGB0BAaQgOhITSEBkJDaCA0hIbQQGgIDYSG0BAaCA2hgdAQGkIDoSE0EBpCQ2ggNISG0EBoCA2EhtAQGggNoYHQEBpCA6EhNBAaQkNoIDSEBkJDaAgNhIbQEBoIDaGB0BAaQgOhITQQGkJDaCA0hAZCQ2gI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';
export default image;