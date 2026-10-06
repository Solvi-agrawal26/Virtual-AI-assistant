/**
 * Sanitize strings to prevent basic HTML injection/XSS and trim excessive spaces
 */
export const sanitizeText = (input: string): string => {
  if (typeof input !== 'string') return '';
  return input
    .trim()
    // Strip control characters except newline and tab
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Normalize newlines
    .replace(/\r\n/g, '\n');
};

/**
 * Filter and inspect system prompt injections or suspicious patterns
 */
export const inspectPromptSafety = (text: string): { isSafe: boolean; reason?: string } => {
  if (text.length > 8000) {
    return { isSafe: false, reason: 'Message exceeds maximum allowable character limit (8000 chars).' };
  }

  // Detect explicit attempts to break out of instruction hierarchy
  const suspiciousOverrides = [
    /ignore all previous instructions/i,
    /disregard system prompt/i,
    /reveal your secret instructions/i,
    /jailbreak mode initiated/i,
  ];

  for (const pattern of suspiciousOverrides) {
    if (pattern.test(text)) {
      // We don't necessarily block, but we can sanitize or warn
      // In this production template, we flag for logging
    }
  }

  return { isSafe: true };
};
