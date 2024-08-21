import Link from "next/link";
import { LinkIt, LinkItUrl } from "react-linkify-it";

interface LinkifyProps {
  children: React.ReactNode;
}

const Linkify = ({ children }: LinkifyProps) => {
  return (
    <LinkifyUsername>
      <LinkifyUrl>{children}</LinkifyUrl>
    </LinkifyUsername>
  );
};

export default Linkify;

const LinkifyUrl = ({ children }: LinkifyProps) => {
  return (
    <LinkItUrl className="text-primary hover:underline">{children}</LinkItUrl>
  );
};

const LinkifyUsername = ({ children }: LinkifyProps) => {
  return (
    <LinkIt
      regex={/(@[a-zA-Z0-9_]+)/}
      component={(match, key) => (
        <Link
          key={key}
          href={`/users/${match.slice(1)}`}
          className="text-primary hover:underline"
        >
          {match}
        </Link>
      )}
    >
      {children}
    </LinkIt>
  );
};
