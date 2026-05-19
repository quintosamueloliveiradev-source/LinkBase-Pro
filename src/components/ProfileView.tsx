import React, { useState, useEffect } from 'react';
import { ProfileData } from '../types';
import { Link2, Instagram, Twitter, Youtube, Github, Linkedin, Mail, Facebook } from 'lucide-react';
import { formatImageUrl } from '../utils';

// Tiktok isn't in lucide, so we'll use a substitute or generic link icon
const PlatformIcon = ({ platform }: { platform: string }) => {
  switch (platform) {
    case 'instagram': return <Instagram size={18} />;
    case 'twitter': return <Twitter size={18} />;
    case 'youtube': return <Youtube size={18} />;
    case 'github': return <Github size={18} />;
    case 'linkedin': return <Linkedin size={18} />;
    case 'facebook': return <Facebook size={18} />;
    case 'mail': return <Mail size={18} />;
    default: return <Link2 size={18} />; // generic for tiktok/others
  }
};

interface ProfileViewProps {
  data: ProfileData;
}

export function ProfileView({ data }: ProfileViewProps) {
  const { name, bio, avatarUrl, links, socials = [], appearance } = data;
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [avatarUrl]);

  const fontClass = appearance.fontFamily === 'font-outfit' ? 'font-outfit' : 'font-sans';
  
  const getBorderRadius = () => {
    switch (appearance.buttonStyle) {
      case 'pill': return '9999px';
      case 'rounded': return '0.75rem';
      case 'square': return '0px';
      default: return '0.5rem';
    }
  };

  return (
    <div 
      className={`min-h-[100dvh] lg:min-h-full w-full flex flex-col items-center pt-10 px-6 pb-10 ${fontClass} transition-colors duration-300 relative`}
      style={{ 
        backgroundColor: appearance.backgroundColor, 
        color: appearance.textColor 
      }}
    >
      {/* Container max width for the content */}
      <div className="w-full max-w-[400px] flex flex-col items-center z-10 flex-1">
        
        {/* Avatar */}
        {avatarUrl && !imageError ? (
          <img 
            src={formatImageUrl(avatarUrl)} 
            alt={name} 
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className="w-20 h-20 rounded-full object-cover mb-4 ring-2 ring-slate-100 shadow-sm transition-all"
            style={{ 
               borderColor: appearance.buttonColor + '20',
               backgroundColor: appearance.buttonColor + '10' 
            }}
          />
        ) : (
          <div 
            className="w-20 h-20 rounded-full mb-4 ring-2 ring-slate-100 flex items-center justify-center text-slate-400"
            style={{ backgroundColor: appearance.buttonColor + '10', color: appearance.buttonColor }}
          >
            <span className="text-3xl font-bold">{name.charAt(0)}</span>
          </div>
        )}

        {/* Name & Bio */}
        <h1 className="text-lg font-bold tracking-tight text-center" style={{ color: appearance.textColor }}>
          {name}
        </h1>
        <p className="text-[12px] opacity-70 text-center mt-1 leading-relaxed px-4">
          {bio}
        </p>

        {/* Social Icons */}
        {socials && socials.length > 0 && (
          <div className="flex items-center gap-4 mt-6 flex-wrap justify-center">
            {socials.map((social) => (
              <a 
                key={social.id}
                href={social.url.startsWith('http') || social.url.startsWith('mailto:') ? social.url : `https://${social.url}`}
                target="_blank"
                rel="noopener noreferrer"
                className="opacity-70 hover:opacity-100 transition-opacity hover:-translate-y-1 transform duration-200"
                style={{ color: appearance.textColor }}
              >
                <PlatformIcon platform={social.platform} />
              </a>
            ))}
          </div>
        )}

        {/* Links */}
        <div className="w-full mt-6 space-y-3 flex-1 flex flex-col">
          {links.map((link) => (
            <a
              key={link.id}
              href={link.url.startsWith('http') ? link.url : `https://${link.url}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group block w-full text-center py-3 px-6 text-[11px] font-bold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:scale-95 active:shadow-sm"
              style={{
                backgroundColor: appearance.buttonColor,
                color: appearance.buttonTextColor,
                borderRadius: getBorderRadius(),
                boxShadow: `0 2px 8px 0 ${appearance.buttonColor}40`
              }}
            >
              {link.title || "Untitled Link"}
            </a>
          ))}
        </div>

        {/* Empty State */}
        {links.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 opacity-40">
            <Link2 className="mb-2 w-6 h-6" />
            <p className="text-xs">Nenhum link adicionado</p>
          </div>
        )}
      </div>

      {/* Footer Branding */}
      <a 
        href="/" 
        className="mt-10 mb-4 text-[10px] font-bold uppercase tracking-widest opacity-30 hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-center w-full z-10"
      >
        <div className="w-2 h-2 bg-current rounded-sm"></div>
        LinkBase
      </a>
      
    </div>
  );
}
