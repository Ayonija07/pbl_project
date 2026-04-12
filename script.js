/* ====================================
   GrowFi - Shared JavaScript Logic
   ==================================== */

// ====================================
// UTILITY FUNCTIONS
// ====================================

/**
 * Award badge and points to user
 * Rule: Only award once per module (no duplicate rewards)
 * Shows financial tip after award
 * @param {string} moduleName - Module identifier
 * @param {string} badgeName - Name of badge to award
 * @param {number} points - Points to award (50 per module)
 */
function awardBadge(moduleName, badgeName, points) {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) {
        window.location.href = 'index.html';
        return;
    }

    const user = JSON.parse(userStr);

    // Check if module already completed (prevent duplicate rewards)
    if (user.completedModules[moduleName]) {
        alert('You have already completed this module!');
        return;
    }

    // Award badge
    if (!user.badges.includes(badgeName)) {
        user.badges.push(badgeName);
    }

    // Award points
    user.points += points;

    // Mark module as completed
    user.completedModules[moduleName] = true;

    // Save updated user to localStorage
    localStorage.setItem('currentUser', JSON.stringify(user));

    // Show success message with tip (FEATURE 2)
    const tip = getFinancialTip(moduleName);
    const celebrationDetails = { badgeName, points };
    alert(`🎉 Success! You earned ${points} points and the "${badgeName}" badge!\n\n${tip}`);
    celebrateModuleSuccess(celebrationDetails.badgeName, celebrationDetails.points);
}

/**
 * Get current user data from localStorage
 * @returns {Object} User object or null if not logged in
 */
function getCurrentUser() {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
}

/**
 * Check if user is logged in
 * If not, redirect to login page
 */
function checkLogin() {
    const user = getCurrentUser();
    if (!user) {
        window.location.href = 'index.html';
    }
    return user;
}

/**
 * Save user data to localStorage
 * @param {Object} user - User object to save
 */
function saveUser(user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
}

// ====================================
// FEATURE 1: PROGRESS BAR CALCULATION
// ==================================== 

/**
 * Calculate and update progress bar
 * Progress = (completed modules / 4) * 100
 * Each module = 25%
 */
function updateProgressBar(user) {
    const completedCount = Object.values(user.completedModules).filter(v => v).length;
    const progressPercentage = (completedCount / 4) * 100;
    
    // Update progress bar width
    const progressFill = document.getElementById('progressFill');
    if (progressFill) {
        progressFill.style.width = progressPercentage + '%';
    }
    
    // Update progress text
    const progressText = document.getElementById('progressText');
    if (progressText) {
        progressText.textContent = Math.round(progressPercentage) + '% Complete';
    }
    
    // Show completion message
    const progressMessage = document.getElementById('progressMessage');
    if (progressMessage) {
        if (progressPercentage === 100) {
            progressMessage.innerHTML = '🎉 <strong>Congratulations! All modules completed!</strong><br>You are now a Financial Expert!';
            progressMessage.style.display = 'block';
        } else {
            progressMessage.textContent = `${4 - completedCount} module(s) remaining`;
        }
    }
}

// ====================================
// FEATURE 2: FINANCIAL TIPS
// ====================================

/**
 * Get financial tip based on completed module
 * Tips appear after successful module completion
 */
function getFinancialTip(moduleName) {
    const tips = {
        budgeting: "💡 Tip: Follow the 50-30-20 rule to manage income efficiently.",
        saving: "💡 Tip: Always build an emergency fund before investing.",
        invest: "💡 Tip: Diversification reduces financial risk.",
        expense: "💡 Tip: Small daily expenses accumulate over time."
    };
    
    return tips[moduleName] || "Great job! Keep learning.";
}

// ====================================
// FEATURE 3: LOGIN STREAK SYSTEM
// ====================================

/**
 * Update login streak on dashboard load
 * Compare today's date with lastLoginDate
 * If today = yesterday → increment streak
 * If gap > 1 day → reset to 1
 */
function updateLoginStreak(user) {
    const today = new Date().toLocaleDateString();
    const lastLogin = user.lastLoginDate;
    
    if (!lastLogin) {
        user.currentStreak = 1;
    } else {
        const lastLoginDate = new Date(lastLogin);
        const todayDate = new Date(today);
        
        // Calculate days difference
        const diffTime = todayDate - lastLoginDate;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
            // Same day - no change
        } else if (diffDays === 1) {
            // Consecutive day - increment streak
            user.currentStreak = (user.currentStreak || 1) + 1;
        } else {
            // Gap > 1 day - reset streak
            user.currentStreak = 1;
        }
    }
    
    // Update last login date
    user.lastLoginDate = today;
    
    // Save back to localStorage
    localStorage.setItem('currentUser', JSON.stringify(user));
}

/**
 * Get motivational message based on streak
 * 7+ days: Financial Discipline Master
 * 3+ days: Consistency Builder
 * Otherwise: Keep it up
 */
function getStreakMessage(streak) {
    if (streak >= 7) {
        return "🏆 Financial Discipline Master!";
    } else if (streak >= 3) {
        return "✨ Consistency Builder!";
    } else {
        return "Keep it up!";
    }
}

// ====================================
// FEATURE 4: PROFILE TITLE & AVATAR
// ====================================

/**
 * Get profile title based on points earned
 * 0-99: Financial Beginner
 * 100-199: Smart Planner
 * 200+: Money Master
 */
function getProfileTitle(points) {
    if (points >= 200) {
        return "💎 Money Master";
    } else if (points >= 100) {
        return "🎯 Smart Planner";
    } else {
        return "🌱 Financial Beginner";
    }
}

// ====================================
// RULE-BASED AI RECOMMENDATION ENGINE
// ====================================

/**
 * Generate AI recommendation based on points
 * Rule: IF points < 100 → Recommend Budgeting ELSE    Recommend Invest Smart
 * This is a simple rule-based system (not machine learning)
 * @param {number} points - User's current points
 * @returns {string} Recommendation text
 */
function getAIRecommendation(points) {
    if (points < 100) {
        return "💡 We recommend you start with <strong>Budgeting Basics</strong>! Master the fundamentals first.";
    } else {
        return "🚀 Great progress! Try <strong>Invest Smart</strong> for advanced learning.";
    }
}

