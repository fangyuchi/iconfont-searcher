import injectIconfont from './features/injectIconfont';

document.addEventListener('readystatechange', () => {
  if (document.readyState === 'complete') {

    const { href } = location;

    switch (true) {
      // * iconfont
      // https://www.iconfont.cn/manage/index
      case /^https:\/\/www\.iconfont\.cn\/manage\/index/.test(href):
        injectIconfont();
        break;
      default:
        break;
    }
  }
});
