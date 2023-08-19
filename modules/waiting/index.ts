export function doWait(ms:number) {
    return new Promise((resolve) => {
        setTimeout(() => resolve(null), ms);
    })
}