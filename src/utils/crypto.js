const bytesToBase64 = (bytes) => {
  return btoa(String.fromCharCode(...bytes));
};

const base64ToBytes = (base64) => {
  const binaryString = atob(base64);

  return Uint8Array.from(
    binaryString,
    (character) => character.charCodeAt(0)
  );
};

export {
  bytesToBase64,
  base64ToBytes
};