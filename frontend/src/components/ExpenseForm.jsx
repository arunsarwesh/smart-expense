    import React, { useState, useEffect, useRef } from "react";
    import { useNavigate } from "react-router-dom";
    import axios from "../services/axios";
    import './ExpenseForm.css'; // External CSS for styles

    function ExpenseForm() {
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");
    const [date, setDate] = useState(""); // Date field state
    const [category, setCategory] = useState("Food"); // Default category as "Food"
    const [customCategory, setCustomCategory] = useState(""); // For custom category input
    const [expenses, setExpenses] = useState([]); // State to hold the list of expenses
    const [editingExpense, setEditingExpense] = useState(null); // To track which expense is being edited

    const amountRef = useRef(null); // Ref for Amount input field
    const descriptionRef = useRef(null); // Ref for Description input field

    const navigate = useNavigate();

    // Function to fetch all expenses
    const fetchExpenses = async () => {
        try {
        const response = await axios.get("/expenses/");
        setExpenses(response.data);  // Set the expenses state
        } catch (error) {
        console.error("Error fetching expenses:", error);
        }
    };

    // Fetch all expenses when the component mounts
    useEffect(() => {
        fetchExpenses();  // Fetch expenses when component mounts

        // Get current date in YYYY-MM-DD format and set it as the default value for the date field
        const currentDate = new Date().toISOString().split('T')[0];
        setDate(currentDate);
    }, []);

    // Handle Submit for new and edited expenses
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
        const categoryToSubmit = category === "Other" ? customCategory : category;
        const expenseData = { amount, description, date, category: categoryToSubmit };

        // If we are editing an expense, send a PUT request, otherwise POST a new one
        if (editingExpense) {
            await axios.put(`/expenses/${editingExpense.id}/`, expenseData); // PUT request to edit expense
            alert("Expense updated successfully!");
        } else {
            await axios.post("/expenses/", expenseData); // POST request to add new expense
            alert("Expense added successfully!");
        }

        // Reset state after submission
        setAmount("");
        setDescription("");
        setDate("");
        setCategory("Food");
        setCustomCategory("");
        setEditingExpense(null); // Reset editing state
        fetchExpenses(); // Fetch updated expenses list
        } catch (error) {
        console.error("Error adding/updating expense:", error);
        }
    };

    // Handle Expense Edit
    const handleEdit = (expense) => {
        setEditingExpense(expense);
        setAmount(expense.amount);
        setDescription(expense.description);
        setDate(expense.date);
        setCategory(expense.category === "Other" ? "Other" : expense.category);
        setCustomCategory(expense.category === "Other" ? expense.category : "");

        // Focus the amount input field when editing an expense
        amountRef.current.focus();
    };

    // Handle Expense Delete
    const handleDelete = async (id) => {
        try {
        await axios.delete(`/expenses/${id}/`);  // DELETE request to remove expense
        fetchExpenses(); // Fetch updated expenses list after deletion
        alert("Expense deleted successfully!");
        } catch (error) {
        console.error("Error deleting expense:", error);
        }
    };

    // Handle "Cancel" Edit and Skip Editing
    const handleCancelEdit = () => {
        // Reset all form fields and editing state when the user cancels editing
        setAmount("");
        setDescription("");
        setDate("");
        setCategory("Food");
        setCustomCategory("");
        setEditingExpense(null); // Reset editing state
    };

    // Handle "Logout" Action
    const handleLogout = () => {
        // Clear token or user data from localStorage/sessionStorage
        localStorage.removeItem('token');  // Adjust the key to your app's token storage
        // Redirect user to the login page (or whichever page you want)
        navigate('/login');
    };

    const handleViewInsights = () => {
        navigate("/insights");
    };

    const handleDownloadCSV = () => {
        axios
        .get('/download_expenses_csv/', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
            responseType: 'blob',
        })
        .then((response) => {
            const blob = new Blob([response.data], { type: 'text/csv' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'expenses.csv';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        })
        .catch((error) => {
            console.log('Error downloading CSV:', error);
        });
    };

    return (
        <div style={{ position: "relative", padding: "20px" }}>
        <button id="ins-view-btn" onClick={handleViewInsights}>View Insights</button>
        <button onClick={handleLogout} style={logoutButtonStyle}>Logout</button>  {/* Logout Button */}
        <h2>{editingExpense ? "Edit Expense" : "Add Expense"}</h2>
        <form onSubmit={handleSubmit}>
            
            <input
            ref={amountRef}  // Attach the ref here for focusing on the amount input
            type="text"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            />
            
            <input
            ref={descriptionRef}  // You can use this ref if you'd like to focus the description too
            type="text"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            />
            
            <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            />
            
            <select value={category} onChange={(e) => setCategory(e.target.value)} required>
            <option value="Food">Food</option>
            <option value="Transport">Transport</option>
            <option value="Rent">Rent</option>
            <option value="Utilities">Utilities</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Other">Other</option>
            </select>

            {category === "Other" && (
            <input
                type="text"
                placeholder="Enter custom category"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                required
            />
            )}

            <span><button type="submit">{editingExpense ? "Update Expense" : "Add Expense"}</button>
            {editingExpense && (
            <button type="button" onClick={handleCancelEdit} style={cancelButtonStyle}>Cancel</button> // "Cancel" button for editing
            )}</span>
        </form>

        
        <div className="expense-cards-container" style={{ marginTop: "40px" }}>
            <h3>Added Expenses</h3>
            <button onClick={handleDownloadCSV}>Download Expenses</button>
            <div className="expense-cards">
            {expenses.map((expense) => (
                <div key={expense.id} className="expense-card">
                <strong>Amount:</strong> {expense.amount}<br />
                <strong>Description:</strong> {expense.description}<br />
                <strong>Date:</strong> {expense.date}<br />
                <strong>Category:</strong> {expense.category}
                <br />
                <button id="card-btn" onClick={() => handleEdit(expense)}>Edit</button> <span></span>
                <button id="card-btn" onClick={() => handleDelete(expense.id)}>Delete</button>
                </div>
            ))}
            </div>
        </div>
        </div>
    );
    }

    const cancelButtonStyle = {
    position: "absolute",
    padding: "10px 20px",
    backgroundColor: "#f44336",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    };

    const logoutButtonStyle = {
    position: "relative",
    top: 'auto',
    padding: "10px 20px",
    backgroundColor: "#f44336",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    };

    export default ExpenseForm;
