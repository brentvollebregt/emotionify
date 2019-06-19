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

// Turn a list into lists of lists with each top level list holding a max of `chunk_amount` lists
export function chunkList<T>(list: T[], chunk_amount: number): T[][] {
    let chunks: T[][] = [];
    for (let i = 0; i < list.length; i += chunk_amount) {
        chunks = [...chunks, list.slice(i, i+chunk_amount)]
    }
    return chunks;
}

// Convert an array to an object using a provided key (src: https://medium.com/dailyjs/rewriting-javascript-converting-an-array-of-objects-to-an-object-ec579cafbfc7)
export function arrayToObject<T>(array: T[], keyField: keyof T): {[key: string]: T} {
    return array.reduce((obj: any, item: any) => {
        obj[item[keyField]] = item;
        return obj;
    }, {});
}

// Convert milliseconds to a formatted minutes and seconds string
export function millisecondsToMinSecString(milliseconds: number): string {
    let total_seconds = milliseconds / 1000;
    let minutes = Math.floor(total_seconds / 60);
    let seconds = Math.round(total_seconds - minutes * 60);
    return minutes + ':' + ('0' + seconds).substr(('0' + seconds).length - 2); // Zero padding on the seconds
}

// Get an object representing the current state of the URL hash (modified from https://stackoverflow.com/a/2880929 + https://stackoverflow.com/a/4198132)
export function getHashParameters(): {[key: string]: string} {
    let hashParams: {[key: string]: string} = {};
    let plus = /\+/g; // Regex for replacing addition symbol with a space
    let search = /([^&;=]+)=?([^&;]*)/g;
    const decode = (s: string) => decodeURIComponent(s.replace(plus, " "));
    let hash = window.location.hash.substring(1);

    let match;
    while (match = search.exec(hash)) {
        hashParams[decode(match[1])] = decode(match[2]);
    }

    return hashParams;
}
