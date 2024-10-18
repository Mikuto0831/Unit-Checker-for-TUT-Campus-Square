"use strict";
window.addEventListener('load', () => {
    console.log("title解析開始");
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
    period_rows.forEach(element => {
        const tables = element.getElementsByClassName("rishu-koma-inner");
        Array.from(tables).forEach(table => {
            const data = table;
            if (data.innerText != "未登録") {
                data.innerText += "\nn単位";
            }
        });
    });
});
