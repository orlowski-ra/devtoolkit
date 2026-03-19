// Navigation
document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tool-panel').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(btn.dataset.tool + '-panel').classList.add('active');
    });
});

// Toast notification
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
}

// Copy to clipboard
async function copyOutput(elementId) {
    const element = document.getElementById(elementId);
    let text = element.textContent || element.value;
    
    // For JSON output, get the raw text without HTML tags
    if (elementId === 'json-output') {
        const input = document.getElementById('json-input').value;
        try {
            const parsed = JSON.parse(input);
            text = JSON.stringify(parsed, null, 2);
        } catch(e) {
            text = element.textContent;
        }
    }
    
    // For markdown, get HTML source
    if (elementId === 'markdown-html') {
        text = document.getElementById('markdown-preview').innerHTML;
    }
    
    try {
        await navigator.clipboard.writeText(text);
        showToast('Copied to clipboard!');
    } catch (err) {
        showToast('Failed to copy');
    }
}

// Clear inputs
function clearAll(inputId, outputId) {
    document.getElementById(inputId).value = '';
    const output = document.getElementById(outputId);
    if (output) {
        if (output.tagName === 'PRE' || output.tagName === 'DIV') {
            output.innerHTML = '';
        } else {
            output.value = '';
        }
    }
    document.querySelectorAll('.error-message').forEach(e => {
        e.classList.remove('show');
        e.textContent = '';
    });
}

// ==================== JSON TOOLS ====================

function formatJSON() {
    const input = document.getElementById('json-input').value;
    const output = document.getElementById('json-output');
    const error = document.getElementById('json-error');
    
    if (!input.trim()) {
        error.textContent = 'Please enter some JSON';
        error.classList.add('show');
        return;
    }
    
    try {
        const parsed = JSON.parse(input);
        const formatted = JSON.stringify(parsed, null, 2);
        output.innerHTML = syntaxHighlightJSON(formatted);
        error.classList.remove('show');
    } catch (e) {
        error.textContent = 'Invalid JSON: ' + e.message;
        error.classList.add('show');
    }
}

function minifyJSON() {
    const input = document.getElementById('json-input').value;
    const output = document.getElementById('json-output');
    const error = document.getElementById('json-error');
    
    if (!input.trim()) {
        error.textContent = 'Please enter some JSON';
        error.classList.add('show');
        return;
    }
    
    try {
        const parsed = JSON.parse(input);
        const minified = JSON.stringify(parsed);
        output.textContent = minified;
        error.classList.remove('show');
    } catch (e) {
        error.textContent = 'Invalid JSON: ' + e.message;
        error.classList.add('show');
    }
}

function syntaxHighlightJSON(json) {
    return json.replace(/(".*?")|(\b\d+\b)|(true|false|null)|([{}[\],])/g, match => {
        if (match.startsWith('"')) {
            const colonIndex = match.indexOf('":');
            if (colonIndex !== -1) {
                return `<span class="json-key">${match.substring(0, colonIndex + 1)}</span><span class="json-string">${match.substring(colonIndex + 1)}</span>`;
            }
            return `<span class="json-string">${match}</span>`;
        }
        if (/^\d+$/.test(match)) return `<span class="json-number">${match}</span>`;
        if (/^(true|false)$/.test(match)) return `<span class="json-boolean">${match}</span>`;
        if (match === 'null') return `<span class="json-null">${match}</span>`;
        return match;
    });
}

// ==================== BASE64 TOOLS ====================

function encodeBase64() {
    const input = document.getElementById('base64-input').value;
    const output = document.getElementById('base64-output');
    const error = document.getElementById('base64-error');
    
    if (!input) {
        error.textContent = 'Please enter text to encode';
        error.classList.add('show');
        return;
    }
    
    try {
        output.value = btoa(unescape(encodeURIComponent(input)));
        error.classList.remove('show');
    } catch (e) {
        error.textContent = 'Encoding error: ' + e.message;
        error.classList.add('show');
    }
}

function decodeBase64() {
    const input = document.getElementById('base64-output').value;
    const output = document.getElementById('base64-input');
    const error = document.getElementById('base64-error');
    
    if (!input) {
        error.textContent = 'Please enter Base64 to decode';
        error.classList.add('show');
        return;
    }
    
    try {
        output.value = decodeURIComponent(escape(atob(input)));
        error.classList.remove('show');
    } catch (e) {
        error.textContent = 'Invalid Base64: ' + e.message;
        error.classList.add('show');
    }
}

// ==================== URL TOOLS ====================

function encodeURL() {
    const input = document.getElementById('url-input').value;
    const output = document.getElementById('url-output');
    
    if (!input) return;
    output.value = encodeURIComponent(input);
}

function decodeURL() {
    const input = document.getElementById('url-output').value;
    const output = document.getElementById('url-input');
    
    if (!input) return;
    try {
        output.value = decodeURIComponent(input);
    } catch (e) {
        showToast('Invalid URL encoding');
    }
}

