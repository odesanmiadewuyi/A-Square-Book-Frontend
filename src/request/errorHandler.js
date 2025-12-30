import { notification as staticNotification } from 'antd';
import codeMessage from './codeMessage';

const errorHandler = (error) => {
  const notifier = (window.__antd_app && window.__antd_app.notification) || staticNotification;
  if (!navigator.onLine) {
    // Code to execute when there is internet connection
    notifier.error({
      message: 'No internet connection',
      description: 'Cannot connect to the Internet, Check your internet network',
      duration: 15,
    });
    return {
      success: false,
      result: null,
      message: 'Cannot connect to the server, Check your internet network',
    };
  }

  const { response } = error;

  if (!response) {
    // Code to execute when there is no internet connection
    // notification.error({
    //   message: 'Problem connecting to server',
    //   description: 'Cannot connect to the server, Try again later',
    // });
    return {
      success: false,
      result: null,
      message: 'Cannot connect to the server, Contact your Account administrator',
    };
  }

  if (response && response.data && response.data.jwtExpired) {
    const result = window.localStorage.getItem('auth');
    const jsonFile = window.localStorage.getItem('isLogout');
    const { isLogout } = (jsonFile && JSON.parse(jsonFile)) || false;
    window.localStorage.removeItem('auth');
    window.localStorage.removeItem('isLogout');
    if (result || isLogout) {
      window.location.href = '/logout';
    }
  }

  if (response && response.status) {
    const url = (response?.config?.url || response?.request?.responseURL || '').toString();
    // Don’t show global error for settings bootstrap; return safe empty payload
    if (/\/setting\/listAll(\?|$)/.test(url)) {
      return { success: true, result: [], message: 'Settings unavailable' };
    }
    const message = response.data && response.data.message;

    const errorText = message || codeMessage[response.status];
    const { status, error } = response;
    notifier.error({
      message: `Request error ${status}`,
      description: errorText,
      duration: 20,
    });

    if (response?.data?.error?.name === 'JsonWebTokenError') {
      window.localStorage.removeItem('auth');
      window.localStorage.removeItem('isLogout');
      window.location.href = '/logout';
    } else return response.data;
  } else {
    if (navigator.onLine) {
      // Code to execute when there is internet connection
      notifier.error({
        message: 'Problem connecting to server',
        description: 'Cannot connect to the server, Try again later',
        duration: 15,
      });
      return {
        success: false,
        result: null,
        message: 'Cannot connect to the server, Contact your Account administrator',
      };
    } else {
      // Code to execute when there is no internet connection
      notifier.error({
        message: 'No internet connection',
        description: 'Cannot connect to the Internet, Check your internet network',
        duration: 15,
      });
      return {
        success: false,
        result: null,
        message: 'Cannot connect to the server, Check your internet network',
      };
    }
  }
};

export default errorHandler;
