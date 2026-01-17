import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import './App.css';

const API_BASE_URL = 'http://localhost:8080/api';

function App() {
  const [grades, setGrades] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Conditional Probability State
  const [givenQuestion, setGivenQuestion] = useState('1');
  const [targetQuestion, setTargetQuestion] = useState('2');
  const [conditionalProb, setConditionalProb] = useState(null);
  const [condProbLoading, setCondProbLoading] = useState(false);

  // Correlation Matrix State
  const [correlationMatrix, setCorrelationMatrix] = useState(null);
  const [corrMatrixLoading, setCorrMatrixLoading] = useState(false);

  // Bayes Theorem State
  const [bayesCondition, setBayesCondition] = useState('q1');
  const [bayesValue, setBayesValue] = useState('1');
  const [bayesThreshold, setBayesThreshold] = useState('8');
  const [bayesResult, setBayesResult] = useState(null);
  const [bayesLoading, setBayesLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [gradesRes, statsRes, corrRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/grades`),
        axios.get(`${API_BASE_URL}/statistics`),
        axios.get(`${API_BASE_URL}/correlation-matrix`)
      ]);

      setGrades(gradesRes.data);
      setStatistics(statsRes.data);
      setCorrelationMatrix(corrRes.data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const fetchConditionalProbability = async () => {
    try {
      setCondProbLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/conditional-probability?given=${givenQuestion}&target=${targetQuestion}`
      );
      setConditionalProb(response.data);
      setCondProbLoading(false);
    } catch (err) {
      console.error('Error fetching conditional probability:', err);
      setCondProbLoading(false);
    }
  };

  const fetchBayesTheorem = async () => {
    try {
      setBayesLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/bayes?condition=${bayesCondition}&value=${bayesValue}&threshold=${bayesThreshold}`
      );
      setBayesResult(response.data);
      setBayesLoading(false);
    } catch (err) {
      console.error('Error fetching Bayes theorem:', err);
      setBayesLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="App">
        <div className="loading">Loading data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="App">
        <div className="error">Error: {error}</div>
        <p>Make sure the backend server is running on port 8080</p>
      </div>
    );
  }

  // Prepare data for visualizations
  const totalScoreDistribution = grades.reduce((acc, grade) => {
    const existing = acc.find(item => item.score === grade.total);
    if (existing) {
      existing.count += 1;
    } else {
      acc.push({ score: grade.total, count: 1 });
    }
    return acc;
  }, []).sort((a, b) => a.score - b.score);

  const questionStatsData = statistics?.question_stats
    ? Object.entries(statistics.question_stats).map(([question, rate]) => ({
        question: question.toUpperCase(),
        correctRate: (rate * 100).toFixed(1),
        correctRateDecimal: rate
      }))
    : [];

  return (
    <div className="App">
      <header className="App-header">
        <h1>📊 Bayesian Education Dashboard</h1>
        <p>ベイズ推定を用いた教育データ分析システム</p>
      </header>

      <main className="dashboard">
        {/* Summary Statistics */}
        <section className="card stats-summary">
          <h2>基本統計量</h2>
          {statistics && (
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">平均点</span>
                <span className="stat-value">{statistics.mean.toFixed(2)}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">中央値</span>
                <span className="stat-value">{statistics.median.toFixed(2)}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">標準偏差</span>
                <span className="stat-value">{statistics.std_dev.toFixed(2)}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">最小値</span>
                <span className="stat-value">{statistics.min}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">最大値</span>
                <span className="stat-value">{statistics.max}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">学生数</span>
                <span className="stat-value">{grades.length}</span>
              </div>
            </div>
          )}
        </section>

        {/* Score Distribution */}
        <section className="card chart-section">
          <h2>得点分布</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={totalScoreDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="score" label={{ value: '得点', position: 'insideBottom', offset: -5 }} />
              <YAxis label={{ value: '人数', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" name="学生数" />
            </BarChart>
          </ResponsiveContainer>
        </section>

        {/* Question Difficulty Analysis */}
        <section className="card chart-section">
          <h2>問題別正答率（難易度分析）</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={questionStatsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="question" />
              <YAxis label={{ value: '正答率 (%)', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value) => `${value}%`} />
              <Legend />
              <Bar dataKey="correctRate" fill="#82ca9d" name="正答率" />
            </BarChart>
          </ResponsiveContainer>
          <div className="analysis-note">
            <p>💡 <strong>分析:</strong> 正答率が高い問題ほど易しく、低い問題ほど難しいと判断できます</p>
          </div>
        </section>

        {/* Correlation Matrix Heatmap */}
        {correlationMatrix && (
          <section className="card">
            <h2>問題間相関マトリックス</h2>
            <p className="section-description">
              各問題ペアのピアソン相関係数を表示します。
              相関が強いほど色が濃くなります（正の相関：青、負の相関：赤）。
            </p>

            <div className="heatmap-container">
              <table className="correlation-heatmap">
                <thead>
                  <tr>
                    <th></th>
                    {correlationMatrix.question_labels.map((label) => (
                      <th key={label}>{label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {correlationMatrix.matrix.map((row, i) => (
                    <tr key={i}>
                      <th>{correlationMatrix.question_labels[i]}</th>
                      {row.map((value, j) => {
                        // Color intensity based on correlation value
                        const intensity = Math.abs(value);
                        const isPositive = value >= 0;
                        const color = isPositive
                          ? `rgba(66, 126, 234, ${intensity})`
                          : `rgba(239, 83, 80, ${intensity})`;

                        return (
                          <td
                            key={j}
                            className="heatmap-cell"
                            style={{ backgroundColor: color }}
                            title={`${correlationMatrix.question_labels[i]} × ${correlationMatrix.question_labels[j]}: ${value.toFixed(3)}`}
                          >
                            {value.toFixed(2)}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="analysis-note">
              <p>
                📊 <strong>解釈:</strong>
                値が1に近いほど正の相関が強く（一方ができるともう一方もできる）、
                -1に近いほど負の相関が強く（一方ができるともう一方ができない）、
                0に近いほど相関がありません。
              </p>
            </div>
          </section>
        )}

        {/* Conditional Probability Calculator */}
        <section className="card">
          <h2>条件付き確率計算</h2>
          <p className="section-description">
            P(Q<sub>target</sub>=1 | Q<sub>given</sub>=1) を計算します。
            「Q<sub>given</sub>を正解した学生の中で、Q<sub>target</sub>も正解した確率」を表します。
          </p>

          <div className="conditional-prob-controls">
            <div className="control-group">
              <label htmlFor="given-question">
                条件となる問題 (Given):
              </label>
              <select
                id="given-question"
                value={givenQuestion}
                onChange={(e) => setGivenQuestion(e.target.value)}
                className="question-select"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(q => (
                  <option key={q} value={q}>Q{q}</option>
                ))}
              </select>
            </div>

            <div className="control-group">
              <label htmlFor="target-question">
                対象の問題 (Target):
              </label>
              <select
                id="target-question"
                value={targetQuestion}
                onChange={(e) => setTargetQuestion(e.target.value)}
                className="question-select"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(q => (
                  <option key={q} value={q}>Q{q}</option>
                ))}
              </select>
            </div>

            <button
              onClick={fetchConditionalProbability}
              disabled={condProbLoading}
              className="calculate-button"
            >
              {condProbLoading ? '計算中...' : '計算する'}
            </button>
          </div>

          {conditionalProb && (
            <div className="conditional-prob-result">
              <h3>計算結果</h3>
              <div className="result-grid">
                <div className="result-item">
                  <span className="result-label">条件付き確率</span>
                  <span className="result-value probability">
                    {(conditionalProb.probability * 100).toFixed(2)}%
                  </span>
                </div>
                <div className="result-item">
                  <span className="result-label">Q{conditionalProb.given_question}正解者数</span>
                  <span className="result-value">{conditionalProb.given_correct_count}人</span>
                </div>
                <div className="result-item">
                  <span className="result-label">両方正解者数</span>
                  <span className="result-value">{conditionalProb.both_correct_count}人</span>
                </div>
              </div>
              <div className="analysis-note">
                <p>
                  📊 <strong>解釈:</strong> Q{conditionalProb.given_question}を正解した学生{conditionalProb.given_correct_count}人のうち、
                  {conditionalProb.both_correct_count}人がQ{conditionalProb.target_question}も正解しています
                  （{(conditionalProb.probability * 100).toFixed(2)}%）
                </p>
              </div>
            </div>
          )}
        </section>

        {/* Bayes Theorem Calculator */}
        <section className="card">
          <h2>ベイズの定理による確率更新</h2>
          <p className="section-description">
            P(Total≥threshold | Q<sub>condition</sub>=value) を計算します。
            「特定の問題の解答状況を条件として、合計点が閾値以上になる確率」を推定します。
          </p>

          <div className="bayes-controls">
            <div className="control-group">
              <label htmlFor="bayes-condition">
                条件となる問題:
              </label>
              <select
                id="bayes-condition"
                value={bayesCondition}
                onChange={(e) => setBayesCondition(e.target.value)}
                className="question-select"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(q => (
                  <option key={q} value={`q${q}`}>Q{q}</option>
                ))}
              </select>
            </div>

            <div className="control-group">
              <label htmlFor="bayes-value">
                問題の値:
              </label>
              <select
                id="bayes-value"
                value={bayesValue}
                onChange={(e) => setBayesValue(e.target.value)}
                className="question-select"
              >
                <option value="0">不正解 (0)</option>
                <option value="1">正解 (1)</option>
              </select>
            </div>

            <div className="control-group">
              <label htmlFor="bayes-threshold">
                合計点の閾値:
              </label>
              <input
                type="number"
                id="bayes-threshold"
                value={bayesThreshold}
                onChange={(e) => setBayesThreshold(e.target.value)}
                min="0"
                max="10"
                className="threshold-input"
              />
            </div>

            <button
              onClick={fetchBayesTheorem}
              disabled={bayesLoading}
              className="calculate-button"
            >
              {bayesLoading ? '計算中...' : '計算する'}
            </button>
          </div>

          {bayesResult && (
            <div className="bayes-result">
              <h3>計算結果</h3>
              <div className="result-grid">
                <div className="result-item">
                  <span className="result-label">事後確率 P(Total≥{bayesResult.threshold} | {bayesResult.condition}={bayesResult.condition_value})</span>
                  <span className="result-value probability">
                    {(bayesResult.posterior_probability * 100).toFixed(2)}%
                  </span>
                </div>
                <div className="result-item">
                  <span className="result-label">事前確率 P(Total≥{bayesResult.threshold})</span>
                  <span className="result-value">{(bayesResult.prior_probability * 100).toFixed(2)}%</span>
                </div>
                <div className="result-item">
                  <span className="result-label">尤度 P({bayesResult.condition}={bayesResult.condition_value} | Total≥{bayesResult.threshold})</span>
                  <span className="result-value">{(bayesResult.likelihood_probability * 100).toFixed(2)}%</span>
                </div>
              </div>
              <div className="result-details">
                <p><strong>条件を満たす学生数:</strong> {bayesResult.condition_met_count}人</p>
                <p><strong>両方の条件を満たす学生数:</strong> {bayesResult.both_conditions_met_count}人</p>
              </div>
              <div className="analysis-note">
                <p>
                  📊 <strong>解釈:</strong> {bayesResult.condition}={bayesResult.condition_value}の学生{bayesResult.condition_met_count}人のうち、
                  合計点が{bayesResult.threshold}点以上の学生は{bayesResult.both_conditions_met_count}人です
                  （{(bayesResult.posterior_probability * 100).toFixed(2)}%）。
                  これは事前確率{(bayesResult.prior_probability * 100).toFixed(2)}%から
                  {bayesResult.posterior_probability > bayesResult.prior_probability ? '増加' : '減少'}しています。
                </p>
              </div>
            </div>
          )}
        </section>

        {/* Student Performance Table */}
        <section className="card">
          <h2>学生成績一覧（上位20名）</h2>
          <div className="table-container">
            <table className="grades-table">
              <thead>
                <tr>
                  <th>学生ID</th>
                  <th>Q1</th>
                  <th>Q2</th>
                  <th>Q3</th>
                  <th>Q4</th>
                  <th>Q5</th>
                  <th>Q6</th>
                  <th>Q7</th>
                  <th>Q8</th>
                  <th>Q9</th>
                  <th>Q10</th>
                  <th>合計</th>
                </tr>
              </thead>
              <tbody>
                {grades
                  .sort((a, b) => b.total - a.total)
                  .slice(0, 20)
                  .map(grade => (
                    <tr key={grade.student_id}>
                      <td>{grade.student_id}</td>
                      <td className={grade.q1 ? 'correct' : 'incorrect'}>{grade.q1}</td>
                      <td className={grade.q2 ? 'correct' : 'incorrect'}>{grade.q2}</td>
                      <td className={grade.q3 ? 'correct' : 'incorrect'}>{grade.q3}</td>
                      <td className={grade.q4 ? 'correct' : 'incorrect'}>{grade.q4}</td>
                      <td className={grade.q5 ? 'correct' : 'incorrect'}>{grade.q5}</td>
                      <td className={grade.q6 ? 'correct' : 'incorrect'}>{grade.q6}</td>
                      <td className={grade.q7 ? 'correct' : 'incorrect'}>{grade.q7}</td>
                      <td className={grade.q8 ? 'correct' : 'incorrect'}>{grade.q8}</td>
                      <td className={grade.q9 ? 'correct' : 'incorrect'}>{grade.q9}</td>
                      <td className={grade.q10 ? 'correct' : 'incorrect'}>{grade.q10}</td>
                      <td className="total-score">{grade.total}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <footer className="App-footer">
        <p>Bayesian Education Dashboard - Built with Go + React</p>
      </footer>
    </div>
  );
}

export default App;
