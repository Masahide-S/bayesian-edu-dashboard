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
	expected := `{"status":"healthy"}` + "\n"
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

// TestConditionalProbability - 条件付き確率計算の正常系テスト
func TestConditionalProbability(t *testing.T) {
	setupTestData()
	// setupTestDataの内容:
	// Student 1: Q1=1, Q2=1 (両方正解)
	// Student 2: Q1=1, Q2=1 (両方正解)
	// Student 3: Q1=0, Q2=0 (両方不正解)
	// P(Q2=1 | Q1=1) = (Q1=1かつQ2=1の学生数) / (Q1=1の学生数) = 2/2 = 1.0

	req, err := http.NewRequest("GET", "/api/conditional-probability?given=1&target=2", nil)
	if err != nil {
		t.Fatal(err)
	}

	rr := httptest.NewRecorder()
	handler := http.HandlerFunc(getConditionalProbability)
	handler.ServeHTTP(rr, req)

	// ステータスコードの確認
	if status := rr.Code; status != http.StatusOK {
		t.Errorf("handler returned wrong status code: got %v want %v",
			status, http.StatusOK)
	}

	// JSONのデコード
	var result map[string]interface{}
	if err := json.Unmarshal(rr.Body.Bytes(), &result); err != nil {
		t.Errorf("failed to decode response body: %v", err)
	}

	// 確率値の確認
	probability, ok := result["probability"].(float64)
	if !ok {
		t.Errorf("probability field is missing or not a float64")
	}

	expectedProbability := 1.0
	if probability != expectedProbability {
		t.Errorf("expected probability %.2f, got %.2f", expectedProbability, probability)
	}

	// given_question と target_question の確認
	if result["given_question"] != float64(1) {
		t.Errorf("expected given_question 1, got %v", result["given_question"])
	}
	if result["target_question"] != float64(2) {
		t.Errorf("expected target_question 2, got %v", result["target_question"])
	}
}

// TestConditionalProbabilityWithDifferentQuestions - 異なる問題での条件付き確率テスト
func TestConditionalProbabilityWithDifferentQuestions(t *testing.T) {
	// テストデータをより複雑なパターンに設定
	grades = []Grade{
		{StudentID: 1, Q1: 1, Q2: 1, Q3: 1, Q4: 1, Q5: 1, Q6: 1, Q7: 1, Q8: 1, Q9: 1, Q10: 1, Total: 10},
		{StudentID: 2, Q1: 1, Q2: 1, Q3: 0, Q4: 1, Q5: 1, Q6: 1, Q7: 1, Q8: 1, Q9: 0, Q10: 0, Total: 7},
		{StudentID: 3, Q1: 1, Q2: 0, Q3: 0, Q4: 0, Q5: 0, Q6: 0, Q7: 0, Q8: 0, Q9: 0, Q10: 0, Total: 1},
		{StudentID: 4, Q1: 0, Q2: 0, Q3: 0, Q4: 0, Q5: 0, Q6: 0, Q7: 0, Q8: 0, Q9: 0, Q10: 0, Total: 0},
	}
	// P(Q2=1 | Q1=1) = (Q1=1かつQ2=1の学生数) / (Q1=1の学生数) = 2/3 = 0.6666...

	req, err := http.NewRequest("GET", "/api/conditional-probability?given=1&target=2", nil)
	if err != nil {
		t.Fatal(err)
	}

	rr := httptest.NewRecorder()
	handler := http.HandlerFunc(getConditionalProbability)
	handler.ServeHTTP(rr, req)

	if status := rr.Code; status != http.StatusOK {
		t.Errorf("handler returned wrong status code: got %v want %v",
			status, http.StatusOK)
	}

	var result map[string]interface{}
	if err := json.Unmarshal(rr.Body.Bytes(), &result); err != nil {
		t.Errorf("failed to decode response body: %v", err)
	}

	probability := result["probability"].(float64)
	expectedProbability := 2.0 / 3.0

	if probability < expectedProbability-0.01 || probability > expectedProbability+0.01 {
		t.Errorf("expected probability %.4f, got %.4f", expectedProbability, probability)
	}
}

