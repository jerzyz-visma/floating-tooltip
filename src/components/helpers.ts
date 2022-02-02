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
