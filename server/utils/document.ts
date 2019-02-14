/**
 * This helper set document into global space. There can be added other
 * properties of document, if they will be neccessary
 */

// tslint:disable-next-line:no-any
type DocumentAny = any;

// Define mock document object
const document = {
  body: { style: { position: '' } }
} as DocumentAny;

// tslint:disable-next-line:no-any
(global as any).document = document;

export default document;
