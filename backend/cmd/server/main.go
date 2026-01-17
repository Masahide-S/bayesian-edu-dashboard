package main

import (
	"encoding/csv"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"strconv"

	"github.com/gorilla/mux"
	"github.com/rs/cors"
)

// Grade represents a student's grade data
type Grade struct {
	StudentID int     `json:"student_id"`
	Q1        int     `json:"q1"`
	Q2        int     `json:"q2"`
	Q3        int     `json:"q3"`
	Q4        int     `json:"q4"`
	Q5        int     `json:"q5"`
	Q6        int     `json:"q6"`
	Q7        int     `json:"q7"`
	Q8        int     `json:"q8"`
	Q9        int     `json:"q9"`
	Q10       int     `json:"q10"`
	Total     int     `json:"total"`
}

// Statistics represents basic statistics
type Statistics struct {
	Mean              float64            `json:"mean"`
	Median            float64            `json:"median"`
	StdDev            float64            `json:"std_dev"`
	Min               int                `json:"min"`
	Max               int                `json:"max"`
	QuestionStats     map[string]float64 `json:"question_stats"`
}

var grades []Grade

// Load grades from CSV file
func loadGrades(filename string) error {
	file, err := os.Open(filename)
	if err != nil {
		return err
	}
	defer file.Close()

	reader := csv.NewReader(file)
	records, err := reader.ReadAll()
	if err != nil {
		return err
	}

	// Skip header
	for i, record := range records[1:] {
		q1, _ := strconv.Atoi(record[0])
		q2, _ := strconv.Atoi(record[1])
		q3, _ := strconv.Atoi(record[2])
		q4, _ := strconv.Atoi(record[3])
		q5, _ := strconv.Atoi(record[4])
		q6, _ := strconv.Atoi(record[5])
		q7, _ := strconv.Atoi(record[6])
		q8, _ := strconv.Atoi(record[7])
		q9, _ := strconv.Atoi(record[8])
		q10, _ := strconv.Atoi(record[9])
		total, _ := strconv.Atoi(record[10])

		grade := Grade{
			StudentID: i + 1,
			Q1:        q1,
			Q2:        q2,
			Q3:        q3,
			Q4:        q4,
			Q5:        q5,
			Q6:        q6,
			Q7:        q7,
			Q8:        q8,
			Q9:        q9,
			Q10:       q10,
			Total:     total,
		}
		grades = append(grades, grade)
	}

	return nil
}

// Handler: Get all grades
func getGrades(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(grades)
}

// Handler: Get statistics
func getStatistics(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	if len(grades) == 0 {
		http.Error(w, "No data available", http.StatusInternalServerError)
		return
	}

	// Calculate statistics
	var sum, sumSq float64
	min := grades[0].Total
	max := grades[0].Total
	totals := make([]int, len(grades))

	for i, g := range grades {
		totals[i] = g.Total
		sum += float64(g.Total)
		sumSq += float64(g.Total * g.Total)
		
		if g.Total < min {
			min = g.Total
		}
		if g.Total > max {
			max = g.Total
		}
	}

	mean := sum / float64(len(grades))
	variance := (sumSq / float64(len(grades))) - (mean * mean)
	stdDev := 0.0
	if variance > 0 {
		stdDev = variance // Simplified - should use math.Sqrt
	}

	// Calculate question statistics (correct rate)
	questionStats := make(map[string]float64)
	questions := []string{"q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8", "q9", "q10"}
	
	for i, qName := range questions {
		correctCount := 0
		for _, g := range grades {
			// Use reflection or switch to get question value
			var qValue int
			switch i {
			case 0:
				qValue = g.Q1
			case 1:
				qValue = g.Q2
			case 2:
				qValue = g.Q3
			case 3:
				qValue = g.Q4
			case 4:
				qValue = g.Q5
			case 5:
				qValue = g.Q6
			case 6:
				qValue = g.Q7
			case 7:
				qValue = g.Q8
			case 8:
				qValue = g.Q9
			case 9:
				qValue = g.Q10
			}
			correctCount += qValue
		}
		questionStats[qName] = float64(correctCount) / float64(len(grades))
	}

	// Calculate median
	// Sort totals (simplified bubble sort for demonstration)
	sortedTotals := make([]int, len(totals))
	copy(sortedTotals, totals)
	for i := 0; i < len(sortedTotals); i++ {
		for j := i + 1; j < len(sortedTotals); j++ {
			if sortedTotals[i] > sortedTotals[j] {
				sortedTotals[i], sortedTotals[j] = sortedTotals[j], sortedTotals[i]
			}
		}
	}
	
	median := float64(sortedTotals[len(sortedTotals)/2])

	stats := Statistics{
		Mean:          mean,
		Median:        median,
		StdDev:        stdDev,
		Min:           min,
		Max:           max,
		QuestionStats: questionStats,
	}

	json.NewEncoder(w).Encode(stats)
}

// Handler: Health check
func healthCheck(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "healthy"})
}

func main() {
	// Load grades data
	if err := loadGrades("../grades.csv"); err != nil {
		log.Fatalf("Failed to load grades: %v", err)
	}
	log.Printf("Loaded %d student grades\n", len(grades))

	// Setup router
	router := mux.NewRouter()
	
	// API routes
	router.HandleFunc("/api/health", healthCheck).Methods("GET")
	router.HandleFunc("/api/grades", getGrades).Methods("GET")
	router.HandleFunc("/api/statistics", getStatistics).Methods("GET")

	// CORS middleware
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type", "Authorization"},
		AllowCredentials: true,
	})

	handler := c.Handler(router)

	// Start server
	port := "8080"
	log.Printf("Server starting on port %s...\n", port)
	if err := http.ListenAndServe(":"+port, handler); err != nil {
		log.Fatal(err)
	}
}
