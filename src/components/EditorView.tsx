import React, { useState } from 'react';
import { defaultData, ProfileData } from '../types';
import { generateId, formatImageUrl } from '../utils';
import { Plus, Trash2, GripVertical, Image as ImageIcon, Link as LinkIcon, Settings2, Palette, Check, Copy, Share, ExternalLink, LogOut } from 'lucide-react';
import { createShortLink, supabase } from '../lib/supabase';

interface EditorViewProps {
  data: ProfileData;
  onChange: (data: ProfileData) => void;
  onShare: () => void;
}

export function EditorView({ data, onChange, onShare }: EditorViewProps) {
  const [activeTab, setActiveTab] = useState<'content' | 'appearance'>('content');
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);

  const updateField = (field: keyof ProfileData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const updateAppearance = (field: keyof ProfileData['appearance'], value: any) => {
    onChange({
      ...data,
      appearance: {
        ...data.appearance,
        [field]: value
      }
    });
  };

  const addLink = () => {
    updateField('links', [
      ...data.links,
      { id: generateId(), title: '', url: '' }
    ]);
  };

  const updateLink = (id: string, field: 'title' | 'url', value: string) => {
    updateField('links', data.links.map(link => 
      link.id === id ? { ...link, [field]: value } : link
    ));
  };

  const removeLink = (id: string) => {
    updateField('links', data.links.filter(link => link.id !== id));
  };

  const addSocialLink = () => {
    updateField('socials', [
      ...data.socials,
      { id: generateId(), platform: 'instagram', url: '' }
    ]);
  };

  const updateSocialLink = (id: string, field: 'platform' | 'url', value: string) => {
    updateField('socials', data.socials.map(link => 
      link.id === id ? { ...link, [field]: value } : link
    ));
  };

  const removeSocialLink = (id: string) => {
    updateField('socials', data.socials.filter(link => link.id !== id));
  };

  const moveLink = (index: number, direction: -1 | 1) => {
    const newLinks = [...data.links];
    if (index + direction < 0 || index + direction >= newLinks.length) return;
    
    // Swap
    const temp = newLinks[index];
    newLinks[index] = newLinks[index + direction];
    newLinks[index + direction] = temp;
    
    updateField('links', newLinks);
  };

  const handleCopyLink = async () => {
    try {
      setIsGenerating(true);
      setErrorMsg(null);
      setGeneratedLink(null);
      const shortCode = await createShortLink(data);
      const shortUrl = `${window.location.origin}${window.location.pathname}?s=${shortCode}`;
      
      setGeneratedLink(shortUrl);
      
      try {
        await navigator.clipboard.writeText(shortUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (clipErr) {
        // Fallback silently se clipboard falhar (comum em iframes sem permissão)
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Erro ao gerar o link. Verifique se o Supabase está configurado corretamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-8 pb-4 flex items-center justify-between shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-white rotate-45"></div>
            </div>
            <h1 className="text-xl font-bold tracking-tight">LinkBase</h1>
          </div>
          <p className="text-sm text-slate-500">Link in Bio Dinâmico</p>
        </div>
        <button 
          onClick={handleLogout}
          className="text-slate-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50 flex items-center gap-2"
          title="Sair"
        >
          <LogOut size={18} />
          <span className="text-sm font-semibold hidden sm:block">Sair</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#e5e7eb] px-8">
        <button 
          onClick={() => setActiveTab('content')}
          className={`py-4 px-2 mr-6 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'content' ? 'border-black text-black' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
        >
          <LinkIcon size={16} />
          Conteúdo
        </button>
        <button 
          onClick={() => setActiveTab('appearance')}
          className={`py-4 px-2 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'appearance' ? 'border-black text-black' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
        >
          <Palette size={16} />
          Aparência
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
        
        {activeTab === 'content' && (
          <div className="space-y-6 pb-6">
            {/* Perfil Section */}
            <div className="space-y-4">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Perfil</label>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-700">Nome no Perfil</label>
                    <div className="flex bg-slate-50 border border-slate-200 rounded-md focus-within:ring-1 focus-within:ring-black">
                      <input 
                        type="text" 
                        value={data.name}
                        onChange={(e) => updateField('name', e.target.value)}
                        placeholder="Seu Nome ou Marca"
                        className="w-full px-3 py-2 text-sm bg-transparent border-none focus:outline-none focus:ring-0"
                      />
                      <label className="flex items-center gap-2 pr-3 cursor-pointer pl-2 border-l border-slate-200">
                        <input 
                          type="checkbox" 
                          checked={data.verified || false}
                          onChange={(e) => updateField('verified', e.target.checked)}
                          className="w-4 h-4 rounded text-blue-500 focus:ring-blue-500 cursor-pointer"
                        />
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Verificado</span>
                      </label>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-700">URL da Foto</label>
                    <input 
                      type="url" 
                      value={data.avatarUrl}
                      onChange={(e) => updateField('avatarUrl', e.target.value)}
                      placeholder="https://exemplo.com/foto.jpg"
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-black placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-700">Biografia</label>
                  <textarea 
                    value={data.bio}
                    onChange={(e) => updateField('bio', e.target.value)}
                    placeholder="Conte um pouco sobre você..."
                    rows={3}
                    className="w-full h-16 px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-md resize-none focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>
              </div>
            </div>

            {/* Links Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Links Ativos</label>
                <button onClick={addLink} className="text-[11px] text-blue-600 font-semibold">+ Adicionar</button>
              </div>
              
              <div className="space-y-2">
                {data.links.map((link, index) => (
                  <div key={link.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-3">
                    <div className="flex flex-col gap-1 text-slate-400">
                      <button onClick={() => moveLink(index, -1)} disabled={index === 0} className="hover:text-black disabled:opacity-30 p-1">▲</button>
                      <button onClick={() => moveLink(index, 1)} disabled={index === data.links.length - 1} className="hover:text-black disabled:opacity-30 p-1">▼</button>
                    </div>
                    
                    <div className="flex-1 space-y-1">
                      <input 
                        type="text" 
                        value={link.title}
                        onChange={(e) => updateLink(link.id, 'title', e.target.value)}
                        placeholder="Título do Link"
                        className="w-full text-xs font-semibold bg-transparent border-none placeholder:text-slate-400 focus:outline-none p-0 focus:ring-0"
                      />
                      <input 
                        type="url" 
                        value={link.url}
                        onChange={(e) => updateLink(link.id, 'url', e.target.value)}
                        placeholder="https://url-de-destino.com"
                        className="w-full text-[10px] text-slate-500 bg-transparent border-none placeholder:text-slate-300 focus:outline-none p-0 focus:ring-0"
                      />
                      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-200/60">
                        <span className="text-[9px] font-bold text-slate-400 uppercase">Animação:</span>
                        <select
                          value={link.animation || 'none'}
                          onChange={(e) => updateLink(link.id, 'animation' as any, e.target.value)}
                          className="bg-white border border-slate-200 text-[10px] px-1 py-0.5 rounded text-slate-600 outline-none"
                        >
                          <option value="none">Nenhuma</option>
                          <option value="pulse">Pulse</option>
                          <option value="bounce">Bounce</option>
                          <option value="wobble">Wobble</option>
                        </select>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => removeLink(link.id)}
                      className="w-6 h-6 rounded hover:bg-red-50 flex items-center justify-center text-slate-400 hover:text-red-500 cursor-pointer"
                      title="Excluir link"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}

                {data.links.length === 0 && (
                  <div className="p-4 text-center text-sm text-slate-400 bg-slate-50 border border-slate-200 rounded-lg border-dashed">
                      Nenhum link adicionado.
                  </div>
                )}
              </div>
            </div>

            {/* Social Links Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Redes Sociais</label>
                <button onClick={addSocialLink} className="text-[11px] text-blue-600 font-semibold">+ Ícone</button>
              </div>
              
              <div className="space-y-2">
                {data.socials?.map((social) => (
                  <div key={social.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-3">
                    <select 
                      value={social.platform} 
                      onChange={(e) => updateSocialLink(social.id, 'platform', e.target.value)}
                      className="text-xs border border-slate-200 rounded p-1 bg-white outline-none"
                    >
                      <option value="instagram">Instagram</option>
                      <option value="twitter">X (Twitter)</option>
                      <option value="youtube">YouTube</option>
                      <option value="github">GitHub</option>
                      <option value="linkedin">LinkedIn</option>
                      <option value="tiktok">TikTok</option>
                      <option value="facebook">Facebook</option>
                      <option value="mail">Email</option>
                    </select>
                    
                    <input 
                      type="url" 
                      value={social.url}
                      onChange={(e) => updateSocialLink(social.id, 'url', e.target.value)}
                      placeholder="https://"
                      className="flex-1 text-xs text-slate-500 bg-white border border-slate-200 rounded p-1.5 outline-none focus:border-slate-400"
                    />
                    
                    <button 
                      onClick={() => removeSocialLink(social.id)}
                      className="w-6 h-6 rounded hover:bg-red-50 flex items-center justify-center text-slate-400 hover:text-red-500 cursor-pointer"
                      title="Excluir rede social"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                
                {(!data.socials || data.socials.length === 0) && (
                  <div className="p-4 text-center text-[10px] text-slate-400 bg-slate-50 border border-slate-200 rounded-lg border-dashed">
                      Nenhum ícone social adicionado.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'appearance' && (
          <div className="space-y-6 pb-6 w-full">
            {/* Themes / Presets */}
            <div className="space-y-4">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Temas Prontos</label>
              
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => onChange({ 
                    ...data, 
                    appearance: { ...data.appearance, backgroundColor: '#f3f4f6', textColor: '#1a1a1a', buttonColor: '#1a1a1a', buttonTextColor: '#ffffff' } 
                  })}
                  className="p-3 border border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100 flex flex-col gap-2 transition-colors"
                >
                  <div className="flex gap-2 w-full h-8 cursor-pointer pointer-events-none">
                    <div className="flex-1 bg-[#f3f4f6] rounded border border-slate-200 h-full flex flex-col justify-center items-center gap-1">
                      <div className="w-6 h-1 bg-[#1a1a1a] rounded"></div>
                      <div className="w-4 h-1 bg-[#1a1a1a] rounded opacity-50"></div>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-center w-full">Claro Minimalista</span>
                </button>

                <button 
                  onClick={() => onChange({ 
                    ...data, 
                    appearance: { ...data.appearance, backgroundColor: '#09090b', textColor: '#fafafa', buttonColor: '#ffffff', buttonTextColor: '#09090b' } 
                  })}
                  className="p-3 border border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100 flex flex-col gap-2 transition-colors"
                >
                  <div className="flex gap-2 w-full h-8 cursor-pointer pointer-events-none">
                    <div className="flex-1 bg-[#09090b] rounded border border-slate-200 h-full flex flex-col justify-center items-center gap-1">
                      <div className="w-6 h-1 bg-[#fafafa] rounded"></div>
                      <div className="w-4 h-1 bg-[#fafafa] rounded opacity-50"></div>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-center w-full">Escuro Modern</span>
                </button>

                <button 
                  onClick={() => onChange({ 
                    ...data, 
                    appearance: { ...data.appearance, backgroundColor: '#fdf4ff', textColor: '#701a75', buttonColor: '#c026d3', buttonTextColor: '#ffffff' } 
                  })}
                  className="p-3 border border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100 flex flex-col gap-2 transition-colors"
                >
                  <div className="flex gap-2 w-full h-8 cursor-pointer pointer-events-none">
                    <div className="flex-1 bg-[#fdf4ff] rounded border border-slate-200 h-full flex flex-col justify-center items-center gap-1">
                      <div className="w-6 h-1 bg-[#701a75] rounded"></div>
                      <div className="w-4 h-1 bg-[#701a75] rounded opacity-50"></div>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-center w-full">Rosa Pastel</span>
                </button>
                
                <button 
                  onClick={() => onChange({ 
                    ...data, 
                    appearance: { ...data.appearance, backgroundColor: '#0f172a', textColor: '#e2e8f0', buttonColor: '#3b82f6', buttonTextColor: '#ffffff' } 
                  })}
                  className="p-3 border border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100 flex flex-col gap-2 transition-colors"
                >
                  <div className="flex gap-2 w-full h-8 cursor-pointer pointer-events-none">
                    <div className="flex-1 bg-[#0f172a] rounded border border-slate-200 h-full flex flex-col justify-center items-center gap-1">
                      <div className="w-6 h-1 bg-[#e2e8f0] rounded"></div>
                      <div className="w-4 h-1 bg-[#e2e8f0] rounded opacity-50"></div>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-center w-full">Tech Azul</span>
                </button>
              </div>
            </div>

            {/* Background Settings */}
            <div className="space-y-4">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Fundo da Página</label>
              
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => updateAppearance('backgroundType', 'solid')}
                  className={`p-3 rounded-lg border text-center transition-all ${data.appearance.backgroundType === 'solid' || !data.appearance.backgroundType  ? 'border-black ring-1 ring-black bg-slate-50' : 'bg-slate-50 border-slate-200 hover:border-slate-300'}`}
                >
                  <span className="text-xs font-semibold">Sólido</span>
                </button>
                <button
                  onClick={() => updateAppearance('backgroundType', 'gradient')}
                  className={`p-3 rounded-lg border text-center transition-all ${data.appearance.backgroundType === 'gradient' ? 'border-black ring-1 ring-black bg-slate-50' : 'bg-slate-50 border-slate-200 hover:border-slate-300'}`}
                >
                  <span className="text-xs font-semibold">Gradiente</span>
                </button>
              </div>
            </div>

            {/* Colors */}
            <div className="space-y-4">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Cores base</label>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg h-12">
                  <input 
                    type="color" 
                    value={data.appearance.backgroundColor}
                    onChange={(e) => updateAppearance('backgroundColor', e.target.value)}
                    className="w-6 h-6 rounded shadow-inner border border-slate-300 cursor-pointer p-0 bg-transparent shrink-0"
                  />
                  <span className="text-xs font-medium truncate">Cor 1 (Fundo)</span>
                </div>

                {data.appearance.backgroundType === 'gradient' && (
                  <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg h-12">
                    <input 
                      type="color" 
                      value={data.appearance.gradientColors || '#ffffff'}
                      onChange={(e) => updateAppearance('gradientColors', e.target.value)}
                      className="w-6 h-6 rounded shadow-inner border border-slate-300 cursor-pointer p-0 bg-transparent shrink-0"
                    />
                    <span className="text-xs font-medium truncate">Cor 2 (Grad)</span>
                  </div>
                )}
                
                <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg h-12">
                  <input 
                    type="color" 
                    value={data.appearance.textColor}
                    onChange={(e) => updateAppearance('textColor', e.target.value)}
                    className="w-6 h-6 rounded shadow-inner border border-slate-300 cursor-pointer p-0 bg-transparent shrink-0"
                  />
                  <span className="text-xs font-medium truncate">Texto Base</span>
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg h-12">
                  <input 
                    type="color" 
                    value={data.appearance.buttonColor}
                    onChange={(e) => updateAppearance('buttonColor', e.target.value)}
                    className="w-6 h-6 rounded shadow-inner border border-slate-300 cursor-pointer p-0 bg-transparent shrink-0"
                  />
                  <span className="text-xs font-medium truncate">Fundo Botão</span>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg h-12">
                  <input 
                    type="color" 
                    value={data.appearance.buttonTextColor}
                    onChange={(e) => updateAppearance('buttonTextColor', e.target.value)}
                    className="w-6 h-6 rounded shadow-inner border border-slate-300 cursor-pointer p-0 bg-transparent shrink-0"
                  />
                  <span className="text-xs font-medium truncate">Texto Botão</span>
                </div>
              </div>
            </div>

            {/* Typography */}
            <div className="space-y-4">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Tipografia</label>
              
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => updateAppearance('fontFamily', 'font-sans')}
                  className={`p-3 rounded-lg border text-center transition-all ${data.appearance.fontFamily === 'font-sans' ? 'border-black ring-1 ring-black bg-slate-50' : 'bg-slate-50 border-slate-200 hover:border-slate-300'}`}
                >
                  <span className="font-sans text-sm font-medium block">Inter</span>
                </button>
                <button
                  onClick={() => updateAppearance('fontFamily', 'font-outfit')}
                  className={`p-3 rounded-lg border text-center transition-all ${data.appearance.fontFamily === 'font-outfit' ? 'border-black ring-1 ring-black bg-slate-50' : 'bg-slate-50 border-slate-200 hover:border-slate-300'}`}
                >
                  <span className="font-outfit text-sm font-medium block">Outfit</span>
                </button>
                <button
                  onClick={() => updateAppearance('fontFamily', 'font-mono')}
                  className={`p-3 rounded-lg border text-center transition-all ${data.appearance.fontFamily === 'font-mono' ? 'border-black ring-1 ring-black bg-slate-50' : 'bg-slate-50 border-slate-200 hover:border-slate-300'}`}
                >
                  <span className="font-mono text-sm font-medium block">Mono</span>
                </button>
                <button
                  onClick={() => updateAppearance('fontFamily', 'font-serif')}
                  className={`p-3 rounded-lg border text-center transition-all ${data.appearance.fontFamily === 'font-serif' ? 'border-black ring-1 ring-black bg-slate-50' : 'bg-slate-50 border-slate-200 hover:border-slate-300'}`}
                >
                  <span className="font-serif text-sm font-medium block">Serif</span>
                </button>
              </div>
            </div>

            {/* Button Style */}
            <div className="space-y-4">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Layout dos Botões</label>
              
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => updateAppearance('buttonStyle', 'pill')}
                  className={`py-3 px-2 rounded-lg border flex flex-col items-center justify-center gap-3 transition-all ${data.appearance.buttonStyle === 'pill' ? 'border-black ring-1 ring-black bg-slate-50' : 'bg-slate-50 border-slate-200 hover:border-slate-300'}`}
                >
                  <div className="w-10 h-3 bg-slate-800 rounded-full"></div>
                  <span className="text-[10px] text-slate-500 font-medium whitespace-nowrap">Pílula</span>
                </button>
                
                <button
                  onClick={() => updateAppearance('buttonStyle', 'rounded')}
                  className={`py-3 px-2 rounded-lg border flex flex-col items-center justify-center gap-3 transition-all ${data.appearance.buttonStyle === 'rounded' ? 'border-black ring-1 ring-black bg-slate-50' : 'bg-slate-50 border-slate-200 hover:border-slate-300'}`}
                >
                  <div className="w-10 h-3 bg-slate-800 rounded-md"></div>
                  <span className="text-[10px] text-slate-500 font-medium whitespace-nowrap">Arredondado</span>
                </button>

                <button
                  onClick={() => updateAppearance('buttonStyle', 'square')}
                  className={`py-3 px-2 rounded-lg border flex flex-col items-center justify-center gap-3 transition-all ${data.appearance.buttonStyle === 'square' ? 'border-black ring-1 ring-black bg-slate-50' : 'bg-slate-50 border-slate-200 hover:border-slate-300'}`}
                >
                  <div className="w-10 h-3 bg-slate-800 rounded-none"></div>
                  <span className="text-[10px] text-slate-500 font-medium whitespace-nowrap">Quadrado</span>
                </button>

                <button
                  onClick={() => updateAppearance('buttonStyle', 'outline')}
                  className={`py-3 px-2 rounded-lg border flex flex-col items-center justify-center gap-3 transition-all ${data.appearance.buttonStyle === 'outline' ? 'border-black ring-1 ring-black bg-slate-50' : 'bg-slate-50 border-slate-200 hover:border-slate-300'}`}
                >
                  <div className="w-10 h-3 border border-slate-800 rounded-full"></div>
                  <span className="text-[10px] text-slate-500 font-medium whitespace-nowrap">Contorno</span>
                </button>

                <button
                  onClick={() => updateAppearance('buttonStyle', 'soft')}
                  className={`py-3 px-2 rounded-lg border flex flex-col items-center justify-center gap-3 transition-all ${data.appearance.buttonStyle === 'soft' ? 'border-black ring-1 ring-black bg-slate-50' : 'bg-slate-50 border-slate-200 hover:border-slate-300'}`}
                >
                  <div className="w-10 h-3 bg-slate-200 rounded-full"></div>
                  <span className="text-[10px] text-slate-500 font-medium whitespace-nowrap">Suave</span>
                </button>

                <button
                  onClick={() => updateAppearance('buttonStyle', 'shadow')}
                  className={`py-3 px-2 rounded-lg border flex flex-col items-center justify-center gap-3 transition-all ${data.appearance.buttonStyle === 'shadow' ? 'border-black ring-1 ring-black bg-slate-50' : 'bg-slate-50 border-slate-200 hover:border-slate-300'}`}
                >
                  <div className="w-10 h-3 bg-white border-2 border-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"></div>
                  <span className="text-[10px] text-slate-500 font-medium whitespace-nowrap">Sombra</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer / Action Area */}
      <div className="p-8 bg-slate-50 border-t border-slate-200 space-y-4 shrink-0">
        <div className="flex items-center justify-between">
          <p className="text-[11px] text-slate-400 italic">Salvo automaticamente no URL local.</p>
          <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold">READY</span>
        </div>
        <div className="flex flex-col gap-3">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs leading-relaxed text-red-800">
               <strong>Erro:</strong> {errorMsg}
            </div>
          )}

          {generatedLink && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex flex-col gap-2">
              <span className="text-xs font-semibold text-green-800">Link curto gerado!</span>
              <div className="flex gap-2">
                <input type="text" readOnly value={generatedLink} className="flex-1 bg-white border border-green-300 rounded px-2 py-1 outline-none text-[10px] text-green-900" />
                <button onClick={() => {
                  navigator.clipboard.writeText(generatedLink).then(() => {
                     setCopied(true);
                     setTimeout(() => setCopied(false), 2000);
                  }).catch(() => {});
                }} className="bg-green-600 text-white px-2 py-1 text-[10px] uppercase font-bold rounded hover:bg-green-700 transition">Copiar</button>
              </div>
            </div>
          )}

          <button 
            onClick={handleCopyLink}
            disabled={isGenerating}
            className="w-full bg-black text-white h-12 rounded-lg font-bold text-sm hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isGenerating ? <div className="w-4 h-4 rounded-full border-2 border-white animate-spin border-t-transparent"></div> : (copied ? <Check size={16} /> : <LinkIcon size={16} />)}
            {copied ? "Link Copiado!" : (isGenerating ? "Gerando..." : "Gerar Link Curto (Supabase)")}
          </button>
        </div>
        <p className="text-[10px] text-slate-500 text-center px-4">
          Utilizamos o Supabase para encurtar seu link e deixá-lo perfeito para colocar na sua bio.
        </p>
      </div>
    </div>
  );
}
