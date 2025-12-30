import { notification as staticNotification } from 'antd';

import codeMessage from './codeMessage';

const successHandler = (response, options = { notifyOnSuccess: false, notifyOnFailed: true }) => {
  const { data } = response;
  const notifier = (window.__antd_app && window.__antd_app.notification) || staticNotification;
  if (data && data.success === true) {
    const message = response.data && data.message;
    const successText = message || codeMessage[response.status];

    if (options.notifyOnSuccess) {
      notifier.success({
        message: `Request success`,
        description: successText,
        duration: 2,
      });
    }
  } else {
    const message = response.data && data.message;
    const errorText = message || codeMessage[response.status];
    const { status } = response;
    if (options.notifyOnFailed) {
      notifier.error({
        message: `Request error ${status}`,
        description: errorText,
        duration: 4,
      });
    }
  }
};

export default successHandler;
