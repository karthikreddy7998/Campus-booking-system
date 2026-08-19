const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  
  if (!fs.existsSync('screenshots')) {
    fs.mkdirSync('screenshots');
  }

  try {
    // 1. Home / Login Page
    await page.goto('http://localhost:3000/login');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'screenshots/1_login.png' });

    // 2. Register Page
    await page.goto('http://localhost:3000/register');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'screenshots/2_register.png' });

    // Register an admin user
    await page.fill('input[type="text"]', 'Admin User');
    await page.fill('input[type="email"]', 'admin@admin.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000); // Wait for register to complete

    // Login as admin
    await page.goto('http://localhost:3000/login');
    await page.waitForTimeout(1000);
    await page.fill('input[type="email"]', 'admin@admin.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);

    // 3. Admin Dashboard
    await page.screenshot({ path: 'screenshots/3_admin_dashboard.png' });

    // Navigate to Admin Rooms if available
    await page.goto('http://localhost:3000/admin/rooms');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'screenshots/4_admin_rooms.png' });

    // Logout (we can just clear cookies or goto login)
    await page.context().clearCookies();

    // Register a student user
    await page.goto('http://localhost:3000/register');
    await page.waitForTimeout(1000);
    await page.fill('input[type="text"]', 'Student User');
    await page.fill('input[type="email"]', 'student@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000); // Wait for register to complete

    // Login as student
    await page.goto('http://localhost:3000/login');
    await page.waitForTimeout(1000);
    await page.fill('input[type="email"]', 'student@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);

    // 5. Student Dashboard
    await page.screenshot({ path: 'screenshots/5_student_dashboard.png' });

    console.log("Screenshots saved successfully.");
  } catch (err) {
    console.error(err);
  } finally {
    await browser.close();
  }
})();
