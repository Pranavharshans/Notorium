// "use client";

// import React, { useEffect } from 'react';
// import { useEditor, EditorContent } from '@tiptap/react';
// import StarterKit from '@tiptap/starter-kit';
// import Underline from '@tiptap/extension-underline';
// import '../../styles/editor.css';
// import { Bold, Italic, Underline as UnderlineIcon, List, ListOrdered, Code, Quote, Undo, Redo } from 'lucide-react';
// import { cn } from '@/lib/utils';

// interface RichTextEditorProps {
//   content: string;
//   onChange: (content: string) => void;
//   className?: string;
// }

// // Helper function to convert markdown to HTML
// const markdownToHtml = (markdown: string): string => {
//   return markdown
//     .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
//     .replace(/\*(.*?)\*/g, '<em>$1</em>')
//     .replace(/__(.*?)__/g, '<u>$1</u>')
//     .replace(/^- (.*)$/gm, '<li>$1</li>')
//     .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
//     .replace(/^(\d+)\. (.*)$/gm, '<li>$2</li>')
//     .replace(/(<li>.*<\/li>)/gs, '<ol>$1</ol>')
//     .replace(/^# (.*$)/gm, '<h1>$1</h1>')
//     .replace(/^## (.*$)/gm, '<h2>$1</h2>')
//     .replace(/^### (.*$)/gm, '<h3>$1</h3>')
//     .replace(/`(.*?)`/g, '<code>$1</code>')
//     .replace(/\n/g, '<br/>');
// };

// // Helper function to convert HTML back to markdown
// const htmlToMarkdown = (html: string): string => {
//   return html
//     .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
//     .replace(/<em>(.*?)<\/em>/g, '*$1*')
//     .replace(/<u>(.*?)<\/u>/g, '__$1__')
//     .replace(/<h1>(.*?)<\/h1>/g, '# $1')
//     .replace(/<h2>(.*?)<\/h2>/g, '## $1')
//     .replace(/<h3>(.*?)<\/h3>/g, '### $1')
//     .replace(/<code>(.*?)<\/code>/g, '`$1`')
//     .replace(/<ul>(.*?)<\/ul>/gs, (_, list) => 
//       list.replace(/<li>(.*?)<\/li>/g, '- $1\n'))
//     .replace(/<ol>(.*?)<\/ol>/gs, (_, list) => {
//       let counter = 1;
//       return list.replace(/<li>(.*?)<\/li>/g, () => 
//         `${counter++}. $1\n`);
//     })
//     .replace(/<br\/?>/g, '\n')
//     .trim();
// };

// const ToolbarButton = ({ 
//   onClick, 
//   isActive = false, 
//   disabled = false, 
//   children 
// }: { 
//   onClick: () => void; 
//   isActive?: boolean; 
//   disabled?: boolean; 
//   children: React.ReactNode;
// }) => (
//   <button
//     onClick={onClick}
//     disabled={disabled}
//     className={cn(
//       "p-2 text-gray-600 dark:text-gray-400",
//       "hover:text-gray-900 dark:hover:text-gray-100",
//       "hover:bg-gray-100 dark:hover:bg-gray-700",
//       "rounded-lg transition-colors",
//       "disabled:opacity-50",
//       isActive && "bg-gray-100 dark:bg-gray-700 text-blue-600 dark:text-blue-400"
//     )}
//   >
//     {children}
//   </button>
// );

// export function RichTextEditor({ content, onChange, className = '' }: RichTextEditorProps) {
//   const editor = useEditor({
//     extensions: [
//       StarterKit,
//       Underline,
//     ],
//     content: markdownToHtml(content),
//     editorProps: {
//       attributes: {
//         class: 'prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg xl:prose-xl m-5 focus:outline-none',
//       },
//     },
//     onUpdate: ({ editor }) => {
//       const html = editor.getHTML();
//       const markdown = htmlToMarkdown(html);
//       onChange(markdown);
//     },
//   });

//   useEffect(() => {
//     if (editor && content !== htmlToMarkdown(editor.getHTML())) {
//       editor.commands.setContent(markdownToHtml(content));
//     }
//   }, [content, editor]);

//   if (!editor) {
//     return null;
//   }

//   return (
//     <div className={`border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 ${className}`}>
//       <div className="p-2 flex flex-wrap gap-1 border-b border-gray-200 dark:border-gray-700">
//         <ToolbarButton
//           onClick={() => editor.chain().focus().toggleBold().run()}
//           isActive={editor.isActive('bold')}
//         >
//           <Bold size={18} />
//         </ToolbarButton>

//         <ToolbarButton
//           onClick={() => editor.chain().focus().toggleItalic().run()}
//           isActive={editor.isActive('italic')}
//         >
//           <Italic size={18} />
//         </ToolbarButton>

//         <ToolbarButton
//           onClick={() => editor.chain().focus().toggleUnderline().run()}
//           isActive={editor.isActive('underline')}
//         >
//           <UnderlineIcon size={18} />
//         </ToolbarButton>

//         <div className="w-px h-6 mx-2 bg-gray-200 dark:bg-gray-700" />

//         <ToolbarButton
//           onClick={() => editor.chain().focus().toggleBulletList().run()}
//           isActive={editor.isActive('bulletList')}
//         >
//           <List size={18} />
//         </ToolbarButton>

//         <ToolbarButton
//           onClick={() => editor.chain().focus().toggleOrderedList().run()}
//           isActive={editor.isActive('orderedList')}
//         >
//           <ListOrdered size={18} />
//         </ToolbarButton>

//         <div className="w-px h-6 mx-2 bg-gray-200 dark:bg-gray-700" />

//         <ToolbarButton
//           onClick={() => editor.chain().focus().toggleCodeBlock().run()}
//           isActive={editor.isActive('codeBlock')}
//         >
//           <Code size={18} />
//         </ToolbarButton>

//         <ToolbarButton
//           onClick={() => editor.chain().focus().toggleBlockquote().run()}
//           isActive={editor.isActive('blockquote')}
//         >
//           <Quote size={18} />
//         </ToolbarButton>

//         <div className="w-px h-6 mx-2 bg-gray-200 dark:bg-gray-700" />

//         <ToolbarButton
//           onClick={() => editor.chain().focus().undo().run()}
//           disabled={!editor.can().undo()}
//         >
//           <Undo size={18} />
//         </ToolbarButton>

//         <ToolbarButton
//           onClick={() => editor.chain().focus().redo().run()}
//           disabled={!editor.can().redo()}
//         >
//           <Redo size={18} />
//         </ToolbarButton>
//       </div>

//       <div className="border-t border-gray-200 dark:border-gray-700">
//         <EditorContent editor={editor} />
//       </div>
//     </div>
//   );
// }