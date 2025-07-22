import React from 'react';
import type { Quiz } from '../types';
import { predefinedThemes, colorPalettes } from '../utils/themes';
import { 
  SwatchIcon, 
  PaintBrushIcon, 
  SparklesIcon,
  EyeIcon,
  ComputerDesktopIcon,
  SunIcon,
  MoonIcon,
} from '@heroicons/react/24/outline';

interface CustomizationPanelProps {
  quiz: Quiz;
  setQuiz: React.Dispatch<React.SetStateAction<Quiz | null>>;
}

const CustomizationPanel: React.FC<CustomizationPanelProps> = ({
  quiz,
  setQuiz,
}) => {
  const customization = quiz.customization;
  
  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const actualValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    if (setQuiz) {
      setQuiz(prevQuiz => prevQuiz ? {
        ...prevQuiz,
        customization: {
          ...prevQuiz.customization,
          [name]: actualValue,
        },
      } : null);
    }
  };

  const onThemeChange = (themeName: keyof typeof predefinedThemes) => {
    const theme = predefinedThemes[themeName];
    if (theme && setQuiz) {
      setQuiz(prevQuiz => prevQuiz ? {
        ...prevQuiz,
        customization: {
          ...prevQuiz.customization,
          ...theme,
          theme: themeName as "light" | "dark" | "custom",
        },
      } : null);
    }
  };

  const onColorPaletteChange = (palette: string[]) => {
    if (setQuiz) {
      setQuiz(prevQuiz => prevQuiz ? {
        ...prevQuiz,
        customization: {
          ...prevQuiz.customization,
          backgroundColor: palette[0],
          textColor: palette[1],
          accentColor: palette[2],
          secondaryColor: palette[3],
          cardBackgroundColor: palette[4],
        },
      } : null);
    }
  };

  const handleThemeClick = (themeName: keyof typeof predefinedThemes) => {
    onThemeChange(themeName);
  };

  const handlePaletteClick = (palette: string[]) => {
    onColorPaletteChange(palette);
  };

  const getThemeIcon = (theme: string) => {
    switch (theme) {
      case 'light': return <SunIcon className="h-4 w-4" />;
      case 'dark': return <MoonIcon className="h-4 w-4" />;
      default: return <ComputerDesktopIcon className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Temas Predefinidos */}
      <div>
        <h4 className="text-lg font-semibold text-slate-700 mb-4 flex items-center">
          <SparklesIcon className="h-5 w-5 mr-2" />
          Temas Predefinidos
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(predefinedThemes).map(([name, theme]) => (
            <button
              key={name}
              onClick={() => handleThemeClick(name as keyof typeof predefinedThemes)}
              className={`p-3 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                customization.theme === name 
                  ? 'border-blue-500 ring-2 ring-blue-200' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              style={{ 
                backgroundColor: theme.backgroundColor,
                color: theme.textColor,
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold capitalize">{name}</span>
                {getThemeIcon(name)}
              </div>
              <div className="flex space-x-1">
                <div 
                  className="w-4 h-4 rounded-full border"
                  style={{ backgroundColor: theme.accentColor }}
                />
                <div 
                  className="w-4 h-4 rounded-full border"
                  style={{ backgroundColor: theme.secondaryColor }}
                />
                <div 
                  className="w-4 h-4 rounded-full border"
                  style={{ backgroundColor: theme.cardBackgroundColor }}
                />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Paletas de Cores */}
      <div>
        <h4 className="text-lg font-semibold text-slate-700 mb-4 flex items-center">
          <SwatchIcon className="h-5 w-5 mr-2" />
          Paletas de Cores
        </h4>
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(colorPalettes).map(([name, palette]) => (
            <button
              key={name}
              onClick={() => handlePaletteClick(palette)}
              className="p-2 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
              title={`Paleta ${name}`}
            >
              <div className="flex justify-center space-x-1">
                {palette.map((color, index) => (
                  <div
                    key={index}
                    className="w-4 h-4 rounded-full border border-white shadow-sm"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-600 mt-1 block capitalize">{name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Cores Personalizadas */}
      <div>
        <h4 className="text-lg font-semibold text-slate-700 mb-4 flex items-center">
          <PaintBrushIcon className="h-5 w-5 mr-2" />
          Cores Personalizadas
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="backgroundColor" className="block text-sm font-medium text-slate-600 mb-2">
              Fundo Principal
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                name="backgroundColor"
                id="backgroundColor"
                value={customization.backgroundColor}
                onChange={onChange}
                className="w-12 h-10 border border-slate-300 rounded-md cursor-pointer"
              />
              <input
                type="text"
                value={customization.backgroundColor}
                onChange={(e) => onChange({ target: { name: 'backgroundColor', value: e.target.value } } as any)}
                className="flex-1 px-2 py-1 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="cardBackgroundColor" className="block text-sm font-medium text-slate-600 mb-2">
              Fundo dos Cards
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                name="cardBackgroundColor"
                id="cardBackgroundColor"
                value={customization.cardBackgroundColor}
                onChange={onChange}
                className="w-12 h-10 border border-slate-300 rounded-md cursor-pointer"
              />
              <input
                type="text"
                value={customization.cardBackgroundColor}
                onChange={(e) => onChange({ target: { name: 'cardBackgroundColor', value: e.target.value } } as any)}
                className="flex-1 px-2 py-1 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="textColor" className="block text-sm font-medium text-slate-600 mb-2">
              Cor do Texto
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                name="textColor"
                id="textColor"
                value={customization.textColor}
                onChange={onChange}
                className="w-12 h-10 border border-slate-300 rounded-md cursor-pointer"
              />
              <input
                type="text"
                value={customization.textColor}
                onChange={(e) => onChange({ target: { name: 'textColor', value: e.target.value } } as any)}
                className="flex-1 px-2 py-1 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="accentColor" className="block text-sm font-medium text-slate-600 mb-2">
              Cor Principal
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                name="accentColor"
                id="accentColor"
                value={customization.accentColor}
                onChange={onChange}
                className="w-12 h-10 border border-slate-300 rounded-md cursor-pointer"
              />
              <input
                type="text"
                value={customization.accentColor}
                onChange={(e) => onChange({ target: { name: 'accentColor', value: e.target.value } } as any)}
                className="flex-1 px-2 py-1 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="col-span-2">
            <label htmlFor="secondaryColor" className="block text-sm font-medium text-slate-600 mb-2">
              Cor Secundária
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                name="secondaryColor"
                id="secondaryColor"
                value={customization.secondaryColor}
                onChange={onChange}
                className="w-12 h-10 border border-slate-300 rounded-md cursor-pointer"
              />
              <input
                type="text"
                value={customization.secondaryColor}
                onChange={(e) => onChange({ target: { name: 'secondaryColor', value: e.target.value } } as any)}
                className="flex-1 px-2 py-1 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Configurações de Layout */}
      <div>
        <h4 className="text-lg font-semibold text-slate-700 mb-4">Layout e Tipografia</h4>
        <div className="space-y-4">
          <div>
            <label htmlFor="fontFamily" className="block text-sm font-medium text-slate-600 mb-2">
              Família da Fonte
            </label>
            <select
              name="fontFamily"
              id="fontFamily"
              value={customization.fontFamily}
              onChange={onChange}
              className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="sans">Sans-serif (Moderna)</option>
              <option value="serif">Serif (Clássica)</option>
              <option value="mono">Monospace (Técnica)</option>
            </select>
          </div>

          <div>
            <label htmlFor="fontSize" className="block text-sm font-medium text-slate-600 mb-2">
              Tamanho da Fonte
            </label>
            <select
              name="fontSize"
              id="fontSize"
              value={customization.fontSize}
              onChange={onChange}
              className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="small">Pequena</option>
              <option value="medium">Média</option>
              <option value="large">Grande</option>
            </select>
          </div>

          <div>
            <label htmlFor="borderRadius" className="block text-sm font-medium text-slate-600 mb-2">
              Arredondamento dos Cantos
            </label>
            <select
              name="borderRadius"
              id="borderRadius"
              value={customization.borderRadius}
              onChange={onChange}
              className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="none">Sem arredondamento</option>
              <option value="small">Pequeno</option>
              <option value="medium">Médio</option>
              <option value="large">Grande</option>
            </select>
          </div>
        </div>
      </div>

      {/* Configurações de Experiência */}
      <div>
        <h4 className="text-lg font-semibold text-slate-700 mb-4 flex items-center">
          <EyeIcon className="h-5 w-5 mr-2" />
          Experiência do Usuário
        </h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label htmlFor="showImmediateFeedback" className="text-sm font-medium text-slate-700">
              Feedback Imediato
            </label>
            <input
              id="showImmediateFeedback"
              name="showImmediateFeedback"
              type="checkbox"
              checked={customization.showImmediateFeedback}
              onChange={onChange}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
          </div>
          <p className="text-xs text-gray-600">Mostrar se a resposta está certa ou errada imediatamente</p>

          <div className="flex items-center justify-between">
            <label htmlFor="animationsEnabled" className="text-sm font-medium text-slate-700">
              Animações Suaves
            </label>
            <input
              id="animationsEnabled"
              name="animationsEnabled"
              type="checkbox"
              checked={customization.animationsEnabled}
              onChange={onChange}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
          </div>
          <p className="text-xs text-gray-600">Ativar transições e animações na interface</p>
        </div>
      </div>
    </div>
  );
};

export default CustomizationPanel;
