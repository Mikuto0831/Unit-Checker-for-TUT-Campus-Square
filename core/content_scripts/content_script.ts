// Campus Square Shortcut Links Extension
// 東京工科大学 Campus Square ポータルページ用ショートカットリンク機能

console.log('Campus Square Shortcut Links Extension loaded');

// 重複実行防止フラグ
let extensionInitialized = false;

// 複数のイベントでページ読み込みを検出
function initializeExtension(): void {
    console.log('Initializing extension...');
    console.log('Document readyState:', document.readyState);
    console.log('Window location:', window.location.href);

    // ページが完全に読み込まれるまで少し待つ
    setTimeout(() => {
        try {
            checkAndInjectShortcuts();
        } catch (error) {
            console.error('Error during shortcut injection:', error);
        }
    }, 1000);
}

// DOMContentLoadedイベント
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeExtension);
} else {
    // すでに読み込み完了している場合
    initializeExtension();
}

// ページ読み込み完了後にも実行（フォールバック）
window.addEventListener('load', initializeExtension);

/**
 * ページをチェックしてショートカットを挿入する
 */
function checkAndInjectShortcuts(): void {
    // 重複実行防止
    if (extensionInitialized) {
        console.log('Extension already initialized, skipping');
        return;
    }

    // すでにショートカットが挿入されているかチェック
    if (document.getElementById('campus-shortcuts-container')) {
        console.log('Shortcuts already injected, skipping');
        extensionInitialized = true;
        return;
    }

    // HOMEページかどうかを確認（より安全な方法）
    const title = getPageTitle();
    console.log('Page title:', title);

    if (title !== "HOME") {
        console.log('Not HOME page, skipping shortcut injection');
        return;
    }

    console.log('HOME page detected, starting shortcut links injection...');
    extensionInitialized = true;
    injectShortcutLinks();
}

/**
 * ページタイトルを安全に取得する
 */
function getPageTitle(): string {
    // 複数の方法でタイトルを取得を試行
    try {
        // 方法1: document.title
        if (document.title) {
            return document.title;
        }

        // 方法2: document.head経由
        if (document.head) {
            const titleElement = document.head.getElementsByTagName("title")[0];
            if (titleElement && titleElement.innerHTML) {
                return titleElement.innerHTML;
            }
        }

        // 方法3: querySelector
        const titleElement = document.querySelector('title');
        if (titleElement && titleElement.textContent) {
            return titleElement.textContent;
        }

        // 方法4: getElementsByTagName（全体から検索）
        const titleElements = document.getElementsByTagName('title');
        if (titleElements.length > 0 && titleElements[0].textContent) {
            return titleElements[0].textContent;
        }
    } catch (error) {
        console.warn('Error getting title:', error);
    }

    return '';
}

/**
 * ショートカットリンクを注入する
 */
