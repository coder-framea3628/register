import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft, Check, AlertCircle, X, Loader2, Camera, 
  UploadCloud, ShieldCheck, Mail, MapPin, Info, ArrowRight, User
} from 'lucide-react';

// ============================================================================
// 1. CONFIGURAÇÕES E UTILITÁRIOS
// ============================================================================

const THEME = {
  primary: '#AC865C',     
  primaryHover: '#8b6d4d',
  gold: '#B5875C',        
  textMain: '#1F1F1F',
  textLight: '#666666',
  bgInput: '#FAFAFA',
  error: '#D32F2F',
  success: '#2E7D32'
};

const Validators = {
  email: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
  phone: (phone) => phone.length >= 10, // Validação simplificada para exemplo
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
// 2. COMPONENTES DE UI (DESIGN SYSTEM)
// ============================================================================

// --- Toast Notification System ---
const ToastContainer = ({ toasts, removeToast }) => (
  <div className="fixed top-4 right-0 left-0 flex flex-col items-center gap-2 z-[9999] pointer-events-none">
    {toasts.map((toast) => (
      <div 
        key={toast.id} 
        className={`pointer-events-auto min-w-[300px] max-w-[90%] p-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-5 fade-in duration-300 transform transition-all border-l-4 backdrop-blur-md bg-white/95`}
        style={{ borderLeftColor: toast.type === 'error' ? THEME.error : THEME.success }}
      >
        {toast.type === 'error' ? <AlertCircle size={20} className="text-red-600" /> : <Check size={20} className="text-green-600" />}
        <p className="text-sm font-medium text-gray-800">{toast.message}</p>
        <button onClick={() => removeToast(toast.id)} className="ml-auto text-gray-400 hover:text-gray-600">
            <X size={16} />
        </button>
      </div>
    ))}
  </div>
);

// --- Botão ---
const Button = ({ children, variant = 'primary', loading, onClick, disabled, className = '', type = 'button' }) => {
  const base = "w-full md:w-auto min-w-[200px] h-[50px] px-8 rounded-full font-semibold text-[15px] transition-all duration-300 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg hover:shadow-xl";
  
  const styles = {
    primary: `bg-[#B5875C] text-white shadow-[#AC865C]/20 hover:bg-[#9A734E]`,
    secondary: `bg-transparent border border-[#AC865C] text-[#AC865C] hover:bg-[#AC865C]/5`,
    ghost: `bg-transparent text-[#666] shadow-none hover:bg-gray-100`
  };

  return (
    <button 
      type={type}
      onClick={onClick} 
      disabled={disabled || loading}
      className={`${base} ${styles[variant]} ${className}`}
    >
      {loading ? <Loader2 className="animate-spin w-5 h-5" /> : children}
    </button>
  );
};

// --- Input ---
const Input = ({ label, error, icon: Icon, type = "text", ...props }) => {
  const [focused, setFocused] = useState(false);
  
  return (
    <div className="w-full mb-4 group">
      {label && <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ml-1 transition-colors ${focused ? 'text-[#AC865C]' : 'text-[#888]'}`}>{label}</label>}
      <div className="relative">
        {Icon && (
          <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${focused ? 'text-[#AC865C]' : 'text-[#BBB]'}`}>
            <Icon size={20} />
          </div>
        )}
        <input 
          {...props}
          type={type}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`w-full h-[54px] bg-[#FAFAFA] rounded-xl px-4 text-[16px] text-[#1F1F1F] outline-none border transition-all placeholder:text-[#CCC] ${Icon ? 'pl-12' : ''}`}
          style={{ 
            borderColor: error ? THEME.error : (focused ? THEME.primary : '#E5E5E5'),
            boxShadow: focused ? `0 4px 20px -5px ${THEME.primary}20` : 'none'
          }}
        />
        {error && <AlertCircle className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500 w-5 h-5 animate-pulse" />}
      </div>
      {error && <span className="text-[11px] text-red-600 ml-1 mt-1 block font-medium animate-in slide-in-from-top-1">{error}</span>}
    </div>
  );
};

