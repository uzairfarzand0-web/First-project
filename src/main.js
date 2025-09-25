 let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
        let currentEditIndex = -1;

        // Initialize app
        document.addEventListener('DOMContentLoaded', function () {
            document.getElementById('date').value = new Date().toISOString().split('T')[0];
            updateAllDisplays();
            loadTheme();
        });

        function showTab(tabName) {
            // Hide all tabs
            document.querySelectorAll('.tab-content').forEach(tab => {
                tab.classList.remove('active');
            });

            // Remove active from all buttons
            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.classList.remove('active');
            });

            // Show selected tab
            document.getElementById(tabName).classList.add('active');
            event.target.classList.add('active');

            // Update displays when showing relevant tabs
            if (tabName === 'history') {
                displayExpenses();
            } else if (tabName === 'charts') {
                drawCharts();
            } else if (tabName === 'reports') {
                updateReports();
            } else if (tabName === 'add') {
                updateQuickStats();
            }
        }

        function addExpense() {
            const amount = parseFloat(document.getElementById('amount').value);
            const category = document.getElementById('category').value;
            const description = document.getElementById('description').value;
            const date = document.getElementById('date').value;

            if (!amount || !category || !description || !date) {
                alert('Please fill in all fields');
                return;
            }

            const expense = {
                id: Date.now(),
                amount: amount,
                category: category,
                description: description,
                date: date,
                timestamp: new Date().toISOString()
            };

            expenses.push(expense);
            saveToStorage();
            updateAllDisplays();

            // Clear form
            document.getElementById('amount').value = '';
            document.getElementById('category').value = '';
            document.getElementById('description').value = '';
            document.getElementById('date').value = new Date().toISOString().split('T')[0];

            showToast('Expense added successfully!', 'success');

        }

        function deleteExpense(index) {
            
                expenses.splice(index, 1);
                saveToStorage();
                updateAllDisplays();
                showToast('Expense deleted successfully!', 'error');
            
        }


        function editExpense(index) {
            currentEditIndex = index;
            const expense = expenses[index];

            document.getElementById('editAmount').value = expense.amount;
            document.getElementById('editCategory').value = expense.category;
            document.getElementById('editDescription').value = expense.description;
            document.getElementById('editDate').value = expense.date;

            document.getElementById('editModal').style.display = 'block';
        }

        function closeEditModal() {
            document.getElementById('editModal').style.display = 'none';
            currentEditIndex = -1;
        }

        function saveEditedExpense() {
            if (currentEditIndex === -1) return;

            const amount = parseFloat(document.getElementById('editAmount').value);
            const category = document.getElementById('editCategory').value;
            const description = document.getElementById('editDescription').value;
            const date = document.getElementById('editDate').value;

            if (!amount || !category || !description || !date) {
                alert('Please fill in all fields');
                return;
            }

            expenses[currentEditIndex] = {
                ...expenses[currentEditIndex],
                amount: amount,
                category: category,
                description: description,
                date: date
            };

            saveToStorage();
            updateAllDisplays();
            closeEditModal();
            showToast('Expense updated successfully!', 'info');
        }

        function displayExpenses(filteredExpenses = null) {
            const expenseList = document.getElementById('expenseList');
            const expensesToShow = filteredExpenses || expenses;

            if (expensesToShow.length === 0) {
                expenseList.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon">📝</div>
                        <h3>No expenses found</h3>
                        <p>Start by adding your first expense or adjust your filters.</p>
                    </div>
                `;
                return;
            }

            expenseList.innerHTML = expensesToShow
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map((expense, index) => {
                    const actualIndex = expenses.indexOf(expense);
                    return `
                        <div class="expense-item">
                            <div class="expense-details">
                                <div><strong>${expense.description}</strong></div>
                                <div style="color: #888; font-size: 0.9em;">
                                    ${getCategoryIcon(expense.category)} ${expense.category} • ${formatDate(expense.date)}
                                </div>
                            </div>
                            <div style="display: flex; align-items: center; gap: 15px;">
                                <div class="expense-amount">$${expense.amount.toFixed(2)}</div>
                                <div class="expense-actions">
                                    <button class="btn btn-small btn-secondary" onclick="editExpense(${actualIndex})">✏️</button>
                                    <button class="btn btn-small btn-danger" onclick="deleteExpense(${actualIndex})">🗑️</button>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('');
        }

        function getCategoryIcon(category) {
            const icons = {
                'Food': '🍕',
                'Transport': '🚗',
                'Shopping': '🛍️',
                'Entertainment': '🎬',
                'Bills': '📋',
                'Healthcare': '🏥',
                'Education': '📚',
                'Other': '📦'
            };
            return icons[category] || '📦';
        }

        function formatDate(dateString) {
            return new Date(dateString).toLocaleDateString();
        }

        function filterExpenses() {
            const categoryFilter = document.getElementById('filterCategory').value;
            const dateFromFilter = document.getElementById('filterDateFrom').value;
            const dateToFilter = document.getElementById('filterDateTo').value;
            const searchFilter = document.getElementById('searchExpense').value.toLowerCase();

            let filteredExpenses = expenses.filter(expense => {
                // Category filter
                if (categoryFilter && expense.category !== categoryFilter) {
                    return false;
                }

                // Date range filter
                const expenseDate = new Date(expense.date);
                if (dateFromFilter && expenseDate < new Date(dateFromFilter)) {
                    return false;
                }
                if (dateToFilter && expenseDate > new Date(dateToFilter)) {
                    return false;
                }

                // Search filter
                if (searchFilter && !expense.description.toLowerCase().includes(searchFilter) &&
                    !expense.category.toLowerCase().includes(searchFilter)) {
                    return false;
                }

                return true;
            });

            displayExpenses(filteredExpenses);
        }

        function updateQuickStats() {
            const quickStats = document.getElementById('quickStats');
            const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
            const todayExpenses = expenses
                .filter(expense => expense.date === new Date().toISOString().split('T')[0])
                .reduce((sum, expense) => sum + expense.amount, 0);
            const thisMonthExpenses = expenses
                .filter(expense => {
                    const expenseDate = new Date(expense.date);
                    const currentDate = new Date();
                    return expenseDate.getMonth() === currentDate.getMonth() &&
                        expenseDate.getFullYear() === currentDate.getFullYear();
                })
                .reduce((sum, expense) => sum + expense.amount, 0);

            quickStats.innerHTML = `
                <div class="stat-card">
                    <div class="stat-value">${totalExpenses.toFixed(2)}</div>
                    <div>Total Expenses</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${todayExpenses.toFixed(2)}</div>
                    <div>Today's Expenses</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${thisMonthExpenses.toFixed(2)}</div>
                    <div>This Month</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${expenses.length}</div>
                    <div>Total Entries</div>
                </div>
            `;
        }

        function updateReports() {
            const reportStats = document.getElementById('reportStats');
            const categoryTotals = {};
            const monthlyTotals = {};

            expenses.forEach(expense => {
                // Category totals
                categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;

                // Monthly totals
                const monthKey = expense.date.substring(0, 7); // YYYY-MM
                monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + expense.amount;
            });

            const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
            const averageExpense = totalAmount / (expenses.length || 1);
            const highestCategory = Object.keys(categoryTotals).reduce((a, b) =>
                categoryTotals[a] > categoryTotals[b] ? a : b, '');

            reportStats.innerHTML = `
                <div class="stat-card">
                    <div class="stat-value">${totalAmount.toFixed(2)}</div>
                    <div>Total Spent</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${averageExpense.toFixed(2)}</div>
                    <div>Average Expense</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${getCategoryIcon(highestCategory)} ${highestCategory}</div>
                    <div>Top Category</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${Object.keys(categoryTotals).length}</div>
                    <div>Categories Used</div>
                </div>
            `;

            // Category breakdown
            const categoryBreakdown = document.getElementById('categoryBreakdown');
            const sortedCategories = Object.entries(categoryTotals)
                .sort((a, b) => b[1] - a[1]);

            categoryBreakdown.innerHTML = sortedCategories
                .map(([category, amount]) => {
                    const percentage = ((amount / totalAmount) * 100).toFixed(1);
                    return `
                        <div style="display: flex; justify-content: space-between; align-items: center; 
                                    padding: 15px; margin-bottom: 10px; background: rgba(255,255,255,0.05); 
                                    border-radius: 10px;">
                            <div>
                                <span style="font-size: 1.2em;">${getCategoryIcon(category)}</span>
                                <strong style="margin-left: 10px;">${category}</strong>
                            </div>
                            <div style="text-align: right;">
                                <div style="font-size: 1.2em; font-weight: bold; color: #ff6b6b;">
                                    ${amount.toFixed(2)}
                                </div>
                                <div style="color: #888; font-size: 0.9em;">${percentage}% of total</div>
                            </div>
                        </div>
                    `;
                }).join('');
        }

        function drawCharts() {
            drawPieChart();
            drawBarChart();  
        }

        function drawPieChart() {
            const canvas = document.getElementById('pieChart');
            const ctx = canvas.getContext('2d');
            const categoryTotals = {};

            expenses.forEach(expense => {
                categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
            });

            const categories = Object.keys(categoryTotals);
            const amounts = Object.values(categoryTotals);
            const total = amounts.reduce((sum, amount) => sum + amount, 0);

            if (total === 0) {
                ctx.fillStyle = '#888';
                ctx.font = '16px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('No data available', canvas.width / 2, canvas.height / 2);
                return;
            }

            const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd', '#98d8c8', '#f7dc6f'];
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const radius = Math.min(centerX, centerY) - 60;

            let currentAngle = -Math.PI / 2;

            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            categories.forEach((category, index) => {
                const sliceAngle = (amounts[index] / total) * 2 * Math.PI;

                // Draw slice
                ctx.beginPath();
                ctx.moveTo(centerX, centerY);
                ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
                ctx.closePath();
                ctx.fillStyle = colors[index % colors.length];
                ctx.fill();
                ctx.strokeStyle = '#333';
                ctx.lineWidth = 2;
                ctx.stroke();

                // Draw labels
                const labelAngle = currentAngle + sliceAngle / 2;
                const labelX = centerX + Math.cos(labelAngle) * (radius + 60);
                const labelY = centerY + Math.sin(labelAngle) * (radius + 60);

                ctx.fillStyle = '#fff';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                const percentage = ((amounts[index] / total) * 100).toFixed(1);
                // First line: Category name
                ctx.fillText(category, labelX, labelY);

                // Second line: Percentage (a bit below)
                ctx.fillText(`${percentage}%`, labelX, labelY + 12);
            });

            // Draw legend
            categories.forEach((category, index) => {
                const legendY = 20 + index * 25;
                ctx.fillStyle = colors[index % colors.length];
                ctx.fillRect(10, legendY, 15, 15);
                ctx.fillStyle = '#fff';
                ctx.font = '12px Arial';
                ctx.textAlign = 'left';
                ctx.fillText(`${category}: ${amounts[index].toFixed(2)}`, 30, legendY + 12);
            });
        }

        function drawBarChart() {
            const canvas = document.getElementById('barChart');
            const ctx = canvas.getContext('2d');
            const monthlyTotals = {};

            // Group expenses by month
            expenses.forEach(expense => {
                const monthKey = expense.date.substring(0, 7); // YYYY-MM
                monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + expense.amount;
            });

            const months = Object.keys(monthlyTotals).sort();
            const amounts = months.map(month => monthlyTotals[month]);
            const maxAmount = Math.max(...amounts, 0);

            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            if (months.length === 0) {
                ctx.fillStyle = '#888';
                ctx.font = '16px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('No data available', canvas.width / 2, canvas.height / 2);
                return;
            }

            const chartWidth = canvas.width - 80;
            const chartHeight = canvas.height - 80;
            const barWidth = chartWidth / months.length - 10;

            // Draw bars
            months.forEach((month, index) => {
                const barHeight = (amounts[index] / maxAmount) * chartHeight;
                const x = 60 + index * (barWidth + 10);
                const y = canvas.height - 40 - barHeight;

                // Bar
                const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
                gradient.addColorStop(0, '#ff6b6b');
                gradient.addColorStop(1, '#4ecdc4');
                ctx.fillStyle = gradient;
                ctx.fillRect(x, y, barWidth, barHeight);

                // Border
                ctx.strokeStyle = '#333';
                ctx.lineWidth = 1;
                ctx.strokeRect(x, y, barWidth, barHeight);

                // Month label
                ctx.fillStyle = '#fff';
                ctx.font = '10px Arial';
                ctx.textAlign = 'center';
                ctx.save();
                ctx.translate(x + barWidth / 2, canvas.height - 20);
                ctx.rotate(-Math.PI / 4);
                ctx.fillText(month, 0, 0);
                ctx.restore();

                // Amount label
                ctx.fillStyle = '#fff';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(`${amounts[index].toFixed(0)}`, x + barWidth / 2, y - 5);
            });

            // Draw axes
            ctx.strokeStyle = '#666';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(50, 40);
            ctx.lineTo(50, canvas.height - 40);
            ctx.lineTo(canvas.width - 20, canvas.height - 40);
            ctx.stroke();

            // Y-axis labels
            for (let i = 0; i <= 5; i++) {
                const value = (maxAmount / 5) * i;
                const y = canvas.height - 40 - (i * chartHeight / 5);
                ctx.fillStyle = '#888';
                ctx.font = '10px Arial';
                ctx.textAlign = 'right';
                ctx.fillText(`${value.toFixed(0)}`, 45, y + 3);
            }
        }

        function exportToCSV() {
            if (expenses.length === 0) {
                alert('No expenses to export');
                return;
            }

            const csvContent = [
                ['Date', 'Category', 'Description', 'Amount'],
                ...expenses.map(expense => [
                    expense.date,
                    expense.category,
                    expense.description,
                    expense.amount
                ])
            ].map(row => row.map(field => `"${field}"`).join(',')).join('\n');

            downloadFile(csvContent, 'expenses.csv', 'text/csv');
        }

        function exportToJSON() {
            if (expenses.length === 0) {
                alert('No expenses to export');
                return;
            }

            const jsonContent = JSON.stringify(expenses, null, 2);
            downloadFile(jsonContent, 'expenses.json', 'application/json');
        }

        function downloadFile(content, filename, contentType) {
            const blob = new Blob([content], { type: contentType });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }

        function clearAllData() {
                expenses = [];
                saveToStorage();
                updateAllDisplays();
                showToast('All data cleared successfully!', 'warning');
        }

        function toggleTheme() {
            document.body.classList.toggle('light');
            const isLight = document.body.classList.contains('light');
            document.querySelector('.theme-toggle').textContent = isLight ? '☀️' : '🌙';
            localStorage.setItem('theme', isLight ? 'light' : 'dark');
        }

        function loadTheme() {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme === 'light') {
                document.body.classList.add('light');
                document.querySelector('.theme-toggle').textContent = '☀️';
            }
        }

        function saveToStorage() {
            localStorage.setItem('expenses', JSON.stringify(expenses));
        }

        function updateAllDisplays() {
            displayExpenses();
            updateQuickStats();
            updateReports();
            drawCharts();
        }

        // Close modal when clicking outside
        window.onclick = function (event) {
            const modal = document.getElementById('editModal');
            if (event.target === modal) {
                closeEditModal();
            }
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape') {
                closeEditModal();
            }
        });

        function showToast(message, type = "info") {
            const container = document.getElementById("toast-container");

            // Create toast element
            const toast = document.createElement("div");
            toast.classList.add("toast");

            // Optional: Different colors for types
            if (type === "success") toast.style.background = "green";
            if (type === "error") toast.style.background = "red";
            if (type === "warning") toast.style.background = "orange";

            toast.textContent = message;

            container.appendChild(toast);

            // Remove toast after animation (3s)
            setTimeout(() => {
                toast.remove();
            }, 3000);
        }

        // showToast("Saved successfully!", "success");
        // showToast("Updated successfully!", "info");
        // showToast("Deleted successfully!", "error");