// ====================================
// FORM VALIDATION HELPERS
// ====================================

/**
 * Validate if a number is positive
 * @param {number} value - Value to validate
 * @returns {boolean} True if valid positive number
 */
function isValidPositiveNumber(value) {
    const num = parseFloat(value);
    return !isNaN(num) && num > 0;
}

/**
 * Validate if a number is non-negative
 * @param {number} value - Value to validate
 * @returns {boolean} True if valid non-negative number
 */
function isValidNonNegativeNumber(value) {
    const num = parseFloat(value);
    return !isNaN(num) && num >= 0;
}

/**
 * Format currency for display
 * @param {number} amount - Amount in rupees
 * @returns {string} Formatted currency string
 */
function formatCurrency(amount) {
    return '₹' + amount.toFixed(2);
}

// ====================================
// LOCAL STORAGE MANAGEMENT
// ====================================

/**
 * Clear all user data (for testing/logout)
 */
function clearAllData() {
    localStorage.removeItem('currentUser');
}

/**
 * Initialize demo user (for testing)
 * Creates a sample user with some data
 */
function initDemoUser() {
    const today = new Date().toLocaleDateString();
    const demoUser = {
        username: 'DemoUser',
        avatar: '💰',
        points: 50,
        badges: ['Budget Beginner'],
        walletBalance: 750,
        currentStreak: 1,
        lastLoginDate: today,
        completedModules: {
            budgeting: true,
            saving: false,
            invest: false,
            expense: false
        }
    };
    localStorage.setItem('currentUser', JSON.stringify(demoUser));
}

// ====================================
// PAGE PROTECTION
// ====================================

/**
 * Protect module pages from unauthorized access
 * Call this at the start of each module page
 */
function protectModulePage() {
    const user = getCurrentUser();
    if (!user) {
        window.location.href = 'index.html';
    }
}

// ====================================
// GAMIFICATION HELPERS
// ====================================

/**
 * Get user's gamification stats
 * @param {Object} user - User object
 * @returns {Object} Stats object with points, badges count, etc.
 */
function getGamificationStats(user) {
    return {
        totalPoints: user.points,
        badgesCount: user.badges.length,
        modulesCompleted: Object.values(user.completedModules).filter(v => v).length,
        totalModules: 4,
        completionPercentage: (Object.values(user.completedModules).filter(v => v).length / 4) * 100
    };
}

/**
 * Get next milestone (for motivation)
 * @param {number} currentPoints - User's current points
 * @returns {Object} Next milestone info
 */
function getNextMilestone(currentPoints) {
    const milestones = [50, 100, 150, 200, 250, 300];
    const nextMilestone = milestones.find(m => m > currentPoints);
    
    if (!nextMilestone) {
        return { milestone: 300, pointsNeeded: 0, reached: true };
    }
    
    return {
        milestone: nextMilestone,
        pointsNeeded: nextMilestone - currentPoints,
        reached: false
    };
    celebrateModuleSuccess(celebrationDetails.badgeName, celebrationDetails.points);
}

function getDailyChallenge(user) {
    const modules = [
        {
            key: 'budgeting',
            title: 'Balance Builder',
            description: 'Complete Budgeting Basics and build your first healthy monthly plan.',
            reward: '+50 XP'
        },
        {
            key: 'saving',
            title: 'Savings Sprint',
            description: 'Set a realistic savings goal and prove your plan can actually work.',
            reward: '+50 XP'
        },
        {
            key: 'invest',
            title: 'Risk Radar',
            description: 'Pick an investment style that matches your comfort with risk.',
            reward: '+50 XP'
        },
        {
            key: 'expense',
            title: 'Spend Detective',
            description: 'Track one expense and protect your wallet from overspending.',
            reward: '+50 XP'
        }
    ];

    const nextModule = modules.find(module => !user.completedModules[module.key]);
    if (nextModule) {
        return nextModule;
    }

    return {
        key: 'mastery',
        title: 'Victory Lap',
        description: 'You cleared every module. Revisit one lesson today and sharpen your money instincts.',
        reward: 'Elite status'
    };
}

function getFinanceFact(points) {
    const facts = [
        'Small recurring savings usually beat one-time motivation bursts.',
        'A budget is not restriction. It is a plan for what matters most.',
        'Tracking even one week of expenses can reveal surprising habits.',
        'Diversification helps reduce risk because your money is not relying on one bet alone.',
        'Emergency funds create freedom because they buy time when life changes suddenly.'
    ];

    return facts[points % facts.length];
}

function getLevelLabel(points) {
    if (points >= 200) {
        return 'Money Master';
    }
    if (points >= 100) {
        return 'Smart Planner';
    }
    return 'Rookie Saver';
}

