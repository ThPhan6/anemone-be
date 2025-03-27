export const getSubStringBetween2Characters = (str: string, startChar: string, endChar: string) => {
  const startIndex = str.indexOf(startChar) + 1;
  const endIndex = str.indexOf(endChar);

  if (startIndex === -1 || endIndex === -1) {
    return {
      start: str,
      sub: '',
      end: '',
    };
  }

  return {
    start: str.substring(0, startIndex),
    sub: str.substring(startIndex, endIndex),
    end: str.substring(endIndex, str.length),
  };
};
