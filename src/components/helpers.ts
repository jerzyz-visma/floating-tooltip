export function on(
  element: Element,
  event: string,
  handler: EventListenerOrEventListenerObject,
  options: any = false
) {
  if (element && event && handler) {
    element.addEventListener(event, handler, options);
  }
}

export function generateId(): string {
  return Math.floor((1 + Math.random()) * 0x10000)
    .toString(16)
    .substring(1);
}
