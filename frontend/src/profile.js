import React from "react";

function Profile({ user, transactions, setUser }) {

  const totalBalance =
    transactions
      .filter(t => t.type === "income")
      .reduce((a, t) => a + t.amount, 0)
    -
    transactions
      .filter(t => t.type === "expense")
      .reduce((a, t) => a + t.amount, 0);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-purple-900">

      <div className="bg-white/10 backdrop-blur-lg p-8 rounded-xl shadow-xl w-full max-w-md text-center text-white">

        <h2 className="text-2xl font-bold mb-4">👤 Profile</h2>

        <p className="mb-2">Username: <b>{user?.username}</b></p>

        <p className="mb-4">Balance: ₹{totalBalance}</p>

       <button
         onClick={() => {
           setUser(null);              // logout
           localStorage.removeItem("user");
        }}
        className="bg-red-500 px-4 py-2 rounded"
     >
          Logout 🚪
        </button>

      </div>

    </div>
  );
}

export default Profile;