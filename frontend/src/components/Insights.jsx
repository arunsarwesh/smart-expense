import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";  // Import useNavigate from react-router-dom
import axios from "../services/axios";
import { Bar } from "react-chartjs-2";
import './Insights.css';

// Import necessary components from Chart.js
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";

// Register the components with Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function ExpenseInsights() {
  const [insights, setInsights] = useState([]);
  const navigate = useNavigate();  // Initialize useNavigate

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const response = await axios.get("/insights/");
        setInsights(response.data.monthly_totals || []); // Set monthly data
      } catch (error) {
        console.error("Error fetching insights:", error);
      }
    };

    fetchInsights();
  }, []);

  const data = {
    labels: insights.map((item) => item.date), // month (e.g. 2024-12)
    datasets: [
      {
        label: "Monthly Expenses",
        data: insights.map((item) => item.amount), // corresponding amount for each month
        backgroundColor: "rgba(75, 192, 192, 0.6)", // Chart color
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Expense Insights Overview',
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Month', // Label for the x-axis
        },
      },
      y: {
        title: {
          display: true,
          text: 'Amount', // Label for the y-axis
        },
        ticks: {
          beginAtZero: true, // Ensure the y-axis starts from 0
        },
      },
    },
  };

  return (
    <div className="container">
      <h2>Expense Insights</h2>
      <div className="chart-container">
        <Bar data={data} options={options} /> {/* Render bar chart with formatted data and options */}
      </div>
      
      {/* Button to navigate to the "Add Expense" page */}
      <button 
        className="add-expense-button"
        onClick={() => navigate('/add-expense')} // This will redirect to the Add Expense page
      >
        Add Expense
      </button>
    </div>
  );
}

export default ExpenseInsights;
