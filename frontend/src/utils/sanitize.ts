/**
 * Strips standard unicode emojis from input text to maintain clean AwtarProp UI.
 */
export function stripEmojis(input: string): string {
  if (!input) return "";
  return input.replace(
    /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g,
    "",
  );
}
