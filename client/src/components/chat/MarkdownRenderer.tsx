import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return (
    <div className="text-[15px] leading-relaxed break-words space-y-3 font-normal">
      {parseMarkdownToElements(content)}
    </div>
  );
};

interface CodeBlockProps {
  language: string;
  code: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ language, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative my-3 rounded-xl overflow-hidden border border-gray-700/60 bg-[#12161F] text-gray-200 shadow-md">
      <div className="flex items-center justify-between px-4 py-2 bg-[#1A202C] border-b border-gray-700/50 text-xs font-mono text-gray-400">
        <span className="uppercase tracking-wider font-semibold text-brand-400">
          {language || 'code'}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-800/80 hover:bg-gray-700 text-gray-300 hover:text-white transition-all text-xs"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy code</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm leading-6 font-mono text-emerald-300/90 selection:bg-brand-500 selection:text-white">
        <code>{code}</code>
      </pre>
    </div>
  );
};

function parseMarkdownToElements(rawText: string): React.ReactNode[] {
  if (!rawText) return [];

  // Split on code fences ```lang\n...```
  const parts = rawText.split(/(```[\s\S]*?```)/g);

  return parts.map((part, index) => {
    if (part.startsWith('```') && part.endsWith('```')) {
      const match = part.match(/^```([a-zA-Z0-9_-]*)\n?([\s\S]*?)```$/);
      const language = match ? match[1] || 'code' : 'code';
      const code = match ? match[2].trimEnd() : part.slice(3, -3);
      return <CodeBlock key={index} language={language} code={code} />;
    }

    return <TextBlock key={index} text={part} />;
  });
}

const TextBlock: React.FC<{ text: string }> = ({ text }) => {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let listItems: string[] = [];
  let isOrderedList = false;

  const flushList = (key: string) => {
    if (listItems.length > 0) {
      if (isOrderedList) {
        elements.push(
          <ol key={key} className="list-decimal pl-6 space-y-1.5 my-2">
            {listItems.map((li, i) => (
              <li key={i}>{formatInline(li)}</li>
            ))}
          </ol>
        );
      } else {
        elements.push(
          <ul key={key} className="list-disc pl-6 space-y-1.5 my-2">
            {listItems.map((li, i) => (
              <li key={i}>{formatInline(li)}</li>
            ))}
          </ul>
        );
      }
      listItems = [];
    }
  };

  lines.forEach((line, i) => {
    const trimmed = line.trim();

    // Headers
    if (trimmed.startsWith('### ')) {
      flushList(`flush-${i}`);
      elements.push(
        <h3 key={i} className="text-lg font-bold text-gray-900 dark:text-white mt-4 mb-2">
          {formatInline(trimmed.replace('### ', ''))}
        </h3>
      );
      return;
    }
    if (trimmed.startsWith('## ')) {
      flushList(`flush-${i}`);
      elements.push(
        <h2 key={i} className="text-xl font-bold text-gray-900 dark:text-white mt-5 mb-2.5">
          {formatInline(trimmed.replace('## ', ''))}
        </h2>
      );
      return;
    }
    if (trimmed.startsWith('# ')) {
      flushList(`flush-${i}`);
      elements.push(
        <h1 key={i} className="text-2xl font-extrabold text-gray-900 dark:text-white mt-6 mb-3">
          {formatInline(trimmed.replace('# ', ''))}
        </h1>
      );
      return;
    }

    // Blockquote
    if (trimmed.startsWith('> ')) {
      flushList(`flush-${i}`);
      elements.push(
        <blockquote
          key={i}
          className="border-l-4 border-brand-500 pl-4 py-1 italic my-2 bg-brand-50/50 dark:bg-brand-950/20 rounded-r-md text-gray-700 dark:text-gray-300"
        >
          {formatInline(trimmed.replace('> ', ''))}
        </blockquote>
      );
      return;
    }

    // Unordered list
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      isOrderedList = false;
      listItems.push(trimmed.slice(2));
      return;
    }

    // Ordered list
    const orderedMatch = trimmed.match(/^\d+\.\s+(.*)$/);
    if (orderedMatch) {
      isOrderedList = true;
      listItems.push(orderedMatch[1]);
      return;
    }

    // Normal paragraph or break
    flushList(`flush-${i}`);
    if (trimmed === '') {
      elements.push(<div key={i} className="h-2" />);
    } else {
      elements.push(
        <p key={i} className="leading-relaxed">
          {formatInline(line)}
        </p>
      );
    }
  });

  flushList('final-flush');
  return <>{elements}</>;
};

function formatInline(str: string): React.ReactNode {
  // Regex splitting for bold (**text**), inline code (`code`), italic (*text*)
  const tokens = str.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g);

  return tokens.map((token, idx) => {
    if (token.startsWith('`') && token.endsWith('`')) {
      return (
        <code
          key={idx}
          className="px-1.5 py-0.5 mx-0.5 rounded bg-gray-200 dark:bg-gray-800 text-brand-600 dark:text-brand-300 font-mono text-[0.88em]"
        >
          {token.slice(1, -1)}
        </code>
      );
    }
    if (token.startsWith('**') && token.endsWith('**')) {
      return <strong key={idx} className="font-semibold text-gray-900 dark:text-white">{token.slice(2, -2)}</strong>;
    }
    if (token.startsWith('*') && token.endsWith('*')) {
      return <em key={idx} className="italic">{token.slice(1, -1)}</em>;
    }
    return token;
  });
}
