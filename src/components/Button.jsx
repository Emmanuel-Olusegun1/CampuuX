function Button({ children, type = "button", onClick, disabled }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="bg-emerald-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-300"
    >
      {children}
    </button>
  );
}

export default Button;