function animateCounter(element, targetValue, prefix) {
    if (!element) {
        return;
    }

    const finalValue = Number(targetValue) || 0;
    const duration = 900;
    const startTime = performance.now();

    function step(currentTime) {
        const progress = Math.min((currentTime - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const currentValue = Math.round(finalValue * eased);
        element.textContent = (prefix || '') + currentValue;

        if (progress < 1) {
            requestAnimationFrame(step);
        }
    }

    requestAnimationFrame(step);
}

function renderBadgeShelf(user) {
    const badgeShelf = document.getElementById('badgeShelf');
    if (!badgeShelf) {
        return;
    }

    if (!user.badges || user.badges.length === 0) {
        badgeShelf.innerHTML = '<div class="empty-state">Unlock your first badge by completing a module.</div>';
        return;
    }

    badgeShelf.innerHTML = user.badges
        .map((badge, index) => `<div class="badge-chip"><span class="badge-rank">T${index + 1}</span><strong>${badge}</strong></div>`)
        .join('');
}

function populateFunDashboard(user) {
    const dailyChallenge = getDailyChallenge(user);
    const nextMilestone = getNextMilestone(user.points);

    const missionTitle = document.getElementById('missionTitle');
    const missionDescription = document.getElementById('missionDescription');
    const missionReward = document.getElementById('missionReward');
    const milestoneCopy = document.getElementById('milestoneCopy');
    const levelLabel = document.getElementById('levelLabel');
    const financeFact = document.getElementById('financeFact');

    if (missionTitle) {
        missionTitle.textContent = dailyChallenge.title;
    }
    if (missionDescription) {
        missionDescription.textContent = dailyChallenge.description;
    }
    if (missionReward) {
        missionReward.textContent = dailyChallenge.reward;
    }
    if (milestoneCopy) {
        milestoneCopy.textContent = nextMilestone.reached
            ? 'You cleared every milestone on the board. Time to keep the streak alive.'
            : `${nextMilestone.pointsNeeded} XP left until your ${nextMilestone.milestone} XP unlock.`;
    }
    if (levelLabel) {
        levelLabel.textContent = getLevelLabel(user.points);
    }
    if (financeFact) {
        financeFact.textContent = getFinanceFact(user.points);
    }

    renderBadgeShelf(user);
}

function celebrateModuleSuccess(badgeName, points) {
    const celebration = document.createElement('div');
    celebration.className = 'celebration-toast';
    celebration.innerHTML = `
        <div class="celebration-card">
            <span class="celebration-label">Level up</span>
            <strong>${badgeName} unlocked</strong>
            <p>+${points} XP added to your journey.</p>
        </div>
    `;

    const burst = document.createElement('div');
    burst.className = 'confetti-burst';
    for (let i = 0; i < 18; i += 1) {
        const piece = document.createElement('span');
        piece.style.left = `${Math.random() * 100}%`;
        piece.style.animationDelay = `${Math.random() * 0.45}s`;
        piece.style.background = i % 3 === 0 ? '#1f7a6d' : (i % 3 === 1 ? '#174f7a' : '#f2b84b');
        burst.appendChild(piece);
    }

    celebration.appendChild(burst);
    document.body.appendChild(celebration);

    window.setTimeout(() => {
        celebration.classList.add('show');
    }, 10);

    window.setTimeout(() => {
        celebration.classList.remove('show');
        window.setTimeout(() => celebration.remove(), 400);
    }, 2800);
}

function showQuickCheck(feedbackId, isCorrect, successText, retryText) {
    const feedback = document.getElementById(feedbackId);
    if (!feedback) {
        return;
    }

    feedback.classList.remove('hidden', 'quick-check-success', 'quick-check-error');
    if (isCorrect) {
        feedback.classList.add('quick-check-success');
        feedback.textContent = successText;
    } else {
        feedback.classList.add('quick-check-error');
        feedback.textContent = retryText;
    }
}

function calculateFinancialHealthScore(user) {
    const monthlyIncome = Number(user.monthlyIncome) || 0;
    const monthlyExpenses = Number(user.monthlyExpenses) || 0;
    const walletBalance = Number(user.walletBalance) || 0;
    const streak = Number(user.currentStreak) || 1;

    const savingsRatioRaw = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 35;
    const savingsRatioScore = Math.max(0, Math.min(40, Math.round(Math.max(0, savingsRatioRaw) * 1.2)));

    const balanceGap = monthlyIncome - monthlyExpenses;
    const budgetBalanceScore = monthlyIncome > 0
        ? Math.max(0, Math.min(35, Math.round(((balanceGap + monthlyIncome * 0.1) / (monthlyIncome * 0.4)) * 35)))
        : (walletBalance > 0 ? 20 : 10);

    const consistencyScore = Math.max(5, Math.min(25, streak * 4));

    return Math.max(0, Math.min(100, savingsRatioScore + budgetBalanceScore + consistencyScore));
}

function getSmartFinancialAdvice(user) {
    const monthlyIncome = Number(user.monthlyIncome) || 0;
    const monthlyExpenses = Number(user.monthlyExpenses) || 0;
    const walletBalance = Number(user.walletBalance) || 0;
    const streak = Number(user.currentStreak) || 1;

    if (monthlyIncome > 0 && monthlyExpenses > monthlyIncome) {
        return "You are overspending on non-essential items. Try reducing expenses by 10-15%.";
    }

    if (monthlyIncome > 0 && (monthlyIncome - monthlyExpenses) / monthlyIncome < 0.15) {
        return "Your savings buffer is a little thin. Try moving at least 15% of income toward savings first.";
    }

    if (walletBalance < 500) {
        return "Your wallet balance is getting tight. Pause low-priority spending and rebuild your cash cushion.";
    }

    if (streak >= 5) {
        return "Your consistency is becoming a superpower. Keep the streak alive and raise your savings target slightly.";
    }

    return "You are on a steady path. Keep your budget balanced and review one spending habit this week for an easy win.";
}

// ====================================
// MARKETSTACK INVESTMENT HELPERS
// ====================================

const DEFAULT_MARKET_SYMBOLS = ['AAPL', 'MSFT', 'VOO'];
const MARKET_WATCHLIST_STORAGE_KEY = 'growfiWatchlistSymbols';
const MARKET_SYMBOL_CATALOG = [
    { symbol: 'AAPL', name: 'Apple Inc', profile: 'Large-cap technology leader' },
    { symbol: 'MSFT', name: 'Microsoft Corporation', profile: 'Cloud and software giant' },
    { symbol: 'GOOGL', name: 'Alphabet Inc', profile: 'Search and advertising heavyweight' },
    { symbol: 'AMZN', name: 'Amazon.com Inc', profile: 'E-commerce and cloud platform' },
    { symbol: 'NVDA', name: 'NVIDIA Corporation', profile: 'AI and semiconductor momentum play' },
    { symbol: 'META', name: 'Meta Platforms Inc', profile: 'Social media and advertising giant' },
    { symbol: 'TSLA', name: 'Tesla Inc', profile: 'High-volatility growth stock' },
    { symbol: 'VOO', name: 'Vanguard S&P 500 ETF', profile: 'Broad market index exposure' },
    { symbol: 'QQQ', name: 'Invesco QQQ Trust', profile: 'Tech-heavy index exposure' },
    { symbol: 'JPM', name: 'JPMorgan Chase & Co', profile: 'Diversified banking leader' }
];

let activeMarketSymbol = '';
let latestMarketQuotes = [];
const INR_FORMATTER = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
});

