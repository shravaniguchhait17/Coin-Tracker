import { useState, useRef, useEffect } from 'react';
import { api } from '../api/client.js';

const WELCOME_MESSAGE = {
    role: 'assistant',
    content:
        "Hey! I can see your spending by category. Ask me things like \"where can I cut back?\" " +
        'or "is my grocery spend normal?" and I\'ll dig into your numbers.'
};

export default function AdvisorChat() {
    const [messages, setMessages] = useState([WELCOME_MESSAGE]);
    const [input, setInput] = useState('');
    const [sending, setSending] = useState(false);
    const logRef = useRef(null);

    // Keep the log scrolled to the latest message as the conversation grows.
    useEffect(() => {
        logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: 'smooth' });
    }, [messages]);

    async function handleSend(e) {
        e.preventDefault();
        const text = input.trim();
        if (!text || sending) return;

        const nextMessages = [...messages, { role: 'user', content: text }];
        setMessages(nextMessages);
        setInput('');
        setSending(true);

        try {
            // The welcome message is local-only UI, never sent to the backend —
            // Anthropic's API expects the conversation to start with a user turn.
            const payload = nextMessages
                .filter((m) => m !== WELCOME_MESSAGE)
                .map(({ role, content }) => ({ role, content }));

            const { reply } = await api.post('/api/advisor/chat', { messages: payload });
            setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
        } catch {
            setMessages((prev) => [
                ...prev,
                { role: 'assistant', content: "Couldn't reach the advisor — try again in a moment." }
            ]);
        } finally {
            setSending(false);
        }
    }

    return (
        <div className="pixel-frame advisor-card">
            <div className="quest-title">
                <span className="dot"></span>
                AI Advisor
            </div>

            <div className="chat-log" ref={logRef}>
                {messages.map((m, i) => (
                    <div key={i} className={`chat-bubble ${m.role}`}>
                        {m.content}
                    </div>
                ))}
                {sending && <div className="chat-bubble assistant chat-thinking">Thinking…</div>}
            </div>

            <form className="chat-input-row" onSubmit={handleSend}>
                <input
                    type="text"
                    className="chat-input"
                    placeholder="Ask about your spending…"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={sending}
                />
                <button className="btn chat-send-btn" type="submit" disabled={sending || !input.trim()}>
                    Send
                </button>
            </form>
        </div>
    );
}