export function isAlphaNumeric(str: string) {
  return /^[a-zA-Z0-9]+$/.test(str);
}

export function camelOrPascalCaseToWords(inputString: string): string {
  // Use regular expression to find sequences of uppercase letters
  // followed by either lowercase letters or consecutive uppercase letters
  const words = inputString.match(/[A-Z]?[a-z]+|[A-Z]+(?![a-z])|\d+/g);
  // If no matches found, return the original string
  if (!words) return inputString;
  // Join the words with spaces and return
  return words.map((str) => str.toLowerCase()).join(" ");
}
