import { Metadata } from "next";
import Chat from "./Chat";

export const metadata: Metadata = {
  title: "Messages",
};

const Page = () => {
  return <Chat />;
};

export default Page;
