import React from 'react';
import TextField from '@material-ui/core/TextField';
import {
  svgToImg, 
  dealImg,
  getHashFingerprint,
  hammingDistance,
  getContentRectFromOriginPrint
} from './imageOperation';
import LoadState from './LoadState';
import IconImgView from './IconImgView';
import SimiView from './SimiView';

let wrongCount = 0;
const imageSize = 36;
const svgIconSize = 36;
const simiMaxDistance = 300;

type SearchModalPropsType = {
  iconItems: Element[];
};

const SearchModal: React.ForwardRefRenderFunction<any, SearchModalPropsType> = ({
  iconItems
}, ref) => {
  const pasteImgView = React.useRef<any>();
  const imgView = React.useRef<any>();
  const simiIconsRef = React.useRef<any>();
  const [ simis, setSimis ] = React.useState(null);
  const [ loadedCount, setLoadedCount ] = React.useState<number>(0);

  const imageFingerprints = React.useRef<string[][]>([]);

  React.useEffect(() => {

    iconItems?.forEach((iconItem, iconIndex) => {
      const cloneNode: any = iconItem.querySelector('.icon').cloneNode(true);
      cloneNode.setAttribute('width', svgIconSize);
      cloneNode.setAttribute('height', svgIconSize);
      const imgUrl = svgToImg(cloneNode);

      const imgNode = new Image();
      imgNode.setAttribute('src', imgUrl);
      imgNode.setAttribute('width', svgIconSize as any);
      imgNode.setAttribute('height', svgIconSize as any);

      imgNode.onload = async () => {
        imgNode.onload = null;
        imgNode.setAttribute('src', imgUrl);

        let dealRes = await dealImg(
          imgNode,
          true,
          {
            toWidth: imageSize,
            toHeight: imageSize
          },
          {
            sx: 0,
            sy: 0,
            sWidth: imgNode.naturalWidth,
            sHeight: imgNode.naturalHeight
          }
        );
  
        // 下面是处理图片指纹
        const print = getHashFingerprint(dealRes.imageData, imageSize);
  
        // 计算出内容区与边界的距离
        const {
          trimWidth,
          trimHeight,
          offsetLeft,
          offsetTop
        } = getContentRectFromOriginPrint(imageSize, print.origin, imgNode.naturalWidth, imgNode.naturalHeight);

        imgNode.setAttribute('src', imgUrl);
  
        dealRes = await dealImg(
          imgNode, 
          true, 
          {
            toWidth: imageSize, 
            toHeight: imageSize
          }, 
          {
            sx: offsetLeft + 1,
            sy: offsetTop + 1,
            sWidth: trimWidth - 2,
            sHeight: trimHeight - 2
          }
        );
  
        imgNode.setAttribute('src', dealRes.src);
        const compressedPrint = getHashFingerprint(dealRes.imageData, imageSize);
  
        imageFingerprints.current[iconIndex] = compressedPrint.sorted;
  
        setLoadedCount(count => count + 1);
      };
    });

  }, [ iconItems ]);

  const pasteImage = React.useCallback(evt => {
    if (evt.clipboardData) {
      const clipboardData = (evt.clipboardData);
      if (clipboardData.items){
        let blob = null;
        const { items } = clipboardData;
        const { length } = items;
        for (let i = 0; i < length; i ++) {
          if (items[i].type.indexOf('image') !== -1) {
            blob = items[i].getAsFile();
          }
        }

        if (blob) {
          wrongCount = 0;
          const render = new FileReader();
          render.onload = function (e) {
            //输出base64编码
            const base64 = e.target.result.toString();
            const originImg = document.createElement('img');

            pasteImgView.current.innerHTML = '';
            pasteImgView.current.appendChild(originImg);
            originImg.setAttribute('src', base64);

            originImg.onload = async () => {
              originImg.onload = null;

              // 灰度化粘贴图片，获取图形尺寸，并根据图形尺寸调整为正方形
              const orignWidth = originImg.naturalWidth;
              const orignHeight = originImg.naturalHeight;
              const lgSize = Math.max(orignWidth, orignHeight);
              const size = 36;

              const clonedImg = document.createElement('img');
              clonedImg.setAttribute('src', base64);

              let dealRes = await dealImg(
                clonedImg, 
                true, 
                {
                  toWidth: size, 
                  toHeight: size
                }, 
                {
                  sx: 0,
                  sy: 0,
                  sWidth: lgSize,
                  sHeight: lgSize,
                }
              );
              const print = getHashFingerprint(dealRes.imageData, size);
              const { origin } = print;

              // 计算出内容区与边界的距离
              const {
                trimWidth,
                trimHeight,
                offsetLeft,
                offsetTop
              } = getContentRectFromOriginPrint(size, origin, orignWidth, orignHeight);

              clonedImg.setAttribute('src', base64);

              // 读取出粘贴图片的图片指纹后，再根据指纹位置截取图片，截掉多余的背景，并再次处理截取后的图片
              dealRes = await dealImg(
                clonedImg, 
                false, 
                {
                  toWidth: imageSize, 
                  toHeight: imageSize
                }, 
                {
                  sx: offsetLeft,
                  sy: offsetTop,
                  sWidth: trimWidth,
                  sHeight: trimHeight
                }
              );

              originImg.setAttribute('src', dealRes.src);
              const compressedPrint = getHashFingerprint(dealRes.imageData, imageSize);

              const curSimis = [];
              imageFingerprints.current.forEach((cur, index) => {
                const curDis = hammingDistance(cur, compressedPrint.sorted);
   
                if (curDis <= simiMaxDistance) {
                  curSimis.push({
                    dis: curDis,
                    index
                  });
                }
              });

              setSimis(curSimis.sort((a, b) => a.dis - b.dis));
            };
            
          }
          render.readAsDataURL(blob);
        } else {
          wrongCount ++;
          pasteImgView.current.innerHTML = wrongCount >= 3 ? '你是不是傻？' : '粘贴图片才可以哦～';
        }
      }
    }
  }, [ simis ]);

  React.useEffect(() => {
    if (!simiIconsRef.current) {
      return;
    }

    simiIconsRef.current.innerHTML = '';

    if (simis?.length) {
      simis.forEach(simi => {
        const target: any = iconItems[simi.index].cloneNode(true);
        target.removeChild(target.querySelector('.icon-cover.icon-cover-unfreeze'));
        target.removeChild(target.querySelector('.icon-cover.icon-cover-freeze'));
        simiIconsRef.current.appendChild(target);
      });
    } else {
      const noresult = document.createElement('div');
      noresult.innerHTML = '找不到';
      simiIconsRef.current.appendChild(noresult);
    }
  }, [ simis, iconItems ]);

  const loadCompoleted = loadedCount === iconItems?.length;

  return (
    <div 
      ref={ref}
      style={{
        top: 200,
        left: 200,
        margin: 24,
        padding: 24,
        width: '80vw',
        height: '80vh',
        background: '#fff'
      }}
    >
      <div id='temp'></div>
      <div id='temp1'></div>

      <TextField 
        onPaste={pasteImage}
        label="cmd + v 在此处粘贴图片 图片尽量保持正方形 白色（或者浅灰色）背景" 
        style={{ width: '100%' }} 
        value=""
        disabled={!loadCompoleted}
      />
      <div style={{ display: 'flex', marginTop: 16 }}>
        <div 
          style={{ 
            width: 96, 
            height: 96, 
            padding: 8, 
            marginRight: 64, 
            background: 'rgb(208, 233, 255)' 
          }} 
          ref={pasteImgView} 
        />
        <div>
          <span>举个栗子: </span>
          <img style={{ border: '1px solid #e1e1e1' }} width={53} height={51} src="data:image/png;base64,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" />
        </div>
      </div>
      <LoadState total={iconItems?.length} cur={loadedCount} />
      <IconImgView ref={imgView} />
      <SimiView ref={simiIconsRef} />

    </div>
  );
};

export default React.forwardRef(SearchModal);
