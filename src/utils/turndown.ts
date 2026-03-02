import TurndownService from 'turndown';

/**
 * Shared TurndownService instance for converting HTML to Markdown.
 * Used for quote selection functionality.
 */
export const turndownService = new TurndownService({
  headingStyle: 'atx',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced',
});

// Remove citation superscripts from converted markdown
turndownService.addRule('citations', {
  filter: (node) => {
    return node.nodeName === 'SUP' && node.querySelector('a.citation-link') !== null;
  },
  replacement: () => '',
});
