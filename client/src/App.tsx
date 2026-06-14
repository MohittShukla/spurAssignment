import { useState, useEffect } from 'react';
import { ChatWidget } from './components/chat/ChatWidget';
import { Headphones, Keyboard, Laptop } from 'lucide-react';

const PRODUCTS = [
  {
    name: 'Aether ANC Headset',
    price: '₹14,999',
    description: 'Active noise cancellation, 40h battery, memory foam earcups.',
    icon: <Headphones />,
    prompt: 'What is the return policy for the Aether ANC Headset?',
  },
  {
    name: 'Luna Mechanical Keyboard',
    price: '₹8,999',
    description: '75% layout, hot-swappable switches, aluminum frame.',
    icon: <Keyboard />,
    prompt: 'Can I exchange the Luna Keyboard if I don\'t like the switches?',
  },
  {
    name: 'Nomad Leather Sleeve',
    price: '₹4,999',
    description: 'Horween leather, microfiber lining, magnetic closure.',
    icon: <Laptop />,
    prompt: 'Do you ship the Nomad Leather Sleeve internationally?',
  },
];

const QUESTIONS = [
  { text: 'What is your return policy?', prompt: 'What is your return policy?' },
  { text: 'Do you ship internationally?', prompt: 'Do you ship internationally?' },
  { text: 'What are the shipping costs?', prompt: 'What are your shipping costs?' },
  { text: 'What are your support hours?', prompt: 'What are your support hours?' },
];

function App() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const triggerChat = (message?: string) => {
    window.dispatchEvent(new CustomEvent('open-chat', { detail: { message } }));
  };

  return (
    <div>
      <header className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
        <span className="navbar-logo">Dash Supply Co.</span>
        <div className="navbar-actions">
          <a href="#products" className="navbar-link">Products</a>
          <button onClick={() => triggerChat()} className="btn btn-brand">
            Support
          </button>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="hero">
          <div className="hero-content">
            <h1>Better everyday things.</h1>
            <p className="hero-subtitle">
              Premium accessories for the modern workspace. Supported by an AI agent that never sleeps.
            </p>
            <div className="hero-actions">
              <a href="#products" className="btn btn-brand">Browse collection</a>
              <button onClick={() => triggerChat()} className="btn btn-outline-light">
                Talk to us →
              </button>
            </div>
          </div>
          
          {/* Hero Visual: Floating Chat Preview */}
          <div className="hero-visual">
            <div className="hero-chat-preview">
              <div className="hero-chat-head">
                <span className="hero-chat-dot"></span>
                Dash AI
              </div>
              <div className="hero-chat-body">
                <div className="hero-chat-msg hero-chat-msg--user">
                  Can you help me choose a keyboard?
                </div>
                <div className="hero-chat-msg hero-chat-msg--ai">
                  I'd love to! Are you looking for something quiet for the office, or tactile for typing?
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Bar */}
        <section className="trust-bar">
          <div className="trust-item">
            <span className="trust-value">30-day</span>
            <span className="trust-label">Free returns</span>
          </div>
          <div className="trust-divider" />
          <div className="trust-item">
            <span className="trust-value">50+</span>
            <span className="trust-label">Countries shipped</span>
          </div>
          <div className="trust-divider" />
          <div className="trust-item">
            <span className="trust-value">24/7</span>
            <span className="trust-label">AI support</span>
          </div>
        </section>

        {/* How It Works */}
        <section className="section">
          <h2 className="section-label">How it works</h2>
          <div className="steps-grid">
            <div className="step">
              <div className="step-number">1</div>
              <h3 className="step-title">Find your spark</h3>
              <p className="step-desc">Browse our curated collection of premium accessories.</p>
            </div>
            <div className="step-connector" />
            <div className="step">
              <div className="step-number">2</div>
              <h3 className="step-title">Ask anything</h3>
              <p className="step-desc">Have questions? Our AI agent is ready to help instantly.</p>
            </div>
            <div className="step-connector" />
            <div className="step">
              <div className="step-number">3</div>
              <h3 className="step-title">Enjoy</h3>
              <p className="step-desc">Fast worldwide shipping with a 30-day satisfaction guarantee.</p>
            </div>
          </div>
        </section>

        {/* Products */}
        <section id="products" className="section">
          <h2 className="section-label">Featured</h2>
          <div className="products-grid">
            {PRODUCTS.map((product, i) => (
              <div key={i} className="product-card">
                <div className="product-card-top">
                  <div className="product-icon-wrap">
                    {product.icon}
                  </div>
                  {i === 0 && <span className="product-tag">Bestseller</span>}
                </div>
                <h3 className="product-name">{product.name}</h3>
                <p className="product-desc">{product.description}</p>
                <div className="product-footer">
                  <span className="product-price">{product.price}</span>
                  <button
                    onClick={() => triggerChat(product.prompt)}
                    className="product-ask"
                  >
                    Ask about this
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Support */}
        <section className="support-section">
          <h2 className="support-title">Questions? We're here.</h2>
          <p className="support-subtitle">
            Click any question to chat with our AI support agent immediately.
          </p>
          <div className="quick-help-list">
            {QUESTIONS.map((q, i) => (
              <button
                key={i}
                onClick={() => triggerChat(q.prompt)}
                className="quick-help-item"
              >
                {q.text}
              </button>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="site-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <span className="footer-logo">Dash Supply Co.</span>
            <span className="footer-tagline">Premium accessories for the modern workspace.</span>
          </div>
          <div className="footer-links">
            <a href="#products">Products</a>
            <button onClick={() => triggerChat()}>Support</button>
          </div>
        </div>
        <div className="footer-bottom">
          &copy; 2026 Dash Supply Co. All rights reserved.
        </div>
      </footer>

      <ChatWidget />
    </div>
  );
}

export default App;
