/**
 * Removes multiple forward slashes in url path
 * @param url
 */
export function cleanUrl(url: string) {
  return url.replace(/([^:])(\/\/+)/g, '$1/');
}
