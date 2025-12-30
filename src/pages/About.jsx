import { Result } from 'antd';

import useLanguage from '@/locale/useLanguage';

const About = () => {
  const translate = useLanguage();
  return (
    <Result
      status="info"
      title={'A Square Book'}
      subTitle={translate('Do you need help on customize of this app')}
      extra={null}
    />
  );
};

export default About;

