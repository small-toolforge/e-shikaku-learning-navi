# E資格 学習ナビ

JDLA E資格の私用学習支援アプリ（PWA）。間隔反復、自信度・誤答原因の記録、用語・数式・比較カード、コード読解、カメラ・動画の画像解析ラボを、外部ライブラリなしの静的ファイルで提供します。

## 対応環境

正式な確認対象は次の3環境です。

- Windows 11 / Microsoft Edge
- iPhone / Safari・ホーム画面PWA
- Android / Google Chrome・インストール済みPWA

端末差がある機能は、利用可否を「記録 → 端末・PWA診断」で確認できます。

## プライバシーと保存先

- 学習履歴はブラウザの IndexedDB にのみ保存します
- カメラ映像とローカル動画は端末内の Canvas で処理し、送信・自動保存しません
- PC・スマホ間の同期は、記録タブのJSON書き出し／読み込みで行います
- 学習履歴JSON、教材、APIキー、個人データはリポジトリへ含めません

## v0.3.1 安定化内容

- 正規の実装を `index.html` と版固定の `assets/v0.3.1/` に整理し、参照順を固定
- 問題JSONを全件検査し、新規・更新・エラー件数を確認してから一括保存
- 回答ログと復習予定を1回のIndexedDBトランザクションで保存し、二重採点を防止
- 問題追加・バックアップ読込・履歴削除の前に、端末内へ復元用スナップショットを保存
- 問題追加・履歴削除では、現在データのJSONダウンロードも試行
- 最終バックアップから14日以上経過した場合にホームで案内
- IndexedDB、Service Worker、カメラAPI、Canvas、保存容量などの端末診断
- PWA・manifest・Service Worker・READMEのファイル一覧を統一
- 標準Pythonによるリリース前検査と3端末動作確認表を追加

## 構成

```text
/
├── index.html                 画面の入口（参照順を固定）
├── manifest.webmanifest       PWAマニフェスト
├── sw.js                      Service Worker
├── .nojekyll                  Jekyll処理を無効化
├── assets/v0.3.1/
│   ├── styles.css
│   ├── app-data.js            DB・問題・間隔反復
│   ├── app-ui.js              ホーム・出題・カード
│   ├── app-lab.js             カメラ・動画ラボ
│   ├── app-management.js      バックアップ・取込・診断
│   └── app-init.js            初期化・PWA登録
├── icons/
│   ├── app-icon.svg
│   ├── icon-192.png
│   └── apple-touch-icon.png
├── tools/
│   ├── リリース検査.py
│   └── リリース検査.cmd
├── docs/
│   └── 3端末動作確認チェック表.md
└── README.md
```

`assets/v0.3/` とルートの補助パッチは旧試作版のため削除します。現行版は、版番号を固定した `assets/v0.3.1/` の5ファイルだけを `index.html` が明示順で読み込みます。リリース検査で参照順・存在・Service Worker対象を照合します。

## GitHub Pages

1. **Settings → Pages** を開く
2. Sourceを **Deploy from a branch** にする
3. Branchを `main`、フォルダを `/(root)` にする
4. 公開URLを開き、記録タブのアプリ版と端末診断を確認する

公開URL:

```text
https://small-toolforge.github.io/e-shikaku-learning-navi/
```

カメラはHTTPSが必要です。ローカルの `file://` では、カメラやService Workerが利用できない場合があります。

## iPhoneでの利用

1. Safariで公開URLを開く
2. 共有ボタンをタップ
3. 「ホーム画面に追加」を選ぶ
4. 以後はホーム画面のアイコンから利用する

Safari通常タブとホーム画面PWAは保存領域が別になる場合があります。学習はどちらか一方に固定し、端末変更前にはJSONバックアップを作成してください。

## リリース前検査

Windowsでは次をダブルクリックします。

```text
tools\リリース検査.cmd
```

コマンドラインでは次のとおりです。

```bash
python tools/リリース検査.py
```

検査内容:

- 必須ファイルとmanifestアイコンの存在
- `APP_VERSION` と `CACHE_NAME` の一致
- Service Workerのキャッシュ対象の存在
- `index.html` のCSS・JavaScript参照がv0.3.1の固定一覧・順序と一致すること
- `renderHome`、`renderLab`、`renderStats` などの主要実装
- 静的HTMLのid重複
- Node.jsがある場合はJavaScript構文
- 旧分割版ファイルが残っていないこと

その後、`docs/3端末動作確認チェック表.md` に沿って確認します。

## キャッシュ更新ルール

アプリを変更するときは、必ず次の2か所を同じ版に更新します。

```javascript
// assets/v0.3.1/app-data.js
const APP_VERSION = "v0.3.1";

// sw.js
const CACHE_NAME = "eshikaku-stable-v0.3.1";
```

Service Workerはオンライン時にネットワークを優先し、オフライン時だけ同一版のキャッシュを使います。新しいService Workerの有効化時に旧キャッシュを削除します。

## 問題JSON

記録タブでJSONを貼り付け、まず「JSONを検査する」を実行します。検査対象には次を含みます。

- `id` の形式とバッチ内重複
- `choices` の件数・空欄
- `answer` が選択肢の範囲内か
- `labTag` が `"" / sobel / pool / diff / video` のいずれか
- `sources` が配列で、URLがHTTP/HTTPSか
- 文字数とデータサイズの上限

検査に合格した全問題だけを、1回のIndexedDBトランザクションで保存します。同じ `id` は問題を更新し、既存の回答履歴・復習予定は保持します。

## 復元用スナップショット

問題追加、バックアップ読込、学習履歴削除の前に、現在の問題・回答ログ・復習予定をIndexedDBの `meta` ストアへ1世代だけ保存します。

記録タブの「直前の状態へ戻す」で、問題・回答ログ・復習予定をまとめて置き換えられます。端末故障やブラウザデータ消去には備えられないため、通常のJSONバックアップも併用してください。

## リポジトリへ含めないもの

- `eshikaku_backup_*.json`
- 講義資料・市販教材などの著作物
- APIキー・認証情報
- 個人データ

## ライセンス・用途

私用の学習支援を目的とした個人プロジェクトです。
