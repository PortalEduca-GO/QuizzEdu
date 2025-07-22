import React, { useContext } from 'react';
import { QuizContext } from '../App';

const Footer: React.FC = () => {
  const context = useContext(QuizContext);

  if (!context) return null;

  const { quiz, globalSettings } = context;
  
  // Use global settings first, fallback to quiz settings
  const footerText = globalSettings?.footerText || quiz?.footer?.text;
  const footerLogo = globalSettings?.footerLogo || quiz?.footer?.logoUrl;

  // Don't render if there's no footer text or logo
  if (!footerText && !footerLogo) {
    return null;
  }

  const backgroundColor = globalSettings?.backgroundColor || quiz?.customization?.backgroundColor || '#f8fafc';
  
  const isDarkBg = () => {
    if(!backgroundColor) return false;
    const color = backgroundColor.charAt(0) === '#' ? backgroundColor.substring(1, 7) : backgroundColor;
    const r = parseInt(color.substring(0, 2), 16); // hexToR
    const g = parseInt(color.substring(2, 4), 16); // hexToG
    const b = parseInt(color.substring(4, 6), 16); // hexToB
    return (r * 0.299 + g * 0.587 + b * 0.114) < 186;
  };

  const footerBgColor = isDarkBg() ? 'bg-black/20' : 'bg-white/50';

  return (
    <footer className={`py-6 mt-auto ${footerBgColor}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        {footerText && (
          <p 
            className={`text-sm text-center sm:text-left`}
            style={{ color: globalSettings?.textColor }}
          >
            {footerText}
          </p>
        )}
        {footerLogo && (
          <img 
            src={footerLogo} 
            alt="Logo do Rodapé" 
            className="max-h-12 w-auto object-contain"
            style={{
              filter: 'drop-shadow(0 1px 2px rgb(0 0 0 / 0.1))'
            }}
          />
        )}
      </div>
    </footer>
  );
};

export default Footer;