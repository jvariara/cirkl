"use client";
import FollowButton from "@/components/FollowButton";
import UserAvatar from "@/components/UserAvatar";
import { NotificationData } from "@/lib/types";
import { cn } from "@/lib/utils";
import { NotificationType } from "@prisma/client";
import { AtSign, Heart, MessageCircle, User2 } from "lucide-react";
import Link from "next/link";
import { useSession } from "../SessionProvider";

interface NotificationProps {
  notification: NotificationData;
}

const Notification = ({ notification }: NotificationProps) => {
  const { user: loggedInUser } = useSession();

  const notificationTypeMap: Record<
    NotificationType,
    { message: string; icon: JSX.Element; href: string }
  > = {
    FOLLOW: {
      message: `${notification.issuer.displayName} followed you`,
      icon: <User2 className="size-7 text-primary" />,
      href: `/users/${notification.issuer.username}`,
    },
    COMMENT: {
      message: `${notification.issuer.displayName} commented on your post`,
      icon: <MessageCircle className="size-7 text-primary" />,
      href: `/posts/${notification.postId}`,
    },
    LIKE: {
      message: `${notification.issuer.displayName} liked your post`,
      icon: <Heart className="size-7 text-red-500 fill-red-500" />,
      href: `/posts/${notification.postId}`,
    },
    MENTION: {
      message: `${notification.issuer.displayName} mentioned you in a post`,
      icon: <AtSign className="size-7 text-primary" />,
      href: `/posts/${notification.postId}`,
    },
  };

  const { message, icon, href } = notificationTypeMap[notification.type];

  return (
    <article
      className={cn(
        "flex gap-3 rounded-2xl bg-card p-5 shadow-sm transition-colors hover:bg-card/70 w-full",
        !notification.read && "bg-primary/10"
      )}
    >
      <div className="my-1">{icon}</div>
      <div className="flex justify-between w-full items-center gap-x-4">
        <Link href={href} className="block w-full">
          <div className="space-y-3">
            <UserAvatar avatarUrl={notification.issuer.avatarUrl} size={36} />
            <div>
              <span className="font-bold">@{notification.issuer.username}</span>{" "}
              <span>{message}</span>
            </div>
            {notification.post && (
              <div className="line-clamp-3 whitespace-pre-line text-muted-foreground text-ellipsis">
                {notification.post.content}
              </div>
            )}
          </div>
        </Link>
        {notification.type === "FOLLOW" && (
          <FollowButton
            initialState={{
              followers: notification.issuer._count.followers,
              isFollowedByUser: !!notification.issuer.followers.some(
                (user) => user.followerId === loggedInUser?.id
              ),
            }}
            userId={notification.issuerId}
          />
        )}
      </div>
    </article>
  );
};

export default Notification;
