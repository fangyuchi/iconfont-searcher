/**
 * iconfont
 */
import ReactDOM from 'react-dom';
import { fyczsCreateElement } from '@/utils/dom';
import { StringTool } from '@/utils';
import Feature from './Feature';

const injectIconfont = () => {
  const mountPoint = fyczsCreateElement(StringTool.withPrefix('div'), {
    style: 'position: fixed; height: 45px; bottom: 48px; right: 24px;',
  });

  document.body.appendChild(mountPoint);

  ReactDOM.render(<Feature />, mountPoint);
};

export default injectIconfont;
