/**
 * Golf Iron Advisor - Main Application
 * メインアプリケーションファイル
 */

// アプリケーション設定
const CONFIG = {
    APP_NAME: 'ゴルフアイアン適性診断',
    VERSION: '1.0.0',
    DEBUG: true,
    STORAGE_KEY: 'golf_iron_advisor',
    DIAGNOSIS_STEPS: 8,
    MIN_DIAGNOSIS_TIME: 30, // 最小診断時間（秒）
    ANIMATION_DURATION: 300,
    AUTOSAVE_INTERVAL: 30000 // 30秒ごとに自動保存
};

// グローバル状態管理
class AppState {
    constructor() {
        this.currentStep = 1;
        this.diagnosisData = {};
        this.currentLanguage = 'ja';
        this.startTime = null;
        this.isCompleted = false;
        this.autosaveTimer = null;
    }

    // データの保存
    save() {
        try {
            const stateData = {
                currentStep: this.currentStep,
                diagnosisData: this.diagnosisData,
                currentLanguage: this.currentLanguage,
                startTime: this.startTime,
                isCompleted: this.isCompleted,
                savedAt: new Date().toISOString()
            };
            localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(stateData));
            if (CONFIG.DEBUG) console.log('State saved:', stateData);
        } catch (error) {
            console.error('Failed to save state:', error);
        }
    }

    // データの読み込み
    load() {
        try {
            const savedData = localStorage.getItem(CONFIG.STORAGE_KEY);
            if (savedData) {
                const stateData = JSON.parse(savedData);
                this.currentStep = stateData.currentStep || 1;
                this.diagnosisData = stateData.diagnosisData || {};
                this.currentLanguage = stateData.currentLanguage || 'ja';
                this.startTime = stateData.startTime;
                this.isCompleted = stateData.isCompleted || false;
                if (CONFIG.DEBUG) console.log('State loaded:', stateData);
                return true;
            }
        } catch (error) {
            console.error('Failed to load state:', error);
        }
        return false;
    }

    // データのクリア
    clear() {
        this.currentStep = 1;
        this.diagnosisData = {};
        this.startTime = null;
        this.isCompleted = false;
        try {
            localStorage.removeItem(CONFIG.STORAGE_KEY);
            if (CONFIG.DEBUG) console.log('State cleared');
        } catch (error) {
            console.error('Failed to clear state:', error);
        }
    }

    // 自動保存の開始
    startAutosave() {
        this.stopAutosave();
        this.autosaveTimer = setInterval(() => {
            if (!this.isCompleted) {
                this.save();
            }
        }, CONFIG.AUTOSAVE_INTERVAL);
    }

    // 自動保存の停止
    stopAutosave() {
        if (this.autosaveTimer) {
            clearInterval(this.autosaveTimer);
            this.autosaveTimer = null;
        }
    }
}

// グローバルインスタンス
const appState = new AppState();

// DOM操作ヘルパー
class DOMHelper {
    static $(selector) {
        return document.querySelector(selector);
    }

    static $$(selector) {
        return document.querySelectorAll(selector);
    }

    static show(element) {
        if (element) element.style.display = 'block';
    }

    static hide(element) {
        if (element) element.style.display = 'none';
    }

    static addClass(element, className) {
        if (element) element.classList.add(className);
    }

    static removeClass(element, className) {
        if (element) element.classList.remove(className);
    }

    static hasClass(element, className) {
        return element ? element.classList.contains(className) : false;
    }

    static setHTML(element, html) {
        if (element) element.innerHTML = html;
    }

    static setText(element, text) {
        if (element) element.textContent = text;
    }

    static animate(element, className, duration = CONFIG.ANIMATION_DURATION) {
        if (!element) return;
        
        element.classList.add(className);
        setTimeout(() => {
            element.classList.remove(className);
        }, duration);
    }
}

