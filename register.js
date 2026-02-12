// ============================================================================
// FRAME AUTHENTIC - 2FA SECURITY SUITE (V3.0 - ENTERPRISE EDITION)
// SISTEMA DE VERIFICAÇÃO MODERNO, ROBUSTO E PERSISTENTE
// BASEADO EM CONCEITOS UI/UX NUBANK/AIRBNB/GLOBO
// ============================================================================

(function() {
    'use strict';

    // 1. LIMPEZA E PREPARAÇÃO (Anti-Conflito)
    const existingRoot = document.getElementById('frame-2fa-root');
    if (existingRoot) existingRoot.remove();
    const existingStyle = document.getElementById('frame-2fa-style');
    if (existingStyle) existingStyle.remove();

    // 2. CONFIGURAÇÃO CENTRAL (IMUTÁVEL)
    const CONFIG = {
        appId: 'frame-auth-2fa',
        validCode: '12345', // Mock backend validation
        maxAttempts: 3,
        maxResends: 3,
        blockTimeMs: 24 * 60 * 60 * 1000, // 24 horas
        sessionDuration: 2 * 60 * 60 * 1000, // 2 horas (Sessão de E-mail)
        otpDuration: 5 * 60, // 5 minutos em segundos
        colors: {
            primary: '#AC865C',      // Marrom Premium (Base)
            primaryDark: '#8b6d4d',  // Hover
            bg: '#FFFFFF',           // Fundo Card
            surface: '#F8F9FA',      // Inputs background
            text: '#1F1F1F',         // Texto Principal
            textLight: '#666666',    // Texto Secundário
            error: '#e74c3c',        // Erro
            success: '#27ae60',      // Sucesso
            border: '#E0E0E0'
        },
        assets: {
            userPlaceholder: 'https://ui-avatars.com/api/?background=AC865C&color=fff&name=',
            lottieLoader: 'https://lottie.host/embed/9c9d5d9a-1e1e-4b1e-9a1e-9c9d5d9a1e1e/loader.json' // Mock URL
        }
    };

    // 3. GERENCIADOR DE ESTADO E PERSISTÊNCIA (CRYPT-MOCK)
    const Storage = {
        prefix: 'FRAME_SECURE_',
        
        encrypt: (data) => {
            // Simulação de criptografia para "tamper detection"
            return btoa(JSON.stringify(data));
        },
        
        decrypt: (data) => {
            try {
                return JSON.parse(atob(data));
            } catch (e) {
                return null;
            }
        },

        set: function(key, value) {
            try {
                const payload = {
                    data: value,
                    timestamp: Date.now(),
                    signature: 'FRAME-SIG-' + Math.random().toString(36).substring(7)
                };
                localStorage.setItem(this.prefix + key, this.encrypt(payload));
            } catch (e) {
                console.warn('Storage quota exceeded or disabled. Fallback to session.');
                sessionStorage.setItem(this.prefix + key, this.encrypt({ data: value, timestamp: Date.now() }));
            }
        },

        get: function(key) {
            let raw = localStorage.getItem(this.prefix + key) || sessionStorage.getItem(this.prefix + key);
            if (!raw) return null;
            
            const decoded = this.decrypt(raw);
            if (!decoded || !decoded.data) return null; // Tamper detection: invalid json

            return decoded;
        },

        remove: function(key) {
            localStorage.removeItem(this.prefix + key);
            sessionStorage.removeItem(this.prefix + key);
        }
    };

    // 4. ANALYTICS & LOGGING (MOCK)
    const Analytics = {
        log: (event, details) => {
            console.log(`%c[FRAME ANALYTICS] ${event}`, 'color: #AC865C; font-weight: bold;', details || '');
        }
    };

    // 5. INJEÇÃO DE ESTILOS (CSS-IN-JS)
    // Mantendo fidelidade visual + Animações modernas + Layout do Bloqueio
    const cssContent = `
        :root {
            --f-primary: ${CONFIG.colors.primary};
            --f-primary-dark: ${CONFIG.colors.primaryDark};
            --f-bg: ${CONFIG.colors.bg};
            --f-text: ${CONFIG.colors.text};
            --f-text-light: ${CONFIG.colors.textLight};
            --f-error: ${CONFIG.colors.error};
            --f-surface: ${CONFIG.colors.surface};
            --f-border: ${CONFIG.colors.border};
            --f-font: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        /* Dark Mode Automático */
        @media (prefers-color-scheme: dark) {
            :root {
                --f-bg: #1a1a1a;
                --f-text: #f0f0f0;
                --f-text-light: #aaa;
                --f-surface: #252525;
                --f-border: #333;
            }
        }

        #frame-2fa-root {
            position: fixed;
            top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0, 0, 0, 0.4);
            backdrop-filter: blur(8px);
            z-index: 99999;
            display: flex;
            justify-content: center;
            align-items: center;
            font-family: var(--f-font);
            opacity: 0;
            animation: frameFadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .frame-card {
            background: var(--f-bg);
            width: 100%;
            max-width: 440px;
            border-radius: 24px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.15);
            padding: 40px;
            position: relative;
            transform: scale(0.95);
            animation: frameZoomIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
            overflow: hidden;
            border: 1px solid var(--f-border);
        }

        /* Mobile Adjustments */
        @media (max-width: 480px) {
            .frame-card {
                width: 90%;
                padding: 24px;
                border-radius: 20px;
            }
        }

        /* Tipografia e Headers */
        .frame-header { text-align: center; margin-bottom: 32px; }
        .frame-title { font-size: 24px; font-weight: 700; color: var(--f-text); margin: 0 0 8px 0; }
        .frame-subtitle { font-size: 15px; color: var(--f-text-light); line-height: 1.5; }
        .frame-email-display {
            background: var(--f-surface);
            padding: 8px 16px 8px 8px;
            border-radius: 50px;
            display: inline-flex;
            align-items: center;
            gap: 12px;
            margin-top: 16px;
            font-size: 14px;
            color: var(--f-text);
            border: 1px solid var(--f-border);
        }
        .frame-avatar { width: 28px; height: 28px; border-radius: 50%; object-fit: cover; }
        .frame-link { color: var(--f-primary); text-decoration: none; font-weight: 600; cursor: pointer; margin-left: auto; font-size: 12px; }

        /* Inputs de Código */
        .frame-otp-container {
            display: flex;
            gap: 12px;
            justify-content: center;
            margin: 32px 0;
        }
        .frame-otp-input {
            width: 50px;
            height: 60px;
            border: 1px solid var(--f-border);
            border-radius: 12px;
            background: var(--f-surface);
            font-size: 24px;
            text-align: center;
            color: var(--f-text);
            font-weight: 600;
            transition: all 0.2s;
            outline: none;
        }
        .frame-otp-input:focus {
            border-color: var(--f-primary);
            box-shadow: 0 0 0 4px rgba(172, 134, 92, 0.15);
            transform: translateY(-2px);
            background: var(--f-bg);
        }
        .frame-otp-input.filled { border-color: var(--f-text); background: var(--f-bg); }
        .frame-otp-input.error { border-color: var(--f-error); animation: frameShake 0.4s; color: var(--f-error); }

        /* Inputs de Email */
        .frame-input-group { margin-bottom: 24px; position: relative; }
        .frame-input {
            width: 100%;
            padding: 16px;
            border: 1px solid var(--f-border);
            border-radius: 12px;
            font-size: 16px;
            background: var(--f-surface);
            color: var(--f-text);
            outline: none;
            transition: 0.2s;
            box-sizing: border-box;
        }
        .frame-input:focus { border-color: var(--f-primary); background: var(--f-bg); }

        /* Botões */
        .frame-btn {
            width: 100%;
            padding: 16px;
            border-radius: 12px;
            background: var(--f-primary);
            color: white;
            font-size: 16px;
            font-weight: 600;
            border: none;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }
        .frame-btn:hover { background: var(--f-primary-dark); transform: translateY(-1px); }
        .frame-btn:disabled { background: #ccc; cursor: not-allowed; transform: none; }
        .frame-btn-sec { background: transparent; color: var(--f-text-light); margin-top: 16px; font-weight: 500; font-size: 14px; }
        .frame-btn-sec:hover { color: var(--f-text); }

        /* Timer e Mensagens */
        .frame-timer { font-size: 13px; color: var(--f-text-light); margin-top: -20px; margin-bottom: 24px; text-align: center; }
        .frame-timer span { font-weight: 600; font-variant-numeric: tabular-nums; }
        
        /* Loading & Animações */
        @keyframes frameFadeIn { to { opacity: 1; } }
        @keyframes frameZoomIn { to { transform: scale(1); } }
        @keyframes frameShake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-6px); } 75% { transform: translateX(6px); } }
        @keyframes frameSpin { to { transform: rotate(360deg); } }
        
        .frame-spinner { width: 20px; height: 20px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: frameSpin 0.8s linear infinite; }

        /* ESTILOS DE BLOQUEIO (TOAST & MODAL - BASEADO NO PEDIDO) */
        .frame-toast {
            position: fixed; top: 20px; right: 20px; width: 380px;
            background: var(--f-bg); border-radius: 16px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.15);
            padding: 18px; display: flex; gap: 14px; z-index: 100000;
            border: 1px solid var(--f-border);
            transform: translateY(-40px); opacity: 0;
            animation: frameSlideDown 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        @keyframes frameSlideDown { to { opacity: 1; transform: translateY(0); } }
        .frame-toast-icon { color: var(--f-error); flex-shrink: 0; }
        .frame-toast-title { font-size: 15px; font-weight: 600; color: var(--f-error); margin: 0 0 4px; display: block; }
        .frame-toast-text { font-size: 13px; color: var(--f-text-light); line-height: 1.4; margin: 0; }
        .frame-toast-act { background: none; border: none; color: var(--f-error); text-decoration: underline; font-size: 12px; cursor: pointer; padding: 0; margin-top: 8px; font-weight: 600; }

        .frame-modal-overlay {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.6); backdrop-filter: blur(4px);
            z-index: 100001; display: flex; align-items: center; justify-content: center;
        }
        .frame-modal {
            background: var(--f-bg); padding: 32px; border-radius: 20px;
            text-align: center; max-width: 400px; width: 90%;
            box-shadow: 0 25px 60px rgba(0,0,0,0.3);
            animation: frameZoomIn 0.3s ease forwards;
        }
        .frame-modal-icon { color: var(--f-error); margin-bottom: 16px; }
        .frame-code-box { font-size: 28px; font-weight: 800; color: var(--f-primary); margin: 20px 0; letter-spacing: 2px; font-family: monospace; background: var(--f-surface); padding: 10px; border-radius: 8px; border: 1px dashed var(--f-primary); }
    `;

    // 6. CONSTRUÇÃO DO UI (Helper Functions)
    function injectStyles() {
        const style = document.createElement('style');
        style.id = 'frame-2fa-style';
        style.textContent = cssContent;
        document.head.appendChild(style);
    }

    function createElement(tag, className, html = '') {
        const el = document.createElement(tag);
        if (className) el.className = className;
        if (html) el.innerHTML = html;
        return el;
    }

    // 7. LÓGICA DE NEGÓCIO DA APLICAÇÃO
    const App = {
        state: {
            email: '',
            step: 'email', // email, otp, blocked
            attempts: 0,
            resends: 0,
            timer: CONFIG.otpDuration,
            timerInterval: null
        },

        init: function() {
            injectStyles();
            this.loadState();
            
            // Verifica bloqueio primeiro
            const blockData = Storage.get('BLOCK');
            if (blockData && Date.now() < blockData.data.expires) {
                this.renderBlocked(blockData.data.reason);
                return;
            } else if (blockData) {
                Storage.remove('BLOCK'); // Bloqueio expirou
                Storage.remove('ATTEMPTS');
            }

            // Verifica sessão de email
            const session = Storage.get('SESSION');
            if (session && (Date.now() - session.timestamp < CONFIG.sessionDuration)) {
                this.state.email = session.data.email;
                this.renderOTP();
                this.showNotification('Sessão restaurada com sucesso.');
            } else {
                this.renderEmail();
            }
        },

        loadState: function() {
            const attempts = Storage.get('ATTEMPTS');
            if (attempts) {
                this.state.attempts = attempts.data.count;
                this.state.resends = attempts.data.resends;
            }
        },

        saveSession: function(email) {
            Storage.set('SESSION', { email: email });
            this.state.email = email;
        },

        trackAttempt: function(isResend = false) {
            if (isResend) this.state.resends++;
            else this.state.attempts++;

            Storage.set('ATTEMPTS', { 
                count: this.state.attempts, 
                resends: this.state.resends 
            });

            if (this.state.attempts >= CONFIG.maxAttempts || this.state.resends >= CONFIG.maxResends) {
                this.triggerBlock('Atividade suspeita detectada (Múltiplas falhas).');
            }
        },

        triggerBlock: function(reason) {
            const errorCode = 'F-' + Math.floor(10000 + Math.random() * 90000);
            const blockData = {
                expires: Date.now() + CONFIG.blockTimeMs,
                reason: reason,
                code: errorCode
            };
            Storage.set('BLOCK', blockData);
            this.renderBlocked(reason, errorCode);
        },

        // --- RENDERERS ---

        createRoot: function() {
            let root = document.getElementById('frame-2fa-root');
            if (!root) {
                root = createElement('div', '');
                root.id = 'frame-2fa-root';
                document.body.appendChild(root);
            }
            root.innerHTML = ''; // Limpa conteúdo anterior
            return root;
        },

        renderEmail: function() {
            const root = this.createRoot();
            const card = createElement('div', 'frame-card');
            
            card.innerHTML = `
                <div class="frame-header">
                    <h2 class="frame-title">Bem-vindo</h2>
                    <p class="frame-subtitle">Digite seu e-mail para iniciar a verificação segura.</p>
                </div>
                <div class="frame-input-group">
                    <input type="email" class="frame-input" id="f-email" placeholder="seu@email.com" autocomplete="email" autofocus>
                </div>
                <button class="frame-btn" id="f-btn-start">
                    Continuar
                </button>
            `;

            root.appendChild(card);

            // Listeners
            const btn = document.getElementById('f-btn-start');
            const input = document.getElementById('f-email');

            // Auto-fill handling (simulado)
            if (localStorage.getItem('FRAME_LAST_EMAIL')) {
                input.value = localStorage.getItem('FRAME_LAST_EMAIL');
            }

            const handleSubmit = () => {
                const email = input.value.trim();
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                
                if (!emailRegex.test(email)) {
                    input.style.borderColor = CONFIG.colors.error;
                    input.focus();
                    this.showToast('Formato de e-mail inválido', true);
                    return;
                }

                btn.innerHTML = '<div class="frame-spinner"></div>';
                
                // Simula delay de rede
                setTimeout(() => {
                    localStorage.setItem('FRAME_LAST_EMAIL', email); // Não seguro, apenas conveniência
                    this.saveSession(email);
                    this.renderOTP();
                }, 800);
            };

            btn.onclick = handleSubmit;
            input.onkeypress = (e) => e.key === 'Enter' && handleSubmit();
        },

        renderOTP: function() {
            const root = this.createRoot();
            const card = createElement('div', 'frame-card');
            const avatarUrl = CONFIG.assets.userPlaceholder + this.state.email.charAt(0).toUpperCase();

            card.innerHTML = `
                <div class="frame-header">
                    <h2 class="frame-title">Verifique sua identidade</h2>
                    <p class="frame-subtitle">Enviamos um código para seu e-mail.</p>
                    <div class="frame-email-display">
                        <img src="${avatarUrl}" class="frame-avatar" alt="User">
                        <span>${this.maskEmail(this.state.email)}</span>
                        <a href="#" class="frame-link" id="f-change-email">Alterar</a>
                    </div>
                </div>

                <div class="frame-otp-container" id="f-otp-inputs">
                    ${Array(5).fill(0).map((_, i) => `<input type="tel" maxlength="1" class="frame-otp-input" data-index="${i}">`).join('')}
                </div>

                <div class="frame-timer" id="f-timer">Reenviar código em <span>05:00</span></div>

                <button class="frame-btn" id="f-btn-verify" disabled>
                    Verificar Código
                </button>

                <button class="frame-btn-sec" id="f-btn-resend" style="display:none">
                    Não recebi o código
                </button>

                <div style="margin-top: 24px; text-align: center;">
                    <button class="frame-btn-sec" id="f-voice-cmd" style="font-size: 12px; display: inline-flex; align-items: center; gap: 5px;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
                        Preencher por Voz
                    </button>
                     <button class="frame-btn-sec" id="f-paste-cmd" style="font-size: 12px; display: inline-flex; align-items: center; gap: 5px; margin-left: 10px;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>
                        Colar
                    </button>
                </div>
            `;

            root.appendChild(card);

            this.setupOTPInputs();
            this.startTimer();

            // Listeners Secundários
            document.getElementById('f-change-email').onclick = (e) => {
                e.preventDefault();
                Storage.remove('SESSION');
                this.renderEmail();
            };

            document.getElementById('f-btn-resend').onclick = () => this.handleResend();
            document.getElementById('f-btn-verify').onclick = () => this.handleVerify();
            
            // Modern Features
            this.setupVoiceInput();
            document.getElementById('f-paste-cmd').onclick = () => this.handlePasteClip();
        },

        setupOTPInputs: function() {
            const inputs = document.querySelectorAll('.frame-otp-input');
            const verifyBtn = document.getElementById('f-btn-verify');

            inputs[0].focus();

            inputs.forEach((input, index) => {
                // Input handling
                input.addEventListener('input', (e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    e.target.value = val;

                    if (val) {
                        input.classList.add('filled');
                        if (index < inputs.length - 1) {
                            inputs[index + 1].focus();
                        } else {
                            // Check completeness
                            verifyBtn.disabled = false;
                            verifyBtn.focus(); // Acessibilidade
                            this.handleVerify(); // Auto-submit para UX moderna
                        }
                    } else {
                        input.classList.remove('filled');
                        verifyBtn.disabled = true;
                    }
                });

                // Keydown (Backspace navigation)
                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Backspace' && !e.target.value && index > 0) {
                        inputs[index - 1].focus();
                    }
                });

                // Paste handling
                input.addEventListener('paste', (e) => {
                    e.preventDefault();
                    const data = (e.clipboardData || window.clipboardData).getData('text');
                    const cleanData = data.replace(/[^0-9]/g, '').slice(0, 5);
                    
                    if (cleanData.length > 0) {
                        cleanData.split('').forEach((char, i) => {
                            if (inputs[i]) {
                                inputs[i].value = char;
                                inputs[i].classList.add('filled');
                            }
                        });
                        // Focus no último ou próximo vazio
                        const nextEmpty = document.querySelector('.frame-otp-input:not(.filled)');
                        if (nextEmpty) nextEmpty.focus();
                        else {
                            verifyBtn.disabled = false;
                            this.handleVerify();
                        }
                    }
                });
            });
        },

        startTimer: function() {
            let timeLeft = CONFIG.otpDuration;
            const timerEl = document.getElementById('f-timer');
            const resendBtn = document.getElementById('f-btn-resend');
            
            clearInterval(this.state.timerInterval);
            
            this.state.timerInterval = setInterval(() => {
                if (timeLeft <= 0) {
                    clearInterval(this.state.timerInterval);
                    timerEl.innerHTML = 'Código expirado.';
                    timerEl.style.color = CONFIG.colors.error;
                    resendBtn.style.display = 'block';
                    this.disableInputs(true);
                    return;
                }

                const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
                const s = (timeLeft % 60).toString().padStart(2, '0');
                timerEl.querySelector('span').innerText = `${m}:${s}`;
                timeLeft--;
            }, 1000);
        },

        handleVerify: function() {
            const inputs = Array.from(document.querySelectorAll('.frame-otp-input'));
            const code = inputs.map(i => i.value).join('');
            const btn = document.getElementById('f-btn-verify');

            if (code.length !== 5) return;

            // UI Loading state
            btn.innerHTML = '<div class="frame-spinner"></div> Validando...';
            btn.disabled = true;
            this.disableInputs(true);

            // Mock Backend call
            setTimeout(() => {
                if (code === CONFIG.validCode) {
                    // SUCESSO
                    btn.style.background = CONFIG.colors.success;
                    btn.innerHTML = '✓ Confirmado';
                    this.showToast('Autenticação realizada com sucesso!');
                    Storage.remove('SESSION');
                    Storage.remove('ATTEMPTS');
                    setTimeout(() => {
                        window.location.href = '#dashboard-mock'; // Redirect mock
                        alert('Redirecionando para dashboard...'); // Demo purpose
                        location.reload();
                    }, 1000);
                } else {
                    // ERRO
                    this.trackAttempt();
                    
                    // Shake Animation
                    inputs.forEach(i => {
                        i.classList.add('error');
                        setTimeout(() => i.classList.remove('error'), 500);
                        i.value = '';
                        i.classList.remove('filled');
                    });
                    
                    inputs[0].focus();
                    this.disableInputs(false);
                    btn.innerHTML = 'Verificar Código';
                    btn.disabled = true;
                    btn.style.background = CONFIG.colors.primary;
                    
                    const attemptsLeft = CONFIG.maxAttempts - this.state.attempts;
                    this.showToast(`Código incorreto. ${attemptsLeft} tentativas restantes.`, true);
                }
            }, 1200); // 1.2s delay para realismo
        },

        handleResend: function() {
            if (this.state.resends >= CONFIG.maxResends) {
                this.triggerBlock('Limite de reenvios excedido.');
                return;
            }

            const btn = document.getElementById('f-btn-resend');
            btn.innerHTML = 'Enviando...';
            
            setTimeout(() => {
                this.trackAttempt(true);
                this.startTimer();
                this.disableInputs(false);
                btn.style.display = 'none';
                btn.innerHTML = 'Não recebi o código';
                document.getElementById('f-timer').style.color = CONFIG.colors.textLight;
                document.querySelector('.frame-otp-input').focus();
                this.showNotification('Novo código enviado!');
            }, 2000);
        },

        // --- BLOCKING SYSTEM (Baseado no HTML fornecido) ---
        
        renderBlocked: function(reason, errorCode = null) {
            // Se não passou código, tenta pegar do storage
            if (!errorCode) {
                const stored = Storage.get('BLOCK');
                if (stored) errorCode = stored.data.code;
            }

            const root = this.createRoot();
            
            // Modal de explicação
            const modalHTML = `
                <div class="frame-modal-overlay">
                    <div class="frame-modal">
                         <div class="frame-modal-icon">
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                                <circle cx="12" cy="8" r="1.5"/>
                                <path d="M10.5 12h3l-1.5 5"/>
                            </svg>
                        </div>
                        <h2 class="frame-title">Acesso Temporariamente Bloqueado</h2>
                        <p class="frame-subtitle">${reason}</p>
                        
                        <div class="frame-code-box">${errorCode || 'ERR-00X'}</div>
                        <p style="font-size:12px; color:#666; margin-bottom:20px;">Envie este código ao suporte.</p>
                        
                        <button class="frame-btn" onclick="window.location.reload()">Tentar novamente (Check Status)</button>
                        <a href="#" class="frame-btn-sec">Falar com Suporte</a>
                    </div>
                </div>
            `;
            
            root.innerHTML = modalHTML;
        },

        showToast: function(msg, isError = false) {
            const existing = document.querySelector('.frame-toast');
            if (existing) existing.remove();

            const toast = createElement('div', 'frame-toast');
            toast.innerHTML = `
                <div class="frame-toast-icon">
                     ${isError ? 
                        '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>' : 
                        '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>'}
                </div>
                <div>
                    <strong class="frame-toast-title">${isError ? 'Atenção' : 'Sucesso'}</strong>
                    <p class="frame-toast-text">${msg}</p>
                </div>
            `;
            
            document.body.appendChild(toast);
            
            // Auto remove
            setTimeout(() => {
                toast.style.opacity = '0';
                toast.style.transform = 'translateY(-20px)';
                setTimeout(() => toast.remove(), 500);
            }, 4000);
        },

        showNotification: function(msg) {
            // Mock Browser Notification
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('Frame Authentic', { body: msg });
            } else {
                this.showToast(msg);
            }
        },

        // --- UTILS & HYPER-MODERN FEATURES ---

        maskEmail: function(email) {
            const parts = email.split('@');
            if (parts.length < 2) return email;
            const user = parts[0];
            const visible = user.length > 3 ? user.substring(0, 3) : user.substring(0, 1);
            return `${visible}***@${parts[1]}`;
        },

        disableInputs: function(disable) {
            document.querySelectorAll('input').forEach(i => i.disabled = disable);
        },

        handlePasteClip: async function() {
            try {
                const text = await navigator.clipboard.readText();
                if (text) {
                    const clean = text.replace(/[^0-9]/g, '').slice(0, 5);
                    const inputs = document.querySelectorAll('.frame-otp-input');
                    clean.split('').forEach((c, i) => {
                        if (inputs[i]) {
                            inputs[i].value = c;
                            inputs[i].classList.add('filled');
                        }
                    });
                    this.handleVerify();
                }
            } catch (err) {
                this.showToast('Permissão de colar negada.', true);
            }
        },

        setupVoiceInput: function() {
            if ('webkitSpeechRecognition' in window) {
                const recognition = new webkitSpeechRecognition();
                recognition.lang = 'pt-BR';
                recognition.continuous = false;

                const btn = document.getElementById('f-voice-cmd');
                
                btn.onclick = () => {
                    btn.style.color = CONFIG.colors.primary;
                    btn.innerHTML = 'Ouvindo...';
                    recognition.start();
                };

                recognition.onresult = (event) => {
                    const transcript = event.results[0][0].transcript;
                    const numbers = transcript.replace(/[^0-9]/g, '').slice(0, 5);
                    
                    if (numbers.length > 0) {
                        const inputs = document.querySelectorAll('.frame-otp-input');
                        numbers.split('').forEach((n, i) => {
                            if (inputs[i]) {
                                inputs[i].value = n;
                                inputs[i].classList.add('filled');
                            }
                        });
                        this.handleVerify();
                    } else {
                        this.showToast('Não entendi os números.', true);
                    }
                    btn.innerHTML = 'Preencher por Voz';
                    btn.style.color = '';
                };
                
                recognition.onerror = () => {
                     btn.innerHTML = 'Erro ao ouvir';
                     setTimeout(() => btn.innerHTML = 'Preencher por Voz', 2000);
                };
            } else {
                document.getElementById('f-voice-cmd').style.display = 'none';
            }
        }
    };

    // 8. GLOBAL SAFETY WRAPPER & INIT
    window.onerror = function(msg, url, line) {
        console.error('Frame Auth Error:', msg);
        // Em um app real, enviaria para Sentry/LogRocket
        return false;
    };

    // Auto-init ao carregar (suporta DOMContentLoaded ou window load se já carregado)
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => App.init());
    } else {
        App.init();
    }

})();