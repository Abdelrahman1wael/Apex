/**
 * Apex Ecosystem Marketing Platform - Bilingual (EN & AR) Voice Narrator Agent
 * Uses Web Speech API SpeechSynthesis to narrate project presentations in English or Arabic.
 */

class VoiceNarratorAgent {
  constructor() {
    this.synth = window.speechSynthesis;
    this.speaking = false;
    this.currentUtterance = null;
    this.lang = 'en'; // 'en' | 'ar'
    this.projects = window.ECOSYSTEM_PROJECTS || [];

    this.narrateBtn = document.getElementById('ai-voice-tour-btn');
    this.langToggleBtn = document.getElementById('voice-lang-toggle-btn');
    this.waveformContainer = document.getElementById('voice-waveform');

    this.init();
  }

  init() {
    if (this.narrateBtn) {
      this.narrateBtn.addEventListener('click', () => {
        if (this.speaking) {
          this.stopNarration();
        } else {
          this.startEcosystemTour();
        }
      });
    }

    if (this.langToggleBtn) {
      this.langToggleBtn.addEventListener('click', () => {
        this.lang = this.lang === 'en' ? 'ar' : 'en';
        this.langToggleBtn.innerHTML = this.lang === 'en' 
          ? '<i class="fa-solid fa-language"></i> EN' 
          : '<i class="fa-solid fa-language"></i> AR (العربية)';
        if (window.soundEngine) window.soundEngine.playClick();
        if (this.speaking) {
          this.startEcosystemTour();
        }
      });
    }
  }

  startEcosystemTour() {
    if (!this.synth) {
      alert('Speech Synthesis API is not supported in this browser.');
      return;
    }

    const text = this.lang === 'ar'
      ? 'أهلاً بكم في منظومة أبكس الرقمية. استكشف عشرة تطبيقات متكاملة تعتمد على تقنيات أبعاد ثلاثية ورسوم بيانية تفاعلية وذكاء صوتي. انقر على أي مشروع لبدء تجربة التطبيق فوراً.'
      : 'Welcome to the Apex Digital Ecosystem. Explore 10 integrated applications built with Three.js 3D graphics, D3.js data visualizations, and Voice AI. Click any project to launch its live sandbox.';
    
    this.speak(text);
  }

  speakProject(projectId) {
    const proj = this.projects.find(p => p.id === projectId);
    if (!proj) return;

    const text = this.lang === 'ar'
      ? `${proj.arabicTitle}. ${proj.arabicSubtitle}. ${proj.arabicDescription}`
      : `${proj.title}. ${proj.subtitle}. ${proj.description}`;
    
    this.speak(text);
  }

  speak(text) {
    this.stopNarration();

    this.currentUtterance = new SpeechSynthesisUtterance(text);
    this.currentUtterance.rate = this.lang === 'ar' ? 0.95 : 1.0;
    this.currentUtterance.pitch = 1.05;
    this.currentUtterance.lang = this.lang === 'ar' ? 'ar-SA' : 'en-US';

    const voices = this.synth.getVoices();
    if (this.lang === 'ar') {
      const arVoice = voices.find(v => v.lang.includes('ar'));
      if (arVoice) this.currentUtterance.voice = arVoice;
    } else {
      const engVoice = voices.find(v => v.lang.includes('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Neural')));
      if (engVoice) this.currentUtterance.voice = engVoice;
    }

    this.currentUtterance.onstart = () => {
      this.speaking = true;
      this.updateUI(true);
    };

    this.currentUtterance.onend = () => {
      this.speaking = false;
      this.updateUI(false);
    };

    this.currentUtterance.onerror = () => {
      this.speaking = false;
      this.updateUI(false);
    };

    this.synth.speak(this.currentUtterance);
  }

  stopNarration() {
    if (this.synth && this.synth.speaking) {
      this.synth.cancel();
    }
    this.speaking = false;
    this.updateUI(false);
  }

  updateUI(active) {
    if (this.narrateBtn) {
      const label = this.lang === 'ar' ? 'جولة صوتية' : 'Voice Tour';
      this.narrateBtn.innerHTML = active 
        ? `<i class="fa-solid fa-square"></i> Stop` 
        : `<i class="fa-solid fa-volume-high"></i> ${label}`;
      this.narrateBtn.classList.toggle('active', active);
    }
    if (this.waveformContainer) {
      this.waveformContainer.style.display = active ? 'flex' : 'none';
    }
  }
}

window.VoiceNarratorAgent = VoiceNarratorAgent;
