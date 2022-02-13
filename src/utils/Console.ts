import StringTool from './StringTool';

class Console {

  public static error = (str: string) => {
    console.error(StringTool.withPrefix(str, ':'));
  };

  public static warn = (str: string) => {
    console.warn(StringTool.withPrefix(str, ':'));
  };
}

export default Console;
