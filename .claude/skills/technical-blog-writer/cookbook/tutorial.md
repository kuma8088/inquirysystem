# チュートリアル記事の書き方

手順を説明する記事の追加ガイドライン。

## チュートリアルの特徴

| 要素 | 重視すべき点 |
|:---|:---|
| **再現性** | 読者が同じ結果を得られる |
| **前提条件** | 何が必要か明確 |
| **ゴール** | 何ができるようになるか |
| **つまずきポイント** | ハマりやすい箇所を先回り |

## 構成テンプレート

```markdown
# [成果物] を [技術] で作る方法

## この記事で作るもの

[スクリーンショット or アーキテクチャ図]

- 所要時間: 約X分
- 難易度: [初級/中級/上級]
- 完成コード: [GitHub URL]

## 前提条件

- [ ] [必要な知識1]
- [ ] [必要なツール1]（バージョン X 以上）

## 全体の流れ

1. [ステップ1概要]
2. [ステップ2概要]
3. [ステップ3概要]

## Step 1: [タイトル]

### やること
[このステップで何をするか一言]

### 手順
[最小限のコマンド/コード]

### 確認
[成功したかどうかの確認方法]

## Step 2: [タイトル]
...

## よくあるエラーと対処

| エラー | 原因 | 解決策 |
|:---|:---|:---|

## まとめ

### 学んだこと
- [ポイント1]
- [ポイント2]

### 次のステップ
- [発展的な内容へのリンク]
```

## チュートリアルの罠

### ❌ 避けるべきパターン

```markdown
# NG: 全コード掲載
ここで以下のファイルを作成します:

[100行の完全なコード]

上記のコードは〜を行います。
```

### ✅ 推奨パターン

```markdown
# OK: 概念 + 重要部分のみ
ポイントは `source_code_hash` の設定です:

```hcl
resource "aws_lambda_function" "example" {
  # ... 基本設定は省略
  
  # ★ これが重要: ファイル変更を検知
  source_code_hash = filebase64sha256("../dist/example.zip")
}
```

完全なコードは [GitHub](URL) を参照してください。
```

## コードブロックのルール

### 1. 必要な行だけ

```
✅ 10-30行: 概念を示すのに十分
❌ 50行以上: GitHub へリンク
```

### 2. 省略記法を使う

```hcl
resource "aws_lambda_function" "example" {
  function_name = "example"
  handler       = "main.handler"
  runtime       = "python3.11"
  
  # ... その他の設定
  
  # ★ ポイント: 変更検知
  source_code_hash = filebase64sha256("../dist/example.zip")
}
```

### 3. コメントで強調

```python
# ★ ここが重要
result = complex_operation()

# 通常の処理
normal_operation()
```

## Step の書き方

### 各 Step に含めるもの

1. **やること**（1文）
2. **なぜやるか**（任意、重要な場合）
3. **コマンド/コード**（最小限）
4. **確認方法**（成功の判断基準）

### 例

```markdown
## Step 2: Lambda 関数をデプロイ

### やること
Terraform で Lambda をデプロイします。

### なぜ
ZIP ファイルを直接アップロードするより、
Terraform で管理した方が変更追跡が容易です。

### コマンド
```bash
terraform apply
```

### 確認
```bash
aws lambda invoke --function-name example output.txt
cat output.txt  # "Hello, World!" が表示されれば成功
```
```

## プラットフォーム別の注意

### Zenn

```markdown
:::message
ポイント: ここが重要です
:::

:::details 補足情報（クリックで展開）
詳細な説明...
:::
```

### Qiita

```markdown
:::note info
補足情報
:::

:::note warn
注意点
:::
```
