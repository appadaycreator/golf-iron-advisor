const fs = require('fs');

// index.htmlからJavaScriptコードを抽出
const htmlContent = fs.readFileSync('./index.html', 'utf8');

// script タグ内のコードを抽出
const scriptRegex = /<script(?:[^>]*)?>([\s\S]*?)<\/script>/gi;
let match;
let jsCode = '';
let scriptCount = 0;

console.log('🔍 JavaScriptコードの構文チェックを開始...\n');

while ((match = scriptRegex.exec(htmlContent)) !== null) {
    scriptCount++;
    const code = match[1].trim();
    
    if (code.length === 0) continue;
    
    // 外部スクリプトの場合はスキップ
    if (match[0].includes('src=') && !code) continue;
    
    console.log(`--- Script ${scriptCount} (${code.length} characters) ---`);
    
    try {
        // eval は危険ですが、構文チェックのためのみに使用
        new Function(code);
        console.log('✅ 構文OK');
    } catch (error) {
        console.log('❌ 構文エラー:', error.message);
        
        // エラーの詳細を表示
        const lines = code.split('\n');
        const errorLineNumber = parseInt(error.message.match(/line (\d+)/)?.[1]) || 1;
        
        console.log('問題の行:');
        for (let i = Math.max(0, errorLineNumber - 3); i < Math.min(lines.length, errorLineNumber + 2); i++) {
            const lineNum = i + 1;
            const prefix = lineNum === errorLineNumber ? '>>> ' : '    ';
            console.log(`${prefix}${lineNum}: ${lines[i]}`);
        }
        console.log('');
    }
}

console.log(`\n📊 総計: ${scriptCount} 個のスクリプトブロックをチェックしました。`);

// SVGデータのチェック
console.log('\n🎨 SVGデータの検証...');
const svgMatches = htmlContent.match(/data:image\/svg\+xml[^"']*/g);
if (svgMatches) {
    console.log(`SVGデータ URL: ${svgMatches.length} 個見つかりました`);
    
    // 最初の3つをテスト
    svgMatches.slice(0, 3).forEach((svg, index) => {
        try {
            // URL デコードしてSVGとして検証
            const decodedSvg = decodeURIComponent(svg.replace('data:image/svg+xml,', ''));
            
            // 基本的なSVG構文チェック
            if (decodedSvg.includes('<svg') && decodedSvg.includes('</svg>')) {
                console.log(`✅ SVG ${index + 1}: 有効`);
            } else {
                console.log(`❌ SVG ${index + 1}: 無効な構造`);
            }
        } catch (error) {
            console.log(`❌ SVG ${index + 1}: ${error.message}`);
        }
    });
} else {
    console.log('SVGデータが見つかりませんでした');
}

console.log('\n✅ 構文チェック完了!'); 