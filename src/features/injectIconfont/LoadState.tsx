
const LoadState = ({
  total,
  cur,
}) => {

  return <div>{total === cur ? '加载完成.' : '加载中......'}{cur} / {total}</div>
};

export default LoadState;