const RISK_GUIDANCE = {
    low: {
        title: 'Low risk fit',
        focus: 'Stability, diversification, and fewer sudden swings.',
        symbols: ['VOO', 'JPM', 'MSFT'],
        message: 'Start with broad exposure and strong balance sheets. This keeps you closer to steady compounding than hype-driven jumps.'
    },
    medium: {
        title: 'Medium risk fit',
        focus: 'Blend stability with measured growth.',
        symbols: ['MSFT', 'AAPL', 'QQQ'],
        message: 'A balanced mix can help you learn market movement without putting everything into the most volatile names.'
    },
    high: {
        title: 'High risk fit',
        focus: 'Higher upside potential with larger price swings.',
        symbols: ['NVDA', 'TSLA', 'QQQ'],
        message: 'Growth names can run quickly and pull back just as fast. Position sizing and diversification matter even more here.'
    }
};

function getSavedWatchlist() {
    const saved = localStorage.getItem(MARKET_WATCHLIST_STORAGE_KEY);
    if (!saved) {
        return [...DEFAULT_MARKET_SYMBOLS];
    }

    const symbols = saved
        .split(',')
        .map((symbol) => symbol.trim().toUpperCase())
        .filter(Boolean);

    return symbols.length > 0 ? symbols : [...DEFAULT_MARKET_SYMBOLS];
}

function setMarketStatus(message, isError) {
    const status = document.getElementById('marketStatus');
    if (!status) {
        return;
    }

    status.textContent = message;
    status.classList.toggle('market-status-error', Boolean(isError));
}

function getDisplayNameForSymbol(symbol) {
    const match = MARKET_SYMBOL_CATALOG.find((item) => item.symbol === symbol);
    return match ? match.name : symbol;
}

function formatInr(value) {
    return INR_FORMATTER.format(Number(value) || 0);
}

function getRiskSelection() {
    const selected = document.querySelector('input[name="riskLevel"]:checked');
    return selected ? selected.value : '';
}

function calculateSavingsRatio(user) {
    const monthlyIncome = Number(user?.monthlyIncome) || 0;
    const monthlyExpenses = Number(user?.monthlyExpenses) || 0;

    if (monthlyIncome <= 0) {
        return 0;
    }

    return Math.max(0, ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100);
}

function getVolatilityLevel(priceChangePercent) {
    const absoluteMove = Math.abs(priceChangePercent);
    if (absoluteMove >= 2.5) {
        return 'high';
    }
    if (absoluteMove >= 1) {
        return 'medium';
    }
    return 'low';
}

function getTrendLabel(priceChange) {
    if (priceChange > 0) {
        return 'Uptrend';
    }
    if (priceChange < 0) {
        return 'Downtrend';
    }
    return 'Sideways';
}

function getRecommendationTone(recommendationType) {
    if (recommendationType === 'safe') {
        return { badgeText: 'Safe', badgeClass: 'recommendation-badge-safe' };
    }
    if (recommendationType === 'risky') {
        return { badgeText: 'Risky', badgeClass: 'recommendation-badge-risky' };
    }
    return { badgeText: 'Moderate', badgeClass: 'recommendation-badge-moderate' };
}

function updateRecommendationUI(model) {
    const badge = document.getElementById('recommendationBadge');
    const marketStatusLabel = document.getElementById('marketStatusLabel');
    const financialHealthLabel = document.getElementById('financialHealthLabel');
    const riskToleranceLabel = document.getElementById('riskToleranceLabel');
    const savingsRatioLabel = document.getElementById('savingsRatioLabel');
    const recommendationMessage = document.getElementById('recommendationMessage');
    const recommendationTip = document.getElementById('recommendationTip');
    const recommendedAction = document.getElementById('recommendedAction');
    const focusedSymbolLabel = document.getElementById('focusedSymbolLabel');
    const recommendationWhyList = document.getElementById('recommendationWhyList');

    if (!badge || !marketStatusLabel || !financialHealthLabel || !riskToleranceLabel || !savingsRatioLabel || !recommendationMessage || !recommendationTip || !recommendedAction || !focusedSymbolLabel || !recommendationWhyList) {
        return;
    }

    const tone = getRecommendationTone(model.type);
    badge.textContent = tone.badgeText;
    badge.className = `recommendation-badge ${tone.badgeClass}`;
    marketStatusLabel.textContent = `${model.marketStatus} ${model.marketLabel}`.trim();
    financialHealthLabel.textContent = `${model.financialHealth}/100`;
    riskToleranceLabel.textContent = model.riskTolerance;
    savingsRatioLabel.textContent = `${model.savingsRatio}%`;
    recommendationMessage.textContent = model.message;
    recommendationTip.textContent = model.tip;
    recommendedAction.textContent = model.action;
    focusedSymbolLabel.textContent = model.focusedSymbol;
    recommendationWhyList.innerHTML = (model.reasons || []).map((reason) => `<li>${reason}</li>`).join('');
}

