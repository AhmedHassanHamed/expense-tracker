const expenseForm = document.querySelector("#expense-form");
const descriptionInput = document.querySelector("#description");
const amountInput = document.querySelector("#amount");
const categoryInput = document.querySelector("#category");
const expenseList = document.querySelector("#expense-list");
const totalDisplay = document.querySelector("#total");

let expenses = JSON.parse(localStorage.getItem("expenses")) || [];

expenseForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const amountValue = Number(amountInput.value);

  if (descriptionInput.value.trim() === "" || amountInput.value === "") {
    return;
  }

  // منع إدخال مبلغ صفر أو سالب
  if (!(amountValue > 0)) {
    alert("Please enter an amount greater than 0.");
    return;
  }

  const newExpense = {
    description: descriptionInput.value.trim(),
    amount: amountValue,
    category: categoryInput.value.trim() || "General",
    // Automatically Save Today's Date
    date: new Date().toLocaleDateString(),
  };

  expenses.push(newExpense);
  localStorage.setItem("expenses", JSON.stringify(expenses));
  renderExpenses();
  descriptionInput.value = "";
  amountInput.value = "";
  categoryInput.value = "";
  descriptionInput.focus();
});

function renderExpenses() {
  let total = 0;

  expenseList.innerHTML = "";
  if (expenses.length === 0) {
    expenseList.innerHTML =
      "<p class='empty-msg'>No expenses yet. Add your first one above!</p>";
  }
  expenses.forEach(function (expense, index) {
    const li = document.createElement("li");
    const descSpan = document.createElement("span");
    const amountSpan = document.createElement("span");
    const categorySpan = document.createElement("span");
    const dateSpan = document.createElement("span");

    // Descriptian Span
    descSpan.classList.add("expense-desc");
    descSpan.textContent = expense.description;
    li.appendChild(descSpan);

    // Amount Span
    amountSpan.classList.add("expense-amount");
    amountSpan.textContent = "$" + expense.amount.toFixed(2);
    li.appendChild(amountSpan);

    // Category Span
    categorySpan.classList.add("expense-category");
    categorySpan.textContent = expense.category;
    li.appendChild(categorySpan);

    // Date Span
    dateSpan.classList.add("expense-date");
    dateSpan.textContent = expense.date;
    li.appendChild(dateSpan);

    expenseList.appendChild(li);

    total += Number(expense.amount);

    // Delete Button + Save
    const deleteBtn = document.createElement("button");
    deleteBtn.classList.add("delete-btn");
    deleteBtn.textContent = "Delete";
    li.appendChild(deleteBtn);

    deleteBtn.addEventListener("click", function () {
      if (!confirm("Delete this expense?")) return; // A question before deletion
      expenses.splice(index, 1);
      localStorage.setItem("expenses", JSON.stringify(expenses));
      renderExpenses();
    });
  });

  // .toFixed(2) هنا عشان يمنع ظهور أرقام كسرية طويلة بسبب تقريب الجمع العشري
  totalDisplay.textContent = "Total: $" + total.toFixed(2);
}
renderExpenses();
