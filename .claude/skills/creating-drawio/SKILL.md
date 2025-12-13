---
name: creating-drawio
description: draw.io 形式の図（.drawio）を作成します。アーキテクチャ図、フローチャート、シーケンス図、ネットワーク図について言及している場合に使用。
---

# draw.io 図作成スキル

## 概要

draw.io（diagrams.net）形式の XML を生成するスキル。

## 作成方法

1. ユーザーの要件を確認（コンポーネント、接続関係）
2. 下記の XML 構造に従って `.drawio` ファイルを生成
3. 必要に応じて templates/ のテンプレートを参考にする

## XML 基本構造

```xml
<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="app.diagrams.net">
  <diagram name="Page-1">
    <mxGraphModel dx="1000" dy="600" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1169" pageHeight="827">
      <root>
        <mxCell id="0"/>
        <mxCell id="1" parent="0"/>
        <!-- ノードとエッジをここに追加 -->
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>
```

## ノード（図形）

### 長方形
```xml
<mxCell id="node1" value="ラベル" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;" vertex="1" parent="1">
  <mxGeometry x="100" y="100" width="120" height="60" as="geometry"/>
</mxCell>
```

### 楕円（開始/終了）
```xml
<mxCell id="node2" value="開始" style="ellipse;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;" vertex="1" parent="1">
  <mxGeometry x="100" y="100" width="120" height="60" as="geometry"/>
</mxCell>
```

### ひし形（判断）
```xml
<mxCell id="node3" value="条件?" style="rhombus;whiteSpace=wrap;html=1;fillColor=#fff2cc;strokeColor=#d6b656;" vertex="1" parent="1">
  <mxGeometry x="100" y="100" width="120" height="80" as="geometry"/>
</mxCell>
```

### 円柱（データベース）
```xml
<mxCell id="node4" value="DB" style="shape=cylinder3;whiteSpace=wrap;html=1;boundedLbl=1;backgroundOutline=1;size=15;fillColor=#f5f5f5;strokeColor=#666666;" vertex="1" parent="1">
  <mxGeometry x="100" y="100" width="80" height="100" as="geometry"/>
</mxCell>
```

## エッジ（接続線）

### 実線
```xml
<mxCell id="edge1" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;" edge="1" parent="1" source="node1" target="node2">
  <mxGeometry relative="1" as="geometry"/>
</mxCell>
```

### 破線
```xml
<mxCell id="edge2" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;dashed=1;" edge="1" parent="1" source="node1" target="node2">
  <mxGeometry relative="1" as="geometry"/>
</mxCell>
```

### ラベル付き
```xml
<mxCell id="edge3" value="Yes" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;" edge="1" parent="1" source="node1" target="node2">
  <mxGeometry relative="1" as="geometry"/>
</mxCell>
```

## AWS アイコン

draw.io の AWS ライブラリを使用する場合の style 属性：

| サービス | shape 値 |
|---------|---------|
| EC2 | `shape=mxgraph.aws4.resourceIcon;resIcon=mxgraph.aws4.ec2;` |
| Lambda | `shape=mxgraph.aws4.lambda_function;` |
| S3 | `shape=mxgraph.aws4.bucket;` |
| RDS | `shape=mxgraph.aws4.rds;` |
| DynamoDB | `shape=mxgraph.aws4.dynamodb;` |
| API Gateway | `shape=mxgraph.aws4.api_gateway;` |
| CloudFront | `shape=mxgraph.aws4.cloudfront;` |
| ECS | `shape=mxgraph.aws4.ecs;` |
| EKS | `shape=mxgraph.aws4.eks;` |
| ALB | `shape=mxgraph.aws4.application_load_balancer;` |
| NLB | `shape=mxgraph.aws4.network_load_balancer;` |
| SQS | `shape=mxgraph.aws4.sqs;` |
| SNS | `shape=mxgraph.aws4.sns;` |
| Cognito | `shape=mxgraph.aws4.cognito;` |
| CloudWatch | `shape=mxgraph.aws4.cloudwatch;` |
| IAM | `shape=mxgraph.aws4.identity_and_access_management;` |
| Secrets Manager | `shape=mxgraph.aws4.secrets_manager;` |
| VPC | `shape=mxgraph.aws4.group;grIcon=mxgraph.aws4.group_vpc;` |

AWS アイコンの共通スタイル:
```
sketch=0;outlineConnect=0;fontColor=#232F3E;gradientColor=none;fillColor=#D05C17;strokeColor=none;verticalLabelPosition=bottom;verticalAlign=top;align=center;html=1;fontSize=12;aspect=fixed;pointerEvents=1;
```

## グループ（VPC/サブネット）

```xml
<mxCell id="vpc1" value="VPC" style="sketch=0;outlineConnect=0;gradientColor=none;html=1;whiteSpace=wrap;fontSize=12;shape=mxgraph.aws4.group;grIcon=mxgraph.aws4.group_vpc;strokeColor=#879196;fillColor=none;verticalAlign=top;align=left;spacingLeft=30;fontColor=#879196;" vertex="1" parent="1">
  <mxGeometry x="50" y="50" width="500" height="300" as="geometry"/>
</mxCell>
```

## レイアウトのコツ

- x, y: 左上からの座標（10px グリッド推奨）
- width, height: 図形のサイズ
- 横並び: x を 150px ずつ増加
- 縦並び: y を 100px ずつ増加
- AWS アイコン: 78x78 推奨

## テンプレート

- `templates/aws-architecture.drawio` - AWS 構成図
- `templates/flowchart.drawio` - フローチャート
- `templates/network.drawio` - ネットワーク図
