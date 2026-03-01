import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';
import './MarkdownView.css';

interface MarkdownViewProps {
    content: string;
}

export default function MarkdownView({ content }: MarkdownViewProps) {
    return (
        <div className="markdown-view">
            <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                {content}
            </Markdown>
        </div>
    );
}
