window.addEventListener('load', async () => {
    console.log("title解析開始2");

    const title = document.head.getElementsByTagName("title")[0]
    if (title.innerHTML != "履修登録・登録状況照会") {
        return;
    }
    console.log("target 変更開始")

    // 全体table取得
    const target_tables = document.getElementsByTagName("table")[2];

    // コマtable取得
    const koma_table = target_tables.querySelector(".rishu-koma")!.getElementsByTagName("tbody")[0]

    // コマtableを各時限ごとに配列化 (0行目は曜日なので捨てる)
    const [_, ...period_rows] = Array.from(koma_table!.children)
    const start = performance.now();
    const seenLectureCodes = new Set<string>();
    period_rows.forEach(element => {
        const tables = element.getElementsByClassName("rishu-koma-inner")

        Array.from(tables).forEach(table => {
            const data = table as HTMLElement

            // 授業コード取得
            const lectureCode = data.innerText.split("\n")[0]

            if (lectureCode == "未登録") { return; }
            
            if (!seenLectureCodes.has(lectureCode)) {
                seenLectureCodes.add(lectureCode);
                // 未登録以外の場合、単位数を取得し挿入
                getCredits(data, lectureCode);
                // insertCredits(data, credits);
            } else {
                // すでに単位数を取得済みの場合、空にする
                clearCredits(data);
            }
        })
        console.log(seenLectureCodes)
    })
    console.log("処理時間（秒）", (performance.now() - start) / 1000);
})

async function getCredits(element: HTMLElement,lectureCode: string){
    /**
     * 授業コードから単位数を取得する
     * 
     * @param {string} lectureCode - 授業コード
     * @return {number} - 単位数
     */
    const url = `https://tut-syllabus-api.pages.dev/api/v1/all/${lectureCode}.json`
    try {
        const response = await fetch(url);
        const data = await response.json();
        const credits = data["numberOfCredits"];
        insertCredits(element, credits);
    } catch (error) {
        if (error instanceof Error) {
            console.error(error.message);
        } else {
            console.error(String(error));
        }
    }
}

function insertCredits(element: HTMLElement, credits: number) {
    /**
     * 単位数を挿入する
     * 
     * @param {HTMLElement} element - 挿入対象のHTML要素
     * @param {number} credits - 挿入する単位数
     */
    element.innerText += `\n- ${credits}単位`;
}

function clearCredits(element: HTMLElement) {
    /**
     * 単位数をクリアする
     * 
     * @param {HTMLElement} element - クリア対象のHTML要素
     */
    element.innerText = "〃";
}