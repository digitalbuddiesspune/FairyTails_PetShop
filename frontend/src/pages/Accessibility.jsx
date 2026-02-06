import { useEffect } from 'react';
import { Link } from 'react-router-dom';

const Accessibility = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const sections = [
    { id: 'commitment', title: 'Our Commitment' },
    { id: 'standards', title: 'Standards' },
    { id: 'features', title: 'Features' },
    { id: 'technologies', title: 'Technologies' },
    { id: 'shortcuts', title: 'Keyboard Shortcuts' },
    { id: 'feedback', title: 'Feedback' },
  ];

  const features = [
    { icon: '⌨️', title: 'Keyboard Navigation', desc: 'Full site navigation using only keyboard' },
    { icon: '🔊', title: 'Screen Reader Support', desc: 'Optimized for NVDA, JAWS, VoiceOver' },
    { icon: '🖼️', title: 'Alt Text', desc: 'Descriptive text for all images' },
    { icon: '🎨', title: 'Color Contrast', desc: 'WCAG AA compliant contrast ratios' },
    { icon: '🔍', title: 'Resizable Text', desc: 'Zoom up to 200% without issues' },
    { icon: '🧭', title: 'Clear Navigation', desc: 'Consistent and intuitive structure' },
    { icon: '📝', title: 'Form Labels', desc: 'All inputs properly labeled' },
    { icon: '🎯', title: 'Focus Indicators', desc: 'Visible focus states for keyboard users' },
  ];

  const shortcuts = [
    { key: 'Tab', action: 'Move to next element' },
    { key: 'Shift + Tab', action: 'Move to previous element' },
    { key: 'Enter', action: 'Activate buttons/links' },
    { key: 'Escape', action: 'Close modals/dropdowns' },
    { key: 'Arrow Keys', action: 'Navigate within menus' },
    { key: 'Space', action: 'Toggle checkboxes' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-teal-500 to-cyan-500 py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full mb-6">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="text-white font-medium">Inclusive Design</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Accessibility Statement</h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            We believe the web should be accessible to everyone. Here's how we're making that happen.
          </p>
          <p className="text-white/60 mt-4 text-sm">Last updated: February 2, 2026</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="lg:sticky lg:top-24 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Navigation</h3>
              <nav className="space-y-2">
                {sections.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="block px-3 py-2 text-sm text-gray-600 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                  >
                    {section.title}
                  </a>
                ))}
              </nav>
              <div className="mt-6 pt-6 border-t border-gray-100">
                <Link to="/contact" className="flex items-center gap-2 text-sm text-teal-600 hover:underline">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Need assistance?
                </Link>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 max-w-3xl">
            <div className="space-y-12">
              {/* Commitment */}
              <section id="commitment" className="scroll-mt-24">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
                    <span className="text-xl">💚</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Our Commitment</h2>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                  <div className="flex flex-col md:flex-row gap-6 items-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-teal-400 to-cyan-400 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <span className="text-4xl">♿</span>
                    </div>
                    <p className="text-gray-600 leading-relaxed">
                      At FairyTails Pet Shop, we are committed to ensuring digital accessibility for people of all abilities. We believe everyone should have equal access to our products and services, regardless of their abilities or the technology they use. We continuously work to improve accessibility and usability.
                    </p>
                  </div>
                </div>
              </section>

              {/* Standards */}
              <section id="standards" className="scroll-mt-24">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
                    <span className="text-xl">📋</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Accessibility Standards</h2>
                </div>
                <div className="bg-gradient-to-r from-teal-500 to-cyan-500 rounded-2xl p-6 md:p-8 text-white">
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="text-center md:text-left">
                      <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full mb-4">
                        <span className="font-bold">WCAG 2.1</span>
                        <span className="bg-white text-teal-600 px-2 py-0.5 rounded text-sm font-bold">Level AA</span>
                      </div>
                      <p className="text-white/90">
                        We aim to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards, which address the most common barriers for disabled users.
                      </p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      {['A', 'AA', 'AAA'].map((level, idx) => (
                        <div
                          key={level}
                          className={`w-14 h-14 rounded-xl flex items-center justify-center font-bold ${
                            idx === 1 ? 'bg-white text-teal-600' : 'bg-white/20'
                          }`}
                        >
                          {level}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* Features */}
              <section id="features" className="scroll-mt-24">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
                    <span className="text-xl">✨</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Accessibility Features</h2>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {features.map((feature) => (
                    <div key={feature.title} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:border-teal-200 transition-all group">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center group-hover:bg-teal-500 transition-colors">
                          <span className="text-2xl group-hover:grayscale group-hover:brightness-200">{feature.icon}</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                          <p className="text-sm text-gray-600">{feature.desc}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Assistive Technologies */}
              <section id="technologies" className="scroll-mt-24">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
                    <span className="text-xl">🛠️</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Supported Technologies</h2>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                  <p className="text-gray-600 mb-6">Our website is compatible with:</p>
                  <div className="grid sm:grid-cols-3 gap-4">
                    {[
                      { icon: '🔊', items: ['NVDA', 'JAWS', 'VoiceOver', 'TalkBack'] },
                      { icon: '🖥️', items: ['Chrome', 'Firefox', 'Safari', 'Edge'] },
                      { icon: '⌨️', items: ['Keyboard only', 'High contrast', 'Screen magnifier'] },
                    ].map((group, idx) => (
                      <div key={idx} className="text-center p-4 bg-gray-50 rounded-xl">
                        <span className="text-3xl block mb-3">{group.icon}</span>
                        <ul className="space-y-1">
                          {group.items.map((item) => (
                            <li key={item} className="text-sm text-gray-600">{item}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Keyboard Shortcuts */}
              <section id="shortcuts" className="scroll-mt-24">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
                    <span className="text-xl">⌨️</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Keyboard Shortcuts</h2>
                </div>
                <div className="bg-gray-900 rounded-2xl p-6 md:p-8">
                  <div className="grid sm:grid-cols-2 gap-4">
                    {shortcuts.map((shortcut) => (
                      <div key={shortcut.key} className="flex items-center justify-between p-3 bg-gray-800 rounded-xl">
                        <kbd className="px-3 py-1.5 bg-gray-700 rounded-lg text-white text-sm font-mono border border-gray-600">
                          {shortcut.key}
                        </kbd>
                        <span className="text-gray-300 text-sm">{shortcut.action}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Feedback */}
              <section id="feedback" className="scroll-mt-24">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
                    <span className="text-xl">💬</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Feedback & Assistance</h2>
                </div>
                <div className="bg-gradient-to-r from-teal-500 to-cyan-500 rounded-2xl p-6 md:p-8 text-white">
                  <p className="text-white/90 mb-6">
                    We welcome your feedback on accessibility. If you encounter any barriers or have suggestions, please let us know. We respond within 2 business days.
                  </p>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <a href="mailto:accessibility@fairytails.com" className="bg-white/20 hover:bg-white/30 rounded-xl p-4 text-center transition-colors">
                      <span className="text-2xl block mb-2">📧</span>
                      <span className="text-sm">accessibility@fairytails.com</span>
                    </a>
                    <a href="tel:+919876543210" className="bg-white/20 hover:bg-white/30 rounded-xl p-4 text-center transition-colors">
                      <span className="text-2xl block mb-2">📞</span>
                      <span className="text-sm">+91 98765 43210</span>
                    </a>
                    <div className="bg-white/20 rounded-xl p-4 text-center">
                      <span className="text-2xl block mb-2">📍</span>
                      <span className="text-sm">Mumbai, India</span>
                    </div>
                  </div>
                  <p className="text-white/70 text-sm mt-6 text-center">
                    Need help completing a purchase? Our team is happy to assist over the phone.
                  </p>
                </div>
              </section>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Accessibility;