// --- Checkbox ---
const Checkbox = ({ checked, onChange, label, required }) => (
  <label className="flex items-start gap-3 cursor-pointer group select-none p-2 rounded-lg hover:bg-gray-50 transition-colors">
    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all flex-shrink-0 mt-0.5 ${checked ? 'bg-[#AC865C] border-[#AC865C]' : 'border-gray-300 bg-white'}`}>
      {checked && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
    </div>
    <div className="text-[12px] md:text-[13px] text-[#555] leading-relaxed">
      {required && <span className="text-red-500 mr-1">*</span>}
      {label}
    </div>
  </label>
);

// ============================================================================
// 3. SUB-COMPONENTES DAS ETAPAS
// ============================================================================

const Step0_Terms = ({ formData, setFormData, onNext }) => (
  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col items-center text-center">
    <div className="w-16 h-16 bg-[#AC865C]/10 rounded-full flex items-center justify-center mb-6 text-[#AC865C]">
      <Info size={32} />
    </div>
    
    <h1 className="text-2xl md:text-3xl font-bold text-[#1F1F1F] mb-4 font-montserrat">
      Bem-vindo à Frame
    </h1>
    
    <p className="text-[#666] mb-8 max-w-md">
      Antes de criarmos seu perfil, precisamos alinhar alguns pontos importantes sobre segurança e responsabilidade.
    </p>

    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-6 text-left w-full space-y-4">
      <div className="flex gap-3">
        <ShieldCheck className="text-[#AC865C] w-5 h-5 flex-shrink-0" />
        <p className="text-sm text-gray-600">
          <strong>Somos tecnologia:</strong> A Frame não agencia, não intermedeia pagamentos e não oferece serviços pessoais.
        </p>
      </div>
      <div className="flex gap-3">
        <User className="text-[#AC865C] w-5 h-5 flex-shrink-0" />
        <p className="text-sm text-gray-600">
          <strong>Autonomia total:</strong> Toda interação é de responsabilidade exclusiva entre contratante e criadora.
        </p>
      </div>
    </div>

    <div className="w-full mb-8 text-left">
      <Checkbox 
        label="Li e compreendo que a Frame atua exclusivamente como provedora de infraestrutura tecnológica segura."
        checked={formData.acceptedTermsInitial}
        required
        onChange={(val) => setFormData(prev => ({...prev, acceptedTermsInitial: !prev.acceptedTermsInitial}))}
      />
    </div>

    <Button onClick={onNext} disabled={!formData.acceptedTermsInitial} className="w-full md:w-[300px]">
      Concordar e Continuar
    </Button>
  </div>
);

const Step1_Role = ({ onSelect }) => (
  <div className="animate-in fade-in duration-500 w-full">
    <h2 className="text-2xl font-bold text-center mb-2 font-montserrat">Qual o seu objetivo?</h2>
    <p className="text-center text-gray-500 mb-8">Selecione como deseja utilizar a plataforma</p>
    
    <div className="grid md:grid-cols-2 gap-5">
      {/* Card Contratante */}
      <div onClick={() => onSelect('client')} className="relative h-[240px] rounded-2xl overflow-hidden cursor-pointer group shadow-md hover:shadow-2xl transition-all duration-500">
        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all z-10" />
        <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000&auto=format&fit=crop" className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Client" />
        <div className="absolute inset-0 z-20 flex flex-col justify-end p-6 translate-y-2 group-hover:translate-y-0 transition-transform">
          <h3 className="text-white text-2xl font-bold font-montserrat">Contratante</h3>
          <p className="text-white/90 text-sm mt-1 opacity-0 group-hover:opacity-100 transition-opacity delay-100">Busco experiências exclusivas e alto padrão.</p>
        </div>
      </div>

      {/* Card Criadora */}
      <div onClick={() => onSelect('creator')} className="relative h-[240px] rounded-2xl overflow-hidden cursor-pointer group shadow-md hover:shadow-2xl transition-all duration-500">
        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all z-10" />
        <img src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=1000&auto=format&fit=crop" className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Creator" />
        <div className="absolute inset-0 z-20 flex flex-col justify-end p-6 translate-y-2 group-hover:translate-y-0 transition-transform">
          <h3 className="text-white text-2xl font-bold font-montserrat">Criadora</h3>
          <p className="text-white/90 text-sm mt-1 opacity-0 group-hover:opacity-100 transition-opacity delay-100">Quero anunciar meu perfil e gerenciar minha agenda.</p>
        </div>
      </div>
    </div>
  </div>
);

const Step2_Form = ({ role, formData, setFormData, errors, onNext }) => {
  const handleChange = (field, value) => setFormData(prev => ({...prev, [field]: value}));

  return (
    <div className="animate-in fade-in slide-in-from-right-8 duration-500 w-full">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-[#AC865C] mb-1 font-montserrat">Crie sua conta</h2>
        <p className="text-sm text-[#666]">Preencha seus dados para acessar a Frame</p>
      </div>

      {/* --- Google Login Simulado --- */}
      <button className="w-full h-[54px] bg-white border border-gray-200 rounded-xl flex items-center justify-center gap-3 text-gray-600 font-medium hover:bg-gray-50 transition-all mb-8 shadow-sm">
        <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="G" />
        Continuar com Google
      </button>

      <div className="flex items-center gap-4 mb-6">
        <div className="h-[1px] bg-gray-200 flex-1"></div>
        <span className="text-xs text-gray-400 font-medium uppercase">Ou via e-mail</span>
        <div className="h-[1px] bg-gray-200 flex-1"></div>
      </div>

      {/* --- Campos Específicos de Criadora --- */}
      {role === 'creator' && (
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm mb-6 space-y-4">
           <div className="flex items-center gap-2 mb-2">
             <div className="p-1.5 bg-[#AC865C]/10 rounded-lg"><User size={16} className="text-[#AC865C]" /></div>
             <h3 className="font-semibold text-gray-800">Perfil Profissional</h3>
           </div>

           <Input 
              label="Nome Artístico" 
              placeholder="Ex: Bella"
              value={formData.displayName}
              onChange={(e) => handleChange('displayName', e.target.value)}
              error={errors.displayName}
           />

           <div className="grid grid-cols-2 gap-4">
             <Input 
               label="Nascimento" 
               type="date"
               value={formData.birthDate}
               onChange={(e) => handleChange('birthDate', e.target.value)}
               error={errors.birthDate}
             />
             <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 ml-1 text-[#888]">Gênero</label>
                <select 
                  className="w-full h-[54px] bg-[#FAFAFA] rounded-xl px-4 text-[16px] outline-none border border-[#E5E5E5] text-[#1F1F1F]"
                  value={formData.gender}
                  onChange={(e) => handleChange('gender', e.target.value)}
                >
                  <option value="">Selecione...</option>
                  <option value="cis">Mulher Cis</option>
                  <option value="trans">Mulher Trans</option>
                  <option value="travesti">Travesti</option>
                </select>
                {errors.gender && <span className="text-[11px] text-red-600 ml-1 mt-1 block">{errors.gender}</span>}
             </div>
           </div>

           <Input 
              label="WhatsApp" 
              placeholder="(00) 00000-0000"
              value={formData.whatsapp}
              onChange={(e) => handleChange('whatsapp', e.target.value)}
              error={errors.whatsapp}
           />

           {/* Mock de Upload de Fotos */}
           <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2 ml-1 text-[#888]">Fotos (Min 3)</label>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                 {/* Botão de Adicionar */}
                 <div 
                    onClick={() => {
                        if(formData.photos.length < 5) handleChange('photos', [...formData.photos, {id: Date.now()}])
                    }}
                    className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-[#AC865C] hover:bg-[#AC865C]/5 transition-colors flex-shrink-0"
                 >
                    <Camera size={20} className="text-gray-400" />
                    <span className="text-[10px] text-gray-400 mt-1">Add</span>
                 </div>
                 {/* Fotos Adicionadas */}
                 {formData.photos.map((p, i) => (
                    <div key={p.id} className="w-20 h-20 rounded-lg bg-gray-100 relative overflow-hidden flex-shrink-0 animate-in zoom-in">
                       <img src={`https://picsum.photos/200?random=${p.id}`} className="w-full h-full object-cover" alt="preview" />
                       <button 
                         onClick={() => handleChange('photos', formData.photos.filter(x => x.id !== p.id))}
                         className="absolute top-1 right-1 bg-black/60 rounded-full p-1 text-white hover:bg-red-600"
                       >
                         <X size={12} />
                       </button>
                    </div>
                 ))}
              </div>
              {errors.photos && <span className="text-[11px] text-red-600 block">{errors.photos}</span>}
           </div>
        </div>
      )}

      {/* --- Dados Comuns --- */}
      <div className="space-y-4">
        <Input 
          label="Nome Completo" 
          value={formData.fullName}
          onChange={(e) => handleChange('fullName', e.target.value)}
          error={errors.fullName}
          icon={User}
        />
        <Input 
          label="E-mail" 
          type="email"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          error={errors.email}
          icon={Mail}
        />
      </div>

      <div className="mt-6 space-y-3 mb-8 bg-gray-50 p-4 rounded-xl">
         <Checkbox 
           label="Li e concordo com os Termos de Uso e Política de Privacidade."
           checked={formData.finalTerms}
           required
           onChange={() => handleChange('finalTerms', !formData.finalTerms)}
         />
         {errors.finalTerms && <span className="text-[11px] text-red-600 ml-8 block">Aceite obrigatório</span>}
      </div>

      <Button onClick={onNext} className="w-full">
        Criar Conta <ArrowRight size={18} />
      </Button>
    </div>
  );
};

