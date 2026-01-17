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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [gradesRes, statsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/grades`),
        axios.get(`${API_BASE_URL}/statistics`)
      ]);

      setGrades(gradesRes.data);
      setStatistics(statsRes.data);
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
