// ============================================================================ 
// FRAME AGENCY - CADASTRO UNIFICADO (V3.0 - MODERN UI/UX)
// ============================================================================

(function() {
    // 1. CONFIGURAÇÕES E UTILITÁRIOS
    const CONFIG = {
        storageKey: 'frame_signup_state',
        storageExpiration: 2 * 60 * 60 * 1000, // 2 horas
        colors: {
            primary: '#AC865C',
            primaryHover: '#8b6d4d',
            secondary: '#B5875C',
            activeCheckbox: '#B79670',
            link: '#876D42',
            text: '#1F1F1F',
            textLight: '#666666',
            border: '#ECEFF1',
            bgDesktop: 'rgba(255,255,255,0.95)',
            surface: '#FFFFFF',
            error: '#D32F2F'
        },
        images: {
            clientCard: 'https://framerusercontent.com/images/eQKQHJqfVEEplailgyBYUVnZR8.png',
            creatorCard: 'https://framerusercontent.com/images/fS4mv3zxDQyalRIXMRRcKt18GDE.png',
            defaultAvatar: 'https://framerusercontent.com/images/sz5ueC0VcN5fohNrik0bUG9oJbI.png',
            googleIcon: 'https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg'
        },
        lotties: {
            verification: 'https://lottie.host/27108e59-5743-41a0-980f-c45cc774f50e/qT7a4kmpdD.lottie',
            emailSend: 'https://lottie.host/a11872ae-9848-45ba-8871-fa870929372e/YWZlUTBnMU.lottie'
        }
    };

    // Estado da Aplicação
    let state = {
        step: 'terms', // terms, role, creator_details, general, verification_intro, 2fa
        role: null, // 'client' | 'creator'
        data: {
            name: '',
            email: '',
            dob: '',
            gender: '',
            whatsapp: '',
            city: '',
            bio: '',
            services: [],
            photos: [] // Armazena DataURLs
        },
        timer: 300, // 5 min em segundos
        timerInterval: null
    };

    // Carregar Lottie Script dinamicamente
    if (!document.querySelector('script[src*="dotlottie-wc"]')) {
        const script = document.createElement('script');
        script.src = "https://unpkg.com/@lottiefiles/dotlottie-wc@0.8.11/dist/dotlottie-wc.js";
        script.type = "module";
        document.head.appendChild(script);
    }

    // 2. INJEÇÃO DE ESTILOS (CSS)
    const style = document.createElement('style');
    style.id = 'frame-signup-style';
    style.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap');

        :root {
            --fs-primary: ${CONFIG.colors.primary};
            --fs-secondary: ${CONFIG.colors.secondary};
            --fs-active: ${CONFIG.colors.activeCheckbox};
            --fs-link: ${CONFIG.colors.link};
            --fs-text: ${CONFIG.colors.text};
            --fs-text-light: ${CONFIG.colors.textLight};
            --fs-border: ${CONFIG.colors.border};
            --fs-surface: ${CONFIG.colors.surface};
        }

        /* Reset & Container */
        #frame-signup-overlay * { box-sizing: border-box; -webkit-font-smoothing: antialiased; }
        
        #frame-signup-overlay {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: #fff;
            z-index: 99999;
            font-family: 'Montserrat', sans-serif;
            color: var(--fs-text);
            display: flex; justify-content: center; align-items: flex-start;
            overflow-y: auto;
        }

        /* Desktop Modal Style */
        @media (min-width: 801px) {
            #frame-signup-overlay {
                background: rgba(0,0,0,0.4);
                align-items: center;
                backdrop-filter: blur(5px);
                padding: 20px;
            }
            .fs-container {
                max-width: 800px;
                width: 100%;
                background: var(--fs-surface);
                border-radius: 20px;
                box-shadow: 0 20px 50px rgba(0,0,0,0.15);
                border: 1px solid rgba(172, 134, 92, 0.2);
                overflow: hidden;
                position: relative;
                display: flex; flex-direction: column;
                max-height: 90vh;
            }
        }
        
        @media (max-width: 800px) {
            .fs-container {
                width: 100%; min-height: 100%;
                background: var(--fs-surface);
                display: flex; flex-direction: column;
            }
        }

        /* Typography */
        .fs-title { font-weight: 600; margin-bottom: 12px; text-align: center; }
        .fs-text { font-weight: 400; color: var(--fs-text-light); line-height: 1.5; margin-bottom: 20px; text-align: center; }
        .fs-text strong { font-weight: 600; color: var(--fs-text); }
        .fs-link { color: var(--fs-link); text-decoration: none; font-weight: 500; transition: 0.2s; cursor: pointer;}
        .fs-link:hover { color: var(--fs-primary); text-decoration: none; }
        
        /* Font Sizes Responsive */
        @media (max-width: 800px) {
            .fs-title { font-size: 22px; }
            .fs-text { font-size: 12px; }
            .fs-input { font-size: 16px !important; } /* Stop Zoom */
        }
        @media (min-width: 801px) {
            .fs-title { font-size: 32px; }
            .fs-text { font-size: 14px; }
        }

        /* Layout Elements */
        .fs-header { padding: 20px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #f0f0f0; }
        .fs-content { padding: 24px; flex: 1; overflow-y: auto; display: flex; flex-direction: column; align-items: center; }
        .fs-footer { padding: 20px; background: #FAFAFA; border-top: 1px solid var(--fs-border); font-size: 11px; color: #999; text-align: center; line-height: 1.4; }
        
        /* Progress Bar */
        .fs-progress-container { width: 100%; height: 6px; background: #eee; position: absolute; top: 0; left: 0; }
        .fs-progress-fill { height: 100%; background: linear-gradient(90deg, #d4bda5, var(--fs-secondary)); width: 0%; transition: width 0.5s ease; border-radius: 0 4px 4px 0; }

        /* Buttons */
        .fs-btn {
            background: var(--fs-secondary); color: #fff; border: none;
            width: 100%; max-width: 310px; height: 42px;
            font-size: 14px; font-weight: 600; border-radius: 21px;
            cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px;
            margin: 10px auto; text-decoration: none;
        }
        .fs-btn:hover { background: var(--fs-primary); transform: translateY(-1px); box-shadow: 0 4px 12px rgba(181, 135, 92, 0.3); }
        .fs-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; box-shadow: none; }
        .fs-btn.secondary { background: transparent; color: var(--fs-text); border: 1px solid #ddd; }
        .fs-btn.secondary:hover { background: #f5f5f5; }
        .fs-btn.google { background: #fff; color: #333; border: 1px solid #ddd; position: relative; }
        .fs-btn.google img { width: 18px; margin-right: 8px; }

        /* Inputs */
        .fs-input-group { width: 100%; max-width: 340px; margin-bottom: 16px; text-align: left; position: relative; }
        .fs-label { font-size: 12px; font-weight: 600; color: var(--fs-text); margin-bottom: 6px; display: block; }
        .fs-input {
            width: 100%; padding: 12px 14px; border: 1px solid #ddd; border-radius: 8px;
            font-family: 'Montserrat', sans-serif; transition: 0.2s; outline: none;
        }
        .fs-input:focus { border-color: var(--fs-primary); box-shadow: 0 0 0 3px rgba(172, 134, 92, 0.1); }
        .fs-error-msg { color: var(--fs-error); font-size: 11px; margin-top: 4px; display: none; }
        .fs-input.error { border-color: var(--fs-error); }
        .fs-input.error + .fs-error-msg { display: block; }

        /* Cards (Brand Page Selection) */
        .fs-card-select {
            width: 100%; max-width: 423px; height: 237px;
            border-radius: 12px; overflow: hidden; position: relative;
            cursor: pointer; margin-bottom: 16px; transition: 0.3s;
            border: 2px solid transparent; box-shadow: 0 4px 15px rgba(0,0,0,0.08);
        }
        .fs-card-select:hover { transform: scale(1.02); box-shadow: 0 8px 25px rgba(0,0,0,0.12); }
        .fs-card-select.active { border-color: var(--fs-primary); }
        .fs-card-bg { width: 100%; height: 100%; object-fit: cover; object-position: top left; }
        .fs-card-overlay {
            position: absolute; top: 0; left: 0; width: 100%; height: 100%;
            background: linear-gradient(0deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 60%);
            display: flex; align-items: flex-end; padding: 20px;
        }
        .fs-card-title { color: #fff; font-size: 20px; font-weight: 700; }

        /* Custom Checkbox */
        .fs-checkbox-wrapper { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 14px; cursor: pointer; max-width: 340px; position: relative; }
        .fs-checkbox {
            width: 18px; height: 18px; border: 1px solid #999; border-radius: 4px; flex-shrink: 0;
            display: flex; align-items: center; justify-content: center; transition: 0.2s; margin-top: 2px;
        }
        .fs-checkbox.checked { background: var(--fs-active); border-color: var(--fs-active); }
        .fs-checkbox svg { width: 12px; height: 12px; color: #fff; opacity: 0; transform: scale(0.5); transition: 0.2s; }
        .fs-checkbox.checked svg { opacity: 1; transform: scale(1); }
        .fs-checkbox-text { font-size: 11px; color: var(--fs-text-light); line-height: 1.4; text-align: left; }

        /* Tooltip for Mandatory Checkbox */
        .fs-tooltip {
            position: absolute; left: 24px; top: -35px; background: #333; color: #fff;
            padding: 8px 12px; border-radius: 6px; font-size: 11px; pointer-events: none;
            opacity: 0; transform: translateY(5px); transition: 0.2s; z-index: 10; width: max-content; max-width: 200px;
        }
        .fs-tooltip::after {
            content: ''; position: absolute; bottom: -4px; left: 8px;
            width: 8px; height: 8px; background: #333; transform: rotate(45deg);
        }
        .fs-tooltip.visible { opacity: 1; transform: translateY(0); }

        /* 2FA Input Grid */
        .fs-code-container { display: flex; gap: 8px; justify-content: center; margin: 20px 0; }
        .fs-code-input {
            width: 48px; height: 56px; border: 1px solid #ddd; border-radius: 12px;
            font-size: 24px; text-align: center; font-weight: 600; outline: none; transition: 0.2s;
            color: var(--fs-primary); background: #FAFAFA;
        }
        .fs-code-input:focus { border-color: var(--fs-primary); background: #fff; transform: translateY(-2px); box-shadow: 0 4px 10px rgba(0,0,0,0.05); }

        /* Avatar in 2FA */
        .fs-user-badge {
            background: #F5F5F5; padding: 6px 16px 6px 6px; border-radius: 50px;
            display: inline-flex; align-items: center; gap: 10px; margin-bottom: 20px;
        }
        .fs-user-avatar { width: 32px; height: 32px; border-radius: 50%; object-fit: cover; }
        .fs-user-email { font-size: 12px; font-weight: 500; color: #555; }

        /* Creator Upload */
        .fs-upload-grid { display: flex; gap: 10px; justify-content: center; margin-bottom: 10px; }
        .fs-upload-box {
            width: 80px; height: 80px; border: 2px dashed #ddd; border-radius: 8px;
            display: flex; align-items: center; justify-content: center; cursor: pointer;
            overflow: hidden; position: relative; background: #fafafa;
        }
        .fs-upload-box:hover { border-color: var(--fs-primary); }
        .fs-upload-preview { width: 100%; height: 100%; object-fit: cover; }
        .fs-upload-icon { color: #ccc; font-size: 20px; }
        
        /* Modals & Popups */
        .fs-modal-overlay {
            position: absolute; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.5); z-index: 100;
            display: flex; align-items: center; justify-content: center;
            opacity: 0; pointer-events: none; transition: 0.3s;
        }
        .fs-modal-overlay.active { opacity: 1; pointer-events: auto; }
        .fs-modal {
            background: #fff; width: 90%; max-width: 320px; padding: 24px; border-radius: 16px;
            text-align: center; transform: scale(0.9); transition: 0.3s;
        }
        .fs-modal-overlay.active .fs-modal { transform: scale(1); }
        
        /* Toast Notification */
        .fs-toast {
            position: fixed; top: 20px; left: 50%; transform: translateX(-50%) translateY(-20px);
            background: #333; color: #fff; padding: 12px 24px; border-radius: 50px;
            font-size: 13px; font-weight: 500; opacity: 0; transition: 0.4s; z-index: 100000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2); display: flex; align-items: center; gap: 8px;
        }
        .fs-toast.visible { transform: translateX(-50%) translateY(0); opacity: 1; }

        /* Spinner */
        .fs-spinner {
            width: 30px; height: 30px; border: 3px solid rgba(172, 134, 92, 0.2);
            border-top: 3px solid var(--fs-primary); border-radius: 50%;
            animation: fs-spin 1s linear infinite; margin: 0 auto 15px auto;
        }
        @keyframes fs-spin { to { transform: rotate(360deg); } }

        /* Animations */
        .fs-fade-in { animation: fsFadeIn 0.4s ease-out; width: 100%; display: flex; flex-direction: column; align-items: center; }
        @keyframes fsFadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    `;
    document.head.appendChild(style);

    // 3. ESTRUTURA HTML BASE
    const htmlBase = `
        <div id="frame-signup-overlay">
            <div class="fs-container">
                <div class="fs-progress-container"><div class="fs-progress-fill" id="fs-progress"></div></div>
                
                <div class="fs-header">
                    <button class="fs-btn secondary" id="fs-btn-back" style="width: 32px; height: 32px; padding: 0; border: none; border-radius: 50%; box-shadow: none;">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                    </button>
                    <div style="font-size: 14px; font-weight:600; color: var(--fs-primary);">Frame Agency</div>
                    <div style="width: 32px;"></div> </div>

                <div class="fs-content" id="fs-view-container">
                    </div>

                <div class="fs-footer">
                    <div style="margin-bottom: 8px;">
                        Ao se cadastrar, você atesta ter concordado com a 
                        <a href="https://frameag.com/privacy" class="fs-link">Política de Privacidade</a>, 
                        <a href="https://frameag.com/legal/refund" class="fs-link">Reembolso</a> e os 
                        <a href="https://frameag.com/termos" class="fs-link">Termos da Frame Agency</a>.
                    </div>
                    <div style="padding: 8px; border: 1px solid var(--fs-border); border-radius: 8px; display: inline-block;">
                        Atente-se, a Frame não cobra taxas de cadastro. Marque como SPAM e-mails que não terminem com: <strong>@frameag.com</strong>
                    </div>
                </div>

                <div id="fs-toast" class="fs-toast">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#4CAF50" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                    <span id="fs-toast-msg">Mensagem</span>
                </div>

                <div class="fs-modal-overlay" id="fs-modal-overlay">
                    <div class="fs-modal" id="fs-modal-content"></div>
                </div>

            </div>
        </div>
    `;

    // 4. LÓGICA DE NEGÓCIO E RENDERIZAÇÃO
    
    // Limpeza prévia
    const existing = document.getElementById('frame-signup-overlay');
    if (existing) existing.remove();

    // Inserir no DOM
    const wrapper = document.createElement('div');
    wrapper.innerHTML = htmlBase;
    document.body.appendChild(wrapper.firstElementChild);

    // Elementos Globais
    const els = {
        container: document.getElementById('fs-view-container'),
        progress: document.getElementById('fs-progress'),
        backBtn: document.getElementById('fs-btn-back'),
        toast: document.getElementById('fs-toast'),
        modalOverlay: document.getElementById('fs-modal-overlay'),
        modalContent: document.getElementById('fs-modal-content')
    };

    // --- FUNÇÕES AUXILIARES ---

    function showToast(msg) {
        document.getElementById('fs-toast-msg').textContent = msg;
        els.toast.classList.add('visible');
        setTimeout(() => els.toast.classList.remove('visible'), 3500);
    }

    function showModal(content, allowClose = true) {
        els.modalContent.innerHTML = content;
        els.modalOverlay.classList.add('active');
        if (allowClose) {
            const closeBtn = document.getElementById('fs-modal-close');
            if (closeBtn) closeBtn.onclick = closeModal;
        }
    }

    function closeModal() {
        els.modalOverlay.classList.remove('active');
    }

    function updateProgress(percent) {
        els.progress.style.width = percent + '%';
    }

    function saveState() {
        const payload = {
            state: state,
            timestamp: Date.now()
        };
        localStorage.setItem(CONFIG.storageKey, JSON.stringify(payload));
        // Show subtle toast only if significant change? 
        // User asked for "Notification popup... saved progress". 
        // We will do this via logic in specific steps to not spam.
    }

    function loadState() {
        const raw = localStorage.getItem(CONFIG.storageKey);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (Date.now() - parsed.timestamp < CONFIG.storageExpiration) {
                state = parsed.state;
                showToast("Progresso salvo restaurado. Prossiga.");
                return true;
            } else {
                localStorage.removeItem(CONFIG.storageKey);
            }
        }
        return false;
    }

    // --- GERADORES DE VISUALIZAÇÃO (VIEWS) ---

    const Views = {
        terms: () => `
            <div class="fs-fade-in">
                <div class="fs-title" style="text-align: left;">Olá! Vamos iniciar seu cadastro?</div>
                <div class="fs-text" style="text-align: left;">
                    Antes de tudo, é importante entender que a Frame é uma plataforma de tecnologia.
                    <br><br>
                    <strong>Não oferecemos, agenciamos nem intermediamos qualquer tipo de serviço pessoal ou profissional.</strong>
                    <br><br>
                    Toda interação é de responsabilidade exclusiva dos usuários. A Frame atua apenas como provedora de infraestrutura segura.
                    <br><br>
                    <a href="https://frameag.com/termos" target="_blank" class="fs-link">Saiba mais sobre nossos Termos.</a>
                </div>
                
                <div class="fs-checkbox-wrapper" id="chk-terms-wrapper">
                    <div class="fs-checkbox checked"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></div>
                    <div class="fs-checkbox-text">Declaro que li e compreendi as informações acima e estou ciente do modelo de negócio da plataforma.</div>
                    <div class="fs-tooltip">Esta é uma aceitação obrigatória do cadastro.</div>
                </div>

                <div style="width: 100%; height: 1px; background: #eee; margin: 20px 0;"></div>

                <button class="fs-btn" onclick="app.setRole('client')">Criar perfil de cliente</button>
                <button class="fs-btn secondary" onclick="app.setRole('creator')">Anunciar como criadora</button>
            </div>
        `,

        role_selection: () => `
             <div class="fs-fade-in">
                <div class="fs-title">Conheça sua Brand Page</div>
                <div class="fs-text">Escolha como deseja interagir na plataforma.</div>

                <div class="fs-card-select" onclick="app.confirmRole('client')">
                    <img src="${CONFIG.images.clientCard}" class="fs-card-bg">
                    <div class="fs-card-overlay"><div class="fs-card-title">Sou contratante</div></div>
                </div>

                <div class="fs-card-select" onclick="app.confirmRole('creator')">
                    <img src="${CONFIG.images.creatorCard}" class="fs-card-bg">
                    <div class="fs-card-overlay"><div class="fs-card-title">Sou criadora</div></div>
                </div>
             </div>
        `,

        creator_details: () => `
            <div class="fs-fade-in" style="width:100%; max-width: 400px;">
                <div class="fs-title">Perfil da Criadora</div>
                <div class="fs-text">Preencha os detalhes para seu perfil profissional.</div>

                <div class="fs-input-group">
                    <label class="fs-label">Nome de Exibição (Artístico)</label>
                    <input type="text" class="fs-input" id="c-name" value="${state.data.name}">
                </div>

                <div class="fs-input-group">
                    <label class="fs-label">Data de Nascimento (+18)</label>
                    <input type="date" class="fs-input" id="c-dob" value="${state.data.dob}">
                    <div class="fs-error-msg">Você precisa ser maior de 18 anos.</div>
                </div>

                <div class="fs-input-group">
                    <label class="fs-label">Identidade de Gênero</label>
                    <select class="fs-input" id="c-gender">
                        <option value="">Selecione...</option>
                        <option value="cis" ${state.data.gender === 'cis' ? 'selected' : ''}>Mulher Cisgênero</option>
                        <option value="trans" ${state.data.gender === 'trans' ? 'selected' : ''}>Mulher Trans</option>
                        <option value="travesti" ${state.data.gender === 'travesti' ? 'selected' : ''}>Travesti</option>
                    </select>
                </div>

                <div class="fs-input-group">
                    <label class="fs-label">WhatsApp</label>
                    <input type="tel" class="fs-input" id="c-whatsapp" placeholder="(XX) XXXXX-XXXX" value="${state.data.whatsapp}">
                </div>

                <div class="fs-input-group">
                    <label class="fs-label">Cidade / Estado</label>
                    <input type="text" class="fs-input" id="c-city" placeholder="Ex: São Paulo - SP" value="${state.data.city}">
                </div>

                <div class="fs-input-group">
                    <label class="fs-label">Suas fotos (Min 3)</label>
                    <div class="fs-upload-grid" id="photo-grid">
                        </div>
                    <input type="file" id="file-input" multiple accept="image/png, image/jpeg" style="display:none">
                    <div class="fs-text" style="font-size:10px;">Máx 4MB por foto (JPG/PNG)</div>
                </div>

                <div class="fs-checkbox-wrapper" id="chk-18-wrapper">
                    <div class="fs-checkbox checked"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></div>
                    <div class="fs-checkbox-text">Afirmo ser maior de 18 anos, estar de acordo com a Política de Privacidade e Exibição Pública.</div>
                     <div class="fs-tooltip">Obrigatório.</div>
                </div>

                <button class="fs-btn" onclick="app.submitCreatorDetails()">Continuar</button>
            </div>
        `,

        general: () => `
            <div class="fs-fade-in" style="width:100%; max-width: 400px;">
                <div class="fs-title">Dados de Acesso</div>
                <div class="fs-text">Vamos criar sua conta segura.</div>

                <button class="fs-btn google" onclick="app.handleGoogleLogin()">
                    <img src="${CONFIG.images.googleIcon}"> Continuar com o Google
                </button>

                <div style="display:flex; align-items:center; width:100%; margin: 20px 0;">
                    <div style="flex:1; height:1px; background:#ddd;"></div>
                    <div style="padding:0 10px; font-size:12px; color:#999;">ou entre com e-mail</div>
                    <div style="flex:1; height:1px; background:#ddd;"></div>
                </div>

                <div class="fs-input-group">
                    <label class="fs-label">Nome Completo (Civil)</label>
                    <input type="text" class="fs-input" id="g-name" placeholder="Como no documento" value="${state.data.name}"> </div>

                <div class="fs-input-group">
                    <label class="fs-label">E-mail</label>
                    <input type="email" class="fs-input" id="g-email" placeholder="seu@email.com" value="${state.data.email}">
                </div>

                <div class="fs-checkbox-wrapper">
                    <div class="fs-checkbox checked" id="chk-mkt"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></div>
                    <div class="fs-checkbox-text">Autorizo o envio de e-mails com informações sobre meu cadastro e novidades.</div>
                </div>

                <div class="fs-checkbox-wrapper" id="chk-general-terms-wrapper">
                    <div class="fs-checkbox checked"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></div>
                    <div class="fs-checkbox-text">Li e concordo com os Termos e Condições da Frame.</div>
                    <div class="fs-tooltip">Obrigatório.</div>
                </div>

                <button class="fs-btn" onclick="app.submitGeneral()">Continuar</button>
            </div>
        `,

        verification_intro: () => `
            <div class="fs-fade-in">
                <dotlottie-wc src="${CONFIG.lotties.verification}" style="width: 200px; height: 200px;" autoplay loop></dotlottie-wc>
                
                <div class="fs-title">Validação de Identidade</div>
                <div class="fs-text">
                    Para garantir a segurança da comunidade, precisamos validar quem você é. 
                    <br>Seus dados são criptografados.
                </div>

                <button class="fs-btn" onclick="window.open('https://www.frameag.com/becomeframe-facial-verification', '_blank')">Iniciar validação facial</button>
                
                ${state.role === 'client' ? 
                `<button class="fs-btn secondary" onclick="app.goTo2FA()">Sou contratante, seguir sem verificação</button>` 
                : 
                `<div class="fs-text" style="font-size:11px; margin-top:10px; color:${CONFIG.colors.error}">Verificação obrigatória para criadoras.</div>`
                }
            </div>
        `,

        two_factor: () => {
            const avatar = (state.role === 'creator' && state.data.photos.length > 0) ? state.data.photos[0] : CONFIG.images.defaultAvatar;
            
            return `
            <div class="fs-fade-in">
                <div class="fs-title">Confirme seu e-mail</div>
                <div class="fs-text">Enviamos um código de 5 dígitos para o seu e-mail.</div>
                
                <div class="fs-user-badge">
                    <img src="${avatar}" class="fs-user-avatar">
                    <span class="fs-user-email">${state.data.email || 'email@exemplo.com'}</span>
                </div>

                <div style="font-size: 14px; font-weight:700; color:${CONFIG.colors.primary}; margin-bottom: 5px;" id="fs-timer">05:00</div>
                
                <div class="fs-code-container" id="otp-container">
                    <input type="text" maxlength="1" class="fs-code-input" data-idx="0">
                    <input type="text" maxlength="1" class="fs-code-input" data-idx="1">
                    <input type="text" maxlength="1" class="fs-code-input" data-idx="2">
                    <input type="text" maxlength="1" class="fs-code-input" data-idx="3">
                    <input type="text" maxlength="1" class="fs-code-input" data-idx="4">
                </div>

                <div class="fs-text" style="font-size:12px; margin-bottom: 20px;">
                    Não recebeu? <span class="fs-link" onclick="app.resendCode()">Reenviar código</span>
                </div>

                <button class="fs-btn" id="btn-verify-code" onclick="app.verifyCode()">Validar Acesso</button>
            </div>
            `;
        }
    };

    // --- LÓGICA DE APLICAÇÃO (CONTROLLER) ---

    const app = {
        init: () => {
            loadState(); // Tenta recuperar
            // Se recuperou e está em General ou Creator, vai direto. 
            // Se não, terms.
            app.render();
        },

        render: () => {
            // Define view
            let html = '';
            let progress = 0;
            
            switch(state.step) {
                case 'terms': html = Views.terms(); progress = 5; break;
                case 'role': html = Views.role_selection(); progress = 15; break;
                case 'creator_details': html = Views.creator_details(); progress = 35; break;
                case 'general': html = Views.general(); progress = state.role === 'creator' ? 60 : 40; break;
                case 'verification_intro': html = Views.verification_intro(); progress = 80; break;
                case '2fa': html = Views.two_factor(); progress = 95; break;
            }

            els.container.innerHTML = html;
            updateProgress(progress);
            
            // Post-render bindings
            if (state.step === 'terms' || state.step === 'general' || state.step === 'creator_details') {
                app.bindCheckboxes();
            }
            if (state.step === 'creator_details') {
                app.bindPhotoUpload();
            }
            if (state.step === '2fa') {
                app.startTimer();
                app.bindOTPInputs();
            }
            
            // Back Button Logic
            els.backBtn.onclick = () => app.goBack();
            els.backBtn.style.visibility = state.step === 'terms' ? 'hidden' : 'visible';
        },

        goBack: () => {
            if(state.step === 'role') state.step = 'terms';
            else if(state.step === 'creator_details') state.step = 'role';
            else if(state.step === 'general') {
                state.step = state.role === 'creator' ? 'creator_details' : 'role';
            }
            else if(state.step === 'verification_intro') state.step = 'general';
            else if(state.step === '2fa') state.step = 'verification_intro';
            
            app.render();
        },

        setRole: (role) => {
            state.role = role;
            if(role === 'client') state.step = 'general'; 
            // OBS: O PDF diz "Brand Page" depois de termos. 
            // O código original seguia PDF pg 1 -> pg 2.
            // O request pediu pra seguir o visual de cartões.
            // Vamos ajustar: Terms -> Role Selection (Cards) -> Form.
            state.step = 'role';
            app.render();
        },

        confirmRole: (role) => {
            state.role = role;
            state.step = role === 'creator' ? 'creator_details' : 'general';
            app.render();
        },

        bindCheckboxes: () => {
            document.querySelectorAll('.fs-checkbox-wrapper').forEach(wrapper => {
                const box = wrapper.querySelector('.fs-checkbox');
                const tooltip = wrapper.querySelector('.fs-tooltip');
                
                wrapper.onclick = () => {
                    const isChecked = box.classList.contains('checked');
                    
                    if (isChecked && (wrapper.id.includes('terms') || wrapper.id.includes('18'))) {
                        // Tentar desmarcar obrigatório
                        if(tooltip) {
                            tooltip.classList.add('visible');
                            setTimeout(() => tooltip.classList.remove('visible'), 2500);
                        }
                        // Shake effect
                        wrapper.style.transform = 'translateX(-5px)';
                        setTimeout(() => wrapper.style.transform = 'translateX(0)', 100);
                        setTimeout(() => wrapper.style.transform = 'translateX(5px)', 200);
                        setTimeout(() => wrapper.style.transform = 'translateX(0)', 300);
                    } else {
                        box.classList.toggle('checked');
                    }
                };
            });
        },

        // --- CREATOR LOGIC ---
        bindPhotoUpload: () => {
            const grid = document.getElementById('photo-grid');
            const input = document.getElementById('file-input');
            
            const renderBoxes = () => {
                grid.innerHTML = '';
                // 3 slots
                for (let i = 0; i < 3; i++) {
                    const box = document.createElement('div');
                    box.className = 'fs-upload-box';
                    if (state.data.photos[i]) {
                        box.innerHTML = `<img src="${state.data.photos[i]}" class="fs-upload-preview">`;
                        box.onclick = () => {
                            // Remove logic
                            state.data.photos.splice(i, 1);
                            renderBoxes();
                        };
                    } else {
                        box.innerHTML = `<span class="fs-upload-icon">+</span>`;
                        box.onclick = () => input.click();
                    }
                    grid.appendChild(box);
                }
            };
            
            input.onchange = (e) => {
                const files = Array.from(e.target.files);
                if (files.length + state.data.photos.length > 3) {
                    showToast("Máximo de 3 fotos.");
                    return;
                }
                
                files.forEach(file => {
                    if (file.size > 4 * 1024 * 1024) {
                        showToast(`Arquivo ${file.name} muito grande (Máx 4MB).`);
                        return;
                    }
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                        state.data.photos.push(ev.target.result);
                        renderBoxes();
                    };
                    reader.readAsDataURL(file);
                });
            };

            renderBoxes();
        },

        submitCreatorDetails: () => {
            // Validation
            const name = document.getElementById('c-name').value;
            const dob = document.getElementById('c-dob').value;
            const gender = document.getElementById('c-gender').value;
            
            // Age Calc
            const age = new Date(new Date() - new Date(dob)).getFullYear() - 1970;
            
            if (!name || !dob || !gender || state.data.photos.length < 3) {
                showToast("Preencha todos os campos e envie 3 fotos.");
                return;
            }
            if (age < 18) {
                showToast("É necessário ter mais de 18 anos.");
                return;
            }

            // Save
            state.data.name = name;
            state.data.dob = dob;
            state.data.gender = gender;
            state.data.whatsapp = document.getElementById('c-whatsapp').value;
            state.data.city = document.getElementById('c-city').value;
            
            saveState();
            state.step = 'general';
            app.render();
            showToast("Perfil salvo! Vamos criar seu acesso.");
        },

        // --- GENERAL LOGIC ---
        handleGoogleLogin: () => {
            showModal(`
                <div class="fs-spinner"></div>
                <div class="fs-title" style="font-size:18px;">Conectando ao Google...</div>
            `, false);
            
            setTimeout(() => {
                showModal(`
                    <div style="color:${CONFIG.colors.error}; font-size:40px; margin-bottom:10px;">!</div>
                    <div class="fs-title" style="font-size:18px;">Oops!</div>
                    <div class="fs-text">Não foi possível identificar uma conta Google no seu navegador. Insira seu e-mail manualmente.</div>
                    <button class="fs-btn" id="fs-modal-close">Entendi</button>
                `);
            }, 2000);
        },

        submitGeneral: () => {
            const name = document.getElementById('g-name').value;
            const email = document.getElementById('g-email').value;
            
            if (!name || !email || !email.includes('@')) {
                showToast("Insira um nome e e-mail válidos.");
                return;
            }

            state.data.name = name;
            state.data.email = email;
            
            saveState();
            state.step = 'verification_intro';
            app.render();
        },

        // --- 2FA LOGIC ---
        goTo2FA: () => {
            state.step = '2fa';
            app.render();
        },

        startTimer: () => {
            if (state.timerInterval) clearInterval(state.timerInterval);
            state.timer = 300; // Reset 5 min
            const display = document.getElementById('fs-timer');
            
            state.timerInterval = setInterval(() => {
                state.timer--;
                const m = Math.floor(state.timer / 60);
                const s = state.timer % 60;
                display.textContent = `${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
                
                if (state.timer <= 0) {
                    clearInterval(state.timerInterval);
                    display.textContent = "Expirado";
                    document.querySelectorAll('.fs-code-input').forEach(i => i.disabled = true);
                    document.getElementById('btn-verify-code').disabled = true;
                    
                    showModal(`
                        <div class="fs-title" style="font-size:18px;">Tempo Expirado</div>
                        <div class="fs-text">O tempo para inserção do código acabou.</div>
                        <button class="fs-btn" onclick="location.reload()">Reiniciar</button>
                    `, false);
                }
            }, 1000);
        },

        bindOTPInputs: () => {
            const inputs = document.querySelectorAll('.fs-code-input');
            
            inputs.forEach((input, index) => {
                // Focus Logic
                input.onkeyup = (e) => {
                    if (e.key >= 0 && e.key <= 9) {
                        if (index < 4) inputs[index + 1].focus();
                    } else if (e.key === 'Backspace') {
                        if (index > 0) inputs[index - 1].focus();
                    }
                };
                
                // Paste Logic
                input.onpaste = (e) => {
                    if (state.timer <= 0) return;
                    e.preventDefault();
                    const text = (e.clipboardData || window.clipboardData).getData('text').slice(0, 5);
                    if (!/^\d+$/.test(text)) return;
                    
                    text.split('').forEach((char, i) => {
                        if (inputs[i]) inputs[i].value = char;
                    });
                    inputs[Math.min(text.length, 4)].focus();
                };
            });
        },

        resendCode: () => {
             showModal(`
                <dotlottie-wc src="${CONFIG.lotties.emailSend}" style="width: 150px; height: 150px;" autoplay loop></dotlottie-wc>
                <div class="fs-title" style="font-size:18px;">Enviando...</div>
            `, false);

            setTimeout(() => {
                closeModal();
                app.startTimer();
                // Limpa inputs
                document.querySelectorAll('.fs-code-input').forEach(i => i.value = '');
                document.querySelectorAll('.fs-code-input')[0].focus();
                showToast(`Código reenviado para ${state.data.email}`);
            }, 2500);
        },

        verifyCode: () => {
            const inputs = Array.from(document.querySelectorAll('.fs-code-input'));
            const code = inputs.map(i => i.value).join('');
            
            if (code.length < 5) {
                showToast("Digite o código completo.");
                return;
            }
            
            // Mock Success
            showModal(`
                <div class="fs-spinner" style="border-top-color: #4CAF50;"></div>
                <div class="fs-title" style="font-size:18px;">Sucesso!</div>
                <div class="fs-text">Cadastro realizado. Redirecionando...</div>
            `, false);
            
            localStorage.removeItem(CONFIG.storageKey);
            setTimeout(() => {
                window.location.href = "https://www.frameag.com/dashboard";
            }, 2000);
        }
    };

    // Expor App globalmente para callbacks do HTML (onclick)
    window.app = app;

    // Iniciar
    app.init();

})();