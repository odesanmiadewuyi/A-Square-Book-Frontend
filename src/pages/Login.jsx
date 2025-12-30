import { useEffect } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import useLanguage from '@/locale/useLanguage';

import { Form, Button } from 'antd';

import { login } from '@/redux/auth/actions';
import { selectAuth } from '@/redux/auth/selectors';
import LoginForm from '@/forms/LoginForm';
import Loading from '@/components/Loading';
import AuthModule from '@/modules/AuthModule';

const LoginPage = () => {
  const translate = useLanguage();
  const { isLoading, isSuccess } = useSelector(selectAuth);
  const navigate = useNavigate();
  // const size = useSize();

  const dispatch = useDispatch();
  const onFinish = (values) => {
    dispatch(login({ loginData: values }));
  };

  const restoreFormValues = (formData) => {
    if (!formData?.fields?.length) return;
    const apply = () => {
      const formEl = document.querySelector('form');
      if (!formEl) {
        setTimeout(apply, 100);
        return;
      }
      formData.fields.forEach(({ key, value, type }) => {
        const el =
          formEl.querySelector(`[name="${key}"]`) ||
          formEl.querySelector(`#${key}`) ||
          formEl.querySelector(`input[name="${key}"]`);
        if (!el) return;
        try {
          if (type === 'checkbox') {
            el.checked = !!value;
            el.dispatchEvent(new Event('change', { bubbles: true }));
          } else if (type === 'radio') {
            const radio = formEl.querySelector(`input[type="radio"][name="${key}"][value="${value}"]`);
            if (radio) {
              radio.checked = true;
              radio.dispatchEvent(new Event('change', { bubbles: true }));
            }
          } else {
            el.value = value;
            el.dispatchEvent(new Event('input', { bubbles: true }));
          }
        } catch (_) {}
      });
    };
    apply();
  };

  useEffect(() => {
    if (isSuccess) {
      try {
        const raw = window.localStorage.getItem('postLoginRedirect');
        if (raw) {
          const { path = '/', search = '', scroll = {}, form } = JSON.parse(raw) || {};
          const target = `${path || '/'}${search || ''}`;
          navigate(target, { replace: true });
          setTimeout(() => {
            try {
              window.scrollTo(scroll.x || 0, scroll.y || 0);
            } catch (_) {}
            restoreFormValues(form);
          }, 50);
          window.localStorage.removeItem('postLoginRedirect');
          return;
        }
      } catch (_) {}
      navigate('/');
    }
  }, [isSuccess]);

  const FormContainer = () => {
    return (
      <Loading isLoading={isLoading}>
        <Form
          layout="vertical"
          name="normal_login"
          className="login-form"
          initialValues={{
            email: '',
            password: '',
          }}
          onFinish={onFinish}
        >
          <LoginForm />
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="login-form-button"
              loading={isLoading}
              size="large"
            >
              {translate('Log in')}
            </Button>
          </Form.Item>
        </Form>
      </Loading>
    );
  };

  return <AuthModule authContent={<FormContainer />} AUTH_TITLE="Sign in" />;
};

export default LoginPage;