function injectShortcutLinks(): void {
    console.log('Injecting shortcut links...');

    // 対象要素を検索
    const targetElement = findTargetElement();

    if (!targetElement) {
        console.error('Target element not found');
        return;
    }

    console.log('Target element found:', {
        id: targetElement.id,
        className: targetElement.className,
        children: targetElement.children.length
    });

    // ショートカットリンクコンテナを作成
    const shortcutsContainer = createShortcutsContainer();

    let insertionSuccessful = false;

    // area-h1-parent内での挿入位置を決定
    if (targetElement.id === 'area-h1-parent') {
        console.log('Injecting into area-h1-parent');

        // 方法1: area-h1 (portalarea) の直前に挿入
        const areaH1 = targetElement.querySelector('#area-h1');
        if (areaH1) {
            targetElement.insertBefore(shortcutsContainer, areaH1);
            console.log('Shortcut links injected before area-h1');
            insertionSuccessful = true;
        } else {
            // 方法2: portalarea クラスの要素の直前に挿入
            const portalArea = targetElement.querySelector('.portalarea');
            if (portalArea) {
                targetElement.insertBefore(shortcutsContainer, portalArea);
                console.log('Shortcut links injected before portalarea');
                insertionSuccessful = true;
            } else {
                // 方法3: 最初の子要素として挿入
                if (targetElement.firstElementChild) {
                    targetElement.insertBefore(shortcutsContainer, targetElement.firstElementChild);
                    console.log('Shortcut links injected as first child of area-h1-parent');
                    insertionSuccessful = true;
                } else {
                    targetElement.appendChild(shortcutsContainer);
                    console.log('Shortcut links appended to area-h1-parent');
                    insertionSuccessful = true;
                }
            }
        }
    } else {
        // その他の要素での従来のロジック
        console.log('Injecting into non-area-h1-parent element');

        // 方法1: func-page-header の直前に挿入
        const funcPageHeader = targetElement.querySelector('#func-page-header');
        if (funcPageHeader) {
            targetElement.insertBefore(shortcutsContainer, funcPageHeader);
            console.log('Shortcut links injected before func-page-header');
            insertionSuccessful = true;
        } else {
            // 方法2: main-func-body の直前に挿入
            const mainFuncBody = targetElement.querySelector('#main-func-body');
            if (mainFuncBody) {
                targetElement.insertBefore(shortcutsContainer, mainFuncBody);
                console.log('Shortcut links injected before main-func-body');
                insertionSuccessful = true;
            } else {
                // 方法3: 最初の子要素として挿入
                if (targetElement.firstElementChild) {
                    targetElement.insertBefore(shortcutsContainer, targetElement.firstElementChild);
                    console.log('Shortcut links injected as first child');
                    insertionSuccessful = true;
                } else {
                    // 方法4: 最後の手段 - appendChild
                    targetElement.appendChild(shortcutsContainer);
                    console.log('Shortcut links appended to target element');
                    insertionSuccessful = true;
                }
            }
        }
    }

    if (insertionSuccessful) {
        console.log('Shortcut links injection completed successfully');
        // リンクにイベントリスナーを追加
        attachLinkEventListeners();
    } else {
        console.error('Failed to inject shortcut links');
    }
}

/**
 * 対象要素を検索する
 */
function findTargetElement(): Element | null {
    try {
        // document.bodyが存在するかチェック
        if (!document.body) {
            console.warn('document.body is not available');
            return null;
        }

        console.log('Searching for target element...');

        // 方法1: area-h1-parent を直接検索（推奨）
        const areaH1Parent = document.querySelector('#area-h1-parent');
        if (areaH1Parent) {
            console.log('area-h1-parent found - ideal location for shortcuts');
            return areaH1Parent;
        }

        // 方法2: area-h1-parent のクラス名で検索
        const areaH1ParentByClass = document.querySelector('.col.s12.auto-div-1-1-1');
        if (areaH1ParentByClass && areaH1ParentByClass.id === 'area-h1-parent') {
            console.log('area-h1-parent found via class selector');
            return areaH1ParentByClass;
        }

        // 方法3: メインコンテンツエリアを直接検索（フォールバック）
        const mainElement = document.querySelector('main#page-main .container');
        if (mainElement) {
            console.log('Main container found, searching within...');

            // メインコンテナ内でarea-h1-parentを検索
            const areaH1ParentInMain = mainElement.querySelector('#area-h1-parent');
            if (areaH1ParentInMain) {
                console.log('area-h1-parent found within main container');
                return areaH1ParentInMain;
            }

            // メインコンテナ内のcol s12要素を検索
            const contentAreas = mainElement.querySelectorAll('.col.s12');
            console.log(`Found ${contentAreas.length} col s12 elements in main container`);

            for (let i = 0; i < contentAreas.length; i++) {
                const element = contentAreas[i] as HTMLElement;
                console.log(`Checking element ${i + 1}:`, {
                    id: element.id,
                    className: element.className,
                    hasChildren: element.children.length > 0
                });

                // area-h1-parent または類似の構造を探す
                if (element.id === 'area-h1-parent' ||
                    (element.id.includes('area-h') && element.classList.contains('auto-div'))) {
                    console.log('Area-h parent-like element found');
                    return element;
                }
            }
        }

        // 方法4: body直下のcontainerから検索
        console.log('Trying body container search...');
        const bodyContainers = document.querySelectorAll('body .container');
        for (let i = 0; i < bodyContainers.length; i++) {
            const container = bodyContainers[i];

            // まずarea-h1-parentを探す
            const areaH1ParentInBody = container.querySelector('#area-h1-parent');
            if (areaH1ParentInBody) {
                console.log('area-h1-parent found via body container search');
                return areaH1ParentInBody;
            }

            const colElements = container.querySelectorAll('.col.s12');
            for (let j = 0; j < colElements.length; j++) {
                const element = colElements[j] as HTMLElement;
                if (!element.closest('#sidebar-nav') &&
                    !element.id.includes('sidenav') &&
                    element.children.length > 0) {
                    console.log('Content area found via body search');
                    return element;
                }
            }
        }

        // 方法5: 最終フォールバック - 最初の適切なcol s12要素を使用
        console.log('Using fallback search...');
        const allColElements = document.querySelectorAll('.col.s12');
        console.log(`Found ${allColElements.length} total col s12 elements`);

        for (let i = 0; i < allColElements.length; i++) {
            const element = allColElements[i] as HTMLElement;
            if (!element.closest('#sidebar-nav') &&
                !element.id.includes('sidenav') &&
                element.children.length > 0) {
                console.log('Using fallback element');
                return element;
            }
        }

        console.warn('No suitable target element found');

    } catch (error) {
        console.error('Error in findTargetElement:', error);
    }

    return null;
}

