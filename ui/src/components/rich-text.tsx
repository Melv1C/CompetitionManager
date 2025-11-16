/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { cn } from '@/lib/utils';
import Link from '@tiptap/extension-link';
import { EditorContent, useEditor, useEditorState } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
  Bold,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
  Redo,
  Strikethrough,
  Undo,
  Unlink,
} from 'lucide-react';
import { useCallback } from 'react';
import sanitizeHtml from 'sanitize-html';
import { Button } from './shadcn/button';
import { ButtonGroup } from './shadcn/button-group';

const CLASSNAMES = 'rich-text prose prose-sm max-w-none focus:outline-none min-h-[100px] p-4';

interface RichTextEditorProps {
  content?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
}

export const RichTextEditor = ({
  content,
  onChange,
  placeholder = 'Start typing...',
}: RichTextEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      if (editor.isEmpty) return onChange?.('');
      onChange?.(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: CLASSNAMES,
      },
    },
    immediatelyRender: false, // Prevent SSR issues
    injectCSS: false, // We'll handle styling via Tailwind
  });

  const setLink = useCallback(() => {
    const previousUrl = editor?.getAttributes('link').href;
    const url = window.prompt('Enter the URL', previousUrl);
    // cancelled
    if (url === null) {
      return;
    }
    // empty
    if (url === '') {
      editor?.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    // update link
    try {
      editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    } catch (e) {
      if (e instanceof Error) {
        alert(e.message);
      } else {
        alert('An unknown error occurred.');
      }
    }
  }, [editor]);

  const unsetLink = useCallback(() => {
    editor?.chain().focus().unsetLink().run();
  }, [editor]);

  const editorState = useEditorState({
    editor,
    selector: ctx => ({
      isLink: ctx.editor ? ctx.editor.isActive('link') : false,
    }),
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="border border-input rounded-md bg-background shadow-xs">
      <div className="border-b border-input p-2 flex gap-2 flex-wrap">
        <ButtonGroup>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Undo"
          >
            <Undo />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Redo"
          >
            <Redo />
          </Button>
        </ButtonGroup>
        <ButtonGroup>
          <Button
            type="button"
            variant={editor.isActive('bold') ? 'default' : 'outline'}
            size="icon-sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            title="Bold"
          >
            <Bold />
          </Button>
          <Button
            type="button"
            variant={editor.isActive('italic') ? 'default' : 'outline'}
            size="icon-sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            title="Italic"
          >
            <Italic />
          </Button>
          <Button
            type="button"
            variant={editor.isActive('strike') ? 'default' : 'outline'}
            size="icon-sm"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            title="Strikethrough"
          >
            <Strikethrough />
          </Button>
          <Button
            type="button"
            variant={editor.isActive('code') ? 'default' : 'outline'}
            size="icon-sm"
            onClick={() => editor.chain().focus().toggleCode().run()}
            title="Code"
          >
            <Code />
          </Button>
        </ButtonGroup>
        <ButtonGroup>
          <Button
            type="button"
            variant={editor.isActive('heading', { level: 1 }) ? 'default' : 'outline'}
            size="icon-sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            title="Heading 1"
          >
            <Heading1 />
          </Button>
          <Button
            type="button"
            variant={editor.isActive('heading', { level: 2 }) ? 'default' : 'outline'}
            size="icon-sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            title="Heading 2"
          >
            <Heading2 />
          </Button>
          <Button
            type="button"
            variant={editor.isActive('heading', { level: 3 }) ? 'default' : 'outline'}
            size="icon-sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            title="Heading 3"
          >
            <Heading3 />
          </Button>
        </ButtonGroup>
        <ButtonGroup>
          <Button
            type="button"
            variant={editor.isActive('bulletList') ? 'default' : 'outline'}
            size="icon-sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            title="Bullet List"
          >
            <List />
          </Button>
          <Button
            type="button"
            variant={editor.isActive('orderedList') ? 'default' : 'outline'}
            size="icon-sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            title="Ordered List"
          >
            <ListOrdered />
          </Button>
          <Button
            type="button"
            variant={editor.isActive('blockquote') ? 'default' : 'outline'}
            size="icon-sm"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            title="Blockquote"
          >
            <Quote />
          </Button>
        </ButtonGroup>
        <ButtonGroup>
          <Button
            type="button"
            variant={editorState?.isLink ? 'default' : 'outline'}
            size="icon-sm"
            onClick={setLink}
            title="Add or Edit Link"
          >
            <LinkIcon />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={unsetLink}
            disabled={!editorState?.isLink}
            title="Remove Link"
          >
            <Unlink />
          </Button>
        </ButtonGroup>
      </div>
      <div className="relative">
        <EditorContent editor={editor} />
        {editor.isEmpty && (
          <div className="pointer-events-none absolute top-4 left-4 text-muted-foreground">
            {placeholder}
          </div>
        )}
      </div>
    </div>
  );
};

export const RichTextViewer = ({ content }: { content: string }) => {
  return (
    <div className={cn(`${CLASSNAMES} border border-input rounded-md shadow-xs`)}>
      <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }} />
    </div>
  );
};

export const BasicRichTextViewer = ({ content }: { content: string }) => {
  return (
    <div
      className={cn(`rich-text focus:outline-none`)}
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }}
    />
  );
};