// TestConditionalProbabilityMissingGiven - givenパラメータが欠落している場合のテスト
func TestConditionalProbabilityMissingGiven(t *testing.T) {
	setupTestData()

	req, err := http.NewRequest("GET", "/api/conditional-probability?target=2", nil)
	if err != nil {
		t.Fatal(err)
	}

	rr := httptest.NewRecorder()
	handler := http.HandlerFunc(getConditionalProbability)
	handler.ServeHTTP(rr, req)

	// エラーステータスコードの確認
	if status := rr.Code; status != http.StatusBadRequest {
		t.Errorf("handler returned wrong status code: got %v want %v",
			status, http.StatusBadRequest)
	}
}

// TestConditionalProbabilityMissingTarget - targetパラメータが欠落している場合のテスト
func TestConditionalProbabilityMissingTarget(t *testing.T) {
	setupTestData()

	req, err := http.NewRequest("GET", "/api/conditional-probability?given=1", nil)
	if err != nil {
		t.Fatal(err)
	}

	rr := httptest.NewRecorder()
	handler := http.HandlerFunc(getConditionalProbability)
	handler.ServeHTTP(rr, req)

	// エラーステータスコードの確認
	if status := rr.Code; status != http.StatusBadRequest {
		t.Errorf("handler returned wrong status code: got %v want %v",
			status, http.StatusBadRequest)
	}
}

// TestConditionalProbabilityInvalidQuestionNumber - 無効な問題番号のテスト
func TestConditionalProbabilityInvalidQuestionNumber(t *testing.T) {
	setupTestData()

	testCases := []struct {
		name   string
		given  string
		target string
	}{
		{"given=0", "0", "2"},
		{"given=11", "11", "2"},
		{"target=0", "1", "0"},
		{"target=11", "1", "11"},
		{"both invalid", "0", "11"},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			req, err := http.NewRequest("GET", "/api/conditional-probability?given="+tc.given+"&target="+tc.target, nil)
			if err != nil {
				t.Fatal(err)
			}

			rr := httptest.NewRecorder()
			handler := http.HandlerFunc(getConditionalProbability)
			handler.ServeHTTP(rr, req)

			// エラーステータスコードの確認
			if status := rr.Code; status != http.StatusBadRequest {
				t.Errorf("handler returned wrong status code: got %v want %v",
					status, http.StatusBadRequest)
			}
		})
	}
}

// TestConditionalProbabilityZeroDivision - Q_givenの正解者が0人の場合のテスト
func TestConditionalProbabilityZeroDivision(t *testing.T) {
	// Q1=0の学生しかいないデータ
	grades = []Grade{
		{StudentID: 1, Q1: 0, Q2: 1, Q3: 1, Q4: 1, Q5: 1, Q6: 1, Q7: 1, Q8: 1, Q9: 1, Q10: 1, Total: 9},
		{StudentID: 2, Q1: 0, Q2: 1, Q3: 1, Q4: 1, Q5: 1, Q6: 1, Q7: 1, Q8: 0, Q9: 0, Q10: 0, Total: 6},
		{StudentID: 3, Q1: 0, Q2: 0, Q3: 0, Q4: 0, Q5: 0, Q6: 0, Q7: 0, Q8: 0, Q9: 0, Q10: 0, Total: 0},
	}

	req, err := http.NewRequest("GET", "/api/conditional-probability?given=1&target=2", nil)
	if err != nil {
		t.Fatal(err)
	}

	rr := httptest.NewRecorder()
	handler := http.HandlerFunc(getConditionalProbability)
	handler.ServeHTTP(rr, req)

	// ゼロ除算の場合は0.0を返すか、エラーを返す（実装による）
	// ここでは0.0を返すことを期待
	if status := rr.Code; status != http.StatusOK {
		t.Errorf("handler returned wrong status code: got %v want %v",
			status, http.StatusOK)
	}

	var result map[string]interface{}
	if err := json.Unmarshal(rr.Body.Bytes(), &result); err != nil {
		t.Errorf("failed to decode response body: %v", err)
	}

	probability := result["probability"].(float64)
	if probability != 0.0 {
		t.Errorf("expected probability 0.0 for zero division, got %.2f", probability)
	}
}

// BenchmarkConditionalProbability - 条件付き確率計算のベンチマークテスト
func BenchmarkConditionalProbability(b *testing.B) {
	setupTestData()
	req, _ := http.NewRequest("GET", "/api/conditional-probability?given=1&target=2", nil)

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		rr := httptest.NewRecorder()
		handler := http.HandlerFunc(getConditionalProbability)
		handler.ServeHTTP(rr, req)
	}
}
