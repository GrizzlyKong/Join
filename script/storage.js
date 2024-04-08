const STORAGE_TOKEN = 'UK3WMTJPY9HCOS9AB0PGAT5U9XL1Y2BKP4MIYIVD';
const STORAGE_URL = 'https://remote-storage.developerakademie.org/item';

let users = [];


/**
 * Sets an item in the storage with the provided key and value.
 * @param {string} key - The key under which the value will be stored.
 * @param {*} value - The value to be stored.
 */
async function setItem(key, value) {
  const payload = { key, value, token: STORAGE_TOKEN };
  return fetch(STORAGE_URL, { method: 'POST', body: JSON.stringify(payload) })
    .then(res => res.json());
}


/**
 * Retrieves an item from the storage using the provided key.
 * @param {string} key - The key of the item to retrieve.
 * @returns {Promise} A promise that resolves with the retrieved item's value if found.
 * @throws {string} Throws an error if the item with the provided key is not found.
 */
async function getItem(key) {
  const url = `${STORAGE_URL}?key=${key}&token=${STORAGE_TOKEN}`;
  return fetch(url).then(res => res.json()).then(res => {
    if (res.data) {
      return res.data.value;
    } throw `Could not find data with key "${key}".`;
  });
}