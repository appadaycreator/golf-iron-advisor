/**
 * Golf Iron Advisor - Diagnosis Engine
 * 診断エンジン - ユーザーの入力から最適なアイアンを推奨
 */

class DiagnosisEngine {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 8;
        this.formData = {};
        this.clubDatabase = null;
        this.initialized = false;
        this.questionGroups = [];
        this.validationRules = this.setupValidationRules();
    }

    // 初期化
    async init() {
        try {
            await this.loadClubDatabase();
            this.setupQuestionGroups();
            this.setupFormHandlers();
            this.restoreState();
            this.updateProgress();
            this.initialized = true;
            
            if (window.GolfIronAdvisor?.CONFIG?.DEBUG) {
                console.log('DiagnosisEngine initialized');
            }
        } catch (error) {
            console.error('Failed to initialize DiagnosisEngine:', error);
            window.GolfIronAdvisor?.NotificationManager?.error('診断システムの初期化に失敗しました。');
        }
    }

    // クラブデータベースの読み込み
    async loadClubDatabase() {
        try {
            const response = await fetch('./assets/data/clubs.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.clubDatabase = await response.json();
        } catch (error) {
            console.error('Failed to load club database:', error);
            // フォールバック用のダミーデータ
            this.clubDatabase = this.getDefaultClubDatabase();
        }
    }

    // デフォルトのクラブデータベース（フォールバック用）
    getDefaultClubDatabase() {
        return {
            clubs: [
                {
                    id: "ping_g430_iron",
                    manufacturer: "PING",
                    model: "G430 アイアン",
                    category: "game_improvement",
                    construction: "cavity",
                    target_handicap: "15-30",
                    price_range: "medium",
                    weight: 350,
                    lie_angle: 61.5,
                    loft_7iron: 30.5,
                    shaft_options: ["steel", "carbon"],
                    features: {
                        forgiveness: 9,
                        workability: 5,
                        distance: 8,
                        feel: 7
                    },
                    specifications: {
                        head_size: "large",
                        sole_width: "wide",
                        offset: "moderate"
                    }
                },
                {
                    id: "titleist_t150_iron",
                    manufacturer: "Titleist",
                    model: "T150 アイアン",
                    category: "players_distance",
                    construction: "hollow",
                    target_handicap: "5-15",
                    price_range: "high",
                    weight: 370,
                    lie_angle: 62.0,
                    loft_7iron: 32.0,
                    shaft_options: ["steel"],
                    features: {
                        forgiveness: 7,
                        workability: 8,
                        distance: 9,
                        feel: 9
                    },
                    specifications: {
                        head_size: "mid",
                        sole_width: "medium",
                        offset: "minimal"
                    }
                }
            ]
        };
    }

    // 質問グループの設定
    setupQuestionGroups() {
        this.questionGroups = [
            { step: 1, selector: '[data-step="1"]', required: ['gender', 'height', 'weight'] },
            { step: 2, selector: '[data-step="2"]', required: ['experience', 'handicap'] },
            { step: 3, selector: '[data-step="3"]', required: ['swing_speed', 'ball_height'] },
            { step: 4, selector: '[data-step="4"]', required: [] }, // ミス傾向は任意
            { step: 5, selector: '[data-step="5"]', required: ['priority'] },
            { step: 6, selector: '[data-step="6"]', required: ['budget'] },
            { step: 7, selector: '[data-step="7"]', required: [] }, // ブランド志向は任意
            { step: 8, selector: '[data-step="8"]', required: ['appearance'] }
        ];
    }

    // バリデーションルールの設定
    setupValidationRules() {
        return {
            height: (value) => {
                const num = Number(value);
                return num >= 140 && num <= 200;
            },
            weight: (value) => {
                const num = Number(value);
                return num >= 40 && num <= 120;
            },
            handicap: (value) => {
                if (!value) return true; // 任意項目
                const num = Number(value);
                return num >= 0 && num <= 50;
            },
            email: (value) => {
                if (!value) return true; // 任意項目
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return emailRegex.test(value);
            }
        };
    }

    // フォームハンドラーの設定
    setupFormHandlers() {
        const form = document.getElementById('diagnosis-questions');
        if (!form) return;

        // 次へボタン
        const nextBtn = document.getElementById('next-btn');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextStep());
        }

        // 前へボタン
        const prevBtn = document.getElementById('prev-btn');
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.prevStep());
        }

        // 送信ボタン
        const submitBtn = document.getElementById('submit-btn');
        if (submitBtn) {
            submitBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.submitDiagnosis();
            });
        }

        // 入力フィールドの変更監視
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('change', (e) => {
                this.updateFormData(e.target.name, e.target.value, e.target.type);
                this.validateField(e.target);
            });
        });

        // チェックボックスの特別処理
        const checkboxes = form.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                this.updateCheckboxData(e.target.name, e.target.value, e.target.checked);
            });
        });
    }

    // フォームデータの更新
    updateFormData(name, value, type) {
        if (type === 'checkbox') {
            // チェックボックスは updateCheckboxData で処理
            return;
        }
        
        this.formData[name] = value;
        this.saveState();
    }

    // チェックボックスデータの更新
    updateCheckboxData(name, value, checked) {
        if (!this.formData[name]) {
            this.formData[name] = [];
        }

        if (checked) {
            if (!this.formData[name].includes(value)) {
                this.formData[name].push(value);
            }
        } else {
            this.formData[name] = this.formData[name].filter(v => v !== value);
        }

        this.saveState();
    }

    // フィールドのバリデーション
    validateField(field) {
        const name = field.name;
        const value = field.value;
        const validationRule = this.validationRules[name];

        let isValid = true;
        let errorMessage = '';

        // 必須チェック
        if (this.isRequiredField(name) && !value.trim()) {
            isValid = false;
            errorMessage = 'この項目は必須です。';
        }
        // カスタムバリデーション
        else if (validationRule && !validationRule(value)) {
            isValid = false;
            errorMessage = this.getValidationErrorMessage(name);
        }

        // エラー表示の更新
        this.updateFieldError(field, isValid, errorMessage);

        return isValid;
    }

    // 必須フィールドかどうかの判定
    isRequiredField(name) {
        const currentGroup = this.questionGroups.find(group => group.step === this.currentStep);
        return currentGroup ? currentGroup.required.includes(name) : false;
    }

    // バリデーションエラーメッセージの取得
    getValidationErrorMessage(name) {
        const messages = {
            height: '身長は140cm〜200cmの範囲で入力してください。',
            weight: '体重は40kg〜120kgの範囲で入力してください。',
            handicap: 'ハンディキャップは0〜50の範囲で入力してください。',
            email: '正しいメールアドレスの形式で入力してください。'
        };
        return messages[name] || '入力値が正しくありません。';
    }

    // フィールドエラーの表示更新
    updateFieldError(field, isValid, errorMessage) {
        const errorElement = document.getElementById(`${field.name.replace('_', '-')}-error`);
        
        if (errorElement) {
            if (isValid) {
                errorElement.style.display = 'none';
                errorElement.textContent = '';
                field.classList.remove('error');
            } else {
                errorElement.style.display = 'block';
                errorElement.textContent = errorMessage;
                field.classList.add('error');
            }
        }
    }

    // 現在のステップのバリデーション
    validateCurrentStep() {
        const currentGroup = this.questionGroups.find(group => group.step === this.currentStep);
        if (!currentGroup) return true;

        let isValid = true;
        const form = document.getElementById('diagnosis-questions');

        // 必須フィールドのチェック
        currentGroup.required.forEach(fieldName => {
            const field = form.querySelector(`[name="${fieldName}"]`);
            if (field && !this.validateField(field)) {
                isValid = false;
            }
        });

        return isValid;
    }

    // 次のステップへ
    nextStep() {
        if (!this.validateCurrentStep()) {
            window.GolfIronAdvisor?.NotificationManager?.warning('入力内容に不備があります。確認してください。');
            return;
        }

        if (this.currentStep < this.totalSteps) {
            this.hideCurrentStep();
            this.currentStep++;
            this.showCurrentStep();
            this.updateProgress();
            this.updateButtons();
            this.saveState();

            // アナリティクス追跡
            window.GolfIronAdvisor?.Analytics?.track('diagnosis_step', {
                step: this.currentStep,
                action: 'next'
            });
        }
    }

    // 前のステップへ
    prevStep() {
        if (this.currentStep > 1) {
            this.hideCurrentStep();
            this.currentStep--;
            this.showCurrentStep();
            this.updateProgress();
            this.updateButtons();
            this.saveState();

            // アナリティクス追跡
            window.GolfIronAdvisor?.Analytics?.track('diagnosis_step', {
                step: this.currentStep,
                action: 'prev'
            });
        }
    }

    // 現在のステップを非表示
    hideCurrentStep() {
        const currentElement = document.querySelector(`[data-step="${this.currentStep}"]`);
        if (currentElement) {
            currentElement.style.display = 'none';
        }
    }

    // 現在のステップを表示
    showCurrentStep() {
        const currentElement = document.querySelector(`[data-step="${this.currentStep}"]`);
        if (currentElement) {
            currentElement.style.display = 'block';
            // フォーカスを最初の入力フィールドに移動
            const firstInput = currentElement.querySelector('input, select, textarea');
            if (firstInput) {
                firstInput.focus();
            }
        }
    }

    // プログレスバーの更新
    updateProgress() {
        const progressBar = document.getElementById('progress');
        const currentStepElement = document.getElementById('current-step');
        const totalStepsElement = document.getElementById('total-steps');

        if (progressBar) {
            const percentage = (this.currentStep / this.totalSteps) * 100;
            progressBar.style.width = `${percentage}%`;
        }

        if (currentStepElement) {
            currentStepElement.textContent = this.currentStep;
        }

        if (totalStepsElement) {
            totalStepsElement.textContent = this.totalSteps;
        }
    }

    // ボタンの表示更新
    updateButtons() {
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        const submitBtn = document.getElementById('submit-btn');

        if (prevBtn) {
            prevBtn.style.display = this.currentStep > 1 ? 'block' : 'none';
        }

        if (nextBtn && submitBtn) {
            if (this.currentStep === this.totalSteps) {
                nextBtn.style.display = 'none';
                submitBtn.style.display = 'block';
            } else {
                nextBtn.style.display = 'block';
                submitBtn.style.display = 'none';
            }
        }
    }

    // 診断の送信
    async submitDiagnosis() {
        if (!this.validateCurrentStep()) {
            window.GolfIronAdvisor?.NotificationManager?.warning('入力内容に不備があります。確認してください。');
            return;
        }

        try {
            window.GolfIronAdvisor?.LoadingManager?.show('診断結果を計算中...');

            // 診断計算の実行
            const recommendations = await this.calculateRecommendations();

            // 結果の表示
            this.showResults(recommendations);

            // 状態の更新
            window.GolfIronAdvisor?.appState?.isCompleted = true;
            this.saveState();

            // 診断時間の計測終了
            const diagnosisTime = window.GolfIronAdvisor?.app?.diagnosisTimer?.end() || 0;

            // アナリティクス追跡
            window.GolfIronAdvisor?.Analytics?.track('diagnosis_complete', {
                duration: diagnosisTime,
                user_profile: this.createUserProfile()
            });

        } catch (error) {
            console.error('Diagnosis submission failed:', error);
            window.GolfIronAdvisor?.NotificationManager?.error('診断処理中にエラーが発生しました。もう一度お試しください。');
        } finally {
            window.GolfIronAdvisor?.LoadingManager?.hide();
        }
    }

    // 推奨計算の実行
    async calculateRecommendations() {
        const userProfile = this.createUserProfile();
        const scoredClubs = [];

        // 各クラブのスコア計算
        this.clubDatabase.clubs.forEach(club => {
            const score = this.calculateClubScore(club, userProfile);
            scoredClubs.push({
                club,
                score,
                reasons: this.generateReasons(club, userProfile, score)
            });
        });

        // スコア順でソート
        scoredClubs.sort((a, b) => b.score - a.score);

        // 上位3つを推奨として返す
        return scoredClubs.slice(0, 3).map((item, index) => ({
            rank: index + 1,
            ...item,
            shaft_recommendation: this.recommendShaft(item.club, userProfile)
        }));
    }

    // ユーザープロファイルの作成
    createUserProfile() {
        return {
            gender: this.formData.gender,
            height: Number(this.formData.height),
            weight: Number(this.formData.weight),
            experience: this.formData.experience,
            handicap: Number(this.formData.handicap) || null,
            swing_speed: this.formData.swing_speed,
            ball_height: this.formData.ball_height,
            miss_tendency: this.formData.miss_tendency || [],
            priority: this.formData.priority,
            budget: this.formData.budget,
            preferred_brands: this.formData.preferred_brands || [],
            appearance: this.formData.appearance
        };
    }

    // クラブスコアの計算
    calculateClubScore(club, userProfile) {
        let score = 0;

        // 身体適合性 (25%)
        score += this.calculatePhysicalFit(club, userProfile) * 0.25;

        // 技術レベル適合性 (30%)
        score += this.calculateSkillFit(club, userProfile) * 0.30;

        // スイング特性適合性 (25%)
        score += this.calculateSwingFit(club, userProfile) * 0.25;

        // ミス傾向対策 (15%)
        score += this.calculateMissFit(club, userProfile) * 0.15;

        // 志向・予算適合性 (5%)
        score += this.calculatePreferenceFit(club, userProfile) * 0.05;

        return Math.round(score * 100) / 100;
    }

    // 身体適合性の計算
    calculatePhysicalFit(club, userProfile) {
        let score = 0;

        // 身長による適合性
        const heightScore = this.calculateHeightFit(userProfile.height);
        score += heightScore * 0.6;

        // 体重による適合性
        const weightScore = this.calculateWeightFit(club.weight, userProfile.weight);
        score += weightScore * 0.4;

        return Math.min(score, 10);
    }

    // 身長適合性の計算
    calculateHeightFit(height) {
        // 標準的な身長範囲での適合度
        if (height >= 165 && height <= 175) return 10;
        if (height >= 160 && height <= 180) return 8;
        if (height >= 155 && height <= 185) return 6;
        return 4;
    }

    // 体重適合性の計算
    calculateWeightFit(clubWeight, userWeight) {
        // 体重とクラブ重量のバランス
        const ratio = clubWeight / userWeight;
        if (ratio >= 0.5 && ratio <= 0.7) return 10;
        if (ratio >= 0.4 && ratio <= 0.8) return 8;
        if (ratio >= 0.3 && ratio <= 0.9) return 6;
        return 4;
    }

    // 技術レベル適合性の計算
    calculateSkillFit(club, userProfile) {
        const experienceMap = {
            'beginner': 'game_improvement',
            'intermediate': 'players_distance',
            'advanced': 'players'
        };

        const targetCategory = experienceMap[userProfile.experience];
        
        if (club.category === targetCategory) return 10;
        if ((userProfile.experience === 'intermediate' && club.category === 'game_improvement') ||
            (userProfile.experience === 'advanced' && club.category === 'players_distance')) {
            return 7;
        }
        return 4;
    }

    // スイング特性適合性の計算
    calculateSwingFit(club, userProfile) {
        let score = 0;

        // スイングスピード適合性
        const speedMap = {
            'slow': ['carbon'],
            'average': ['steel', 'carbon'],
            'fast': ['steel']
        };

        const preferredShafts = speedMap[userProfile.swing_speed] || ['steel'];
        const hasPreferredShaft = preferredShafts.some(shaft => 
            club.shaft_options.includes(shaft)
        );
        
        score += hasPreferredShaft ? 5 : 2;

        // 弾道の高さ適合性
        const ballHeightScore = this.calculateBallHeightFit(club, userProfile.ball_height);
        score += ballHeightScore;

        return Math.min(score, 10);
    }

    // 弾道適合性の計算
    calculateBallHeightFit(club, ballHeight) {
        const loft = club.loft_7iron;
        
        if (ballHeight === 'low' && loft <= 30) return 5;
        if (ballHeight === 'medium' && loft >= 29 && loft <= 33) return 5;
        if (ballHeight === 'high' && loft >= 32) return 5;
        
        return 2;
    }

    // ミス傾向対策の計算
    calculateMissFit(club, userProfile) {
        if (!userProfile.miss_tendency || userProfile.miss_tendency.length === 0) {
            return 5; // ニュートラル
        }

        let score = 0;
        const missTendencies = userProfile.miss_tendency;

        missTendencies.forEach(miss => {
            switch (miss) {
                case 'slice':
                    if (club.specifications.offset === 'moderate' || 
                        club.specifications.offset === 'strong') {
                        score += 3;
                    }
                    break;
                case 'hook':
                    if (club.specifications.offset === 'minimal') {
                        score += 3;
                    }
                    break;
                case 'top':
                case 'fat':
                    if (club.features.forgiveness >= 7) {
                        score += 3;
                    }
                    break;
            }
        });

        return Math.min(score, 10);
    }

    // 志向・予算適合性の計算
    calculatePreferenceFit(club, userProfile) {
        let score = 5; // ベーススコア

        // 予算適合性
        if (club.price_range === userProfile.budget) {
            score += 3;
        }

        // ブランド志向
        if (userProfile.preferred_brands && 
            userProfile.preferred_brands.includes(club.manufacturer.toLowerCase())) {
            score += 2;
        }

        return Math.min(score, 10);
    }

    // シャフト推奨
    recommendShaft(club, userProfile) {
        const speedMap = {
            'slow': 'carbon',
            'average': club.shaft_options.includes('steel') ? 'steel' : 'carbon',
            'fast': 'steel'
        };

        const recommendedType = speedMap[userProfile.swing_speed] || 'steel';
        
        if (club.shaft_options.includes(recommendedType)) {
            return recommendedType === 'steel' ? 'スチールシャフト' : 'カーボンシャフト';
        }
        
        return club.shaft_options[0] === 'steel' ? 'スチールシャフト' : 'カーボンシャフト';
    }

    // 推奨理由の生成
    generateReasons(club, userProfile, score) {
        const reasons = [];

        // スコアベースの基本理由
        if (score >= 8) {
            reasons.push('あなたの特性に非常によく適合しています');
        } else if (score >= 6) {
            reasons.push('あなたの特性に適合しています');
        }

        // 具体的な理由
        if (userProfile.experience === 'beginner' && club.features.forgiveness >= 8) {
            reasons.push('初心者に優しい寛容性の高いクラブです');
        }

        if (userProfile.priority === 'distance' && club.features.distance >= 8) {
            reasons.push('飛距離性能に優れています');
        }

        if (userProfile.priority === 'accuracy' && club.features.workability >= 7) {
            reasons.push('コントロール性に優れています');
        }

        if (userProfile.priority === 'forgiveness' && club.features.forgiveness >= 8) {
            reasons.push('ミスに対する寛容性が高いです');
        }

        if (userProfile.priority === 'feel' && club.features.feel >= 8) {
            reasons.push('優れた打感が期待できます');
        }

        return reasons.length > 0 ? reasons : ['バランスの取れた性能を持つクラブです'];
    }

    // 結果の表示
    showResults(recommendations) {
        const diagnosisForm = document.getElementById('diagnosis-form');
        const resultSection = document.getElementById('result-section');
        const resultContent = document.getElementById('result-content');

        if (diagnosisForm) {
            diagnosisForm.style.display = 'none';
        }

        if (resultSection) {
            resultSection.style.display = 'block';
        }

        if (resultContent) {
            resultContent.innerHTML = this.generateResultHTML(recommendations);
        }

        // 結果セクションにスクロール
        if (resultSection) {
            resultSection.scrollIntoView({ behavior: 'smooth' });
        }

        // 結果表示後のイベントハンドラー設定
        this.setupResultHandlers();
    }

    // 結果HTMLの生成
    generateResultHTML(recommendations) {
        const userProfile = this.createUserProfile();
        
        let html = `
            <div class="diagnosis-summary">
                <h3>診断結果サマリー</h3>
                <div class="user-profile">
                    <p><strong>レベル:</strong> ${this.getExperienceLabel(userProfile.experience)}</p>
                    <p><strong>重視ポイント:</strong> ${this.getPriorityLabel(userProfile.priority)}</p>
                    <p><strong>予算:</strong> ${this.getBudgetLabel(userProfile.budget)}</p>
                </div>
            </div>
            
            <div class="recommendations">
                <h3>あなたにおすすめのアイアン</h3>
        `;

        recommendations.forEach((rec, index) => {
            html += `
                <div class="recommendation-card rank-${rec.rank}">
                    <div class="rank-badge">第${rec.rank}位</div>
                    <div class="club-info">
                        <h4>${rec.club.manufacturer} ${rec.club.model}</h4>
                        <div class="club-details">
                            <div class="score">
                                <span class="score-label">適合度</span>
                                <span class="score-value">${Math.round(rec.score * 10)}/100</span>
                            </div>
                            <div class="price-range">
                                <span class="price-label">価格帯:</span>
                                <span class="price-value">${this.getBudgetLabel(rec.club.price_range)}</span>
                            </div>
                        </div>
                        <div class="shaft-recommendation">
                            <strong>推奨シャフト:</strong> ${rec.shaft_recommendation}
                        </div>
                        <div class="reasons">
                            <h5>推奨理由</h5>
                            <ul>
                                ${rec.reasons.map(reason => `<li>${reason}</li>`).join('')}
                            </ul>
                        </div>
                        <div class="club-features">
                            <div class="feature">
                                <span>寛容性</span>
                                <div class="feature-bar">
                                    <div class="feature-fill" style="width: ${rec.club.features.forgiveness * 10}%"></div>
                                </div>
                            </div>
                            <div class="feature">
                                <span>操作性</span>
                                <div class="feature-bar">
                                    <div class="feature-fill" style="width: ${rec.club.features.workability * 10}%"></div>
                                </div>
                            </div>
                            <div class="feature">
                                <span>飛距離</span>
                                <div class="feature-bar">
                                    <div class="feature-fill" style="width: ${rec.club.features.distance * 10}%"></div>
                                </div>
                            </div>
                            <div class="feature">
                                <span>打感</span>
                                <div class="feature-bar">
                                    <div class="feature-fill" style="width: ${rec.club.features.feel * 10}%"></div>
                                </div>
                            </div>
                        </div>
                        <div class="purchase-links">
                            <a href="#" class="btn btn-primary purchase-btn" data-club-id="${rec.club.id}">
                                購入サイトを見る
                            </a>
                            <a href="#" class="btn btn-outline tryout-btn" data-club-id="${rec.club.id}">
                                試打予約
                            </a>
                        </div>
                    </div>
                </div>
            `;
        });

        html += `
            </div>
            <div class="result-note">
                <p><strong>※ 注意事項:</strong> この診断結果は参考情報です。最終的な購入判断は、必ず試打等で実際に確認してから行ってください。</p>
            </div>
        `;

        return html;
    }

    // ラベル変換メソッド
    getExperienceLabel(experience) {
        const labels = {
            'beginner': '初心者',
            'intermediate': '中級者',
            'advanced': '上級者'
        };
        return labels[experience] || experience;
    }

    getPriorityLabel(priority) {
        const labels = {
            'distance': '飛距離',
            'accuracy': '正確性',
            'forgiveness': 'ミスへの寛容性',
            'feel': '打感'
        };
        return labels[priority] || priority;
    }

    getBudgetLabel(budget) {
        const labels = {
            'low': '10万円未満',
            'medium': '10-20万円',
            'high': '20万円以上'
        };
        return labels[budget] || budget;
    }

    // 結果表示後のイベントハンドラー設定
    setupResultHandlers() {
        // 購入ボタン
        const purchaseButtons = document.querySelectorAll('.purchase-btn');
        purchaseButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const clubId = btn.dataset.clubId;
                this.handlePurchaseClick(clubId);
            });
        });

        // 試打予約ボタン
        const tryoutButtons = document.querySelectorAll('.tryout-btn');
        tryoutButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const clubId = btn.dataset.clubId;
                this.handleTryoutClick(clubId);
            });
        });

        // 結果保存ボタン
        const saveBtn = document.getElementById('save-result');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveResult());
        }

        // 再診断ボタン
        const retryBtn = document.getElementById('retry-diagnosis');
        if (retryBtn) {
            retryBtn.addEventListener('click', () => this.retryDiagnosis());
        }

        // 結果共有ボタン
        const shareBtn = document.getElementById('share-result');
        if (shareBtn) {
            shareBtn.addEventListener('click', () => this.shareResult());
        }
    }

    // 購入クリック処理
    handlePurchaseClick(clubId) {
        // アナリティクス追跡
        window.GolfIronAdvisor?.Analytics?.track('purchase_click', { club_id: clubId });
        
        // アフィリエイトリンクへの遷移
        window.open(`https://example-golf-shop.com/clubs/${clubId}`, '_blank');
    }

    // 試打予約クリック処理
    handleTryoutClick(clubId) {
        // アナリティクス追跡
        window.GolfIronAdvisor?.Analytics?.track('tryout_click', { club_id: clubId });
        
        // 試打予約サイトへの遷移
        window.open(`https://example-golf-shop.com/tryout/${clubId}`, '_blank');
    }

    // 結果保存
    async saveResult() {
        try {
            const resultData = {
                diagnosis_id: this.generateDiagnosisId(),
                user_profile: this.createUserProfile(),
                recommendations: this.lastRecommendations,
                created_at: new Date().toISOString()
            };

            // Supabaseに保存（実装されている場合）
            if (window.SupabaseClient) {
                await window.SupabaseClient.saveDiagnosis(this.formData, resultData);
            }

            // ローカルストレージにも保存
            const savedResults = JSON.parse(localStorage.getItem('diagnosis_results') || '[]');
            savedResults.push(resultData);
            localStorage.setItem('diagnosis_results', JSON.stringify(savedResults));

            window.GolfIronAdvisor?.NotificationManager?.success('診断結果を保存しました。');
            
        } catch (error) {
            console.error('Failed to save result:', error);
            window.GolfIronAdvisor?.NotificationManager?.error('結果の保存に失敗しました。');
        }
    }

    // 再診断
    retryDiagnosis() {
        if (confirm('現在の診断をクリアして最初からやり直しますか？')) {
            this.reset();
            this.start();
        }
    }

    // 結果共有
    shareResult() {
        const shareData = {
            title: 'ゴルフアイアン適性診断結果',
            text: 'あなたに最適なアイアンクラブを診断しました！',
            url: window.location.href
        };

        if (navigator.share) {
            navigator.share(shareData);
        } else {
            // フォールバック: クリップボードにコピー
            navigator.clipboard.writeText(`${shareData.title} - ${shareData.url}`).then(() => {
                window.GolfIronAdvisor?.NotificationManager?.success('URLをクリップボードにコピーしました。');
            });
        }
    }

    // 診断ID生成
    generateDiagnosisId() {
        return 'DIAG-' + new Date().getFullYear() + '-' + 
               Math.random().toString(36).substr(2, 6).toUpperCase();
    }

    // 状態の保存
    saveState() {
        if (window.GolfIronAdvisor?.appState) {
            window.GolfIronAdvisor.appState.currentStep = this.currentStep;
            window.GolfIronAdvisor.appState.diagnosisData = this.formData;
            window.GolfIronAdvisor.appState.save();
        }
    }

    // 状態の復元
    restoreState() {
        if (window.GolfIronAdvisor?.appState) {
            const state = window.GolfIronAdvisor.appState;
            if (state.currentStep && state.diagnosisData) {
                this.currentStep = state.currentStep;
                this.formData = state.diagnosisData;
                this.restoreFormValues();
                this.showCurrentStep();
            }
        }
    }

    // フォーム値の復元
    restoreFormValues() {
        const form = document.getElementById('diagnosis-questions');
        if (!form) return;

        Object.keys(this.formData).forEach(key => {
            const value = this.formData[key];
            const field = form.querySelector(`[name="${key}"]`);
            
            if (field) {
                if (field.type === 'checkbox') {
                    // チェックボックスの場合
                    if (Array.isArray(value)) {
                        value.forEach(v => {
                            const checkbox = form.querySelector(`[name="${key}"][value="${v}"]`);
                            if (checkbox) checkbox.checked = true;
                        });
                    }
                } else {
                    field.value = value;
                }
            }
        });
    }

    // 診断開始
    start() {
        this.currentStep = 1;
        this.formData = {};
        this.showCurrentStep();
        this.updateProgress();
        this.updateButtons();
        this.saveState();
    }

    // リセット
    reset() {
        this.currentStep = 1;
        this.formData = {};
        
        const form = document.getElementById('diagnosis-questions');
        if (form) {
            form.reset();
        }

        // エラーメッセージのクリア
        const errorElements = document.querySelectorAll('.error-message');
        errorElements.forEach(element => {
            element.style.display = 'none';
            element.textContent = '';
        });

        this.hideCurrentStep();
        this.showCurrentStep();
        this.updateProgress();
        this.updateButtons();
        
        if (window.GolfIronAdvisor?.appState) {
            window.GolfIronAdvisor.appState.clear();
        }
    }
}

// グローバルインスタンス作成
window.DiagnosisEngine = new DiagnosisEngine();