// ==================== MARKDOWN TOOLS ====================

const markdownInput = document.getElementById('markdown-input');
const markdownPreview = document.getElementById('markdown-preview');

function parseMarkdown(text) {
    // Escape HTML
    text = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    
    // Headers
    text = text.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    text = text.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    text = text.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    
    // Bold and Italic
    text = text.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
    text = text.replace(/__(.*?)__/g, '<strong>$1</strong>');
    text = text.replace(/_(.*?)_/g, '<em>$1</em>');
    
    // Inline code
    text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Code blocks
    text = text.replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>');
    
    // Blockquotes
    text = text.replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>');
    
    // Links
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
    
    // Images
    text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img alt="$1" src="$2">');
    
    // Unordered lists
    text = text.replace(/^\- (.*$)/gim, '<li>$1</li>');
    text = text.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');
    text = text.replace(/<\/ul>\n?<ul>/g, '');
    
    // Ordered lists
    text = text.replace(/^\d+\. (.*$)/gim, '<li>$1</li>');
    text = text.replace(/(<li>.*<\/li>\n?)+/gs, function(match) {
        if (match.includes('<ul>')) return match;
        return '<ol>' + match + '</ol>';
    });
    
    // Horizontal rule
    text = text.replace(/^\-\-\-+/gim, '<hr>');
    
    // Tables
    text = text.replace(/\|(.+)\|/g, function(match, content) {
        const cells = content.split('|').map(c => c.trim());
        return '<tr>' + cells.map(c => `<td>${c}</td>`).join('') + '</tr>';
    });
    text = text.replace(/(<tr>.*<\/tr>\n?){2,}/g, '<table>$&</table>');
    text = text.replace(/<tr><td>([^<]+)<\/td><\/tr>/g, '<tr><th>$1</th></tr>');
    
    // Line breaks
    text = text.replace(/\n/g, '<br>');
    
    return text;
}

if (markdownInput) {
    markdownInput.addEventListener('input', () => {
        markdownPreview.innerHTML = parseMarkdown(markdownInput.value);
    });
}

// ==================== COLOR TOOLS ====================

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function getLuminance(r, g, b) {
    const rsRGB = r / 255;
    const gsRGB = g / 255;
    const bsRGB = b / 255;
    
    const rLinear = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
    const gLinear = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
    const bLinear = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);
    
    return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
}

function getContrastRatio(l1, l2) {
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
}

function updateContrast() {
    const bgColor = document.getElementById('bg-color').value;
    const textColor = document.getElementById('text-color').value;
    
    document.getElementById('bg-color-text').value = bgColor;
    document.getElementById('text-color-text').value = textColor;
    
    const preview = document.getElementById('contrast-preview');
    preview.style.backgroundColor = bgColor;
    preview.style.color = textColor;
    
    const bgRgb = hexToRgb(bgColor);
    const textRgb = hexToRgb(textColor);
    
    const bgLuminance = getLuminance(bgRgb.r, bgRgb.g, bgRgb.b);
    const textLuminance = getLuminance(textRgb.r, textRgb.g, textRgb.b);
    
    const ratio = getContrastRatio(bgLuminance, textLuminance);
    const ratioFixed = ratio.toFixed(2);
    
    document.getElementById('contrast-ratio').textContent = ratioFixed + ':1';
    
    // WCAG checks
    const aaNormal = ratio >= 4.5;
    const aaLarge = ratio >= 3;
    const aaaNormal = ratio >= 7;
    const aaaLarge = ratio >= 4.5;
    
    updateBadge('wcag-aa-normal', aaNormal);
    updateBadge('wcag-aa-large', aaLarge);
    updateBadge('wcag-aaa-normal', aaaNormal);
    updateBadge('wcag-aaa-large', aaaLarge);
    
    // Update ratio color
    const ratioEl = document.getElementById('contrast-ratio');
    if (aaaNormal) {
        ratioEl.style.color = 'var(--success)';
    } else if (aaNormal) {
        ratioEl.style.color = 'var(--warning)';
    } else {
        ratioEl.style.color = 'var(--danger)';
    }
}

function updateBadge(id, pass) {
    const badge = document.getElementById(id);
    const status = badge.querySelector('.badge-status');
    status.textContent = pass ? '✓ Pass' : '✗ Fail';
    status.className = 'badge-status ' + (pass ? 'pass' : 'fail');
}

function updateColorFromText(type) {
    const textInput = document.getElementById(type + '-color-text');
    const colorInput = document.getElementById(type + '-color');
    let value = textInput.value;
    
    if (!value.startsWith('#')) {
        value = '#' + value;
    }
    
    if (/^#[0-9A-F]{6}$/i.test(value)) {
        colorInput.value = value.toLowerCase();
        updateContrast();
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateContrast();
});
