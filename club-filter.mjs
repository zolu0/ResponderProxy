const bigSixPatterns = [
  /\bchelsea\b/i,
  /\b(?:manchester city|man city)\b/i,
  /\b(?:manchester united|man united|man utd)\b/i,
  /\barsenal\b/i,
  /\btottenham\b/i,
  /\bliverpool\b/i,
];

export function isBigSixNews(text) {
  return (
    typeof text === 'string' &&
    bigSixPatterns.some((pattern) => pattern.test(text))
  );
}