const Step3_Verify = ({ role, onNext, onSkip }) => (
  <div className="flex flex-col items-center animate-in zoom-in-95 duration-500 w-full text-center py-8">
    <div className="w-[200px] h-[200px] mb-6 bg-gray-50 rounded-full flex items-center justify-center overflow-hidden border border-gray-100 relative">
       {/* Use iframe as fallback safe animation */}
       <iframe 
         src="https://lottie.host/embed/27108e59-5743-41a0-980f-c45cc774f50e/qT7a4kmpdD.lottie" 
         className="w-[300px] h-[300px] absolute pointer-events-none"
         title="Verify ID"
       ></iframe>
    </div>
    
    <h2 className="text-2xl md:text-3xl font-bold mb-3 font-montserrat text-[#1F1F1F]">Verificação de Identidade</h2>
    <p className="text-[#666] text-sm mb-8 max-w-[340px] leading-relaxed">
      A Frame é uma comunidade segura. Validamos a identidade de todos os usuários para garantir a autenticidade dos perfis.
    </p>

    <Button onClick={() => window.open('https://google.com', '_blank')} className="mb-4 w-full md:w-[280px]">
      <ShieldCheck className="w-5 h-5" /> Iniciar Validação Facial
    </Button>

    {role === 'client' ? (
      <button onClick={onSkip} className="text-[#AC865C] text-sm font-medium hover:underline mt-4">
        Pular por enquanto (Acesso Limitado)
      </button>
    ) : (
      <div className="mt-4 flex items-center gap-2 text-amber-600 bg-amber-50 px-4 py-2 rounded-full text-xs font-semibold">
        <AlertCircle size={14} /> Obrigatório para Criadoras
      </div>
    )}
  </div>
);

