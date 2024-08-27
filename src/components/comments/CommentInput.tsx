import { PostData } from "@/lib/types";
import { useState } from "react";
import { useSubmitCommentMutation } from "./mutations";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Loader2, SendHorizonal } from "lucide-react";
import { EditorContent, ReactRenderer, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Mention from "@tiptap/extension-mention";
import { MentionList } from "../MentionList";
import { cn } from "@/lib/utils";

interface CommentInputProps {
  post: PostData;
}

const CommentInput = ({ post }: CommentInputProps) => {
  // const [input, setInput] = useState("");

  const { mutate, isPending } = useSubmitCommentMutation(post.id);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bold: false,
        italic: false,
      }),
      Placeholder.configure({
        placeholder: "What's on your mind?",
      }),
      Mention.configure({
        HTMLAttributes: {
          class: "mention",
        },
        suggestion: {
          char: "@",
          render: () => {
            let reactRenderer: ReactRenderer;

            return {
              onStart: (props) => {
                reactRenderer = new ReactRenderer(MentionList, {
                  props,
                  editor: props.editor,
                });
              },

              onUpdate(props) {
                reactRenderer?.updateProps(props);
              },

              onKeyDown(props) {
                if (props.event.key === "Escape") {
                  reactRenderer?.destroy();
                  return true;
                }

                return (reactRenderer?.ref as any)?.onKeyDown(props);
              },

              onExit() {
                reactRenderer.destroy();
              },
            };
          },
        },
      }),
    ],
  });

  const input =
    editor?.getText({
      blockSeparator: "\n",
    }) || "";

  // if (!input) return;
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    mutate(
      {
        content: input,
        post,
      },
      {
        onSuccess: () => {
          editor?.commands.clearContent();
        },
      }
    );
  };

  return (
    <form className="flex w-full items-center gap-2" onSubmit={onSubmit}>
      {/* <Input
        placeholder="Write a comment..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        autoFocus
      /> */}
      <EditorContent
        editor={editor}
        className={cn(
          "flex max-h-[20rem] h-10 overflow-y-auto w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        )}
      />
      <Button
        type="submit"
        variant="ghost"
        size="icon"
        disabled={!input.trim() || isPending}
      >
        {!isPending ? <SendHorizonal /> : <Loader2 className="animate-spin" />}
      </Button>
    </form>
  );
};

export default CommentInput;
