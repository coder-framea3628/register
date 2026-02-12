import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft, 
  Check, 
  AlertCircle, 
  X, 
  Loader2, 
  Camera, 
  UploadCloud, 
  ShieldCheck, 
  Mail, 
  MapPin,
  Info
} from 'lucide-react';
import { DotLottiePlayer } from '@dotlottie/react-player';

// ============================================================================
// 1. CONSTANTES E UTILITÁRIOS (DESIGN SYSTEM)
// ============================================================================

const THEME = {
  primary: '#AC865C',     // Marrom Principal
  primaryHover: '#8b6d4d',
  gold: '#B5875C',        // Botões e Destaques
  goldChecked: '#B79670', // Checkbox Ativo
  textMain: '#1F1F1F',
  textLight: '#666666',
  error: '#D32F2F',
  border: '#E0E0E0',
  radius: '12px'
};

// Validadores
const Validators = {
  email: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
  phone: (phone) => /^\(?\d{2}\)?[\s-]?\d{4,5}-?\d{4}$/.test(phone),
  is18Plus: (dateString) => {
    if (!dateString) return false;
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age >= 18;
  }
};

// ============================================================================
// 2. COMPONENTES UI REUTILIZÁVEIS
// ============================================================================

// Botão Principal
const Button = ({ children, variant = 'primary', loading, onClick, disabled, className = '' }) => {
  const baseStyle = "w-full md:w-[310px] h-[48px] rounded-[50px] font-semibold text-[16px] transition-all duration-300 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed mx-auto shadow-lg shadow-[#AC865C]/20";
  
  const variants = {
    primary: { background: THEME.gold, color: '#FFF' },
    secondary: { background: 'transparent', border: `1px solid ${THEME.primary}`, color: THEME.primary },
    ghost: { background: 'transparent', color: THEME.textLight, boxShadow: 'none' }
  };

  return (
    <button 
      onClick={onClick} 
      disabled={disabled || loading}
      className={`${baseStyle} ${className}`}
      style={variants[variant]}
    >
      {loading ? <Loader2 className="animate-spin w-5 h-5" /> : children}
    </button>
  );
};

