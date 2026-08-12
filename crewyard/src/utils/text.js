export function stripMarkdownForPreview(text) {
  if (!text) return "";

  let result = text;

  // Replace fenced code blocks with [code]
  result = result.replace(/```[\s\S]*?```/g, " [code] ");

  // Remove inline code spans entirely or just backticks? 
  // We'll strip the backticks to keep the text readable, or replace with nothing if preferred.
  // "Removes backtick code spans and fenced code blocks entirely" 
  // Let's strip the backticks, leaving inner text.
  result = result.replace(/`([^`]+)`/g, "$1");

  // Remove bold/italic markers, leaving inner text
  // Bold: **text** or __text__
  result = result.replace(/(\*\*|__)(.*?)\1/g, "$2");
  // Italic: *text* or _text_
  result = result.replace(/(\*|_)(.*?)\1/g, "$2");

  // Collapse whitespace/newlines into single spaces
  result = result.replace(/\s+/g, " ").trim();

  return result;
}
