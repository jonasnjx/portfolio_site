(function () {
  // Inject chatbot UI into the page
  document.body.insertAdjacentHTML('beforeend', `
    <div id="ai-chat-wrap">
      <span id="ai-chat-label">AI-powered</span>
      <button id="ai-chat-btn" title="Ask about Jonas">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      </button>
    </div>
    <div id="ai-chat-panel">
      <div id="ai-chat-header">
        <span>Baymax Chatbot</span>
        <button id="ai-chat-close">&times;</button>
      </div>
      <div id="ai-chat-links">
        <a href="/how-it-works">How it works</a>
        <span style="color:var(--rule,#e2ded5);">&middot;</span>
        <a href="/baymax">Model Eval &#8594;</a>
      </div>
      <div id="ai-chat-msgs">
        <div class="ai-msg ai-bot">Welcome! Ask me anything about Jonas's background, experience, or projects.</div>
      </div>
      <div id="ai-chat-form">
        <input id="ai-chat-input" type="text" placeholder="Ask a question..." autocomplete="off" />
        <button id="ai-chat-send">&#8594;</button>
      </div>
      <div id="ai-chat-foot">
        <p id="ai-chat-disclaimer">Responses are AI-generated, please verify details.</p>
      </div>
    </div>
    <style>
      :root { --cb-paper: #f7f5f0; --cb-ink: #1a1a1a; --cb-muted: #6b6b6b; --cb-rule: #e2ded5; --cb-accent: #8a6a1c; }
      #ai-chat-wrap {
        position: fixed; bottom: 1.5rem; right: 1.5rem; z-index: 9999;
        display: flex; flex-direction: column; align-items: center; gap: 0.4rem;
      }
      #ai-chat-label {
        font-family: 'IBM Plex Mono', monospace; font-size: 0.62rem;
        color: var(--muted, #6b6b6b);
        background: var(--paper, #f7f5f0);
        border: 1px solid var(--rule, #e2ded5);
        border-radius: 4px; padding: 0.1rem 0.4rem;
        white-space: nowrap; letter-spacing: 0.03em;
      }
      #ai-chat-btn {
        width: 46px; height: 46px; border-radius: 50%;
        background: var(--accent, var(--cb-accent)); color: #fff;
        border: none; cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        box-shadow: 0 2px 12px rgba(0,0,0,0.15); transition: opacity 0.15s;
      }
      #ai-chat-btn:hover { opacity: 0.85; }
      #ai-chat-panel {
        display: none; position: fixed; bottom: 6rem; right: 1.5rem; z-index: 9999;
        width: 320px; height: 460px;
        background: var(--paper, var(--cb-paper));
        border: 1px solid var(--rule, var(--cb-rule));
        border-radius: 8px; flex-direction: column;
        box-shadow: 0 4px 24px rgba(0,0,0,0.10);
      }
      #ai-chat-panel.open { display: flex; }
      #ai-chat-header {
        display: flex; justify-content: space-between; align-items: center;
        padding: 0.75rem 1rem;
        border-bottom: 1px solid var(--rule, var(--cb-rule));
        font-family: 'Bricolage Grotesque', sans-serif;
        font-size: 0.875rem; font-weight: 500;
        color: var(--ink, var(--cb-ink));
      }
      #ai-chat-close {
        background: none; border: none; cursor: pointer; font-size: 1.2rem;
        color: var(--muted, var(--cb-muted)); line-height: 1; padding: 0 0.2rem;
      }
      #ai-chat-close:hover { color: var(--ink, var(--cb-ink)); }
      #ai-chat-foot {
        padding: 0.5rem 1rem 0.65rem;
        border-top: 1px solid var(--rule, var(--cb-rule));
      }
      #ai-chat-links {
        display: flex; align-items: center; gap: 0.5rem;
        padding: 0.5rem 1rem;
        border-bottom: 1px solid var(--rule, var(--cb-rule));
      }
      #ai-chat-links a {
        font-family: 'IBM Plex Mono', monospace; font-size: 0.62rem;
        color: var(--muted, var(--cb-muted)); text-decoration: none;
        letter-spacing: 0.02em; white-space: nowrap;
      }
      #ai-chat-links a:hover { color: var(--accent, var(--cb-accent)); }
      #ai-chat-disclaimer {
        font-family: 'IBM Plex Mono', monospace; font-size: 0.56rem;
        color: var(--muted, var(--cb-muted)); line-height: 1.4; margin: 0; opacity: 0.8;
      }
      #ai-chat-msgs {
        flex: 1; overflow-y: auto; padding: 1rem;
        display: flex; flex-direction: column; gap: 0.75rem;
      }
      .ai-msg {
        font-family: 'Source Serif 4', serif; font-size: 0.82rem;
        line-height: 1.65; max-width: 92%;
      }
      .ai-bot { color: var(--ink, var(--cb-ink)); align-self: flex-start; }
      .ai-user {
        font-family: 'Bricolage Grotesque', sans-serif;
        padding: 0.35rem 0.7rem;
        border-radius: 12px 12px 2px 12px;
        background: var(--accent, var(--cb-accent)); color: #fff;
        align-self: flex-end; max-width: 85%; font-size: 0.82rem;
      }
      .ai-thinking {
        color: var(--muted, var(--cb-muted)); font-style: italic; font-size: 0.78rem;
      }
      #ai-chat-form {
        display: flex; gap: 0.5rem; padding: 0.75rem;
        border-top: 1px solid var(--rule, var(--cb-rule));
      }
      #ai-chat-input {
        flex: 1; font-family: 'IBM Plex Mono', monospace; font-size: 0.73rem;
        border: 1px solid var(--rule, var(--cb-rule)); border-radius: 4px;
        padding: 0.4rem 0.6rem;
        background: var(--paper, var(--cb-paper));
        color: var(--ink, var(--cb-ink)); outline: none;
        transition: border-color 0.15s;
      }
      #ai-chat-input:focus { border-color: var(--accent, var(--cb-accent)); }
      #ai-chat-send {
        background: var(--accent, var(--cb-accent)); color: #fff;
        border: none; border-radius: 4px; padding: 0.4rem 0.75rem;
        cursor: pointer; font-size: 1rem; transition: opacity 0.15s;
      }
      #ai-chat-send:hover { opacity: 0.85; }
      #ai-chat-send:disabled { opacity: 0.4; cursor: not-allowed; }
    </style>
  `);

  const panel = document.getElementById('ai-chat-panel');
  const msgs  = document.getElementById('ai-chat-msgs');
  const input = document.getElementById('ai-chat-input');
  const send  = document.getElementById('ai-chat-send');

  document.getElementById('ai-chat-btn').addEventListener('click', function () {
    panel.classList.toggle('open');
    if (panel.classList.contains('open')) setTimeout(() => input.focus(), 50);
  });
  document.getElementById('ai-chat-close').addEventListener('click', function () {
    panel.classList.remove('open');
  });

  function addMsg(text, cls) {
    const d = document.createElement('div');
    d.className = 'ai-msg ' + (cls || 'ai-bot');
    d.textContent = text;
    msgs.appendChild(d);
    msgs.scrollTop = msgs.scrollHeight;
    return d;
  }

  function addUser(text) {
    const d = document.createElement('div');
    d.className = 'ai-msg ai-user';
    d.textContent = text;
    msgs.appendChild(d);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function ask() {
    const q = input.value.trim();
    if (!q) return;
    window.paTrack?.('baymax_ask', { source: 'widget' });
    input.value = '';
    send.disabled = true;
    addUser(q);
    const thinking = addMsg('Thinking...', 'ai-thinking');
    fetch('https://portfolio-ai-assistant-two.vercel.app/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: q }),
    })
      .then(r => r.json())
      .then(data => {
        msgs.removeChild(thinking);
        addMsg(data.answer || data.error || 'No response.');
      })
      .catch(() => {
        msgs.removeChild(thinking);
        addMsg('Assistant is offline. Try again shortly.');
      })
      .finally(() => {
        send.disabled = false;
        input.focus();
      });
  }

  send.addEventListener('click', ask);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') ask(); });
})();
