import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function MarkdownText({ text }) {
    if (!text) return null;

    return (
        <div className="markdown-content">
            <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                    // Customize link rendering to open in new tab
                    a: ({ node, ...props }) => (
                        <a 
                            {...props} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="markdown-link"
                        />
                    ),
                    // Customize code blocks
                    code: ({ node, inline, ...props }) => (
                        inline ? 
                        <code {...props} className="markdown-inline-code" /> :
                        <code {...props} className="markdown-code-block" />
                    ),
                    // Customize headings
                    h1: ({ node, ...props }) => <h1 {...props} className="markdown-h1" />,
                    h2: ({ node, ...props }) => <h2 {...props} className="markdown-h2" />,
                    h3: ({ node, ...props }) => <h3 {...props} className="markdown-h3" />,
                    h4: ({ node, ...props }) => <h4 {...props} className="markdown-h4" />,
                    h5: ({ node, ...props }) => <h5 {...props} className="markdown-h5" />,
                    h6: ({ node, ...props }) => <h6 {...props} className="markdown-h6" />,
                }}
            >
                {text}
            </ReactMarkdown>

            <style>{`
                .markdown-content {
                    line-height: 1.6;
                }
                .markdown-content h1 {
                    font-size: 1.8em;
                    margin: 0.5em 0 0.3em 0;
                    color: #333;
                    border-bottom: 2px solid #eee;
                    padding-bottom: 0.2em;
                }
                .markdown-content h2 {
                    font-size: 1.5em;
                    margin: 0.4em 0 0.2em 0;
                    color: #444;
                    border-bottom: 1px solid #eee;
                    padding-bottom: 0.1em;
                }
                .markdown-content h3 {
                    font-size: 1.3em;
                    margin: 0.3em 0 0.1em 0;
                    color: #555;
                }
                .markdown-content h4 {
                    font-size: 1.1em;
                    margin: 0.2em 0 0.1em 0;
                    color: #666;
                }
                .markdown-content h5 {
                    font-size: 1em;
                    margin: 0.2em 0 0.1em 0;
                    color: #777;
                }
                .markdown-content h6 {
                    font-size: 0.9em;
                    margin: 0.2em 0 0.1em 0;
                    color: #888;
                }
                .markdown-content p {
                    margin: 0.5em 0;
                }
                .markdown-content ul, .markdown-content ol {
                    margin: 0.5em 0;
                    padding-left: 1.5em;
                }
                .markdown-content li {
                    margin: 0.2em 0;
                }
                .markdown-content blockquote {
                    margin: 0.5em 0;
                    padding: 0.5em 1em;
                    border-left: 4px solid #007bff;
                    background-color: #f8f9fa;
                    color: #666;
                }
                .markdown-content .markdown-inline-code {
                    background-color: #f1f3f4;
                    padding: 0.1em 0.3em;
                    border-radius: 3px;
                    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
                    font-size: 0.9em;
                }
                .markdown-content .markdown-code-block {
                    display: block;
                    background-color: #f8f9fa;
                    padding: 1em;
                    border-radius: 4px;
                    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
                    font-size: 0.9em;
                    overflow-x: auto;
                    border: 1px solid #e9ecef;
                }
                .markdown-content table {
                    border-collapse: collapse;
                    width: 100%;
                    margin: 0.5em 0;
                }
                .markdown-content th, .markdown-content td {
                    border: 1px solid #ddd;
                    padding: 0.5em;
                    text-align: left;
                }
                .markdown-content th {
                    background-color: #f8f9fa;
                    font-weight: bold;
                }
                .markdown-content tr:nth-child(even) {
                    background-color: #f9f9f9;
                }
                .markdown-content .markdown-link {
                    color: #007bff;
                    text-decoration: underline;
                }
                .markdown-content .markdown-link:hover {
                    color: #0056b3;
                    text-decoration: none;
                }
                .markdown-content hr {
                    border: none;
                    border-top: 1px solid #eee;
                    margin: 1em 0;
                }
                .markdown-content strong {
                    font-weight: bold;
                }
                .markdown-content em {
                    font-style: italic;
                }
                .markdown-content del {
                    text-decoration: line-through;
                }
            `}</style>
        </div>
    );
}

export default MarkdownText; 