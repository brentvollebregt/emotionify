// Convert an object to a query string
export function encodeData(data: any): string {
    return Object.keys(data).map(function (key) {
        return [key, data[key]].map(encodeURIComponent).join("=");
    }).join("&");
}

// Create a random string (src: https://stackoverflow.com/a/1349426)
export function randomString(length: number): string {
    let result = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

export function chunkList<T>(list: T[], chunk_amount: number): T[][] {
    let chunks: T[][] = [];
    for (let i = 0; i < list.length; i += chunk_amount) {
        chunks = [...chunks, list.slice(i, i+chunk_amount)]
    }
    return chunks;
}
