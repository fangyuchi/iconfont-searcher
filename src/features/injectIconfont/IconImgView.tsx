import React from 'react';

const IconImgView = (props, ref) => {

  return (
    <div 
      ref={ref} 
      style={{ overflowY: 'auto', display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start' }} 
    />
  );
};

export default React.forwardRef(IconImgView);
