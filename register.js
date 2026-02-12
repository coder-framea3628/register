(function() {
    // ============================================================================
    // FRAME AGENCY REGISTRATION - PROIBIDA COPIA OU REPRODUÇÃO DESTE CÓDIGO SEM AUTORIZAÇÃO (V1.0)
    // ============================================================================

    // 1. LIMPEZA INICIAL
    const existingOverlay = document.getElementById('frame-reg-overlay');
    if (existingOverlay) existingOverlay.remove();
    const existingStyle = document.getElementById('frame-reg-style');
    if (existingStyle) existingStyle.remove();

    // 2. CONFIGURAÇÃO E UTILITÁRIOS
    const CONFIG = {
        colors: {
            primary: '#AC865C',     // Marrom Premium
            primaryDark: '#8b6d4d', // Marrom Escuro (Hover)
            bg: '#FFFFFF',          // Sempre branco
            text: '#1F1F1F',        // Cinza quase preto
            textLight: '#666666',   // Cinza médio
            error: '#D32F2F',       // Vermelho sóbrio
            surface: '#F9F9F9',     // Fundo leve
            gold: '#C29A63',        // Dourado
            checkboxFill: '#B79670',
            link: '#876D42',
            border: '#ECEFF1'
        },
        fonts: {
            primary: 'Montserrat, sans-serif',
            secondary: 'Poppins, sans-serif'
        },
        images: {
            logo: 'https://framerusercontent.com/images/sz5ueC0VcN5fohNrik0bUG9oJbI.png', // Mini photo default
            clientPreview: 'https://framerusercontent.com/images/eQKQHJqfVEEplailgyBYUVnZR8.png',
            creatorPreview: 'https://framerusercontent.com/images/fS4mv3zxDQyalRIXMRRcKt18GDE.png'
        },
        urls: {
            terms: 'https://frameag.com/termos',
            privacy: 'https://frameag.com/privacy',
            refund: 'https://frameag.com/legal/refund',
            verification: 'https://www.frameag.com/becomeframe-facial-verification'
        },
        lottie: {
            verification: 'https://lottie.host/27108e59-5743-41a0-980f-c45cc774f50e/qT7a4kmpdD.lottie',
            resend: 'https://lottie.host/a11872ae-9848-45ba-8871-fa870929372e/YWZlUTBnMU.lottie'
        },
        maxPhotoSize: 4 * 1024 * 1024, // 4MB
        codeLength: 5,
        timerDuration: 300000, // 5min in ms
        storageExpire: 2 * 60 * 60 * 1000 // 2h
    };

    // Ícones SVG
    const ICONS = {
        back: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>`,
        google: `<svg viewBox="0 0 24 24"><path fill="#4285F4" d="M-3.264 51.509c0-.79-.07-1.54-.182-2.25H12v4.258h-7.004c-.09 1.37.542 2.52 1.396 3.33v2.76h-4.516c-2.646-2.44-4.516-6.02-4.516-10.89z"/><path fill="#34A853" d="M12 60c3.06 0 5.626-1.01 7.5-2.73l-3.58-2.76c-.99.66-2.26 1.06-3.92 1.06-3.01 0-5.56-2.04-6.47-4.78H1.5v3.0c2.62 5.1 8.0 8.59 16.5 8.59z"/><path fill="#FBBC05" d="M5.53 35.78c-.24-.72-.38-1.49-.38-2.28 0-.79.14-1.56.38-2.28V28.2H1.5c-.9 1.78-1.5 3.78-1.5 6.3 0 2.52.6 4.52 1.5 6.3l4.03-3.04z"/><path fill="#EA4335" d="M12 24c-1.65 0-3.12.56-4.28 1.65L4.15 21.3C2.26 25.01 0 29.51 0 34.5c0 5.0 2.26 9.49 4.15 13.2l3.57-2.76C8.88 40.44 10.35 39.88 12 39.88c3.01 0 5.56 2.04 6.47 4.78l3.58 2.76c1.87-3.71 4.15-8.2 4.15-13.2 0-4.99-2.26-9.49-4.15-13.2l-3.58 2.76c-.91-2.74-3.46-4.78-6.47-4.78z"/><path fill="none" d="M0 0h24v60H0z"/></svg>`,
        // Add more if needed
    };

    // Estado
    const state = {
        currentStep: 0,
        userType: null, // 'client' or 'creator'
        formData: {
            termsAccepted: true,
            fullName: '',
            email: '',
            marketingOptIn: true,
            termsOptIn: true,
            // Creator specific
            displayName: '',
            birthDate: '',
            gender: '',
            whatsapp: '',
            city: '',
            state: '',
            photos: [],
            bio: '',
            services: [],
            ageConfirm: false
        },
        code: '',
        timer: null,
        timerEnd: 0,
        emailPhoto: CONFIG.images.logo,
        progressSaved: false
    };

    // 3. INJEÇÃO DE CSS
    const style = document.createElement('style');
    style.id = 'frame-reg-style';
    style.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap');

        :root {
            --fr-primary: ${CONFIG.colors.primary};
            --fr-primary-dark: ${CONFIG.colors.primaryDark};
            --fr-bg: ${CONFIG.colors.bg};
            --fr-text: ${CONFIG.colors.text};
            --fr-text-light: ${CONFIG.colors.textLight};
            --fr-error: ${CONFIG.colors.error};
            --fr-surface: ${CONFIG.colors.surface};
            --fr-gold: ${CONFIG.colors.gold};
            --fr-checkbox-fill: ${CONFIG.colors.checkboxFill};
            --fr-link: ${CONFIG.colors.link};
            --fr-border: ${CONFIG.colors.border};
        }

        #frame-reg-overlay * { box-sizing: border-box; -webkit-font-smoothing: antialiased; font-family: var(--fr-font-primary); }

        #frame-reg-overlay {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(255,255,255,0.98);
            z-index: 99999;
            color: var(--fr-text);
            display: flex; justify-content: center; align-items: center;
            overflow-y: auto;
            font-family: 'Montserrat', sans-serif;
        }

        .fr-container {
            width: 100%; max-width: 390px; min-height: 100%;
            background: var(--fr-bg);
            padding: 20px;
            position: relative;
            display: flex; flex-direction: column;
            overflow-y: auto;
        }

        @media (min-width: 768px) {
            .fr-container {
                max-width: 800px; height: auto; min-height: auto;
                border-radius: 20px; border: 1px solid var(--fr-primary);
                box-shadow: 0 10px 30px rgba(172, 134, 92, 0.2);
                padding: 40px;
                margin: 40px auto;
            }
        }

        .fr-title {
            font-size: 22px; font-weight: 700; text-align: center; margin-bottom: 12px;
            @media (min-width: 768px) { font-size: 32px; }
        }

        .fr-text {
            font-size: 12px; color: var(--fr-text-light); text-align: left; line-height: 1.5; margin-bottom: 24px;
            @media (min-width: 768px) { font-size: 14px; }
        }

        .fr-label {
            font-size: 14px; font-weight: 500; margin-bottom: 8px; display: block;
        }

        .fr-input {
            width: 100%; padding: 12px 16px; border: 1px solid var(--fr-border); border-radius: 50px;
            font-size: 16px; background: var(--fr-surface); color: var(--fr-text);
            margin-bottom: 16px;
        }

        .fr-input:focus { border-color: var(--fr-primary); outline: none; }

        .fr-btn {
            background: var(--fr-primary); color: #fff; border: none;
            width: 310px; height: 42px; font-size: 16px; font-weight: 600;
            border-radius: 50px; cursor: pointer; transition: background 0.2s;
            display: flex; align-items: center; justify-content: center; gap: 10px;
            margin: 0 auto 16px auto;
        }

        .fr-btn:hover { background: var(--fr-primary-dark); }

        .fr-btn.secondary { background: transparent; border: 1px solid var(--fr-primary); color: var(--fr-primary); }

        .fr-btn.disabled { opacity: 0.6; cursor: not-allowed; }

        .fr-checkbox-container {
            display: flex; align-items: flex-start; gap: 10px; margin-bottom: 16px;
        }

        .fr-checkbox {
            width: 20px; height: 20px; border: 2px solid #ccc; border-radius: 4px;
            flex-shrink: 0; position: relative; cursor: pointer;
        }

        .fr-checkbox.checked { background: var(--fr-checkbox-fill); border-color: var(--fr-checkbox-fill); }

        .fr-checkbox.checked:after {
            content: '\\2714'; color: #fff; position: absolute; top: -2px; left: 2px; font-size: 14px;
        }

        .fr-checkbox-label {
            font-size: 11px; line-height: 1.4; color: var(--fr-text-light);
            @media (min-width: 768px) { font-size: 12px; }
        }

        .fr-link { color: var(--fr-link); text-decoration: none; transition: color 0.2s; }

        .fr-link:hover { color: var(--fr-primary-dark); }

        .fr-progress {
            display: flex; align-items: center; justify-content: center; gap: 8px; margin: 20px 0;
        }

        .fr-progress-dot {
            width: 8px; height: 8px; border-radius: 50%; background: #ddd; transition: background 0.3s;
        }

        .fr-progress-dot.active { background: var(--fr-primary); }

        .fr-progress-line {
            height: 2px; flex: 1; background: #ddd; transition: background 0.3s;
        }

        .fr-progress-line.active { background: var(--fr-primary); }

        .fr-disclaimer {
            border: 1px solid var(--fr-border); border-radius: 12px; padding: 16px; font-size: 12px;
            color: var(--fr-text-light); text-align: center; margin-top: 20px;
        }

        .fr-popup {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5);
            display: none; align-items: center; justify-content: center; z-index: 100000;
        }

        .fr-popup-content {
            background: #fff; padding: 20px; border-radius: 12px; text-align: center; max-width: 300px;
        }

        .fr-tooltip {
            position: absolute; background: #333; color: #fff; padding: 8px 12px; border-radius: 8px;
            font-size: 12px; z-index: 10; display: none;
        }

        .fr-tooltip:after {
            content: ''; position: absolute; top: 50%; left: -6px; transform: translateY(-50%);
            border: 6px solid transparent; border-right-color: #333;
        }

        .fr-code-container {
            display: flex; justify-content: center; gap: 10px; margin-bottom: 20px;
        }

        .fr-code-input {
            width: 40px; height: 40px; text-align: center; font-size: 20px; border: 1px solid var(--fr-border);
            border-radius: 8px; background: var(--fr-surface);
        }

        .fr-timer { font-size: 24px; font-weight: 600; text-align: center; margin-bottom: 16px; }

        .fr-lottie { width: 100px; height: 100px; margin: 0 auto 20px auto; }

        .fr-photo-upload {
            border: 2px dashed var(--fr-border); border-radius: 12px; padding: 20px; text-align: center;
            margin-bottom: 16px; cursor: pointer;
        }

        .fr-photo-preview { display: flex; gap: 10px; margin-top: 10px; }

        .fr-photo-img { width: 100px; height: 100px; object-fit: cover; border-radius: 8px; }

        .fr-notification {
            position: fixed; top: 20px; left: 50%; transform: translateX(-50%); background: var(--fr-surface);
            padding: 10px 20px; border-radius: 50px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); z-index: 100000;
            font-size: 14px; color: var(--fr-text); display: none;
        }

        /* More styles for brand preview, etc. */
        .fr-brand-toggle { display: flex; margin-bottom: 20px; }

        .fr-brand-btn { flex: 1; padding: 12px; border: none; cursor: pointer; font-weight: 600; 
            border-radius: 50px 0 0 50px; background: var(--fr-primary); color: #fff; }

        .fr-brand-btn:last-child { border-radius: 0 50px 50px 0; background: #333; color: #fff; }

        .fr-brand-btn.active { background: var(--fr-primary); }

        .fr-brand-preview { width: 100%; max-width: 423px; height: 237px; border-radius: 11.4px; 
            background-size: cover; background-position: top left; margin-bottom: 20px; }

        /* Hidden views */
        .fr-step { display: none; }

        .fr-step.active { display: block; animation: fadeIn 0.3s; }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    `;
    document.head.appendChild(style);

    // Inject Lottie script
    const lottieScript = document.createElement('script');
    lottieScript.src = 'https://unpkg.com/@lottiefiles/dotlottie-wc@0.8.11/dist/dotlottie-wc.js';
    lottieScript.type = 'module';
    document.head.appendChild(lottieScript);

    // 4. CRIAÇÃO DE ELEMENTOS
    const overlay = document.createElement('div');
    overlay.id = 'frame-reg-overlay';

    const container = document.createElement('div');
    container.classList.add('fr-container');

    // Header with back
    const header = document.createElement('div');
    header.classList.add('fr-header');
    header.innerHTML = `
        <button class="fr-btn-icon back">${ICONS.back} Voltar</button>
    `;
    container.appendChild(header);

    // Progress bar
    const progress = document.createElement('div');
    progress.classList.add('fr-progress');
    // Dynamically add dots based on steps
    const steps = ['intro', 'personal', 'brand', 'verification', 'code']; // Base steps, creator has more
    steps.forEach((_, i) => {
        if (i > 0) {
            const line = document.createElement('div');
            line.classList.add('fr-progress-line');
            progress.appendChild(line);
        }
        const dot = document.createElement('div');
        dot.classList.add('fr-progress-dot');
        progress.appendChild(dot);
    });
    container.appendChild(progress);

    // Steps containers
    const stepsElements = {};
    steps.forEach(step => {
        const div = document.createElement('div');
        div.classList.add('fr-step');
        div.id = `step-${step}`;
        container.appendChild(div);
        stepsElements[step] = div;
    });

    // Creator specific steps
    const creatorSteps = ['creator1', 'creator2', 'creator3'];
    creatorSteps.forEach(step => {
        const div = document.createElement('div');
        div.classList.add('fr-step');
        div.id = `step-${step}`;
        container.appendChild(div);
        stepsElements[step] = div;
    });

    // Popup
    const popup = document.createElement('div');
    popup.classList.add('fr-popup');
    const popupContent = document.createElement('div');
    popupContent.classList.add('fr-popup-content');
    popup.appendChild(popupContent);
    overlay.appendChild(popup);

    // Tooltip
    const tooltip = document.createElement('div');
    tooltip.classList.add('fr-tooltip');
    tooltip.textContent = 'Esta é uma aceitação obrigatória do cadastro.';
    overlay.appendChild(tooltip);

    // Notification
    const notification = document.createElement('div');
    notification.classList.add('fr-notification');
    overlay.appendChild(notification);

    // Append container to overlay
    overlay.appendChild(container);
    document.body.appendChild(overlay);

    // Elements references
    const elements = {
        backBtn: header.querySelector('.back'),
        progressDots: progress.querySelectorAll('.fr-progress-dot'),
        progressLines: progress.querySelectorAll('.fr-progress-line'),
        steps: stepsElements,
        popup,
        popupContent,
        tooltip,
        notification
    };

    // 5. FUNÇÕES AUXILIARES
    function showNotification(text) {
        elements.notification.textContent = text;
        elements.notification.style.display = 'block';
        setTimeout(() => elements.notification.style.display = 'none', 3000);
    }

    function showPopup(content, onClose) {
        elements.popupContent.innerHTML = content;
        elements.popup.style.display = 'flex';
        elements.popup.onclick = (e) => {
            if (e.target === elements.popup) {
                elements.popup.style.display = 'none';
                if (onClose) onClose();
            }
        };
    }

    function showTooltip(target) {
        const rect = target.getBoundingClientRect();
        elements.tooltip.style.top = `${rect.top}px`;
        elements.tooltip.style.left = `${rect.right + 10}px`;
        elements.tooltip.style.display = 'block';
        setTimeout(() => elements.tooltip.style.display = 'none', 2000);
    }

    function updateProgress(stepIndex) {
        elements.progressDots.forEach((dot, i) => dot.classList.toggle('active', i <= stepIndex));
        elements.progressLines.forEach((line, i) => line.classList.toggle('active', i < stepIndex));
    }

    function switchStep(step) {
        Object.values(elements.steps).forEach(el => el.classList.remove('active'));
        elements.steps[step].classList.add('active');
        let index = steps.indexOf(step);
        if (state.userType === 'creator' && creatorSteps.includes(step)) {
            index = 1 + creatorSteps.indexOf(step); // Adjust for creator flow
        }
        state.currentStep = index;
        updateProgress(index);
    }

    function validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function validateDate(date) {
        const birth = new Date(date);
        const age = (Date.now() - birth) / (1000 * 60 * 60 * 24 * 365.25);
        return age >= 18;
    }

    function saveProgress() {
        localStorage.setItem('fr-reg-data', JSON.stringify(state.formData));
        localStorage.setItem('fr-reg-type', state.userType);
        localStorage.setItem('fr-reg-step', state.currentStep);
        localStorage.setItem('fr-reg-time', Date.now());
    }

    function loadProgress() {
        const time = localStorage.getItem('fr-reg-time');
        if (time && Date.now() - time < CONFIG.storageExpire) {
            state.formData = JSON.parse(localStorage.getItem('fr-reg-data')) || state.formData;
            state.userType = localStorage.getItem('fr-reg-type');
            state.currentStep = parseInt(localStorage.getItem('fr-reg-step')) || 0;
            state.progressSaved = true;
            return true;
        }
        clearProgress();
        return false;
    }

    function clearProgress() {
        localStorage.removeItem('fr-reg-data');
        localStorage.removeItem('fr-reg-type');
        localStorage.removeItem('fr-reg-step');
        localStorage.removeItem('fr-reg-time');
    }

    function startTimer() {
        state.timerEnd = Date.now() + CONFIG.timerDuration;
        elements.timer.textContent = '05:00';
        state.timer = setInterval(() => {
            const diff = state.timerEnd - Date.now();
            if (diff <= 0) {
                clearInterval(state.timer);
                elements.continuarBtn.classList.add('disabled');
                elements.codeInputs.forEach(input => input.disabled = true);
                showNotification('Tempo expirado. Reinicie o processo.');
                return;
            }
            const min = Math.floor(diff / 60000).toString().padStart(2, '0');
            const sec = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
            elements.timer.textContent = `${min}:${sec}`;
        }, 1000);
    }

    function resetTimer() {
        clearInterval(state.timer);
        startTimer();
    }

    function handleCodeInput(e, index) {
        const value = e.target.value;
        if (value.length === 1 && index < CONFIG.codeLength - 1) {
            elements.codeInputs[index + 1].focus();
        }
        state.code = elements.codeInputs.map(input => input.value).join('');
        if (state.code.length === CONFIG.codeLength) {
            // Mock validation
            showNotification('Código validado! Cadastro concluído.');
            // Redirect or finish
            setTimeout(() => window.location.href = 'https://www.frameag.com', 2000);
        }
    }

    function handlePaste(e) {
        if (Date.now() > state.timerEnd) {
            e.preventDefault();
            showPopup('<p>O tempo para inserir o código expirou.</p><button class="fr-btn">Reiniciar</button>', () => location.reload());
            return;
        }
        const paste = e.clipboardData.getData('text').trim();
        if (paste.length === CONFIG.codeLength && /^\d+$/.test(paste)) {
            elements.codeInputs.forEach((input, i) => input.value = paste[i]);
            state.code = paste;
            // Validate as above
        }
    }

    // 6. CONSTRUÇÃO DAS TELAS
    function buildIntro() {
        const step = elements.steps.intro;
        step.innerHTML = `
            <h2 class="fr-title">Olá, usuário! Vamos iniciar seu cadastro?</h2>
            <p class="fr-text">Antes de tudo, é importante entender que a Frame é uma plataforma de tecnologia. Não oferecemos, agenciamos nem intermediamos qualquer tipo de serviço pessoal ou profissional entre usuários e criadoras. <a href="${CONFIG.urls.terms}" class="fr-link" target="_blank">Saiba mais</a></p>
            <p class="fr-text">Toda interação, atendimento ou atividade realizada por criadoras ou anunciantes é de decisão e responsabilidade exclusiva delas, com total autonomia técnica e operacional.</p>
            <p class="fr-text">A Frame atua exclusivamente como provedora de infraestrutura, ferramentas de organização e suporte tecnológico, visando um ecossistema seguro, transparente e eficiente para todos.</p>
            <div class="fr-checkbox-container">
                <div class="fr-checkbox checked" data-mandatory="true"></div>
                <label class="fr-checkbox-label">Declaro que li e compreendi as informações acima, e estou ciente de que a Frame atua exclusivamente como provedora de tecnologia e infraestrutura, sem oferecer, agenciar ou intermediar serviços pessoais ou profissionais.</label>
            </div>
            <button class="fr-btn" id="btn-client">Criar perfil de cliente</button>
            <button class="fr-btn secondary" id="btn-creator">Anunciar como criadora</button>
            <div class="fr-disclaimer">Ao se cadastrar, você atesta ter concordado com a <a href="${CONFIG.urls.privacy}" class="fr-link">Política de Privacidade</a>, <a href="${CONFIG.urls.refund}" class="fr-link">Reembolso</a> e os <a href="${CONFIG.urls.terms}" class="fr-link">Termos da Frame Agency</a>.<br>Atente-se, a Frame não cobra taxas de cadastro, marque como SPAM e-mails que não terminem com: @frameag.com</div>
        `;
        step.querySelector('#btn-client').onclick = () => {
            state.userType = 'client';
            switchStep('personal');
            saveProgress();
        };
        step.querySelector('#btn-creator').onclick = () => {
            state.userType = 'creator';
            switchStep('creator1');
            saveProgress();
        };
    }

    function buildPersonal() {
        const step = elements.steps.personal;
        step.innerHTML = `
            <button class="fr-btn" id="btn-google"><span class="fr-icon">${ICONS.google}</span> Continuar com o Google</button>
            <h2 class="fr-title">Tudo certo! Vamos seguir com seu cadastro.</h2>
            <label class="fr-label">Digite seu nome completo</label>
            <input class="fr-input" id="full-name" placeholder="Conforme seus documentos oficiais" value="${state.formData.fullName}">
            <label class="fr-label">Digite seu e-mail (Você receberá um código de ativação)</label>
            <input class="fr-input" id="email" placeholder="Ex: seunome@email.com" value="${state.formData.email}">
            <div class="fr-checkbox-container">
                <div class="fr-checkbox ${state.formData.marketingOptIn ? 'checked' : ''}"></div>
                <label class="fr-checkbox-label">Autorizo o envio de e-mails com informações sobre meu cadastro, promoções e conteúdos da Frame Agency.</label>
            </div>
            <div class="fr-checkbox-container">
                <div class="fr-checkbox checked" data-mandatory="true"></div>
                <label class="fr-checkbox-label">Li e concordo com os <a href="${CONFIG.urls.terms}" class="fr-link" target="_blank">Termos e Condições da Frame</a>.</label>
            </div>
            <button class="fr-btn" id="continue-personal">Continuar</button>
            <div class="fr-disclaimer">...</div> <!-- Same as above -->
        `;
        step.querySelector('#btn-google').onclick = () => {
            showPopup('<div class="fr-lottie"><dotlottie-wc src="https://lottie.host/some-spinner.lottie" autoplay loop></dotlottie-wc></div><p>Carregando...</p>');
            setTimeout(() => {
                elements.popup.style.display = 'none';
                showPopup('<p>Oops! Não foi possível identificar uma conta Google no seu navegador. Insira seu e-mail manualmente no campo.</p><button class="fr-btn">Fechar</button>');
            }, 2000);
        };
        const continueBtn = step.querySelector('#continue-personal');
        continueBtn.onclick = () => {
            state.formData.fullName = step.querySelector('#full-name').value.trim();
            state.formData.email = step.querySelector('#email').value.trim();
            if (!state.formData.fullName || !validateEmail(state.formData.email)) {
                showNotification('Preencha nome e e-mail válido.');
                return;
            }
            state.emailPhoto = state.userType === 'creator' && state.formData.photos[0] ? URL.createObjectURL(state.formData.photos[0]) : CONFIG.images.logo;
            switchStep('brand');
            saveProgress();
        };
    }

    function buildBrand() {
        const step = elements.steps.brand;
        step.innerHTML = `
            <h2 class="fr-title">Conheça sua Brand Page</h2>
            <div class="fr-brand-toggle">
                <button class="fr-brand-btn ${state.userType === 'client' ? 'active' : ''}">Sou contratante</button>
                <button class="fr-brand-btn ${state.userType === 'creator' ? 'active' : ''}">Sou criadora</button>
            </div>
            <div class="fr-brand-preview" style="background-image: url(${state.userType === 'client' ? CONFIG.images.clientPreview : CONFIG.images.creatorPreview});"></div>
            <p class="fr-text">${state.userType === 'client' ? 'Tenha acesso aos últimos perfis que visitou, catálogos, chat ao vivo com acompanhantes verificadas e mais.' : 'Interaja com assinantes e ofereça seus serviços através do nosso catálogo. Aqui, você pode personalizar tudo como quiser, autonomia e suporte 24h em cada etapa.'}</p>
            <button class="fr-btn" id="continue-brand">Continuar</button>
            <div class="fr-disclaimer">...</div>
        `;
        const toggleBtns = step.querySelectorAll('.fr-brand-btn');
        toggleBtns[0].onclick = () => {
            if (state.userType !== 'client') return;
            step.querySelector('.fr-brand-preview').style.backgroundImage = `url(${CONFIG.images.clientPreview})`;
        };
        toggleBtns[1].onclick = () => {
            if (state.userType !== 'creator') return;
            step.querySelector('.fr-brand-preview').style.backgroundImage = `url(${CONFIG.images.creatorPreview})`;
        };
        step.querySelector('#continue-brand').onclick = () => {
            switchStep('verification');
            saveProgress();
        };
    }

    function buildVerification() {
        const step = elements.steps.verification;
        step.innerHTML = `
            <dotlottie-wc src="${CONFIG.lottie.verification}" style="width: 100px; height: 100px;" autoplay loop></dotlottie-wc>
            <h2 class="fr-title">Agora precisamos validar sua identidade</h2>
            <p class="fr-text">Faltam poucos passos para você se tornar parte da Frame Agency. Nossa tecnologia valida sua identidade para manter a segurança da plataforma. Seus dados estarão 100% seguros conosco conforme a <a href="${CONFIG.urls.privacy}" class="fr-link" target="_blank">Política de Privacidade</a>.</p>
            <button class="fr-btn" id="start-verification">Iniciar validação</button>
            ${state.userType === 'client' ? '<button class="fr-btn secondary" id="skip-verification">Sou contratante, seguir sem verificação</button><p class="fr-text">Apenas contratantes podem pular essa etapa. Para perfis de criadoras, a verificação é obrigatória.</p>' : ''}
            <div class="fr-disclaimer">...</div>
        `;
        step.querySelector('#start-verification').onclick = () => window.open(CONFIG.urls.verification, '_blank');
        if (state.userType === 'client') {
            step.querySelector('#skip-verification').onclick = () => {
                switchStep('code');
                startTimer();
                saveProgress();
            };
        }
    }

    function buildCode() {
        const step = elements.steps.code;
        step.innerHTML = `
            <h2 class="fr-title">Digite o código de autenticação</h2>
            <p class="fr-text">Para sua segurança e de nossa comunidade, enviamos um código ao e-mail informado no início do seu cadastro.</p>
            <div class="fr-email-info" style="display: flex; align-items: center; background: var(--fr-surface); border-radius: 50px; padding: 8px 16px; margin-bottom: 20px;">
                <img src="${state.emailPhoto}" style="width: 32px; height: 32px; border-radius: 50%; margin-right: 10px;">
                <span>${state.formData.email}</span>
            </div>
            <div class="fr-code-container"></div>
            <p class="fr-text">Não recebeu? Clique no botão "Não recebi o código".</p>
            <div class="fr-timer" id="timer">05:00</div>
            <button class="fr-btn" id="continue-code">Continuar</button>
            <button class="fr-btn secondary" id="resend-code">Não recebi o código</button>
            <div class="fr-disclaimer">...</div>
        `;
        elements.timer = step.querySelector('#timer');
        elements.continuarBtn = step.querySelector('#continue-code');
        const codeContainer = step.querySelector('.fr-code-container');
        elements.codeInputs = [];
        for (let i = 0; i < CONFIG.codeLength; i++) {
            const input = document.createElement('input');
            input.classList.add('fr-code-input');
            input.type = 'text';
            input.maxLength = 1;
            input.pattern = '\\d';
            input.oninput = (e) => handleCodeInput(e, i);
            codeContainer.appendChild(input);
            elements.codeInputs.push(input);
        }
        codeContainer.addEventListener('paste', handlePaste);
        step.querySelector('#resend-code').onclick = () => {
            showPopup(`<dotlottie-wc src="${CONFIG.lottie.resend}" style="width: 100px; height: 100px;" autoplay loop></dotlottie-wc><p>Reenviando código...</p>`);
            setTimeout(() => {
                elements.popup.style.display = 'none';
                resetTimer();
                showNotification(`Código reenviado para ${state.formData.email}`);
            }, 2000);
        };
        elements.continuarBtn.onclick = () => {
            if (state.code.length !== CONFIG.codeLength) {
                showNotification('Insira o código completo.');
                return;
            }
            // Proceed
        };
    }

    function buildCreator1() {
        const step = elements.steps.creator1;
        step.innerHTML = `
            <h2 class="fr-title">Informações básicas</h2>
            <label class="fr-label">Nome de exibição</label>
            <input class="fr-input" id="display-name" value="${state.formData.displayName}">
            <label class="fr-label">Data de nascimento (mínimo 18 anos)</label>
            <input class="fr-input" id="birth-date" type="date" value="${state.formData.birthDate}">
            <label class="fr-label">Identidade de gênero</label>
            <select class="fr-input" id="gender">
                <option value="">Selecione</option>
                <option value="cis" ${state.formData.gender === 'cis' ? 'selected' : ''}>Mulher cisgênera</option>
                <option value="trans" ${state.formData.gender === 'trans' ? 'selected' : ''}>Mulher trans</option>
                <option value="travesti" ${state.formData.gender === 'travesti' ? 'selected' : ''}>Travesti</option>
            </select>
            <button class="fr-btn" id="continue-creator1">Continuar</button>
        `;
        const continueBtn = step.querySelector('#continue-creator1');
        continueBtn.onclick = () => {
            state.formData.displayName = step.querySelector('#display-name').value.trim();
            state.formData.birthDate = step.querySelector('#birth-date').value;
            state.formData.gender = step.querySelector('#gender').value;
            if (!state.formData.displayName || !validateDate(state.formData.birthDate) || !state.formData.gender) {
                showNotification('Preencha todos os campos corretamente. Deve ter pelo menos 18 anos.');
                return;
            }
            switchStep('creator2');
            saveProgress();
        };
    }

    function buildCreator2() {
        const step = elements.steps.creator2;
        step.innerHTML = `
            <h2 class="fr-title">Contato e localização</h2>
            <label class="fr-label">WhatsApp</label>
            <input class="fr-input" id="whatsapp" type="tel" value="${state.formData.whatsapp}">
            <label class="fr-label">Cidade</label>
            <input class="fr-input" id="city" value="${state.formData.city}">
            <label class="fr-label">Estado</label>
            <input class="fr-input" id="state" value="${state.formData.state}">
            <label class="fr-label">Fotos (até 3, JPG/PNG, máx 4MB cada)</label>
            <div class="fr-photo-upload" id="photo-upload">Clique para selecionar fotos</div>
            <div class="fr-photo-preview" id="photo-preview"></div>
            <button class="fr-btn" id="continue-creator2">Continuar</button>
        `;
        const upload = step.querySelector('#photo-upload');
        const preview = step.querySelector('#photo-preview');
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/jpeg,image/png';
        input.multiple = true;
        input.style.display = 'none';
        step.appendChild(input);
        upload.onclick = () => input.click();
        input.onchange = (e) => {
            const files = Array.from(e.target.files).slice(0, 3 - state.formData.photos.length);
            files.forEach(file => {
                if (!['image/jpeg', 'image/png'].includes(file.type) || file.size > CONFIG.maxPhotoSize) {
                    showNotification('Arquivo inválido. Apenas JPG/PNG até 4MB.');
                    return;
                }
                state.formData.photos.push(file);
                const img = document.createElement('img');
                img.classList.add('fr-photo-img');
                img.src = URL.createObjectURL(file);
                preview.appendChild(img);
            });
        };
        state.formData.photos.forEach(file => {
            const img = document.createElement('img');
            img.classList.add('fr-photo-img');
            img.src = URL.createObjectURL(file);
            preview.appendChild(img);
        });
        step.querySelector('#continue-creator2').onclick = () => {
            state.formData.whatsapp = step.querySelector('#whatsapp').value.trim();
            state.formData.city = step.querySelector('#city').value.trim();
            state.formData.state = step.querySelector('#state').value.trim();
            if (!state.formData.whatsapp || !state.formData.city || !state.formData.state || state.formData.photos.length < 1) {
                showNotification('Preencha todos os campos e adicione pelo menos uma foto.');
                return;
            }
            switchStep('creator3');
            saveProgress();
        };
    }

    function buildCreator3() {
        const step = elements.steps.creator3;
        const servicesOptions = ['Massagem', 'Acompanhante', 'Videochamada', 'Conteúdo personalizado', 'Outros'];
        let servicesHtml = '';
        servicesOptions.forEach(srv => {
            servicesHtml += `
                <div class="fr-checkbox-container">
                    <div class="fr-checkbox ${state.formData.services.includes(srv) ? 'checked' : ''}" data-value="${srv}"></div>
                    <label class="fr-checkbox-label">${srv}</label>
                </div>
            `;
        });
        step.innerHTML = `
            <h2 class="fr-title">Biografia e serviços</h2>
            <label class="fr-label">Biografia</label>
            <textarea class="fr-input" id="bio" style="height: 100px;">${state.formData.bio}</textarea>
            <label class="fr-label">Serviços oferecidos</label>
            ${servicesHtml}
            <div class="fr-checkbox-container">
                <div class="fr-checkbox" data-mandatory="true"></div>
                <label class="fr-checkbox-label">Afirmo ser maior de 18 anos, estar de acordo com a Política de Privacidade e Exibição Pública, e desejo me cadastrar na Frame Agency.</label>
            </div>
            <button class="fr-btn" id="continue-creator3">Continuar</button>
        `;
        const checkboxes = step.querySelectorAll('.fr-checkbox:not([data-mandatory])');
        checkboxes.forEach(cb => {
            cb.onclick = () => {
                cb.classList.toggle('checked');
                const val = cb.dataset.value;
                if (cb.classList.contains('checked')) {
                    state.formData.services.push(val);
                } else {
                    state.formData.services = state.formData.services.filter(s => s !== val);
                }
            };
        });
        step.querySelector('#continue-creator3').onclick = () => {
            state.formData.bio = step.querySelector('#bio').value.trim();
            state.formData.ageConfirm = step.querySelector('[data-mandatory]').classList.contains('checked');
            if (!state.formData.bio || state.formData.services.length === 0 || !state.formData.ageConfirm) {
                showNotification('Preencha biografia, selecione serviços e confirme idade.');
                return;
            }
            switchStep('personal');
            saveProgress();
        };
    }

    // Checkbox handlers (global for mandatory)
    overlay.addEventListener('click', (e) => {
        if (e.target.classList.contains('fr-checkbox')) {
            if (e.target.dataset.mandatory) {
                showTooltip(e.target);
                return;
            }
            e.target.classList.toggle('checked');
            // Update state if needed
            if (e.target.nextElementSibling.textContent.includes('marketing')) {
                state.formData.marketingOptIn = e.target.classList.contains('checked');
            }
        }
    });

    // Back button
    elements.backBtn.onclick = () => {
        if (state.currentStep > 0) {
            const prevStep = state.userType === 'creator' && state.currentStep <= 3 ? creatorSteps[state.currentStep - 1] : steps[state.currentStep - 1];
            switchStep(prevStep);
        } else {
            // Exit or confirm
            if (confirm('Deseja sair do cadastro?')) window.location.href = 'https://www.frameag.com';
        }
    };

    // 7. INICIALIZAÇÃO
    async function init() {
        buildIntro();
        buildPersonal();
        buildBrand();
        buildVerification();
        buildCode();
        buildCreator1();
        buildCreator2();
        buildCreator3();

        if (loadProgress()) {
            switchStep('verification');
            showNotification('Salvamos seu progresso, prossiga agora');
        } else {
            switchStep('intro');
        }
    }

    init();

})();