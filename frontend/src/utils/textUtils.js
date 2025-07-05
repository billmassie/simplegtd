// Function to convert URLs in text to clickable links
export function linkifyText(text) {
    if (!text) return text;
    
    // Markdown-style link pattern: [text](url)
    const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    
    // URL regex pattern - matches http/https URLs
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    
    // First, handle markdown-style links and replace them with placeholders
    let result = text.replace(markdownLinkRegex, (match, linkText, url) => {
        return `<markdown-link>${linkText}|${url}</markdown-link>`;
    });
    
    // Then handle plain URLs, but only if they're not already inside markdown link placeholders
    result = result.replace(urlRegex, (url) => {
        // Check if this URL is inside a markdown link placeholder
        const urlIndex = result.indexOf(url);
        const beforeUrl = result.substring(0, urlIndex);
        const afterUrl = result.substring(urlIndex + url.length);
        
        // Count unclosed markdown link tags before this URL
        const openTagsBefore = (beforeUrl.match(/<markdown-link>/g) || []).length;
        const closeTagsBefore = (beforeUrl.match(/<\/markdown-link>/g) || []).length;
        
        // If we're inside a markdown link (more open tags than close tags), don't process this URL
        if (openTagsBefore > closeTagsBefore) {
            return url; // Leave it as is
        }
        
        // This is a standalone URL, wrap it
        return `<plain-link>${url}</plain-link>`;
    });
    
    return result;
}

// Function to parse text and return an array of text and link objects
export function parseTextWithLinks(text) {
    if (!text) return [];
    
    const result = [];
    let currentIndex = 0;
    
    // Find markdown links
    const markdownLinkRegex = /<markdown-link>([^|]+)\|([^<]+)<\/markdown-link>/g;
    let markdownMatch;
    
    while ((markdownMatch = markdownLinkRegex.exec(text)) !== null) {
        // Add text before the link
        if (markdownMatch.index > currentIndex) {
            result.push({
                type: 'text',
                content: text.slice(currentIndex, markdownMatch.index)
            });
        }
        
        // Add the link
        result.push({
            type: 'link',
            text: markdownMatch[1],
            url: markdownMatch[2]
        });
        
        currentIndex = markdownMatch.index + markdownMatch[0].length;
    }
    
    // Find plain links
    const plainLinkRegex = /<plain-link>([^<]+)<\/plain-link>/g;
    let plainMatch;
    
    while ((plainMatch = plainLinkRegex.exec(text)) !== null) {
        // Add text before the link
        if (plainMatch.index > currentIndex) {
            result.push({
                type: 'text',
                content: text.slice(currentIndex, plainMatch.index)
            });
        }
        
        // Add the link
        result.push({
            type: 'link',
            text: plainMatch[1],
            url: plainMatch[1]
        });
        
        currentIndex = plainMatch.index + plainMatch[0].length;
    }
    
    // Add remaining text
    if (currentIndex < text.length) {
        result.push({
            type: 'text',
            content: text.slice(currentIndex)
        });
    }
    
    return result;
}

// Function to preserve line breaks and convert URLs
export function formatTextWithLinks(text) {
    if (!text) return text;
    
    // Split by line breaks first
    const lines = text.split('\n');
    
    return lines.map((line, lineIndex) => {
        const processedLine = linkifyText(line);
        const parsedElements = parseTextWithLinks(processedLine);
        
        return {
            lineIndex,
            elements: parsedElements,
            hasNextLine: lineIndex < lines.length - 1
        };
    });
} 