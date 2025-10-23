//backend
class CaptchaService {
  constructor() {
    this.captchas = new Map();
    this.expirationTime = 5 * 60 * 1000; // 5 minutes
  }

  generateCaptcha() {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const operators = ['+', '-', '*'];
    const operator = operators[Math.floor(Math.random() * operators.length)];
    
    let answer;
    switch (operator) {
      case '+':
        answer = num1 + num2;
        break;
      case '-':
        answer = num1 - num2;
        break;
      case '*':
        answer = num1 * num2;
        break;
    }

    const captchaId = this.generateId();
    const question = `${num1} ${operator} ${num2} = ?`;
    
    this.captchas.set(captchaId, {
      answer,
      createdAt: Date.now()
    });

    // Clean expired captchas
    this.cleanExpiredCaptchas();

    return {
      captchaId,
      question
    };
  }

  verifyCaptcha(captchaId, userAnswer) {
    const captcha = this.captchas.get(captchaId);

    if (!captcha) {
      return {
        valid: false,
        message: 'Captcha no encontrado o expirado'
      };
    }

    const isExpired = Date.now() - captcha.createdAt > this.expirationTime;
    if (isExpired) {
      this.captchas.delete(captchaId);
      return {
        valid: false,
        message: 'Captcha expirado'
      };
    }

    const isValid = parseInt(userAnswer) === captcha.answer;
    
    // Delete captcha after verification (one-time use)
    this.captchas.delete(captchaId);

    return {
      valid: isValid,
      message: isValid ? 'Captcha válido' : 'Respuesta incorrecta'
    };
  }

  generateId() {
    return `captcha_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  cleanExpiredCaptchas() {
    const now = Date.now();
    for (const [id, captcha] of this.captchas.entries()) {
      if (now - captcha.createdAt > this.expirationTime) {
        this.captchas.delete(id);
      }
    }
  }

  // Clean expired captchas every 10 minutes
  startCleanupInterval() {
    setInterval(() => {
      this.cleanExpiredCaptchas();
    }, 10 * 60 * 1000);
  }
}

const captchaService = new CaptchaService();
captchaService.startCleanupInterval();

module.exports = captchaService;