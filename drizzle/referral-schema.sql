-- Referral Program Schema
-- Tracks installer referrals and rewards

CREATE TABLE IF NOT EXISTS referrals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  referrerId INT NOT NULL,
  referredId INT NOT NULL,
  referralCode VARCHAR(50) NOT NULL UNIQUE,
  status ENUM('pending', 'completed', 'rewarded') DEFAULT 'pending',
  rewardAmount DECIMAL(10,2) DEFAULT 100.00,
  rewardCredited BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completedAt TIMESTAMP NULL,
  rewardedAt TIMESTAMP NULL,
  FOREIGN KEY (referrerId) REFERENCES installers(id),
  FOREIGN KEY (referredId) REFERENCES installers(id),
  INDEX idx_referrer (referrerId),
  INDEX idx_code (referralCode),
  INDEX idx_status (status)
);

CREATE TABLE IF NOT EXISTS installer_credits (
  id INT AUTO_INCREMENT PRIMARY KEY,
  installerId INT NOT NULL,
  amount DECIMAL(10,2) DEFAULT 0.00,
  source ENUM('referral', 'bonus', 'refund', 'promo') NOT NULL,
  description TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expiresAt TIMESTAMP NULL,
  FOREIGN KEY (installerId) REFERENCES installers(id),
  INDEX idx_installer (installerId)
);
