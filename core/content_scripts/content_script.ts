window.addEventListener('load', async () => {
    // console.log("title解析開始2");

    const title = document.head.getElementsByTagName("title")[0]
    if (title.innerHTML != "履修登録・登録状況照会") {
        return;
    }
    // console.log("target 変更開始")

    // 全体table取得
    const target_tables = document.getElementsByTagName("table")[2];

    // コマtable取得
    const koma_table = target_tables.querySelector(".rishu-koma")!.getElementsByTagName("tbody")[0]
    // const etc_koma_table = target_tables.querySelector(".rishu-etc")!.getElementsByTagName("tbody")[0].getElementsByTagName("tr")[2]

    // コマtableを各時限ごとに配列化 (0行目は曜日なので捨てる)
    const [_, ...period_rows] = Array.from(koma_table!.children)
    // const start = performance.now();
    const seenLectureCodes = new Set<string>();
    period_rows.forEach(element => {
        const tables = element.getElementsByClassName("rishu-koma-inner")

        Array.from(tables).forEach(async table => {
            const data = table as HTMLElement

            // 授業コード取得
            const innerText = data.innerText;
            let innerTexts = innerText.split("\n").map(text => text.replace(/追加登録/g, ''));
            innerTexts = innerTexts.filter(text => text !== '');
            const lectureCodes = innerTexts.length <= 3 ? [innerTexts[0]] : [innerTexts[0], innerTexts[3]];
            console.log(lectureCodes)

            if (lectureCodes[0] == "未登録") { return; }

            for (const lectureCode of lectureCodes) {
                if (!seenLectureCodes.has(lectureCode)) {
                    seenLectureCodes.add(lectureCode);
                    // 未登録以外の場合、単位数を取得し挿入
                    const credits = await getCredits(lectureCode);
                    if (typeof credits === "string") {
                        console.error(credits);
                        return;
                    }
                    insertCredits(data, credits, lectureCodes.length >= 2 && lectureCodes.indexOf(lectureCode) === 0);
                } else {
                    // すでに単位数を取得済みの場合、空にする
                    clearCredits(data);
                }
            }
        })
    })

    // console.log("処理時間（秒）", (performance.now() - start) / 1000);
})

async function getCredits(lectureCode: string): Promise<number | string> {
    /**
     * 授業コードから単位数を取得する
     * 
     * @param {string} lectureCode - 授業コード
     * @returns {number | string} - 単位数 | エラーメッセージ
     */
    const url = `https://tut-syllabus-api.pages.dev/api/v1/all/${lectureCode}.json`
    try {
        const response = await fetch(url);
        const data = await response.json();
        const credits = data["numberOfCredits"];
        return credits;
    } catch (error) {
        if (error instanceof Error) {
            return error.message;
        } else {
            return String(error);
        }
    }
}

function insertCredits(element: HTMLElement, credits: number, quarter: boolean = false) {
    /**
     * 単位数を挿入する
     * クォーター制等の物には区切り線を挿入できるオプション有り
     * 
     * @param {HTMLElement} element - 挿入対象のHTML要素
     * @param {number} credits - 挿入する単位数
     * @param {boolean} quarter - quarterの場合true
     */

    const creditText = `- ${credits}単位`;
    if (quarter) {
        const targetElement = element.getElementsByTagName('td')[0]
        const lines = targetElement.innerHTML.split('<br>');
        lines.splice(3, 0, creditText, '----------');
        targetElement.innerHTML = lines.join('<br>');
    } else {
        const targetElement = element.getElementsByTagName('td')[0]
        targetElement.innerHTML += `<br>${creditText}`;
    }
}

function clearCredits(element: HTMLElement) {
    /**
     * 単位数をクリアする
     * 
     * @param {HTMLElement} element - クリア対象のHTML要素
     */
    element.innerText = "〃";
}