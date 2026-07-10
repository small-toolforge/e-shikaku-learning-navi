# Anacondaでのリリース検査

`tools/リリース検査.cmd` がPythonを見つけられない場合は、Anaconda Promptを開いて次のように実行します。

```text
cd <リポジトリの展開先>\tools
リリース検査.py
```

または、Python実行ファイルを明示します。

```text
%USERPROFILE%\anaconda3\python.exe リリース検査.py
```

Node.jsがない環境では、JavaScript構文検査を省略した警告が1件出ます。その他が正常で末尾が `結果: OK（警告 1件）` なら、構成検査は合格です。