const Step4_2FA = ({ email, onFinish, onResend }) => {
  const [code, setCode] = useState(['', '', '', '', '']);
  const inputsRef = useRef([]);

  const handleChange = (index, value) => {
    if (isNaN(value)) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 4) inputsRef.current[index + 1].focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const data = e.clipboardData.getData('text').slice(0, 5).split('');
    const newCode = [...code];
    data.forEach((char, i) => { if(i < 5 && !isNaN(char)) newCode[i] = char; });
    setCode(newCode);
    if (data.length > 0) inputsRef.current[Math.min(data.length, 4)].focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
        inputsRef.current[index - 1].focus();
    }
  };

  return (
    <div className="animate-in fade-in duration-500 w-full text-center">
      <div className="bg-[#AC865C]/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-[#AC865C]">
          <Mail size={32} />
      </div>

      <h2 className="text-2xl font-bold mb-2 font-montserrat">Verifique seu e-mail</h2>
      <p className="text-[#666] text-sm mb-8">
        Enviamos um código de 5 dígitos para <br/><strong className="text-[#1F1F1F]">{email}</strong>
      </p>

      <div className="flex justify-center gap-2 md:gap-4 mb-8">
        {code.map((digit, i) => (
          <input
            key={i}
            ref={el => inputsRef.current[i] = el}
            type="text"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={i === 0 ? handlePaste : undefined}
            className="w-12 h-14 md:w-16 md:h-20 border-2 rounded-xl text-center text-2xl font-bold bg-[#FAFAFA] focus:border-[#AC865C] focus:bg-white focus:shadow-lg outline-none transition-all text-[#1F1F1F]"
          />
        ))}
      </div>

      <Button onClick={onFinish} disabled={code.join('').length < 5} className="w-full md:w-[280px]">
        Validar Código
      </Button>

      <p className="mt-6 text-sm text-gray-500">
        Não recebeu? <button onClick={onResend} className="text-[#AC865C] font-semibold hover:underline">Reenviar código</button>
      </p>
    </div>
  );
};

// ============================================================================
// 4. COMPONENTE PRINCIPAL (CONTROLADOR LÓGICO)
// ============================================================================

