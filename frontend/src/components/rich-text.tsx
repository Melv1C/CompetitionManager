import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import { cn } from '@/lib/utils';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
  Bold,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  List,
  ListOrdered,
  Quote,
  Redo,
  Strikethrough,
  Undo,
} from 'lucide-react';
import sanitizeHtml from 'sanitize-html';

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
    extensions: [StarterKit],
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
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="relative border border-input rounded-md bg-background shadow-xs">
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
      </div>
      <EditorContent editor={editor} />
      {editor.isEmpty && (
        <div className="pointer-events-none absolute top-16 left-4 text-muted-foreground">
          {placeholder}
        </div>
      )}
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
