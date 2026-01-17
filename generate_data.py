import numpy as np
import pandas as pd

# 再現性のためシード固定
np.random.seed(42)

# パラメータ
n_students = 100
n_questions = 10

# 学生の能力分布（平均7点、標準偏差1.5）
student_abilities = np.random.normal(7.0, 1.5, n_students)

# 問題の難易度（0.3〜0.9の正答率）
question_difficulties = np.random.uniform(0.3, 0.9, n_questions)

# 各学生の各問題の得点を生成
# IRT(Item Response Theory)風のモデルを簡易的に適用
grades = []
for ability in student_abilities:
    # 能力値を0-10のスケールから確率に変換
    ability_prob = ability / 10.0
    
    # 各問題での正答確率 = 能力 × 難易度係数
    student_scores = []
    for diff in question_difficulties:
        # ロジスティック関数で正答確率を計算
        prob = 1 / (1 + np.exp(-5 * (ability_prob - (1 - diff))))
        # ベルヌーイ試行で正答/不正答を決定
        score = 1 if np.random.random() < prob else 0
        student_scores.append(score)
    
    grades.append(student_scores)

# DataFrameに変換
df = pd.DataFrame(grades, columns=[f'Q{i+1}' for i in range(n_questions)])

# 合計点を追加
df['Total'] = df.sum(axis=1)

# CSVとして保存
df.to_csv('grades.csv', index=False)

print(f"Generated grades data: {n_students} students × {n_questions} questions")
print(f"\nFirst 5 rows:")
print(df.head())
print(f"\nStatistics:")
print(df['Total'].describe())
print(f"\nQuestion difficulty (mean correct rate):")
for i in range(n_questions):
    correct_rate = df[f'Q{i+1}'].mean()
    print(f"  Q{i+1}: {correct_rate:.2%}")
