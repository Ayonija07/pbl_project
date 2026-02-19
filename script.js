

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
    alert(`🎉 Success! You earned ${points} points and the "${badgeName}" badge!\n\n${tip}`);
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
