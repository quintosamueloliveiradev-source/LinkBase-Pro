export interface ProfileLink {
  id: string;
  title: string;
  url: string;
}

export interface ProfileAppearance {
  backgroundColor: string;
  textColor: string;
  buttonColor: string;
  buttonTextColor: string;
  buttonStyle: 'rounded' | 'pill' | 'square';
  fontFamily: 'font-sans' | 'font-outfit';
}

export interface SocialLink {
  id: string;
  platform: 'instagram' | 'twitter' | 'github' | 'linkedin' | 'youtube' | 'facebook' | 'tiktok' | 'mail';
  url: string;
}

export interface ProfileData {
  name: string;
  bio: string;
  avatarUrl: string;
  links: ProfileLink[];
  socials: SocialLink[];
  appearance: ProfileAppearance;
}

export const defaultData: ProfileData = {
  name: "Seu Nome",
  bio: "Bem-vindo(a) à minha página! Aqui você encontra todos os meus links e redes sociais.",
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80",
  links: [
    { id: '1', title: 'Acesse meu Portfólio', url: 'https://example.com' },
    { id: '2', title: 'Siga-me no Instagram', url: 'https://instagram.com' }
  ],
  socials: [],
  appearance: {
    backgroundColor: '#f3f4f6', 
    textColor: '#111827',
    buttonColor: '#111827',
    buttonTextColor: '#ffffff',
    buttonStyle: 'pill',
    fontFamily: 'font-outfit'
  }
};
