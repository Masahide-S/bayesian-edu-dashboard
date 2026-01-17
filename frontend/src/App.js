import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter
} from 'recharts';
import './App.css';

const API_BASE_URL = 'http://localhost:8080/api';

function App() {
  const [grades, setGrades] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

        {/* Bayesian Analysis Section (Placeholder) */}
        <section className="card">
          <h2>🎯 ベイズ分析（今後実装予定）</h2>
          <div className="placeholder-content">
            <p>以下の機能を実装予定:</p>
            <ul>
              <li>MCMCによる平均点の事後分布推定</li>
              <li>学生の能力パラメータθの推定</li>
              <li>問題間の条件付き確率分析</li>
              <li>予測モデルによる次回テスト結果予測</li>
            </ul>
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
