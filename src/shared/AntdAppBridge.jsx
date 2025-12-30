import { App as AntdApp, message as staticMessage } from 'antd';
import { useEffect } from 'react';

export default function AntdAppBridge() {
  const api = AntdApp.useApp();
  useEffect(() => {
    // Expose to non-React modules (e.g., request handlers)
    window.__antd_app = api;
    // Bridge static message to contextual message to avoid v5 warning
    try {
      if (api?.message) {
        const m = api.message;
        const methods = ['open','info','success','error','warning','loading','destroy','config'];
        methods.forEach((fn) => {
          if (typeof m[fn] === 'function') {
            staticMessage[fn] = (...args) => m[fn](...args);
          }
        });
      }
    } catch (_) {}
    return () => {
      try {
        delete window.__antd_app;
      } catch (e) {
        window.__antd_app = undefined;
      }
    };
  }, [api]);
  return null;
}
