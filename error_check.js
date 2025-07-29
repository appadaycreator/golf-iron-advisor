const puppeteer = require('puppeteer');

async function checkConsoleErrors() {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    const errors = [];
    const warnings = [];
    
    // コンソールメッセージをキャプチャ
    page.on('console', (msg) => {
        const type = msg.type();
        const text = msg.text();
        
        if (type === 'error') {
            errors.push(text);
            console.log('❌ ERROR:', text);
        } else if (type === 'warning') {
            warnings.push(text);
            console.log('⚠️  WARNING:', text);
        }
    });
    
    // JavaScriptエラーをキャプチャ
    page.on('pageerror', (error) => {
        errors.push(error.message);
        console.log('❌ JS ERROR:', error.message);
    });
    
    try {
        console.log('🔍 Loading http://localhost:8000...');
        await page.goto('http://localhost:8000', { waitUntil: 'networkidle0', timeout: 10000 });
        
        // ページが完全に読み込まれるまで少し待つ
        await page.waitForTimeout(2000);
        
        console.log('\n📊 Error Summary:');
        console.log(`Errors: ${errors.length}`);
        console.log(`Warnings: ${warnings.length}`);
        
        if (errors.length > 0) {
            console.log('\n🔴 Errors found:');
            errors.forEach((error, index) => {
                console.log(`${index + 1}. ${error}`);
            });
        } else {
            console.log('\n✅ No errors found!');
        }
        
        return { errors, warnings };
        
    } catch (error) {
        console.error('Failed to load page:', error.message);
        return { errors: [error.message], warnings };
    } finally {
        await browser.close();
    }
}

checkConsoleErrors().catch(console.error); 