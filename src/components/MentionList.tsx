import useDebounce from "@/hooks/useDebounce";
import { useQuery } from "@tanstack/react-query";
import { SuggestionKeyDownProps, SuggestionProps } from "@tiptap/suggestion";
import { forwardRef, useImperativeHandle, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { getMentionUsers } from "./posts/editor/actions";
import { MentionItem } from "./MentionItem";
import { usePopper } from "react-popper";
import { VirtualElement } from "@popperjs/core";
import UserAvatar from "./UserAvatar";

interface MentionListProps extends SuggestionProps {
  clientRect: (() => DOMRect | null) | null;
}

interface MentionListActions {
  onKeyDown: (props: SuggestionKeyDownProps) => void;
}

export const MentionList = forwardRef<MentionListActions, MentionListProps>(
  ({ clientRect, command, query }, ref) => {
    // Create a virtual element with a getBoundingClientRect method
    const referenceEl = useMemo(() => {
      if (clientRect) {
        return {
          getBoundingClientRect: () => clientRect() as ClientRect,
        } as VirtualElement;
      }
      return null;
    }, [clientRect]);

    // const [referenceEl, setReferenceEl] = useState<HTMLElement | null>(null);

    const debouncedQuery = useDebounce(query, 200);
    const [hoverIndex, setHoverIndex] = useState(0);
    const [popperEl, setPopperEl] = useState<HTMLDivElement | null>(null);
    const { styles, attributes } = usePopper(referenceEl, popperEl, {
      placement: "bottom-start",
    });

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }) => {
        const { key } = event;

        if (key === "ArrowUp") {
          setHoverIndex((prev) => {
            const beforeIndex = prev - 1;
            return beforeIndex >= 0 ? beforeIndex : 0;
          });
          return true;
        }

        if (key === "ArrowDown") {
          setHoverIndex((prev) => {
            const afterIndex = prev + 1;
            const peopleCount =
              users && users.length > 0 ? users.length - 1 : 0;
            return afterIndex < peopleCount ? afterIndex : peopleCount;
          });
          return true;
        }

        if (key === "Enter") {
          handleCommand(hoverIndex);
          return true;
        }

        return false;
      },
    }));

    const { data: users, isSuccess } = useQuery({
      queryKey: ["post-mention-users", debouncedQuery],
      queryFn: async () => getMentionUsers(debouncedQuery),
    });

    if (!users) return null;

    const handleCommand = (index: number) => {
      const selectedPerson = users[index];
      command({ id: selectedPerson.id, label: selectedPerson.displayName });
    };

    return createPortal(
      <div
        ref={setPopperEl}
        style={styles.popper}
        {...attributes.popper}
        className="max-h-[40vh] min-w-32 w-fit rounded-md bg-card shadow-md overflow-auto"
      >
        {isSuccess && users.length > 0 ? (
          users.map((user, index) => (
            <MentionItem
              key={user.id}
              isActive={index === hoverIndex}
              onMouseEnter={() => setHoverIndex(index)}
              onClick={() => handleCommand(index)}
              className="flex items-center gap-2"
            >
              <UserAvatar avatarUrl={user.avatarUrl} size={40} />
              {user.displayName}
            </MentionItem>
          ))
        ) : (
          <div className="p-2 text-gray-500">No results</div>
        )}
      </div>,
      document.body
    );
  }
);

// Add displayName for better debugging
MentionList.displayName = "MentionList";
