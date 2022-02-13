
const b64Prefix = 'data:image/svg+xml;base64,';

export const svgToImg = (svg) => {

  if (svg) {
    const xml = new XMLSerializer().serializeToString(svg);
    const svg64 = btoa(xml);
    const image64 = `${b64Prefix}${svg64}`;

    return image64;
  }

  return null;
};

// 根据 RGBA 数组生成 ImageData
export function createImgData (dataDetail: number[]) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const imageSize = Math.sqrt(dataDetail.length / 4);
  const newImageData = ctx?.createImageData(imageSize, imageSize) as ImageData;
  for (let i = 0; i < dataDetail.length; i += 4) {
    let R = dataDetail[i];
    let G = dataDetail[i + 1];
    let B = dataDetail[i + 2];
    let Alpha = dataDetail[i + 3];

    newImageData.data[i] = R;
    newImageData.data[i + 1] = G;
    newImageData.data[i + 2] = B;
    newImageData.data[i + 3] = Alpha;
  }
  return newImageData;
};

// 白色代表内容，黑色代表背景
export function toGreyImg(imgData: ImageData, log: boolean = false) {
  const newData: number[] = Array(imgData.data.length);
  newData.fill(0);
  // let bgColor = null;
  imgData.data.forEach((_data, index) => {
    if ((index + 1) % 4 === 0) {
      // 取第一个点的颜色作为背景色
      const R = imgData.data[index - 3];
      const G = imgData.data[index - 2];
      const B = imgData.data[index - 1];
      // bgColor = bgColor || [ R, G, B ];

      // if(log) {
      //   console.log('bgColor', bgColor, R, G, B)
      // }

      // 透明部分白色填充/白色部分转为黑色
      // !默认假定svg中没有填充黑色
      if (
        // (Math.max(Math.abs(R - bgColor[0]), Math.abs(G - bgColor[1]), Math.abs(B - bgColor[2])) < 1 ) || 
        // Math.max(R, G, B) < 1
        (
          Math.max(R, G, B) < 5 ) || 
          (Math.min(R, G, B) > 240
          // (Math.max(Math.abs(R - bgColor[0]), Math.abs(G - bgColor[1]), Math.abs(B - bgColor[2])) < 3 )
        )
      ) {
        newData[index - 3] = 0;
        newData[index - 2] = 0;
        newData[index - 1] = 0;
        newData[index] = 255;

        return;
      }

      // const gray = ~~((R + G + B) / 3);

      newData[index - 3] = 255;
      newData[index - 2] = 255;
      newData[index - 1] = 255;
      newData[index] = 255; // Alpha 值固定为255
    }
  })
  return createImgData(newData);
};

// 压缩图片
export function compressImg(
  imgNode: any, 
  grey: boolean,
  // 缩放（不缩放就传原始尺寸，必须要传）
  scale: {
    toWidth: number;
    toHeight: number;
  },
  // 原始图片位移
  originTranslate?: {
    sx: number;
    sy: number;
    sWidth: number;
    sHeight: number;
  } | false
): Promise<{
  src: string,
  imageData: ImageData
}> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');

    imgNode.onload = function () {
      imgNode.onload = null;

      const { toWidth, toHeight } = scale;
      canvas.width = toWidth;
      canvas.height = toHeight;
      const ctx = canvas.getContext('2d');

      if (originTranslate) {
        const { 
          sx, sy, 
          sWidth, sHeight 
        } = originTranslate;
        ctx.drawImage(imgNode, sx, sy, sWidth, sHeight, 0, 0, toWidth, toHeight);
      } else {
        ctx.drawImage(imgNode, 0, 0, toWidth, toHeight);
      }

      const imgdata = ctx.getImageData(0, 0, toWidth, toHeight);

      ctx.putImageData(toGreyImg(imgdata, !grey), 0, 0);

      const src = canvas.toDataURL('image/png');
      resolve({
        src,
        imageData: ctx.getImageData(0, 0, toWidth, toHeight)
      });
    }
  });
};

export const dealImg = (
  imgNode: any,
  // 是否灰度化
  grey: boolean,
  // 缩放（不缩放就传原始尺寸，必须要传）
  scale: {
    toWidth: number;
    toHeight: number;
  },
  // 原始图片位移
  originTranslate: {
    sx: number;
    sy: number;
    sWidth: number;
    sHeight: number;
  } | false,
) => {
  if (!imgNode) return null;

  return compressImg(imgNode, grey, scale, originTranslate);
}