function buildRecommendationModel() {
    const user = getCurrentUser();
    const selectedQuote = latestMarketQuotes.find((quote) => quote.symbol === activeMarketSymbol) || latestMarketQuotes[0];
    const riskLevel = getRiskSelection();
    const savingsRatio = Math.round(calculateSavingsRatio(user));
    const financialHealth = user ? calculateFinancialHealthScore(user) : 0;
    const readableRisk = riskLevel ? riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1) : 'Not selected';

    if (!selectedQuote) {
        return {
            type: 'moderate',
            marketStatus: 'Waiting for data',
            marketLabel: '',
            financialHealth,
            riskTolerance: readableRisk,
            savingsRatio,
            action: 'Wait and assess',
            focusedSymbol: 'None selected',
            reasons: [
                'No market symbol is selected yet.',
                'Your recommendation becomes more accurate after live market data loads.',
                'Pick a risk tolerance first so the advice can match your comfort level.'
            ],
            message: 'Choose your risk tolerance and load market data to generate a recommendation.',
            tip: 'Tip: combine good savings habits with market conditions before moving into stocks.'
        };
    }

    const open = Number(selectedQuote.open) || 0;
    const close = Number(selectedQuote.close) || 0;
    const priceChange = close - open;
    const priceChangePercent = open > 0 ? (priceChange / open) * 100 : 0;
    const trend = getTrendLabel(priceChange);
    const volatility = getVolatilityLevel(priceChangePercent);
    const marketLabel = volatility === 'high' ? 'High volatility' : volatility === 'medium' ? 'Moderate volatility' : 'Low volatility';

    if (!riskLevel) {
        return {
            type: 'moderate',
            marketStatus: trend,
            marketLabel,
            financialHealth,
            riskTolerance: readableRisk,
            savingsRatio,
            action: 'Select risk tolerance',
            focusedSymbol: selectedQuote.symbol || 'Unknown',
            reasons: [
                'Risk tolerance is required before the recommendation can match your comfort level.',
                `Current market signal for ${selectedQuote.symbol} is ${trend.toLowerCase()} with ${marketLabel.toLowerCase()}.`,
                `Your financial health is ${financialHealth}/100, but the rule engine needs a risk choice first.`
            ],
            message: 'Choose your risk tolerance before acting on market data.',
            tip: 'Low suits mutual funds, medium suits balanced options, and high suits stocks.'
        };
    }

    if (savingsRatio < 20) {
        return {
            type: 'risky',
            marketStatus: trend,
            marketLabel,
            financialHealth,
            riskTolerance: readableRisk,
            savingsRatio,
            action: 'Not ready to invest',
            focusedSymbol: selectedQuote.symbol || 'Unknown',
            reasons: [
                `Savings ratio is ${savingsRatio}%, which is below the 20% minimum rule.`,
                `Your current financial health is ${financialHealth}/100.`,
                'The system prioritizes savings strength before stock investing.'
            ],
            message: 'Not ready to invest.',
            tip: 'Recommended: build savings first. If you still want to start small, consider mutual funds instead of direct stocks.'
        };
    }

    if (riskLevel === 'low' && volatility === 'high') {
        return {
            type: 'risky',
            marketStatus: trend,
            marketLabel,
            financialHealth,
            riskTolerance: readableRisk,
            savingsRatio,
            action: 'Avoid risky stocks',
            focusedSymbol: selectedQuote.symbol || 'Unknown',
            reasons: [
                `Your risk tolerance is ${readableRisk}.`,
                `${selectedQuote.symbol} is showing high volatility right now.`,
                'This rule recommends mutual funds when low risk tolerance meets high volatility.'
            ],
            message: 'Avoid risky stocks, consider mutual funds.',
            tip: 'Recommended: Mutual Funds.'
        };
    }

    if (trend === 'Uptrend' && savingsRatio >= 30) {
        return {
            type: 'safe',
            marketStatus: trend,
            marketLabel,
            financialHealth,
            riskTolerance: readableRisk,
            savingsRatio,
            action: 'Consider investing',
            focusedSymbol: selectedQuote.symbol || 'Unknown',
            reasons: [
                `${selectedQuote.symbol} is in an uptrend.`,
                `Savings ratio is ${savingsRatio}%, which meets the 30% rule.`,
                `Financial health is ${financialHealth}/100 and is shown as supporting context.`
            ],
            message: 'You can consider investing.',
            tip: 'Diversify your investments to reduce risk and avoid betting everything on one symbol.'
        };
    }

    return {
        type: 'moderate',
        marketStatus: trend,
        marketLabel,
        financialHealth,
        riskTolerance: readableRisk,
        savingsRatio,
        action: 'Monitor market before investing',
        focusedSymbol: selectedQuote.symbol || 'Unknown',
        reasons: [
            `The market trend for ${selectedQuote.symbol} is ${trend.toLowerCase()}.`,
            `Savings ratio is ${savingsRatio}%.`,
            'This does not trigger the stronger yes/no rules, so the system recommends waiting and watching.'
        ],
        message: 'Monitor market before investing.',
        tip: riskLevel === 'low'
            ? 'If you want lower risk exposure, mutual funds or balanced funds are the better fit.'
            : 'Keep monitoring trend and volatility before making a larger move.'
    };
}

function refreshInvestmentRecommendation() {
    updateRecommendationUI(buildRecommendationModel());
}

function buildRiskSuggestionMarkup(riskLevel) {
    const suggestion = RISK_GUIDANCE[riskLevel];
    if (!suggestion) {
        return 'Select a low, medium, or high risk strategy above to unlock tailored watchlist guidance.';
    }

    const symbolButtons = suggestion.symbols.map((symbol) => `
        <button class="risk-pill" onclick="addSymbolToWatchlist('${symbol}')">${symbol}</button>
    `).join('');

    return `
        <span class="risk-eyebrow">${suggestion.title}</span>
        <strong>${suggestion.focus}</strong>
        <p>${suggestion.message}</p>
        <div class="risk-pill-row">${symbolButtons}</div>
    `;
}

function updateRiskSuggestions() {
    const riskSuggestion = document.getElementById('riskSuggestion');
    if (!riskSuggestion) {
        return;
    }

    const riskLevel = getRiskSelection();
    riskSuggestion.innerHTML = buildRiskSuggestionMarkup(riskLevel);
    refreshInvestmentRecommendation();
}

function getMarketRiskLabel(priceChangePercent) {
    if (priceChangePercent <= -2.5) {
        return 'Volatile day';
    }
    if (priceChangePercent >= 2.5) {
        return 'Momentum move';
    }
    return 'Steady range';
}

function getMarketCardTone(priceChange) {
    if (priceChange > 0) {
        return 'market-card-positive';
    }
    if (priceChange < 0) {
        return 'market-card-negative';
    }
    return 'market-card-neutral';
}

function describeTrend(points) {
    if (!points || points.length < 2) {
        return 'Not enough recent sessions to describe a trend yet.';
    }

    const first = Number(points[0].close) || 0;
    const last = Number(points[points.length - 1].close) || 0;
    const changePercent = first > 0 ? ((last - first) / first) * 100 : 0;

    if (changePercent >= 3) {
        return 'Recent momentum is positive, which can feel exciting but can also tempt overconfidence.';
    }
    if (changePercent <= -3) {
        return 'Recent momentum is negative, a useful reminder that short-term price swings are normal.';
    }
    return 'Recent movement has been fairly contained, which is a good example of steadier price behavior.';
}

