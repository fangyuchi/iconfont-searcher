import React from 'react';

const SimiView = (props, ref) => {

  return (
    <div
      style={{ display: 'flex', flexWrap: 'wrap' }}
      className="page-manage-right page-manage-project"
    >
      <div className="project-iconlist">
        <ul ref={ref} className="block-icon-list clearfix" style={{ height: 450, overflow: 'auto' }}>
        </ul>
      </div>
    </div>
  );
};

export default React.forwardRef(SimiView);
