// Convert an object to a query string
export function encodeData(data: any): string {
  return Object.keys(data)
    .map(function (key) {
      return [key, data[key]].map(encodeURIComponent).join("=");
    })
    .join("&");
}

// Create a random string of n length
export const randomString = (length: number) => {
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const values = crypto.getRandomValues(new Uint8Array(length));
  return values.reduce((acc, x) => acc + possible[x % possible.length], "");
};

// Turn a list into lists of lists with each top level list holding a max of `chunk_amount` lists
export function chunkList<T>(list: T[], chunk_amount: number): T[][] {
  let chunks: T[][] = [];
  for (let i = 0; i < list.length; i += chunk_amount) {
    chunks = [...chunks, list.slice(i, i + chunk_amount)];
  }
  return chunks;
}

// Convert an array to an object using a provided key (src: https://medium.com/dailyjs/rewriting-javascript-converting-an-array-of-objects-to-an-object-ec579cafbfc7)
export function arrayToObject<T>(array: T[], keyField: keyof T): { [key: string]: T } {
  return array.reduce((obj: any, item: any) => {
    obj[item[keyField]] = item;
    return obj;
  }, {});
}