/**
 * ショートカットリンクコンテナを作成する
 */
function createShortcutsContainer(): HTMLElement {
    const container = document.createElement('div');
    container.id = 'campus-shortcuts-container';
    container.className = 'col s12 no-margin no-padding';

    // area-h1-parent内での配置に適したスタイリング
    container.style.cssText = `
        position: relative !important;
        z-index: 1000 !important;
        background: white !important;
        margin: 0 0 20px 0 !important;
        padding: 20px !important;
        border-radius: 8px !important;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1) !important;
        border: 1px solid #e0e0e0 !important;
        order: -1 !important;
    `;

    container.innerHTML = `
        <div class="shortcuts-wrapper" style="position: relative;">
            <div class="shortcuts-title" style="margin-bottom: 20px; color: #1976d2; font-weight: bold; font-size: 18px; text-align: center;">
                <i class="fas fa-rocket" style="margin-right: 10px; color: #ff6b35;"></i>
                <span>クイックアクセス</span>
            </div>
            
            <div class="shortcuts-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
                <!-- 教務/授業関連 -->
                <div class="shortcut-category" style="background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%); padding: 18px; border-radius: 8px; border: 1px solid #ddd;">
                    <h6 class="category-title" style="margin: 0 0 15px 0; color: #1976d2; font-size: 16px; font-weight: bold; text-align: center;">📚 教務/授業関連</h6>
                    <div class="shortcut-links" style="display: flex; flex-direction: column; gap: 10px;">
                        ${createCampusSquareLink('SBW3701300-flow', 'SBW3701300', 'シラバス参照', 'fas fa-search')}
                        ${createCampusSquareLink('RSW0001000-flow', 'RSW0001000', '履修登録・登録状況照会', 'fas fa-edit')}
                        ${createCampusSquareLink('SIW0001300-flow', 'SIW0001300', '単位修得状況照会', 'fas fa-search')}
                    </div>
                </div>
                
                <!-- 学生生活 -->
                <div class="shortcut-category" style="background: linear-gradient(135deg, #f3e5f5 0%, #e8f5e8 100%); padding: 18px; border-radius: 8px; border: 1px solid #ddd;">
                    <h6 class="category-title" style="margin: 0 0 15px 0; color: #388e3c; font-size: 16px; font-weight: bold; text-align: center;">🎓 学生生活</h6>
                    <div class="shortcut-links" style="display: flex; flex-direction: column; gap: 10px;">
                        ${createCampusSquareLink('CHW0001000-flow', 'CHW0001000', '学生ポートフォリオ', 'fas fa-address-card')}
                    </div>
                </div>
            </div>
        </div>
    `;

    return container;
}

/**
 * Campus Square形式のショートカットリンクを作成する
 */