// イベント管理
class EventManager {
    constructor() {
        this.events = {};
    }

    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
    }

    off(event, callback) {
        if (this.events[event]) {
            this.events[event] = this.events[event].filter(cb => cb !== callback);
        }
    }

    emit(event, data) {
        if (this.events[event]) {
            this.events[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in event callback for ${event}:`, error);
                }
            });
        }
    }
}

const eventManager = new EventManager();

// バリデーション
class Validator {
    static required(value) {
        return value !== null && value !== undefined && value !== '';
    }

    static email(value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value);
    }

    static number(value, min = null, max = null) {
        const num = Number(value);
        if (isNaN(num)) return false;
        if (min !== null && num < min) return false;
        if (max !== null && num > max) return false;
        return true;
    }

    static length(value, min = 0, max = Infinity) {
        const len = value ? value.length : 0;
        return len >= min && len <= max;
    }
}

// ローディング管理
class LoadingManager {
    static show(message = '処理中...') {
        const overlay = DOMHelper.$('#loading-overlay');
        if (overlay) {
            const messageElement = overlay.querySelector('p');
            if (messageElement) messageElement.textContent = message;
            DOMHelper.show(overlay);
        }
    }

    static hide() {
        const overlay = DOMHelper.$('#loading-overlay');
        DOMHelper.hide(overlay);
    }
}

// 通知管理
class NotificationManager {
    static show(message, type = 'info', duration = 5000) {
        // 通知要素を作成
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;

        // 通知を画面に追加
        document.body.appendChild(notification);

        // 閉じるボタンのイベント
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            this.remove(notification);
        });

        // 自動削除
        if (duration > 0) {
            setTimeout(() => {
                this.remove(notification);
            }, duration);
        }

        // フェードイン
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
    }

    static remove(notification) {
        notification.classList.add('hide');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }

    static success(message) {
        this.show(message, 'success');
    }

    static error(message) {
        this.show(message, 'error');
    }

    static warning(message) {
        this.show(message, 'warning');
    }

    static info(message) {
        this.show(message, 'info');
    }
}

// アナリティクス管理
class Analytics {
    static track(event, data = {}) {
        if (CONFIG.DEBUG) {
            console.log('Analytics:', event, data);
        }

        // Google Analytics 4への送信
        if (typeof gtag !== 'undefined') {
            gtag('event', event, {
                custom_parameter_1: data.step,
                custom_parameter_2: data.action,
                ...data
            });
        }

        // カスタムイベントの発火
        eventManager.emit('analytics', { event, data });
    }

    static pageView(path) {
        if (typeof gtag !== 'undefined') {
            gtag('config', 'GA_MEASUREMENT_ID', {
                page_path: path
            });
        }
    }

    static timing(category, variable, value) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'timing_complete', {
                name: variable,
                value: value,
                event_category: category
            });
        }
    }
}

// パフォーマンス監視
class PerformanceMonitor {
    static measurePageLoad() {
        window.addEventListener('load', () => {
            if ('performance' in window) {
                const perfData = performance.getEntriesByType('navigation')[0];
                const loadTime = perfData.loadEventEnd - perfData.loadEventStart;
                
                Analytics.timing('Page Load', 'Load Time', loadTime);
                
                if (CONFIG.DEBUG) {
                    console.log('Page load time:', loadTime + 'ms');
                }
            }
        });
    }

    static measureDiagnosisTime() {
        return {
            start: () => {
                appState.startTime = Date.now();
            },
            end: () => {
                if (appState.startTime) {
                    const duration = Date.now() - appState.startTime;
                    Analytics.timing('Diagnosis', 'Completion Time', duration);
                    return duration;
                }
                return 0;
            }
        };
    }
}

// エラーハンドリング
class ErrorHandler {
    static init() {
        window.addEventListener('error', (event) => {
            this.handleError(event.error, 'JavaScript Error');
        });

        window.addEventListener('unhandledrejection', (event) => {
            this.handleError(event.reason, 'Unhandled Promise Rejection');
        });
    }

    static handleError(error, context = 'Unknown') {
        console.error(`[${context}]:`, error);

        // 開発環境では詳細を表示
        if (CONFIG.DEBUG) {
            NotificationManager.error(`エラーが発生しました: ${error.message}`);
        } else {
            NotificationManager.error('申し訳ございません。エラーが発生しました。ページを再読み込みしてください。');
        }

        // エラーレポートの送信（本番環境では外部サービスに送信）
        this.reportError(error, context);
    }

    static reportError(error, context) {
        const errorData = {
            message: error.message,
            stack: error.stack,
            context: context,
            url: window.location.href,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
        };

        if (CONFIG.DEBUG) {
            console.log('Error report:', errorData);
        }

        // 本番環境では外部エラー監視サービスに送信
        // 例: Sentry, LogRocket, etc.
    }
}

// ユーティリティ関数
class Utils {
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    static throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    static formatDate(date, locale = 'ja-JP') {
        return new Date(date).toLocaleDateString(locale, {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    static generateId() {
        return 'id_' + Math.random().toString(36).substr(2, 9);
    }

    static deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    static isEmpty(value) {
        if (value === null || value === undefined) return true;
        if (typeof value === 'string') return value.trim() === '';
        if (Array.isArray(value)) return value.length === 0;
        if (typeof value === 'object') return Object.keys(value).length === 0;
        return false;
    }
}

// メインアプリケーション初期化
class App {
    constructor() {
        this.initialized = false;
        this.diagnosisTimer = PerformanceMonitor.measureDiagnosisTime();
    }

    // アプリケーション初期化
    async init() {
        if (this.initialized) return;

        try {
            // エラーハンドリング初期化
            ErrorHandler.init();

            // パフォーマンス監視開始
            PerformanceMonitor.measurePageLoad();

            // 状態の復元
            appState.load();

            // イベントリスナーの設定
            this.setupEventListeners();

            // ページ固有の初期化
            this.initPageSpecific();

            // 自動保存開始
            appState.startAutosave();

            this.initialized = true;

            if (CONFIG.DEBUG) {
                console.log('App initialized successfully');
            }

            // 初期化完了イベント
            eventManager.emit('app:initialized');

        } catch (error) {
            ErrorHandler.handleError(error, 'App Initialization');
        }
    }

    // 共通イベントリスナーの設定
    setupEventListeners() {
        // ページ離脱時の処理
        window.addEventListener('beforeunload', (event) => {
            appState.save();
            appState.stopAutosave();

            // 診断途中の場合は警告
            if (appState.currentStep > 1 && !appState.isCompleted) {
                event.preventDefault();
                event.returnValue = '診断が完了していません。ページを離れますか？';
                return event.returnValue;
            }
        });

        // ページ表示時の処理
        window.addEventListener('pageshow', () => {
            if (appState.currentStep > 1 && !appState.isCompleted) {
                NotificationManager.info('前回の診断を続けることができます。');
            }
        });

        // オンライン・オフライン状態の監視
        window.addEventListener('online', () => {
            NotificationManager.success('インターネット接続が復旧しました。');
        });

        window.addEventListener('offline', () => {
            NotificationManager.warning('インターネット接続が切断されました。一部機能が制限される場合があります。');
        });

        // 言語切り替え
        const languageSelect = DOMHelper.$('#language-select');
        if (languageSelect) {
            languageSelect.addEventListener('change', (e) => {
                this.changeLanguage(e.target.value);
            });
        }
    }

    // ページ固有の初期化
    initPageSpecific() {
        const currentPage = this.getCurrentPage();

        switch (currentPage) {
            case 'index':
                this.initDiagnosisPage();
                break;
            case 'lp':
                this.initLandingPage();
                break;
            case 'contact':
                this.initContactPage();
                break;
            default:
                if (CONFIG.DEBUG) {
                    console.log('No specific initialization for page:', currentPage);
                }
        }
    }

    // 現在のページを取得
    getCurrentPage() {
        const path = window.location.pathname;
        const filename = path.split('/').pop().split('.')[0];
        return filename || 'index';
    }

    // 診断ページの初期化
    initDiagnosisPage() {
        const startBtn = DOMHelper.$('#start-diagnosis');
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                this.startDiagnosis();
            });
        }

        // 診断フォームが存在する場合は診断ロジックを初期化
        const diagnosisForm = DOMHelper.$('#diagnosis-questions');
        if (diagnosisForm && window.DiagnosisEngine) {
            window.DiagnosisEngine.init();
        }
    }

    // ランディングページの初期化
    initLandingPage() {
        // スムーススクロール
        const smoothScrollLinks = DOMHelper.$$('a[href^="#"]');
        smoothScrollLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const target = DOMHelper.$('#' + targetId);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });

        // アニメーション効果の初期化
        this.initScrollAnimations();
    }

    // コンタクトページの初期化
    initContactPage() {
        const contactForm = DOMHelper.$('#contact-form');
        if (contactForm) {
            // コンタクトフォームの処理は別ファイルで実装
            if (CONFIG.DEBUG) {
                console.log('Contact form initialized');
            }
        }
    }

    // スクロールアニメーションの初期化
    initScrollAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    DOMHelper.addClass(entry.target, 'fade-in-up');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        // アニメーション対象要素の監視
        const animationTargets = DOMHelper.$$('.feature-card, .club-card, .step');
        animationTargets.forEach(target => {
            observer.observe(target);
        });
    }

    // 診断開始
    startDiagnosis() {
        try {
            // 診断時間計測開始
            this.diagnosisTimer.start();
            
            // アナリティクス追跡
            Analytics.track('diagnosis_start');

            // 診断セクションを表示
            const startSection = DOMHelper.$('#start-section');
            const diagnosisSection = DOMHelper.$('#diagnosis-form');

            if (startSection && diagnosisSection) {
                DOMHelper.hide(startSection);
                DOMHelper.show(diagnosisSection);

                // 状態更新
                appState.currentStep = 1;
                appState.save();

                // 診断エンジンの開始
                if (window.DiagnosisEngine) {
                    window.DiagnosisEngine.start();
                }
            }
        } catch (error) {
            ErrorHandler.handleError(error, 'Start Diagnosis');
        }
    }

    // 言語切り替え
    changeLanguage(language) {
        appState.currentLanguage = language;
        appState.save();

        // 多言語化システムが利用可能な場合
        if (window.I18n) {
            window.I18n.setLanguage(language);
        }

        Analytics.track('language_change', { language });
    }

    // アプリケーション終了処理
    destroy() {
        appState.stopAutosave();
        appState.save();
        eventManager.events = {};
        this.initialized = false;
    }
}

// アプリケーションインスタンス
const app = new App();

// DOM読み込み完了時に初期化
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});

// グローバルオブジェクトとしてエクスポート
window.GolfIronAdvisor = {
    app,
    appState,
    eventManager,
    Analytics,
    NotificationManager,
    LoadingManager,
    Utils,
    CONFIG,
    DOMHelper,
    Validator
};

// デバッグ用（開発環境のみ）
if (CONFIG.DEBUG) {
    window.DEBUG = {
        app,
        appState,
        eventManager,
        CONFIG
    };
}