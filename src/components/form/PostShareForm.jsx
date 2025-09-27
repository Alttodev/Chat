import React from "react";
import { FaFacebookF, FaLinkedinIn, FaWhatsapp } from "react-icons/fa";

function PostShareForm() {
  const shareUrl = "http://localhost:5173/home";
  const shareText = encodeURIComponent("Check out this post");

  const socialPlatforms = [
    {
      name: "Facebook",
      icon: <FaFacebookF size={20} />,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        shareUrl
      )}`,
      bg: "bg-blue-600",
    },
    {
      name: "Twitter",
      icon: <span style={{ fontSize: 20 }}>𝕏</span>,
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(
        shareUrl
      )}&text=${shareText}`,
      bg: "bg-black",
    },
    {
      name: "LinkedIn",
      icon: <FaLinkedinIn size={20} />,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        shareUrl
      )}`,
      bg: "bg-blue-700",
    },
    {
      name: "WhatsApp",
      icon: <FaWhatsapp size={20} />,
      url: `https://api.whatsapp.com/send?text=${shareText}%20${encodeURIComponent(
        shareUrl
      )}`,
      bg: "bg-green-500",
    },
  ];

  return (
    <div className="flex justify-center mt-4 gap-3">
      {socialPlatforms.map((platform) => (
        <a
          key={platform.name}
          href={platform.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center justify-center w-10 h-10 rounded-full text-white ${platform.bg} hover:opacity-80 transition`}
          title={`Share on ${platform.name}`}
        >
          {platform.icon}
        </a>
      ))}
    </div>
  );
}

export default PostShareForm;