// Input Genérico
const Input = ({ label, error, icon: Icon, ...props }) => {
  return (
    <div className="w-full mb-5 group">
      {label && <label className="block text-xs md:text-sm font-semibold text-[#666] mb-2 ml-1">{label}</label>}
      <div className="relative">
        {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-[#999] w-5 h-5 transition-colors group-focus-within:text-[#AC865C]" />}
        <input 
          {...props}
          className={`w-full h-[52px] bg-[#F9F9F9] rounded-[12px] px-4 text-[16px] text-[#1F1F1F] outline-none border transition-all placeholder:text-[#BBB] ${Icon ? 'pl-12' : ''}`}
          style={{ borderColor: error ? THEME.error : '#E0E0E0' }}
          onFocus={(e) => e.target.style.borderColor = THEME.primary}
          onBlur={(e) => e.target.style.borderColor = error ? THEME.error : '#E0E0E0'}
        />
        {error && <AlertCircle className="absolute right-4 top-1/2 -translate-y-1/2 text-red-600 w-5 h-5 animate-pulse" />}
      </div>
      {error && <span className="text-[11px] text-red-600 ml-1 mt-1 block font-medium">{error}</span>}
    </div>
  );
};

// Checkbox com Popup Obrigatório
const Checkbox = ({ checked, onChange, label, required, id }) => {
  const [showPopup, setShowPopup] = useState(false);
  const timeoutRef = useRef(null);

  const handleClick = () => {
    if (required && checked) {
      setShowPopup(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setShowPopup(false), 3000);
      return; 
    }
    onChange(!checked);
  };

  return (
    <div className="relative flex items-start gap-3 cursor-pointer group mb-3" onClick={handleClick}>
      <div 
        className={`w-5 h-5 rounded-[6px] border flex items-center justify-center transition-all duration-200 flex-shrink-0 mt-0.5`}
        style={{ 
          borderColor: checked ? THEME.goldChecked : '#999', 
          backgroundColor: checked ? THEME.goldChecked : 'transparent' 
        }}
      >
        {checked && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
      </div>
      <p className="text-[11px] md:text-[12px] leading-[1.5] text-[#444] select-none font-medium">
        {label}
      </p>

      {/* Popup Obrigatório */}
      {showPopup && (
        <div className="absolute left-8 -top-10 bg-[#333] text-white text-[10px] px-3 py-2 rounded-lg shadow-xl animate-in fade-in zoom-in duration-200 z-50 whitespace-nowrap">
          Esta é uma aceitação obrigatória do cadastro.
          <div className="absolute bottom-[-4px] left-2 w-2 h-2 bg-[#333] rotate-45"></div>
        </div>
      )}
    </div>
  );
};

// Modal Genérico
const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-[24px] w-full max-w-[360px] p-6 shadow-2xl animate-in zoom-in-95 duration-200 relative overflow-hidden">
        {children}
        {onClose && (
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 transition-colors">
            <X size={20} />
            </button>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// 3. COMPONENTE PRINCIPAL
// ============================================================================

export default function FrameRegistration() {
  // --- STATE ---
  const [step, setStep] = useState(0); // 0:Terms, 1:Role, 2:Form, 3:Verify, 4:2FA
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Modais
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [showResendModal, setShowResendModal] = useState(false);
  const [showTimeoutModal, setShowTimeoutModal] = useState(false);

  // Timer 2FA
  const [timer, setTimer] = useState(300); // 5 min
  const [isTimerExpired, setIsTimerExpired] = useState(false);

  const [formData, setFormData] = useState({
    acceptedTermsInitial: false,
    // Client & Creator Common
    fullName: '',
    email: '',
    finalTerms: false,
    // Creator Specifics
    displayName: '',
    birthDate: '',
    gender: '',
    whatsapp: '',
    location: '',
    bio: '',
    photos: [], // Array de File objects (simulado)
    services: [], // Array de strings
    creatorTerm: false
  });

  // --- LOCAL STORAGE & INIT ---
  useEffect(() => {
    const saved = localStorage.getItem('frame_reg_progress_v2');
    if (saved) {
      const parsed = JSON.parse(saved);
      const now = new Date().getTime();
      // 2 horas de expiração
      if (now - parsed.timestamp < 2 * 60 * 60 * 1000) {
        setFormData(parsed.data);
        setRole(parsed.role);
        // Se estava no meio do processo, volta pra verificação (conforme pedido) ou passo atual
        // Mas se estiver nos passos iniciais, recupera o passo.
        if (parsed.step > 2) {
            setStep(3); // Volta para validação de identidade se já tinha avançado
            // Popup Toast Logic (simulado visualmente no render)
        } else {
            setStep(parsed.step);
        }
      } else {
        localStorage.removeItem('frame_reg_progress_v2');
      }
    }
  }, []);

  useEffect(() => {
    if (step > 0) {
      localStorage.setItem('frame_reg_progress_v2', JSON.stringify({
        step, role, data: formData, timestamp: new Date().getTime()
      }));
    }
  }, [step, role, formData]);

  // --- ACTIONS ---

  const handleNext = () => {
    setStep(prev => prev + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    if (step === 0) return;
    setStep(prev => prev - 1);
  };

  const handleGoogleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setShowGoogleModal(true);
    }, 1500);
  };

  // Validação do Form
  const validateForm = () => {
    let newErrors = {};
    let isValid = true;

    // Criadora Flow
    if (role === 'creator' && step === 2) {
        if (!formData.displayName) newErrors.displayName = "Nome de exibição obrigatório";
        if (!formData.whatsapp) newErrors.whatsapp = "WhatsApp obrigatório";
        if (!formData.gender) newErrors.gender = "Selecione uma identidade";
        if (!formData.location) newErrors.location = "Cidade e Estado obrigatórios";
        if (!formData.bio) newErrors.bio = "Conte um pouco sobre você";
        
        if (!formData.birthDate) {
            newErrors.birthDate = "Data obrigatória";
        } else if (!Validators.is18Plus(formData.birthDate)) {
            newErrors.birthDate = "Você deve ser maior de 18 anos.";
        }

        if (formData.photos.length < 3) {
           newErrors.photos = "Selecione pelo menos 3 fotos.";
        }

        if (!formData.creatorTerm) {
            newErrors.creatorTerm = "Aceite obrigatório.";
        }
        
        // Se passar nas de criadora, valida as comuns
        if (Object.keys(newErrors).length === 0) {
             if (!formData.fullName.includes(' ')) newErrors.fullName = "Digite seu nome completo";
             if (!Validators.email(formData.email)) newErrors.email = "E-mail inválido";
             if (!formData.finalTerms) newErrors.finalTerms = "Aceite os termos finais.";
        }
    } 
    // Cliente Flow
    else if (role === 'client' && step === 2) {
        if (!formData.fullName.includes(' ')) newErrors.fullName = "Digite seu nome completo";
        if (!Validators.email(formData.email)) newErrors.email = "E-mail inválido";
        if (!formData.finalTerms) newErrors.finalTerms = "Aceite os termos finais.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Foto Mock Upload
  const handlePhotoUpload = () => {
      // Mockando upload
      const newPhoto = { id: Date.now(), url: null }; // Placeholder
      if (formData.photos.length < 5) {
          setFormData(prev => ({...prev, photos: [...prev.photos, newPhoto]}));
      }
  };

  // --- RENDERERS ---

  // STEP 0: Termos Iniciais
  const renderStep0 = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col items-center">
      <h1 className="text-[22px] md:text-[32px] font-bold text-[#1F1F1F] mb-6 font-montserrat text-center">
        Olá, usuário! Vamos <br/> iniciar seu cadastro?
      </h1>

      <div className="bg-[#F9F9F9] p-5 rounded-[16px] border border-[#EEE] mb-6 space-y-3 w-full">
        <div className="flex gap-3">
             <Info className="text-[#AC865C] w-6 h-6 flex-shrink-0 mt-1" />
             <div className="text-[13px] text-[#555] leading-relaxed">
                <strong className="text-[#AC865C] block mb-1">Tecnologia & Segurança</strong>
                A Frame é uma plataforma de tecnologia. Não oferecemos, agenciamos nem intermediamos qualquer tipo de serviço pessoal.
             </div>
        </div>
        <p className="text-[13px] text-[#555] leading-relaxed pl-9">
          Toda interação é de responsabilidade exclusiva das criadoras e contratantes. Atuamos apenas como infraestrutura segura.
        </p>
        <a href="https://frameag.com/termos" target="_blank" rel="noreferrer" className="text-[12px] font-bold text-[#AC865C] pl-9 hover:underline block mt-2">
            Saiba mais &rarr;
        </a>
      </div>

      <div className="mb-8 w-full">
        <Checkbox 
          label="Declaro que li e compreendi que a Frame atua exclusivamente como provedora de tecnologia."
          checked={formData.acceptedTermsInitial}
          required={true}
          onChange={(val) => setFormData({...formData, acceptedTermsInitial: val})}
        />
      </div>

      <Button onClick={handleNext} disabled={!formData.acceptedTermsInitial}>
        Criar perfil
      </Button>
    </div>
  );

  // STEP 1: Seleção de Perfil
  const renderStep1 = () => (
    <div className="flex flex-col gap-5 animate-in fade-in duration-500 w-full">
      <h2 className="text-[22px] md:text-[32px] font-bold text-center mb-2 font-montserrat">Como deseja usar a Frame?</h2>
      
      {/* Card Contratante */}
      <div 
        onClick={() => { setRole('client'); handleNext(); }}
        className="relative h-[237px] w-full rounded-[11.4px] overflow-hidden cursor-pointer group shadow-md hover:shadow-xl transition-all"
      >
        <img src="https://framerusercontent.com/images/eQKQHJqfVEEplailgyBYUVnZR8.png" className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Contratante" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex flex-col justify-end p-6">
          <h3 className="text-white text-[24px] font-bold font-montserrat">Sou Contratante</h3>
          <p className="text-white/80 text-[13px]">Busco experiências exclusivas</p>
        </div>
      </div>

      {/* Card Criadora */}
      <div 
        onClick={() => { setRole('creator'); handleNext(); }}
        className="relative h-[237px] w-full rounded-[11.4px] overflow-hidden cursor-pointer group shadow-md hover:shadow-xl transition-all"
      >
        <img src="https://framerusercontent.com/images/fS4mv3zxDQyalRIXMRRcKt18GDE.png" className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Criadora" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex flex-col justify-end p-6">
          <h3 className="text-white text-[24px] font-bold font-montserrat">Sou Criadora</h3>
          <p className="text-white/80 text-[13px]">Quero anunciar meu perfil</p>
        </div>
      </div>
    </div>
  );

  // STEP 2: Formulário
  const renderStep2 = () => (
    <div className="animate-in fade-in slide-in-from-right-8 duration-500 w-full">
      
      <div className="text-center mb-8">
        <h2 className="text-[24px] md:text-[32px] font-bold text-[#AC865C] mb-1 font-montserrat">Frame Agency</h2>
        <p className="text-[14px] text-[#666]">Complete seus dados</p>
      </div>

      <button 
        onClick={handleGoogleLogin}
        className="w-full h-[52px] bg-white border border-[#E0E0E0] rounded-[50px] flex items-center justify-center gap-3 text-[#555] font-medium text-[14px] hover:bg-[#F9F9F9] transition-all mb-8 relative overflow-hidden shadow-sm"
      >
        {loading ? <Loader2 className="animate-spin text-[#AC865C]" /> : (
          <>
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="G" />
            Continuar com o Google
          </>
        )}
      </button>

      {/* Se for Criadora, campos extras aparecem antes */}
      {role === 'creator' && (
        <div className="mb-8 p-0 space-y-5 animate-in fade-in duration-700">
             <div className="flex items-center gap-2 mb-4">
                 <div className="w-1 h-6 bg-[#AC865C] rounded-full"></div>
                 <h3 className="text-[18px] font-semibold text-[#1F1F1F]">Perfil Profissional</h3>
             </div>

             <Input 
                label="Nome Artístico" 
                placeholder="Como quer ser chamada?"
                value={formData.displayName}
                onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                error={errors.displayName}
             />
             
             <div className="flex gap-4 flex-col md:flex-row">
               <div className="flex-1">
                 <Input 
                   label="Nascimento" 
                   type="date"
                   value={formData.birthDate}
                   onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
                   error={errors.birthDate}
                 />
               </div>
               <div className="flex-1">
                  <label className="block text-xs md:text-sm font-semibold text-[#666] mb-2 ml-1">Identidade de Gênero</label>
                  <select 
                    className="w-full h-[52px] bg-[#F9F9F9] rounded-[12px] px-4 text-[16px] outline-none border transition-all text-[#1F1F1F] appearance-none"
                    style={{ borderColor: errors.gender ? THEME.error : '#E0E0E0' }}
                    value={formData.gender}
                    onChange={(e) => setFormData({...formData, gender: e.target.value})}
                  >
                    <option value="">Selecione...</option>
                    <option value="cis">Mulher Cisgênero</option>
                    <option value="trans">Mulher Trans</option>
                    <option value="travesti">Travesti</option>
                  </select>
                  {errors.gender && <span className="text-[11px] text-red-600 ml-1 mt-1 block">{errors.gender}</span>}
               </div>
             </div>

             <Input 
                label="WhatsApp" 
                placeholder="(11) 99999-9999"
                value={formData.whatsapp}
                onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                error={errors.whatsapp}
             />
             
             <Input 
                label="Cidade e Estado" 
                placeholder="Ex: São Paulo, SP"
                icon={MapPin}
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                error={errors.location}
             />

            {/* Upload Mock */}
             <div>
                <label className="block text-xs md:text-sm font-semibold text-[#666] mb-2 ml-1">Suas melhores fotos (3 a 5)</label>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                   {formData.photos.map((photo, idx) => (
                      <div key={idx} className="w-[80px] h-[80px] rounded-lg bg-[#EEE] flex-shrink-0 relative overflow-hidden">
                          <img src="https://framerusercontent.com/images/fS4mv3zxDQyalRIXMRRcKt18GDE.png" className="w-full h-full object-cover opacity-60" alt="preview" />
                          <div className="absolute top-1 right-1 bg-black/50 rounded-full p-1 cursor-pointer">
                              <X className="w-3 h-3 text-white" />
                          </div>
                      </div>
                   ))}
                   {formData.photos.length < 5 && (
                     <div 
                        onClick={handlePhotoUpload}
                        className="w-[80px] h-[80px] bg-[#F9F9F9] rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-[#AAA] flex-shrink-0 cursor-pointer hover:border-[#AC865C] transition-colors group"
                     >
                        <Camera className="text-[#999] w-6 h-6 group-hover:text-[#AC865C]" />
                        <span className="text-[10px] text-[#999] mt-1">Add</span>
                     </div>
                   )}
                </div>
                <p className="text-[10px] text-[#999] mt-1">Máx 4MB. JPG ou PNG.</p>
                {errors.photos && <span className="text-[11px] text-red-600 block">{errors.photos}</span>}
             </div>

             <div>
                <label className="block text-xs md:text-sm font-semibold text-[#666] mb-2 ml-1">Biografia</label>
                <textarea 
                    className="w-full h-[100px] bg-[#F9F9F9] rounded-[12px] p-4 text-[16px] outline-none border border-[#E0E0E0] focus:border-[#AC865C] resize-none"
                    placeholder="Fale sobre você e seus serviços..."
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                ></textarea>
                {errors.bio && <span className="text-[11px] text-red-600 block">{errors.bio}</span>}
             </div>

             <div className="bg-[#FFF8F0] p-4 rounded-xl border border-[#EADDD1]">
                <Checkbox 
                  label="Afirmo ser maior de 18 anos, estar de acordo com a Política de Privacidade e Exibição Pública."
                  checked={formData.creatorTerm}
                  required={true}
                  onChange={(val) => setFormData({...formData, creatorTerm: val})}
                />
                {errors.creatorTerm && <span className="text-[11px] text-red-600 font-bold block ml-8">Aceite obrigatório</span>}
             </div>
             
             <div className="w-full h-[1px] bg-[#EEE] my-6"></div>
        </div>
      )}

      {/* Dados Comuns (Login) */}
      <div className="flex items-center gap-2 mb-4">
            {role === 'creator' && <div className="w-1 h-6 bg-[#AC865C] rounded-full"></div>}
            <h3 className="text-[18px] font-semibold text-[#1F1F1F]">Dados de Acesso</h3>
      </div>

      <Input 
        label="Nome Completo (Oficial)" 
        placeholder="Digite seu nome completo"
        value={formData.fullName}
        onChange={(e) => setFormData({...formData, fullName: e.target.value})}
        error={errors.fullName}
      />

      <Input 
        label="E-mail" 
        placeholder="seu@email.com"
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({...formData, email: e.target.value})}
        error={errors.email}
        icon={Mail}
      />

      <div className="mt-6 space-y-3 mb-8">
         <Checkbox 
           label="Autorizo o envio de e-mails com informações, promoções e conteúdos."
           checked={true}
           onChange={() => {}} 
         />
         <Checkbox 
           label="Li e concordo com os Termos e Condições da Frame."
           checked={formData.finalTerms}
           required={true}
           onChange={(val) => setFormData({...formData, finalTerms: val})}
         />
         {errors.finalTerms && <span className="text-[11px] text-red-600 ml-8 block">Você precisa concordar para continuar.</span>}
      </div>

      <Button onClick={() => { if(validateForm()) handleNext(); }}>
        Continuar
      </Button>
    </div>
  );

  // STEP 3: Verificação de Identidade
  const renderStep3 = () => (
    <div className="flex flex-col items-center animate-in zoom-in-95 duration-500 w-full text-center">
      <div className="w-[280px] h-[280px] mb-4">
         <iframe 
            src="https://lottie.host/embed/27108e59-5743-41a0-980f-c45cc774f50e/qT7a4kmpdD.lottie"
            style={{width: '100%', height: '100%', border: 'none'}}
            title="Identity Animation"
         ></iframe>
      </div>
      
      <h2 className="text-[24px] md:text-[32px] font-bold mb-3 font-montserrat">Validar Identidade</h2>
      <p className="text-[#666] text-[14px] mb-8 max-w-[340px] leading-relaxed">
        Para garantir a segurança da comunidade, precisamos validar que você é uma pessoa real.
      </p>

      <Button 
        onClick={() => window.open('https://www.frameag.com/becomeframe-facial-verification', '_blank')}
        className="mb-4"
      >
        <ShieldCheck className="w-5 h-5" /> Iniciar validação facial
      </Button>

      {/* Lógica de botão secundário */}
      {role === 'client' ? (
        <button 
          onClick={handleNext} 
          className="text-[#AC865C] text-[14px] font-medium hover:underline mt-2 p-2"
        >
          Sou contratante, seguir sem verificação
        </button>
      ) : (
          <div className="mt-2 bg-red-50 text-red-600 text-[12px] px-4 py-2 rounded-full border border-red-100 flex items-center gap-2">
            <AlertCircle size={14} /> Etapa obrigatória para criadoras
          </div>
      )}
    </div>
  );

  // STEP 4: 2FA (Código)
  const CodeInput = () => {
    const inputs = useRef([]);

    const handleChange = (i, e) => {
       const val = e.target.value;
       if (isNaN(val)) return;
       
       if (val.length === 1 && i < 4) {
           inputs.current[i + 1].focus();
       }
       if (val.length === 0 && i > 0) {
           // Backspace logic handled by onKeyDown usually, but simplistic here
       }
    };

    const handleKeyDown = (i, e) => {
        if (e.key === 'Backspace' && !e.target.value && i > 0) {
            inputs.current[i - 1].focus();
        }
    }

    const handlePaste = (e) => {
      e.preventDefault();
      if(isTimerExpired) return;

      const paste = e.clipboardData.getData('text').slice(0, 5);
      if (paste.length === 5 && !isNaN(paste)) {
        paste.split('').forEach((char, i) => {
          if (inputs.current[i]) inputs.current[i].value = char;
        });
        inputs.current[4].focus();
      }
    };

    return (
      <div className="flex justify-center gap-3 mb-8">
        {[0,1,2,3,4].map((i) => (
          <input
            key={i}
            ref={el => inputs.current[i] = el}
            type="tel"
            maxLength={1}
            disabled={isTimerExpired}
            className={`w-[50px] h-[60px] md:w-[60px] md:h-[70px] border rounded-[12px] text-center text-[24px] font-bold text-[#AC865C] bg-[#F9F9F9] outline-none transition-all focus:border-[#AC865C] focus:bg-white focus:shadow-md ${isTimerExpired ? 'opacity-50 cursor-not-allowed' : ''}`}
            onChange={(e) => handleChange(i, e)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={i === 0 ? handlePaste : undefined}
          />
        ))}
      </div>
    );
  };

  useEffect(() => {
    if (step === 4) {
        if (timer > 0) {
            const interval = setInterval(() => setTimer(t => t - 1), 1000);
            return () => clearInterval(interval);
        } else {
            setIsTimerExpired(true);
            setShowTimeoutModal(true);
        }
    }
  }, [step, timer]);

  const handleResend = () => {
      setShowResendModal(true);
      setTimer(300);
      setIsTimerExpired(false);
      // Reset inputs logic would go here
  };

  const renderStep4 = () => (
    <div className="animate-in fade-in duration-500 w-full">
      
      {/* Email Display Widget */}
      <div className="flex justify-center mb-8">
          <div className="bg-white border border-[#E0E0E0] rounded-full pl-2 pr-6 py-2 flex items-center gap-3 shadow-sm">
             <img 
               src={role === 'creator' && formData.photos.length > 0 ? "https://framerusercontent.com/images/fS4mv3zxDQyalRIXMRRcKt18GDE.png" : "https://framerusercontent.com/images/sz5ueC0VcN5fohNrik0bUG9oJbI.png"} 
               className="w-10 h-10 rounded-full object-cover border border-[#EEE]"
               alt="Avatar"
             />
             <div className="flex flex-col">
                 <span className="text-[10px] text-[#AC865C] font-bold uppercase tracking-wider">Enviamos para</span>
                 <span className="text-[13px] text-[#333] font-medium">{formData.email || 'email@exemplo.com'}</span>
             </div>
          </div>
      </div>

      <div className="text-center mb-6">
        <h2 className="text-[22px] md:text-[32px] font-bold mb-2 font-montserrat">Digite o código</h2>
        <p className="text-[#666] text-[14px]">
          Insira a chave de 5 dígitos enviada para seu e-mail.
        </p>
      </div>

      <CodeInput />

      <div className="text-center mb-8">
        <p className={`text-[14px] font-bold font-mono ${timer === 0 ? 'text-red-500' : 'text-[#AC865C]'}`}>
           {timer > 0 ? `${Math.floor(timer / 60)}:${(timer % 60).toString().padStart(2, '0')}` : 'Código expirado'}
        </p>
      </div>

      <Button onClick={() => alert('Fluxo Finalizado!')} disabled={isTimerExpired}>
        Confirmar Acesso
      </Button>

      <button 
        onClick={handleResend} 
        className="w-full mt-6 text-[#999] text-[13px] hover:text-[#AC865C] transition-colors underline decoration-dotted"
      >
        Não recebi o código? Reenviar
      </button>
    </div>
  );

  // ============================================================================
  // 4. ESTRUTURA GLOBAL E LAYOUT
  // ============================================================================

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&family=Poppins:wght@400;500;600&display=swap');
        
        body { font-family: 'Poppins', sans-serif; background: #F5F5F5; color: #1F1F1F; margin: 0; }
        .font-montserrat { font-family: 'Montserrat', sans-serif; }
        
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

        /* Custom Scrollbar for container */
        .custom-scroll::-webkit-scrollbar { width: 6px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #E0E0E0; border-radius: 4px; }
        .custom-scroll::-webkit-scrollbar-thumb:hover { background: #AC865C; }
      `}</style>

      <div className="min-h-screen w-full flex items-center justify-center p-0 md:p-6 bg-[#F2F4F6]">
        
        <div className="w-full md:max-w-[800px] bg-white md:rounded-[24px] min-h-[100vh] md:min-h-[700px] md:h-auto relative shadow-2xl overflow-hidden flex flex-col md:border-[1px] md:border-[#AC865C]/20">
          
          {/* Header & Progress */}
          <div className="px-6 pt-8 pb-4 bg-white z-10">
            <div className="flex items-center justify-between mb-6">
              <button 
                 onClick={handleBack} 
                 className={`w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#F9F9F9] transition-all ${step === 0 ? 'invisible' : ''}`}
              >
                  <ChevronLeft className="text-[#333]" size={26} />
              </button>
              
              <div className="text-[11px] font-bold text-[#AC865C] tracking-[0.2em] uppercase">
                {step === 0 ? 'BEM-VINDO' : `PASSO ${step} DE 4`}
              </div>
              
              <div className="w-10"></div> {/* Spacer */}
            </div>

            {/* Progress Bar Dots */}
            <div className="flex gap-2 justify-center mb-2">
                {[0,1,2,3,4].map((i) => (
                    <div 
                       key={i} 
                       className={`h-1.5 rounded-full transition-all duration-500 ${i <= step ? 'w-8 bg-[#AC865C]' : 'w-2 bg-[#EEE]'}`}
                    ></div>
                ))}
            </div>
          </div>

          {/* Dynamic Content Area */}
          <div className="flex-1 px-6 md:px-12 py-4 overflow-y-auto custom-scroll">
            <div className="max-w-[440px] mx-auto w-full">
                {step === 0 && renderStep0()}
                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
                {step === 4 && renderStep4()}
            </div>
          </div>

          {/* Footer Disclaimer */}
          <div className="px-6 py-6 border-t border-[#ECEFF1] bg-white mt-auto">
             <div className="max-w-[500px] mx-auto text-[10px] text-[#999] text-center leading-[1.6] border border-[#ECEFF1] rounded-lg p-3 bg-[#FAFAFA]">
               Ao se cadastrar, você atesta ter concordado com a <a href="https://frameag.com/privacy" className="text-[#876D42] font-semibold hover:text-[#AC865C] no-underline transition-colors">Política de Privacidade</a>, <a href="https://frameag.com/legal/refund" className="text-[#876D42] font-semibold hover:text-[#AC865C] no-underline transition-colors">Reembolso</a> e os <a href="https://frameag.com/termos" className="text-[#876D42] font-semibold hover:text-[#AC865C] no-underline transition-colors">Termos da Frame Agency</a>.
               <br/>
               <span className="opacity-70">Atente-se, a Frame não cobra taxas de cadastro. Marque como SPAM e-mails que não terminem com: <strong>@frameag.com</strong></span>
             </div>
          </div>

        </div>
      </div>

      {/* --- MODAIS DE SISTEMA --- */}

      {/* 1. Google Error Modal */}
      <Modal isOpen={showGoogleModal} onClose={() => setShowGoogleModal(false)}>
         <div className="flex flex-col items-center text-center pt-2">
            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mb-4 text-red-500 animate-in zoom-in">
               <X size={32} />
            </div>
            <h3 className="text-[18px] font-bold mb-2 font-montserrat">Oops!</h3>
            <p className="text-[14px] text-[#666] mb-6 leading-relaxed">
              Não foi possível identificar uma conta Google no seu navegador. Insira seu e-mail manualmente no campo.
            </p>
            <Button onClick={() => setShowGoogleModal(false)} className="!w-full h-[42px]">Fechar</Button>
         </div>
      </Modal>

      {/* 2. Timeout Modal (Fallback) */}
      <Modal isOpen={showTimeoutModal} onClose={() => window.location.reload()}>
         <div className="flex flex-col items-center text-center pt-2">
            <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center mb-4 text-amber-500">
               <AlertCircle size={32} />
            </div>
            <h3 className="text-[18px] font-bold mb-2 font-montserrat">Tempo esgotado</h3>
            <p className="text-[14px] text-[#666] mb-6">
              O tempo para verificação expirou por segurança. Por favor, reinicie o processo.
            </p>
            <Button onClick={() => window.location.reload()} className="!w-full h-[42px]">Reiniciar</Button>
         </div>
      </Modal>

      {/* 3. Resend Code Modal */}
      <Modal isOpen={showResendModal} onClose={() => setShowResendModal(false)}>
         <div className="flex flex-col items-center text-center">
             <div className="w-[180px] h-[180px]">
                <iframe 
                   src="https://lottie.host/embed/a11872ae-9848-45ba-8871-fa870929372e/YWZlUTBnMU.lottie"
                   style={{width: '100%', height: '100%', border: 'none'}}
                   title="Email Sending"
                ></iframe>
             </div>
             <h3 className="text-[18px] font-bold mb-2 font-montserrat">Código Reenviado!</h3>
             <p className="text-[14px] text-[#666] mb-6">
                Acabamos de enviar um novo código para <strong>{formData.email}</strong>. Verifique sua caixa de SPAM.
             </p>
             <Button onClick={() => setShowResendModal(false)} className="!w-full h-[42px]">Entendi</Button>
         </div>
      </Modal>

    </>
  );
}