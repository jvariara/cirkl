"use client";

import InfiniteScrollContainer from "@/components/InfiniteScrollContainer";
import Post from "@/components/posts/Post";
import PostsLoadingSkeleton from "@/components/posts/PostsLoadingSkeleton";
import kyInstance from "@/lib/ky";
import { NotificationsPage, PostsPage } from "@/lib/types";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import Notification from "./Notification";
import { useEffect } from "react";

const Notifications = () => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    error,
    isPending,
    isSuccess,
  } = useInfiniteQuery({
    queryKey: ["notifications"],
    queryFn: ({ pageParam }) =>
      kyInstance
        .get(
          "/api/notifications",
          pageParam ? { searchParams: { cursor: pageParam } } : {}
        )
        .json<NotificationsPage>(),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  //   mark all notifications as read
  const queryClient = useQueryClient();
  const { mutate: markNotificationsAsUnread } = useMutation({
    mutationFn: () => kyInstance.patch("/api/notifications/mark-as-read"),
    onSuccess: () => {
      queryClient.setQueryData(["unread-notification-count"], {
        unreadCount: 0,
      });
    },
    onError(error) {
      console.error("Failed to mark notifications as read", error);
    },
  });

  useEffect(() => {
    markNotificationsAsUnread();
  }, [markNotificationsAsUnread]);

  const notifications = data?.pages.flatMap((page) => page.notifications) || [];

  // first page is loading
  if (isPending) {
    return <PostsLoadingSkeleton />;
  }

  // no posts
  if (isSuccess && !notifications.length && !hasNextPage) {
    return (
      <p className="text-center text-muted-foreground">
        You don&apos;t have any notifications yet.
      </p>
    );
  }

  if (error) {
    return (
      <p className="text-center text-destructive">
        An error occured while loading notifications.
      </p>
    );
  }

  return (
    <InfiniteScrollContainer
      className="space-y-5"
      onBottomReached={() => hasNextPage && !isFetching && fetchNextPage()}
    >
      {notifications.map((notification) => (
        <Notification notification={notification} key={notification.id} />
      ))}
      {isFetchingNextPage && <Loader2 className="mx-auto my-3 animate-spin" />}
    </InfiniteScrollContainer>
  );
};

export default Notifications;
