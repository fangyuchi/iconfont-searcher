
class StringTool {

  public static CRX_NAME = 'fangyczs';

  public static withPrefix = (str: string, joinWidth: string = '_', prefix: string = StringTool.CRX_NAME) => {
    return `${prefix}${joinWidth}${str}`;
  }
}

export default StringTool;
