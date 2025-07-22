import React, { useState, useRef } from 'react';
import { useQuiz } from '../App';
import { saveAdminConfig, loadAdminConfig } from '../utils/supabaseConfig';
import { GlobalPageSettings } from '../types';
import { PhotoIcon, XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';

interface GlobalSettingsPanelProps {
  onClose: () => void;
}

const GlobalSettingsPanel: React.FC<GlobalSettingsPanelProps> = ({ onClose }) => {
  const { globalSettings, saveGlobalSettings } = useQuiz();
  const [settings, setSettings] = useState<GlobalPageSettings>({ ...globalSettings });
  const [loading, setLoading] = useState(true);
  // Carregar configurações globais do Supabase ao abrir
  React.useEffect(() => {
    (async () => {
      setLoading(true);
      const remote = await loadAdminConfig('global_settings');
      if (remote) {
        setSettings(remote);
        saveGlobalSettings(remote); // Atualiza localStorage também
      }
      setLoading(false);
    })();
  }, []);
  const [activeTab, setActiveTab] = useState<'general' | 'appearance' | 'logos'>('general');

  const headerLogoInputRef = useRef<HTMLInputElement | null>(null);
  const footerLogoInputRef = useRef<HTMLInputElement | null>(null);
  const faviconInputRef = useRef<HTMLInputElement | null>(null);

  const handleImageUpload = async (
    file: File,
    maxWidth: number = 300,
    maxHeight: number = 150
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calcular dimensões mantendo proporção
        let { width, height } = img;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }

        canvas.width = width;
        canvas.height = height;

        if (ctx) {
          // Desenhar com fundo transparente para manter qualidade
          ctx.clearRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);
          
          // Converter para base64 com qualidade otimizada
          const dataUrl = canvas.toDataURL('image/png', 0.9);
          resolve(dataUrl);
        } else {
          reject(new Error('Canvas context not available'));
        }
      };

      img.onerror = () => reject(new Error('Failed to load image'));

      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          img.src = e.target.result as string;
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
    type: 'headerLogo' | 'footerLogo' | 'favicon'
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const maxDimensions = {
        headerLogo: { width: 200, height: 80 },
        footerLogo: { width: 150, height: 60 },
        favicon: { width: 32, height: 32 }
      };

      const dimensions = maxDimensions[type];
      const imageData = await handleImageUpload(file, dimensions.width, dimensions.height);
      
      setSettings(prev => ({
        ...prev,
        [type]: imageData
      }));
    } catch (error) {
      console.error('Error processing image:', error);
      alert('Erro ao processar a imagem. Tente novamente.');
    }
  };

  const handleSave = () => {
    // Salva no Supabase primeiro, depois local
    saveAdminConfig('global_settings', settings).then(() => {
      saveGlobalSettings(settings);
      onClose();
    });
  };

  const resetImage = (type: 'headerLogo' | 'footerLogo' | 'favicon') => {
    setSettings(prev => ({
      ...prev,
      [type]: null
    }));
  };

  const renderImageUpload = (
    type: 'headerLogo' | 'footerLogo' | 'favicon',
    label: string,
    currentImage: string | null,
    inputRef: React.RefObject<HTMLInputElement | null>
  ) => (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      
      {currentImage ? (
        <div className="relative">
          <div className="flex items-center justify-center p-4 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
            <img
              src={currentImage}
              alt={label}
              className={`max-h-16 object-contain ${
                type === 'favicon' ? 'w-8 h-8' : 'max-w-full'
              }`}
              style={{
                filter: 'drop-shadow(0 1px 2px rgb(0 0 0 / 0.1))'
              }}
            />
          </div>
          <button
            type="button"
            onClick={() => resetImage(type)}
            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          className="flex flex-col items-center justify-center p-6 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
        >
          <PhotoIcon className="w-8 h-8 text-gray-400 mb-2" />
          <span className="text-sm text-gray-500">Clique para selecionar imagem</span>
          <span className="text-xs text-gray-400 mt-1">
            {type === 'favicon' ? 'Recomendado: 32x32px' : 
             type === 'headerLogo' ? 'Máximo: 200x80px' : 'Máximo: 150x60px'}
          </span>
        </div>
      )}
      
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={(e) => handleFileChange(e, type)}
        className="hidden"
      />
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-50">
            <span className="text-lg font-semibold text-blue-600">Carregando configurações...</span>
          </div>
        )}
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Configurações Globais da Página
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex space-x-8 px-6">
            {[
              { id: 'general', label: 'Geral' },
              { id: 'appearance', label: 'Aparência' },
              { id: 'logos', label: 'Logos & Imagens' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Site
                </label>
                <input
                  type="text"
                  value={settings.siteName}
                  onChange={(e) => setSettings(prev => ({ ...prev, siteName: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nome do seu site de quizzes"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Texto do Cabeçalho
                </label>
                <input
                  type="text"
                  value={settings.headerText}
                  onChange={(e) => setSettings(prev => ({ ...prev, headerText: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Texto que aparece no cabeçalho"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Texto do Rodapé
                </label>
                <textarea
                  value={settings.footerText}
                  onChange={(e) => setSettings(prev => ({ ...prev, footerText: e.target.value }))}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Texto que aparece no rodapé"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CSS Personalizado
                </label>
                <textarea
                  value={settings.customCSS}
                  onChange={(e) => setSettings(prev => ({ ...prev, customCSS: e.target.value }))}
                  rows={6}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                  placeholder="/* Adicione seu CSS personalizado aqui */&#10;.custom-class {&#10;  /* suas regras CSS */&#10;}"
                />
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cor Primária
                </label>
                <div className="flex space-x-2">
                  <input
                    type="color"
                    value={settings.primaryColor}
                    onChange={(e) => setSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings.primaryColor}
                    onChange={(e) => setSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
                    className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cor Secundária
                </label>
                <div className="flex space-x-2">
                  <input
                    type="color"
                    value={settings.secondaryColor}
                    onChange={(e) => setSettings(prev => ({ ...prev, secondaryColor: e.target.value }))}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings.secondaryColor}
                    onChange={(e) => setSettings(prev => ({ ...prev, secondaryColor: e.target.value }))}
                    className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cor de Fundo
                </label>
                <div className="flex space-x-2">
                  <input
                    type="color"
                    value={settings.backgroundColor}
                    onChange={(e) => setSettings(prev => ({ ...prev, backgroundColor: e.target.value }))}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings.backgroundColor}
                    onChange={(e) => setSettings(prev => ({ ...prev, backgroundColor: e.target.value }))}
                    className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cor do Texto
                </label>
                <div className="flex space-x-2">
                  <input
                    type="color"
                    value={settings.textColor}
                    onChange={(e) => setSettings(prev => ({ ...prev, textColor: e.target.value }))}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings.textColor}
                    onChange={(e) => setSettings(prev => ({ ...prev, textColor: e.target.value }))}
                    className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'logos' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  {renderImageUpload('headerLogo', 'Logo do Cabeçalho', settings.headerLogo, headerLogoInputRef)}
                </div>
                <div>
                  {renderImageUpload('footerLogo', 'Logo do Rodapé', settings.footerLogo, footerLogoInputRef)}
                </div>
              </div>
              <div className="max-w-md">
                {renderImageUpload('favicon', 'Favicon (ícone da aba)', settings.favicon, faviconInputRef)}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 bg-gray-50 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center space-x-2"
          >
            <CheckIcon className="w-4 h-4" />
            <span>Salvar Configurações</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GlobalSettingsPanel;
