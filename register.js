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
  Lock 
} from 'lucide-react';
import { DotLottiePlayer } from '@dotlottie/react-player';

// ============================================================================
// 1. CONFIGURAÇÃO E UTILITÁRIOS (PALETA FRAME AUTHENTIC)
// ============================================================================

const THEME = {
  primary: '#AC865C',     // Marrom Premium
  primaryDark: '#8b6d4d', // Hover
  gold: '#C29A63',        // Destaques
  bg: '#FFFFFF',
  surface: '#F9F9F9',
  text: '#1F1F1F',
  textLight: '#666666',
  error: '#D32F2F',
  border: '#E0E0E0',
  radius: '12px'
};

// Hook de Vibração (Haptic)
const useHaptic = () => {
  const trigger = (pattern = [50]) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  };
  return trigger;
};

// Validações
const Validators = {
  email: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
  phone: (phone) => /^\(?\d{2}\)?[\s-]?\d{4,5}-?\d{4}$/.test(phone),
  is18Plus: (dateString) => {
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age >= 18;
  }
};

// ============================================================================
// 2. COMPONENTES DE UI REUTILIZÁVEIS
// ============================================================================

const Button = ({ children, variant = 'primary', loading, onClick, disabled, className = '' }) => {
  const baseStyle = "w-full h-[48px] rounded-[50px] font-semibold text-[16px] transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed";
  
  const variants = {
    primary: { background: THEME.primary, color: '#FFF', boxShadow: '0 4px 12px rgba(172, 134, 92, 0.3)' },
    secondary: { background: 'transparent', border: `1px solid ${THEME.primary}`, color: THEME.primary },
    ghost: { background: 'transparent', color: THEME.textLight, height: 'auto', padding: '10px' }
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

const Input = ({ label, error, icon: Icon, ...props }) => {
  return (
    <div className="w-full mb-4 group">
      {label && <label className="block text-xs font-semibold text-[#666] mb-1.5 ml-2 uppercase tracking-wider">{label}</label>}
      <div className="relative">
        {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-[#999] w-5 h-5" />}
        <input 
          {...props}
          className={`w-full h-[52px] bg-[#F5F5F5] rounded-[12px] px-4 text-[16px] text-[#1F1F1F] outline-none border-2 transition-all placeholder:text-[#BBB] ${Icon ? 'pl-12' : ''}`}
          style={{ borderColor: error ? THEME.error : 'transparent' }}
          onFocus={(e) => e.target.style.borderColor = THEME.primary}
          onBlur={(e) => e.target.style.borderColor = error ? THEME.error : 'transparent'}
        />
        {error && <AlertCircle className="absolute right-4 top-1/2 -translate-y-1/2 text-red-600 w-5 h-5 animate-pulse" />}
      </div>
      {error && <span className="text-[11px] text-red-600 ml-2 mt-1 block">{error}</span>}
    </div>
  );
};

const Checkbox = ({ checked, onChange, label, required }) => {
  const haptic = useHaptic();
  
  const handleAttemptChange = () => {
    if (required && checked) {
      haptic([50, 50, 50]);
      // A lógica do popup obrigatório seria disparada aqui pelo pai
      return; 
    }
    onChange(!checked);
  };

  return (
    <div className="flex items-start gap-3 cursor-pointer group" onClick={handleAttemptChange}>
      <div 
        className={`w-5 h-5 rounded-[6px] border-2 flex items-center justify-center transition-colors flex-shrink-0 mt-0.5`}
        style={{ 
          borderColor: checked ? THEME.primary : '#DDD', 
          backgroundColor: checked ? THEME.primary : 'transparent' 
        }}
      >
        {checked && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
      </div>
      <p className="text-[13px] leading-[1.4] text-[#444] select-none">
        {label}
      </p>
    </div>
  );
};

// Modal Genérico
const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-[24px] w-full max-w-[360px] p-6 shadow-2xl scale-100 animate-in zoom-in-95 duration-200 relative overflow-hidden">
        {children}
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800">
          <X size={20} />
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// 3. COMPONENTE PRINCIPAL: FRAME REGISTRATION
// ============================================================================

export default function FrameRegistration() {
  // --- STATE ---
  const [step, setStep] = useState(0); // 0:Intro, 1:Role, 2:Form, 3:Verify, 4:2FA
  const [role, setRole] = useState(null); // 'client' | 'creator'
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [showResendModal, setShowResendModal] = useState(false);
  const [showMandatoryPopup, setShowMandatoryPopup] = useState(null); // ID do checkbox
  const [timer, setTimer] = useState(300); // 5 min
  
  const haptic = useHaptic();

  const [formData, setFormData] = useState({
    acceptedTerms: true, // Default checked
    fullName: '',
    email: '',
    // Creator specifics
    displayName: '',
    birthDate: '',
    gender: '',
    whatsapp: '',
    location: '',
    bio: '',
    services: [],
    finalTerms: true
  });

  // --- LOCAL STORAGE & INIT ---
  useEffect(() => {
    const saved = localStorage.getItem('frame_reg_progress');
    if (saved) {
      const parsed = JSON.parse(saved);
      const now = new Date().getTime();
      // Expira em 2 horas
      if (now - parsed.timestamp < 2 * 60 * 60 * 1000) {
        setFormData(parsed.data);
        setRole(parsed.role);
        setStep(parsed.step > 0 ? parsed.step : 0);
        // Toast logic could go here
      } else {
        localStorage.removeItem('frame_reg_progress');
      }
    }
  }, []);

  useEffect(() => {
    if (step > 0) {
      localStorage.setItem('frame_reg_progress', JSON.stringify({
        step, role, data: formData, timestamp: new Date().getTime()
      }));
    }
  }, [step, role, formData]);

  // --- ACTIONS ---

  const handleNext = () => {
    haptic();
    setStep(prev => prev + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    if (step === 0) return;
    setStep(prev => prev - 1);
  };

  const validateStep2 = () => {
    let newErrors = {};
    if (!formData.fullName.includes(' ')) newErrors.fullName = "Digite seu nome completo";
    if (!Validators.email(formData.email)) newErrors.email = "E-mail inválido";
    
    if (role === 'creator') {
      if (!formData.displayName) newErrors.displayName = "Nome de exibição obrigatório";
      if (!Validators.is18Plus(formData.birthDate)) newErrors.birthDate = "Você precisa ser maior de 18 anos";
      if (!formData.whatsapp) newErrors.whatsapp = "WhatsApp obrigatório";
      if (!formData.gender) newErrors.gender = "Selecione uma identidade";
    }

    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      haptic([50, 50, 50]);
      return false;
    }
    return true;
  };

  const handleGoogleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setShowGoogleModal(true);
      haptic([50, 100]);
    }, 1500);
  };

  // --- RENDERIZADORES DE ETAPAS ---

  // STEP 0: Termos Iniciais
  const renderStep0 = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-8">
        <h1 className="text-[28px] font-bold text-[#1F1F1F] mb-2 font-montserrat">Olá, usuário! Vamos iniciar seu cadastro?</h1>
      </div>

      <div className="bg-[#F9F9F9] p-6 rounded-[16px] border border-[#EEE] mb-6 space-y-4">
        <p className="text-[13px] text-[#555] leading-relaxed">
          <strong className="text-[#AC865C]">Importante:</strong> A Frame é uma plataforma de tecnologia. Não oferecemos, agenciamos nem intermediamos qualquer tipo de serviço pessoal.
        </p>
        <p className="text-[13px] text-[#555] leading-relaxed">
          Toda interação é de responsabilidade exclusiva das criadoras e contratantes. Atuamos apenas como infraestrutura segura.
        </p>
      </div>

      <div className="mb-8">
        <Checkbox 
          label="Declaro que li e compreendi que a Frame atua exclusivamente como provedora de tecnologia."
          checked={formData.acceptedTerms}
          required={true}
          onChange={() => setShowMandatoryPopup('terms')}
        />
        {showMandatoryPopup === 'terms' && (
           <div className="absolute bg-[#333] text-white text-[11px] p-2 rounded-lg mt-2 animate-bounce z-10">
             Esta aceitação é obrigatória.
           </div>
        )}
      </div>

      <Button onClick={handleNext}>
        Criar perfil
      </Button>
    </div>
  );

  // STEP 1: Seleção de Perfil
  const renderStep1 = () => (
    <div className="flex flex-col gap-4 animate-in fade-in duration-500">
      <h2 className="text-[22px] font-bold text-center mb-2">Como você deseja usar a Frame?</h2>
      
      {/* Card Contratante */}
      <div 
        onClick={() => { setRole('client'); handleNext(); }}
        className="relative h-[200px] rounded-[16px] overflow-hidden cursor-pointer group border-2 border-transparent hover:border-[#AC865C] transition-all"
      >
        <img src="https://framerusercontent.com/images/eQKQHJqfVEEplailgyBYUVnZR8.png" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Contratante" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-6">
          <h3 className="text-white text-[20px] font-bold">Sou Contratante</h3>
          <p className="text-white/80 text-[12px]">Busco experiências exclusivas</p>
        </div>
      </div>

      {/* Card Criadora */}
      <div 
        onClick={() => { setRole('creator'); handleNext(); }}
        className="relative h-[200px] rounded-[16px] overflow-hidden cursor-pointer group border-2 border-transparent hover:border-[#AC865C] transition-all"
      >
        <img src="https://framerusercontent.com/images/fS4mv3zxDQyalRIXMRRcKt18GDE.png" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Criadora" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-6">
          <h3 className="text-white text-[20px] font-bold">Sou Criadora</h3>
          <p className="text-white/80 text-[12px]">Quero anunciar meu perfil</p>
        </div>
      </div>
    </div>
  );

  // STEP 2: Dados Cadastrais (Dinâmico)
  const renderStep2 = () => (
    <div className="animate-in fade-in slide-in-from-right-8 duration-500">
      <div className="text-center mb-6">
        <h2 className="text-[24px] font-bold text-[#AC865C] mb-1">Frame Agency</h2>
        <p className="text-[14px] text-[#666]">Vamos criar seu acesso</p>
      </div>

      {/* Botão Google */}
      <button 
        onClick={handleGoogleLogin}
        className="w-full h-[50px] bg-white border border-[#DDD] rounded-[50px] flex items-center justify-center gap-3 text-[#555] font-medium text-[14px] hover:bg-[#F9F9F9] transition-all mb-6 relative overflow-hidden"
      >
        {loading ? <Loader2 className="animate-spin text-[#AC865C]" /> : (
          <>
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="G" />
            Continuar com o Google
          </>
        )}
      </button>

      <div className="flex items-center gap-4 mb-6">
        <div className="h-[1px] bg-[#EEE] flex-1"></div>
        <span className="text-[12px] text-[#999] uppercase">Ou preencha</span>
        <div className="h-[1px] bg-[#EEE] flex-1"></div>
      </div>

      {/* Inputs Base */}
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

      {/* Inputs Específicos de Criadora */}
      {role === 'creator' && (
        <div className="space-y-4 animate-in fade-in duration-700">
          <div className="p-4 bg-[#FDF8F3] rounded-xl border border-[#EADDD1] mb-4">
             <p className="text-[12px] text-[#8b6d4d] font-medium mb-2">🚀 Área exclusiva para Criadoras</p>
             
             <Input 
                label="Nome Artístico (Exibição)" 
                placeholder="Como quer ser chamada?"
                value={formData.displayName}
                onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                error={errors.displayName}
             />
             
             <div className="flex gap-3">
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
                  <label className="block text-xs font-semibold text-[#666] mb-1.5 ml-2">Gênero</label>
                  <select 
                    className="w-full h-[52px] bg-[#F5F5F5] rounded-[12px] px-4 text-[14px] outline-none border-2 border-transparent focus:border-[#AC865C]"
                    value={formData.gender}
                    onChange={(e) => setFormData({...formData, gender: e.target.value})}
                  >
                    <option value="">Selecione</option>
                    <option value="cis">Mulher Cis</option>
                    <option value="trans">Mulher Trans</option>
                    <option value="travesti">Travesti</option>
                  </select>
                  {errors.gender && <span className="text-[11px] text-red-600 ml-2">{errors.gender}</span>}
               </div>
             </div>

             <Input 
                label="WhatsApp" 
                placeholder="(11) 99999-9999"
                value={formData.whatsapp}
                onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                error={errors.whatsapp}
             />

             {/* Upload Mock */}
             <div className="mt-4">
                <label className="block text-xs font-semibold text-[#666] mb-2 ml-2">Suas melhores fotos (Min. 3)</label>
                <div className="flex gap-2 overflow-x-auto pb-2">
                   {[1,2,3].map(i => (
                     <div key={i} className="w-[80px] h-[80px] bg-[#EEE] rounded-lg flex items-center justify-center border border-dashed border-[#AAA] flex-shrink-0 cursor-pointer hover:bg-[#E5E5E5]">
                        <Camera className="text-[#999] w-6 h-6" />
                     </div>
                   ))}
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Checkboxes Finais */}
      <div className="mt-6 space-y-3">
         <Checkbox 
           label="Autorizo o envio de e-mails sobre meu cadastro."
           checked={true}
           onChange={() => {}} 
         />
         <Checkbox 
           label="Li e concordo com os Termos e Condições."
           checked={formData.finalTerms}
           required={true}
           onChange={() => setShowMandatoryPopup('final')}
         />
          {showMandatoryPopup === 'final' && (
           <div className="bg-[#333] text-white text-[11px] p-2 rounded-lg animate-pulse">
             Você precisa concordar para continuar.
           </div>
        )}
      </div>

      <div className="mt-8">
        <Button onClick={() => { if(validateStep2()) handleNext(); }}>
          Continuar
        </Button>
      </div>
    </div>
  );

  // STEP 3: Verificação de Identidade
  const renderStep3 = () => (
    <div className="flex flex-col items-center animate-in zoom-in-95 duration-500">
      <div className="w-[200px] h-[200px] mb-4">
         <DotLottiePlayer
            src="https://lottie.host/27108e59-5743-41a0-980f-c45cc774f50e/qT7a4kmpdD.lottie"
            autoplay
            loop
          />
      </div>
      
      <h2 className="text-[24px] font-bold text-center mb-2">Validar Identidade</h2>
      <p className="text-center text-[#666] text-[14px] mb-8 max-w-[300px]">
        Para garantir a segurança da comunidade, precisamos validar que você é uma pessoa real.
      </p>

      <Button 
        onClick={() => window.open('https://www.frameag.com/becomeframe-facial-verification', '_blank')}
        className="mb-4"
      >
        <ShieldCheck className="w-5 h-5" /> Iniciar validação facial
      </Button>

      {role === 'client' && (
        <button 
          onClick={handleNext} 
          className="text-[#AC865C] text-[14px] font-medium hover:underline mt-2"
        >
          Sou contratante, validar depois
        </button>
      )}
      
      {role === 'creator' && (
        <p className="text-[12px] text-red-500 bg-red-50 px-3 py-1 rounded-full mt-2">
          * Obrigatório para criadoras
        </p>
      )}
    </div>
  );

  // STEP 4: 2FA
  const CodeInput = () => {
    const inputs = useRef([]);

    const handleChange = (i, e) => {
       const val = e.target.value;
       if (val.length > 1) return; // Só 1 char
       if (val && i < 4) inputs.current[i + 1].focus();
    };

    const handlePaste = (e) => {
      e.preventDefault();
      const paste = e.clipboardData.getData('text').slice(0, 5);
      if (paste.length === 5) {
        paste.split('').forEach((char, i) => {
          if (inputs.current[i]) inputs.current[i].value = char;
        });
        inputs.current[4].focus();
        handleNext(); // Auto submit mockup
      }
    };

    return (
      <div className="flex justify-center gap-2 mb-6">
        {[0,1,2,3,4].map((i) => (
          <input
            key={i}
            ref={el => inputs.current[i] = el}
            type="tel"
            maxLength={1}
            className="w-[50px] h-[60px] border-2 border-[#DDD] rounded-[12px] text-center text-[24px] font-bold text-[#AC865C] focus:border-[#AC865C] focus:bg-[#FFF] bg-[#F9F9F9] outline-none transition-all"
            onChange={(e) => handleChange(i, e)}
            onPaste={i === 0 ? handlePaste : undefined}
          />
        ))}
      </div>
    );
  };

  // Timer Effect
  useEffect(() => {
    if (step === 4 && timer > 0) {
      const interval = setInterval(() => setTimer(t => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [step, timer]);

  const renderStep4 = () => (
    <div className="animate-in fade-in duration-500">
      <div className="bg-[#Fdf8f3] p-4 rounded-[16px] flex items-center gap-4 mb-8 border border-[#Eaddd1]">
        <img 
           src={role === 'creator' ? "https://framerusercontent.com/images/sz5ueC0VcN5fohNrik0bUG9oJbI.png" : "https://framerusercontent.com/images/sz5ueC0VcN5fohNrik0bUG9oJbI.png"} 
           className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" 
        />
        <div className="overflow-hidden">
          <p className="text-[12px] text-[#8b6d4d] font-bold uppercase tracking-wide">Enviamos para</p>
          <p className="text-[14px] text-[#1F1F1F] font-medium truncate">{formData.email || 'seu@email.com'}</p>
        </div>
      </div>

      <div className="text-center mb-6">
        <h2 className="text-[22px] font-bold mb-2">Digite o código</h2>
        <p className="text-[#666] text-[14px]">
          Insira a chave de 5 dígitos enviada.
        </p>
      </div>

      <CodeInput />

      <div className="text-center mb-8">
        <p className={`text-[14px] font-bold font-mono ${timer === 0 ? 'text-red-500' : 'text-[#AC865C]'}`}>
           {timer > 0 ? `${Math.floor(timer / 60)}:${(timer % 60).toString().padStart(2, '0')}` : 'Código expirado'}
        </p>
      </div>

      <Button onClick={() => window.location.href = '/dashboard'} disabled={timer === 0}>
        Confirmar Acesso
      </Button>

      <button 
        onClick={() => { setShowResendModal(true); setTimer(300); }} 
        className="w-full mt-4 text-[#999] text-[13px] hover:text-[#AC865C] transition-colors"
      >
        Não recebi o código? Reenviar
      </button>
    </div>
  );

  // --- ESTRUTURA GLOBAL ---

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&family=Poppins:wght@400;500;600&display=swap');
        
        body { font-family: 'Poppins', sans-serif; background: #FFF; color: #1F1F1F; }
        .font-montserrat { font-family: 'Montserrat', sans-serif; }
        
        /* Custom Scrollbar for Modal */
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #AC865C; border-radius: 2px; }
        
        /* Mobile vs Desktop Wrapper */
        .frame-wrapper {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #F5F5F5;
          padding: 20px;
        }
        
        .frame-container {
          width: 100%;
          max-width: 440px;
          background: #FFF;
          min-height: 600px;
          border-radius: 24px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0,0,0,0.08);
          display: flex;
          flex-col: column;
        }

        @media (max-width: 480px) {
          .frame-wrapper { padding: 0; background: #FFF; }
          .frame-container { box-shadow: none; border-radius: 0; height: 100vh; max-width: 100%; }
        }
      `}</style>

      <div className="frame-wrapper">
        <div className="frame-container flex flex-col">
          
          {/* Header Progress */}
          <div className="px-6 pt-6 pb-2">
            <div className="flex items-center justify-between mb-4">
              {step > 0 && (
                 <button onClick={handleBack} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#F5F5F5] transition-colors">
                    <ChevronLeft className="text-[#333]" size={24} />
                 </button>
              )}
              <div className="text-[12px] font-bold text-[#AC865C] tracking-widest uppercase">
                {step === 0 ? 'Bem-vindo' : `Passo ${step} de 4`}
              </div>
              <div className="w-8"></div>
            </div>
            {/* Progress Bar Animated */}
            <div className="h-1 bg-[#EEE] rounded-full overflow-hidden w-full">
              <div 
                className="h-full bg-[#AC865C] transition-all duration-500 ease-out"
                style={{ width: `${((step + 1) / 5) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Dynamic Content */}
          <div className="flex-1 px-6 py-4 overflow-y-auto">
            {step === 0 && renderStep0()}
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
            {step === 4 && renderStep4()}
          </div>

          {/* Footer Disclaimer (Fixed bottom if desired, or static) */}
          <div className="px-6 py-6 bg-white border-t border-[#F5F5F5]">
             <div className="text-[10px] text-[#999] text-center leading-[1.6]">
               Ao continuar, você concorda com a <a href="#" className="text-[#AC865C] font-semibold hover:underline">Política de Privacidade</a> e <a href="#" className="text-[#AC865C] font-semibold hover:underline">Termos de Uso</a>.
               <br/>E-mails oficiais terminam em @frameag.com
             </div>
             <div id="recaptcha-placeholder" className="hidden"></div>
          </div>

        </div>
      </div>

      {/* --- MODAIS DE SUPORTE --- */}
      
      {/* Google Error Modal */}
      <Modal isOpen={showGoogleModal} onClose={() => setShowGoogleModal(false)}>
         <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-500">
               <X size={24} />
            </div>
            <h3 className="text-[18px] font-bold mb-2">Login indisponível</h3>
            <p className="text-[14px] text-[#666] mb-6">
              Não detectamos uma conta Google ativa no navegador. Por favor, insira seu e-mail manualmente.
            </p>
            <Button onClick={() => setShowGoogleModal(false)}>Entendi</Button>
         </div>
      </Modal>

      {/* Resend Modal */}
      <Modal isOpen={showResendModal} onClose={() => setShowResendModal(false)}>
         <div className="flex flex-col items-center text-center">
             <div className="w-[120px] h-[120px]">
                <DotLottiePlayer
                   src="https://lottie.host/a11872ae-9848-45ba-8871-fa870929372e/YWZlUTBnMU.lottie"
                   autoplay
                   loop
                />
             </div>
             <h3 className="text-[18px] font-bold mb-2">Código Reenviado!</h3>
             <p className="text-[14px] text-[#666] mb-6">
                Verifique sua caixa de entrada (e spam) em <strong>{formData.email}</strong>.
             </p>
             <Button onClick={() => setShowResendModal(false)}>Fechar</Button>
         </div>
      </Modal>

    </>
  );
}