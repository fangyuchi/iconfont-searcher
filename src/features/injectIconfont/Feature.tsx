import React from 'react';
import Button from '@material-ui/core/Button';
import SearchIcon from '@material-ui/icons/Search';
import Modal from '@material-ui/core/Modal';
import SearchModal from './SearchModal';

const Feature = () => {
  const [ open, setOpen ] = React.useState(false);
  const [ iconItems, setIconItems ] = React.useState<Element[]>(null);

  const setIconListCache = () => {
    if (!iconItems?.length) {
      const items = Array.from(document.querySelectorAll('.project-iconlist .block-icon-list li.icon-item'));
      setIconItems(items);
    }
  };

  const handleOpen = () => {
    setOpen(true);

    setIconListCache();
  };

  const handleClose = () => {
    setOpen(false);
  };


  return (
    <>
      <Button 
        style={{ width: '100%', height: '100%', fontSize: 24 }} 
        variant="contained" 
        color="primary"
        onClick={handleOpen}
        size="small"
      >
        <SearchIcon />
      </Button>
      <Modal
        open={open}
        onClose={handleClose}
        keepMounted
      >
        <SearchModal iconItems={iconItems} />
      </Modal>
    </>
  );
};

export default Feature;
