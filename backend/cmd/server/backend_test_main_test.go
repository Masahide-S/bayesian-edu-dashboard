package main

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

// テスト用のダミーデータをセットアップ
func setupTestData() {
	grades = []Grade{
		{StudentID: 1, Q1: 1, Q2: 1, Q3: 1, Q4: 1, Q5: 1, Q6: 1, Q7: 1, Q8: 1, Q9: 1, Q10: 1, Total: 10},
		{StudentID: 2, Q1: 1, Q2: 1, Q3: 1, Q4: 1, Q5: 1, Q6: 1, Q7: 1, Q8: 0, Q9: 0, Q10: 0, Total: 7},
		{StudentID: 3, Q1: 0, Q2: 0, Q3: 0, Q4: 0, Q5: 0, Q6: 0, Q7: 0, Q8: 0, Q9: 0, Q10: 0, Total: 0},
	}
}

// TestHealthCheck - ヘルスチェックエンドポイントのテスト
func TestHealthCheck(t *testing.T) {
	req, err := http.NewRequest("GET", "/api/health", nil)
	if err != nil {
		t.Fatal(err)
	}

	rr := httptest.NewRecorder()
	handler := http.HandlerFunc(healthCheck)
	handler.ServeHTTP(rr, req)

	// ステータスコードの確認
	if status := rr.Code; status != http.StatusOK {
		t.Errorf("handler returned wrong status code: got %v want %v",
			status, http.StatusOK)
	}

	// レスポンスボディの確認
	expected := `{"status":"healthy"}`
	if rr.Body.String() != expected {
		t.Errorf("handler returned unexpected body: got %v want %v",
			rr.Body.String(), expected)
	}
}

// TestGetGrades - 成績データ取得エンドポイントのテスト
func TestGetGrades(t *testing.T) {
	setupTestData()

	req, err := http.NewRequest("GET", "/api/grades", nil)
	if err != nil {
		t.Fatal(err)
	}

	rr := httptest.NewRecorder()
	handler := http.HandlerFunc(getGrades)
	handler.ServeHTTP(rr, req)

	// ステータスコードの確認
	if status := rr.Code; status != http.StatusOK {
		t.Errorf("handler returned wrong status code: got %v want %v",
			status, http.StatusOK)
	}

	// JSONのデコード確認
	var result []Grade
	if err := json.Unmarshal(rr.Body.Bytes(), &result); err != nil {
		t.Errorf("failed to decode response body: %v", err)
	}

	// データ数の確認
	if len(result) != 3 {
		t.Errorf("expected 3 grades, got %d", len(result))
	}

	// 最初のデータの確認
	if result[0].Total != 10 {
		t.Errorf("expected first student total to be 10, got %d", result[0].Total)
	}
}

// TestGetStatistics - 統計量エンドポイントのテスト
func TestGetStatistics(t *testing.T) {
	setupTestData()

	req, err := http.NewRequest("GET", "/api/statistics", nil)
	if err != nil {
		t.Fatal(err)
	}

	rr := httptest.NewRecorder()
	handler := http.HandlerFunc(getStatistics)
	handler.ServeHTTP(rr, req)

	// ステータスコードの確認
	if status := rr.Code; status != http.StatusOK {
		t.Errorf("handler returned wrong status code: got %v want %v",
			status, http.StatusOK)
	}

	// JSONのデコード
	var stats Statistics
	if err := json.Unmarshal(rr.Body.Bytes(), &stats); err != nil {
		t.Errorf("failed to decode response body: %v", err)
	}

	// 平均点の確認 (10 + 7 + 0) / 3 = 5.67
	expectedMean := 5.666666666666667
	if stats.Mean < expectedMean-0.01 || stats.Mean > expectedMean+0.01 {
		t.Errorf("expected mean to be around %.2f, got %.2f", expectedMean, stats.Mean)
	}

	// 最小値の確認
	if stats.Min != 0 {
		t.Errorf("expected min to be 0, got %d", stats.Min)
	}

	// 最大値の確認
	if stats.Max != 10 {
		t.Errorf("expected max to be 10, got %d", stats.Max)
	}

	// 問題統計の確認
	if len(stats.QuestionStats) != 10 {
		t.Errorf("expected 10 question stats, got %d", len(stats.QuestionStats))
	}

	// Q1の正答率確認 (2/3 = 0.667)
	q1Rate := stats.QuestionStats["q1"]
	expectedQ1Rate := 0.6666666666666666
	if q1Rate < expectedQ1Rate-0.01 || q1Rate > expectedQ1Rate+0.01 {
		t.Errorf("expected q1 correct rate to be around %.2f, got %.2f", expectedQ1Rate, q1Rate)
	}
}

// TestGetStatisticsWithEmptyData - データが空の場合のテスト
func TestGetStatisticsWithEmptyData(t *testing.T) {
	grades = []Grade{} // 空のデータ

	req, err := http.NewRequest("GET", "/api/statistics", nil)
	if err != nil {
		t.Fatal(err)
	}

	rr := httptest.NewRecorder()
	handler := http.HandlerFunc(getStatistics)
	handler.ServeHTTP(rr, req)

	// エラーステータスコードの確認
	if status := rr.Code; status != http.StatusInternalServerError {
		t.Errorf("handler returned wrong status code: got %v want %v",
			status, http.StatusInternalServerError)
	}
}

// TestLoadGrades - CSV読み込み機能のテスト
func TestLoadGrades(t *testing.T) {
	// テスト用の一時CSVファイルを作成
	// 実際の実装では、テスト用のCSVファイルを用意するか
	// モックを使用することを推奨

	// ここでは簡単なテストとして、grades変数が正しく初期化されているか確認
	if len(grades) == 0 {
		t.Skip("grades not loaded, skipping test")
	}

	// 各gradeが正しい構造を持っているか確認
	for i, grade := range grades {
		if grade.StudentID <= 0 {
			t.Errorf("grade %d has invalid StudentID: %d", i, grade.StudentID)
		}
		if grade.Total < 0 || grade.Total > 10 {
			t.Errorf("grade %d has invalid Total: %d", i, grade.Total)
		}
	}
}

// Benchmark tests - パフォーマンステスト
func BenchmarkGetGrades(b *testing.B) {
	setupTestData()
	req, _ := http.NewRequest("GET", "/api/grades", nil)

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		rr := httptest.NewRecorder()
		handler := http.HandlerFunc(getGrades)
		handler.ServeHTTP(rr, req)
	}
}

func BenchmarkGetStatistics(b *testing.B) {
	setupTestData()
	req, _ := http.NewRequest("GET", "/api/statistics", nil)

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		rr := httptest.NewRecorder()
		handler := http.HandlerFunc(getStatistics)
		handler.ServeHTTP(rr, req)
	}
}