function renderMarketChart(symbol, points) {
    const chart = document.getElementById('marketChart');
    const chartTitle = document.getElementById('chartTitle');
    const chartInsight = document.getElementById('chartInsight');

    if (!chart || !chartTitle || !chartInsight) {
        return;
    }

    if (!points || points.length === 0) {
        chart.className = 'market-chart-empty';
        chart.textContent = 'No historical data is available for this symbol right now.';
        chartTitle.textContent = '7-day closing trend';
        chartInsight.textContent = 'Pick a stock card to see how its recent closing prices moved.';
        return;
    }

    const values = points.map((point) => Number(point.close) || 0);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = Math.max(max - min, 1);

    const polylinePoints = points.map((point, index) => {
        const x = (index / Math.max(points.length - 1, 1)) * 100;
        const y = 100 - (((Number(point.close) || min) - min) / range) * 100;
        return `${x},${y}`;
    }).join(' ');

    const markers = points.map((point, index) => {
        const x = (index / Math.max(points.length - 1, 1)) * 100;
        const y = 100 - (((Number(point.close) || min) - min) / range) * 100;
        return `<circle cx="${x}" cy="${y}" r="1.8"></circle>`;
    }).join('');

    const labels = points.map((point) => {
        const formattedDate = point.date ? new Date(point.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '--';
        return `
            <div class="chart-axis-label">
                <strong>${formattedDate}</strong>
                <span>${formatInr(point.close)}</span>
            </div>
        `;
    }).join('');

    chart.className = 'market-chart';
    chart.innerHTML = `
        <div class="market-chart-stage">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-label="${symbol} closing price chart">
                <defs>
                    <linearGradient id="marketChartFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="rgba(31, 122, 109, 0.28)"></stop>
                        <stop offset="100%" stop-color="rgba(31, 122, 109, 0.02)"></stop>
                    </linearGradient>
                </defs>
                <polygon points="0,100 ${polylinePoints} 100,100" fill="url(#marketChartFill)"></polygon>
                <polyline points="${polylinePoints}" fill="none" stroke="#1f7a6d" stroke-width="2.2" vector-effect="non-scaling-stroke"></polyline>
                ${markers}
            </svg>
        </div>
        <div class="chart-axis">${labels}</div>
    `;

    chartTitle.textContent = `${symbol} 7-day closing trend`;
    chartInsight.textContent = describeTrend(points);
}

function createChartPolyline(points, min, range) {
    return points.map((point, index) => {
        const x = (index / Math.max(points.length - 1, 1)) * 100;
        const y = 100 - (((Number(point.close) || min) - min) / range) * 100;
        return `${x},${y}`;
    }).join(' ');
}

function renderComparisonChart(primarySymbol, primaryPoints, secondarySymbol, secondaryPoints) {
    const chart = document.getElementById('comparisonChart');
    const summary = document.getElementById('compareSummary');

    if (!chart || !summary) {
        return;
    }

    if (!primaryPoints.length || !secondaryPoints.length) {
        chart.className = 'market-chart-empty';
        chart.textContent = 'Comparison data is not available yet for one of the selected symbols.';
        summary.textContent = 'Try another pair from your watchlist.';
        return;
    }

    const combinedValues = [...primaryPoints, ...secondaryPoints].map((point) => Number(point.close) || 0);
    const min = Math.min(...combinedValues);
    const max = Math.max(...combinedValues);
    const range = Math.max(max - min, 1);

    const primaryPolyline = createChartPolyline(primaryPoints, min, range);
    const secondaryPolyline = createChartPolyline(secondaryPoints, min, range);

    const primaryStart = Number(primaryPoints[0].close) || 0;
    const primaryEnd = Number(primaryPoints[primaryPoints.length - 1].close) || 0;
    const secondaryStart = Number(secondaryPoints[0].close) || 0;
    const secondaryEnd = Number(secondaryPoints[secondaryPoints.length - 1].close) || 0;
    const primaryMove = primaryStart > 0 ? ((primaryEnd - primaryStart) / primaryStart) * 100 : 0;
    const secondaryMove = secondaryStart > 0 ? ((secondaryEnd - secondaryStart) / secondaryStart) * 100 : 0;

    chart.className = 'market-chart';
    chart.innerHTML = `
        <div class="comparison-legend">
            <span><i class="legend-swatch legend-swatch-primary"></i>${primarySymbol}</span>
            <span><i class="legend-swatch legend-swatch-secondary"></i>${secondarySymbol}</span>
        </div>
        <div class="market-chart-stage">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-label="${primarySymbol} and ${secondarySymbol} comparison chart">
                <polyline points="${primaryPolyline}" fill="none" stroke="#1f7a6d" stroke-width="2.2" vector-effect="non-scaling-stroke"></polyline>
                <polyline points="${secondaryPolyline}" fill="none" stroke="#174f7a" stroke-width="2.2" stroke-dasharray="5 3" vector-effect="non-scaling-stroke"></polyline>
            </svg>
        </div>
    `;

    summary.textContent = `${primarySymbol} moved ${primaryMove.toFixed(2)}% over the recent window, while ${secondarySymbol} moved ${secondaryMove.toFixed(2)}%.`;
}

async function loadMarketHistory(symbol) {
    activeMarketSymbol = symbol;
    refreshInvestmentRecommendation();

    try {
        const response = await fetch(`/api/market/history?symbol=${encodeURIComponent(symbol)}&limit=7`);
        const payload = await response.json();

        if (!response.ok) {
            throw new Error(payload.error || 'Unable to load price trend.');
        }

        renderMarketChart(payload.symbol || symbol, payload.points || []);
    } catch (error) {
        renderMarketChart(symbol, []);
        const chartInsight = document.getElementById('chartInsight');
        if (chartInsight) {
            chartInsight.textContent = error.message || 'Unable to load price trend.';
        }
    }
}

async function fetchHistorySeries(symbol) {
    const response = await fetch(`/api/market/history?symbol=${encodeURIComponent(symbol)}&limit=7`);
    const payload = await response.json();

    if (!response.ok) {
        throw new Error(payload.error || 'Unable to load comparison history.');
    }

    return payload.points || [];
}

function renderMarketCards(stocks) {
    const marketGrid = document.getElementById('marketGrid');
    if (!marketGrid) {
        return;
    }

    if (!stocks || stocks.length === 0) {
        marketGrid.innerHTML = '';
        setMarketStatus('No prices came back for this watchlist yet.', true);
        latestMarketQuotes = [];
        refreshInvestmentRecommendation();
        return;
    }

    latestMarketQuotes = stocks;

    const cards = stocks.map((stock) => {
        const open = Number(stock.open) || 0;
        const close = Number(stock.close) || 0;
        const priceChange = close - open;
        const priceChangePercent = open > 0 ? (priceChange / open) * 100 : 0;
        const toneClass = getMarketCardTone(priceChange);
        const changePrefix = priceChange > 0 ? '+' : '';
        const percentPrefix = priceChangePercent > 0 ? '+' : '';
        const riskLabel = getMarketRiskLabel(priceChangePercent);
        const lastDate = stock.date ? new Date(stock.date).toLocaleDateString() : 'N/A';

        return `
            <article class="market-card ${toneClass}" onclick="loadMarketHistory('${stock.symbol || ''}')">
                <div class="market-card-top">
                    <div>
                        <p class="market-symbol">${stock.symbol || 'N/A'}</p>
                        <h3>${stock.name || 'Unknown company'}</h3>
                    </div>
                    <span class="market-chip">${riskLabel}</span>
                </div>
                <div class="market-price-row">
                    <strong>${close ? formatInr(close) : 'N/A'}</strong>
                    <span>${changePrefix}${formatInr(Math.abs(priceChange))} (${percentPrefix}${priceChangePercent.toFixed(2)}%)</span>
                </div>
                <dl class="market-metrics">
                    <div>
                        <dt>Open</dt>
                        <dd>${open ? formatInr(open) : 'N/A'}</dd>
                    </div>
                    <div>
                        <dt>High</dt>
                        <dd>${stock.high ? formatInr(stock.high) : 'N/A'}</dd>
                    </div>
                    <div>
                        <dt>Low</dt>
                        <dd>${stock.low ? formatInr(stock.low) : 'N/A'}</dd>
                    </div>
                    <div>
                        <dt>Rate date</dt>
                        <dd>${stock.rateDate ? new Date(stock.rateDate).toLocaleDateString() : lastDate}</dd>
                    </div>
                </dl>
                <p class="market-exchange">${stock.exchange || 'Exchange unavailable'}</p>
            </article>
        `;
    }).join('');

    marketGrid.innerHTML = cards;
    setMarketStatus(`Showing ${stocks.length} market snapshot${stocks.length === 1 ? '' : 's'} from your watchlist.`, false);
    refreshInvestmentRecommendation();

    const selectedSymbol = activeMarketSymbol && stocks.some((stock) => stock.symbol === activeMarketSymbol)
        ? activeMarketSymbol
        : (stocks[0].symbol || '');

    if (selectedSymbol) {
        loadMarketHistory(selectedSymbol);
    }

    populateComparisonSelectors(stocks.map((stock) => stock.symbol).filter(Boolean));
}

async function refreshMarketData() {
    const symbols = getSavedWatchlist();
    setMarketStatus('Refreshing market data...', false);

    try {
        const response = await fetch(`/api/market?symbols=${encodeURIComponent(symbols.join(','))}`);
        const payload = await response.json();

        if (!response.ok) {
            throw new Error(payload.error || 'Unable to reach GrowFi market service.');
        }

        renderMarketCards(payload.data || []);
    } catch (error) {
        const marketGrid = document.getElementById('marketGrid');
        if (marketGrid) {
            marketGrid.innerHTML = '';
        }
        setMarketStatus(error.message || 'Unable to load market data right now.', true);
    }
}

function saveWatchlist() {
    const input = document.getElementById('watchlistSymbols');
    if (!input) {
        return;
    }

    const symbols = input.value
        .split(',')
        .map((symbol) => symbol.trim().toUpperCase())
        .filter(Boolean)
        .slice(0, 6);

    if (symbols.length === 0) {
        alert('Please enter at least one valid stock symbol.');
        return;
    }

    localStorage.setItem(MARKET_WATCHLIST_STORAGE_KEY, symbols.join(','));
    input.value = symbols.join(', ');
    clearSymbolSearch();
    refreshMarketData();
}

function addSymbolToWatchlist(symbol) {
    const current = getSavedWatchlist();
    const next = [symbol, ...current.filter((item) => item !== symbol)].slice(0, 6);
    localStorage.setItem(MARKET_WATCHLIST_STORAGE_KEY, next.join(','));

    const watchlistInput = document.getElementById('watchlistSymbols');
    if (watchlistInput) {
        watchlistInput.value = next.join(', ');
    }

    clearSymbolSearch();
    refreshMarketData();
}

function renderSymbolSuggestions(matches) {
    const container = document.getElementById('symbolSuggestions');
    if (!container) {
        return;
    }

    if (!matches || matches.length === 0) {
        container.innerHTML = '<div class="symbol-empty">No quick matches found. Try a symbol like AAPL or MSFT.</div>';
        return;
    }

    container.innerHTML = matches.map((item) => `
        <button class="symbol-suggestion" onclick="addSymbolToWatchlist('${item.symbol}')">
            <strong>${item.symbol}</strong>
            <span>${item.name}</span>
            <small>${item.profile}</small>
        </button>
    `).join('');
}

function filterSymbolSuggestions() {
    const input = document.getElementById('symbolSearchInput');
    if (!input) {
        return;
    }

    const query = input.value.trim().toLowerCase();
    if (!query) {
        renderSymbolSuggestions(MARKET_SYMBOL_CATALOG.slice(0, 6));
        return;
    }

    const matches = MARKET_SYMBOL_CATALOG
        .filter((item) =>
            item.symbol.toLowerCase().includes(query) ||
            item.name.toLowerCase().includes(query)
        )
        .slice(0, 6);

    renderSymbolSuggestions(matches);
}

function clearSymbolSearch() {
    const input = document.getElementById('symbolSearchInput');
    if (input) {
        input.value = '';
    }
    renderSymbolSuggestions(MARKET_SYMBOL_CATALOG.slice(0, 6));
}

function populateComparisonSelectors(symbols) {
    const primarySelect = document.getElementById('comparePrimarySymbol');
    const secondarySelect = document.getElementById('compareSecondarySymbol');
    if (!primarySelect || !secondarySelect) {
        return;
    }

    const options = symbols.length > 0 ? symbols : getSavedWatchlist();
    const optionMarkup = options.map((symbol) => `<option value="${symbol}">${symbol} - ${getDisplayNameForSymbol(symbol)}</option>`).join('');

    primarySelect.innerHTML = optionMarkup;
    secondarySelect.innerHTML = optionMarkup;

    primarySelect.value = options[0] || '';
    secondarySelect.value = options[1] || options[0] || '';
}

async function loadComparisonChart() {
    const primarySelect = document.getElementById('comparePrimarySymbol');
    const secondarySelect = document.getElementById('compareSecondarySymbol');
    const summary = document.getElementById('compareSummary');

    if (!primarySelect || !secondarySelect || !summary) {
        return;
    }

    const primarySymbol = primarySelect.value;
    const secondarySymbol = secondarySelect.value;

    if (!primarySymbol || !secondarySymbol) {
        summary.textContent = 'Choose two symbols first.';
        return;
    }

    if (primarySymbol === secondarySymbol) {
        summary.textContent = 'Pick two different symbols so the comparison tells you something useful.';
        return;
    }

    summary.textContent = 'Loading comparison chart...';

    try {
        const [primaryPoints, secondaryPoints] = await Promise.all([
            fetchHistorySeries(primarySymbol),
            fetchHistorySeries(secondarySymbol)
        ]);

        renderComparisonChart(primarySymbol, primaryPoints, secondarySymbol, secondaryPoints);
    } catch (error) {
        const chart = document.getElementById('comparisonChart');
        if (chart) {
            chart.className = 'market-chart-empty';
            chart.textContent = 'Comparison chart could not be loaded right now.';
        }
        summary.textContent = error.message || 'Comparison data is unavailable right now.';
    }
}

function loadInvestmentMarketPanel() {
    const input = document.getElementById('watchlistSymbols');
    if (!input) {
        return;
    }

    input.value = getSavedWatchlist().join(', ');
    clearSymbolSearch();
    const chartTitle = document.getElementById('chartTitle');
    if (chartTitle) {
        chartTitle.textContent = `${getDisplayNameForSymbol(getSavedWatchlist()[0])} trend`;
    }
    populateComparisonSelectors(getSavedWatchlist());
    updateRiskSuggestions();
    refreshInvestmentRecommendation();
    refreshMarketData();
}

// ====================================
// MODULE-SPECIFIC HELPERS
// ====================================

/**
 * Validate budgeting module input
 * Budget is balanced if income >= expenses
 * @param {number} income - Monthly income
 * @param {number} expenses - Monthly expenses
 * @returns {Object} Validation result
 */
function validateBudget(income, expenses) {
    if (!isValidPositiveNumber(income)) {
        return { valid: false, message: 'Income must be a positive number' };
    }
    if (!isValidNonNegativeNumber(expenses)) {
        return { valid: false, message: 'Expenses cannot be negative' };
    }
    
    const isBalanced = income >= expenses;
    return {
        valid: true,
        isBalanced: isBalanced,
        surplus: income - expenses
    };
}

/**
 * Validate saving goal
 * Goal is realistic if monthly surplus * 12 >= goal
 * @param {number} income - Monthly income
 * @param {number} expenses - Monthly expenses
 * @param {number} goal - Annual saving goal
 * @returns {Object} Validation result
 */
function validateSavingGoal(income, expenses, goal) {
    if (!isValidPositiveNumber(income) || !isValidPositiveNumber(goal)) {
        return { valid: false, message: 'Income and goal must be positive' };
    }
    if (!isValidNonNegativeNumber(expenses)) {
        return { valid: false, message: 'Expenses cannot be negative' };
    }

    const monthlySurplus = income - expenses;
    if (monthlySurplus <= 0) {
        return { 
            valid: false, 
            message: 'Monthly surplus is zero or negative. Balance your budget first.' 
        };
    }

    const maxAnnualSavings = monthlySurplus * 12;
    const isRealistic = goal <= maxAnnualSavings;

    return {
        valid: true,
        isRealistic: isRealistic,
        maxAnnualSavings: maxAnnualSavings,
        monthlyRequired: goal / 12
    };
}

/**
 * Validate expense transaction
 * Expense is valid if user has sufficient balance
 * @param {number} amount - Expense amount
 * @param {number} currentBalance - Current wallet balance
 * @returns {Object} Validation result
 */
function validateExpense(amount, currentBalance) {
    if (!isValidPositiveNumber(amount)) {
        return { valid: false, message: 'Amount must be positive' };
    }

    const newBalance = currentBalance - amount;
    const willOverspend = newBalance < 0;

    return {
        valid: true,
        willOverspend: willOverspend,
        newBalance: newBalance,
        remainingAmount: Math.abs(newBalance)
    };
}

// ====================================
// DATA EXPORT/IMPORT (For testing)
// ====================================

/**
 * Export user data as JSON (for backup/testing)
 * @returns {string} JSON string of user data
 */
function exportUserData() {
    const user = getCurrentUser();
    return user ? JSON.stringify(user, null, 2) : 'No user data';
}

/**
 * Import user data from JSON string
 * @param {string} jsonString - JSON string of user data
 * @returns {boolean} Success status
 */
function importUserData(jsonString) {
    try {
        const user = JSON.parse(jsonString);
        saveUser(user);
        return true;
    } catch (e) {
        console.error('Invalid JSON format');
        return false;
    }
}

// ====================================
// CONSOLE HELPERS (For debugging)
// ====================================

/**
 * Display current user data in console
 * Helpful for debugging
 */
function debugUser() {
    const user = getCurrentUser();
    console.log('Current User:', user);
    if (user) {
        console.log('Stats:', getGamificationStats(user));
        console.log('Next Milestone:', getNextMilestone(user.points));
    }
}

/**
 * Display AI recommendation in console
 */
function debugRecommendation() {
    const user = getCurrentUser();
    if (user) {
        console.log('Recommendation:', getAIRecommendation(user.points));
    }
}

// ====================================
// INITIALIZATION
// ====================================

/**
 * Run on page load to set up event listeners
 * This function should be called in each page's script section
 */
function initPage() {
    // Protect page if not logged in
    checkLogin();
}
