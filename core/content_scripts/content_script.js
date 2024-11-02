"use strict";
window.addEventListener('load', async () => {
    console.log("title解析開始2");
    const title = document.head.getElementsByTagName("title")[0];
    if (title.innerHTML != "履修登録・登録状況照会") {
        return;
    }
    console.log("target 変更開始");
    // 全体table取得
    const target_tables = document.getElementsByTagName("table")[2];
    // コマtable取得
    const koma_table = target_tables.querySelector(".rishu-koma").getElementsByTagName("tbody")[0];
    // コマtableを各時限ごとに配列化 (0行目は曜日なので捨てる)
    const [_, ...period_rows] = Array.from(koma_table.children);
    period_rows.forEach(async (element) => {
        const tables = element.getElementsByClassName("rishu-koma-inner");
        Array.from(tables).forEach(async (table) => {
            const data = table;
            // 授業コード取得
            const lectureCode = data.innerText.split("\n")[0];
            if (lectureCode == "未登録") {
                return;
            }
            // 未登録以外の場合、単位数を取得し挿入
            const credits = await getCredits(lectureCode);
            insertCredits(data, credits);
        });
    });
});
async function getCredits(lectureCode) {
    /**
     * 授業コードから単位数を取得する
     *
     * @param {string} lectureCode - 授業コード
     * @return {number} - 単位数
     */
    const url = `https://tut-syllabus-api.pages.dev/api/v1/all/${lectureCode}.json`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data["numberOfCredits"];
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(error.message);
        }
        else {
            console.error(String(error));
        }
        return 0; // エラーが発生した場合は0を返す
    }
}
function insertCredits(element, credits) {
    /**
     * 単位数を挿入する
     *
     * @param {HTMLElement} element - 挿入対象のHTML要素
     * @param {number} credits - 挿入する単位数
     */
    element.innerText += `\n${credits}単位`;
}
