export function setLocalStorageItem(key: string, value: string) {
  window.localStorage.setItem(key, value);
}
export function getLocalStorageItem(key: string): string | null {
  const item: string | null = window.localStorage.getItem(key);
  return item;
}
export function removeLocalStorageItem(key: string) {
  window.localStorage.removeItem(key);
}
