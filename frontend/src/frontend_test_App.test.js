import { render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import App from './App';

// axiosをモック化
jest.mock('axios');

describe('App Component', () => {
  // 各テスト前にモックをリセット
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('初期状態でローディング表示される', () => {
    axios.get.mockResolvedValue({ data: [] });
    render(<App />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  test('APIからデータ取得後に統計量が表示される', async () => {
    const mockGrades = [
      { student_id: 1, q1: 1, q2: 1, q3: 1, q4: 1, q5: 1, q6: 1, q7: 1, q8: 1, q9: 1, q10: 1, total: 10 },
      { student_id: 2, q1: 1, q2: 1, q3: 1, q4: 1, q5: 1, q6: 1, q7: 1, q8: 0, q9: 0, q10: 0, total: 7 },
    ];

    const mockStats = {
      mean: 8.5,
      median: 8.5,
      std_dev: 1.5,
      min: 7,
      max: 10,
      question_stats: {
        q1: 1.0,
        q2: 1.0,
        q3: 1.0,
        q4: 1.0,
        q5: 1.0,
        q6: 1.0,
        q7: 1.0,
        q8: 0.5,
        q9: 0.5,
        q10: 0.5,
      }
    };

    axios.get.mockImplementation((url) => {
      if (url.includes('/grades')) {
        return Promise.resolve({ data: mockGrades });
      }
      if (url.includes('/statistics')) {
        return Promise.resolve({ data: mockStats });
      }
    });

    render(<App />);

    // ローディングが終わるまで待機
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    // 統計量が表示されることを確認
    expect(screen.getByText(/平均点/)).toBeInTheDocument();
    expect(screen.getByText('8.50')).toBeInTheDocument();
    expect(screen.getByText('1.50')).toBeInTheDocument();
  });

  test('APIエラー時にエラーメッセージが表示される', async () => {
    axios.get.mockRejectedValue(new Error('Network Error'));

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/network error/i)).toBeInTheDocument();
  });

  test('タイトルが正しく表示される', async () => {
    axios.get.mockResolvedValue({ data: { mean: 7.5, question_stats: {} } });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Bayesian Education Dashboard/i)).toBeInTheDocument();
    });
  });

  test('学生数が正しく表示される', async () => {
    const mockGrades = Array(100).fill(null).map((_, i) => ({
      student_id: i + 1,
      q1: 1, q2: 1, q3: 1, q4: 1, q5: 1,
      q6: 1, q7: 1, q8: 1, q9: 1, q10: 1,
      total: 10
    }));

    const mockStats = {
      mean: 10,
      median: 10,
      std_dev: 0,
      min: 10,
      max: 10,
      question_stats: {}
    };

    axios.get.mockImplementation((url) => {
      if (url.includes('/grades')) {
        return Promise.resolve({ data: mockGrades });
      }
      if (url.includes('/statistics')) {
        return Promise.resolve({ data: mockStats });
      }
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('100')).toBeInTheDocument();
    });
  });

  test('基本統計量が全て表示される', async () => {
    const mockStats = {
      mean: 7.64,
      median: 8.0,
      std_dev: 1.61,
      min: 3,
      max: 10,
      question_stats: {}
    };

    axios.get.mockImplementation((url) => {
      if (url.includes('/grades')) {
        return Promise.resolve({ data: [] });
      }
      if (url.includes('/statistics')) {
        return Promise.resolve({ data: mockStats });
      }
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/平均点/)).toBeInTheDocument();
      expect(screen.getByText(/中央値/)).toBeInTheDocument();
      expect(screen.getByText(/標準偏差/)).toBeInTheDocument();
      expect(screen.getByText(/最小値/)).toBeInTheDocument();
      expect(screen.getByText(/最大値/)).toBeInTheDocument();
    });
  });

  test('問題別正答率が表示される', async () => {
    const mockStats = {
      mean: 7.5,
      median: 8.0,
      std_dev: 1.5,
      min: 5,
      max: 10,
      question_stats: {
        q1: 0.77,
        q2: 0.59,
        q3: 0.61,
        q4: 0.73,
        q5: 0.91,
        q6: 0.69,
        q7: 0.79,
        q8: 0.87,
        q9: 0.71,
        q10: 0.97,
      }
    };

    axios.get.mockImplementation((url) => {
      if (url.includes('/grades')) {
        return Promise.resolve({ data: [] });
      }
      if (url.includes('/statistics')) {
        return Promise.resolve({ data: mockStats });
      }
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/問題別正答率/)).toBeInTheDocument();
    });
  });

  test('サーバー接続エラー時の適切なメッセージ表示', async () => {
    axios.get.mockRejectedValue(new Error('Connection refused'));

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/make sure the backend server is running/i)).toBeInTheDocument();
    });
  });
});
