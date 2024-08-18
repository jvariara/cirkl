import PostEditor from "@/components/posts/editor/PostEditor";

export default function Home() {
  return (
    <main className="w-full h-[200vh]">
      <div className="w-full">
        <PostEditor />
      </div>
    </main>
  );
}