export default function FrameRegistration() {
  const [step, setStep] = useState(0);
  const [role, setRole] = useState(null); // 'client' | 'creator'
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState([]);
  
  // Dados do Formulário Unificado
  const [formData, setFormData] = useState({
    acceptedTermsInitial: false,
    fullName: '',
    email: '',
    finalTerms: false,
    displayName: '',
    birthDate: '',
    gender: '',
    whatsapp: '',
    location: '',
    photos: [], 
    bio: ''
  });

  const [errors, setErrors] = useState({});

  // --- Efeitos ---
  useEffect(() => {
    // Scroll para o topo ao mudar de passo
    window.scrollTo({ top: 0, behavior: 'smooth' });
    console.log("FrameRegistration Component Mounted");
  }, [step]);

  // --- Helpers ---
  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 4000);
  };

  const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  // --- Navegação e Validação ---
  const validateStep2 = () => {
    let newErrors = {};
    
    if (!formData.fullName.trim().includes(' ')) newErrors.fullName = "Digite seu nome completo";
    if (!Validators.email(formData.email)) newErrors.email = "E-mail inválido";
    if (!formData.finalTerms) newErrors.finalTerms = "Obrigatório";

    if (role === 'creator') {
        if (!formData.displayName) newErrors.displayName = "Obrigatório";
        if (!formData.birthDate || !Validators.is18Plus(formData.birthDate)) newErrors.birthDate = "Inválido ou menor de 18 anos";
        if (!formData.whatsapp) newErrors.whatsapp = "Obrigatório";
        if (!formData.gender) newErrors.gender = "Selecione uma opção";
        if (formData.photos.length < 3) newErrors.photos = "Mínimo de 3 fotos";
    }

    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
        addToast("Verifique os erros no formulário", "error");
        return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 2 && !validateStep2()) return;
    
    setLoading(true);
    // Simula processamento de rede
    setTimeout(() => {
        setLoading(false);
        setStep(prev => prev + 1);
    }, 600);
  };

  const handleBack = () => step > 0 && setStep(prev => prev - 1);

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700&family=Poppins:wght@400;500;600&display=swap');
        .font-montserrat { font-family: 'Montserrat', sans-serif; }
        body { font-family: 'Poppins', sans-serif; background-color: #F3F4F6; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>

      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="min-h-screen flex items-center justify-center p-4 md:p-8">
        <div className="bg-white w-full max-w-[700px] min-h-[600px] rounded-[30px] shadow-2xl overflow-hidden flex flex-col relative border border-white/50">
          
          {/* Header */}
          <div className="px-8 pt-8 pb-2 flex items-center justify-between z-10 bg-white/90 backdrop-blur-sm sticky top-0">
             <button 
               onClick={handleBack}
               className={`w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 transition-all text-gray-700 ${step === 0 ? 'invisible' : ''}`}
             >
               <ChevronLeft size={24} />
             </button>
             
             {/* Indicador de Passos */}
             <div className="flex gap-2">
                {[0, 1, 2, 3, 4].map(i => (
                    <div 
                      key={i} 
                      className={`h-1.5 rounded-full transition-all duration-500 ${i <= step ? 'w-8 bg-[#AC865C]' : 'w-2 bg-gray-200'}`} 
                    />
                ))}
             </div>
             <div className="w-10" /> {/* Spacer */}
          </div>

          {/* Área de Conteúdo */}
          <div className="flex-1 px-6 md:px-12 py-6 overflow-y-auto">
             <div className="max-w-[500px] mx-auto">
                {step === 0 && <Step0_Terms formData={formData} setFormData={setFormData} onNext={handleNext} />}
                
                {step === 1 && <Step1_Role onSelect={(r) => { setRole(r); handleNext(); }} />}
                
                {step === 2 && (
                    <Step2_Form 
                        role={role} 
                        formData={formData} 
                        setFormData={setFormData} 
                        errors={errors} 
                        onNext={handleNext} 
                    />
                )}
                
                {step === 3 && (
                    <Step3_Verify 
                        role={role} 
                        onNext={handleNext} 
                        onSkip={handleNext} 
                    />
                )}
                
                {step === 4 && (
                    <Step4_2FA 
                        email={formData.email} 
                        onFinish={() => addToast("Cadastro realizado com sucesso!", "success")}
                        onResend={() => addToast("Código reenviado!", "success")}
                    />
                )}
             </div>
          </div>

          {/* Footer (Legal) */}
          <div className="bg-gray-50 border-t border-gray-100 p-4 text-center">
             <p className="text-[10px] text-gray-400 max-w-[400px] mx-auto">
                &copy; {newFrameDate = new Date().getFullYear()} Frame Agency. Todos os direitos reservados. 
                <br/>Ao continuar você concorda com nossos Termos de Serviço.
             </p>
          </div>

          {/* Loading Overlay Global */}
          {loading && (
             <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center fade-in duration-200">
                <Loader2 className="w-10 h-10 text-[#AC865C] animate-spin" />
             </div>
          )}

        </div>
      </div>
    </>
  );
}