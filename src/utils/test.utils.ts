export const parseAndAssign = (
  queryObject: any,
  key: string,
  value: any,
  parsingType?: string,
) => {
  if (value && parsingType === 'jsonParse') {
    queryObject[key] = JSON.parse(value as string);
  }
  if (value && parsingType === 'intParse') {
    queryObject[key] = parseInt(value as string);
  }
  if (value && parsingType === undefined) {
    queryObject[key] = value as string;
  }
};
