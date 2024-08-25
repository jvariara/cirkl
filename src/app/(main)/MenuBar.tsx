import { Button } from "@/components/ui/button";
import { Bookmark, Home, Mail } from "lucide-react";
import Link from "next/link";
import NotificationsButton from "./NotificationsButton";
import { validateRequest } from "@/auth";
import prisma from "@/lib/db";
import MessagesButton from "./MessagesButton";
import streamServerClient from "@/lib/stream";

interface MenuBarProps {
  className?: string;
}

const MenuBar = async ({ className }: MenuBarProps) => {
  const { user } = await validateRequest();

  if (!user) return null;

  const [unreadNotificationCount, unreadMessagesCount] = await Promise.all([
    prisma.notification.count({
      where: {
        recipientId: user.id,
        read: false,
      },
    }),
    (await streamServerClient.getUnreadCount(user.id)).total_unread_count,
  ]);

  return (
    <div className={className}>
      <Button
        variant="ghost"
        className="flex items-center justify-start gap-3"
        title="Home"
        asChild
      >
        <Link href="/">
          <Home />
          <span className="hidden lg:inline">Home</span>
        </Link>
      </Button>

      <NotificationsButton
        initialState={{ unreadCount: unreadNotificationCount }}
      />

      <MessagesButton initialState={{ unreadCount: unreadMessagesCount }} />

      <Button
        variant="ghost"
        className="flex items-center justify-start gap-3"
        title="Bookmarks"
        asChild
      >
        <Link href="/bookmarks">
          <Bookmark />
          <span className="hidden lg:inline">Bookmarks</span>
        </Link>
      </Button>
    </div>
  );
};

export default MenuBar;
