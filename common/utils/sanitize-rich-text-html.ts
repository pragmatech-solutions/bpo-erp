const ALLOWED_TAGS = new Set([
	'p',
	'div',
	'br',
	'strong',
	'b',
	'em',
	'i',
	'u',
	'h2',
	'h3',
	'h4',
	'ul',
	'ol',
	'li',
]);

const HTML_TAG_PATTERN = /<\/?([a-z][a-z0-9]*)(?:\s[^<>]*)?>/gi;

export function sanitizeRichTextHtml(value: string) {
	return value
		.replace(/<!--[\s\S]*?-->/g, '')
		.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
		.replace(HTML_TAG_PATTERN, (tag, tagName: string) => {
			const normalizedTagName = tagName.toLowerCase();
			if (!ALLOWED_TAGS.has(normalizedTagName)) return '';

			return tag.startsWith('</')
				? `</${normalizedTagName}>`
				: `<${normalizedTagName}>`;
		})
		.trim();
}

export function hasRichTextContent(value: string) {
	return (
		sanitizeRichTextHtml(value)
			.replace(/<[^>]*>/g, '')
			.replace(/&nbsp;/gi, ' ')
			.trim().length > 0
	);
}
