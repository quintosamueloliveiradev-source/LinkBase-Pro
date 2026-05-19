/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { defaultData, ProfileData } from './types';
import { decodeData, encodeData } from './utils';
import { ProfileView } from './components/ProfileView';
import { EditorView } from './components/EditorView';
import { Smartphone, Monitor } from 'lucide-react';
import { getShortLinkData } from './lib/supabase';

export default function App() {
  const [data, setData] = useState<ProfileData>(defaultData);
  const [mode, setMode] = useState<'editor' | 'view' | 'loading' | 'error'>('loading');
  const [showMobilePreview, setShowMobilePreview] = useState(false);

  useEffect(() => {
    const loadParams = async () => {
      const params = new URLSearchParams(window.location.search);
      const viewEncoded = params.get('v');
      const editEncoded = params.get('e');
      const shortCode = params.get('s');

      if (shortCode) {
        try {
          const profileData = await getShortLinkData(shortCode);
          setData(profileData);
          setMode('view'); // Always view for short code readers
        } catch (error) {
          console.error(error);
          setMode('error');
        }
        return;
      }

      if (viewEncoded) {
        // Viewer accessed a public profile link
        const decoded = decodeData(viewEncoded);
        if (decoded) {
          setData(decoded);
          setMode('view');
          return;
        }
      } 
      
      if (editEncoded) {
        // Creator accessed their private edit link
        const decoded = decodeData(editEncoded);
        if (decoded) {
          setData(decoded);
          setMode('editor');
          return;
        }
      }

      // Default: Fresh start in editor
      setMode('editor');
    };
    
    loadParams();
  }, []);

  // Update "?e=" automatically in URL as state changes, so the user's address bar is always their save state.
  useEffect(() => {
    if (mode === 'editor') {
      const encoded = encodeData(data);
      // Replacing state to keep history clean
      window.history.replaceState(null, '', `?e=${encoded}`);
    }
  }, [data, mode]);

  const handleShare = () => {
    const encoded = encodeData(data);
    const shareUrl = `${window.location.origin}${window.location.pathname}?v=${encoded}`;
    navigator.clipboard.writeText(shareUrl);
  };

  if (mode === 'loading') {
    return <div className="h-screen w-full flex items-center justify-center bg-white"><div className="w-8 h-8 rounded-full border-4 border-gray-200 border-t-stone-900 animate-spin"></div></div>;
  }
  
  if (mode === 'error') {
     return <div className="h-screen w-full flex items-center justify-center bg-white"><div className="text-center"><h1 className="text-xl font-bold mb-2">Erro</h1><p className="text-slate-500">Link não encontrado ou expirado.</p></div></div>;
  }

  // PUBLIC VIEW MODE: Take over whole screen
  if (mode === 'view') {
    return <ProfileView data={data} />;
  }

  // EDITOR MODE: Split screen on desktop, togglable on mobile
  return (
    <div className="flex h-screen w-full bg-[#f8f9fa] text-[#1a1a1a] font-sans overflow-hidden select-none">
      
      {/* LEFT PANEL: Editor */}
      <div className={`w-full lg:w-[580px] h-full flex flex-col bg-white border-r border-[#e5e7eb] z-10 transition-transform ${showMobilePreview ? '-translate-x-full lg:translate-x-0 absolute lg:relative hidden lg:flex' : 'flex'}`}>
         <EditorView data={data} onChange={setData} onShare={handleShare} />
      </div>

      {/* RIGHT PANEL: Preview Canvas */}
      <div className={`flex-1 h-full flex-col items-center justify-center relative ${showMobilePreview ? 'flex' : 'hidden lg:flex'}`}>
        <div className="absolute top-8 text-[11px] font-bold uppercase tracking-widest text-slate-400 hidden lg:block">Live Device Preview</div>
        
        {/* Mobile Mockup Wrapper */}
        <div className="w-[300px] h-[620px] bg-[#111] rounded-[48px] p-3 shadow-2xl border-[6px] border-[#222] relative shrink-0">
          
          {/* Dynamic Content Area */}
          <div className="w-full h-full bg-white rounded-[38px] overflow-hidden flex flex-col relative">
             <div className="w-full h-full overflow-y-auto no-scrollbar">
                <ProfileView data={data} />
             </div>
          </div>
          
          {/* Phone Hardware Details */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-[#111] rounded-b-2xl pointer-events-none"></div>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-20 h-1 bg-slate-300 rounded-full opacity-20 pointer-events-none"></div>
        </div>
      </div>

      {/* Mobile Floating Action Button to toggle layout */}
      <div className="lg:hidden fixed bottom-6 right-6 z-50">
        <button 
          onClick={() => setShowMobilePreview(!showMobilePreview)}
          className="bg-black text-white p-4 rounded-full shadow-xl flex items-center justify-center active:scale-95 transition-transform"
        >
          {showMobilePreview ? <Monitor size={24} /> : <Smartphone size={24} />}
        </button>
      </div>
      
    </div>
  );
}
