window.onload = () => {

    // --- CONFIGURAZIONE ---
    const HELIUS_API_KEY = "0653e5bf-5b9b-44d8-a361-4411fbdda32b"; 
    const BUGZILLA_MINT_ADDRESS = "YOUR_BUGZILLA_MINT_ADDRESS_HERE";
    const PIXELATION_LEVEL = 8;
    const SOLANA_RPC_URL = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;

    // --- OGGETTI SOLANA WEB3 ---
    const { Connection, PublicKey } = solanaWeb3;
    const connection = new Connection(SOLANA_RPC_URL);

    // --- SELEZIONE DEGLI ELEMENTI DEL DOM ---
    const canvas = document.getElementById('matrix-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // UI Principale
    const totalSupplyText = document.getElementById('total-supply');
    const heroConnectButton = document.getElementById('hero-connect-button');
    const progressBarInner = document.getElementById('progress-bar-inner');
    const progressPercentage = document.getElementById('progress-percentage');
    const claimButton = document.getElementById('claim-button');

    // UI Wallet e Dashboard
    const walletContainer = document.getElementById('wallet-container');
    const dashboardButton = document.getElementById('dashboard-button');
    const dashboardAddress = document.getElementById('dashboard-address');
    const walletDashboard = document.getElementById('wallet-dashboard');
    const copyAddressBtn = document.getElementById('copy-address-btn');
    const tokenListContainer = document.getElementById('token-list-container');
    const tokenListLoader = document.getElementById('token-list-loader');
    const disconnectBtn = document.getElementById('disconnect-btn');
    
    // Modal
    const walletModal = document.getElementById('wallet-modal');
    const phantomBtn = document.getElementById('phantom-btn');
    const solflareBtn = document.getElementById('solflare-btn');
    const closeModalBtn = document.getElementById('close-modal-btn');

    // --- STATO E VARIABILI GLOBALI ---
    let progress = 0;
    let totalSupply = 1_000_000_000;
    let roachImage = null;
    let pixelData = [];
    let connectedWallet = null;
    let fullAddress = '';
    // Variabili per Matrix
    let drops = [];
    let columns;
    const fontSize = 12;
    const chars = "░▒▓█▌▐◎✶☄★✦✧";

    // --- FUNZIONI DI SETUP E ANIMAZIONE ---
    function setCanvasDimensions() {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        columns = Math.floor(canvas.width / fontSize);
        drops = [];
        for (let i = 0; i < columns; i++) {
            drops[i] = 1;
        }
    }

    const img = new Image();
    img.src = '/assets/blatta1.png';
    img.onload = () => {
        roachImage = img;
        preparePixelData();
    };
    img.onerror = () => console.error("ERRORE CRITICO: Impossibile caricare l'immagine '/assets/blatta1.png'.");

    function preparePixelData() {
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = roachImage.width;
        tempCanvas.height = roachImage.height;
        tempCtx.drawImage(roachImage, 0, 0);
        const imageData = tempCtx.getImageData(0, 0, roachImage.width, roachImage.height).data;
        pixelData = [];
        for (let y = 0; y < roachImage.height; y += PIXELATION_LEVEL) {
            for (let x = 0; x < roachImage.width; x += PIXELATION_LEVEL) {
                const i = (y * roachImage.width + x) * 4;
                if (imageData[i + 3] > 128) {
                    pixelData.push({ x, y, color: `rgba(${imageData[i]}, ${imageData[i+1]}, ${imageData[i+2]}, ${imageData[i+3]})` });
                }
            }
        }
        pixelData.sort(() => Math.random() - 0.5);
    }

    function activateClaimButton() {
        claimButton.disabled = false;
        claimButton.classList.remove('bg-zinc-700', 'text-zinc-500', 'cursor-not-allowed', 'opacity-50');
        claimButton.classList.add('bg-green-500', 'text-white', 'hover:bg-green-400', 'shadow-lg', 'shadow-green-500/50');
        claimButton.addEventListener('click', () => alert("Airdrop claimed! (Demo)"));
    }

    setInterval(() => {
        if (progress < 100) {
            progress += 0.2;
            const currentProgress = Math.floor(progress);
            progressBarInner.style.width = `${currentProgress}%`;
            progressPercentage.textContent = `${currentProgress}%`;
            if (currentProgress >= 100) activateClaimButton();
        }
    }, 120);

    setInterval(() => {
        const amountToDecrease = Math.floor(Math.random() * 10000) + 500;
        totalSupply = Math.max(0, totalSupply - amountToDecrease);
        totalSupplyText.textContent = totalSupply.toLocaleString('en-US');
    }, 2500);

    function draw() {
        if (!ctx) return;
        // Sfondo nero semitrasparente per l'effetto scia
        ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // --- LOGICA MATRIX RIPRISTINATA ---
        ctx.fillStyle = "#39ff14"; // Colore verde Matrix
        ctx.font = `${fontSize}px monospace`;
        for (let i = 0; i < drops.length; i++) {
            const text = chars[Math.floor(Math.random() * chars.length)];
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);
            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
        
        // Disegna la blatta sopra la pioggia di Matrix
        if (roachImage && pixelData.length > 0) {
            const imgAspectRatio = roachImage.width / roachImage.height;
            const canvasHeight = canvas.height * 0.9;
            const imgHeight = canvasHeight;
            const imgWidth = imgHeight * imgAspectRatio;
            const xOffset = (canvas.width / 2) - (imgWidth / 2);
            const yOffset = (canvas.height / 2) - (imgHeight / 2);
            const scaleX = imgWidth / roachImage.width;
            const scaleY = imgHeight / roachImage.height;
            const pixelsToDraw = Math.floor((progress / 100) * pixelData.length);
            for (let i = 0; i < pixelsToDraw; i++) {
                const pixel = pixelData[i];
                ctx.fillStyle = pixel.color;
                ctx.fillRect(xOffset + pixel.x * scaleX, yOffset + pixel.y * scaleY, PIXELATION_LEVEL * scaleX, PIXELATION_LEVEL * scaleY);
            }
        }
    }
    
    function animationLoop() {
        draw();
        requestAnimationFrame(animationLoop);
    }

    // --- LOGICA DELLA DASHBOARD E DEL WALLET ---

    function toggleDashboard() {
        walletDashboard.classList.toggle('hidden');
    }

    function updateUiToConnectedState(publicKey) {
        fullAddress = publicKey.toString();
        const shortAddress = `${fullAddress.substring(0, 4)}...${fullAddress.substring(fullAddress.length - 4)}`;
        dashboardButton.classList.remove('hidden');
        dashboardButton.classList.add('flex');
        dashboardAddress.textContent = shortAddress;
        heroConnectButton.classList.add('hidden');
        fetchAndDisplayTokens(fullAddress);
    }

    function updateUiToDisconnectedState() {
        dashboardButton.classList.add('hidden');
        dashboardButton.classList.remove('flex');
        walletDashboard.classList.add('hidden');
        heroConnectButton.classList.remove('hidden');
        connectedWallet = null;
        fullAddress = '';
    }

    async function fetchAndDisplayTokens(publicKeyString) {
        if (HELIUS_API_KEY === "LA_TUA_API_KEY_QUI") {
            console.error("ERRORE: Inserisci la tua API Key di Helius nel file index.html");
            tokenListContainer.innerHTML = `<p class="text-center text-red-500">API Key missing in HTML.</p>`;
            return;
        }

        tokenListContainer.innerHTML = '';
        tokenListLoader.style.display = 'block';

        try {
            const ownerPublicKey = new PublicKey(publicKeyString);
            const [solBalance, tokenAccounts] = await Promise.all([
                connection.getBalance(ownerPublicKey),
                connection.getParsedTokenAccountsByOwner(ownerPublicKey, {
                    programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
                })
            ]);

            const tokensWithBalance = tokenAccounts.value
                .map(acc => acc.account.data.parsed.info)
                .filter(info => info.tokenAmount.uiAmount > 0);
            
            let allTokens = [];

            if (solBalance > 0) {
                allTokens.push({
                    isNative: true,
                    mint: 'So11111111111111111111111111111111111111112',
                    balance: (solBalance / solanaWeb3.LAMPORTS_PER_SOL).toLocaleString('en-US', { maximumFractionDigits: 4 }),
                    symbol: 'SOL',
                    logo: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png'
                });
            }

            if (tokensWithBalance.length > 0) {
                const mintAddresses = tokensWithBalance.map(t => t.mint);
                const response = await fetch(SOLANA_RPC_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        jsonrpc: '2.0',
                        id: 'bugzilla-dapp',
                        method: 'getAssetBatch',
                        params: { ids: mintAddresses },
                    }),
                });
                const { result: assets } = await response.json();
                
                const enrichedSplTokens = tokensWithBalance.map(token => {
                    const asset = assets.find(a => a.id === token.mint);
                    return {
                        isNative: false,
                        mint: token.mint,
                        balance: parseFloat(token.tokenAmount.uiAmountString).toLocaleString('en-US', { maximumFractionDigits: 2 }),
                        symbol: asset?.content?.metadata?.symbol || (token.mint === BUGZILLA_MINT_ADDRESS ? '$BUGZILLA' : token.mint.substring(0, 6) + '...'),
                        logo: asset?.content?.links?.image || (token.mint === BUGZILLA_MINT_ADDRESS ? '/assets/bugzilla1.png' : 'https://placehold.co/32x32/374151/9ca3af?text=?')
                    };
                });
                allTokens.push(...enrichedSplTokens);
            }

            allTokens.sort((a, b) => {
                if (a.isNative) return -1;
                if (b.isNative) return 1;
                if (a.mint === BUGZILLA_MINT_ADDRESS) return -1;
                if (b.mint === BUGZILLA_MINT_ADDRESS) return 1;
                return 0;
            });

            tokenListLoader.style.display = 'none';

            if (allTokens.length === 0) {
                tokenListContainer.innerHTML = `<p class="text-center text-gray-500">No assets found.</p>`;
                return;
            }

            allTokens.forEach(token => {
                const tokenEl = document.createElement('div');
                tokenEl.className = 'flex items-center justify-between p-2 rounded-lg hover:bg-zinc-800';
                tokenEl.innerHTML = `
                    <div class="flex items-center gap-3">
                        <img src="${token.logo}" class="w-8 h-8 rounded-full bg-zinc-700" alt="${token.symbol} logo" onerror="this.src='https://placehold.co/32x32/374151/9ca3af?text=?'">
                        <span class="font-bold">${token.symbol}</span>
                    </div>
                    <span class="text-gray-300">${token.balance}</span>
                `;
                tokenListContainer.appendChild(tokenEl);
            });

        } catch (error) {
            console.error("Impossibile recuperare i token:", error);
            tokenListLoader.style.display = 'none';
            tokenListContainer.innerHTML = `<p class="text-center text-red-500">Failed to load tokens.</p>`;
        }
    }

    async function handleConnection(provider) {
        try {
            await provider.connect();
            const publicKey = provider.publicKey;
            const message = `Sign this message to verify you are the owner of this wallet for $BUGZILLA.`;
            const encodedMessage = new TextEncoder().encode(message);
            await provider.signMessage(encodedMessage, "utf8");
            
            connectedWallet = provider;
            updateUiToConnectedState(publicKey);
            closeModal();
        } catch (err) {
            console.error("Connessione o firma fallita:", err);
            updateUiToDisconnectedState();
        }
    }

    async function connectPhantom() {
        if ('phantom' in window && window.phantom.solana) await handleConnection(window.phantom.solana);
        else window.open('https://phantom.app/', '_blank');
    }

    async function connectSolflare() {
        if ('solflare' in window) await handleConnection(window.solflare);
        else window.open('https://solflare.com/', '_blank');
    }
    
    async function disconnectWallet() {
        if (connectedWallet && connectedWallet.disconnect) {
            try {
                await connectedWallet.disconnect();
            } catch (error) {
                console.error("Errore durante la disconnessione:", error);
            }
        }
        updateUiToDisconnectedState();
    }

    function copyAddress() {
        if (!fullAddress) return;
        const textArea = document.createElement("textarea");
        textArea.value = fullAddress;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
            copyAddressBtn.title = 'Copied!';
            setTimeout(() => { copyAddressBtn.title = 'Copy Address'; }, 2000);
        } catch (err) {
            console.error('Fallback: Impossibile copiare l\'indirizzo', err);
        }
        document.body.removeChild(textArea);
    }

    function openModal() {
        walletModal.classList.remove('hidden');
    }

    function closeModal() {
        walletModal.classList.add('hidden');
    }

    // --- AVVIO E GESTIONE ---
    setCanvasDimensions();
    animationLoop();
    window.addEventListener('resize', setCanvasDimensions);

    // Event Listeners
    heroConnectButton.addEventListener('click', openModal);
    closeModalBtn.addEventListener('click', closeModal);
    phantomBtn.addEventListener('click', connectPhantom);
    solflareBtn.addEventListener('click', connectSolflare);
    dashboardButton.addEventListener('click', toggleDashboard);
    disconnectBtn.addEventListener('click', disconnectWallet);
    copyAddressBtn.addEventListener('click', copyAddress);

    document.addEventListener('click', (event) => {
        if (!walletContainer.contains(event.target)) {
            walletDashboard.classList.add('hidden');
        }
    });
};
