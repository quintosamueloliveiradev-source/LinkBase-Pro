import React, { useState, useEffect } from 'react';
import { ProfileData } from '../types';
import { Link2, Instagram, Twitter, Youtube, Github, Linkedin, Mail, Facebook, BadgeCheck } from 'lucide-react';
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
  const { name, bio, avatarUrl, verified, links, socials = [], appearance } = data;
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [avatarUrl]);

  const getFontClass = () => {
    switch(appearance.fontFamily) {
      case 'font-outfit': return 'font-outfit';
      case 'font-mono': return 'font-mono';
      case 'font-serif': return 'font-serif';
      default: return 'font-sans';
    }
  };
  
  const fontClass = getFontClass();
  
  const getBorderRadius = () => {
    switch (appearance.buttonStyle) {
      case 'pill':
      case 'outline':
      case 'soft':
        return '9999px';
      case 'rounded': return '0.75rem';
      case 'square': 
      case 'shadow':
        return '0px';
      default: return '0.5rem';
    }
  };

  const getButtonStyle = () => {
    const baseStyle: React.CSSProperties = {
      borderRadius: getBorderRadius(),
      border: '2px solid transparent',
      transition: 'all 0.2s ease',
    };

    switch (appearance.buttonStyle) {
      case 'outline':
        baseStyle.backgroundColor = 'transparent';
        baseStyle.border = `2px solid ${appearance.buttonColor}`;
        baseStyle.color = appearance.buttonColor;
        break;
      case 'soft':
        baseStyle.backgroundColor = appearance.buttonColor + '15'; // 15% opacity hex
        baseStyle.color = appearance.buttonColor;
        break;
      case 'shadow':
        baseStyle.backgroundColor = appearance.buttonColor;
        baseStyle.color = appearance.buttonTextColor;
        baseStyle.boxShadow = `4px 4px 0px 0px ${appearance.textColor}`;
        baseStyle.border = `2px solid ${appearance.textColor}`;
        break;
      default:
        baseStyle.backgroundColor = appearance.buttonColor;
        baseStyle.color = appearance.buttonTextColor;
    }
    
    return baseStyle;
  };
  
  const getAnimationClass = (animation?: string) => {
    switch(animation) {
      case 'pulse': return 'animate-pulse';
      case 'bounce': return 'animate-bounce';
      case 'wobble': return 'animate-wobble';
      default: return '';
    }
  };

  return (
    <div 
      className={`min-h-[100dvh] lg:min-h-full w-full flex flex-col items-center pt-10 px-6 pb-10 ${fontClass} transition-colors duration-300 relative`}
      style={{ 
        backgroundColor: appearance.backgroundType === 'gradient' ? undefined : appearance.backgroundColor,
        backgroundImage: appearance.backgroundType === 'gradient' 
          ? `linear-gradient(135deg, ${appearance.backgroundColor} 0%, ${appearance.gradientColors || '#ffffff'} 100%)` 
          : (appearance.backgroundType === 'image' && appearance.backgroundImage ? `url(${appearance.backgroundImage})` : undefined),
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
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
            className="w-24 h-24 rounded-full object-cover mb-4 ring-4 ring-slate-100 shadow-sm transition-all"
            style={{ 
               borderColor: appearance.buttonColor + '20',
               backgroundColor: appearance.buttonColor + '10' 
            }}
          />
        ) : (
          <div 
            className="w-24 h-24 rounded-full mb-4 ring-4 ring-slate-100 flex items-center justify-center text-slate-400"
            style={{ backgroundColor: appearance.buttonColor + '10', color: appearance.buttonColor, borderColor: appearance.buttonColor + '20' }}
          >
            <span className="text-4xl font-bold">{name?.charAt(0)}</span>
          </div>
        )}

        {/* Name & Bio */}
        <h1 className="text-xl font-bold tracking-tight text-center flex items-center justify-center gap-1.5" style={{ color: appearance.textColor }}>
          {name}
          {verified && <BadgeCheck size={20} className="text-blue-500 fill-blue-500/20" />}
        </h1>
        <p className="text-[13px] opacity-80 text-center mt-2 leading-relaxed px-4">
          {bio}
        </p>

        {/* Social Icons */}
        {socials && socials.length > 0 && (
          <div className="flex items-center gap-5 mt-6 flex-wrap justify-center">
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
        <div className="w-full mt-8 space-y-4 flex-1 flex flex-col">
          {links.map((link) => (
            <a
              key={link.id}
              href={link.url.startsWith('http') ? link.url : `https://${link.url}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`group block w-full text-center py-4 px-6 text-[13px] font-bold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-95 active:shadow-sm ${getAnimationClass(link.animation)}`}
              style={getButtonStyle()}
            >
              {link.title || "Link sem título"}
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