function createCampusSquareLink(flowId: string, funcId: string, title: string, icon: string): string {
    // リンクIDを生成（例: menu-link-shortcut-123456）
    const linkId = `menu-link-shortcut-${Math.random().toString(36).substr(2, 6)}`;

    return `
        <a class="shortcut-link campus-square-link" 
           id="${linkId}" 
           href="https://kyo-web.teu.ac.jp/campusweb/campussquare.do?_flowId=${flowId}&link=${linkId}" 
           title="${title}" 
           data-func="${funcId}"
           data-flow-id="${flowId}"
           role="button"
           tabindex="0"
           style="
               display: flex !important;
               align-items: center !important;
               padding: 12px 16px !important;
               background: white !important;
               border: 2px solid #e0e0e0 !important;
               border-radius: 6px !important;
               text-decoration: none !important;
               color: #333 !important;
               cursor: pointer !important;
               pointer-events: auto !important;
               transition: all 0.2s ease !important;
               font-size: 14px !important;
               font-weight: 500 !important;
               position: relative !important;
               z-index: 1001 !important;
           "
           onmouseover="this.style.background='#f5f5f5'; this.style.borderColor='#1976d2'; this.style.transform='translateY(-1px)'; this.style.boxShadow='0 4px 8px rgba(0,0,0,0.15)';"
           onmouseout="this.style.background='white'; this.style.borderColor='#e0e0e0'; this.style.transform='translateY(0)'; this.style.boxShadow='none';">
            <i class="${icon}" style="
                margin-right: 12px !important;
                color: #1976d2 !important;
                font-size: 16px !important;
                pointer-events: none !important;
                width: 20px !important;
                text-align: center !important;
            "></i>
            <span class="menunm" style="
                pointer-events: none !important;
                flex: 1 !important;
                white-space: nowrap !important;
                overflow: hidden !important;
                text-overflow: ellipsis !important;
            ">${title}</span>
        </a>
    `;
}

/**
 * リンクにイベントリスナーを追加する
 */
function attachLinkEventListeners(): void {
    console.log('Attaching event listeners to shortcut links...');

    // 少し遅延を追加してDOM要素が確実に作成されるのを待つ
    setTimeout(() => {
        const links = document.querySelectorAll('.campus-square-link');
        console.log(`Found ${links.length} shortcut links`);

        links.forEach((link, index) => {
            const linkElement = link as HTMLAnchorElement;
            console.log(`Processing link ${index + 1}: ${linkElement.title}`);

            // 複数のイベントを追加して確実にキャッチ
            ['click', 'mousedown'].forEach(eventType => {
                linkElement.addEventListener(eventType, (event) => {
                    console.log(`${eventType} event triggered on: ${linkElement.title}`);

                    if (eventType === 'click') {
                        event.preventDefault();
                        event.stopPropagation();

                        const flowId = linkElement.getAttribute('data-flow-id');
                        const linkId = linkElement.id;

                        console.log(`Flow ID: ${flowId}, Link ID: ${linkId}`);

                        if (flowId && linkId) {
                            console.log(`Attempting to navigate to: ${flowId}`);

                            // 複数の方法で遷移を試行
                            const baseUrl = 'https://kyo-web.teu.ac.jp/campusweb/campussquare.do';
                            const url = `${baseUrl}?_flowId=${flowId}&link=${linkId}`;

                            console.log(`Full URL: ${url}`);

                            try {
                                // 方法1: location.href
                                console.log('Trying location.href...');
                                window.location.href = url;
                            } catch (error1) {
                                console.error('location.href failed:', error1);

                                try {
                                    // 方法2: location.assign
                                    console.log('Trying location.assign...');
                                    window.location.assign(url);
                                } catch (error2) {
                                    console.error('location.assign failed:', error2);

                                    try {
                                        // 方法3: window.open で現在のタブに
                                        console.log('Trying window.open...');
                                        window.open(url, '_self');
                                    } catch (error3) {
                                        console.error('window.open failed:', error3);

                                        // 最後の手段: 新しいタブで開く
                                        console.log('Opening in new tab...');
                                        window.open(url, '_blank');
                                    }
                                }
                            }
                        } else {
                            console.error('Flow ID or Link ID not found:', {
                                flowId, linkId,
                                attributes: Array.from(linkElement.attributes).map(attr => `${attr.name}: ${attr.value}`)
                            });
                        }
                    }
                }, true); // キャプチャフェーズで実行
            });

            // マウスオーバー時のデバッグ
            linkElement.addEventListener('mouseover', () => {
                console.log(`Mouse over: ${linkElement.title}`);
            });
        });

        console.log(`Event listeners attached to ${links.length} links`);
    }, 100);
}

/**
 * 個別のショートカットリンクを作成する（従来版・フォールバック用）
 */
function createShortcutLink(url: string, title: string, icon: string): string {
    return `
        <a href="${url}" class="shortcut-link" title="${title}">
            <i class="${icon}"></i>
            <span>${title}</span>
        </a>
    `;
}