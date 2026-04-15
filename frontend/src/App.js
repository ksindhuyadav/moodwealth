import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import confetti from "canvas-confetti";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { LineChart, Line, Legend } from "recharts";
import { motion } from "framer-motion";
import logo from "./assets/logo.png";
import bg1 from "./assets/bg1.png";

function App() {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [notification, setNotification] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState("expense");
  const [mood, setMood] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  
  //* Prepare data for spending chart  *//
  const chartData = transactions.map((t) => ({
    name: t.category,
    value: t.amount
  }));
  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  //* Fech transactions on load and after adding new transaction *//
  useEffect(() => {
    const fetchTransactions = async () => {
      const res = await fetch("https://moodwealth-backend.onrender.com/get-transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user.id,
        }),
      });

      const data = await res.json();
      setTransactions(data);
      checkSmartNotification(data);
    };

    if (user) {
      fetchTransactions();
    }
  }, [user]);
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
      if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser); 
    }
  }, []);

    useEffect(() => {
      if (notification) {
        const timer = setTimeout(() => {
           setNotification("");
        }, 4000);

          return () => clearTimeout(timer);
    }
  }, [notification]);

  //* Add Transaction logic here:- *//
  const addTransaction = () => {
    fetch("https://moodwealth-backend.onrender.com/add-transaction", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: parseFloat(amount),
        category: category,
        type: type,
        mood: mood,
        user_id: user.id
      }),
    })
    .then((data) => {
      console.log(data);
      triggerConfetti();
      toast("💰 Transaction Added Successfully!", {
        duration: 2000,
        style: {
          background: "#020617",
          color: "#3b82f6",
          border: "1px solid #3b82f6",
          padding: "12px",
          borderRadius: "10px"
        },
      });
      setAmount("");
      setCategory("");
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    })
      .catch((err) => console.error(err));
  };

  
      const checkSmartNotification = (transactions) => {
        const totalExpense = transactions
          .filter(t => t.type === "expense")
          .reduce((a, t) => a + t.amount, 0);

          const totalSaving = transactions
            .filter(t => t.type === "saving")
            .reduce((a, t) => a + t.amount, 0);

           const stressedCount = transactions.filter(t => t.mood === "stressed").length;

           if (totalExpense > 5000) {
           setNotification("⚠️ You are spending too much!");
           } else if (totalSaving > 2000) {
             setNotification("💰 Great job! You are saving well!");
           } else if (stressedCount > 3) {
             setNotification("😔 You seem stressed. Take care!");
           } else {
             setNotification("");
          }
        };

  //* Get MOOD emoji logic here: *//
  const getMoodEmoji = (mood) => {
    switch (mood) {
      case "happy":
        return "😊";
      case "sad":
        return "😢";
      case "stressed":
        return "😣";
      default:
        return "🙂";
    }
  };
  const generateInsight = () => {
    let happyExpense = 0;
    let sadExpense = 0;
    let stressedExpense = 0;
    transactions.forEach((t) => {
      if (t.type === "expense"){
      if (t.mood === "happy") happyExpense += t.amount;
      if (t.mood === "sad") sadExpense += t.amount;
      if (t.mood === "stressed") stressedExpense += t.amount;
      }
    });

    //* Smart Insight logic:- *//
    const total = happyExpense + sadExpense + stressedExpense;
    if (total === 0) return "No data yet 📊";  
    if (stressedExpense > happyExpense && stressedExpense > sadExpense) {
      return "⚠️ You spend more when stressed 😣.  Try relaxing before spending.";
    }  if (sadExpense > happyExpense) {
      return "😢 You tend to spend more when sad. Be mindful of emotional spending.";
    }
    if (happyExpense > 0) {
      return "😊 Your spending is balanced and controlled. Good job!";
    }
    return "Track more data for insights 📊";
    };


    //* Montly data for graph logic here:- *//
    const monthlyData = [
      {
        name: "This Month",
        income: transactions
          .filter((t) => t.type === "income")
          .reduce((a, t) => a + t.amount, 0),
    
        expense: transactions
          .filter((t) => t.type === "expense")
          .reduce((a, t) => a + t.amount, 0),
        
        saving: transactions
          .filter((t) => t.type === "saving")
          .reduce((a, t) => a + t.amount, 0),  

        },
    ];

   //* Password validation logic here:- *//
    const validatePassword = (password) => {
    const minLength = password.length >= 6;
    const hasNumber = /[0-9]/.test(password);
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasSpecial = /[!@#$%^&*]/.test(password);
  if (!minLength) {
    return "Password must be at least 6 characters ❌";
  }
  if (!hasNumber || !hasLetter || !hasSpecial) {
    return "Include letters, numbers & special symbols 🔐";
  }
  return "valid";
};

    //* Registration logic here:- *//
    const handleRegister = async () => {
      const validation = validatePassword(password);
      if (validation !== "valid") {
    alert(validation);
    return;
  }
      const res = await fetch("https://moodwealth-backend.onrender.com/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Registered successfully ✅");
        setIsRegister(false); // switch to login
      } else {
        alert(data.message);
      }
    };

      //* Login logic here:- *//     
    const handleLogin = async () => {
      const res = await fetch("https://moodwealth-backend.onrender.com/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });    
      const data = await res.json();    
      if (res.ok) {
        const userData = {
          id: data.user_id,
          username: username,
        };    
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
      } else {
        alert(data.message);
      }
    };
    
      //* If no user, show login/register screen *//
    if (!user) {
      return (
        <div className="min-h-screen flex items-center justify-center  bg-cover bg-center"
        style={{ backgroundImage: `url(${bg1})` }}
        >
             <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
           {/* Login Card */}
           <div className="relative z-10">
            {/* your login box */}
               </div>
          <div className="w-full max-w-sm p-6 rounded-xl bg-white/20 backdrop-blur-lg shadow-xl">     
           {/* 🔝 LOGO SECTION */}
          <div className="text-center mt-10">
           <h1 className="text-4xl font-bold text-black-500 animate-bounce">
              MoodWealth 💰
            </h1>
            <p>welcome to MoodWealth!</p>
          </div>
            <h2 className="mb-4 text-black text-xl hover:scale-105 transition duration-300 "
            style={{ fontFamily: "Fredoka" }}>
              {isRegister ? "Register 📝" : "Login here👇"}
            </h2>  
             {/* Input fields with validation and styling */} 
            <input
              className="p-2 mb-2 w-full rounded text-black animate-pulse hover:scale-105 transition duration-300"
              placeholder="Username "
              onChange={(e) => setUsername(e.target.value)}
            />
    
            <input
              type="password"
              className="p-2 mb-2 w-full rounded text-black animate-pulse hover:scale-105 transition duration-300"
              placeholder="Password "
              onChange={(e) => {
                const value = e.target.value;
                setPassword(value);

             const validation = validatePassword(value);
             setPasswordError(validation === "valid" ? "" : validation);
             }}
           /> 
              {passwordError && (
                 <p className="text-red-400 text-sm">{passwordError}</p>
            )}    
            <button
              className="bg-blue-500 w-full p-2 rounded mb-2 animate-pulse hover:scale-105 transition duration-300"
              style={{ fontFamily: "Fredoka" }}
              onClick={isRegister ? handleRegister : handleLogin}
            >
              {isRegister ? "Register" : "Login..."}
            </button>    
            <p
              className="text-sm text-black-300 cursor-pointer text-center animate-pulse hover:scale-105 transition duration-300"
              onClick={() => setIsRegister(!isRegister)}
            >
              {isRegister
                ? "Already have account? Login"
                : "New user 🤔? Register here"}
            </p>    
          </div>
        </div>
      );
    }  
    
    //* Prepare Weekly Data *//
    const weeklyData = {};
transactions.forEach((t) => {
  const day = new Date(t.date).toLocaleString("en-IN",{
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  });
  if (!weeklyData[day]) {
    weeklyData[day] = 0;
  }
  if (t.type === "expense") {
    weeklyData[day] += t.amount;
  }
});
 

const chartWeeklyData = Object.keys(weeklyData).map((day) => ({
  day,
  expense: weeklyData[day],
}));
/* Mood vs Spending Graph Logic here:- 😊📊*/
const moodData = {};
transactions.forEach((t) => {
  if (!moodData[t.mood]) {
    moodData[t.mood] = 0;
  }
  if (t.type === "expense") {
    moodData[t.mood] += t.amount;
  }
});
const chartMoodData = Object.keys(moodData).map((mood) => ({
  mood,
  amount: moodData[mood],
}));


    //* Main DashBoard *//
  return (
    <div 
      className={`min-h-screen p-3 sm:p-5 md:p-8 ${
    darkMode ? "bg-black text-white" : "bg-white text-black"
  }`}  
    >
      <div className="max-w-7xl mx-auto"></div>
      <Toaster position="top-right"/>

      {notification && (
        <div className="fixed top-5 right-5 bg-yellow-400 text-black px-4 py-2 rounded shadow-lg z-50 animate-bounce">
          {notification}
        </div>
     )}

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
{/* LEFT SIDE */}
<div className="flex items-center gap-3">
<img src={logo} alt="logo" className="w-1- h-10"/>
<h1
  className="text-2xl sm:text-3xl md:text-4xl font-bold flex items-center gap-2"
  style={{ fontFamily: "Fredoka" }}
>  <span className="animate-bounce text-2xl">💸</span>
    <span 
  className="bg-gradient-to-r from-yellow-500 via-orange-500 to-red-600 text-transparent bg-clip-text tracking-wide animate-bounce"
  style={{
    textShadow: "0 0 10px rgba(255, 0, 0, 0.5), 0 0 10px rgba(242, 242, 22, 0.5)",
    letterSpacing: "2px"
  }}
  >
    MoodWealth
  </span>
  <span className="animate-bounce">💰</span>
</h1>
</div>

{/* RIGHT SIDE */}
<div className="flex flex-wrap justify-center sm:justify-end gap-3">
  <span className="text-white-300" style={{ fontFamily: "Fredoka" }}>
    👤: {user?.username}
  </span>
  {/* Dark Mode Toggle */}
  <button
  onClick={() => setDarkMode(!darkMode)}
  className="px-3 py-1 rounded bg-gray-300 text-black"
  style={{ fontFamily: "Fredoka" }}
>
  {darkMode ? "🌙 Dark" : "☀️ Light"}
</button> 
  {/* Logout */}
  <button
    className="bg-red-500 px-3 py-1 rounded hover:scale-105 transition duration-300"
    style={{ fontFamily: "Fredoka" }}
    onClick={() => {
      setUser(null);
      localStorage.removeItem("user");
    }}
  >
    Logout 🥺 
  </button>
</div>
</div>

{/* welcome-message */}
<h2 className="text-xl mb-4" style={{ fontFamily: "Fredoka" }}>
Welcome to you, {user?.username} 👋...
</h2>  

{/* Add Transaction button and form logic here:- */}
<button
  onClick={() => setShowForm(true)}
  className="bg-lime-500 px-4 py-2 rounded mb-6 hover:scale-105 transition duration-300"
  style={{ fontFamily: "Fredoka" }}
>
  ➕ Add Transaction
</button>

{showForm && (
  <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
  onClick={() => setShowForm(false)}>
    <div className="bg- text-black p-6 rounded-xl  w-[90%] sm:w-96"
     onClick={(e) => e.stopPropagation()}>
      <h2 className="text-lg font-bold mb-4">Add Transaction</h2>

      <input
        autoFocus
        className="w-full p-2 mb-3 border rounded"
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />

      <input
        className="w-full p-4 mb-6 border rounded"
        type="text"
        placeholder="Category"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      />

      <select
        className="w-full p-2 mb-3 border rounded"
        value={type}
        onChange={(e) => setType(e.target.value)}
      >
        <option value="expense">Expense</option>
        <option value="income">Income</option>
        <option value="saving">Saving</option>
      </select>

      <select
        className="w-full p-2 mb-3 border rounded"
        value={mood}
        onChange={(e) => setMood(e.target.value)}
      >
        <option value="">Select Mood</option>
        <option value="happy">😊 Happy</option>
        <option value="sad">😢 Sad</option>
        <option value="stressed">😣 Stressed</option>
        <option value="excited">😍 Excited</option>
        <option value="constant">😐 Constant</option>
        <option value="angry">😡 Angry</option>
        <option value="tired">🍜 Hungry</option>
        <option value="motivated">🤩 Motivated</option>
      </select>

      <div className="flex justify-between mt-4">
        <button
          onClick={() => setShowForm(false)}
          className="bg-gray-400 px-4 py-2 rounded"
        >
          Cancel
        </button>

        <button
          onClick={() => {
            addTransaction();
            setShowForm(false);
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add
        </button>
      </div>
    </div>
  </div>
)}

     
{/*SUMMARY about Transactions */}
<div className="grid grid-cols-4 gap-4 mb-6 hover:scale-105 transition duration-300">
      <div>      
          <h3>Balance</h3>
          <p className="font-bold hover:scale-105 transition duration-300">
            ₹{transactions.reduce((a, t) =>
              t.type === "income" ? a + t.amount : a - t.amount, 0)}
          </p>
        </div>

         <div>      
          <h3>Income</h3>
          <p className="font-bold hover:scale-105 transition duration-300">
            ₹{transactions.filter(t => t.type === "income")
              .reduce((a, t) => a + t.amount, 0)}
          </p>
        </div>

         <div>        
          <h3>Expenses</h3>
          <p className="font-bold hover:scale-105 transition duration-300">
            ₹{transactions.filter(t => t.type === "expense")
              .reduce((a, t) => a + t.amount, 0)}
          </p>
        </div>
        <div>
          <h3>Savings</h3>
          <p className="font-bold hover:scale-105 transition duration-300">
            ₹{transactions
              .filter(t => t.type === "saving")
              .reduce((a, t) => a + t.amount, 0)}
          </p>
        </div>
      </div>      

      {/* CARDS logic here:- */}
      <div>
      <motion.div
       className="bg-white/5 backdrop-blur-xl p-4 rounded-xl"
       initial={{ opacity: 0, y: 30}}
       animate={{ opacity: 1, y: 0}}
       ></motion.div>
       
       {/* SMART INSIGHT */}
  <div className="bg-yellow-300 text-black p-4 rounded-xl mb-6 hover:scale-105 transition duration-300">
  <h2 className="font-bold mb-2" style={{ fontFamily: "Fredoka" }}>Smart Insight 🧠</h2>
  <p>{generateInsight()}</p>
</div>
   
   {/*  SPENDING CHART */}
  <h2 className="mb-3 font-semibold transition-transform duration-300 hover:scale-105"
  style={{ fontFamily: "Fredoka" }}>Spending Chart 📊</h2>
  <div className="flex justify-center">
  <PieChart width={300} height={300}>
    <Pie
      data={chartData}
      dataKey="value"
      nameKey="name"
      outerRadius={100}
      label
    >
      {chartData.map((entry, index) => (
        <Cell
          key={index}
          fill={["#0a65f7ff", "#0aeba0ff","#f0ce0cff", "#ed1212ff"][index % 3]}
        />
      ))}
    </Pie>
    <Tooltip />
  </PieChart>
  </div>

{/* Monthly Report logic here:- */}
 <div>
      <motion.div
       className="bg-white/5 backdrop-blur-xl p-4 rounded-xl"
       initial={{ opacity: 0, y: 30}}
       animate={{ opacity: 1, y: 0}}
       ></motion.div>
  <h2 className="mb-3 font-semibold hover:scale-105 transition duration-300"
  style={{ fontFamily: "Fredoka" }}>Monthly Report 📊:</h2>
  <div>
      <ResponsiveContainer width="100%" height={300}></ResponsiveContainer>
      <motion.div
       className="bg-white/5 backdrop-blur-xl p-4 rounded-xl"
       initial={{ opacity: 0, y: 30}}
       animate={{ opacity: 1, y: 0}}
       ></motion.div>
</div>
<div className="flex justify-center">
  <BarChart width={400} height={250} data={monthlyData}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="name" />
    <YAxis />
    <Tooltip />
    <Legend />
    <Bar dataKey="income" fill="#10b981" />
    <Bar dataKey="expense" fill="#ef4444" />
    <Bar dataKey="saving" fill="#3b82f6" />
  </BarChart>
</div>
</div>
</div>

 {/*  MOOD VS SPENDING CHART LOGIC HERE:-  */}
<div>
      <motion.div
       className="bg-gray/5 backdrop-blur-xl p-4 rounded-xl"
       initial={{ opacity: 0, y: 30}}
       animate={{ opacity: 1, y: 0}}
       ></motion.div>

  <h2 className="mb-3 font-semibold hover:scale-105 transition duration-300"
  style={{ fontFamily: "Fredoka" }}>Mood vs Spending 😊📊:</h2>
  <div className="flex justify-center">
  <BarChart width={400} height={250} data={chartMoodData}>
    <XAxis dataKey="mood" />
    <YAxis />
    <Tooltip />
    <Bar dataKey="amount" fill="#f65cb3" />
  </BarChart>
</div>
</div>

{/*  Weekly spending chart logic here:- */}
<div>
      <motion.div
       className="bg-white/5 backdrop-blur-xl p-4 rounded-xl"
       initial={{ opacity: 0, y: 30}}
       animate={{ opacity: 1, y: 0}}
       ></motion.div>

  <h2 className="mb-3 font-semibold hover:scale-105 transition duration-300"
  style={{ fontFamily: "Fredoka" }}>Weekly Spending 📈:</h2>
  <div className="flex justify-center">
  <LineChart width={400} height={250} data={chartWeeklyData}>
    <XAxis dataKey="day" />
    <YAxis />
    <Tooltip />
    <Line type="monotone" dataKey="expense" stroke="#3b82f6" />
  </LineChart>
</div>
</div>
      
     {/* TRANSACTIONS History logic here:- */}
      <div>
      <motion.div
       className="bg-white/5 backdrop-blur-xl p-4 rounded-xl mb-6"
       initial={{ opacity: 0, y: 30}}
       ></motion.div>
      
        <h2 className="mb-3 font-semibold hover:scale-105 transition duration-300"
        style={{ fontFamily: "Fredoka" }}>Transactions Details :</h2>  
        {transactions.map((txn) => (
          <div
            key={txn.id}
            className="flex justify-between border-b border-gray-700 py-2"
          >
            <span>
  {txn.category} (
  <span className={
    txn.mood === "happy"
      ? "text-green-400"
      : txn.mood === "sad"
      ? "text-blue-400"
      : "text-red-400"
  }>
    {getMoodEmoji(txn.mood)} {txn.mood}
  </span>
  )
</span>
            <span>₹{txn.amount}</span>
          </div>
        ))}
      </div>
    </div>
  );
}


export default App;