export function getHashFingerprint (imgData: ImageData, imageSize: number) {
  const grayList = imgData.data.reduce((pre: number[], cur, index) => {
    if ((index + 1) % 4 === 0) {
      pre.push(imgData.data[index - 1]);
    }
    return pre;
  }, []);
  const length = grayList.length;
  const grayAverage = grayList.reduce((pre, next) => (pre + next), 0) / length;
  const fingerprint = grayList.reduce((acc, gray, index) => {
    const print = (gray >= grayAverage ? 1 : 0);

    if ((index % imageSize) === 0) {
      acc.push(print);
    } else {
      acc[acc.length - 1] = `${acc[acc.length - 1]}${print}`;
    }

    return acc;
  }, []);

  /**
   * 将指纹中有数据的元素定位在左上角，方便匹配
   * 
   *  0 0 0 0 <--- 移到最后面
   *  0 0 0 1
   *  0 1 1 1
   *  0 0 0 0
   *  ^--- 移到最右边
   */
  let res = [ ...fingerprint ];
  const all0 = Array.from({ length: imageSize }, () => '0').join('');

  // *上移，将全为0的元素移动到末尾
  for (let i = 0; i < imageSize; i ++) {
    if (fingerprint[i] === all0) {
      res.push(res.shift());
    } else {
      break;
    }
  }

  // *左移，将全为0的元素移动到右侧
  let min0Count = imageSize;
  const { length: fingerprintLength } = fingerprint;
  for (let i = 0; i < fingerprintLength; i ++) {
    const cur0 = Array.prototype.indexOf.call(fingerprint[i], '1');
    if ((cur0 !== -1) && (cur0 < min0Count)) {
      min0Count = cur0;

      if (min0Count === 0) {
        break;
      }
    }
  }

  const string0s = Array.from({ length: min0Count }, () => '0').join('');
  if (min0Count > 0) {
    res = res.map(cur => `${cur.slice(min0Count)}${string0s}`);
  }  

  return {
    sorted: res,
    origin: fingerprint
  };
}

export function hammingDistance (str1: string[], str2: string[]){
  const forEach = Array.prototype.forEach;

  // 兼容一点错位的情况, [ x方向偏移, y方向偏移 ]
  const offset = [[ 0, 0 ], [ 0, 1 ], [ 1, 0 ], [ 1, 1 ], [ 1, 2 ], [ 2, 1 ], [ 2, 2 ], [ 0, 2 ], [ 2, 0 ]];
  let distance = Array.from({ length: offset.length }, () => 0);

  offset.forEach((os, index) => {
    str1.forEach((str, i) => {
      forEach.call(str, (letter, j) => {
        if (letter !== str2?.[i + os[1]]?.[j + os[0]]) {
          distance[index] ++;
        }
      });
    });
  });

  return Math.min(...distance);
}

/**
 * 取出原图中图形区域的位置信息
 * @param size 
 * @param prints 
 */
export function getContentRectFromOriginPrint(size: number, prints: string[], orginWidth: number, orginHeight: number) {
  let top = 0;
  let topSeted = false;
  let bot = 0;
  let botSeted = false;
  let lef = size;
  let rig = 0;

  prints.forEach((cur) => {
    let first = cur.indexOf('1');
    let last = cur.lastIndexOf('1');

    if (first > -1) {
      lef = Math.min(lef, first);
    }

    if (last > -1) {
      rig = Math.max(rig, last);
    }

    if (first === -1 && !topSeted) {
      top ++;
    } else {
      topSeted = true;
    }
  });
  
  rig = size - rig - 1;

  // 从后往前找
  for (let i = prints.length - 1; i >= 0; i --) {
    let first = prints[i].indexOf('1');
    
    if (first === -1 && !botSeted) {
      bot ++;
    } else {
      botSeted = true;
    }
  }

  const width = size - bot - top;
  const height = size - rig - lef;
  // 取宽和高中较大者，保证图形的完整性
  const sideLength = Math.max(width, height);

  let trimWidth = (sideLength / size) * orginWidth;
  let trimHeight = trimWidth;
  let offsetLeft = (lef / size) * orginWidth;
  let offsetTop = (top / size) * orginHeight;

  if (offsetTop + trimHeight > orginHeight) {
    offsetTop = orginHeight - trimHeight;
  }

  if (offsetLeft + trimWidth > orginWidth) {
    offsetLeft = orginWidth - trimWidth;
  }

  return {
    trimWidth,
    trimHeight,
    offsetLeft,
    offsetTop
  };
}
