import { formatTextWithLinks } from '../utils/textUtils';

function FormattedText({ text }) {
    if (!text) return null;
    
    const formattedLines = formatTextWithLinks(text);
    
    return (
        <>
            {formattedLines.map((line) => (
                <span key={line.lineIndex}>
                    {line.elements.map((element, elementIndex) => {
                        if (element.type === 'text') {
                            return element.content;
                        } else if (element.type === 'link') {
                            return (
                                <a 
                                    key={`${line.lineIndex}-${elementIndex}`}
                                    href={element.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-link"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {element.text}
                                </a>
                            );
                        }
                        return null;
                    })}
                    {line.hasNextLine && <br />}
                </span>
            ))}
        </>
    );
}

export default FormattedText; 