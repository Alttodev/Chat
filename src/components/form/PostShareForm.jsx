import React from "react";
import { FaFacebookF, FaLinkedinIn, FaWhatsapp } from "react-icons/fa";

function PostShareForm({ postId }) {
  const shareText = "Check out this post";

  const shareUrl = React.useMemo(() => {
    const url = new URL("/home", window.location.origin);

    if (postId) {
      url.searchParams.set("postId", postId);
    }

    return url.toString();
  }, [postId]);

  const socialPlatforms = [
    {
      name: "Facebook",
      icon: <FaFacebookF size={20} />,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        shareUrl,
      )}`,
      bg: "bg-blue-600",
    },
    {
      name: "Twitter",
      icon: <span style={{ fontSize: 20 }}>𝕏</span>,
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(
        shareUrl,
      )}&text=${encodeURIComponent(shareText)}`,
      bg: "bg-black",
    },
    {
      name: "LinkedIn",
      icon: <FaLinkedinIn size={20} />,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        shareUrl,
      )}`,
      bg: "bg-blue-700",
    },
    {
      name: "WhatsApp",
      icon: <FaWhatsapp size={20} />,
      url: `https://api.whatsapp.com/send?text=${encodeURIComponent(
        `${shareText}: ${shareUrl}`,
      )}`,
      bg: "bg-green-500",
    },
  ];

  return (
    <div className="mt-4 flex justify-center gap-3">
      {socialPlatforms.map((platform) => (
        <a
          key={platform.name}
          href={platform.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex h-10 w-10 items-center justify-center rounded-full text-white ${platform.bg} transition hover:opacity-80`}
          title={`Share on ${platform.name}`}
        >
          {platform.icon}
        </a>
      ))}
    </div>
  );
}

export default PostShareForm;
